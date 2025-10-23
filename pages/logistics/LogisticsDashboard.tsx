
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMapEvents } from 'react-leaflet';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { mockWarehouses, mockShipments } from '../../data/mockData';
import { Warehouse, Shipment } from '../../types';
import { Truck, ArrowRight, Thermometer, Droplets, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getLogisticsInsightsWithMaps } from '../../services/geminiService';
import { getDirections } from '../../services/googleMapsService';
import AddWarehouseModal from '../../components/AddWarehouseModal';
import { v4 as uuidv4 } from 'uuid';

let L: any;
if (typeof window !== 'undefined') {
  L = (window as any).L;
}

const getUtilizationColor = (current: number, capacity: number) => {
    const ratio = current / capacity;
    if (ratio > 0.85) return 'red';
    if (ratio > 0.60) return 'orange';
    return 'green';
};

const getStatusColor = (status: Shipment['status']) => {
    switch (status) {
        case 'In Transit': return { classes: 'text-blue-500 bg-blue-100 dark:bg-blue-900 dark:text-blue-300', iconColor: '#3b82f6' };
        case 'Delayed': return { classes: 'text-orange-500 bg-orange-100 dark:bg-orange-900 dark:text-orange-300', iconColor: '#f97316' };
        case 'Delivered': return { classes: 'text-green-500 bg-green-100 dark:bg-green-900 dark:text-green-300', iconColor: '#22c55e' };
        default: return { classes: 'text-gray-500 bg-gray-100 dark:bg-gray-700', iconColor: '#6b7280' };
    }
};

const calculateBearing = (start: { lat: number; lon: number }, end: { lat: number; lon: number }) => {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const toDegrees = (rad: number) => (rad * 180) / Math.PI;

    const startLat = toRadians(start.lat);
    const startLon = toRadians(start.lon);
    const endLat = toRadians(end.lat);
    const endLon = toRadians(end.lon);
    const dLon = endLon - startLon;

    const y = Math.sin(dLon) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLon);
    const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;
    return bearing;
};

const LogisticsMap: React.FC<{ warehouses: Warehouse[], shipments: Shipment[], onMapClick: (latlng: any) => void }> = ({ warehouses, shipments, onMapClick }) => {
    const center: [number, number] = [22.5, 78.5]; // Center of India

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                onMapClick(e.latlng);
            },
        });
        return null;
    };

    return (
        <MapContainer center={center} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {warehouses.map(wh => {
                const utilization = wh.current_stock_mt / wh.capacity_mt;
                return (
                    <CircleMarker
                        key={wh.id}
                        center={[wh.geo_coordinates.lat, wh.geo_coordinates.lon]}
                        radius={8 + utilization * 12}
                        pathOptions={{
                            color: getUtilizationColor(wh.current_stock_mt, wh.capacity_mt),
                            fillColor: getUtilizationColor(wh.current_stock_mt, wh.capacity_mt),
                            fillOpacity: 0.6
                        }}
                    >
                        <Popup>
                            <b>{wh.name}</b><br />
                            Utilization: {(utilization * 100).toFixed(1)}%<br />
                            {wh.current_stock_mt} / {wh.capacity_mt} MT
                        </Popup>
                    </CircleMarker>
                );
            })}
            {shipments.map(ship => {
                const bearing = (ship as any).bearing || calculateBearing(ship.current_coords, ship.destination_coords);
                return (
                    <React.Fragment key={ship.id}>
                        <Polyline positions={(ship as any).routePath || [[ship.origin_coords.lat, ship.origin_coords.lon], [ship.destination_coords.lat, ship.destination_coords.lon]]} pathOptions={{ color: 'gray', dashArray: '5, 10' }} />
                        {L && <Marker
                            position={[ship.current_coords.lat, ship.current_coords.lon]}
                            icon={L.divIcon({
                                html: `<div style="transform: rotate(${bearing}deg);" class="transition-transform duration-1000 ease-linear">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${getStatusColor(ship.status).iconColor}" stroke="#fff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                                    </div>`,
                                className: '',
                                iconSize: [28, 28],
                                iconAnchor: [14, 14],
                            })}
                        >
                            <Popup>
                                <b>Truck: {ship.truckId}</b> ({ship.status})<br />
                                Temp: {ship.monitoring.temperature_celsius}°C | Humidity: {ship.monitoring.humidity_percent}%
                            </Popup>
                        </Marker>}
                    </React.Fragment>
                )
            })}
        </MapContainer>
    );
};

type ShipmentWithRoute = Shipment & { 
    progress: number;
    routePath?: [number, number][];
    bearing?: number;
    apiDuration?: string;
};

const LogisticsDashboard: React.FC = () => {
    const [shipments, setShipments] = useState<ShipmentWithRoute[]>([]);
    const [filterStatus, setFilterStatus] = useState<Shipment['status'] | 'All'>('All');
    const { t } = useLanguage();
    
    const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newWarehousePosition, setNewWarehousePosition] = useState<{ lat: number; lng: number } | null>(null);

    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState<{ text: string; sources: any[] } | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
        const initializeShipments = async () => {
            const shipmentsWithRoutes = await Promise.all(
                mockShipments
                    .filter(s => s.status !== 'Delivered')
                    .map(async s => {
                        const route = await getDirections(s.origin_coords, s.destination_coords);
                        return { 
                            ...s, 
                            progress: Math.random() * 0.1, // Start near the beginning
                            routePath: route?.path,
                            apiDuration: route?.duration,
                            bearing: route?.path && route.path.length > 1 ? calculateBearing({lat: route.path[0][0], lon: route.path[0][1]}, {lat: route.path[1][0], lon: route.path[1][1]}) : 0,
                        };
                    })
            );
            setShipments(shipmentsWithRoutes);
        };
        initializeShipments();
    }, []);


    useEffect(() => {
        const interval = setInterval(() => {
            setShipments(prevShipments =>
                prevShipments.map(ship => {
                    if (ship.status === 'Delivered' || ship.progress >= 1) return { ...ship, status: 'Delivered', progress: 1 };

                    const newProgress = ship.progress + (ship.status === 'Delayed' ? 0.003 : 0.008);
                    
                    let newLat = ship.current_coords.lat;
                    let newLon = ship.current_coords.lon;
                    let bearing = ship.bearing || 0;

                    if (ship.routePath && ship.routePath.length > 1) {
                        const path = ship.routePath;
                        const maxIndex = path.length - 1;
                        const currentIndexFloat = Math.min(newProgress, 1) * maxIndex;
                        const segmentIndex = Math.floor(currentIndexFloat);
                        const segmentProgress = currentIndexFloat - segmentIndex;

                        const startPoint = path[segmentIndex];
                        const endPoint = path[Math.min(segmentIndex + 1, maxIndex)];
                        
                        newLat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress;
                        newLon = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress;
                        bearing = calculateBearing({ lat: newLat, lon: newLon }, { lat: endPoint[0], lon: endPoint[1] });
                    }
                    
                    const newTemp = parseFloat((ship.monitoring.temperature_celsius + (Math.random() - 0.5) * 0.2).toFixed(1));
                    const newHumidity = parseFloat((ship.monitoring.humidity_percent + (Math.random() - 0.5) * 0.5).toFixed(0));

                    return {
                        ...ship,
                        progress: newProgress,
                        current_coords: { lat: newLat, lon: newLon },
                        bearing,
                        monitoring: { temperature_celsius: newTemp, humidity_percent: newHumidity },
                        status: newProgress >= 1 ? 'Delivered' : ship.status,
                    };
                })
            );
        }, 2000);
        return () => clearInterval(interval);
    }, []);
    
    const activeShipments = shipments.filter(s => s.status !== 'Delivered');

    const displayedShipments = useMemo(() => {
        if (filterStatus === 'All') {
            return activeShipments;
        }
        return activeShipments.filter(shipment => shipment.status === filterStatus);
    }, [activeShipments, filterStatus]);

    const filterOptions: Array<Shipment['status'] | 'All'> = ['All', 'In Transit', 'Delayed'];

    const handleAiQuery = async () => {
        if (!aiQuery) return;
        setIsAiLoading(true);
        setAiResponse(null);
        setAiError(null);
        try {
            const response = await getLogisticsInsightsWithMaps(aiQuery);
            setAiResponse(response);
        } catch (error) {
            console.error("Error fetching AI logistics insights:", error);
            setAiError(t('logisticsDashboard.aiAssistant.error'));
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleMapClick = (latlng: { lat: number; lng: number }) => {
        setNewWarehousePosition(latlng);
        setIsAddModalOpen(true);
    };

    const handleAddWarehouse = ({ name, capacity, commodity_types }: { name: string; capacity: number; commodity_types: string[] }) => {
        if (!newWarehousePosition) return;

        const newWarehouse: Warehouse = {
            id: uuidv4(),
            name,
            location: 'User Added', // In a real app, this could be reverse geocoded.
            geo_coordinates: {
                lat: newWarehousePosition.lat,
                lon: newWarehousePosition.lng
            },
            capacity_mt: capacity,
            current_stock_mt: 0, // New warehouses start empty.
            commodity_types,
        };
        setWarehouses(prev => [...prev, newWarehouse]);
        setIsAddModalOpen(false);
        setNewWarehousePosition(null);
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                <div className="lg:col-span-2 h-[85vh]">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>{t('logisticsDashboard.liveMapTitle')}</CardTitle>
                        </CardHeader>
                        <div className="p-2 mx-6 mb-2 -mt-2 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center">
                            <Info size={16} className="mr-2 flex-shrink-0" />
                            <span>{t('logisticsDashboard.addWarehousePrompt')}</span>
                        </div>
                        <CardContent className="flex-grow">
                            <LogisticsMap warehouses={warehouses} shipments={displayedShipments} onMapClick={handleMapClick} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('logisticsDashboard.aiAssistant.title')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    placeholder={t('logisticsDashboard.aiAssistant.placeholder')}
                                    className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    onKeyDown={(e) => e.key === 'Enter' && !isAiLoading && handleAiQuery()}
                                />
                                <button onClick={handleAiQuery} disabled={isAiLoading || !aiQuery} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isAiLoading ? '...' : t('logisticsDashboard.aiAssistant.askButton')}
                                </button>
                            </div>

                            <div className="mt-4 min-h-[100px]">
                                {isAiLoading && (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                                        <p className="ml-3 text-gray-500">{t('logisticsDashboard.aiAssistant.loading')}</p>
                                    </div>
                                )}
                                {aiError && <p className="text-red-500 text-sm">{aiError}</p>}
                                {aiResponse && (
                                    <div className="space-y-3 animate-fade-in text-sm">
                                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{aiResponse.text}</p>
                                        {aiResponse.sources.length > 0 && (
                                            <div className="pt-2 border-t dark:border-gray-700">
                                                <h4 className="font-semibold mb-1">{t('logisticsDashboard.aiAssistant.sourcesTitle')}:</h4>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {aiResponse.sources.map((source, index) => (
                                                        <li key={index}>
                                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                                {source.title}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('logisticsDashboard.warehouseListTitle')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[40vh] overflow-y-auto">
                            {warehouses.map(wh => {
                                const util = (wh.current_stock_mt / wh.capacity_mt) * 100;
                                const color = getUtilizationColor(wh.current_stock_mt, wh.capacity_mt);
                                return (
                                    <div key={wh.id} className="p-3 border-l-4 rounded" style={{ borderColor: color }}>
                                        <p className="font-bold">{wh.name}</p>
                                        <p className="text-sm text-gray-500">{wh.location}</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                                            <div className="h-2.5 rounded-full" style={{ width: `${util}%`, backgroundColor: color }}></div>
                                        </div>
                                        <p className="text-xs text-right mt-1">{util.toFixed(1)}% ({wh.current_stock_mt}/{wh.capacity_mt} MT)</p>
                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex flex-wrap gap-1.5">
                                                {wh.commodity_types.map(type => (
                                                    <span key={type} className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full">
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>{t('logisticsDashboard.activeShipmentsTitle')}</CardTitle>
                                <div className="flex items-center space-x-1 p-0.5 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                    {filterOptions.map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setFilterStatus(status)}
                                            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                                filterStatus === status
                                                    ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                                                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            {t(`logisticsDashboard.filters.${status}` as any)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-[40vh] overflow-y-auto">
                            {displayedShipments.map(shipment => (
                                <div key={shipment.id} className="p-3 border rounded-lg dark:border-gray-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center font-bold">
                                            <Truck className="h-4 w-4 mr-2" />
                                            <span>{shipment.truckId}</span>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(shipment.status).classes}`}>
                                            {shipment.status}
                                        </span>
                                    </div>
                                    <div className="text-sm space-y-1">
                                        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                                            <span className="truncate">{shipment.origin}</span>
                                            <ArrowRight className="h-4 w-4 mx-2 flex-shrink-0 text-gray-400" />
                                            <span className="truncate">{shipment.destination}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                                            <div className="flex items-center"><Thermometer className="h-4 w-4 mr-1 text-red-400" /><span>{shipment.monitoring.temperature_celsius.toFixed(1)}°C</span></div>
                                            <div className="flex items-center"><Droplets className="h-4 w-4 mr-1 text-blue-400" /><span>{shipment.monitoring.humidity_percent.toFixed(0)}%</span></div>
                                        </div>
                                        <p className="text-xs text-gray-500 pt-1">
                                            <strong>{t(shipment.apiDuration ? 'logisticsDashboard.etaWithTraffic' : 'logisticsDashboard.eta')}:</strong> {shipment.apiDuration ? shipment.apiDuration : new Date(shipment.estimatedDelivery).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {displayedShipments.length === 0 && <p className="text-sm text-gray-500 text-center py-4">{t('logisticsDashboard.noShipments')}</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <AddWarehouseModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddWarehouse}
                position={newWarehousePosition}
            />
        </>
    );
};

export default LogisticsDashboard;

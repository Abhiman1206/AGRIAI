
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { mockWarehouses, mockShipments } from '../../data/mockData';
import { Warehouse, Shipment } from '../../types';
import { Truck, ArrowRight, Thermometer, Droplets } from 'lucide-react';

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
    return (toDegrees(Math.atan2(y, x)) + 360) % 360;
};

const LogisticsMap: React.FC<{ warehouses: Warehouse[], shipments: Shipment[] }> = ({ warehouses, shipments }) => {
    const center: [number, number] = [22.5, 78.5]; // Center of India

    return (
        <MapContainer center={center} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
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
            {shipments.map(ship => (
                <React.Fragment key={ship.id}>
                    <Polyline positions={[[ship.origin_coords.lat, ship.origin_coords.lon], [ship.destination_coords.lat, ship.destination_coords.lon]]} pathOptions={{ color: 'gray', dashArray: '5, 10' }} />
                    {L && <Marker
                        position={[ship.current_coords.lat, ship.current_coords.lon]}
                        icon={L.divIcon({
                            html: `<div style="transform: rotate(${calculateBearing(ship.current_coords, ship.destination_coords)}deg);" class="transition-transform duration-1000 ease-linear">
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
            ))}
        </MapContainer>
    );
};

const LogisticsDashboard: React.FC = () => {
    const [shipments, setShipments] = useState<Array<Shipment & { progress: number }>>(
        mockShipments.filter(s => s.status !== 'Delivered').map(s => ({ ...s, progress: Math.random() * 0.2 }))
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setShipments(prevShipments =>
                prevShipments.map(ship => {
                    if (ship.status === 'Delivered' || ship.progress >= 1) return { ...ship, status: 'Delivered', progress: 1 };

                    const newProgress = ship.progress + (ship.status === 'Delayed' ? 0.003 : 0.008);
                    const newLat = ship.origin_coords.lat + (ship.destination_coords.lat - ship.origin_coords.lat) * newProgress;
                    const newLon = ship.origin_coords.lon + (ship.destination_coords.lon - ship.origin_coords.lon) * newProgress;
                    
                    const newTemp = parseFloat((ship.monitoring.temperature_celsius + (Math.random() - 0.5) * 0.2).toFixed(1));
                    const newHumidity = parseFloat((ship.monitoring.humidity_percent + (Math.random() - 0.5) * 0.5).toFixed(0));

                    return {
                        ...ship,
                        progress: newProgress,
                        current_coords: { lat: newLat, lon: newLon },
                        monitoring: { temperature_celsius: newTemp, humidity_percent: newHumidity },
                        status: newProgress >= 1 ? 'Delivered' : ship.status,
                    };
                })
            );
        }, 2000);
        return () => clearInterval(interval);
    }, []);
    
    const activeShipments = shipments.filter(s => s.status !== 'Delivered');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 h-[85vh]">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Live Logistics Map</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <LogisticsMap warehouses={mockWarehouses} shipments={activeShipments} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                     <CardHeader>
                        <CardTitle>Warehouse List</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[40vh] overflow-y-auto">
                        {mockWarehouses.map(wh => {
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
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Shipments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-[40vh] overflow-y-auto">
                        {activeShipments.map(shipment => (
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
                                        <strong>ETA:</strong> {new Date(shipment.estimatedDelivery).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                         {activeShipments.length === 0 && <p className="text-sm text-gray-500 text-center py-4">All shipments delivered.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LogisticsDashboard;

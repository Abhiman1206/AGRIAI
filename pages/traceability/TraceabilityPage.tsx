
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { mockTransactions } from '../../data/mockData';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { QRCodeSVG } from 'qrcode.react';
import { Package, Tractor, Warehouse, Factory, Truck, CheckCircle, Link2, Star, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { findPlaceDetails } from '../../services/googleMapsService';
import { Transaction } from '../../types';

const iconMap: { [key: string]: React.ReactNode } = {
    harvest: <Tractor className="h-6 w-6 text-white" />,
    storage: <Warehouse className="h-6 w-6 text-white" />,
    processing: <Factory className="h-6 w-6 text-white" />,
    transport: <Truck className="h-6 w-6 text-white" />,
    retail: <Package className="h-6 w-6 text-white" />,
};

const generateCurvedWaypoints = (start: [number, number], end: [number, number], numPoints: number = 5): [number, number][] => {
    const waypoints: [number, number][] = [];
    const latDiff = end[0] - start[0];
    const lonDiff = end[1] - start[1];
    const perpendicularLat = -lonDiff * 0.1;
    const perpendicularLon = latDiff * 0.1;

    for (let i = 1; i <= numPoints; i++) {
        const fraction = i / (numPoints + 1);
        let lat = start[0] + latDiff * fraction;
        let lon = start[1] + lonDiff * fraction;
        const curveFactor = Math.sin(fraction * Math.PI);
        lat += perpendicularLat * curveFactor;
        lon += perpendicularLon * curveFactor;
        waypoints.push([lat, lon]);
    }
    return waypoints;
};

const PlaceDetails: React.FC<{ details: any }> = ({ details }) => {
    const { t } = useLanguage();
    return (
        <div className="mt-2 pt-2 border-t text-xs space-y-1 animate-fade-in">
            <p><strong>{t('traceability.address')}:</strong> {details.address}</p>
            {details.rating && (
                 <p className="flex items-center"><strong>{t('traceability.rating')}:</strong> 
                    <span className="flex items-center ml-2 text-yellow-500">
                        {Array.from({ length: Math.round(details.rating) }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                        {Array.from({ length: 5 - Math.round(details.rating) }).map((_, i) => <Star key={i} size={12} />)}
                    </span>
                    <span className="ml-1 text-gray-500">({details.rating.toFixed(1)})</span>
                 </p>
            )}
        </div>
    );
};

const MapMarkerPopup: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const { t } = useLanguage();
    const [details, setDetails] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLoadDetails = async () => {
        setIsLoading(true);
        setError(null);
        const query = `${tx.stakeholder.name}, ${tx.stakeholder.location}`;
        const placeDetails = await findPlaceDetails(query);
        if (placeDetails) {
            setDetails(placeDetails);
        } else {
            setError(t('traceability.noDetailsFound'));
        }
        setIsLoading(false);
    };

    return (
        <Popup>
            <div className="text-sm w-60">
                <p className="font-bold capitalize text-base border-b pb-1 mb-2">{tx.action}</p>
                <p><strong>{t('traceability.stakeholder')}:</strong> {tx.stakeholder.name} ({tx.stakeholder.role})</p>
                <p><strong>{t('traceability.location')}:</strong> {tx.stakeholder.location}</p>
                <p><strong>{t('traceability.time')}:</strong> {new Date(tx.timestamp).toLocaleString()}</p>
                <p><strong>{t('traceability.quantity')}:</strong> {tx.product.quantity_kg} kg</p>
                {details && <PlaceDetails details={details} />}
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                {!details && !error && (
                     <button
                        onClick={handleLoadDetails}
                        disabled={isLoading}
                        className="text-xs mt-2 w-full text-center px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin mr-2" />}
                        {isLoading ? t('traceability.loadingDetails') : t('traceability.loadDetailsButton')}
                    </button>
                )}
            </div>
        </Popup>
    );
};


const TraceabilityPage: React.FC = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const { t } = useLanguage();
    const transactions = mockTransactions.filter(t => t.product.batch_id === batchId);
    
    if (transactions.length === 0) {
        return <div>{t('traceability.batchNotFound')}</div>;
    }

    const detailedPathCoordinates: [number, number][] = [];
    if (transactions.length > 1) {
        for (let i = 0; i < transactions.length - 1; i++) {
            const startPoint: [number, number] = [transactions[i].geo_coordinates.lat, transactions[i].geo_coordinates.lon];
            const endPoint: [number, number] = [transactions[i + 1].geo_coordinates.lat, transactions[i + 1].geo_coordinates.lon];
            detailedPathCoordinates.push(startPoint);
            const waypoints = generateCurvedWaypoints(startPoint, endPoint);
            detailedPathCoordinates.push(...waypoints);
        }
        detailedPathCoordinates.push([transactions[transactions.length - 1].geo_coordinates.lat, transactions[transactions.length - 1].geo_coordinates.lon]);
    } else if (transactions.length === 1) {
        detailedPathCoordinates.push([transactions[0].geo_coordinates.lat, transactions[0].geo_coordinates.lon]);
    }

    const center = detailedPathCoordinates[Math.floor(detailedPathCoordinates.length / 2)] || [25, 78];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('traceability.blockchainTitle')}: {batchId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l-2 border-green-500 ml-4">
                            {transactions.map((tx) => (
                                <div key={tx.transaction_id} className="mb-8 ml-8">
                                    <div className="absolute -left-[22px] bg-green-500 rounded-full h-10 w-10 flex items-center justify-center">
                                        {iconMap[tx.action]}
                                    </div>
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold capitalize text-lg">{tx.action}</p>
                                                <p className="text-sm">{tx.stakeholder.name} ({tx.stakeholder.role})</p>
                                                <p className="text-xs text-gray-500">{tx.stakeholder.location}</p>
                                            </div>
                                            <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full flex items-center">
                                                <CheckCircle size={14} className="mr-1"/> {t('traceability.verified')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">{new Date(tx.timestamp).toLocaleString()}</p>
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs font-mono">
                                            <p className="truncate"><strong>{t('traceability.txHash')}:</strong> {tx.transaction_id}</p>
                                            <p className="truncate flex items-center"><Link2 size={12} className="mr-1 inline-block"/><strong>{t('traceability.prevHash')}:</strong> {tx.previous_hash}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader><CardTitle>{t('traceability.routeMapTitle')}</CardTitle></CardHeader>
                    <CardContent className="h-80">
                         <MapContainer center={center} zoom={6} scrollWheelZoom={false}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {transactions.map(tx => (
                                <Marker key={tx.transaction_id} position={[tx.geo_coordinates.lat, tx.geo_coordinates.lon]}>
                                    <MapMarkerPopup tx={tx} />
                                </Marker>
                            ))}
                            <Polyline pathOptions={{ color: '#10b981', weight: 5 }} positions={detailedPathCoordinates} />
                        </MapContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>{t('traceability.productDetailsTitle')}</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <div className="text-center">
                            <p><strong>{t('traceability.commodity')}:</strong> {transactions[0].product.commodity}</p>
                            <p><strong>{t('traceability.quantity')}:</strong> {transactions[0].product.quantity_kg} kg</p>
                            <p><strong>{t('traceability.qualityGrade')}:</strong> {transactions[0].product.quality_grade}</p>
                        </div>
                         <QRCodeSVG value={window.location.href} size={128} />
                         <p className="text-xs text-gray-500">{t('traceability.scanToVerify')}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TraceabilityPage;
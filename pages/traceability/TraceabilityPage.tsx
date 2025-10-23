import React from 'react';
import { useParams } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { mockTransactions } from '../../data/mockData';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { QRCodeSVG } from 'qrcode.react';
import { Package, Tractor, Warehouse, Factory, Truck, CheckCircle, Link2 } from 'lucide-react';

const iconMap: { [key: string]: React.ReactNode } = {
    harvest: <Tractor className="h-6 w-6 text-white" />,
    storage: <Warehouse className="h-6 w-6 text-white" />,
    processing: <Factory className="h-6 w-6 text-white" />,
    transport: <Truck className="h-6 w-6 text-white" />,
    retail: <Package className="h-6 w-6 text-white" />,
};

// Generates intermediate points to create a curved path instead of a straight line
const generateCurvedWaypoints = (start: [number, number], end: [number, number], numPoints: number = 5): [number, number][] => {
    const waypoints: [number, number][] = [];
    const latDiff = end[0] - start[0];
    const lonDiff = end[1] - start[1];

    // Calculate a perpendicular offset to create the curve
    const perpendicularLat = -lonDiff * 0.1; // Adjust this factor for more/less curve
    const perpendicularLon = latDiff * 0.1;

    for (let i = 1; i <= numPoints; i++) {
        const fraction = i / (numPoints + 1);
        
        // Linear interpolation for the base point
        let lat = start[0] + latDiff * fraction;
        let lon = start[1] + lonDiff * fraction;
        
        // Add the curve factor, which is max at the midpoint
        const curveFactor = Math.sin(fraction * Math.PI);
        lat += perpendicularLat * curveFactor;
        lon += perpendicularLon * curveFactor;

        waypoints.push([lat, lon]);
    }
    return waypoints;
};


const TraceabilityPage: React.FC = () => {
    const { batchId } = useParams<{ batchId: string }>();
    const transactions = mockTransactions.filter(t => t.product.batch_id === batchId);
    
    if (transactions.length === 0) {
        return <div>Batch not found</div>;
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
                        <CardTitle>Blockchain Traceability for Batch: {batchId}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative border-l-2 border-green-500 ml-4">
                            {transactions.map((tx, index) => (
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
                                                <CheckCircle size={14} className="mr-1"/> Verified
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">{new Date(tx.timestamp).toLocaleString()}</p>
                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 text-xs font-mono">
                                            <p className="truncate"><strong>Tx Hash:</strong> {tx.transaction_id}</p>
                                            <p className="truncate flex items-center"><Link2 size={12} className="mr-1 inline-block"/><strong>Prev Hash:</strong> {tx.previous_hash}</p>
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
                    <CardHeader><CardTitle>Route Map</CardTitle></CardHeader>
                    <CardContent className="h-80">
                         <MapContainer center={center} zoom={6} scrollWheelZoom={false}>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {transactions.map(t => (
                                <Marker key={t.transaction_id} position={[t.geo_coordinates.lat, t.geo_coordinates.lon]}>
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-bold capitalize text-base border-b pb-1 mb-2">{t.action}</p>
                                            <p><strong>Stakeholder:</strong> {t.stakeholder.name} ({t.stakeholder.role})</p>
                                            <p><strong>Location:</strong> {t.stakeholder.location}</p>
                                            <p><strong>Time:</strong> {new Date(t.timestamp).toLocaleString()}</p>
                                            <p><strong>Quantity:</strong> {t.product.quantity_kg} kg</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                            <Polyline pathOptions={{ color: '#10b981', weight: 5 }} positions={detailedPathCoordinates} />
                        </MapContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Product Details & QR Code</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <div className="text-center">
                            <p><strong>Commodity:</strong> {transactions[0].product.commodity}</p>
                            <p><strong>Quantity:</strong> {transactions[0].product.quantity_kg} kg</p>
                            <p><strong>Quality Grade:</strong> {transactions[0].product.quality_grade}</p>
                        </div>
                         <QRCodeSVG value={window.location.href} size={128} />
                         <p className="text-xs text-gray-500">Scan to verify authenticity</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TraceabilityPage;


import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { getPriceForecast, getWeatherAdvisory } from '../../services/geminiService';
import { PriceData, WeatherAdvisory } from '../../types';
import { mockHistoricalPrices } from '../../data/mockData';
import { Sun, CloudRain, Wind, Droplets, ArrowUp, ArrowDown } from 'lucide-react';

const PriceForecastChart: React.FC<{ data: PriceData[] }> = ({ data }) => {
    const formattedData = useMemo(() => {
        return data.map(item => ({ ...item, name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }));
    }, [data]);
    
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                        backdropFilter: 'blur(5px)',
                        border: '1px solid #ccc',
                        borderRadius: '0.5rem'
                    }} 
                />
                <Legend />
                <Line type="monotone" dataKey="price" name="Mustard" stroke="#f59e0b" strokeWidth={2} dot={false} data={formattedData.filter(d => d.commodity === 'Mustard')} />
                <Line type="monotone" dataKey="price" name="Soybean" stroke="#10b981" strokeWidth={2} dot={false} data={formattedData.filter(d => d.commodity === 'Soybean')} />
            </LineChart>
        </ResponsiveContainer>
    );
};


const FarmerDashboard: React.FC = () => {
    const [forecastData, setForecastData] = useState<PriceData[]>([]);
    const [advisory, setAdvisory] = useState<WeatherAdvisory | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [mustardForecast, soybeanForecast, weatherAdvisory] = await Promise.all([
                getPriceForecast('Mustard', 30),
                getPriceForecast('Soybean', 30),
                getWeatherAdvisory('Alwar, Rajasthan', 'Mustard')
            ]);
            setForecastData([...mustardForecast, ...soybeanForecast]);
            setAdvisory(weatherAdvisory);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const allChartData = [...mockHistoricalPrices, ...forecastData];
    
    const marketPrices = useMemo(() => {
        const commodities = ['Mustard', 'Soybean'];
        return commodities.map(commodity => {
            const prices = mockHistoricalPrices
                .filter(p => p.commodity === commodity)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            if (prices.length < 2) {
                return {
                    commodity,
                    currentPrice: prices[0]?.price || 0,
                    change: 0,
                    trend: 'stable'
                };
            }

            const currentPrice = prices[0].price;
            const previousPrice = prices[1].price;
            const change = currentPrice - previousPrice;
            const trend = change > 0 ? 'up' : (change < 0 ? 'down' : 'stable');

            return {
                commodity,
                currentPrice,
                change: parseFloat(change.toFixed(2)),
                trend
            };
        });
    }, []);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Price Forecast (Next 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <div className="h-[300px] flex items-center justify-center">Loading chart...</div> : <PriceForecastChart data={allChartData} />}
                    </CardContent>
                </Card>
            </div>
            
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Current Market Prices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {marketPrices.map(item => {
                           const trendColor = item.trend === 'up' ? 'text-green-500' : 'text-red-500';
                           const TrendIcon = item.trend === 'up' ? ArrowUp : ArrowDown;

                           return (
                                <div key={item.commodity} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{item.commodity}</p>
                                        <p className="text-2xl font-bold">₹{item.currentPrice.toFixed(2)}</p>
                                    </div>
                                    {item.trend !== 'stable' && (
                                        <div className={`flex items-center text-md font-semibold ${trendColor}`}>
                                            <TrendIcon size={18} className="mr-1" />
                                            <span>₹{Math.abs(item.change)}</span>
                                        </div>
                                    )}
                                </div>
                           );
                       })}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>AI Weather Advisory</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <div>Loading advisory...</div> : (
                            advisory && (
                                <div className="space-y-3 text-sm">
                                    <p><Droplets className="inline mr-2 h-4 w-4 text-blue-500" /><strong>Irrigation:</strong> {advisory.irrigation}</p>
                                    <p><Sun className="inline mr-2 h-4 w-4 text-yellow-500" /><strong>Harvesting:</strong> {advisory.harvestWindow}</p>
                                    <div>
                                        <strong>Pest Alerts:</strong>
                                        <ul className="list-disc list-inside ml-4">
                                            {advisory.pestAlerts.map((alert, i) => <li key={i}>{alert}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FarmerDashboard;


import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPolicyInsights } from '../../services/geminiService';
import { Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

const productionData = [
  { name: '2020', domestic: 35, imports: 65 },
  { name: '2021', domestic: 38, imports: 62 },
  { name: '2022', domestic: 42, imports: 58 },
  { name: '2023', domestic: 45, imports: 55 },
  { name: '2024', domestic: 48, imports: 52 },
];

const PolicyInsightCard: React.FC<{ insight: {id: number, text: string, priority: string}}> = ({ insight }) => {
    const priorityStyles = {
        High: { icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
                bg: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800' },
        Medium: { icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
                bg: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800' },
        Low: { icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                bg: 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800' },
    };
    const style = priorityStyles[insight.priority as keyof typeof priorityStyles] || priorityStyles.Medium;

    return (
        <div className={`p-4 rounded-lg border flex items-start space-x-3 ${style.bg}`}>
            <div className="flex-shrink-0">{style.icon}</div>
            <p className="text-sm">{insight.text}</p>
        </div>
    );
}

const PolicymakerDashboard: React.FC = () => {
    const [insights, setInsights] = useState<{ executiveSummary: string; recommendations: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            setIsLoading(true);
            const data = await getPolicyInsights();
            setInsights(data);
            setIsLoading(false);
        };
        fetchInsights();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Import vs. Domestic Production (Million Tonnes)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productionData}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="imports" stackId="a" fill="#f59e0b" name="Imports" />
                                <Bar dataKey="domestic" stackId="a" fill="#10b981" name="Domestic Production" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Key Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                         <div className="flex justify-between"><span>Self-Sufficiency Ratio:</span> <span className="font-bold text-green-500">48.0%</span></div>
                         <div className="flex justify-between"><span>Import Dependency:</span> <span className="font-bold text-yellow-500">52.0%</span></div>
                         <div className="flex justify-between"><span>Avg. Farmer Income (YoY):</span> <span className="font-bold text-green-500">+8.2%</span></div>
                         <div className="flex justify-between"><span>Post-Harvest Loss:</span> <span className="font-bold text-red-500">12.5%</span></div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                        <CardTitle>AI-Powered Policy Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div>Generating insights...</div>
                        ) : insights && (
                            <div className="space-y-4">
                                <p className="italic text-gray-600 dark:text-gray-400">{insights.executiveSummary}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    {insights.recommendations.map(rec => <PolicyInsightCard key={rec.id} insight={rec} />)}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PolicymakerDashboard;

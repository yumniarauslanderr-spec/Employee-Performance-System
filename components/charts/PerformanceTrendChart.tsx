import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { KpiScoring, KpiMaster } from '../../types';
import { calculateKpiScoreForMonth } from '../../services/mockApi';

interface PerformanceTrendChartProps {
    scores: KpiScoring[];
    kpis: KpiMaster[];
}

const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({ scores, kpis }) => {
    const months = [...new Set(scores.map(s => s.month))].sort();
    const data = months.map((month: string) => ({
        month: new Date(month + '-01').toLocaleString('default', { month: 'short' }),
        score: parseFloat(calculateKpiScoreForMonth(scores, kpis, month).toFixed(2)),
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default PerformanceTrendChart;
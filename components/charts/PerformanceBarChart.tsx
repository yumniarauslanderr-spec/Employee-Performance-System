
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceBarChartProps {
    data: { name: string; score: number }[];
}

const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                    }}
                />
                <Legend />
                <Bar dataKey="score" fill="#2dd4bf" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PerformanceBarChart;

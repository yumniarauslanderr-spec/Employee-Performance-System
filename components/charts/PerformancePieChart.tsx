
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformancePieChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#14b8a6', '#2dd4bf', '#a7f3d0', '#d1fae5'];

const PerformancePieChart: React.FC<PerformancePieChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                    }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PerformancePieChart;

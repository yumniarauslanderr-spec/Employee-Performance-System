
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DepartmentAnalyticsData } from '../../types';

interface DepartmentTrendChartProps {
    analyticsData: DepartmentAnalyticsData;
}

const COLORS = ['#14b8a6', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

const DepartmentTrendChart: React.FC<DepartmentTrendChartProps> = ({ analyticsData }) => {
    
    const chartData = useMemo(() => {
        const months = Object.keys(analyticsData).sort();
        const departments = analyticsData[months[0]]?.map(d => d.department) || [];

        return months.map(month => {
            const monthEntry: { [key: string]: string | number } = {
                month: new Date(month + '-02').toLocaleString('default', { month: 'short' }),
            };
            analyticsData[month].forEach(deptData => {
                monthEntry[deptData.department] = parseFloat(deptData.avgKpi.toFixed(1));
            });
            return monthEntry;
        });
    }, [analyticsData]);

    const departments = useMemo(() => {
        const firstMonth = Object.keys(analyticsData).sort()[0];
        return analyticsData[firstMonth]?.map(d => d.department) || [];
    }, [analyticsData]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
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
                {departments.map((dept, index) => (
                    <Line 
                        key={dept}
                        type="monotone" 
                        dataKey={dept} 
                        stroke={COLORS[index % COLORS.length]} 
                        strokeWidth={2} 
                        activeDot={{ r: 8 }} 
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DepartmentTrendChart;

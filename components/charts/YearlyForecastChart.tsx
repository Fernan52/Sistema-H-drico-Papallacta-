import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { WeatherDataPoint } from '../../types';

interface ChartProps {
    forecastData: WeatherDataPoint[];
}

const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length && label) {
        const date = new Date(label as string);
        const formattedDate = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', timeZone: 'UTC' });
        return (
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-600 shadow-xl backdrop-blur-sm">
                <p className="font-bold text-slate-200">{formattedDate}</p>
                <p style={{ color: payload[0].color || '#fff' }}>
                    {`Promedio: ${(payload[0].value as number)?.toFixed(2)} mm`}
                </p>
            </div>
        );
    }
    return null;
};

const YearlyForecastChart: React.FC<ChartProps> = ({ forecastData }) => {
    return (
        <ResponsiveContainer width="100%" height={500}>
            <BarChart data={forecastData} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString('es-ES', { month: 'short', year: '2-digit', timeZone: 'UTC' })}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    stroke="#64748b"
                />
                <YAxis
                    label={{ value: 'Precipitación Promedio (mm)', angle: -90, position: 'insideLeft', fill: '#cbd5e1', dy: 110 }}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    stroke="#64748b"
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(100, 116, 139, 0.2)'}} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#e2e8f0' }} />
                <Bar
                    dataKey="precipitation"
                    name="Promedio Mensual"
                    fill="#818cf8"
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default YearlyForecastChart;
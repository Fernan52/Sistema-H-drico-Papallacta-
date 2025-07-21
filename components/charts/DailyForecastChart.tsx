import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, TooltipProps, Cell } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { WeatherDataPoint, Alert } from '../../types';

interface ChartProps {
    forecastData: WeatherDataPoint[];
    alerts: Alert[];
}

const getBarColor = (date: string, alertMap: Map<string, 'warning' | 'critical'>) => {
    const severity = alertMap.get(date);
    if (severity === 'critical') return '#ef4444'; // red-500
    if (severity === 'warning') return '#facc15'; // yellow-400
    return '#34d399'; // green-400
};

const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length && label) {
        const date = new Date(label as string);
        const formattedDate = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
        
        // El color ahora está en el payload del punto de datos.
        const color = payload[0].payload.fill;

        return (
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-600 shadow-xl backdrop-blur-sm">
                <p className="font-bold text-slate-200">{formattedDate}</p>
                <p style={{ color: color || '#fff' }}>
                    {`Precipitación: ${(payload[0].value as number)?.toFixed(2)} mm`}
                </p>
            </div>
        );
    }
    return null;
};

const DailyForecastChart: React.FC<ChartProps> = ({ forecastData, alerts }) => {
    const alertMap = new Map(alerts.map(a => [a.date, a.severity]));

    const dataWithColor = forecastData.map(entry => ({
        ...entry,
        fill: getBarColor(entry.date, alertMap),
    }));

    return (
        <ResponsiveContainer width="100%" height={500}>
            <BarChart data={dataWithColor} margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    stroke="#64748b"
                />
                <YAxis
                    label={{ value: 'Precipitación (mm)', angle: -90, position: 'insideLeft', fill: '#cbd5e1', dy: 70 }}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    stroke="#64748b"
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(100, 116, 139, 0.2)'}} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#e2e8f0' }} />
                <Bar
                    dataKey="precipitation"
                    name="Pronóstico Diario"
                    radius={[4, 4, 0, 0]}
                >
                    {dataWithColor.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default DailyForecastChart;
import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, TooltipProps, ReferenceDot } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { WeatherDataPoint, Alert } from '../../types';

interface ChartProps {
    historicalData: WeatherDataPoint[];
    forecastData: WeatherDataPoint[];
    alerts: Alert[];
}

const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length && label) {
        const date = new Date(label as string);
        const formattedDate = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

        return (
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-600 shadow-xl backdrop-blur-sm">
                <p className="font-bold text-slate-200">{formattedDate}</p>
                {payload.map((pld) => (
                    <p key={pld.name} style={{ color: pld.color || '#fff' }}>
                        {`${pld.name}: ${(pld.value as number)?.toFixed(2)} mm`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const MonthlyForecastChart: React.FC<ChartProps> = ({ historicalData, forecastData, alerts }) => {
    const connectionPoint = historicalData.length > 0 ? historicalData[historicalData.length - 1] : null;
    const displayForecastData = connectionPoint && forecastData.length > 0 ? [connectionPoint, ...forecastData] : forecastData;
    
    return (
        <ResponsiveContainer width="100%" height={500}>
            <LineChart margin={{ top: 5, right: 20, left: -10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    stroke="#64748b"
                    domain={['dataMin', 'dataMax']}
                    type="category"
                />
                <YAxis
                    label={{ value: 'Precipitación (mm)', angle: -90, position: 'insideLeft', fill: '#cbd5e1', dy: 70 }}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    stroke="#64748b"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#e2e8f0' }} />
                <Line
                    type="monotone"
                    dataKey="precipitation"
                    name="Histórico"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={false}
                    data={historicalData}
                />
                <Line
                    type="monotone"
                    dataKey="precipitation"
                    name="Pronóstico"
                    stroke="#34d399"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 2, fill: '#34d399' }}
                    data={displayForecastData}
                />
                {alerts.map(alert => (
                    <ReferenceDot
                        key={alert.id}
                        x={alert.date}
                        y={alert.precipitation}
                        r={6}
                        fill={alert.severity === 'critical' ? '#ef4444' : '#facc15'}
                        stroke="#ffffff"
                        strokeWidth={2}
                        ifOverflow="extendDomain"
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default MonthlyForecastChart;
import React, { useMemo } from 'react';
import type { WeatherDataPoint, Alert } from '../types';
import { Droplet, TrendingUp, CalendarDays, ShieldAlert } from './Icons';

interface ForecastSummaryProps {
    forecastData: WeatherDataPoint[];
    alerts: Alert[];
    isLoading: boolean;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; unit?: string, isLoading: boolean }> = ({ icon, label, value, unit, isLoading }) => {
    if (isLoading) {
        return <div className="bg-slate-800/50 animate-pulse h-24 rounded-lg flex-1"></div>
    }
    return (
        <div className="bg-slate-800/50 p-4 rounded-lg flex items-center gap-4 flex-1 min-w-[200px]">
            <div className="bg-slate-700 p-3 rounded-full">
                {icon}
            </div>
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-xl font-bold text-white">
                    {value} <span className="text-base font-normal text-slate-300">{unit}</span>
                </p>
            </div>
        </div>
    );
};

const ForecastSummary: React.FC<ForecastSummaryProps> = ({ forecastData, alerts, isLoading }) => {
    const summary = useMemo(() => {
        if (!forecastData || forecastData.length === 0) {
            return {
                totalPrecipitation: 0,
                rainyDays: 0,
                peakPrecipitation: { value: 0, date: 'N/A' },
                alertCount: 0,
            };
        }

        const totalPrecipitation = forecastData.reduce((acc, item) => acc + item.precipitation, 0);
        const rainyDays = forecastData.filter(item => item.precipitation > 0.1).length;
        
        const peakPrecipitation = forecastData.reduce((peak, item) => {
            return item.precipitation > peak.value ? { value: item.precipitation, date: item.date } : peak;
        }, { value: 0, date: 'N/A' });

        return {
            totalPrecipitation,
            rainyDays,
            peakPrecipitation,
            alertCount: alerts.length,
        };
    }, [forecastData, alerts]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                icon={<Droplet className="w-6 h-6 text-blue-400"/>} 
                label="Precipitación Total"
                value={summary.totalPrecipitation.toFixed(1)}
                unit="mm"
                isLoading={isLoading}
            />
            <StatCard 
                icon={<CalendarDays className="w-6 h-6 text-green-400"/>} 
                label="Días con Lluvia"
                value={summary.rainyDays}
                unit={`días`}
                isLoading={isLoading}
            />
            <StatCard 
                icon={<TrendingUp className="w-6 h-6 text-yellow-400"/>} 
                label="Pico de Precipitación"
                value={summary.peakPrecipitation.value.toFixed(1)}
                unit="mm"
                isLoading={isLoading}
            />
            <StatCard 
                icon={<ShieldAlert className="w-6 h-6 text-red-400"/>} 
                label="Alertas Activas"
                value={summary.alertCount}
                unit="alertas"
                isLoading={isLoading}
            />
        </div>
    );
};

export default ForecastSummary;

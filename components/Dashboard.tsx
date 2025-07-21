import React, { useState, useEffect, useCallback } from 'react';
import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import { generateInitialData, generateForecast } from '../services/geminiService';
import ControlPanel from './ControlPanel';
import DataVisualization from './DataVisualization';
import AlertsPanel from './AlertsPanel';
import LoadingSpinner from './LoadingSpinner';
import { ExclamationTriangle } from './Icons';
import ForecastSummary from './ForecastSummary';

interface DashboardProps {
    initialPeriod?: ForecastPeriod;
}

const Dashboard: React.FC<DashboardProps> = ({ initialPeriod = 'Diario' }) => {
    const [historicalData, setHistoricalData] = useState<WeatherDataPoint[]>([]);
    const [forecastData, setForecastData] = useState<WeatherDataPoint[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>(initialPeriod);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const handleFetchForecast = useCallback(async (period: ForecastPeriod, initialData: WeatherDataPoint[]) => {
        if (initialData.length === 0) return;
        
        setIsLoading(true);
        setError(null);
        setForecastData([]);

        try {
            const { forecast, alerts } = await generateForecast(initialData, period);
            setForecastData(forecast);
            setAlerts(alerts);
        } catch (e) {
            const err = e as Error;
            setError(err.message || 'Ocurrió un error desconocido.');
            setAlerts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await generateInitialData();
                setHistoricalData(data);
                await handleFetchForecast(initialPeriod, data);
            } catch (e) {
                const err = e as Error;
                setError(err.message || 'Ocurrió un error desconocido.');
                setHistoricalData([]);
            }
        };

        fetchInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialPeriod]); // Re-run when initialPeriod changes

    // Sync internal state with external prop
    useEffect(() => {
        setForecastPeriod(initialPeriod);
    }, [initialPeriod]);

    const onPeriodChange = (period: ForecastPeriod) => {
        setForecastPeriod(period);
        handleFetchForecast(period, historicalData);
    };

    return (
        <div className="space-y-6">
            <ControlPanel
                selectedPeriod={forecastPeriod}
                onPeriodChange={onPeriodChange}
                isLoading={isLoading}
            />

            <AlertsPanel alerts={alerts} isLoading={isLoading} />
            
            <ForecastSummary 
                forecastData={forecastData}
                alerts={alerts}
                isLoading={isLoading}
            />

            <div className="bg-slate-800/50 p-4 sm:p-6 rounded-xl shadow-lg border border-slate-700 min-h-[500px] flex flex-col justify-center items-center">
                {error && (
                    <div className="text-center text-red-400">
                        <ExclamationTriangle className="w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">Error al Obtener Datos</h3>
                        <p className="text-slate-400">{error}</p>
                    </div>
                )}
                
                {isLoading && !error && (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-400">Analizando patrones meteorológicos...</p>
                    </div>
                )}

                {!isLoading && !error && historicalData.length > 0 && (
                     <DataVisualization
                        historicalData={historicalData}
                        forecastData={forecastData}
                        period={forecastPeriod}
                        alerts={alerts}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
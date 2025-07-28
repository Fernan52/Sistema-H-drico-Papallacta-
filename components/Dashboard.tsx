import React, { useState, useEffect, useCallback } from 'react';
import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import { generateHybridForecast, generateInitialDataFromSources } from '../services/hybridForecastService';
import ControlPanel from './ControlPanel';
import DataVisualization from './DataVisualization';
import AlertsPanel from './AlertsPanel';
import MonthlyAlertsForYear from './MonthlyAlertsForYear';
import LoadingSpinner from './LoadingSpinner';
import ArimaForecast from './ArimaForecast';
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
        setAlerts([]);

        try {
            console.log(`🚀 Iniciando pronóstico híbrido para período: ${period}`);
            const result = await generateHybridForecast(initialData, period);
            
            // Usar los datos tal como vienen de la predicción (sin ajustar fechas)
            setForecastData(result.forecast);
            setHistoricalData(initialData);
            setAlerts(result.alerts);
            
            console.log(`✅ Pronóstico híbrido completado:`);
            console.log(`   � Confianza: ${(result.confidence * 100).toFixed(1)}%`);
            console.log(`   🔬 ARIMA: ${result.sources.arima ? 'SÍ' : 'NO'}`);
            console.log(`   🌤️ INAMHI: ${result.sources.inamhi ? 'SÍ' : 'NO'}`);
            console.log(`   💧 PARAMH2O: ${result.sources.paramh2o ? 'SÍ' : 'NO'}`);
            console.log(`   🤖 Gemini: ${result.sources.gemini ? 'SÍ' : 'NO'}`);
            
        } catch (e) {
            const err = e as Error;
            console.error('❌ Error en pronóstico híbrido:', err);
            setError(err.message || 'Ocurrió un error en el sistema de pronóstico híbrido.');
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
                console.log('🔄 Obteniendo datos históricos híbridos...');
                const data = await generateInitialDataFromSources();
                setHistoricalData(data);
                await handleFetchForecast(initialPeriod, data);
            } catch (e) {
                const err = e as Error;
                console.error('❌ Error obteniendo datos iniciales:', err);
                setError(err.message || 'Error obteniendo datos del sistema.');
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

            {/* Alertas normales para diario y mensual */}
            {forecastPeriod !== 'Anual' && (
                <AlertsPanel alerts={alerts} isLoading={isLoading} />
            )}
            
            {/* Alertas mensuales especializadas para período anual */}
            {forecastPeriod === 'Anual' && (
                <MonthlyAlertsForYear forecastData={forecastData} isLoading={isLoading} />
            )}
            
            {/* Pronóstico del Modelo ARIMA Entrenado */}
            <ArimaForecast period={forecastPeriod} className="mb-6" />
            
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
                        <p className="mt-4 text-slate-400">
                            Analizando datos híbridos: ARIMA + INAMHI + PARAMH2O + Gemini AI...
                        </p>
                        <div className="mt-2 text-xs text-slate-500">
                            Integrando múltiples fuentes para máxima precisión
                        </div>
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
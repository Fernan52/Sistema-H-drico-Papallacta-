import React from 'react';
import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import DailyForecastChart from './charts/DailyForecastChart';
import MonthlyForecastChart from './charts/MonthlyForecastChart';
import YearlyForecastChart from './charts/YearlyForecastChart';

interface DataVisualizationProps {
    historicalData: WeatherDataPoint[];
    forecastData: WeatherDataPoint[];
    period: ForecastPeriod;
    alerts: Alert[];
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ historicalData, forecastData, period, alerts }) => {
    
    const renderChart = () => {
        switch (period) {
            case 'Diario':
                return <DailyForecastChart forecastData={forecastData} alerts={alerts} />;
            case 'Mensual':
                return <MonthlyForecastChart historicalData={historicalData} forecastData={forecastData} alerts={alerts} />;
            case 'Anual':
                return <YearlyForecastChart forecastData={forecastData} />;
            default:
                return <p>Seleccione un período para ver el pronóstico.</p>;
        }
    };

    return (
        <div className="w-full h-full">
            {renderChart()}
        </div>
    );
};

export default DataVisualization;
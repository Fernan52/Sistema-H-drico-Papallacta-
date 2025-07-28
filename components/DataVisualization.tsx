import React from 'react';
import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import DualChartVisualization from './DualChartVisualization';

interface DataVisualizationProps {
    historicalData: WeatherDataPoint[];
    forecastData: WeatherDataPoint[];
    period: ForecastPeriod;
    alerts: Alert[];
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ historicalData, forecastData, period, alerts }) => {
    
    return (
        <div className="w-full h-full">
            <DualChartVisualization 
                historicalData={historicalData}
                forecastData={forecastData}
                period={period}
                alerts={alerts}
            />
        </div>
    );
};

export default DataVisualization;
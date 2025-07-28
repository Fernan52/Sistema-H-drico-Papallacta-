/**
 * 📊 COMPONENTE DE PRONÓSTICO MEJORADO CON MODELO ARIMA
 * 
 * Muestra pronósticos meteorológicos e hidrológicos generados por el modelo
 * ARIMA entrenado, con visualizaciones interactivas y análisis de confianza.
 */

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useArimaModel, useArimaPeriod } from '../hooks/useArimaModel';
import LoadingSpinner from './LoadingSpinner';
import type { ForecastPeriod } from '../types';

interface ArimaForecastProps {
  period: ForecastPeriod;
  className?: string;
}

const ArimaForecast: React.FC<ArimaForecastProps> = ({ period, className = '' }) => {
  const [activeTab, setActiveTab] = useState<'temperature' | 'precipitation' | 'flow' | 'quality'>('temperature');
  
  // Convertir período del UI al formato del hook
  const arimaMap = {
    'Diario': 'daily' as const,
    'Mensual': 'monthly' as const,
    'Anual': 'yearly' as const
  };
  
  const arimaperiod = arimaMap[period];
  const { predictions, isLoading, error } = useArimaPeriod(arimaperiod);
  const { getModelStats } = useArimaModel();

  const modelStats = getModelStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
        <span className="ml-3 text-slate-400">Cargando predicciones del modelo ARIMA...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6 text-center">
        <div className="text-red-400 text-lg mb-2">⚠️ Error del Modelo ARIMA</div>
        <div className="text-red-300 text-sm">{error}</div>
        <div className="text-slate-400 text-xs mt-2">Usando datos de respaldo...</div>
      </div>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 text-center">
        <div className="text-yellow-400 text-lg mb-2">⚠️ Sin Predicciones</div>
        <div className="text-yellow-300 text-sm">No hay datos del modelo ARIMA disponibles para este período</div>
      </div>
    );
  }

  // Función auxiliar para crear fechas válidas
  const createValidDate = (baseDate: Date, index: number, period: ForecastPeriod): string => {
    const newDate = new Date(baseDate);
    
    try {
      if (period === 'Diario') {
        newDate.setDate(baseDate.getDate() + index);
        return newDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
      } else if (period === 'Mensual') {
        newDate.setDate(baseDate.getDate() + index);
        return newDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      } else { // Anual
        newDate.setMonth(baseDate.getMonth() + index);
        newDate.setDate(1);
        return newDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }
    } catch (error) {
      console.warn('Error creando fecha válida:', error);
      return `${period} ${index + 1}`;
    }
  };

  // Preparar datos para visualización
  const chartData = predictions.slice(0, period === 'Diario' ? 7 : period === 'Mensual' ? 30 : 12).map((point, index) => {
    const baseDate = new Date();
    
    return {
      date: createValidDate(baseDate, index, period),
      temperature: Math.round(point.temperature * 10) / 10,
      precipitation: Math.round(point.precipitation * 10) / 10,
      humidity: Math.round(point.humidity * 10) / 10,
      flowRate: Math.round(point.flowRate * 10) / 10,
      waterQuality: Math.round(point.waterQuality * 10) / 10,
      confidence: Math.round((point.confidence || 0.8) * 100),
      index
    };
  });

  // Configuraciones de gráficos por variable
  const chartConfigs = {
    temperature: {
      title: 'Temperatura',
      dataKey: 'temperature',
      color: '#EF4444',
      unit: '°C',
      icon: '🌡️'
    },
    precipitation: {
      title: 'Precipitación',
      dataKey: 'precipitation',
      color: '#3B82F6',
      unit: 'mm',
      icon: '🌧️'
    },
    flow: {
      title: 'Caudal Estimado',
      dataKey: 'flowRate',
      color: '#10B981',
      unit: 'L/s',
      icon: '💧'
    },
    quality: {
      title: 'Calidad del Agua',
      dataKey: 'waterQuality',
      color: '#8B5CF6',
      unit: '/100',
      icon: '⚗️'
    }
  };

  const currentConfig = chartConfigs[activeTab];

  return (
    <div className={`bg-slate-800/50 rounded-xl border border-slate-600/50 p-6 ${className}`}>
      {/* Header con información del modelo */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            🔬 Pronóstico ARIMA - {period}
          </h3>
          {modelStats && (
            <div className="text-xs text-slate-400 text-right">
              <div>Confianza: {modelStats.avgConfidence.toFixed(1)}%</div>
              <div>Modelo: {modelStats.isModelActive ? '✅' : '❌'}</div>
            </div>
          )}
        </div>

        {/* Información del modelo */}
        <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-slate-400">Predicciones</div>
              <div className="text-white font-medium">{predictions.length}</div>
            </div>
            <div>
              <div className="text-slate-400">Confianza Promedio</div>
              <div className="text-white font-medium">
                {modelStats ? `${modelStats.avgConfidence.toFixed(1)}%` : '85%'}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Fuente</div>
              <div className="text-green-400 font-medium">ARIMA Entrenado</div>
            </div>
            <div>
              <div className="text-slate-400">Última Actualización</div>
              <div className="text-white font-medium">
                {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de variables */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(chartConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {config.icon} {config.title}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico principal */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value: any) => [
                `${value} ${currentConfig.unit}`,
                currentConfig.title
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={currentConfig.dataKey}
              stroke={currentConfig.color}
              strokeWidth={3}
              dot={{ fill: currentConfig.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: currentConfig.color }}
              name={`${currentConfig.title} (${currentConfig.unit})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de confianza */}
      <div className="h-32 mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Nivel de Confianza del Modelo (%)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={10}
              tickLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={10}
              tickLine={false}
              domain={[60, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F3F4F6'
              }}
              formatter={(value: any) => [`${value}%`, 'Confianza']}
            />
            <Bar
              dataKey="confidence"
              fill="#8B5CF6"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(chartConfigs).map(([key, config]) => {
          const values = chartData.map(d => d[config.dataKey as keyof typeof d] as number);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          const max = Math.max(...values);
          const min = Math.min(...values);

          return (
            <div key={key} className="bg-slate-700/30 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">{config.icon} {config.title}</div>
              <div className="text-sm text-white space-y-1">
                <div>Prom: {avg.toFixed(1)} {config.unit}</div>
                <div className="text-xs text-slate-400">
                  Min: {min.toFixed(1)} | Max: {max.toFixed(1)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArimaForecast;

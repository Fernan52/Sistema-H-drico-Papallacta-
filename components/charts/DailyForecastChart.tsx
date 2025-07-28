import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Area
} from 'recharts';

interface DailyForecastChartProps {
  data: any[];
  title?: string;
}

export const DailyForecastChart: React.FC<DailyForecastChartProps> = ({ 
  data, 
  title = "Predicción Diaria - 7 Días con ARIMA + Datos Reales" 
}) => {
  // Preparar datos con formato mejorado
  const prepareEnhancedData = () => {
    return data.map((item, index) => {
      const date = new Date(item.date);
      const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
      const dateFormatted = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
      
      return {
        ...item,
        dayLabel: `${dayName} ${dateFormatted}`,
        dayIndex: index + 1,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        // Asegurar que tenemos todos los campos necesarios
        temperature: item.temperature || 0,
        precipitation: item.precipitation || 0,
        humidity: item.humidity || 0,
        flowRate: item.flowRate || item.flow_rate || 0,
        waterQuality: item.waterQuality || item.water_quality || 0,
        windSpeed: item.windSpeed || item.wind_speed || 0,
        pressure: item.pressure || 680,
        confidence: Math.round((item.confidence || 0.85) * 100)
      };
    });
  };

  const enhancedData = prepareEnhancedData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-800 mb-2">{`📅 ${label}`}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }} className="text-sm">
                {`${entry.name}: ${entry.value}${getUnitForMetric(entry.dataKey)}`}
              </p>
            ))}
          </div>
          <div className="border-t pt-2 mt-2 text-xs text-gray-600">
            <p>🎯 Confianza: {data?.confidence}%</p>
            <p>🔬 Fuente: {data?.source || 'ARIMA_Enhanced'}</p>
            {data?.isWeekend && <p className="text-blue-600">🏖️ Fin de semana</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  const getUnitForMetric = (metric: string) => {
    switch (metric) {
      case 'temperature': return '°C';
      case 'precipitation': return 'mm';
      case 'humidity': return '%';
      case 'flowRate': return ' L/s';
      case 'waterQuality': return '/100';
      case 'windSpeed': return ' km/h';
      case 'pressure': return ' hPa';
      default: return '';
    }
  };

  const getAverageValue = (field: string) => {
    const sum = enhancedData.reduce((acc, item) => acc + (item[field] || 0), 0);
    return Math.round((sum / enhancedData.length) * 10) / 10;
  };

  return (
    <div className="space-y-6">
      {/* Título principal con estadísticas */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600">
          📊 {enhancedData.length} días de predicciones | 
          🔬 Modelo ARIMA con factores de realismo | 
          🌡️ Condiciones específicas Papallacta
        </p>
      </div>

      {/* Gráfico principal: Temperatura y Precipitación */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
          🌡️ Temperatura y 🌧️ Precipitación Diaria
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={enhancedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="dayLabel" 
              angle={-45} 
              textAnchor="end" 
              height={100}
              fontSize={12}
            />
            <YAxis 
              yAxisId="temp" 
              orientation="left" 
              label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <YAxis 
              yAxisId="precip" 
              orientation="right" 
              label={{ value: 'Precipitación (mm)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="precip" dataKey="precipitation" fill="#8884d8" name="Precipitación" />
            <Line 
              yAxisId="temp"
              type="monotone" 
              dataKey="temperature" 
              stroke="#ff7300" 
              strokeWidth={3}
              name="Temperatura" 
              dot={{ fill: '#ff7300', strokeWidth: 2, r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de calidad del agua y caudal */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          💧 Calidad del Agua y 🌊 Caudal
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={enhancedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="dayLabel" angle={-45} textAnchor="end" height={100} fontSize={12} />
            <YAxis 
              yAxisId="quality" 
              orientation="left" 
              label={{ value: 'Calidad (%)', angle: -90, position: 'insideLeft' }}
              domain={[70, 100]}
            />
            <YAxis 
              yAxisId="flow" 
              orientation="right" 
              label={{ value: 'Caudal (L/s)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area 
              yAxisId="quality"
              type="monotone" 
              dataKey="waterQuality" 
              stroke="#82ca9d" 
              fill="#82ca9d"
              fillOpacity={0.4}
              name="Calidad del Agua"
            />
            <Line 
              yAxisId="flow"
              type="monotone" 
              dataKey="flowRate" 
              stroke="#8dd1e1" 
              strokeWidth={3}
              name="Caudal"
              dot={{ fill: '#8dd1e1', strokeWidth: 2, r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de condiciones ambientales */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          💨 Condiciones Ambientales
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={enhancedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="dayLabel" angle={-45} textAnchor="end" height={100} fontSize={12} />
            <YAxis label={{ value: 'Valor', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="humidity" 
              stroke="#a4de6c" 
              strokeWidth={2}
              name="Humedad (%)"
              dot={{ fill: '#a4de6c', strokeWidth: 1, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="windSpeed" 
              stroke="#ffc658" 
              strokeWidth={2}
              name="Viento (km/h)"
              dot={{ fill: '#ffc658', strokeWidth: 1, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="confidence" 
              stroke="#ff7300" 
              strokeWidth={2}
              name="Confianza (%)"
              dot={{ fill: '#ff7300', strokeWidth: 1, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen estadístico */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          📊 Resumen de 7 Días
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Temp. Promedio</p>
            <p className="text-xl font-bold text-orange-600">
              {getAverageValue('temperature')}°C
            </p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Precipitación Total</p>
            <p className="text-xl font-bold text-blue-600">
              {Math.round(enhancedData.reduce((sum, item) => sum + item.precipitation, 0))} mm
            </p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Caudal Promedio</p>
            <p className="text-xl font-bold text-cyan-600">
              {getAverageValue('flowRate')} L/s
            </p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="text-sm text-gray-600">Calidad Promedio</p>
            <p className="text-xl font-bold text-green-600">
              {getAverageValue('waterQuality')}/100
            </p>
          </div>
        </div>
        
        {/* Indicadores adicionales */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-blue-700">🌧️ Días con lluvia</p>
            <p className="text-lg font-bold text-blue-800">
              {enhancedData.filter(item => item.precipitation > 5).length} de {enhancedData.length}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-green-700">💧 Calidad excelente</p>
            <p className="text-lg font-bold text-green-800">
              {enhancedData.filter(item => item.waterQuality > 90).length} de {enhancedData.length} días
            </p>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <p className="text-sm text-orange-700">🎯 Confianza promedio</p>
            <p className="text-lg font-bold text-orange-800">
              {getAverageValue('confidence')}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
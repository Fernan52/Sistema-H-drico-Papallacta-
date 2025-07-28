import React from 'react';
import {
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

interface MonthlyForecastChartProps {
  data: any[];
  title?: string;
}

export const MonthlyForecastChart: React.FC<MonthlyForecastChartProps> = ({ 
  data, 
  title = "Predicción Mensual - Próximos 30 Días" 
}) => {
  // Preparar datos con fechas futuras correctas
  const prepareDailyData = () => {
    if (!data || data.length === 0) {
      return [];
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return data.map((item, index) => {
      const forecastDate = new Date(tomorrow);
      forecastDate.setDate(tomorrow.getDate() + index);
      
      const dayOfMonth = forecastDate.getDate();
      const monthName = forecastDate.toLocaleDateString('es-ES', { month: 'short' });
      
      return {
        day: `${dayOfMonth} ${monthName}`,
        dayNumber: dayOfMonth,
        fullDate: forecastDate.toLocaleDateString('es-ES'),
        date: forecastDate.toISOString().split('T')[0],
        temperature: item.temperature || 0,
        precipitation: item.precipitation || 0,
        humidity: item.humidity || 0,
        flowRate: item.flowRate || item.flow_rate || 0,
        waterQuality: item.waterQuality || item.water_quality || 0,
        confidence: (item.confidence || 0.85) * 100,
        source: item.source || 'ARIMA_Enhanced',
        isPrediction: true
      };
    });
  };

  const chartData = prepareDailyData();

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`📅 ${data.fullDate}`}</p>
          <div className="mt-2 space-y-1">
            <p className="text-blue-600">
              🌡️ <span className="font-medium">Temperatura:</span> {data.temperature.toFixed(1)}°C
            </p>
            <p className="text-cyan-600">
              ☔ <span className="font-medium">Precipitación:</span> {data.precipitation.toFixed(1)}mm
            </p>
            <p className="text-green-600">
              💧 <span className="font-medium">Humedad:</span> {data.humidity.toFixed(1)}%
            </p>
            <p className="text-purple-600">
              🌊 <span className="font-medium">Caudal:</span> {data.flowRate.toFixed(1)} L/s
            </p>
            <p className="text-orange-600">
              🧪 <span className="font-medium">Calidad H2O:</span> {data.waterQuality.toFixed(1)}%
            </p>
            <p className="text-gray-500 text-sm">
              📊 <span className="font-medium">Confianza:</span> {data.confidence.toFixed(1)}%
            </p>
            <p className="text-gray-400 text-xs">
              🔬 <span className="font-medium">Fuente:</span> {data.source}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-500 text-center py-8">
          📊 No hay datos disponibles para la predicción mensual
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">
        📈 Predicciones día a día desde {chartData[0]?.fullDate} hasta {chartData[chartData.length - 1]?.fullDate}
      </p>
      
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={10}
            stroke="#666"
          />
          <YAxis 
            yAxisId="temp"
            domain={[0, 25]}
            label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
            stroke="#2563eb"
          />
          <YAxis 
            yAxisId="precip"
            orientation="right"
            domain={[0, 100]}
            label={{ value: 'Precipitación (mm)', angle: 90, position: 'insideRight' }}
            stroke="#0891b2"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Área de precipitación */}
          <Area
            yAxisId="precip"
            type="monotone"
            dataKey="precipitation"
            stackId="1"
            stroke="#0891b2"
            fill="#0891b2"
            fillOpacity={0.3}
            name="Precipitación (mm)"
          />
          
          {/* Línea de temperatura */}
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperature"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            name="Temperatura (°C)"
          />
          
          {/* Barras de humedad */}
          <Bar
            yAxisId="precip"
            dataKey="humidity"
            fill="#10b981"
            fillOpacity={0.6}
            name="Humedad (%)"
          />
          
          {/* Línea de caudal */}
          <Line
            yAxisId="precip"
            type="monotone"
            dataKey="flowRate"
            stroke="#7c3aed"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#7c3aed', strokeWidth: 2, r: 3 }}
            name="Caudal (L/s)"
          />
          
          {/* Línea de calidad del agua */}
          <Line
            yAxisId="precip"
            type="monotone"
            dataKey="waterQuality"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            name="Calidad H2O (%)"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>📊 <strong>Fuentes de datos:</strong> ARIMA + INAMHI + PARAMH2O + Gemini AI</p>
        <p>🎯 <strong>Precisión promedio:</strong> {(chartData.reduce((sum, item) => sum + item.confidence, 0) / chartData.length).toFixed(1)}%</p>
        <p>🔄 <strong>Última actualización:</strong> {new Date().toLocaleString('es-ES')}</p>
      </div>
    </div>
  );
};

export default MonthlyForecastChart;
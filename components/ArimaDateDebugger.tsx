/**
 * 🐛 COMPONENTE DE DEBUG PARA VERIFICAR FECHAS ARIMA
 * 
 * Muestra información detallada sobre las fechas generadas por el modelo ARIMA
 * para verificar que todas las fechas sean válidas y estén en el formato correcto.
 */

import React, { useState } from 'react';
import { useArimaPeriod } from '../hooks/useArimaModel';

const ArimaDateDebugger: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const { predictions, isLoading, error } = useArimaPeriod(selectedPeriod);

  const debugDates = predictions.slice(0, 10).map((pred, index) => {
    const dateObj = new Date(pred.date);
    const isValidDate = !isNaN(dateObj.getTime());
    
    return {
      index,
      originalDate: pred.date,
      dateObject: dateObj,
      isValid: isValidDate,
      formatted: isValidDate ? dateObj.toLocaleDateString('es-ES') : 'FECHA INVÁLIDA',
      dayName: isValidDate ? dateObj.toLocaleDateString('es-ES', { weekday: 'long' }) : 'N/A',
      data: {
        temperature: pred.temperature,
        precipitation: pred.precipitation,
        confidence: pred.confidence
      }
    };
  });

  if (isLoading) return <div className="text-blue-400">Cargando debug de fechas...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-4">
      <h3 className="text-white font-bold mb-4">🐛 Debug de Fechas ARIMA</h3>
      
      {/* Selector de período */}
      <div className="mb-4">
        <label className="text-slate-300 text-sm mr-2">Período:</label>
        <select 
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="bg-slate-700 text-white px-3 py-1 rounded"
        >
          <option value="daily">Diario (7 días)</option>
          <option value="monthly">Mensual (30 días)</option>
          <option value="yearly">Anual (12 meses)</option>
        </select>
      </div>

      {/* Información general */}
      <div className="mb-4 text-sm">
        <div className="text-slate-300">Total predicciones: <span className="text-white">{predictions.length}</span></div>
        <div className="text-slate-300">Fechas válidas: <span className="text-green-400">{debugDates.filter(d => d.isValid).length}</span></div>
        <div className="text-slate-300">Fechas inválidas: <span className="text-red-400">{debugDates.filter(d => !d.isValid).length}</span></div>
      </div>

      {/* Tabla de debug */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left text-slate-300 p-2">#</th>
              <th className="text-left text-slate-300 p-2">Fecha Original</th>
              <th className="text-left text-slate-300 p-2">Válida</th>
              <th className="text-left text-slate-300 p-2">Formateada</th>
              <th className="text-left text-slate-300 p-2">Día</th>
              <th className="text-left text-slate-300 p-2">Temp</th>
              <th className="text-left text-slate-300 p-2">Precip</th>
            </tr>
          </thead>
          <tbody>
            {debugDates.map((item) => (
              <tr key={item.index} className={`border-b border-slate-700 ${item.isValid ? '' : 'bg-red-900/20'}`}>
                <td className="p-2 text-slate-400">{item.index + 1}</td>
                <td className="p-2 text-white font-mono text-xs">{item.originalDate}</td>
                <td className="p-2">
                  {item.isValid ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )}
                </td>
                <td className="p-2 text-slate-300">{item.formatted}</td>
                <td className="p-2 text-slate-400 text-xs">{item.dayName}</td>
                <td className="p-2 text-blue-400">{item.data.temperature?.toFixed(1)}°</td>
                <td className="p-2 text-cyan-400">{item.data.precipitation?.toFixed(1)}mm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Información adicional */}
      {predictions.length > 0 && (
        <div className="mt-4 p-3 bg-slate-700/30 rounded">
          <div className="text-slate-300 text-xs">
            <div>Primera fecha: {predictions[0]?.date}</div>
            <div>Última fecha: {predictions[predictions.length - 1]?.date}</div>
            <div>Fuente: {predictions[0]?.source}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArimaDateDebugger;

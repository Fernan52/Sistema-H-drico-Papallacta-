import React from 'react';
import type { Alert } from '../types';
import { ExclamationTriangle, Info, CalendarDays } from './Icons';

interface MonthlyAlertsForYearProps {
    forecastData: any[];
    isLoading: boolean;
}

const MonthlyAlertsForYear: React.FC<MonthlyAlertsForYearProps> = ({ forecastData, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full bg-slate-800/50 animate-pulse h-32 rounded-lg border border-slate-700">
                <div className="p-4 text-center text-slate-400">
                    Generando alertas mensuales para el año...
                </div>
            </div>
        );
    }

    // Generar alertas mes a mes a partir de los datos de predicción
    const generateMonthlyAlerts = (): Alert[] => {
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const alerts: Alert[] = [];
        const nextYear = new Date().getFullYear() + 1; // Para predicciones anuales, usamos el próximo año

        // Agrupar datos por mes
        for (let month = 0; month < 12; month++) {
            const monthData = forecastData.filter(item => {
                if (item.date) {
                    const itemDate = new Date(item.date);
                    return itemDate.getMonth() === month;
                }
                return false;
            });

            if (monthData.length > 0) {
                // Calcular promedios y totales del mes
                const avgTemp = monthData.reduce((sum, item) => sum + (item.temperature || 0), 0) / monthData.length;
                const totalPrecip = monthData.reduce((sum, item) => sum + (item.precipitation || 0), 0);
                const avgWaterQuality = monthData.reduce((sum, item) => sum + (item.waterQuality || item.water_quality || 0), 0) / monthData.length;
                const avgFlowRate = monthData.reduce((sum, item) => sum + (item.flowRate || item.flow_rate || 0), 0) / monthData.length;

                // Generar alertas basadas en condiciones críticas o de advertencia
                let alertLevel: 'warning' | 'critical' | null = null;
                let alertTitle = '';

                // Evaluación de temperatura
                if (avgTemp > 15) {
                    alertLevel = 'warning';
                    alertTitle = `Temperaturas elevadas en ${monthNames[month]} (${avgTemp.toFixed(1)}°C promedio)`;
                } else if (avgTemp < 5) {
                    alertLevel = 'critical';
                    alertTitle = `Temperaturas muy bajas en ${monthNames[month]} (${avgTemp.toFixed(1)}°C promedio)`;
                }

                // Evaluación de precipitación
                if (totalPrecip > 200) {
                    if (alertLevel !== 'critical') {
                        alertLevel = 'critical';
                        alertTitle = `Precipitación extrema en ${monthNames[month]} (${totalPrecip.toFixed(0)}mm total)`;
                    }
                } else if (totalPrecip > 150) {
                    if (!alertLevel) {
                        alertLevel = 'warning';
                        alertTitle = `Precipitación elevada en ${monthNames[month]} (${totalPrecip.toFixed(0)}mm total)`;
                    }
                } else if (totalPrecip < 20) {
                    if (!alertLevel) {
                        alertLevel = 'warning';
                        alertTitle = `Precipitación baja en ${monthNames[month]} (${totalPrecip.toFixed(0)}mm total)`;
                    }
                }

                // Evaluación de calidad del agua
                if (avgWaterQuality < 80) {
                    alertLevel = 'critical';
                    alertTitle = `Calidad del agua comprometida en ${monthNames[month]} (${avgWaterQuality.toFixed(1)}/100)`;
                } else if (avgWaterQuality < 85) {
                    if (alertLevel !== 'critical') {
                        alertLevel = 'warning';
                        alertTitle = `Calidad del agua por debajo del óptimo en ${monthNames[month]} (${avgWaterQuality.toFixed(1)}/100)`;
                    }
                }

                // Evaluación de caudal
                if (avgFlowRate < 130) {
                    alertLevel = 'critical';
                    alertTitle = `Caudal crítico en ${monthNames[month]} (${avgFlowRate.toFixed(1)} L/s promedio)`;
                } else if (avgFlowRate < 150) {
                    if (alertLevel !== 'critical') {
                        alertLevel = 'warning';
                        alertTitle = `Caudal reducido en ${monthNames[month]} (${avgFlowRate.toFixed(1)} L/s promedio)`;
                    }
                }

                // Crear alerta si se detectó alguna condición
                if (alertLevel) {
                    const firstDayOfMonth = new Date(nextYear, month, 1);
                    alerts.push({
                        id: `monthly-${month}`,
                        title: alertTitle,
                        date: firstDayOfMonth.toISOString().split('T')[0],
                        precipitation: totalPrecip,
                        severity: alertLevel
                    });
                }
            } else {
                // Si no hay datos para el mes, generar una alerta de datos insuficientes
                const firstDayOfMonth = new Date(nextYear, month, 1);
                alerts.push({
                    id: `monthly-nodata-${month}`,
                    title: `Datos insuficientes para ${monthNames[month]}`,
                    date: firstDayOfMonth.toISOString().split('T')[0],
                    precipitation: 0,
                    severity: 'warning' as const
                });
            }
        }

        return alerts;
    };

    const monthlyAlerts = generateMonthlyAlerts();

    if (monthlyAlerts.length === 0) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-900/50 border border-green-700 text-green-300">
                <Info className="w-6 h-6 flex-shrink-0" />
                <div>
                    <h4 className="font-bold">Condiciones Óptimas Todo el Año</h4>
                    <p className="text-sm">Las predicciones anuales no muestran alertas críticas o de advertencia para ningún mes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-200">
                    Alertas Mensuales para el Año ({monthlyAlerts.length} alertas detectadas)
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monthlyAlerts.map(alert => {
                    const isCritical = alert.severity === 'critical';
                    const bgColor = isCritical ? 'bg-red-900/50' : 'bg-yellow-900/50';
                    const borderColor = isCritical ? 'border-red-700' : 'border-yellow-700';
                    const textColor = isCritical ? 'text-red-300' : 'text-yellow-300';
                    const Icon = isCritical ? ExclamationTriangle : Info;

                    const monthDate = new Date(alert.date);
                    const monthName = monthDate.toLocaleDateString('es-ES', {
                        month: 'long',
                        year: 'numeric',
                        timeZone: 'UTC'
                    });

                    return (
                        <div key={alert.id} className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}>
                            <div className={`flex items-start gap-3 ${textColor}`}>
                                <Icon className="w-5 h-5 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-xs uppercase tracking-wider">
                                        {isCritical ? "🚨 CRÍTICO" : "⚠️ ADVERTENCIA"}
                                    </h4>
                                    <p className="text-sm font-semibold text-slate-100 mt-1">
                                        {alert.title}
                                    </p>
                                    <p className="text-xs mt-2 text-slate-400">
                                        Precipitación: {alert.precipitation.toFixed(1)}mm
                                    </p>
                                    <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                                        <CalendarDays className="w-3 h-3" />
                                        <span className="capitalize">{monthName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Resumen estadístico */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">📊 Resumen de Alertas Anuales</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-lg font-bold text-red-400">
                            {monthlyAlerts.filter(a => a.severity === 'critical').length}
                        </p>
                        <p className="text-xs text-slate-400">Críticas</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-yellow-400">
                            {monthlyAlerts.filter(a => a.severity === 'warning').length}
                        </p>
                        <p className="text-xs text-slate-400">Advertencias</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-green-400">
                            {12 - monthlyAlerts.length}
                        </p>
                        <p className="text-xs text-slate-400">Meses Seguros</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyAlertsForYear;

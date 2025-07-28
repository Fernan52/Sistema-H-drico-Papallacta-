import React from 'react';
import type { Alert, ForecastPeriod } from '../types';
import { AlertTriangle, ShieldAlert, CheckCircle, Calendar, CalendarDays } from './Icons';

interface DetailedAlertsProps {
    alerts: Alert[];
    period: ForecastPeriod;
}

const DetailedAlerts: React.FC<DetailedAlertsProps> = ({ alerts, period }) => {
    // Función específica para formatear fechas anuales sin día
    const formatAnnualDate = (dateString: string) => {
        const date = new Date(dateString);
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        return `${monthName} del ${year}`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        // Para período anual, usar función específica
        if (period === 'Anual') {
            return formatAnnualDate(dateString);
        }
        
        if (period === 'Diario') {
            const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
            const shortDate = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
            
            if (date.toDateString() === today.toDateString()) {
                return `Hoy, ${shortDate}`;
            } else if (date.toDateString() === tomorrow.toDateString()) {
                return `Mañana, ${shortDate}`;
            } else {
                return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${shortDate}`;
            }
        } else if (period === 'Mensual') {
            return date.toLocaleDateString('es-ES', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
            });
        }
        
        // Fallback para cualquier otro caso
        return formatAnnualDate(dateString);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'from-red-500 to-red-600';
            case 'warning':
                return 'from-amber-500 to-orange-500';
            case 'normal':
                return 'from-green-500 to-green-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return ShieldAlert;
            case 'warning':
                return AlertTriangle;
            case 'normal':
                return CheckCircle;
            default:
                return AlertTriangle;
        }
    };

    const getSeverityText = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'RIESGO ALTO';
            case 'warning':
                return 'MONITOREO';
            case 'normal':
                return 'CONDICIÓN NORMAL';
            default:
                return 'MONITOREO';
        }
    };

    const getTimeFrameInfo = () => {
        switch (period) {
            case 'Diario':
                return {
                    title: 'Alertas Semanales',
                    subtitle: 'Próximos 7 días - Monitoreo diario',
                    icon: CalendarDays,
                    description: 'Seguimiento día a día para la próxima semana'
                };
            case 'Mensual':
                return {
                    title: 'Alertas del Mes',
                    subtitle: 'Días restantes del mes actual',
                    icon: Calendar,
                    description: 'Planificación operativa mensual'
                };
            case 'Anual':
                return {
                    title: 'Alertas Anuales',
                    subtitle: 'Panorama anual por meses',
                    icon: Calendar,
                    description: 'Estrategia de gestión anual'
                };
            default:
                return {
                    title: 'Alertas Meteorológicas',
                    subtitle: 'Sistema de monitoreo',
                    icon: AlertTriangle,
                    description: 'Gestión de riesgos hídricos'
                };
        }
    };

    const timeFrame = getTimeFrameInfo();
    const TimeFrameIcon = timeFrame.icon;

    if (alerts.length === 0) {
        return (
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6 rounded-xl border border-green-700/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <TimeFrameIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-green-300">{timeFrame.title}</h3>
                        <p className="text-green-400 text-sm">{timeFrame.subtitle}</p>
                    </div>
                </div>
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-8 h-8 text-green-400" />
                    </div>
                    <h4 className="text-xl font-bold text-green-300 mb-2">Condiciones Favorables</h4>
                    <p className="text-green-400 mb-1">No se detectaron alertas para este período</p>
                    <p className="text-green-500 text-sm">{timeFrame.description}</p>
                </div>
            </div>
        );
    }

    // Agrupar alertas por severidad
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
    const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-700/50 to-amber-900/30 p-4 rounded-lg border border-amber-600/50">
                <div className="flex items-center gap-3">
                    <TimeFrameIcon className="w-6 h-6 text-amber-400" />
                    <div>
                        <h3 className="text-lg font-bold text-white">{timeFrame.title}</h3>
                        <p className="text-slate-300 text-sm">{timeFrame.subtitle}</p>
                    </div>
                    <div className="ml-auto bg-amber-500/20 px-3 py-1 rounded-full">
                        <span className="text-amber-300 font-bold">{alerts.length} alertas</span>
                    </div>
                </div>
            </div>

            {/* Alertas Críticas */}
            {criticalAlerts.length > 0 && (
                <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 p-5 rounded-xl border border-red-600/50">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldAlert className="w-5 h-5 text-red-400" />
                        <h4 className="text-lg font-bold text-red-300">Alertas Críticas ({criticalAlerts.length})</h4>
                    </div>
                    <div className="space-y-3">
                        {criticalAlerts.map((alert) => {
                            const SeverityIcon = getSeverityIcon(alert.severity);
                            return (
                                <div key={alert.id} className="bg-red-900/30 p-4 rounded-lg border border-red-600/30">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${getSeverityColor(alert.severity)} rounded-full flex items-center justify-center flex-shrink-0`}>
                                            <SeverityIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-bold text-red-200">{alert.title}</h5>
                                                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                    {getSeverityText(alert.severity)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-red-400">
                                                        {period === 'Anual' ? 'Período:' : 'Fecha:'}
                                                    </span>
                                                    <span className="text-red-200 font-medium ml-2">
                                                        {formatDate(alert.date)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-red-400">Precipitación:</span>
                                                    <span className="text-red-200 font-bold ml-2">
                                                        {alert.precipitation.toFixed(1)} mm{period === 'Anual' ? '/día promedio' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3 p-3 bg-red-800/30 rounded border border-red-600/30">
                                                <p className="text-red-200 text-sm">
                                                    <strong>Acciones Recomendadas:</strong> Activar protocolos de emergencia, 
                                                    monitoreo intensivo de estaciones de bombeo, preparar sistemas de drenaje 
                                                    adicionales en Papallacta y La Merced.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Alertas de Advertencia */}
            {warningAlerts.length > 0 && (
                <div className="bg-gradient-to-br from-amber-900/30 to-orange-800/20 p-5 rounded-xl border border-amber-600/50">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <h4 className="text-lg font-bold text-amber-300">Alertas de Monitoreo ({warningAlerts.length})</h4>
                    </div>
                    <div className="space-y-3">
                        {warningAlerts.map((alert) => {
                            const SeverityIcon = getSeverityIcon(alert.severity);
                            return (
                                <div key={alert.id} className="bg-amber-900/30 p-4 rounded-lg border border-amber-600/30">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${getSeverityColor(alert.severity)} rounded-full flex items-center justify-center flex-shrink-0`}>
                                            <SeverityIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-bold text-amber-200">{alert.title}</h5>
                                                <span className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                    {getSeverityText(alert.severity)}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-amber-400">
                                                        {period === 'Anual' ? 'Período:' : 'Fecha:'}
                                                    </span>
                                                    <span className="text-amber-200 font-medium ml-2">
                                                        {formatDate(alert.date)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-amber-400">Precipitación:</span>
                                                    <span className="text-amber-200 font-bold ml-2">
                                                        {alert.precipitation.toFixed(1)} mm{period === 'Anual' ? '/día promedio' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3 p-3 bg-amber-800/30 rounded border border-amber-600/30">
                                                <p className="text-amber-200 text-sm">
                                                    <strong>Recomendaciones:</strong> Incrementar frecuencia de monitoreo en 
                                                    estaciones Cuyuja y Bellavista, verificar capacidad de reserva, 
                                                    preparar equipos de respuesta rápida.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Resumen estadístico */}
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white">{alerts.length}</div>
                        <div className="text-slate-400 text-sm">Total Alertas</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-red-400">{criticalAlerts.length}</div>
                        <div className="text-slate-400 text-sm">Críticas</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-amber-400">{warningAlerts.length}</div>
                        <div className="text-slate-400 text-sm">Monitoreo</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-400">
                            {alerts.length > 0 ? Math.max(...alerts.map(a => a.precipitation)).toFixed(1) : '0'} mm
                        </div>
                        <div className="text-slate-400 text-sm">Máx. Esperado</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedAlerts;

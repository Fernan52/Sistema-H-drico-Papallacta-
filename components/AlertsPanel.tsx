
import React from 'react';
import type { Alert } from '../types';
import { ExclamationTriangle, Info, CalendarDays } from './Icons';

interface AlertsPanelProps {
    alerts: Alert[];
    isLoading: boolean;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, isLoading }) => {
    if (isLoading) {
        return <div className="w-full bg-slate-800/50 animate-pulse h-24 rounded-lg border border-slate-700"></div>;
    }

    if (alerts.length === 0) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-900/50 border border-green-700 text-green-300">
                <Info className="w-6 h-6 flex-shrink-0" />
                <div>
                    <h4 className="font-bold">Todo Despejado</h4>
                    <p className="text-sm">No hay alertas meteorológicas significativas en este momento.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {alerts.map(alert => {
                const isCritical = alert.severity === 'critical';
                const bgColor = isCritical ? 'bg-red-900/50' : 'bg-yellow-900/50';
                const borderColor = isCritical ? 'border-red-700' : 'border-yellow-700';
                const textColor = isCritical ? 'text-red-300' : 'text-yellow-300';
                const Icon = isCritical ? ExclamationTriangle : Info;

                const formattedDate = new Date(alert.date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC' // Important to avoid off-by-one day errors
                });

                return (
                    <div key={alert.id} className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}>
                        <div className={`flex items-start gap-4 ${textColor}`}>
                            <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold uppercase">{isCritical ? "ALERTA CRÍTICA" : "ADVERTENCIA"}</h4>
                                <p className="text-lg font-semibold text-slate-100">{alert.title}</p>
                            </div>
                        </div>
                         <div className="mt-3 pl-10 text-slate-200 text-sm space-y-1">
                            <p><strong>Precipitación pronosticada:</strong> {alert.precipitation.toFixed(1)} mm</p>
                            <p className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4"/>
                                <strong>Fecha:</strong> {formattedDate}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AlertsPanel;
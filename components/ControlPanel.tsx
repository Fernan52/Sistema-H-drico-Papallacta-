
import React from 'react';
import type { ForecastPeriod } from '../types';
import { Calendar, CalendarDays, CalendarClock } from './Icons';

interface ControlPanelProps {
    selectedPeriod: ForecastPeriod;
    onPeriodChange: (period: ForecastPeriod) => void;
    isLoading: boolean;
}

const buttons: { period: ForecastPeriod; icon: React.ReactNode }[] = [
    { period: 'Diario', icon: <CalendarDays className="w-5 h-5 mr-2" /> },
    { period: 'Mensual', icon: <Calendar className="w-5 h-5 mr-2" /> },
    { period: 'Anual', icon: <CalendarClock className="w-5 h-5 mr-2" /> },
];

const ControlPanel: React.FC<ControlPanelProps> = ({ selectedPeriod, onPeriodChange, isLoading }) => {
    return (
        <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-grow text-center sm:text-left p-2 text-slate-300 font-medium">Período de Pronóstico:</div>
            <div className="flex gap-2">
                {buttons.map(({ period, icon }) => (
                    <button
                        key={period}
                        onClick={() => onPeriodChange(period)}
                        disabled={isLoading}
                        className={`
                            flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500
                            ${isLoading ? 'cursor-not-allowed bg-slate-700 text-slate-500' : ''}
                            ${selectedPeriod === period 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
                        `}
                    >
                        {icon}
                        {period}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ControlPanel;
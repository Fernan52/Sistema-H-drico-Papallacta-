import React from 'react';
import type { ForecastPeriod } from '../types';
import { X } from './Icons';
import Dashboard from './Dashboard';

interface ForecastModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: ForecastPeriod;
}

const ForecastModal: React.FC<ForecastModalProps> = ({ isOpen, onClose, period }) => {
  if (!isOpen) return null;

  const getPeriodTitle = (period: ForecastPeriod) => {
    switch (period) {
      case 'Diario':
        return 'Pronóstico Diario - Próximos 7 días';
      case 'Mensual':
        return 'Pronóstico Mensual - Próximos 30 días';
      case 'Anual':
        return 'Pronóstico Anual - Próximos 12 meses';
      default:
        return 'Pronóstico del Clima';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content p-6 relative"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '90vw', height: '90vh' }}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {getPeriodTitle(period)}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Análisis meteorológico para Papallacta - Sistema de Agua
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Contenido del modal - Dashboard completo */}
        <div className="h-full overflow-auto">
          <Dashboard initialPeriod={period} />
        </div>
      </div>
    </div>
  );
};

export default ForecastModal;

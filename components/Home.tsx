import React, { useState } from 'react';
import type { ForecastPeriod } from '../types';
import EcuadorMap from './EcuadorMap';
import ForecastModal from './ForecastModal';
import Header from './Header';
import { Calendar, CalendarDays, CalendarClock, MapPin, Droplets } from './Icons';

const Home: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePeriodClick = (period: ForecastPeriod) => {
    setSelectedPeriod(period);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPeriod(null);
  };

  const forecastButtons = [
    {
      period: 'Diario' as ForecastPeriod,
      icon: <CalendarDays className="w-6 h-6" />,
      title: 'Pronóstico Diario',
      subtitle: 'Próximos 7 días',
      color: 'from-blue-600 to-blue-700',
      hoverColor: 'hover:from-blue-500 hover:to-blue-600'
    },
    {
      period: 'Mensual' as ForecastPeriod,
      icon: <Calendar className="w-6 h-6" />,
      title: 'Pronóstico Mensual',
      subtitle: 'Próximos 30 días',
      color: 'from-green-600 to-green-700',
      hoverColor: 'hover:from-green-500 hover:to-green-600'
    },
    {
      period: 'Anual' as ForecastPeriod,
      icon: <CalendarClock className="w-6 h-6" />,
      title: 'Pronóstico Anual',
      subtitle: 'Próximos 12 meses',
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-500 hover:to-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      {/* Header */}
      <Header />

      {/* Sección de controles de pronóstico */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Sistema de Monitoreo Meteorológico
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Selecciona el período de pronóstico para analizar las condiciones climáticas
            </p>
          </div>
          
          {/* Botones de período */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forecastButtons.map((button) => (
              <button
                key={button.period}
                onClick={() => handlePeriodClick(button.period)}
                className={`
                  p-6 rounded-xl border border-slate-600 
                  bg-gradient-to-br ${button.color} ${button.hoverColor}
                  transform hover:scale-105 transition-all duration-300
                  shadow-lg hover:shadow-xl
                  group
                `}
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                    {button.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {button.title}
                </h3>
                <p className="text-white/80 text-sm">
                  {button.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sección del mapa */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Información del sistema */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Sistema de Agua Papallacta</h3>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Ubicación:</span>
                    <span className="text-blue-300">0°22'S, 78°09'W</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Altitud:</span>
                    <span className="text-blue-300">3,220 m.s.n.m.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacidad:</span>
                    <span className="text-green-300">90% agua de Quito</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Población servida:</span>
                    <span className="text-green-300">~2.8M personas</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-500 rounded-lg">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Infraestructura</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-300">Central de Captación</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-slate-300">Estaciones de Bombeo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-slate-300">Reservorios</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-slate-300">Plantas de Tratamiento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-slate-300">Distribución Urbana</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Mapa del Sistema Hídrico
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Visualización del conducto principal desde Papallacta hasta Quito
                  </p>
                </div>
                <div className="h-96 rounded-lg overflow-hidden">
                  <EcuadorMap />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 mt-8 text-xs text-slate-500 border-t border-slate-700">
        <p>&copy; 2024 Servicios Predictivos Hidro-Met de Papallacta. Todos los derechos reservados.</p>
        <p className="mt-1">Sistema de monitoreo en tiempo real para la gestión del recurso hídrico</p>
      </footer>

      {/* Modal de pronóstico */}
      {selectedPeriod && (
        <ForecastModal
          isOpen={isModalOpen}
          onClose={closeModal}
          period={selectedPeriod}
        />
      )}
    </div>
  );
};

export default Home;

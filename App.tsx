
import { useState } from 'react';
import Header from './components/Header';
import InteractiveEcuadorMap from './components/InteractiveEcuadorMap';
import ForecastModal from './components/ForecastModal';
import type { ForecastPeriod } from './types';

function App() {
  const [activeModal, setActiveModal] = useState<ForecastPeriod | null>(null);

  const openModal = (period: ForecastPeriod) => {
    setActiveModal(period);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <main className="p-6 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Sección de bienvenida profesional */}
          <div className="bg-gradient-to-r from-slate-800/90 via-blue-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-600/50 shadow-2xl">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🏔️</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  Centro de Control Hidrológico
                </h1>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💧</span>
                </div>
              </div>
              <p className="text-lg text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed">
                Monitoreo integral del sistema de abastecimiento hídrico 
                <span className="text-blue-300 font-semibold"> Papallacta → Quito</span>, 
                incluyendo análisis meteorológico predictivo y gestión de recursos hídricos en tiempo real.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-600/50">
                  <span className="text-slate-400">Altitud:</span>
                  <span className="text-white font-bold ml-1">3,220 msnm</span>
                </div>
                <div className="bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-600/50">
                  <span className="text-slate-400">Distancia:</span>
                  <span className="text-white font-bold ml-1">45 km</span>
                </div>
                <div className="bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-600/50">
                  <span className="text-slate-400">Cobertura:</span>
                  <span className="text-white font-bold ml-1">Área Metropolitana</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección de Pronóstico mejorada */}
          <div className="bg-gradient-to-r from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-600/50 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="text-3xl">🌤️</span>
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  Sistema de Pronóstico Meteorológico
                </h2>
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
                Análisis predictivo avanzado con modelos de machine learning para gestión proactiva de recursos hídricos
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="group">
                <button
                  onClick={() => openModal('Diario')}
                  className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-6 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-500/50 backdrop-blur-sm group-hover:shadow-blue-500/25"
                >
                  <div className="text-4xl mb-3">📅</div>
                  <div className="text-xl font-bold mb-2">Pronóstico Diario</div>
                  <div className="text-blue-200 text-sm opacity-80">Próximos 7 días</div>
                  <div className="text-xs text-blue-300 mt-2 opacity-60">Resolución horaria</div>
                </button>
              </div>
              
              <div className="group">
                <button
                  onClick={() => openModal('Mensual')}
                  className="w-full bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold py-6 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 border border-green-500/50 backdrop-blur-sm group-hover:shadow-green-500/25"
                >
                  <div className="text-4xl mb-3">📊</div>
                  <div className="text-xl font-bold mb-2">Pronóstico Mensual</div>
                  <div className="text-green-200 text-sm opacity-80">Próximos 30 días</div>
                  <div className="text-xs text-green-300 mt-2 opacity-60">Tendencias y patrones</div>
                </button>
              </div>
              
              <div className="group">
                <button
                  onClick={() => openModal('Anual')}
                  className="w-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-6 px-8 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 border border-purple-500/50 backdrop-blur-sm group-hover:shadow-purple-500/25"
                >
                  <div className="text-4xl mb-3">📈</div>
                  <div className="text-xl font-bold mb-2">Pronóstico Anual</div>
                  <div className="text-purple-200 text-sm opacity-80">Próximos 12 meses</div>
                  <div className="text-xs text-purple-300 mt-2 opacity-60">Planificación estratégica</div>
                </button>
              </div>
            </div>
            
            {/* Indicadores de rendimiento */}
            <div className="mt-8 pt-6 border-t border-slate-600/30">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-white font-bold">94.8%</div>
                  <div className="text-slate-400 text-xs">Precisión IA</div>
                </div>
                <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-white font-bold">5 min</div>
                  <div className="text-slate-400 text-xs">Actualización</div>
                </div>
                <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-white font-bold">15 km²</div>
                  <div className="text-slate-400 text-xs">Área cobertura</div>
                </div>
                <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                  <div className="text-2xl mb-1">📡</div>
                  <div className="text-white font-bold">24/7</div>
                  <div className="text-slate-400 text-xs">Monitoreo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección del mapa profesional */}
          <div className="bg-gradient-to-r from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-slate-600/50 shadow-xl">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                    🗺️ Infraestructura del Sistema Hídrico
                  </h2>
                  <p className="text-slate-300 text-base">
                    Monitoreo en tiempo real del conducto principal y estaciones de control
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600/50">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm font-medium">Sistema Activo</span>
                </div>
              </div>
              
              {/* Indicadores técnicos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                  <div className="text-blue-300 text-xs font-medium">ALTITUD ORIGEN</div>
                  <div className="text-white text-sm font-bold">3,220 m</div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-green-300 text-xs font-medium">DESNIVEL</div>
                  <div className="text-white text-sm font-bold">650 m</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                  <div className="text-purple-300 text-xs font-medium">LONGITUD</div>
                  <div className="text-white text-sm font-bold">45 km</div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 text-center">
                  <div className="text-cyan-300 text-xs font-medium">ESTACIONES</div>
                  <div className="text-white text-sm font-bold">5 activas</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-600/30 overflow-hidden">
              <InteractiveEcuadorMap className="h-[600px] sm:h-[650px] lg:h-[700px]" />
            </div>
            
            {/* Leyenda técnica */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Parámetros Operativos
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Caudal nominal:</span>
                    <span className="text-blue-300">18.2 m³/s</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Presión operativa:</span>
                    <span className="text-green-300">125 bar</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Eficiencia del sistema:</span>
                    <span className="text-purple-300">96.8%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-700/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Estado de Infraestructura
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Estaciones operativas:</span>
                    <span className="text-green-300">5/5 activas</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Última inspección:</span>
                    <span className="text-cyan-300">Hace 2 días</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Próximo mantenimiento:</span>
                    <span className="text-yellow-300">22/07/2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de control profesional */}
          <div className="bg-gradient-to-r from-slate-800/80 via-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/50 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                📊 Centro de Control Operativo
              </h2>
              <p className="text-slate-300 text-base">
                Monitoreo integral de parámetros críticos y indicadores de rendimiento
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Panel Principal */}
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30 shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl">💧</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Captación Hídrica</h3>
                  <div className="text-3xl font-bold text-blue-300 mb-2">18.2 m³/s</div>
                  <p className="text-sm text-blue-200 opacity-80 mb-4">Caudal Principal</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-600/20">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Origen:</span>
                        <span className="text-white font-bold">Papallacta</span>
                      </div>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-600/20">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Altitud:</span>
                        <span className="text-white font-bold">3,220 msnm</span>
                      </div>
                    </div>
                    <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-600/20">
                      <div className="flex justify-between">
                        <span className="text-blue-200">Estado:</span>
                        <span className="text-green-300 font-bold">● Operativo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Tratamiento */}
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl">🏭</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Sistema de Tratamiento</h3>
                  <div className="text-3xl font-bold text-green-300 mb-2">A+</div>
                  <p className="text-sm text-green-200 opacity-80 mb-4">Calidad Excelente</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="bg-green-900/30 rounded-lg p-3 border border-green-600/20">
                      <div className="flex justify-between">
                        <span className="text-green-200">Planta:</span>
                        <span className="text-white font-bold">El Placer</span>
                      </div>
                    </div>
                    <div className="bg-green-900/30 rounded-lg p-3 border border-green-600/20">
                      <div className="flex justify-between">
                        <span className="text-green-200">Presión:</span>
                        <span className="text-white font-bold">125 bar</span>
                      </div>
                    </div>
                    <div className="bg-green-900/30 rounded-lg p-3 border border-green-600/20">
                      <div className="flex justify-between">
                        <span className="text-green-200">Eficiencia:</span>
                        <span className="text-cyan-300 font-bold">96.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel de Distribución */}
              <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl">🏙️</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Red de Distribución</h3>
                  <div className="text-3xl font-bold text-purple-300 mb-2">2.8M</div>
                  <p className="text-sm text-purple-200 opacity-80 mb-4">Habitantes Servidos</p>
                  
                  <div className="space-y-3 text-sm">
                    <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-600/20">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Destino:</span>
                        <span className="text-white font-bold">Área Metro</span>
                      </div>
                    </div>
                    <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-600/20">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Cobertura:</span>
                        <span className="text-white font-bold">98.5%</span>
                      </div>
                    </div>
                    <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-600/20">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Continuidad:</span>
                        <span className="text-green-300 font-bold">24/7</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertas y Estado */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-3">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                  Centro de Alertas
                </h3>
                <div className="space-y-3">
                  <div className="bg-green-900/40 border border-green-600/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-green-400 text-lg">✅</span>
                      <div>
                        <div className="text-green-300 font-medium text-sm">Sistema Operativo Normal</div>
                        <div className="text-green-200 text-xs opacity-70">Todos los parámetros en rango óptimo</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-900/40 border border-yellow-600/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400 text-lg">⚠️</span>
                      <div>
                        <div className="text-yellow-300 font-medium text-sm">Mantenimiento Programado</div>
                        <div className="text-yellow-200 text-xs opacity-70">Estación de bombeo - 22/07/2025</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-900/40 border border-blue-600/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 text-lg">ℹ️</span>
                      <div>
                        <div className="text-blue-300 font-medium text-sm">Récord de Caudal</div>
                        <div className="text-blue-200 text-xs opacity-70">Máximo histórico: 19.5 m³/s (15/07)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-3">
                  <span className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></span>
                  Condiciones Ambientales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-600/30">
                    <div className="text-2xl mb-2">🌡️</div>
                    <div className="text-white font-bold text-lg">12°C</div>
                    <div className="text-slate-400 text-xs">Temperatura</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-600/30">
                    <div className="text-2xl mb-2">💧</div>
                    <div className="text-white font-bold text-lg">85%</div>
                    <div className="text-slate-400 text-xs">Humedad</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-600/30">
                    <div className="text-2xl mb-2">🌧️</div>
                    <div className="text-white font-bold text-lg">2.5 mm/h</div>
                    <div className="text-slate-400 text-xs">Precipitación</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-center border border-slate-600/30">
                    <div className="text-2xl mb-2">💨</div>
                    <div className="text-white font-bold text-lg">15 km/h</div>
                    <div className="text-slate-400 text-xs">Viento NE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-t border-slate-600/50 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h4 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Centro de Control Hidrológico
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Sistema integrado de monitoreo y gestión de recursos hídricos para el abastecimiento 
                metropolitano de agua potable desde las fuentes naturales de Papallacta.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-3">Información Técnica</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacidad nominal:</span>
                  <span className="text-blue-300">20 m³/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Longitud total:</span>
                  <span className="text-green-300">45 km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Desnivel total:</span>
                  <span className="text-purple-300">650 m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Población servida:</span>
                  <span className="text-cyan-300">2.8M hab</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-3">Estado del Sistema</h4>
              <div className="space-y-3">
                <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-green-300 text-sm font-medium">Sistema Operativo</span>
                  </div>
                </div>
                <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                    <span className="text-blue-300 text-sm">Última actualización: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-600/30 text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-sm">
                &copy; 2025 Sistema de Monitoreo Meteorológico e Hidrológico de Papallacta 🇪🇨
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/50">
                  <span className="text-slate-400">Versión:</span>
                  <span className="text-white ml-1">v2.1.4</span>
                </span>
                <span className="bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/50">
                  <span className="text-slate-400">Build:</span>
                  <span className="text-white ml-1">2025.07.20</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modales de Pronóstico */}
      {activeModal && (
        <ForecastModal
          isOpen={true}
          onClose={closeModal}
          period={activeModal}
        />
      )}
    </div>
  );
}

export default App;
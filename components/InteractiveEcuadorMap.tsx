import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix para iconos por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Station {
  id: string;
  name: string;
  type: 'source' | 'pumping' | 'treatment' | 'distribution' | 'control' | 'final';
  position: [number, number];
  description: string;
  capacity?: string;
  status: 'active' | 'maintenance' | 'inactive';
  elevation?: number;
  flow?: string;
  pressure?: string;
}

interface InteractiveEcuadorMapProps {
  className?: string;
}

const InteractiveEcuadorMap: React.FC<InteractiveEcuadorMapProps> = ({ className = '' }) => {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showPipelines, setShowPipelines] = useState<boolean>(true);
  const [showElevation, setShowElevation] = useState<boolean>(true);
  const [currentFactIndex, setCurrentFactIndex] = useState<number>(0);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);

  // Hook para forzar la apertura de popups
  useEffect(() => {
    if (openPopupId) {
      console.log('Opening popup for:', openPopupId);
      // Forzar que el popup se abra
      const timer = setTimeout(() => {
        const popup = document.querySelector(`[data-station-id="${openPopupId}"] .leaflet-popup`);
        if (popup && !popup.classList.contains('leaflet-popup-open')) {
          console.log('Forcing popup open');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [openPopupId]);

  // Hook para limpiar popups residuales
  useEffect(() => {
    if (openPopupId === null) {
      // Forzar limpieza de cualquier popup residual
      const timer = setTimeout(() => {
        const popups = document.querySelectorAll('.leaflet-popup:not(.scalable-popup)');
        popups.forEach(popup => {
          popup.remove();
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [openPopupId]);

  // Hook para rotar datos curiosos cada 3 segundos
  React.useEffect(() => {
    if (selectedStation) {
      const visualInfo = getStationVisualInfo(selectedStation);
      const interval = setInterval(() => {
        setCurrentFactIndex(prev => (prev + 1) % visualInfo.funFacts.length);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [selectedStation]);

  // Resetear índice cuando cambie la estación
  React.useEffect(() => {
    setCurrentFactIndex(0);
  }, [selectedStation]);

  // Hook para manejar el zoom de popups con scroll
  useEffect(() => {
    const handlePopupScroll = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const popup = target.closest('.leaflet-popup-content-wrapper');
      
      if (popup && popup.closest('.scalable-popup')) {
        e.preventDefault();
        e.stopPropagation();
        
        const currentScale = popup.getAttribute('data-scale') || '1';
        let newScale = parseFloat(currentScale);
        
        if (e.deltaY < 0) {
          // Scroll hacia arriba - agrandar
          newScale = Math.min(newScale + 0.1, 1.5);
        } else {
          // Scroll hacia abajo - encoger
          newScale = Math.max(newScale - 0.1, 0.6);
        }
        
        popup.setAttribute('data-scale', newScale.toString());
        (popup as HTMLElement).style.transform = `scale(${newScale})`;
        (popup as HTMLElement).style.transformOrigin = 'center center';
      }
    };

    // Agregar event listener al documento
    document.addEventListener('wheel', handlePopupScroll, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', handlePopupScroll);
    };
  }, []);

  // Configuración básica para evitar problemas de carga
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Estaciones del sistema hídrico Papallacta-Quito con coordenadas reales (memoizado para performance)
  const stations: Station[] = useMemo(() => [
    {
      id: 'papallacta',
      name: 'Papallacta',
      type: 'source',
      position: [-0.3667, -78.1481], // Coordenadas reales de Papallacta
      description: 'Punto de captación principal ubicado en los páramos andinos. Fuente natural de agua de alta calidad para el sistema metropolitano.',
      capacity: '20 m³/s',
      status: 'active',
      elevation: 3220,
      flow: '18.2 m³/s',
      pressure: '95 bar'
    },
    {
      id: 'cuyuja',
      name: 'Cuyuja',
      type: 'pumping',
      position: [-0.3833, -78.1167], // Entre Papallacta y La Merced
      description: 'Estación intermedia de impulso que mantiene la presión adecuada durante el transporte hacia la ciudad.',
      capacity: '18 m³/s',
      status: 'active',
      elevation: 2950,
      flow: '17.8 m³/s',
      pressure: '110 bar'
    },
    {
      id: 'la-merced',
      name: 'La Merced',
      type: 'treatment',
      position: [-0.2167, -78.4833], // Coordenadas aproximadas
      description: 'Centro de tratamiento donde se realizan los procesos iniciales de purificación y filtrado del agua.',
      capacity: '17 m³/s',
      status: 'active',
      elevation: 2650,
      flow: '17.5 m³/s',
      pressure: '125 bar'
    },
    {
      id: 'bellavista',
      name: 'Bellavista',
      type: 'control',
      position: [-0.1833, -78.5167], // Valle de Los Chillos
      description: 'Punto estratégico de control que regula el flujo hacia diferentes sectores de la red de distribución.',
      capacity: '15 m³/s',
      status: 'active',
      elevation: 2400,
      flow: '15.2 m³/s',
      pressure: '105 bar'
    },
    {
      id: 'puengasi',
      name: 'Puengasí',
      type: 'distribution',
      position: [-0.2500, -78.4667], // Sector este de Quito
      description: 'Hub de distribución que abastece a las zonas residenciales del sector oriental de la capital.',
      capacity: '12 m³/s',
      status: 'maintenance',
      elevation: 2850,
      flow: '11.8 m³/s',
      pressure: '98 bar'
    },
    {
      id: 'el-placer',
      name: 'El Placer',
      type: 'treatment',
      position: [-0.2000, -78.5000], // Norte de Quito
      description: 'Instalación de tratamiento final que garantiza la calidad del agua antes de la distribución urbana.',
      capacity: '10 m³/s',
      status: 'active',
      elevation: 2950,
      flow: '9.8 m³/s',
      pressure: '88 bar'
    },
    {
      id: 'quito-centro',
      name: 'Quito Centro',
      type: 'final',
      position: [-0.2200, -78.5125], // Centro histórico de Quito
      description: 'Terminal del sistema que distribuye agua potable al centro histórico y barrios circundantes de la capital.',
      capacity: '8 m³/s',
      status: 'active',
      elevation: 2850,
      flow: '7.9 m³/s',
      pressure: '75 bar'
    }
  ], []); // useMemo dependency array

  // Ruta de tuberías entre estaciones (memoizado para performance)
  const pipelineRoute: [number, number][] = useMemo(() => [
    [-0.3667, -78.1481], // Papallacta
    [-0.3833, -78.1167], // Cuyuja
    [-0.2167, -78.4833], // La Merced
    [-0.1833, -78.5167], // Bellavista
    [-0.2500, -78.4667], // Puengasí
    [-0.2000, -78.5000], // El Placer
    [-0.2200, -78.5125], // Quito Centro
  ], []); // useMemo dependency array

  // Iconos personalizados para cada tipo de estación
  const getStationIcon = (station: Station) => {
    const iconColors = {
      source: '#3b82f6',      // Azul
      pumping: '#10b981',     // Verde
      treatment: '#8b5cf6',   // Púrpura
      distribution: '#f59e0b', // Amarillo
      control: '#ef4444',     // Rojo
      final: '#6b7280'        // Gris
    };

    const statusBorder = station.status === 'active' ? '#22c55e' : 
                        station.status === 'maintenance' ? '#f59e0b' : '#ef4444';

    return new L.DivIcon({
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: ${iconColors[station.type]};
          border: 3px solid ${statusBorder};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: 'custom-station-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // Obtener descripción del tipo de estación
  const getStationTypeDescription = (type: Station['type']) => {
    const descriptions = {
      source: 'Fuente de Captación',
      pumping: 'Estación de Bombeo',
      treatment: 'Planta de Tratamiento',
      distribution: 'Centro de Distribución',
      control: 'Estación de Control',
      final: 'Distribución Final'
    };
    return descriptions[type];
  };

  // Información visual y multimedia para cada estación
  const getStationVisualInfo = (station: Station) => {
    const visualData: Record<string, {
      title: string;
      subtitle: string;
      highlights: string[];
      funFacts: string[];
    }> = {
      papallacta: {
        title: '🏔️ Páramos de Papallacta',
        subtitle: 'Reserva Natural de Agua',
        highlights: ['Ecosistema de páramo único', 'Agua naturalmente pura', 'Biodiversidad excepcional'],
        funFacts: [
          'Los páramos almacenan hasta 30 veces más agua que un bosque',
          'Esta zona produce el 80% del agua dulce de Ecuador',
          'El páramo de Papallacta es considerado una "fábrica de agua natural"',
          'La temperatura del agua se mantiene constante entre 8-12°C todo el año',
          'Los musgos del páramo pueden absorber hasta 40 veces su peso en agua'
        ]
      },
      cuyuja: {
        title: '⚡ Estación Cuyuja',
        subtitle: 'Tecnología de Bombeo',
        highlights: ['Bombas de alta eficiencia', 'Control automatizado', 'Monitoreo 24/7'],
        funFacts: [
          'Puede impulsar 18,000 litros de agua por segundo',
          'Sus bombas funcionan con energía hidroeléctrica limpia',
          'El sistema de bombeo puede superar desniveles de 500 metros',
          'Cuenta con respaldo de generadores que arrancan en menos de 30 segundos',
          'Las bombas principales tienen una eficiencia energética del 95%'
        ]
      },
      'la-merced': {
        title: '🧪 Planta La Merced',
        subtitle: 'Purificación Avanzada',
        highlights: ['Filtros de múltiples capas', 'Análisis de laboratorio', 'Procesos eco-amigables'],
        funFacts: [
          'Realiza más de 100 análisis de calidad diarios',
          'Sus filtros pueden remover partículas de hasta 0.1 micrones',
          'Procesa el equivalente a 1,500 piscinas olímpicas por día',
          'El proceso de filtración tarda exactamente 6 horas',
          'Utiliza tecnología de ozono que elimina el 99.9% de virus y bacterias'
        ]
      },
      bellavista: {
        title: '🎛️ Control Bellavista',
        subtitle: 'Centro de Comando',
        highlights: ['Sistema SCADA', 'Control de válvulas', 'Gestión de presiones'],
        funFacts: [
          'Controla el flujo hacia 5 sectores diferentes de Quito',
          'Puede detectar una fuga de agua en menos de 5 minutos',
          'Su sistema SCADA monitorea 200 puntos de control simultáneamente',
          'Funciona con inteligencia artificial para optimizar distribución',
          'Puede manejar hasta 15 emergencias diferentes al mismo tiempo'
        ]
      },
      puengasi: {
        title: '🏘️ Hub Puengasí',
        subtitle: 'Distribución Urbana',
        highlights: ['Red de distribución', 'Sectores residenciales', 'Medidores inteligentes'],
        funFacts: [
          'Abastece a más de 500,000 habitantes del sector oriental',
          'Su red de tuberías se extiende por más de 800 kilómetros',
          'Cuenta con 50,000 medidores inteligentes conectados',
          'Puede detectar el consumo irregular en tiempo real',
          'Distribuye agua a edificios de hasta 20 pisos sin bombas adicionales'
        ]
      },
      'el-placer': {
        title: '🔬 Planta El Placer',
        subtitle: 'Calidad Garantizada',
        highlights: ['Potabilización final', 'Desinfección UV', 'Control bacteriológico'],
        funFacts: [
          'Garantiza agua con pureza del 99.9% antes de distribución',
          'Sus lámparas UV pueden eliminar virus en 3 segundos',
          'Analiza 50 parámetros químicos diferentes cada hora',
          'Produce agua más pura que muchas marcas embotelladas',
          'Su laboratorio funciona 24/7 con tecnología robótica'
        ]
      },
      'quito-centro': {
        title: '🏛️ Centro Histórico',
        subtitle: 'Patrimonio y Servicios',
        highlights: ['Distribución patrimonial', 'Red histórica', 'Cobertura completa'],
        funFacts: [
          'Abastece el centro histórico de Quito, Patrimonio de la Humanidad',
          'Algunas tuberías datan de la época colonial y aún funcionan',
          'Suministra agua a más de 100 iglesias históricas',
          'Su red subterránea es considerada una obra de ingeniería histórica',
          'Mantiene presión constante incluso en los edificios más antiguos'
        ]
      }
    };
    
    return visualData[station.id] || {
      title: station.name,
      subtitle: getStationTypeDescription(station.type),
      highlights: ['Sistema hídrico', 'Infraestructura moderna', 'Servicio continuo'],
      funFacts: ['Parte del sistema de abastecimiento de Quito']
    };
  };

  // Color de estado
  const getStatusColor = (status: Station['status']) => {
    const colors = {
      active: 'text-green-400',
      maintenance: 'text-yellow-400',
      inactive: 'text-red-400'
    };
    return colors[status];
  };

  const getStatusText = (status: Station['status']) => {
    const texts = {
      active: 'Operativo',
      maintenance: 'Mantenimiento',
      inactive: 'Inactivo'
    };
    return texts[status];
  };

  return (
    <div className={`relative ${className}`}>
      {/* Panel de controles - movido hacia abajo */}
      <div className="absolute top-20 left-4 z-[1000] bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 shadow-xl">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          Sistema Hídrico Papallacta
        </h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={showPipelines}
              onChange={(e) => setShowPipelines(e.target.checked)}
              className="rounded"
            />
            Mostrar tuberías
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={showElevation}
              onChange={(e) => setShowElevation(e.target.checked)}
              className="rounded"
            />
            Mostrar elevación
          </label>
        </div>
        
        {/* Leyenda */}
        <div className="mt-4 pt-3 border-t border-slate-600/50">
          <h4 className="text-white font-semibold text-xs mb-2">Leyenda</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-green-400"></div>
              <span className="text-slate-300">Fuente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-400"></div>
              <span className="text-slate-300">Bombeo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full border-2 border-green-400"></div>
              <span className="text-slate-300">Tratamiento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-yellow-400"></div>
              <span className="text-slate-300">En mantenimiento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de información de estación seleccionada */}
      {selectedStation && (
        <div className="absolute top-4 right-4 z-[1000] bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 shadow-xl max-w-xs">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold text-lg">{selectedStation.name}</h3>
            <button
              onClick={() => setSelectedStation(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Tipo:</span>
              <span className="text-blue-300">{getStationTypeDescription(selectedStation.type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estado:</span>
              <span className={getStatusColor(selectedStation.status)}>
                {getStatusText(selectedStation.status)}
              </span>
            </div>
            {selectedStation.elevation && (
              <div className="flex justify-between">
                <span className="text-slate-400">Elevación:</span>
                <span className="text-cyan-300">{selectedStation.elevation} msnm</span>
              </div>
            )}
            {selectedStation.flow && (
              <div className="flex justify-between">
                <span className="text-slate-400">Caudal:</span>
                <span className="text-green-300">{selectedStation.flow}</span>
              </div>
            )}
            {selectedStation.pressure && (
              <div className="flex justify-between">
                <span className="text-slate-400">Presión:</span>
                <span className="text-purple-300">{selectedStation.pressure}</span>
              </div>
            )}
            {selectedStation.capacity && (
              <div className="flex justify-between">
                <span className="text-slate-400">Capacidad:</span>
                <span className="text-orange-300">{selectedStation.capacity}</span>
              </div>
            )}
          </div>
          
          <div className="mt-3 pt-3 border-t border-slate-600/50">
            <p className="text-slate-300 text-xs leading-relaxed">
              {selectedStation.description}
            </p>
          </div>
        </div>
      )}

      {/* Mapa con configuración estable */}
      <MapContainer
        center={[-0.2200, -78.5125]} // Centrado en Quito
        zoom={9}
        maxZoom={16}
        minZoom={7}
        className={`w-full h-full ${className}`}
        zoomControl={true}
        closePopupOnClick={false}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={false}
        scrollWheelZoom={true}
        boxZoom={false}
        keyboard={true}
        attributionControl={true}
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
      >
        {/* Capa base del mapa - configuración simplificada */}
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
          maxZoom={16}
          minZoom={7}
        />

        {/* Tuberías del sistema */}
        {showPipelines && (
          <Polyline
            positions={pipelineRoute}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
            dashArray="10, 5"
          >
            <Tooltip permanent={false}>
              <div className="text-center">
                <strong>Tubería Principal</strong><br />
                <span className="text-sm">Sistema Papallacta → Quito</span><br />
                <span className="text-xs text-gray-600">45 km de longitud</span>
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* Marcadores de estaciones */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={station.position}
            icon={getStationIcon(station)}
            eventHandlers={{
              click: (e) => {
                e.originalEvent?.preventDefault();
                e.originalEvent?.stopPropagation();
                console.log('Marker clicked:', station.id);
                setSelectedStation(station);
                setOpenPopupId(station.id);
              },
            }}
          >
            <Popup 
              maxWidth={280}
              minWidth={200}
              className="custom-popup scalable-popup"
              autoPan={false}
              closeOnClick={false}
              keepInView={false}
              autoPanPadding={[0, 0]}
            >
              <div className="w-full max-w-xs bg-white p-2 rounded-lg text-sm relative">
                {openPopupId === station.id ? (
                  (() => {
                    const visualInfo = getStationVisualInfo(station);
                    return (
                      <>
                        {/* Botón de cerrar solo popup */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenPopupId(null);
                          }}
                          className="custom-close-button"
                          title="Cerrar popup"
                        >
                          <span className="text-sm font-bold leading-none">×</span>
                        </button>
                    
                        {/* Título y subtítulo compactos */}
                        <div className="text-center mb-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm pr-8">
                          <h3 className="font-bold text-sm text-gray-900 mb-1">
                            {visualInfo.title}
                          </h3>
                          <p className="text-xs text-blue-700 font-medium">
                            {visualInfo.subtitle}
                          </p>
                        </div>
                        
                        {/* Características compactas */}
                        <div className="mb-2 bg-white p-2 rounded-lg border border-gray-200">
                          <h4 className="font-bold text-xs text-gray-900 mb-2 border-b border-blue-600 pb-1">
                            ✨ Características
                          </h4>
                          <div className="space-y-1">
                            {visualInfo.highlights.map((highlight, index) => (
                              <div key={index} className="flex items-start text-xs">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                                <span className="font-medium text-gray-800 leading-relaxed">{highlight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Datos curiosos compactos */}
                        <div className="bg-white border border-blue-500 p-2 rounded-lg shadow-sm">
                          <h4 className="font-bold text-xs text-gray-900 mb-2 flex items-center">
                            💡 <span className="ml-1 text-blue-700">¿Sabías que...?</span>
                          </h4>
                          <div className="min-h-[50px] flex items-center">
                            <p className="text-xs font-medium leading-relaxed text-gray-800">
                              {visualInfo.funFacts[currentFactIndex]}
                            </p>
                          </div>
                          {/* Indicadores compactos */}
                          <div className="flex justify-center mt-2 space-x-1">
                            {visualInfo.funFacts.map((_, index) => (
                              <div
                                key={index}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                  index === currentFactIndex ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <p className="text-center text-gray-500">Cargando...</p>
                )}
              </div>
            </Popup>
            
            <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
              <div className="text-center">
                <strong>{station.name}</strong><br />
                <span className="text-xs">{getStationTypeDescription(station.type)}</span>
                {showElevation && station.elevation && (
                  <><br /><span className="text-xs">{station.elevation} msnm</span></>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* Círculos de área de influencia */}
        {stations.map((station) => (
          <CircleMarker
            key={`area-${station.id}`}
            center={station.position}
            radius={station.type === 'source' ? 15 : station.type === 'final' ? 12 : 8}
            fillColor={station.type === 'source' ? '#3b82f6' : station.type === 'final' ? '#6b7280' : '#10b981'}
            fillOpacity={0.1}
            color={station.type === 'source' ? '#3b82f6' : station.type === 'final' ? '#6b7280' : '#10b981'}
            weight={1}
            opacity={0.3}
            eventHandlers={{
              click: (e) => {
                e.originalEvent?.preventDefault();
                e.originalEvent?.stopPropagation();
                setSelectedStation(station);
                setOpenPopupId(station.id);
                console.log('Clicked circle:', station.id); // Debug
              },
            }}
          />
        ))}
      </MapContainer>
      
      {/* Indicador de carga optimizado */}
      {isMapLoading && (
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[1000]">
          <div className="bg-white/90 rounded-lg p-4 flex items-center gap-3 shadow-xl">
            <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-700 font-medium">Cargando mapa...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveEcuadorMap;

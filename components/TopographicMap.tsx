import React, { useState, useRef } from 'react';

interface TopographicMapProps {
  className?: string;
}

const TopographicMap: React.FC<TopographicMapProps> = ({ className = "" }) => {
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);
  const [mapScale, setMapScale] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const hydricPoints = [
    { 
      id: 'papallacta', 
      name: 'Papallacta', 
      x: 420, 
      y: 280, 
      color: '#0ea5e9', 
      elevation: '3,220 m',
      flow: '18.5 m³/s', 
      details: 'Captación principal - Zona de páramo alto',
      temperature: '8°C',
      type: 'captacion',
      pressure: '0 bar (natural)'
    },
    { 
      id: 'bombeo1', 
      name: 'E. Bombeo Loreto', 
      x: 380, 
      y: 300, 
      color: '#f59e0b', 
      elevation: '2,950 m',
      flow: '17.8 m³/s', 
      details: 'Primera estación de bombeo - Potencia: 1.8 MW',
      temperature: '12°C',
      type: 'bombeo',
      pressure: '85 bar'
    },
    { 
      id: 'bombeo2', 
      name: 'E. Bombeo El Quinche', 
      x: 340, 
      y: 320, 
      color: '#f59e0b', 
      elevation: '2,400 m',
      flow: '17.2 m³/s', 
      details: 'Segunda estación - Sistema redundante',
      temperature: '15°C',
      type: 'bombeo',
      pressure: '95 bar'
    },
    { 
      id: 'reservorio', 
      name: 'Reservorio El Placer', 
      x: 300, 
      y: 340, 
      color: '#06b6d4', 
      elevation: '2,850 m',
      flow: '16.5 m³/s', 
      details: 'Capacidad: 45,000 m³ - Reserva estratégica',
      temperature: '14°C',
      type: 'reservorio',
      pressure: '70 bar'
    },
    { 
      id: 'tratamiento', 
      name: 'Planta El Placer', 
      x: 280, 
      y: 360, 
      color: '#10b981', 
      elevation: '2,800 m',
      flow: '15.8 m³/s', 
      details: 'Tratamiento avanzado - Calidad A+',
      temperature: '16°C',
      type: 'tratamiento',
      pressure: '65 bar'
    },
    { 
      id: 'distribucion1', 
      name: 'Tanque Norte', 
      x: 250, 
      y: 380, 
      color: '#8b5cf6', 
      elevation: '2,600 m',
      flow: '8.5 m³/s', 
      details: 'Distribución zona norte de Quito',
      temperature: '18°C',
      type: 'distribucion',
      pressure: '45 bar'
    },
    { 
      id: 'distribucion2', 
      name: 'Tanque Centro', 
      x: 240, 
      y: 400, 
      color: '#8b5cf6', 
      elevation: '2,750 m',
      flow: '7.3 m³/s', 
      details: 'Distribución centro histórico',
      temperature: '17°C',
      type: 'distribucion',
      pressure: '55 bar'
    }
  ];

  const handlePointClick = (pointId: string) => {
    setSelectedPoint(selectedPoint === pointId ? null : pointId);
  };

  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(3, mapScale + delta));
    setMapScale(newScale);
  };

  const resetView = () => {
    setMapScale(1);
    setMapPosition({ x: 0, y: 0 });
  };

  const selectedPointData = hydricPoints.find(p => p.id === selectedPoint);

  return (
    <div className={`bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 rounded-2xl overflow-hidden relative border border-slate-600/50 shadow-2xl ${className}`}>
      
      {/* Controles del mapa */}
      <div className="absolute top-4 right-4 z-20 space-y-2">
        <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg p-3 border border-slate-600/50 shadow-lg">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-white text-xs px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {showInfo ? '🔍 Ocultar Info' : '🔍 Mostrar Info'}
            </button>
            <div className="flex gap-1">
              <button
                onClick={() => handleZoom(0.2)}
                className="text-white text-xs px-2 py-1 bg-green-600 rounded hover:bg-green-700 transition-colors"
                title="Acercar"
              >
                +
              </button>
              <button
                onClick={() => handleZoom(-0.2)}
                className="text-white text-xs px-2 py-1 bg-red-600 rounded hover:bg-red-700 transition-colors"
                title="Alejar"
              >
                -
              </button>
              <button
                onClick={resetView}
                className="text-white text-xs px-2 py-1 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
                title="Resetear vista"
              >
                ⌂
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Título del mapa */}
      <div className="absolute top-4 left-4 z-20 bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 border border-slate-600/50 shadow-lg">
        <h4 className="text-white font-bold text-base flex items-center gap-2">
          🗺️ Mapa Topográfico Ecuador
        </h4>
        <p className="text-slate-300 text-sm mt-1">Sistema Hídrico Papallacta → Quito</p>
        <div className="flex items-center gap-4 mt-2 text-xs">
          <span className="text-slate-400">Escala: 1:{Math.round(50000 / mapScale)}</span>
          <span className="text-slate-400">Proyección: UTM 17S</span>
        </div>
      </div>

      {/* Mapa con relieve topográfico */}
      <div 
        ref={mapRef}
        className="relative h-full overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ transform: `scale(${mapScale}) translate(${mapPosition.x}px, ${mapPosition.y}px)` }}
      >
        
        {/* SVG del mapa con relieve */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid meet">
          
          {/* Definiciones de gradientes para el relieve */}
          <defs>
            {/* Gradiente para montañas altas (Cordillera Oriental) */}
            <radialGradient id="mountainHigh" cx="50%" cy="30%">
              <stop offset="0%" stopColor="#8B7355" />
              <stop offset="40%" stopColor="#6B5B47" />
              <stop offset="80%" stopColor="#4A4035" />
              <stop offset="100%" stopColor="#2D2B28" />
            </radialGradient>
            
            {/* Gradiente para montañas medias */}
            <radialGradient id="mountainMid" cx="50%" cy="40%">
              <stop offset="0%" stopColor="#9B8B6F" />
              <stop offset="50%" stopColor="#7A6B55" />
              <stop offset="100%" stopColor="#5A4B3F" />
            </radialGradient>
            
            {/* Gradiente para valles */}
            <radialGradient id="valley" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#4B7C59" />
              <stop offset="60%" stopColor="#3A5F47" />
              <stop offset="100%" stopColor="#2A4035" />
            </radialGradient>
            
            {/* Gradiente para agua */}
            <radialGradient id="water" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </radialGradient>
            
            {/* Filtros para sombras y relieve */}
            <filter id="mountainShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="8"/>
              <feOffset dx="4" dy="6" result="offset"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="pipelineShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="2" dy="3" result="offset"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Fondo topográfico base */}
          <rect width="600" height="500" fill="url(#valley)" />
          
          {/* Cordillera Oriental (Papallacta) */}
          <ellipse cx="450" cy="200" rx="80" ry="120" fill="url(#mountainHigh)" filter="url(#mountainShadow)" opacity="0.9" />
          <ellipse cx="430" cy="180" rx="40" ry="60" fill="#A0957F" opacity="0.7" />
          <ellipse cx="470" cy="220" rx="35" ry="50" fill="#8B7355" opacity="0.8" />
          
          {/* Montañas intermedias */}
          <ellipse cx="350" cy="280" rx="60" ry="80" fill="url(#mountainMid)" filter="url(#mountainShadow)" opacity="0.8" />
          <ellipse cx="320" cy="320" rx="45" ry="60" fill="url(#mountainMid)" filter="url(#mountainShadow)" opacity="0.7" />
          <ellipse cx="280" cy="360" rx="50" ry="70" fill="url(#mountainMid)" filter="url(#mountainShadow)" opacity="0.6" />
          
          {/* Valle de Quito */}
          <ellipse cx="240" cy="400" rx="80" ry="60" fill="url(#valley)" opacity="0.9" />
          
          {/* Ríos y quebradas */}
          <path
            d="M 440 260 Q 400 280 360 300 Q 320 320 280 340 Q 250 360 220 380"
            stroke="url(#water)"
            strokeWidth="6"
            fill="none"
            opacity="0.7"
            filter="url(#glow)"
          />
          
          {/* Pequeñas quebradas */}
          <path d="M 460 240 Q 440 250 420 260" stroke="url(#water)" strokeWidth="3" fill="none" opacity="0.5" />
          <path d="M 400 270 Q 380 280 360 290" stroke="url(#water)" strokeWidth="2" fill="none" opacity="0.4" />
          <path d="M 330 310 Q 310 320 290 330" stroke="url(#water)" strokeWidth="2" fill="none" opacity="0.4" />
          
          {/* Ruta principal del sistema hídrico con efecto de tubería 3D */}
          <path
            d="M 420 282 L 380 302 L 340 322 L 300 342 L 280 362 L 250 382 L 240 402"
            stroke="#004D40"
            strokeWidth="14"
            fill="none"
            opacity="0.4"
            filter="url(#pipelineShadow)"
          />
          
          <path
            d="M 420 280 L 380 300 L 340 320 L 300 340 L 280 360 L 250 380 L 240 400"
            stroke="#00D4AA"
            strokeWidth="10"
            strokeDasharray="20,10"
            fill="none"
            opacity="0.9"
            filter="url(#glow)"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-30"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Tubería secundaria */}
          <path
            d="M 250 380 L 220 390 L 200 400"
            stroke="#00BFA5"
            strokeWidth="6"
            strokeDasharray="10,5"
            fill="none"
            opacity="0.7"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-15"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Curvas de nivel para mayor realismo */}
          {[...Array(8)].map((_, i) => (
            <g key={i} opacity={0.15}>
              <ellipse 
                cx="450" 
                cy="200" 
                rx={40 + i * 15} 
                ry={60 + i * 20} 
                fill="none" 
                stroke="#8B7355" 
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            </g>
          ))}
          
          {/* Curvas de nivel para montañas intermedias */}
          {[...Array(5)].map((_, i) => (
            <g key={`mid-${i}`} opacity={0.1}>
              <ellipse 
                cx="350" 
                cy="280" 
                rx={30 + i * 12} 
                ry={40 + i * 16} 
                fill="none" 
                stroke="#7A6B55" 
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            </g>
          ))}
          
          {/* Puntos de infraestructura con efectos 3D mejorados */}
          {hydricPoints.map((point) => (
            <g key={point.id}>
              {/* Sombra del punto */}
              <circle
                cx={point.x + 4}
                cy={point.y + 4}
                r={selectedPoint === point.id ? 20 : 14}
                fill="rgba(0,0,0,0.5)"
                className="transition-all duration-300"
              />
              
              {/* Anillo de presión para bombeo */}
              {point.type === 'bombeo' && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="20"
                  fill="none"
                  stroke={point.color}
                  strokeWidth="2"
                  strokeDasharray="3,3"
                  opacity="0.6"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values={`0 ${point.x} ${point.y};360 ${point.x} ${point.y}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* Punto principal con gradiente 3D */}
              <circle
                cx={point.x}
                cy={point.y}
                r={selectedPoint === point.id ? 18 : 12}
                fill={`url(#gradient-${point.id})`}
                stroke="#ffffff"
                strokeWidth="3"
                className="cursor-pointer transition-all duration-300 hover:stroke-yellow-300"
                onClick={() => handlePointClick(point.id)}
                filter="url(#glow)"
                style={{
                  filter: selectedPoint === point.id ? 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))' : 'none'
                }}
              >
                <animate
                  attributeName="r"
                  values={`${selectedPoint === point.id ? 18 : 12};${selectedPoint === point.id ? 20 : 14};${selectedPoint === point.id ? 18 : 12}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              
              {/* Gradientes personalizados para cada punto */}
              <defs>
                <radialGradient id={`gradient-${point.id}`} cx="30%" cy="30%">
                  <stop offset="0%" stopColor={point.color} stopOpacity="1" />
                  <stop offset="70%" stopColor={point.color} stopOpacity="0.8" />
                  <stop offset="100%" stopColor={point.color} stopOpacity="0.6" />
                </radialGradient>
              </defs>
              
              {/* Anillo exterior para puntos seleccionados */}
              {selectedPoint === point.id && (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="28"
                  fill="none"
                  stroke={point.color}
                  strokeWidth="2"
                  strokeDasharray="8,4"
                  opacity="0.8"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values={`0 ${point.x} ${point.y};360 ${point.x} ${point.y}`}
                    dur="5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              
              {/* Etiqueta del punto con sombra */}
              <text
                x={point.x + 25}
                y={point.y - 18}
                fill="white"
                fontSize={selectedPoint === point.id ? "14" : "12"}
                fontWeight="bold"
                className="cursor-pointer"
                onClick={() => handlePointClick(point.id)}
                filter="url(#textShadow)"
              >
                {point.name}
              </text>
              
              {/* Información técnica */}
              <text
                x={point.x + 25}
                y={point.y - 5}
                fill="#60a5fa"
                fontSize="10"
                className="cursor-pointer"
                onClick={() => handlePointClick(point.id)}
              >
                {point.elevation} • {point.flow}
              </text>
              
              {/* Icono según el tipo con animación */}
              <text
                x={point.x - 6}
                y={point.y + 6}
                fill="white"
                fontSize="16"
                className="cursor-pointer"
                onClick={() => handlePointClick(point.id)}
              >
                {point.type === 'captacion' ? '💧' : 
                 point.type === 'bombeo' ? '⚡' :
                 point.type === 'reservorio' ? '🏗️' :
                 point.type === 'tratamiento' ? '🏭' : '🏙️'}
              </text>
            </g>
          ))}
          
          {/* Sombra para texto */}
          <defs>
            <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="1" dy="1" result="offset"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Indicador de norte con brújula */}
          <g transform="translate(550, 50)">
            <circle cx="0" cy="0" r="30" fill="rgba(0,0,0,0.8)" stroke="white" strokeWidth="2" />
            <polygon points="0,-20 -10,15 10,15" fill="#ef4444" />
            <polygon points="0,20 -6,-10 6,-10" fill="white" />
            <text x="0" y="45" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">N</text>
            <circle cx="0" cy="0" r="35" fill="none" stroke="white" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
          </g>
          
          {/* Escala gráfica */}
          <g transform="translate(50, 450)">
            <rect x="0" y="0" width="100" height="20" fill="rgba(0,0,0,0.7)" rx="3" />
            <line x1="10" y1="15" x2="90" y2="15" stroke="white" strokeWidth="2" />
            <line x1="10" y1="12" x2="10" y2="18" stroke="white" strokeWidth="2" />
            <line x1="90" y1="12" x2="90" y2="18" stroke="white" strokeWidth="2" />
            <text x="50" y="10" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">10 km</text>
          </g>
          
        </svg>

        {/* Información del punto seleccionado */}
        {selectedPointData && (
          <div className="absolute bottom-20 left-4 bg-slate-800/95 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50 max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: selectedPointData.color }}
              ></div>
              <h5 className="text-white font-bold text-lg">{selectedPointData.name}</h5>
            </div>
            <p className="text-slate-300 text-sm mb-4">{selectedPointData.details}</p>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Elevación</div>
                <div className="text-white font-bold">{selectedPointData.elevation}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Caudal</div>
                <div className="text-blue-300 font-bold">{selectedPointData.flow}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Temperatura</div>
                <div className="text-green-300 font-bold">{selectedPointData.temperature}</div>
              </div>
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <div className="text-slate-400 text-xs">Presión</div>
                <div className="text-yellow-300 font-bold">{selectedPointData.pressure}</div>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedPoint(null)}
              className="mt-4 w-full text-xs text-slate-400 hover:text-white transition-colors bg-slate-700/50 py-2 rounded-lg"
            >
              ✕ Cerrar información
            </button>
          </div>
        )}

        {/* Panel de información general */}
        {showInfo && !selectedPointData && (
          <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50">
            <h5 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              📊 Sistema en Tiempo Real
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Caudal Total:</span>
                <span className="text-blue-300 font-bold">18.2 m³/s</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Presión Media:</span>
                <span className="text-green-300 font-bold">85 bar</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estado:</span>
                <span className="text-green-300 font-bold">● Operativo</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Población:</span>
                <span className="text-purple-300 font-bold">2.8M hab</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Eficiencia:</span>
                <span className="text-cyan-300 font-bold">96.8%</span>
              </div>
            </div>
          </div>
        )}

        {/* Leyenda de colores */}
        <div className="absolute top-20 right-4 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50">
          <h5 className="text-white font-bold text-sm mb-3">🎨 Leyenda Topográfica</h5>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-amber-700 to-amber-900 rounded"></div>
              <span className="text-slate-300">Montañas Altas (&gt;3000m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-amber-600 to-amber-800 rounded"></div>
              <span className="text-slate-300">Montañas Medias (2000-3000m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-700 to-green-900 rounded"></div>
              <span className="text-slate-300">Valles y Llanuras (&lt;2000m)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
              <span className="text-slate-300">Cuerpos de Agua</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-teal-400 to-teal-600 rounded"></div>
              <span className="text-slate-300">Sistema Hídrico</span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-600/30 text-xs text-slate-400">
            Click en los puntos para información detallada
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopographicMap;

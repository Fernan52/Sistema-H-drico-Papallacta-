import React, { useState } from 'react';

interface SimpleMapProps {
  className?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ className = "" }) => {
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const points = [
    { id: 'papallacta', name: 'Papallacta', x: 80, y: 120, color: '#0ea5e9', flow: '18 m³/s', details: 'Captación principal - 3,220 msnm' },
    { id: 'bombeo', name: 'E. Bombeo', x: 150, y: 100, color: '#f59e0b', flow: '16 m³/s', details: 'Potencia: 2.5 MW - 120 bar' },
    { id: 'reservorio', name: 'Reservorio', x: 220, y: 140, color: '#06b6d4', flow: '15 m³/s', details: 'Capacidad: 45,000 m³' },
    { id: 'tratamiento', name: 'Tratamiento', x: 280, y: 160, color: '#10b981', flow: '12 m³/s', details: 'Filtración multicapa - Calidad A+' },
    { id: 'quito', name: 'Quito', x: 340, y: 180, color: '#8b5cf6', flow: '10 m³/s', details: 'Distribución - 2.8M habitantes' },
  ];

  const handlePointClick = (pointId: string) => {
    setSelectedPoint(selectedPoint === pointId ? null : pointId);
  };

  const selectedPointData = points.find(p => p.id === selectedPoint);

  return (
    <div className={`bg-slate-700 rounded-lg overflow-hidden relative ${className}`}>
      {/* Controles del mapa */}
      <div className="absolute top-4 right-4 z-10 bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 border border-slate-600">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-white text-xs px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          {showInfo ? 'Ocultar Info' : 'Mostrar Info'}
        </button>
      </div>

      {/* Mapa simulado con CSS */}
      <div className="relative h-full bg-gradient-to-br from-blue-900 via-slate-800 to-green-900 cursor-pointer">
        
        {/* Título del mapa */}
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600">
          <h4 className="text-white font-bold text-sm">🗺️ Ecuador - Sistema Hídrico</h4>
          <p className="text-slate-300 text-xs">Papallacta → Quito (45 km)</p>
        </div>

        {/* Simulación de la ruta */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
          {/* Ruta principal animada */}
          <path
            d="M 80 120 Q 150 100 220 140 Q 280 160 340 180"
            stroke="#0ea5e9"
            strokeWidth="4"
            strokeDasharray="10,5"
            fill="none"
            opacity="0.8"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-15"
              dur="2s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Puntos de infraestructura interactivos */}
          {points.map((point) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={selectedPoint === point.id ? 12 : 8}
                fill={point.color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200 hover:r-10"
                onClick={() => handlePointClick(point.id)}
                style={{
                  filter: selectedPoint === point.id ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.8))' : 'none'
                }}
              >
                <animate
                  attributeName="r"
                  values="8;10;8"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              <text
                x={point.x + 15}
                y={point.y - 10}
                fill="white"
                fontSize={selectedPoint === point.id ? "11" : "9"}
                fontWeight="bold"
                className="cursor-pointer"
                onClick={() => handlePointClick(point.id)}
              >
                {point.name}
              </text>
              <text
                x={point.x + 15}
                y={point.y + 5}
                fill="#60a5fa"
                fontSize="8"
                className="cursor-pointer"
                onClick={() => handlePointClick(point.id)}
              >
                {point.flow}
              </text>
            </g>
          ))}
          
          {/* Área de influencia de Papallacta animada */}
          <circle
            cx="80"
            cy="120"
            r="25"
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeDasharray="3,3"
          >
            <animate
              attributeName="stroke-dashoffset"
              values="0;-6"
              dur="3s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>

        {/* Información del punto seleccionado */}
        {selectedPointData && (
          <div className="absolute bottom-20 left-4 bg-slate-800/95 backdrop-blur-sm rounded-lg p-4 border border-slate-600 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedPointData.color }}
              ></div>
              <h5 className="text-white font-bold text-sm">{selectedPointData.name}</h5>
            </div>
            <p className="text-slate-300 text-xs mb-2">{selectedPointData.details}</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Caudal:</span>
              <span className="text-blue-300 font-bold">{selectedPointData.flow}</span>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              className="mt-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              ✕ Cerrar
            </button>
          </div>
        )}

        {/* Información general del sistema */}
        {showInfo && (
          <div className="absolute bottom-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600">
            <h5 className="text-white font-bold text-xs mb-2">📊 Sistema en Tiempo Real</h5>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Caudal Total:</span>
                <span className="text-blue-300">18 m³/s</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Presión Media:</span>
                <span className="text-green-300">120 bar</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Estado:</span>
                <span className="text-green-300">● Operativo</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Población:</span>
                <span className="text-purple-300">2.8M hab</span>
              </div>
            </div>
          </div>
        )}

        {/* Leyenda interactiva */}
        <div className="absolute top-16 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border border-slate-600">
          <h5 className="text-white font-bold text-xs mb-2">Infraestructura</h5>
          <div className="space-y-1 text-xs">
            {points.map((point) => (
              <div
                key={point.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-700/50 p-1 rounded transition-colors"
                onClick={() => handlePointClick(point.id)}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: point.color }}
                ></div>
                <span className={`text-slate-300 ${selectedPoint === point.id ? 'text-white font-bold' : ''}`}>
                  {point.name}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-600 text-xs text-slate-400">
            Click en los puntos para más info
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;

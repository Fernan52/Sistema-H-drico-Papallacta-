import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip } from 'react-leaflet';
import { LatLngExpression, DivIcon } from 'leaflet';


// Fix para iconos de Leaflet en bundlers
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Coordenadas del sistema hídrico
const ECUADOR_CENTER: LatLngExpression = [-0.3000, -78.3000];
const PAPALLACTA_CENTER: LatLngExpression = [-0.3667, -78.1500];

// Ruta del sistema de conducción
const WATER_SYSTEM_MAIN_ROUTE: LatLngExpression[] = [
  [-0.3667, -78.1500], // Papallacta - Captación principal
  [-0.3650, -78.1520], // Salida de captación
  [-0.3600, -78.1580], // Primera curva
  [-0.3550, -78.1650], // Estación de bombeo 1
  [-0.3480, -78.1720], // Túnel montaña 1
  [-0.3400, -78.1800], // Salida túnel 1
  [-0.3320, -78.1880], // Reservorio intermedio
  [-0.3200, -78.2000], // Estación de bombeo 2
  [-0.3100, -78.2150], // Cruce valle
  [-0.3000, -78.2300], // Túnel montaña 2
  [-0.2900, -78.2450], // Salida túnel 2
  [-0.2800, -78.2600], // Planta tratamiento principal
  [-0.2700, -78.2800], // Distribución primaria
  [-0.2600, -78.3000], // Red secundaria
  [-0.2500, -78.3200], // Distribución urbana
  [-0.2400, -78.3400], // Centro Quito Norte
  [-0.2300, -78.3600], // Centro Quito
  [-0.2200, -78.3800], // Quito Sur
];

// Infraestructura del sistema con información detallada y única
const WATER_INFRASTRUCTURE = [
  {
    position: [-0.3667, -78.1500] as LatLngExpression,
    name: "Central de Captación Papallacta",
    type: "source",
    description: "Principal fuente de captación del sistema hídrico Quito",
    details: "Capacidad máxima: 18 m³/s | Altitud: 3,220 msnm | Operativo 24/7 | Sistema de filtros naturales",
    flow: "18 m³/s",
    uniqueInfo: "Esta captación aprovecha las aguas cristalinas de los páramos andinos. Cuenta con sistemas de monitoreo en tiempo real de calidad del agua y caudales de entrada."
  },
  {
    position: [-0.3550, -78.1650] as LatLngExpression,
    name: "Estación de Bombeo Principal",
    type: "pump",
    description: "Primera estación de impulso hacia Quito",
    details: "Potencia instalada: 2.5 MW | Caudal nominal: 16 m³/s | Presión de salida: 120 bar | 4 bombas centrífugas",
    flow: "16 m³/s",
    uniqueInfo: "Equipada con bombas de alta eficiencia energética y sistema de arranque suave para evitar golpes de ariete. Respaldo con generadores diesel."
  },
  {
    position: [-0.3320, -78.1880] as LatLngExpression,
    name: "Reservorio La Mica",
    type: "reservoir",
    description: "Almacenamiento estratégico y regulación de presiones",
    details: "Volumen total: 45,000 m³ | Nivel actual: 85% | Tiempo de retención: 6 horas | Material: Concreto armado",
    flow: "15 m³/s",
    uniqueInfo: "Diseñado para regular los picos de demanda diaria. Incluye sistema de by-pass para mantenimiento sin interrumpir el servicio y sensores de nivel ultrasónicos."
  },
  {
    position: [-0.2800, -78.2600] as LatLngExpression,
    name: "Planta de Tratamiento El Placer",
    type: "treatment",
    description: "Potabilización avanzada y control de calidad",
    details: "Capacidad de proceso: 12 m³/s | Tecnología: Filtración multicapa + UV | Calidad: AAA | Laboratorio in-situ",
    flow: "12 m³/s",
    uniqueInfo: "Utiliza tecnología de punta con filtros de arena, carbón activado y desinfección UV. Laboratorio automatizado realiza 200+ análisis diarios."
  },
  {
    position: [-0.2300, -78.3600] as LatLngExpression,
    name: "Centro de Distribución Metropolitano",
    type: "distribution",
    description: "Hub principal de distribución para área metropolitana",
    details: "Población servida: 2.8M habitantes | Presión de red: 35-55 PSI | Extensión: 1,450 km | Sectores: 145",
    flow: "10 m³/s",
    uniqueInfo: "Centro neurálgico que coordina la distribución a través de 145 sectores hidráulicos. Sistema SCADA monitorea presiones y detecta fugas en tiempo real."
  }
];

// Iconos personalizados mejorados
const createCustomIcon = (type: string): DivIcon => {
  const configs = {
    source: { color: '#0ea5e9', size: 25, emoji: '🏔️' },
    pump: { color: '#f59e0b', size: 22, emoji: '⚡' },
    reservoir: { color: '#06b6d4', size: 24, emoji: '🌊' },
    treatment: { color: '#10b981', size: 23, emoji: '🧪' },
    distribution: { color: '#8b5cf6', size: 20, emoji: '🏘️' }
  };
  
  const config = configs[type as keyof typeof configs] || { color: '#6b7280', size: 20, emoji: '💧' };
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, ${config.color}, ${config.color}dd);
        width: ${config.size}px;
        height: ${config.size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        position: relative;
      " 
      onmouseover="this.style.transform='scale(1.2)'; this.style.zIndex='1000';"
      onmouseout="this.style.transform='scale(1)'; this.style.zIndex='auto';"
      >${config.emoji}</div>
    `,
    iconSize: [config.size + 6, config.size + 6],
    iconAnchor: [(config.size + 6) / 2, (config.size + 6) / 2]
  });
};

interface EcuadorMapProps {
  className?: string;
}

const EcuadorMap: React.FC<EcuadorMapProps> = ({ className = "" }) => {
  const [showRoutes, setShowRoutes] = useState(true);

  // Inyección de estilos CSS para mejorar la interacción
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-marker {
        cursor: pointer !important;
      }
      .custom-marker:hover {
        z-index: 1000 !important;
      }
      .leaflet-popup {
        z-index: 1001 !important;
      }
      .leaflet-popup-content-wrapper {
        border-radius: 12px !important;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
        background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
        color: white !important;
        border: 2px solid rgba(255, 255, 255, 0.2) !important;
      }
      .leaflet-popup-tip {
        background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
        border: 2px solid rgba(255, 255, 255, 0.2) !important;
      }
      .leaflet-popup-close-button {
        color: white !important;
        font-size: 18px !important;
        padding: 4px 8px !important;
      }
      .leaflet-popup-close-button:hover {
        background-color: rgba(255, 255, 255, 0.2) !important;
        border-radius: 4px !important;
      }
    `;
    
    if (!document.head.querySelector('#ecuador-map-styles')) {
      style.id = 'ecuador-map-styles';
      document.head.appendChild(style);
    }
    
    return () => {
      const existingStyle = document.head.querySelector('#ecuador-map-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  return (
    <div className="relative">
      {/* Controles del mapa con leyenda específica */}
      <div className="absolute top-4 right-4 z-[1000] bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 border border-slate-600">
        <h3 className="text-white font-bold text-sm mb-3">🌊 Sistema Hídrico Papallacta</h3>
        <div className="space-y-2 text-sm mb-4">
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input 
              type="checkbox" 
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              className="w-4 h-4"
            />
            Mostrar Tuberías Principales
          </label>
        </div>
        
        {/* Leyenda detallada y específica */}
        <div className="border-t border-slate-600 pt-3">
          <h4 className="text-white font-semibold text-xs mb-2">Infraestructura del Sistema</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏔️</span>
              <div className="text-blue-300">
                <div className="font-medium">Captación Papallacta</div>
                <div className="text-blue-400">3,220 msnm • 18 m³/s • Agua natural</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div className="text-yellow-300">
                <div className="font-medium">Estación de Bombeo</div>
                <div className="text-yellow-400">2.5 MW • 120 bar • 4 bombas</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🌊</span>
              <div className="text-cyan-300">
                <div className="font-medium">Reservorio La Mica</div>
                <div className="text-cyan-400">45,000 m³ • Regulación • 6h retención</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧪</span>
              <div className="text-green-300">
                <div className="font-medium">Planta El Placer</div>
                <div className="text-green-400">Filtros + UV • 200 análisis/día</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏘️</span>
              <div className="text-purple-300">
                <div className="font-medium">Red Metropolitana</div>
                <div className="text-purple-400">2.8M hab • 1,450 km • SCADA</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="border-t border-slate-600 pt-3 mt-3">
          <div className="text-xs text-slate-400">
            <div className="flex justify-between mb-1">
              <span>Capacidad Total:</span>
              <span className="text-blue-300">18 m³/s</span>
            </div>
            <div className="flex justify-between">
              <span>Cobertura:</span>
              <span className="text-green-300">65 km</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`custom-map-container ${className}`}>
        <MapContainer
          center={ECUADOR_CENTER}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          className="rounded-xl"
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          zoomControl={true}
        >
          {/* Capa base del mapa */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />
          
          {/* Área de influencia de Papallacta */}
          <Circle
            center={PAPALLACTA_CENTER}
            radius={8000}
            pathOptions={{
              color: '#06b6d4',
              fillColor: '#06b6d4',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          />
          
          <Circle
            center={PAPALLACTA_CENTER}
            radius={3000}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.15,
              weight: 3
            }}
          />
          
          {/* Ruta principal del sistema */}
          {showRoutes && (
            <Polyline
              positions={WATER_SYSTEM_MAIN_ROUTE}
              pathOptions={{
                color: '#0ea5e9',
                weight: 6,
                opacity: 0.9,
                dashArray: '15, 5'
              }}
            />
          )}
          
          {/* Marcadores de infraestructura */}
          {WATER_INFRASTRUCTURE.map((point, index) => (
            <Marker
              key={index}
              position={point.position}
              icon={createCustomIcon(point.type)}
              eventHandlers={{
                click: (e) => {
                  // Solo abrir el popup, sin auto-centrado
                  e.target.openPopup();
                },
                mouseover: (e) => {
                  e.target.openTooltip();
                },
                mouseout: (e) => {
                  e.target.closeTooltip();
                }
              }}
            >
              <Popup 
                className="custom-popup" 
                maxWidth={350}
                closeOnClick={false}
                autoPan={true}
                keepInView={true}
              >
                <div className="p-4">
                  <h3 className="font-bold text-lg text-white mb-3">{point.name}</h3>
                  <p className="text-sm text-blue-100 mb-3">{point.description}</p>
                  
                  {/* Información técnica específica */}
                  <div className="bg-black/30 p-3 rounded text-xs text-blue-50 mb-3">
                    <strong>Especificaciones Técnicas:</strong><br/>
                    {point.details}
                  </div>
                  
                  {/* Información única para cada punto */}
                  <div className="bg-blue-900/40 p-3 rounded text-xs text-blue-100 mb-3">
                    <strong>Características Especiales:</strong><br/>
                    {point.uniqueInfo}
                  </div>
                  
                  <div className="flex justify-between text-xs text-blue-200 mb-2">
                    <span>Lat: {(point.position as number[])[0].toFixed(4)}</span>
                    <span>Lng: {(point.position as number[])[1].toFixed(4)}</span>
                  </div>
                  
                  {point.flow && (
                    <div className="text-center">
                      <span className="bg-white text-blue-900 px-3 py-1 rounded text-sm font-bold">
                        Caudal Operativo: {point.flow}
                      </span>
                    </div>
                  )}
                </div>
              </Popup>
              
              {/* Tooltip único para cada tipo */}
              <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                <div className="text-center">
                  <strong>{point.name}</strong><br />
                  <span className="text-xs">
                    {point.type === 'source' ? '💧 Captación Natural' :
                     point.type === 'pump' ? '⚡ Sistema de Bombeo' :
                     point.type === 'reservoir' ? '🌊 Almacenamiento' :
                     point.type === 'treatment' ? '🧪 Potabilización' :
                     '🏘️ Red de Distribución'} • {point.flow}
                  </span>
                </div>
              </Tooltip>
            </Marker>
          ))}
          
          {/* Marcador especial para Papallacta */}
          <Marker 
            position={PAPALLACTA_CENTER}
            eventHandlers={{
              click: (e) => {
                // Solo abrir popup, sin auto-centrado
                e.target.openPopup();
              }
            }}
          >
            <Popup 
              className="custom-popup" 
              maxWidth={380}
              closeOnClick={false}
              autoPan={true}
              keepInView={true}
            >
              <div className="p-4">
                <h2 className="font-bold text-xl text-white mb-3">🏔️ Región de Papallacta</h2>
                <p className="text-sm text-blue-100 mb-3">
                  Zona estratégica de captación hídrica ubicada en los páramos del Antisana
                </p>
                
                {/* Datos ambientales específicos */}
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-200 mb-3">
                  <div><strong>Altitud:</strong> 3,220 msnm</div>
                  <div><strong>Ecosistema:</strong> Páramo andino</div>
                  <div><strong>Temperatura:</strong> 8-18°C</div>
                  <div><strong>Humedad:</strong> 85-95%</div>
                  <div><strong>Precipitación:</strong> 1,200mm/año</div>
                  <div><strong>Población local:</strong> ~500 hab</div>
                </div>
                
                {/* Información del sistema hídrico */}
                <div className="bg-black/30 p-3 rounded text-xs text-blue-50 mb-3">
                  <strong>🌊 Sistema de Captación Principal:</strong><br/>
                  • Fuente: Vertientes naturales del Antisana<br/>
                  • Capacidad instalada: 18 m³/s<br/>
                  • Calidad del agua: Excepcional (pH 7.2)<br/>
                  • Turbiedad promedio: &lt;1 NTU<br/>
                  • Monitoreo: Sensores IoT 24/7
                </div>
                
                {/* Impacto del sistema */}
                <div className="bg-blue-900/40 p-3 rounded text-xs text-blue-100">
                  <strong>📊 Impacto del Sistema:</strong><br/>
                  • Abastece el 90% del DMQ (2.8M personas)<br/>
                  • Longitud total de conducción: 65 km<br/>
                  • Ahorro energético: Gravedad natural<br/>
                  • Área protegida: 15,000 hectáreas
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default EcuadorMap;

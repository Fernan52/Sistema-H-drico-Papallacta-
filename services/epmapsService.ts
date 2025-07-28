// Servicio para datos de EPMAPS (Empresa Pública Metropolitana de Agua Potable y Saneamiento)
export interface EpmapsData {
  waterFlow: {
    papallacta: number; // m³/s
    elPlacer: number;   // m³/s
    distribution: number; // m³/s
  };
  waterQuality: {
    ph: number;
    turbidity: number; // NTU
    chlorine: number;  // mg/L
    bacteria: string;  // "Ausente" | "Presente"
    grade: string;     // A+, A, B, C
  };
  systemPressure: {
    intake: number;    // bar
    treatment: number; // bar
    distribution: number; // bar
  };
  operational: {
    efficiency: number; // %
    coverage: number;   // %
    continuity: string; // "24/7", "Intermitente"
    activeStations: number;
    totalStations: number;
  };
  alerts: Array<{
    type: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
    location?: string;
  }>;
  lastUpdate: string;
}

// Configuración de endpoints EPMAPS
const EPMAPS_ENDPOINTS = {
  SCADA: 'https://scada.epmaps.gob.ec/api/v2',
  OPERATIONS: 'https://operaciones.epmaps.gob.ec/api/v1',
  QUALITY: 'https://calidad.epmaps.gob.ec/api/v1',
  PUBLIC_API: 'https://www.epmaps.gob.ec/api/public/v1'
};

// Función para obtener datos operativos de EPMAPS
export const getEpmapsOperationalData = async (): Promise<EpmapsData | null> => {
  try {
    // Endpoint principal del sistema SCADA de EPMAPS
    const response = await fetch(`${EPMAPS_ENDPOINTS.SCADA}/papallacta/current`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.EPMAPS_API_KEY}`, // Requiere autorización EPMAPS
        'X-System-ID': 'PAPALLACTA_MONITORING'
      }
    });

    if (!response.ok) {
      throw new Error(`Error EPMAPS SCADA: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      waterFlow: {
        papallacta: data.caudal_captacion || 18.2,
        elPlacer: data.caudal_planta || 17.8,
        distribution: data.caudal_distribucion || 17.5
      },
      waterQuality: {
        ph: data.calidad.ph || 7.2,
        turbidity: data.calidad.turbidez || 0.5,
        chlorine: data.calidad.cloro_residual || 0.8,
        bacteria: data.calidad.coliformes === 0 ? "Ausente" : "Presente",
        grade: data.calidad.clasificacion || "A+"
      },
      systemPressure: {
        intake: data.presion.captacion || 125,
        treatment: data.presion.planta || 120,
        distribution: data.presion.red || 45
      },
      operational: {
        efficiency: data.operacion.eficiencia || 96.8,
        coverage: data.operacion.cobertura || 98.5,
        continuity: data.operacion.continuidad || "24/7",
        activeStations: data.operacion.estaciones_activas || 5,
        totalStations: data.operacion.total_estaciones || 5
      },
      alerts: data.alertas || [],
      lastUpdate: data.timestamp || new Date().toISOString()
    };

  } catch (error) {
    console.error('Error obteniendo datos de EPMAPS:', error);
    return null;
  }
};

// Función para obtener datos públicos de EPMAPS (sin autenticación)
export const getEpmapsPublicData = async (): Promise<Partial<EpmapsData> | null> => {
  try {
    const response = await fetch(`${EPMAPS_ENDPOINTS.PUBLIC_API}/sistema-papallacta`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error EPMAPS API Pública: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      waterFlow: {
        papallacta: data.caudal_nominal || 18.2,
        elPlacer: data.caudal_tratado || 17.8,
        distribution: data.caudal_distribuido || 17.5
      },
      operational: {
        efficiency: data.eficiencia_sistema || 96.8,
        coverage: data.cobertura_poblacion || 98.5,
        continuity: data.continuidad_servicio || "24/7",
        activeStations: data.estaciones_operativas || 5,
        totalStations: data.total_estaciones || 5
      },
      lastUpdate: data.ultima_actualizacion || new Date().toISOString()
    };

  } catch (error) {
    console.error('Error obteniendo datos públicos de EPMAPS:', error);
    return null;
  }
};

// Función para obtener calidad del agua
export const getWaterQualityData = async () => {
  try {
    const response = await fetch(`${EPMAPS_ENDPOINTS.QUALITY}/papallacta/latest`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.EPMAPS_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error API Calidad: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error obteniendo calidad del agua:', error);
    return null;
  }
};

// Función principal que combina todas las fuentes EPMAPS
export const getCurrentEpmapsData = async (): Promise<EpmapsData> => {
  // Intentar datos operativos completos primero
  let operationalData = await getEpmapsOperationalData();
  
  // Si falla, intentar API pública
  if (!operationalData) {
    const publicData = await getEpmapsPublicData();
    if (publicData) {
      operationalData = {
        ...getSimulatedEpmapsData(),
        ...publicData
      };
    }
  }
  
  // Si todo falla, usar datos simulados realistas
  if (!operationalData) {
    console.warn('Usando datos EPMAPS simulados - APIs no disponibles');
    return getSimulatedEpmapsData();
  }
  
  return operationalData;
};

// Datos simulados realistas basados en información pública de EPMAPS
const getSimulatedEpmapsData = (): EpmapsData => {
  const now = new Date();
  const hour = now.getHours();
  
  // Variación realista del caudal según la hora (mayor consumo 6-8am y 6-9pm)
  const demandFactor = 1 + 0.15 * Math.sin((hour - 7) * Math.PI / 12);
  const baseCaudal = 18.2;
  
  return {
    waterFlow: {
      papallacta: Math.round((baseCaudal + (Math.random() - 0.5) * 0.8) * 100) / 100,
      elPlacer: Math.round((baseCaudal * 0.98 * demandFactor) * 100) / 100,
      distribution: Math.round((baseCaudal * 0.96 * demandFactor) * 100) / 100
    },
    waterQuality: {
      ph: Math.round((7.1 + Math.random() * 0.3) * 10) / 10,
      turbidity: Math.round((0.3 + Math.random() * 0.4) * 100) / 100,
      chlorine: Math.round((0.7 + Math.random() * 0.3) * 100) / 100,
      bacteria: "Ausente",
      grade: "A+"
    },
    systemPressure: {
      intake: Math.round((123 + Math.random() * 4) * 10) / 10,
      treatment: Math.round((118 + Math.random() * 4) * 10) / 10,
      distribution: Math.round((43 + Math.random() * 4) * 10) / 10
    },
    operational: {
      efficiency: Math.round((96.5 + Math.random() * 0.6) * 10) / 10,
      coverage: Math.round((98.3 + Math.random() * 0.4) * 10) / 10,
      continuity: "24/7",
      activeStations: 5,
      totalStations: 5
    },
    alerts: [
      {
        type: 'info',
        message: `Caudal actual: ${baseCaudal} m³/s - Operación normal`,
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        location: 'Captación Papallacta'
      },
      {
        type: 'warning',
        message: 'Mantenimiento programado estación de bombeo',
        timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
        location: 'Estación El Placer'
      }
    ],
    lastUpdate: now.toISOString()
  };
};

// Función para obtener historial de caudales
export const getFlowHistory = async (days: number = 30) => {
  try {
    const response = await fetch(`${EPMAPS_ENDPOINTS.SCADA}/papallacta/history?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${process.env.EPMAPS_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo historial: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error('Error obteniendo historial de caudales:', error);
    return null;
  }
};

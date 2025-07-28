/**
 * 🌐 SERVICIO DE DATOS INTEGRADOS - CENTRO DE CONTROL PAPALLACTA
 * 
 * Orquesta y combina datos de múltiples fuentes externas:
 * - Modelo ARIMA entrenado (predicciones precisas)
 * - APIs meteorológicas (INAMHI, OpenWeatherMap)
 * - Sistema EPMAPS (SCADA, operacional)
 * - APIs gubernamentales (SENAGUA, MAE, SNGRE, INEN)
 * 
 * Proporciona datos unificados, análisis de sistema y alertas inteligentes
 * para el Centro de Control del sistema hídrico Papallacta-Quito.
 */

import { getCurrentWeatherData, type WeatherData } from './weatherApiService';
import { getCurrentEpmapsData, type EpmapsData } from './epmapsService';
import { getCurrentGovernmentData, type GovernmentData } from './governmentDataService';
import arimaModelService from './arimaModelService';

// Función para obtener pronósticos del modelo ARIMA
export const getArimaForecasts = async () => {
  try {
    console.log('🔬 Obteniendo pronósticos del modelo ARIMA entrenado...');
    
    const [dailyForecasts, monthlyForecasts, yearlyForecasts] = await Promise.all([
      arimaModelService.getPredictionsForSystem('daily'),
      arimaModelService.getPredictionsForSystem('monthly'),
      arimaModelService.getPredictionsForSystem('yearly')
    ]);
    
    const modelStatus = arimaModelService.getModelStatus();
    
    return {
      daily: dailyForecasts,
      monthly: monthlyForecasts,
      yearly: yearlyForecasts,
      modelStatus
    };
  } catch (error) {
    console.error('❌ Error obteniendo pronósticos ARIMA:', error);
    throw error;
  }
};

export interface IntegratedSystemData {
  weather: WeatherData;
  operations: EpmapsData;
  government: GovernmentData;
  arimaForecasts?: {
    daily: any[];
    monthly: any[];
    yearly: any[];
    modelStatus: {
      loaded: boolean;
      lastUpdate: number;
      version: string;
    };
  };
  systemStatus: {
    overall: 'Óptimo' | 'Bueno' | 'Advertencia' | 'Crítico';
    score: number; // 0-100
    lastUpdate: string;
    dataSourcesOnline: {
      weather: boolean;
      epmaps: boolean;
      government: boolean;
      arimaModel: boolean;
    };
  };
  alerts: Array<{
    id: string;
    type: 'info' | 'warning' | 'critical';
    source: 'weather' | 'operations' | 'government' | 'system' | 'arima';
    title: string;
    message: string;
    timestamp: string;
    location?: string;
    action?: string;
  }>;
}

// Función principal para obtener todos los datos integrados
export const getIntegratedSystemData = async (): Promise<IntegratedSystemData> => {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Obteniendo datos de fuentes externas + modelo ARIMA...');
    
    // Obtener datos de todas las fuentes en paralelo, incluyendo ARIMA
    const [weatherResult, epmapsResult, governmentResult, arimaResult] = await Promise.allSettled([
      getCurrentWeatherData(),
      getCurrentEpmapsData(),
      getCurrentGovernmentData(),
      getArimaForecasts()
    ]);

    // Verificar qué fuentes están online
    const dataSourcesOnline = {
      weather: weatherResult.status === 'fulfilled',
      epmaps: epmapsResult.status === 'fulfilled',
      government: governmentResult.status === 'fulfilled',
      arimaModel: arimaResult.status === 'fulfilled'
    };

    // Extraer datos (usar fallbacks si es necesario)
    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value : getWeatherFallback();
    const operations = epmapsResult.status === 'fulfilled' ? epmapsResult.value : getEpmapsFallback();
    const government = governmentResult.status === 'fulfilled' ? governmentResult.value : getGovernmentFallback();
    const arimaForecasts = arimaResult.status === 'fulfilled' ? arimaResult.value : undefined;

    // Calcular estado general del sistema (incluyendo ARIMA)
    const systemStatus = calculateSystemStatus(weather, operations, government, dataSourcesOnline);
    
    // Generar alertas integradas (incluyendo alertas del modelo ARIMA)
    const alerts = generateIntegratedAlerts(weather, operations, government, arimaForecasts);

    const processingTime = Date.now() - startTime;
    console.log(`✅ Datos integrados obtenidos en ${processingTime}ms (incluyendo modelo ARIMA)`);

    return {
      weather,
      operations,
      government,
      arimaForecasts,
      systemStatus,
      alerts
    };

  } catch (error) {
    console.error('❌ Error obteniendo datos integrados:', error);
    
    // Retornar datos de fallback en caso de error
    return {
      weather: getWeatherFallback(),
      operations: getEpmapsFallback(),
      government: getGovernmentFallback(),
      systemStatus: {
        overall: 'Advertencia',
        score: 75,
        lastUpdate: new Date().toISOString(),
        dataSourcesOnline: {
          weather: false,
          epmaps: false,
          government: false,
          arimaModel: false
        }
      },
      alerts: [
        {
          id: 'system-offline',
          type: 'warning',
          source: 'system',
          title: 'Fuentes de Datos Limitadas',
          message: 'Usando datos simulados - Verificar conectividad con APIs externas',
          timestamp: new Date().toISOString(),
          action: 'Revisar configuración de red y claves API'
        }
      ]
    };
  }
};

// Función para calcular el estado general del sistema
const calculateSystemStatus = (
  weather: WeatherData, 
  operations: EpmapsData, 
  government: GovernmentData,
  dataSourcesOnline: { weather: boolean; epmaps: boolean; government: boolean; arimaModel: boolean }
): IntegratedSystemData['systemStatus'] => {
  
  let score = 100;
  let status: 'Óptimo' | 'Bueno' | 'Advertencia' | 'Crítico' = 'Óptimo';

  // Penalizar por fuentes offline
  const onlineSources = Object.values(dataSourcesOnline).filter(Boolean).length;
  score -= (3 - onlineSources) * 10;

  // Evaluar condiciones meteorológicas
  if (weather.precipitation > 20) score -= 15;
  if (weather.precipitation > 35) score -= 25;
  if (weather.temperature < 5 || weather.temperature > 25) score -= 10;

  // Evaluar operaciones
  if (operations.operational.efficiency < 95) score -= 10;
  if (operations.operational.efficiency < 90) score -= 20;
  if (operations.waterFlow.papallacta < 16) score -= 15;
  if (operations.operational.activeStations < operations.operational.totalStations) score -= 10;

  // Evaluar estado gubernamental
  if (government.emergencyStatus.level === 'Amarillo') score -= 10;
  if (government.emergencyStatus.level === 'Naranja') score -= 25;
  if (government.emergencyStatus.level === 'Rojo') score -= 50;

  // Determinar estado general
  if (score >= 95) status = 'Óptimo';
  else if (score >= 80) status = 'Bueno';
  else if (score >= 60) status = 'Advertencia';
  else status = 'Crítico';

  return {
    overall: status,
    score: Math.max(0, Math.min(100, score)),
    lastUpdate: new Date().toISOString(),
    dataSourcesOnline
  };
};

// Función para generar alertas integradas
const generateIntegratedAlerts = (
  weather: WeatherData, 
  operations: EpmapsData, 
  government: GovernmentData,
  arimaForecasts?: { daily: any[]; monthly: any[]; yearly: any[]; modelStatus: any }
): IntegratedSystemData['alerts'] => {
  
  const alerts: IntegratedSystemData['alerts'] = [];
  const now = new Date().toISOString();

  // Alertas basadas en el modelo ARIMA
  if (arimaForecasts && arimaForecasts.daily.length > 0) {
    const todayForecast = arimaForecasts.daily[0];
    
    // Alertas por precipitación predicha
    if (todayForecast.precipitation > 40) {
      alerts.push({
        id: 'arima-precipitation-critical',
        type: 'critical',
        source: 'arima',
        title: 'Pronóstico ARIMA: Lluvia Intensa',
        message: `Modelo ARIMA predice precipitación crítica: ${todayForecast.precipitation.toFixed(1)} mm/h (confianza: ${(todayForecast.confidence * 100).toFixed(0)}%)`,
        timestamp: now,
        location: 'Papallacta',
        action: 'Preparar sistema para alta captación'
      });
    }
    
    // Alertas por caudal predicho
    if (todayForecast.flowRate < 120) {
      alerts.push({
        id: 'arima-flow-low',
        type: 'warning',
        source: 'arima',
        title: 'Pronóstico ARIMA: Caudal Bajo',
        message: `Modelo predice reducción de caudal: ${todayForecast.flowRate.toFixed(1)} L/s`,
        timestamp: now,
        location: 'Sistema Papallacta',
        action: 'Optimizar distribución de agua'
      });
    }
    
    // Alerta de calidad del agua
    if (todayForecast.waterQuality < 80) {
      alerts.push({
        id: 'arima-quality-warning',
        type: 'warning',
        source: 'arima',
        title: 'Pronóstico ARIMA: Calidad Comprometida',
        message: `Modelo predice reducción en calidad del agua: ${todayForecast.waterQuality.toFixed(1)}/100`,
        timestamp: now,
        action: 'Intensificar monitoreo de calidad'
      });
    }
  }

  // Alertas meteorológicas
  if (weather.precipitation > 35) {
    alerts.push({
      id: 'weather-critical',
      type: 'critical',
      source: 'weather',
      title: 'Precipitación Crítica',
      message: `Lluvia intensa detectada: ${weather.precipitation} mm/h`,
      timestamp: now,
      location: 'Papallacta',
      action: 'Activar protocolo de lluvias intensas'
    });
  } else if (weather.precipitation > 20) {
    alerts.push({
      id: 'weather-warning',
      type: 'warning',
      source: 'weather',
      title: 'Precipitación Elevada',
      message: `Lluvia moderada: ${weather.precipitation} mm/h`,
      timestamp: now,
      location: 'Papallacta'
    });
  }

  // Alertas operacionales
  if (operations.operational.efficiency < 90) {
    alerts.push({
      id: 'efficiency-low',
      type: 'warning',
      source: 'operations',
      title: 'Eficiencia Reducida',
      message: `Eficiencia del sistema: ${operations.operational.efficiency}%`,
      timestamp: now,
      action: 'Revisar equipos de tratamiento'
    });
  }

  if (operations.waterFlow.papallacta < 16) {
    alerts.push({
      id: 'flow-low',
      type: 'warning',
      source: 'operations',
      title: 'Caudal Bajo',
      message: `Caudal captación: ${operations.waterFlow.papallacta} m³/s`,
      timestamp: now,
      location: 'Captación Papallacta'
    });
  }

  // Alertas gubernamentales
  if (government.emergencyStatus.level !== 'Verde') {
    alerts.push({
      id: 'emergency-level',
      type: government.emergencyStatus.level === 'Rojo' ? 'critical' : 'warning',
      source: 'government',
      title: `Nivel de Emergencia: ${government.emergencyStatus.level}`,
      message: government.emergencyStatus.description,
      timestamp: now
    });
  }

  // Agregar alertas de EPMAPS
  operations.alerts.forEach((alert, index) => {
    alerts.push({
      id: `epmaps-${index}`,
      type: alert.type,
      source: 'operations',
      title: 'EPMAPS',
      message: alert.message,
      timestamp: alert.timestamp,
      location: alert.location
    });
  });

  return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Datos de fallback para cada servicio
const getWeatherFallback = (): WeatherData => ({
  temperature: 12.5,
  humidity: 85,
  precipitation: 2.5,
  windSpeed: 15,
  windDirection: 'NE',
  pressure: 690,
  lastUpdate: new Date().toISOString()
});

const getEpmapsFallback = (): EpmapsData => ({
  waterFlow: {
    papallacta: 18.2,
    elPlacer: 17.8,
    distribution: 17.5
  },
  waterQuality: {
    ph: 7.2,
    turbidity: 0.5,
    chlorine: 0.8,
    bacteria: "Ausente",
    grade: "A+"
  },
  systemPressure: {
    intake: 125,
    treatment: 120,
    distribution: 45
  },
  operational: {
    efficiency: 96.8,
    coverage: 98.5,
    continuity: "24/7",
    activeStations: 5,
    totalStations: 5
  },
  alerts: [],
  lastUpdate: new Date().toISOString()
});

const getGovernmentFallback = (): GovernmentData => ({
  waterResources: {
    availability: 87.5,
    reserveLevel: 245.8,
    consumption: 185,
    lastAssessment: new Date().toISOString()
  },
  environmental: {
    airQuality: "Buena",
    uvIndex: 8,
    ecosystemHealth: "Estable",
    protectedAreaStatus: "Reserva Ecológica Antisana"
  },
  regulations: {
    waterQualityStandard: "NTE INEN 1108:2020",
    environmentalCompliance: "Conforme",
    lastInspection: "15/07/2025",
    certifications: ["ISO 9001:2015", "ISO 14001:2015"]
  },
  emergencyStatus: {
    level: 'Verde',
    description: "Condiciones normales",
    activePlans: ["Plan de Contingencia Hídrica"]
  },
  lastUpdate: new Date().toISOString()
});

// Función para refrescar datos automáticamente
export const setupAutoRefresh = (callback: (data: IntegratedSystemData) => void, intervalMs: number = 300000) => {
  // Refrescar cada 5 minutos por defecto
  const refreshData = async () => {
    try {
      const data = await getIntegratedSystemData();
      callback(data);
    } catch (error) {
      console.error('Error en actualización automática:', error);
    }
  };

  // Primera carga
  refreshData();
  
  // Configurar intervalo
  const interval = setInterval(refreshData, intervalMs);
  
  // Retornar función de limpieza
  return () => clearInterval(interval);
};

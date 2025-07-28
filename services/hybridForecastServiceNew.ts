/**
 * 🔬 SERVICIO DE PRONÓSTICO HÍBRIDO AVANZADO OPTIMIZADO v3.0
 * 
 * NUEVA LÓGICA DE PREDICCIÓN HÍBRIDA:
 * 1. MODELO ARIMA REAL como base principal (modelo_arima_best.pkl)
 * 2. Datos reales INAMHI + PARAMH2O para complementar
 * 3. Gemini AI para refinamiento y análisis final
 * 4. Fechas específicas: desde mañana consecutivamente
 * 5. Períodos exactos: 7 días diarios, 30 días mensuales, 12 meses anuales
 */

import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import arimaModelService from './arimaModelService';
import { getCurrentWeatherData } from './weatherApiService';
import { getCurrentParamH2OData } from './paramH2OService';
import { generateEnhancedForecastWithArima } from './geminiArima';
import { generateInitialData } from './geminiService';

interface HybridForecastResult {
    forecast: WeatherDataPoint[];
    alerts: Alert[];
    sources: {
        arima: boolean;
        inamhi: boolean;
        paramh2o: boolean;
        gemini: boolean;
    };
    confidence: number;
}

/**
 * Genera datos históricos iniciales combinando fuentes reales (OPTIMIZADO)
 */
export const generateInitialDataFromSources = async (): Promise<WeatherDataPoint[]> => {
    console.log('🔄 Obteniendo datos históricos de fuentes múltiples...');
    
    try {
        // Ejecutar en paralelo para mayor velocidad
        const [arimaResult, weatherResult] = await Promise.allSettled([
            arimaModelService.getHistoricalData(30),
            getCurrentWeatherData()
        ]);
        
        let historicalData: WeatherDataPoint[] = [];
        
        // Procesar datos ARIMA
        if (arimaResult.status === 'fulfilled' && arimaResult.value.length > 0) {
            // Convertir HistoricalDataPoint[] a WeatherDataPoint[]
            historicalData = arimaResult.value.map(point => ({
                date: point.timestamp || new Date().toISOString().split('T')[0],
                precipitation: point.precipitation || 0
            }));
            console.log('✅ Datos históricos ARIMA obtenidos');
        }
        
        // Si no hay datos ARIMA suficientes, generar con Gemini
        if (historicalData.length < 5) {
            console.log('📊 Generando datos históricos con Gemini...');
            const geminiData = await generateInitialData();
            historicalData = geminiData.slice(0, 30); // Últimos 30 días
        }
        
        // Agregar punto de datos actual si está disponible
        if (weatherResult.status === 'fulfilled') {
            const currentDataPoint: WeatherDataPoint = {
                date: new Date().toISOString().split('T')[0],
                precipitation: weatherResult.value.precipitation
            };
            historicalData.unshift(currentDataPoint);
        }
        
        console.log(`✅ ${historicalData.length} puntos de datos históricos preparados`);
        return historicalData.slice(0, 30); // Máximo 30 días
        
    } catch (error) {
        console.error('❌ Error obteniendo datos históricos:', error);
        
        // Fallback: generar datos con Gemini
        console.log('🔄 Fallback: Generando datos históricos con Gemini...');
        const fallbackData = await generateInitialData();
        return fallbackData.slice(0, 30);
    }
};

/**
 * Genera pronóstico híbrido con ARIMA REAL como base principal
 * 
 * NUEVA LÓGICA DE PREDICCIÓN:
 * 1. ARIMA REAL como base principal (modelo_arima_best.pkl)
 * 2. Combinar con datos reales de INAMHI + PARAMH2O 
 * 3. Gemini para refinamiento y análisis final
 * 4. Fechas específicas: desde mañana consecutivamente
 * 5. Períodos exactos: 7 días diarios, 30 días mensuales, 12 meses anuales
 */
export const generateHybridForecast = async (
    historicalData: WeatherDataPoint[], 
    period: ForecastPeriod
): Promise<HybridForecastResult> => {
    
    console.log(`🚀 NUEVA LÓGICA HÍBRIDA - Pronóstico ${period} con ARIMA REAL como base`);
    const startTime = Date.now();
    
    const sources = {
        arima: false,
        inamhi: false,
        paramh2o: false,
        gemini: false
    };
    
    let finalForecast: WeatherDataPoint[] = [];
    let finalAlerts: Alert[] = [];
    let confidence = 0.3; // Confianza base más baja, se incrementa con fuentes
    
    try {
        const periodConfig = {
            'Diario': { days: 7, label: 'diario', unit: 'día' },
            'Mensual': { days: 30, label: 'mensual', unit: 'día' },
            'Anual': { days: 12, label: 'anual', unit: 'mes' }
        };
        
        const config = periodConfig[period];
        const arimaMap = {
            'Diario': 'daily' as const,
            'Mensual': 'monthly' as const, 
            'Anual': 'yearly' as const
        };

        // PASO 1: OBTENER PREDICCIONES BASE DEL MODELO ARIMA REAL
        console.log('🔬 PASO 1: Obteniendo predicciones del modelo ARIMA REAL...');
        let arimaData: any[] | undefined;
        
        try {
            arimaData = await arimaModelService.getPredictionsForSystem(arimaMap[period]);
            if (arimaData && arimaData.length > 0) {
                sources.arima = true;
                confidence += 0.45; // ARIMA real tiene el mayor peso
                console.log(`✅ ${arimaData.length} predicciones ARIMA REALES obtenidas (BASE PRINCIPAL)`);
            } else {
                console.log('⚠️ Modelo ARIMA real no disponible, usando fallback');
            }
        } catch (error) {
            console.error('❌ Error con modelo ARIMA real:', error);
            arimaData = undefined;
        }

        // PASO 2: OBTENER DATOS REALES INAMHI Y PARAMH2O EN PARALELO
        console.log('🌤️ PASO 2: Obteniendo datos reales INAMHI + PARAMH2O...');
        
        const [weatherResult, paramH2OResult] = await Promise.allSettled([
            getCurrentWeatherData(),
            getCurrentParamH2OData()
        ]);

        let weatherData;
        if (weatherResult.status === 'fulfilled') {
            weatherData = weatherResult.value;
            sources.inamhi = true;
            confidence += 0.2;
            console.log('✅ Datos INAMHI obtenidos');
        } else {
            console.log('⚠️ INAMHI no disponible');
        }

        let hydrologicalData;
        if (paramH2OResult.status === 'fulfilled') {
            hydrologicalData = paramH2OResult.value;
            sources.paramh2o = true;
            confidence += 0.15;
            console.log('✅ Datos PARAMH2O obtenidos');
        } else {
            console.log('⚠️ PARAMH2O no disponible');
        }

        // PASO 3: REFINAMIENTO FINAL CON GEMINI AI
        console.log('🤖 PASO 3: Refinamiento híbrido con Gemini AI...');
        
        try {
            const geminiResult = await generateEnhancedForecastWithArima(
                historicalData,
                period,
                arimaData, // Predicciones del modelo ARIMA real
                weatherData, // Datos actuales INAMHI
                hydrologicalData // Datos actuales PARAMH2O
            );
            
            finalForecast = geminiResult.forecast;
            finalAlerts = geminiResult.alerts;
            sources.gemini = true;
            confidence += 0.2;
            
            console.log(`✅ Refinamiento Gemini completado: ${finalForecast.length} predicciones finales`);
            
        } catch (error) {
            console.error('❌ Error en refinamiento Gemini:', error);
            
            // Si Gemini falla pero tenemos ARIMA, usar ARIMA directamente
            if (arimaData && arimaData.length > 0) {
                console.log('🔄 Usando predicciones ARIMA directas sin refinamiento');
                finalForecast = arimaData.slice(0, config.days).map(item => ({
                    date: item.date,
                    precipitation: item.precipitation || 0
                }));
                finalAlerts = []; // Sin alertas si no hay Gemini
            } else {
                throw new Error('No hay datos de predicción disponibles');
            }
        }

        // PASO 4: VALIDAR Y AJUSTAR FECHAS CONSECUTIVAS
        console.log('📅 PASO 4: Validando fechas consecutivas...');
        finalForecast = ensureConsecutiveDates(finalForecast, period, config.days);
        
        // Limitar confianza máxima
        confidence = Math.min(confidence, 0.95);
        
        const duration = Date.now() - startTime;
        console.log(`✅ PRONÓSTICO HÍBRIDO COMPLETADO en ${duration}ms`);
        console.log(`📊 Confianza final: ${(confidence * 100).toFixed(1)}%`);
        console.log(`🔗 Fuentes utilizadas:`, sources);
        console.log(`📈 ${finalForecast.length} predicciones generadas para ${config.days} ${config.unit}s`);
        
        return {
            forecast: finalForecast,
            alerts: finalAlerts,
            sources,
            confidence
        };
        
    } catch (error) {
        console.error('❌ Error crítico en pronóstico híbrido:', error);
        
        // Fallback de emergencia
        console.log('🚨 Activando fallback de emergencia...');
        const periodConfig = {
            'Diario': { days: 7, label: 'diario', unit: 'día' },
            'Mensual': { days: 30, label: 'mensual', unit: 'día' },
            'Anual': { days: 12, label: 'anual', unit: 'mes' }
        };
        
        return generateEmergencyFallback(period, periodConfig[period]);
    }
};

/**
 * Asegura que las fechas sean consecutivas desde mañana
 */
function ensureConsecutiveDates(forecast: WeatherDataPoint[], period: ForecastPeriod, targetDays: number): WeatherDataPoint[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const correctedForecast: WeatherDataPoint[] = [];
    
    for (let i = 0; i < targetDays; i++) {
        let predictionDate = new Date(tomorrow);
        
        if (period === 'Diario' || period === 'Mensual') {
            // Día a día consecutivo
            predictionDate.setDate(tomorrow.getDate() + i);
        } else if (period === 'Anual') {
            // Mes a mes consecutivo
            predictionDate.setMonth(tomorrow.getMonth() + i);
            predictionDate.setDate(1); // Primer día de cada mes
        }
        
        const dateString = predictionDate.toISOString().split('T')[0];
        
        // Usar datos existentes o interpolar
        const existingData = forecast[i];
        const precipitation = existingData?.precipitation || 
                            (i > 0 ? forecast[Math.min(i - 1, forecast.length - 1)]?.precipitation || 5 : 5);
        
        correctedForecast.push({
            date: dateString,
            precipitation: Math.round(precipitation * 10) / 10
        });
    }
    
    console.log(`📅 Fechas corregidas: ${correctedForecast[0]?.date} a ${correctedForecast[correctedForecast.length - 1]?.date}`);
    return correctedForecast;
}

/**
 * Fallback de emergencia si todo falla
 */
function generateEmergencyFallback(period: ForecastPeriod, config: any): HybridForecastResult {
    console.log('🚨 Generando datos de fallback de emergencia...');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const fallbackForecast: WeatherDataPoint[] = [];
    
    for (let i = 0; i < config.days; i++) {
        let predictionDate = new Date(tomorrow);
        
        if (period === 'Diario' || period === 'Mensual') {
            predictionDate.setDate(tomorrow.getDate() + i);
        } else {
            predictionDate.setMonth(tomorrow.getMonth() + i);
            predictionDate.setDate(1);
        }
        
        const dateString = predictionDate.toISOString().split('T')[0];
        
        // Precipitación realista para Papallacta según época
        const month = predictionDate.getMonth();
        const seasonalPrecip = [4.2, 5.1, 6.8, 8.9, 7.2, 5.8, 4.1, 4.5, 6.2, 7.8, 6.4, 4.9][month];
        const precipitation = seasonalPrecip + (Math.random() - 0.5) * 3;
        
        fallbackForecast.push({
            date: dateString,
            precipitation: Math.max(0, Math.round(precipitation * 10) / 10)
        });
    }
    
    return {
        forecast: fallbackForecast,
        alerts: [],
        sources: { arima: false, inamhi: false, paramh2o: false, gemini: false },
        confidence: 0.4
    };
}

/**
 * Cache simple para evitar llamadas repetitivas (mejora rendimiento)
 */
const forecastCache = new Map<string, { data: HybridForecastResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Versión con cache del pronóstico híbrido para mejor rendimiento
 */
export const generateCachedHybridForecast = async (
    historicalData: WeatherDataPoint[], 
    period: ForecastPeriod
): Promise<HybridForecastResult> => {
    const cacheKey = `${period}_${historicalData.length}_${Date.now().toString().slice(0, -5)}`;
    const cached = forecastCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log(`📊 Usando pronóstico híbrido en cache para ${period}`);
        return cached.data;
    }
    
    const result = await generateHybridForecast(historicalData, period);
    forecastCache.set(cacheKey, { data: result, timestamp: Date.now() });
    
    // Limpiar cache antiguo
    for (const [key, value] of forecastCache.entries()) {
        if ((Date.now() - value.timestamp) > CACHE_DURATION) {
            forecastCache.delete(key);
        }
    }
    
    return result;
};

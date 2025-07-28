/**
 * 🔬 SERVICIO DE PRONÓSTICO HÍBRIDO CON ALERTAS v4.0
 * 
 * SISTEMA COMPLETO DE PREDICCIÓN Y ALERTAS:
 * 1. MODELO ARIMA REAL como base principal (modelo_arima_best.pkl)
 * 2. Datos reales INAMHI + PARAMH2O para complementar
 * 3. Gemini AI para refinamiento y análisis final
 * 4. SISTEMA DE ALERTAS INTELIGENTES integrado
 * 5. Fechas específicas: desde mañana consecutivamente
 * 6. Períodos exactos: 7 días diarios, 30 días mensuales, 12 meses anuales
 */

import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import arimaModelService from './arimaModelServiceReal';
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
 * Genera datos históricos iniciales combinando fuentes reales
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
                precipitation: point.precipitation || 0,
                temperature: point.temperature,
                humidity: point.humidity,
                windSpeed: point.wind_speed,
                pressure: point.pressure,
                source: 'ARIMA_Historical'
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
                precipitation: weatherResult.value.precipitation,
                temperature: weatherResult.value.temperature,
                humidity: weatherResult.value.humidity,
                source: 'Current_Weather'
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
                    precipitation: item.precipitation || 0,
                    temperature: item.temperature,
                    humidity: item.humidity,
                    source: 'ARIMA_Direct'
                }));
            } else {
                // Fallback completo: generar predicciones básicas
                console.log('🔄 Generando predicciones de fallback...');
                finalForecast = generateFallbackForecast(period, config.days);
            }
        }

        // PASO 4: VALIDAR Y AJUSTAR FECHAS CONSECUTIVAS
        console.log('📅 PASO 4: Validando fechas consecutivas...');
        finalForecast = ensureConsecutiveDates(finalForecast, period, config.days);
        
        // PASO 5: GENERAR ALERTAS INTELIGENTES
        console.log('🚨 PASO 5: Generando alertas inteligentes...');
        if (finalAlerts.length === 0) {
            finalAlerts = generateIntelligentAlerts(finalForecast, period);
        }
        
        // Limitar confianza máxima
        confidence = Math.min(confidence, 0.95);
        
        const duration = Date.now() - startTime;
        console.log(`✅ PRONÓSTICO HÍBRIDO COMPLETADO en ${duration}ms`);
        console.log(`📊 Confianza final: ${(confidence * 100).toFixed(1)}%`);
        console.log(`🔗 Fuentes utilizadas:`, sources);
        console.log(`📈 ${finalForecast.length} predicciones generadas para ${config.days} ${config.unit}s`);
        console.log(`🚨 ${finalAlerts.length} alertas inteligentes generadas`);
        
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
            precipitation: Math.round(precipitation * 10) / 10,
            temperature: existingData?.temperature,
            humidity: existingData?.humidity,
            windSpeed: existingData?.windSpeed,
            pressure: existingData?.pressure,
            source: existingData?.source || 'Date_Corrected'
        });
    }
    
    console.log(`📅 Fechas corregidas: ${correctedForecast[0]?.date} a ${correctedForecast[correctedForecast.length - 1]?.date}`);
    return correctedForecast;
}

/**
 * Genera alertas inteligentes basadas en las predicciones
 */
function generateIntelligentAlerts(forecast: WeatherDataPoint[], period: ForecastPeriod): Alert[] {
    const alerts: Alert[] = [];
    
    console.log(`🔍 Analizando ${forecast.length} predicciones para generar alertas...`);
    
    forecast.forEach((prediction, index) => {
        const date = prediction.date;
        const precip = prediction.precipitation;
        
        // ALERTAS POR PRECIPITACIÓN CRÍTICA
        if (precip > 30) {
            alerts.push({
                id: `critical_rain_${date}`,
                title: '🌧️ PRECIPITACIÓN CRÍTICA',
                message: `Lluvia muy intensa prevista: ${precip.toFixed(1)}mm. ALTO RIESGO para operaciones del sistema hídrico Papallacta.`,
                date: date,
                precipitation: precip,
                severity: 'critical',
                type: 'weather',
                source: 'Sistema_Alertas_Hibrido'
            });
        } else if (precip > 18) {
            alerts.push({
                id: `high_rain_${date}`,
                title: '🌦️ Precipitación Alta',
                message: `Lluvia intensa esperada: ${precip.toFixed(1)}mm. Monitorear sistemas de captación y calidad del agua.`,
                date: date,
                precipitation: precip,
                severity: 'warning',
                type: 'weather',
                source: 'Monitor_Meteorologico'
            });
        } else if (precip > 12) {
            alerts.push({
                id: `moderate_rain_${date}`,
                title: '☔ Precipitación Moderada-Alta',
                message: `Lluvia moderada prevista: ${precip.toFixed(1)}mm. Revisar niveles de turbidez.`,
                date: date,
                precipitation: precip,
                severity: 'medium',
                type: 'weather',
                source: 'Seguimiento_Operacional'
            });
        }
        
        // ALERTAS ESPECIALES PARA PAPALLACTA
        
        // Alerta de sequía (baja precipitación sostenida)
        if (period === 'Diario' && index >= 3) {
            const last4Days = forecast.slice(Math.max(0, index - 3), index + 1);
            const avgPrecip = last4Days.reduce((sum, d) => sum + d.precipitation, 0) / last4Days.length;
            
            if (avgPrecip < 1.5) {
                alerts.push({
                    id: `drought_risk_${date}`,
                    title: '🏜️ Riesgo de Sequía',
                    message: `Precipitación muy baja sostenida (promedio: ${avgPrecip.toFixed(1)}mm). Monitorear niveles de captación.`,
                    date: date,
                    precipitation: precip,
                    severity: 'warning',
                    type: 'operational',
                    source: 'Analisis_Tendencias'
                });
            }
        }
        
        // Alertas para período lluvioso prolongado
        if (period === 'Diario' && index >= 2) {
            const last3Days = forecast.slice(Math.max(0, index - 2), index + 1);
            const consecutiveRain = last3Days.every(d => d.precipitation > 8);
            
            if (consecutiveRain) {
                const totalRain = last3Days.reduce((sum, d) => sum + d.precipitation, 0);
                alerts.push({
                    id: `extended_rain_${date}`,
                    title: '🌧️ Período Lluvioso Prolongado',
                    message: `Lluvia sostenida por 3+ días (total: ${totalRain.toFixed(1)}mm). Riesgo de turbidez elevada y problemas de calidad.`,
                    date: date,
                    precipitation: precip,
                    severity: 'high',
                    type: 'quality',
                    source: 'Analisis_Calidad_Agua'
                });
            }
        }
        
        // Alertas estacionales para Papallacta
        const currentMonth = new Date(date).getMonth();
        
        // Época seca (junio-agosto) con lluvia alta = anomalía
        if ([5, 6, 7].includes(currentMonth) && precip > 15) {
            alerts.push({
                id: `anomaly_rain_${date}`,
                title: '⚠️ Precipitación Anómala',
                message: `Lluvia inusual para época seca: ${precip.toFixed(1)}mm en ${getMonthName(currentMonth)}. Posible cambio climático.`,
                date: date,
                precipitation: precip,
                severity: 'warning',
                type: 'weather',
                source: 'Monitor_Climatico'
            });
        }
        
        // Época lluviosa (marzo-mayo, octubre-diciembre) con sequía = anomalía
        if ([2, 3, 4, 9, 10, 11].includes(currentMonth) && precip < 2 && index < 5) {
            alerts.push({
                id: `anomaly_dry_${date}`,
                title: '🌤️ Sequía Anómala',
                message: `Precipitación muy baja para época lluviosa: ${precip.toFixed(1)}mm en ${getMonthName(currentMonth)}. Vigilar reservas.`,
                date: date,
                precipitation: precip,
                severity: 'medium',
                type: 'operational',
                source: 'Monitor_Estacional'
            });
        }
    });
    
    // Resumen de alertas generadas
    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const warningCount = alerts.filter(a => a.severity === 'warning').length;
    const totalCount = alerts.length;
    
    console.log(`✅ Sistema de alertas completado:`);
    console.log(`   🔴 ${criticalCount} alertas críticas`);
    console.log(`   🟡 ${warningCount} alertas de advertencia`);
    console.log(`   📊 ${totalCount} alertas totales generadas`);
    
    return alerts;
}

/**
 * Genera predicciones de fallback cuando no hay datos ARIMA ni Gemini
 */
function generateFallbackForecast(period: ForecastPeriod, days: number): WeatherDataPoint[] {
    const forecast: WeatherDataPoint[] = [];
    const today = new Date();
    
    for (let i = 1; i <= days; i++) {
        const date = new Date(today);
        if (period === 'Anual') {
            date.setMonth(today.getMonth() + i);
            date.setDate(1);
        } else {
            date.setDate(today.getDate() + i);
        }
        
        // Patrones realistas para Papallacta
        const month = date.getMonth();
        const seasonalPrecip = [4.2, 5.1, 6.8, 8.9, 7.2, 5.8, 4.1, 4.5, 6.2, 7.8, 6.4, 4.9][month];
        const precipitation = seasonalPrecip + (Math.random() - 0.5) * 3;
        
        forecast.push({
            date: date.toISOString().split('T')[0],
            precipitation: Math.max(0, Math.round(precipitation * 10) / 10),
            temperature: 10 + (Math.random() - 0.5) * 4,
            humidity: 78 + Math.random() * 15,
            source: 'Fallback_Forecast'
        });
    }
    
    return forecast;
}

/**
 * Fallback de emergencia si todo falla
 */
function generateEmergencyFallback(period: ForecastPeriod, config: any): HybridForecastResult {
    console.log('🚨 Generando datos de fallback de emergencia...');
    
    const fallbackForecast = generateFallbackForecast(period, config.days);
    const emergencyAlerts = generateIntelligentAlerts(fallbackForecast, period);
    
    return {
        forecast: fallbackForecast,
        alerts: emergencyAlerts,
        sources: { arima: false, inamhi: false, paramh2o: false, gemini: false },
        confidence: 0.4
    };
}

/**
 * Obtiene el nombre del mes en español
 */
function getMonthName(monthIndex: number): string {
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthIndex] || 'Mes desconocido';
}

/**
 * 🤖 SERVICIO GEMINI MEJORADO CON INTEGRACIÓN ARIMA
 * 
 * Combina las predicciones del modelo ARIMA entrenado con el análisis
 * inteligente de Google Gemini para generar pronósticos híbridos de
 * alta precisión específicamente calibrados para Papallacta.
 */

import { GoogleGenAI, Type } from "@google/genai";
import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import { GEMINI_MODEL } from '../constants';
import arimaModelService from './arimaModelServiceReal';

if (!process.env.API_KEY) {
    throw new Error("La variable de entorno API_KEY no está configurada.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema actualizado para incluir datos del modelo ARIMA
const arimaEnhancedSchema = {
    type: Type.OBJECT,
    properties: {
        forecast: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    date: { type: Type.STRING, description: "Fecha en formato YYYY-MM-DD" },
                    temperature: { type: Type.NUMBER, description: "Temperatura en grados Celsius" },
                    precipitation: { type: Type.NUMBER, description: "Precipitación en milímetros" },
                    humidity: { type: Type.NUMBER, description: "Humedad relativa en porcentaje" },
                    windSpeed: { type: Type.NUMBER, description: "Velocidad del viento en km/h" },
                    pressure: { type: Type.NUMBER, description: "Presión atmosférica en hPa" },
                    flowRate: { type: Type.NUMBER, description: "Caudal estimado en L/s" },
                    waterQuality: { type: Type.NUMBER, description: "Índice de calidad del agua (0-100)" },
                    confidence: { type: Type.NUMBER, description: "Nivel de confianza del modelo ARIMA (0-1)" },
                    source: { type: Type.STRING, description: "Fuente de datos: ARIMA_Enhanced" }
                },
                required: ["date", "temperature", "precipitation", "humidity", "windSpeed", "pressure", "flowRate", "waterQuality", "confidence", "source"]
            }
        },
        alerts: {
            type: Type.ARRAY,
            description: "Alertas basadas en predicciones ARIMA y análisis Gemini",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Título de la alerta" },
                    date: { type: Type.STRING, description: "Fecha de la alerta" },
                    precipitation: { type: Type.NUMBER, description: "Precipitación asociada" },
                    severity: { type: Type.STRING, description: "Severidad: normal, warning, critical" },
                    arimaConfidence: { type: Type.NUMBER, description: "Confianza del modelo ARIMA" },
                    source: { type: Type.STRING, description: "ARIMA_Gemini_Hybrid" }
                },
                required: ["title", "date", "precipitation", "severity", "arimaConfidence", "source"]
            }
        }
    },
    required: ["forecast", "alerts"]
};

/**
 * Genera pronósticos híbridos combinando modelo ARIMA + análisis Gemini
 */
export const generateArimaEnhancedForecast = async (
    period: ForecastPeriod,
    arimaData?: any[]
): Promise<{ forecast: WeatherDataPoint[]; alerts: Alert[] }> => {
    
    console.log(`🧠 Generando pronóstico híbrido ARIMA + Gemini para período: ${period}`);
    
    // Convertir período de UI a formato ARIMA
    const arimaMap = {
        'Diario': 'daily' as const,
        'Mensual': 'monthly' as const,
        'Anual': 'yearly' as const
    };
    
    const arimaPeriod = arimaMap[period];
    const periodConfig = {
        'Diario': { days: 7, label: 'diario', unit: 'día' },
        'Mensual': { days: 30, label: 'mensual', unit: 'día' },
        'Anual': { days: 365, label: 'anual', unit: 'año' }
    };
    
    const config = periodConfig[period];
    
    // Obtener predicciones ARIMA si no se proporcionaron
    let arima_predictions = arimaData;
    if (!arima_predictions) {
        try {
            const arimaForecasts = await arimaModelService.getPredictionsForSystem(arimaPeriod);
            arima_predictions = arimaForecasts;
        } catch (error) {
            console.warn('⚠️ No se pudieron obtener predicciones ARIMA:', error);
            arima_predictions = [];
        }
    }

    const daysCount = config.days;
    const periodLabel = config.label;
    const timeUnit = config.unit;
    
    // Generar fechas específicas empezando desde mañana
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const specificDates: string[] = [];
    for (let i = 0; i < daysCount; i++) {
        const predictionDate = new Date(tomorrow);
        predictionDate.setDate(tomorrow.getDate() + i);
        specificDates.push(predictionDate.toISOString().split('T')[0]);
    }
    
    try {

        // Construir prompt híbrido con datos ARIMA y fechas específicas
        const prompt = `
Como experto meteorólogo e hidrólogo especializado en el sistema Papallacta-Quito, necesito que generes un pronóstico ${periodLabel} de ${daysCount} ${timeUnit}s para la región de Papallacta (3,220 msnm), Ecuador.

FECHAS EXACTAS A PREDECIR (OBLIGATORIO USAR ESTAS FECHAS):
${specificDates.map((date, i) => `${i + 1}. ${date}`).join('\n')}

DATOS DEL MODELO ARIMA ENTRENADO:
${JSON.stringify(arima_predictions?.slice(0, 10), null, 2)}

CONTEXTO REGIONAL ESPECÍFICO:
- Ubicación: Papallacta, Ecuador (0.0833°S, 78.15°W)
- Altitud: 3,220 metros sobre el nivel del mar
- Clima: Tropical de altura con precipitaciones regulares
- Sistema hídrico crítico: Abastece 2.8 millones de habitantes en Quito
- Estación actual: ${new Date().toLocaleDateString('es-ES', { month: 'long' })}

INSTRUCCIONES ESPECÍFICAS:
1. **USAR EXACTAMENTE** las fechas proporcionadas arriba en orden secuencial
2. **USAR COMO BASE** las predicciones del modelo ARIMA entrenado proporcionado
3. **AJUSTAR Y MEJORAR** con tu conocimiento meteorológico de la región andina ecuatoriana
4. **CONSIDERAR**:
   - Patrones estacionales típicos de páramos andinos
   - Efectos de altitud en temperatura y presión
   - Correlación precipitación-caudal para sistemas de captación
   - Calidad del agua en función de precipitación y temperatura
   
5. **GENERAR**:
   - Pronóstico completo de ${daysCount} ${timeUnit}s con las fechas exactas especificadas
   - Variables: temperatura, precipitación, humedad, viento, presión, caudal, calidad agua
   - Una alerta por cada punto de datos si es necesario
   
6. **CRITERIOS DE ALERTA**:
   - Normal: precipitación 0-19mm, caudal >150 L/s, calidad >85%
   - Warning: precipitación 20-35mm, caudal 120-150 L/s, calidad 75-85%
   - Critical: precipitación ≥36mm, caudal <120 L/s, calidad <75%

7. **AUMENTAR CONFIANZA**: Si las predicciones ARIMA tienen alta confianza (>0.8), mantén esos valores. Si tienen baja confianza (<0.6), ajusta según patrones climáticos históricos.

IMPORTANTE: Usa EXACTAMENTE las fechas proporcionadas en el orden dado. NO generes fechas diferentes.

FORMATO REQUERIDO: JSON con forecast y alerts arrays.
`;

        console.log('🔮 Enviando datos ARIMA a Gemini para análisis híbrido...');
        const arimaResult = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: arimaEnhancedSchema,
                temperature: 0.3
            }
        });
        
        const text = arimaResult.text?.trim() || '';
        
        if (!text) {
            throw new Error('Respuesta vacía del modelo Gemini');
        }

        const data = JSON.parse(text);
        
        // Validar datos de respuesta
        if (!data.forecast || !Array.isArray(data.forecast)) {
            throw new Error('Formato de respuesta inválido: falta forecast array');
        }

        if (!data.alerts || !Array.isArray(data.alerts)) {
            throw new Error('Formato de respuesta inválido: falta alerts array');
        }

        // Asegurar que cada punto tiene marca de híbrido ARIMA-Gemini
        const enhancedForecast = data.forecast.map((point: any) => ({
            ...point,
            source: 'ARIMA_Gemini_Hybrid',
            arimaEnhanced: true
        }));

        const enhancedAlerts = data.alerts.map((alert: any) => ({
            ...alert,
            source: 'ARIMA_Gemini_Hybrid',
            arimaEnhanced: true
        }));

        console.log(`✅ Pronóstico híbrido generado: ${enhancedForecast.length} puntos de datos, ${enhancedAlerts.length} alertas`);
        
        return {
            forecast: enhancedForecast,
            alerts: enhancedAlerts
        };

    } catch (error) {
        console.error('❌ Error generando pronóstico híbrido ARIMA-Gemini:', error);
        
        // Fallback usando solo ARIMA si Gemini falla
        if (arima_predictions && arima_predictions.length > 0) {
            console.log('🔄 Usando pronóstico ARIMA puro como fallback');
            return {
                forecast: arima_predictions.map((point: any) => ({
                    ...point,
                    source: 'ARIMA_Fallback'
                })),
                alerts: generateArimaBasicAlerts(arima_predictions)
            };
        }
        
        throw error;
    }
};

/**
 * Genera alertas básicas basadas solo en datos ARIMA
 */
const generateArimaBasicAlerts = (arimaData: any[]): Alert[] => {
    const alerts: Alert[] = [];
    
    arimaData.forEach((point, index) => {
        if (point.precipitation > 35) {
            alerts.push({
                id: `arima-critical-${index}`,
                title: `Lluvia Crítica - ${point.date}`,
                date: point.date,
                precipitation: point.precipitation,
                severity: 'critical' as const
            });
        } else if (point.precipitation > 20) {
            alerts.push({
                id: `arima-warning-${index}`,
                title: `Lluvia Moderada - ${point.date}`,
                date: point.date,
                precipitation: point.precipitation,
                severity: 'warning' as const
            });
        }
    });
    
    return alerts;
};

/**
 * 🔬 FUNCIÓN PRINCIPAL PARA PRONÓSTICO HÍBRIDO
 * 
 * Combina predicciones ARIMA con datos reales de INAMHI y EPMAPS
 * para generar pronósticos de máxima precisión y realismo.
 */
export const generateEnhancedForecastWithArima = async (
    historicalData: WeatherDataPoint[],
    period: ForecastPeriod,
    arimaPredictions?: any[],
    currentWeatherData?: any,
    paramh2oData?: any
): Promise<{ forecast: WeatherDataPoint[]; alerts: Alert[] }> => {
    
    console.log('🚀 Iniciando pronóstico híbrido ARIMA + Datos Reales + Gemini');
    
    try {
        // Determinar configuración del período
        const periodConfig = {
            'Diario': { days: 7, unit: 'días' },
            'Mensual': { days: 30, unit: 'días' }, 
            'Anual': { days: 365, unit: 'días' }
        };
        
        const config = periodConfig[period];
        const daysCount = config.days;
        const timeUnit = config.unit;

        // Preparar contexto con datos reales
        let realDataContext = '';
        
        if (currentWeatherData) {
            realDataContext += `
DATOS METEOROLÓGICOS REALES ACTUALES (INAMHI):
- Temperatura: ${currentWeatherData.temperature}°C
- Precipitación: ${currentWeatherData.precipitation} mm/h
- Humedad: ${currentWeatherData.humidity}%
- Viento: ${currentWeatherData.windSpeed} km/h
- Presión: ${currentWeatherData.pressure} hPa
- Última actualización: ${currentWeatherData.lastUpdate}
`;
        }
        
        if (paramh2oData) {
            realDataContext += `
DATOS OPERACIONALES REALES (PARAMH2O):
- Caudal Papallacta: ${paramh2oData.waterFlow.papallacta} m³/s
- Calidad del agua: ${paramh2oData.waterQuality.grade} (pH: ${paramh2oData.waterQuality.ph})
- Eficiencia del sistema: ${paramh2oData.operational.efficiency}%
- Presión de captación: ${paramh2oData.systemPressure.intake} bar
- Nivel cuencas: ${paramh2oData.environmental.watershedLevel}%
- Última actualización: ${paramh2oData.lastUpdate}
`;
        }
        
        // Preparar datos del modelo ARIMA
        let arimaContext = '';
        if (arimaPredictions && arimaPredictions.length > 0) {
            arimaContext = `
PREDICCIONES BASE DEL MODELO ARIMA ENTRENADO:
${JSON.stringify(arimaPredictions.slice(0, 10), null, 2)}

INSTRUCCIÓN CRÍTICA: Usa estas predicciones ARIMA como BASE PRINCIPAL. 
NO las cambies drásticamente - solo ajústalas ligeramente con los datos reales.
El modelo ARIMA es científicamente entrenado y debe tener prioridad.
`;
        }

        const prompt = `
Eres un meteorólogo del INAMHI especializado en sistemas hídricos andinos ecuatorianos.

CONTEXTO GEOGRÁFICO:
- Ubicación: Papallacta, Ecuador (0.0833°S, 78.15°W)
- Altitud: 3,220 metros sobre el nivel del mar
- Clima: Tropical de altura con precipitaciones regulares
- Sistema hídrico crítico: Abastece 2.8 millones de habitantes en Quito

${arimaContext}

${realDataContext}

DATOS HISTÓRICOS RECIENTES:
${JSON.stringify(historicalData.slice(-7), null, 2)}

INSTRUCCIONES PARA PRONÓSTICO HÍBRIDO:

1. **PRIORIDAD MÁXIMA**: Si hay predicciones ARIMA, úsalas como base principal
2. **CALIBRACIÓN**: Ajusta ligeramente con datos reales de INAMHI y EPMAPS
3. **REALISMO**: Mantén coherencia con patrones climáticos de páramos andinos
4. **VARIABLES A GENERAR**:
   - Temperatura (°C) - típico 8-18°C en Papallacta
   - Precipitación (mm) - crítico para alertas
   - Humedad (%) - típico 75-95% en páramos
   - Velocidad viento (km/h)
   - Presión atmosférica (hPa) - ajustada por altitud
   - Caudal estimado (L/s) - correlacionado con precipitación
   - Calidad agua (0-100) - afectada por lluvia intensa

5. **CRITERIOS DE ALERTA ESPECÍFICOS**:
   - Normal: precipitación 0-19mm, caudal >150 L/s, calidad >85%
   - Warning: precipitación 20-35mm, caudal 120-150 L/s, calidad 75-85%
   - Critical: precipitación ≥36mm, caudal <120 L/s, calidad <75%

6. **PERÍODO**: Generar ${daysCount} ${timeUnit} de pronóstico

7. **INTEGRACIÓN DE DATOS REALES**:
   ${currentWeatherData ? '- Usar temperatura y precipitación actual como punto de partida' : ''}
   ${paramh2oData ? '- Considerar el estado operacional actual del sistema PARAMH2O' : ''}

FORMATO REQUERIDO: JSON con arrays "forecast" y "alerts"
Cada punto debe incluir: date, temperature, precipitation, humidity, windSpeed, pressure, flowRate, waterQuality
Cada alerta debe incluir: title, date, precipitation, severity
`;

        console.log('🔮 Procesando pronóstico híbrido con Gemini...');
        const hybridResult = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: arimaEnhancedSchema,
                temperature: 0.3 // Baja variabilidad para mantener coherencia con ARIMA
            }
        });
        
        const text = hybridResult.text?.trim() || '';
        
        if (!text) {
            throw new Error('Respuesta vacía del modelo Gemini');
        }

        const data = JSON.parse(text);
        
        // Validar estructura de respuesta
        if (!data.forecast || !Array.isArray(data.forecast)) {
            throw new Error('Formato inválido: falta forecast array');
        }

        if (!data.alerts || !Array.isArray(data.alerts)) {
            throw new Error('Formato inválido: falta alerts array');
        }

        // Marcar datos como híbridos
        const enhancedForecast = data.forecast.map((point: any) => ({
            ...point,
            source: 'Híbrido_ARIMA_Datos_Reales',
            confidence: arimaPredictions ? 0.9 : 0.75, // Mayor confianza con ARIMA
            enhancementLevel: arimaPredictions ? 'ARIMA_Enhanced' : 'Real_Data_Enhanced'
        }));

        const enhancedAlerts = data.alerts.map((alert: any, index: number) => ({
            ...alert,
            id: `hybrid-alert-${index}`,
            source: 'Híbrido_ARIMA_Datos_Reales'
        }));

        console.log(`✅ Pronóstico híbrido completado exitosamente:`);
        console.log(`   📊 ${enhancedForecast.length} puntos de datos generados`);
        console.log(`   🚨 ${enhancedAlerts.length} alertas identificadas`);
        console.log(`   🔬 Base ARIMA: ${arimaPredictions ? 'SÍ' : 'NO'}`);
        console.log(`   🌤️ Datos INAMHI: ${currentWeatherData ? 'SÍ' : 'NO'}`);
        console.log(`   💧 Datos PARAMH2O: ${paramh2oData ? 'SÍ' : 'NO'}`);
        
        return {
            forecast: enhancedForecast,
            alerts: enhancedAlerts
        };

    } catch (error) {
        console.error('❌ Error en pronóstico híbrido:', error);
        
        // Fallback: usar solo ARIMA si está disponible
        if (arimaPredictions && arimaPredictions.length > 0) {
            console.log('🔄 Fallback: usando predicción ARIMA pura');
            
            const fallbackForecast = arimaPredictions.map((point: any) => ({
                date: point.timestamp?.split('T')[0] || point.date,
                temperature: point.temperature || 12,
                precipitation: point.precipitation || 0,
                humidity: point.humidity || 85,
                windSpeed: point.wind_speed || 15,
                pressure: point.pressure || 680,
                flowRate: point.flow_rate || 150,
                waterQuality: point.water_quality || 85,
                source: 'ARIMA_Fallback'
            }));
            
            return {
                forecast: fallbackForecast,
                alerts: generateArimaBasicAlerts(fallbackForecast)
            };
        }
        
        throw new Error(`Error en pronóstico híbrido: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
};

/**
 * Función original mantenida para compatibilidad
 */
export const generateForecast = async (
    period: ForecastPeriod
): Promise<{ forecast: WeatherDataPoint[]; alerts: Alert[] }> => {
    
    console.log('⚡ Usando pronóstico híbrido ARIMA-Gemini por defecto');
    return generateArimaEnhancedForecast(period);
};

/**
 * Genera análisis profesional que incluye información del modelo ARIMA
 */
export const generateArimaEnhancedAnalysis = async (
    weatherData: WeatherDataPoint[],
    arimaForecasts?: any
): Promise<string> => {
    
    console.log('🔬 Generando análisis profesional con insights ARIMA...');
    
    try {
        // Preparar información del modelo ARIMA
        const arimaInfo = arimaForecasts ? {
            modelStatus: arimaForecasts.modelStatus,
            predictionsCount: arimaForecasts.daily?.length || 0,
            avgConfidence: arimaForecasts.daily?.reduce((acc: number, p: any) => acc + (p.confidence || 0), 0) / (arimaForecasts.daily?.length || 1)
        } : null;

        const prompt = `
Como experto en hidrología y gestión de recursos hídricos, analiza estos datos meteorológicos del sistema Papallacta-Quito y proporciona un análisis profesional detallado.

DATOS METEOROLÓGICOS ACTUALES:
${JSON.stringify(weatherData.slice(0, 7), null, 2)}

${arimaInfo ? `
INFORMACIÓN DEL MODELO ARIMA:
- Estado del modelo: ${arimaInfo.modelStatus?.loaded ? 'Cargado correctamente' : 'No disponible'}
- Versión: ${arimaInfo.modelStatus?.version || 'N/A'}
- Predicciones disponibles: ${arimaInfo.predictionsCount}
- Confianza promedio: ${(arimaInfo.avgConfidence * 100).toFixed(1)}%
- Última actualización: ${arimaInfo.modelStatus?.lastUpdate ? new Date(arimaInfo.modelStatus.lastUpdate).toLocaleString() : 'N/A'}
` : ''}

CONTEXTO DEL SISTEMA:
- Sistema hídrico Papallacta-Quito (crítico nacional)
- Captación en páramos andinos (3,220 msnm)
- Abastecimiento a 2.8 millones de habitantes
- Infraestructura: túneles, plantas de tratamiento, reservorios

Proporciona un análisis que incluya:

1. **EVALUACIÓN METEOROLÓGICA**:
   - Condiciones actuales y tendencias
   - Análisis de precipitación y su impacto en captación
   - Factores de temperatura y humedad

2. **IMPACTO EN EL SISTEMA HÍDRICO**:
   - Efectos en caudales de captación
   - Implicaciones para calidad del agua
   - Eficiencia operacional esperada

3. **PREDICCIONES CON MODELO ARIMA**:
   ${arimaInfo ? '- Validación de confiabilidad del modelo entrenado' : '- Limitaciones por falta de modelo ARIMA'}
   - Comparación con patrones históricos
   - Nivel de certeza en las predicciones

4. **RECOMENDACIONES OPERATIVAS**:
   - Acciones inmediatas requeridas
   - Ajustes en operación del sistema
   - Medidas preventivas

5. **GESTIÓN DE RIESGOS**:
   - Identificación de escenarios críticos
   - Estrategias de mitigación
   - Protocolos de emergencia

Proporciona un análisis profesional, técnico y específico para operadores del sistema hídrico.
`;

        try {
            const response = await ai.models.generateContent({
                model: GEMINI_MODEL,
                contents: prompt,
                config: {
                    temperature: 0.3
                }
            });
            
            const analysis = response.text;
            
            if (!analysis) {
                throw new Error('No se pudo generar el análisis');
            }

            console.log('✅ Análisis profesional con ARIMA generado exitosamente');
            return analysis;

        } catch (error) {
            console.error('❌ Error generando análisis ARIMA-enhanced:', error);
            throw error;
        }
    } catch (error) {
        console.error('❌ Error en función de análisis ARIMA:', error);
        return 'Análisis no disponible debido a error técnico.';
    }
};

// Mantener función original para compatibilidad
export const generateAnalysis = generateArimaEnhancedAnalysis;


import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import { GEMINI_MODEL } from '../constants';

if (!process.env.API_KEY) {
    throw new Error("La variable de entorno API_KEY no está configurada.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const initialDataSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            date: {
                type: Type.STRING,
                description: "Fecha en formato YYYY-MM-DD."
            },
            precipitation: {
                type: Type.NUMBER,
                description: "Precipitación en milímetros."
            },
        },
        required: ["date", "precipitation"],
    },
};

const alertSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Un título breve para la alerta en español (ej. 'Lluvias Intensas')." },
        date: { type: Type.STRING, description: "Para Diario/Mensual: fecha en formato YYYY-MM-DD. Para Anual: usar formato YYYY-MM-01 (primer día del mes)." },
        precipitation: { type: Type.NUMBER, description: "La precipitación pronosticada en mm para esa fecha." },
        severity: { type: Type.STRING, description: "La severidad: 'normal' (0-19mm), 'warning' (20-35mm) o 'critical' (≥36mm)." },
    },
    required: ["title", "date", "precipitation", "severity"],
};

const forecastSchema = {
    type: Type.OBJECT,
    properties: {
        forecast: initialDataSchema,
        alerts: {
          type: Type.ARRAY,
          description: "Un array de alertas individuales - UNA ALERTA por cada punto de datos predicho (cada día/mes).",
          items: alertSchema,
        },
    },
    required: ["forecast", "alerts"],
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "Resumen ejecutivo del análisis meteorológico en 2-3 líneas."
        },
        historicalTrends: {
            type: Type.STRING,
            description: "Análisis detallado de las tendencias históricas observadas."
        },
        forecastInsights: {
            type: Type.STRING,
            description: "Análisis profesional de los patrones de predicción."
        },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "Recomendación específica para la gestión hídrica."
            },
            description: "Lista de recomendaciones profesionales para la gestión del sistema hídrico."
        },
        riskAssessment: {
            type: Type.STRING,
            description: "Evaluación de riesgos y preparación necesaria."
        },
        operationalActions: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "Acción operativa específica a implementar."
            },
            description: "Acciones operativas inmediatas recomendadas."
        }
    },
    required: ["summary", "historicalTrends", "forecastInsights", "recommendations", "riskAssessment", "operationalActions"],
};


export const generateInitialData = async (): Promise<WeatherDataPoint[]> => {
    try {
        // Generar datos históricos más consistentes usando patrones realistas
        const data: WeatherDataPoint[] = [];
        const today = new Date();
        
        // Patrones climáticos mensuales de Papallacta (precipitación promedio en mm/día)
        const monthlyPatterns = [
            25, // Enero - temporada húmeda
            28, // Febrero - máximo anual  
            26, // Marzo - final temporada húmeda
            22, // Abril - transición
            18, // Mayo - inicio temporada seca
            12, // Junio - temporada seca
            8,  // Julio - mínimo anual
            10, // Agosto - temporada seca
            15, // Septiembre - transición
            20, // Octubre - aumento precipitación
            24, // Noviembre - pre-temporada húmeda
            26  // Diciembre - temporada húmeda
        ];
        
        // Generar 90 días de datos históricos
        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const month = date.getMonth(); // 0-11
            const basePattern = monthlyPatterns[month];
            
            // Agregar variabilidad natural (±30% del valor base)
            const variation = basePattern * 0.3;
            const randomFactor = (Math.random() - 0.5) * 2; // -1 a 1
            let precipitation = basePattern + (randomFactor * variation);
            
            // Ocasionalmente agregar eventos extremos (5% de probabilidad)
            if (Math.random() < 0.05) {
                precipitation *= 1.8; // Eventos de lluvia intensa
            }
            
            // Asegurar valores positivos y dentro del rango realista
            precipitation = Math.max(0, Math.min(precipitation, 55));
            
            data.push({
                date: date.toISOString().split('T')[0],
                precipitation: Math.round(precipitation * 100) / 100
            });
        }
        
        return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
        console.error("Error generando datos meteorológicos iniciales:", error);
        throw new Error("No se pudieron obtener los datos meteorológicos históricos del modelo de IA.");
    }
};

export const generateForecast = async (
    historicalData: WeatherDataPoint[],
    period: ForecastPeriod
): Promise<{ forecast: WeatherDataPoint[], alerts: Alert[] }> => {
    const currentDate = new Date();
    
    // Calcular estadísticas históricas para mayor realismo
    const recentData = historicalData.slice(-30);
    const avgPrecipitation = recentData.reduce((sum, d) => sum + d.precipitation, 0) / recentData.length;
    const maxPrecipitation = Math.max(...recentData.map(d => d.precipitation));
    const minPrecipitation = Math.min(...recentData.map(d => d.precipitation));
    
    // Detectar tendencias estacionales
    const month = currentDate.getMonth() + 1; // 1-12
    const isRainySeasonQuito = month >= 10 || month <= 5; // Octubre-Mayo es temporada lluviosa en Quito
    
    let prompt = '';
    let expectedPoints = 0;

    if (period === 'Diario') {
        expectedPoints = 7;
        prompt = `
            Actúa como un meteorólogo del INAMHI especializado en el clima de Papallacta.
            
            UBICACIÓN: Papallacta, Ecuador (3,220 msnm)
            FECHA ACTUAL: ${currentDate.toISOString().split('T')[0]}
            TEMPORADA: ${isRainySeasonQuito ? 'Lluviosa' : 'Seca'} (Mes ${month})
            
            DATOS HISTÓRICOS RECIENTES:
            ${JSON.stringify(recentData.slice(-7))}
            
            ESTADÍSTICAS BASE:
            - Promedio reciente: ${avgPrecipitation.toFixed(1)} mm/día
            - Rango observado: ${minPrecipitation.toFixed(1)} - ${maxPrecipitation.toFixed(1)} mm
            
            PATRÓN CLIMÁTICO JULIO (TEMPORADA SECA):
            - Precipitación típica: 6-12 mm/día
            - Días lluviosos por semana: 3-4 días
            - Días secos consecutivos: 1-2 máximo
            - Variabilidad natural: ±30% del promedio
            
            MODELO PREDICTIVO - PRÓXIMOS 7 DÍAS:
            - Mantener consistencia con patrón estacional
            - Alternar días secos (4-8mm) y húmedos (10-15mm)
            - Máximo 1 evento intenso >20mm en la semana
            - Evitar cambios bruscos día a día
            
            Fechas exactas a pronosticar:
            ${Array.from({length: 7}, (_, i) => {
                const date = new Date(currentDate);
                date.setDate(date.getDate() + i + 1);
                return date.toISOString().split('T')[0];
            }).join(', ')}
        `;
    } else if (period === 'Mensual') {
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        expectedPoints = daysInMonth;
        
        prompt = `
            Actúa como un meteorólogo del INAMHI especializado en el clima de Papallacta.
            
            UBICACIÓN: Papallacta, Ecuador (3,220 msnm)
            PERÍODO: Julio ${currentYear} completo (${daysInMonth} días)
            TEMPORADA: Seca (Julio es el mes más seco del año)
            
            DATOS HISTÓRICOS RECIENTES:
            ${JSON.stringify(recentData.slice(-15))}
            
            ESTADÍSTICAS BASE:
            - Promedio actual: ${avgPrecipitation.toFixed(1)} mm/día
            - Rango observado: ${minPrecipitation.toFixed(1)} - ${maxPrecipitation.toFixed(1)} mm
            
            PATRÓN CLIMÁTICO JULIO (CONSISTENTE CON PREDICCIÓN DIARIA):
            - Precipitación promedio mensual: 6-12 mm/día
            - Días lluviosos en el mes: ${Math.ceil(daysInMonth * 0.5)} días (50%)
            - Días secos: ${Math.floor(daysInMonth * 0.5)} días (50%)
            - Distribución semanal: 3-4 días lluvia, 3-4 días secos
            - Eventos intensos: máximo 2-3 días >20mm en todo el mes
            
            MODELO MENSUAL - ${daysInMonth} DÍAS:
            - Mantener el MISMO rango que predicción diaria (6-12mm base)
            - Alternar patrones semanales: lluvia-seco-lluvia-seco
            - Variabilidad controlada ±30% para realismo
            - Evitar picos extremos >30mm (máximo 1-2 en el mes)
            - Seguir ciclo semanal natural (más lluvia fines de semana)
            
            IMPORTANTE: Los valores deben ser SIMILARES a los de predicción diaria.
            
            Generar pronóstico para cada día:
            ${Array.from({length: daysInMonth}, (_, i) => {
                const date = new Date(currentYear, currentMonth, i + 1);
                return date.toISOString().split('T')[0];
            }).join(', ')}
        `;
    } else { // Anual
        expectedPoints = 12;
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // 0-11
        
        prompt = `
            Actúa como un climatólogo experto en patrones climáticos andinos ecuatorianos.
            
            UBICACIÓN: Páramo de Papallacta, Ecuador (3,220 msnm)
            FECHA BASE: ${currentDate.toISOString().split('T')[0]}
            MES DE INICIO: ${currentDate.toLocaleDateString('es-ES', { month: 'long' })} ${currentYear}
            
            DATOS HISTÓRICOS:
            ${JSON.stringify(recentData)}
            
            CLIMATOLOGÍA ANUAL TÍPICA PAPALLACTA (precipitación diaria promedio):
            - Enero: 25mm/día (pico lluvioso - temporada alta)
            - Febrero: 28mm/día (máximo anual - más intenso)
            - Marzo: 22mm/día (lluvia moderada-alta)
            - Abril: 20mm/día (lluvia moderada - transición)
            - Mayo: 18mm/día (transición a época seca)
            - Junio: 12mm/día (época seca - reducción)
            - Julio: 8mm/día (mínimo anual - muy seco)
            - Agosto: 10mm/día (época seca - ligero aumento)
            - Septiembre: 14mm/día (inicio transición a lluvias)
            - Octubre: 18mm/día (inicio lluvias - incremento)
            - Noviembre: 22mm/día (temporada lluviosa)
            - Diciembre: 20mm/día (pre-pico lluvioso)
            
            GENERA pronóstico MENSUAL realista siguiendo estos patrones estacionales.
            USAR variación natural ±10% sobre los valores típicos para mayor consistencia.
            
            IMPORTANTE: 
            1. Generar valores de precipitación DIARIA promedio por mes, no acumulados mensuales
            2. Mantener el patrón estacional (máximo Feb, mínimo Jul)
            3. Incluir variabilidad natural pero manteniendo la lógica climática
            4. EMPEZAR desde el mes actual y continuar 12 meses consecutivos
            
            FACTORES CLIMÁTICOS:
            1. Zona de Convergencia Intertropical (ZCIT)
            2. Fenómenos El Niño/La Niña
            3. Efectos orográficos de la Cordillera Oriental
            4. Patrones de circulación amazónica
            5. Variabilidad interanual natural
            
            Generar para los meses (usar primer día del mes):
            ${Array.from({length: 12}, (_, i) => {
                const date = new Date(currentYear, currentMonth + i, 1); // Primer día de cada mes
                return date.toISOString().split('T')[0];
            }).join(', ')}
        `;
    }

    const fullPrompt = `
        ${prompt}
        
        DESPUÉS de generar el pronóstico, crea EXACTAMENTE ${expectedPoints} ALERTAS:
        
        SISTEMA DE ALERTAS MEJORADO (específico para sistema hídrico Papallacta-Quito):
        
        TIPOS DE ALERTAS:
        - 'normal': 0-19mm/día
          * Título: 'Condiciones Normales del Sistema'
          * Descripción: Operación estándar del sistema hídrico
          
        - 'warning': 20-35mm/día  
          * Título: 'Alertas de Monitoreo - Caudales Incrementados'
          * Descripción: Seguimiento preventivo recomendado
          
        - 'critical': ≥36mm/día
          * Título: 'Riesgo Alto para Sistema Hídrico'
          * Descripción: Activación de protocolos de emergencia
        
        DISTRIBUCIÓN ESPERADA DE ALERTAS:
        ${period === 'Diario' ? '- Normal: 4-5 alertas, Warning: 2-3 alertas, Critical: 0-1 alertas' : ''}
        ${period === 'Mensual' ? '- Normal: 60-70%, Warning: 25-35%, Critical: 5-10%' : ''}
        ${period === 'Anual' ? '- Normal: 6 meses, Warning: 4-5 meses, Critical: 1-2 meses' : ''}
        
        REGLA FUNDAMENTAL: Crear un objeto de alerta para CADA punto de datos en el pronóstico.
        - Si el pronóstico tiene ${expectedPoints} puntos → GENERAR ${expectedPoints} alertas
        - Una alerta por cada fecha pronosticada
        - No omitir ninguna fecha
        
        Para predicción ${period}:
        ${period === 'Mensual' ? '- Generar alertas diarias individuales para cada día del mes' : ''}
        ${period === 'Anual' ? '- Generar alertas MENSUALES para cada mes del año (Enero, Febrero, Marzo, etc.)' : ''}
        ${period === 'Diario' ? '- Generar alertas diarias individuales para cada día de la semana' : ''}
        
        ${period === 'Anual' ? 'IMPORTANTE PARA PREDICCIÓN ANUAL: Las alertas deben representar MESES COMPLETOS, no días específicos. Usar las fechas generadas pero las alertas son para TODO EL MES correspondiente.' : ''}
        
        FORMATO DE SALIDA: JSON con 'forecast' (array de ${expectedPoints} puntos) y 'alerts' (array de EXACTAMENTE ${expectedPoints} alertas).
        La precipitación debe ser realista para el páramo andino y coherente con los datos históricos.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: forecastSchema,
                temperature: 0.4, // Reducido para mayor consistencia
                topK: 40,
                topP: 0.8
            },
        });
        
        const jsonString = response.text?.trim() || '{"forecast":[],"alerts":[]}';
        const result = JSON.parse(jsonString) as { forecast: WeatherDataPoint[], alerts: Omit<Alert, 'id'>[] };

        const finalResult = {
            forecast: result.forecast.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            alerts: result.alerts.map(alert => ({...alert, id: `alert-${alert.date}-${Math.random()}`}))
        };
        
        return finalResult;
    } catch (error) {
        console.error("Error generando el pronóstico:", error);
        throw new Error("No se pudo generar el pronóstico del tiempo desde el modelo de IA.");
    }
};

export interface ProfessionalAnalysis {
    summary: string;
    historicalTrends: string;
    forecastInsights: string;
    recommendations: string[];
    riskAssessment: string;
    operationalActions: string[];
}

export const generateProfessionalAnalysis = async (
    historicalData: WeatherDataPoint[],
    forecastData: WeatherDataPoint[],
    alerts: Alert[],
    period: ForecastPeriod
): Promise<ProfessionalAnalysis> => {
    const prompt = `
        Actúa como un experto hidrólogo y meteorólogo con 20+ años de experiencia en gestión de sistemas hídricos andinos.
        
        DATOS PARA ANÁLISIS:
        
        Datos Históricos (últimos 30 días):
        ${JSON.stringify(historicalData.slice(-30))}
        
        Pronóstico ${period} generado:
        ${JSON.stringify(forecastData)}
        
        Alertas detectadas:
        ${JSON.stringify(alerts)}
        
        CONTEXTO: Sistema hídrico Papallacta-Quito
        - Altitud: 3,220 msnm (Papallacta) hasta 2,400 msnm (Bellavista)
        - Capacidad: 20 m³/s desde captación
        - Distancia: 45 km de tubería principal
        - Población abastecida: ~2.8 millones de habitantes
        
        GENERA UN ANÁLISIS PROFESIONAL COMPLETO que incluya:
        
        1. summary: Resumen ejecutivo en 2-3 líneas sobre la situación meteorológica e hidrológica actual.
        
        2. historicalTrends: Análisis detallado de los patrones históricos observados, incluyendo:
           - Tendencias de precipitación en los últimos 30 días
           - Patrones estacionales identificados
           - Variabilidad climática observada
        
        3. forecastInsights: Análisis profesional del pronóstico generado:
           - Patrones meteorológicos esperados
           - Comparación con datos históricos
           - Confiabilidad del pronóstico
        
        4. recommendations: Lista de 4-6 recomendaciones específicas para la gestión hídrica:
           - Ajustes operacionales en las estaciones
           - Preparación para eventos extremos
           - Optimización del sistema
        
        5. riskAssessment: Evaluación profesional de riesgos:
           - Riesgos de inundación o escasez
           - Impacto en el abastecimiento
           - Preparación necesaria
        
        6. operationalActions: Lista de 3-5 acciones operativas inmediatas:
           - Acciones específicas para cada estación
           - Monitoreo especializado
           - Contingencias operativas
        
        El análisis debe ser técnico pero comprensible, enfocado en la gestión práctica del sistema hídrico.
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.3
            },
        });
        
        const jsonString = response.text?.trim() || '{}';
        const result = JSON.parse(jsonString) as ProfessionalAnalysis;
        
        return result;
    } catch (error) {
        console.error("Error generando análisis profesional:", error);
        throw new Error("No se pudo generar el análisis profesional desde el modelo de IA.");
    }
};
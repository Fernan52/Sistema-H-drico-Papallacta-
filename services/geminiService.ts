
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import { GEMINI_MODEL, FORECAST_CONFIG } from '../constants';

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
        date: { type: Type.STRING, description: "La fecha del evento pronosticado en formato YYYY-MM-DD." },
        precipitation: { type: Type.NUMBER, description: "La precipitación pronosticada en mm para esa fecha." },
        severity: { type: Type.STRING, description: "La severidad: 'warning' (advertencia) o 'critical' (crítica)." },
    },
    required: ["title", "date", "precipitation", "severity"],
};

const forecastSchema = {
    type: Type.OBJECT,
    properties: {
        forecast: initialDataSchema,
        alerts: {
          type: Type.ARRAY,
          description: "Un array de objetos de alerta para eventos meteorológicos significativos.",
          items: alertSchema,
        },
    },
    required: ["forecast", "alerts"],
};


export const generateInitialData = async (): Promise<WeatherDataPoint[]> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `Actúa como un simulador de datos meteorológicos. Genera un array JSON de datos de precipitación diaria para Papallacta, Ecuador, de los últimos 90 días. La fecha actual es ${new Date().toISOString().split('T')[0]}. El formato de fecha debe ser 'YYYY-MM-DD'. La precipitación debe estar en milímetros, con un rango de 0 a 30mm, con picos ocasionales de hasta 50mm, lo cual es típico del clima andino húmedo de la región. La salida debe ser únicamente el array JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: initialDataSchema,
                temperature: 0.7
            },
        });

        const jsonString = response.text.trim();
        const data = JSON.parse(jsonString) as WeatherDataPoint[];
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
    const config = FORECAST_CONFIG[period];
    const prompt = `
        Actúa como un modelo meteorológico de pronóstico de clase mundial con más del 95% de precisión, utilizando técnicas estadísticas avanzadas como ARIMA, Prophet y LSTM.
        Basado en los siguientes datos históricos recientes de precipitación para Papallacta, Ecuador:
        ${JSON.stringify(historicalData.slice(-30))}

        Genera un pronóstico ${period.toLowerCase()} para los próximos ${config.duration}.
        El pronóstico debe ser un array JSON de puntos de datos con 'date' (en formato YYYY-MM-DD) y 'precipitation'.
        Para 'Diario', genera ${config.points} puntos diarios.
        Para 'Mensual', genera ${config.points} puntos diarios.
        Para 'Anual', genera ${config.points} puntos de promedio mensual.

        Después de generar el pronóstico, analízalo CUIDADOSAMENTE día por día para detectar anomalías.
        Crea un objeto de alerta para CADA DÍA que cumpla con los siguientes criterios:
        - severidad 'warning' (advertencia): Precipitación entre 25mm y 39.9mm. Usa el título: 'Posibles Lluvias Fuertes'.
        - severidad 'critical' (crítica): Precipitación >= 40mm (riesgo de inundación). Usa el título: 'Alerta de Lluvias Intensas'.

        El resultado debe ser un único objeto JSON con dos claves:
        1. 'forecast': El array con los datos del pronóstico.
        2. 'alerts': Un array de objetos de alerta. Si no hay días que cumplan los criterios, devuelve un array vacío [].
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: forecastSchema,
                temperature: 0.5
            },
        });
        
        const jsonString = response.text.trim();
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
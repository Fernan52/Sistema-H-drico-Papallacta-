
export const GEMINI_MODEL = 'gemini-2.5-flash';
export const ALERT_PRECIPITATION_THRESHOLD = 20; // in mm

export const FORECAST_CONFIG = {
    Diario: { duration: '7 días', points: 7 },
    Mensual: { duration: '1 mes', points: 30 },
    Anual: { duration: '1 año', points: 12 }, // 12 points for monthly average
};

export interface WeatherDataPoint {
  date: string;
  precipitation: number;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  source?: string;
}

export type ForecastPeriod = 'Diario' | 'Mensual' | 'Anual';

export interface Alert {
  id: string;
  title: string;
  message?: string;
  date: string;
  precipitation: number;
  severity: 'normal' | 'warning' | 'critical' | 'high' | 'medium' | 'low';
  type?: 'weather' | 'operational' | 'quality';
  source?: string;
}
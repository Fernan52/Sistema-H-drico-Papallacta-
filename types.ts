
export interface WeatherDataPoint {
  date: string;
  precipitation: number;
}

export type ForecastPeriod = 'Diario' | 'Mensual' | 'Anual';

export interface Alert {
  id: string;
  title: string;
  date: string;
  precipitation: number;
  severity: 'warning' | 'critical';
}
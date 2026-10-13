export type Theme = 'light' | 'dark';
export type TemperatureUnit = 'C' | 'F';
export type WindUnit = 'kmh' | 'mph';
export type TimeFormat = '24h' | '12h';
export type PrecipitationUnit = 'mm' | 'in';
export type ForecastTab = 'hourly' | 'daily';

export interface UserSettings {
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
  timeFormat: TimeFormat;
  precipitationUnit: PrecipitationUnit;
  severeAlerts: boolean;
  dailyForecast: boolean;
  useLocation: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  temperatureUnit: 'C',
  windUnit: 'kmh',
  timeFormat: '24h',
  precipitationUnit: 'mm',
  severeAlerts: true,
  dailyForecast: false,
  useLocation: true,
};
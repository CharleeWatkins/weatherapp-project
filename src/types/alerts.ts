export type AlertSeverity = 'High' | 'Moderate' | 'Low' | 'Clear';

export type AlertType = 'thunderstorm' | 'rain' | 'wind' | 'snow' | 'clear' | 'other';

export interface WeatherAlert {
  id: string;
  type: AlertType;
  title: string;
  severity: AlertSeverity;
  location: string;
  description: string;
  until: string;
  issued: string;
}
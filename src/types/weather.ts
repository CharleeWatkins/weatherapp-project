// Internal normalized weather models — what components consume

export type WeatherCondition =
  | 'clear'
  | 'clear-night'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  condition: string;
  conditionKey: WeatherCondition;
  isDay: boolean;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  pressure: number;
  visibility: number;
  precipitation: number;
  uvIndex: number;
  uvLabel: string;
  high: number;
  low: number;
  sunrise: string;
  sunset: string;
  summary: string;
}

export interface HourlyForecast {
  label: string;
  condition: WeatherCondition;
  temp: number;
  rain: number;
  wind: number;
}

export interface DailyForecast {
  day: string;
  condition: WeatherCondition;
  low: number;
  high: number;
  uv: number;
  uvLabel: string;
  rain: number;
  wind: number;
  windDir: string;   
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

// --- Open-Meteo raw response shapes ---

export interface OpenMeteoCurrent {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  surface_pressure: number;
  precipitation: number;
  visibility?: number;
}

export interface OpenMeteoHourly {
  time: string[];
  temperature_2m: number[];
  weather_code: number[];
  precipitation_probability?: number[];
  wind_speed_10m: number[];
}

export interface OpenMeteoDaily {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_probability_max?: number[];
  wind_speed_10m_max: number[];
}

export interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  daily: OpenMeteoDaily;
}
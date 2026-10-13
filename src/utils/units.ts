import type {
  TemperatureUnit,
  WindUnit,
  PrecipitationUnit,
  TimeFormat,
} from '../types/settings';

// ---------------------------------------------------------------------------
// Temperature
// ---------------------------------------------------------------------------
// Open-Meteo always returns Celsius. We convert to Fahrenheit when needed.
export function convertTemp(
  celsius: number,
  unit: TemperatureUnit
): number {
  if (unit === 'F') return Math.round(celsius * 1.8 + 32);
  return Math.round(celsius);
}

export function formatTemp(celsius: number, unit: TemperatureUnit): string {
  return `${convertTemp(celsius, unit)}°`;
}

export function temperatureLabel(unit: TemperatureUnit): string {
  return unit === 'F' ? '°F' : '°C';
}

// ---------------------------------------------------------------------------
// Wind speed
// ---------------------------------------------------------------------------
// Open-Meteo returns km/h. We convert to mph when needed.
export function convertWind(kmh: number, unit: WindUnit): number {
  if (unit === 'mph') return Math.round(kmh * 0.621371);
  return Math.round(kmh);
}

export function formatWind(kmh: number, unit: WindUnit): string {
  const value = convertWind(kmh, unit);
  const suffix = unit === 'mph' ? 'mph' : 'km/h';
  return `${value} ${suffix}`;
}

// ---------------------------------------------------------------------------
// Precipitation
// ---------------------------------------------------------------------------
// Open-Meteo returns mm. We convert to inches when needed.
export function convertPrecipitation(mm: number, unit: PrecipitationUnit): number {
  if (unit === 'in') return Math.round(mm * 0.0393701 * 100) / 100;
  return Math.round(mm * 10) / 10;
}

export function formatPrecipitation(mm: number, unit: PrecipitationUnit): string {
  const value = convertPrecipitation(mm, unit);
  return unit === 'in' ? `${value} in` : `${value} mm`;
}

// ---------------------------------------------------------------------------
// Time
// ---------------------------------------------------------------------------
// Input is a formatted string like "6:42 AM" from Open-Meteo.
// For "24h" we convert "6:42 AM" → "06:42", "7:18 PM" → "19:18".
// For "12h" we leave it as-is.
export function formatTime(timeStr: string, format: TimeFormat): string {
  if (format === '12h') return timeStr;

  // Parse "6:42 AM" or "7:18 PM"
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return timeStr;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

// For hourly forecast labels — convert "2pm" → "14:00" style
export function formatHourLabel(label: string, format: TimeFormat): string {
  if (label === 'Now') return label;
  if (format === '12h') return label;

  const match = label.match(/^(\d{1,2})(am|pm)$/i);
  if (!match) return label;

  let hours = parseInt(match[1], 10);
  const period = match[2].toLowerCase();

  if (period === 'pm' && hours !== 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:00`;
}

// ---------------------------------------------------------------------------
// UV label — unchanged by unit, but here for consistency
// ---------------------------------------------------------------------------
export function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very high';
  return 'Extreme';
}
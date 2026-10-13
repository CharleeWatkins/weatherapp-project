import type {
  WeatherCondition,
  WeatherData,
  OpenMeteoResponse,
} from '../types/weather';
import type { Location, SearchResult } from '../types/location';

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

// ---- WMO code → internal condition ----
export function wmoToCondition(code: number, isDay = 1): WeatherCondition {
  if (code === 0) return isDay ? 'clear' : 'clear-night';
  if (code === 1 || code === 2) return 'partly-cloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 51 && code <= 57) return 'rain';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rain';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95) return 'thunderstorm';
  return 'cloudy';
}

export function wmoToLabel(code: number): string {
  const labels: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Violent rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  };
  return labels[code] ?? 'Cloudy';
}

// ---- Cache ----
const weatherCache = new Map<string, { t: number; data: WeatherData }>();
const geoCache = new Map<string, { t: number; data: SearchResult[] }>();
const WEATHER_TTL = 10 * 60 * 1000;
const GEO_TTL = 60 * 60 * 1000;

function getCached<T>(cache: Map<string, { t: number; data: T }>, key: string, ttl: number): T | null {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < ttl) return hit.data;
  return null;
}

// ---- Geocoding ----
interface OpenMeteoGeoResult {
  id: number;
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

interface OpenMeteoGeoResponse {
  results?: OpenMeteoGeoResult[];
}

export async function searchLocations(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = query.toLowerCase().trim();
  const cached = getCached(geoCache, cacheKey, GEO_TTL);
  if (cached) return cached;

  const url = `${GEO_URL}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Location search failed');
  const data: OpenMeteoGeoResponse = await res.json();

  const results: SearchResult[] = (data.results ?? []).map(r => ({
    id: String(r.id),
    name: r.name,
    region: r.admin1 ?? '',
    country: r.country ?? '',
    lat: r.latitude,
    lng: r.longitude,
  }));

  geoCache.set(cacheKey, { t: Date.now(), data: results });
  return results;
}

// ---- Reverse geocoding ----
export async function reverseGeocode(lat: number, lng: number): Promise<Location> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      name: data.city || data.locality || data.principalSubdivision || 'Current location',
      region: data.principalSubdivision || '',
      country: data.countryName || '',
      lat,
      lng,
    };
  } catch {
    return { name: 'Current location', region: '', country: '', lat, lng };
  }
}

// ---- Weather ----
export async function getWeather(lat: number, lng: number): Promise<WeatherData> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = getCached(weatherCache, cacheKey, WEATHER_TTL);
  if (cached) return cached;

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'surface_pressure',
      'precipitation',
      'visibility',
    ].join(','),
    hourly: [
      'temperature_2m',
      'weather_code',
      'precipitation_probability',
      'wind_speed_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_probability_max',
      'wind_speed_10m_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  const raw: OpenMeteoResponse = await res.json();

  const normalized = normalizeWeather(raw);
  weatherCache.set(cacheKey, { t: Date.now(), data: normalized });
  return normalized;
}

// ---- Normalization ----
function normalizeWeather(data: OpenMeteoResponse): WeatherData {
  const c = data.current;
  const h = data.hourly;
  const d = data.daily;

  const now = new Date();
  const nowHourIso = new Date(now);
  nowHourIso.setMinutes(0, 0, 0);
  let currentHourIndex = h.time.findIndex(
    t => new Date(t).getTime() === nowHourIso.getTime()
  );
  if (currentHourIndex < 0) currentHourIndex = 0;

  const hourly = h.time.slice(currentHourIndex, currentHourIndex + 12).map((t, i) => {
    const idx = currentHourIndex + i;
    const hour = new Date(t).getHours();
    return {
      label: i === 0 ? 'Now' : `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`,
      condition: wmoToCondition(h.weather_code[idx], 1),
      temp: Math.round(h.temperature_2m[idx]),
      rain: h.precipitation_probability?.[idx] ?? 0,
      wind: Math.round(h.wind_speed_10m[idx]),
    };
  });

  const daily = d.time.map((t, i) => {
    const date = new Date(t);
    const dayName =
      i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en', { weekday: 'short' });
    return {
      day: dayName,
      condition: wmoToCondition(d.weather_code[i], 1),
      low: Math.round(d.temperature_2m_min[i]),
      high: Math.round(d.temperature_2m_max[i]),
      uv: Math.round(d.uv_index_max[i] ?? 0),
      uvLabel: uvLabel(d.uv_index_max[i] ?? 0),
      rain: d.precipitation_probability_max?.[i] ?? 0,
      wind: Math.round(d.wind_speed_10m_max[i]),
      windDir: '',
      sunrise: formatTime(d.sunrise[i]),
      sunset: formatTime(d.sunset[i]),
    };
  });

  return {
    current: {
      temp: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      condition: wmoToLabel(c.weather_code),
      conditionKey: wmoToCondition(c.weather_code, c.is_day),
      isDay: c.is_day === 1,
      humidity: c.relative_humidity_2m,
      windSpeed: Math.round(c.wind_speed_10m),
      windDirection: degToCompass(c.wind_direction_10m),
      pressure: Math.round(c.surface_pressure),
      visibility: c.visibility != null ? Math.round(c.visibility / 1000) : 10,
      precipitation: c.precipitation ?? 0,
      uvIndex: daily[0]?.uv ?? 0,
      uvLabel: daily[0]?.uvLabel ?? 'Low',
      high: daily[0]?.high ?? 0,
      low: daily[0]?.low ?? 0,
      sunrise: daily[0]?.sunrise ?? '',
      sunset: daily[0]?.sunset ?? '',
      summary: 'Updated just now.',
    },
    hourly,
    daily,
  };
}

function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very high';
  return 'Extreme';
}

function degToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return `${dirs[Math.round(deg / 45) % 8]} ${Math.round(deg)}°`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
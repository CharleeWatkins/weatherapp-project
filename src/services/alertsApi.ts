import type { WeatherAlert, AlertSeverity, AlertType } from '../types/alerts';
import { getItem, setItem, STORAGE_KEYS } from './storage';

const KEY = import.meta.env.VITE_WEATHERAPI_KEY;
const ALERTS_URL = 'https://api.weatherapi.com/v1/alerts.json';

interface WeatherApiAlert {
  headline: string;
  severity: string;
  event: string;
  desc: string;
  effective: string;
  expires: string;
  areas: string;
}

interface WeatherApiResponse {
  alerts?: {
    alert?: WeatherApiAlert[];
  };
  error?: {
    code: number;
    message: string;
  };
}

interface AlertCache {
  [key: string]: { t: number; data: WeatherAlert[] };
}

const CACHE_TTL = 15 * 60 * 1000;

export async function getAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const cache = getItem<AlertCache>(STORAGE_KEYS.ALERTS_CACHE, {});
  const hit = cache[cacheKey];

  if (hit && Date.now() - hit.t < CACHE_TTL) {
    return hit.data;
  }

  if (!KEY) {
    console.warn('[alertsApi] No VITE_WEATHERAPI_KEY set — alerts disabled.');
    return [];
  }

  try {
    const url = `${ALERTS_URL}?key=${KEY}&q=${lat},${lng}&aqi=no`;
    const res = await fetch(url);
    const json: WeatherApiResponse = await res.json();

    if (json.error) {
      console.error('[alertsApi] WeatherAPI error:', json.error.message);
      return [];
    }

    const alerts: WeatherAlert[] = (json.alerts?.alert ?? []).map((a, i) => ({
      id: `${cacheKey}-${i}`,
      type: mapEventToType(a.event),
      title: a.headline || a.event || 'Weather alert',
      severity: mapSeverity(a.severity),
      location: a.areas || 'Your area',
      description: a.desc,
      until: formatDateTime(a.expires),
      issued: formatTime(a.effective),
    }));

    cache[cacheKey] = { t: Date.now(), data: alerts };
    setItem(STORAGE_KEYS.ALERTS_CACHE, cache);

    return alerts;
  } catch (err) {
    console.error('[alertsApi] Fetch failed:', err);
    return [];
  }
}

function mapSeverity(severity: string): AlertSeverity {
  const s = (severity || '').toLowerCase();
  if (s.includes('extreme') || s.includes('severe')) return 'High';
  if (s.includes('moderate')) return 'Moderate';
  if (s.includes('minor')) return 'Low';
  return 'Moderate';
}

function mapEventToType(event: string): AlertType {
  const e = (event || '').toLowerCase();
  if (e.includes('thunder') || e.includes('lightning')) return 'thunderstorm';
  if (e.includes('rain') || e.includes('flood')) return 'rain';
  if (e.includes('wind') || e.includes('gale')) return 'wind';
  if (e.includes('snow') || e.includes('ice') || e.includes('blizzard')) return 'snow';
  return 'other';
}

function formatDateTime(iso: string): string {
  if (!iso) return 'Unknown';
  try {
    return new Date(iso).toLocaleString('en', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatTime(iso: string): string {
  if (!iso) return 'Unknown';
  try {
    return new Date(iso).toLocaleTimeString('en', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
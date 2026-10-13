const PREFIX = 'weatherapp:';

function isAvailable(): boolean {
  try {
    const test = '__weatherapp_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const available = isAvailable();

export function getItem<T>(key: string, fallback: T): T {
  if (!available) return fallback;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): boolean {
  if (!available) return false;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string): void {
  if (!available) return;
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export function clearAll(): void {
  if (!available) return;
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  SAVED_LOCATIONS: 'savedLocations',
  ACTIVE_LOCATION: 'activeLocation',
  RECENT_SEARCHES: 'recentSearches',
  SETTINGS: 'settings',
  THEME: 'theme',
  ALERTS_CACHE: 'alertsCache',
  WEATHER_CACHE_PREFIX: 'weatherCache:',
} as const;
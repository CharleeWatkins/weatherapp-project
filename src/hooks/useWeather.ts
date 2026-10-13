import { useEffect, useReducer } from 'react';
import { getWeather } from '../services/weatherApi';
import { getItem, setItem, STORAGE_KEYS } from '../services/storage';
import type { WeatherData } from '../types/weather';

interface CachedWeather {
  data: WeatherData;
  cachedAt: number;
}

interface UseWeatherResult {
  data: WeatherData | null;
  loading: boolean;
  error: Error | null;
  isStale: boolean;         // true when we're showing cached data
  cachedAt: number | null;  // timestamp of the cached data
}

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: Error | null;
  isStale: boolean;
  cachedAt: number | null;
}

type WeatherAction =
  | { type: 'start' }
  | { type: 'success'; data: WeatherData }
  | { type: 'cache'; data: WeatherData; cachedAt: number }
  | { type: 'error'; error: Error }
  | { type: 'finish' }
  | { type: 'reset' };

const initialState: WeatherState = {
  data: null,
  loading: true,
  error: null,
  isStale: false,
  cachedAt: null,
};

function weatherReducer(state: WeatherState, action: WeatherAction): WeatherState {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        loading: true,
        error: null,
        isStale: false,
        cachedAt: null,
      };
    case 'success':
      return {
        data: action.data,
        loading: false,
        error: null,
        isStale: false,
        cachedAt: null,
      };
    case 'cache':
      return {
        data: action.data,
        loading: false,
        error: null,
        isStale: true,
        cachedAt: action.cachedAt,
      };
    case 'error':
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case 'finish':
      return {
        ...state,
        loading: false,
      };
    case 'reset':
      return initialState;
    default:
      return state;
  }
}

export function useWeather(
  lat: number | null,
  lng: number | null
): UseWeatherResult {
  const [state, dispatch] = useReducer(weatherReducer, initialState);

  useEffect(() => {
    if (lat == null || lng == null) {
      dispatch({ type: 'reset' });
      return;
    }

    const cacheKey = `${STORAGE_KEYS.WEATHER_CACHE_PREFIX}${lat.toFixed(3)},${lng.toFixed(3)}`;
    let cancelled = false;

    dispatch({ type: 'start' });

    getWeather(lat, lng)
      .then(result => {
        if (cancelled) return;

        dispatch({ type: 'success', data: result });

        // Persist for offline fallback
        const payload: CachedWeather = { data: result, cachedAt: Date.now() };
        setItem(cacheKey, payload);
      })
      .catch(err => {
        if (cancelled) return;

        // Try cache
        const cached = getItem<CachedWeather | null>(cacheKey, null);
        if (cached) {
          dispatch({ type: 'cache', data: cached.data, cachedAt: cached.cachedAt });
        } else {
          dispatch({ type: 'error', error: err instanceof Error ? err : new Error(String(err)) });
        }
      })
      .finally(() => {
        if (!cancelled) {
          dispatch({ type: 'finish' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return { ...state };
}
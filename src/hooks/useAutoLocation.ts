import { useEffect, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../services/storage';
import { reverseGeocode } from '../services/weatherApi';
import type { Location } from '../types/location';

const FALLBACK_LOCATION: Location = {
  name: 'Kimberley',
  region: 'South Africa',
  lat: -28.7282,
  lng: 24.7499,
};

/**
 * On first app load:
 *   - If a location is already saved, do nothing.
 *   - Otherwise ask for geolocation permission.
 *   - If granted, reverse-geocode and save it.
 *   - If denied or unavailable, save the fallback.
 *
 * Returns the active location (or null while it's still resolving).
 */
export function useAutoLocation(): Location | null {
  const [stored, setStored] = useLocalStorage<Location | null>(
    STORAGE_KEYS.ACTIVE_LOCATION,
    null
  );
  const [resolved, setResolved] = useState<Location | null>(stored);

  useEffect(() => {
    // Already have a location — nothing to do.
    if (stored) {
      return;
    }

    // No geolocation support → use fallback.
    if (!('geolocation' in navigator)) {
      setStored(FALLBACK_LOCATION);
      return;
    }

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      async pos => {
        if (cancelled) return;
        const { latitude, longitude } = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        const loc: Location = { ...place, lat: latitude, lng: longitude };
        setStored(loc);
        setResolved(loc);
      },
      () => {
        // Denied or errored → fallback.
        if (cancelled) return;
        setStored(FALLBACK_LOCATION);
      },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );

    return () => {
      cancelled = true;
    };
  }, [stored, setStored]);

  return stored ?? resolved;
}
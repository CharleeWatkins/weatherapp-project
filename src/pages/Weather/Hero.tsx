import { useState } from 'react';
import { MapPin, Star, Cloud, Navigation } from 'lucide-react';
import WeatherIcon from '../../components/ui/WeatherIcon';
import { useToast } from '../../context/ToastContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../services/storage';
import { reverseGeocode } from '../../services/weatherApi';
import { formatTemp } from '../../utils/units';
import type { CurrentWeather } from '../../types/weather';
import type { Location } from '../../types/location';
import type { TemperatureUnit } from '../../types/settings';

interface HeroProps {
  current: CurrentWeather;
  location: Location;
  isSaved: boolean;
  setIsSaved: (saved: boolean) => void;
  temperatureUnit: TemperatureUnit;
}

const HERO_CLASS: Record<string, string> = {
  clear: 'hero--clear-day',
  'clear-night': 'hero--clear-night',
  'partly-cloudy': 'hero--partly-cloudy',
  cloudy: 'hero--partly-cloudy',
  fog: 'hero--partly-cloudy',
  rain: 'hero--rain',
  snow: 'hero--rain',
  thunderstorm: 'hero--thunderstorm',
};

export default function Hero({
  current,
  location,
  isSaved,
  setIsSaved,
  temperatureUnit,
}: HeroProps) {
  const [locating, setLocating] = useState(false);
  const [, setActiveLocation] = useLocalStorage<Location>(
    STORAGE_KEYS.ACTIVE_LOCATION,
    location
  );
  const { show } = useToast();

  const heroClass = HERO_CLASS[current.conditionKey] ?? 'hero--partly-cloudy';

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      show('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        setActiveLocation({ ...place, lat: latitude, lng: longitude });
        show(`Location set to ${place.name}`, 'success');
        setLocating(false);
      },
      () => {
        show('Could not get your location', 'error');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <>
      <div className={`hero ${heroClass}`}>
        <div className="hero__blob hero__blob--tr" />
        <div className="hero__blob hero__blob--bl" />

        <div className="hero__inner">
          <div className="hero__top">
            <div>
              <div className="hero__location">
                <MapPin size={18} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                <span className="hero__location-name">{location.name}</span>
                {location.region && (
                  <span className="hero__location-region">· {location.region}</span>
                )}
              </div>
              <div className="hero__date">
                {new Date().toLocaleDateString('en', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
            <button
              type="button"
              className={`hero__star-btn${isSaved ? ' hero__star-btn--saved' : ''}`}
              onClick={() => {
                setIsSaved(!isSaved);
                show(isSaved ? 'Removed from saved' : 'Added to saved', 'success');
              }}
              aria-label="Save location"
            >
              <Star
                size={22}
                color={isSaved ? '#FCD34D' : 'rgba(255,255,255,0.9)'}
                fill={isSaved ? '#FCD34D' : 'none'}
                strokeWidth={1.8}
              />
            </button>
          </div>

          <div className="hero__body">
            <div>
              <div className="hero__temp">
                {formatTemp(current.temp, temperatureUnit)}
              </div>
              <div className="hero__condition">{current.condition}</div>
              <div className="hero__highlow">
                H: {formatTemp(current.high, temperatureUnit)} L:{' '}
                {formatTemp(current.low, temperatureUnit)}
              </div>
              <div className="hero__summary">
                <Cloud size={16} />
                {current.summary}
              </div>
            </div>
            <WeatherIcon
              condition={current.conditionKey}
              size={140}
              color="rgba(255,255,255,0.85)"
              strokeWidth={1}
              style={{ flexShrink: 0 }}
            />
          </div>
        </div>
      </div>

      <div className="location-strip">
        <button
          className="location-strip__btn"
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
        >
          <Navigation size={16} strokeWidth={2.5} />
          {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>
    </>
  );
}
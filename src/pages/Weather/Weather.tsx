import { useState, useEffect } from 'react';
import {
  Clock, Calendar, Loader2, AlertTriangle,
  Thermometer, Droplets, Wind, Compass, Gauge, Eye, Sun,
  Sunrise, Sunset,
} from 'lucide-react';
import Hero from './Hero';
import DailyForecast from './DailyForecast';
import HourlyForecast from './HourlyForecast';
import Section from '../../components/layout/Section';
import PillToggle from '../../components/ui/PillToggle';
import { useWeather } from '../../hooks/useWeather';
import { useAutoLocation } from '../../hooks/useAutoLocation';
import { useSettings } from '../../context/SettingsContext';
import { setLastCachedAt } from '../../data/offlineState';
import {
  formatTemp,
  formatWind,
  formatPrecipitation,
  formatTime,
} from '../../utils/units';
import type { ForecastTab } from '../../types/settings';

interface WeatherPageProps {
  isSaved: boolean;
  setIsSaved: (saved: boolean) => void;
}

export default function Weather({ isSaved, setIsSaved }: WeatherPageProps) {
  const [forecastTab, setForecastTab] = useState<ForecastTab>('daily');
  const location = useAutoLocation();
  const { data, loading, error, isStale, cachedAt } = useWeather(
    location?.lat ?? null,
    location?.lng ?? null
  );
  const { settings } = useSettings();

  // Push the cached timestamp into the global store so the offline banner
  // knows whether it should show.
  useEffect(() => {
    setLastCachedAt(isStale ? cachedAt : null);
  }, [isStale, cachedAt]);

  if (loading && !data) {
    return (
      <div className="state-screen">
        <Loader2 size={28} className="search-bar__spinner" color="var(--sky-500)" />
        <div className="state-screen__text">Loading weather…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-screen">
        <AlertTriangle size={28} color="#EF4444" />
        <div className="state-screen__text state-screen__text--error">
          Couldn't load weather: {error.message}
        </div>
      </div>
    );
  }

  if (!data || !location) return null;

  const c = data.current;
  const { temperatureUnit, windUnit, precipitationUnit, timeFormat } = settings;

  const details = [
    {
      key: 'feels-like',
      icon: Thermometer,
      iconColor: '#F97316',
      label: 'Feels like',
      value: formatTemp(c.feelsLike, temperatureUnit),
    },
    {
      key: 'humidity',
      icon: Droplets,
      iconColor: '#3B82F6',
      label: 'Humidity',
      value: `${c.humidity}%`,
    },
    {
      key: 'wind',
      icon: Wind,
      iconColor: '#14B8A6',
      label: 'Wind',
      value: formatWind(c.windSpeed, windUnit),
    },
    {
      key: 'direction',
      icon: Compass,
      iconColor: '#8B5CF6',
      label: 'Direction',
      value: c.windDirection,
    },
    {
      key: 'pressure',
      icon: Gauge,
      iconColor: '#6366F1',
      label: 'Pressure',
      value: `${c.pressure} hPa`,
    },
    {
      key: 'visibility',
      icon: Eye,
      iconColor: '#0EA5E9',
      label: 'Visibility',
      value: `${c.visibility} km`,
    },
    {
      key: 'precipitation',
      icon: Droplets,
      iconColor: '#3B82F6',
      label: 'Precipitation',
      value: formatPrecipitation(c.precipitation, precipitationUnit),
    },
    {
      key: 'uv',
      icon: Sun,
      iconColor: '#F59E0B',
      label: 'UV index',
      value: `${c.uvIndex} · ${c.uvLabel}`,
    },
  ];

  return (
    <div>
      <Hero
        current={c}
        location={location}
        isSaved={isSaved}
        setIsSaved={setIsSaved}
        temperatureUnit={temperatureUnit}
      />

      <Section py={48}>
        <h2 className="section-title">Today's details</h2>
        <p className="section-subtitle" style={{ marginBottom: 24 }}>
          Current conditions at a glance
        </p>
        <div className="details-grid">
          {details.map(d => {
            const Icon = d.icon;
            return (
              <div
                key={d.key}
                className={`details-grid__item details-grid__item--${d.key}`}
              >
                <div className="details-grid__label">
                  <span className="details-grid__icon">
                    <Icon size={16} color={d.iconColor} strokeWidth={2} />
                  </span>
                  {d.label}
                </div>
                <div className="details-grid__value">{d.value}</div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section py={0}>
        <div className="sunrise-sunset">
          <div className="sunrise-sunset__cell sunrise-sunset__cell--sunrise">
            <Sunrise size={28} color="#D97706" strokeWidth={1.8} />
            <div>
              <div className="sunrise-sunset__label">Sunrise</div>
              <div className="sunrise-sunset__time">
                {formatTime(c.sunrise, timeFormat)}
              </div>
            </div>
          </div>
          <div className="sunrise-sunset__cell sunrise-sunset__cell--sunset">
            <Sunset size={28} color="#EA580C" strokeWidth={1.8} />
            <div>
              <div className="sunrise-sunset__label">Sunset</div>
              <div className="sunrise-sunset__time">
                {formatTime(c.sunset, timeFormat)}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section py={56} bordered>
        <div className="forecast-head">
          <div>
            <h2 className="section-title">Forecast</h2>
            <p className="section-subtitle">A little planning goes a long way</p>
          </div>
          <PillToggle<ForecastTab>
            value={forecastTab}
            onChange={setForecastTab}
            options={[
              { value: 'hourly', label: 'Hourly', icon: Clock },
              { value: 'daily', label: 'Daily', icon: Calendar },
            ]}
          />
        </div>

        {forecastTab === 'daily' && (
          <DailyForecast
            days={data.daily}
            temperatureUnit={temperatureUnit}
            windUnit={windUnit}
            timeFormat={timeFormat}
          />
        )}
        {forecastTab === 'hourly' && (
          <HourlyForecast
            hours={data.hourly}
            temperatureUnit={temperatureUnit}
            windUnit={windUnit}
            timeFormat={timeFormat}
          />
        )}
      </Section>
    </div>
  );
}
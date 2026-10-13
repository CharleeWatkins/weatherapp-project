import { Droplets, Wind } from 'lucide-react';
import WeatherIcon from '../../components/ui/WeatherIcon';
import type { HourlyForecast as HourlyForecastType } from '../../types/weather';
import type { TemperatureUnit, WindUnit, TimeFormat } from '../../types/settings';
import { formatTemp, formatWind, formatHourLabel } from '../../utils/units';

interface HourlyForecastProps {
  hours: HourlyForecastType[];
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
  timeFormat: TimeFormat;
}

export default function HourlyForecast({
  hours,
  temperatureUnit,
  windUnit,
  timeFormat,
}: HourlyForecastProps) {
  if (hours.length === 0) return null;

  return (
    <div className="hourly">
      {hours.map((h, i) => (
        <div key={i} className={`hourly__card${i === 0 ? ' hourly__card--now' : ''}`}>
          <div className={`hourly__time${i === 0 ? ' hourly__time--now' : ''}`}>
            {formatHourLabel(h.label, timeFormat)}
          </div>
          <WeatherIcon
            condition={h.condition}
            size={28}
            color="var(--text-secondary)"
            style={{ margin: '0 auto 10px', display: 'block' }}
          />
          <div className="hourly__temp">
            {formatTemp(h.temp, temperatureUnit)}
          </div>
          <div className="hourly__meta hourly__meta--rain">
            <Droplets size={11} /> {h.rain}%
          </div>
          <div className="hourly__meta hourly__meta--wind">
            <Wind size={11} /> {formatWind(h.wind, windUnit)}
          </div>
        </div>
      ))}
    </div>
  );
}
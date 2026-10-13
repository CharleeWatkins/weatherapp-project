import { useState } from 'react';
import { ChevronDown, Sun, Droplets, Wind, Sunrise, Sunset, LucideIcon } from 'lucide-react';
import WeatherIcon from '../../components/ui/WeatherIcon';
import type { DailyForecast as DailyForecastType } from '../../types/weather';
import type { TemperatureUnit, WindUnit, TimeFormat } from '../../types/settings';
import { formatTemp, formatWind, formatTime } from '../../utils/units';

interface DailyForecastProps {
  days: DailyForecastType[];
  temperatureUnit: TemperatureUnit;
  windUnit: WindUnit;
  timeFormat: TimeFormat;
}

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

function Stat({ icon: Icon, label, value, color }: StatProps) {
  return (
    <div>
      <div className="daily__stat-label">
        <Icon size={14} color={color} strokeWidth={2} />
        {label}
      </div>
      <div className="daily__stat-value">{value}</div>
    </div>
  );
}

export default function DailyForecast({
  days,
  temperatureUnit,
  windUnit,
  timeFormat,
}: DailyForecastProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  if (days.length === 0) return null;

  const lows = days.map(d => d.low);
  const highs = days.map(d => d.high);
  const weekMin = Math.min(...lows);
  const weekMax = Math.max(...highs);
  const range = Math.max(weekMax - weekMin, 1);

  return (
    <div className="daily">
      {days.map((d, i) => {
        const expanded = expandedDay === i;
        const rangeLeft = ((d.low - weekMin) / range) * 100;
        const rangeWidth = ((d.high - d.low) / range) * 100;

        return (
          <div className="daily__row" key={i}>
            <button
              type="button"
              className={`daily__button${expanded ? ' daily__button--expanded' : ''}`}
              onClick={() => setExpandedDay(expanded ? null : i)}
            >
              <span className="daily__day">{d.day}</span>
              <WeatherIcon
                condition={d.condition}
                size={22}
                color="var(--text-secondary)"
                style={{ marginRight: 16, flexShrink: 0 }}
              />
              <span className="daily__low">
                {formatTemp(d.low, temperatureUnit)}
              </span>
              <div className="daily__bar-wrap">
                <div
                  className="daily__bar-fill"
                  style={{
                    left: `${rangeLeft}%`,
                    width: `${Math.max(rangeWidth, 6)}%`,
                  }}
                />
              </div>
              <span className="daily__high">
                {formatTemp(d.high, temperatureUnit)}
              </span>
              <ChevronDown
                size={18}
                color="var(--text-muted)"
                className={`daily__chevron${expanded ? ' daily__chevron--open' : ''}`}
              />
            </button>

            {expanded && (
              <div className="daily__expanded">
                <Stat
                  icon={Sun}
                  label="UV index"
                  value={`${d.uv} · ${d.uvLabel}`}
                  color="#F59E0B"
                />
                <Stat
                  icon={Droplets}
                  label="Rain chance"
                  value={`${d.rain}%`}
                  color="#3B82F6"
                />
                <Stat
                  icon={Wind}
                  label="Wind"
                  value={formatWind(d.wind, windUnit)}
                  color="#14B8A6"
                />
                <Stat
                  icon={Sunrise}
                  label="Sunrise"
                  value={formatTime(d.sunrise, timeFormat)}
                  color="#F97316"
                />
                <Stat
                  icon={Sunset}
                  label="Sunset"
                  value={formatTime(d.sunset, timeFormat)}
                  color="#EF4444"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
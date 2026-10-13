import {
  Wind, Droplets, Sun, Moon, Bell, Calendar, Navigation, Check, Clock,
} from 'lucide-react';
import Section from '../../components/layout/Section';
import ToggleSwitch from '../../components/ui/ToggleSwitch';
import { useTheme } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import type { Location } from '../../types/location';
import type {
  TemperatureUnit,
  WindUnit,
  PrecipitationUnit,
  TimeFormat,
} from '../../types/settings';

const DEFAULT_LOCATION: Location = {
  name: 'Kimberley',
  region: 'South Africa',
  lat: -28.7282,
  lng: 24.7499,
};

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const [activeLocation] = useLocalStorage<Location>(
    STORAGE_KEYS.ACTIVE_LOCATION,
    DEFAULT_LOCATION
  );
  const { show } = useToast();

  const changeTemp = (unit: TemperatureUnit) => {
    updateSetting('temperatureUnit', unit);
    show(`Temperature updated to °${unit}`, 'success');
  };

  const changeWind = (unit: WindUnit) => {
    updateSetting('windUnit', unit);
    show(`Wind speed updated to ${unit === 'kmh' ? 'km/h' : 'mph'}`, 'success');
  };

  const changePrecip = (unit: PrecipitationUnit) => {
    updateSetting('precipitationUnit', unit);
    show(`Precipitation updated to ${unit}`, 'success');
  };

  const changeTime = (format: TimeFormat) => {
    updateSetting('timeFormat', format);
    show(`Time format updated to ${format}`, 'success');
  };

  return (
    <div>
      <Section py={56}>
        <h2 className="section-title">Settings</h2>
        <p className="section-subtitle" style={{ marginBottom: 32 }}>
          A forecast that feels like you.
        </p>

        <div className="settings-grid">
          {/* ---------------- LEFT COLUMN ---------------- */}
          <div className="settings-col">
            {/* Units */}
            <div className="settings-card">
              <h3 className="settings-card__title">Units</h3>
              <p className="settings-card__subtitle">Keep the numbers familiar.</p>

              {/* Temperature */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}
              >
                Temperature
              </div>
              <div className="settings-temp-toggle">
                {(['C', 'F'] as TemperatureUnit[]).map(unit => (
                  <button
                    key={unit}
                    type="button"
                    className={`settings-temp-btn${settings.temperatureUnit === unit ? ' settings-temp-btn--active' : ''}`}
                    onClick={() => changeTemp(unit)}
                  >
                    °{unit} {unit === 'C' ? 'Celsius' : 'Fahrenheit'}
                  </button>
                ))}
              </div>

              {/* Wind speed */}
              <div className="settings-row">
                <div className="settings-row__left">
                  <Wind size={16} color="#14B8A6" />
                  <span className="settings-row__label">Wind speed</span>
                </div>
                <div className="settings-value">
                  <button
                    type="button"
                    className={`settings-temp-btn${settings.windUnit === 'kmh' ? ' settings-temp-btn--active' : ''}`}
                    onClick={() => changeWind('kmh')}
                    style={{ padding: '4px 10px', fontSize: 12, flex: 'none' }}
                  >
                    km/h
                  </button>
                  <button
                    type="button"
                    className={`settings-temp-btn${settings.windUnit === 'mph' ? ' settings-temp-btn--active' : ''}`}
                    onClick={() => changeWind('mph')}
                    style={{ padding: '4px 10px', fontSize: 12, flex: 'none' }}
                  >
                    mph
                  </button>
                </div>
              </div>

              {/* Precipitation */}
              <div className="settings-row">
                <div className="settings-row__left">
                  <Droplets size={16} color="#3B82F6" />
                  <span className="settings-row__label">Precipitation</span>
                </div>
                <div className="settings-value">
                  <button
                    type="button"
                    className={`settings-temp-btn${settings.precipitationUnit === 'mm' ? ' settings-temp-btn--active' : ''}`}
                    onClick={() => changePrecip('mm')}
                    style={{ padding: '4px 10px', fontSize: 12, flex: 'none' }}
                  >
                    mm
                  </button>
                  <button
                    type="button"
                    className={`settings-temp-btn${settings.precipitationUnit === 'in' ? ' settings-temp-btn--active' : ''}`}
                    onClick={() => changePrecip('in')}
                    style={{ padding: '4px 10px', fontSize: 12, flex: 'none' }}
                  >
                    in
                  </button>
                </div>
              </div>

              {/* Time format */}
              <div className="settings-row">
                <div className="settings-row__left">
                  <Clock size={16} color="#A855F7" />
                  <span className="settings-row__label">Time format</span>
                </div>
                <div className="settings-value">
                  <button
                    type="button"
                    className={`settings-temp-btn${settings.timeFormat === '24h' ? ' settings-temp-btn--active' : ''}`}
                    onClick={() => changeTime('24h')}
                    style={{ padding: '4px 10px', fontSize: 12, flex: 'none' }}
                  >
                    24h
                  </button>
                  <button
                    type="button"
                    className={`settings-temp-btn${settings.timeFormat === '12h' ? ' settings-temp-btn--active' : ''}`}
                    onClick={() => changeTime('12h')}
                    style={{ padding: '4px 10px', fontSize: 12, flex: 'none' }}
                  >
                    12h
                  </button>
                </div>
              </div>
            </div>

            {/* Default location */}
            <div className="settings-card">
              <h3 className="settings-card__title" style={{ marginBottom: 16 }}>
                Default location
              </h3>
              <div className="settings-row" style={{ borderBottom: 'none', paddingTop: 0 }}>
                <div className="settings-row__left">
                  <Navigation size={16} color="var(--sky-500)" />
                  <div>
                    <div className="settings-row__label">{activeLocation.name}</div>
                    <div className="settings-row__hint">{activeLocation.region}</div>
                  </div>
                </div>
                <button type="button" className="settings-link">
                  Change ▾
                </button>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  margin: '12px 0 0',
                  lineHeight: 1.5,
                }}
              >
                The forecast you'll see when you open WeatherApp.
              </p>
            </div>

            {/* Appearance */}
            <div className="settings-card">
              <h3 className="settings-card__title" style={{ marginBottom: 16 }}>
                Appearance
              </h3>
              <div className="settings-theme-grid">
                <button
                  type="button"
                  className={`settings-theme-btn${theme === 'light' ? ' settings-theme-btn--active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <Sun size={20} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  className={`settings-theme-btn${theme === 'dark' ? ' settings-theme-btn--active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <Moon size={20} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* ---------------- RIGHT COLUMN ---------------- */}
          <div className="settings-col">
            {/* Notifications */}
            <div className="settings-card">
              <h3 className="settings-card__title">Notifications</h3>
              <p className="settings-card__subtitle">Only the updates you want.</p>

              <div className="settings-row">
                <div className="settings-row__left">
                  <Bell size={16} color="var(--sky-500)" />
                  <div>
                    <div className="settings-row__label">Severe weather</div>
                    <div className="settings-row__hint">
                      Warnings for all your saved places.
                    </div>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.severeAlerts}
                  onChange={(v: boolean) => {
                    updateSetting('severeAlerts', v);
                    show(`Severe weather alerts ${v ? 'enabled' : 'disabled'}`, 'success');
                  }}
                />
              </div>

              <div className="settings-row">
                <div className="settings-row__left">
                  <Calendar size={16} color="var(--sky-500)" />
                  <div>
                    <div className="settings-row__label">Daily forecast</div>
                    <div className="settings-row__hint">
                      Your morning outlook at 7:00 AM.
                    </div>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.dailyForecast}
                  onChange={(v: boolean) => {
                    updateSetting('dailyForecast', v);
                    show(`Daily forecast ${v ? 'enabled' : 'disabled'}`, 'success');
                  }}
                />
              </div>
            </div>

            {/* Location & privacy */}
            <div className="settings-card">
              <h3 className="settings-card__title" style={{ marginBottom: 20 }}>
                Location & privacy
              </h3>
              <div
                className="settings-row"
                style={{ borderBottom: 'none', paddingTop: 0 }}
              >
                <div className="settings-row__left">
                  <Navigation size={16} color="var(--sky-500)" />
                  <div>
                    <div className="settings-row__label">Use device location</div>
                    <div className="settings-row__hint">
                      Find nearby weather when using the app.
                    </div>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.useLocation}
                  onChange={(v: boolean) => {
                    updateSetting('useLocation', v);
                    show(`Device location ${v ? 'enabled' : 'disabled'}`, 'success');
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  margin: '16px 0 12px',
                  lineHeight: 1.5,
                }}
              >
                Your location is only used to find the local forecast. We never sell your
                location data.
              </p>
              <button type="button" className="settings-link">
                Read our privacy policy →
              </button>
            </div>

            {/* Offline */}
            <div className="settings-card">
              <div className="settings-check-row">
                <Check size={16} color="#22C55E" strokeWidth={2.5} />
                Weather data is cached locally for offline viewing.
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
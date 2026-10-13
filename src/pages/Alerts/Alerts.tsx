import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import Section from '../../components/layout/Section';
import AlertCard from './AlertCard';
import { useAutoLocation } from '../../hooks/useAutoLocation';
import { getAlerts } from '../../services/alertsApi';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import type { WeatherAlert } from '../../types/alerts';

export default function Alerts() {
  const location = useAutoLocation();
  const { settings } = useSettings();
  const { show } = useToast();

  const [alerts, setAlerts] = useState<WeatherAlert[] | null>(null);
  const loading = !!location && alerts === null;
  const notifiedRef = useRef(false);
  const alertList = useMemo(() => alerts ?? [], [alerts]);

  // Fetch alerts whenever the active location changes
  useEffect(() => {
    if (!location) return;
    let cancelled = false;

    getAlerts(location.lat, location.lng).then(list => {
      if (!cancelled) setAlerts(list);
    });

    return () => {
      cancelled = true;
    };
  }, [location]);

  // Fire browser notification for severe alerts (once per page load)
  useEffect(() => {
    if (!settings.severeAlerts) return;
    if (notifiedRef.current) return;
    if (!('Notification' in window)) return;
    if (alertList.length === 0) return;

    const severe = alertList.filter(a => a.severity === 'High');
    if (severe.length === 0) return;

    notifiedRef.current = true;

    const fire = () => {
      severe.forEach(a => {
        try {
          new Notification(a.title, { body: a.description, tag: a.id });
        } catch {
          // ignore
        }
      });
      show(
        `${severe.length} severe alert${severe.length > 1 ? 's' : ''} active`,
        'info'
      );
    };

    if (Notification.permission === 'granted') {
      fire();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') fire();
      });
    }
  }, [alertList, settings.severeAlerts, show]);

  const activeCount = alertList.filter(a => a.severity !== 'Clear').length;

  return (
    <div>
      <Section py={56}>
        <h2 className="section-title">Weather alerts</h2>
        <p className="section-subtitle" style={{ marginBottom: 24 }}>
          Live warnings from official meteorological sources.
        </p>

        <div className="alerts-banner">
          <Bell size={15} />
          {loading
            ? 'Checking for alerts...'
            : `${activeCount} active warning${activeCount !== 1 ? 's' : ''}`}
          {location ? ` · ${location.name}` : ''}
        </div>

        <div className="alerts-layout">
          <div className="alerts-list">
            {loading && (
              <div className="state-screen" style={{ minHeight: 200 }}>
                <Loader2
                  size={24}
                  className="search-bar__spinner"
                  color="var(--sky-500)"
                />
              </div>
            )}

            {!loading && alertList.length === 0 && (
              <div className="alerts-side-card alerts-side-card--green">
                <div className="alerts-side-card__check">
                  <Check size={24} color="#22C55E" />
                </div>
                <div className="alerts-side-card__title">You're all clear</div>
                <p className="alerts-side-card__text" style={{ marginBottom: 12 }}>
                  No weather alerts for {location?.name ?? 'your area'} right now.
                  We'll let you know if conditions change.
                </p>
                <div className="alerts-side-card__meta">Last checked just now</div>
              </div>
            )}

            {!loading &&
              alertList.map(alert => <AlertCard key={alert.id} alert={alert} />)}
          </div>

          <div className="alerts-side">
            <div className="alerts-side-card">
              <div className="alerts-side-card__head">
                <Bell size={16} color="var(--sky-500)" />
                Know when it matters
              </div>
              <p className="alerts-side-card__text">
                {settings.severeAlerts
                  ? 'Severe weather notifications are on for your location.'
                  : 'Notifications are turned off. Enable them in Settings.'}
              </p>
              <button
                type="button"
                className="alerts-side-card__btn"
                onClick={async () => {
                  if (!('Notification' in window)) {
                    show('Notifications not supported in this browser', 'error');
                    return;
                  }
                  const perm = await Notification.requestPermission();
                  if (perm === 'granted') {
                    show('Notifications enabled', 'success');
                    new Notification('WeatherApp', {
                      body: 'You will now receive severe weather alerts.',
                    });
                  } else {
                    show('Notifications were not granted', 'error');
                  }
                }}
              >
                Test notification
              </button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
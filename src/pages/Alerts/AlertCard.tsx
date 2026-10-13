import { Clock, MapPin } from 'lucide-react';
import AlertTypeIcon from '../../components/ui/AlertTypeIcon';
import type { WeatherAlert, AlertSeverity } from '../../types/alerts';

interface AlertCardProps {
  alert: WeatherAlert;
}

const SEVERITY_CLASS: Record<AlertSeverity, string> = {
  High: 'alert-card--high',
  Moderate: 'alert-card--moderate',
  Low: 'alert-card--low',
  Clear: 'alert-card--clear',
};

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  High: '#EF4444',
  Moderate: '#F59E0B',
  Low: '#22C55E',
  Clear: '#22C55E',
};

export default function AlertCard({ alert }: AlertCardProps) {
  const sevClass = SEVERITY_CLASS[alert.severity];
  const iconColor = SEVERITY_COLOR[alert.severity];

  return (
    <div className={`alert-card ${sevClass}`}>
      <div className="alert-card__head">
        <div className="alert-card__avatar">
          <AlertTypeIcon type={alert.type} size={20} color={iconColor} />
        </div>
        <div className="alert-card__info">
          <div className="alert-card__title-row">
            <span className="alert-card__title">{alert.title}</span>
            <span className="alert-card__badge">{alert.severity}</span>
          </div>
          <div className="alert-card__location">
            <MapPin size={11} /> {alert.location}
          </div>
        </div>
      </div>
      <p className="alert-card__desc">{alert.description}</p>
      <div className="alert-card__footer">
        <Clock size={12} />
        Until {alert.until} · Issued at {alert.issued}
      </div>
    </div>
  );
}
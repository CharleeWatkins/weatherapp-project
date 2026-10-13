import { Check, CloudLightning, CloudRain, CloudSnow, AlertTriangle, Wind } from 'lucide-react';
import type { AlertType } from '../../types/alerts';

interface AlertTypeIconProps {
  type: AlertType;
  size?: number;
  color?: string;
}

export default function AlertTypeIcon({ type, size = 20, color }: AlertTypeIconProps) {
  const props = { size, color: color ?? 'currentColor', strokeWidth: 1.8 };
  switch (type) {
    case 'thunderstorm':
      return <CloudLightning {...props} />;
    case 'rain':
      return <CloudRain {...props} />;
    case 'wind':
      return <Wind {...props} />;
    case 'snow':
      return <CloudSnow {...props} />;
    case 'clear':
      return <Check {...props} />;
    default:
      return <AlertTriangle {...props} />;
  }
}
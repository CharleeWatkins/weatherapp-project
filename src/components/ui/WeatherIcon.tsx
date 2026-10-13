import { Cloud, Sun, Moon, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';
import type { WeatherCondition } from '../../types/weather';
import type { CSSProperties } from 'react';

interface WeatherIconProps {
  condition: WeatherCondition;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}

export default function WeatherIcon({
  condition,
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.8,
  style,
}: WeatherIconProps) {
  const props = { size, color, strokeWidth, style };
  switch (condition) {
    case 'clear':
      return <Sun {...props} />;
    case 'clear-night':
      return <Moon {...props} />;
    case 'partly-cloudy':
    case 'cloudy':
    case 'fog':
      return <Cloud {...props} />;
    case 'rain':
      return <CloudRain {...props} />;
    case 'snow':
      return <CloudSnow {...props} />;
    case 'thunderstorm':
      return <CloudLightning {...props} />;
    default:
      return <Cloud {...props} />;
  }
}
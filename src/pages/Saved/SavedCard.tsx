import { MapPin, Star, Trash2 } from 'lucide-react';
import WeatherIcon from '../../components/ui/WeatherIcon';
import { useWeather } from '../../hooks/useWeather';
import type { SavedLocation } from '../../types/location';

interface SavedCardProps {
  location: SavedLocation;
  onDelete: () => void;
}

const GRADIENTS = [
  'linear-gradient(135deg, #0EA5E9, #2563EB)',
  'linear-gradient(135deg, #FBBF24, #F97316)',
  'linear-gradient(135deg, #2563EB, #334155)',
  'linear-gradient(135deg, #9333EA, #1E293B)',
];

export default function SavedCard({ location, onDelete }: SavedCardProps) {
  const { data } = useWeather(location.lat, location.lng);

  // Pick a stable gradient based on the id so cards don't change on re-render
  const gradientIndex = Math.abs(hashCode(location.id)) % GRADIENTS.length;
  const gradient = GRADIENTS[gradientIndex];

  const temp = data?.current.temp ?? '—';
  const condition = data?.current.condition ?? 'Loading…';
  const high = data?.current.high ?? '—';
  const low = data?.current.low ?? '—';
  const icon = data?.current.conditionKey ?? 'partly-cloudy';

  return (
    <div className="saved-card" style={{ background: gradient }}>
      <div className="saved-card__top">
        <div className="saved-card__loc">
          <MapPin size={16} color="rgba(255,255,255,0.9)" />
          <div>
            <div className="saved-card__name">{location.name}</div>
            <div className="saved-card__region">{location.region}</div>
          </div>
        </div>
        <div className="saved-card__actions">
          <button type="button" className="saved-card__btn" aria-label="Favorite">
            <Star size={15} color="#FCD34D" fill="#FCD34D" />
          </button>
          <button
            type="button"
            className="saved-card__btn"
            onClick={onDelete}
            aria-label="Delete"
          >
            <Trash2 size={15} color="rgba(255,255,255,0.9)" />
          </button>
        </div>
      </div>

      <div className="saved-card__body">
        <div>
          <div className="saved-card__temp">{temp}°</div>
          <div className="saved-card__condition">{condition}</div>
          <div className="saved-card__highlow">
            H: {high}° L: {low}°
          </div>
        </div>
        <WeatherIcon condition={icon} size={64} color="rgba(255,255,255,0.85)" strokeWidth={1.2} />
      </div>
    </div>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
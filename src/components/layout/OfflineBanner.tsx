import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import {
  getLastCachedAt,
  subscribeLastCachedAt,
} from '../../data/offlineState';

export default function OfflineBanner() {
  const [cachedAt, setCachedAt] = useState<number | null>(getLastCachedAt());

  useEffect(() => {
    const unsubscribe = subscribeLastCachedAt(setCachedAt);
    return unsubscribe;
  }, []);

  if (cachedAt === null) return null;

  return (
    <div className="offline-banner">
      <Clock size={14} />
      Showing cached data from {formatRelative(cachedAt)}
    </div>
  );
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}
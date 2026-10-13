let lastCachedAt: number | null = null;
const listeners = new Set<(ts: number | null) => void>();

export function getLastCachedAt(): number | null {
  return lastCachedAt;
}

export function setLastCachedAt(ts: number | null): void {
  lastCachedAt = ts;
  listeners.forEach(fn => fn(ts));
}

export function subscribeLastCachedAt(fn: (ts: number | null) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
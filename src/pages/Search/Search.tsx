import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Navigation, MapPin, X, Loader2, AlertTriangle } from 'lucide-react';
import Section from '../../components/layout/Section';
import { searchLocations, reverseGeocode } from '../../services/weatherApi';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../services/storage';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import type { Location, SearchResult } from '../../types/location';

const DEFAULT_RECENT = ['Kimberley', 'Danielskuil', 'Pretoria', 'Cape Town'];

export default function Search() {
  const navigate = useNavigate();
  const { show } = useToast();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [, setActiveLocation] = useLocalStorage<Location | null>(
    STORAGE_KEYS.ACTIVE_LOCATION,
    null
  );
  const [recent, setRecent] = useLocalStorage<string[]>(
    STORAGE_KEYS.RECENT_SEARCHES,
    DEFAULT_RECENT
  );

  const debouncedQuery = useDebounce(query, 350);

  const handleQueryChange = (value: string) => {
    const trimmed = value.trim();
    setQuery(value);

    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    setError(null);
    setIsSearching(true);
  };

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      return;
    }

    let cancelled = false;

    searchLocations(debouncedQuery)
      .then(r => {
        if (!cancelled) setResults(r);
      })
      .catch(err => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Search failed');
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleSelect = (location: SearchResult) => {
    setActiveLocation(location);
    setRecent(prev => [location.name, ...prev.filter(n => n !== location.name)].slice(0, 6));
    show(`Switched to ${location.name}`, 'success');
    navigate('/');
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return;
    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        setActiveLocation({ ...place, lat: latitude, lng: longitude });
        show(`Location set to ${place.name}`, 'success');
        setIsSearching(false);
        navigate('/');
      },
      () => {
        show('Could not get your location', 'error');
        setIsSearching(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <div>
      <Section py={56}>
        <h2 className="section-title">Search</h2>
        <p className="section-subtitle" style={{ marginBottom: 24 }}>
          Find the forecast for anywhere you go.
        </p>

        <div className="search-bar">
          <SearchIcon size={20} color="var(--text-muted)" strokeWidth={2} />
          <input
            className="search-bar__input"
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="Search for a city..."
          />
          {isSearching && (
            <Loader2 size={18} color="var(--sky-500)" className="search-bar__spinner" />
          )}
          {query && !isSearching && (
            <button
              type="button"
              className="search-bar__clear"
              onClick={() => handleQueryChange('')}
              aria-label="Clear search"
            >
              <X size={18} color="var(--text-muted)" />
            </button>
          )}
        </div>

        <button type="button" className="search-use-location" onClick={handleUseLocation}>
          <Navigation size={16} strokeWidth={2.5} />
          Use my location
        </button>

        {error && (
          <div className="search-error">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}
      </Section>

      <Section py={40} bordered>
        <div className="search-layout">
          <div>
            <h3 className="section-title" style={{ marginBottom: 4 }}>
              Matching locations
            </h3>
            <p className="section-subtitle" style={{ marginBottom: 20 }}>
              {results.length} results{query ? ` for "${query}"` : ''}
            </p>

            {results.length > 0 ? (
              <div className="search-results">
                {results.map(r => (
                  <button
                    key={r.id}
                    type="button"
                    className="search-results__row"
                    onClick={() => handleSelect(r)}
                  >
                    <div className="search-results__avatar">
                      <MapPin size={18} color="var(--sky-500)" />
                    </div>
                    <div className="search-results__info">
                      <div className="search-results__name">{r.name}</div>
                      <div className="search-results__region">
                        {[r.region, r.country].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 && !isSearching ? (
              <div className="search-empty">
                <SearchIcon size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  No places found
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  We couldn't find "{query}". Check the spelling or try a nearby city.
                </div>
              </div>
            ) : null}
          </div>

          <div>
            <div className="micro-label search-recent-title">Recent searches</div>
            <div className="search-recent-pills">
              {recent.map(s => (
                <button
                  key={s}
                  type="button"
                  className="search-recent-pill"
                  onClick={() => setQuery(s)}
                >
                  {s}
                  <X size={12} color="var(--text-muted)" />
                </button>
              ))}
            </div>
            <div className="search-side-note">
              Your recent places are stored on this device.
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
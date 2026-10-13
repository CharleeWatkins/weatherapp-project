import { useCallback, useEffect, useState } from 'react';
import { Search as SearchIcon, MapPin, X, Loader2, Plus } from 'lucide-react';
import { searchLocations } from '../../services/weatherApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../context/ToastContext';
import type { Location, SearchResult } from '../../types/location';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: SearchResult) => void;
  existingNames?: string[];
}

export default function SearchModal({
  isOpen,
  onClose,
  onSelect,
  existingNames = [],
}: SearchModalProps) {
  const { show } = useToast();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(query, 350);

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
    onClose();
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleClose]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    const trimmedQuery = debouncedQuery.trim();
    if (trimmedQuery.length < 2) {
      return;
    }

    let cancelled = false;

    searchLocations(trimmedQuery)
      .then(r => {
        if (!cancelled) {
          setResults(r);
          setIsSearching(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setIsSearching(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, isOpen]);

  if (!isOpen) return null;

  const handlePick = (result: SearchResult) => {
    const alreadySaved = existingNames.some(
      n => n.toLowerCase() === result.name.toLowerCase()
    );
    if (alreadySaved) {
      show(`${result.name} is already in your saved places`, 'info');
      return;
    }
    onSelect(result);
    handleClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal modal--wide"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal__header">
          <h3 className="modal__title">Add a location</h3>
          <button
            type="button"
            className="modal__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="search-bar" style={{ marginBottom: 16 }}>
          <SearchIcon size={20} color="var(--text-muted)" strokeWidth={2} />
          <input
            className="search-bar__input"
            type="text"
            value={query}
            onChange={e => {
              const nextValue = e.target.value;
              setQuery(nextValue);

              const isValidSearch = nextValue.trim().length >= 2;
              setIsSearching(isValidSearch);

              if (!isValidSearch) {
                setResults([]);
              }
            }}
            placeholder="Search for a city..."
            autoFocus
          />
          {isSearching && (
            <Loader2
              size={18}
              color="var(--sky-500)"
              className="search-bar__spinner"
            />
          )}
          {query && !isSearching && (
            <button
              type="button"
              className="search-bar__clear"
              onClick={() => setQuery('')}
              aria-label="Clear"
            >
              <X size={18} color="var(--text-muted)" />
            </button>
          )}
        </div>

        <div className="modal__body">
          {query.length < 2 && (
            <div className="modal__hint">
              Type at least 2 characters to search for a city.
            </div>
          )}

          {query.length >= 2 && !isSearching && results.length === 0 && (
            <div className="modal__hint">
              No places found for "{query}". Try a different spelling.
            </div>
          )}

          {results.length > 0 && (
            <div className="search-results search-results--modal">
              {results.map(r => {
                const alreadySaved = existingNames.some(
                  n => n.toLowerCase() === r.name.toLowerCase()
                );
                return (
                  <button
                    key={r.id}
                    type="button"
                    className="search-results__row"
                    onClick={() => handlePick(r)}
                    disabled={alreadySaved}
                    style={{ opacity: alreadySaved ? 0.55 : 1 }}
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
                    {alreadySaved ? (
                      <span className="modal__saved-badge">Saved</span>
                    ) : (
                      <Plus size={16} color="var(--text-muted)" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small utility so we don't have to import the type twice
export type { Location };
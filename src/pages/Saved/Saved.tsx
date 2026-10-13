import { useState } from 'react';
import { Plus } from 'lucide-react';
import Section from '../../components/layout/Section';
import SavedCard from './SavedCard';
import DeleteModal from './DeleteModal';
import SearchModal from '../../components/ui/SearchModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../../services/storage';
import { useToast } from '../../context/ToastContext';
import type { SavedLocation, SearchResult } from '../../types/location';

const INITIAL_LOCATIONS: SavedLocation[] = [
  {
    id: '1',
    name: 'Kimberley',
    region: 'South Africa',
    lat: -28.7282,
    lng: 24.7499,
    addedAt: Date.now(),
  },
  {
    id: '2',
    name: 'Istanbul',
    region: 'Turkey',
    lat: 41.0082,
    lng: 28.9784,
    addedAt: Date.now(),
  },
  {
    id: '3',
    name: 'Port Moresby',
    region: 'Papua New Guinea',
    lat: -9.4438,
    lng: 147.1803,
    addedAt: Date.now(),
  },
  {
    id: '4',
    name: 'Samarkand',
    region: 'Uzbekistan',
    lat: 39.627,
    lng: 66.975,
    addedAt: Date.now(),
  },
];

export default function Saved() {
  const [locations, setLocations] = useLocalStorage<SavedLocation[]>(
    STORAGE_KEYS.SAVED_LOCATIONS,
    INITIAL_LOCATIONS
  );
  const [deleteTarget, setDeleteTarget] = useState<SavedLocation | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { show } = useToast();

  const handleAdd = (result: SearchResult) => {
    const newLocation: SavedLocation = {
      id: `${result.id}-${Date.now()}`,
      name: result.name,
      region: result.region,
      country: result.country,
      lat: result.lat,
      lng: result.lng,
      addedAt: Date.now(),
    };
    setLocations(prev => [newLocation, ...prev]);
    show(`${result.name} added to saved places`, 'success');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setLocations(prev => prev.filter(l => l.id !== deleteTarget.id));
    show(`${deleteTarget.name} removed`, 'success');
    setDeleteTarget(null);
  };

  return (
    <div>
      <Section py={56}>
        <div className="saved-head">
          <div>
            <h2 className="section-title">Saved places</h2>
            <p className="section-subtitle">
              {locations.length} place{locations.length !== 1 ? 's' : ''}. Your world at a
              glance.
            </p>
          </div>
          <button
            type="button"
            className="saved-add-btn"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus size={16} strokeWidth={2.5} />
            Add
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="saved-empty">
            <p style={{ marginBottom: 16 }}>
              No saved locations yet. Add one to get started.
            </p>
            <button
              type="button"
              className="saved-add-btn"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add your first location
            </button>
          </div>
        ) : (
          <div className="saved-grid">
            {locations.map(loc => (
              <SavedCard
                key={loc.id}
                location={loc}
                onDelete={() => setDeleteTarget(loc)}
              />
            ))}
          </div>
        )}
      </Section>

      <SearchModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSelect={handleAdd}
        existingNames={locations.map(l => l.name)}
      />

      {deleteTarget && (
        <DeleteModal
          location={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
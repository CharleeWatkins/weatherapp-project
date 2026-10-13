import { Trash2 } from 'lucide-react';
import type { SavedLocation } from '../../types/location';

interface DeleteModalProps {
  location: SavedLocation;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({ location, onCancel, onConfirm }: DeleteModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__icon">
          <Trash2 size={22} color="#EF4444" />
        </div>
        <h3 className="modal__title">Remove {location.name}?</h3>
        <p className="modal__text">
          {location.name} will be removed from your saved places. You can add it again
          anytime.
        </p>
        <div className="modal__actions">
          <button
            type="button"
            className="modal__btn modal__btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal__btn modal__btn--confirm"
            onClick={onConfirm}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
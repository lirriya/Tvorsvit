import { useEffect, useRef, useState } from 'react';
import { createPlace, updatePlace } from '../api.js';
import ColorPicker from './ColorPicker.jsx';
import PlaceRelationsPanel from './PlaceRelationsPanel.jsx';

const DEFAULT_COLOR = '#646cff';

function PlaceModal({ worldId, place, places, onClose, onSaved }) {
  const isEdit = Boolean(place);
  const [form, setForm] = useState(() => ({
    name: place?.name ?? '',
    description: place?.description ?? '',
    photoUrl: place?.photoUrl ?? '',
    color: place?.color ?? DEFAULT_COLOR,
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (form.photoUrl.trim() && !/^(https?:\/\/|\/|\.\/|\.\.\/)/.test(form.photoUrl.trim())) {
      next.photoUrl = 'Use a full URL (https://…) or a path starting with “/”.';
    }
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      photoUrl: form.photoUrl.trim() || null,
      color: form.color,
    };

    setSubmitting(true);
    try {
      const saved = isEdit
        ? await updatePlace(worldId, place.id, payload)
        : await createPlace(worldId, payload);
      onSaved(saved);
    } catch (err) {
      setErrors({ form: err.message });
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal-panel modal-panel-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={isEdit ? 'edit-place-title' : 'create-place-title'}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={isEdit ? 'edit-place-title' : 'create-place-title'}>
          {isEdit ? 'Edit place' : 'New place'}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              ref={nameInputRef}
              type="text"
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="e.g. The Gilded Tankard"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What is this place like? (optional)"
            />
            <span
              className={`field-counter${form.description.length >= 400 ? ' is-near' : ''}${form.description.length >= 500 ? ' is-max' : ''}`}
            >
              {form.description.length}/500
            </span>
          </label>

          <label className="field">
            <span className="field-label">Photo</span>
            <input
              type="text"
              value={form.photoUrl}
              onChange={(event) => setField('photoUrl', event.target.value)}
              placeholder="https://… or /images/place.jpg (optional)"
            />
            {errors.photoUrl && <span className="field-error">{errors.photoUrl}</span>}
          </label>

          {form.photoUrl.trim() && (
            <div className="place-photo-preview">
              <img src={form.photoUrl} alt="" />
            </div>
          )}

          <div className="field field-color">
            <span className="field-label">Accent color</span>
            <ColorPicker
              value={form.color}
              onChange={(color) => setField('color', color)}
              label="Accent color"
            />
          </div>

          {errors.form && <p className="field-error form-error">{errors.form}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>

        {isEdit && (
          <PlaceRelationsPanel worldId={worldId} place={place} places={places ?? []} />
        )}
      </section>
    </div>
  );
}

export default PlaceModal;

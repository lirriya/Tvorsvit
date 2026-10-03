import { useEffect, useRef, useState } from 'react';
import { createCharacter, updateCharacter } from '../api.js';

const DEFAULT_COLOR = '#646cff';

function CharacterModal({ worldId, character, onClose, onSaved }) {
  const isEdit = Boolean(character);
  const [form, setForm] = useState(() => ({
    name: character?.name ?? '',
    description: character?.description ?? '',
    color: character?.color ?? DEFAULT_COLOR,
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
      color: form.color,
    };

    setSubmitting(true);
    try {
      const saved = isEdit
        ? await updateCharacter(worldId, character.id, payload)
        : await createCharacter(worldId, payload);
      onSaved(saved);
    } catch (err) {
      setErrors({ form: err.message });
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={isEdit ? 'edit-character-title' : 'create-character-title'}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={isEdit ? 'edit-character-title' : 'create-character-title'}>
          {isEdit ? 'Edit character' : 'New character'}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              ref={nameInputRef}
              type="text"
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="e.g. Kaelen of the Ashwastes"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              rows={3}
              placeholder="Who are they? (optional)"
            />
          </label>

          <label className="field field-color">
            <span className="field-label">Accent color</span>
            <input
              type="color"
              value={form.color}
              onChange={(event) => setField('color', event.target.value)}
              aria-label="Accent color"
            />
            <span className="color-hex">{form.color}</span>
          </label>

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
      </section>
    </div>
  );
}

export default CharacterModal;
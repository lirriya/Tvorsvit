import { useEffect, useRef, useState } from 'react';
import { createWorld } from '../api.js';
import { WORLD_THEMES } from '../worldThemes.js';
import { WORLD_TYPES } from '../worldTypes.js';

const EMPTY_FORM = { name: '', type: '', description: '', theme: WORLD_THEMES[0].key };

function CreateWorldModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
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
    if (!form.type) next.type = 'Pick a world type.';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const selectedTheme = WORLD_THEMES.find((theme) => theme.key === form.theme);
      const created = await createWorld({
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim() || null,
        theme: selectedTheme.key,
        color: selectedTheme.dot,
      });
      onCreated(created);
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
        aria-labelledby="create-world-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="create-world-title">Create new world</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              ref={nameInputRef}
              type="text"
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="e.g. The Echoing Vale"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label className="field">
            <span className="field-label">Type</span>
            <select value={form.type} onChange={(event) => setField('type', event.target.value)}>
              <option value="" disabled>
                Choose a type…
              </option>
              {WORLD_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              rows={3}
              placeholder="What is this world about? (optional)"
            />
          </label>

          <div className="field">
            <span className="field-label">World theme</span>
            <div className="theme-chips" role="group" aria-label="World theme">
              {WORLD_THEMES.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  className={`theme-chip${form.theme === theme.key ? ' is-active' : ''}`}
                  aria-pressed={form.theme === theme.key}
                  onClick={() => setField('theme', theme.key)}
                >
                  <span className="theme-chip-dot" style={{ background: theme.dot }} aria-hidden="true" />
                  {theme.label}
                </button>
              ))}
            </div>
            <span className="color-hex">
              Accent · {WORLD_THEMES.find((theme) => theme.key === form.theme).dot}
            </span>
          </div>

          {errors.form && <p className="field-error form-error">{errors.form}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CreateWorldModal;
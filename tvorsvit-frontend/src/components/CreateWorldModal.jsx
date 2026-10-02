import { useEffect, useRef, useState } from 'react';
import { createWorld } from '../api.js';
import { WORLD_THEMES } from '../worldThemes.js';
import { WORLD_TYPES } from '../worldTypes.js';

const EMPTY_FORM = { name: '', type: '', description: '', theme: WORLD_THEMES[0].key };

function EmblemIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="30"
      height="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 7c-1.7-1.8-4.2-2.6-8-2.6v14c3.8 0 6.3.8 8 2.6 1.7-1.8 4.2-2.6 8-2.6v-14c-3.8 0-6.3.8-8 2.6z" />
      <path d="M12 7v14" />
    </svg>
  );
}

function DiceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.5L21 8v8l-9 5.5L3 16V8z" />
      <path d="M3 8l9 5.5L21 8" />
      <path d="M12 13.5V21.5" />
    </svg>
  );
}

function CrystalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5l6.5 5-3 12h-7l-3-12z" />
      <path d="M5.5 8.5h13" />
      <path d="M12 3.5v5" />
    </svg>
  );
}

function FeatherIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.67 19a2 2 0 0 0 1.42-.59l6.3-6.3a2.82 2.82 0 0 0-4-4l-6.3 6.3a2 2 0 0 0-.59 1.42L9 18a1 1 0 0 0 1 1z" />
      <path d="M20.5 8.5L15.5 3.5" />
      <path d="M9 13.5L6 16.5" />
    </svg>
  );
}

function ClapperboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="8" width="17" height="12" rx="1.5" />
      <path d="M6 6l3.5 4.5" />
      <path d="M10.5 6l3.5 4.5" />
      <path d="M15 6l3.5 4.5" />
    </svg>
  );
}

function BubbleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a8 8 0 0 1-8 8c-1.4 0-2.8-.4-4-1l-5 1 1-5a8 8 0 1 1 16-3z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4l1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z" />
      <path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" />
    </svg>
  );
}

const TYPE_ICONS = {
  BOOK: <BookIcon />,
  TABLETOP_RPG: <DiceIcon />,
  GAME_LORE: <CrystalIcon />,
  SHORT_STORY: <FeatherIcon />,
  SCREENPLAY: <ClapperboardIcon />,
  COMIC: <BubbleIcon />,
  OTHER: <SparkleIcon />,
};

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
        className="modal-panel create-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-world-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="create-emblem" aria-hidden="true">
          <EmblemIcon />
        </div>
        <h2 id="create-world-title">Create new world</h2>
        <p className="create-subtitle">Name it, pick how it will be told, and set its mood.</p>
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

          <div className="field">
            <span className="field-label">Type</span>
            <div className="type-grid" role="group" aria-label="World type">
              {WORLD_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`type-chip${form.type === type.value ? ' is-active' : ''}`}
                  aria-pressed={form.type === type.value}
                  onClick={() => setField('type', type.value)}
                >
                  <span className="type-chip-icon">{TYPE_ICONS[type.value]}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>

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
import { useEffect, useRef, useState } from 'react';
import { deleteWorld, updateWorld } from '../api.js';
import { WORLD_THEMES, themeOf } from '../worldThemes.js';

function EditEmblemIcon() {
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

function EditWorldModal({ world, onClose, onSaved, onDeleted }) {
  const [name, setName] = useState(world.name);
  const [description, setDescription] = useState(world.description || '');
  const [theme, setTheme] = useState(themeOf(world));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setErrors({ name: 'Name is required.' });
      return;
    }
    setSubmitting(true);
    try {
      const selectedTheme = WORLD_THEMES.find((entry) => entry.key === theme);
      const updated = await updateWorld(world.id, {
        name: name.trim(),
        type: world.type,
        description: description.trim() || null,
        color: selectedTheme.dot,
        theme: selectedTheme.key,
      });
      onSaved(updated);
    } catch (err) {
      setErrors({ form: err.message });
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteWorld(world.id);
      onDeleted();
    } catch (err) {
      setErrors({ form: err.message });
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal-panel create-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-world-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="create-emblem" aria-hidden="true">
          <EditEmblemIcon />
        </div>
        <h2 id="edit-world-title">Edit world</h2>
        <p className="create-subtitle">Tune its identity — or remove it for good.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. The Echoing Vale"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What is this world about? (optional)"
            />
            <span
              className={`field-counter${description.length >= 400 ? ' is-near' : ''}${description.length >= 500 ? ' is-max' : ''}`}
            >
              {description.length}/500
            </span>
          </label>

          <div className="field">
            <span className="field-label">World theme</span>
            <div className="theme-chips" role="group" aria-label="World theme">
              {WORLD_THEMES.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  className={`theme-chip${theme === entry.key ? ' is-active' : ''}`}
                  aria-pressed={theme === entry.key}
                  onClick={() => setTheme(entry.key)}
                >
                  <span className="theme-chip-dot" style={{ background: entry.dot }} aria-hidden="true" />
                  {entry.label}
                </button>
              ))}
            </div>
            <span className="color-hex">
              Accent · {WORLD_THEMES.find((entry) => entry.key === theme).dot}
            </span>
          </div>

          {errors.form && <p className="field-error form-error">{errors.form}</p>}

          {!confirming ? (
            <div className="modal-actions modal-actions-split">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setConfirming(true)}
                disabled={submitting || deleting}
              >
                Delete world
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting || deleting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting || deleting}>
                {submitting ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          ) : (
            <div className="modal-delete-confirm" role="alertdialog" aria-label="Delete world">
              <span className="modal-delete-text">
                Delete “{world.name}” forever? This can't be undone.
              </span>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setConfirming(false)}
                  disabled={deleting || submitting}
                >
                  Keep
                </button>
                <button
                  type="button"
                  className="btn btn-danger-solid"
                  onClick={handleDelete}
                  disabled={deleting || submitting}
                >
                  {deleting ? 'Deleting…' : 'Delete forever'}
                </button>
              </div>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

export default EditWorldModal;
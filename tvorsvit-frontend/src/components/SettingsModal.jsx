import { useEffect, useRef } from 'react';
import { useFontScale } from '../settings.js';
import { useTheme } from '../theme.js';

const SCALE_OPTIONS = [
  { value: 'md', label: 'A' },
  { value: 'lg', label: 'A⁺' },
  { value: 'xl', label: 'A⁺⁺' },
];

function SettingsModal({ onClose }) {
  const [theme, toggleTheme] = useTheme();
  const [scale, setFontScale] = useFontScale();
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        ref={panelRef}
        className="modal-panel settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="settings-title">Settings</h2>

        <p className="settings-section-label">Appearance</p>
        <div className="settings-row">
          <span className="settings-row-label">Theme</span>
          <div className="segmented" role="group" aria-label="Theme">
            <button
              type="button"
              className={`segmented-option${theme === 'light' ? ' is-active' : ''}`}
              aria-pressed={theme === 'light'}
              onClick={() => {
                if (theme !== 'light') toggleTheme();
              }}
            >
              Light
            </button>
            <button
              type="button"
              className={`segmented-option${theme === 'dark' ? ' is-active' : ''}`}
              aria-pressed={theme === 'dark'}
              onClick={() => {
                if (theme !== 'dark') toggleTheme();
              }}
            >
              Dark
            </button>
          </div>
        </div>

        <p className="settings-section-label">Accessibility</p>
        <div className="settings-row">
          <span className="settings-row-label">Text size</span>
          <div className="segmented" role="group" aria-label="Text size">
            {SCALE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`segmented-option${scale === option.value ? ' is-active' : ''}`}
                aria-pressed={scale === option.value}
                onClick={() => setFontScale(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <p className="settings-section-label">Language</p>
        <div className="settings-row">
          <span className="settings-row-label">Language</span>
          <span className="settings-value">
            English
            <span className="badge">more coming soon</span>
          </span>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

export default SettingsModal;
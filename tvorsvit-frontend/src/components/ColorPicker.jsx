import { useState } from 'react';
import {
  CURATED_COLORS,
  addLibraryColor,
  loadColorLibrary,
  loadRecentColors,
  pushRecentColor,
  removeLibraryColor,
} from '../colorLibrary.js';

function Swatch({ color, active, onClick }) {
  return (
    <button
      type="button"
      className={`swatch${active ? ' is-active' : ''}`}
      style={{ background: color }}
      aria-label={color}
      title={color}
      aria-pressed={active}
      onClick={onClick}
    />
  );
}

function ColorPicker({ value, onChange, label = 'Accent color' }) {
  const [library, setLibrary] = useState(() => loadColorLibrary());
  const [recent, setRecent] = useState(() => loadRecentColors());
  const [saveOpen, setSaveOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const select = (color) => {
    const normalized = typeof color === 'string' ? color.toLowerCase() : color;
    onChange(normalized);
    setRecent(pushRecentColor(normalized));
  };

  const handleSave = (event) => {
    event.preventDefault();
    setLibrary(addLibraryColor(nameDraft, value));
    setRecent(pushRecentColor(value));
    setNameDraft('');
    setSaveOpen(false);
  };

  return (
    <div className="color-picker">
      <div className="color-picker-head">
        <input
          type="color"
          className="color-picker-native"
          value={value}
          onChange={(event) => select(event.target.value)}
          aria-label={label}
        />
        <span className="color-hex">{value}</span>
        <button
          type="button"
          className="btn btn-secondary btn-small color-picker-save-toggle"
          onClick={() => setSaveOpen((open) => !open)}
        >
          Save to library…
        </button>
      </div>

      {saveOpen && (
        <form className="color-picker-save" onSubmit={handleSave}>
          <input
            type="text"
            value={nameDraft}
            maxLength={40}
            placeholder="Color name (e.g. Ashwaste rust)"
            onChange={(event) => setNameDraft(event.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-small">
            Save
          </button>
        </form>
      )}

      <div className="color-swatch-group">
        <span className="color-swatch-label">Curated</span>
        <div className="color-swatches">
          {CURATED_COLORS.map((color) => (
            <Swatch key={color} color={color} active={color === value} onClick={() => select(color)} />
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div className="color-swatch-group">
          <span className="color-swatch-label">Recent</span>
          <div className="color-swatches">
            {recent.map((color) => (
              <Swatch key={color} color={color} active={color === value} onClick={() => select(color)} />
            ))}
          </div>
        </div>
      )}

      <div className="color-swatch-group">
        <span className="color-swatch-label">My library</span>
        {library.length === 0 ? (
          <span className="color-swatch-empty">Save a color to reuse it across worlds.</span>
        ) : (
          <div className="color-library">
            {library.map((entry) => (
              <span key={entry.color} className="color-library-chip">
                <button
                  type="button"
                  className={`color-library-pick${entry.color === value ? ' is-active' : ''}`}
                  title={entry.color}
                  aria-pressed={entry.color === value}
                  onClick={() => select(entry.color)}
                >
                  <span className="color-library-dot" style={{ background: entry.color }} aria-hidden="true" />
                  <span className="color-library-name">{entry.name}</span>
                </button>
                <button
                  type="button"
                  className="color-library-remove"
                  aria-label={`Delete ${entry.name}`}
                  title="Delete from library"
                  onClick={() => setLibrary(removeLibraryColor(entry.color))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ColorPicker;

import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  deleteCharacter,
  getWorld,
  listCharacters,
  saveWorldContent,
} from '../api.js';
import CharacterCard from '../components/CharacterCard.jsx';
import CharacterModal from '../components/CharacterModal.jsx';
import EditWorldModal from '../components/EditWorldModal.jsx';
import WorkbenchRail from '../components/WorkbenchRail.jsx';
import WorldBar from '../components/WorldBar.jsx';
import { WORLD_THEMES, themeOf } from '../worldThemes.js';
import { typeLabel } from '../worldTypes.js';
import { useComingSoon } from '../useComingSoon.jsx';

const KNOWN_SECTIONS = ['story', 'characters', 'places', 'node-graph', 'timeline'];
const SECTION_LABELS = {
  places: 'Places',
  'node-graph': 'Node graph',
  timeline: 'Timeline',
};

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
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

function FocusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 3H3v5" />
      <path d="M16 3h5v5" />
      <path d="M8 21H3v-5" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}

function HighlightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 11l-6 6v3h9l3-3" />
      <path d="M22 12l-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
    </svg>
  );
}

function Workspace() {
  const { id, section } = useParams();
  const navigate = useNavigate();
  const active = KNOWN_SECTIONS.includes(section) ? section : 'story';

  const [world, setWorld] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [content, setContent] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState('saved');
  const [saveError, setSaveError] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const [characterModal, setCharacterModal] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const prevFocus = useRef(false);
  const textareaRef = useRef(null);
  const contentRef = useRef('');
  const undoStack = useRef([]);
  const lastBurst = useRef(null);
  const [comingSoon, toast] = useComingSoon();

  useEffect(() => {
    let cancelled = false;
    getWorld(id)
      .then((loaded) => {
        if (cancelled) return;
        setWorld(loaded);
        setContent(loaded.content || '');
        contentRef.current = loaded.content || '';
        setDirty(false);
        setSaveState('saved');
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const fetchCharacters = useCallback(() => {
    listCharacters(id)
      .then((data) => {
        setCharacters(data);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err.message);
      });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    listCharacters(id)
      .then((data) => {
        if (cancelled) return;
        setCharacters(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (focusMode && dirty) {
      const timer = setTimeout(() => {
        setSaveState('saving');
        saveWorldContent(id, content)
          .then(() => {
            setDirty(false);
            setSaveState('saved');
          })
          .catch((err) => {
            setSaveState('error');
            setSaveError(err.message);
          });
      }, 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [content, dirty, focusMode, id]);

  useEffect(() => {
    const wasFocus = prevFocus.current;
    prevFocus.current = focusMode;
    if (wasFocus && !focusMode && dirty) {
      saveWorldContent(id, content)
        .then(() => {
          setDirty(false);
          setSaveState('saved');
        })
        .catch((err) => {
          setSaveState('error');
          setSaveError(err.message);
        });
    }
  }, [content, dirty, focusMode, id]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        setFocusMode((current) => !current);
      } else if (event.key === 'Escape') {
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const growTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    growTextarea();
  }, [content, growTextarea]);

  const handleChange = (event) => {
    const value = event.target.value;
    contentRef.current = value;
    setContent(value);
    setDirty(true);
    setSaveState('idle');
    setSaveError(null);
  };

  const handleBeforeInput = (event) => {
    const inputType = event.inputType;
    if (!inputType || event.nativeEvent.isComposing) return;
    const now = Date.now();
    const prev = contentRef.current;
    const sustained =
      lastBurst.current &&
      lastBurst.current.type === inputType &&
      now - lastBurst.current.at < 1200;
    if (!sustained) {
      undoStack.current.push({ value: prev, at: now });
      if (undoStack.current.length > 50) undoStack.current.shift();
    }
    lastBurst.current = { type: inputType, at: now };
  };

  const handleUndo = () => {
    const entry = undoStack.current.pop();
    lastBurst.current = null;
    if (!entry) return;
    contentRef.current = entry.value;
    setContent(entry.value);
    setDirty(true);
    setSaveState('idle');
    setSaveError(null);
  };

  const handleTextareaKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      handleUndo();
    }
  };

  const handleSave = async () => {
    setSaveState('saving');
    setSaveError(null);
    try {
      await saveWorldContent(id, content);
      setDirty(false);
      setSaveState('saved');
    } catch (err) {
      setSaveState('error');
      setSaveError(err.message);
    }
  };

  const handleWorldSaved = (updated) => {
    setEditModal(false);
    setWorld(updated);
  };

  const handleWorldDeleted = () => {
    navigate('/');
  };

  const handleCharacterSaved = (saved) => {
    setCharacterModal(null);
    setCharacters((current) => {
      if (!current) return current;
      const exists = current.some((character) => character.id === saved.id);
      return exists
        ? current.map((character) => (character.id === saved.id ? saved : character))
        : [...current, saved];
    });
  };

  const handleDeleteCharacter = (character) => {
    if (!window.confirm(`Delete "${character.name}"?`)) return;
    deleteCharacter(id, character.id)
      .then(() => {
        setCharacters((current) =>
          current ? current.filter((entry) => entry.id !== character.id) : current
        );
      })
      .catch((err) => {
        setLoadError(err.message);
      });
  };

  if (loadError && !world) {
    return (
      <div className="error-page">
        <p>Could not load this world: {loadError}</p>
        <Link to="/" className="btn btn-secondary">
          Back to all worlds
        </Link>
      </div>
    );
  }

  if (!world) {
    return <p className="status-text">Loading world…</p>;
  }

  const statusText =
    saveState === 'saving'
      ? 'Saving…'
      : saveState === 'error'
        ? 'Save failed'
        : dirty
          ? 'Unsaved changes'
          : 'Saved';

  if (focusMode) {
    return (
      <div className="world-themed" data-world-theme={themeOf(world)}>
        <div className="focus-canvas">
          <div className="focus-topbar">
            <span className="focus-hint">Esc or Ctrl/⌘+Shift+F to exit focus mode</span>
            {(saveState === 'saving' || saveState === 'error') && (
              <span className={`save-status${saveState === 'error' ? ' is-error' : ''}`}>{statusText}</span>
            )}
          </div>
          <textarea
            className="focus-textarea"
            value={content}
            onChange={handleChange}
            onBeforeInput={handleBeforeInput}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Start writing this world's history…"
            autoFocus
          />
        </div>
      </div>
    );
  }

  const barRight = (
    <>
      <button
        type="button"
        className="icon-button"
        onClick={() => setEditModal(true)}
        aria-label="Edit world"
        title="Edit world"
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        className="icon-button"
        onClick={() => setFocusMode((current) => !current)}
        aria-label="Focus mode"
        title="Focus (Ctrl/⌘+Shift+F)"
      >
        <FocusIcon />
      </button>
      <span
        className={`save-status${saveState === 'saved' ? ' is-saved' : ''}${saveState === 'error' ? ' is-error' : ''}`}
      >
        {statusText}
      </span>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleSave}
        disabled={!dirty || saveState === 'saving'}
      >
        {saveState === 'saving' ? 'Saving…' : 'Save'}
      </button>
    </>
  );

  let mainView;

  if (active === 'characters') {
    mainView = (
      <>
        {loadError && (
          <div className="error-banner">
            <span>{loadError}</span>
            <button type="button" onClick={fetchCharacters}>
              Retry
            </button>
          </div>
        )}

        {characters === null && !loadError && <p className="characters-hint">Loading characters…</p>}

        {characters !== null && (
          <>
            <div className="character-grid">
              <button
                type="button"
                className="create-tile"
                onClick={() => setCharacterModal({ mode: 'create', character: null })}
              >
                <span className="create-tile-plus">+</span>
                <span>Add a character</span>
              </button>
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onEdit={(entry) => setCharacterModal({ mode: 'edit', character: entry })}
                  onDelete={handleDeleteCharacter}
                />
              ))}
            </div>

            {characters.length === 0 && (
              <p className="empty-hint">No characters yet — add the people who shape this world.</p>
            )}
          </>
        )}

        {characterModal && (
          <CharacterModal
            worldId={id}
            character={characterModal.character}
            onClose={() => setCharacterModal(null)}
            onSaved={handleCharacterSaved}
          />
        )}
      </>
    );
  } else if (active === 'story') {
    mainView = (
      <div className="paper">
        <div className="paper-title">
          <span
            className="world-bar-dot"
            style={{ background: WORLD_THEMES.find((entry) => entry.key === themeOf(world)).dot }}
            aria-hidden="true"
          />
          <h2>{world.name}</h2>
          <span className="type-badge">{typeLabel(world.type)}</span>
        </div>

        {world.description && <p className="paper-description">{world.description}</p>}

        {saveError && <p className="field-error paper-error">{saveError}</p>}

        <div className="paper-divider" aria-hidden="true" />

        <div className="word-toolbar" role="toolbar" aria-label="Text formatting">
          <button
            type="button"
            className="word-tool is-small"
            aria-label="Decrease font size"
            title="Font size"
            onClick={() => comingSoon('Font size')}
          >
            A−
          </button>
          <button
            type="button"
            className="word-tool"
            aria-label="Reset font size"
            title="Font size"
            onClick={() => comingSoon('Font size')}
          >
            A
          </button>
          <button
            type="button"
            className="word-tool is-large"
            aria-label="Increase font size"
            title="Font size"
            onClick={() => comingSoon('Font size')}
          >
            A+
          </button>
          <span className="word-tool-sep" aria-hidden="true" />
          <button
            type="button"
            className="word-tool is-bold"
            aria-label="Bold"
            title="Bold"
            onClick={() => comingSoon('Bold')}
          >
            B
          </button>
          <button
            type="button"
            className="word-tool is-italic"
            aria-label="Italic"
            title="Italic"
            onClick={() => comingSoon('Italic')}
          >
            I
          </button>
          <button
            type="button"
            className="word-tool is-underline"
            aria-label="Underline"
            title="Underline"
            onClick={() => comingSoon('Underline')}
          >
            U
          </button>
          <span className="word-tool-sep" aria-hidden="true" />
          <button
            type="button"
            className="word-tool"
            aria-label="Highlight"
            title="Highlight"
            onClick={() => comingSoon('Highlight')}
          >
            <HighlightIcon />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className="paper-textarea"
          value={content}
          onChange={handleChange}
          onBeforeInput={handleBeforeInput}
          onKeyDown={handleTextareaKeyDown}
          placeholder="Start writing this world's history…"
        />
      </div>
    );
  } else {
    mainView = (
      <section className="section-empty">
        <span className="section-empty-dot" aria-hidden="true" />
        <h2>{SECTION_LABELS[active]}</h2>
        <p>{SECTION_LABELS[active]} is being sketched — check back soon.</p>
      </section>
    );
  }

  return (
    <div className="world-themed" data-world-theme={themeOf(world)}>
      <WorldBar world={world} right={barRight} />
      <div className="workbench">
        <WorkbenchRail worldId={id} charactersCount={characters ? characters.length : undefined} />
        <main className="workbench-main">{mainView}</main>
      </div>
      {editModal && (
        <EditWorldModal
          world={world}
          onClose={() => setEditModal(false)}
          onSaved={handleWorldSaved}
          onDeleted={handleWorldDeleted}
        />
      )}
      {toast}
    </div>
  );
}

export default Workspace;
import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getWorld, listCharacters, saveWorldContent } from '../api.js';
import { typeLabel } from '../worldTypes.js';
import ThemeToggle from '../components/ThemeToggle.jsx';

function Editor() {
  const { id } = useParams();
  const [world, setWorld] = useState(null);
  const [content, setContent] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState('saved');
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [characterCount, setCharacterCount] = useState(null);
  const [focusMode, setFocusMode] = useState(false);
  const prevFocus = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getWorld(id)
      .then((loaded) => {
        if (cancelled) return;
        setWorld(loaded);
        setContent(loaded.content || '');
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

  useEffect(() => {
    let cancelled = false;
    listCharacters(id)
      .then((characters) => {
        if (!cancelled) setCharacterCount(characters.length);
      })
      .catch(() => {});
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

  const handleChange = (event) => {
    setContent(event.target.value);
    setDirty(true);
    setSaveState('idle');
    setSaveError(null);
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

  if (loadError) {
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
          placeholder="Start writing this world's history…"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="editor-layout" style={{ '--accent': world.color || '#646cff' }}>
      <div className="editor-toolbar">
        <Link to="/" className="back-link">
          ← All worlds
        </Link>
        <Link to={`/worlds/${id}/characters`} className="btn btn-secondary">
          Characters{characterCount === null ? '' : ` (${characterCount})`}
        </Link>
        <ThemeToggle />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setFocusMode(true)}
          title="Focus mode (Ctrl/⌘+Shift+F)"
        >
          Focus
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
          {saveState === 'saving' ? 'Saving…' : 'Save content'}
        </button>
      </div>

      <div className="editor-heading">
        <h1>{world.name}</h1>
        <span className="type-badge">{typeLabel(world.type)}</span>
      </div>

      {world.description && <p className="editor-description">{world.description}</p>}

      {saveError && <p className="field-error editor-save-error">{saveError}</p>}

      <textarea
        className="editor-textarea"
        value={content}
        onChange={handleChange}
        placeholder="Start writing this world's history…"
      />
    </div>
  );
}

export default Editor;
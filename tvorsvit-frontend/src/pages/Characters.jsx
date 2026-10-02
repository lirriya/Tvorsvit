import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { deleteCharacter, getWorld, listCharacters } from '../api.js';
import CharacterCard from '../components/CharacterCard.jsx';
import CharacterModal from '../components/CharacterModal.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { typeLabel } from '../worldTypes.js';

function Characters() {
  const { id } = useParams();
  const [world, setWorld] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [modal, setModal] = useState(null);

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
    getWorld(id)
      .then((loaded) => {
        if (cancelled) return;
        setWorld(loaded);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  const handleSaved = (saved) => {
    setModal(null);
    setCharacters((current) => {
      if (!current) return current;
      const exists = current.some((character) => character.id === saved.id);
      return exists
        ? current.map((character) => (character.id === saved.id ? saved : character))
        : [...current, saved];
    });
  };

  const handleDelete = (character) => {
    if (!window.confirm(`Delete "${character.name}"?`)) return;
    deleteCharacter(id, character.id)
      .then(() => {
        setCharacters((current) => (current ? current.filter((entry) => entry.id !== character.id) : current));
      })
      .catch((err) => {
        setLoadError(err.message);
      });
  };

  if (loadError && !world) {
    return (
      <div className="error-page">
        <p>Could not load this world: {loadError}</p>
        <Link to={`/worlds/${id}`} className="btn btn-secondary">
          Back to the editor
        </Link>
      </div>
    );
  }

  if (!world) {
    return <p className="status-text">Loading world…</p>;
  }

  if (characters === null) {
    if (loadError) {
      return (
        <div className="error-page">
          <p>Could not load characters: {loadError}</p>
          <button type="button" className="btn btn-secondary" onClick={fetchCharacters}>
            Retry
          </button>
          <Link to={`/worlds/${id}`} className="btn btn-secondary">
            Back to the editor
          </Link>
        </div>
      );
    }
    return <p className="status-text">Loading characters…</p>;
  }

  return (
    <div className="app-shell" style={{ '--accent': world.color || '#646cff' }}>
      <div className="characters-header">
        <Link to={`/worlds/${id}`} className="back-link">
          ← {world.name}
        </Link>
        <h1>Characters</h1>
        <span className="type-badge">{typeLabel(world.type)}</span>
        <ThemeToggle />
      </div>

      {loadError && (
        <div className="error-banner">
          <span>{loadError}</span>
          <button type="button" onClick={fetchCharacters}>
            Retry
          </button>
        </div>
      )}

      <main className="character-grid">
        <button type="button" className="create-tile" onClick={() => setModal({ mode: 'create', character: null })}>
          <span className="create-tile-plus">+</span>
          <span>Add a character</span>
        </button>
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            onEdit={(entry) => setModal({ mode: 'edit', character: entry })}
            onDelete={handleDelete}
          />
        ))}
      </main>

      {characters.length === 0 && (
        <p className="empty-hint">
          No characters yet — add the people who shape this world.
        </p>
      )}

      {modal && (
        <CharacterModal
          worldId={id}
          character={modal.character}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Characters;
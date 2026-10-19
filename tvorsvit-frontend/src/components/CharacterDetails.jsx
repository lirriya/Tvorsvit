import { useEffect } from 'react';

const DEFAULT_COLOR = '#646cff';

function Field({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

function CharacterDetails({ character, places, onClose, onEdit }) {
  const accent = character.color || DEFAULT_COLOR;
  const placeName = (id) => places?.find((place) => place.id === id)?.name ?? null;

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
        className="modal-panel modal-panel-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="character-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="detail-header">
          <span className="detail-accent" style={{ background: accent }} aria-hidden="true" />
          <h2 id="character-details-title">{character.name}</h2>
        </div>

        {character.photoUrl && (
          <div className="place-photo-preview">
            <img src={character.photoUrl} alt={`Portrait of ${character.name}`} />
          </div>
        )}

        {character.description && <p className="detail-description">{character.description}</p>}

        <Field label="Eye color" value={character.eyeColor} />
        <Field label="Hair color" value={character.hairColor} />
        <Field label="Skin tone" value={character.skinTone} />
        <Field label="MBTI" value={character.mbti} />
        <Field label="Quirks" value={character.quirks} />
        <Field label="Favorite phrase" value={character.favoritePhrase} />
        <Field label="Born in" value={placeName(character.bornInPlaceId)} />
        <Field label="Lives in" value={placeName(character.livesInPlaceId)} />

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {onEdit && (
            <button type="button" className="btn btn-primary" onClick={() => onEdit(character)}>
              Edit
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

export default CharacterDetails;

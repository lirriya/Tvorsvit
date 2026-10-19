import { useEffect, useState } from 'react';
import { listCharacterRelations } from '../api.js';
import { describeCharacterRelation } from '../characterRelationTypes.js';

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

function CharacterDetails({ worldId, character, characters, places, onClose, onEdit }) {
  const [relations, setRelations] = useState(null);
  const [relationsError, setRelationsError] = useState(null);
  const accent = character.color || DEFAULT_COLOR;
  const placeName = (id) => places?.find((place) => place.id === id)?.name ?? null;
  const characterName = (id) => characters?.find((entry) => entry.id === id)?.name ?? `#${id}`;

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    listCharacterRelations(worldId, character.id)
      .then((data) => {
        if (active) setRelations(data);
      })
      .catch((err) => {
        if (active) setRelationsError(err.message);
      });
    return () => {
      active = false;
    };
  }, [worldId, character.id]);

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

        <div className="detail-relations">
          <h3 className="detail-relations-title">Relations</h3>
          {relationsError && <p className="field-error">{relationsError}</p>}
          {!relationsError && relations === null && <p className="characters-hint">Loading relations…</p>}
          {!relationsError && relations?.length === 0 && <p className="empty-hint">No relations yet.</p>}
          {!relationsError && relations?.length > 0 && (
            <ul className="relations-list">
              {relations.map((relation) => (
                <li key={relation.id} className="relations-item">
                  <span className="relations-item-text">
                    {describeCharacterRelation(relation, character.id, characterName)}
                    {relation.description && (
                      <span className="relations-item-note">{relation.description}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

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

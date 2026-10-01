const DEFAULT_COLOR = '#646cff';

function CharacterCard({ character, onEdit, onDelete }) {
  const accent = character.color || DEFAULT_COLOR;
  return (
    <article className="character-card" style={{ '--accent': accent }}>
      <span className="character-card-accent" aria-hidden="true" />
      <span className="character-card-body">
        <span className="character-card-title">{character.name}</span>
        {character.description && <span className="character-card-description">{character.description}</span>}
        <span className="character-card-actions">
          <button type="button" className="btn btn-secondary btn-small" onClick={() => onEdit(character)}>
            Edit
          </button>
          <button type="button" className="btn btn-danger btn-small" onClick={() => onDelete(character)}>
            Delete
          </button>
        </span>
      </span>
    </article>
  );
}

export default CharacterCard;
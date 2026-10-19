const DEFAULT_COLOR = '#646cff';

function PlaceCard({ place, onEdit, onDelete }) {
  const accent = place.color || DEFAULT_COLOR;
  return (
    <article className="place-card" style={{ '--accent': accent }}>
      <span className="place-card-accent" aria-hidden="true" />
      <span className="place-card-body">
        {place.photoUrl && (
          <img className="place-card-photo" src={place.photoUrl} alt="" loading="lazy" />
        )}
        <span className="place-card-title">{place.name}</span>
        {place.description && <span className="place-card-description">{place.description}</span>}
        <span className="place-card-actions">
          <button type="button" className="btn btn-secondary btn-small" onClick={() => onEdit(place)}>
            Edit
          </button>
          <button type="button" className="btn btn-danger btn-small" onClick={() => onDelete(place)}>
            Delete
          </button>
        </span>
      </span>
    </article>
  );
}

export default PlaceCard;
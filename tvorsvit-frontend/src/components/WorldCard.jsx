import { Link } from 'react-router-dom';
import { typeLabel } from '../worldTypes.js';

const DEFAULT_COLOR = '#646cff';

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function WorldCard({ world }) {
  const accent = world.color || DEFAULT_COLOR;
  return (
    <Link to={`/worlds/${world.id}`} className="world-card" style={{ '--accent': accent }}>
      <span className="world-card-accent" aria-hidden="true" />
      <span className="world-card-body">
        <span className="world-card-title">{world.name}</span>
        <span className="type-badge">{typeLabel(world.type)}</span>
        {world.description && <span className="world-card-description">{world.description}</span>}
        <span className="world-card-date">{formatDate(world.createdAt)}</span>
      </span>
    </Link>
  );
}

export default WorldCard;
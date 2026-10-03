import { Link } from 'react-router-dom';
import { WORLD_THEMES, themeOf } from '../worldThemes.js';
import { typeLabel } from '../worldTypes.js';
import ThemeToggle from './ThemeToggle.jsx';

function ArrowLeftIcon() {
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
      <path d="M19 12H5" />
      <path d="M11 5l-7 7 7 7" />
    </svg>
  );
}

export default function WorldBar({ world, right }) {
  const theme = WORLD_THEMES.find((entry) => entry.key === themeOf(world));

  return (
    <header className="world-bar">
      <div className="world-bar-inner">
        <Link to="/" className="back-pill">
          <ArrowLeftIcon />
          <span>All worlds</span>
        </Link>
        <div className="world-bar-identity">
          <span className="world-bar-dot" style={{ background: theme.dot }} aria-hidden="true" />
          <span className="world-bar-name">{world.name}</span>
          <span className="type-badge">{typeLabel(world.type)}</span>
        </div>
        {right}
        <ThemeToggle />
      </div>
    </header>
  );
}
import { Link, useLocation } from 'react-router-dom';

function StoryIcon() {
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
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M10 12h5" />
      <path d="M10 16h5" />
    </svg>
  );
}

function CharactersIcon() {
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
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function PlacesIcon() {
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
      <path d="M12 21.5s-6.5-5.4-6.5-10a6.5 6.5 0 0 1 13 0c0 4.6-6.5 10-6.5 10z" />
      <circle cx="12" cy="11" r="2.4" />
    </svg>
  );
}

function NodesIcon() {
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
      <circle cx="6.5" cy="7" r="2.2" />
      <circle cx="17.5" cy="6" r="2.2" />
      <circle cx="12.5" cy="17" r="2.2" />
      <path d="M8.4 8.2l3 6.4" />
      <path d="M15.4 7.8l-1.8 7" />
    </svg>
  );
}

function TimelineIcon() {
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
      <path d="M4 19h16" />
      <circle cx="8" cy="13" r="2" />
      <circle cx="13" cy="9" r="2" />
      <circle cx="17.5" cy="5.5" r="2" />
    </svg>
  );
}

const RAIL_ITEMS = {
  story: StoryIcon,
  characters: CharactersIcon,
  places: PlacesIcon,
  'node-graph': NodesIcon,
  timeline: TimelineIcon,
};

export default function WorkbenchRail({ worldId, charactersCount }) {
  const location = useLocation();

  return (
    <nav className="workbench-rail" aria-label="World sections">
      {Object.entries(RAIL_ITEMS).map(([key, Icon]) => {
        const to =
          key === 'story'
            ? `/worlds/${worldId}`
            : `/worlds/${worldId}/${key}`;
        const label =
          key === 'characters' && typeof charactersCount === 'number'
            ? `Characters (${charactersCount})`
            : key
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        return (
          <Link key={key} to={to} className={`rail-item${location.pathname === to ? ' is-active' : ''}`}>
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
import { useEffect, useRef, useState } from 'react';
import SettingsModal from './SettingsModal.jsx';
import ThemeToggle from './ThemeToggle.jsx';

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="3.6" />
      <path d="M19.5 20a7.5 7.5 0 0 0-15 0" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function TopBar() {
  const [showSettings, setShowSettings] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  const handleComingSoon = () => {
    window.clearTimeout(toastTimer.current);
    setShowToast(true);
    toastTimer.current = window.setTimeout(() => setShowToast(false), 2600);
  };

  return (
    <header className="top-bar">
      <div className="top-bar-brand">
        <span className="top-bar-name">Tvorsvit</span>
      </div>
      <nav className="top-bar-actions" aria-label="App actions">
        <ThemeToggle />
        <button
          type="button"
          className="icon-button"
          onClick={handleComingSoon}
          aria-label="Account — coming soon"
          title="Account — coming soon"
        >
          <UserIcon />
        </button>
        <button
          type="button"
          className="icon-button"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
          title="Settings"
        >
          <GearIcon />
        </button>
      </nav>
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showToast && (
        <div className="toast" role="status">
          Account — coming soon
        </div>
      )}
    </header>
  );
}

export default TopBar;
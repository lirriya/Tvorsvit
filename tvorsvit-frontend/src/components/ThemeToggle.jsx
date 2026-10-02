import { useTheme } from '../theme.js';

function SunIcon() {
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
      <circle cx="12" cy="12" r="3.8" />
      <path d="M12 2.5v1.9M12 19.6v1.9M2.5 12h1.9M19.6 12h1.9M5 5l1.4 1.4M19 19l-1.4-1.4M19 5l-1.4 1.4M5 19l1.4 1.4" />
      <path d="M10.4 11.2h1.1M12.5 11.2h1.1M10.1 13.4q1.9 1.5 3.8 0" />
    </svg>
  );
}

function MoonIcon() {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      <path d="M15.2 4.4l.8 1.6 1.6.8-1.6.8-.8 1.6-.8-1.6-1.6-.8 1.6-.8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ThemeToggle() {
  const [theme, toggleTheme] = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default ThemeToggle;
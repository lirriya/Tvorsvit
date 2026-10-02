import { useCallback, useEffect, useState } from 'react';

const THEME_KEY = 'tvorsvit-theme';

export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
}

export function getEffectiveTheme() {
  return getStoredTheme() ?? 'light';
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(getEffectiveTheme);

  useEffect(() => {
    applyTheme(theme);
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return [theme, toggleTheme];
}
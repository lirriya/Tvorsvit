import { useCallback, useEffect, useState } from 'react';

const SCALE_KEY = 'tvorsvit-scale';

export function getStoredScale() {
  try {
    const stored = localStorage.getItem(SCALE_KEY);
    return stored === 'lg' || stored === 'xl' || stored === 'md' ? stored : null;
  } catch {
    return null;
  }
}

export function getEffectiveScale() {
  return getStoredScale() ?? 'md';
}

export function applyScale(scale) {
  document.documentElement.dataset.scale = scale;
}

export function setStoredScale(scale) {
  try {
    localStorage.setItem(SCALE_KEY, scale);
    return true;
  } catch {
    return false;
  }
}

export function useFontScale() {
  const [scale, setScale] = useState(getEffectiveScale);

  useEffect(() => {
    applyScale(scale);
    setStoredScale(scale);
  }, [scale]);

  const setFontScale = useCallback((next) => {
    setScale(next);
  }, []);

  return [scale, setFontScale];
}
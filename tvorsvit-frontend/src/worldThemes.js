export const WORLD_THEMES = [
  { key: 'lavender', label: 'Lavender Dream', dot: '#a78bfa' },
  { key: 'forest', label: 'Green Forest', dot: '#5aa97c' },
  { key: 'fantasy', label: 'Magic Fantasy', dot: '#7c8cf8' },
  { key: 'horror', label: 'Horror', dot: '#c0526e' },
  { key: 'academy', label: 'Dark Academy', dot: '#b08d57' },
  { key: 'ocean', label: 'Ocean', dot: '#4fb8b0' },
];

export function themeLabel(key) {
  const match = WORLD_THEMES.find((theme) => theme.key === key);
  return match ? match.label : WORLD_THEMES[0].label;
}

export function themeOf(world) {
  const key = world?.theme;
  return WORLD_THEMES.some((theme) => theme.key === key) ? key : WORLD_THEMES[0].key;
}
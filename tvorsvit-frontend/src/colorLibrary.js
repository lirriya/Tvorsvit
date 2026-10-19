const LIBRARY_KEY = 'tvorsvit:color-library';
const RECENT_KEY = 'tvorsvit:color-recent';
const MAX_RECENT = 12;

export const CURATED_COLORS = [
  '#a78bfa',
  '#5aa97c',
  '#7c8cf8',
  '#c0526e',
  '#b08d57',
  '#4fb8b0',
  '#646cff',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#0ea5e9',
  '#14b8a6',
  '#64748b',
  '#94a3b8',
];

function normalize(color) {
  return typeof color === 'string' ? color.trim().toLowerCase() : '';
}

function read(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export function loadColorLibrary() {
  return read(LIBRARY_KEY, [])
    .filter((entry) => entry && typeof entry.color === 'string')
    .map((entry) => ({ name: String(entry.name ?? ''), color: normalize(entry.color) }));
}

export function saveColorLibrary(entries) {
  write(LIBRARY_KEY, entries);
  return entries;
}

export function addLibraryColor(name, color) {
  const normalized = normalize(color);
  if (!normalized) return loadColorLibrary();
  const entries = loadColorLibrary().filter((entry) => entry.color !== normalized);
  entries.unshift({ name: String(name ?? '').trim() || normalized, color: normalized });
  return saveColorLibrary(entries);
}

export function removeLibraryColor(color) {
  const normalized = normalize(color);
  return saveColorLibrary(loadColorLibrary().filter((entry) => entry.color !== normalized));
}

export function loadRecentColors() {
  return read(RECENT_KEY, [])
    .map(normalize)
    .filter(Boolean);
}

export function pushRecentColor(color) {
  const normalized = normalize(color);
  if (!normalized) return loadRecentColors();
  const entries = loadRecentColors().filter((entry) => entry !== normalized);
  entries.unshift(normalized);
  const trimmed = entries.slice(0, MAX_RECENT);
  write(RECENT_KEY, trimmed);
  return trimmed;
}

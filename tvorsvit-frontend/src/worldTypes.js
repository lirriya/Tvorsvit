export const WORLD_TYPES = [
  { value: 'BOOK', label: 'Book / Novel' },
  { value: 'TABLETOP_RPG', label: 'Tabletop RPG (D&D)' },
  { value: 'GAME_LORE', label: 'Game Lore' },
  { value: 'SHORT_STORY', label: 'Short Story' },
  { value: 'SCREENPLAY', label: 'Screenplay' },
  { value: 'COMIC', label: 'Comic / Graphic Novel' },
  { value: 'OTHER', label: 'Other' },
];

export function typeLabel(value) {
  const match = WORLD_TYPES.find((type) => type.value === value);
  return match ? match.label : value;
}
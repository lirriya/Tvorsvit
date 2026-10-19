export const CHARACTER_RELATION_TYPES = [
  { value: 'FRIEND', label: 'Friend of', directional: false },
  { value: 'FAMILY', label: 'Family of', directional: false },
  { value: 'ROMANTIC', label: 'Romantically involved with', directional: false },
  { value: 'RIVAL', label: 'Rival of', directional: false },
  { value: 'ALLY', label: 'Ally of', directional: false },
  { value: 'MENTOR', label: 'Mentor of', directional: true },
  { value: 'OTHER', label: 'Other', directional: true },
  { value: 'CUSTOM', label: 'Custom…', directional: true },
];

export function characterRelationLabel(type, customLabel) {
  if (type === 'CUSTOM') {
    return customLabel ? `Custom: ${customLabel}` : 'Custom';
  }
  const match = CHARACTER_RELATION_TYPES.find((entry) => entry.value === type);
  return match ? match.label : type;
}

export function characterRelationConnector(type) {
  const match = CHARACTER_RELATION_TYPES.find((entry) => entry.value === type);
  return match && !match.directional ? '↔' : '→';
}

export function describeCharacterRelation(relation, selfId, nameOf) {
  const label = characterRelationLabel(relation.type, relation.customLabel);
  const arrow = characterRelationConnector(relation.type);
  if (selfId == null) {
    return `This character ${arrow} ${label} ${arrow} ${nameOf(relation.toCharacterId)}`;
  }
  if (relation.fromCharacterId === selfId) {
    return `${nameOf(selfId)} ${arrow} ${label} ${arrow} ${nameOf(relation.toCharacterId)}`;
  }
  return `${nameOf(relation.fromCharacterId)} ${arrow} ${label} ${arrow} ${nameOf(selfId)}`;
}
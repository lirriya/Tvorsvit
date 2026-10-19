export const PLACE_RELATION_TYPES = [
  { value: 'LOCATED_IN', label: 'Located in', directional: true },
  { value: 'PART_OF', label: 'Part of', directional: true },
  { value: 'CONNECTED_TO', label: 'Connected to', directional: false },
  { value: 'NEIGHBOR', label: 'Neighbor of', directional: false },
  { value: 'OTHER', label: 'Other', directional: true },
  { value: 'CUSTOM', label: 'Custom…', directional: true },
];

export function placeRelationLabel(type, customLabel) {
  if (type === 'CUSTOM') {
    return customLabel ? `Custom: ${customLabel}` : 'Custom';
  }
  const match = PLACE_RELATION_TYPES.find((entry) => entry.value === type);
  return match ? match.label : type;
}

export function placeRelationConnector(type) {
  const match = PLACE_RELATION_TYPES.find((entry) => entry.value === type);
  return match && !match.directional ? '↔' : '→';
}

export function describePlaceRelation(relation, selfId, nameOf) {
  const label = placeRelationLabel(relation.type, relation.customLabel);
  const arrow = placeRelationConnector(relation.type);
  if (selfId == null) {
    return `This place ${arrow} ${label} ${arrow} ${nameOf(relation.toPlaceId)}`;
  }
  if (relation.fromPlaceId === selfId) {
    return `${nameOf(selfId)} ${arrow} ${label} ${arrow} ${nameOf(relation.toPlaceId)}`;
  }
  return `${nameOf(relation.fromPlaceId)} ${arrow} ${label} ${arrow} ${nameOf(selfId)}`;
}

export function isSymmetricPlaceRelation(type) {
  const match = PLACE_RELATION_TYPES.find((entry) => entry.value === type);
  return match ? !match.directional : false;
}
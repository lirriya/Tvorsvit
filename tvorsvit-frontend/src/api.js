const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function listWorlds() {
  return request('/worlds');
}

export function createWorld(payload) {
  return request('/worlds', { method: 'POST', body: JSON.stringify(payload) });
}

export function getWorld(id) {
  return request(`/worlds/${id}`);
}

export function saveWorldContent(id, content) {
  return request(`/worlds/${id}/content`, { method: 'PUT', body: JSON.stringify({ content }) });
}

export function updateWorld(id, payload) {
  return request(`/worlds/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function listCharacters(worldId) {
  return request(`/worlds/${worldId}/characters`);
}

export function createCharacter(worldId, payload) {
  return request(`/worlds/${worldId}/characters`, { method: 'POST', body: JSON.stringify(payload) });
}

export function updateCharacter(worldId, id, payload) {
  return request(`/worlds/${worldId}/characters/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export function deleteCharacter(worldId, id) {
  return request(`/worlds/${worldId}/characters/${id}`, { method: 'DELETE' });
}
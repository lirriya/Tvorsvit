import { useCallback, useEffect, useState } from 'react';
import {
  createCharacterRelation,
  deleteCharacterRelation,
  listCharacterRelations,
  updateCharacterRelation,
} from '../api.js';
import { CHARACTER_RELATION_TYPES, describeCharacterRelation } from '../characterRelationTypes.js';

const EMPTY_FORM = { otherId: '', type: 'FRIEND', customLabel: '', description: '', fromId: null };

function CharacterRelationsPanel({ worldId, character, characters }) {
  const [relations, setRelations] = useState(null);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    listCharacterRelations(worldId, character.id)
      .then((data) => {
        setRelations(data);
        setError(null);
      })
      .catch((err) => setError(err.message));
  }, [worldId, character]);

  useEffect(() => {
    load();
  }, [load]);

  const nameOf = (id) => characters.find((entry) => entry.id === id)?.name ?? `#${id}`;

  const candidates = characters.filter((entry) => entry.id !== character.id);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  };

  const openEdit = (relation) => {
    setEditingId(relation.id);
    const otherId = relation.fromCharacterId === character.id ? relation.toCharacterId : relation.fromCharacterId;
    setForm({
      otherId: String(otherId),
      type: relation.type,
      customLabel: relation.customLabel ?? '',
      description: relation.description ?? '',
      fromId: relation.fromCharacterId,
    });
  };

  const closeForm = () => {
    setForm(null);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.otherId) return;
    const type = form.type;
    const customLabel = type === 'CUSTOM' ? form.customLabel.trim() || null : null;
    const description = form.description.trim() || null;

    const otherId = Number(form.otherId);
    const keepIncoming = editingId != null && form.fromId != null && form.fromId !== character.id;
    const payload = {
      fromCharacterId: keepIncoming ? otherId : character.id,
      toCharacterId: keepIncoming ? character.id : otherId,
      type,
      customLabel,
      description,
    };
    try {
      if (editingId) {
        await updateCharacterRelation(worldId, editingId, payload);
      } else {
        await createCharacterRelation(worldId, payload);
      }
      closeForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (relation) => {
    if (!window.confirm('Delete this relation?')) return;
    try {
      await deleteCharacterRelation(worldId, relation.id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const describe = (relation) => describeCharacterRelation(relation, character.id, nameOf);

  return (
    <div className="relations-panel">
      <div className="relations-head">
        <h3>Relations</h3>
        {!form && (
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={openCreate}
            disabled={candidates.length === 0}
          >
            Add relation
          </button>
        )}
      </div>

      {candidates.length === 0 && !form && (
        <p className="empty-hint">Add another character first to link them to this one.</p>
      )}

      {error && <p className="field-error">{error}</p>}

      {relations === null && <p className="characters-hint">Loading relations…</p>}

      {relations !== null && relations.length > 0 && (
        <ul className="relations-list">
          {relations.map((relation) => (
            <li key={relation.id} className="relations-item">
              <span className="relations-item-text">
                {describe(relation)}
                {relation.description && (
                  <span className="relations-item-note">{relation.description}</span>
                )}
              </span>
              <span className="relations-item-actions">
                <button type="button" className="btn btn-secondary btn-small" onClick={() => openEdit(relation)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger btn-small" onClick={() => handleDelete(relation)}>
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {relations !== null && relations.length === 0 && !form && candidates.length > 0 && (
        <p className="empty-hint">No relations yet.</p>
      )}

      {form && (
        <form className="relation-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Related character</span>
              <select
                value={form.otherId}
                onChange={(event) => setForm((current) => ({ ...current, otherId: event.target.value }))}
                required
              >
                <option value="">— Pick a character —</option>
                {candidates.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Relation</span>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                {CHARACTER_RELATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {form.type === 'CUSTOM' && (
            <label className="field">
              <span className="field-label">Custom label</span>
              <input
                type="text"
                value={form.customLabel}
                maxLength={80}
                onChange={(event) => setForm((current) => ({ ...current, customLabel: event.target.value }))}
                placeholder="e.g. Sworn enemy"
                required
              />
            </label>
          )}

          <label className="field">
            <span className="field-label">Note</span>
            <input
              type="text"
              value={form.description}
              maxLength={200}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Optional note"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary btn-small" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-small">
              {editingId ? 'Save relation' : 'Add relation'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CharacterRelationsPanel;

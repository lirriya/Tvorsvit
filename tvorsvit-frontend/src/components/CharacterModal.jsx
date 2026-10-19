import { useEffect, useRef, useState } from 'react';
import { createCharacter, createCharacterRelation, listPlaces, updateCharacter } from '../api.js';
import CharacterRelationsPanel from './CharacterRelationsPanel.jsx';
import ColorPicker from './ColorPicker.jsx';
import CustomFieldsEditor from './CustomFieldsEditor.jsx';

const MBTI_TYPES = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ',
];

function CharacterModal({ worldId, character, characters, onClose, onSaved }) {
  const isEdit = Boolean(character);
  const [form, setForm] = useState(() => ({
    name: character?.name ?? '',
    description: character?.description ?? '',
    color: character?.color ?? '#646cff',
    photoUrl: character?.photoUrl ?? '',
    eyeColor: character?.eyeColor ?? '',
    skinTone: character?.skinTone ?? '',
    hairColor: character?.hairColor ?? '',
    mbti: character?.mbti ?? '',
    quirks: character?.quirks ?? '',
    favoritePhrase: character?.favoritePhrase ?? '',
    bornInPlaceId: character?.bornInPlaceId != null ? String(character.bornInPlaceId) : '',
    livesInPlaceId: character?.livesInPlaceId != null ? String(character.livesInPlaceId) : '',
    customFields: character?.customFields?.map((field) => ({ label: field.label ?? '', value: field.value ?? '' })) ?? [],
  }));
  const [places, setPlaces] = useState([]);
  const [pendingRelations, setPendingRelations] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  useEffect(() => {
    let cancelled = false;
    listPlaces(worldId)
      .then((data) => {
        if (!cancelled) setPlaces(data);
      })
      .catch(() => {
        if (!cancelled) setPlaces([]);
      });
    return () => {
      cancelled = true;
    };
  }, [worldId]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
    if (form.photoUrl.trim() && !/^(https?:\/\/|\/|\.\/|\.\.\/)/.test(form.photoUrl.trim())) {
      next.photoUrl = 'Use a full URL (https://…) or a path starting with “/”.';
    }
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      color: form.color,
      photoUrl: form.photoUrl.trim() || null,
      eyeColor: form.eyeColor.trim() || null,
      skinTone: form.skinTone.trim() || null,
      hairColor: form.hairColor.trim() || null,
      mbti: form.mbti || null,
      quirks: form.quirks.trim() || null,
      favoritePhrase: form.favoritePhrase.trim() || null,
      bornInPlaceId: form.bornInPlaceId ? Number(form.bornInPlaceId) : null,
      livesInPlaceId: form.livesInPlaceId ? Number(form.livesInPlaceId) : null,
      customFields: form.customFields
        .filter((field) => field.label.trim())
        .map((field) => ({ label: field.label.trim(), value: field.value.trim() || null })),
    };

    setSubmitting(true);
    try {
      const saved = isEdit
        ? await updateCharacter(worldId, character.id, payload)
        : await createCharacter(worldId, payload);
      if (!isEdit && pendingRelations.length > 0) {
        for (const relation of pendingRelations) {
          try {
            await createCharacterRelation(worldId, {
              fromCharacterId: saved.id,
              toCharacterId: relation.toCharacterId,
              type: relation.type,
              customLabel: relation.customLabel ?? null,
              description: relation.description ?? null,
            });
          } catch (err) {
            window.alert(`Character saved, but a relation could not be created: ${err.message}`);
          }
        }
      }
      onSaved(saved);
    } catch (err) {
      setErrors({ form: err.message });
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section
        className="modal-panel modal-panel-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby={isEdit ? 'edit-character-title' : 'create-character-title'}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={isEdit ? 'edit-character-title' : 'create-character-title'}>
          {isEdit ? 'Edit character' : 'New character'}
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Name</span>
            <input
              ref={nameInputRef}
              type="text"
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="e.g. Kaelen of the Ashwastes"
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>

          <label className="field">
            <span className="field-label">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              rows={3}
              maxLength={300}
              placeholder="A short introduction (optional)"
            />
            <span
              className={`field-counter${form.description.length >= 240 ? ' is-near' : ''}${form.description.length >= 300 ? ' is-max' : ''}`}
            >
              {form.description.length}/300
            </span>
          </label>

          <label className="field">
            <span className="field-label">Photo</span>
            <input
              type="text"
              value={form.photoUrl}
              onChange={(event) => setField('photoUrl', event.target.value)}
              placeholder="https://… or /images/character.jpg (optional)"
            />
            {errors.photoUrl && <span className="field-error">{errors.photoUrl}</span>}
          </label>

          {form.photoUrl.trim() && (
            <div className="place-photo-preview">
              <img src={form.photoUrl} alt="" />
            </div>
          )}

          <div className="field-row">
            <label className="field">
              <span className="field-label">Eye color</span>
              <input
                type="text"
                value={form.eyeColor}
                maxLength={30}
                onChange={(event) => setField('eyeColor', event.target.value)}
                placeholder="e.g. green"
              />
            </label>
            <label className="field">
              <span className="field-label">Hair color</span>
              <input
                type="text"
                value={form.hairColor}
                maxLength={30}
                onChange={(event) => setField('hairColor', event.target.value)}
                placeholder="e.g. auburn"
              />
            </label>
            <label className="field">
              <span className="field-label">Skin tone</span>
              <input
                type="text"
                value={form.skinTone}
                maxLength={30}
                onChange={(event) => setField('skinTone', event.target.value)}
                placeholder="e.g. olive"
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">MBTI</span>
            <select value={form.mbti} onChange={(event) => setField('mbti', event.target.value)}>
              <option value="">— None —</option>
              {MBTI_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Quirks</span>
            <textarea
              value={form.quirks}
              onChange={(event) => setField('quirks', event.target.value)}
              rows={2}
              maxLength={300}
              placeholder="Little habits, tics, oddities (optional)"
            />
          </label>

          <label className="field">
            <span className="field-label">Favorite phrase</span>
            <input
              type="text"
              value={form.favoritePhrase}
              maxLength={200}
              onChange={(event) => setField('favoritePhrase', event.target.value)}
              placeholder="Something they always say (optional)"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Born in</span>
              <select
                value={form.bornInPlaceId}
                onChange={(event) => setField('bornInPlaceId', event.target.value)}
              >
                <option value="">— Unknown —</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Lives in</span>
              <select
                value={form.livesInPlaceId}
                onChange={(event) => setField('livesInPlaceId', event.target.value)}
              >
                <option value="">— Unknown —</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="field field-color">
            <span className="field-label">Accent color</span>
            <ColorPicker value={form.color} onChange={(color) => setField('color', color)} />
          </div>

          <div className="field">
            <span className="field-label">Custom fields</span>
            <CustomFieldsEditor
              fields={form.customFields}
              onChange={(fields) => setField('customFields', fields)}
            />
          </div>

          {errors.form && <p className="field-error form-error">{errors.form}</p>}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? (isEdit ? 'Saving…' : 'Creating…') : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>

        <CharacterRelationsPanel
          worldId={worldId}
          character={isEdit ? character : null}
          characters={characters ?? []}
          pending={pendingRelations}
          onPendingChange={setPendingRelations}
        />
      </section>
    </div>
  );
}

export default CharacterModal;
function CustomFieldsEditor({ fields, onChange }) {
  const update = (index, patch) => {
    onChange(fields.map((field, position) => (position === index ? { ...field, ...patch } : field)));
  };

  const remove = (index) => {
    onChange(fields.filter((field, position) => position !== index));
  };

  const add = () => {
    onChange([...fields, { label: '', value: '' }]);
  };

  return (
    <div className="custom-fields">
      {fields.length === 0 && (
        <p className="empty-hint">No custom fields yet. Add one for anything unique to this world.</p>
      )}

      {fields.map((field, index) => (
        <div className="custom-field-row" key={index}>
          <input
            type="text"
            value={field.label}
            maxLength={80}
            onChange={(event) => update(index, { label: event.target.value })}
            placeholder="Label (e.g. Magic type)"
            aria-label="Custom field label"
          />
          <input
            type="text"
            value={field.value}
            maxLength={500}
            onChange={(event) => update(index, { value: event.target.value })}
            placeholder="Value (e.g. Fire)"
            aria-label="Custom field value"
          />
          <button
            type="button"
            className="btn btn-danger btn-small"
            onClick={() => remove(index)}
            aria-label="Remove custom field"
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" className="btn btn-secondary btn-small" onClick={add}>
        Add custom field
      </button>
    </div>
  );
}

export default CustomFieldsEditor;

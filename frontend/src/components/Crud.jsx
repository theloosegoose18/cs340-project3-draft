import { useMemo, useState } from "react";

export default function Crud({
                                 title,
                                 fields,
                                 buttonText,
                                 onSubmit,           // REQUIRED: async (values) => {}
                                 disabled = false,
                                 note,
                             }) {
    const initial = useMemo(() => {
        const obj = {};
        for (const f of fields) {
            if (f.type === "checkbox") obj[f.name] = Boolean(f.defaultValue ?? false);
            else obj[f.name] = f.defaultValue ?? "";
        }
        return obj;
    }, [fields]);

    const [values, setValues] = useState(initial);
    const [saving, setSaving] = useState(false);

    const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));

    const handleChange = (f, e) => {
        if (f.type === "checkbox") return setField(f.name, e.target.checked);

        let v = e.target.value;

        // Parse for numbers if desired
        if (f.type === "number" && v !== "") v = Number(v);

        // Custom per-field parse
        if (typeof f.parse === "function") v = f.parse(v);

        setField(f.name, v);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (typeof onSubmit !== "function") {
            console.error("Crud: missing onSubmit for", title);
            return;
        }

        try {
            setSaving(true);
            await onSubmit(values);
            setValues(initial); // reset after success
        } catch (err) {
            alert(err.message ?? "Request failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="card">
            <h3>{title}</h3>

            <form onSubmit={submit}>
                {fields.map((f) => (
                    <div className="form-row" key={f.name}>
                        <label htmlFor={f.name}>{f.label}</label>

                        {f.type === "select" ? (
                            <select
                                id={f.name}
                                name={f.name}
                                value={values[f.name]}
                                onChange={(e) => handleChange(f, e)}
                                disabled={disabled || saving}
                            >
                                {(f.options ?? []).map((opt) => (
                                    <option key={`${opt.value}`} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : f.type === "checkbox" ? (
                            <input
                                id={f.name}
                                name={f.name}
                                type="checkbox"
                                checked={Boolean(values[f.name])}
                                onChange={(e) => handleChange(f, e)}
                                disabled={disabled || saving}
                            />
                        ) : (
                            <input
                                id={f.name}
                                name={f.name}
                                type={f.type ?? "text"}
                                placeholder={f.placeholder ?? ""}
                                step={f.step}
                                min={f.min}
                                value={values[f.name]}
                                onChange={(e) => handleChange(f, e)}
                                disabled={disabled || saving}
                            />
                        )}
                    </div>
                ))}

                <button type="submit" disabled={disabled || saving}>
                    {saving ? "Saving..." : buttonText}
                </button>

                {note && <p className="note">{note}</p>}
            </form>
        </div>
    );
}
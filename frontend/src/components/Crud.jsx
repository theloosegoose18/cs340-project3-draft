export default function Crud({ title, fields, buttonText }) {
    return (
        <div className="card">
            <h3>{title}</h3>

            {fields.map((f) => (
                <div className="form-row" key={f.name}>
                    <label htmlFor={f.name}>{f.label}</label>
                    <input
                        id={f.name}
                        name={f.name}
                        type={f.type ?? "text"}
                        placeholder={f.placeholder ?? ""}
                        step={f.step}
                        min={f.min}
                    />
                </div>
            ))}

            <button type="button">{buttonText}</button>
            <p className="note">Button is static.</p>
        </div>
    );
}

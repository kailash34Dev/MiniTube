export default function FormInput({
    label,
    type = "text",
    options = [],
    error,
    required,
    ...props
}) {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label}{" "}
                    {required && (
                        <span style={{ color: "var(--brand-primary)" }}>*</span>
                    )}
                </label>
            )}

            {type === "textarea" ? (
                <textarea
                    className="form-textarea"
                    required={required}
                    {...props}
                />
            ) : type === "select" ? (
                <div className="select-wrapper">
                    <select
                        className="form-input form-select"
                        required={required}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                <input
                    type={type}
                    className="form-input"
                    required={required}
                    {...props}
                />
            )}

            {error && <span className="form-error-msg">{error}</span>}
        </div>
    );
}

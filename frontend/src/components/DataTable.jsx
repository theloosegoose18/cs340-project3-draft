export default function DataTable({
                                      columns,
                                      rows,
                                      onDeleteRow,                 // optional
                                      deleteButtonText = "Delete",  // optional
                                      confirmDeleteMessage,         // optional: (row) => string
                                  }) {
    const hasDelete = typeof onDeleteRow === "function";

    const handleDeleteClick = (row) => {
        if (typeof confirmDeleteMessage === "function") {
            const msg = confirmDeleteMessage(row);
            if (!window.confirm(msg)) return;
        }
        onDeleteRow(row);
    };

    return (
        <div className="table-wrap">
            <table>
                <thead>
                <tr>
                    {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                    {hasDelete && <th>Actions</th>}
                </tr>
                </thead>

                <tbody>
                {rows.map((r, idx) => (
                    <tr key={idx}>
                        {columns.map((c) => (
                            <td key={c.key}>
                                {c.render ? c.render(r[c.key], r) : String(r[c.key] ?? "")}
                            </td>
                        ))}


                        {hasDelete && (
                            <td>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteClick(r)}
                                >
                                    {deleteButtonText}
                                </button>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

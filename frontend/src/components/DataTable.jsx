export default function DataTable({
                                      columns,
                                      rows,
                                      rowKey,
                                      onDeleteRow,
                                      deleteButtonText = "Delete",
                                      confirmDeleteMessage,
                                  }) {
    const hasDelete = typeof onDeleteRow === "function";

    const handleDeleteClick = async (row) => {
        if (typeof confirmDeleteMessage === "function") {
            const msg = confirmDeleteMessage(row);
            if (!window.confirm(msg)) return;
        }
        await onDeleteRow(row);
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
                {rows.length === 0 ? (
                    <tr>
                        <td colSpan={columns.length + (hasDelete ? 1 : 0)}>
                            No records found.
                        </td>
                    </tr>
                ) : (
                    rows.map((r, idx) => (
                        <tr key={(rowKey && r?.[rowKey] != null) ? String(r[rowKey]) : idx}>
                            {columns.map((c) => (
                                <td key={c.key}>
                                    {c.render ? c.render(r[c.key], r) : String(r[c.key] ?? "")}
                                </td>
                            ))}

                            {hasDelete && (
                                <td>
                                    <button type="button" onClick={() => handleDeleteClick(r)}>
                                        {deleteButtonText}
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
}
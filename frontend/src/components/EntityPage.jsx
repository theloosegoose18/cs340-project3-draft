import DataTable from "./DataTable";
import Crud from "./Crud";

export default function EntityPage({
                                       pageTitle,
                                       browseTitle,
                                       columns,

                                       rows,
                                       rowKey,

                                       loading,
                                       error,

                                       insertConfig,
                                       updateConfig,

                                       onDeleteRow,
                                       deleteButtonText,
                                       confirmDeleteMessage,
                                   }) {
    return (
        <main className="main">
            <h2 className="page-title">{pageTitle}</h2>

            <section className="section">
                <h2>{browseTitle}</h2>

                {error && <p className="note">Error: {error}</p>}
                {loading && <p className="note">Loading...</p>}

                <DataTable
                    columns={columns}
                    rows={rows ?? []}
                    rowKey={rowKey}
                    onDeleteRow={onDeleteRow}
                    deleteButtonText={deleteButtonText}
                    confirmDeleteMessage={confirmDeleteMessage}
                />
            </section>

            <section className="section">
                <h2>CRUD</h2>
                <div className="crud-grid">
                    <Crud {...insertConfig} disabled={loading} />
                    <Crud {...updateConfig} disabled={loading} />
                </div>
            </section>
        </main>
    );
}
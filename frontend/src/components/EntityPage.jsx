import DataTable from "./DataTable";
import Crud from "./Crud";

export default function EntityPage({
                                       pageTitle,
                                       browseTitle,
                                       columns,
                                       sampleRows,
                                       insertConfig,
                                       updateConfig,
                                       rowKey,

                                       onDeleteRow,
                                       deleteButtonText,
                                       confirmDeleteMessage,
                                   }) {
    return (
        <main className="main">
            <h2 className="page-title">{pageTitle}</h2>

            <section className="section">
                <h2>{browseTitle}</h2>

                <DataTable
                    columns={columns}
                    rows={sampleRows}
                    rowKey={rowKey}
                    onDeleteRow={onDeleteRow}
                    deleteButtonText={deleteButtonText}
                    confirmDeleteMessage={confirmDeleteMessage}
                />


                <p className="note">{pageTitle} Page sample records.</p>
            </section>

            <section className="section">
                <h2>CRUD</h2>
                <div className="crud-grid">
                    <Crud {...insertConfig} />
                    <Crud {...updateConfig} />
                </div>
            </section>
        </main>
    );
}

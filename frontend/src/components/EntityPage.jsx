import DataTable from "./DataTable";
import Crud from "./Crud";

export default function EntityPage({
                                       pageTitle,
                                       browseTitle,
                                       columns,
                                       sampleRows,
                                       insertConfig,
                                       updateConfig,
                                       deleteConfig,
                                   }) {
    return (
        <main className="main">
            <h2 className="page-title">{pageTitle}</h2>

            {/* BROWSE */}
            <section className="section">
                <h2>{browseTitle}</h2>
                <DataTable columns={columns} rows={sampleRows} />
                <p className="note">
                    {pageTitle} Page sample records.
                </p>
            </section>

            {/* CRUD - separate sections, no "CRUD OPERATIONS" header */}
            <section className="section">
                <h2>Actions</h2>

                <div className="crud-grid">
                    <Crud {...insertConfig} />
                    <Crud {...updateConfig} />
                    <Crud {...deleteConfig} />
                </div>
            </section>
        </main>
    );
}

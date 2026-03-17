/*
* ------------ Inventories Page ------------
* Handles browse, insert, partial update, and delete for the Inventories table.
* State and CRUD handlers are provided by the useCrud hook.
*
* Sources:
*   - React custom hooks:  https://react.dev/learn/reusing-logic-with-custom-hooks
* */

import EntityPage from "../components/EntityPage";
import { useCrud } from "../hooks/useCrud";

export default function Inventories() {

    const { rows, loading, error, handleInsert, handleUpdate, handleDelete } =
        useCrud("/api/inventories", "inventoryID");

    // Build dropdown options for the Update form selector
    const inventoryOptions = [
        { value: "", label: "-- Select an inventory --" },
        ...rows.map((i) => ({
            value: i.inventoryID,
            label: `${i.inventoryID} — ${i.name}`,
        })),
    ];

    // Boolean select for atStore — DB stores 0/1, UI shows readable labels
    const atStoreOptions = [
        { value: "",    label: "-- Select location --" },
        { value: true,  label: "At Store" },
        { value: false, label: "Not at Store" },
    ];

    return (
        <EntityPage
            pageTitle="Inventories"
            browseTitle="Browse Inventories"
            columns={[
                { key: "inventoryID", label: "Inventory ID" },
                { key: "name",        label: "Inventory Name" },
                {
                    key: "atStore", label: "Location",
                    // Render the boolean DB value as a human-readable string
                    render: (v) => (v ? "At Store" : "Not at Store")
                },
            ]}
            rows={rows}
            rowKey="inventoryID"
            loading={loading}
            error={error}
            insertConfig={{
                title: "Insert Inventory",
                buttonText: "Submit",
                onSubmit: handleInsert,
                fields: [
                    { name: "name",    label: "Inventory Name" },
                    { name: "atStore", label: "Location", type: "select", options: atStoreOptions },
                ],
            }}
            updateConfig={{
                title: "Update Inventory",
                buttonText: "Submit",
                onSubmit: handleUpdate,
                fields: [
                    { name: "inventoryID", label: "Inventory ID", type: "select", options: inventoryOptions, parse: (v) => Number(v) },
                    { name: "name",        label: "Inventory Name" },
                    { name: "atStore",     label: "Location",     type: "select", options: atStoreOptions },
                ],
            }}
            onDeleteRow={handleDelete}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete inventory ${row.inventoryID} — ${row.name}?`
            }
        />
    );
}

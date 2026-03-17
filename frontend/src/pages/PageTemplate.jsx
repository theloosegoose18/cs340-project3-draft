// ============================================================
// PAGE TEMPLATE  —  copy this file, rename it, fill in TODOs
// ============================================================
// QUICK FIND-AND-REPLACE list before you start:
//   Template      → your component name  (e.g. Inventories)
//   entities      → plural noun          (e.g. inventories)
//   entity        → singular noun        (e.g. inventory)
//   entityID      → your PK field name   (e.g. inventoryID)
//   /api/route    → your API path        (e.g. /api/inventories)
// ============================================================

import { useEffect, useState } from "react";
import EntityPage from "../components/EntityPage";
import { apiFetch } from "../lib/api";

export default function Template() {

    // ── 1. State ────────────────────────────────────────────
    const base = "/api/route";                   // TODO: set your API path

    const [rows, setRows]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");

    // If your page has FK dropdowns (e.g. orderID, productID),
    // add extra state + fetches here — see the OrderProducts guide.

    // ── 2. Load ─────────────────────────────────────────────
    const load = async () => {
        try {
            setError("");
            setLoading(true);
            const data = await apiFetch(base);
            setRows(data ?? []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // ── 3. Dropdown options for the Update selector ─────────
    // TODO: change "entityID" and the label to match your table
    const entityOptions = [
        { value: "", label: "-- Select a record --" },
        ...rows.map((r) => ({
            value: r.entityID,
            label: `${r.entityID} — ${r.name}`,   // TODO: pick a meaningful label
        })),
    ];

    // ── 4. Handlers ─────────────────────────────────────────
    const handleInsert = async (values) => {
        await apiFetch(base, {
            method: "POST",
            body: JSON.stringify(values),
        });
        await load();
    };

    const handleUpdate = async (values) => {
        if (!values.entityID) throw new Error("entityID required");   // TODO: rename

        // Partial update — only send fields the user actually filled in
        const payload = Object.fromEntries(
            Object.entries(values).filter(([key, val]) => key !== "entityID" && val !== "")
            //                                                  ↑ TODO: rename to your PK
        );

        if (Object.keys(payload).length === 0)
            throw new Error("Fill in at least one field to update.");

        await apiFetch(`${base}/${values.entityID}`, {   // TODO: rename
            method: "PUT",
            body: JSON.stringify(payload),
        });
        await load();
    };

    const handleDelete = async (row) => {
        await apiFetch(`${base}/${row.entityID}`, { method: "DELETE" });  // TODO: rename
        setRows((prev) => prev.filter((r) => r.entityID !== row.entityID));
        await load();
    };

    // ── 5. Render ────────────────────────────────────────────
    return (
        <EntityPage
            pageTitle="Template"               // TODO
            browseTitle="Browse Template"      // TODO

            columns={[
                // TODO: one entry per column you want visible in the table
                // { key: "entityID", label: "ID" },
                // { key: "name",     label: "Name" },
                // Boolean example:
                // { key: "atStore", label: "Location",
                //   render: (v) => (v ? "At Store" : "Not at Store") },
            ]}

            rows={rows}
            rowKey="entityID"          // TODO
            loading={loading}
            error={error}

            insertConfig={{
                title: "Insert",       // TODO
                buttonText: "Submit",
                onSubmit: handleInsert,
                fields: [
                    // TODO: one entry per insertable field (exclude the PK — DB auto-generates it)
                    // Text:    { name: "name",  label: "Name" }
                    // Number:  { name: "qty",   label: "Quantity", type: "number", min: "0" }
                    // Date:    { name: "date",  label: "Date",     type: "date" }
                    // Boolean: { name: "atStore", label: "Location", type: "select",
                    //            options: [{ label: "At Store",     value: true },
                    //                      { label: "Not at Store", value: false }] }
                    // FK:      { name: "productID", label: "Product", type: "select",
                    //            options: productOptions, parse: (v) => Number(v) }
                ],
            }}

            updateConfig={{
                title: "Update",       // TODO
                buttonText: "Submit",
                onSubmit: handleUpdate,
                fields: [
                    // First field MUST be the PK selector so the user picks which row to edit
                    { name: "entityID", label: "ID", type: "select",   // TODO: rename
                      options: entityOptions, parse: (v) => Number(v) },

                    // Then repeat whichever fields are updatable (same format as insertConfig)
                    // Leave out fields that should never change after insert
                ],
            }}

            onDeleteRow={handleDelete}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete record ${row.entityID}?`   // TODO: make this descriptive
            }
        />
    );
}

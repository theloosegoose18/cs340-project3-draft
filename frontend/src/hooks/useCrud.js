/*
* ------------ useCrud Hook ------------
* Shared state and CRUD handlers for simple single-endpoint pages.
* Used by: Customers, Products, Inventories
*
* Pages with multiple FK endpoints (Orders, OrderProducts, ProductInventories)
* manage their own load() since they fetch several APIs in parallel.
*
* Sources:
*   - React custom hooks: https://react.dev/learn/reusing-logic-with-custom-hooks
*   - useEffect / useState:  https://react.dev/reference/react/useEffect
* */

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

// base   — the API endpoint (e.g. "/api/customers")
// pkKey  — the primary key field name (e.g. "customerID")
export function useCrud(base, pkKey) {

    const [rows, setRows]       = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState("");

    // Fetch all rows from the endpoint and store them in state
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

    // Citation for the following hook pattern:
    // Date: 03/16/2026
    // Based on the React custom hooks documentation.
    // Encapsulates shared state (rows, loading, error) and CRUD handlers
    // so each simple page does not repeat the same boilerplate.
    // Source URL: https://react.dev/learn/reusing-logic-with-custom-hooks
    // Run once on mount
    useEffect(() => { load(); }, []);

    // POST a new row then refresh the table
    const handleInsert = async (values) => {
        await apiFetch(base, {
            method: "POST",
            body: JSON.stringify(values),
        });
        await load();
    };

    // Citation for the following function:
    // Date: 03/16/2026
    // Adapted from partial update pattern with AI assistance.
    // Original code sent the full form payload to the backend, overwriting
    // DB fields the user left blank. Strips empty strings so only changed
    // fields are included in the PUT body.
    // Source URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
    // AI Tool Used: Claude (Anthropic)
    // Prompt Summary: "My PUT route updates a customer successfully, but any
    // field I leave blank in the form gets saved as an empty string in the
    // database, overwriting the existing data. How do I make it so only the
    // fields the user actually fills in get sent to the backend?"
    const handleUpdate = async (values) => {
        const id = values[pkKey];
        if (!id) throw new Error(`${pkKey} required`);

        const payload = Object.fromEntries(
            Object.entries(values).filter(([key, val]) => key !== pkKey && val !== "")
        );

        if (Object.keys(payload).length === 0)
            throw new Error("Fill in at least one field to update.");

        await apiFetch(`${base}/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
        await load();
    };

    // DELETE a row by primary key then refresh the table
    const handleDelete = async (row) => {
        await apiFetch(`${base}/${row[pkKey]}`, { method: "DELETE" });
        await load();
    };

    return { rows, loading, error, load, handleInsert, handleUpdate, handleDelete };
}

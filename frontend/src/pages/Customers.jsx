/*
* ------------ Customers Page ------------
* Handles browse, insert, partial update, and delete for the Customers table.
* State and CRUD handlers are provided by the useCrud hook.
*
* Sources:
*   - React custom hooks:  https://react.dev/learn/reusing-logic-with-custom-hooks
*   - Date formatting:     https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
* */

import EntityPage from "../components/EntityPage";
import { useCrud } from "../hooks/useCrud";

export default function Customers() {

    const { rows, loading, error, handleInsert, handleUpdate, handleDelete } =
        useCrud("/api/customers", "customerID");

    // Build dropdown options for the Update form selector
    const customerOptions = [
        { value: "", label: "-- Select a customer --" },
        ...rows.map((c) => ({
            value: c.customerID,
            label: `${c.customerID} — ${c.fName} ${c.lName} (${c.email})`,
        })),
    ];

    return (
        <EntityPage
            pageTitle="Customers"
            browseTitle="Browse Customers"
            columns={[
                { key: "customerID",   label: "Customer ID" },
                { key: "fName",        label: "First Name" },
                { key: "lName",        label: "Last Name" },
                { key: "email",        label: "Email" },
                { key: "phone",        label: "Phone" },
                { key: "points",       label: "Points" },
                {
                    key: "lastPurchase", label: "Last Purchase",
                    // Citation for the following render function:
                    // Date: 03/16/2026
                    // Based on MDN Date formatting documentation.
                    // Converts the raw MySQL DATETIME string to MM/DD/YYYY HH:MM AM/PM
                    // for a consistent and readable display format.
                    // Source URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
                    render: (v) => {
                        if (!v) return "—";
                        const d = new Date(v);
                        return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                             + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
                    }
                },
            ]}
            rows={rows}
            rowKey="customerID"
            loading={loading}
            error={error}
            insertConfig={{
                title: "Insert Customer",
                buttonText: "Submit",
                onSubmit: handleInsert,
                fields: [
                    { name: "fName",        label: "First Name" },
                    { name: "lName",        label: "Last Name" },
                    { name: "email",        label: "Email" },
                    { name: "phone",        label: "Phone" },
                    { name: "points",       label: "Points",        type: "number" },
                    { name: "lastPurchase", label: "Last Purchase", type: "date" },
                ],
            }}
            updateConfig={{
                title: "Update Customer",
                buttonText: "Submit",
                onSubmit: handleUpdate,
                fields: [
                    { name: "customerID",   label: "Customer ID",   type: "select", options: customerOptions, parse: (v) => Number(v) },
                    { name: "fName",        label: "First Name" },
                    { name: "lName",        label: "Last Name" },
                    { name: "email",        label: "Email" },
                    { name: "phone",        label: "Phone" },
                    { name: "points",       label: "Points",        type: "number" },
                    { name: "lastPurchase", label: "Last Purchase", type: "date" },
                ],
            }}
            onDeleteRow={handleDelete}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete customer ${row.customerID}?`
            }
        />
    );
}

import { useEffect, useState } from "react";
import EntityPage from "../components/EntityPage";
import { apiFetch } from "../lib/api";

export default function Customers() {

    const base = "/api/customers";

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    const customerOptions = [
        { value: "", label: "-- Select a customer --" },
        ...rows.map((c) => ({
            value: c.customerID,
            label: `${c.customerID} — ${c.fName} ${c.lName} (${c.email})`,
        })),
    ];

    useEffect(() => {
        load();
    }, []);

    const handleInsert = async (values) => {
        await apiFetch(base, {
            method: "POST",
            body: JSON.stringify(values),
        });
        await load();
    };

    const handleUpdate = async (values) => {
        if (!values.customerID) throw new Error("customerID required");
        await apiFetch(`${base}/${values.customerID}`, {
            method: "PUT",
            body: JSON.stringify(values),
        });
        await load();
    };

    const handleDeleteCustomer = async (row) => {
        await apiFetch(`${base}/${row.customerID}`, { method: "DELETE" });

        setRows((prev) => prev.filter((c) => c.customerID !== row.customerID));

        await load();
    };

    return (
        <EntityPage
            pageTitle="Customers"
            browseTitle="Browse Customers"
            columns={[
                { key: "customerID", label: "CustomerID" },
                { key: "fName", label: "First Name" },
                { key: "lName", label: "Last Name" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
                { key: "points", label: "Points" },
                { key: "lastPurchase", label: "Last Purchase" },
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
                    { name: "fName", label: "First Name" },
                    { name: "lName", label: "Last Name" },
                    { name: "email", label: "Email" },
                    { name: "phone", label: "Phone" },
                    { name: "points", label: "Points", type: "number" },
                    { name: "lastPurchase", label: "Last Purchase", type: "date" },
                ],
            }}
            updateConfig={{
                title: "Update Customer",
                buttonText: "Submit",
                onSubmit: handleUpdate,
                fields: [
                    { name: "customerID", label: "Customer ID", type: "select", options: customerOptions, parse: (v) => Number(v) },
                    { name: "fName", label: "First Name" },
                    { name: "lName", label: "Last Name" },
                    { name: "email", label: "Email" },
                    { name: "phone", label: "Phone" },
                    { name: "points", label: "Points", type: "number" },
                    { name: "lastPurchase", label: "Last Purchase", type: "date" },
                ],
            }}
            onDeleteRow={handleDeleteCustomer}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete customer ${row.customerID}?`
            }
        />
    );
}
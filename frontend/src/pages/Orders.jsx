import { useEffect, useState } from "react";
import EntityPage from "../components/EntityPage";
import { apiFetch } from "../lib/api";

export default function Orders() {

    const base = "/api/orders";

    const [rows, setRows]           = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState("");
    const [customers, setCustomers] = useState([]);

    // Citation for the following function:
    // Date: 03/16/2026
    // Based on MDN Promise.all documentation.
    // Fetches orders and customers in a single round trip so the FK customer
    // dropdown is populated without sequential loading delays.
    // Source URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    const load = async () => {
        try {
            setError(""); setLoading(true);
            const [data, custs] = await Promise.all([
                apiFetch("/api/orders"),
                apiFetch("/api/customers"),
            ]);
            setRows(data ?? []);
            setCustomers(custs ?? []);
        } catch (e) { setError(e.message); }
        finally     { setLoading(false); }
    };

    // Load on mount
    useEffect(() => { load(); }, []);

    // customerID is nullable — "No Customer" lets the user create an anonymous order
    const customerOptions = [
        { value: "",     label: "-- Select a customer --" },
        { value: "null", label: "No Customer (NULL)" },
        ...customers.map((c) => ({
            value: c.customerID,
            label: `${c.customerID} — ${c.fName} ${c.lName}`,
        })),
    ];

    // Build dropdown options for the Update form selector
    const orderOptions = [
        { value: "", label: "-- Select an order --" },
        ...rows.map((o) => ({
            value: o.orderID,
            label: `Order ${o.orderID} (Customer ${o.customerID ?? "none"})`,
        })),
    ];

    // POST a new order row then refresh the table
    const handleInsert = async (values) => {
        await apiFetch(base, {
            method: "POST",
            body: JSON.stringify(values),
        });
        await load();
    };

    // PUT only the fields the user actually filled in.
    // Empty strings are stripped so untouched fields keep their current DB value.
    const handleUpdate = async (values) => {
        if (!values.orderID) throw new Error("orderID required");

        const payload = Object.fromEntries(
            Object.entries(values).filter(([key, val]) => key !== "orderID" && val !== "")
        );

        if (Object.keys(payload).length === 0)
            throw new Error("Fill in at least one field to update.");

        await apiFetch(`${base}/${values.orderID}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
        await load();
    };

    // DELETE an order by ID then refresh the table
    const handleDelete = async (row) => {
        await apiFetch(`${base}/${row.orderID}`, { method: "DELETE" });
        setRows((prev) => prev.filter((r) => r.orderID !== row.orderID));
        await load();
    };

    return (
        <EntityPage
            pageTitle="Orders"
            browseTitle="Browse Orders"
            columns={[
                { key: "orderID",    label: "Order ID" },
                {
                    key: "customerID", label: "Customer ID",
                    // Render NULL customerID as a dash instead of empty string
                    render: (v) => (v != null ? v : "—")
                },
                {
                    key: "orderDate", label: "Order Date",
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
                { key: "pointsUsed", label: "Points Used" },
            ]}
            rows={rows}
            rowKey="orderID"
            loading={loading}
            error={error}
            insertConfig={{
                title: "Insert Order",
                buttonText: "Submit",
                onSubmit: handleInsert,
                fields: [
                    { name: "customerID", label: "Customer",    type: "select", options: customerOptions, parse: (v) => Number(v) },
                    { name: "pointsUsed", label: "Points Used", type: "number", min: "0" },
                    // orderDate is omitted — the DB defaults it to NOW() on insert
                ],
            }}
            updateConfig={{
                title: "Update Order",
                buttonText: "Submit",
                onSubmit: handleUpdate,
                fields: [
                    { name: "orderID",    label: "Order",      type: "select", options: orderOptions,    parse: (v) => Number(v) },
                    { name: "customerID", label: "Customer",   type: "select", options: customerOptions, parse: (v) => Number(v) },
                    { name: "orderDate",  label: "Order Date", type: "date" },
                    { name: "pointsUsed", label: "Points Used", type: "number", min: "0" },
                ],
            }}
            onDeleteRow={handleDelete}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete order ${row.orderID} (Customer ${row.customerID ?? "none"})?`
            }
        />
    );
}

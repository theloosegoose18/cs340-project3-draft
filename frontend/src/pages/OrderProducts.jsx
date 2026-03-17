import { useEffect, useState } from "react";
import EntityPage from "../components/EntityPage";
import { apiFetch } from "../lib/api";

export default function OrderProducts() {

    const base = "/api/order-products";

    const [rows, setRows]               = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState("");
    const [orders, setOrders]           = useState([]);
    const [products, setProducts]       = useState([]);
    const [inventories, setInventories] = useState([]);

    // Citation for the following function:
    // Date: 03/16/2026
    // Adapted from multi-endpoint parallel fetch pattern with AI assistance.
    // All API paths returned 404 due to missing leading slash on URL strings.
    // Corrected path format and parallel structure using Promise.all so all
    // FK dropdown data loads in a single round trip.
    // Source URL: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
    // AI Tool Used: Claude (Anthropic)
    // Prompt Summary: "My OrderProducts page fetches from four endpoints using
    // Promise.all but all requests are returning 404. My other pages that only
    // fetch one endpoint work fine. What is different about how multi-fetch
    // pages need to be structured?"
    const load = async () => {
        try {
            setError(""); setLoading(true);
            const [data, ords, prods, invs] = await Promise.all([
                apiFetch("/api/order-products"),
                apiFetch("/api/orders"),
                apiFetch("/api/products"),
                apiFetch("/api/inventories"),
            ]);
            setRows(data ?? []);
            setOrders(ords ?? []);
            setProducts(prods ?? []);
            setInventories(invs ?? []);
        } catch (e) { setError(e.message); }
        finally     { setLoading(false); }
    };

    // Load on mount
    useEffect(() => { load(); }, []);

    // FK dropdown: orders
    const orderOptions = [
        { value: "", label: "-- Select an order --" },
        ...orders.map((o) => ({
            value: o.orderID,
            label: `Order ${o.orderID} (Customer ${o.customerID ?? "none"})`,
        })),
    ];

    // FK dropdown: products
    const productOptions = [
        { value: "", label: "-- Select a product --" },
        ...products.map((p) => ({
            value: p.productID,
            label: `${p.productID} — ${p.name}`,
        })),
    ];

    // FK dropdown: inventories
    const inventoryOptions = [
        { value: "", label: "-- Select an inventory --" },
        ...inventories.map((i) => ({
            value: i.inventoryID,
            label: `${i.inventoryID} — ${i.name}`,
        })),
    ];

    // Build dropdown options for the Update form selector
    const itemOptions = [
        { value: "", label: "-- Select an item --" },
        ...rows.map((r) => ({
            value: r.orderItemID,
            label: `#${r.orderItemID} — Order ${r.orderID} / Product ${r.productID}`,
        })),
    ];

    // POST a new order-product line item then refresh the table.
    // priceAtSale is set automatically by the DB BEFORE INSERT trigger.
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
        if (!values.orderItemID) throw new Error("orderItemID required");

        const payload = Object.fromEntries(
            Object.entries(values).filter(([key, val]) => key !== "orderItemID" && val !== "")
        );

        if (Object.keys(payload).length === 0)
            throw new Error("Fill in at least one field to update.");

        await apiFetch(`${base}/${values.orderItemID}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
        await load();
    };

    // DELETE an order-product line item then refresh the table
    const handleDelete = async (row) => {
        await apiFetch(`${base}/${row.orderItemID}`, { method: "DELETE" });
        setRows((prev) => prev.filter((r) => r.orderItemID !== row.orderItemID));
        await load();
    };

    return (
        <EntityPage
            pageTitle="Order Products"
            browseTitle="Browse Order Products"
            columns={[
                { key: "orderItemID",  label: "Item ID" },
                { key: "orderID",      label: "Order ID" },
                { key: "productID",    label: "Product ID" },
                { key: "quantity",     label: "Quantity" },
                { key: "inventoryID",  label: "Inventory ID" },
                { key: "priceAtSale",  label: "Price at Sale" },
            ]}
            rows={rows}
            rowKey="orderItemID"
            loading={loading}
            error={error}
            insertConfig={{
                title: "Insert Order Product",
                buttonText: "Submit",
                onSubmit: handleInsert,
                fields: [
                    { name: "orderID",     label: "Order",     type: "select", options: orderOptions,     parse: (v) => Number(v) },
                    { name: "productID",   label: "Product",   type: "select", options: productOptions,   parse: (v) => Number(v) },
                    { name: "quantity",    label: "Quantity",  type: "number", min: "1" },
                    { name: "inventoryID", label: "Inventory", type: "select", options: inventoryOptions, parse: (v) => Number(v) },
                    // priceAtSale is intentionally omitted — the BEFORE INSERT trigger captures currentPrice automatically
                ],
            }}
            updateConfig={{
                title: "Update Order Product",
                buttonText: "Submit",
                onSubmit: handleUpdate,
                fields: [
                    { name: "orderItemID",  label: "Item",      type: "select", options: itemOptions,       parse: (v) => Number(v) },
                    { name: "orderID",      label: "Order",     type: "select", options: orderOptions,      parse: (v) => Number(v) },
                    { name: "productID",    label: "Product",   type: "select", options: productOptions,    parse: (v) => Number(v) },
                    { name: "quantity",     label: "Quantity",  type: "number", min: "1" },
                    { name: "inventoryID",  label: "Inventory", type: "select", options: inventoryOptions,  parse: (v) => Number(v) },
                ],
            }}
            onDeleteRow={handleDelete}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete item #${row.orderItemID} (Order ${row.orderID} / Product ${row.productID})?`
            }
        />
    );
}

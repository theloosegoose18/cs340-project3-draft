import { useEffect, useState } from "react";
import EntityPage from "../components/EntityPage";
import { apiFetch } from "../lib/api";

export default function ProductInventories() {

    const base = "/api/product-inventories";

    const [rows, setRows]               = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState("");
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
    // Prompt Summary: "My ProductInventories page fetches from three endpoints
    // using Promise.all but all three requests are returning 404. My other pages
    // that only fetch one endpoint work fine. What is different about how
    // multi-fetch pages need to be structured?"
    const load = async () => {
        try {
            setError(""); setLoading(true);
            const [data, prods, invs] = await Promise.all([
                apiFetch("/api/product-inventories"),
                apiFetch("/api/products"),
                apiFetch("/api/inventories"),
            ]);
            setRows(data ?? []);
            setProducts(prods ?? []);
            setInventories(invs ?? []);
        } catch (e) { setError(e.message); }
        finally     { setLoading(false); }
    };

    // Load on mount
    useEffect(() => { load(); }, []);

    // FK dropdown: products
    const productOptions = [
        { value: "", label: "-- Select Product --" },
        ...products.map((p) => ({ value: p.productID, label: `${p.productID} — ${p.name}` })),
    ];

    // FK dropdown: inventories
    const inventoryOptions = [
        { value: "", label: "-- Select Inventory --" },
        ...inventories.map((i) => ({ value: i.inventoryID, label: `${i.inventoryID} — ${i.name}` })),
    ];

    // Build dropdown options for the Update form selector
    const piOptions = [
        { value: "", label: "-- Select a Record --" },
        ...rows.map((r) => ({
            value: r.productInventoryID,
            label: `#${r.productInventoryID} — Product ${r.productID} / Inventory ${r.inventoryID}`,
        })),
    ];

    // POST a new product-inventory stock record then refresh the table
    const handleInsert = async (values) => {
        await apiFetch(base, {
            method: "POST",
            body: JSON.stringify(values),
        });
        await load();
    };

    // PUT only the fields the user actually filled in.
    // Only quantity is updatable — the productID/inventoryID pair forms the unique key.
    const handleUpdate = async (values) => {
        if (!values.productInventoryID) throw new Error("productInventoryID required");

        const payload = Object.fromEntries(
            Object.entries(values).filter(([key, val]) => key !== "productInventoryID" && val !== "")
        );

        if (Object.keys(payload).length === 0)
            throw new Error("Fill in at least one field to update.");

        await apiFetch(`${base}/${values.productInventoryID}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
        await load();
    };

    // DELETE a product-inventory stock record then refresh the table
    const handleDelete = async (row) => {
        await apiFetch(`${base}/${row.productInventoryID}`, { method: "DELETE" });
        setRows((prev) => prev.filter((r) => r.productInventoryID !== row.productInventoryID));
        await load();
    };

    return (
        <EntityPage
            pageTitle="Product Inventories"
            browseTitle="Browse Product Inventory Records"
            columns={[
                { key: "productInventoryID", label: "Record ID" },
                { key: "productID",          label: "Product ID" },
                { key: "inventoryID",        label: "Inventory ID" },
                { key: "quantity",           label: "Quantity" },
            ]}
            rows={rows}
            rowKey="productInventoryID"
            loading={loading}
            error={error}
            insertConfig={{
                title: "Insert Product-Inventory Record",
                buttonText: "Submit",
                onSubmit: handleInsert,
                fields: [
                    { name: "productID",   label: "Product",   type: "select", options: productOptions,   parse: (v) => Number(v) },
                    { name: "inventoryID", label: "Inventory", type: "select", options: inventoryOptions, parse: (v) => Number(v) },
                    { name: "quantity",    label: "Quantity",  type: "number", min: "0" },
                ],
            }}
            updateConfig={{
                title: "Update Product-Inventory Record",
                buttonText: "Submit",
                onSubmit: handleUpdate,
                fields: [
                    // productID and inventoryID are intentionally excluded — they form the unique pair and should not change
                    { name: "productInventoryID", label: "Record",   type: "select", options: piOptions, parse: (v) => Number(v) },
                    { name: "quantity",           label: "Quantity", type: "number", min: "0" },
                ],
            }}
            onDeleteRow={handleDelete}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete record #${row.productInventoryID} (Product ${row.productID} / Inventory ${row.inventoryID})?`
            }
        />
    );
}

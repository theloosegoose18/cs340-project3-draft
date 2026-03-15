import { useEffect, useState} from "react";
import EntityPage from "../components/EntityPage.jsx";
import { apiFetch} from "../lib/api.js";

export default function Products() {

    const base = "/api/products";

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            setError("");
            setLoading(true);
            const data = await apiFetch(base);
            setRows(data ?? []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const productOptions = [
        {value: "", label: "-- Select a product --"},
        ...rows.map((product) => ({
            value: product.id,
            label: `Product ${product.productID} - ${product.name}`,
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
        if (!values.productID) throw new Error("productID required");
        await apiFetch(`${base}/${values.productID}`, {
            method: "PUT",
            body: JSON.stringify(values),
        });
        await load();
    };

    const handleDeleteProduct = async (row) => {
        await apiFetch(`${base}/${row.productID}`, { method: "DELETE" });
        setRows((prev) => prev.filter((product) => product.productID !== row.productID));
        await load();
    };

    return (
        <EntityPage
            pageTitle="Products"
            browseTitle="Browse Products"
            columns={[
                { key: "productID", label: "Product ID" },
                { key: "name", label: "Product Name" },
                { key: "currentPrice", label: "Current Price" },

            ]}
           rows={rows}
           rowKey="productID"
           loading={loading}
           error={error}
           insertConfig={{
               title: "Insert Product",
               buttonText: "Submit",
               onSubmit: handleInsert,
               fields: [
                   { name: "name", label: "Product Name" },
                   { name: "currentPrice", label: "Current Price" },
               ],
           }}
            updateConfig={{
                title: "Update Product",
                buttonText: "Submit",
                onSubmit: handleUpdate,
                fields: [
                    { name: "productID", label: "Product ID" },
                    { name: "name", label: "Product Name" },
                    { name: "currentPrice", label: "Current Price" },
                ],
            }}
            onDeleteRow={handleDeleteProduct}
            deleteButtonText="Delete"
            confirmButtonMessage={(row) => `Delete Product ${row.productID}?`
            }
        />
    );
}
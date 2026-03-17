/*
* ------------ Products Page ------------
* Handles browse, insert, partial update, and delete for the Products table.
* State and CRUD handlers are provided by the useCrud hook.
* Delete is blocked by the DB (ON DELETE RESTRICT) if the product has order history.
*
* Sources:
*   - React custom hooks:  https://react.dev/learn/reusing-logic-with-custom-hooks
*   - FK RESTRICT behavior: https://dev.mysql.com/doc/refman/8.0/en/create-table-foreign-keys.html
* */

import EntityPage from "../components/EntityPage";
import { useCrud } from "../hooks/useCrud";

export default function Products() {

    const { rows, loading, error, handleInsert, handleUpdate, handleDelete } =
        useCrud("/api/products", "productID");

    // Build dropdown options for the Update form selector
    const productOptions = [
        { value: "", label: "-- Select a product --" },
        ...rows.map((p) => ({
            value: p.productID,
            label: `${p.productID} — ${p.name} ($${p.currentPrice})`,
        })),
    ];

    return (
        <EntityPage
            pageTitle="Products"
            browseTitle="Browse Products"
            columns={[
                { key: "productID",    label: "Product ID" },
                { key: "name",         label: "Product Name" },
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
                    { name: "name",         label: "Product Name" },
                    { name: "currentPrice", label: "Current Price", type: "number", step: "0.01", min: "0.01" },
                ],
            }}
            updateConfig={{
                title: "Update Product",
                buttonText: "Submit",
                onSubmit: handleUpdate,
                fields: [
                    { name: "productID",    label: "Product",       type: "select", options: productOptions, parse: (v) => Number(v) },
                    { name: "name",         label: "Product Name" },
                    { name: "currentPrice", label: "Current Price", type: "number", step: "0.01", min: "0.01" },
                ],
            }}
            onDeleteRow={handleDelete}
            deleteButtonText="Delete"
            // Citation for the following prop:
            // Date: 03/16/2026
            // Adapted from delete confirmation debugging with AI assistance.
            // The dialog was not appearing on Products despite identical code
            // on Customers. Root cause was an incorrect prop name being passed
            // to the DataTable component, which skipped the window.confirm() call.
            // AI Tool Used: Claude (Anthropic)
            // Prompt Summary: "I have a confirm delete message working on my
            // Customers page but the same pattern on my Products page just deletes
            // immediately without showing the dialog. Both pages look identical to
            // me — what would cause the confirmation to be skipped on one but not
            // the other?"
            confirmDeleteMessage={(row) =>
                `Delete "${row.name}"? This cannot be undone. Products with existing order history cannot be deleted.`
            }
        />
    );
}

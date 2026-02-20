import EntityPage from "../components/EntityPage";

export default function ProductInventories() {
    const handleDeleteProductInventory = (row) => {
        // DML proc: sp_delete_product_inventory(_productID, _inventoryID)
        console.log(
            "Delete product inventory entry:",
            { productID: row.productID, inventoryID: row.inventoryID },
            row
        );
        // later: await fetch(`/api/product-inventories`, { method: "DELETE", body: JSON.stringify({ productID: row.productID, inventoryID: row.inventoryID }) })
    };

    return (
        <EntityPage
            pageTitle="ProductInventories"
            browseTitle="Browse Product Inventories"
            columns={[
                { key: "productInventoryID", label: "productInventoryID" },
                { key: "productID", label: "productID" },
                { key: "inventoryID", label: "inventoryID" },
                { key: "quantity", label: "quantity" },
            ]}
            sampleRows={[
                { productInventoryID: 1, productID: 1, inventoryID: 1, quantity: 10 },
                { productInventoryID: 2, productID: 1, inventoryID: 2, quantity: 3 },
                { productInventoryID: 3, productID: 2, inventoryID: 1, quantity: 7 },
            ]}
            insertConfig={{
                title: "Insert Product Inventory",
                buttonText: "Submit",
                fields: [
                    {
                        // DML proc: sp_insert_product_inventory(_productID, _inventoryID, _quantity)
                        name: "productID",
                        label: "productID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter productID",
                    },
                    {
                        name: "inventoryID",
                        label: "inventoryID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter inventoryID",
                    },
                    {
                        name: "quantity",
                        label: "quantity",
                        type: "number",
                        min: 0,
                        placeholder: "Enter quantity",
                    },
                ],
            }}
            updateConfig={{
                title: "Update Product Inventory",
                buttonText: "Submit",
                fields: [
                    {
                        // Selector for updates that target (productID, inventoryID)
                        name: "productID",
                        label: "productID (to update)",
                        type: "number",
                        min: 1,
                        placeholder: "Enter productID",
                    },
                    {
                        name: "inventoryID",
                        label: "inventoryID (current)",
                        type: "number",
                        min: 1,
                        placeholder: "Enter current inventoryID",
                    },

                    // Choose which update path your backend will call:
                    // - sp_update_product_inventory_quantity(_productID, _inventoryID, _quantity)
                    // - OR sp_add_product_inventory_quantity(_productID, _inventoryID, _quantity)  (delta)
                    // - OR sp_update_product_inventory_location(_productID, _inventoryID, _inventoryIDNew)

                    {
                        name: "quantity",
                        label: "quantity (set to)",
                        type: "number",
                        min: 0,
                        placeholder: "Set quantity to this value",
                    },
                    {
                        name: "quantityDelta",
                        label: "quantityDelta (optional add/subtract)",
                        type: "number",
                        placeholder: "Use negative to subtract",
                    },
                    {
                        name: "inventoryIDNew",
                        label: "inventoryIDNew (optional move)",
                        type: "number",
                        min: 1,
                        placeholder: "Move product to a new inventoryID",
                    },
                ],
            }}
            rowKey="productInventoryID"
            onDeleteRow={handleDeleteProductInventory}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete product-inventory entry (product ${row.productID}, inventory ${row.inventoryID})?`
            }
        />
    );
}

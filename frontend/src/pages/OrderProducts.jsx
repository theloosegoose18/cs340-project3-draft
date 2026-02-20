import EntityPage from "../components/EntityPage";

export default function OrderProducts() {
    const handleDeleteOrderProduct = (row) => {
        console.log("Delete order item:", row.orderItemID, row);
        // later: await fetch(`/api/order-products/${row.orderItemID}`, { method: "DELETE" })
        // DML proc: sp_delete_order_item(_orderItemID)
    };

    return (
        <EntityPage
            pageTitle="OrderProducts"
            browseTitle="Browse Order Products"
            columns={[
                { key: "orderItemID", label: "orderItemID" },
                { key: "orderID", label: "orderID" },
                { key: "productID", label: "productID" },
                { key: "quantity", label: "quantity" },
                { key: "inventoryID", label: "inventoryID" },
            ]}
            sampleRows={[
                { orderItemID: 1, orderID: 1, productID: 1, quantity: 2, inventoryID: 1 },
                { orderItemID: 2, orderID: 1, productID: 3, quantity: 1, inventoryID: 2 },
                { orderItemID: 3, orderID: 2, productID: 2, quantity: 4, inventoryID: 1 },
            ]}
            insertConfig={{
                title: "Insert Order Product",
                buttonText: "Submit",
                fields: [
                    {
                        // DML proc: sp_insert_order_product(_orderID, _productID, _quantity, _inventoryID)
                        name: "orderID",
                        label: "orderID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter orderID",
                    },
                    {
                        name: "productID",
                        label: "productID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter productID",
                    },
                    {
                        name: "quantity",
                        label: "quantity",
                        type: "number",
                        min: 1,
                        placeholder: "Enter quantity",
                    },
                    {
                        name: "inventoryID",
                        label: "inventoryID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter inventoryID",
                    },
                ],
            }}
            updateConfig={{
                title: "Update Order Product",
                buttonText: "Submit",
                fields: [
                    {
                        // Selector (required for all update procs on OrderProducts)
                        // Recommended proc to use: sp_update_order_item(_orderItemID, _orderID, _productID, _quantity, _inventoryID)
                        name: "orderItemID",
                        label: "orderItemID (to update)",
                        type: "number",
                        min: 1,
                        placeholder: "Enter orderItemID",
                    },
                    {
                        name: "orderID",
                        label: "orderID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter new orderID",
                    },
                    {
                        name: "productID",
                        label: "productID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter new productID",
                    },
                    {
                        name: "quantity",
                        label: "quantity",
                        type: "number",
                        min: 1,
                        placeholder: "Enter new quantity",
                    },
                    {
                        name: "inventoryID",
                        label: "inventoryID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter new inventoryID",
                    },
                ],
            }}
            rowKey="orderItemID"
            onDeleteRow={handleDeleteOrderProduct}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete order item ${row.orderItemID} (order ${row.orderID})?`
            }
        />
    );
}

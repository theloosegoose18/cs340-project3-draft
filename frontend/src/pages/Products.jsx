import EntityPage from "../components/EntityPage";

export default function Products() {

    const handleDeleteProduct = (row) => {
        console.log("Delete product:", row.productID, row);
        // later: await fetch(`/api/products/${row.productID}`, { method: "DELETE" })
    };

    return (
        <EntityPage
            pageTitle="Products"
            browseTitle="Browse Products"
            columns={[
                { key: "productID", label: "productID" },
                { key: "name", label: "name" },
                { key: "currentPrice", label: "currentPrice" },
            ]}
            sampleRows={[
                {
                    productID: 1,
                    name: "Umbreon VMAX",
                    currentPrice: "129.99" },
                {
                    productID: 2,
                    name: "Charizard GX",
                    currentPrice: "89.99" },
            ]}
            insertConfig={{
                title: "Insert Product",
                buttonText: "Insert Product",
                fields: [
                    {
                        name: "name",
                        label: "Name",
                        placeholder: "Enter product name"
                    },
                    {
                        name: "currentPrice",
                        label: "Current Price",
                        placeholder: "Initial price",
                        type: "number",
                        step: "0.01",
                        min: "0"
                    },
                ],
            }}
            updateConfig={{
                title: "Update Product",
                buttonText: "Update Product",
                fields: [
                    {
                        name: "productID",
                        label: "Product ID",
                        placeholder: "Select productID to update",
                        type: "number",
                        min: "1"
                    },
                    {
                        name: "name",
                        label: "New Name",
                        placeholder: "Change product name"
                    },
                    {
                        name: "currentPrice",
                        label: "New Price",
                        placeholder: "Enter new price",
                        type: "number",
                        step: "0.01",
                        min: "0"
                    },
                ],
            }}
            rowKey="productID"
            onDeleteRow={handleDeleteProduct}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete product ${row.productID} (${row.name})?`
            }
        />
    );
}

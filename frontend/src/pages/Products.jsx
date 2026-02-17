import EntityPage from "../components/EntityPage";

export default function Products() {
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
                { productID: 1, name: "Umbreon VMAX", currentPrice: "129.99" },
                { productID: 2, name: "Charizard GX", currentPrice: "89.99" },
            ]}
            insertConfig={{
                title: "Insert Product",
                buttonText: "Insert Product",
                fields: [
                    { name: "name", label: "Name", placeholder: "Enter product name" },
                    { name: "currentPrice", label: "Current Price", type: "number", step: "0.01", min: "0" },
                ],
            }}
            updateConfig={{
                title: "Update Product",
                buttonText: "Update Product",
                fields: [
                    { name: "productID", label: "Product ID", type: "number", min: "1" },
                    { name: "name", label: "New Name", placeholder: "Change product name" },
                    { name: "currentPrice", label: "New Price", placeholder: "Enter new price", type: "number", step: "0.01", min: "0" },
                ],
            }}
            deleteConfig={{
                title: "Delete Product",
                buttonText: "Delete Product",
                fields: [{ name: "productID", label: "Product ID", type: "number", min: "1" }],
            }}
        />
    );
}

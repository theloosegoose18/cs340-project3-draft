import EntityPage from "../components/EntityPage";

export default function Inventories() {

    const handleDeleteInventories = (row) => {
        console.log("Delete product:", row.inventoryID, row);
        // later: await fetch(`/api/products/${row.inventoryID}`, { method: "DELETE" })
    };

    return (
        <EntityPage
            pageTitle="Inventories"
            browseTitle="Browse Inventory"
            columns={[
                { key: "inventoryID", label: "inventoryID" },
                { key: "name", label: "name" },
                { key: "atStore", label: "Status", render: (value) => (value ? "At Store" : "Out of Stock") },
            ]}
            sampleRows={[
                { inventoryID: 1, name: "Umbreon VMAX", atStore: true },
                { inventoryID: 2, name: "Charizard GX", atStore: true },
                { inventoryID: 3, name: "Houndoom 229", atStore: false },
            ]}
            insertConfig={{
                title: "Insert Inventories",
                buttonText: "Submit",
                fields: [
                    {
                        name: "name",
                        label: "Name",
                        placeholder: "Enter inventory/item name" },
                    {
                        name: "atStore",
                        label: "Inventory Status",
                        type: "select",
                        options: [
                            {label: "At Store", value: true},
                            {label: "Out of Stock", value: false},
                        ] },
                ],
            }}
            updateConfig={{
                title: "Update Inventory",
                buttonText: "Submit",
                fields: [
                    {
                        name: "inventoryID",
                        label: "Inventory ID",
                        placeholder: "Select inventoryID to update",
                        type: "number",
                        min: 1,
                    },
                    {
                        name: "atStore",
                        label: "Inventory Status",
                        type: "select",
                        options: [
                            {label: "At Store", value: true},
                            {label: "Out of Stock", value: false},
                        ] },
                ],
            }}
            rowKey="inventoryID"
            onDeleteRow={handleDeleteInventories}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete product ${row.inventoryID} (${row.name})?`
            }
        />
    );
}

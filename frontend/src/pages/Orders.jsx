import EntityPage from "../components/EntityPage";

export default function Orders() {

    const handleDeleteOrders = (row) => {
        console.log("Delete order:", row.orderID, row);
        // later: await fetch(`/api/products/${row.productID}`, { method: "DELETE" })
    };

    return (
        <EntityPage
            pageTitle="Orders"
            browseTitle="Browse Orders"
            columns={[
                {
                    key: "orderID",
                    label: "orderID",
                    type: "number",
                    min: 1 },
                {
                    key: "customerID",
                    label: "customerID",
                    type: "number",
                    min: 1 },
                {
                    key: "orderDate",
                    label: "orderDate",
                    type: "date" },
                {
                    key: "orderTotal",
                    label: "orderTotal",
                    type: "number",
                    step: 0.01,
                    min: .01 },
                {
                    key: "pointsUsed",
                    label: "pointsUsed",
                    type: "number",
                    min: 1 },
            ]}
            sampleRows={[
                {
                    orderID: 1,
                    customerID: 1,
                    orderDate: "02-01-2026",
                    orderTotal: 129.99,
                    pointsUsed: 1971,
                },
                {
                    orderID: 2,
                    customerID: 2,
                    orderDate: "06-01-2025",
                    orderTotal: 234.95,
                    pointsUsed: 485,
                },
            ]}
            insertConfig={{
                title: "Insert Orders",
                buttonText: "Submit",
                fields: [

                    {
                        name: "customerID",
                        label: "customerID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter customerID number"
                    },
                    {
                        name: "pointsUsed",
                        label: "pointsUsed",
                        type: "number",
                        min: 1,
                        placeholder: "Enter how many points were used for order"
                    },
                ],
            }}
            updateConfig={{
                title: "Update Orders",
                buttonText: "Submit",
                fields: [
                    {
                        name: "customerID",
                        label: "customerID",
                        type: "number",
                        min: 1,
                        placeholder: "Enter customerID (can change if needed)",
                    },
                    {
                        name: "orderDate",
                        label: "orderDate",
                        type: "date",
                    },
                    {
                        name: "pointsUsed",
                        label: "pointsUsed",
                        type: "number",
                        min: 0,
                        placeholder: "Enter updated points used",
                    },,
                ],
            }}
            rowKey="orderID"
            onDeleteRow={handleDeleteOrders}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete product ${row.orderID} (${row.orderID})?`
            }
        />
    );
}

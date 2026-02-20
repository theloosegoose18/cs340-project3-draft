import EntityPage from "../components/EntityPage";

export default function Customers() {
    // ✅ 1) Put handler here (above return)
    const handleDeleteCustomer = (row) => {
        console.log("Delete customer:", row.customerID, row);
        // later: await fetch(`/api/customers/${row.customerID}`, { method: "DELETE" })
    };

    return (
        <EntityPage
            pageTitle="Customers"
            browseTitle="Browse Customers"
            columns={[
                { key: "firstName", label: "firstname" },
                { key: "lastName", label: "lastname" },
                { key: "email", label: "email" },
                { key: "phone", label: "phone" },
                { key: "points", label: "points" },
                { key: "lastPurchase", label: "lastPurchase" },

            ]}
            sampleRows={[
                {
                    customerID: "1",
                    firstName: "Alexander",
                    lastName: "Olsen",
                    email: "swampthing@email.me",
                    phone: "000-000-0000",
                    points: 71971,
                    lastPurchase: "02-01-2026" },
                {
                    customerID: "2",
                    firstName: "John",
                    lastName: "Constantine",
                    email: "hellblazer@email.me",
                    phone: "666-666-6666",
                    points: 1985,
                    lastPurchase: "06-01-2025" },
                {
                    customerID: "3",
                    firstName: "Ash",
                    lastName: "Ketchum",
                    email: "catchthemall@email.me",
                    phone: "111-111-1111",
                    points: 1025,
                    lastPurchase: "02-01-2026" },
                {
                    customerID: "4",
                    firstName: "Ellen",
                    lastName: "Ripley",
                    email: "alien@email.me",
                    phone: "222-222-2222",
                    points: 180286,
                    lastPurchase: "01-01-2026" },

            ]}
            insertConfig={{
                title: "Insert Customer",
                buttonText: "Submit",
                fields: [
                    {
                        name: "firstName",
                        label: "firstName",
                        placeholder: "Enter first name"
                    },
                    {
                        name: "lastName",
                        label: "lastName",
                        placeholder: "Enter last name"
                    },
                    {
                        name: "email",
                        label: "email",
                        placeholder: "Enter new email"
                    },
                    {
                        name: "phone",
                        label: "phone",
                        type: "tel",
                        placeholder: "+1-555-555-5555",
                    },
                    {
                        name: "points",
                        label: "points",
                        type: "number",
                        min: 0,
                        placeholder: "Update customers points"
                    },
                    {
                        name: "lastPurchase",
                        label: "lastPurchase",
                        type: "date"
                    },

                ],
            }}
            updateConfig={{
                title: "Update Customer",
                buttonText: "Submit",
                fields: [
                    {
                        name: "customerID",
                        label: "Customer ID (to update)",
                        type: "number",
                        min: 1
                    },
                    {
                        name: "firstName",
                        label: "firstName",
                        placeholder: "Update first name"
                    },
                    {
                        name: "lastName",
                        label: "lastName",
                        placeholder: "Update last name"
                    },
                    {
                        name: "email",
                        label: "email",
                        placeholder: "Update email"
                    },
                    {
                        name: "phone",
                        label: "phone",
                        type: "tel",
                        placeholder: "+1-555-555-5555"
                    },
                    {
                        name: "points",
                        label: "points",
                        type: "number",
                        min: 0
                    },
                    {
                        name: "lastPurchase",
                        label: "lastPurchase",
                        type: "date"
                    },
                ],
            }}

            rowKey="customerID"
            onDeleteRow={handleDeleteCustomer}
            deleteButtonText="Delete"
            confirmDeleteMessage={(row) =>
                `Delete customer ${row.customerID} (${row.firstName} ${row.lastName})?`
            }


        />
    );
}

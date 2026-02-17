export default function Home() {
    return (
        <main className="main">
            <h2 className="page-title">Home</h2>

            <section className="section">
                <h2>Application Pages</h2>

                <ul className="note" style={{ listStyle: "none", paddingLeft: 0, lineHeight: 1.8 }}>
                    <li><strong>Products</strong> – Browse and manage trading card products.</li>
                    <li><strong>Inventories</strong> – Manage inventory locations (store vs not).</li>
                    <li><strong>Product Inventories</strong> – Manage quantities of products per inventory.</li>
                    <li><strong>Customers</strong> – Manage customer info and loyalty points.</li>
                    <li><strong>Orders</strong> – Browse and manage orders.</li>
                    <li><strong>Order Products</strong> – Manage order line items (products in an order).</li>
                </ul>

                <p className="note">
                    Each page includes sections for Browse (SELECT), Insert, Update, and Delete.
                </p>
            </section>
        </main>
    );
}

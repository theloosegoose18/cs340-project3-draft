import { NavLink } from "react-router-dom";

export default function Navigation() {
    const linkClass = ({ isActive }) => (isActive ? "active" : "");

    const handleReset = async () => {
        const ok = window.confirm(
            "Reset the database?\n\nThis will DROP + recreate tables and reload sample data."
        );
        if (!ok) return;

        try {
            const res = await fetch("/api/reset", { method: "POST" });

            // if backend returns JSON
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.error || `HTTP ${res.status}`);
            }

            alert("Database reset complete.");

            // Option A (simple): reload the page so all tables re-fetch
            window.location.reload();

            // Option B (nicer): dispatch event for pages to re-fetch without full reload:
            // window.dispatchEvent(new Event("dbReset"));
        } catch (err) {
            alert("Reset failed:\n" + (err?.message || String(err)));
        }
    };

    return (
        <nav className="navbar">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/products" className={linkClass}>Products</NavLink>
            <NavLink to="/inventories" className={linkClass}>Inventories</NavLink>
            <NavLink to="/product-inventories" className={linkClass}>Product Inventories</NavLink>
            <NavLink to="/customers" className={linkClass}>Customers</NavLink>
            <NavLink to="/orders" className={linkClass}>Orders</NavLink>
            <NavLink to="/order-products" className={linkClass}>Order Products</NavLink>

            <button
                type="button"
                onClick={handleReset}
                style={{ marginLeft: 10 }}
            >
                RESET
            </button>
        </nav>
    );
}
import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
    return (
        <>
            <header>
                <h1 className="site-title">Noir Cards</h1>

                <nav className="nav">
                    <NavLink to="/" end>Home</NavLink>
                    <NavLink to="/products">Products</NavLink>
                    <NavLink to="/inventories">Inventories</NavLink>
                    <NavLink to="/product-inventories">Product Inventories</NavLink>
                    <NavLink to="/customers">Customers</NavLink>
                    <NavLink to="/orders">Orders</NavLink>
                    <NavLink to="/order-products">Order Products</NavLink>
                </nav>
            </header>

            <Outlet />
        </>
    );
}

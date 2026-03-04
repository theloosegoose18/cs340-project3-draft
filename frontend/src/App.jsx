import Navigation from "./components/Navigation";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Inventories from "./pages/Inventories";
import OrderProducts from "./pages/OrderProducts";
import Orders from "./pages/Orders";
import ProductInventories from "./pages/ProductInventories";
import Products from "./pages/Products";

function App() {
    return (
        <div className="app-shell">
            <header className="site-header">
                <h1 className="brand">Noir Cards</h1>
            </header>

            <Navigation />

            <main className="page-shell">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/inventories" element={<Inventories />} />
                    <Route path="/order-products" element={<OrderProducts />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/product-inventories" element={<ProductInventories />} />
                    <Route path="/products" element={<Products />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
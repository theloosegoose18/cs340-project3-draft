import Navigation from "./components/Navigation";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Customers from "./pages/Customers";
import Inventories from "./pages/Inventories";
import OrderProducts from "./pages/OrderProducts";
import Orders from "./pages/Orders";
import ProductInventories from "./pages/ProductInventories";
import Products from "./pages/Products";


const backendURL = "http://classwork.engr.oregonstate.edu:2011";

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
                    <Route
                        path="/customers"
                        element={<Customers backendURL={backendURL} />}
                    />
                    <Route
                        path="/inventories"
                        element={<Inventories backendURL={backendURL} />}
                    />
                    <Route
                        path="/order-products"
                        element={<OrderProducts backendURL={backendURL} />}
                    />
                    <Route
                        path="/orders"
                        element={<Orders backendURL={backendURL} />}
                    />
                    <Route
                        path="/product-inventories"
                        element={<ProductInventories backendURL={backendURL} />}
                    />
                    <Route
                        path="/products"
                        element={<Products backendURL={backendURL} />}
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;

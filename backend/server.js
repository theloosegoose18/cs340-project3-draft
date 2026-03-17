// server.js
require("dotenv").config({ path: "local.env" });

console.log("ENV CHECK:", {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    HAS_PASSWORD: !!process.env.DB_PASSWORD,
});

const express = require("express");
const cors = require("cors");
const db = require("./db-connector");

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 2011;

// -------------------- Middleware
app.use(express.json());

// CORS_ORIGIN="http://localhost:5173,http://classwork.engr.oregonstate.edu:2015"
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
    cors({
        credentials: true,
        origin: function (origin, cb) {
            // allow tools like Postman/no-origin requests
            if (!origin) return cb(null, true);

            // allow if list is empty (dev fallback) OR origin is in list
            if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return cb(null, true);
            }
            return cb(new Error("Not allowed by CORS: " + origin));
        },
    })
);

// -------------------- Helpers
const asyncHandler =
    (fn) =>
        (req, res, next) =>
            Promise.resolve(fn(req, res, next)).catch(next);

function requireIntId(value, name = "id") {
    const n = Number(value);
    if (!Number.isInteger(n) || n <= 0) {
        const err = new Error(`Invalid ${name}`);
        err.status = 400;
        throw err;
    }
    return n;
}

function pick(obj, keys) {
    const out = {};
    for (const k of keys) {
        // Skip undefined and empty strings — neither should overwrite existing DB data
        if (obj[k] !== undefined && obj[k] !== "") out[k] = obj[k];
    }
    return out;
}

// consistent response helpers
function ok(res, data = null) {
    return res.json({ ok: true, data });
}
function fail(res, status, message) {
    return res.status(status).json({ ok: false, error: message });
}

// -------------------- Startup DB ping (for debugging)
(async () => {
    try {
        await db.query("SELECT 1;");
        console.log("DB connection: OK");
    } catch (err) {
        console.error("DB connection: FAILED", err.message || err);
    }
})();

// -------------------- Routes
app.get("/api/health", (req, res) => ok(res, { status: "up" }));

// RESET (calls your stored procedure)
app.post(
    "/api/reset",
    asyncHandler(async (req, res) => {
        await db.query("CALL sp_reset_seeded();");
        return ok(res, { message: "Database reset complete." });
    })
);

// -------------------- READ endpoints
app.get(
    "/api/products",
    asyncHandler(async (req, res) => {
        const [rows] = await db.query("SELECT * FROM Products;");
        return ok(res, rows);
    })
);

app.get(
    "/api/inventories",
    asyncHandler(async (req, res) => {
        const [rows] = await db.query("SELECT * FROM Inventories;");
        return ok(res, rows);
    })
);

app.get(
    "/api/product-inventories",
    asyncHandler(async (req, res) => {
        const [rows] = await db.query("SELECT * FROM ProductInventories;");
        return ok(res, rows);
    })
);

app.get(
    "/api/customers",
    asyncHandler(async (req, res) => {
        const [rows] = await db.query("SELECT * FROM Customers;");
        return ok(res, rows);
    })
);

app.get(
    "/api/orders",
    asyncHandler(async (req, res) => {
        const [rows] = await db.query("SELECT * FROM Orders;");
        return ok(res, rows);
    })
);

app.get(
    "/api/order-products",
    asyncHandler(async (req, res) => {
        const [rows] = await db.query("SELECT * FROM OrderProducts;");
        return ok(res, rows);
    })
);

// -------------------- CUSTOMERS: CREATE / UPDATE / DELETE

app.post(
    "/api/customers",
    asyncHandler(async (req, res) => {
        const { fName, lName, email, phone, points, lastPurchase } = req.body || {};

        if (!fName || !lName || !email) {
            return fail(res, 400, "fName, lName, and email are required.");
        }

        const pts = points === "" || points === undefined ? 0 : Number(points);
        if (!Number.isFinite(pts) || pts < 0) {
            return fail(res, 400, "points must be a non-negative number.");
        }

        const sql = `
      INSERT INTO Customers (fName, lName, email, phone, points, lastPurchase)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

        const params = [
            fName,
            lName,
            email,
            phone ?? null,
            pts,
            lastPurchase ? lastPurchase : null, // accepts YYYY-MM-DD or full datetime strings
        ];

        const [result] = await db.query(sql, params);
        return res.status(201).json({ ok: true, data: { customerID: result.insertId } });
    })
);

app.put(
    "/api/customers/:id",
    asyncHandler(async (req, res) => {
        const customerID = requireIntId(req.params.id, "customerID");

        // Allow partial update, but you can enforce required fields if you want
        const allowed = pick(req.body || {}, [
            "fName",
            "lName",
            "email",
            "phone",
            "points",
            "lastPurchase",
        ]);

        if (Object.keys(allowed).length === 0) {
            return fail(res, 400, "No updatable fields provided.");
        }

        // Build dynamic SET clause for partial updates
        const sets = [];
        const params = [];

        if (allowed.fName !== undefined) {
            sets.push("fName = ?");
            params.push(allowed.fName);
        }
        if (allowed.lName !== undefined) {
            sets.push("lName = ?");
            params.push(allowed.lName);
        }
        if (allowed.email !== undefined) {
            sets.push("email = ?");
            params.push(allowed.email);
        }
        if (allowed.phone !== undefined) {
            sets.push("phone = ?");
            params.push(allowed.phone ?? null);
        }
        if (allowed.points !== undefined) {
            const pts = allowed.points === "" ? 0 : Number(allowed.points);
            if (!Number.isFinite(pts) || pts < 0) return fail(res, 400, "points must be non-negative.");
            sets.push("points = ?");
            params.push(pts);
        }
        if (allowed.lastPurchase !== undefined) {
            sets.push("lastPurchase = ?");
            params.push(allowed.lastPurchase ? allowed.lastPurchase : null);
        }

        params.push(customerID);

        const sql = `UPDATE Customers SET ${sets.join(", ")} WHERE customerID = ?;`;
        const [result] = await db.query(sql, params);

        return ok(res, { updated: result.affectedRows });
    })
);

app.delete(
    "/api/customers/:id",
    asyncHandler(async (req, res) => {
        const customerID = requireIntId(req.params.id, "customerID");

        const [result] = await db.query("DELETE FROM Customers WHERE customerID = ?;", [
            customerID,
        ]);

        return ok(res, { deleted: result.affectedRows });
    })
);



// -------------------- PRODUCTS: CREATE / UPDATE / DELETE

app.post(
    "/api/products",
    asyncHandler(async (req, res) => {
        const { name, currentPrice } = req.body || {};

        if (!name) return fail(res, 400, "name is required.");

        const price = Number(currentPrice);
        if (!Number.isFinite(price) || price < 0)
            return fail(res, 400, "currentPrice must be a non-negative number.");

        const [result] = await db.query(
            "INSERT INTO Products (name, currentPrice) VALUES (?, ?);",
            [name, price]
        );
        return res.status(201).json({ ok: true, data: { productID: result.insertId } });
    })
);

app.put(
    "/api/products/:id",
    asyncHandler(async (req, res) => {
        const productID = requireIntId(req.params.id, "productID");

        const allowed = pick(req.body || {}, ["name", "currentPrice"]);

        if (Object.keys(allowed).length === 0)
            return fail(res, 400, "No updatable fields provided.");

        const sets = [];
        const params = [];

        if (allowed.name !== undefined) {
            sets.push("name = ?");
            params.push(allowed.name);
        }
        if (allowed.currentPrice !== undefined) {
            const price = Number(allowed.currentPrice);
            if (!Number.isFinite(price) || price < 0)
                return fail(res, 400, "currentPrice must be a non-negative number.");
            sets.push("currentPrice = ?");
            params.push(price);
        }

        params.push(productID);

        const sql = `UPDATE Products SET ${sets.join(", ")} WHERE productID = ?;`;
        const [result] = await db.query(sql, params);

        return ok(res, { updated: result.affectedRows });
    })
);

app.delete(
    "/api/products/:id",
    asyncHandler(async (req, res) => {
        const productID = requireIntId(req.params.id, "productID");

        // Hard delete. FK ON DELETE RESTRICT on OrderProducts.productID means
        // MySQL will throw ER_ROW_IS_REFERENCED_2 (caught → 409) if order history exists.
        const [result] = await db.query(
            "DELETE FROM Products WHERE productID = ?;",
            [productID]
        );

        return ok(res, { deleted: result.affectedRows });
    })
);

// -------------------- PRODUCT-INVENTORIES: CREATE / UPDATE / DELETE

app.post("/api/product-inventories", asyncHandler(async (req, res) => {
    const { productID, inventoryID, quantity } = req.body || {};
    if (!productID || !inventoryID) return fail(res, 400, "productID and inventoryID are required.");
    const qty = Number(quantity ?? 0);
    if (!Number.isFinite(qty) || qty < 0) return fail(res, 400, "quantity must be >= 0.");

    const [result] = await db.query(
        "INSERT INTO ProductInventories (productID, inventoryID, quantity) VALUES (?, ?, ?);",
        [productID, inventoryID, qty]
    );
    return res.status(201).json({ ok: true, data: { productInventoryID: result.insertId } }); // fix: was missing return
}));

app.put("/api/product-inventories/:id", asyncHandler(async (req, res) => {
    const productInventoryID = requireIntId(req.params.id, "productInventoryID");
    const { quantity } = req.body || {};
    if (quantity === undefined || quantity === "")
        return fail(res, 400, "quantity is required.");
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) return fail(res, 400, "quantity must be >= 0.");

    const [result] = await db.query(
        "UPDATE ProductInventories SET quantity = ? WHERE productInventoryID = ?;",
        [qty, productInventoryID] // fix: params array was missing entirely
    );
    return ok(res, { updated: result.affectedRows });
}));

app.delete("/api/product-inventories/:id", asyncHandler(async (req, res) => { // fix: path was /api/products/:id
    const productInventoryID = requireIntId(req.params.id, "productInventoryID");
    const [result] = await db.query(
        "DELETE FROM ProductInventories WHERE productInventoryID = ?;", [productInventoryID]
    );
    return ok(res, { deleted: result.affectedRows });
}));

// -------------------- INVENTORIES: CREATE / UPDATE / DELETE

app.post("/api/inventories", asyncHandler(async (req, res) => {
    const { name, atStore } = req.body || {};
    if (!name) return fail(res, 400, "name is required.");
    if (atStore === undefined || atStore === "") return fail(res, 400, "atStore is required.");

    const [result] = await db.query(
        "INSERT INTO Inventories (name, atStore) VALUES (?, ?);",
        [name, atStore ? 1 : 0]
    );
    return res.status(201).json({ ok: true, data: { inventoryID: result.insertId } });
}));

app.put("/api/inventories/:id", asyncHandler(async (req, res) => {
    const inventoryID = requireIntId(req.params.id, "inventoryID");
    const allowed = pick(req.body || {}, ["name", "atStore"]);
    if (Object.keys(allowed).length === 0)
        return fail(res, 400, "No updatable fields provided.");

    const sets = [], params = [];
    if (allowed.name    !== undefined) { sets.push("name = ?");    params.push(allowed.name); }
    if (allowed.atStore !== undefined) { sets.push("atStore = ?"); params.push(allowed.atStore ? 1 : 0); }

    params.push(inventoryID);
    const [result] = await db.query(
        `UPDATE Inventories SET ${sets.join(", ")} WHERE inventoryID = ?;`, params
    );
    return ok(res, { updated: result.affectedRows });
}));

app.delete("/api/inventories/:id", asyncHandler(async (req, res) => {
    const inventoryID = requireIntId(req.params.id, "inventoryID");
    const [result] = await db.query(
        "DELETE FROM Inventories WHERE inventoryID = ?;", [inventoryID]
    );
    return ok(res, { deleted: result.affectedRows });
}));

// -------------------- ORDERS: CREATE / UPDATE / DELETE

app.post("/api/orders", asyncHandler(async (req, res) => {
    const { customerID, pointsUsed } = req.body || {};
    const pts = Number(pointsUsed ?? 0);
    if (!Number.isFinite(pts) || pts < 0) return fail(res, 400, "pointsUsed must be >= 0.");

    // customerID is nullable (ON DELETE SET NULL) — allow empty string or missing as NULL
    const cid = customerID !== "" && customerID !== undefined ? Number(customerID) : null;

    const [result] = await db.query(
        "INSERT INTO Orders (customerID, pointsUsed) VALUES (?, ?);",
        [cid, pts]
    );
    return res.status(201).json({ ok: true, data: { orderID: result.insertId } });
}));

app.put("/api/orders/:id", asyncHandler(async (req, res) => {
    const orderID = requireIntId(req.params.id, "orderID");
    const allowed = pick(req.body || {}, ["customerID", "orderDate", "pointsUsed"]);
    if (Object.keys(allowed).length === 0)
        return fail(res, 400, "No updatable fields provided.");

    const sets = [], params = [];
    if (allowed.customerID !== undefined) {
        const cid = allowed.customerID !== "" ? Number(allowed.customerID) : null;
        sets.push("customerID = ?"); params.push(cid);
    }
    if (allowed.orderDate !== undefined) {
        sets.push("orderDate = ?"); params.push(allowed.orderDate || null);
    }
    if (allowed.pointsUsed !== undefined) {
        const pts = Number(allowed.pointsUsed);
        if (!Number.isFinite(pts) || pts < 0) return fail(res, 400, "pointsUsed must be >= 0.");
        sets.push("pointsUsed = ?"); params.push(pts);
    }

    params.push(orderID);
    const [result] = await db.query(
        `UPDATE Orders SET ${sets.join(", ")} WHERE orderID = ?;`, params
    );
    return ok(res, { updated: result.affectedRows });
}));

app.delete("/api/orders/:id", asyncHandler(async (req, res) => {
    const orderID = requireIntId(req.params.id, "orderID");
    const [result] = await db.query(
        "DELETE FROM Orders WHERE orderID = ?;", [orderID]
    );
    return ok(res, { deleted: result.affectedRows });
}));

// -------------------- ORDER-PRODUCTS: CREATE / UPDATE / DELETE

app.post("/api/order-products", asyncHandler(async (req, res) => {
    const { orderID, productID, quantity, inventoryID } = req.body || {};
    if (!orderID || !productID || !inventoryID)
        return fail(res, 400, "orderID, productID, and inventoryID are required.");
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) return fail(res, 400, "quantity must be >= 1.");

    const [result] = await db.query(
        "INSERT INTO OrderProducts (orderID, productID, quantity, inventoryID) VALUES (?, ?, ?, ?);",
        [orderID, productID, qty, inventoryID]
    );
    return res.status(201).json({ ok: true, data: { orderItemID: result.insertId } });
}));

app.put("/api/order-products/:id", asyncHandler(async (req, res) => {
    const orderItemID = requireIntId(req.params.id, "orderItemID");
    const allowed = pick(req.body || {}, ["orderID", "productID", "quantity", "inventoryID"]);
    if (Object.keys(allowed).length === 0)
        return fail(res, 400, "No updatable fields provided.");

    const sets = [], params = [];
    if (allowed.orderID     !== undefined) { sets.push("orderID = ?");     params.push(Number(allowed.orderID)); }
    if (allowed.productID   !== undefined) { sets.push("productID = ?");   params.push(Number(allowed.productID)); }
    if (allowed.inventoryID !== undefined) { sets.push("inventoryID = ?"); params.push(Number(allowed.inventoryID)); }
    if (allowed.quantity    !== undefined) {
        const qty = Number(allowed.quantity);
        if (!Number.isFinite(qty) || qty < 1) return fail(res, 400, "quantity must be >= 1.");
        sets.push("quantity = ?"); params.push(qty);
    }

    params.push(orderItemID);
    const [result] = await db.query(
        `UPDATE OrderProducts SET ${sets.join(", ")} WHERE orderItemID = ?;`, params
    );
    return ok(res, { updated: result.affectedRows });
}));

app.delete("/api/order-products/:id", asyncHandler(async (req, res) => {
    const orderItemID = requireIntId(req.params.id, "orderItemID");
    const [result] = await db.query(
        "DELETE FROM OrderProducts WHERE orderItemID = ?;", [orderItemID]
    );
    return ok(res, { deleted: result.affectedRows });
}));

// -------------------- Error handler (one place for all errors)
app.use((err, req, res, next) => {
    console.error("API error:", err);

    // MySQL FK violation — a child row still references this row (ON DELETE RESTRICT)
    // e.g. trying to delete a Product or Inventory that still appears in OrderProducts history
    if (err.code === "ER_ROW_IS_REFERENCED_2" || err.errno === 1451) {
        return res.status(409).json({
            ok: false,
            error: "Cannot delete: this record is referenced by existing order history. Remove the related order items first, or keep the record.",
        });
    }

    // CORS errors or custom validation errors
    const status = err.status || 500;
    const message =
        err.message || (status === 500 ? "Internal server error" : "Request failed");

    res.status(status).json({ ok: false, error: message });
});

// -------------------- Listen
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});

// -------------------- Crash hooks (don’t silently exit)
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});
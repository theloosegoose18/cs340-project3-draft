// server.js (REFACTORED DROP-IN)
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
        if (obj[k] !== undefined) out[k] = obj[k];
    }
    return out;
}

// Optional: consistent response helpers
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

// -------------------- READ endpoints (keep as-is, but consistent)
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
// Field names based on your DB output: customerID, fName, lName, email, phone, points, lastPurchase

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

// -------------------- ONE CUD: delete a product (keep your original)
app.delete(
    "/api/products/:id",
    asyncHandler(async (req, res) => {
        const productID = requireIntId(req.params.id, "productID");

        const [result] = await db.query("DELETE FROM Products WHERE productID = ?;", [
            productID,
        ]);

        return ok(res, { affectedRows: result.affectedRows });
    })
);

// -------------------- Error handler (one place for all errors)
app.use((err, req, res, next) => {
    console.error("API error:", err);

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
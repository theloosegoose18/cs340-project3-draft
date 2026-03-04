------------------------------------------------------------------------
-- VIEW QUERIES
------------------------------------------------------------------------

-- GENERIC VIEWS (ALL VALUES)
DROP VIEW IF EXISTS v_all_products;
CREATE VIEW v_all_products AS
SELECT * FROM Products;

DROP VIEW IF EXISTS v_all_inventories;
CREATE VIEW v_all_inventories AS
SELECT * FROM Inventories;

DROP VIEW IF EXISTS v_all_product_inventories;
CREATE VIEW v_all_product_inventories AS
SELECT * FROM ProductInventories;

DROP VIEW IF EXISTS v_all_customers;
CREATE VIEW v_all_customers AS
SELECT * FROM Customers;

DROP VIEW IF EXISTS v_all_orders;
CREATE VIEW v_all_orders AS
SELECT * FROM Orders;

DROP VIEW IF EXISTS v_all_order_products;
CREATE VIEW v_all_order_products AS
SELECT * FROM OrderProducts;


-- USER FRIENDLY VIEWS

-- Display products with their current price
DROP VIEW IF EXISTS v_products_and_prices;
CREATE VIEW v_products_and_prices AS
SELECT name AS product, currentPrice AS price
FROM Products;

-- display all inventories available
DROP VIEW IF EXISTS v_inventories;
CREATE VIEW v_inventories AS
SELECT name, atStore
FROM Inventories;

-- Display products with their respective locations and quantities
DROP VIEW IF EXISTS v_products_and_locations;
CREATE VIEW v_products_and_locations AS
SELECT
    p.name AS product,
    i.name AS location,
    pi.quantity
FROM Products p
JOIN ProductInventories pi ON p.productID = pi.productID
JOIN Inventories i ON pi.inventoryID = i.inventoryID
ORDER BY product;

-- Display all customers
DROP VIEW IF EXISTS v_customers;
CREATE VIEW v_customers AS
SELECT fName AS First, lName AS Last, email
FROM Customers;

-- Display dollar value of an order (sum of its items)
-- FIXED: your original had INNER JOIN without ON (syntax/logic bug)
DROP VIEW IF EXISTS v_order_item_totals;
CREATE VIEW v_order_item_totals AS
SELECT
    op.orderID AS `Order Number`,
    SUM(op.quantity * p.currentPrice) AS itemTotal
FROM OrderProducts op
JOIN Products p ON op.productID = p.productID
GROUP BY op.orderID;

-- Display each order, total, and the customer who made the order
DROP VIEW IF EXISTS v_orders_and_totals;
CREATE VIEW v_orders_and_totals AS
SELECT
    o.orderDate AS `Date`,
    c.fName AS First,
    c.lName AS Last,
    t.itemTotal AS `Order Total`
FROM Orders o
JOIN Customers c ON o.customerID = c.customerID
JOIN (
    SELECT
        op.orderID,
        SUM(op.quantity * p.currentPrice) AS itemTotal
    FROM OrderProducts op
    JOIN Products p ON op.productID = p.productID
    GROUP BY op.orderID
) AS t ON o.orderID = t.orderID;

-- Display each order product with product name, quantity, inventory, and purchaser name
DROP VIEW IF EXISTS v_order_products_details;
CREATE VIEW v_order_products_details AS
SELECT
    op.orderID AS `Order Number`,
    p.name AS `Product`,
    op.quantity,
    i.name AS `Inventory`,
    CONCAT(c.fName, ' ', c.lName) AS Name
FROM OrderProducts op
JOIN Products p ON p.productID = op.productID
JOIN Inventories i ON i.inventoryID = op.inventoryID
JOIN Orders o ON o.orderID = op.orderID
JOIN Customers c ON o.customerID = c.customerID
ORDER BY op.orderID ASC;

-- Orders by customer name (filter when selecting; no variables inside view)
DROP VIEW IF EXISTS v_orders_by_customer_name;
CREATE VIEW v_orders_by_customer_name AS
SELECT
    o.orderID,
    c.fName,
    c.lName
FROM Orders o
JOIN Customers c ON o.customerID = c.customerID;

-- Products by order (this shows all order items; filter by orderID when selecting if needed)
DROP VIEW IF EXISTS v_products_by_order;
CREATE VIEW v_products_by_order AS
SELECT
    p.name AS Product,
    op.quantity,
    (op.quantity * p.currentPrice) AS Price
FROM OrderProducts op
JOIN Products p ON p.productID = op.productID
ORDER BY Product;
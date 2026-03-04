-- DDL QUERIES
-- Group 39
-- Zachary Sherman
-- Justin Barreras

-- ==========================
-- Drop views (safe)
-- ==========================
DROP VIEW IF EXISTS v_all_products;
DROP VIEW IF EXISTS v_all_customers;
DROP VIEW IF EXISTS v_all_inventories;
DROP VIEW IF EXISTS v_all_orders;
DROP VIEW IF EXISTS v_all_order_products;
DROP VIEW IF EXISTS v_all_product_inventories;

-- ==========================
-- Drop routines
-- ==========================
DROP PROCEDURE IF EXISTS sp_reset_empty;
DROP PROCEDURE IF EXISTS sp_reset_seeded;

-- ==========================
-- Drop tables (children first)
-- ==========================
DROP TABLE IF EXISTS OrderProducts;
DROP TABLE IF EXISTS ProductInventories;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Inventories;
DROP TABLE IF EXISTS Products;

-- ==========================
-- Create tables
-- ==========================

CREATE TABLE Products (
    productID INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    currentPrice DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (productID),
    CONSTRAINT chk_products_currentPrice CHECK (currentPrice > 0)
);

CREATE TABLE Inventories (
    inventoryID INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    atStore BOOLEAN NOT NULL,
    PRIMARY KEY (inventoryID)
);

CREATE TABLE ProductInventories (
    productInventoryID INT NOT NULL AUTO_INCREMENT,
    productID INT NOT NULL,
    inventoryID INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (productInventoryID),
    CONSTRAINT chk_productInventories_qty CHECK (quantity >= 0),
    CONSTRAINT fk_ProductInventories_product
        FOREIGN KEY (productID) REFERENCES Products(productID)
        ON DELETE RESTRICT,
    CONSTRAINT fk_ProductInventories_inventory
        FOREIGN KEY (inventoryID) REFERENCES Inventories(inventoryID)
        ON DELETE RESTRICT,
    CONSTRAINT uq_ProductInventories_pair UNIQUE (productID, inventoryID)
);

CREATE TABLE Customers (
    customerID INT NOT NULL AUTO_INCREMENT,
    fName VARCHAR(255) NOT NULL,
    lName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15),
    points INT NOT NULL DEFAULT 0,
    lastPurchase DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customerID),
    CONSTRAINT chk_customers_points CHECK (points >= 0)
);

CREATE TABLE Orders (
    orderID INT NOT NULL AUTO_INCREMENT,
    customerID INT DEFAULT NULL,
    orderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pointsUsed INT NOT NULL DEFAULT 0,
    PRIMARY KEY (orderID),
    CONSTRAINT chk_orders_pointsUsed CHECK (pointsUsed >= 0),
    CONSTRAINT fk_Orders_customer
        FOREIGN KEY (customerID) REFERENCES Customers(customerID)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE OrderProducts (
    orderItemID INT NOT NULL AUTO_INCREMENT,
    orderID INT NOT NULL,
    productID INT NOT NULL,
    quantity INT NOT NULL,
    inventoryID INT NOT NULL,
    PRIMARY KEY (orderItemID),
    CONSTRAINT chk_orderProducts_qty CHECK (quantity > 0),
    CONSTRAINT fk_OrderProducts_order
        FOREIGN KEY (orderID) REFERENCES Orders(orderID)
        ON DELETE CASCADE,
    CONSTRAINT fk_OrderProducts_product
        FOREIGN KEY (productID) REFERENCES Products(productID)
        ON DELETE RESTRICT,
    CONSTRAINT fk_OrderProducts_inventory
        FOREIGN KEY (inventoryID) REFERENCES Inventories(inventoryID)
        ON DELETE RESTRICT
);

-- ==========================
-- Seed data (optional, but helpful for Step 4 testing)
-- ==========================

INSERT INTO Products (name, currentPrice)
VALUES
    ('Raging Goblin', 2.99),
    ('Fossil Booster Box', 49.99),
    ('Rhystic Study', 1.00),
    ('Fog', 0.23),
    ('WOTC branded playmat', 17.40);

INSERT INTO Inventories (name, atStore)
VALUES
    ('Display', TRUE),
    ('Store Room', TRUE),
    ('On Order', FALSE);

INSERT INTO ProductInventories (productID, inventoryID, quantity)
VALUES
    ((SELECT productID FROM Products WHERE name = 'Raging Goblin'), (SELECT inventoryID FROM Inventories WHERE name = 'Display'), 16),
    ((SELECT productID FROM Products WHERE name = 'Fossil Booster Box'), (SELECT inventoryID FROM Inventories WHERE name = 'Store Room'), 3),
    ((SELECT productID FROM Products WHERE name = 'Fog'), (SELECT inventoryID FROM Inventories WHERE name = 'Store Room'), 362),
    ((SELECT productID FROM Products WHERE name = 'Rhystic Study'), (SELECT inventoryID FROM Inventories WHERE name = 'On Order'), 5);

INSERT INTO Customers (fName, lName, email, phone, points)
VALUES
    ('Henry', 'Paul', 'hpaul@email.com', NULL, 2000),
    ('Jason', 'Isaacs', 'hizzy@me.net', '555-343-5288', 200),
    ('Monica', 'Isfran', 'spamfolder@yahoo.com', '5554876952', 0),
    ('Makoto', 'Nagano', 'ninjawarrior@super.gove', NULL, 3000);

INSERT INTO Orders (customerID, pointsUsed)
VALUES
    ((SELECT customerID FROM Customers WHERE email = 'hpaul@email.com'), 1600),
    ((SELECT customerID FROM Customers WHERE fName = 'Makoto' AND lName = 'Nagano'), 0),
    ((SELECT customerID FROM Customers WHERE email = 'hizzy@me.net'), 200),
    ((SELECT customerID FROM Customers WHERE email = 'ninjawarrior@super.gove'), 3000);

INSERT INTO OrderProducts (orderID, productID, quantity, inventoryID)
VALUES
    (
        (SELECT o.orderID
         FROM Orders o
         JOIN Customers c ON o.customerID = c.customerID
         WHERE c.email = 'hizzy@me.net'
         ORDER BY o.orderID DESC
         LIMIT 1),
        (SELECT productID FROM Products WHERE name = 'Fog'),
        13,
        (SELECT inventoryID FROM Inventories WHERE name = 'Store Room')
    ),
    (
        (SELECT o.orderID
         FROM Orders o
         JOIN Customers c ON o.customerID = c.customerID
         WHERE c.email = 'hpaul@email.com'
         ORDER BY o.orderID DESC
         LIMIT 1),
        (SELECT productID FROM Products WHERE name = 'Raging Goblin'),
        1,
        (SELECT inventoryID FROM Inventories WHERE name = 'Display')
    ),
    (
        (SELECT o.orderID
         FROM Orders o
         JOIN Customers c ON o.customerID = c.customerID
         WHERE c.email = 'ninjawarrior@super.gove'
         ORDER BY o.orderID DESC
         LIMIT 1),
        (SELECT productID FROM Products WHERE name = 'Fossil Booster Box'),
        2,
        (SELECT inventoryID FROM Inventories WHERE name = 'Store Room')
    );

-- ==========================
-- Views (SELECT for all entities)
-- ==========================
CREATE VIEW v_all_products AS
SELECT * FROM Products;

CREATE VIEW v_all_customers AS
SELECT * FROM Customers;

CREATE VIEW v_all_inventories AS
SELECT * FROM Inventories;

CREATE VIEW v_all_orders AS
SELECT * FROM Orders;

CREATE VIEW v_all_order_products AS
SELECT * FROM OrderProducts;

CREATE VIEW v_all_product_inventories AS
SELECT * FROM ProductInventories;

-- ==========================
-- Reset procedures
-- ==========================

DELIMITER //

-- 1) RESET TO EMPTY TABLES (no sample data)
CREATE PROCEDURE sp_reset_empty()
BEGIN
    SET FOREIGN_KEY_CHECKS = 0;

    -- Child tables first
    TRUNCATE TABLE OrderProducts;
    TRUNCATE TABLE ProductInventories;

    -- Parent tables
    TRUNCATE TABLE Orders;
    TRUNCATE TABLE Customers;
    TRUNCATE TABLE Inventories;
    TRUNCATE TABLE Products;

    SET FOREIGN_KEY_CHECKS = 1;
END //

-- 2) RESET BACK TO SEEDED SAMPLE DATA
-- (This empties all tables and re-inserts the same sample rows as above.)
CREATE PROCEDURE sp_reset_seeded()
BEGIN
    CALL sp_reset_empty();

    -- Re-seed sample data
    INSERT INTO Products (name, currentPrice)
    VALUES
        ('Raging Goblin', 2.99),
        ('Fossil Booster Box', 49.99),
        ('Rhystic Study', 1.00),
        ('Fog', 0.23),
        ('WOTC branded playmat', 17.40);

    INSERT INTO Inventories (name, atStore)
    VALUES
        ('Display', TRUE),
        ('Store Room', TRUE),
        ('On Order', FALSE);

    INSERT INTO ProductInventories (productID, inventoryID, quantity)
    VALUES
        ((SELECT productID FROM Products WHERE name = 'Raging Goblin'), (SELECT inventoryID FROM Inventories WHERE name = 'Display'), 16),
        ((SELECT productID FROM Products WHERE name = 'Fossil Booster Box'), (SELECT inventoryID FROM Inventories WHERE name = 'Store Room'), 3),
        ((SELECT productID FROM Products WHERE name = 'Fog'), (SELECT inventoryID FROM Inventories WHERE name = 'Store Room'), 362),
        ((SELECT productID FROM Products WHERE name = 'Rhystic Study'), (SELECT inventoryID FROM Inventories WHERE name = 'On Order'), 5);

    INSERT INTO Customers (fName, lName, email, phone, points)
    VALUES
        ('Henry', 'Paul', 'hpaul@email.com', NULL, 2000),
        ('Jason', 'Isaacs', 'hizzy@me.net', '555-343-5288', 200),
        ('Monica', 'Isfran', 'spamfolder@yahoo.com', '5554876952', 0),
        ('Makoto', 'Nagano', 'ninjawarrior@super.gove', NULL, 3000);

    INSERT INTO Orders (customerID, pointsUsed)
    VALUES
        ((SELECT customerID FROM Customers WHERE email = 'hpaul@email.com'), 1600),
        ((SELECT customerID FROM Customers WHERE fName = 'Makoto' AND lName = 'Nagano'), 0),
        ((SELECT customerID FROM Customers WHERE email = 'hizzy@me.net'), 200),
        ((SELECT customerID FROM Customers WHERE email = 'ninjawarrior@super.gove'), 3000);

    INSERT INTO OrderProducts (orderID, productID, quantity, inventoryID)
    VALUES
        (
            (SELECT o.orderID
             FROM Orders o
             JOIN Customers c ON o.customerID = c.customerID
             WHERE c.email = 'hizzy@me.net'
             ORDER BY o.orderID DESC
             LIMIT 1),
            (SELECT productID FROM Products WHERE name = 'Fog'),
            13,
            (SELECT inventoryID FROM Inventories WHERE name = 'Store Room')
        ),
        (
            (SELECT o.orderID
             FROM Orders o
             JOIN Customers c ON o.customerID = c.customerID
             WHERE c.email = 'hpaul@email.com'
             ORDER BY o.orderID DESC
             LIMIT 1),
            (SELECT productID FROM Products WHERE name = 'Raging Goblin'),
            1,
            (SELECT inventoryID FROM Inventories WHERE name = 'Display')
        ),
        (
            (SELECT o.orderID
             FROM Orders o
             JOIN Customers c ON o.customerID = c.customerID
             WHERE c.email = 'ninjawarrior@super.gove'
             ORDER BY o.orderID DESC
             LIMIT 1),
            (SELECT productID FROM Products WHERE name = 'Fossil Booster Box'),
            2,
            (SELECT inventoryID FROM Inventories WHERE name = 'Store Room')
        );
END //

DELIMITER ;

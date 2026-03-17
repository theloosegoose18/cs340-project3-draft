-- PL.SQL (Stored Procedures + Functions)
-- Group 39
-- Zachary Sherman
-- Justin Barreras


-- =========================
-- FUNCTIONS
-- =========================

DROP FUNCTION IF EXISTS fn_get_customer_id_by_name;
DELIMITER //
CREATE FUNCTION fn_get_customer_id_by_name(_fName VARCHAR(255), _lName VARCHAR(255))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE _customerID INT;

    IF (
        SELECT COUNT(*)
        FROM Customers
        WHERE fName = _fName AND lName = _lName
    ) <> 1 THEN
        RETURN NULL;
    END IF;

    SELECT customerID INTO _customerID
    FROM Customers
    WHERE fName = _fName AND lName = _lName;

    RETURN _customerID;
END //
DELIMITER ;

DROP FUNCTION IF EXISTS fn_get_inventory_id_by_name;
DELIMITER //
CREATE FUNCTION fn_get_inventory_id_by_name(_inventoryName VARCHAR(255))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE _inventoryID INT;
    SELECT inventoryID INTO _inventoryID
    FROM Inventories
    WHERE name = _inventoryName;
    RETURN _inventoryID;
END //
DELIMITER ;

DROP FUNCTION IF EXISTS fn_get_product_id_by_name;
DELIMITER //
CREATE FUNCTION fn_get_product_id_by_name(_productName VARCHAR(255))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE _productID INT;
    SELECT productID INTO _productID
    FROM Products
    WHERE name = _productName;
    RETURN _productID;
END //
DELIMITER ;


-- =========================
-- SELECT / REPORT PROCEDURES
-- =========================

DROP PROCEDURE IF EXISTS sp_get_products_by_order_with_inventory;
DELIMITER //
CREATE PROCEDURE sp_get_products_by_order_with_inventory(IN _orderID INT)
BEGIN
    SELECT
        p.name AS Product,
        op.quantity,
        i.name AS Inventory
    FROM OrderProducts op
    JOIN Products p ON p.productID = op.productID
    JOIN Inventories i ON i.inventoryID = op.inventoryID
    WHERE op.orderID = _orderID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_get_orders_by_date;
DELIMITER //
CREATE PROCEDURE sp_get_orders_by_date(IN _orderDate DATE)
BEGIN
    SELECT
        o.orderID,
        CONCAT(c.fName, ' ', c.lName) AS Name,
        o.pointsUsed
    FROM Orders o
    JOIN Customers c ON o.customerID = c.customerID
    WHERE o.orderDate = _orderDate;
END //
DELIMITER ;


-- =========================
-- INSERT PROCEDURES
-- =========================

DROP PROCEDURE IF EXISTS sp_insert_customer;
DELIMITER //
CREATE PROCEDURE sp_insert_customer(
    IN _fName VARCHAR(255),
    IN _lName VARCHAR(255),
    IN _email VARCHAR(255),
    IN _phone VARCHAR(15),
    OUT _customerID INT
)
BEGIN
    INSERT INTO Customers (fName, lName, email, phone)
    VALUES (_fName, _lName, _email, _phone);
    SET _customerID = LAST_INSERT_ID();
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_insert_order;
DELIMITER //
CREATE PROCEDURE sp_insert_order(
    IN _customerID INT,
    IN _pointsUsed INT,
    OUT _orderID INT
)
BEGIN
    INSERT INTO Orders (customerID, pointsUsed)
    VALUES (_customerID, _pointsUsed);
    SET _orderID = LAST_INSERT_ID();
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_insert_order_product;
DELIMITER //
CREATE PROCEDURE sp_insert_order_product(
    IN _orderID INT,
    IN _productID INT,
    IN _quantity INT,
    IN _inventoryID INT
)
BEGIN
    INSERT INTO OrderProducts (orderID, productID, quantity, inventoryID)
    VALUES (_orderID, _productID, _quantity, _inventoryID);
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_insert_inventory;
DELIMITER //
CREATE PROCEDURE sp_insert_inventory(
    IN _name VARCHAR(255),
    IN _atStore BOOLEAN,
    OUT _inventoryID INT
)
BEGIN
    INSERT INTO Inventories (name, atStore)
    VALUES (_name, _atStore);
    SET _inventoryID = LAST_INSERT_ID();
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_insert_product;
DELIMITER //
CREATE PROCEDURE sp_insert_product(
    IN _name VARCHAR(255),
    IN _currentPrice DECIMAL(12,2),
    OUT _productID INT
)
BEGIN
    INSERT INTO Products (name, currentPrice)
    VALUES (_name, _currentPrice);
    SET _productID = LAST_INSERT_ID();
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_insert_product_inventory;
DELIMITER //
CREATE PROCEDURE sp_insert_product_inventory(
    IN _productID INT,
    IN _inventoryID INT,
    IN _quantity INT
)
BEGIN
    IF EXISTS (
        SELECT 1
        FROM ProductInventories
        WHERE productID = _productID AND inventoryID = _inventoryID
    ) THEN
        SELECT 'Error: Product inventory entry already exists.' AS Result;
    ELSE
        INSERT INTO ProductInventories (productID, inventoryID, quantity)
        VALUES (_productID, _inventoryID, _quantity);
    END IF;
END //
DELIMITER ;


-- =========================
-- UPDATE PROCEDURES
-- =========================

DROP PROCEDURE IF EXISTS sp_update_customer_info;
DELIMITER //
CREATE PROCEDURE sp_update_customer_info(
    IN _customerID INT,
    IN _fName VARCHAR(255),
    IN _lName VARCHAR(255),
    IN _email VARCHAR(255),
    IN _phone VARCHAR(15)
)
BEGIN
    UPDATE Customers
    SET fName = _fName, lName = _lName, email = _email, phone = _phone
    WHERE customerID = _customerID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_customer_points;
DELIMITER //
CREATE PROCEDURE sp_update_customer_points(IN _customerID INT, IN _points INT)
BEGIN
    UPDATE Customers
    SET points = points + _points
    WHERE customerID = _customerID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_customer_last_purchase;
DELIMITER //
CREATE PROCEDURE sp_update_customer_last_purchase(IN _customerID INT)
BEGIN
    UPDATE Customers
    SET lastPurchase = CURRENT_TIMESTAMP
    WHERE customerID = _customerID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_product_price;
DELIMITER //
CREATE PROCEDURE sp_update_product_price(IN _productID INT, IN _currentPrice DECIMAL(12,2))
BEGIN
    UPDATE Products
    SET currentPrice = _currentPrice
    WHERE productID = _productID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_product_name;
DELIMITER //
CREATE PROCEDURE sp_update_product_name(IN _productID INT, IN _name VARCHAR(255))
BEGIN
    UPDATE Products
    SET name = _name
    WHERE productID = _productID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_inventory;
DELIMITER //
CREATE PROCEDURE sp_update_inventory(IN _inventoryID INT, IN _name VARCHAR(255), IN _atStore BOOLEAN)
BEGIN
    UPDATE Inventories
    SET name = _name, atStore = _atStore
    WHERE inventoryID = _inventoryID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_product_inventory_quantity;
DELIMITER //
CREATE PROCEDURE sp_update_product_inventory_quantity(IN _productID INT, IN _inventoryID INT, IN _quantity INT)
BEGIN
    UPDATE ProductInventories
    SET quantity = _quantity
    WHERE productID = _productID AND inventoryID = _inventoryID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_add_product_inventory_quantity;
DELIMITER //
CREATE PROCEDURE sp_add_product_inventory_quantity(IN _productID INT, IN _inventoryID INT, IN _quantity INT)
BEGIN
    UPDATE ProductInventories
    SET quantity = quantity + _quantity
    WHERE productID = _productID AND inventoryID = _inventoryID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_product_inventory_location;
DELIMITER //
CREATE PROCEDURE sp_update_product_inventory_location(IN _productID INT, IN _inventoryID INT, IN _inventoryIDNew INT)
BEGIN
    UPDATE ProductInventories
    SET inventoryID = _inventoryIDNew
    WHERE productID = _productID AND inventoryID = _inventoryID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_order;
DELIMITER //
CREATE PROCEDURE sp_update_order(IN _orderID INT, IN _customerID INT, IN _orderDate DATE, IN _pointsUsed INT)
BEGIN
    UPDATE Orders
    SET customerID = _customerID, orderDate = _orderDate, pointsUsed = _pointsUsed
    WHERE orderID = _orderID;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_update_order_item;
DELIMITER //
CREATE PROCEDURE sp_update_order_item(
    IN _orderItemID INT,
    IN _orderID INT,
    IN _productID INT,
    IN _quantity INT,
    IN _inventoryID INT
)
BEGIN
    UPDATE OrderProducts
    SET orderID = _orderID, productID = _productID, quantity = _quantity, inventoryID = _inventoryID
    WHERE orderItemID = _orderItemID;
END //
DELIMITER ;


-- =========================
-- DELETE PROCEDURES
-- =========================

DROP PROCEDURE IF EXISTS sp_delete_customer;
DELIMITER //
CREATE PROCEDURE sp_delete_customer(IN _customerID INT)
BEGIN
    DECLARE v_order_count INT DEFAULT 0;

    SELECT COUNT(*) INTO v_order_count
    FROM Orders
    WHERE customerID = _customerID;

    IF v_order_count > 0 THEN
        SELECT 'Error: Cannot delete customer with existing orders.' AS Result;
    ELSE
        DELETE FROM Customers WHERE customerID = _customerID;

        IF ROW_COUNT() = 0 THEN
            SELECT 'Error: Customer not found.' AS Result;
        ELSE
            SELECT 'Customer deleted successfully.' AS Result;
        END IF;
    END IF;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_customer_and_orders;
DELIMITER //
CREATE PROCEDURE sp_delete_customer_and_orders(IN _customerID INT)
BEGIN
    START TRANSACTION;

    DELETE FROM OrderProducts
    WHERE orderID IN (SELECT orderID FROM Orders WHERE customerID = _customerID);

    DELETE FROM Orders WHERE customerID = _customerID;
    DELETE FROM Customers WHERE customerID = _customerID;

    COMMIT;

    SELECT 'Customer and orders deleted successfully.' AS Result;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_delete_order_item;
DELIMITER //
CREATE PROCEDURE sp_delete_order_item(IN _orderItemID INT)
BEGIN
    DELETE FROM OrderProducts WHERE orderItemID = _orderItemID;

    IF ROW_COUNT() = 0 THEN
        SELECT 'Error: Order item not found.' AS Result;
    ELSE
        SELECT 'Order item deleted successfully.' AS Result;
    END IF;
END //
DELIMITER ;


-- =========================
-- TRIGGERS
-- =========================
-- Citation for the following triggers:
-- Date: 03/16/2026
-- Adapted from MySQL trigger documentation with AI assistance.
-- Triggers were written but not firing after re-running the DDL because
-- re-running DDL drops all tables (and their associated triggers). The pl.sql
-- file must be re-run after every DDL execution to reinstall them.
-- Use SHOW TRIGGERS; to confirm installation.
-- Source URL: https://dev.mysql.com/doc/refman/8.0/en/create-trigger.html
-- AI Tool Used: Claude (Anthropic)
-- Prompt Summary: "I added triggers to my pl.sql to auto-decrement inventory
-- when an order product is inserted, but inserting a new order product has no
-- effect on the quantity in ProductInventories. I re-ran my DDL and the triggers
-- still do not fire. How do I verify triggers are installed and what would
-- cause them to be missing?"
-- Trigger responsibilities:
--   1. OrderProducts.priceAtSale    — captured from Products.currentPrice on sale
--   2. ProductInventories.quantity  — decrements on sale, increments on cancellation
--   3. Customers.points             — deducted when points are used on an order
--   4. Customers.lastPurchase       — updated when an order is placed

DROP TRIGGER IF EXISTS tr_orders_after_insert;
DROP TRIGGER IF EXISTS tr_order_products_before_insert;
DROP TRIGGER IF EXISTS tr_order_products_after_insert;
DROP TRIGGER IF EXISTS tr_order_products_after_delete;
DROP TRIGGER IF EXISTS tr_order_products_after_update;

-- ── Orders: INSERT ─────────────────────────────────────────────────────────
-- An order was placed → deduct any points the customer chose to redeem,
-- and stamp their lastPurchase timestamp.
DELIMITER //
CREATE TRIGGER tr_orders_after_insert
AFTER INSERT ON Orders
FOR EACH ROW
BEGIN
    IF NEW.customerID IS NOT NULL THEN
        UPDATE Customers
        SET points       = GREATEST(0, points - NEW.pointsUsed),
            lastPurchase = CURRENT_TIMESTAMP
        WHERE customerID = NEW.customerID;
    END IF;
END //
DELIMITER ;

-- ── OrderProducts: BEFORE INSERT ───────────────────────────────────────────
-- Capture the product's current price at the moment of sale so order history
-- is never affected by future price changes.
DELIMITER //
CREATE TRIGGER tr_order_products_before_insert
BEFORE INSERT ON OrderProducts
FOR EACH ROW
BEGIN
    SET NEW.priceAtSale = (
        SELECT currentPrice
        FROM Products
        WHERE productID = NEW.productID
    );
END //
DELIMITER ;

-- ── OrderProducts: AFTER INSERT ────────────────────────────────────────────
-- A sale was recorded → deduct from the inventory location that filled the order.
DELIMITER //
CREATE TRIGGER tr_order_products_after_insert
AFTER INSERT ON OrderProducts
FOR EACH ROW
BEGIN
    UPDATE ProductInventories
    SET quantity = GREATEST(0, quantity - NEW.quantity)
    WHERE productID = NEW.productID
      AND inventoryID = NEW.inventoryID;
END //
DELIMITER ;

-- ── OrderProducts: DELETE ──────────────────────────────────────────────────
-- An order item was removed (cancellation / correction) → return stock.
DELIMITER //
CREATE TRIGGER tr_order_products_after_delete
AFTER DELETE ON OrderProducts
FOR EACH ROW
BEGIN
    UPDATE ProductInventories
    SET quantity = quantity + OLD.quantity
    WHERE productID = OLD.productID
      AND inventoryID = OLD.inventoryID;
END //
DELIMITER ;

-- ── OrderProducts: UPDATE ──────────────────────────────────────────────────
-- Quantity, product, or inventory location changed on an existing order item.
-- Strategy: restore the old allocation first, then apply the new one.
DELIMITER //
CREATE TRIGGER tr_order_products_after_update
AFTER UPDATE ON OrderProducts
FOR EACH ROW
BEGIN
    -- Step 1: restore the old quantity to the old location
    UPDATE ProductInventories
    SET quantity = quantity + OLD.quantity
    WHERE productID = OLD.productID
      AND inventoryID = OLD.inventoryID;

    -- Step 2: deduct the new quantity from the new location
    UPDATE ProductInventories
    SET quantity = GREATEST(0, quantity - NEW.quantity)
    WHERE productID = NEW.productID
      AND inventoryID = NEW.inventoryID;
END //
DELIMITER ;
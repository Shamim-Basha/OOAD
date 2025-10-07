-- =====================================================
-- Lanka Hardware Store - Database Implementation
-- SE2012 Assignment - Complete Database Setup
-- =====================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS hardware_store;
USE hardware_store;

-- =====================================================
-- 1. CREATE TABLES WITH CONSTRAINTS
-- =====================================================

-- USER Table
CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    postal_code VARCHAR(10),
    role ENUM('CUSTOMER', 'ADMIN', 'MANAGER') NOT NULL DEFAULT 'CUSTOMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_city (city),
    INDEX idx_role (role)
);

-- PRODUCT Table
CREATE TABLE product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    description VARCHAR(100) NOT NULL,
    price INT NOT NULL CHECK (price >= 0),
    image MEDIUMBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_category (category),
    INDEX idx_name (name),
    INDEX idx_sub_category (sub_category)
);

-- TOOLS Table
CREATE TABLE tools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL CHECK (daily_rate >= 0),
    category VARCHAR(50) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INT NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
    description VARCHAR(2000),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_category (category),
    INDEX idx_available (available),
    INDEX idx_name (name)
);

-- CART Table
CREATE TABLE cart (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id)
);

-- CART_ITEM Table
CREATE TABLE cart_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) CHECK (unit_price >= 0),
    subtotal DECIMAL(10,2) CHECK (subtotal >= 0),
    rental BOOLEAN DEFAULT FALSE,
    rental_start DATE,
    rental_end DATE,
    tool_id BIGINT,
    tool_name VARCHAR(255),
    tool_description VARCHAR(2000),
    tool_category VARCHAR(50),
    tool_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE SET NULL,
    
    -- Check Constraints
    CONSTRAINT chk_rental_dates CHECK (rental_end IS NULL OR rental_start IS NULL OR rental_end >= rental_start),
    
    -- Indexes
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_id (product_id),
    INDEX idx_rental (rental)
);

-- RENTALS Table
CREATE TABLE rentals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
    status ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_rental_dates CHECK (end_date >= start_date),
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_tool_id (tool_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status)
);

-- =====================================================
-- 2. SAMPLE DATA POPULATION
-- =====================================================

-- Insert Sample Users
INSERT INTO user (username, email, password, first_name, last_name, phone, address, city, postal_code, role) VALUES
('john_doe', 'john@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5DCi', 'John', 'Doe', '0771234567', '123 Main Street, Colombo 03', 'Colombo', '00300', 'CUSTOMER'),
('jane_smith', 'jane@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5DCi', 'Jane', 'Smith', '0772345678', '456 Oak Avenue, Kandy', 'Kandy', '20000', 'CUSTOMER'),
('mike_wilson', 'mike@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5DCi', 'Mike', 'Wilson', '0773456789', '789 Pine Road, Galle', 'Galle', '80000', 'CUSTOMER'),
('sarah_jones', 'sarah@email.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5DCi', 'Sarah', 'Jones', '0774567890', '321 Elm Street, Negombo', 'Negombo', '11500', 'CUSTOMER'),
('admin_user', 'admin@hardware.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5DCi', 'Admin', 'User', '0773456789', '789 Admin Street, Colombo 01', 'Colombo', '00100', 'ADMIN'),
('manager_user', 'manager@hardware.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5DCi', 'Manager', 'User', '0774567890', '321 Manager Road, Colombo 02', 'Colombo', '00200', 'MANAGER');

-- Insert Sample Products
INSERT INTO product (name, quantity, category, sub_category, description, price) VALUES
('Cement 50kg', 100, 'Construction', 'Cement', 'High quality cement for construction projects', 2500),
('Steel Rods 12mm', 50, 'Construction', 'Steel', 'Reinforcement steel rods for concrete work', 1500),
('Paint Brush Set', 200, 'Tools', 'Brushes', 'Professional paint brush set with various sizes', 800),
('Screwdriver Set', 150, 'Tools', 'Hand Tools', 'Complete screwdriver set with multiple bits', 1200),
('Nails 2 inch', 500, 'Hardware', 'Fasteners', 'Galvanized nails for construction', 300),
('Hammer 16oz', 80, 'Tools', 'Hand Tools', 'Professional claw hammer', 1500),
('Measuring Tape 5m', 120, 'Tools', 'Measuring', 'Steel measuring tape', 600),
('Safety Helmet', 60, 'Safety', 'Protection', 'Construction safety helmet', 800),
('Work Gloves', 200, 'Safety', 'Protection', 'Heavy duty work gloves', 400),
('Sand Paper Set', 150, 'Tools', 'Abrasives', 'Various grit sandpaper sheets', 500);

-- Insert Sample Tools
INSERT INTO tools (name, daily_rate, category, available, stock_quantity, description, image_url) VALUES
('Electric Drill', 500.00, 'Power Tools', TRUE, 5, 'Heavy duty electric drill with multiple bits and accessories', '/images/drill.jpg'),
('Cement Mixer', 800.00, 'Construction', TRUE, 3, 'Portable cement mixer for small to medium projects', '/images/cement-mixer.jpg'),
('Excavator', 5000.00, 'Heavy Machinery', TRUE, 2, 'Mini excavator for construction and landscaping work', '/images/excavator.jpg'),
('Foldable Ladders', 300.00, 'Safety', TRUE, 8, 'Aluminum foldable ladders with safety features', '/images/ladders.jpg'),
('Scaffolding Set', 1200.00, 'Construction', TRUE, 4, 'Complete scaffolding system for construction work', '/images/scaffolding.png'),
('Wacker Machine', 600.00, 'Construction', TRUE, 3, 'Compaction wacker machine for soil compaction', '/images/wacker.jpg'),
('Angle Grinder', 400.00, 'Power Tools', TRUE, 6, 'Electric angle grinder for cutting and grinding', '/images/grinder.jpg'),
('Circular Saw', 450.00, 'Power Tools', TRUE, 4, 'Professional circular saw for wood cutting', '/images/saw.jpg'),
('Pressure Washer', 700.00, 'Cleaning', TRUE, 3, 'High pressure washer for cleaning surfaces', '/images/washer.jpg'),
('Generator 5kW', 1000.00, 'Power', TRUE, 2, 'Portable generator for power supply', '/images/generator.jpg');

-- Insert Sample Carts
INSERT INTO cart (user_id, created_at) VALUES
(1, '2025-01-15 10:30:00'),
(2, '2025-01-16 14:20:00'),
(3, '2025-01-17 09:15:00'),
(4, '2025-01-18 16:45:00');

-- Insert Sample Cart Items
INSERT INTO cart_item (cart_id, product_id, quantity, unit_price, subtotal, rental, tool_id, tool_name, tool_category) VALUES
(1, 1, 2, 25.00, 50.00, FALSE, NULL, NULL, NULL),
(1, 3, 1, 8.00, 8.00, FALSE, NULL, NULL, NULL),
(2, 2, 1, 15.00, 15.00, FALSE, NULL, NULL, NULL),
(2, NULL, 1, 500.00, 500.00, TRUE, 1, 'Electric Drill', 'Power Tools'),
(3, 4, 1, 12.00, 12.00, FALSE, NULL, NULL, NULL),
(3, NULL, 1, 300.00, 300.00, TRUE, 4, 'Foldable Ladders', 'Safety'),
(4, 6, 2, 15.00, 30.00, FALSE, NULL, NULL, NULL);

-- Insert Sample Rentals
INSERT INTO rentals (user_id, tool_id, start_date, end_date, quantity, total_cost, status) VALUES
(1, 1, '2025-01-20', '2025-01-22', 1, 1000.00, 'COMPLETED'),
(2, 3, '2025-01-25', '2025-01-27', 1, 10000.00, 'COMPLETED'),
(1, 5, '2025-02-01', '2025-02-03', 1, 2400.00, 'COMPLETED'),
(3, 2, '2025-02-05', '2025-02-07', 1, 1600.00, 'ACTIVE'),
(4, 6, '2025-02-10', '2025-02-12', 1, 1200.00, 'PENDING'),
(2, 7, '2025-02-15', '2025-02-17', 1, 800.00, 'PENDING'),
(1, 8, '2025-02-20', '2025-02-22', 1, 900.00, 'PENDING');

-- =====================================================
-- 3. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for Active Rentals
CREATE VIEW active_rentals AS
SELECT 
    r.id,
    u.first_name,
    u.last_name,
    u.email,
    t.name as tool_name,
    t.category,
    r.start_date,
    r.end_date,
    r.quantity,
    r.total_cost,
    r.status
FROM rentals r
JOIN user u ON r.user_id = u.id
JOIN tools t ON r.tool_id = t.id
WHERE r.status IN ('ACTIVE', 'PENDING');

-- View for Product Sales Summary
CREATE VIEW product_sales_summary AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.sub_category,
    p.quantity as current_stock,
    p.price,
    COALESCE(SUM(ci.quantity), 0) as total_sold,
    COALESCE(SUM(ci.subtotal), 0) as total_revenue
FROM product p
LEFT JOIN cart_item ci ON p.id = ci.product_id AND ci.rental = FALSE
GROUP BY p.id, p.name, p.category, p.sub_category, p.quantity, p.price;

-- View for Tool Rental Summary
CREATE VIEW tool_rental_summary AS
SELECT 
    t.id,
    t.name,
    t.category,
    t.daily_rate,
    t.stock_quantity,
    t.available,
    COUNT(r.id) as total_rentals,
    COALESCE(SUM(r.total_cost), 0) as total_revenue,
    COALESCE(AVG(DATEDIFF(r.end_date, r.start_date)), 0) as avg_rental_days
FROM tools t
LEFT JOIN rentals r ON t.id = r.tool_id
GROUP BY t.id, t.name, t.category, t.daily_rate, t.stock_quantity, t.available;

-- =====================================================
-- 4. CREATE STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to Calculate Rental Cost
CREATE PROCEDURE CalculateRentalCost(
    IN p_tool_id BIGINT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_quantity INT,
    OUT p_total_cost DECIMAL(10,2)
)
BEGIN
    DECLARE v_daily_rate DECIMAL(10,2);
    DECLARE v_days INT;
    
    -- Get tool daily rate
    SELECT daily_rate INTO v_daily_rate
    FROM tools
    WHERE id = p_tool_id;
    
    -- Calculate days
    SET v_days = DATEDIFF(p_end_date, p_start_date);
    
    -- Calculate total cost
    SET p_total_cost = v_daily_rate * v_days * p_quantity;
END //

-- Procedure to Check Tool Availability
CREATE PROCEDURE CheckToolAvailability(
    IN p_tool_id BIGINT,
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_quantity INT,
    OUT p_available BOOLEAN,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_stock_quantity INT;
    DECLARE v_rented_quantity INT;
    
    -- Get tool stock quantity
    SELECT stock_quantity INTO v_stock_quantity
    FROM tools
    WHERE id = p_tool_id AND available = TRUE;
    
    -- Check if tool exists and is available
    IF v_stock_quantity IS NULL THEN
        SET p_available = FALSE;
        SET p_message = 'Tool not found or not available';
    ELSE
        -- Calculate already rented quantity for the period
        SELECT COALESCE(SUM(quantity), 0) INTO v_rented_quantity
        FROM rentals
        WHERE tool_id = p_tool_id
        AND status IN ('ACTIVE', 'PENDING')
        AND ((start_date <= p_end_date AND end_date >= p_start_date));
        
        -- Check availability
        IF (v_stock_quantity - v_rented_quantity) >= p_quantity THEN
            SET p_available = TRUE;
            SET p_message = 'Tool is available';
        ELSE
            SET p_available = FALSE;
            SET p_message = CONCAT('Insufficient stock. Available: ', (v_stock_quantity - v_rented_quantity), ', Requested: ', p_quantity);
        END IF;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

DELIMITER //

-- Trigger to update rental status based on dates
CREATE TRIGGER update_rental_status
BEFORE UPDATE ON rentals
FOR EACH ROW
BEGIN
    DECLARE current_date DATE;
    SET current_date = CURDATE();
    
    -- Update status based on dates
    IF NEW.start_date > current_date THEN
        SET NEW.status = 'PENDING';
    ELSEIF NEW.start_date <= current_date AND NEW.end_date >= current_date THEN
        SET NEW.status = 'ACTIVE';
    ELSEIF NEW.end_date < current_date THEN
        SET NEW.status = 'COMPLETED';
    END IF;
END //

-- Trigger to automatically calculate cart item subtotal
CREATE TRIGGER calculate_cart_item_subtotal
BEFORE INSERT ON cart_item
FOR EACH ROW
BEGIN
    IF NEW.unit_price IS NOT NULL AND NEW.quantity IS NOT NULL THEN
        SET NEW.subtotal = NEW.unit_price * NEW.quantity;
    END IF;
END //

CREATE TRIGGER update_cart_item_subtotal
BEFORE UPDATE ON cart_item
FOR EACH ROW
BEGIN
    IF NEW.unit_price IS NOT NULL AND NEW.quantity IS NOT NULL THEN
        SET NEW.subtotal = NEW.unit_price * NEW.quantity;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional indexes for better query performance
CREATE INDEX idx_rentals_status_dates ON rentals(status, start_date, end_date);
CREATE INDEX idx_cart_item_rental ON cart_item(rental, created_at);
CREATE INDEX idx_product_category_price ON product(category, price);
CREATE INDEX idx_tools_category_rate ON tools(category, daily_rate);
CREATE INDEX idx_user_city_role ON user(city, role);

-- =====================================================
-- 7. GRANT PERMISSIONS (Optional - for production)
-- =====================================================

-- Create application user (uncomment for production)
-- CREATE USER 'hardware_app'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON hardware_store.* TO 'hardware_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- DATABASE SETUP COMPLETE
-- =====================================================

SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_users FROM user;
SELECT COUNT(*) as total_products FROM product;
SELECT COUNT(*) as total_tools FROM tools;
SELECT COUNT(*) as total_rentals FROM rentals;

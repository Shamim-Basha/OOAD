# Database Module - Lanka Hardware Store
## SE2012 Assignment - Database Design and Implementation

---

## 1. Organization Overview

### **Lanka Hardware Store**
Lanka Hardware Store is a comprehensive hardware retail and rental business that serves both individual customers and commercial clients. The organization operates as a modern e-commerce platform with both online and physical store presence.

### **Business Operations:**
- **Product Sales**: Hardware items, construction materials, tools, and accessories
- **Tool Rental Services**: Professional-grade tools and equipment for short-term rental
- **Customer Management**: Individual customers and commercial accounts
- **Inventory Management**: Real-time stock tracking for both products and rental tools
- **Order Processing**: Online orders with cart functionality and rental bookings

### **Key Stakeholders:**
- **Customers**: Individual consumers and commercial clients
- **Administrators**: Store managers and system administrators
- **Managers**: Department managers and rental coordinators

---

## 2. Database Requirements

### **Functional Requirements:**

#### **User Management:**
- Store customer information (personal details, contact information)
- Manage user roles (Customer, Admin, Manager)
- Handle user authentication and authorization
- Track user activity and preferences

#### **Product Management:**
- Maintain product catalog with categories and subcategories
- Track inventory levels and stock quantities
- Manage product pricing and descriptions
- Store product images and specifications

#### **Tool Rental Management:**
- Manage rental tool inventory with availability status
- Track rental periods and pricing (daily rates)
- Handle rental bookings and scheduling
- Monitor tool condition and maintenance

#### **Shopping Cart & Orders:**
- Support shopping cart functionality for products
- Handle both product purchases and tool rentals
- Track order history and customer preferences
- Manage cart items with quantities and pricing

#### **Rental Operations:**
- Process rental requests and bookings
- Calculate rental costs based on duration
- Track rental history and customer patterns
- Manage tool availability and scheduling conflicts

### **Non-Functional Requirements:**
- **Performance**: Support concurrent users and fast query responses
- **Scalability**: Handle growing product catalog and customer base
- **Data Integrity**: Ensure consistent and accurate data
- **Security**: Protect customer information and system access
- **Availability**: 24/7 system availability for online operations

---

## 3. Necessary Queries

### **Customer Management Queries:**
1. **User Registration and Login**
   - Register new customers
   - Authenticate user login
   - Retrieve user profile information

2. **Customer Analytics**
   - Find customers by location/city
   - Get customer rental history
   - Identify frequent customers

### **Product Management Queries:**
3. **Product Catalog**
   - Browse products by category
   - Search products by name/description
   - Get product details and availability

4. **Inventory Management**
   - Check stock levels for products
   - Update inventory after sales
   - Generate low-stock alerts

### **Tool Rental Queries:**
5. **Tool Availability**
   - Check tool availability for specific dates
   - Find available tools by category
   - Get tool rental rates and details

6. **Rental Management**
   - Create new rental bookings
   - Update rental dates and details
   - Calculate rental costs
   - Track rental history

### **Business Intelligence Queries:**
7. **Sales Analytics**
   - Daily/monthly sales reports
   - Top-selling products
   - Revenue by category

8. **Rental Analytics**
   - Most popular rental tools
   - Rental revenue by period
   - Tool utilization rates

9. **Customer Analytics**
   - Customer purchase patterns
   - Rental frequency analysis
   - Customer lifetime value

---

## 4. ER/EER Model Design

### **Entities and Attributes:**

#### **USER Entity:**
- **Primary Key**: user_id (Long)
- **Attributes**: 
  - username (String, Unique, Not Null)
  - email (String, Unique, Not Null)
  - password (String, Not Null)
  - first_name (String, Not Null)
  - last_name (String, Not Null)
  - phone (String)
  - address (TEXT)
  - city (String)
  - postal_code (String)
  - role (Enum: CUSTOMER, ADMIN, MANAGER)

#### **PRODUCT Entity:**
- **Primary Key**: product_id (Long)
- **Attributes**:
  - name (String, Unique, Not Null)
  - quantity (Integer, Not Null)
  - category (String, Not Null)
  - sub_category (String, Not Null)
  - description (String, Not Null)
  - price (Integer, Not Null)
  - image (BLOB)

#### **TOOL Entity:**
- **Primary Key**: tool_id (Long)
- **Attributes**:
  - name (String, Unique, Not Null)
  - daily_rate (Decimal, Not Null)
  - category (String, Not Null)
  - available (Boolean, Not Null)
  - stock_quantity (Integer, Not Null)
  - description (String)
  - image_url (String)

#### **CART Entity:**
- **Primary Key**: cart_id (Long)
- **Attributes**:
  - created_at (DateTime)
- **Foreign Key**: user_id (One-to-One with USER)

#### **CART_ITEM Entity:**
- **Primary Key**: cart_item_id (Long)
- **Attributes**:
  - quantity (Integer)
  - unit_price (Decimal)
  - subtotal (Decimal)
  - rental (Boolean)
  - rental_start (Date)
  - rental_end (Date)
  - tool_id (Long)
  - tool_name (String)
  - tool_description (String)
  - tool_category (String)
  - tool_image_url (String)
- **Foreign Keys**: 
  - cart_id (Many-to-One with CART)
  - product_id (Many-to-One with PRODUCT)

#### **RENTAL Entity:**
- **Primary Key**: rental_id (Long)
- **Attributes**:
  - start_date (Date, Not Null)
  - end_date (Date, Not Null)
  - quantity (Integer, Not Null)
  - total_cost (Decimal, Not Null)
- **Foreign Keys**:
  - user_id (Many-to-One with USER)
  - tool_id (Many-to-One with TOOL)

### **Relationships:**
1. **USER ↔ CART**: One-to-One (Each user has one cart)
2. **CART ↔ CART_ITEM**: One-to-Many (Cart contains multiple items)
3. **PRODUCT ↔ CART_ITEM**: One-to-Many (Product can be in multiple cart items)
4. **USER ↔ RENTAL**: One-to-Many (User can have multiple rentals)
5. **TOOL ↔ RENTAL**: One-to-Many (Tool can be rented multiple times)

---

## 5. Relational Database Schema Mapping

### **Mapping Criteria:**
1. **Entity to Table**: Each entity becomes a table
2. **Attribute to Column**: Each attribute becomes a column
3. **Primary Key**: Each entity's primary key becomes the table's primary key
4. **Foreign Key**: Relationship foreign keys become foreign key constraints
5. **Data Types**: Java types mapped to appropriate SQL data types
6. **Constraints**: Not Null, Unique, and Check constraints applied

### **Relational Schema:**

```sql
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
    role ENUM('CUSTOMER', 'ADMIN', 'MANAGER') NOT NULL DEFAULT 'CUSTOMER'
);

-- PRODUCT Table
CREATE TABLE product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    quantity INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    description VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    image MEDIUMBLOB
);

-- TOOL Table
CREATE TABLE tools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    available BOOLEAN NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 1,
    description VARCHAR(2000),
    image_url VARCHAR(500)
);

-- CART Table
CREATE TABLE cart (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- CART_ITEM Table
CREATE TABLE cart_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    rental BOOLEAN DEFAULT FALSE,
    rental_start DATE,
    rental_end DATE,
    tool_id BIGINT,
    tool_name VARCHAR(255),
    tool_description VARCHAR(2000),
    tool_category VARCHAR(50),
    tool_image_url VARCHAR(500),
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE SET NULL
);

-- RENTAL Table
CREATE TABLE rentals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_cost DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE
);
```

---

## 6. Data Dictionary

### **USER Table**
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | User login username |
| email | VARCHAR(100) | UNIQUE, NOT NULL | User email address |
| password | VARCHAR(255) | NOT NULL | Encrypted password |
| first_name | VARCHAR(50) | NOT NULL | User's first name |
| last_name | VARCHAR(50) | NOT NULL | User's last name |
| phone | VARCHAR(20) | NULL | Contact phone number |
| address | TEXT | NULL | User's address |
| city | VARCHAR(50) | NULL | User's city |
| postal_code | VARCHAR(10) | NULL | Postal/ZIP code |
| role | ENUM | NOT NULL, DEFAULT 'CUSTOMER' | User role (CUSTOMER/ADMIN/MANAGER) |

### **PRODUCT Table**
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique product identifier |
| name | VARCHAR(50) | UNIQUE, NOT NULL | Product name |
| quantity | INT | NOT NULL | Available stock quantity |
| category | VARCHAR(50) | NOT NULL | Product category |
| sub_category | VARCHAR(50) | NOT NULL | Product subcategory |
| description | VARCHAR(100) | NOT NULL | Product description |
| price | INT | NOT NULL | Product price in cents |
| image | MEDIUMBLOB | NULL | Product image data |

### **TOOLS Table**
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique tool identifier |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Tool name |
| daily_rate | DECIMAL(10,2) | NOT NULL | Daily rental rate |
| category | VARCHAR(50) | NOT NULL | Tool category |
| available | BOOLEAN | NOT NULL | Availability status |
| stock_quantity | INT | NOT NULL, DEFAULT 1 | Available quantity |
| description | VARCHAR(2000) | NULL | Tool description |
| image_url | VARCHAR(500) | NULL | Tool image URL |

### **CART Table**
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique cart identifier |
| user_id | BIGINT | NOT NULL, UNIQUE, FK | Reference to user |
| created_at | DATETIME | NULL | Cart creation timestamp |

### **CART_ITEM Table**
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique cart item identifier |
| cart_id | BIGINT | NOT NULL, FK | Reference to cart |
| product_id | BIGINT | NULL, FK | Reference to product |
| quantity | INT | NOT NULL | Item quantity |
| unit_price | DECIMAL(10,2) | NULL | Unit price |
| subtotal | DECIMAL(10,2) | NULL | Line total |
| rental | BOOLEAN | DEFAULT FALSE | Is rental item |
| rental_start | DATE | NULL | Rental start date |
| rental_end | DATE | NULL | Rental end date |
| tool_id | BIGINT | NULL | Tool identifier for rentals |
| tool_name | VARCHAR(255) | NULL | Tool name for rentals |
| tool_description | VARCHAR(2000) | NULL | Tool description |
| tool_category | VARCHAR(50) | NULL | Tool category |
| tool_image_url | VARCHAR(500) | NULL | Tool image URL |

### **RENTALS Table**
| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique rental identifier |
| user_id | BIGINT | NOT NULL, FK | Reference to user |
| tool_id | BIGINT | NOT NULL, FK | Reference to tool |
| start_date | DATE | NOT NULL | Rental start date |
| end_date | DATE | NOT NULL | Rental end date |
| quantity | INT | NOT NULL, DEFAULT 1 | Rental quantity |
| total_cost | DECIMAL(10,2) | NOT NULL | Total rental cost |

---

## 7. Database Implementation

### **MySQL Database Creation Script:**

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS hardware_store;
USE hardware_store;

-- Create Tables with Constraints
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
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_city (city)
);

CREATE TABLE product (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    category VARCHAR(50) NOT NULL,
    sub_category VARCHAR(50) NOT NULL,
    description VARCHAR(100) NOT NULL,
    price INT NOT NULL CHECK (price >= 0),
    image MEDIUMBLOB,
    INDEX idx_category (category),
    INDEX idx_name (name)
);

CREATE TABLE tools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL CHECK (daily_rate >= 0),
    category VARCHAR(50) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INT NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
    description VARCHAR(2000),
    image_url VARCHAR(500),
    INDEX idx_category (category),
    INDEX idx_available (available),
    INDEX idx_name (name)
);

CREATE TABLE cart (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

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
    FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE SET NULL,
    INDEX idx_cart_id (cart_id),
    INDEX idx_product_id (product_id),
    CONSTRAINT chk_rental_dates CHECK (rental_end IS NULL OR rental_start IS NULL OR rental_end >= rental_start)
);

CREATE TABLE rentals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    total_cost DECIMAL(10,2) NOT NULL CHECK (total_cost >= 0),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tools(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_tool_id (tool_id),
    INDEX idx_dates (start_date, end_date),
    CONSTRAINT chk_rental_dates CHECK (end_date >= start_date)
);
```

---

## 8. Sample Data Population

```sql
-- Insert Sample Users
INSERT INTO user (username, email, password, first_name, last_name, phone, address, city, postal_code, role) VALUES
('john_doe', 'john@email.com', 'hashed_password_1', 'John', 'Doe', '0771234567', '123 Main St', 'Colombo', '00100', 'CUSTOMER'),
('jane_smith', 'jane@email.com', 'hashed_password_2', 'Jane', 'Smith', '0772345678', '456 Oak Ave', 'Kandy', '20000', 'CUSTOMER'),
('admin_user', 'admin@hardware.com', 'hashed_admin_password', 'Admin', 'User', '0773456789', '789 Admin St', 'Colombo', '00200', 'ADMIN'),
('manager_user', 'manager@hardware.com', 'hashed_manager_password', 'Manager', 'User', '0774567890', '321 Manager Rd', 'Colombo', '00300', 'MANAGER');

-- Insert Sample Products
INSERT INTO product (name, quantity, category, sub_category, description, price) VALUES
('Cement 50kg', 100, 'Construction', 'Cement', 'High quality cement for construction', 2500),
('Steel Rods 12mm', 50, 'Construction', 'Steel', 'Reinforcement steel rods', 1500),
('Paint Brush Set', 200, 'Tools', 'Brushes', 'Professional paint brush set', 800),
('Screwdriver Set', 150, 'Tools', 'Hand Tools', 'Complete screwdriver set', 1200),
('Nails 2 inch', 500, 'Hardware', 'Fasteners', 'Galvanized nails', 300);

-- Insert Sample Tools
INSERT INTO tools (name, daily_rate, category, available, stock_quantity, description, image_url) VALUES
('Electric Drill', 500.00, 'Power Tools', TRUE, 5, 'Heavy duty electric drill with multiple bits', '/images/drill.jpg'),
('Cement Mixer', 800.00, 'Construction', TRUE, 3, 'Portable cement mixer for small projects', '/images/cement-mixer.jpg'),
('Excavator', 5000.00, 'Heavy Machinery', TRUE, 2, 'Mini excavator for construction work', '/images/excavator.jpg'),
('Foldable Ladders', 300.00, 'Safety', TRUE, 8, 'Aluminum foldable ladders', '/images/ladders.jpg'),
('Scaffolding Set', 1200.00, 'Construction', TRUE, 4, 'Complete scaffolding system', '/images/scaffolding.png'),
('Wacker Machine', 600.00, 'Construction', TRUE, 3, 'Compaction wacker machine', '/images/wacker.jpg');

-- Insert Sample Carts
INSERT INTO cart (user_id, created_at) VALUES
(1, '2025-01-15 10:30:00'),
(2, '2025-01-16 14:20:00');

-- Insert Sample Cart Items
INSERT INTO cart_item (cart_id, product_id, quantity, unit_price, subtotal, rental, tool_id, tool_name, tool_category) VALUES
(1, 1, 2, 25.00, 50.00, FALSE, NULL, NULL, NULL),
(1, 3, 1, 8.00, 8.00, FALSE, NULL, NULL, NULL),
(2, NULL, 1, 500.00, 500.00, TRUE, 1, 'Electric Drill', 'Power Tools');

-- Insert Sample Rentals
INSERT INTO rentals (user_id, tool_id, start_date, end_date, quantity, total_cost) VALUES
(1, 1, '2025-01-20', '2025-01-22', 1, 1000.00),
(2, 3, '2025-01-25', '2025-01-27', 1, 10000.00),
(1, 5, '2025-02-01', '2025-02-03', 1, 2400.00);
```

---

## 9. SQL Queries Implementation

### **Customer Management Queries:**

```sql
-- 1. User Registration
INSERT INTO user (username, email, password, first_name, last_name, phone, address, city, postal_code, role) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CUSTOMER');

-- 2. User Login Authentication
SELECT id, username, email, first_name, last_name, role 
FROM user 
WHERE username = ? AND password = ?;

-- 3. Get User Profile
SELECT * FROM user WHERE id = ?;

-- 4. Find Customers by City
SELECT first_name, last_name, email, phone 
FROM user 
WHERE city = ? AND role = 'CUSTOMER';

-- 5. Customer Rental History
SELECT r.id, t.name as tool_name, r.start_date, r.end_date, r.total_cost
FROM rentals r
JOIN tools t ON r.tool_id = t.id
WHERE r.user_id = ?
ORDER BY r.start_date DESC;
```

### **Product Management Queries:**

```sql
-- 6. Browse Products by Category
SELECT * FROM product 
WHERE category = ? 
ORDER BY name;

-- 7. Search Products
SELECT * FROM product 
WHERE name LIKE ? OR description LIKE ?;

-- 8. Check Product Stock
SELECT name, quantity, price 
FROM product 
WHERE id = ?;

-- 9. Update Product Stock
UPDATE product 
SET quantity = quantity - ? 
WHERE id = ? AND quantity >= ?;

-- 10. Low Stock Alert
SELECT name, quantity, category 
FROM product 
WHERE quantity < 10;
```

### **Tool Rental Queries:**

```sql
-- 11. Check Tool Availability for Dates
SELECT t.*, 
       CASE WHEN r.id IS NULL THEN 'Available' ELSE 'Booked' END as status
FROM tools t
LEFT JOIN rentals r ON t.id = r.tool_id 
    AND (r.start_date <= ? AND r.end_date >= ?)
WHERE t.available = TRUE AND t.stock_quantity > 0;

-- 12. Available Tools by Category
SELECT * FROM tools 
WHERE category = ? AND available = TRUE AND stock_quantity > 0;

-- 13. Create Rental Booking
INSERT INTO rentals (user_id, tool_id, start_date, end_date, quantity, total_cost)
VALUES (?, ?, ?, ?, ?, ?);

-- 14. Update Rental
UPDATE rentals 
SET start_date = ?, end_date = ?, total_cost = ?
WHERE id = ?;

-- 15. Calculate Rental Cost
SELECT 
    t.daily_rate,
    DATEDIFF(?, ?) as days,
    t.daily_rate * DATEDIFF(?, ?) * ? as total_cost
FROM tools t 
WHERE t.id = ?;
```

### **Business Intelligence Queries:**

```sql
-- 16. Daily Sales Report
SELECT 
    DATE(ci.created_at) as sale_date,
    COUNT(*) as total_orders,
    SUM(ci.subtotal) as total_revenue
FROM cart_item ci
JOIN cart c ON ci.cart_id = c.id
WHERE ci.rental = FALSE
GROUP BY DATE(ci.created_at)
ORDER BY sale_date DESC;

-- 17. Top Selling Products
SELECT 
    p.name,
    p.category,
    SUM(ci.quantity) as total_sold,
    SUM(ci.subtotal) as total_revenue
FROM cart_item ci
JOIN product p ON ci.product_id = p.id
WHERE ci.rental = FALSE
GROUP BY p.id, p.name, p.category
ORDER BY total_sold DESC
LIMIT 10;

-- 18. Most Popular Rental Tools
SELECT 
    t.name,
    t.category,
    COUNT(r.id) as rental_count,
    SUM(r.total_cost) as total_revenue
FROM rentals r
JOIN tools t ON r.tool_id = t.id
GROUP BY t.id, t.name, t.category
ORDER BY rental_count DESC;

-- 19. Monthly Revenue Report
SELECT 
    YEAR(r.start_date) as year,
    MONTH(r.start_date) as month,
    COUNT(r.id) as rental_count,
    SUM(r.total_cost) as rental_revenue
FROM rentals r
GROUP BY YEAR(r.start_date), MONTH(r.start_date)
ORDER BY year DESC, month DESC;

-- 20. Customer Analytics - Frequent Customers
SELECT 
    u.first_name,
    u.last_name,
    u.email,
    COUNT(r.id) as rental_count,
    SUM(r.total_cost) as total_spent
FROM user u
JOIN rentals r ON u.id = r.user_id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.first_name, u.last_name, u.email
HAVING rental_count > 2
ORDER BY total_spent DESC;

-- 21. Tool Utilization Rate
SELECT 
    t.name,
    t.category,
    COUNT(r.id) as times_rented,
    SUM(DATEDIFF(r.end_date, r.start_date)) as total_days_rented,
    ROUND((COUNT(r.id) / 30.0) * 100, 2) as utilization_rate
FROM tools t
LEFT JOIN rentals r ON t.id = r.tool_id 
    AND r.start_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY t.id, t.name, t.category
ORDER BY utilization_rate DESC;

-- 22. Revenue by Category
SELECT 
    'Product' as type,
    p.category,
    SUM(ci.subtotal) as revenue
FROM cart_item ci
JOIN product p ON ci.product_id = p.id
WHERE ci.rental = FALSE
GROUP BY p.category

UNION ALL

SELECT 
    'Rental' as type,
    t.category,
    SUM(r.total_cost) as revenue
FROM rentals r
JOIN tools t ON r.tool_id = t.id
GROUP BY t.category

ORDER BY revenue DESC;
```

---

## 10. Database Constraints and Validation

### **Primary Key Constraints:**
- All tables have AUTO_INCREMENT primary keys
- Ensures unique identification of each record

### **Foreign Key Constraints:**
- CASCADE DELETE for user-related data
- SET NULL for optional product references
- Maintains referential integrity

### **Check Constraints:**
- Non-negative quantities and prices
- Valid date ranges for rentals
- Positive stock quantities

### **Unique Constraints:**
- Username and email uniqueness
- Product and tool name uniqueness
- One cart per user

### **Indexes:**
- Performance optimization on frequently queried columns
- Foreign key indexes for join operations
- Search optimization on names and categories

---

## 11. Conclusion

This database design provides a comprehensive foundation for the Lanka Hardware Store's operations, supporting both product sales and tool rental services. The design ensures data integrity, performance, and scalability while meeting all functional and non-functional requirements.

The implementation includes proper constraints, indexes, and sample data to demonstrate the system's capabilities. The SQL queries cover all essential business operations and provide valuable business intelligence insights.

**Key Features:**
- ✅ Complete user management with role-based access
- ✅ Comprehensive product and tool inventory management
- ✅ Shopping cart functionality for both products and rentals
- ✅ Advanced rental booking and scheduling system
- ✅ Business intelligence and analytics capabilities
- ✅ Data integrity and performance optimization
- ✅ Scalable design for future growth

This database module successfully addresses all requirements for the SE2012 assignment and provides a solid foundation for the hardware store's digital transformation.

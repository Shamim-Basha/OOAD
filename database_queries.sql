-- =====================================================
-- Lanka Hardware Store - SQL Queries
-- SE2012 Assignment - Business Intelligence Queries
-- =====================================================

USE hardware_store;

-- =====================================================
-- 1. CUSTOMER MANAGEMENT QUERIES
-- =====================================================

-- 1.1 User Registration
INSERT INTO user (username, email, password, first_name, last_name, phone, address, city, postal_code, role) 
VALUES ('new_user', 'newuser@email.com', '$2a$10$hashedpassword', 'New', 'User', '0779999999', '123 New St', 'Colombo', '00100', 'CUSTOMER');

-- 1.2 User Login Authentication
SELECT id, username, email, first_name, last_name, role 
FROM user 
WHERE username = 'john_doe' AND password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTV5DCi';

-- 1.3 Get User Profile
SELECT * FROM user WHERE id = 1;

-- 1.4 Find Customers by City
SELECT first_name, last_name, email, phone, address
FROM user 
WHERE city = 'Colombo' AND role = 'CUSTOMER'
ORDER BY first_name;

-- 1.5 Customer Rental History
SELECT 
    r.id as rental_id,
    t.name as tool_name,
    t.category,
    r.start_date,
    r.end_date,
    DATEDIFF(r.end_date, r.start_date) as rental_days,
    r.total_cost,
    r.status
FROM rentals r
JOIN tools t ON r.tool_id = t.id
WHERE r.user_id = 1
ORDER BY r.start_date DESC;

-- 1.6 Customer Purchase History
SELECT 
    ci.id as cart_item_id,
    p.name as product_name,
    p.category,
    ci.quantity,
    ci.unit_price,
    ci.subtotal,
    c.created_at as purchase_date
FROM cart_item ci
JOIN cart c ON ci.cart_id = c.id
JOIN product p ON ci.product_id = p.id
WHERE c.user_id = 1 AND ci.rental = FALSE
ORDER BY c.created_at DESC;

-- =====================================================
-- 2. PRODUCT MANAGEMENT QUERIES
-- =====================================================

-- 2.1 Browse Products by Category
SELECT id, name, quantity, price, description
FROM product 
WHERE category = 'Tools' 
ORDER BY name;

-- 2.2 Search Products by Name or Description
SELECT id, name, category, sub_category, quantity, price, description
FROM product 
WHERE name LIKE '%drill%' OR description LIKE '%drill%'
ORDER BY name;

-- 2.3 Check Product Stock
SELECT name, quantity, price, category
FROM product 
WHERE id = 1;

-- 2.4 Update Product Stock (after sale)
UPDATE product 
SET quantity = quantity - 2 
WHERE id = 1 AND quantity >= 2;

-- 2.5 Low Stock Alert
SELECT name, quantity, category, sub_category
FROM product 
WHERE quantity < 20
ORDER BY quantity ASC;

-- 2.6 Products by Price Range
SELECT name, category, price, quantity
FROM product
WHERE price BETWEEN 500 AND 2000
ORDER BY price;

-- 2.7 Most Expensive Products
SELECT name, category, price, quantity
FROM product
ORDER BY price DESC
LIMIT 10;

-- =====================================================
-- 3. TOOL RENTAL QUERIES
-- =====================================================

-- 3.1 Check Tool Availability for Specific Dates
SELECT 
    t.id,
    t.name,
    t.category,
    t.daily_rate,
    t.stock_quantity,
    CASE 
        WHEN r.id IS NULL THEN 'Available' 
        ELSE 'Booked' 
    END as availability_status
FROM tools t
LEFT JOIN rentals r ON t.id = r.tool_id 
    AND r.status IN ('ACTIVE', 'PENDING')
    AND (r.start_date <= '2025-02-20' AND r.end_date >= '2025-02-15')
WHERE t.available = TRUE AND t.stock_quantity > 0
ORDER BY t.name;

-- 3.2 Available Tools by Category
SELECT id, name, daily_rate, stock_quantity, description
FROM tools 
WHERE category = 'Power Tools' AND available = TRUE AND stock_quantity > 0
ORDER BY daily_rate;

-- 3.3 Create Rental Booking
INSERT INTO rentals (user_id, tool_id, start_date, end_date, quantity, total_cost, status)
VALUES (1, 1, '2025-03-01', '2025-03-03', 1, 1000.00, 'PENDING');

-- 3.4 Update Rental
UPDATE rentals 
SET start_date = '2025-03-02', 
    end_date = '2025-03-04', 
    total_cost = 1000.00
WHERE id = 1;

-- 3.5 Calculate Rental Cost
SELECT 
    t.name,
    t.daily_rate,
    DATEDIFF('2025-03-03', '2025-03-01') as rental_days,
    t.daily_rate * DATEDIFF('2025-03-03', '2025-03-01') * 1 as total_cost
FROM tools t 
WHERE t.id = 1;

-- 3.6 Tools Currently Rented
SELECT 
    t.name,
    t.category,
    u.first_name,
    u.last_name,
    r.start_date,
    r.end_date,
    r.quantity,
    r.total_cost
FROM rentals r
JOIN tools t ON r.tool_id = t.id
JOIN user u ON r.user_id = u.id
WHERE r.status = 'ACTIVE'
ORDER BY r.start_date;

-- 3.7 Tool Rental History
SELECT 
    t.name,
    t.category,
    COUNT(r.id) as times_rented,
    SUM(r.total_cost) as total_revenue,
    AVG(DATEDIFF(r.end_date, r.start_date)) as avg_rental_days
FROM tools t
LEFT JOIN rentals r ON t.id = r.tool_id
GROUP BY t.id, t.name, t.category
ORDER BY times_rented DESC;

-- =====================================================
-- 4. BUSINESS INTELLIGENCE QUERIES
-- =====================================================

-- 4.1 Daily Sales Report
SELECT 
    DATE(c.created_at) as sale_date,
    COUNT(DISTINCT c.id) as total_orders,
    COUNT(ci.id) as total_items,
    SUM(ci.subtotal) as total_revenue
FROM cart_item ci
JOIN cart c ON ci.cart_id = c.id
WHERE ci.rental = FALSE
GROUP BY DATE(c.created_at)
ORDER BY sale_date DESC;

-- 4.2 Top Selling Products
SELECT 
    p.name,
    p.category,
    p.sub_category,
    SUM(ci.quantity) as total_sold,
    SUM(ci.subtotal) as total_revenue,
    AVG(ci.unit_price) as avg_price
FROM cart_item ci
JOIN product p ON ci.product_id = p.id
WHERE ci.rental = FALSE
GROUP BY p.id, p.name, p.category, p.sub_category
ORDER BY total_sold DESC
LIMIT 10;

-- 4.3 Most Popular Rental Tools
SELECT 
    t.name,
    t.category,
    COUNT(r.id) as rental_count,
    SUM(r.total_cost) as total_revenue,
    AVG(DATEDIFF(r.end_date, r.start_date)) as avg_rental_days
FROM rentals r
JOIN tools t ON r.tool_id = t.id
GROUP BY t.id, t.name, t.category
ORDER BY rental_count DESC;

-- 4.4 Monthly Revenue Report
SELECT 
    YEAR(r.start_date) as year,
    MONTH(r.start_date) as month,
    MONTHNAME(r.start_date) as month_name,
    COUNT(r.id) as rental_count,
    SUM(r.total_cost) as rental_revenue,
    AVG(r.total_cost) as avg_rental_value
FROM rentals r
GROUP BY YEAR(r.start_date), MONTH(r.start_date), MONTHNAME(r.start_date)
ORDER BY year DESC, month DESC;

-- 4.5 Customer Analytics - Frequent Customers
SELECT 
    u.first_name,
    u.last_name,
    u.email,
    u.city,
    COUNT(r.id) as rental_count,
    SUM(r.total_cost) as total_spent,
    AVG(r.total_cost) as avg_rental_value
FROM user u
JOIN rentals r ON u.id = r.user_id
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.city
HAVING rental_count > 1
ORDER BY total_spent DESC;

-- 4.6 Tool Utilization Rate
SELECT 
    t.name,
    t.category,
    t.stock_quantity,
    COUNT(r.id) as times_rented,
    SUM(DATEDIFF(r.end_date, r.start_date)) as total_days_rented,
    ROUND((COUNT(r.id) / 30.0) * 100, 2) as utilization_rate_percent
FROM tools t
LEFT JOIN rentals r ON t.id = r.tool_id 
    AND r.start_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY t.id, t.name, t.category, t.stock_quantity
ORDER BY utilization_rate_percent DESC;

-- 4.7 Revenue by Category
SELECT 
    'Product' as type,
    p.category,
    COUNT(ci.id) as transaction_count,
    SUM(ci.subtotal) as revenue
FROM cart_item ci
JOIN product p ON ci.product_id = p.id
WHERE ci.rental = FALSE
GROUP BY p.category

UNION ALL

SELECT 
    'Rental' as type,
    t.category,
    COUNT(r.id) as transaction_count,
    SUM(r.total_cost) as revenue
FROM rentals r
JOIN tools t ON r.tool_id = t.id
GROUP BY t.category

ORDER BY revenue DESC;

-- 4.8 Customer Lifetime Value
SELECT 
    u.first_name,
    u.last_name,
    u.email,
    u.city,
    COUNT(DISTINCT r.id) as total_rentals,
    COUNT(DISTINCT c.id) as total_purchases,
    COALESCE(SUM(r.total_cost), 0) as rental_revenue,
    COALESCE(SUM(ci.subtotal), 0) as purchase_revenue,
    (COALESCE(SUM(r.total_cost), 0) + COALESCE(SUM(ci.subtotal), 0)) as total_lifetime_value
FROM user u
LEFT JOIN rentals r ON u.id = r.user_id
LEFT JOIN cart c ON u.id = c.user_id
LEFT JOIN cart_item ci ON c.id = ci.cart_id AND ci.rental = FALSE
WHERE u.role = 'CUSTOMER'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.city
HAVING total_lifetime_value > 0
ORDER BY total_lifetime_value DESC;

-- 4.9 Seasonal Analysis
SELECT 
    QUARTER(r.start_date) as quarter,
    MONTHNAME(r.start_date) as month,
    COUNT(r.id) as rental_count,
    SUM(r.total_cost) as revenue,
    AVG(r.total_cost) as avg_rental_value
FROM rentals r
GROUP BY QUARTER(r.start_date), MONTHNAME(r.start_date)
ORDER BY quarter, MONTH(r.start_date);

-- 4.10 Inventory Analysis
SELECT 
    'Products' as inventory_type,
    COUNT(*) as total_items,
    SUM(quantity) as total_stock,
    AVG(price) as avg_price,
    SUM(quantity * price) as total_inventory_value
FROM product

UNION ALL

SELECT 
    'Tools' as inventory_type,
    COUNT(*) as total_items,
    SUM(stock_quantity) as total_stock,
    AVG(daily_rate) as avg_daily_rate,
    SUM(stock_quantity * daily_rate) as total_inventory_value
FROM tools;

-- =====================================================
-- 5. ADVANCED ANALYTICAL QUERIES
-- =====================================================

-- 5.1 Customer Segmentation
SELECT 
    CASE 
        WHEN total_spent >= 5000 THEN 'High Value'
        WHEN total_spent >= 2000 THEN 'Medium Value'
        WHEN total_spent >= 500 THEN 'Low Value'
        ELSE 'New Customer'
    END as customer_segment,
    COUNT(*) as customer_count,
    AVG(total_spent) as avg_spending
FROM (
    SELECT 
        u.id,
        COALESCE(SUM(r.total_cost), 0) + COALESCE(SUM(ci.subtotal), 0) as total_spent
    FROM user u
    LEFT JOIN rentals r ON u.id = r.user_id
    LEFT JOIN cart c ON u.id = c.user_id
    LEFT JOIN cart_item ci ON c.id = ci.cart_id AND ci.rental = FALSE
    WHERE u.role = 'CUSTOMER'
    GROUP BY u.id
) as customer_spending
GROUP BY customer_segment
ORDER BY avg_spending DESC;

-- 5.2 Peak Rental Periods
SELECT 
    DAYOFWEEK(r.start_date) as day_of_week,
    CASE DAYOFWEEK(r.start_date)
        WHEN 1 THEN 'Sunday'
        WHEN 2 THEN 'Monday'
        WHEN 3 THEN 'Tuesday'
        WHEN 4 THEN 'Wednesday'
        WHEN 5 THEN 'Thursday'
        WHEN 6 THEN 'Friday'
        WHEN 7 THEN 'Saturday'
    END as day_name,
    COUNT(r.id) as rental_count,
    AVG(r.total_cost) as avg_rental_value
FROM rentals r
GROUP BY DAYOFWEEK(r.start_date)
ORDER BY rental_count DESC;

-- 5.3 Tool Performance Analysis
SELECT 
    t.name,
    t.category,
    t.daily_rate,
    COUNT(r.id) as total_rentals,
    SUM(r.total_cost) as total_revenue,
    AVG(DATEDIFF(r.end_date, r.start_date)) as avg_rental_duration,
    (SUM(r.total_cost) / COUNT(r.id)) as revenue_per_rental,
    ROUND((COUNT(r.id) * AVG(DATEDIFF(r.end_date, r.start_date)) / 30.0), 2) as utilization_days_per_month
FROM tools t
LEFT JOIN rentals r ON t.id = r.tool_id
GROUP BY t.id, t.name, t.category, t.daily_rate
HAVING total_rentals > 0
ORDER BY total_revenue DESC;

-- 5.4 Geographic Analysis
SELECT 
    u.city,
    COUNT(DISTINCT u.id) as customer_count,
    COUNT(r.id) as total_rentals,
    SUM(r.total_cost) as rental_revenue,
    AVG(r.total_cost) as avg_rental_value
FROM user u
LEFT JOIN rentals r ON u.id = r.user_id
WHERE u.role = 'CUSTOMER'
GROUP BY u.city
HAVING customer_count > 0
ORDER BY rental_revenue DESC;

-- 5.5 Product vs Rental Revenue Comparison
SELECT 
    'Product Sales' as revenue_type,
    COUNT(ci.id) as transaction_count,
    SUM(ci.subtotal) as total_revenue,
    AVG(ci.subtotal) as avg_transaction_value
FROM cart_item ci
WHERE ci.rental = FALSE

UNION ALL

SELECT 
    'Tool Rentals' as revenue_type,
    COUNT(r.id) as transaction_count,
    SUM(r.total_cost) as total_revenue,
    AVG(r.total_cost) as avg_transaction_value
FROM rentals r

ORDER BY total_revenue DESC;

-- =====================================================
-- 6. MAINTENANCE AND MONITORING QUERIES
-- =====================================================

-- 6.1 Database Size and Table Statistics
SELECT 
    table_name,
    table_rows,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) as size_mb
FROM information_schema.tables
WHERE table_schema = 'hardware_store'
ORDER BY size_mb DESC;

-- 6.2 Active Connections
SHOW PROCESSLIST;

-- 6.3 Table Status
SHOW TABLE STATUS FROM hardware_store;

-- 6.4 Index Usage
SHOW INDEX FROM rentals;
SHOW INDEX FROM user;
SHOW INDEX FROM tools;

-- =====================================================
-- 7. DATA VALIDATION QUERIES
-- =====================================================

-- 7.1 Check for Data Integrity Issues
SELECT 'Users without carts' as issue, COUNT(*) as count
FROM user u
LEFT JOIN cart c ON u.id = c.user_id
WHERE c.id IS NULL AND u.role = 'CUSTOMER'

UNION ALL

SELECT 'Rentals with invalid dates' as issue, COUNT(*) as count
FROM rentals
WHERE end_date < start_date

UNION ALL

SELECT 'Products with negative stock' as issue, COUNT(*) as count
FROM product
WHERE quantity < 0

UNION ALL

SELECT 'Tools with negative rates' as issue, COUNT(*) as count
FROM tools
WHERE daily_rate < 0;

-- 7.2 Orphaned Records Check
SELECT 'Cart items without products' as issue, COUNT(*) as count
FROM cart_item ci
LEFT JOIN product p ON ci.product_id = p.id
WHERE ci.product_id IS NOT NULL AND p.id IS NULL

UNION ALL

SELECT 'Rentals without users' as issue, COUNT(*) as count
FROM rentals r
LEFT JOIN user u ON r.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 'Rentals without tools' as issue, COUNT(*) as count
FROM rentals r
LEFT JOIN tools t ON r.tool_id = t.id
WHERE t.id IS NULL;

-- =====================================================
-- QUERIES COMPLETED
-- =====================================================

SELECT 'All queries executed successfully!' as status;

-- Tools table
CREATE TABLE tools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    daily_rate DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INT NOT NULL DEFAULT 1,
    description TEXT,
    image LONGBLOB
);

-- Orders table
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    payment_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items table
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT,
    tool_id BIGINT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    rental_start DATE,
    rental_end DATE,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (tool_id) REFERENCES tools(id)
);

-- Product Cart table
CREATE TABLE product_cart (
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    added_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Rental Cart table
CREATE TABLE rental_cart (
    user_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    rental_start DATE,
    rental_end DATE,
    total_cost DECIMAL(10,2),
    added_at TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, tool_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tool_id) REFERENCES tools(id)
);

-- Rentals table
CREATE TABLE rentals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tool_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_cost DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tool_id) REFERENCES tools(id)
);

-- Index for frequently accessed columns
CREATE INDEX idx_rental_status ON rentals(status);
CREATE INDEX idx_rental_user ON rentals(user_id);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_product_cart_user ON product_cart(user_id);
CREATE INDEX idx_rental_cart_user ON rental_cart(user_id);

-- Insert rental tools
INSERT INTO tools (name, daily_rate, category, available, stock_quantity, description) VALUES
('Excavator', 45000.00, 'Heavy Machinery', TRUE, 2, 'Heavy-duty excavator for construction and excavation work'),
('Scaffoldings', 7500.00, 'Construction Equipment', TRUE, 10, 'Modular scaffolding system for construction and maintenance work'),
('Drill', 4500.00, 'Power Tools', TRUE, 8, 'High-performance electric drill for various drilling applications'),
('Cement Mixer', 12000.00, 'Construction Equipment', TRUE, 5, 'Portable cement mixer for concrete mixing and construction projects'),
('Wacker Machine', 9000.00, 'Construction Equipment', TRUE, 4, 'Compaction machine for soil and asphalt compaction'),
('Roller', 15000.00, 'Heavy Machinery', TRUE, 3, 'Road roller for asphalt and soil compaction');
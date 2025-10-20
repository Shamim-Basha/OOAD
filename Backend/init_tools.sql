-- Initialize tools table and insert rental items
-- Run this script in your MySQL database to create the tools table and insert rental data

-- Create tools table if it doesn't exist
CREATE TABLE IF NOT EXISTS tools (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    daily_rate DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INT NOT NULL DEFAULT 1,
    description TEXT
);

-- Clear existing data (optional - remove this line if you want to keep existing data)
DELETE FROM tools;

-- Insert rental tools with Sri Lankan Rupee prices
INSERT INTO tools (name, daily_rate, category, available, stock_quantity, description) VALUES
('Excavator', 45000.00, 'Heavy Machinery', TRUE, 2, 'Heavy-duty excavator for construction and excavation work'),
('Scaffoldings', 7500.00, 'Construction Equipment', TRUE, 10, 'Modular scaffolding system for construction and maintenance work'),
('Drill', 4500.00, 'Power Tools', TRUE, 8, 'High-performance electric drill for various drilling applications'),
('Cement Mixer', 12000.00, 'Construction Equipment', TRUE, 5, 'Portable cement mixer for concrete mixing and construction projects'),
('Wacker Machine', 9000.00, 'Construction Equipment', TRUE, 4, 'Compaction machine for soil and asphalt compaction'),
('Roller', 15000.00, 'Heavy Machinery', TRUE, 3, 'Road roller for asphalt and soil compaction');

-- Verify the data was inserted
SELECT * FROM tools;

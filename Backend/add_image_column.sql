-- Add image column to existing tools table
-- Run this in phpMyAdmin SQL tab

-- Add image column to tools table
ALTER TABLE tools ADD COLUMN image LONGBLOB;

-- Verify the column was added
DESCRIBE tools;

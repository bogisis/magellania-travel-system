-- Migration: Extend calculation schema for advanced mathematical logic
-- Version: 001
-- Date: 2025-08-28
-- Description: Add calculation-related fields to support advanced pricing models

-- Extend estimates table with calculation fields (without DEFAULT for SQLite compatibility)
ALTER TABLE estimates ADD COLUMN show_markup BOOLEAN;
ALTER TABLE estimates ADD COLUMN markup_percentage DECIMAL(5,2);
ALTER TABLE estimates ADD COLUMN base_total DECIMAL(10,2);
ALTER TABLE estimates ADD COLUMN markup_amount DECIMAL(10,2);
ALTER TABLE estimates ADD COLUMN calculation_version VARCHAR(10);
ALTER TABLE estimates ADD COLUMN last_calculated_at TIMESTAMP;

-- Update new columns with default values
UPDATE estimates SET 
  show_markup = 1,
  markup_percentage = 15.00,
  base_total = totalPrice,
  markup_amount = 0,
  calculation_version = '1.0',
  last_calculated_at = CURRENT_TIMESTAMP;

-- Create new accommodations table for detailed accommodation tracking
CREATE TABLE IF NOT EXISTS accommodations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimate_id INTEGER NOT NULL,
  hotel_name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  nights INTEGER NOT NULL DEFAULT 1,
  tourist_rooms_double INTEGER DEFAULT 0,
  tourist_rooms_single INTEGER DEFAULT 0,
  tourist_rooms_triple INTEGER DEFAULT 0,
  guide_room_needed BOOLEAN DEFAULT 0,
  guide_room_cost DECIMAL(8,2) DEFAULT 0,
  price_per_room DECIMAL(8,2) DEFAULT 0,
  accommodation_type VARCHAR(20) DEFAULT 'double',
  is_guide_hotel BOOLEAN DEFAULT 0,
  is_manual BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
);

-- Create calculation_activities table for detailed activity tracking
CREATE TABLE IF NOT EXISTS calculation_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimate_id INTEGER NOT NULL,
  tour_day_id VARCHAR(50),
  activity_name VARCHAR(255) NOT NULL,
  description TEXT,
  calculation_type VARCHAR(20) DEFAULT 'per_group',
  base_price DECIMAL(10,2) DEFAULT 0,
  quantity INTEGER DEFAULT 1,
  participant_count INTEGER DEFAULT 0,
  final_price DECIMAL(10,2) DEFAULT 0,
  markup_applied BOOLEAN DEFAULT 0,
  markup_percentage DECIMAL(5,2) DEFAULT 0,
  age_category VARCHAR(20) DEFAULT 'adult',
  duration VARCHAR(50),
  city VARCHAR(100),
  day_number INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
);

-- Create calculation_history table for audit trail
CREATE TABLE IF NOT EXISTS calculation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estimate_id INTEGER NOT NULL,
  calculation_type VARCHAR(50) NOT NULL,
  old_value DECIMAL(10,2),
  new_value DECIMAL(10,2),
  changed_by VARCHAR(100) DEFAULT 'system',
  change_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_accommodations_estimate_id ON accommodations(estimate_id);
CREATE INDEX IF NOT EXISTS idx_calculation_activities_estimate_id ON calculation_activities(estimate_id);
CREATE INDEX IF NOT EXISTS idx_calculation_activities_tour_day_id ON calculation_activities(tour_day_id);
CREATE INDEX IF NOT EXISTS idx_calculation_history_estimate_id ON calculation_history(estimate_id);
CREATE INDEX IF NOT EXISTS idx_calculation_history_created_at ON calculation_history(created_at);

-- Insert migration record
CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version VARCHAR(10) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO migrations (version, description) 
VALUES ('001', 'Extend calculation schema for advanced mathematical logic');

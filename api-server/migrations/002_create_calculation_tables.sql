-- Migration: Create calculation tables
-- Version: 002
-- Date: 2025-08-28
-- Description: Create new tables for advanced calculation tracking

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
INSERT OR IGNORE INTO migrations (version, description) 
VALUES ('002', 'Create calculation tables for advanced tracking');

-- Миграция 003: Добавление полей для рейсов и данных сметы
-- Дата: Декабрь 2024

-- Добавляем новые поля в таблицу estimates
ALTER TABLE estimates ADD COLUMN flights TEXT DEFAULT '[]';
ALTER TABLE estimates ADD COLUMN hotels TEXT DEFAULT '[]';
ALTER TABLE estimates ADD COLUMN tourDays TEXT DEFAULT '[]';
ALTER TABLE estimates ADD COLUMN optionalServices TEXT DEFAULT '[]';
ALTER TABLE estimates ADD COLUMN location TEXT DEFAULT '{}';
ALTER TABLE estimates ADD COLUMN tourDates TEXT DEFAULT '{}';
ALTER TABLE estimates ADD COLUMN group TEXT DEFAULT '{}';
ALTER TABLE estimates ADD COLUMN markup REAL DEFAULT 0;
ALTER TABLE estimates ADD COLUMN currency TEXT DEFAULT 'USD';

-- Обновляем существующие записи
UPDATE estimates SET 
  flights = '[]',
  hotels = '[]',
  tourDays = '[]',
  optionalServices = '[]',
  location = '{}',
  tourDates = '{}',
  group = '{}',
  markup = 0,
  currency = 'USD'
WHERE flights IS NULL;

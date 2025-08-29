const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Путь к файлу базы данных
const dbPath = path.join(__dirname, '../data/magellania.db')

// Создаем директорию для данных, если её нет
const fs = require('fs')
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к базе данных:', err.message)
  } else {
    console.log('✅ Подключение к SQLite базе данных установлено')
  }
})

// Включаем foreign keys
db.run('PRAGMA foreign_keys = ON')

// Схема базы данных
const schema = `
-- estimates (сметы)
CREATE TABLE IF NOT EXISTS estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  tourName TEXT,
  country TEXT,
  region TEXT,
  startDate TEXT,
  duration INTEGER,
  status TEXT DEFAULT 'draft',
  clientId INTEGER,
  assignedManager TEXT,
  totalPrice REAL DEFAULT 0,
  margin REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  tags TEXT DEFAULT '[]',
  flights TEXT DEFAULT '[]',
  hotels TEXT DEFAULT '[]',
  tourDays TEXT DEFAULT '[]',
  optionalServices TEXT DEFAULT '[]',
  location TEXT DEFAULT '{}',
  tourDates TEXT DEFAULT '{}',
  groupData TEXT DEFAULT '{}',
  markup REAL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (clientId) REFERENCES clients (id) ON DELETE SET NULL
);

-- clients (клиенты)
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT DEFAULT 'individual',
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  contactPerson TEXT,
  country TEXT,
  source TEXT,
  segment TEXT DEFAULT 'new',
  assignedManager TEXT,
  preferences TEXT DEFAULT '{}',
  tags TEXT DEFAULT '[]',
  totalSpent REAL DEFAULT 0,
  lastInteraction TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- suppliers (поставщики)
CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  country TEXT,
  region TEXT,
  rating REAL DEFAULT 0,
  reliability INTEGER DEFAULT 0,
  commission REAL DEFAULT 0,
  paymentTerms TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT 1,
  contracts TEXT DEFAULT '[]',
  performanceMetrics TEXT DEFAULT '{}',
  blacklistStatus BOOLEAN DEFAULT 0,
  tags TEXT DEFAULT '[]',
  createdAt TEXT DEFAULT (datetime('now'))
);

-- tariffs (тарифы)
CREATE TABLE IF NOT EXISTS tariffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  pricePerUnit REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  season TEXT DEFAULT 'year',
  location TEXT,
  minPax INTEGER DEFAULT 1,
  maxPax INTEGER,
  supplierId INTEGER,
  active BOOLEAN DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (supplierId) REFERENCES suppliers (id) ON DELETE SET NULL
);

-- activityLogs (логи активности)
CREATE TABLE IF NOT EXISTS activityLogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT,
  action TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId INTEGER,
  changes TEXT DEFAULT '{}',
  timestamp TEXT DEFAULT (datetime('now')),
  ipAddress TEXT DEFAULT 'unknown',
  userAgent TEXT DEFAULT 'unknown'
);

-- settings (настройки)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  category TEXT DEFAULT 'general',
  updatedAt TEXT DEFAULT (datetime('now'))
);

-- currencyRates (курсы валют)
CREATE TABLE IF NOT EXISTS currencyRates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fromCurrency TEXT NOT NULL,
  toCurrency TEXT NOT NULL,
  rate REAL NOT NULL,
  date TEXT DEFAULT (date('now')),
  createdAt TEXT DEFAULT (datetime('now'))
);

-- backups (резервные копии)
CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  data TEXT NOT NULL,
  size INTEGER,
  checksum TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_clientId ON estimates(clientId);
CREATE INDEX IF NOT EXISTS idx_estimates_createdAt ON estimates(createdAt);
CREATE INDEX IF NOT EXISTS idx_clients_segment ON clients(segment);
CREATE INDEX IF NOT EXISTS idx_clients_country ON clients(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(category);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(active);
CREATE INDEX IF NOT EXISTS idx_tariffs_category ON tariffs(category);
CREATE INDEX IF NOT EXISTS idx_tariffs_supplierId ON tariffs(supplierId);
CREATE INDEX IF NOT EXISTS idx_activityLogs_timestamp ON activityLogs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activityLogs_entityType ON activityLogs(entityType);
`

// Демо-данные
const seedData = `
-- Демо-клиенты
INSERT OR IGNORE INTO clients (name, email, phone, company, country, segment) VALUES
('Иван Петров', 'ivan@example.com', '+7-999-123-45-67', 'ООО "Туризм"', 'Россия', 'premium'),
('Мария Сидорова', 'maria@example.com', '+7-999-234-56-78', 'ИП Сидорова', 'Россия', 'regular'),
('John Smith', 'john@example.com', '+1-555-123-4567', 'Travel Corp', 'USA', 'premium');

-- Демо-поставщики
INSERT OR IGNORE INTO suppliers (category, name, email, phone, country, rating, reliability) VALUES
('hotel', 'Hotel Austral Plaza', 'reservas@australplaza.com', '+54-11-4123-4567', 'Argentina', 4.5, 95),
('transport', 'Patagonia Transfers', 'info@patagoniatransfers.com', '+54-11-5555-0001', 'Argentina', 4.8, 98),
('excursion', 'Buenos Aires Tours', 'tours@batours.com', '+54-11-4444-2222', 'Argentina', 4.6, 92);

-- Демо-тарифы
INSERT OR IGNORE INTO tariffs (category, name, description, pricePerUnit, currency, location) VALUES
('excursion', 'Обзорная экскурсия по Буэнос-Айресу', 'Полудневная экскурсия с гидом', 45, 'USD', 'Buenos Aires'),
('transport', 'Трансфер аэропорт-отель', 'Индивидуальный трансфер', 35, 'USD', 'Buenos Aires'),
('hotel', 'Hotel Austral Plaza - Standard', 'Стандартный номер с завтраком', 120, 'USD', 'Buenos Aires');

-- Демо-сметы
INSERT OR IGNORE INTO estimates (name, tourName, country, region, startDate, duration, status, clientId, totalPrice) VALUES
('Тур в Аргентину - Иван Петров', 'Аргентинское приключение', 'Argentina', 'Buenos Aires', '2024-03-15', 7, 'confirmed', 1, 850),
('Экскурсия по Буэнос-Айресу - Мария', 'Городские туры', 'Argentina', 'Buenos Aires', '2024-02-20', 3, 'draft', 2, 320);
`

// Функция инициализации базы данных
async function initDatabase() {
  return new Promise((resolve, reject) => {
    console.log('🗄️ Инициализация SQLite базы данных...')

    // Выполняем создание таблиц
    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Ошибка создания схемы:', err.message)
        reject(err)
        return
      }

      console.log('✅ Схема базы данных создана')

      // Добавляем демо-данные
      db.exec(seedData, (err) => {
        if (err) {
          console.error('❌ Ошибка добавления демо-данных:', err.message)
          reject(err)
          return
        }

        console.log('✅ Демо-данные добавлены')
        resolve()
      })
    })
  })
}

// Функция для выполнения запросов
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

// Функция для выполнения одной записи
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

// Функция для выполнения операций вставки/обновления
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({ id: this.lastID, changes: this.changes })
      }
    })
  })
}

module.exports = {
  db,
  initDatabase,
  query,
  get,
  run,
}

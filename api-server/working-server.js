const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: true, // Разрешаем все origins для разработки
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Инициализация SQLite
const dbPath = path.join(__dirname, 'data/magellania.db')
const dataDir = path.dirname(dbPath)

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к SQLite:', err.message)
  } else {
    console.log('✅ SQLite подключена:', dbPath)
  }
})

// Создание таблиц
const createTables = () => {
  return new Promise((resolve, reject) => {
    const schema = `
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
        totalPrice REAL DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        country TEXT,
        segment TEXT DEFAULT 'new',
        totalSpent REAL DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        country TEXT,
        rating REAL DEFAULT 0,
        active BOOLEAN DEFAULT 1,
        createdAt TEXT DEFAULT (datetime('now'))
      );
    `

    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Ошибка создания таблиц:', err.message)
        reject(err)
      } else {
        console.log('✅ Таблицы созданы')
        resolve()
      }
    })
  })
}

// Добавление демо-данных
const seedData = () => {
  return new Promise((resolve, reject) => {
    const demoData = `
      INSERT OR IGNORE INTO clients (name, email, phone, company, country, segment) VALUES
      ('Иван Петров', 'ivan@example.com', '+7-999-123-45-67', 'ООО "Туризм"', 'Россия', 'premium'),
      ('Мария Сидорова', 'maria@example.com', '+7-999-234-56-78', 'ИП Сидорова', 'Россия', 'regular');

      INSERT OR IGNORE INTO suppliers (category, name, email, phone, country, rating) VALUES
      ('hotel', 'Hotel Austral Plaza', 'reservas@australplaza.com', '+54-11-4123-4567', 'Argentina', 4.5),
      ('transport', 'Patagonia Transfers', 'info@patagoniatransfers.com', '+54-11-5555-0001', 'Argentina', 4.8);

      INSERT OR IGNORE INTO estimates (name, tourName, country, region, startDate, duration, status, clientId, totalPrice) VALUES
      ('Тур в Аргентину - Иван Петров', 'Аргентинское приключение', 'Argentina', 'Buenos Aires', '2024-03-15', 7, 'confirmed', 1, 850),
      ('Экскурсия по Буэнос-Айресу - Мария', 'Городские туры', 'Argentina', 'Buenos Aires', '2024-02-20', 3, 'draft', 2, 320);
    `

    db.exec(demoData, (err) => {
      if (err) {
        console.error('❌ Ошибка добавления демо-данных:', err.message)
        reject(err)
      } else {
        console.log('✅ Демо-данные добавлены')
        resolve()
      }
    })
  })
}

// Функции для работы с БД
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err)
      else resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

// API маршруты
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'SQLite',
  })
})

// Estimates API
app.get('/api/estimates', async (req, res) => {
  try {
    const estimates = await query(`
      SELECT e.*, c.name as clientName 
      FROM estimates e 
      LEFT JOIN clients c ON e.clientId = c.id 
      ORDER BY e.createdAt DESC
    `)
    res.json(estimates)
  } catch (error) {
    console.error('Ошибка получения смет:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const estimate = await get(
      `
      SELECT e.*, c.name as clientName 
      FROM estimates e 
      LEFT JOIN clients c ON e.clientId = c.id 
      WHERE e.id = ?
    `,
      [id],
    )

    if (!estimate) {
      return res.status(404).json({ error: 'Смета не найдена' })
    }

    res.json(estimate)
  } catch (error) {
    console.error('Ошибка получения сметы:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/estimates', async (req, res) => {
  try {
    const { name, tourName, country, region, startDate, duration, clientId, totalPrice } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Название сметы обязательно' })
    }

    const result = await run(
      `
      INSERT INTO estimates (name, tourName, country, region, startDate, duration, clientId, totalPrice, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
      [name, tourName, country, region, startDate, duration, clientId, totalPrice],
    )

    const newEstimate = await get('SELECT * FROM estimates WHERE id = ?', [result.id])

    res.status(201).json({
      message: 'Смета создана успешно',
      estimate: newEstimate,
    })
  } catch (error) {
    console.error('Ошибка создания сметы:', error)
    res.status(500).json({ error: error.message })
  }
})

// Clients API
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await query('SELECT * FROM clients ORDER BY createdAt DESC')
    res.json(clients)
  } catch (error) {
    console.error('Ошибка получения клиентов:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params
    const client = await get('SELECT * FROM clients WHERE id = ?', [id])

    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' })
    }

    res.json(client)
  } catch (error) {
    console.error('Ошибка получения клиента:', error)
    res.status(500).json({ error: error.message })
  }
})

// Suppliers API
app.get('/api/suppliers', async (req, res) => {
  try {
    const suppliers = await query('SELECT * FROM suppliers ORDER BY name ASC')
    res.json(suppliers)
  } catch (error) {
    console.error('Ошибка получения поставщиков:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params
    const supplier = await get('SELECT * FROM suppliers WHERE id = ?', [id])

    if (!supplier) {
      return res.status(404).json({ error: 'Поставщик не найден' })
    }

    res.json(supplier)
  } catch (error) {
    console.error('Ошибка получения поставщика:', error)
    res.status(500).json({ error: error.message })
  }
})

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err)
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Запуск сервера
async function startServer() {
  try {
    console.log('🗄️ Инициализация базы данных...')
    await createTables()
    await seedData()

    app.listen(PORT, () => {
      console.log(`🚀 API сервер запущен на порту ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🔗 CORS разрешен для: http://localhost:5174`)
      console.log(`📋 Доступные endpoints:`)
      console.log(`   - GET /api/health`)
      console.log(`   - GET /api/estimates`)
      console.log(`   - GET /api/clients`)
      console.log(`   - GET /api/suppliers`)
    })
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

startServer()

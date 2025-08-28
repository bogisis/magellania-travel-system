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
        client TEXT,
        title TEXT,
        description TEXT,
        country TEXT,
        region TEXT,
        startDate TEXT,
        duration INTEGER,
        status TEXT DEFAULT 'draft',
        clientId INTEGER,
        totalPrice REAL DEFAULT 0,
        markup REAL DEFAULT 0,
        currency TEXT DEFAULT 'USD',
        location_data TEXT,
        tour_dates_data TEXT,
        group_data TEXT,
        hotels_data TEXT,
        tour_days_data TEXT,
        optional_services_data TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
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

// Функции для расчета стоимости сметы
function calculateEstimateTotal(group, hotels, tourDays, optionalServices) {
  try {
    // Расчет стоимости гостиниц (без гостиниц для гида)
    const hotelsCost = (hotels || [])
      .filter((hotel) => !hotel.isGuideHotel)
      .reduce((sum, hotel) => {
        const rooms =
          hotel.accommodationType === 'double'
            ? Math.ceil(Number(hotel.paxCount) / 2)
            : Number(hotel.paxCount)
        return sum + rooms * Number(hotel.pricePerRoom || 0) * Number(hotel.nights || 1)
      }, 0)

    // Расчет стоимости активностей
    const activitiesCost = (tourDays || []).reduce((sum, day) => {
      return (
        sum +
        (day.activities || []).reduce((daySum, activity) => daySum + Number(activity.cost || 0), 0)
      )
    }, 0)

    // Расчет стоимости дополнительных услуг
    const servicesCost = (optionalServices || []).reduce(
      (sum, service) => sum + Number(service.price || service.cost || 0),
      0,
    )

    // Базовая стоимость
    const baseCost = hotelsCost + activitiesCost + servicesCost

    // Расчет маржи
    const markup = Number(group?.markup || 0)
    const markupAmount = (baseCost * markup) / 100

    // Финальная стоимость
    const totalCost = baseCost + markupAmount

    return totalCost
  } catch (error) {
    console.error('Ошибка расчета стоимости сметы:', error)
    return 0
  }
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

    // Преобразуем JSON данные обратно в объекты для каждой сметы
    const fullEstimates = estimates.map((estimate) => ({
      ...estimate,
      location: estimate.location_data
        ? JSON.parse(estimate.location_data)
        : {
            country: '',
            regions: [],
            cities: [],
            startPoint: '',
            endPoint: '',
          },
      tourDates: estimate.tour_dates_data
        ? JSON.parse(estimate.tour_dates_data)
        : {
            dateType: 'exact',
            startDate: '',
            endDate: '',
            days: 0,
          },
      group: estimate.group_data
        ? JSON.parse(estimate.group_data)
        : {
            totalPax: 0,
            doubleCount: 0,
            singleCount: 0,
            guidesCount: 0,
            markup: 0,
          },
      hotels: estimate.hotels_data ? JSON.parse(estimate.hotels_data) : [],
      tourDays: estimate.tour_days_data ? JSON.parse(estimate.tour_days_data) : [],
      optionalServices: estimate.optional_services_data
        ? JSON.parse(estimate.optional_services_data)
        : [],
    }))

    res.json(fullEstimates)
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

    // Преобразуем JSON данные обратно в объекты
    const fullEstimate = {
      ...estimate,
      location: estimate.location_data
        ? JSON.parse(estimate.location_data)
        : {
            country: '',
            regions: [],
            cities: [],
            startPoint: '',
            endPoint: '',
          },
      tourDates: estimate.tour_dates_data
        ? JSON.parse(estimate.tour_dates_data)
        : {
            dateType: 'exact',
            startDate: '',
            endDate: '',
            days: 0,
          },
      group: estimate.group_data
        ? JSON.parse(estimate.group_data)
        : {
            totalPax: 0,
            doubleCount: 0,
            singleCount: 0,
            guidesCount: 0,
            markup: 0,
          },
      hotels: estimate.hotels_data ? JSON.parse(estimate.hotels_data) : [],
      tourDays: estimate.tour_days_data ? JSON.parse(estimate.tour_days_data) : [],
      optionalServices: estimate.optional_services_data
        ? JSON.parse(estimate.optional_services_data)
        : [],
    }

    res.json(fullEstimate)
  } catch (error) {
    console.error('Ошибка получения сметы:', error)
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/estimates', async (req, res) => {
  try {
    const {
      name,
      tourName,
      client,
      title,
      description,
      country,
      region,
      startDate,
      duration,
      clientId,
      totalPrice,
      markup,
      currency,
      location,
      tourDates,
      group,
      hotels,
      tourDays,
      optionalServices,
    } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Название сметы обязательно' })
    }

    // Автоматически рассчитываем totalPrice
    const calculatedTotalPrice = calculateEstimateTotal(group, hotels, tourDays, optionalServices)

    const result = await run(
      `
      INSERT INTO estimates (
        name, tourName, client, title, description, country, region, startDate, duration,
        clientId, totalPrice, markup, currency, location_data, tour_dates_data, group_data,
        hotels_data, tour_days_data, optional_services_data, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `,
      [
        name,
        tourName,
        client,
        title,
        description,
        country,
        region,
        startDate,
        duration,
        clientId,
        calculatedTotalPrice,
        markup,
        currency,
        JSON.stringify(location || {}),
        JSON.stringify(tourDates || {}),
        JSON.stringify(group || {}),
        JSON.stringify(hotels || []),
        JSON.stringify(tourDays || []),
        JSON.stringify(optionalServices || []),
      ],
    )

    const newEstimate = await get('SELECT * FROM estimates WHERE id = ?', [result.id])

    res.status(201).json(newEstimate)
  } catch (error) {
    console.error('Ошибка создания сметы:', error)
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      tourName,
      client,
      title,
      description,
      country,
      region,
      startDate,
      duration,
      clientId,
      totalPrice,
      markup,
      currency,
      location,
      tourDates,
      group,
      hotels,
      tourDays,
      optionalServices,
    } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Название сметы обязательно' })
    }

    // Автоматически рассчитываем totalPrice
    const calculatedTotalPrice = calculateEstimateTotal(group, hotels, tourDays, optionalServices)

    const result = await run(
      `
      UPDATE estimates SET
        name = ?, tourName = ?, client = ?, title = ?, description = ?, country = ?, region = ?,
        startDate = ?, duration = ?, clientId = ?, totalPrice = ?, markup = ?, currency = ?,
        location_data = ?, tour_dates_data = ?, group_data = ?, hotels_data = ?, tour_days_data = ?,
        optional_services_data = ?, updatedAt = datetime('now')
      WHERE id = ?
    `,
      [
        name,
        tourName,
        client,
        title,
        description,
        country,
        region,
        startDate,
        duration,
        clientId,
        calculatedTotalPrice,
        markup,
        currency,
        JSON.stringify(location || {}),
        JSON.stringify(tourDates || {}),
        JSON.stringify(group || {}),
        JSON.stringify(hotels || []),
        JSON.stringify(tourDays || []),
        JSON.stringify(optionalServices || []),
        id,
      ],
    )

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Смета не найдена' })
    }

    const updatedEstimate = await get('SELECT * FROM estimates WHERE id = ?', [id])
    res.json(updatedEstimate)
  } catch (error) {
    console.error('Ошибка обновления сметы:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/estimates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await run('DELETE FROM estimates WHERE id = ?', [id])

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Смета не найдена' })
    }

    res.json({ message: 'Смета удалена успешно' })
  } catch (error) {
    console.error('Ошибка удаления сметы:', error)
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

app.post('/api/clients', async (req, res) => {
  try {
    const { name, email, phone, company, country, segment, type } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Имя клиента обязательно' })
    }

    const result = await run(
      'INSERT INTO clients (name, email, phone, company, country, segment, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        email || null,
        phone || null,
        company || null,
        country || null,
        segment || 'new',
        type || 'b2c',
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    )

    const newClient = await get('SELECT * FROM clients WHERE id = ?', [result.lastID])
    res.status(201).json(newClient)
  } catch (error) {
    console.error('Ошибка создания клиента:', error)
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, company, country, segment, type } = req.body

    const existingClient = await get('SELECT * FROM clients WHERE id = ?', [id])
    if (!existingClient) {
      return res.status(404).json({ error: 'Клиент не найден' })
    }

    await run(
      'UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, country = ?, segment = ?, type = ?, updatedAt = ? WHERE id = ?',
      [
        name || existingClient.name,
        email || existingClient.email,
        phone || existingClient.phone,
        company || existingClient.company,
        country || existingClient.country,
        segment || existingClient.segment,
        type || existingClient.type,
        new Date().toISOString(),
        id,
      ],
    )

    const updatedClient = await get('SELECT * FROM clients WHERE id = ?', [id])
    res.json(updatedClient)
  } catch (error) {
    console.error('Ошибка обновления клиента:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const { id } = req.params

    const existingClient = await get('SELECT * FROM clients WHERE id = ?', [id])
    if (!existingClient) {
      return res.status(404).json({ error: 'Клиент не найден' })
    }

    await run('DELETE FROM clients WHERE id = ?', [id])
    res.json({ message: 'Клиент удален успешно' })
  } catch (error) {
    console.error('Ошибка удаления клиента:', error)
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

app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, email, phone, category, country, rating } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Имя поставщика обязательно' })
    }

    const result = await run(
      'INSERT INTO suppliers (name, email, phone, category, country, rating, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        email || null,
        phone || null,
        category || null,
        country || null,
        rating || 0,
        new Date().toISOString(),
        new Date().toISOString(),
      ],
    )

    const newSupplier = await get('SELECT * FROM suppliers WHERE id = ?', [result.lastID])
    res.status(201).json(newSupplier)
  } catch (error) {
    console.error('Ошибка создания поставщика:', error)
    res.status(500).json({ error: error.message })
  }
})

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, category, country, rating } = req.body

    const existingSupplier = await get('SELECT * FROM suppliers WHERE id = ?', [id])
    if (!existingSupplier) {
      return res.status(404).json({ error: 'Поставщик не найден' })
    }

    await run(
      'UPDATE suppliers SET name = ?, email = ?, phone = ?, category = ?, country = ?, rating = ?, updatedAt = ? WHERE id = ?',
      [
        name || existingSupplier.name,
        email || existingSupplier.email,
        phone || existingSupplier.phone,
        category || existingSupplier.category,
        country || existingSupplier.country,
        rating || existingSupplier.rating,
        new Date().toISOString(),
        id,
      ],
    )

    const updatedSupplier = await get('SELECT * FROM suppliers WHERE id = ?', [id])
    res.json(updatedSupplier)
  } catch (error) {
    console.error('Ошибка обновления поставщика:', error)
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params

    const existingSupplier = await get('SELECT * FROM suppliers WHERE id = ?', [id])
    if (!existingSupplier) {
      return res.status(404).json({ error: 'Поставщик не найден' })
    }

    await run('DELETE FROM suppliers WHERE id = ?', [id])
    res.json({ message: 'Поставщик удален успешно' })
  } catch (error) {
    console.error('Ошибка удаления поставщика:', error)
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
      console.log(`   - GET/POST/PUT/DELETE /api/estimates`)
      console.log(`   - GET/POST/PUT/DELETE /api/clients`)
      console.log(`   - GET/POST/PUT/DELETE /api/suppliers`)
    })
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

startServer()

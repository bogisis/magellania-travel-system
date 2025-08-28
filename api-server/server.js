const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: ['http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  }),
)
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Инициализация базы данных
const { initDatabase } = require('./database/init')

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'SQLite',
  })
})

// Простые тестовые маршруты
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API сервер работает!',
    endpoints: ['/api/health', '/api/test', '/api/estimates', '/api/clients', '/api/suppliers'],
  })
})

// Routes (добавим позже, когда исправим)
// app.use('/api/estimates', require('./routes/estimates'))
// app.use('/api/clients', require('./routes/clients'))
// app.use('/api/suppliers', require('./routes/suppliers'))
// app.use('/api/tariffs', require('./routes/tariffs'))
// app.use('/api/analytics', require('./routes/analytics'))
// app.use('/api/statistics', require('./routes/statistics'))

// Error handling middleware
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
    // Инициализируем базу данных
    await initDatabase()
    console.log('✅ База данных инициализирована')

    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`🚀 API сервер запущен на порту ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
      console.log(`🔗 CORS разрешен для: http://localhost:5174`)
    })
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error)
    process.exit(1)
  }
}

startServer()

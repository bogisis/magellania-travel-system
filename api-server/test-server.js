const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Простой health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'SQLite',
  })
})

// Простой тест
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API сервер работает!',
    endpoints: ['/api/health', '/api/test'],
  })
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Тестовый API сервер запущен на порту ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔗 CORS разрешен для: http://localhost:5174`)
})

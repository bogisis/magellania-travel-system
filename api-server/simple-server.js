const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: ['http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  }),
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'SQLite',
  })
})

// Тестовые данные
app.get('/api/estimates', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Тур в Аргентину - Иван Петров',
      tourName: 'Аргентинское приключение',
      country: 'Argentina',
      region: 'Buenos Aires',
      startDate: '2024-03-15',
      duration: 7,
      status: 'confirmed',
      clientId: 1,
      totalPrice: 850,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 2,
      name: 'Экскурсия по Буэнос-Айресу - Мария',
      tourName: 'Городские туры',
      country: 'Argentina',
      region: 'Buenos Aires',
      startDate: '2024-02-20',
      duration: 3,
      status: 'draft',
      clientId: 2,
      totalPrice: 320,
      createdAt: '2024-01-10T14:30:00Z',
    },
  ])
})

app.get('/api/clients', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Иван Петров',
      email: 'ivan@example.com',
      phone: '+7-999-123-45-67',
      company: 'ООО "Туризм"',
      country: 'Россия',
      segment: 'premium',
      totalSpent: 1500,
      createdAt: '2024-01-01T09:00:00Z',
    },
    {
      id: 2,
      name: 'Мария Сидорова',
      email: 'maria@example.com',
      phone: '+7-999-234-56-78',
      company: 'ИП Сидорова',
      country: 'Россия',
      segment: 'regular',
      totalSpent: 800,
      createdAt: '2024-01-05T11:00:00Z',
    },
  ])
})

app.get('/api/suppliers', (req, res) => {
  res.json([
    {
      id: 1,
      category: 'hotel',
      name: 'Hotel Austral Plaza',
      email: 'reservas@australplaza.com',
      phone: '+54-11-4123-4567',
      country: 'Argentina',
      rating: 4.5,
      reliability: 95,
      active: true,
      createdAt: '2024-01-01T08:00:00Z',
    },
    {
      id: 2,
      category: 'transport',
      name: 'Patagonia Transfers',
      email: 'info@patagoniatransfers.com',
      phone: '+54-11-5555-0001',
      country: 'Argentina',
      rating: 4.8,
      reliability: 98,
      active: true,
      createdAt: '2024-01-02T10:00:00Z',
    },
  ])
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Простой API сервер запущен на порту ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔗 CORS разрешен для: http://localhost:5174`)
  console.log(`📋 Доступные endpoints:`)
  console.log(`   - GET /api/health`)
  console.log(`   - GET /api/estimates`)
  console.log(`   - GET /api/clients`)
  console.log(`   - GET /api/suppliers`)
})

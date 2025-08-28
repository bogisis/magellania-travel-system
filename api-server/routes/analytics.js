const express = require('express')
const router = express.Router()
const { query } = require('../database/init')

// GET /api/analytics/dashboard - Получить данные для дашборда
router.get('/dashboard', async (req, res) => {
  try {
    // Статистика смет
    const estimatesStats = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        SUM(totalPrice) as totalValue,
        AVG(totalPrice) as avgValue
      FROM estimates
    `)

    // Статистика клиентов
    const clientsStats = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN segment = 'premium' THEN 1 END) as premium,
        COUNT(CASE WHEN segment = 'regular' THEN 1 END) as regular,
        COUNT(CASE WHEN segment = 'new' THEN 1 END) as new,
        SUM(totalSpent) as totalSpent
      FROM clients
    `)

    // Статистика поставщиков
    const suppliersStats = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active,
        COUNT(CASE WHEN active = 0 THEN 1 END) as inactive,
        AVG(rating) as avgRating,
        AVG(reliability) as avgReliability
      FROM suppliers
    `)

    // Топ стран по сметам
    const topCountries = await query(`
      SELECT country, COUNT(*) as count, SUM(totalPrice) as totalValue
      FROM estimates
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY count DESC
      LIMIT 5
    `)

    // Последние сметы
    const recentEstimates = await query(`
      SELECT e.*, c.name as clientName
      FROM estimates e
      LEFT JOIN clients c ON e.clientId = c.id
      ORDER BY e.createdAt DESC
      LIMIT 5
    `)

    // Активность по месяцам
    const monthlyActivity = await query(`
      SELECT 
        strftime('%Y-%m', createdAt) as month,
        COUNT(*) as count,
        SUM(totalPrice) as value
      FROM estimates
      WHERE createdAt >= date('now', '-6 months')
      GROUP BY month
      ORDER BY month DESC
    `)

    res.json({
      estimates: estimatesStats[0],
      clients: clientsStats[0],
      suppliers: suppliersStats[0],
      topCountries,
      recentEstimates,
      monthlyActivity,
    })
  } catch (error) {
    console.error('Ошибка получения аналитики:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/analytics/estimates - Аналитика по сметам
router.get('/estimates', async (req, res) => {
  try {
    const { period = 'month' } = req.query

    let dateFilter = ''
    switch (period) {
      case 'week':
        dateFilter = "WHERE createdAt >= date('now', '-7 days')"
        break
      case 'month':
        dateFilter = "WHERE createdAt >= date('now', '-30 days')"
        break
      case 'quarter':
        dateFilter = "WHERE createdAt >= date('now', '-90 days')"
        break
      case 'year':
        dateFilter = "WHERE createdAt >= date('now', '-365 days')"
        break
      default:
        dateFilter = ''
    }

    // Статистика по статусам
    const statusStats = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(totalPrice) as totalValue,
        AVG(totalPrice) as avgValue
      FROM estimates
      ${dateFilter}
      GROUP BY status
      ORDER BY count DESC
    `)

    // Статистика по странам
    const countryStats = await query(`
      SELECT 
        country,
        COUNT(*) as count,
        SUM(totalPrice) as totalValue
      FROM estimates
      ${dateFilter}
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY totalValue DESC
      LIMIT 10
    `)

    // Динамика по дням
    const dailyTrend = await query(`
      SELECT 
        date(createdAt) as date,
        COUNT(*) as count,
        SUM(totalPrice) as value
      FROM estimates
      ${dateFilter}
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `)

    res.json({
      statusStats,
      countryStats,
      dailyTrend,
    })
  } catch (error) {
    console.error('Ошибка получения аналитики смет:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/analytics/clients - Аналитика по клиентам
router.get('/clients', async (req, res) => {
  try {
    // Статистика по сегментам
    const segmentStats = await query(`
      SELECT 
        segment,
        COUNT(*) as count,
        SUM(totalSpent) as totalSpent,
        AVG(totalSpent) as avgSpent
      FROM clients
      GROUP BY segment
      ORDER BY totalSpent DESC
    `)

    // Статистика по странам
    const countryStats = await query(`
      SELECT 
        country,
        COUNT(*) as count,
        SUM(totalSpent) as totalSpent
      FROM clients
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY totalSpent DESC
      LIMIT 10
    `)

    // Топ клиентов по тратам
    const topClients = await query(`
      SELECT 
        name,
        email,
        segment,
        totalSpent,
        lastInteraction
      FROM clients
      WHERE totalSpent > 0
      ORDER BY totalSpent DESC
      LIMIT 10
    `)

    res.json({
      segmentStats,
      countryStats,
      topClients,
    })
  } catch (error) {
    console.error('Ошибка получения аналитики клиентов:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/analytics/suppliers - Аналитика по поставщикам
router.get('/suppliers', async (req, res) => {
  try {
    // Статистика по категориям
    const categoryStats = await query(`
      SELECT 
        category,
        COUNT(*) as count,
        AVG(rating) as avgRating,
        AVG(reliability) as avgReliability
      FROM suppliers
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `)

    // Статистика по странам
    const countryStats = await query(`
      SELECT 
        country,
        COUNT(*) as count,
        AVG(rating) as avgRating
      FROM suppliers
      WHERE country IS NOT NULL AND country != ''
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `)

    // Топ поставщиков по рейтингу
    const topSuppliers = await query(`
      SELECT 
        name,
        category,
        country,
        rating,
        reliability,
        commission
      FROM suppliers
      WHERE rating > 0
      ORDER BY rating DESC, reliability DESC
      LIMIT 10
    `)

    res.json({
      categoryStats,
      countryStats,
      topSuppliers,
    })
  } catch (error) {
    console.error('Ошибка получения аналитики поставщиков:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

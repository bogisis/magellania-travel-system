const express = require('express')
const router = express.Router()
const { query } = require('../database/init')

// GET /api/statistics/estimates - Получить статистику смет
router.get('/estimates', async (req, res) => {
  try {
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as drafts,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        SUM(totalPrice) as totalValue,
        AVG(totalPrice) as avgValue
      FROM estimates
    `)
    
    res.json(stats[0])
  } catch (error) {
    console.error('Ошибка получения статистики:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

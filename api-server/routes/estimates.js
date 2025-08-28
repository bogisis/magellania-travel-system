const express = require('express')
const router = express.Router()
const { query, get, run } = require('../database/init')

// GET /api/estimates - Получить все сметы
router.get('/', async (req, res) => {
  try {
    const { status, clientId, search } = req.query
    
    let sql = `
      SELECT e.*, c.name as clientName, c.email as clientEmail
      FROM estimates e
      LEFT JOIN clients c ON e.clientId = c.id
      WHERE 1=1
    `
    const params = []
    
    if (status) {
      sql += ' AND e.status = ?'
      params.push(status)
    }
    
    if (clientId) {
      sql += ' AND e.clientId = ?'
      params.push(clientId)
    }
    
    if (search) {
      sql += ' AND (e.name LIKE ? OR e.tourName LIKE ? OR c.name LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    sql += ' ORDER BY e.createdAt DESC'
    
    const estimates = await query(sql, params)
    
    // Парсим JSON поля
    const parsedEstimates = estimates.map(estimate => ({
      ...estimate,
      tags: JSON.parse(estimate.tags || '[]')
    }))
    
    res.json(parsedEstimates)
  } catch (error) {
    console.error('Ошибка получения смет:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/estimates/:id - Получить смету по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const sql = `
      SELECT e.*, c.name as clientName, c.email as clientEmail, c.phone as clientPhone
      FROM estimates e
      LEFT JOIN clients c ON e.clientId = c.id
      WHERE e.id = ?
    `
    
    const estimate = await get(sql, [id])
    
    if (!estimate) {
      return res.status(404).json({ error: 'Смета не найдена' })
    }
    
    // Парсим JSON поля
    estimate.tags = JSON.parse(estimate.tags || '[]')
    
    res.json(estimate)
  } catch (error) {
    console.error('Ошибка получения сметы:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/estimates - Создать новую смету
router.post('/', async (req, res) => {
  try {
    const {
      name,
      tourName,
      country,
      region,
      startDate,
      duration,
      status = 'draft',
      clientId,
      assignedManager,
      totalPrice = 0,
      margin = 0,
      discount = 0,
      tags = []
    } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Название сметы обязательно' })
    }
    
    const sql = `
      INSERT INTO estimates (
        name, tourName, country, region, startDate, duration, status,
        clientId, assignedManager, totalPrice, margin, discount, tags,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `
    
    const params = [
      name, tourName, country, region, startDate, duration, status,
      clientId, assignedManager, totalPrice, margin, discount, JSON.stringify(tags)
    ]
    
    const result = await run(sql, params)
    
    // Получаем созданную смету
    const createdEstimate = await get('SELECT * FROM estimates WHERE id = ?', [result.id])
    createdEstimate.tags = JSON.parse(createdEstimate.tags || '[]')
    
    res.status(201).json({
      message: 'Смета создана успешно',
      estimate: createdEstimate
    })
  } catch (error) {
    console.error('Ошибка создания сметы:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/estimates/:id - Обновить смету
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      tourName,
      country,
      region,
      startDate,
      duration,
      status,
      clientId,
      assignedManager,
      totalPrice,
      margin,
      discount,
      tags
    } = req.body
    
    // Проверяем существование сметы
    const existingEstimate = await get('SELECT * FROM estimates WHERE id = ?', [id])
    if (!existingEstimate) {
      return res.status(404).json({ error: 'Смета не найдена' })
    }
    
    const sql = `
      UPDATE estimates SET
        name = COALESCE(?, name),
        tourName = COALESCE(?, tourName),
        country = COALESCE(?, country),
        region = COALESCE(?, region),
        startDate = COALESCE(?, startDate),
        duration = COALESCE(?, duration),
        status = COALESCE(?, status),
        clientId = COALESCE(?, clientId),
        assignedManager = COALESCE(?, assignedManager),
        totalPrice = COALESCE(?, totalPrice),
        margin = COALESCE(?, margin),
        discount = COALESCE(?, discount),
        tags = COALESCE(?, tags),
        updatedAt = datetime('now')
      WHERE id = ?
    `
    
    const params = [
      name, tourName, country, region, startDate, duration, status,
      clientId, assignedManager, totalPrice, margin, discount,
      tags ? JSON.stringify(tags) : null,
      id
    ]
    
    await run(sql, params)
    
    // Получаем обновленную смету
    const updatedEstimate = await get('SELECT * FROM estimates WHERE id = ?', [id])
    updatedEstimate.tags = JSON.parse(updatedEstimate.tags || '[]')
    
    res.json({
      message: 'Смета обновлена успешно',
      estimate: updatedEstimate
    })
  } catch (error) {
    console.error('Ошибка обновления сметы:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/estimates/:id - Удалить смету
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Проверяем существование сметы
    const existingEstimate = await get('SELECT * FROM estimates WHERE id = ?', [id])
    if (!existingEstimate) {
      return res.status(404).json({ error: 'Смета не найдена' })
    }
    
    await run('DELETE FROM estimates WHERE id = ?', [id])
    
    res.json({ message: 'Смета удалена успешно' })
  } catch (error) {
    console.error('Ошибка удаления сметы:', error)
    res.status(500).json({ error: error.message })
  }
})



module.exports = router

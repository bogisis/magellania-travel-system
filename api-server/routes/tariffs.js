const express = require('express')
const router = express.Router()
const { query, get, run } = require('../database/init')

// GET /api/tariffs - Получить все тарифы
router.get('/', async (req, res) => {
  try {
    const { category, location, active, supplierId, search } = req.query
    
    let sql = `
      SELECT t.*, s.name as supplierName, s.email as supplierEmail
      FROM tariffs t
      LEFT JOIN suppliers s ON t.supplierId = s.id
      WHERE 1=1
    `
    const params = []
    
    if (category) {
      sql += ' AND t.category = ?'
      params.push(category)
    }
    
    if (location) {
      sql += ' AND t.location = ?'
      params.push(location)
    }
    
    if (active !== undefined) {
      sql += ' AND t.active = ?'
      params.push(active === 'true' ? 1 : 0)
    }
    
    if (supplierId) {
      sql += ' AND t.supplierId = ?'
      params.push(supplierId)
    }
    
    if (search) {
      sql += ' AND (t.name LIKE ? OR t.description LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm)
    }
    
    sql += ' ORDER BY t.name ASC'
    
    const tariffs = await query(sql, params)
    res.json(tariffs)
  } catch (error) {
    console.error('Ошибка получения тарифов:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/tariffs/:id - Получить тариф по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const sql = `
      SELECT t.*, s.name as supplierName, s.email as supplierEmail
      FROM tariffs t
      LEFT JOIN suppliers s ON t.supplierId = s.id
      WHERE t.id = ?
    `
    
    const tariff = await get(sql, [id])
    
    if (!tariff) {
      return res.status(404).json({ error: 'Тариф не найден' })
    }
    
    res.json(tariff)
  } catch (error) {
    console.error('Ошибка получения тарифа:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/tariffs - Создать новый тариф
router.post('/', async (req, res) => {
  try {
    const {
      category,
      name,
      description,
      pricePerUnit,
      currency = 'USD',
      season = 'year',
      location,
      minPax = 1,
      maxPax,
      supplierId,
      active = true
    } = req.body
    
    if (!name || !pricePerUnit) {
      return res.status(400).json({ error: 'Название и цена обязательны' })
    }
    
    const sql = `
      INSERT INTO tariffs (
        category, name, description, pricePerUnit, currency, season,
        location, minPax, maxPax, supplierId, active, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
    
    const params = [
      category, name, description, pricePerUnit, currency, season,
      location, minPax, maxPax, supplierId, active ? 1 : 0
    ]
    
    const result = await run(sql, params)
    
    // Получаем созданный тариф
    const createdTariff = await get('SELECT * FROM tariffs WHERE id = ?', [result.id])
    
    res.status(201).json({
      message: 'Тариф создан успешно',
      tariff: createdTariff
    })
  } catch (error) {
    console.error('Ошибка создания тарифа:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/tariffs/:id - Обновить тариф
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      category,
      name,
      description,
      pricePerUnit,
      currency,
      season,
      location,
      minPax,
      maxPax,
      supplierId,
      active
    } = req.body
    
    // Проверяем существование тарифа
    const existingTariff = await get('SELECT * FROM tariffs WHERE id = ?', [id])
    if (!existingTariff) {
      return res.status(404).json({ error: 'Тариф не найден' })
    }
    
    const sql = `
      UPDATE tariffs SET
        category = COALESCE(?, category),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        pricePerUnit = COALESCE(?, pricePerUnit),
        currency = COALESCE(?, currency),
        season = COALESCE(?, season),
        location = COALESCE(?, location),
        minPax = COALESCE(?, minPax),
        maxPax = COALESCE(?, maxPax),
        supplierId = COALESCE(?, supplierId),
        active = COALESCE(?, active)
      WHERE id = ?
    `
    
    const params = [
      category, name, description, pricePerUnit, currency, season,
      location, minPax, maxPax, supplierId,
      active !== undefined ? (active ? 1 : 0) : null,
      id
    ]
    
    await run(sql, params)
    
    // Получаем обновленный тариф
    const updatedTariff = await get('SELECT * FROM tariffs WHERE id = ?', [id])
    
    res.json({
      message: 'Тариф обновлен успешно',
      tariff: updatedTariff
    })
  } catch (error) {
    console.error('Ошибка обновления тарифа:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/tariffs/:id - Удалить тариф
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Проверяем существование тарифа
    const existingTariff = await get('SELECT * FROM tariffs WHERE id = ?', [id])
    if (!existingTariff) {
      return res.status(404).json({ error: 'Тариф не найден' })
    }
    
    await run('DELETE FROM tariffs WHERE id = ?', [id])
    
    res.json({ message: 'Тариф удален успешно' })
  } catch (error) {
    console.error('Ошибка удаления тарифа:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router

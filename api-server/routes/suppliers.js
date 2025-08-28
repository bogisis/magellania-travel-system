const express = require('express')
const router = express.Router()
const { query, get, run } = require('../database/init')

// GET /api/suppliers - Получить всех поставщиков
router.get('/', async (req, res) => {
  try {
    const { category, country, active, search } = req.query
    
    let sql = 'SELECT * FROM suppliers WHERE 1=1'
    const params = []
    
    if (category) {
      sql += ' AND category = ?'
      params.push(category)
    }
    
    if (country) {
      sql += ' AND country = ?'
      params.push(country)
    }
    
    if (active !== undefined) {
      sql += ' AND active = ?'
      params.push(active === 'true' ? 1 : 0)
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    sql += ' ORDER BY name ASC'
    
    const suppliers = await query(sql, params)
    
    // Парсим JSON поля
    const parsedSuppliers = suppliers.map(supplier => ({
      ...supplier,
      contracts: JSON.parse(supplier.contracts || '[]'),
      performanceMetrics: JSON.parse(supplier.performanceMetrics || '{}'),
      tags: JSON.parse(supplier.tags || '[]')
    }))
    
    res.json(parsedSuppliers)
  } catch (error) {
    console.error('Ошибка получения поставщиков:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/suppliers/:id - Получить поставщика по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const supplier = await get('SELECT * FROM suppliers WHERE id = ?', [id])
    
    if (!supplier) {
      return res.status(404).json({ error: 'Поставщик не найден' })
    }
    
    // Парсим JSON поля
    supplier.contracts = JSON.parse(supplier.contracts || '[]')
    supplier.performanceMetrics = JSON.parse(supplier.performanceMetrics || '{}')
    supplier.tags = JSON.parse(supplier.tags || '[]')
    
    res.json(supplier)
  } catch (error) {
    console.error('Ошибка получения поставщика:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/suppliers - Создать нового поставщика
router.post('/', async (req, res) => {
  try {
    const {
      category,
      name,
      email,
      phone,
      company,
      country,
      region,
      rating = 0,
      reliability = 0,
      commission = 0,
      paymentTerms,
      notes,
      active = true,
      contracts = [],
      performanceMetrics = {},
      blacklistStatus = false,
      tags = []
    } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Название поставщика обязательно' })
    }
    
    const sql = `
      INSERT INTO suppliers (
        category, name, email, phone, company, country, region, rating,
        reliability, commission, paymentTerms, notes, active, contracts,
        performanceMetrics, blacklistStatus, tags, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
    
    const params = [
      category, name, email, phone, company, country, region, rating,
      reliability, commission, paymentTerms, notes, active ? 1 : 0,
      JSON.stringify(contracts), JSON.stringify(performanceMetrics),
      blacklistStatus ? 1 : 0, JSON.stringify(tags)
    ]
    
    const result = await run(sql, params)
    
    // Получаем созданного поставщика
    const createdSupplier = await get('SELECT * FROM suppliers WHERE id = ?', [result.id])
    createdSupplier.contracts = JSON.parse(createdSupplier.contracts || '[]')
    createdSupplier.performanceMetrics = JSON.parse(createdSupplier.performanceMetrics || '{}')
    createdSupplier.tags = JSON.parse(createdSupplier.tags || '[]')
    
    res.status(201).json({
      message: 'Поставщик создан успешно',
      supplier: createdSupplier
    })
  } catch (error) {
    console.error('Ошибка создания поставщика:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/suppliers/:id - Обновить поставщика
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      category,
      name,
      email,
      phone,
      company,
      country,
      region,
      rating,
      reliability,
      commission,
      paymentTerms,
      notes,
      active,
      contracts,
      performanceMetrics,
      blacklistStatus,
      tags
    } = req.body
    
    // Проверяем существование поставщика
    const existingSupplier = await get('SELECT * FROM suppliers WHERE id = ?', [id])
    if (!existingSupplier) {
      return res.status(404).json({ error: 'Поставщик не найден' })
    }
    
    const sql = `
      UPDATE suppliers SET
        category = COALESCE(?, category),
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        company = COALESCE(?, company),
        country = COALESCE(?, country),
        region = COALESCE(?, region),
        rating = COALESCE(?, rating),
        reliability = COALESCE(?, reliability),
        commission = COALESCE(?, commission),
        paymentTerms = COALESCE(?, paymentTerms),
        notes = COALESCE(?, notes),
        active = COALESCE(?, active),
        contracts = COALESCE(?, contracts),
        performanceMetrics = COALESCE(?, performanceMetrics),
        blacklistStatus = COALESCE(?, blacklistStatus),
        tags = COALESCE(?, tags)
      WHERE id = ?
    `
    
    const params = [
      category, name, email, phone, company, country, region, rating,
      reliability, commission, paymentTerms, notes,
      active !== undefined ? (active ? 1 : 0) : null,
      contracts ? JSON.stringify(contracts) : null,
      performanceMetrics ? JSON.stringify(performanceMetrics) : null,
      blacklistStatus !== undefined ? (blacklistStatus ? 1 : 0) : null,
      tags ? JSON.stringify(tags) : null,
      id
    ]
    
    await run(sql, params)
    
    // Получаем обновленного поставщика
    const updatedSupplier = await get('SELECT * FROM suppliers WHERE id = ?', [id])
    updatedSupplier.contracts = JSON.parse(updatedSupplier.contracts || '[]')
    updatedSupplier.performanceMetrics = JSON.parse(updatedSupplier.performanceMetrics || '{}')
    updatedSupplier.tags = JSON.parse(updatedSupplier.tags || '[]')
    
    res.json({
      message: 'Поставщик обновлен успешно',
      supplier: updatedSupplier
    })
  } catch (error) {
    console.error('Ошибка обновления поставщика:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/suppliers/:id - Удалить поставщика
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Проверяем существование поставщика
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

module.exports = router

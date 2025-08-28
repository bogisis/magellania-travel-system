const express = require('express')
const router = express.Router()
const { query, get, run } = require('../database/init')

// GET /api/clients - Получить всех клиентов
router.get('/', async (req, res) => {
  try {
    const { segment, country, search } = req.query
    
    let sql = 'SELECT * FROM clients WHERE 1=1'
    const params = []
    
    if (segment) {
      sql += ' AND segment = ?'
      params.push(segment)
    }
    
    if (country) {
      sql += ' AND country = ?'
      params.push(country)
    }
    
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)'
      const searchTerm = `%${search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    sql += ' ORDER BY createdAt DESC'
    
    const clients = await query(sql, params)
    
    // Парсим JSON поля
    const parsedClients = clients.map(client => ({
      ...client,
      preferences: JSON.parse(client.preferences || '{}'),
      tags: JSON.parse(client.tags || '[]')
    }))
    
    res.json(parsedClients)
  } catch (error) {
    console.error('Ошибка получения клиентов:', error)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/clients/:id - Получить клиента по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const client = await get('SELECT * FROM clients WHERE id = ?', [id])
    
    if (!client) {
      return res.status(404).json({ error: 'Клиент не найден' })
    }
    
    // Парсим JSON поля
    client.preferences = JSON.parse(client.preferences || '{}')
    client.tags = JSON.parse(client.tags || '[]')
    
    res.json(client)
  } catch (error) {
    console.error('Ошибка получения клиента:', error)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/clients - Создать нового клиента
router.post('/', async (req, res) => {
  try {
    const {
      type = 'individual',
      name,
      email,
      phone,
      company,
      contactPerson,
      country,
      source,
      segment = 'new',
      assignedManager,
      preferences = {},
      tags = []
    } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Имя клиента обязательно' })
    }
    
    const sql = `
      INSERT INTO clients (
        type, name, email, phone, company, contactPerson, country, source,
        segment, assignedManager, preferences, tags, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `
    
    const params = [
      type, name, email, phone, company, contactPerson, country, source,
      segment, assignedManager, JSON.stringify(preferences), JSON.stringify(tags)
    ]
    
    const result = await run(sql, params)
    
    // Получаем созданного клиента
    const createdClient = await get('SELECT * FROM clients WHERE id = ?', [result.id])
    createdClient.preferences = JSON.parse(createdClient.preferences || '{}')
    createdClient.tags = JSON.parse(createdClient.tags || '[]')
    
    res.status(201).json({
      message: 'Клиент создан успешно',
      client: createdClient
    })
  } catch (error) {
    console.error('Ошибка создания клиента:', error)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/clients/:id - Обновить клиента
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      type,
      name,
      email,
      phone,
      company,
      contactPerson,
      country,
      source,
      segment,
      assignedManager,
      preferences,
      tags
    } = req.body
    
    // Проверяем существование клиента
    const existingClient = await get('SELECT * FROM clients WHERE id = ?', [id])
    if (!existingClient) {
      return res.status(404).json({ error: 'Клиент не найден' })
    }
    
    const sql = `
      UPDATE clients SET
        type = COALESCE(?, type),
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        company = COALESCE(?, company),
        contactPerson = COALESCE(?, contactPerson),
        country = COALESCE(?, country),
        source = COALESCE(?, source),
        segment = COALESCE(?, segment),
        assignedManager = COALESCE(?, assignedManager),
        preferences = COALESCE(?, preferences),
        tags = COALESCE(?, tags)
      WHERE id = ?
    `
    
    const params = [
      type, name, email, phone, company, contactPerson, country, source,
      segment, assignedManager,
      preferences ? JSON.stringify(preferences) : null,
      tags ? JSON.stringify(tags) : null,
      id
    ]
    
    await run(sql, params)
    
    // Получаем обновленного клиента
    const updatedClient = await get('SELECT * FROM clients WHERE id = ?', [id])
    updatedClient.preferences = JSON.parse(updatedClient.preferences || '{}')
    updatedClient.tags = JSON.parse(updatedClient.tags || '[]')
    
    res.json({
      message: 'Клиент обновлен успешно',
      client: updatedClient
    })
  } catch (error) {
    console.error('Ошибка обновления клиента:', error)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/clients/:id - Удалить клиента
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Проверяем существование клиента
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

module.exports = router

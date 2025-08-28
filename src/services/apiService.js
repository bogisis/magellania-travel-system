/**
 * API сервис для работы с SQLite базой данных
 * Заменяет IndexedDB на внешнюю базу данных
 */

const API_BASE_URL = 'http://localhost:3001/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * Базовый метод для HTTP запросов
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  // ===== ESTIMATES API =====

  /**
   * Получить все сметы
   */
  async getEstimates() {
    return this.request('/estimates')
  }

  /**
   * Получить смету по ID
   */
  async getEstimate(id) {
    return this.request(`/estimates/${id}`)
  }

  /**
   * Создать новую смету
   */
  async createEstimate(estimateData) {
    return this.request('/estimates', {
      method: 'POST',
      body: JSON.stringify(estimateData),
    })
  }

  /**
   * Обновить смету
   */
  async updateEstimate(id, estimateData) {
    return this.request(`/estimates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(estimateData),
    })
  }

  /**
   * Удалить смету
   */
  async deleteEstimate(id) {
    return this.request(`/estimates/${id}`, {
      method: 'DELETE',
    })
  }

  // ===== CLIENTS API =====

  /**
   * Получить всех клиентов
   */
  async getClients() {
    return this.request('/clients')
  }

  /**
   * Получить клиента по ID
   */
  async getClient(id) {
    return this.request(`/clients/${id}`)
  }

  /**
   * Создать нового клиента
   */
  async createClient(clientData) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    })
  }

  /**
   * Обновить клиента
   */
  async updateClient(id, clientData) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    })
  }

  /**
   * Удалить клиента
   */
  async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    })
  }

  // ===== SUPPLIERS API =====

  /**
   * Получить всех поставщиков
   */
  async getSuppliers() {
    return this.request('/suppliers')
  }

  /**
   * Получить поставщика по ID
   */
  async getSupplier(id) {
    return this.request(`/suppliers/${id}`)
  }

  /**
   * Создать нового поставщика
   */
  async createSupplier(supplierData) {
    return this.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    })
  }

  /**
   * Обновить поставщика
   */
  async updateSupplier(id, supplierData) {
    return this.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    })
  }

  /**
   * Удалить поставщика
   */
  async deleteSupplier(id) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
    })
  }

  // ===== HEALTH CHECK =====

  /**
   * Проверить статус API
   */
  async healthCheck() {
    return this.request('/health')
  }

  // ===== УТИЛИТЫ =====

  /**
   * Проверить подключение к API
   */
  async testConnection() {
    try {
      const health = await this.healthCheck()
      return {
        connected: true,
        status: health.status,
        database: health.database,
        timestamp: health.timestamp,
      }
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      }
    }
  }

  /**
   * Мигрировать данные из IndexedDB в SQLite
   */
  async migrateFromIndexedDB() {
    try {
      console.log('🚀 Начало миграции данных из IndexedDB...')

      // Импортируем старую базу данных
      const { db: oldDb } = await import('./database.js')

      // Мигрируем клиентов
      const clients = await oldDb.clients.toArray()
      console.log(`📊 Найдено ${clients.length} клиентов для миграции`)

      for (const client of clients) {
        try {
          await this.createClient({
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            country: client.country,
            segment: client.segment || 'new',
            totalSpent: client.totalSpent || 0,
          })
        } catch (error) {
          console.warn(`⚠️ Ошибка миграции клиента ${client.name}:`, error.message)
        }
      }

      // Мигрируем поставщиков
      const suppliers = await oldDb.suppliers.toArray()
      console.log(`📊 Найдено ${suppliers.length} поставщиков для миграции`)

      for (const supplier of suppliers) {
        try {
          await this.createSupplier({
            category: supplier.category,
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            country: supplier.country,
            rating: supplier.rating || 0,
            active: supplier.active !== false,
          })
        } catch (error) {
          console.warn(`⚠️ Ошибка миграции поставщика ${supplier.name}:`, error.message)
        }
      }

      // Мигрируем сметы
      const estimates = await oldDb.estimates.toArray()
      console.log(`📊 Найдено ${estimates.length} смет для миграции`)

      for (const estimate of estimates) {
        try {
          await this.createEstimate({
            name: estimate.name,
            tourName: estimate.tourName,
            country: estimate.country,
            region: estimate.region,
            startDate: estimate.startDate,
            duration: estimate.duration,
            status: estimate.status || 'draft',
            clientId: estimate.clientId,
            totalPrice: estimate.totalPrice || 0,
          })
        } catch (error) {
          console.warn(`⚠️ Ошибка миграции сметы ${estimate.name}:`, error.message)
        }
      }

      console.log('✅ Миграция данных завершена успешно!')
      return {
        success: true,
        migrated: {
          clients: clients.length,
          suppliers: suppliers.length,
          estimates: estimates.length,
        },
      }
    } catch (error) {
      console.error('❌ Ошибка миграции:', error)
      throw error
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
export const apiService = new ApiService()

// Экспортируем класс для тестирования
export { ApiService }

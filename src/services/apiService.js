/**
 * API сервис для работы с SQLite базой данных
 * Заменяет IndexedDB на внешнюю базу данных
 */

import { authService } from './authService.js'

const API_BASE_URL = 'http://localhost:3001/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  /**
   * Базовый метод для HTTP запросов
   */
  async request(endpoint, options = {}) {
    // Проверяем аутентификацию (временно отключена для разработки)
    // await authService.refreshTokenIfNeeded()

    const url = `${this.baseURL}${endpoint}`

    const config = {
      headers: {
        'Content-Type': 'application/json',
        // ...authService.getAuthHeaders(),
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
   * Мигрировать данные из IndexedDB в SQLite (отключено)
   */
  async migrateFromIndexedDB() {
    console.log('🚫 Миграция из IndexedDB отключена - используем только SQLite')
    return {
      success: true,
      migrated: {
        clients: 0,
        suppliers: 0,
        estimates: 0,
      },
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
export const apiService = new ApiService()

// Экспортируем класс для тестирования
export { ApiService }

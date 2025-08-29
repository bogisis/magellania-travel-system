// src/services/EstimateRepository.js
// Репозиторий для доступа к данным смет

import { apiService } from './apiService.js'

export class EstimateRepository {
  /**
   * Получение всех смет
   */
  static async getAll() {
    try {
      return await apiService.getEstimates()
    } catch (error) {
      throw new Error(`Failed to fetch estimates: ${error.message}`)
    }
  }

  /**
   * Получение сметы по ID
   */
  static async getById(id) {
    try {
      return await apiService.getEstimate(id)
    } catch (error) {
      throw new Error(`Failed to fetch estimate ${id}: ${error.message}`)
    }
  }

  /**
   * Создание новой сметы
   */
  static async create(estimateData) {
    try {
      return await apiService.createEstimate(estimateData)
    } catch (error) {
      throw new Error(`Failed to create estimate: ${error.message}`)
    }
  }

  /**
   * Обновление сметы
   */
  static async update(id, estimateData) {
    try {
      return await apiService.updateEstimate(id, estimateData)
    } catch (error) {
      throw new Error(`Failed to update estimate ${id}: ${error.message}`)
    }
  }

  /**
   * Удаление сметы
   */
  static async delete(id) {
    try {
      return await apiService.deleteEstimate(id)
    } catch (error) {
      throw new Error(`Failed to delete estimate ${id}: ${error.message}`)
    }
  }

  /**
   * Поиск смет по критериям
   */
  static async search(criteria) {
    try {
      const params = new URLSearchParams()
      
      if (criteria.query) {
        params.append('q', criteria.query)
      }
      
      if (criteria.status) {
        params.append('status', criteria.status)
      }
      
      if (criteria.clientId) {
        params.append('clientId', criteria.clientId)
      }
      
      if (criteria.dateFrom) {
        params.append('dateFrom', criteria.dateFrom)
      }
      
      if (criteria.dateTo) {
        params.append('dateTo', criteria.dateTo)
      }
      
      const queryString = params.toString()
      const url = queryString ? `/api/estimates?${queryString}` : '/api/estimates'
      
      return await apiService.request('GET', url)
    } catch (error) {
      throw new Error(`Failed to search estimates: ${error.message}`)
    }
  }

  /**
   * Получение статистики по сметам
   */
  static async getStatistics() {
    try {
      const estimates = await this.getAll()
      
      return {
        total: estimates.length,
        totalRevenue: estimates.reduce((sum, est) => sum + (Number(est.totalPrice) || 0), 0),
        averageValue: estimates.length > 0 
          ? estimates.reduce((sum, est) => sum + (Number(est.totalPrice) || 0), 0) / estimates.length 
          : 0,
        byStatus: estimates.reduce((acc, est) => {
          const status = est.status || 'draft'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})
      }
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`)
    }
  }

  /**
   * Получение смет по статусу
   */
  static async getByStatus(status) {
    try {
      return await this.search({ status })
    } catch (error) {
      throw new Error(`Failed to get estimates by status ${status}: ${error.message}`)
    }
  }

  /**
   * Получение смет клиента
   */
  static async getByClient(clientId) {
    try {
      return await this.search({ clientId })
    } catch (error) {
      throw new Error(`Failed to get estimates for client ${clientId}: ${error.message}`)
    }
  }

  /**
   * Экспорт сметы в PDF
   */
  static async exportToPDF(id) {
    try {
      return await apiService.request('GET', `/api/estimates/${id}/export/pdf`)
    } catch (error) {
      throw new Error(`Failed to export estimate ${id} to PDF: ${error.message}`)
    }
  }

  /**
   * Экспорт сметы в CSV
   */
  static async exportToCSV(id) {
    try {
      return await apiService.request('GET', `/api/estimates/${id}/export/csv`)
    } catch (error) {
      throw new Error(`Failed to export estimate ${id} to CSV: ${error.message}`)
    }
  }

  /**
   * Дублирование сметы
   */
  static async duplicate(id) {
    try {
      const original = await this.getById(id)
      const duplicated = {
        ...original,
        id: undefined,
        name: `${original.name} (копия)`,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return await this.create(duplicated)
    } catch (error) {
      throw new Error(`Failed to duplicate estimate ${id}: ${error.message}`)
    }
  }

  /**
   * Изменение статуса сметы
   */
  static async updateStatus(id, status) {
    try {
      return await this.update(id, { status })
    } catch (error) {
      throw new Error(`Failed to update status of estimate ${id}: ${error.message}`)
    }
  }

  /**
   * Получение истории изменений сметы
   */
  static async getHistory(id) {
    try {
      return await apiService.request('GET', `/api/estimates/${id}/history`)
    } catch (error) {
      throw new Error(`Failed to get history for estimate ${id}: ${error.message}`)
    }
  }

  /**
   * Валидация данных перед сохранением
   */
  static validateBeforeSave(estimateData) {
    const errors = []

    if (!estimateData.name || estimateData.name.trim() === '') {
      errors.push('Название сметы обязательно')
    }

    if (!estimateData.client || estimateData.client.trim() === '') {
      errors.push('Клиент обязателен')
    }

    if (!estimateData.location?.country) {
      errors.push('Страна обязательна')
    }

    if (!estimateData.group?.totalPax || estimateData.group.totalPax <= 0) {
      errors.push('Количество туристов должно быть больше 0')
    }

    if (!Array.isArray(estimateData.hotels) || estimateData.hotels.length === 0) {
      errors.push('Должен быть указан хотя бы один отель')
    }

    if (!Array.isArray(estimateData.tourDays) || estimateData.tourDays.length === 0) {
      errors.push('Должен быть указан хотя бы один день тура')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Подготовка данных для API
   */
  static prepareForAPI(estimateData) {
    return {
      name: estimateData.name || estimateData.title || 'Новая смета',
      tourName: estimateData.tourName || estimateData.title || 'Новый тур',
      client: estimateData.client || '',
      description: estimateData.description || '',
      location: estimateData.location || {},
      tourDates: estimateData.tourDates || {},
      group: estimateData.group || {},
      hotels: estimateData.hotels || [],
      tourDays: estimateData.tourDays || [],
      optionalServices: estimateData.optionalServices || [],
      markup: Number(estimateData.markup) || 0,
      currency: estimateData.currency || 'USD',
      status: estimateData.status || 'draft'
    }
  }

  /**
   * Обработка данных из API
   */
  static processFromAPI(apiData) {
    return {
      ...apiData,
      location: typeof apiData.location === 'string' 
        ? JSON.parse(apiData.location) 
        : apiData.location || {},
      tourDates: typeof apiData.tourDates === 'string' 
        ? JSON.parse(apiData.tourDates) 
        : apiData.tourDates || {},
      group: typeof apiData.group === 'string' 
        ? JSON.parse(apiData.group) 
        : apiData.group || {},
      hotels: typeof apiData.hotels === 'string' 
        ? JSON.parse(apiData.hotels) 
        : apiData.hotels || [],
      tourDays: typeof apiData.tourDays === 'string' 
        ? JSON.parse(apiData.tourDays) 
        : apiData.tourDays || [],
      optionalServices: typeof apiData.optionalServices === 'string' 
        ? JSON.parse(apiData.optionalServices) 
        : apiData.optionalServices || []
    }
  }
}

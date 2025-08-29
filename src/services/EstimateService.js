// src/services/EstimateService.js
// Бизнес-логика для работы со сметами

import { CalculationService } from './CalculationService.js'
import { ValidationService } from './ValidationService.js'

export class EstimateService {
  /**
   * Создание новой сметы с валидацией и расчетами
   */
  static async create(estimateData) {
    // Валидация входных данных
    const validationResult = ValidationService.validateEstimate(estimateData)
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`)
    }

    // Подготовка данных для сохранения
    const preparedData = this.prepareEstimateData(estimateData)
    
    // Автоматический расчет стоимости
    const calculatedData = this.calculateEstimateCosts(preparedData)
    
    return calculatedData
  }

  /**
   * Обновление сметы с валидацией и пересчетом
   */
  static async update(estimateId, updates) {
    // Валидация обновлений
    const validationResult = ValidationService.validateEstimateUpdate(updates)
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`)
    }

    // Подготовка данных для обновления
    const preparedUpdates = this.prepareEstimateData(updates)
    
    // Пересчет стоимости
    const calculatedUpdates = this.calculateEstimateCosts(preparedUpdates)
    
    return { id: estimateId, ...calculatedUpdates }
  }

  /**
   * Подготовка данных сметы для сохранения
   */
  static prepareEstimateData(data) {
    return {
      name: data.name || data.title || 'Новая смета',
      tourName: data.tourName || data.title || 'Новый тур',
      client: data.client || '',
      description: data.description || '',
      location: this.prepareLocationData(data.location),
      tourDates: this.prepareTourDatesData(data.tourDates),
      group: this.prepareGroupData(data.group),
      hotels: this.prepareHotelsData(data.hotels),
      tourDays: this.prepareTourDaysData(data.tourDays),
      optionalServices: this.prepareOptionalServicesData(data.optionalServices),
      markup: Number(data.markup) || 0,
      currency: data.currency || 'USD',
      status: data.status || 'draft'
    }
  }

  /**
   * Расчет стоимости сметы
   */
  static calculateEstimateCosts(estimateData) {
    const baseCost = CalculationService.calculateBaseCost(estimateData)
    const markupAmount = CalculationService.calculateMarkupAmount(estimateData)
    const finalCost = CalculationService.calculateFinalCost(estimateData)

    return {
      ...estimateData,
      baseCost: Math.round(baseCost * 100) / 100,
      markupAmount: Math.round(markupAmount * 100) / 100,
      totalPrice: Math.round(finalCost * 100) / 100
    }
  }

  /**
   * Подготовка данных локации
   */
  static prepareLocationData(location) {
    if (!location) {
      return {
        country: '',
        regions: [],
        cities: [],
        startPoint: '',
        endPoint: ''
      }
    }

    return {
      country: location.country || '',
      regions: Array.isArray(location.regions) ? location.regions : [],
      cities: Array.isArray(location.cities) ? location.cities : [],
      startPoint: location.startPoint || '',
      endPoint: location.endPoint || ''
    }
  }

  /**
   * Подготовка данных дат тура
   */
  static prepareTourDatesData(tourDates) {
    if (!tourDates) {
      return {
        dateType: 'exact',
        startDate: '',
        endDate: '',
        days: 0
      }
    }

    return {
      dateType: tourDates.dateType || 'exact',
      startDate: tourDates.startDate || '',
      endDate: tourDates.endDate || '',
      days: Number(tourDates.days) || 0
    }
  }

  /**
   * Подготовка данных группы
   */
  static prepareGroupData(group) {
    if (!group) {
      return {
        totalPax: 0,
        doubleCount: 0,
        singleCount: 0,
        guidesCount: 0,
        markup: 0
      }
    }

    return {
      totalPax: Number(group.totalPax) || 0,
      doubleCount: Number(group.doubleCount) || 0,
      singleCount: Number(group.singleCount) || 0,
      guidesCount: Number(group.guidesCount) || 0,
      markup: Number(group.markup) || 0
    }
  }

  /**
   * Подготовка данных отелей
   */
  static prepareHotelsData(hotels) {
    if (!Array.isArray(hotels)) return []

    return hotels.map(hotel => ({
      name: hotel.name || '',
      city: hotel.city || '',
      region: hotel.region || '',
      accommodationType: hotel.accommodationType || 'double',
      paxCount: Number(hotel.paxCount) || 0,
      pricePerRoom: Number(hotel.pricePerRoom) || 0,
      nights: Number(hotel.nights) || 1,
      isGuideHotel: Boolean(hotel.isGuideHotel),
      description: hotel.description || ''
    }))
  }

  /**
   * Подготовка данных дней тура
   */
  static prepareTourDaysData(tourDays) {
    if (!Array.isArray(tourDays)) return []

    return tourDays.map(day => ({
      city: day.city || '',
      activities: Array.isArray(day.activities) 
        ? day.activities.map(activity => ({
            name: activity.name || '',
            cost: Number(activity.cost) || 0,
            description: activity.description || ''
          }))
        : []
    }))
  }

  /**
   * Подготовка данных опциональных услуг
   */
  static prepareOptionalServicesData(optionalServices) {
    if (!Array.isArray(optionalServices)) return []

    return optionalServices.map(service => ({
      name: service.name || '',
      cost: Number(service.cost) || 0,
      description: service.description || '',
      quantity: Number(service.quantity) || 1
    }))
  }

  /**
   * Валидация сметы перед сохранением
   */
  static validateEstimateForSave(estimate) {
    const errors = []

    if (!estimate.name || estimate.name.trim() === '') {
      errors.push('Название сметы обязательно')
    }

    if (!estimate.client || estimate.client.trim() === '') {
      errors.push('Клиент обязателен')
    }

    if (!estimate.location?.country) {
      errors.push('Страна обязательна')
    }

    if (!estimate.group?.totalPax || estimate.group.totalPax <= 0) {
      errors.push('Количество туристов должно быть больше 0')
    }

    if (!Array.isArray(estimate.hotels) || estimate.hotels.length === 0) {
      errors.push('Должен быть указан хотя бы один отель')
    }

    if (!Array.isArray(estimate.tourDays) || estimate.tourDays.length === 0) {
      errors.push('Должен быть указан хотя бы один день тура')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Получение статистики по сметам
   */
  static calculateEstimatesStatistics(estimates) {
    if (!Array.isArray(estimates) || estimates.length === 0) {
      return {
        total: 0,
        totalRevenue: 0,
        averageValue: 0,
        byStatus: {
          draft: 0,
          sent: 0,
          approved: 0,
          rejected: 0
        }
      }
    }

    const totalRevenue = estimates.reduce((sum, estimate) => {
      return sum + (Number(estimate.totalPrice) || 0)
    }, 0)

    const byStatus = estimates.reduce((acc, estimate) => {
      const status = estimate.status || 'draft'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    return {
      total: estimates.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageValue: Math.round((totalRevenue / estimates.length) * 100) / 100,
      byStatus: {
        draft: byStatus.draft || 0,
        sent: byStatus.sent || 0,
        approved: byStatus.approved || 0,
        rejected: byStatus.rejected || 0
      }
    }
  }
}

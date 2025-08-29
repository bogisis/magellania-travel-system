/**
 * DiscountService - Сервис для управления скидками и доплатами
 * Реализует систему скидок и доплат согласно архитектуре MAGELLANIA
 */

// Константы для типов скидок и доплат
export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  SEASONAL: 'seasonal',
  URGENCY: 'urgency',
  GROUP_SIZE: 'group_size',
  LOYALTY: 'loyalty',
}

export const SURCHARGE_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  SEASONAL: 'seasonal',
  URGENCY: 'urgency',
  SPECIAL_SERVICES: 'special_services',
}

// Конфигурация скидок по умолчанию
export const DEFAULT_DISCOUNTS = {
  [DISCOUNT_TYPES.GROUP_SIZE]: {
    10: 5, // 5% скидка для групп от 10 человек
    20: 10, // 10% скидка для групп от 20 человек
    30: 15, // 15% скидка для групп от 30 человек
  },
  [DISCOUNT_TYPES.LOYALTY]: {
    repeat_client: 3, // 3% для повторных клиентов
    vip_client: 5, // 5% для VIP клиентов
  },
  [DISCOUNT_TYPES.SEASONAL]: {
    low_season: 10, // 10% в низкий сезон
    shoulder_season: 5, // 5% в межсезонье
  },
}

// Конфигурация доплат по умолчанию
export const DEFAULT_SURCHARGES = {
  [SURCHARGE_TYPES.URGENCY]: {
    same_day: 25, // 25% за срочное бронирование
    next_day: 15, // 15% за бронирование на завтра
    same_week: 10, // 10% за бронирование в течение недели
  },
  [SURCHARGE_TYPES.SEASONAL]: {
    high_season: 20, // 20% в высокий сезон
    peak_season: 30, // 30% в пиковый сезон
  },
  [SURCHARGE_TYPES.SPECIAL_SERVICES]: {
    private_guide: 50, // 50% за индивидуального гида
    luxury_transfer: 30, // 30% за люксовый трансфер
    premium_hotel: 25, // 25% за премиум отель
  },
}

class DiscountService {
  constructor() {
    this.discounts = new Map()
    this.surcharges = new Map()
    this.initializeDefaults()
  }

  /**
   * Инициализация скидок и доплат по умолчанию
   */
  initializeDefaults() {
    // Устанавливаем скидки по умолчанию
    Object.entries(DEFAULT_DISCOUNTS).forEach(([type, config]) => {
      this.discounts.set(type, config)
    })

    // Устанавливаем доплаты по умолчанию
    Object.entries(DEFAULT_SURCHARGES).forEach(([type, config]) => {
      this.surcharges.set(type, config)
    })
  }

  /**
   * Добавление скидки
   * @param {string} type - Тип скидки
   * @param {Object} config - Конфигурация скидки
   */
  addDiscount(type, config) {
    if (!Object.values(DISCOUNT_TYPES).includes(type)) {
      throw new Error(`Неизвестный тип скидки: ${type}`)
    }
    this.discounts.set(type, { ...this.discounts.get(type), ...config })
  }

  /**
   * Добавление доплаты
   * @param {string} type - Тип доплаты
   * @param {Object} config - Конфигурация доплаты
   */
  addSurcharge(type, config) {
    if (!Object.values(SURCHARGE_TYPES).includes(type)) {
      throw new Error(`Неизвестный тип доплаты: ${type}`)
    }
    this.surcharges.set(type, { ...this.surcharges.get(type), ...config })
  }

  /**
   * Расчет скидки для группы
   * @param {number} participantCount - Количество участников
   * @returns {number} Процент скидки
   */
  calculateGroupDiscount(participantCount) {
    const groupDiscounts = this.discounts.get(DISCOUNT_TYPES.GROUP_SIZE) || {}

    // Находим максимальную скидку для данного размера группы
    let maxDiscount = 0
    Object.entries(groupDiscounts).forEach(([minSize, discount]) => {
      if (participantCount >= parseInt(minSize) && discount > maxDiscount) {
        maxDiscount = discount
      }
    })

    return maxDiscount
  }

  /**
   * Расчет скидки для клиента
   * @param {Object} client - Данные клиента
   * @returns {number} Процент скидки
   */
  calculateLoyaltyDiscount(client) {
    const loyaltyDiscounts = this.discounts.get(DISCOUNT_TYPES.LOYALTY) || {}
    let totalDiscount = 0

    if (client.isRepeatClient && loyaltyDiscounts.repeat_client) {
      totalDiscount += loyaltyDiscounts.repeat_client
    }

    if (client.isVipClient && loyaltyDiscounts.vip_client) {
      totalDiscount += loyaltyDiscounts.vip_client
    }

    return totalDiscount
  }

  /**
   * Расчет сезонной скидки
   * @param {string} season - Сезон (low_season, shoulder_season, high_season, peak_season)
   * @returns {number} Процент скидки (отрицательный) или доплаты (положительный)
   */
  calculateSeasonalAdjustment(season) {
    const seasonalDiscounts = this.discounts.get(DISCOUNT_TYPES.SEASONAL) || {}
    const seasonalSurcharges = this.surcharges.get(SURCHARGE_TYPES.SEASONAL) || {}

    // Скидки
    if (seasonalDiscounts[season]) {
      return -seasonalDiscounts[season] // Отрицательное значение для скидки
    }

    // Доплаты
    if (seasonalSurcharges[season]) {
      return seasonalSurcharges[season] // Положительное значение для доплаты
    }

    return 0
  }

  /**
   * Расчет срочной доплаты
   * @param {string} urgency - Срочность (same_day, next_day, same_week)
   * @returns {number} Процент доплаты
   */
  calculateUrgencySurcharge(urgency) {
    const urgencySurcharges = this.surcharges.get(SURCHARGE_TYPES.URGENCY) || {}
    return urgencySurcharges[urgency] || 0
  }

  /**
   * Расчет доплаты за специальные услуги
   * @param {Array} specialServices - Массив специальных услуг
   * @returns {number} Процент доплаты
   */
  calculateSpecialServicesSurcharge(specialServices) {
    const specialSurcharges = this.surcharges.get(SURCHARGE_TYPES.SPECIAL_SERVICES) || {}
    let totalSurcharge = 0

    specialServices.forEach((service) => {
      if (specialSurcharges[service]) {
        totalSurcharge += specialSurcharges[service]
      }
    })

    return totalSurcharge
  }

  /**
   * Применение скидки к стоимости
   * @param {number} baseCost - Базовая стоимость
   * @param {number} discountPercent - Процент скидки
   * @returns {Object} Результат применения скидки
   */
  applyDiscount(baseCost, discountPercent) {
    if (discountPercent <= 0) {
      return {
        originalCost: baseCost,
        discountAmount: 0,
        finalCost: baseCost,
        discountPercent: 0,
      }
    }

    const discountAmount = (baseCost * discountPercent) / 100
    const finalCost = baseCost - discountAmount

    return {
      originalCost: baseCost,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalCost: Math.round(finalCost * 100) / 100,
      discountPercent,
    }
  }

  /**
   * Применение доплаты к стоимости
   * @param {number} baseCost - Базовая стоимость
   * @param {number} surchargePercent - Процент доплаты
   * @returns {Object} Результат применения доплаты
   */
  applySurcharge(baseCost, surchargePercent) {
    if (surchargePercent <= 0) {
      return {
        originalCost: baseCost,
        surchargeAmount: 0,
        finalCost: baseCost,
        surchargePercent: 0,
      }
    }

    const surchargeAmount = (baseCost * surchargePercent) / 100
    const finalCost = baseCost + surchargeAmount

    return {
      originalCost: baseCost,
      surchargeAmount: Math.round(surchargeAmount * 100) / 100,
      finalCost: Math.round(finalCost * 100) / 100,
      surchargePercent,
    }
  }

  /**
   * Комплексный расчет скидок и доплат для сметы
   * @param {Object} estimate - Данные сметы
   * @param {Object} client - Данные клиента
   * @returns {Object} Результат расчета
   */
  calculateEstimateAdjustments(estimate, client = {}) {
    const baseCost = estimate.totalCost || 0
    const adjustments = {
      originalCost: baseCost,
      discounts: [],
      surcharges: [],
      totalDiscount: 0,
      totalSurcharge: 0,
      finalCost: baseCost,
    }

    // Групповая скидка
    if (estimate.participants && estimate.participants.totalPax) {
      const groupDiscount = this.calculateGroupDiscount(estimate.participants.totalPax)
      if (groupDiscount > 0) {
        const discountResult = this.applyDiscount(baseCost, groupDiscount)
        adjustments.discounts.push({
          type: 'group_size',
          description: `Скидка за группу ${estimate.participants.totalPax} чел.`,
          percent: groupDiscount,
          amount: discountResult.discountAmount,
        })
        adjustments.totalDiscount += discountResult.discountAmount
      }
    }

    // Скидка лояльности
    if (client) {
      const loyaltyDiscount = this.calculateLoyaltyDiscount(client)
      if (loyaltyDiscount > 0) {
        const discountResult = this.applyDiscount(baseCost, loyaltyDiscount)
        adjustments.discounts.push({
          type: 'loyalty',
          description: 'Скидка лояльности',
          percent: loyaltyDiscount,
          amount: discountResult.discountAmount,
        })
        adjustments.totalDiscount += discountResult.discountAmount
      }
    }

    // Сезонная корректировка
    if (estimate.season) {
      const seasonalAdjustment = this.calculateSeasonalAdjustment(estimate.season)
      if (seasonalAdjustment !== 0) {
        if (seasonalAdjustment < 0) {
          // Скидка
          const discountResult = this.applyDiscount(baseCost, Math.abs(seasonalAdjustment))
          adjustments.discounts.push({
            type: 'seasonal',
            description: `Сезонная скидка (${estimate.season})`,
            percent: Math.abs(seasonalAdjustment),
            amount: discountResult.discountAmount,
          })
          adjustments.totalDiscount += discountResult.discountAmount
        } else {
          // Доплата
          const surchargeResult = this.applySurcharge(baseCost, seasonalAdjustment)
          adjustments.surcharges.push({
            type: 'seasonal',
            description: `Сезонная доплата (${estimate.season})`,
            percent: seasonalAdjustment,
            amount: surchargeResult.surchargeAmount,
          })
          adjustments.totalSurcharge += surchargeResult.surchargeAmount
        }
      }
    }

    // Срочная доплата
    if (estimate.urgency) {
      const urgencySurcharge = this.calculateUrgencySurcharge(estimate.urgency)
      if (urgencySurcharge > 0) {
        const surchargeResult = this.applySurcharge(baseCost, urgencySurcharge)
        adjustments.surcharges.push({
          type: 'urgency',
          description: `Срочная доплата (${estimate.urgency})`,
          percent: urgencySurcharge,
          amount: surchargeResult.surchargeAmount,
        })
        adjustments.totalSurcharge += surchargeResult.surchargeAmount
      }
    }

    // Доплата за специальные услуги
    if (estimate.specialServices && estimate.specialServices.length > 0) {
      const specialSurcharge = this.calculateSpecialServicesSurcharge(estimate.specialServices)
      if (specialSurcharge > 0) {
        const surchargeResult = this.applySurcharge(baseCost, specialSurcharge)
        adjustments.surcharges.push({
          type: 'special_services',
          description: 'Доплата за специальные услуги',
          percent: specialSurcharge,
          amount: surchargeResult.surchargeAmount,
        })
        adjustments.totalSurcharge += surchargeResult.surchargeAmount
      }
    }

    // Итоговая стоимость
    adjustments.finalCost =
      Math.round((baseCost - adjustments.totalDiscount + adjustments.totalSurcharge) * 100) / 100

    return adjustments
  }

  /**
   * Валидация настроек скидок и доплат
   * @returns {Object} Результат валидации
   */
  validateSettings() {
    const errors = []
    const warnings = []

    // Проверяем, что все типы скидок имеют конфигурацию
    Object.values(DISCOUNT_TYPES).forEach((type) => {
      if (!this.discounts.has(type)) {
        warnings.push(`Отсутствует конфигурация для типа скидки: ${type}`)
      }
    })

    // Проверяем, что все типы доплат имеют конфигурацию
    Object.values(SURCHARGE_TYPES).forEach((type) => {
      if (!this.surcharges.has(type)) {
        warnings.push(`Отсутствует конфигурация для типа доплаты: ${type}`)
      }
    })

    // Проверяем корректность процентных значений
    this.discounts.forEach((config, type) => {
      Object.entries(config).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0 || value > 100) {
          errors.push(`Некорректное значение скидки в ${type}.${key}: ${value}`)
        }
      })
    })

    this.surcharges.forEach((config, type) => {
      Object.entries(config).forEach(([key, value]) => {
        if (typeof value !== 'number' || value < 0) {
          errors.push(`Некорректное значение доплаты в ${type}.${key}: ${value}`)
        }
      })
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Экспорт настроек скидок и доплат
   * @returns {Object} Настройки для экспорта
   */
  exportSettings() {
    return {
      discounts: Object.fromEntries(this.discounts),
      surcharges: Object.fromEntries(this.surcharges),
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Импорт настроек скидок и доплат
   * @param {Object} settings - Настройки для импорта
   */
  importSettings(settings) {
    if (settings.discounts) {
      Object.entries(settings.discounts).forEach(([type, config]) => {
        this.discounts.set(type, config)
      })
    }

    if (settings.surcharges) {
      Object.entries(settings.surcharges).forEach(([type, config]) => {
        this.surcharges.set(type, config)
      })
    }
  }
}

// Создаем и экспортируем единственный экземпляр сервиса
export const discountService = new DiscountService()

export default DiscountService

/**
 * Централизованный сервис для математических расчетов
 * Обеспечивает безопасные вычисления с валидацией типов
 */

export class CalculationService {
  /**
   * Безопасное преобразование в число с валидацией
   */
  static safeNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') {
      return defaultValue
    }

    const num = Number(value)
    if (isNaN(num)) {
      console.warn(`Invalid number value: ${value}, using default: ${defaultValue}`)
      return defaultValue
    }

    return num
  }

  /**
   * Валидация положительного числа
   */
  static validatePositiveNumber(value, fieldName) {
    const num = this.safeNumber(value)
    if (num < 0) {
      throw new Error(`${fieldName} cannot be negative: ${value}`)
    }
    return num
  }

  /**
   * Расчет количества номеров для гостиницы
   */
  static calculateRooms(hotel) {
    if (!hotel || !hotel.paxCount || !hotel.accommodationType) {
      return 0
    }

    const paxCount = this.validatePositiveNumber(hotel.paxCount, 'paxCount')

    switch (hotel.accommodationType) {
      case 'double':
        return Math.ceil(paxCount / 2)
      case 'triple':
        return Math.ceil(paxCount / 3)
      case 'single':
      default:
        return paxCount
    }
  }

  /**
   * Расчет стоимости гостиницы
   */
  static calculateHotelTotal(hotel) {
    if (!hotel) return 0

    const rooms = this.calculateRooms(hotel)
    const pricePerRoom = this.validatePositiveNumber(hotel.pricePerRoom, 'pricePerRoom')
    const nights = this.validatePositiveNumber(hotel.nights, 'nights')

    return rooms * pricePerRoom * nights
  }

  /**
   * Расчет стоимости дня тура
   */
  static calculateDayTotal(day) {
    if (!day || !day.activities || !Array.isArray(day.activities)) {
      return 0
    }

    return day.activities.reduce((sum, activity) => {
      const cost = this.safeNumber(activity.cost, 0)
      return sum + cost
    }, 0)
  }

  /**
   * Расчет стоимости дополнительных услуг
   */
  static calculateOptionalServicesCost(services) {
    if (!services || !Array.isArray(services)) {
      return 0
    }

    return services.reduce((sum, service) => {
      const price = this.safeNumber(service.price || service.cost, 0)
      return sum + price
    }, 0)
  }

  /**
   * Расчет стоимости рейсов
   */
  static calculateFlightsCost(flights) {
    if (!flights || !Array.isArray(flights)) {
      return 0
    }

    return flights.reduce((sum, flight) => {
      const cost = this.safeNumber(flight.finalPrice || flight.totalPrice, 0)
      return sum + cost
    }, 0)
  }

  /**
   * Расчет базовой стоимости сметы
   */
  static calculateBaseCost(estimate) {
    if (!estimate) return 0

    // Стоимость гостиниц (без гостиниц для гида)
    const hotelsCost = (estimate.hotels || [])
      .filter((hotel) => !hotel.isGuideHotel)
      .reduce((sum, hotel) => {
        return sum + this.calculateHotelTotal(hotel)
      }, 0)

    // Стоимость активностей
    const activitiesCost = (estimate.tourDays || []).reduce((sum, day) => {
      return sum + this.calculateDayTotal(day)
    }, 0)

    // Стоимость дополнительных услуг
    const optionalServicesCost = this.calculateOptionalServicesCost(estimate.optionalServices)

    // Стоимость рейсов
    const flightsCost = this.calculateFlightsCost(estimate.flights)

    return hotelsCost + activitiesCost + optionalServicesCost + flightsCost
  }

  /**
   * Расчет суммы наценки
   */
  static calculateMarkupAmount(estimate) {
    if (!estimate) return 0

    const baseCost = this.calculateBaseCost(estimate)
    const markupPercentage = this.safeNumber(estimate.markup || estimate.group?.markup, 0)

    if (markupPercentage < 0 || markupPercentage > 100) {
      throw new Error(`Invalid markup percentage: ${markupPercentage}. Must be between 0 and 100`)
    }

    return (baseCost * markupPercentage) / 100
  }

  /**
   * Расчет финальной стоимости сметы
   */
  static calculateFinalCost(estimate) {
    if (!estimate) return 0

    const baseCost = this.calculateBaseCost(estimate)
    const markupAmount = this.calculateMarkupAmount(estimate)

    return baseCost + markupAmount
  }

  /**
   * Расчет стоимости гостиниц для гида
   */
  static calculateGuideHotelsCost(estimate) {
    if (!estimate || !estimate.hotels) return 0

    return estimate.hotels
      .filter((hotel) => hotel.isGuideHotel)
      .reduce((sum, hotel) => {
        return sum + this.calculateHotelTotal(hotel)
      }, 0)
  }

  /**
   * Полная валидация сметы
   */
  static validateEstimate(estimate) {
    const errors = []

    if (!estimate) {
      errors.push('Estimate data is required')
      return errors
    }

    // Проверка группы
    if (estimate.group) {
      const totalPax = this.safeNumber(estimate.group.totalPax, 0)
      if (totalPax <= 0) {
        errors.push('Total passengers must be greater than 0')
      }
    }

    // Проверка гостиниц
    if (estimate.hotels && Array.isArray(estimate.hotels)) {
      estimate.hotels.forEach((hotel, index) => {
        if (!hotel.name) {
          errors.push(`Hotel ${index + 1}: name is required`)
        }

        const paxCount = this.safeNumber(hotel.paxCount, 0)
        if (paxCount <= 0) {
          errors.push(`Hotel ${index + 1}: pax count must be greater than 0`)
        }

        const pricePerRoom = this.safeNumber(hotel.pricePerRoom, 0)
        if (pricePerRoom < 0) {
          errors.push(`Hotel ${index + 1}: price per room cannot be negative`)
        }
      })
    }

    return errors
  }

  /**
   * Форматирование валюты
   */
  static formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    const safeAmount = this.safeNumber(amount, 0)

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount)
  }

  /**
   * Расчет процента от числа
   */
  static calculatePercentage(value, total) {
    const safeValue = this.safeNumber(value, 0)
    const safeTotal = this.safeNumber(total, 0)

    if (safeTotal === 0) {
      return 0
    }

    return (safeValue / safeTotal) * 100
  }

  /**
   * Округление до 2 знаков после запятой
   */
  static roundToTwoDecimals(value) {
    const num = this.safeNumber(value, 0)
    return Math.round(num * 100) / 100
  }
}

// Экспорт для обратной совместимости
export const calculationService = CalculationService

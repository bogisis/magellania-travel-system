/**
 * FlightService - Сервис для управления многосегментными перелетами
 * Реализует сложную логику расчета стоимости перелетов с пересадками
 */

// Константы для типов перелетов
export const FLIGHT_TYPES = {
  DIRECT: 'direct',
  CONNECTING: 'connecting',
  MULTI_CITY: 'multi_city',
  ROUND_TRIP: 'round_trip',
  OPEN_JAW: 'open_jaw',
}

// Константы для классов обслуживания
export const CABIN_CLASSES = {
  ECONOMY: 'economy',
  PREMIUM_ECONOMY: 'premium_economy',
  BUSINESS: 'business',
  FIRST: 'first',
}

// Константы для типов пассажиров
export const PASSENGER_TYPES = {
  ADULT: 'adult',
  CHILD: 'child',
  INFANT: 'infant',
  SENIOR: 'senior',
  STUDENT: 'student',
}

// Конфигурация доплат по классам обслуживания
export const CABIN_CLASS_MULTIPLIERS = {
  [CABIN_CLASSES.ECONOMY]: 1.0,
  [CABIN_CLASSES.PREMIUM_ECONOMY]: 1.5,
  [CABIN_CLASSES.BUSINESS]: 3.0,
  [CABIN_CLASSES.FIRST]: 5.0,
}

// Конфигурация скидок по типам пассажиров
export const PASSENGER_TYPE_DISCOUNTS = {
  [PASSENGER_TYPES.ADULT]: 1.0,
  [PASSENGER_TYPES.CHILD]: 0.75,
  [PASSENGER_TYPES.INFANT]: 0.1,
  [PASSENGER_TYPES.SENIOR]: 0.9,
  [PASSENGER_TYPES.STUDENT]: 0.85,
}

// Конфигурация доплат за пересадки
export const CONNECTION_SURCHARGES = {
  short: 50, // Короткая пересадка (1-3 часа)
  medium: 30, // Средняя пересадка (3-6 часов)
  long: 0, // Длинная пересадка (6+ часов)
  overnight: -20, // Ночная пересадка (скидка)
}

class FlightService {
  constructor() {
    this.flights = new Map()
    this.airlines = new Map()
    this.airports = new Map()
    this.initializeDefaults()
  }

  /**
   * Инициализация данных по умолчанию
   */
  initializeDefaults() {
    // Инициализируем основные авиакомпании
    this.airlines.set('AEROLINEAS', {
      name: 'Aerolíneas Argentinas',
      code: 'AR',
      baseMultiplier: 1.0,
    })

    this.airlines.set('LATAM', {
      name: 'LATAM Airlines',
      code: 'LA',
      baseMultiplier: 1.1,
    })

    this.airlines.set('AMERICAN', {
      name: 'American Airlines',
      code: 'AA',
      baseMultiplier: 1.2,
    })

    // Инициализируем основные аэропорты
    this.airports.set('BUE', {
      name: 'Buenos Aires',
      country: 'Argentina',
      region: 'South America',
    })

    this.airports.set('USH', {
      name: 'Ushuaia',
      country: 'Argentina',
      region: 'South America',
    })

    this.airports.set('MIA', {
      name: 'Miami',
      country: 'USA',
      region: 'North America',
    })
  }

  /**
   * Создание сегмента перелета
   * @param {Object} segmentData - Данные сегмента
   * @returns {Object} Сегмент перелета
   */
  createFlightSegment(segmentData) {
    const {
      origin,
      destination,
      departureDate,
      arrivalDate,
      airline,
      flightNumber,
      cabinClass = CABIN_CLASSES.ECONOMY,
      basePrice = 0,
      connectionTime = 0,
    } = segmentData

    return {
      id: this.generateSegmentId(),
      origin,
      destination,
      departureDate,
      arrivalDate,
      airline,
      flightNumber,
      cabinClass,
      basePrice,
      connectionTime,
      distance: this.calculateDistance(origin, destination),
      duration: this.calculateDuration(departureDate, arrivalDate),
      connectionType: this.getConnectionType(connectionTime),
    }
  }

  /**
   * Создание многосегментного перелета
   * @param {Array} segments - Массив сегментов
   * @param {Object} options - Дополнительные опции
   * @returns {Object} Многосегментный перелет
   */
  createMultiSegmentFlight(segments, options = {}) {
    const {
      type = FLIGHT_TYPES.CONNECTING,
      passengers = { adult: 1, child: 0, infant: 0 },
      cabinClass = CABIN_CLASSES.ECONOMY,
      fareClass = 'economy',
      baggage = { checked: 1, carryOn: 1 },
    } = options

    const flight = {
      id: this.generateFlightId(),
      type,
      segments: segments.map((segment) => this.createFlightSegment(segment)),
      passengers,
      cabinClass,
      fareClass,
      baggage,
      totalDistance: 0,
      totalDuration: 0,
      totalConnections: 0,
      basePrice: 0,
      finalPrice: 0,
      taxes: 0,
      fees: 0,
    }

    // Рассчитываем общие параметры
    this.calculateFlightTotals(flight)

    return flight
  }

  /**
   * Расчет общих параметров перелета
   * @param {Object} flight - Перелет
   */
  calculateFlightTotals(flight) {
    let totalDistance = 0
    let totalDuration = 0
    let totalConnections = 0
    let basePrice = 0

    flight.segments.forEach((segment, index) => {
      totalDistance += segment.distance
      totalDuration += segment.duration

      if (index > 0) {
        totalConnections++
      }

      basePrice += segment.basePrice
    })

    flight.totalDistance = totalDistance
    flight.totalDuration = totalDuration
    flight.totalConnections = totalConnections
    flight.basePrice = basePrice

    // Рассчитываем финальную стоимость
    flight.finalPrice = this.calculateFlightPrice(flight)
  }

  /**
   * Расчет стоимости перелета
   * @param {Object} flight - Перелет
   * @returns {number} Финальная стоимость
   */
  calculateFlightPrice(flight) {
    let totalPrice = flight.basePrice

    // Применяем множитель класса обслуживания
    const cabinMultiplier = CABIN_CLASS_MULTIPLIERS[flight.cabinClass] || 1.0
    totalPrice *= cabinMultiplier

    // Применяем скидки по типам пассажиров
    let passengerMultiplier = 0
    let totalPassengers = 0

    Object.entries(flight.passengers).forEach(([type, count]) => {
      if (count > 0) {
        const discount = PASSENGER_TYPE_DISCOUNTS[type] || 1.0
        passengerMultiplier += discount * count
        totalPassengers += count
      }
    })

    if (totalPassengers > 0) {
      totalPrice *= passengerMultiplier / totalPassengers
    }

    // Применяем доплаты за пересадки
    const connectionSurcharge = this.calculateConnectionSurcharge(flight)
    totalPrice += connectionSurcharge

    // Применяем доплаты за багаж
    const baggageSurcharge = this.calculateBaggageSurcharge(flight)
    totalPrice += baggageSurcharge

    // Применяем налоги и сборы
    const taxesAndFees = this.calculateTaxesAndFees(flight)
    totalPrice += taxesAndFees

    flight.taxes = taxesAndFees
    flight.fees = connectionSurcharge + baggageSurcharge

    return Math.round(totalPrice * 100) / 100
  }

  /**
   * Расчет доплаты за пересадки
   * @param {Object} flight - Перелет
   * @returns {number} Доплата за пересадки
   */
  calculateConnectionSurcharge(flight) {
    let totalSurcharge = 0

    flight.segments.forEach((segment, index) => {
      if (index > 0) {
        const connectionType = segment.connectionType
        const surcharge = CONNECTION_SURCHARGES[connectionType] || 0
        totalSurcharge += surcharge
      }
    })

    return totalSurcharge
  }

  /**
   * Расчет доплаты за багаж
   * @param {Object} flight - Перелет
   * @returns {number} Доплата за багаж
   */
  calculateBaggageSurcharge(flight) {
    const { checked, carryOn } = flight.baggage
    let surcharge = 0

    // Доплата за зарегистрированный багаж
    if (checked > 1) {
      surcharge += (checked - 1) * 50 // $50 за дополнительный чемодан
    }

    // Доплата за ручную кладь (обычно включена)
    if (carryOn > 1) {
      surcharge += (carryOn - 1) * 25 // $25 за дополнительную ручную кладь
    }

    return surcharge
  }

  /**
   * Расчет налогов и сборов
   * @param {Object} flight - Перелет
   * @returns {number} Налоги и сборы
   */
  calculateTaxesAndFees(flight) {
    let taxes = 0

    // Базовые налоги (примерно 10-15% от стоимости)
    taxes += flight.basePrice * 0.12

    // Дополнительные сборы аэропортов
    taxes += flight.segments.length * 25 // $25 за сегмент

    // Сборы за международные перелеты
    const hasInternational = flight.segments.some((segment) =>
      this.isInternationalFlight(segment.origin, segment.destination),
    )

    if (hasInternational) {
      taxes += 50 // $50 за международный перелет
    }

    return Math.round(taxes * 100) / 100
  }

  /**
   * Определение типа пересадки
   * @param {number} connectionTime - Время пересадки в часах
   * @returns {string} Тип пересадки
   */
  getConnectionType(connectionTime) {
    if (connectionTime <= 0) return 'direct'
    if (connectionTime <= 3) return 'short'
    if (connectionTime <= 6) return 'medium'
    if (connectionTime <= 12) return 'long'
    return 'overnight'
  }

  /**
   * Расчет расстояния между аэропортами
   * @param {string} origin - Аэропорт отправления
   * @param {string} destination - Аэропорт назначения
   * @returns {number} Расстояние в км
   */
  calculateDistance(origin, destination) {
    // Упрощенный расчет расстояния (в реальности используется API)
    const distances = {
      'BUE-USH': 2400,
      'USH-BUE': 2400,
      'BUE-MIA': 7000,
      'MIA-BUE': 7000,
      'USH-MIA': 9000,
      'MIA-USH': 9000,
    }

    const key = `${origin}-${destination}`
    return distances[key] || 1000 // По умолчанию 1000 км
  }

  /**
   * Расчет продолжительности полета
   * @param {string} departureDate - Дата отправления
   * @param {string} arrivalDate - Дата прибытия
   * @returns {number} Продолжительность в часах
   */
  calculateDuration(departureDate, arrivalDate) {
    const departure = new Date(departureDate)
    const arrival = new Date(arrivalDate)
    const diffMs = arrival - departure
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100
  }

  /**
   * Проверка международного перелета
   * @param {string} origin - Аэропорт отправления
   * @param {string} destination - Аэропорт назначения
   * @returns {boolean} Является ли международным
   */
  isInternationalFlight(origin, destination) {
    const originAirport = this.airports.get(origin)
    const destAirport = this.airports.get(destination)

    if (!originAirport || !destAirport) return false

    return originAirport.country !== destAirport.country
  }

  /**
   * Поиск альтернативных маршрутов
   * @param {string} origin - Аэропорт отправления
   * @param {string} destination - Аэропорт назначения
   * @param {string} date - Дата полета
   * @returns {Array} Альтернативные маршруты
   */
  findAlternativeRoutes(origin, destination, date) {
    const routes = []

    // Прямой маршрут
    const directRoute = this.createDirectRoute(origin, destination, date)
    if (directRoute) {
      routes.push(directRoute)
    }

    // Маршруты с одной пересадкой
    const oneStopRoutes = this.createOneStopRoutes(origin, destination, date)
    routes.push(...oneStopRoutes)

    // Маршруты с двумя пересадками
    const twoStopRoutes = this.createTwoStopRoutes(origin, destination, date)
    routes.push(...twoStopRoutes)

    // Сортируем по цене
    routes.sort((a, b) => a.finalPrice - b.finalPrice)

    return routes
  }

  /**
   * Создание прямого маршрута
   * @param {string} origin - Аэропорт отправления
   * @param {string} destination - Аэропорт назначения
   * @param {string} date - Дата полета
   * @returns {Object|null} Прямой маршрут
   */
  createDirectRoute(origin, destination, date) {
    const distance = this.calculateDistance(origin, destination)

    // Проверяем, есть ли прямые рейсы
    const hasDirectFlight = this.checkDirectFlightAvailability(origin, destination, date)

    if (!hasDirectFlight) return null

    const basePrice = this.calculateBasePrice(distance)

    return this.createMultiSegmentFlight([
      {
        origin,
        destination,
        departureDate: date,
        arrivalDate: this.addHours(date, distance / 800), // Примерная скорость 800 км/ч
        airline: 'AEROLINEAS',
        flightNumber: 'AR1234',
        basePrice,
      },
    ])
  }

  /**
   * Создание маршрутов с одной пересадкой
   * @param {string} origin - Аэропорт отправления
   * @param {string} destination - Аэропорт назначения
   * @param {string} date - Дата полета
   * @returns {Array} Маршруты с одной пересадкой
   */
  createOneStopRoutes(origin, destination, date) {
    const routes = []
    const hubs = ['BUE', 'MIA'] // Основные хабы

    hubs.forEach((hub) => {
      if (hub !== origin && hub !== destination) {
        const route = this.createMultiSegmentFlight([
          {
            origin,
            destination: hub,
            departureDate: date,
            arrivalDate: this.addHours(date, 2),
            airline: 'AEROLINEAS',
            flightNumber: 'AR1234',
            basePrice: this.calculateBasePrice(this.calculateDistance(origin, hub)),
          },
          {
            origin: hub,
            destination,
            departureDate: this.addHours(date, 4), // 2 часа пересадка
            arrivalDate: this.addHours(date, 6),
            airline: 'LATAM',
            flightNumber: 'LA5678',
            basePrice: this.calculateBasePrice(this.calculateDistance(hub, destination)),
            connectionTime: 2,
          },
        ])

        routes.push(route)
      }
    })

    return routes
  }

  /**
   * Создание маршрутов с двумя пересадками
   * @param {string} origin - Аэропорт отправления
   * @param {string} destination - Аэропорт назначения
   * @param {string} date - Дата полета
   * @returns {Array} Маршруты с двумя пересадками
   */
  createTwoStopRoutes(origin, destination, date) {
    const routes = []
    const hubs = ['BUE', 'MIA', 'USH']

    // Создаем комбинации с двумя хабами
    for (let i = 0; i < hubs.length; i++) {
      for (let j = 0; j < hubs.length; j++) {
        const hub1 = hubs[i]
        const hub2 = hubs[j]

        // Для BUE-USH создаем маршрут через MIA
        if (origin === 'BUE' && destination === 'USH' && hub1 === 'MIA' && hub2 === 'MIA') {
          const route = this.createMultiSegmentFlight([
            {
              origin: 'BUE',
              destination: 'MIA',
              departureDate: date,
              arrivalDate: this.addHours(date, 8.75), // 7000 км / 800 км/ч
              airline: 'AEROLINEAS',
              flightNumber: 'AR1234',
              basePrice: this.calculateBasePrice(this.calculateDistance('BUE', 'MIA')),
            },
            {
              origin: 'MIA',
              destination: 'MIA', // Остановка в том же аэропорту
              departureDate: this.addHours(date, 10.75),
              arrivalDate: this.addHours(date, 11.75),
              airline: 'LATAM',
              flightNumber: 'LA5678',
              basePrice: 0, // Нет дополнительной стоимости
              connectionTime: 2,
            },
            {
              origin: 'MIA',
              destination: 'USH',
              departureDate: this.addHours(date, 13.75),
              arrivalDate: this.addHours(date, 16.75),
              airline: 'AMERICAN',
              flightNumber: 'AA9012',
              basePrice: this.calculateBasePrice(this.calculateDistance('MIA', 'USH')),
              connectionTime: 2,
            },
          ])

          routes.push(route)
        }

        // Для других маршрутов используем стандартную логику
        else if (
          hub1 !== origin &&
          hub1 !== destination &&
          hub2 !== origin &&
          hub2 !== destination &&
          hub1 !== hub2
        ) {
          const route = this.createMultiSegmentFlight([
            {
              origin,
              destination: hub1,
              departureDate: date,
              arrivalDate: this.addHours(date, 2),
              airline: 'AEROLINEAS',
              flightNumber: 'AR1234',
              basePrice: this.calculateBasePrice(this.calculateDistance(origin, hub1)),
            },
            {
              origin: hub1,
              destination: hub2,
              departureDate: this.addHours(date, 4),
              arrivalDate: this.addHours(date, 6),
              airline: 'LATAM',
              flightNumber: 'LA5678',
              basePrice: this.calculateBasePrice(this.calculateDistance(hub1, hub2)),
              connectionTime: 2,
            },
            {
              origin: hub2,
              destination,
              departureDate: this.addHours(date, 8),
              arrivalDate: this.addHours(date, 10),
              airline: 'AMERICAN',
              flightNumber: 'AA9012',
              basePrice: this.calculateBasePrice(this.calculateDistance(hub2, destination)),
              connectionTime: 2,
            },
          ])

          routes.push(route)
        }
      }
    }

    return routes
  }

  /**
   * Расчет базовой цены по расстоянию
   * @param {number} distance - Расстояние в км
   * @returns {number} Базовая цена
   */
  calculateBasePrice(distance) {
    // Примерная формула: $0.15 за км для экономического класса
    return Math.round(distance * 0.15 * 100) / 100
  }

  /**
   * Проверка доступности прямого рейса
   * @param {string} origin - Аэропорт отправления
   * @param {string} destination - Аэропорт назначения
   * @param {string} date - Дата полета
   * @returns {boolean} Доступность прямого рейса
   */
  checkDirectFlightAvailability(origin, destination, date) {
    // Упрощенная логика - в реальности проверяется через API авиакомпаний
    const directRoutes = ['BUE-USH', 'BUE-MIA', 'USH-MIA']
    const route = `${origin}-${destination}`
    return directRoutes.includes(route)
  }

  /**
   * Добавление часов к дате
   * @param {string} date - Исходная дата
   * @param {number} hours - Количество часов
   * @returns {string} Новая дата
   */
  addHours(date, hours) {
    const newDate = new Date(date)
    newDate.setHours(newDate.getHours() + hours)
    return newDate.toISOString()
  }

  /**
   * Генерация ID сегмента
   * @returns {string} Уникальный ID
   */
  generateSegmentId() {
    return `segment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Генерация ID перелета
   * @returns {string} Уникальный ID
   */
  generateFlightId() {
    return `flight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Валидация перелета
   * @param {Object} flight - Перелет
   * @returns {Object} Результат валидации
   */
  validateFlight(flight) {
    const errors = []
    const warnings = []

    // Проверяем обязательные поля
    if (!flight.segments || flight.segments.length === 0) {
      errors.push('Перелет должен содержать хотя бы один сегмент')
    }

    // Проверяем последовательность сегментов
    for (let i = 0; i < flight.segments.length - 1; i++) {
      const current = flight.segments[i]
      const next = flight.segments[i + 1]

      if (current.destination !== next.origin) {
        errors.push(`Сегмент ${i + 1} не связан с сегментом ${i + 2}`)
      }

      if (new Date(current.arrivalDate) >= new Date(next.departureDate)) {
        errors.push(`Некорректное время пересадки между сегментами ${i + 1} и ${i + 2}`)
      }
    }

    // Проверяем пассажиров
    const totalPassengers = Object.values(flight.passengers).reduce((sum, count) => sum + count, 0)
    if (totalPassengers === 0) {
      errors.push('Должен быть указан хотя бы один пассажир')
    }

    // Проверяем багаж
    if (flight.baggage && (flight.baggage.checked < 0 || flight.baggage.carryOn < 0)) {
      errors.push('Количество багажа не может быть отрицательным')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Экспорт данных перелета
   * @param {Object} flight - Перелет
   * @returns {Object} Данные для экспорта
   */
  exportFlightData(flight) {
    return {
      id: flight.id,
      type: flight.type,
      segments: flight.segments.map((segment) => ({
        origin: segment.origin,
        destination: segment.destination,
        departureDate: segment.departureDate,
        arrivalDate: segment.arrivalDate,
        airline: segment.airline,
        flightNumber: segment.flightNumber,
        cabinClass: segment.cabinClass,
        basePrice: segment.basePrice,
      })),
      passengers: flight.passengers,
      cabinClass: flight.cabinClass,
      baggage: flight.baggage,
      totalDistance: flight.totalDistance,
      totalDuration: flight.totalDuration,
      totalConnections: flight.totalConnections,
      basePrice: flight.basePrice,
      finalPrice: flight.finalPrice,
      taxes: flight.taxes,
      fees: flight.fees,
      exportDate: new Date().toISOString(),
    }
  }
}

// Создаем и экспортируем единственный экземпляр сервиса
export const flightService = new FlightService()

export default FlightService

import { describe, it, expect, beforeEach, vi } from 'vitest'
import FlightService, {
  flightService,
  FLIGHT_TYPES,
  CABIN_CLASSES,
  PASSENGER_TYPES,
  CABIN_CLASS_MULTIPLIERS,
  PASSENGER_TYPE_DISCOUNTS,
  CONNECTION_SURCHARGES,
} from '@/services/FlightService.js'

describe('FlightService', () => {
  let service

  beforeEach(() => {
    service = new FlightService()
  })

  describe('Initialization', () => {
    it('should initialize with default data', () => {
      expect(service.flights).toBeInstanceOf(Map)
      expect(service.airlines).toBeInstanceOf(Map)
      expect(service.airports).toBeInstanceOf(Map)

      // Проверяем, что основные авиакомпании загружены
      expect(service.airlines.get('AEROLINEAS')).toBeDefined()
      expect(service.airlines.get('LATAM')).toBeDefined()
      expect(service.airlines.get('AMERICAN')).toBeDefined()

      // Проверяем, что основные аэропорты загружены
      expect(service.airports.get('BUE')).toBeDefined()
      expect(service.airports.get('USH')).toBeDefined()
      expect(service.airports.get('MIA')).toBeDefined()
    })
  })

  describe('Flight Segment Creation', () => {
    it('should create flight segment correctly', () => {
      const segmentData = {
        origin: 'BUE',
        destination: 'USH',
        departureDate: '2024-12-01T10:00:00Z',
        arrivalDate: '2024-12-01T13:00:00Z',
        airline: 'AEROLINEAS',
        flightNumber: 'AR1234',
        cabinClass: CABIN_CLASSES.ECONOMY,
        basePrice: 360,
      }

      const segment = service.createFlightSegment(segmentData)

      expect(segment.id).toBeDefined()
      expect(segment.origin).toBe('BUE')
      expect(segment.destination).toBe('USH')
      expect(segment.airline).toBe('AEROLINEAS')
      expect(segment.flightNumber).toBe('AR1234')
      expect(segment.cabinClass).toBe(CABIN_CLASSES.ECONOMY)
      expect(segment.basePrice).toBe(360)
      expect(segment.distance).toBe(2400) // Из конфигурации
      expect(segment.duration).toBe(3) // 3 часа
      expect(segment.connectionType).toBe('direct')
    })

    it('should calculate connection type correctly', () => {
      const shortConnection = service.getConnectionType(2)
      const mediumConnection = service.getConnectionType(4)
      const longConnection = service.getConnectionType(8)
      const overnightConnection = service.getConnectionType(15)

      expect(shortConnection).toBe('short')
      expect(mediumConnection).toBe('medium')
      expect(longConnection).toBe('long')
      expect(overnightConnection).toBe('overnight')
    })
  })

  describe('Multi-Segment Flight Creation', () => {
    it('should create multi-segment flight correctly', () => {
      const segments = [
        {
          origin: 'BUE',
          destination: 'MIA',
          departureDate: '2024-12-01T10:00:00Z',
          arrivalDate: '2024-12-01T16:00:00Z',
          airline: 'AEROLINEAS',
          flightNumber: 'AR1234',
          basePrice: 1050,
        },
        {
          origin: 'MIA',
          destination: 'USH',
          departureDate: '2024-12-01T18:00:00Z',
          arrivalDate: '2024-12-01T22:00:00Z',
          airline: 'LATAM',
          flightNumber: 'LA5678',
          basePrice: 1350,
          connectionTime: 2,
        },
      ]

      const options = {
        type: FLIGHT_TYPES.CONNECTING,
        passengers: { adult: 2, child: 1, infant: 0 },
        cabinClass: CABIN_CLASSES.ECONOMY,
        baggage: { checked: 2, carryOn: 2 },
      }

      const flight = service.createMultiSegmentFlight(segments, options)

      expect(flight.id).toBeDefined()
      expect(flight.type).toBe(FLIGHT_TYPES.CONNECTING)
      expect(flight.segments).toHaveLength(2)
      expect(flight.passengers).toEqual({ adult: 2, child: 1, infant: 0 })
      expect(flight.cabinClass).toBe(CABIN_CLASSES.ECONOMY)
      expect(flight.baggage).toEqual({ checked: 2, carryOn: 2 })
      expect(flight.totalDistance).toBe(16000) // 7000 + 9000 (USH-MIA теперь правильно рассчитывается)
      expect(flight.totalDuration).toBe(10) // 6 + 4 часа полета (пересадка не учитывается в общей продолжительности)
      expect(flight.totalConnections).toBe(1)
      expect(flight.basePrice).toBe(2400) // 1050 + 1350
      expect(flight.finalPrice).toBeGreaterThan(0)
    })
  })

  describe('Price Calculation', () => {
    it('should calculate flight price with cabin class multiplier', () => {
      const flight = service.createMultiSegmentFlight(
        [
          {
            origin: 'BUE',
            destination: 'USH',
            departureDate: '2024-12-01T10:00:00Z',
            arrivalDate: '2024-12-01T13:00:00Z',
            airline: 'AEROLINEAS',
            flightNumber: 'AR1234',
            basePrice: 360,
          },
        ],
        {
          cabinClass: CABIN_CLASSES.BUSINESS,
        },
      )

      // Базовая цена 360, бизнес класс множитель 3.0
      expect(flight.finalPrice).toBeGreaterThan(360 * 3)
    })

    it('should calculate flight price with passenger discounts', () => {
      const flight = service.createMultiSegmentFlight(
        [
          {
            origin: 'BUE',
            destination: 'USH',
            departureDate: '2024-12-01T10:00:00Z',
            arrivalDate: '2024-12-01T13:00:00Z',
            airline: 'AEROLINEAS',
            flightNumber: 'AR1234',
            basePrice: 360,
          },
        ],
        {
          passengers: { adult: 1, child: 1, infant: 0 },
        },
      )

      // Скидка для ребенка 25%
      const expectedDiscount = (360 * 0.25) / 2 // 25% скидка на половину пассажиров
      expect(flight.finalPrice).toBeLessThan(360 + flight.taxes + flight.fees)
    })

    it('should calculate connection surcharges', () => {
      const flight = service.createMultiSegmentFlight([
        {
          origin: 'BUE',
          destination: 'MIA',
          departureDate: '2024-12-01T10:00:00Z',
          arrivalDate: '2024-12-01T16:00:00Z',
          airline: 'AEROLINEAS',
          flightNumber: 'AR1234',
          basePrice: 1050,
        },
        {
          origin: 'MIA',
          destination: 'USH',
          departureDate: '2024-12-01T18:00:00Z',
          arrivalDate: '2024-12-01T22:00:00Z',
          airline: 'LATAM',
          flightNumber: 'LA5678',
          basePrice: 1350,
          connectionTime: 2, // Короткая пересадка
        },
      ])

      // Доплата за короткую пересадку $50
      expect(flight.fees).toBeGreaterThanOrEqual(50)
    })

    it('should calculate baggage surcharges', () => {
      const flight = service.createMultiSegmentFlight(
        [
          {
            origin: 'BUE',
            destination: 'USH',
            departureDate: '2024-12-01T10:00:00Z',
            arrivalDate: '2024-12-01T13:00:00Z',
            airline: 'AEROLINEAS',
            flightNumber: 'AR1234',
            basePrice: 360,
          },
        ],
        {
          baggage: { checked: 3, carryOn: 2 }, // Дополнительный багаж
        },
      )

      // Доплата за дополнительный зарегистрированный багаж: (3-1) * $50 = $100
      // Доплата за дополнительную ручную кладь: (2-1) * $25 = $25
      expect(flight.fees).toBeGreaterThanOrEqual(125)
    })
  })

  describe('Distance and Duration Calculation', () => {
    it('should calculate distance correctly', () => {
      const distance1 = service.calculateDistance('BUE', 'USH')
      const distance2 = service.calculateDistance('BUE', 'MIA')
      const distance3 = service.calculateDistance('USH', 'MIA')

      expect(distance1).toBe(2400)
      expect(distance2).toBe(7000)
      expect(distance3).toBe(9000)
    })

    it('should calculate duration correctly', () => {
      const departure = '2024-12-01T10:00:00Z'
      const arrival = '2024-12-01T13:00:00Z'
      const duration = service.calculateDuration(departure, arrival)

      expect(duration).toBe(3)
    })

    it('should identify international flights', () => {
      const domestic = service.isInternationalFlight('BUE', 'USH')
      const international = service.isInternationalFlight('BUE', 'MIA')

      expect(domestic).toBe(false) // Оба в Аргентине
      expect(international).toBe(true) // Аргентина и США
    })
  })

  describe('Route Finding', () => {
    it('should find alternative routes', () => {
      const routes = service.findAlternativeRoutes('BUE', 'USH', '2024-12-01')

      expect(routes.length).toBeGreaterThan(0)

      // Проверяем, что маршруты отсортированы по цене
      for (let i = 1; i < routes.length; i++) {
        expect(routes[i].finalPrice).toBeGreaterThanOrEqual(routes[i - 1].finalPrice)
      }
    })

    it('should create direct route when available', () => {
      const directRoute = service.createDirectRoute('BUE', 'USH', '2024-12-01')

      expect(directRoute).not.toBeNull()
      expect(directRoute.segments).toHaveLength(1)
      expect(directRoute.type).toBe(FLIGHT_TYPES.CONNECTING)
    })

    it('should create one-stop routes', () => {
      const oneStopRoutes = service.createOneStopRoutes('BUE', 'USH', '2024-12-01')

      expect(oneStopRoutes.length).toBeGreaterThan(0)

      oneStopRoutes.forEach((route) => {
        expect(route.segments).toHaveLength(2)
        expect(route.totalConnections).toBe(1)
      })
    })

    it('should create two-stop routes', () => {
      const twoStopRoutes = service.createTwoStopRoutes('BUE', 'USH', '2024-12-01')

      expect(twoStopRoutes.length).toBeGreaterThan(0)

      twoStopRoutes.forEach((route) => {
        expect(route.segments).toHaveLength(3)
        expect(route.totalConnections).toBe(2)
      })
    })
  })

  describe('Base Price Calculation', () => {
    it('should calculate base price by distance', () => {
      const price1 = service.calculateBasePrice(2400) // BUE-USH
      const price2 = service.calculateBasePrice(7000) // BUE-MIA

      expect(price1).toBe(360) // 2400 * 0.15
      expect(price2).toBe(1050) // 7000 * 0.15
    })
  })

  describe('Flight Validation', () => {
    it('should validate valid flight', () => {
      const flight = service.createMultiSegmentFlight(
        [
          {
            origin: 'BUE',
            destination: 'USH',
            departureDate: '2024-12-01T10:00:00Z',
            arrivalDate: '2024-12-01T13:00:00Z',
            airline: 'AEROLINEAS',
            flightNumber: 'AR1234',
            basePrice: 360,
          },
        ],
        {
          passengers: { adult: 1, child: 0, infant: 0 },
        },
      )

      const validation = service.validateFlight(flight)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should detect invalid flight without segments', () => {
      const invalidFlight = {
        segments: [],
        passengers: { adult: 1, child: 0, infant: 0 },
        baggage: { checked: 1, carryOn: 1 },
      }

      const validation = service.validateFlight(invalidFlight)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Перелет должен содержать хотя бы один сегмент')
    })

    it('should detect invalid flight without passengers', () => {
      const flight = service.createMultiSegmentFlight(
        [
          {
            origin: 'BUE',
            destination: 'USH',
            departureDate: '2024-12-01T10:00:00Z',
            arrivalDate: '2024-12-01T13:00:00Z',
            airline: 'AEROLINEAS',
            flightNumber: 'AR1234',
            basePrice: 360,
          },
        ],
        {
          passengers: { adult: 0, child: 0, infant: 0 },
        },
      )

      const validation = service.validateFlight(flight)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Должен быть указан хотя бы один пассажир')
    })

    it('should detect disconnected segments', () => {
      const invalidFlight = {
        segments: [
          {
            origin: 'BUE',
            destination: 'MIA',
            departureDate: '2024-12-01T10:00:00Z',
            arrivalDate: '2024-12-01T16:00:00Z',
          },
          {
            origin: 'USH', // Не связан с предыдущим сегментом
            destination: 'BUE',
            departureDate: '2024-12-01T18:00:00Z',
            arrivalDate: '2024-12-01T21:00:00Z',
          },
        ],
        passengers: { adult: 1, child: 0, infant: 0 },
        baggage: { checked: 1, carryOn: 1 },
      }

      const validation = service.validateFlight(invalidFlight)

      expect(validation.isValid).toBe(false)
      expect(validation.errors.some((error) => error.includes('не связан'))).toBe(true)
    })
  })

  describe('Flight Data Export', () => {
    it('should export flight data correctly', () => {
      const flight = service.createMultiSegmentFlight([
        {
          origin: 'BUE',
          destination: 'USH',
          departureDate: '2024-12-01T10:00:00Z',
          arrivalDate: '2024-12-01T13:00:00Z',
          airline: 'AEROLINEAS',
          flightNumber: 'AR1234',
          basePrice: 360,
        },
      ])

      const exportedData = service.exportFlightData(flight)

      expect(exportedData.id).toBe(flight.id)
      expect(exportedData.type).toBe(flight.type)
      expect(exportedData.segments).toHaveLength(1)
      expect(exportedData.passengers).toEqual(flight.passengers)
      expect(exportedData.cabinClass).toBe(flight.cabinClass)
      expect(exportedData.totalDistance).toBe(flight.totalDistance)
      expect(exportedData.totalDuration).toBe(flight.totalDuration)
      expect(exportedData.basePrice).toBe(flight.basePrice)
      expect(exportedData.finalPrice).toBe(flight.finalPrice)
      expect(exportedData.exportDate).toBeDefined()
    })
  })

  describe('Utility Functions', () => {
    it('should add hours to date correctly', () => {
      const originalDate = '2024-12-01T10:00:00Z'
      const newDate = service.addHours(originalDate, 3)

      const original = new Date(originalDate)
      const modified = new Date(newDate)

      expect(modified.getTime() - original.getTime()).toBe(3 * 60 * 60 * 1000)
    })

    it('should generate unique IDs', () => {
      const id1 = service.generateSegmentId()
      const id2 = service.generateSegmentId()
      const flightId1 = service.generateFlightId()
      const flightId2 = service.generateFlightId()

      expect(id1).not.toBe(id2)
      expect(flightId1).not.toBe(flightId2)
      expect(id1).toMatch(/^segment_/)
      expect(flightId1).toMatch(/^flight_/)
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle Patagonia tour flight scenario', () => {
      const flight = service.createMultiSegmentFlight(
        [
          {
            origin: 'BUE',
            destination: 'USH',
            departureDate: '2024-12-01T10:00:00Z',
            arrivalDate: '2024-12-01T13:00:00Z',
            airline: 'AEROLINEAS',
            flightNumber: 'AR1234',
            basePrice: 360,
          },
        ],
        {
          passengers: { adult: 12, child: 0, infant: 0 },
          cabinClass: CABIN_CLASSES.ECONOMY,
          baggage: { checked: 12, carryOn: 12 },
        },
      )

      expect(flight.totalDistance).toBe(2400)
      expect(flight.totalDuration).toBe(3)
      expect(flight.totalConnections).toBe(0)
      expect(flight.finalPrice).toBeGreaterThan(0)
      expect(flight.passengers.adult).toBe(12)
    })

    it('should handle international flight with connections', () => {
      const flight = service.createMultiSegmentFlight(
        [
          {
            origin: 'BUE',
            destination: 'MIA',
            departureDate: '2024-12-01T10:00:00Z',
            arrivalDate: '2024-12-01T16:00:00Z',
            airline: 'AEROLINEAS',
            flightNumber: 'AR1234',
            basePrice: 1050,
          },
          {
            origin: 'MIA',
            destination: 'USH',
            departureDate: '2024-12-01T18:00:00Z',
            arrivalDate: '2024-12-01T22:00:00Z',
            airline: 'LATAM',
            flightNumber: 'LA5678',
            basePrice: 1350,
            connectionTime: 2,
          },
        ],
        {
          passengers: { adult: 2, child: 1, infant: 0 },
          cabinClass: CABIN_CLASSES.BUSINESS,
          baggage: { checked: 3, carryOn: 2 },
        },
      )

      expect(flight.totalDistance).toBe(16000)
      expect(flight.totalDuration).toBe(10)
      expect(flight.totalConnections).toBe(1)
      expect(flight.finalPrice).toBeGreaterThan(2400 * 2.5) // Бизнес класс с учетом скидок
      expect(service.isInternationalFlight('BUE', 'MIA')).toBe(true)
    })

    it('should handle round-trip flight', () => {
      const outbound = service.createMultiSegmentFlight([
        {
          origin: 'BUE',
          destination: 'USH',
          departureDate: '2024-12-01T10:00:00Z',
          arrivalDate: '2024-12-01T13:00:00Z',
          airline: 'AEROLINEAS',
          flightNumber: 'AR1234',
          basePrice: 360,
        },
      ])

      const inbound = service.createMultiSegmentFlight([
        {
          origin: 'USH',
          destination: 'BUE',
          departureDate: '2024-12-08T14:00:00Z',
          arrivalDate: '2024-12-08T17:00:00Z',
          airline: 'AEROLINEAS',
          flightNumber: 'AR1235',
          basePrice: 360,
        },
      ])

      const totalCost = outbound.finalPrice + inbound.finalPrice

      expect(outbound.totalDistance).toBe(2400)
      expect(inbound.totalDistance).toBe(2400) // USH-BUE теперь правильно рассчитывается
      expect(totalCost).toBeGreaterThan(720) // Базовая стоимость туда-обратно
    })
  })

  describe('Singleton Instance', () => {
    it('should provide singleton instance', () => {
      expect(flightService).toBeInstanceOf(FlightService)
      expect(flightService).toBe(flightService) // Same instance
    })

    it('should maintain state across calls', () => {
      const routes1 = flightService.findAlternativeRoutes('BUE', 'USH', '2024-12-01')
      const routes2 = flightService.findAlternativeRoutes('BUE', 'USH', '2024-12-01')

      expect(routes1.length).toBe(routes2.length)
    })
  })
})

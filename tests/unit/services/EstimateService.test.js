import { describe, it, expect, vi } from 'vitest'
import { EstimateService } from '@/services/EstimateService.js'

// Мокаем зависимости
vi.mock('@/services/CalculationService', () => ({
  CalculationService: {
    calculateBaseCost: vi.fn(() => 1000),
    calculateMarkupAmount: vi.fn(() => 100),
    calculateFinalCost: vi.fn(() => 1100),
  },
}))

vi.mock('@/services/ValidationService', () => ({
  ValidationService: {
    validateEstimateUpdate: vi.fn(() => ({ isValid: true, errors: [] })),
  },
}))

describe('EstimateService', () => {
  describe('prepareEstimateData', () => {
    it('should generate default name when name and title are empty', () => {
      const data = {}
      const result = EstimateService.prepareEstimateData(data)

      expect(result.name).toMatch(/^Смета \d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/)
      expect(result.title).toMatch(/^Смета \d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/)
      expect(result.tourName).toMatch(/^Смета \d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/)
    })

    it('should use provided name when available', () => {
      const data = { name: 'Test Estimate' }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.name).toBe('Test Estimate')
      expect(result.title).toBe('Test Estimate')
      expect(result.tourName).toBe('Test Estimate')
    })

    it('should use provided title when available', () => {
      const data = { title: 'Test Title' }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.name).toBe('Test Title')
      expect(result.title).toBe('Test Title')
      expect(result.tourName).toBe('Test Title')
    })

    it('should prepare location data correctly', () => {
      const data = {
        location: {
          country: 'Argentina',
          regions: ['Patagonia'],
          cities: ['Ushuaia'],
          startPoint: 'Buenos Aires',
          endPoint: 'Ushuaia',
        },
      }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.location).toEqual({
        country: 'Argentina',
        regions: ['Patagonia'],
        cities: ['Ushuaia'],
        startPoint: 'Buenos Aires',
        endPoint: 'Ushuaia',
      })
    })

    it('should prepare empty location data when not provided', () => {
      const data = {}
      const result = EstimateService.prepareEstimateData(data)

      expect(result.location).toEqual({
        country: '',
        regions: [],
        cities: [],
        startPoint: '',
        endPoint: '',
      })
    })

    it('should prepare tour dates data correctly', () => {
      const data = {
        tourDates: {
          dateType: 'flexible',
          startDate: '2024-12-01',
          endDate: '2024-12-10',
          days: 10,
        },
      }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.tourDates).toEqual({
        dateType: 'flexible',
        startDate: '2024-12-01',
        endDate: '2024-12-10',
        days: 10,
      })
    })

    it('should prepare empty tour dates data when not provided', () => {
      const data = {}
      const result = EstimateService.prepareEstimateData(data)

      expect(result.tourDates).toEqual({
        dateType: 'exact',
        startDate: '',
        endDate: '',
        days: 0,
      })
    })

    it('should prepare group data correctly', () => {
      const data = {
        group: {
          totalPax: 15,
          doubleCount: 5,
          singleCount: 2,
          guidesCount: 1,
          markup: 10,
        },
      }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.group).toEqual({
        totalPax: 15,
        doubleCount: 5,
        singleCount: 2,
        guidesCount: 1,
        markup: 10,
      })
    })

    it('should prepare empty group data when not provided', () => {
      const data = {}
      const result = EstimateService.prepareEstimateData(data)

      expect(result.group).toEqual({
        totalPax: 0,
        doubleCount: 0,
        singleCount: 0,
        guidesCount: 0,
        markup: 0,
      })
    })

    it('should prepare hotels data correctly', () => {
      const data = {
        hotels: [
          {
            name: 'Hotel A',
            city: 'Buenos Aires',
            region: 'Capital',
            accommodationType: 'double',
            pricePerRoom: 200,
            nights: 3,
            paxCount: 5,
            isGuideHotel: false,
            description: 'Luxury hotel',
          },
        ],
      }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.hotels).toEqual([
        {
          name: 'Hotel A',
          city: 'Buenos Aires',
          region: 'Capital',
          accommodationType: 'double',
          pricePerRoom: 200,
          nights: 3,
          paxCount: 5,
          isGuideHotel: false,
          description: 'Luxury hotel',
        },
      ])
    })

    it('should prepare empty hotels array when not provided', () => {
      const data = {}
      const result = EstimateService.prepareEstimateData(data)

      expect(result.hotels).toEqual([])
    })

    it('should prepare flights data correctly', () => {
      const data = {
        flights: [
          {
            type: 'DIRECT',
            segments: [
              {
                origin: 'BUE',
                destination: 'USH',
                departureDate: '2024-12-01T10:00:00',
                arrivalDate: '2024-12-01T13:00:00',
                airline: 'Aerolineas Argentinas',
                flightNumber: 'AR1234',
              },
            ],
            passengers: { adult: 2, child: 1, infant: 0 },
            cabinClass: 'economy',
            baggage: { checked: 2, carryOn: 2 },
            basePrice: 500,
            taxes: 50,
            fees: 25,
            finalPrice: 575,
            totalDistance: 2400,
            totalDuration: 3,
            totalConnections: 0,
            airline: 'Aerolineas Argentinas',
            notes: 'Direct flight',
          },
        ],
      }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.flights).toEqual([
        {
          id: expect.stringMatching(/^flight_\d+_[a-z0-9]+$/),
          type: 'DIRECT',
          segments: [
            {
              origin: 'BUE',
              destination: 'USH',
              departureDate: '2024-12-01T10:00:00',
              arrivalDate: '2024-12-01T13:00:00',
              airline: 'Aerolineas Argentinas',
              flightNumber: 'AR1234',
            },
          ],
          passengers: { adult: 2, child: 1, infant: 0 },
          cabinClass: 'economy',
          baggage: { checked: 2, carryOn: 2 },
          basePrice: 500,
          taxes: 50,
          fees: 25,
          finalPrice: 575,
          totalDistance: 2400,
          totalDuration: 3,
          totalConnections: 0,
          airline: 'Aerolineas Argentinas',
          notes: 'Direct flight',
        },
      ])
    })

    it('should prepare empty flights array when not provided', () => {
      const data = {}
      const result = EstimateService.prepareEstimateData(data)
      expect(result.flights).toEqual([])
    })

    it('should prepare tour days data correctly', () => {
      const data = {
        tourDays: [
          {
            city: 'Buenos Aires',
            activities: [
              {
                name: 'City Tour',
                cost: 50,
                description: 'Guided city tour',
              },
            ],
          },
        ],
      }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.tourDays).toEqual([
        {
          city: 'Buenos Aires',
          activities: [
            {
              name: 'City Tour',
              cost: 50,
              description: 'Guided city tour',
            },
          ],
        },
      ])
    })

    it('should prepare empty tour days array when not provided', () => {
      const data = {}
      const result = EstimateService.prepareEstimateData(data)

      expect(result.tourDays).toEqual([])
    })

    it('should prepare optional services data correctly', () => {
      const data = {
        optionalServices: [
          {
            name: 'Insurance',
            cost: 100,
            quantity: 1,
            description: 'Travel insurance',
          },
        ],
      }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.optionalServices).toEqual([
        {
          name: 'Insurance',
          cost: 100,
          quantity: 1,
          description: 'Travel insurance',
        },
      ])
    })

    it('should prepare empty optional services array when not provided', () => {
      const data = {}
      const result = EstimateService.prepareEstimateData(data)

      expect(result.optionalServices).toEqual([])
    })

    it('should set default values for other fields', () => {
      const data = {}
      const result = EstimateService.prepareEstimateData(data)

      expect(result.client).toBe('')
      expect(result.description).toBe('')
      expect(result.markup).toBe(0)
      expect(result.currency).toBe('USD')
      expect(result.status).toBe('draft')
    })

    it('should use provided values when available', () => {
      const data = {
        client: 'Test Client',
        description: 'Test Description',
        markup: 25,
        currency: 'EUR',
        status: 'final',
      }
      const result = EstimateService.prepareEstimateData(data)

      expect(result.client).toBe('Test Client')
      expect(result.description).toBe('Test Description')
      expect(result.markup).toBe(25)
      expect(result.currency).toBe('EUR')
      expect(result.status).toBe('final')
    })
  })

  describe('update', () => {
    it('should update estimate successfully with valid data', async () => {
      const estimateId = 1
      const updates = {
        name: 'Updated Estimate',
        group: { totalPax: 10 },
      }

      const result = await EstimateService.update(estimateId, updates)

      expect(result.id).toBe(estimateId)
      expect(result.name).toBe('Updated Estimate')
      expect(result.title).toBe('Updated Estimate')
      expect(result.group.totalPax).toBe(10)
    })

    it('should generate default name when name is not provided', async () => {
      const estimateId = 1
      const updates = {
        group: { totalPax: 10 },
      }

      const result = await EstimateService.update(estimateId, updates)

      expect(result.id).toBe(estimateId)
      expect(result.name).toMatch(/^Смета \d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/)
      expect(result.title).toMatch(/^Смета \d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/)
    })
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import { CalculationService } from '@/services/CalculationService.js'

describe('CalculationService', () => {
  let testEstimate

  beforeEach(() => {
    testEstimate = {
      group: {
        totalPax: 8,
        doubleCount: 3,
        singleCount: 2,
        guidesCount: 1,
        markup: 15,
      },
      hotels: [
        {
          id: 'hotel-1',
          name: 'Hotel Alvear Palace',
          accommodationType: 'double',
          paxCount: 6,
          nights: 3,
          pricePerRoom: 250,
          isGuideHotel: false,
        },
        {
          id: 'hotel-2',
          name: 'Hotel Diplomatic',
          accommodationType: 'single',
          paxCount: 2,
          nights: 3,
          pricePerRoom: 180,
          isGuideHotel: true,
        },
      ],
      tourDays: [
        {
          id: 'day-1',
          dayNumber: 1,
          activities: [
            {
              id: 'activity-1',
              name: 'Обзорная экскурсия',
              cost: 120,
            },
            {
              id: 'activity-2',
              name: 'Танго шоу',
              cost: 200,
            },
          ],
        },
      ],
      optionalServices: [
        {
          id: 'service-1',
          name: 'Трансфер',
          price: 80,
        },
      ],
    }
  })

  describe('safeNumber', () => {
    it('should convert valid numbers correctly', () => {
      expect(CalculationService.safeNumber(123)).toBe(123)
      expect(CalculationService.safeNumber('456')).toBe(456)
      expect(CalculationService.safeNumber(7.89)).toBe(7.89)
    })

    it('should handle invalid values with default', () => {
      expect(CalculationService.safeNumber(null)).toBe(0)
      expect(CalculationService.safeNumber(undefined)).toBe(0)
      expect(CalculationService.safeNumber('')).toBe(0)
      expect(CalculationService.safeNumber('invalid')).toBe(0)
    })

    it('should use custom default value', () => {
      expect(CalculationService.safeNumber(null, 100)).toBe(100)
      expect(CalculationService.safeNumber('invalid', -1)).toBe(-1)
    })
  })

  describe('validatePositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(CalculationService.validatePositiveNumber(100, 'test')).toBe(100)
      expect(CalculationService.validatePositiveNumber('50', 'test')).toBe(50)
    })

    it('should throw error for negative numbers', () => {
      expect(() => CalculationService.validatePositiveNumber(-10, 'test')).toThrow(
        'test cannot be negative: -10',
      )
      expect(() => CalculationService.validatePositiveNumber('-5', 'test')).toThrow(
        'test cannot be negative: -5',
      )
    })
  })

  describe('calculateRooms', () => {
    it('should calculate double rooms correctly', () => {
      const hotel = { accommodationType: 'double', paxCount: 6 }
      expect(CalculationService.calculateRooms(hotel)).toBe(3) // Math.ceil(6/2)
    })

    it('should calculate triple rooms correctly', () => {
      const hotel = { accommodationType: 'triple', paxCount: 8 }
      expect(CalculationService.calculateRooms(hotel)).toBe(3) // Math.ceil(8/3)
    })

    it('should calculate single rooms correctly', () => {
      const hotel = { accommodationType: 'single', paxCount: 4 }
      expect(CalculationService.calculateRooms(hotel)).toBe(4)
    })

    it('should handle string values', () => {
      const hotel = { accommodationType: 'double', paxCount: '6' }
      expect(CalculationService.calculateRooms(hotel)).toBe(3)
    })

    it('should return 0 for invalid data', () => {
      expect(CalculationService.calculateRooms(null)).toBe(0)
      expect(CalculationService.calculateRooms({})).toBe(0)
      expect(CalculationService.calculateRooms({ accommodationType: 'double' })).toBe(0)
    })
  })

  describe('calculateHotelTotal', () => {
    it('should calculate hotel total correctly', () => {
      const hotel = {
        accommodationType: 'double',
        paxCount: 6,
        pricePerRoom: 250,
        nights: 3,
      }
      // 3 rooms * $250 * 3 nights = $2250
      expect(CalculationService.calculateHotelTotal(hotel)).toBe(2250)
    })

    it('should handle string values', () => {
      const hotel = {
        accommodationType: 'double',
        paxCount: '6',
        pricePerRoom: '250',
        nights: '3',
      }
      expect(CalculationService.calculateHotelTotal(hotel)).toBe(2250)
    })

    it('should throw error for negative values', () => {
      const hotel = {
        accommodationType: 'double',
        paxCount: 6,
        pricePerRoom: -250,
        nights: 3,
      }
      expect(() => CalculationService.calculateHotelTotal(hotel)).toThrow(
        'pricePerRoom cannot be negative: -250',
      )
    })
  })

  describe('calculateDayTotal', () => {
    it('should calculate day total correctly', () => {
      const day = {
        activities: [{ cost: 120 }, { cost: 200 }],
      }
      expect(CalculationService.calculateDayTotal(day)).toBe(320)
    })

    it('should handle string values', () => {
      const day = {
        activities: [{ cost: '120' }, { cost: '200' }],
      }
      expect(CalculationService.calculateDayTotal(day)).toBe(320)
    })

    it('should return 0 for invalid data', () => {
      expect(CalculationService.calculateDayTotal(null)).toBe(0)
      expect(CalculationService.calculateDayTotal({})).toBe(0)
      expect(CalculationService.calculateDayTotal({ activities: null })).toBe(0)
    })
  })

  describe('calculateOptionalServicesCost', () => {
    it('should calculate services cost correctly', () => {
      const services = [{ price: 80 }, { cost: 120 }]
      expect(CalculationService.calculateOptionalServicesCost(services)).toBe(200)
    })

    it('should handle mixed price/cost fields', () => {
      const services = [{ price: 100 }, { cost: 150 }, { price: 200 }]
      expect(CalculationService.calculateOptionalServicesCost(services)).toBe(450)
    })
  })

  describe('calculateBaseCost', () => {
    it('should calculate base cost correctly', () => {
      // Hotel 1: 3 rooms * $250 * 3 nights = $2250 (not guide hotel)
      // Hotel 2: 2 rooms * $180 * 3 nights = $1080 (guide hotel, not included)
      // Activities: $120 + $200 = $320
      // Services: $80
      // Total: $2250 + $320 + $80 = $2650
      expect(CalculationService.calculateBaseCost(testEstimate)).toBe(2650)
    })

    it('should exclude guide hotels', () => {
      const estimateWithOnlyGuideHotels = {
        ...testEstimate,
        hotels: [
          {
            accommodationType: 'double',
            paxCount: 4,
            pricePerRoom: 200,
            nights: 2,
            isGuideHotel: true,
          },
        ],
      }
      expect(CalculationService.calculateBaseCost(estimateWithOnlyGuideHotels)).toBe(400) // Only activities + services (320 + 80)
    })
  })

  describe('calculateMarkupAmount', () => {
    it('should calculate markup correctly', () => {
      // Base cost: $2650, markup: 15%
      // Markup amount: $2650 * 0.15 = $397.5
      expect(CalculationService.calculateMarkupAmount(testEstimate)).toBe(397.5)
    })

    it('should validate markup percentage', () => {
      const estimateWithInvalidMarkup = {
        ...testEstimate,
        group: { ...testEstimate.group, markup: 150 },
      }
      expect(() => CalculationService.calculateMarkupAmount(estimateWithInvalidMarkup)).toThrow(
        'Invalid markup percentage: 150. Must be between 0 and 100',
      )
    })

    it('should handle negative markup', () => {
      const estimateWithNegativeMarkup = {
        ...testEstimate,
        group: { ...testEstimate.group, markup: -10 },
      }
      expect(() => CalculationService.calculateMarkupAmount(estimateWithNegativeMarkup)).toThrow(
        'Invalid markup percentage: -10. Must be between 0 and 100',
      )
    })
  })

  describe('calculateFinalCost', () => {
    it('should calculate final cost correctly', () => {
      // Base cost: $2650, markup: 15%
      // Markup amount: $397.5
      // Final cost: $2650 + $397.5 = $3047.5
      expect(CalculationService.calculateFinalCost(testEstimate)).toBe(3047.5)
    })

    it('should handle zero markup', () => {
      const estimateWithZeroMarkup = {
        ...testEstimate,
        group: { ...testEstimate.group, markup: 0 },
      }
      expect(CalculationService.calculateFinalCost(estimateWithZeroMarkup)).toBe(2650) // Base cost only
    })
  })

  describe('validateEstimate', () => {
    it('should validate correct estimate', () => {
      const errors = CalculationService.validateEstimate(testEstimate)
      expect(errors).toEqual([])
    })

    it('should detect missing required fields', () => {
      const invalidEstimate = {
        group: { totalPax: 0 },
        hotels: [{ name: '', paxCount: -5, pricePerRoom: -100 }],
      }
      const errors = CalculationService.validateEstimate(invalidEstimate)
      expect(errors).toContain('Total passengers must be greater than 0')
      expect(errors).toContain('Hotel 1: name is required')
      expect(errors).toContain('Hotel 1: pax count must be greater than 0')
      expect(errors).toContain('Hotel 1: price per room cannot be negative')
    })

    it('should handle null estimate', () => {
      const errors = CalculationService.validateEstimate(null)
      expect(errors).toContain('Estimate data is required')
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(CalculationService.formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
      expect(CalculationService.formatCurrency(1000, 'EUR')).toBe('€1,000.00')
    })

    it('should handle invalid amounts', () => {
      expect(CalculationService.formatCurrency('invalid', 'USD')).toBe('$0.00')
      expect(CalculationService.formatCurrency(null, 'USD')).toBe('$0.00')
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(CalculationService.calculatePercentage(25, 100)).toBe(25)
      expect(CalculationService.calculatePercentage(50, 200)).toBe(25)
    })

    it('should handle zero total', () => {
      expect(CalculationService.calculatePercentage(25, 0)).toBe(0)
    })

    it('should handle string values', () => {
      expect(CalculationService.calculatePercentage('25', '100')).toBe(25)
    })
  })

  describe('roundToTwoDecimals', () => {
    it('should round to two decimals', () => {
      expect(CalculationService.roundToTwoDecimals(123.456)).toBe(123.46)
      expect(CalculationService.roundToTwoDecimals(123.4)).toBe(123.4)
      expect(CalculationService.roundToTwoDecimals(123)).toBe(123)
    })

    it('should handle string values', () => {
      expect(CalculationService.roundToTwoDecimals('123.456')).toBe(123.46)
    })
  })
})

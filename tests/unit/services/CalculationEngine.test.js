/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { CalculationEngine } from '../../../src/services/CalculationEngine.js'
import { PricingIntelligenceService } from '../../../src/services/PricingIntelligenceService.js'

describe('CalculationEngine', () => {
  let testActivity
  let testHotel
  let testEstimate

  beforeEach(() => {
    testActivity = {
      name: 'Входные билеты в нац.парк',
      base_price: 44,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
      markup: 10,
    }

    testHotel = {
      name: 'Hotel Austral Plaza',
      accommodationType: 'double',
      pricePerRoom: 150,
      nights: 4,
      markup: 10,
    }

    testEstimate = {
      group: {
        totalPax: 5,
        markup: 10,
      },
      hotels: [testHotel],
      tourDays: [
        {
          dayNumber: 1,
          activities: [testActivity],
        },
      ],
      optionalServices: [
        {
          name: 'Страхование',
          price: 25,
          calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
          markup: 5,
        },
      ],
    }
  })

  describe('Basic Calculations', () => {
    it('should calculate per-person pricing correctly', () => {
      const result = CalculationEngine.calculateActivityPrice(testActivity, 5, 0)
      
      expect(result.subtotal).toBe(220) // 5 × $44
      expect(result.total).toBe(220) // без наценки
      expect(result.calculation_type).toBe('per_person')
    })

    it('should calculate per-group pricing correctly', () => {
      const groupActivity = {
        ...testActivity,
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
        base_price: 40,
      }
      
      const result = CalculationEngine.calculateActivityPrice(groupActivity, 5, 15)
      
      expect(result.subtotal).toBe(40) // 1 × $40
      expect(result.markup_amount).toBe(6) // 40 × 15%
      expect(result.total).toBe(46) // 40 + 6
    })

    it('should calculate per-day pricing correctly', () => {
      const dayActivity = {
        ...testActivity,
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_DAY,
        base_price: 350,
        quantity: 18,
      }
      
      const result = CalculationEngine.calculateActivityPrice(dayActivity, 5, 10)
      
      expect(result.subtotal).toBe(6300) // 18 × $350
      expect(result.markup_amount).toBe(630) // 6300 × 10%
      expect(result.total).toBe(6930) // 6300 + 630
    })
  })

  describe('Room Calculations', () => {
    it('should calculate double rooms correctly', () => {
      const rooms = CalculationEngine.calculateRoomsNeeded(5, 'double')
      expect(rooms).toBe(3) // Math.ceil(5/2)
    })

    it('should calculate single rooms correctly', () => {
      const rooms = CalculationEngine.calculateRoomsNeeded(5, 'single')
      expect(rooms).toBe(5) // 5 × 1
    })

    it('should calculate triple rooms correctly', () => {
      const rooms = CalculationEngine.calculateRoomsNeeded(7, 'triple')
      expect(rooms).toBe(3) // Math.ceil(7/3)
    })
  })

  describe('Accommodation Calculations', () => {
    it('should calculate accommodation cost correctly', () => {
      const result = CalculationEngine.calculateAccommodation(testHotel, 5, true)
      
      expect(result.rooms_needed).toBe(3) // Math.ceil(5/2)
      expect(result.base_cost).toBe(1800) // 3 × $150 × 4
      expect(result.markup_amount).toBe(180) // 1800 × 10%
      expect(result.total).toBe(1980) // 1800 + 180
    })

    it('should handle guide hotels without markup', () => {
      const guideHotel = { ...testHotel, isGuideHotel: true }
      const result = CalculationEngine.calculateAccommodation(guideHotel, 5, true)
      
      expect(result.markup_amount).toBe(0)
      expect(result.total).toBe(result.base_cost)
    })
  })

  describe('Dual Display Mode', () => {
    it('should calculate dual display mode correctly', () => {
      const withoutMarkup = CalculationEngine.calculateActivityPriceDual(
        testActivity,
        5,
        CalculationEngine.DISPLAY_MODES.WITHOUT_MARKUP
      )
      
      const withMarkup = CalculationEngine.calculateActivityPriceDual(
        testActivity,
        5,
        CalculationEngine.DISPLAY_MODES.WITH_MARKUP
      )
      
      expect(withoutMarkup.display_price).toBe(220) // без наценки
      expect(withMarkup.display_price).toBe(242) // с наценкой
      expect(withoutMarkup.base_price).toBe(220)
      expect(withMarkup.price_with_markup).toBe(242)
    })
  })

  describe('Differential Pricing', () => {
    it('should calculate adult/child pricing correctly', () => {
      const pricing = {
        adult_price: 70,
        child_price: 35,
        markup: 10,
      }
      
      const result = CalculationEngine.calculateDifferentialPricing(
        pricing,
        5, // adults
        3, // children
        CalculationEngine.DISPLAY_MODES.WITH_MARKUP
      )
      
      expect(result.adult_base_cost).toBe(350) // 5 × $70
      expect(result.child_base_cost).toBe(105) // 3 × $35
      expect(result.total_base_cost).toBe(455) // 350 + 105
      expect(result.total_with_markup).toBe(500.5) // 455 + 10%
    })
  })

  describe('Complex Estimate Calculations', () => {
    it('should calculate complete estimate correctly', () => {
      const result = CalculationEngine.calculateEstimateTotalDual(
        testEstimate,
        CalculationEngine.DISPLAY_MODES.WITH_MARKUP
      )
      
      expect(result.participant_count).toBe(5)
      expect(result.base_total).toBeGreaterThan(0)
      expect(result.general_markup_amount).toBeGreaterThan(0)
      expect(result.final_total).toBeGreaterThan(result.base_total)
      expect(result.category_subtotals).toBeDefined()
      expect(result.category_subtotals.accommodation).toBeDefined()
      expect(result.category_subtotals.activities).toBeDefined()
      expect(result.category_subtotals.optional).toBeDefined()
    })
  })

  describe('Validation', () => {
    it('should validate calculation integrity', () => {
      const calculation = {
        subtotal: 100,
        markup_amount: 10,
        total: 110,
      }
      
      expect(() => {
        CalculationEngine.validateCalculationIntegrity(calculation)
      }).not.toThrow()
    })

    it('should throw error for invalid calculation', () => {
      const invalidCalculation = {
        subtotal: 100,
        markup_amount: 10,
        total: 120, // incorrect
      }
      
      expect(() => {
        CalculationEngine.validateCalculationIntegrity(invalidCalculation)
      }).toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid participant count', () => {
      expect(() => {
        CalculationEngine.calculateActivityPrice(testActivity, -1, 0)
      }).toThrow()
    })

    it('should handle invalid markup', () => {
      expect(() => {
        CalculationEngine.calculateActivityPrice(testActivity, 5, -10)
      }).toThrow()
    })

    it('should handle unknown calculation type', () => {
      const invalidActivity = {
        ...testActivity,
        calculation_type: 'invalid_type',
      }
      
      expect(() => {
        CalculationEngine.calculateActivityPrice(invalidActivity, 5, 0)
      }).toThrow()
    })
  })
})

describe('PricingIntelligenceService', () => {
  describe('Pricing Suggestions', () => {
    it('should suggest pricing for entrance tickets', () => {
      const suggestion = PricingIntelligenceService.suggestPricing(
        'Входные билеты в нац.парк',
        'entrance',
        5
      )
      
      expect(suggestion.suggested).toBe(true)
      expect(suggestion.calculation_type).toBe('per_person')
      expect(suggestion.confidence).toBeGreaterThan(0.5)
      expect(suggestion.category).toBe('entrance_fees')
    })

    it('should suggest pricing for transfers', () => {
      const suggestion = PricingIntelligenceService.suggestPricing(
        'Трансфер в гостиницу',
        'transfer',
        5
      )
      
      expect(suggestion.suggested).toBe(true)
      expect(suggestion.calculation_type).toBe('per_group')
      expect(suggestion.confidence).toBeGreaterThan(0.5)
      expect(suggestion.category).toBe('transfers')
    })

    it('should provide default pricing for unknown activities', () => {
      const suggestion = PricingIntelligenceService.suggestPricing(
        'Неизвестная активность',
        'unknown',
        5
      )
      
      expect(suggestion.suggested).toBe(false)
      expect(suggestion.calculation_type).toBeDefined()
      expect(suggestion.base_price).toBeGreaterThan(0)
    })
  })

  describe('Category Detection', () => {
    it('should detect entrance fees category', () => {
      const category = PricingIntelligenceService.detectCategory(
        'входные билеты в музей',
        'entrance'
      )
      
      expect(category).toBe('entrance_fees')
    })

    it('should detect transfers category', () => {
      const category = PricingIntelligenceService.detectCategory(
        'трансфер из аэропорта',
        'transfer'
      )
      
      expect(category).toBe('transfers')
    })

    it('should fallback to activities for unknown patterns', () => {
      const category = PricingIntelligenceService.detectCategory(
        'неизвестная услуга',
        'unknown'
      )
      
      expect(category).toBe('activities')
    })
  })

  describe('Suggestion Validation', () => {
    it('should validate correct suggestions', () => {
      const suggestion = {
        calculation_type: 'per_person',
        base_price: 50,
        markup: 10,
        confidence: 0.8,
      }
      
      const validation = PricingIntelligenceService.validateSuggestion(suggestion)
      
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should reject invalid suggestions', () => {
      const invalidSuggestion = {
        calculation_type: '',
        base_price: -10,
        markup: -5,
        confidence: 0.1,
      }
      
      const validation = PricingIntelligenceService.validateSuggestion(invalidSuggestion)
      
      expect(validation.valid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })
  })
})

// Integration tests
describe('Integration Tests', () => {
  it('should work with real estimate data', () => {
    const realEstimate = {
      group: { totalPax: 3, markup: 15 },
      hotels: [
        {
          name: 'Hotel Test',
          accommodationType: 'double',
          pricePerRoom: 200,
          nights: 3,
          markup: 12,
        },
      ],
      tourDays: [
        {
          dayNumber: 1,
          activities: [
            {
              name: 'Экскурсия по городу',
              base_price: 100,
              calculation_type: 'per_group',
              markup: 20,
            },
          ],
        },
      ],
      optionalServices: [],
    }

    const result = CalculationEngine.calculateEstimateTotalDual(
      realEstimate,
      CalculationEngine.DISPLAY_MODES.WITH_MARKUP
    )

    expect(result.final_total).toBeGreaterThan(0)
    expect(result.category_subtotals.accommodation.base_cost).toBeGreaterThan(0)
    expect(result.category_subtotals.activities.base_cost).toBeGreaterThan(0)
  })

  it('should handle pricing intelligence integration', () => {
    const activityName = 'Входные билеты в нац.парк'
    const suggestion = PricingIntelligenceService.suggestPricing(activityName, 'entrance', 4)
    
    const activity = {
      name: activityName,
      base_price: suggestion.base_price,
      calculation_type: suggestion.calculation_type,
      markup: suggestion.markup,
    }

    const calculation = CalculationEngine.calculateActivityPriceDual(
      activity,
      4,
      CalculationEngine.DISPLAY_MODES.WITH_MARKUP
    )

    expect(calculation.display_price).toBeGreaterThan(0)
    expect(calculation.base_price).toBeGreaterThan(0)
    expect(calculation.price_with_markup).toBeGreaterThan(calculation.base_price)
  })
})

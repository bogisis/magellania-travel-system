import { describe, it, expect, beforeEach, vi } from 'vitest'
import DiscountService, {
  discountService,
  DISCOUNT_TYPES,
  SURCHARGE_TYPES,
  DEFAULT_DISCOUNTS,
  DEFAULT_SURCHARGES,
} from '@/services/DiscountService.js'

describe('DiscountService', () => {
  let service

  beforeEach(() => {
    service = new DiscountService()
  })

  describe('Initialization', () => {
    it('should initialize with default settings', () => {
      expect(service.discounts).toBeInstanceOf(Map)
      expect(service.surcharges).toBeInstanceOf(Map)

      // Проверяем, что настройки по умолчанию загружены
      expect(service.discounts.get(DISCOUNT_TYPES.GROUP_SIZE)).toEqual(
        DEFAULT_DISCOUNTS[DISCOUNT_TYPES.GROUP_SIZE],
      )
      expect(service.discounts.get(DISCOUNT_TYPES.LOYALTY)).toEqual(
        DEFAULT_DISCOUNTS[DISCOUNT_TYPES.LOYALTY],
      )
      expect(service.surcharges.get(SURCHARGE_TYPES.URGENCY)).toEqual(
        DEFAULT_SURCHARGES[SURCHARGE_TYPES.URGENCY],
      )
    })

    it('should validate settings correctly', () => {
      const validation = service.validateSettings()
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('Group Discounts', () => {
    it('should calculate group discount for 15 people', () => {
      const discount = service.calculateGroupDiscount(15)
      expect(discount).toBe(5) // 5% для групп от 10 человек
    })

    it('should calculate group discount for 25 people', () => {
      const discount = service.calculateGroupDiscount(25)
      expect(discount).toBe(10) // 10% для групп от 20 человек
    })

    it('should return 0 for small groups', () => {
      const discount = service.calculateGroupDiscount(5)
      expect(discount).toBe(0)
    })

    it('should return maximum discount for large groups', () => {
      const discount = service.calculateGroupDiscount(50)
      expect(discount).toBe(15) // Максимальная скидка 15%
    })
  })

  describe('Loyalty Discounts', () => {
    it('should calculate loyalty discount for repeat client', () => {
      const client = { isRepeatClient: true, isVipClient: false }
      const discount = service.calculateLoyaltyDiscount(client)
      expect(discount).toBe(3) // 3% для повторных клиентов
    })

    it('should calculate loyalty discount for VIP client', () => {
      const client = { isRepeatClient: false, isVipClient: true }
      const discount = service.calculateLoyaltyDiscount(client)
      expect(discount).toBe(5) // 5% для VIP клиентов
    })

    it('should calculate combined loyalty discount', () => {
      const client = { isRepeatClient: true, isVipClient: true }
      const discount = service.calculateLoyaltyDiscount(client)
      expect(discount).toBe(8) // 3% + 5% = 8%
    })

    it('should return 0 for regular client', () => {
      const client = { isRepeatClient: false, isVipClient: false }
      const discount = service.calculateLoyaltyDiscount(client)
      expect(discount).toBe(0)
    })
  })

  describe('Seasonal Adjustments', () => {
    it('should calculate low season discount', () => {
      const adjustment = service.calculateSeasonalAdjustment('low_season')
      expect(adjustment).toBe(-10) // -10% (скидка)
    })

    it('should calculate high season surcharge', () => {
      const adjustment = service.calculateSeasonalAdjustment('high_season')
      expect(adjustment).toBe(20) // +20% (доплата)
    })

    it('should return 0 for unknown season', () => {
      const adjustment = service.calculateSeasonalAdjustment('unknown_season')
      expect(adjustment).toBe(0)
    })
  })

  describe('Urgency Surcharges', () => {
    it('should calculate same day surcharge', () => {
      const surcharge = service.calculateUrgencySurcharge('same_day')
      expect(surcharge).toBe(25) // 25% за срочное бронирование
    })

    it('should calculate next day surcharge', () => {
      const surcharge = service.calculateUrgencySurcharge('next_day')
      expect(surcharge).toBe(15) // 15% за бронирование на завтра
    })

    it('should return 0 for normal booking', () => {
      const surcharge = service.calculateUrgencySurcharge('normal')
      expect(surcharge).toBe(0)
    })
  })

  describe('Special Services Surcharges', () => {
    it('should calculate surcharge for private guide', () => {
      const surcharge = service.calculateSpecialServicesSurcharge(['private_guide'])
      expect(surcharge).toBe(50) // 50% за индивидуального гида
    })

    it('should calculate surcharge for multiple services', () => {
      const surcharge = service.calculateSpecialServicesSurcharge([
        'private_guide',
        'luxury_transfer',
      ])
      expect(surcharge).toBe(80) // 50% + 30% = 80%
    })

    it('should return 0 for unknown service', () => {
      const surcharge = service.calculateSpecialServicesSurcharge(['unknown_service'])
      expect(surcharge).toBe(0)
    })

    it('should return 0 for empty services', () => {
      const surcharge = service.calculateSpecialServicesSurcharge([])
      expect(surcharge).toBe(0)
    })
  })

  describe('Discount Application', () => {
    it('should apply 10% discount correctly', () => {
      const result = service.applyDiscount(1000, 10)
      expect(result.originalCost).toBe(1000)
      expect(result.discountAmount).toBe(100)
      expect(result.finalCost).toBe(900)
      expect(result.discountPercent).toBe(10)
    })

    it('should handle 0% discount', () => {
      const result = service.applyDiscount(1000, 0)
      expect(result.originalCost).toBe(1000)
      expect(result.discountAmount).toBe(0)
      expect(result.finalCost).toBe(1000)
      expect(result.discountPercent).toBe(0)
    })

    it('should handle negative discount', () => {
      const result = service.applyDiscount(1000, -5)
      expect(result.originalCost).toBe(1000)
      expect(result.discountAmount).toBe(0)
      expect(result.finalCost).toBe(1000)
      expect(result.discountPercent).toBe(0)
    })

    it('should round amounts correctly', () => {
      const result = service.applyDiscount(1000, 7.5)
      expect(result.discountAmount).toBe(75)
      expect(result.finalCost).toBe(925)
    })
  })

  describe('Surcharge Application', () => {
    it('should apply 15% surcharge correctly', () => {
      const result = service.applySurcharge(1000, 15)
      expect(result.originalCost).toBe(1000)
      expect(result.surchargeAmount).toBe(150)
      expect(result.finalCost).toBe(1150)
      expect(result.surchargePercent).toBe(15)
    })

    it('should handle 0% surcharge', () => {
      const result = service.applySurcharge(1000, 0)
      expect(result.originalCost).toBe(1000)
      expect(result.surchargeAmount).toBe(0)
      expect(result.finalCost).toBe(1000)
      expect(result.surchargePercent).toBe(0)
    })

    it('should handle negative surcharge', () => {
      const result = service.applySurcharge(1000, -5)
      expect(result.originalCost).toBe(1000)
      expect(result.surchargeAmount).toBe(0)
      expect(result.finalCost).toBe(1000)
      expect(result.surchargePercent).toBe(0)
    })

    it('should round amounts correctly', () => {
      const result = service.applySurcharge(1000, 12.5)
      expect(result.surchargeAmount).toBe(125)
      expect(result.finalCost).toBe(1125)
    })
  })

  describe('Complex Estimate Calculations', () => {
    it('should calculate adjustments for group with loyalty', () => {
      const estimate = {
        totalCost: 5000,
        participants: { totalPax: 25 },
        season: 'low_season',
      }
      const client = { isRepeatClient: true, isVipClient: false }

      const result = service.calculateEstimateAdjustments(estimate, client)

      expect(result.originalCost).toBe(5000)
      expect(result.discounts).toHaveLength(3) // group, loyalty, seasonal
      expect(result.surcharges).toHaveLength(0)
      expect(result.totalDiscount).toBeGreaterThan(0)
      expect(result.totalSurcharge).toBe(0)
      expect(result.finalCost).toBeLessThan(5000)
    })

    it('should calculate adjustments for urgent booking with special services', () => {
      const estimate = {
        totalCost: 3000,
        urgency: 'same_day',
        specialServices: ['private_guide', 'luxury_transfer'],
      }

      const result = service.calculateEstimateAdjustments(estimate)

      expect(result.originalCost).toBe(3000)
      expect(result.discounts).toHaveLength(0)
      expect(result.surcharges).toHaveLength(2) // urgency, special services
      expect(result.totalDiscount).toBe(0)
      expect(result.totalSurcharge).toBeGreaterThan(0)
      expect(result.finalCost).toBeGreaterThan(3000)
    })

    it('should handle estimate without any adjustments', () => {
      const estimate = { totalCost: 2000 }

      const result = service.calculateEstimateAdjustments(estimate)

      expect(result.originalCost).toBe(2000)
      expect(result.discounts).toHaveLength(0)
      expect(result.surcharges).toHaveLength(0)
      expect(result.totalDiscount).toBe(0)
      expect(result.totalSurcharge).toBe(0)
      expect(result.finalCost).toBe(2000)
    })

    it('should calculate complex scenario with all adjustments', () => {
      const estimate = {
        totalCost: 10000,
        participants: { totalPax: 30 },
        season: 'peak_season',
        urgency: 'next_day',
        specialServices: ['premium_hotel'],
      }
      const client = { isRepeatClient: true, isVipClient: true }

      const result = service.calculateEstimateAdjustments(estimate, client)

      expect(result.originalCost).toBe(10000)
      expect(result.discounts.length).toBeGreaterThan(0)
      expect(result.surcharges.length).toBeGreaterThan(0)
      expect(result.totalDiscount).toBeGreaterThan(0)
      expect(result.totalSurcharge).toBeGreaterThan(0)

      // Проверяем, что итоговая стоимость корректно рассчитана
      const expectedFinalCost = 10000 - result.totalDiscount + result.totalSurcharge
      expect(result.finalCost).toBe(expectedFinalCost)
    })
  })

  describe('Settings Management', () => {
    it('should add new discount type', () => {
      service.addDiscount('group_size', { 50: 20 })
      const groupDiscounts = service.discounts.get('group_size')
      expect(groupDiscounts[50]).toBe(20)
    })

    it('should add new surcharge type', () => {
      service.addSurcharge('urgency', { emergency: 50 })
      const urgencySurcharges = service.surcharges.get('urgency')
      expect(urgencySurcharges.emergency).toBe(50)
    })

    it('should throw error for invalid discount type', () => {
      expect(() => {
        service.addDiscount('invalid_type', {})
      }).toThrow('Неизвестный тип скидки: invalid_type')
    })

    it('should throw error for invalid surcharge type', () => {
      expect(() => {
        service.addSurcharge('invalid_type', {})
      }).toThrow('Неизвестный тип доплаты: invalid_type')
    })

    it('should export and import settings correctly', () => {
      const originalSettings = service.exportSettings()

      // Создаем новый сервис
      const newService = new DiscountService()

      // Импортируем настройки
      newService.importSettings(originalSettings)

      // Проверяем, что настройки совпадают
      const newSettings = newService.exportSettings()
      expect(newSettings.discounts).toEqual(originalSettings.discounts)
      expect(newSettings.surcharges).toEqual(originalSettings.surcharges)
    })
  })

  describe('Validation', () => {
    it('should detect invalid discount percentage', () => {
      service.addDiscount('group_size', { 100: 150 }) // 150% > 100%
      const validation = service.validateSettings()
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('should detect negative discount', () => {
      service.addDiscount('group_size', { 100: -10 })
      const validation = service.validateSettings()
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('should detect negative surcharge', () => {
      service.addSurcharge('urgency', { emergency: -5 })
      const validation = service.validateSettings()
      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    it('should provide warnings for missing configurations', () => {
      const emptyService = new DiscountService()
      emptyService.discounts.clear()
      emptyService.surcharges.clear()

      const validation = emptyService.validateSettings()
      expect(validation.isValid).toBe(true)
      expect(validation.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('Singleton Instance', () => {
    it('should provide singleton instance', () => {
      expect(discountService).toBeInstanceOf(DiscountService)
      expect(discountService).toBe(discountService) // Same instance
    })

    it('should maintain state across calls', () => {
      discountService.addDiscount('group_size', { 100: 25 })
      const discount = discountService.calculateGroupDiscount(100)
      expect(discount).toBe(25)
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle Patagonia tour scenario', () => {
      const estimate = {
        totalCost: 15000,
        participants: { totalPax: 12 },
        season: 'high_season',
        urgency: 'same_week',
        specialServices: ['private_guide'],
      }
      const client = { isRepeatClient: true, isVipClient: false }

      const result = service.calculateEstimateAdjustments(estimate, client)

      // Проверяем логику расчета
      expect(result.discounts.some((d) => d.type === 'group_size')).toBe(true)
      expect(result.discounts.some((d) => d.type === 'loyalty')).toBe(true)
      expect(result.surcharges.some((s) => s.type === 'seasonal')).toBe(true)
      expect(result.surcharges.some((s) => s.type === 'urgency')).toBe(true)
      expect(result.surcharges.some((s) => s.type === 'special_services')).toBe(true)

      // Проверяем, что итоговая стоимость корректна
      expect(result.finalCost).toBeGreaterThan(0)
      expect(result.finalCost).not.toBe(15000) // Должна измениться
    })

    it('should handle low season discount scenario', () => {
      const estimate = {
        totalCost: 8000,
        participants: { totalPax: 8 },
        season: 'low_season',
      }

      const result = service.calculateEstimateAdjustments(estimate)

      // В низкий сезон должна быть скидка
      expect(result.discounts.some((d) => d.type === 'seasonal')).toBe(true)
      expect(result.totalDiscount).toBeGreaterThan(0)
      expect(result.finalCost).toBeLessThan(8000)
    })

    it('should handle VIP client with large group', () => {
      const estimate = {
        totalCost: 25000,
        participants: { totalPax: 35 },
      }
      const client = { isRepeatClient: false, isVipClient: true }

      const result = service.calculateEstimateAdjustments(estimate, client)

      // Должны быть скидки за группу и VIP статус
      expect(result.discounts.some((d) => d.type === 'group_size')).toBe(true)
      expect(result.discounts.some((d) => d.type === 'loyalty')).toBe(true)

      // Общая скидка должна быть значительной
      expect(result.totalDiscount).toBeGreaterThan(2000) // Более 8% от 25000
    })
  })
})

import { describe, it, expect } from 'vitest'
import { ValidationService } from '@/services/ValidationService.js'

describe('ValidationService', () => {
  describe('validateEstimate', () => {
    it('should validate valid estimate', () => {
      const estimate = {
        group: { totalPax: 10 },
        hotels: [
          { name: 'Hotel A', paxCount: 5, pricePerRoom: 100 },
          { name: 'Hotel B', paxCount: 5, pricePerRoom: 150 },
        ],
      }

      const errors = ValidationService.validateEstimate(estimate)
      expect(errors).toHaveLength(0)
    })

    it('should return error for missing estimate', () => {
      const errors = ValidationService.validateEstimate(null)
      expect(errors).toContain('Estimate data is required')
    })

    it('should return error for missing group data', () => {
      const estimate = { hotels: [] }
      const errors = ValidationService.validateEstimate(estimate)
      expect(errors).toContain('Group data with totalPax is required')
    })

    it('should return error for invalid totalPax', () => {
      const estimate = {
        group: { totalPax: -5 },
        hotels: [],
      }
      const errors = ValidationService.validateEstimate(estimate)
      expect(errors).toContain('Total passengers must be greater than 0')
    })

    it('should return error for missing totalPax', () => {
      const estimate = {
        group: {},
        hotels: [],
      }
      const errors = ValidationService.validateEstimate(estimate)
      expect(errors).toContain('Group data with totalPax is required')
    })

    it('should validate hotels correctly', () => {
      const estimate = {
        group: { totalPax: 10 },
        hotels: [
          { name: '', paxCount: 5, pricePerRoom: 100 },
          { name: 'Hotel B', paxCount: 0, pricePerRoom: -50 },
        ],
      }
      const errors = ValidationService.validateEstimate(estimate)
      expect(errors).toContain('Hotel 1: name is required')
      expect(errors).toContain('Hotel 2: pax count must be greater than 0')
      expect(errors).toContain('Hotel 2: price per room cannot be negative')
    })
  })

  describe('validateActivity', () => {
    it('should validate valid activity', () => {
      const activity = {
        name: 'City Tour',
        base_price: 50,
      }

      const errors = ValidationService.validateActivity(activity)
      expect(errors).toHaveLength(0)
    })

    it('should return error for missing activity', () => {
      const errors = ValidationService.validateActivity(null)
      expect(errors).toContain('Activity data is required')
    })

    it('should return error for missing name', () => {
      const activity = { base_price: 50 }
      const errors = ValidationService.validateActivity(activity)
      expect(errors).toContain('Activity name is required')
    })

    it('should return error for invalid base_price', () => {
      const activity = { name: 'City Tour', base_price: -10 }
      const errors = ValidationService.validateActivity(activity)
      expect(errors).toContain('Activity base price must be a non-negative number')
    })
  })

  describe('validateHotel', () => {
    it('should validate valid hotel', () => {
      const hotel = {
        name: 'Grand Hotel',
        accommodationType: 'double',
        pricePerRoom: 200,
        nights: 3,
      }

      const errors = ValidationService.validateHotel(hotel)
      expect(errors).toHaveLength(0)
    })

    it('should return error for missing hotel', () => {
      const errors = ValidationService.validateHotel(null)
      expect(errors).toContain('Hotel data is required')
    })

    it('should return error for missing name', () => {
      const hotel = {
        accommodationType: 'double',
        pricePerRoom: 200,
        nights: 3,
      }
      const errors = ValidationService.validateHotel(hotel)
      expect(errors).toContain('Hotel name is required')
    })

    it('should return error for missing accommodation type', () => {
      const hotel = {
        name: 'Grand Hotel',
        pricePerRoom: 200,
        nights: 3,
      }
      const errors = ValidationService.validateHotel(hotel)
      expect(errors).toContain('Accommodation type is required')
    })

    it('should return error for negative price', () => {
      const hotel = {
        name: 'Grand Hotel',
        accommodationType: 'double',
        pricePerRoom: -50,
        nights: 3,
      }
      const errors = ValidationService.validateHotel(hotel)
      expect(errors).toContain('Price per room must be a non-negative number')
    })

    it('should return error for invalid nights', () => {
      const hotel = {
        name: 'Grand Hotel',
        accommodationType: 'double',
        pricePerRoom: 200,
        nights: 0,
      }
      const errors = ValidationService.validateHotel(hotel)
      expect(errors).toContain('Number of nights must be greater than 0')
    })
  })

  describe('validateEstimateUpdate', () => {
    it('should validate valid update data', () => {
      const updates = {
        name: 'Updated Estimate',
        group: { totalPax: 15 },
        hotels: [
          { name: 'Hotel A', pricePerRoom: 100 },
          { name: 'Hotel B', pricePerRoom: 150 },
        ],
        tourDates: {
          startDate: '2024-12-01',
          endDate: '2024-12-10',
        },
        markup: 20,
      }

      const result = ValidationService.validateEstimateUpdate(updates)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return error for missing update data', () => {
      const result = ValidationService.validateEstimateUpdate(null)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Update data is required')
    })

    it('should return error for empty name', () => {
      const updates = { name: '' }
      const result = ValidationService.validateEstimateUpdate(updates)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Estimate name cannot be empty')
    })

    it('should return error for empty title', () => {
      const updates = { title: '   ' }
      const result = ValidationService.validateEstimateUpdate(updates)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Estimate title cannot be empty')
    })

    it('should validate group data correctly', () => {
      const updates = { group: { totalPax: 0 } }
      const result = ValidationService.validateEstimateUpdate(updates)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Total passengers must be greater than 0')
    })

    it('should validate hotels correctly', () => {
      const updates = {
        hotels: [
          { name: '', pricePerRoom: 100 },
          { name: 'Hotel B', pricePerRoom: -50 },
        ],
      }
      const result = ValidationService.validateEstimateUpdate(updates)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Hotel 1: name is required')
      expect(result.errors).toContain('Hotel 2: price per room cannot be negative')
    })

    it('should validate tour dates correctly', () => {
      const updates = {
        tourDates: {
          startDate: '2024-12-10',
          endDate: '2024-12-01',
        },
      }
      const result = ValidationService.validateEstimateUpdate(updates)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('End date must be after start date')
    })

    it('should validate markup correctly', () => {
      const updates = { markup: -10 }
      const result = ValidationService.validateEstimateUpdate(updates)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Markup must be a non-negative number')
    })

    it('should handle partial updates correctly', () => {
      const updates = { name: 'Partial Update' }
      const result = ValidationService.validateEstimateUpdate(updates)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should ignore undefined fields', () => {
      const updates = {
        name: 'Valid Name',
        undefinedField: undefined,
      }
      const result = ValidationService.validateEstimateUpdate(updates)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})

// src/composables/__tests__/useEstimateContext.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, nextTick, createApp, h } from 'vue'
import {
  provideEstimateContext,
  useEstimateContext,
  useEstimateField,
  useEstimateGroup,
  useEstimateLocation,
  useEstimateHotels,
  useEstimateTourDays,
  useEstimateOptionalServices,
} from '../useEstimateContext.js'

// Мок для Pinia store
vi.mock('@/stores/estimates.js', () => ({
  useEstimatesStore: () => ({
    updateEstimate: vi.fn().mockResolvedValue({ id: 1, title: 'Updated Estimate' }),
    createEstimate: vi.fn().mockResolvedValue({ id: 2, title: 'New Estimate' }),
  }),
}))

// Мок для ValidationService
vi.mock(
  '@/services/ValidationService.js',
  () => ({
    ValidationService: {
      validateEstimate: vi.fn().mockReturnValue(true),
    },
  }),
  { virtual: true },
)

describe('useEstimateContext', () => {
  let estimateData

  beforeEach(() => {
    estimateData = {
      id: 1,
      title: 'Test Estimate',
      client: 'Test Client',
      group: {
        totalPax: 5,
        adults: 4,
        children: 1,
        infants: 0,
      },
      location: {
        country: 'Russia',
        city: 'Moscow',
      },
      hotels: [],
      tourDays: [],
      optionalServices: [],
      markup: 10,
      currency: 'USD',
    }
  })

  describe('provideEstimateContext', () => {
    it('should provide estimate context with correct structure', () => {
      const context = provideEstimateContext(estimateData)

      expect(context).toBeDefined()
      expect(context.estimate).toBeDefined()
      expect(context.isLoading).toBeDefined()
      expect(context.error).toBeDefined()
      expect(context.isDirty).toBeDefined()
      expect(context.updateEstimate).toBeDefined()
      expect(context.saveEstimate).toBeDefined()
      expect(context.updateField).toBeDefined()
    })

    it('should initialize with provided estimate data', () => {
      const context = provideEstimateContext(estimateData)

      expect(context.estimate.value).toEqual(estimateData)
      expect(context.isLoading.value).toBe(false)
      expect(context.error.value).toBe(null)
    })

    it('should update field correctly', () => {
      const context = provideEstimateContext(estimateData)

      context.updateField('title', 'New Title')
      expect(context.estimate.value.title).toBe('New Title')
    })

    it('should update multiple fields correctly', () => {
      const context = provideEstimateContext(estimateData)

      context.updateField({
        title: 'New Title',
        client: 'New Client',
      })

      expect(context.estimate.value.title).toBe('New Title')
      expect(context.estimate.value.client).toBe('New Client')
    })

    it('should update group correctly', () => {
      const context = provideEstimateContext(estimateData)

      const newGroup = { totalPax: 10, adults: 8, children: 2, infants: 0 }
      context.updateGroup(newGroup)

      expect(context.estimate.value.group).toEqual(newGroup)
    })

    it('should update location correctly', () => {
      const context = provideEstimateContext(estimateData)

      const newLocation = { country: 'USA', city: 'New York' }
      context.updateLocation(newLocation)

      expect(context.estimate.value.location).toEqual(newLocation)
    })

    it('should add hotel correctly', () => {
      const context = provideEstimateContext(estimateData)
      const hotel = { name: 'Test Hotel', city: 'Moscow' }

      context.addHotel(hotel)

      expect(context.estimate.value.hotels).toHaveLength(1)
      expect(context.estimate.value.hotels[0]).toEqual(hotel)
    })

    it('should remove hotel correctly', () => {
      const context = provideEstimateContext(estimateData)
      const hotel = { name: 'Test Hotel', city: 'Moscow' }

      context.addHotel(hotel)
      expect(context.estimate.value.hotels).toHaveLength(1)

      context.removeHotel(0)
      expect(context.estimate.value.hotels).toHaveLength(0)
    })

    it('should update hotel correctly', () => {
      const context = provideEstimateContext(estimateData)
      const hotel = { name: 'Test Hotel', city: 'Moscow' }

      context.addHotel(hotel)
      context.updateHotel(0, { name: 'Updated Hotel' })

      expect(context.estimate.value.hotels[0].name).toBe('Updated Hotel')
      expect(context.estimate.value.hotels[0].city).toBe('Moscow')
    })

    it('should add tour day correctly', () => {
      const context = provideEstimateContext(estimateData)
      const tourDay = { day: 1, city: 'Moscow', activities: [] }

      context.addTourDay(tourDay)

      expect(context.estimate.value.tourDays).toHaveLength(1)
      expect(context.estimate.value.tourDays[0]).toEqual(tourDay)
    })

    it('should add activity correctly', () => {
      const context = provideEstimateContext(estimateData)
      const tourDay = { day: 1, city: 'Moscow', activities: [] }
      const activity = { name: 'City Tour', cost: 100 }

      context.addTourDay(tourDay)
      context.addActivity(0, activity)

      expect(context.estimate.value.tourDays[0].activities).toHaveLength(1)
      expect(context.estimate.value.tourDays[0].activities[0]).toEqual(activity)
    })

    it('should clear error correctly', () => {
      const context = provideEstimateContext(estimateData)

      context.error.value = 'Test error'
      context.clearError()

      expect(context.error.value).toBe(null)
    })

    it('should reset estimate correctly', () => {
      const context = provideEstimateContext(estimateData)

      context.updateField('title', 'Modified Title')
      context.error.value = 'Test error'

      context.resetEstimate()

      expect(context.estimate.value.title).toBe('Test Estimate')
      expect(context.error.value).toBe(null)
    })
  })

  describe('useEstimateContext', () => {
    it('should throw error when used outside of provide context', () => {
      expect(() => {
        useEstimateContext()
      }).toThrow(
        'useEstimateContext must be used within a component that provides estimate context',
      )
    })

    it('should return context when used within provide context', () => {
      // Создаем тестовый компонент с provide
      const TestComponent = {
        setup() {
          provideEstimateContext(estimateData)
          return () => h('div')
        },
      }

      const app = createApp(TestComponent)
      const container = document.createElement('div')
      app.mount(container)

      // Теперь можем использовать inject
      const context = useEstimateContext()

      expect(context).toBeDefined()
      expect(context.estimate.value).toEqual(estimateData)

      app.unmount()
    })
  })

  describe('useEstimateField', () => {
    let app, container

    beforeEach(() => {
      // Создаем тестовый компонент с provide
      const TestComponent = {
        setup() {
          provideEstimateContext(estimateData)
          return () => h('div')
        },
      }

      app = createApp(TestComponent)
      container = document.createElement('div')
      app.mount(container)
    })

    afterEach(() => {
      if (app) {
        app.unmount()
      }
    })

    it('should return field value and update function', () => {
      const { value, update } = useEstimateField('title')

      expect(value.value).toBe('Test Estimate')
      expect(typeof update).toBe('function')
    })

    it('should update field value correctly', () => {
      const { value, update } = useEstimateField('title')

      update('New Title')

      expect(value.value).toBe('New Title')
    })

    it('should work with computed getter and setter', () => {
      const { value } = useEstimateField('title')

      value.value = 'New Title'

      expect(value.value).toBe('New Title')
    })
  })

  describe('useEstimateGroup', () => {
    let app, container

    beforeEach(() => {
      // Создаем тестовый компонент с provide
      const TestComponent = {
        setup() {
          provideEstimateContext(estimateData)
          return () => h('div')
        },
      }

      app = createApp(TestComponent)
      container = document.createElement('div')
      app.mount(container)
    })

    afterEach(() => {
      if (app) {
        app.unmount()
      }
    })

    it('should return group data and update functions', () => {
      const { group, updateGroup, updateField } = useEstimateGroup()

      expect(group.value).toEqual(estimateData.group)
      expect(typeof updateGroup).toBe('function')
      expect(typeof updateField).toBe('function')
    })

    it('should update group field correctly', () => {
      const { group, updateField } = useEstimateGroup()

      updateField('totalPax', 10)

      expect(group.value.totalPax).toBe(10)
    })

    it('should update entire group correctly', () => {
      const { group, updateGroup } = useEstimateGroup()

      const newGroup = { totalPax: 10, adults: 8, children: 2, infants: 0 }
      updateGroup(newGroup)

      expect(group.value).toEqual(newGroup)
    })
  })

  describe('useEstimateLocation', () => {
    let app, container

    beforeEach(() => {
      // Создаем тестовый компонент с provide
      const TestComponent = {
        setup() {
          provideEstimateContext(estimateData)
          return () => h('div')
        },
      }

      app = createApp(TestComponent)
      container = document.createElement('div')
      app.mount(container)
    })

    afterEach(() => {
      if (app) {
        app.unmount()
      }
    })

    it('should return location data and update functions', () => {
      const { location, updateLocation, updateField } = useEstimateLocation()

      expect(location.value).toEqual(estimateData.location)
      expect(typeof updateLocation).toBe('function')
      expect(typeof updateField).toBe('function')
    })

    it('should update location field correctly', () => {
      const { location, updateField } = useEstimateLocation()

      updateField('city', 'St. Petersburg')

      expect(location.value.city).toBe('St. Petersburg')
    })
  })

  describe('useEstimateHotels', () => {
    let app, container

    beforeEach(() => {
      // Создаем тестовый компонент с provide
      const TestComponent = {
        setup() {
          provideEstimateContext(estimateData)
          return () => h('div')
        },
      }

      app = createApp(TestComponent)
      container = document.createElement('div')
      app.mount(container)
    })

    afterEach(() => {
      if (app) {
        app.unmount()
      }
    })

    it('should return hotels data and management functions', () => {
      const { hotels, addHotel, removeHotel, updateHotel } = useEstimateHotels()

      expect(hotels.value).toEqual([])
      expect(typeof addHotel).toBe('function')
      expect(typeof removeHotel).toBe('function')
      expect(typeof updateHotel).toBe('function')
    })

    it('should add hotel correctly', () => {
      const { hotels, addHotel } = useEstimateHotels()
      const hotel = { name: 'Test Hotel', city: 'Moscow' }

      addHotel(hotel)

      expect(hotels.value).toHaveLength(1)
      expect(hotels.value[0]).toEqual(hotel)
    })
  })

  describe('useEstimateTourDays', () => {
    let app, container

    beforeEach(() => {
      // Создаем тестовый компонент с provide
      const TestComponent = {
        setup() {
          provideEstimateContext(estimateData)
          return () => h('div')
        },
      }

      app = createApp(TestComponent)
      container = document.createElement('div')
      app.mount(container)
    })

    afterEach(() => {
      if (app) {
        app.unmount()
      }
    })

    it('should return tour days data and management functions', () => {
      const {
        tourDays,
        addTourDay,
        removeTourDay,
        updateTourDay,
        addActivity,
        removeActivity,
        updateActivity,
      } = useEstimateTourDays()

      expect(tourDays.value).toEqual([])
      expect(typeof addTourDay).toBe('function')
      expect(typeof removeTourDay).toBe('function')
      expect(typeof updateTourDay).toBe('function')
      expect(typeof addActivity).toBe('function')
      expect(typeof removeActivity).toBe('function')
      expect(typeof updateActivity).toBe('function')
    })

    it('should add tour day and activity correctly', () => {
      const { tourDays, addTourDay, addActivity } = useEstimateTourDays()
      const tourDay = { day: 1, city: 'Moscow', activities: [] }
      const activity = { name: 'City Tour', cost: 100 }

      addTourDay(tourDay)
      addActivity(0, activity)

      expect(tourDays.value).toHaveLength(1)
      expect(tourDays.value[0].activities).toHaveLength(1)
    })
  })

  describe('useEstimateOptionalServices', () => {
    let app, container

    beforeEach(() => {
      // Создаем тестовый компонент с provide
      const TestComponent = {
        setup() {
          provideEstimateContext(estimateData)
          return () => h('div')
        },
      }

      app = createApp(TestComponent)
      container = document.createElement('div')
      app.mount(container)
    })

    afterEach(() => {
      if (app) {
        app.unmount()
      }
    })

    it('should return optional services data and management functions', () => {
      const { optionalServices, addOptionalService, removeOptionalService, updateOptionalService } =
        useEstimateOptionalServices()

      expect(optionalServices.value).toEqual([])
      expect(typeof addOptionalService).toBe('function')
      expect(typeof removeOptionalService).toBe('function')
      expect(typeof updateOptionalService).toBe('function')
    })

    it('should add optional service correctly', () => {
      const { optionalServices, addOptionalService } = useEstimateOptionalServices()
      const service = { name: 'Transfer', cost: 50 }

      addOptionalService(service)

      expect(optionalServices.value).toHaveLength(1)
      expect(optionalServices.value[0]).toEqual(service)
    })
  })

  describe('Async operations', () => {
    it('should handle saveEstimate correctly', async () => {
      const context = provideEstimateContext(estimateData)

      const result = await context.saveEstimate()

      expect(result).toEqual({ id: 1, title: 'Updated Estimate' })
      expect(context.isLoading.value).toBe(false)
    })

    it('should handle updateEstimate correctly', async () => {
      const context = provideEstimateContext(estimateData)

      const result = await context.updateEstimate({ title: 'Updated Title' })

      expect(result).toEqual({ id: 1, title: 'Updated Estimate' })
      expect(context.isLoading.value).toBe(false)
    })

    it('should handle errors in async operations', async () => {
      const context = provideEstimateContext(estimateData)

      // Мокаем ошибку
      const mockStore = await import('@/stores/estimates.js')
      mockStore.useEstimatesStore().updateEstimate.mockRejectedValueOnce(new Error('Update failed'))

      try {
        await context.updateEstimate({ title: 'Updated Title' })
      } catch (error) {
        expect(error.message).toBe('Update failed')
        expect(context.error.value).toBe('Update failed')
        expect(context.isLoading.value).toBe(false)
      }
    })
  })

  describe('Validation', () => {
    it('should call ValidationService.validateEstimate', async () => {
      const context = provideEstimateContext(estimateData)

      // Mock ValidationService
      const { ValidationService } = await import('@/services/ValidationService.js')
      vi.spyOn(ValidationService, 'validateEstimate').mockReturnValue([])

      context.validate()

      expect(ValidationService.validateEstimate).toHaveBeenCalledWith(estimateData)
    })
  })
})

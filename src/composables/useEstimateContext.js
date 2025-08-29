// src/composables/useEstimateContext.js
// Composable для Provide/Inject паттерна для работы со сметами

import { provide, inject, ref, computed } from 'vue'
import { useEstimatesStore } from '@/stores/estimates.js'

const ESTIMATE_CONTEXT_KEY = Symbol('estimate-context')

/**
 * Provide контекст сметы для дочерних компонентов
 */
export function provideEstimateContext(estimate, options = {}) {
  const estimatesStore = useEstimatesStore()
  
  const context = {
    // Реактивные данные
    estimate: ref(estimate),
    isLoading: ref(false),
    error: ref(null),
    
    // Вычисляемые свойства
    isDirty: computed(() => {
      // Логика определения изменений
      return false
    }),
    
    // Методы для работы со сметой
    updateEstimate: async (updates) => {
      context.isLoading.value = true
      context.error.value = null
      
      try {
        const updatedEstimate = await estimatesStore.updateEstimate(
          context.estimate.value.id, 
          updates
        )
        context.estimate.value = updatedEstimate
        return updatedEstimate
      } catch (err) {
        context.error.value = err.message
        throw err
      } finally {
        context.isLoading.value = false
      }
    },
    
    saveEstimate: async () => {
      context.isLoading.value = true
      context.error.value = null
      
      try {
        if (context.estimate.value.id) {
          // Обновление существующей сметы
          const updatedEstimate = await estimatesStore.updateEstimate(
            context.estimate.value.id,
            context.estimate.value
          )
          context.estimate.value = updatedEstimate
          return updatedEstimate
        } else {
          // Создание новой сметы
          const newEstimate = await estimatesStore.createEstimate(
            context.estimate.value
          )
          context.estimate.value = newEstimate
          return newEstimate
        }
      } catch (err) {
        context.error.value = err.message
        throw err
      } finally {
        context.isLoading.value = false
      }
    },
    
    updateField: (field, value) => {
      if (typeof field === 'string') {
        context.estimate.value[field] = value
      } else if (typeof field === 'object') {
        Object.assign(context.estimate.value, field)
      }
    },
    
    updateGroup: (groupData) => {
      context.estimate.value.group = {
        ...context.estimate.value.group,
        ...groupData
      }
    },
    
    updateLocation: (locationData) => {
      context.estimate.value.location = {
        ...context.estimate.value.location,
        ...locationData
      }
    },
    
    updateHotels: (hotels) => {
      context.estimate.value.hotels = hotels
    },
    
    updateTourDays: (tourDays) => {
      context.estimate.value.tourDays = tourDays
    },
    
    updateOptionalServices: (optionalServices) => {
      context.estimate.value.optionalServices = optionalServices
    },
    
    addHotel: (hotel) => {
      context.estimate.value.hotels.push(hotel)
    },
    
    removeHotel: (index) => {
      context.estimate.value.hotels.splice(index, 1)
    },
    
    updateHotel: (index, hotelData) => {
      context.estimate.value.hotels[index] = {
        ...context.estimate.value.hotels[index],
        ...hotelData
      }
    },
    
    addTourDay: (tourDay) => {
      context.estimate.value.tourDays.push(tourDay)
    },
    
    removeTourDay: (index) => {
      context.estimate.value.tourDays.splice(index, 1)
    },
    
    updateTourDay: (index, tourDayData) => {
      context.estimate.value.tourDays[index] = {
        ...context.estimate.value.tourDays[index],
        ...tourDayData
      }
    },
    
    addActivity: (dayIndex, activity) => {
      if (!context.estimate.value.tourDays[dayIndex].activities) {
        context.estimate.value.tourDays[dayIndex].activities = []
      }
      context.estimate.value.tourDays[dayIndex].activities.push(activity)
    },
    
    removeActivity: (dayIndex, activityIndex) => {
      context.estimate.value.tourDays[dayIndex].activities.splice(activityIndex, 1)
    },
    
    updateActivity: (dayIndex, activityIndex, activityData) => {
      context.estimate.value.tourDays[dayIndex].activities[activityIndex] = {
        ...context.estimate.value.tourDays[dayIndex].activities[activityIndex],
        ...activityData
      }
    },
    
    addOptionalService: (service) => {
      context.estimate.value.optionalServices.push(service)
    },
    
    removeOptionalService: (index) => {
      context.estimate.value.optionalServices.splice(index, 1)
    },
    
    updateOptionalService: (index, serviceData) => {
      context.estimate.value.optionalServices[index] = {
        ...context.estimate.value.optionalServices[index],
        ...serviceData
      }
    },
    
    // Валидация
    validate: () => {
      // Делегируем валидацию в ValidationService
      try {
        const { ValidationService } = require('@/services/ValidationService.js')
        return ValidationService.validateEstimate(context.estimate.value)
      } catch (error) {
        // Если ValidationService недоступен, возвращаем true
        console.warn('ValidationService not available:', error.message)
        return true
      }
    },
    
    // Утилиты
    clearError: () => {
      context.error.value = null
    },
    
    resetEstimate: () => {
      // Сброс к исходному состоянию
      context.estimate.value = { ...estimate }
      context.error.value = null
    }
  }
  
  // Предоставляем контекст дочерним компонентам
  provide(ESTIMATE_CONTEXT_KEY, context)
  
  return context
}

/**
 * Inject контекст сметы в дочерних компонентах
 */
export function useEstimateContext() {
  const context = inject(ESTIMATE_CONTEXT_KEY)
  
  if (!context) {
    throw new Error('useEstimateContext must be used within a component that provides estimate context')
  }
  
  return context
}

/**
 * Composable для работы с отдельными частями сметы
 */
export function useEstimateField(fieldName) {
  const context = useEstimateContext()
  
  return {
    value: computed({
      get: () => context.estimate.value[fieldName],
      set: (value) => {
        context.updateField(fieldName, value)
      }
    }),
    update: (value) => context.updateField(fieldName, value)
  }
}

/**
 * Composable для работы с группой
 */
export function useEstimateGroup() {
  const context = useEstimateContext()
  
  return {
    group: computed(() => context.estimate.value.group || {}),
    updateGroup: context.updateGroup,
    updateField: (field, value) => {
      context.updateGroup({ [field]: value })
    }
  }
}

/**
 * Composable для работы с локацией
 */
export function useEstimateLocation() {
  const context = useEstimateContext()
  
  return {
    location: computed(() => context.estimate.value.location || {}),
    updateLocation: context.updateLocation,
    updateField: (field, value) => {
      context.updateLocation({ [field]: value })
    }
  }
}

/**
 * Composable для работы с отелями
 */
export function useEstimateHotels() {
  const context = useEstimateContext()
  
  return {
    hotels: computed(() => context.estimate.value.hotels || []),
    addHotel: context.addHotel,
    removeHotel: context.removeHotel,
    updateHotel: context.updateHotel
  }
}

/**
 * Composable для работы с днями тура
 */
export function useEstimateTourDays() {
  const context = useEstimateContext()
  
  return {
    tourDays: computed(() => context.estimate.value.tourDays || []),
    addTourDay: context.addTourDay,
    removeTourDay: context.removeTourDay,
    updateTourDay: context.updateTourDay,
    addActivity: context.addActivity,
    removeActivity: context.removeActivity,
    updateActivity: context.updateActivity
  }
}

/**
 * Composable для работы с опциональными услугами
 */
export function useEstimateOptionalServices() {
  const context = useEstimateContext()
  
  return {
    optionalServices: computed(() => context.estimate.value.optionalServices || []),
    addOptionalService: context.addOptionalService,
    removeOptionalService: context.removeOptionalService,
    updateOptionalService: context.updateOptionalService
  }
}

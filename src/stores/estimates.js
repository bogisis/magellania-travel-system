// src/stores/estimates.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/database.js'
import { ErrorHandler, ErrorTypes } from '@/services/errorHandler.js'
import { validate, validationSchemas } from '@/utils/validation.js'
import { useToastStore } from '@/stores/toastStore.js'

export const useEstimatesStore = defineStore('estimates', () => {
  // Состояние
  const estimates = ref([])
  const currentEstimate = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const validationErrors = ref({})

  // Вычисляемые свойства
  const estimatesCount = computed(() => estimates.value.length)

  const estimatesByStatus = computed(() => {
    const statusGroups = {
      draft: [],
      sent: [],
      approved: [],
      rejected: [],
    }

    estimates.value.forEach((estimate) => {
      const status = estimate.status || 'draft'
      if (statusGroups[status]) {
        statusGroups[status].push(estimate)
      }
    })

    return statusGroups
  })

  const totalRevenue = computed(() => {
    return estimates.value.reduce((sum, estimate) => {
      return sum + (estimate.totalPrice || 0)
    }, 0)
  })

  const averageEstimateValue = computed(() => {
    if (estimates.value.length === 0) return 0
    return totalRevenue.value / estimates.value.length
  })

  // Действия
  const loadEstimates = async () => {
    isLoading.value = true
    error.value = null

    try {
      const loadedEstimates = await db.getAllEstimates()
      estimates.value = loadedEstimates
    } catch (err) {
      error.value = 'Ошибка загрузки смет: ' + err.message
      ErrorHandler.handle(err, 'estimates-load')
    } finally {
      isLoading.value = false
    }
  }

  const createEstimate = async (estimateData) => {
    isLoading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      // Валидация данных
      const validationResult = validate(estimateData, validationSchemas.estimate)
      if (!validationResult.isValid) {
        validationErrors.value = validationResult.errors.reduce((acc, error) => {
          acc[error.field] = error.message
          return acc
        }, {})

        const toastStore = useToastStore()
        toastStore.error('Ошибка валидации', 'Проверьте правильность заполнения полей')

        throw new Error('Данные не прошли валидацию')
      }

      // Создание сметы в базе данных
      const { estimateId, tourDays } = await db.createEstimate(estimateData)

      // Загружаем созданную смету
      const newEstimate = await db.getEstimateWithDetails(estimateId)

      // Добавляем в список
      estimates.value.unshift(newEstimate)
      currentEstimate.value = newEstimate

      const toastStore = useToastStore()
      toastStore.success('Смета создана', 'Новая смета успешно создана')

      return newEstimate
    } catch (err) {
      error.value = 'Ошибка создания сметы: ' + err.message
      ErrorHandler.handle(err, 'estimate-create', {
        additionalData: { estimateData },
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateEstimate = async (estimateId, updates) => {
    isLoading.value = true
    error.value = null
    validationErrors.value = {}

    try {
      // Валидация обновлений
      const validationResult = validate(updates, validationSchemas.estimate)
      if (!validationResult.isValid) {
        validationErrors.value = validationResult.errors.reduce((acc, error) => {
          acc[error.field] = error.message
          return acc
        }, {})

        const toastStore = useToastStore()
        toastStore.error('Ошибка валидации', 'Проверьте правильность заполнения полей')

        throw new Error('Данные не прошли валидацию')
      }

      // Обновление в базе данных
      await db.estimates.update(estimateId, {
        ...updates,
        updatedAt: new Date(),
      })

      // Обновляем локальный список
      const index = estimates.value.findIndex((est) => est.id === estimateId)
      if (index >= 0) {
        estimates.value[index] = { ...estimates.value[index], ...updates }
      }

      // Обновляем текущую смету, если она активна
      if (currentEstimate.value && currentEstimate.value.id === estimateId) {
        currentEstimate.value = { ...currentEstimate.value, ...updates }
      }

      const toastStore = useToastStore()
      toastStore.success('Смета обновлена', 'Изменения сохранены')

      return estimates.value[index]
    } catch (err) {
      error.value = 'Ошибка обновления сметы: ' + err.message
      ErrorHandler.handle(err, 'estimate-update', {
        additionalData: { estimateId, updates },
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteEstimate = async (estimateId) => {
    isLoading.value = true
    error.value = null

    try {
      // Удаление из базы данных
      await db.deleteEstimate(estimateId)

      // Удаляем из локального списка
      const index = estimates.value.findIndex((est) => est.id === estimateId)
      if (index >= 0) {
        estimates.value.splice(index, 1)
      }

      // Сбрасываем текущую смету, если она была удалена
      if (currentEstimate.value && currentEstimate.value.id === estimateId) {
        currentEstimate.value = null
      }

      const toastStore = useToastStore()
      toastStore.success('Смета удалена', 'Смета успешно удалена')
    } catch (err) {
      error.value = 'Ошибка удаления сметы: ' + err.message
      ErrorHandler.handle(err, 'estimate-delete', {
        additionalData: { estimateId },
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const loadEstimate = async (estimateId) => {
    isLoading.value = true
    error.value = null

    try {
      const estimate = await db.getEstimateWithDetails(estimateId)
      if (!estimate) {
        throw new Error('Смета не найдена')
      }

      currentEstimate.value = estimate
      return estimate
    } catch (err) {
      error.value = 'Ошибка загрузки сметы: ' + err.message
      ErrorHandler.handle(err, 'estimate-load', {
        additionalData: { estimateId },
      })
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addActivity = async (estimateId, dayId, activityData) => {
    try {
      const activityId = await db.addActivity({
        ...activityData,
        estimateId,
        tourDayId: dayId,
      })

      // Перезагружаем смету для получения обновленных данных
      await loadEstimate(estimateId)

      const toastStore = useToastStore()
      toastStore.success('Активность добавлена', 'Активность успешно добавлена в день')

      return activityId
    } catch (err) {
      ErrorHandler.handle(err, 'activity-add', {
        additionalData: { estimateId, dayId, activityData },
      })
      throw err
    }
  }

  const updateActivity = async (estimateId, activityId, updates) => {
    try {
      await db.activities.update(activityId, updates)

      // Перезагружаем смету для получения обновленных данных
      await loadEstimate(estimateId)

      const toastStore = useToastStore()
      toastStore.success('Активность обновлена', 'Изменения сохранены')
    } catch (err) {
      ErrorHandler.handle(err, 'activity-update', {
        additionalData: { estimateId, activityId, updates },
      })
      throw err
    }
  }

  const deleteActivity = async (estimateId, activityId) => {
    try {
      await db.activities.delete(activityId)

      // Перезагружаем смету для получения обновленных данных
      await loadEstimate(estimateId)

      const toastStore = useToastStore()
      toastStore.success('Активность удалена', 'Активность успешно удалена')
    } catch (err) {
      ErrorHandler.handle(err, 'activity-delete', {
        additionalData: { estimateId, activityId },
      })
      throw err
    }
  }

  const updateEstimateStatus = async (estimateId, status) => {
    try {
      await updateEstimate(estimateId, { status })

      const toastStore = useToastStore()
      toastStore.success('Статус обновлен', `Смета переведена в статус "${status}"`)
    } catch (err) {
      ErrorHandler.handle(err, 'estimate-status-update', {
        additionalData: { estimateId, status },
      })
      throw err
    }
  }

  const duplicateEstimate = async (estimateId) => {
    try {
      const originalEstimate = estimates.value.find((est) => est.id === estimateId)
      if (!originalEstimate) {
        throw new Error('Смета не найдена')
      }

      // Создаем копию с новым именем
      const duplicateData = {
        ...originalEstimate,
        name: `${originalEstimate.name} (копия)`,
        status: 'draft',
      }

      // Удаляем ID и даты создания для создания новой записи
      delete duplicateData.id
      delete duplicateData.createdAt
      delete duplicateData.updatedAt

      const newEstimate = await createEstimate(duplicateData)

      const toastStore = useToastStore()
      toastStore.success('Смета скопирована', 'Копия сметы успешно создана')

      return newEstimate
    } catch (err) {
      ErrorHandler.handle(err, 'estimate-duplicate', {
        additionalData: { estimateId },
      })
      throw err
    }
  }

  const searchEstimates = async (query) => {
    try {
      const results = await db.searchEstimates({ searchText: query })
      return results
    } catch (err) {
      ErrorHandler.handle(err, 'estimates-search', {
        additionalData: { query },
      })
      throw err
    }
  }

  const getEstimateStatistics = async () => {
    try {
      return await db.getEstimateStatistics()
    } catch (err) {
      ErrorHandler.handle(err, 'estimates-statistics')
      throw err
    }
  }

  const clearError = () => {
    error.value = null
    validationErrors.value = {}
  }

  const setCurrentEstimate = (estimate) => {
    currentEstimate.value = estimate
  }

  const clearCurrentEstimate = () => {
    currentEstimate.value = null
  }

  return {
    // Состояние
    estimates,
    currentEstimate,
    isLoading,
    error,
    validationErrors,

    // Вычисляемые свойства
    estimatesCount,
    estimatesByStatus,
    totalRevenue,
    averageEstimateValue,

    // Действия
    loadEstimates,
    createEstimate,
    updateEstimate,
    deleteEstimate,
    loadEstimate,
    addActivity,
    updateActivity,
    deleteActivity,
    updateEstimateStatus,
    duplicateEstimate,
    searchEstimates,
    getEstimateStatistics,
    clearError,
    setCurrentEstimate,
    clearCurrentEstimate,
  }
})

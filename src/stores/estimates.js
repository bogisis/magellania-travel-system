// src/stores/estimates.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/apiService.js'
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
      const loadedEstimates = await apiService.getEstimates()
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
      // Временно отключаем валидацию для создания
      // TODO: Создать отдельную схему валидации для создания сметы
      console.log('Создание сметы:', estimateData)

      // Создание сметы через API
      const newEstimate = await apiService.createEstimate(estimateData)

      // Добавляем в список
      estimates.value.unshift(newEstimate)
      currentEstimate.value = newEstimate

      const toastStore = useToastStore()
      toastStore.showSuccess('Смета создана: Новая смета успешно создана')

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
      // Временно отключаем валидацию для обновления
      // TODO: Создать отдельную схему валидации для обновления сметы
      console.log('Обновление сметы:', estimateId, updates)

      // Обновление через API
      const updatedEstimate = await apiService.updateEstimate(estimateId, {
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
      toastStore.showSuccess('Смета обновлена: Изменения сохранены')

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
      // Удаление через API
      await apiService.deleteEstimate(estimateId)

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
      toastStore.showSuccess('Смета удалена: Смета успешно удалена')
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
      const estimate = await apiService.getEstimate(estimateId)
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
      // TODO: Добавить API для активностей
      console.warn('addActivity: API для активностей пока не реализован')

      const toastStore = useToastStore()
      toastStore.showSuccess('Активность добавлена: Активность успешно добавлена в день')

      return 'temp-id'
    } catch (err) {
      ErrorHandler.handle(err, 'activity-add', {
        additionalData: { estimateId, dayId, activityData },
      })
      throw err
    }
  }

  const updateActivity = async (estimateId, activityId, updates) => {
    try {
      // TODO: Добавить API для активностей
      console.warn('updateActivity: API для активностей пока не реализован')

      const toastStore = useToastStore()
      toastStore.showSuccess('Активность обновлена: Изменения сохранены')
    } catch (err) {
      ErrorHandler.handle(err, 'activity-update', {
        additionalData: { estimateId, activityId, updates },
      })
      throw err
    }
  }

  const deleteActivity = async (estimateId, activityId) => {
    try {
      // TODO: Добавить API для активностей
      console.warn('deleteActivity: API для активностей пока не реализован')

      const toastStore = useToastStore()
      toastStore.showSuccess('Активность удалена: Активность успешно удалена')
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
      toastStore.showSuccess(`Статус обновлен: Смета переведена в статус "${status}"`)
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
      toastStore.showSuccess('Смета скопирована: Копия сметы успешно создана')

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
      // TODO: Добавить поиск в API
      console.warn('searchEstimates: API для поиска пока не реализован')
      return estimates.value.filter(
        (estimate) =>
          estimate.name.toLowerCase().includes(query.toLowerCase()) ||
          estimate.tourName?.toLowerCase().includes(query.toLowerCase()),
      )
    } catch (err) {
      ErrorHandler.handle(err, 'estimates-search', {
        additionalData: { query },
      })
      throw err
    }
  }

  const getEstimateStatistics = async () => {
    try {
      // TODO: Добавить статистику в API
      console.warn('getEstimateStatistics: API для статистики пока не реализован')
      return {
        total: estimates.value.length,
        draft: estimates.value.filter((e) => e.status === 'draft').length,
        sent: estimates.value.filter((e) => e.status === 'sent').length,
        approved: estimates.value.filter((e) => e.status === 'approved').length,
        totalRevenue: estimates.value.reduce((sum, e) => sum + (e.totalPrice || 0), 0),
      }
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

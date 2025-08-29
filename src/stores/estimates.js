// src/stores/estimates.js
// Store только для управления состоянием смет

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { EstimateService } from '@/services/EstimateService.js'
import { EstimateRepository } from '@/services/EstimateRepository.js'
import { ErrorHandler } from '@/services/errorHandler.js'
import { useToastStore } from '@/stores/toastStore.js'

export const useEstimatesStore = defineStore('estimates', () => {
  // Состояние
  const estimates = ref([])
  const currentEstimate = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

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

  // Действия - только управление состоянием
  const setEstimates = (newEstimates) => {
    estimates.value = newEstimates
  }

  const addEstimate = (estimate) => {
    estimates.value.unshift(estimate)
  }

  const updateEstimateInStore = (updatedEstimate) => {
    const index = estimates.value.findIndex((est) => est.id === updatedEstimate.id)
    if (index !== -1) {
      estimates.value[index] = updatedEstimate
    }
  }

  const removeEstimate = (estimateId) => {
    estimates.value = estimates.value.filter((est) => est.id !== estimateId)
  }

  const setCurrentEstimate = (estimate) => {
    currentEstimate.value = estimate
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Бизнес-логика делегируется сервисам
  const loadEstimates = async () => {
    setLoading(true)
    clearError()

    try {
      const loadedEstimates = await EstimateRepository.getAll()
      setEstimates(loadedEstimates)
    } catch (err) {
      setError('Ошибка загрузки смет: ' + err.message)
      ErrorHandler.handle(err, 'estimates-load')
    } finally {
      setLoading(false)
    }
  }

  const createEstimate = async (estimateData) => {
    setLoading(true)
    clearError()

    try {
      // Бизнес-логика в EstimateService
      const processedData = await EstimateService.create(estimateData)
      const newEstimate = await EstimateRepository.create(processedData)

      addEstimate(newEstimate)
      setCurrentEstimate(newEstimate)

      const toastStore = useToastStore()
      toastStore.showSuccess('Смета создана: Новая смета успешно создана')

      return newEstimate
    } catch (err) {
      setError('Ошибка создания сметы: ' + err.message)
      ErrorHandler.handle(err, 'estimate-create', {
        additionalData: { estimateData },
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateEstimate = async (estimateId, updates) => {
    setLoading(true)
    clearError()

    try {
      // Бизнес-логика в EstimateService
      const processedUpdates = await EstimateService.update(estimateId, updates)
      const updatedEstimate = await EstimateRepository.update(estimateId, processedUpdates)

      updateEstimateInStore(updatedEstimate)

      // Обновляем текущую смету, если она активна
      if (currentEstimate.value && currentEstimate.value.id === estimateId) {
        setCurrentEstimate(updatedEstimate)
      }

      const toastStore = useToastStore()
      toastStore.showSuccess('Смета обновлена: Изменения сохранены')

      return updatedEstimate
    } catch (err) {
      setError('Ошибка обновления сметы: ' + err.message)
      ErrorHandler.handle(err, 'estimate-update', {
        additionalData: { estimateId, updates },
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteEstimate = async (estimateId) => {
    setLoading(true)
    clearError()

    try {
      await EstimateRepository.delete(estimateId)
      removeEstimate(estimateId)

      // Сбрасываем текущую смету, если она была удалена
      if (currentEstimate.value && currentEstimate.value.id === estimateId) {
        setCurrentEstimate(null)
      }

      const toastStore = useToastStore()
      toastStore.showSuccess('Смета удалена: Смета успешно удалена')
    } catch (err) {
      setError('Ошибка удаления сметы: ' + err.message)
      ErrorHandler.handle(err, 'estimate-delete', {
        additionalData: { estimateId },
      })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const loadEstimate = async (estimateId) => {
    setLoading(true)
    clearError()

    try {
      const estimate = await EstimateRepository.getById(estimateId)
      if (!estimate) {
        throw new Error('Смета не найдена')
      }

      setCurrentEstimate(estimate)
      return estimate
    } catch (err) {
      setError('Ошибка загрузки сметы: ' + err.message)
      ErrorHandler.handle(err, 'estimate-load', {
        additionalData: { estimateId },
      })
      throw err
    } finally {
      setLoading(false)
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
      const newEstimate = await EstimateRepository.duplicate(estimateId)
      addEstimate(newEstimate)

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

  const clearCurrentEstimate = () => {
    setCurrentEstimate(null)
  }

  return {
    // Состояние
    estimates,
    currentEstimate,
    isLoading,
    error,

    // Вычисляемые свойства
    estimatesCount,
    estimatesByStatus,
    totalRevenue,
    averageEstimateValue,

    // Действия управления состоянием
    setEstimates,
    addEstimate,
    updateEstimateInStore,
    removeEstimate,
    setCurrentEstimate,
    setLoading,
    setError,
    clearError,
    clearCurrentEstimate,

    // Бизнес-действия (делегируют сервисам)
    loadEstimates,
    createEstimate,
    updateEstimate,
    deleteEstimate,
    loadEstimate,
    updateEstimateStatus,
    duplicateEstimate,
    searchEstimates,
    getEstimateStatistics,
  }
})

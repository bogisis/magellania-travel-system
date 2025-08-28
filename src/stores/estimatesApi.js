import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/apiService'
import { useToastStore } from './toastStore'

export const useEstimatesApiStore = defineStore('estimatesApi', () => {
  // State
  const estimates = ref([])
  const currentEstimate = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const connectionStatus = ref('disconnected')

  // Getters
  const getEstimates = computed(() => estimates.value)
  const getCurrentEstimate = computed(() => currentEstimate.value)
  const isLoading = computed(() => loading.value)
  const getError = computed(() => error.value)
  const isConnected = computed(() => connectionStatus.value === 'connected')

  // Actions
  const toastStore = useToastStore()

  /**
   * Проверить подключение к API
   */
  const checkConnection = async () => {
    try {
      const result = await apiService.testConnection()
      connectionStatus.value = result.connected ? 'connected' : 'disconnected'
      return result
    } catch (error) {
      connectionStatus.value = 'disconnected'
      throw error
    }
  }

  /**
   * Загрузить все сметы
   */
  const loadEstimates = async () => {
    loading.value = true
    error.value = null

    try {
      // Проверяем подключение
      await checkConnection()

      if (!isConnected.value) {
        throw new Error('Нет подключения к API серверу')
      }

      const data = await apiService.getEstimates()
      estimates.value = data

      toastStore.success('Успех', `Загружено ${data.length} смет`)
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка', `Не удалось загрузить сметы: ${err.message}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Загрузить смету по ID
   */
  const loadEstimate = async (id) => {
    loading.value = true
    error.value = null

    try {
      await checkConnection()

      if (!isConnected.value) {
        throw new Error('Нет подключения к API серверу')
      }

      const data = await apiService.getEstimate(id)
      currentEstimate.value = data

      return data
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка', `Не удалось загрузить смету: ${err.message}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Создать новую смету
   */
  const createEstimate = async (estimateData) => {
    loading.value = true
    error.value = null

    try {
      await checkConnection()

      if (!isConnected.value) {
        throw new Error('Нет подключения к API серверу')
      }

      const result = await apiService.createEstimate(estimateData)
      const newEstimate = result.estimate

      // Добавляем в список
      estimates.value.unshift(newEstimate)

      toastStore.success('Успех', 'Смета создана успешно')
      return newEstimate
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка', `Не удалось создать смету: ${err.message}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Обновить смету
   */
  const updateEstimate = async (id, updates) => {
    loading.value = true
    error.value = null

    try {
      await checkConnection()

      if (!isConnected.value) {
        throw new Error('Нет подключения к API серверу')
      }

      const result = await apiService.updateEstimate(id, updates)
      const updatedEstimate = result.estimate

      // Обновляем в списке
      const index = estimates.value.findIndex((e) => e.id === id)
      if (index >= 0) {
        estimates.value[index] = updatedEstimate
      }

      // Обновляем текущую смету
      if (currentEstimate.value && currentEstimate.value.id === id) {
        currentEstimate.value = updatedEstimate
      }

      toastStore.success('Успех', 'Смета обновлена успешно')
      return updatedEstimate
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка', `Не удалось обновить смету: ${err.message}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Удалить смету
   */
  const deleteEstimate = async (id) => {
    loading.value = true
    error.value = null

    try {
      await checkConnection()

      if (!isConnected.value) {
        throw new Error('Нет подключения к API серверу')
      }

      await apiService.deleteEstimate(id)

      // Удаляем из списка
      estimates.value = estimates.value.filter((e) => e.id !== id)

      // Очищаем текущую смету если она была удалена
      if (currentEstimate.value && currentEstimate.value.id === id) {
        currentEstimate.value = null
      }

      toastStore.success('Успех', 'Смета удалена успешно')
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка', `Не удалось удалить смету: ${err.message}`)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Установить текущую смету
   */
  const setCurrentEstimate = (estimate) => {
    currentEstimate.value = estimate
  }

  /**
   * Очистить текущую смету
   */
  const clearCurrentEstimate = () => {
    currentEstimate.value = null
  }

  /**
   * Очистить ошибку
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Мигрировать данные из IndexedDB
   */
  const migrateFromIndexedDB = async () => {
    loading.value = true
    error.value = null

    try {
      await checkConnection()

      if (!isConnected.value) {
        throw new Error('Нет подключения к API серверу')
      }

      toastStore.loading('Миграция', 'Перенос данных из IndexedDB...')

      const result = await apiService.migrateFromIndexedDB()

      // Перезагружаем данные
      await loadEstimates()

      toastStore.success(
        'Миграция завершена',
        `Перенесено: ${result.migrated.clients} клиентов, ${result.migrated.suppliers} поставщиков, ${result.migrated.estimates} смет`,
      )

      return result
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка миграции', err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    estimates,
    currentEstimate,
    loading,
    error,
    connectionStatus,

    // Getters
    getEstimates,
    getCurrentEstimate,
    isLoading,
    getError,
    isConnected,

    // Actions
    checkConnection,
    loadEstimates,
    loadEstimate,
    createEstimate,
    updateEstimate,
    deleteEstimate,
    setCurrentEstimate,
    clearCurrentEstimate,
    clearError,
    migrateFromIndexedDB,
  }
})

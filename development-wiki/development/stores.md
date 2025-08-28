# Stores (Pinia)

## 🗃 Обзор управления состоянием

MAGELLANIA Travel System использует Pinia для управления состоянием приложения. Pinia предоставляет простой и типобезопасный способ управления глобальным состоянием.

### Принципы управления состоянием

1. **Единый источник истины** - каждое состояние хранится в одном месте
2. **Иммутабельность** - состояние изменяется только через actions
3. **Реактивность** - автоматическое обновление UI при изменении состояния
4. **Модульность** - разделение состояния по доменам

## 📁 Структура stores

```
src/stores/
├── estimates.js         # Store для смет
├── clients.js           # Store для клиентов
├── suppliers.js         # Store для поставщиков
├── tariffs.js           # Store для тарифов
├── toastStore.js        # Store для уведомлений
├── userStore.js         # Store для пользователя
└── index.js             # Главный store
```

## 🧩 Основные stores

### Estimate Store

```javascript
// src/stores/estimates.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { addDays, format } from 'date-fns'
import { apiService } from '@/services/apiService'
import { useToastStore } from './toastStore'

export const useEstimateStore = defineStore('estimate', () => {
  // ===== СОСТОЯНИЕ =====
  const estimates = ref([])
  const currentEstimateId = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // ===== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА =====
  const currentEstimate = computed(() => {
    if (!currentEstimateId.value) return null
    return estimates.value.find((est) => est.id === currentEstimateId.value)
  })

  const estimatesCount = computed(() => estimates.value.length)

  const totalRevenue = computed(() => {
    return estimates.value.reduce((sum, estimate) => {
      return sum + (estimate.totalPrice || 0)
    }, 0)
  })

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

  // ===== ACTIONS =====

  /**
   * Загрузить все сметы из API
   */
  const loadAllEstimates = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.get('/estimates')
      estimates.value = response.data
    } catch (err) {
      error.value = 'Ошибка загрузки смет: ' + err.message
      console.error('Error loading estimates:', err)

      const toastStore = useToastStore()
      toastStore.showError('Не удалось загрузить сметы')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Создать новую смету
   */
  const createNewEstimate = (initialData = {}) => {
    const newEstimate = {
      id: `estimate_${Date.now()}`,
      name: initialData.name || 'Новая смета',
      tourInfo: {
        tourName: 'Новый тур',
        country: 'argentina',
        region: '',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        duration: 7,
        endDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
        touristCount: 4,
        guideCount: 1,
        accommodation: {
          double: { count: 2, price: 100 },
          single: { count: 0, price: 150 },
        },
        ...initialData.tourInfo,
      },
      days: [],
      generalExpenses: [],
      optionalServices: [],
      pricing: {
        markupPercent: 15,
        showWithMarkup: true,
        ...initialData.pricing,
      },
      status: 'draft',
      totalPrice: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    estimates.value.unshift(newEstimate)
    currentEstimateId.value = newEstimate.id

    return newEstimate
  }

  /**
   * Сохранить смету
   */
  const saveEstimate = async (estimate) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.post('/estimates', estimate)
      const savedEstimate = response.data

      // Обновляем в локальном состоянии
      const index = estimates.value.findIndex((est) => est.id === savedEstimate.id)
      if (index !== -1) {
        estimates.value[index] = savedEstimate
      } else {
        estimates.value.unshift(savedEstimate)
      }

      const toastStore = useToastStore()
      toastStore.showSuccess('Смета сохранена')

      return savedEstimate
    } catch (err) {
      error.value = 'Ошибка сохранения сметы: ' + err.message
      console.error('Error saving estimate:', err)

      const toastStore = useToastStore()
      toastStore.showError('Не удалось сохранить смету')

      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Обновить смету
   */
  const updateEstimate = async (estimateId, updates) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.put(`/estimates/${estimateId}`, updates)
      const updatedEstimate = response.data

      // Обновляем в локальном состоянии
      const index = estimates.value.findIndex((est) => est.id === estimateId)
      if (index !== -1) {
        estimates.value[index] = { ...estimates.value[index], ...updatedEstimate }
      }

      const toastStore = useToastStore()
      toastStore.showSuccess('Смета обновлена')

      return updatedEstimate
    } catch (err) {
      error.value = 'Ошибка обновления сметы: ' + err.message
      console.error('Error updating estimate:', err)

      const toastStore = useToastStore()
      toastStore.showError('Не удалось обновить смету')

      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Удалить смету
   */
  const deleteEstimate = async (estimateId) => {
    isLoading.value = true
    error.value = null

    try {
      await apiService.delete(`/estimates/${estimateId}`)

      // Удаляем из локального состояния
      estimates.value = estimates.value.filter((est) => est.id !== estimateId)

      // Если удаляемая смета была текущей, очищаем currentEstimateId
      if (currentEstimateId.value === estimateId) {
        currentEstimateId.value = null
      }

      const toastStore = useToastStore()
      toastStore.showSuccess('Смета удалена')
    } catch (err) {
      error.value = 'Ошибка удаления сметы: ' + err.message
      console.error('Error deleting estimate:', err)

      const toastStore = useToastStore()
      toastStore.showError('Не удалось удалить смету')

      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Установить текущую смету
   */
  const setCurrentEstimate = (estimateId) => {
    currentEstimateId.value = estimateId
  }

  /**
   * Очистить ошибки
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    estimates,
    currentEstimateId,
    isLoading,
    error,

    // Computed
    currentEstimate,
    estimatesCount,
    totalRevenue,
    estimatesByStatus,

    // Actions
    loadAllEstimates,
    createNewEstimate,
    saveEstimate,
    updateEstimate,
    deleteEstimate,
    setCurrentEstimate,
    clearError,
  }
})
```

### Client Store

```javascript
// src/stores/clients.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/apiService'
import { useToastStore } from './toastStore'

export const useClientStore = defineStore('client', () => {
  // ===== СОСТОЯНИЕ =====
  const clients = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // ===== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА =====
  const clientsCount = computed(() => clients.value.length)

  const clientsBySegment = computed(() => {
    const segments = {
      premium: [],
      regular: [],
      new: [],
    }

    clients.value.forEach((client) => {
      const segment = client.segment || 'regular'
      if (segments[segment]) {
        segments[segment].push(client)
      }
    })

    return segments
  })

  const activeClients = computed(() => {
    return clients.value.filter((client) => client.status === 'active')
  })

  // ===== ACTIONS =====

  /**
   * Загрузить всех клиентов
   */
  const loadAllClients = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.get('/clients')
      clients.value = response.data
    } catch (err) {
      error.value = 'Ошибка загрузки клиентов: ' + err.message
      console.error('Error loading clients:', err)

      const toastStore = useToastStore()
      toastStore.showError('Не удалось загрузить клиентов')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Создать нового клиента
   */
  const createClient = async (clientData) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.post('/clients', clientData)
      const newClient = response.data

      clients.value.unshift(newClient)

      const toastStore = useToastStore()
      toastStore.showSuccess('Клиент создан')

      return newClient
    } catch (err) {
      error.value = 'Ошибка создания клиента: ' + err.message
      console.error('Error creating client:', err)

      const toastStore = useToastStore()
      toastStore.showError('Не удалось создать клиента')

      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Обновить клиента
   */
  const updateClient = async (clientId, updates) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.put(`/clients/${clientId}`, updates)
      const updatedClient = response.data

      const index = clients.value.findIndex((client) => client.id === clientId)
      if (index !== -1) {
        clients.value[index] = { ...clients.value[index], ...updatedClient }
      }

      const toastStore = useToastStore()
      toastStore.showSuccess('Клиент обновлен')

      return updatedClient
    } catch (err) {
      error.value = 'Ошибка обновления клиента: ' + err.message
      console.error('Error updating client:', err)

      const toastStore = useToastStore()
      toastStore.showError('Не удалось обновить клиента')

      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Удалить клиента
   */
  const deleteClient = async (clientId) => {
    isLoading.value = true
    error.value = null

    try {
      await apiService.delete(`/clients/${clientId}`)

      clients.value = clients.value.filter((client) => client.id !== clientId)

      const toastStore = useToastStore()
      toastStore.showSuccess('Клиент удален')
    } catch (err) {
      error.value = 'Ошибка удаления клиента: ' + err.message
      console.error('Error deleting client:', err)

      const toastStore = useToastStore()
      toastStore.showError('Не удалось удалить клиента')

      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    clients,
    isLoading,
    error,

    // Computed
    clientsCount,
    clientsBySegment,
    activeClients,

    // Actions
    loadAllClients,
    createClient,
    updateClient,
    deleteClient,
  }
})
```

### Toast Store

```javascript
// src/stores/toastStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  // ===== СОСТОЯНИЕ =====
  const toasts = ref([])
  const nextId = ref(1)

  // ===== ACTIONS =====

  /**
   * Показать уведомление
   */
  const showToast = (message, type = 'info', duration = 5000) => {
    const toast = {
      id: nextId.value++,
      message,
      type,
      duration,
      timestamp: Date.now(),
    }

    toasts.value.push(toast)

    // Автоматическое удаление
    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, duration)
    }

    return toast.id
  }

  /**
   * Показать успешное уведомление
   */
  const showSuccess = (message, duration = 5000) => {
    return showToast(message, 'success', duration)
  }

  /**
   * Показать уведомление об ошибке
   */
  const showError = (message, duration = 7000) => {
    return showToast(message, 'error', duration)
  }

  /**
   * Показать предупреждение
   */
  const showWarning = (message, duration = 5000) => {
    return showToast(message, 'warning', duration)
  }

  /**
   * Показать информационное уведомление
   */
  const showInfo = (message, duration = 5000) => {
    return showToast(message, 'info', duration)
  }

  /**
   * Удалить уведомление
   */
  const removeToast = (id) => {
    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Очистить все уведомления
   */
  const clearAll = () => {
    toasts.value = []
  }

  return {
    // State
    toasts,

    // Actions
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAll,
  }
})
```

## 🔄 Использование stores в компонентах

### Пример использования Estimate Store

```vue
<template>
  <div class="estimates-page">
    <!-- Заголовок -->
    <div class="page-header">
      <h1>Сметы</h1>
      <BaseButton @click="createEstimate"> Создать смету </BaseButton>
    </div>

    <!-- Статистика -->
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Всего смет</h3>
        <p class="stat-number">{{ estimatesCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Общий доход</h3>
        <p class="stat-number">{{ formatPrice(totalRevenue) }}</p>
      </div>
    </div>

    <!-- Список смет -->
    <div v-if="isLoading" class="loading">Загрузка смет...</div>

    <div v-else-if="error" class="error">
      {{ error }}
      <BaseButton @click="loadEstimates">Повторить</BaseButton>
    </div>

    <div v-else class="estimates-grid">
      <EstimateCard
        v-for="estimate in estimates"
        :key="estimate.id"
        :estimate="estimate"
        @view="viewEstimate"
        @edit="editEstimate"
        @delete="deleteEstimate"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEstimateStore } from '@/stores/estimates'
import BaseButton from '@/components/common/BaseButton.vue'
import EstimateCard from '@/components/estimates/EstimateCard.vue'

const router = useRouter()
const estimateStore = useEstimateStore()

// Получаем состояние из store
const {
  estimates,
  isLoading,
  error,
  estimatesCount,
  totalRevenue,
  loadAllEstimates,
  createNewEstimate,
  deleteEstimate,
} = estimateStore

// Методы
const loadEstimates = () => {
  loadAllEstimates()
}

const createEstimate = () => {
  const newEstimate = createNewEstimate()
  router.push(`/estimates/${newEstimate.id}/edit`)
}

const viewEstimate = (id) => {
  router.push(`/estimates/${id}`)
}

const editEstimate = (id) => {
  router.push(`/estimates/${id}/edit`)
}

const deleteEstimate = async (id) => {
  if (confirm('Вы уверены, что хотите удалить эту смету?')) {
    try {
      await deleteEstimate(id)
    } catch (error) {
      console.error('Error deleting estimate:', error)
    }
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(price)
}

// Загружаем данные при монтировании
onMounted(() => {
  loadEstimates()
})
</script>
```

## 🎯 Паттерны использования

### 1. Композиция stores

```javascript
// Комбинирование нескольких stores
import { useEstimateStore } from '@/stores/estimates'
import { useClientStore } from '@/stores/clients'
import { useToastStore } from '@/stores/toastStore'

export const useDashboardStore = defineStore('dashboard', () => {
  const estimateStore = useEstimateStore()
  const clientStore = useClientStore()
  const toastStore = useToastStore()

  const loadDashboardData = async () => {
    try {
      await Promise.all([estimateStore.loadAllEstimates(), clientStore.loadAllClients()])

      toastStore.showSuccess('Данные загружены')
    } catch (error) {
      toastStore.showError('Ошибка загрузки данных')
    }
  }

  return {
    loadDashboardData,
  }
})
```

### 2. Локальное состояние vs Global состояние

```javascript
// Локальное состояние в компоненте
const localSearchQuery = ref('')

// Глобальное состояние в store
const globalFilters = ref({
  status: 'all',
  dateRange: null,
  clientId: null,
})
```

### 3. Оптимизация производительности

```javascript
// Использование computed для кэширования
const expensiveComputation = computed(() => {
  return estimates.value
    .filter((est) => est.status === 'approved')
    .reduce((sum, est) => sum + est.totalPrice, 0)
})

// Использование shallowRef для больших объектов
const largeDataSet = shallowRef([])
```

## 📋 Чек-лист для создания stores

- [ ] Определена четкая ответственность store
- [ ] Используется Composition API
- [ ] Добавлены computed свойства для производных данных
- [ ] Реализована обработка ошибок
- [ ] Добавлены loading состояния
- [ ] Используется Toast Store для уведомлений
- [ ] Документированы все actions
- [ ] Протестированы edge cases

---

**Версия**: 2.0.0  
**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Development Team

// ===== VUE ROUTER КОНФИГУРАЦИЯ =====
// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useEstimateStore } from '@/stores/estimateStore'
import { useToastStore } from '@/stores/toastStore'

// Lazy loading компонентов для оптимизации
const HomePage = () => import('@/pages/HomePage.vue')
const EstimatesPage = () => import('@/pages/EstimatesPage.vue')
const EstimateEditor = () => import('@/pages/EstimateEditor.vue')
const OptionalServicesPage = () => import('@/pages/OptionalServicesPage.vue')
const PreviewPage = () => import('@/pages/PreviewPage.vue')
const SettingsPage = () => import('@/pages/SettingsPage.vue')
const NotFoundPage = () => import('@/pages/NotFoundPage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'Главная',
      icon: '🏠',
      showInNav: true
    }
  },
  {
    path: '/estimates',
    name: 'Estimates',
    component: EstimatesPage,
    meta: {
      title: 'Сметы',
      icon: '📊',
      showInNav: true
    }
  },
  {
    path: '/estimate/:id?',
    name: 'EstimateEditor',
    component: EstimateEditor,
    meta: {
      title: 'Редактор сметы',
      icon: '✏️',
      showInNav: true,
      requiresEstimate: false // Может создавать новую смету
    },
    beforeEnter: (to, from, next) => {
      const estimateStore = useEstimateStore()
      
      if (to.params.id) {
        // Загружаем существующую смету
        const estimate = estimateStore.loadEstimate(to.params.id)
        if (!estimate) {
          const toastStore = useToastStore()
          toastStore.error('Ошибка', 'Смета не найдена')
          return next('/estimates')
        }
      } else {
        // Создаем новую смету
        estimateStore.createNewEstimate()
      }
      
      next()
    }
  },
  {
    path: '/optional-services',
    name: 'OptionalServices', 
    component: OptionalServicesPage,
    meta: {
      title: 'Доп. услуги',
      icon: '⭐',
      showInNav: true
    }
  },
  {
    path: '/preview/:id?',
    name: 'Preview',
    component: PreviewPage,
    meta: {
      title: 'Предпросмотр',
      icon: '👁️',
      showInNav: true,
      requiresEstimate: true
    },
    beforeEnter: (to, from, next) => {
      const estimateStore = useEstimateStore()
      const estimateId = to.params.id || estimateStore.currentEstimateId
      
      if (!estimateId || !estimateStore.loadEstimate(estimateId)) {
        const toastStore = useToastStore()
        toastStore.warning('Внимание', 'Выберите смету для предпросмотра')
        return next('/estimates')
      }
      
      next()
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: {
      title: 'Настройки',
      icon: '⚙️',
      showInNav: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
    meta: {
      title: 'Страница не найдена',
      showInNav: false
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Восстанавливаем позицию скролла или скроллим вверх
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Глобальные guards
router.beforeEach((to, from, next) => {
  // Обновляем заголовок страницы
  document.title = to.meta.title ? 
    `${to.meta.title} - Magellania Travel System` : 
    'Magellania Travel System'
  
  next()
})

router.afterEach((to, from) => {
  // Логирование навигации для аналитики
  console.log(`Navigated from ${from.name} to ${to.name}`)
})

export default router

// ===== COMPOSABLES =====

// src/composables/useEstimates.js
import { ref, computed } from 'vue'
import { useEstimateStore } from '@/stores/estimateStore'
import { useToastStore } from '@/stores/toastStore'
import { calculationService } from '@/services/calculationService'

export function useEstimates() {
  const estimateStore = useEstimateStore()
  const toastStore = useToastStore()
  
  const isLoading = ref(false)
  const error = ref(null)

  // Вычисляемые свойства
  const estimates = computed(() => estimateStore.estimates)
  const currentEstimate = computed(() => estimateStore.currentEstimate)
  const estimatesCount = computed(() => estimateStore.estimatesCount)

  // Создать новую смету
  const createEstimate = async (initialData = {}) => {
    try {
      isLoading.value = true
      const estimate = estimateStore.createNewEstimate(initialData)
      toastStore.success('Успех', 'Новая смета создана')
      return estimate
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка', 'Не удалось создать смету')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Загрузить смету
  const loadEstimate = async (estimateId) => {
    try {
      isLoading.value = true
      const estimate = estimateStore.loadEstimate(estimateId)
      if (!estimate) {
        throw new Error('Смета не найдена')
      }
      return estimate
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка', err.message)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Сохранить смету
  const saveEstimate = async (estimate = null) => {
    try {
      isLoading.value = true
      await estimateStore.saveEstimate(estimate)
      return true
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Удалить смету
  const deleteEstimate = async (estimateId) => {
    try {
      isLoading.value = true
      await estimateStore.deleteEstimate(estimateId)
      toastStore.success('Успех', 'Смета удалена')
      return true
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка', 'Не удалось удалить смету')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Дублировать смету
  const duplicateEstimate = async (estimateId) => {
    try {
      isLoading.value = true
      const original = estimates.value.find(est => est.id === estimateId)
      if (!original) {
        throw new Error('Смета для дублирования не найдена')
      }

      const duplicate = {
        ...original,
        id: undefined, // Будет создан новый ID
        name: `${original.name} (копия)`,
        tourInfo: {
          ...original.tourInfo,
          tourName: `${original.tourInfo.tourName} (копия)`
        },
        status: 'draft',
        createdAt: undefined,
        modifiedAt: undefined
      }

      const newEstimate = estimateStore.createNewEstimate(duplicate)
      toastStore.success('Успех', 'Смета дублирована')
      return newEstimate
    } catch (err) {
      error.value = err.message
      toastStore.error('Ошибка', 'Не удалось дублировать смету')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Состояние
    isLoading,
    error,
    
    // Вычисляемые свойства
    estimates,
    currentEstimate,
    estimatesCount,
    
    // Методы
    createEstimate,
    loadEstimate,
    saveEstimate,
    deleteEstimate,
    duplicateEstimate
  }
}

// src/composables/useCalculations.js
import { computed } from 'vue'
import { calculationService } from '@/services/calculationService'
import { currencyService } from '@/services/currencyService'

export function useCalculations(estimate) {
  // Базовые расчеты
  const subtotal = computed(() => {
    if (!estimate?.value) return 0
    return calculationService.calculateTotal(estimate.value)
  })

  const detailedCalculation = computed(() => {
    if (!estimate?.value) return null
    return calculationService.calculateDetailedTotal(estimate.value)
  })

  // Форматированные значения
  const formattedSubtotal = computed(() => {
    const currency = estimate?.value?.currency || 'USD'
    return currencyService.formatAmount(subtotal.value, currency)
  })

  const formattedTotal = computed(() => {
    const currency = estimate?.value?.currency || 'USD'
    const calculation = detailedCalculation.value
    return calculation ? currencyService.formatAmount(calculation.total, currency) : '$0.00'
  })

  // Расчет рентабельности
  const profitability = computed(() => {
    if (!estimate?.value) return null
    return calculationService.calculateProfitability(estimate.value)
  })

  // Валидация
  const validation = computed(() => {
    if (!estimate?.value) return { valid: false, errors: [], warnings: [] }
    return calculationService.validateEstimate(estimate.value)
  })

  // Методы для работы с отдельными элементами
  const calculateDayTotal = (day) => {
    return calculationService.calculateDayTotal(day)
  }

  const calculateItemTotal = (item) => {
    return calculationService.calculateItemTotal(item)
  }

  const formatAmount = (amount, currency = 'USD') => {
    return currencyService.formatAmount(amount, currency)
  }

  return {
    // Вычисляемые свойства
    subtotal,
    detailedCalculation,
    formattedSubtotal,
    formattedTotal,
    profitability,
    validation,
    
    // Методы
    calculateDayTotal,
    calculateItemTotal,
    formatAmount
  }
}

// src/composables/useToast.js
import { useToastStore } from '@/stores/toastStore'

export function useToast() {
  const toastStore = useToastStore()

  const success = (title, message, options = {}) => {
    return toastStore.success(title, message, options)
  }

  const error = (title, message, options = {}) => {
    return toastStore.error(title, message, options)
  }

  const warning = (title, message, options = {}) => {
    return toastStore.warning(title, message, options)
  }

  const info = (title, message, options = {}) => {
    return toastStore.info(title, message, options)
  }

  const remove = (toastId) => {
    return toastStore.removeToast(toastId)
  }

  const clear = () => {
    return toastStore.clearAllToasts()
  }

  return {
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
}

// src/composables/useModal.js
import { ref } from 'vue'

export function useModal(initiallyOpen = false) {
  const isOpen = ref(initiallyOpen)
  const data = ref(null)

  const open = (modalData = null) => {
    data.value = modalData
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    data.value = null
  }

  const toggle = () => {
    isOpen.value ? close() : open()
  }

  return {
    isOpen,
    data,
    open,
    close,
    toggle
  }
}

// src/composables/useDebounce.js
import { ref, watch } from 'vue'

export function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value)

  let timeout = null

  watch(value, (newValue) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  return debouncedValue
}

// src/composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue = null) {
  const stored = localStorage.getItem(key)
  const initialValue = stored ? JSON.parse(stored) : defaultValue
  
  const storedValue = ref(initialValue)

  // Следим за изменениями и сохраняем в localStorage
  watch(
    storedValue,
    (newValue) => {
      if (newValue === null || newValue === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(newValue))
      }
    },
    { deep: true }
  )

  // Слушаем изменения в других вкладках
  window.addEventListener('storage', (e) => {
    if (e.key === key) {
      storedValue.value = e.newValue ? JSON.parse(e.newValue) : defaultValue
    }
  })

  return storedValue
}

// src/composables/useValidation.js
import { ref, computed } from 'vue'

export function useValidation(rules = {}) {
  const values = ref({})
  const errors = ref({})
  const touched = ref({})

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  const hasErrors = computed(() => {
    return Object.keys(errors.value).some(key => touched.value[key])
  })

  const validateField = (fieldName, value) => {
    const fieldRules = rules[fieldName]
    if (!fieldRules) return true

    let error = null

    for (const rule of fieldRules) {
      if (typeof rule === 'function') {
        const result = rule(value)
        if (result !== true) {
          error = result
          break
        }
      }
    }

    if (error) {
      errors.value[fieldName] = error
    } else {
      delete errors.value[fieldName]
    }

    return !error
  }

  const validate = () => {
    let isFormValid = true
    
    Object.keys(rules).forEach(fieldName => {
      const fieldValue = values.value[fieldName]
      const isFieldValid = validateField(fieldName, fieldValue)
      if (!isFieldValid) {
        isFormValid = false
      }
    })

    return isFormValid
  }

  const setValue = (fieldName, value) => {
    values.value[fieldName] = value
    validateField(fieldName, value)
  }

  const setTouched = (fieldName, isTouched = true) => {
    touched.value[fieldName] = isTouched
  }

  const reset = () => {
    values.value = {}
    errors.value = {}
    touched.value = {}
  }

  const getError = (fieldName) => {
    return touched.value[fieldName] ? errors.value[fieldName] : null
  }

  return {
    values,
    errors,
    touched,
    isValid,
    hasErrors,
    validateField,
    validate,
    setValue,
    setTouched,
    reset,
    getError
  }
}

// src/composables/useDragAndDrop.js
import { ref } from 'vue'

export function useDragAndDrop() {
  const draggedItem = ref(null)
  const dragOverItem = ref(null)
  const isDragging = ref(false)

  const startDrag = (item, event) => {
    draggedItem.value = item
    isDragging.value = true
    
    // Устанавливаем данные для drag & drop
    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('application/json', JSON.stringify(item))
    }
  }

  const endDrag = () => {
    draggedItem.value = null
    dragOverItem.value = null
    isDragging.value = false
  }

  const onDragOver = (item, event) => {
    if (event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
    }
    dragOverItem.value = item
  }

  const onDragLeave = () => {
    dragOverItem.value = null
  }

  const onDrop = (targetItem, event, callback) => {
    if (event) {
      event.preventDefault()
    }

    const sourceItem = draggedItem.value
    if (sourceItem && targetItem && sourceItem !== targetItem) {
      if (callback) {
        callback(sourceItem, targetItem)
      }
    }

    endDrag()
  }

  const canDrop = (targetItem) => {
    return draggedItem.value && draggedItem.value !== targetItem
  }

  return {
    draggedItem,
    dragOverItem,
    isDragging,
    startDrag,
    endDrag,
    onDragOver,
    onDragLeave,
    onDrop,
    canDrop
  }
}

// src/composables/useExport.js
import { ref } from 'vue'
import { exportService } from '@/services/exportService'
import { useToast } from './useToast'

export function useExport() {
  const isExporting = ref(false)
  const { success, error } = useToast()

  const exportToPDF = async (estimate, options = {}) => {
    if (!estimate) {
      error('Ошибка', 'Не выбрана смета для экспорта')
      return
    }

    try {
      isExporting.value = true
      
      const pdfBlob = await exportService.exportToPDF(estimate, options)
      const filename = `${estimate.tourInfo.tourName || 'Смета'}_${estimate.id}.pdf`
      
      exportService.downloadFile(pdfBlob, filename)
      success('Экспорт завершен', 'PDF файл сохранен')
    } catch (err) {
      error('Ошибка экспорта', err.message)
    } finally {
      isExporting.value = false
    }
  }

  const exportToExcel = async (estimate) => {
    if (!estimate) {
      error('Ошибка', 'Не выбрана смета для экспорта')
      return
    }

    try {
      isExporting.value = true
      
      const excelBlob = await exportService.exportToExcel(estimate)
      const filename = `${estimate.tourInfo.tourName || 'Смета'}_${estimate.id}.xlsx`
      
      exportService.downloadFile(excelBlob, filename)
      success('Экспорт завершен', 'Excel файл сохранен')
    } catch (err) {
      error('Ошибка экспорта', err.message)
    } finally {
      isExporting.value = false
    }
  }

  const exportToCSV = (estimate) => {
    if (!estimate) {
      error('Ошибка', 'Не выбрана смета для экспорта')
      return
    }

    try {
      const csvContent = exportService.generateCSVContent(estimate)
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const filename = `${estimate.tourInfo.tourName || 'Смета'}_${estimate.id}.csv`
      
      exportService.downloadFile(csvBlob, filename)
      success('Экспорт завершен', 'CSV файл сохранен')
    } catch (err) {
      error('Ошибка экспорта', err.message)
    }
  }

  return {
    isExporting,
    exportToPDF,
    exportToExcel,
    exportToCSV
  }
}

// src/composables/useCurrency.js
import { computed } from 'vue'
import { currencyService } from '@/services/currencyService'
import { useSettingsStore } from '@/stores/settingsStore'

export function useCurrency() {
  const settingsStore = useSettingsStore()

  const currentCurrency = computed(() => settingsStore.currency)
  const currencies = computed(() => currencyService.getAllCurrencies())

  const formatAmount = (amount, currency = null) => {
    const targetCurrency = currency || currentCurrency.value
    return currencyService.formatAmount(amount, targetCurrency)
  }

  const convertAmount = (amount, fromCurrency, toCurrency = null) => {
    const targetCurrency = toCurrency || currentCurrency.value
    return currencyService.convertAmount(amount, fromCurrency, targetCurrency)
  }

  const getCurrencySymbol = (currency = null) => {
    const targetCurrency = currency || currentCurrency.value
    const currencyInfo = currencyService.getCurrency(targetCurrency)
    return currencyInfo.symbol
  }

  const setCurrency = (newCurrency) => {
    settingsStore.updateCurrency(newCurrency)
  }

  return {
    currentCurrency,
    currencies,
    formatAmount,
    convertAmount,
    getCurrencySymbol,
    setCurrency
  }
}
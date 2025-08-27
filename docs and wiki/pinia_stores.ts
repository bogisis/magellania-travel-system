// ===== ОСНОВНОЙ STORE ДЛЯ СМЕТ =====
// src/stores/estimateStore.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { addDays, format } from 'date-fns'
import { dbService } from '@/services/dbService'
import { calculationService } from '@/services/calculationService'
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
    return estimates.value.find(est => est.id === currentEstimateId.value)
  })

  const estimatesCount = computed(() => estimates.value.length)

  const totalRevenue = computed(() => {
    return estimates.value.reduce((sum, estimate) => {
      return sum + calculationService.calculateTotal(estimate)
    }, 0)
  })

  const estimatesByStatus = computed(() => {
    const statusGroups = {
      draft: [],
      sent: [],
      approved: [],
      rejected: []
    }
    
    estimates.value.forEach(estimate => {
      const status = estimate.status || 'draft'
      if (statusGroups[status]) {
        statusGroups[status].push(estimate)
      }
    })
    
    return statusGroups
  })

  // ===== ACTIONS =====
  
  /**
   * Загрузить все сметы из базы данных
   */
  const loadAllEstimates = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const loadedEstimates = await dbService.getAllEstimates()
      estimates.value = loadedEstimates
    } catch (err) {
      error.value = 'Ошибка загрузки смет: ' + err.message
      console.error('Error loading estimates:', err)
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
          single: { count: 0, price: 150 }
        },
        ...initialData.tourInfo
      },
      days: [],
      generalExpenses: [],
      optionalServices: [],
      pricing: {
        markupPercent: 15,
        showWithMarkup: true,
        ...initialData.pricing
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      ...initialData
    }

    estimates.value.unshift(newEstimate)
    currentEstimateId.value = newEstimate.id
    
    // Сохраняем в базу данных
    saveEstimate(newEstimate)
    
    return newEstimate
  }

  /**
   * Загрузить конкретную смету
   */
  const loadEstimate = (estimateId) => {
    const estimate = estimates.value.find(est => est.id === estimateId)
    if (estimate) {
      currentEstimateId.value = estimateId
      return estimate
    }
    
    error.value = 'Смета не найдена'
    return null
  }

  /**
   * Обновить основную информацию о туре
   */
  const updateTourInfo = (tourInfo) => {
    if (!currentEstimate.value) return
    
    currentEstimate.value.tourInfo = {
      ...currentEstimate.value.tourInfo,
      ...tourInfo
    }
    currentEstimate.value.modifiedAt = new Date().toISOString()
    
    // Автосохранение
    debouncedSave()
  }

  /**
   * Добавить день к туру
   */
  const addDay = (dayData = {}) => {
    if (!currentEstimate.value) return
    
    const dayNumber = currentEstimate.value.days.length + 1
    const tourStartDate = new Date(currentEstimate.value.tourInfo.startDate)
    const dayDate = addDays(tourStartDate, dayNumber - 1)
    
    const newDay = {
      id: `day_${Date.now()}`,
      dayNumber,
      date: format(dayDate, 'yyyy-MM-dd'),
      title: `День ${dayNumber}`,
      activities: [],
      hotels: [],
      ...dayData
    }
    
    currentEstimate.value.days.push(newDay)
    currentEstimate.value.modifiedAt = new Date().toISOString()
    
    debouncedSave()
    return newDay
  }

  /**
   * Обновить день
   */
  const updateDay = (dayId, dayData) => {
    if (!currentEstimate.value) return
    
    const dayIndex = currentEstimate.value.days.findIndex(day => day.id === dayId)
    if (dayIndex > -1) {
      currentEstimate.value.days[dayIndex] = {
        ...currentEstimate.value.days[dayIndex],
        ...dayData
      }
      currentEstimate.value.modifiedAt = new Date().toISOString()
      debouncedSave()
    }
  }

  /**
   * Удалить день
   */
  const deleteDay = (dayId) => {
    if (!currentEstimate.value) return
    
    const dayIndex = currentEstimate.value.days.findIndex(day => day.id === dayId)
    if (dayIndex > -1) {
      currentEstimate.value.days.splice(dayIndex, 1)
      
      // Пересчитываем номера дней
      currentEstimate.value.days.forEach((day, index) => {
        day.dayNumber = index + 1
        const tourStartDate = new Date(currentEstimate.value.tourInfo.startDate)
        day.date = format(addDays(tourStartDate, index), 'yyyy-MM-dd')
      })
      
      currentEstimate.value.modifiedAt = new Date().toISOString()
      debouncedSave()
      
      const toastStore = useToastStore()
      toastStore.addToast({
        type: 'success',
        title: 'День удален',
        message: 'День успешно удален из программы тура'
      })
    }
  }

  /**
   * Дублировать день
   */
  const duplicateDay = (dayId) => {
    if (!currentEstimate.value) return
    
    const originalDay = currentEstimate.value.days.find(day => day.id === dayId)
    if (originalDay) {
      const duplicatedDay = {
        ...originalDay,
        id: `day_${Date.now()}`,
        dayNumber: currentEstimate.value.days.length + 1,
        title: `${originalDay.title} (копия)`,
        activities: originalDay.activities.map(activity => ({
          ...activity,
          id: `activity_${Date.now()}_${Math.random()}`
        })),
        hotels: originalDay.hotels.map(hotel => ({
          ...hotel,
          id: `hotel_${Date.now()}_${Math.random()}`
        }))
      }
      
      // Устанавливаем дату для дублированного дня
      const tourStartDate = new Date(currentEstimate.value.tourInfo.startDate)
      duplicatedDay.date = format(addDays(tourStartDate, duplicatedDay.dayNumber - 1), 'yyyy-MM-dd')
      
      currentEstimate.value.days.push(duplicatedDay)
      currentEstimate.value.modifiedAt = new Date().toISOString()
      
      debouncedSave()
      
      const toastStore = useToastStore()
      toastStore.addToast({
        type: 'success',
        title: 'День дублирован',
        message: 'День успешно скопирован'
      })
      
      return duplicatedDay
    }
  }

  /**
   * Добавить активность к дню
   */
  const addActivityToDay = (dayId, activity) => {
    if (!currentEstimate.value) return
    
    const day = currentEstimate.value.days.find(d => d.id === dayId)
    if (day) {
      const newActivity = {
        id: `activity_${Date.now()}`,
        type: 'other',
        description: '',
        quantity: 1,
        pricePerUnit: 0,
        supplier: '',
        notes: '',
        ...activity
      }
      
      if (!day.activities) {
        day.activities = []
      }
      
      day.activities.push(newActivity)
      currentEstimate.value.modifiedAt = new Date().toISOString()
      
      debouncedSave()
      return newActivity
    }
  }

  /**
   * Обновить настройки ценообразования
   */
  const updatePricing = (pricingData) => {
    if (!currentEstimate.value) return
    
    currentEstimate.value.pricing = {
      ...currentEstimate.value.pricing,
      ...pricingData
    }
    currentEstimate.value.modifiedAt = new Date().toISOString()
    
    debouncedSave()
  }

  /**
   * Добавить опциональную услугу
   */
  const addOptionalService = (service) => {
    if (!currentEstimate.value) return
    
    const newService = {
      id: `optional_${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      category: 'other',
      ...service
    }
    
    if (!currentEstimate.value.optionalServices) {
      currentEstimate.value.optionalServices = []
    }
    
    currentEstimate.value.optionalServices.push(newService)
    currentEstimate.value.modifiedAt = new Date().toISOString()
    
    debouncedSave()
    return newService
  }

  /**
   * Переместить опциональную услугу в день
   */
  const moveOptionalServiceToDay = (serviceId, dayId) => {
    if (!currentEstimate.value) return
    
    const service = currentEstimate.value.optionalServices.find(s => s.id === serviceId)
    const day = currentEstimate.value.days.find(d => d.id === dayId)
    
    if (service && day) {
      // Создаем активность на основе опциональной услуги
      const activity = {
        id: `activity_${Date.now()}`,
        type: service.category || 'other',
        description: service.name || service.description,
        quantity: 1,
        pricePerUnit: service.price,
        supplier: service.supplier || '',
        notes: `Из опциональных услуг: ${service.description || ''}`
      }
      
      if (!day.activities) {
        day.activities = []
      }
      
      day.activities.push(activity)
      currentEstimate.value.modifiedAt = new Date().toISOString()
      
      debouncedSave()
      
      const toastStore = useToastStore()
      toastStore.addToast({
        type: 'success',
        title: 'Услуга добавлена',
        message: `"${service.name}" добавлена в День ${day.dayNumber}`
      })
      
      return activity
    }
  }

  /**
   * Удалить смету
   */
  const deleteEstimate = async (estimateId) => {
    const index = estimates.value.findIndex(est => est.id === estimateId)
    if (index > -1) {
      estimates.value.splice(index, 1)
      
      // Если удаляемая смета была текущей, сбрасываем текущую
      if (currentEstimateId.value === estimateId) {
        currentEstimateId.value = null
      }
      
      // Удаляем из базы данных
      try {
        await dbService.deleteEstimate(estimateId)
        
        const toastStore = useToastStore()
        toastStore.addToast({
          type: 'success',
          title: 'Смета удалена',
          message: 'Смета успешно удалена'
        })
      } catch (err) {
        error.value = 'Ошибка удаления сметы: ' + err.message
      }
    }
  }

  /**
   * Сохранить смету в базу данных
   */
  const saveEstimate = async (estimate = null) => {
    const estimateToSave = estimate || currentEstimate.value
    if (!estimateToSave) return
    
    try {
      await dbService.saveEstimate(estimateToSave)
      
      const toastStore = useToastStore()
      toastStore.addToast({
        type: 'success',
        title: 'Сохранено',
        message: 'Смета успешно сохранена'
      })
    } catch (err) {
      error.value = 'Ошибка сохранения: ' + err.message
      
      const toastStore = useToastStore()
      toastStore.addToast({
        type: 'error',
        title: 'Ошибка сохранения',
        message: err.message
      })
    }
  }

  /**
   * Экспортировать смету в CSV
   */
  const exportToCSV = (estimate = null) => {
    const estimateToExport = estimate || currentEstimate.value
    if (!estimateToExport) return
    
    try {
      // Простой CSV экспорт - можно расширить
      const csvContent = generateCSVContent(estimateToExport)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${estimateToExport.tourInfo.tourName}_${estimateToExport.id}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      const toastStore = useToastStore()
      toastStore.addToast({
        type: 'success',
        title: 'Экспорт завершен',
        message: 'Файл CSV успешно сохранен'
      })
    } catch (err) {
      error.value = 'Ошибка экспорта: ' + err.message
    }
  }

  /**
   * Импортировать смету из CSV
   */
  const importFromCSV = async (file) => {
    try {
      const text = await file.text()
      const importedData = parseCSVContent(text)
      
      const newEstimate = createNewEstimate(importedData)
      
      const toastStore = useToastStore()
      toastStore.addToast({
        type: 'success',
        title: 'Импорт завершен',
        message: 'Смета успешно импортирована'
      })
      
      return newEstimate
    } catch (err) {
      error.value = 'Ошибка импорта: ' + err.message
      
      const toastStore = useToastStore()
      toastStore.addToast({
        type: 'error',
        title: 'Ошибка импорта',
        message: err.message
      })
    }
  }

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  
  // Дебаунсед сохранение для автосохранения
  let saveTimeout = null
  const debouncedSave = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout)
    }
    saveTimeout = setTimeout(() => {
      saveEstimate()
    }, 2000) // Автосохранение через 2 секунды после последнего изменения
  }

  // Генерация CSV контента
  const generateCSVContent = (estimate) => {
    const lines = []
    
    // Заголовок
    lines.push(`"Смета: ${estimate.tourInfo.tourName}"`)
    lines.push(`"Страна: ${estimate.tourInfo.country}"`)
    lines.push(`"Дата: ${estimate.tourInfo.startDate} - ${estimate.tourInfo.endDate}"`)
    lines.push(`"Туристов: ${estimate.tourInfo.touristCount}"`)
    lines.push('') // Пустая строка
    
    // Заголовки таблицы
    lines.push('"День","Описание","Количество","Цена за ед.","Итого"')
    
    // Данные по дням
    estimate.days.forEach(day => {
      lines.push(`"День ${day.dayNumber}: ${day.title}"`)
      
      day.activities.forEach(activity => {
        const total = activity.quantity * activity.pricePerUnit
        lines.push(`,"${activity.description}",${activity.quantity},${activity.pricePerUnit},${total}`)
      })
      
      if (day.hotels) {
        day.hotels.forEach(hotel => {
          lines.push(`,"Отель: ${hotel.name}",${hotel.rooms},${hotel.pricePerRoom},${hotel.total}`)
        })
      }
    })
    
    // Общие расходы
    if (estimate.generalExpenses && estimate.generalExpenses.length > 0) {
      lines.push('') // Пустая строка
      lines.push('"Общие расходы"')
      
      estimate.generalExpenses.forEach(expense => {
        const total = expense.quantity * expense.pricePerUnit
        lines.push(`,"${expense.description}",${expense.quantity},${expense.pricePerUnit},${total}`)
      })
    }
    
    // Итоги
    const subtotal = calculationService.calculateTotal(estimate)
    const markup = subtotal * (estimate.pricing.markupPercent / 100)
    const total = subtotal + markup
    
    lines.push('') // Пустая строка
    lines.push(`"Подитог",,,,"${subtotal}"`)
    lines.push(`"Наценка (${estimate.pricing.markupPercent}%)",,,,"${markup}"`)
    lines.push(`"Итого",,,,"${total}"`)
    
    return lines.join('\n')
  }

  // Парсинг CSV контента (упрощенная версия)
  const parseCSVContent = (csvText) => {
    // Это упрощенная реализация - в реальном проекте стоит использовать библиотеку типа Papa Parse
    const lines = csvText.split('\n')
    const tourName = lines[0]?.replace(/"/g, '').split(': ')[1] || 'Импортированный тур'
    
    return {
      tourInfo: {
        tourName: tourName
      }
    }
  }

  return {
    // Состояние
    estimates,
    currentEstimateId,
    isLoading,
    error,
    
    // Вычисляемые свойства
    currentEstimate,
    estimatesCount,
    totalRevenue,
    estimatesByStatus,
    
    // Действия
    loadAllEstimates,
    createNewEstimate,
    loadEstimate,
    updateTourInfo,
    addDay,
    updateDay,
    deleteDay,
    duplicateDay,
    addActivityToDay,
    updatePricing,
    addOptionalService,
    moveOptionalServiceToDay,
    deleteEstimate,
    saveEstimate,
    exportToCSV,
    importFromCSV
  }
})

// ===== STORE ДЛЯ УВЕДОМЛЕНИЙ =====
// src/stores/toastStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  // ===== СОСТОЯНИЕ =====
  const toasts = ref([])
  
  // ===== ACTIONS =====
  
  /**
   * Добавить уведомление
   */
  const addToast = (toast) => {
    const id = `toast_${Date.now()}_${Math.random()}`
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration || 5000,
      ...toast
    }
    
    toasts.value.push(newToast)
    
    // Автоудаление через заданное время
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return newToast
  }

  /**
   * Удалить уведомление
   */
  const removeToast = (toastId) => {
    const index = toasts.value.findIndex(toast => toast.id === toastId)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  /**
   * Очистить все уведомления
   */
  const clearAllToasts = () => {
    toasts.value = []
  }

  /**
   * Быстрые методы для разных типов уведомлений
   */
  const success = (title, message, options = {}) => {
    return addToast({ type: 'success', title, message, ...options })
  }

  const error = (title, message, options = {}) => {
    return addToast({ type: 'error', title, message, duration: 0, ...options })
  }

  const warning = (title, message, options = {}) => {
    return addToast({ type: 'warning', title, message, ...options })
  }

  const info = (title, message, options = {}) => {
    return addToast({ type: 'info', title, message, ...options })
  }

  return {
    // Состояние
    toasts,
    
    // Действия
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
})

// ===== STORE ДЛЯ ОПЦИОНАЛЬНЫХ УСЛУГ =====
// src/stores/optionalServicesStore.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOptionalServicesStore = defineStore('optionalServices', () => {
  // ===== СОСТОЯНИЕ =====
  const services = ref([])
  const categories = ref([
    { id: 'excursion', name: '🎯 Экскурсии', color: 'blue' },
    { id: 'transport', name: '🚗 Транспорт', color: 'green' },
    { id: 'meal', name: '🍽️ Питание', color: 'orange' },
    { id: 'accommodation', name: '🏨 Размещение', color: 'purple' },
    { id: 'flight', name: '✈️ Перелеты', color: 'red' },
    { id: 'entertainment', name: '🎉 Развлечения', color: 'pink' },
    { id: 'other', name: '📋 Прочее', color: 'gray' }
  ])
  
  // ===== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА =====
  const servicesByCategory = computed(() => {
    const grouped = {}
    
    categories.value.forEach(category => {
      grouped[category.id] = services.value.filter(service => service.category === category.id)
    })
    
    return grouped
  })

  const servicesCount = computed(() => services.value.length)
  
  // ===== ACTIONS =====
  
  /**
   * Загрузить опциональные услуги
   */
  const loadServices = () => {
    // В реальном проекте здесь будет загрузка из базы данных
    // Пока используем статические данные
    services.value = [
      {
        id: 'helicopter_tour',
        name: 'Полет на вертолете',
        description: 'Обзорный полет над ледником Перито Морено',
        category: 'excursion',
        price: 350,
        duration: '1 час',
        location: 'Эль Калафате',
        supplier: 'Helicopter Tours Patagonia',
        maxPax: 6,
        notes: 'Зависит от погодных условий'
      },
      {
        id: 'wine_tasting',
        name: 'Дегустация вин',
        description: 'Дегустация лучших мальбеков в винодельне',
        category: 'excursion',
        price: 85,
        duration: '3 часа',
        location: 'Мендоса',
        supplier: 'Catena Zapata',
        maxPax: 20,
        notes: 'Включает легкий обед'
      },
      {
        id: 'business_class',
        name: 'Бизнес-класс',
        description: 'Повышение класса обслуживания в самолете',
        category: 'flight',
        price: 600,
        duration: 'весь перелет',
        location: 'международные рейсы',
        supplier: 'Авиакомпания',
        maxPax: 99,
        notes: 'По наличию мест'
      },
      {
        id: 'private_chef',
        name: 'Частный повар',
        description: 'Приготовление ужина частным поваром',
        category: 'meal',
        price: 120,
        duration: '1 вечер',
        location: 'любой город',
        supplier: 'Private Chef Services',
        maxPax: 8,
        notes: 'Продукты оплачиваются отдельно'
      },
      {
        id: 'spa_treatment',
        name: 'СПА-процедуры',
        description: 'Релаксирующий массаж после долгого дня',
        category: 'entertainment',
        price: 90,
        duration: '1.5 часа',
        location: 'отель',
        supplier: 'Hotel SPA',
        maxPax: 2,
        notes: 'Необходимо бронирование заранее'
      }
    ]
  }

  /**
   * Добавить новую опциональную услугу
   */
  const addService = (serviceData) => {
    const newService = {
      id: `service_${Date.now()}`,
      name: '',
      description: '',
      category: 'other',
      price: 0,
      duration: '',
      location: '',
      supplier: '',
      maxPax: 1,
      notes: '',
      ...serviceData
    }
    
    services.value.push(newService)
    return newService
  }

  /**
   * Обновить опциональную услугу
   */
  const updateService = (serviceId, updates) => {
    const index = services.value.findIndex(service => service.id === serviceId)
    if (index > -1) {
      services.value[index] = {
        ...services.value[index],
        ...updates
      }
    }
  }

  /**
   * Удалить опциональную услугу
   */
  const deleteService = (serviceId) => {
    const index = services.value.findIndex(service => service.id === serviceId)
    if (index > -1) {
      services.value.splice(index, 1)
    }
  }

  /**
   * Найти услуги по запросу
   */
  const searchServices = (query) => {
    if (!query) return services.value
    
    const lowerQuery = query.toLowerCase()
    return services.value.filter(service => 
      service.name.toLowerCase().includes(lowerQuery) ||
      service.description.toLowerCase().includes(lowerQuery) ||
      service.location.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Получить услуги по категории
   */
  const getServicesByCategory = (categoryId) => {
    return services.value.filter(service => service.category === categoryId)
  }

  /**
   * Получить категорию по ID
   */
  const getCategoryById = (categoryId) => {
    return categories.value.find(cat => cat.id === categoryId)
  }

  return {
    // Состояние
    services,
    categories,
    
    // Вычисляемые свойства
    servicesByCategory,
    servicesCount,
    
    // Действия
    loadServices,
    addService,
    updateService,
    deleteService,
    searchServices,
    getServicesByCategory,
    getCategoryById
  }
})

// ===== STORE ДЛЯ НАСТРОЕК ПРИЛОЖЕНИЯ =====
// src/stores/settingsStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // ===== СОСТОЯНИЕ =====
  const theme = ref('light') // light, dark, auto
  const currency = ref('USD') // USD, EUR, RUB
  const dateFormat = ref('DD.MM.YYYY') // DD.MM.YYYY, MM/DD/YYYY
  const timeZone = ref('America/Argentina/Buenos_Aires')
  const language = ref('ru') // ru, en, es
  
  // Настройки компании для КП
  const companySettings = ref({
    name: 'Magellania Travel',
    tagline: 'Путешествия мечты',
    logo: null,
    colors: {
      primary: '#0ea5e9',
      secondary: '#f59e0b',
      accent: '#10b981'
    },
    contacts: {
      phone: '+7 (495) 123-45-67',
      email: 'info@magellania-travel.ru',
      website: 'www.magellania-travel.ru',
      address: 'Москва, ул. Примерная, 123'
    }
  })
  
  // Настройки по умолчанию для новых смет
  const defaultEstimateSettings = ref({
    markupPercent: 15,
    currency: 'USD',
    includeFlights: true,
    includeInsurance: false,
    defaultDuration: 7,
    defaultPax: 4,
    defaultGuides: 1
  })

  // ===== ACTIONS =====
  
  /**
   * Загрузить настройки из localStorage
   */
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem('magellania_settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        
        theme.value = parsed.theme || theme.value
        currency.value = parsed.currency || currency.value
        dateFormat.value = parsed.dateFormat || dateFormat.value
        timeZone.value = parsed.timeZone || timeZone.value
        language.value = parsed.language || language.value
        
        if (parsed.companySettings) {
          companySettings.value = { ...companySettings.value, ...parsed.companySettings }
        }
        
        if (parsed.defaultEstimateSettings) {
          defaultEstimateSettings.value = { ...defaultEstimateSettings.value, ...parsed.defaultEstimateSettings }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  /**
   * Сохранить настройки в localStorage
   */
  const saveSettings = () => {
    try {
      const settingsToSave = {
        theme: theme.value,
        currency: currency.value,
        dateFormat: dateFormat.value,
        timeZone: timeZone.value,
        language: language.value,
        companySettings: companySettings.value,
        defaultEstimateSettings: defaultEstimateSettings.value
      }
      
      localStorage.setItem('magellania_settings', JSON.stringify(settingsToSave))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  /**
   * Обновить настройки темы
   */
  const updateTheme = (newTheme) => {
    theme.value = newTheme
    
    // Применяем тему к документу
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      // auto - используем системную тему
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }
    
    saveSettings()
  }

  /**
   * Обновить валюту
   */
  const updateCurrency = (newCurrency) => {
    currency.value = newCurrency
    saveSettings()
  }

  /**
   * Обновить настройки компании
   */
  const updateCompanySettings = (updates) => {
    companySettings.value = { ...companySettings.value, ...updates }
    saveSettings()
  }

  /**
   * Обновить настройки смет по умолчанию
   */
  const updateDefaultEstimateSettings = (updates) => {
    defaultEstimateSettings.value = { ...defaultEstimateSettings.value, ...updates }
    saveSettings()
  }

  /**
   * Загрузить логотип компании
   */
  const uploadLogo = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        companySettings.value.logo = e.target.result
        saveSettings()
        resolve(e.target.result)
      }
      
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Сбросить настройки к значениям по умолчанию
   */
  const resetSettings = () => {
    theme.value = 'light'
    currency.value = 'USD'
    dateFormat.value = 'DD.MM.YYYY'
    timeZone.value = 'America/Argentina/Buenos_Aires'
    language.value = 'ru'
    
    companySettings.value = {
      name: 'Magellania Travel',
      tagline: 'Путешествия мечты',
      logo: null,
      colors: {
        primary: '#0ea5e9',
        secondary: '#f59e0b',
        accent: '#10b981'
      },
      contacts: {
        phone: '+7 (495) 123-45-67',
        email: 'info@magellania-travel.ru',
        website: 'www.magellania-travel.ru',
        address: 'Москва, ул. Примерная, 123'
      }
    }
    
    defaultEstimateSettings.value = {
      markupPercent: 15,
      currency: 'USD',
      includeFlights: true,
      includeInsurance: false,
      defaultDuration: 7,
      defaultPax: 4,
      defaultGuides: 1
    }
    
    saveSettings()
  }

  return {
    // Состояние
    theme,
    currency,
    dateFormat,
    timeZone,
    language,
    companySettings,
    defaultEstimateSettings,
    
    // Действия
    loadSettings,
    saveSettings,
    updateTheme,
    updateCurrency,
    updateCompanySettings,
    updateDefaultEstimateSettings,
    uploadLogo,
    resetSettings
  }
})
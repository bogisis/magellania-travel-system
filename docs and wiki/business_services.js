// ===== СЕРВИС ДЛЯ РАБОТЫ С БАЗОЙ ДАННЫХ =====
// src/services/dbService.js

import Dexie from 'dexie'

// Определяем схему базы данных IndexedDB
class MagellaniaDatabase extends Dexie {
  constructor() {
    super('MagellaniaDB')
    
    // Определяем таблицы и их схемы
    this.version(1).stores({
      estimates: '++id, name, tourName, country, status, createdAt, modifiedAt',
      templates: '++id, name, category, data, createdAt',
      suppliers: '++id, name, category, country, contact',
      optionalServices: '++id, name, category, price, location'
    })
  }
}

// Создаем экземпляр базы данных
const db = new MagellaniaDatabase()

export const dbService = {
  /**
   * Сохранить смету в базу данных
   * @param {Object} estimate - Объект сметы
   * @returns {Promise<Object>} Сохраненная смета
   */
  async saveEstimate(estimate) {
    try {
      // Обновляем время последнего изменения
      estimate.modifiedAt = new Date().toISOString()
      
      // Если смета уже существует - обновляем, иначе создаем
      const existingEstimate = await db.estimates.get(estimate.id)
      
      if (existingEstimate) {
        await db.estimates.update(estimate.id, estimate)
      } else {
        estimate.createdAt = estimate.createdAt || new Date().toISOString()
        await db.estimates.add(estimate)
      }
      
      return estimate
    } catch (error) {
      console.error('Error saving estimate:', error)
      throw new Error('Не удалось сохранить смету: ' + error.message)
    }
  },

  /**
   * Получить все сметы из базы данных
   * @returns {Promise<Array>} Массив смет
   */
  async getAllEstimates() {
    try {
      const estimates = await db.estimates
        .orderBy('modifiedAt')
        .reverse()
        .toArray()
      
      return estimates
    } catch (error) {
      console.error('Error loading estimates:', error)
      throw new Error('Не удалось загрузить сметы: ' + error.message)
    }
  },

  /**
   * Получить смету по ID
   * @param {string} estimateId - ID сметы
   * @returns {Promise<Object|null>} Смета или null
   */
  async getEstimateById(estimateId) {
    try {
      const estimate = await db.estimates.get(estimateId)
      return estimate || null
    } catch (error) {
      console.error('Error loading estimate:', error)
      throw new Error('Не удалось загрузить смету: ' + error.message)
    }
  },

  /**
   * Удалить смету из базы данных
   * @param {string} estimateId - ID сметы
   * @returns {Promise<boolean>} Успешность операции
   */
  async deleteEstimate(estimateId) {
    try {
      await db.estimates.delete(estimateId)
      return true
    } catch (error) {
      console.error('Error deleting estimate:', error)
      throw new Error('Не удалось удалить смету: ' + error.message)
    }
  },

  /**
   * Поиск смет по различным критериям
   * @param {Object} filters - Фильтры поиска
   * @returns {Promise<Array>} Найденные сметы
   */
  async searchEstimates(filters = {}) {
    try {
      let query = db.estimates

      // Фильтр по стране
      if (filters.country) {
        query = query.where('country').equals(filters.country)
      }

      // Фильтр по статусу
      if (filters.status) {
        query = query.where('status').equals(filters.status)
      }

      // Фильтр по дате создания
      if (filters.dateFrom) {
        query = query.where('createdAt').above(filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.where('createdAt').below(filters.dateTo)
      }

      const results = await query.toArray()

      // Текстовый поиск (выполняется в памяти)
      if (filters.searchText) {
        const searchText = filters.searchText.toLowerCase()
        return results.filter(estimate => 
          estimate.name?.toLowerCase().includes(searchText) ||
          estimate.tourInfo?.tourName?.toLowerCase().includes(searchText) ||
          estimate.tourInfo?.region?.toLowerCase().includes(searchText)
        )
      }

      return results
    } catch (error) {
      console.error('Error searching estimates:', error)
      throw new Error('Ошибка поиска: ' + error.message)
    }
  },

  /**
   * Получить статистику по сметам
   * @returns {Promise<Object>} Статистика
   */
  async getEstimateStatistics() {
    try {
      const estimates = await db.estimates.toArray()
      
      const stats = {
        total: estimates.length,
        byStatus: {
          draft: 0,
          sent: 0,
          approved: 0,
          rejected: 0
        },
        byCountry: {},
        totalValue: 0,
        averageValue: 0,
        thisMonth: 0,
        lastMonth: 0
      }

      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

      estimates.forEach(estimate => {
        // Статистика по статусам
        const status = estimate.status || 'draft'
        if (stats.byStatus.hasOwnProperty(status)) {
          stats.byStatus[status]++
        }

        // Статистика по странам
        const country = estimate.tourInfo?.country || 'unknown'
        stats.byCountry[country] = (stats.byCountry[country] || 0) + 1

        // Расчет стоимости (упрощенно)
        const estimateValue = this.calculateEstimateValue(estimate)
        stats.totalValue += estimateValue

        // Статистика по месяцам
        const createdDate = new Date(estimate.createdAt)
        if (createdDate >= thisMonth) {
          stats.thisMonth++
        } else if (createdDate >= lastMonth) {
          stats.lastMonth++
        }
      })

      stats.averageValue = stats.total > 0 ? stats.totalValue / stats.total : 0

      return stats
    } catch (error) {
      console.error('Error getting statistics:', error)
      throw new Error('Ошибка получения статистики: ' + error.message)
    }
  },

  /**
   * Упрощенный расчет стоимости сметы для статистики
   * @param {Object} estimate - Смета
   * @returns {number} Стоимость
   */
  calculateEstimateValue(estimate) {
    let total = 0

    // Суммируем активности по дням
    if (estimate.days) {
      estimate.days.forEach(day => {
        if (day.activities) {
          day.activities.forEach(activity => {
            total += (activity.quantity || 0) * (activity.pricePerUnit || 0)
          })
        }
        if (day.hotels) {
          day.hotels.forEach(hotel => {
            total += hotel.total || 0
          })
        }
      })
    }

    // Общие расходы
    if (estimate.generalExpenses) {
      estimate.generalExpenses.forEach(expense => {
        total += (expense.quantity || 0) * (expense.pricePerUnit || 0)
      })
    }

    return total
  },

  /**
   * Сохранить шаблон сметы
   * @param {Object} template - Шаблон
   * @returns {Promise<Object>} Сохраненный шаблон
   */
  async saveTemplate(template) {
    try {
      template.createdAt = template.createdAt || new Date().toISOString()
      const id = await db.templates.add(template)
      return { ...template, id }
    } catch (error) {
      console.error('Error saving template:', error)
      throw new Error('Не удалось сохранить шаблон: ' + error.message)
    }
  },

  /**
   * Получить все шаблоны
   * @returns {Promise<Array>} Массив шаблонов
   */
  async getAllTemplates() {
    try {
      return await db.templates.orderBy('name').toArray()
    } catch (error) {
      console.error('Error loading templates:', error)
      throw new Error('Не удалось загрузить шаблоны: ' + error.message)
    }
  },

  /**
   * Создать резервную копию всех данных
   * @returns {Promise<Object>} Данные для экспорта
   */
  async createBackup() {
    try {
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          estimates: await db.estimates.toArray(),
          templates: await db.templates.toArray(),
          suppliers: await db.suppliers.toArray(),
          optionalServices: await db.optionalServices.toArray()
        }
      }

      return backup
    } catch (error) {
      console.error('Error creating backup:', error)
      throw new Error('Ошибка создания резервной копии: ' + error.message)
    }
  },

  /**
   * Восстановить данные из резервной копии
   * @param {Object} backupData - Данные для восстановления
   * @returns {Promise<boolean>} Успешность операции
   */
  async restoreFromBackup(backupData) {
    try {
      // Очищаем существующие данные
      await db.transaction('rw', db.estimates, db.templates, db.suppliers, db.optionalServices, async () => {
        await db.estimates.clear()
        await db.templates.clear()
        await db.suppliers.clear()
        await db.optionalServices.clear()

        // Восстанавливаем данные
        if (backupData.data.estimates) {
          await db.estimates.bulkAdd(backupData.data.estimates)
        }
        if (backupData.data.templates) {
          await db.templates.bulkAdd(backupData.data.templates)
        }
        if (backupData.data.suppliers) {
          await db.suppliers.bulkAdd(backupData.data.suppliers)
        }
        if (backupData.data.optionalServices) {
          await db.optionalServices.bulkAdd(backupData.data.optionalServices)
        }
      })

      return true
    } catch (error) {
      console.error('Error restoring backup:', error)
      throw new Error('Ошибка восстановления: ' + error.message)
    }
  }
}

// ===== СЕРВИС РАСЧЕТОВ =====
// src/services/calculationService.js

export const calculationService = {
  /**
   * Рассчитать общую стоимость сметы (без наценки)
   * @param {Object} estimate - Смета
   * @returns {number} Общая стоимость
   */
  calculateTotal(estimate) {
    if (!estimate) return 0

    let total = 0

    // Суммируем активности по дням
    if (estimate.days && Array.isArray(estimate.days)) {
      estimate.days.forEach(day => {
        total += this.calculateDayTotal(day)
      })
    }

    // Добавляем общие расходы
    if (estimate.generalExpenses && Array.isArray(estimate.generalExpenses)) {
      estimate.generalExpenses.forEach(expense => {
        total += this.calculateItemTotal(expense)
      })
    }

    return Math.round(total * 100) / 100 // Округляем до центов
  },

  /**
   * Рассчитать стоимость одного дня
   * @param {Object} day - День тура
   * @returns {number} Стоимость дня
   */
  calculateDayTotal(day) {
    if (!day) return 0

    let dayTotal = 0

    // Активности
    if (day.activities && Array.isArray(day.activities)) {
      day.activities.forEach(activity => {
        dayTotal += this.calculateItemTotal(activity)
      })
    }

    // Отели
    if (day.hotels && Array.isArray(day.hotels)) {
      day.hotels.forEach(hotel => {
        dayTotal += this.calculateHotelTotal(hotel)
      })
    }

    return dayTotal
  },

  /**
   * Рассчитать стоимость одного элемента (активности или расхода)
   * @param {Object} item - Элемент с quantity и pricePerUnit
   * @returns {number} Стоимость элемента
   */
  calculateItemTotal(item) {
    if (!item) return 0

    const quantity = parseFloat(item.quantity) || 0
    const pricePerUnit = parseFloat(item.pricePerUnit || item.price) || 0

    return quantity * pricePerUnit
  },

  /**
   * Рассчитать стоимость отеля с умным округлением номеров
   * @param {Object} hotel - Отель
   * @returns {number} Стоимость отеля
   */
  calculateHotelTotal(hotel) {
    if (!hotel) return 0

    const pax = parseInt(hotel.pax) || 0
    const pricePerRoom = parseFloat(hotel.pricePerRoom) || 0

    // Округляем количество номеров вверх для нечетного количества гостей
    const rooms = Math.ceil(pax / 2)
    
    // Обновляем количество номеров в объекте отеля
    hotel.rooms = rooms
    hotel.total = rooms * pricePerRoom

    return hotel.total
  },

  /**
   * Применить наценку к сумме
   * @param {number} total - Базовая сумма
   * @param {number} markupPercent - Процент наценки
   * @returns {number} Сумма с наценкой
   */
  applyMarkup(total, markupPercent) {
    const markup = parseFloat(markupPercent) || 0
    const markupAmount = total * (markup / 100)
    return Math.round((total + markupAmount) * 100) / 100
  },

  /**
   * Получить сумму комиссии
   * @param {number} total - Базовая сумма
   * @param {number} markupPercent - Процент наценки
   * @returns {number} Сумма комиссии
   */
  getCommission(total, markupPercent) {
    const markup = parseFloat(markupPercent) || 0
    const commission = total * (markup / 100)
    return Math.round(commission * 100) / 100
  },

  /**
   * Рассчитать итоговую стоимость сметы с учетом настроек
   * @param {Object} estimate - Смета
   * @returns {Object} Детальный расчет
   */
  calculateDetailedTotal(estimate) {
    if (!estimate) {
      return {
        subtotal: 0,
        markupPercent: 0,
        markupAmount: 0,
        total: 0,
        commission: 0
      }
    }

    const subtotal = this.calculateTotal(estimate)
    const markupPercent = estimate.pricing?.markupPercent || 0
    const markupAmount = this.getCommission(subtotal, markupPercent)
    const total = subtotal + markupAmount

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      markupPercent,
      markupAmount: Math.round(markupAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      commission: Math.round(markupAmount * 100) / 100
    }
  },

  /**
   * Рассчитать стоимость размещения группы
   * @param {Object} accommodation - Настройки размещения
   * @returns {Object} Расчет размещения
   */
  calculateAccommodation(accommodation) {
    if (!accommodation) return { total: 0, breakdown: [] }

    const breakdown = []
    let total = 0

    // Двухместное размещение
    if (accommodation.double && accommodation.double.count > 0) {
      const doubleTotal = accommodation.double.count * accommodation.double.price
      breakdown.push({
        type: 'double',
        name: 'Двухместное размещение',
        count: accommodation.double.count,
        price: accommodation.double.price,
        total: doubleTotal
      })
      total += doubleTotal
    }

    // Одноместное размещение
    if (accommodation.single && accommodation.single.count > 0) {
      const singleTotal = accommodation.single.count * accommodation.single.price
      breakdown.push({
        type: 'single',
        name: 'Одноместное размещение',
        count: accommodation.single.count,
        price: accommodation.single.price,
        total: singleTotal
      })
      total += singleTotal
    }

    return {
      total: Math.round(total * 100) / 100,
      breakdown
    }
  },

  /**
   * Валидация данных сметы на корректность
   * @param {Object} estimate - Смета
   * @returns {Object} Результат валидации
   */
  validateEstimate(estimate) {
    const errors = []
    const warnings = []

    if (!estimate) {
      errors.push('Смета не найдена')
      return { valid: false, errors, warnings }
    }

    // Проверка основной информации
    if (!estimate.tourInfo?.tourName?.trim()) {
      errors.push('Не указано название тура')
    }

    if (!estimate.tourInfo?.country) {
      warnings.push('Не выбрана страна')
    }

    if (!estimate.tourInfo?.startDate) {
      errors.push('Не указана дата начала тура')
    }

    if (!estimate.tourInfo?.duration || estimate.tourInfo.duration < 1) {
      errors.push('Некорректная продолжительность тура')
    }

    // Проверка дней
    if (!estimate.days || estimate.days.length === 0) {
      warnings.push('В туре нет ни одного дня')
    } else {
      estimate.days.forEach((day, index) => {
        if (!day.activities || day.activities.length === 0) {
          warnings.push(`День ${index + 1}: нет активностей`)
        }

        if (day.activities) {
          day.activities.forEach((activity, actIndex) => {
            if (!activity.description?.trim()) {
              warnings.push(`День ${index + 1}, активность ${actIndex + 1}: нет описания`)
            }
            if (!activity.pricePerUnit || activity.pricePerUnit < 0) {
              warnings.push(`День ${index + 1}, активность ${actIndex + 1}: некорректная цена`)
            }
          })
        }
      })
    }

    // Проверка общей стоимости
    const total = this.calculateTotal(estimate)
    if (total === 0) {
      warnings.push('Общая стоимость тура равна нулю')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  },

  /**
   * Рассчитать рентабельность сметы
   * @param {Object} estimate - Смета
   * @param {number} costPrice - Себестоимость (опционально)
   * @returns {Object} Показатели рентабельности
   */
  calculateProfitability(estimate, costPrice = null) {
    const calculation = this.calculateDetailedTotal(estimate)
    
    // Если себестоимость не указана, используем базовую стоимость как себестоимость
    const cost = costPrice || calculation.subtotal
    const revenue = calculation.total
    const profit = revenue - cost
    const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0
    const markupPercent = cost > 0 ? (profit / cost) * 100 : 0

    return {
      cost: Math.round(cost * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      marginPercent: Math.round(marginPercent * 100) / 100,
      markupPercent: Math.round(markupPercent * 100) / 100,
      isProfiTable: profit > 0
    }
  },

  /**
   * Сравнить две сметы
   * @param {Object} estimate1 - Первая смета
   * @param {Object} estimate2 - Вторая смета
   * @returns {Object} Результат сравнения
   */
  compareEstimates(estimate1, estimate2) {
    const calc1 = this.calculateDetailedTotal(estimate1)
    const calc2 = this.calculateDetailedTotal(estimate2)
    
    const difference = calc2.total - calc1.total
    const percentDifference = calc1.total > 0 ? (difference / calc1.total) * 100 : 0

    return {
      estimate1: calc1,
      estimate2: calc2,
      difference: Math.round(difference * 100) / 100,
      percentDifference: Math.round(percentDifference * 100) / 100,
      cheaper: difference < 0 ? 'estimate2' : difference > 0 ? 'estimate1' : 'equal'
    }
  }
}

// ===== СЕРВИС РАБОТЫ С ВАЛЮТАМИ =====
// src/services/currencyService.js

export const currencyService = {
  // Поддерживаемые валюты
  currencies: {
    USD: { symbol: '$', name: 'Доллар США', code: 'USD' },
    EUR: { symbol: '€', name: 'Евро', code: 'EUR' },
    RUB: { symbol: '₽', name: 'Российский рубль', code: 'RUB' },
    ARS: { symbol: '$', name: 'Аргентинское песо', code: 'ARS' },
    CLP: { symbol: '$', name: 'Чилийское песо', code: 'CLP' },
    PEN: { symbol: 'S/', name: 'Перуанский соль', code: 'PEN' }
  },

  // Базовые курсы валют (в реальном приложении загружаются с API)
  exchangeRates: {
    USD: 1,
    EUR: 0.85,
    RUB: 75,
    ARS: 350,
    CLP: 800,
    PEN: 3.8
  },

  /**
   * Получить информацию о валюте
   * @param {string} currencyCode - Код валюты
   * @returns {Object} Информация о валюте
   */
  getCurrency(currencyCode) {
    return this.currencies[currencyCode] || this.currencies.USD
  },

  /**
   * Форматировать сумму в нужной валюте
   * @param {number} amount - Сумма
   * @param {string} currencyCode - Код валюты
   * @returns {string} Отформатированная сумма
   */
  formatAmount(amount, currencyCode = 'USD') {
    const currency = this.getCurrency(currencyCode)
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)

    return `${currency.symbol}${formattedAmount}`
  },

  /**
   * Конвертировать сумму между валютами
   * @param {number} amount - Сумма
   * @param {string} fromCurrency - Исходная валюта
   * @param {string} toCurrency - Целевая валюта
   * @returns {number} Конвертированная сумма
   */
  convertAmount(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount

    const fromRate = this.exchangeRates[fromCurrency] || 1
    const toRate = this.exchangeRates[toCurrency] || 1

    // Сначала конвертируем в USD, затем в целевую валюту
    const usdAmount = amount / fromRate
    const convertedAmount = usdAmount * toRate

    return Math.round(convertedAmount * 100) / 100
  },

  /**
   * Получить курс валюты
   * @param {string} currencyCode - Код валюты
   * @returns {number} Курс валюты относительно USD
   */
  getExchangeRate(currencyCode) {
    return this.exchangeRates[currencyCode] || 1
  },

  /**
   * Обновить курсы валют (заглушка для интеграции с API)
   * @returns {Promise<Object>} Обновленные курсы
   */
  async updateExchangeRates() {
    try {
      // В реальном приложении здесь будет запрос к API курсов валют
      // Например, к exchangerate-api.com или fixer.io
      
      console.log('Курсы валют обновлены (заглушка)')
      return this.exchangeRates
    } catch (error) {
      console.error('Error updating exchange rates:', error)
      throw new Error('Не удалось обновить курсы валют')
    }
  },

  /**
   * Получить список всех поддерживаемых валют
   * @returns {Array} Массив валют
   */
  getAllCurrencies() {
    return Object.entries(this.currencies).map(([code, info]) => ({
      code,
      ...info,
      rate: this.exchangeRates[code] || 1
    }))
  }
}

// ===== СЕРВИС ЭКСПОРТА ДОКУМЕНТОВ =====
// src/services/exportService.js

export const exportService = {
  /**
   * Экспортировать смету в PDF
   * @param {Object} estimate - Смета
   * @param {Object} options - Опции экспорта
   * @returns {Promise<Blob>} PDF файл
   */
  async exportToPDF(estimate, options = {}) {
    try {
      // В реальном приложении используем jsPDF + html2canvas
      // Пока создаем заглушку
      const content = this.generatePDFContent(estimate, options)
      
      // Имитируем создание PDF
      const pdfBlob = new Blob([content], { type: 'application/pdf' })
      
      return pdfBlob
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      throw new Error('Ошибка экспорта в PDF: ' + error.message)
    }
  },

  /**
   * Сгенерировать HTML контент для PDF
   * @param {Object} estimate - Смета
   * @param {Object} options - Опции
   * @returns {string} HTML контент
   */
  generatePDFContent(estimate, options = {}) {
    const calculation = calculationService.calculateDetailedTotal(estimate)
    const { showPrices = true, showMarkup = true, companyInfo = {} } = options

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Коммерческое предложение - ${estimate.tourInfo.tourName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .company-name { font-size: 28px; font-weight: bold; color: #0ea5e9; }
            .tour-title { font-size: 24px; margin: 20px 0; }
            .day-section { margin-bottom: 30px; page-break-inside: avoid; }
            .day-title { background: #0ea5e9; color: white; padding: 15px; font-size: 18px; }
            .activity { padding: 10px; border-bottom: 1px solid #eee; }
            .summary { margin-top: 40px; border: 2px solid #0ea5e9; padding: 20px; }
            .total { font-size: 24px; font-weight: bold; text-align: right; }
            @media print {
              body { margin: 0; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyInfo.name || 'Magellania Travel'}</div>
            <div>${companyInfo.tagline || 'Путешествия мечты'}</div>
            <h1 class="tour-title">${estimate.tourInfo.tourName}</h1>
            <p>${estimate.tourInfo.country} • ${estimate.tourInfo.duration} дней • ${estimate.tourInfo.touristCount} человек</p>
          </div>
          
          ${estimate.days.map(day => `
            <div class="day-section">
              <div class="day-title">
                День ${day.dayNumber}: ${day.title}
              </div>
              ${day.activities?.map(activity => `
                <div class="activity">
                  ${activity.description}
                  ${showPrices ? `<span style="float: right;">$${(activity.quantity * activity.pricePerUnit).toFixed(2)}</span>` : ''}
                </div>
              `).join('') || ''}
            </div>
          `).join('')}
          
          ${showPrices ? `
            <div class="summary">
              <h2>Стоимость тура</h2>
              <div>Базовая стоимость: $${calculation.subtotal.toFixed(2)}</div>
              ${showMarkup ? `<div>Наценка (${calculation.markupPercent}%): $${calculation.markupAmount.toFixed(2)}</div>` : ''}
              <div class="total">Итого: $${calculation.total.toFixed(2)}</div>
            </div>
          ` : ''}
          
          <div style="margin-top: 40px; text-align: center;">
            <p>Контакты: ${companyInfo.phone || '+7 (495) 123-45-67'}</p>
            <p>Email: ${companyInfo.email || 'info@magellania-travel.ru'}</p>
          </div>
        </body>
      </html>
    `
  },

  /**
   * Экспортировать смету в Excel
   * @param {Object} estimate - Смета
   * @returns {Promise<Blob>} Excel файл
   */
  async exportToExcel(estimate) {
    try {
      // Заглушка для Excel экспорта
      // В реальном приложении используем библиотеку типа SheetJS
      const csvContent = this.generateCSVContent(estimate)
      const excelBlob = new Blob([csvContent], { type: 'application/vnd.ms-excel' })
      
      return excelBlob
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      throw new Error('Ошибка экспорта в Excel: ' + error.message)
    }
  },

  /**
   * Сгенерировать CSV контент
   * @param {Object} estimate - Смета
   * @returns {string} CSV контент
   */
  generateCSVContent(estimate) {
    const lines = []
    
    // Заголовок
    lines.push(`"Смета: ${estimate.tourInfo.tourName}"`)
    lines.push(`"Страна: ${estimate.tourInfo.country}"`)
    lines.push(`"Период: ${estimate.tourInfo.startDate} - ${estimate.tourInfo.endDate}"`)
    lines.push(`"Туристов: ${estimate.tourInfo.touristCount}"`)
    lines.push('') // Пустая строка
    
    // Заголовки таблицы
    lines.push('"День","Тип","Описание","Количество","Цена за ед.","Итого"')
    
    // Данные по дням
    estimate.days?.forEach(day => {
      day.activities?.forEach(activity => {
        const total = activity.quantity * activity.pricePerUnit
        lines.push(`"День ${day.dayNumber}","${activity.type}","${activity.description}",${activity.quantity},${activity.pricePerUnit},${total}`)
      })
    })
    
    const calculation = calculationService.calculateDetailedTotal(estimate)
    lines.push('') // Пустая строка
    lines.push(`"","","Итого",,,${calculation.total}`)
    
    return lines.join('\n')
  },

  /**
   * Скачать файл
   * @param {Blob} blob - Файл
   * @param {string} filename - Имя файла
   */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
  }
}
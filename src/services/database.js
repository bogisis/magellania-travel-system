// src/services/database.js
import Dexie from 'dexie'

class MagellaniaDatabase extends Dexie {
  constructor() {
    super('MagellaniaTravelDB')

    this.version(1).stores({
      // Сметы туров
      estimates:
        '++id, name, tourName, country, region, startDate, duration, status, clientId, assignedManager, totalPrice, margin, discount, createdAt, updatedAt',

      // Дни туров в сметах
      tourDays: '++id, estimateId, dayNumber, date, title, location, totalDayPrice',

      // Активности в днях
      activities:
        '++id, tourDayId, estimateId, type, category, name, description, quantity, pricePerUnit, totalPrice, supplierId, time, duration, optional',

      // Клиенты B2C и B2B
      clients:
        '++id, type, name, email, phone, company, contactPerson, country, source, segment, assignedManager, preferences, tags, totalSpent, lastInteraction, createdAt',

      // Поставщики услуг
      suppliers:
        '++id, category, name, email, phone, company, country, region, rating, reliability, commission, paymentTerms, notes, active, contracts, performanceMetrics, blacklistStatus',

      // Тарифная сетка
      tariffs:
        '++id, category, subcategory, name, description, pricePerUnit, currency, season, location, supplierId, minPax, maxPax, validFrom, validTo, marginPercent, categoryColor, active',

      // История взаимодействий с клиентами
      interactions:
        '++id, clientId, type, description, date, userId, outcome, nextAction, attachments',

      // Персонал компании
      staff:
        '++id, role, name, email, phone, languages, specializations, permissions, calendar, active, assignedClients',

      // Шаблоны документов
      documentTemplates: '++id, type, name, content, variables, active',

      // Генерируемые документы
      documents:
        '++id, type, templateId, clientId, estimateId, generatedDate, signedDate, status, content, attachments',

      // Системные настройки
      settings: '++id, key, value, category',

      // Курсы валют
      currencyRates: '++id, fromCurrency, toCurrency, rate, date',

      // Логи активности
      activityLogs: '++id, userId, action, entityType, entityId, changes, timestamp',
    })

    // Хуки для автоматического обновления timestamps
    this.estimates.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
      obj.status = obj.status || 'draft'
    })

    this.estimates.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date()
    })

    this.clients.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.totalSpent = 0
      obj.segment = obj.segment || 'new'
    })

    this.interactions.hook('creating', (primKey, obj, trans) => {
      obj.date = obj.date || new Date()
    })
  }

  // Методы для работы с сметами
  async getEstimateWithDetails(estimateId) {
    const estimate = await this.estimates.get(estimateId)
    if (!estimate) return null

    const tourDays = await this.tourDays.where('estimateId').equals(estimateId).sortBy('dayNumber')

    const activities = await this.activities.where('estimateId').equals(estimateId).toArray()

    // Группируем активности по дням
    const dayActivities = {}
    activities.forEach((activity) => {
      if (!dayActivities[activity.tourDayId]) {
        dayActivities[activity.tourDayId] = []
      }
      dayActivities[activity.tourDayId].push(activity)
    })

    // Добавляем активности к дням
    tourDays.forEach((day) => {
      day.activities = dayActivities[day.id] || []
    })

    estimate.tourDays = tourDays
    return estimate
  }

  // Создание полной сметы с днями и активностями
  async createEstimate(estimateData) {
    return await this.transaction(
      'rw',
      this.estimates,
      this.tourDays,
      this.activities,
      async () => {
        // Создаем базовую смету
        const estimateId = await this.estimates.add({
          name: estimateData.name,
          tourName: estimateData.tourName,
          country: estimateData.country,
          region: estimateData.region,
          startDate: estimateData.startDate,
          duration: estimateData.duration,
          clientId: estimateData.clientId,
          assignedManager: estimateData.assignedManager,
          totalPrice: 0,
          margin: estimateData.margin || 20,
          discount: estimateData.discount || 0,
          status: 'draft',
        })

        // Создаем дни тура
        const tourDays = []
        for (let i = 0; i < estimateData.duration; i++) {
          const dayDate = new Date(estimateData.startDate)
          dayDate.setDate(dayDate.getDate() + i)

          const dayId = await this.tourDays.add({
            estimateId: estimateId,
            dayNumber: i + 1,
            date: dayDate,
            title: `День ${i + 1}`,
            location: estimateData.region,
            totalDayPrice: 0,
          })

          tourDays.push({ id: dayId, dayNumber: i + 1 })
        }

        return { estimateId, tourDays }
      },
    )
  }

  // Добавление активности к дню тура
  async addActivity(activityData) {
    const activityId = await this.activities.add(activityData)

    // Пересчитываем общую стоимость дня и сметы
    await this.recalculatePrices(activityData.estimateId)

    return activityId
  }

  // Пересчет цен сметы
  async recalculatePrices(estimateId) {
    const activities = await this.activities.where('estimateId').equals(estimateId).toArray()

    // Группируем по дням и считаем стоимость каждого дня
    const dayTotals = {}
    let totalPrice = 0

    activities.forEach((activity) => {
      const dayPrice = activity.quantity * activity.pricePerUnit

      if (!dayTotals[activity.tourDayId]) {
        dayTotals[activity.tourDayId] = 0
      }

      dayTotals[activity.tourDayId] += dayPrice
      totalPrice += dayPrice
    })

    // Обновляем стоимость дней
    for (const [dayId, dayTotal] of Object.entries(dayTotals)) {
      await this.tourDays.update(parseInt(dayId), {
        totalDayPrice: dayTotal,
      })
    }

    // Обновляем общую стоимость сметы
    await this.estimates.update(estimateId, {
      totalPrice: totalPrice,
    })

    return totalPrice
  }

  // Получение статистики для дашборда
  async getDashboardStats() {
    const [totalEstimates, activeEstimates, totalClients, newClients, totalRevenue, avgDeal] =
      await Promise.all([
        this.estimates.count(),
        this.estimates.where('status').anyOf(['draft', 'sent', 'approved']).count(),
        this.clients.count(),
        this.clients.where('segment').equals('new').count(),
        this.estimates
          .where('status')
          .equals('approved')
          .toArray()
          .then((estimates) => estimates.reduce((sum, est) => sum + (est.totalPrice || 0), 0)),
        this.estimates
          .where('status')
          .equals('approved')
          .toArray()
          .then((estimates) => {
            const total = estimates.reduce((sum, est) => sum + (est.totalPrice || 0), 0)
            return estimates.length > 0 ? total / estimates.length : 0
          }),
      ])

    return {
      totalEstimates,
      activeEstimates,
      totalClients,
      newClients,
      totalRevenue,
      avgDeal,
      conversionRate:
        totalEstimates > 0
          ? Math.round(
              ((await this.estimates.where('status').equals('approved').count()) / totalEstimates) *
                100,
            )
          : 0,
    }
  }

  // Получение последних смет
  async getRecentEstimates(limit = 10) {
    return await this.estimates.orderBy('updatedAt').reverse().limit(limit).toArray()
  }

  // Поиск клиентов
  async searchClients(query) {
    const searchLower = query.toLowerCase()
    return await this.clients
      .filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          (client.company && client.company.toLowerCase().includes(searchLower)),
      )
      .limit(20)
      .toArray()
  }

  // Получение тарифов по категории
  async getTariffsByCategory(category) {
    return await this.tariffs
      .where('category')
      .equals(category)
      .and((tariff) => tariff.active === true)
      .toArray()
  }

  // Логирование действий пользователя
  async logActivity(userId, action, entityType, entityId, changes = {}) {
    return await this.activityLogs.add({
      userId,
      action,
      entityType,
      entityId,
      changes,
      timestamp: new Date(),
    })
  }
}

// Экспортируем единственный экземпляр базы данных
export const db = new MagellaniaDatabase()

// Инициализация базовых данных при первом запуске
export async function initializeDatabase() {
  try {
    // Проверяем, есть ли уже данные
    const estimatesCount = await db.estimates.count()

    if (estimatesCount === 0) {
      // Добавляем демо-данные
      await seedDemoData()
    }
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error)
  }
}

// Заполнение демо-данными
async function seedDemoData() {
  // Добавляем категории тарифов
  const tariffCategories = [
    { name: 'Экскурсии', color: '#0ea5e9' },
    { name: 'Трансферы', color: '#10b981' },
    { name: 'Отели', color: '#f59e0b' },
    { name: 'Авиация', color: '#ef4444' },
    { name: 'Морские услуги', color: '#8b5cf6' },
    { name: 'Питание', color: '#06b6d4' },
  ]

  // Добавляем поставщиков
  const suppliers = [
    {
      category: 'hotel',
      name: 'Hotel Austral Plaza',
      email: 'reservas@australplaza.com',
      phone: '+54-11-4123-4567',
      country: 'Argentina',
      region: 'Buenos Aires',
      rating: 4.5,
      reliability: 95,
      commission: 10,
      active: true,
    },
    {
      category: 'transport',
      name: 'Patagonia Transfers',
      email: 'info@patagoniatransfers.com',
      phone: '+54-11-5555-0001',
      country: 'Argentina',
      region: 'Patagonia',
      rating: 4.8,
      reliability: 98,
      commission: 15,
      active: true,
    },
  ]

  // Добавляем тарифы
  const tariffs = [
    {
      category: 'excursion',
      name: 'Обзорная экскурсия по Буэнос-Айресу',
      description: 'Полудневная экскурсия с гидом',
      pricePerUnit: 45,
      currency: 'USD',
      season: 'year',
      location: 'Buenos Aires',
      minPax: 2,
      maxPax: 20,
      marginPercent: 25,
      active: true,
    },
    {
      category: 'transport',
      name: 'Трансфер аэропорт-отель',
      description: 'Индивидуальный трансфер',
      pricePerUnit: 35,
      currency: 'USD',
      season: 'year',
      location: 'Buenos Aires',
      minPax: 1,
      maxPax: 4,
      marginPercent: 20,
      active: true,
    },
  ]

  // Добавляем клиентов
  const clients = [
    {
      type: 'b2c',
      name: 'Анна Петрова',
      email: 'anna.petrova@email.com',
      phone: '+7-123-456-7890',
      country: 'Russia',
      segment: 'vip',
      source: 'website',
      totalSpent: 0,
    },
    {
      type: 'b2b',
      name: 'Иван Сидоров',
      email: 'ivan@travel-agency.com',
      phone: '+7-987-654-3210',
      company: 'Мир Путешествий',
      country: 'Russia',
      segment: 'partner',
      source: 'referral',
      totalSpent: 0,
    },
  ]

  // Записываем в базу
  await db.transaction('rw', [db.suppliers, db.tariffs, db.clients], async () => {
    await db.suppliers.bulkAdd(suppliers)
    await db.tariffs.bulkAdd(tariffs)
    await db.clients.bulkAdd(clients)
  })

  console.log('Демо-данные успешно загружены')
}

// src/services/database.js
import Dexie from 'dexie'

class MagellaniaDatabase extends Dexie {
  constructor() {
    super('MagellaniaTravelDB')

    // Система миграций с версионированием
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

      // Система миграций
      migrations: '++id, version, appliedAt, description',
    })

    // Миграция версии 2: Добавление индексов для производительности
    this.version(2)
      .stores({
        estimates:
          '++id, name, tourName, country, region, startDate, duration, status, clientId, assignedManager, totalPrice, margin, discount, createdAt, updatedAt, *tags',
        clients:
          '++id, type, name, email, phone, company, contactPerson, country, source, segment, assignedManager, preferences, tags, totalSpent, lastInteraction, createdAt, *tags',
        suppliers:
          '++id, category, name, email, phone, company, country, region, rating, reliability, commission, paymentTerms, notes, active, contracts, performanceMetrics, blacklistStatus, *tags',
      })
      .upgrade(async (tx) => {
        try {
          // Добавляем поле tags к существующим записям
          await tx
            .table('estimates')
            .toCollection()
            .modify((estimate) => {
              if (!estimate.tags) estimate.tags = []
            })

          await tx
            .table('clients')
            .toCollection()
            .modify((client) => {
              if (!client.tags) client.tags = []
            })

          await tx
            .table('suppliers')
            .toCollection()
            .modify((supplier) => {
              if (!supplier.tags) supplier.tags = []
            })
        } catch (error) {
          console.warn('Migration 2 warning:', error.message)
        }
      })

    // Миграция версии 3: Добавление системы аудита
    this.version(3)
      .stores({
        activityLogs:
          '++id, userId, action, entityType, entityId, changes, timestamp, ipAddress, userAgent',
      })
      .upgrade(async (tx) => {
        try {
          await tx
            .table('activityLogs')
            .toCollection()
            .modify((log) => {
              if (!log.ipAddress) log.ipAddress = 'unknown'
              if (!log.userAgent) log.userAgent = 'unknown'
            })
        } catch (error) {
          console.warn('Migration 3 warning:', error.message)
        }
      })

    // Миграция версии 4: Добавление системы резервного копирования
    this.version(4).stores({
      backups: '++id, name, description, data, createdAt, size, checksum',
    })

    // Хуки для автоматического обновления timestamps и аудита
    this.estimates.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
      obj.status = obj.status || 'draft'
      obj.tags = obj.tags || []
    })

    this.estimates.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date()
    })

    this.clients.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.totalSpent = 0
      obj.segment = obj.segment || 'new'
      obj.tags = obj.tags || []
    })

    this.suppliers.hook('creating', (primKey, obj, trans) => {
      obj.active = obj.active !== false
      obj.tags = obj.tags || []
      obj.rating = obj.rating || 0
      obj.reliability = obj.reliability || 0
    })

    this.interactions.hook('creating', (primKey, obj, trans) => {
      obj.date = obj.date || new Date()
    })

    this.activityLogs.hook('creating', (primKey, obj, trans) => {
      obj.timestamp = new Date()
      obj.ipAddress = obj.ipAddress || 'unknown'
      obj.userAgent = obj.userAgent || 'unknown'
    })
  }

  // Методы для работы с миграциями
  async applyMigration(version, description, migrationFn) {
    try {
      // Проверяем, была ли миграция уже применена
      const existingMigration = await this.migrations.where('version').equals(version).first()

      if (existingMigration) {
        console.log(`Миграция ${version} уже применена`)
        return
      }

      // Применяем миграцию
      await migrationFn()

      // Записываем информацию о миграции
      await this.migrations.add({
        version,
        appliedAt: new Date(),
        description,
      })

      console.log(`Миграция ${version} успешно применена: ${description}`)
    } catch (error) {
      console.error(`Ошибка применения миграции ${version}:`, error)
      throw new Error(`Миграция ${version} не удалась: ${error.message}`)
    }
  }

  // Методы для работы с сметами
  async getAllEstimates() {
    try {
      const estimates = await this.estimates.orderBy('createdAt').reverse().toArray()
      return estimates
    } catch (error) {
      console.error('Ошибка получения всех смет:', error)
      throw new Error(`Не удалось получить сметы: ${error.message}`)
    }
  }

  async getEstimateWithDetails(estimateId) {
    try {
      const estimate = await this.estimates.get(estimateId)
      if (!estimate) return null

      const tourDays = await this.tourDays
        .where('estimateId')
        .equals(estimateId)
        .sortBy('dayNumber')
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
    } catch (error) {
      console.error('Ошибка получения сметы:', error)
      throw new Error(`Не удалось получить смету: ${error.message}`)
    }
  }

  // Создание полной сметы с днями и активностями
  async createEstimate(estimateData) {
    try {
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
            tags: estimateData.tags || [],
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
    } catch (error) {
      console.error('Ошибка создания сметы:', error)
      throw new Error(`Не удалось создать смету: ${error.message}`)
    }
  }

  // Добавление активности к дню тура
  async addActivity(activityData) {
    try {
      const activityId = await this.activities.add(activityData)

      // Пересчитываем общую стоимость дня и сметы
      await this.recalculatePrices(activityData.estimateId)

      return activityId
    } catch (error) {
      console.error('Ошибка добавления активности:', error)
      throw new Error(`Не удалось добавить активность: ${error.message}`)
    }
  }

  // Пересчет цен сметы
  async recalculatePrices(estimateId) {
    try {
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
    } catch (error) {
      console.error('Ошибка пересчета цен:', error)
      throw new Error(`Не удалось пересчитать цены: ${error.message}`)
    }
  }

  // Получение статистики для дашборда
  async getDashboardStats() {
    try {
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
                ((await this.estimates.where('status').equals('approved').count()) /
                  totalEstimates) *
                  100,
              )
            : 0,
      }
    } catch (error) {
      console.error('Ошибка получения статистики:', error)
      throw new Error(`Не удалось получить статистику: ${error.message}`)
    }
  }

  // Получение последних смет
  async getRecentEstimates(limit = 10) {
    try {
      return await this.estimates.orderBy('updatedAt').reverse().limit(limit).toArray()
    } catch (error) {
      console.error('Ошибка получения последних смет:', error)
      throw new Error(`Не удалось получить последние сметы: ${error.message}`)
    }
  }

  // Поиск клиентов
  async searchClients(query) {
    try {
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
    } catch (error) {
      console.error('Ошибка поиска клиентов:', error)
      throw new Error(`Не удалось найти клиентов: ${error.message}`)
    }
  }

  // Получение тарифов по категории
  async getTariffsByCategory(category) {
    try {
      return await this.tariffs
        .where('category')
        .equals(category)
        .and((tariff) => tariff.active === true)
        .toArray()
    } catch (error) {
      console.error('Ошибка получения тарифов:', error)
      throw new Error(`Не удалось получить тарифы: ${error.message}`)
    }
  }

  // Логирование действий пользователя
  async logActivity(userId, action, entityType, entityId, changes = {}) {
    try {
      return await this.activityLogs.add({
        userId,
        action,
        entityType,
        entityId,
        changes,
        timestamp: new Date(),
        ipAddress: 'unknown', // В браузере сложно получить IP
        userAgent: navigator.userAgent,
      })
    } catch (error) {
      console.error('Ошибка логирования активности:', error)
      // Не бросаем ошибку, так как логирование не критично
    }
  }

  // Создание резервной копии
  async createBackup() {
    try {
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          estimates: await this.estimates.toArray(),
          tourDays: await this.tourDays.toArray(),
          activities: await this.activities.toArray(),
          clients: await this.clients.toArray(),
          suppliers: await this.suppliers.toArray(),
          tariffs: await this.tariffs.toArray(),
          interactions: await this.interactions.toArray(),
          staff: await this.staff.toArray(),
          documentTemplates: await this.documentTemplates.toArray(),
          documents: await this.documents.toArray(),
          settings: await this.settings.toArray(),
          currencyRates: await this.currencyRates.toArray(),
          activityLogs: await this.activityLogs.toArray(),
        },
      }

      const backupString = JSON.stringify(backup)
      const checksum = await this.calculateChecksum(backupString)

      const backupId = await this.backups.add({
        name: `Backup_${new Date().toISOString().split('T')[0]}`,
        description: 'Автоматическая резервная копия',
        data: backupString,
        createdAt: new Date(),
        size: backupString.length,
        checksum,
      })

      return { backupId, size: backupString.length, checksum }
    } catch (error) {
      console.error('Ошибка создания резервной копии:', error)
      throw new Error(`Не удалось создать резервную копию: ${error.message}`)
    }
  }

  // Восстановление из резервной копии
  async restoreFromBackup(backupId) {
    try {
      const backup = await this.backups.get(backupId)
      if (!backup) {
        throw new Error('Резервная копия не найдена')
      }

      const backupData = JSON.parse(backup.data)

      // Проверяем контрольную сумму
      const currentChecksum = await this.calculateChecksum(backup.data)
      if (currentChecksum !== backup.checksum) {
        throw new Error('Контрольная сумма резервной копии не совпадает')
      }

      // Восстанавливаем данные
      await this.transaction(
        'rw',
        [
          this.estimates,
          this.tourDays,
          this.activities,
          this.clients,
          this.suppliers,
          this.tariffs,
          this.interactions,
          this.staff,
          this.documentTemplates,
          this.documents,
          this.settings,
          this.currencyRates,
          this.activityLogs,
        ],
        async () => {
          // Очищаем существующие данные
          await this.estimates.clear()
          await this.tourDays.clear()
          await this.activities.clear()
          await this.clients.clear()
          await this.suppliers.clear()
          await this.tariffs.clear()
          await this.interactions.clear()
          await this.staff.clear()
          await this.documentTemplates.clear()
          await this.documents.clear()
          await this.settings.clear()
          await this.currencyRates.clear()
          await this.activityLogs.clear()

          // Восстанавливаем данные
          if (backupData.data.estimates) await this.estimates.bulkAdd(backupData.data.estimates)
          if (backupData.data.tourDays) await this.tourDays.bulkAdd(backupData.data.tourDays)
          if (backupData.data.activities) await this.activities.bulkAdd(backupData.data.activities)
          if (backupData.data.clients) await this.clients.bulkAdd(backupData.data.clients)
          if (backupData.data.suppliers) await this.suppliers.bulkAdd(backupData.data.suppliers)
          if (backupData.data.tariffs) await this.tariffs.bulkAdd(backupData.data.tariffs)
          if (backupData.data.interactions)
            await this.interactions.bulkAdd(backupData.data.interactions)
          if (backupData.data.staff) await this.staff.bulkAdd(backupData.data.staff)
          if (backupData.data.documentTemplates)
            await this.documentTemplates.bulkAdd(backupData.data.documentTemplates)
          if (backupData.data.documents) await this.documents.bulkAdd(backupData.data.documents)
          if (backupData.data.settings) await this.settings.bulkAdd(backupData.data.settings)
          if (backupData.data.currencyRates)
            await this.currencyRates.bulkAdd(backupData.data.currencyRates)
          if (backupData.data.activityLogs)
            await this.activityLogs.bulkAdd(backupData.data.activityLogs)
        },
      )

      return true
    } catch (error) {
      console.error('Ошибка восстановления из резервной копии:', error)
      throw new Error(`Не удалось восстановить данные: ${error.message}`)
    }
  }

  // Вычисление контрольной суммы
  async calculateChecksum(data) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  // Получение списка резервных копий
  async getBackups() {
    try {
      return await this.backups.orderBy('createdAt').reverse().toArray()
    } catch (error) {
      console.error('Ошибка получения списка резервных копий:', error)
      throw new Error(`Не удалось получить список резервных копий: ${error.message}`)
    }
  }
}

// Экспортируем единственный экземпляр базы данных
export const db = new MagellaniaDatabase()

// Функция для диагностики базы данных (только для разработки)
export const diagnoseDatabase = async () => {
  try {
    console.log('🔍 Диагностика базы данных...')

    // Проверяем версию
    try {
      const version = await db.version()
      console.log(`📊 Версия базы данных: ${version}`)
    } catch (e) {
      console.log('❌ Ошибка получения версии:', e.message)
    }

    // Проверяем таблицы
    const tables = ['estimates', 'clients', 'suppliers', 'tariffs', 'backups']
    for (const table of tables) {
      try {
        const count = await db[table].count()
        console.log(`📋 Таблица ${table}: ${count} записей`)
      } catch (e) {
        console.log(`❌ Ошибка таблицы ${table}:`, e.message)
      }
    }

    console.log('✅ Диагностика завершена')
  } catch (error) {
    console.error('❌ Ошибка диагностики:', error)
  }
}

// Функция для очистки базы данных (только для разработки)
export const clearDatabase = async () => {
  try {
    console.log('🗑️ Очистка базы данных...')

    // Закрываем соединение с базой данных
    await db.close()

    // Удаляем базу данных из IndexedDB
    await indexedDB.deleteDatabase('MagellaniaTravelDB')

    console.log('✅ База данных очищена')
    console.log('🔄 Перезагрузка страницы...')

    // Перезагружаем страницу для пересоздания базы данных
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  } catch (error) {
    console.error('❌ Ошибка очистки базы данных:', error)

    // Принудительная перезагрузка даже при ошибке
    console.log('🔄 Принудительная перезагрузка...')
    window.location.reload()
  }
}

// Инициализация базовых данных при первом запуске
export async function initializeDatabase() {
  try {
    console.log('🚀 Инициализация базы данных MAGELLANIA...')

    // Проверяем версию базы данных
    try {
      const currentVersion = await db.version()
      console.log(`📊 Текущая версия базы данных: ${currentVersion}`)
    } catch (versionError) {
      console.warn('⚠️ Не удалось получить версию базы данных:', versionError.message)
    }

    // Проверяем, есть ли уже данные
    const estimatesCount = await db.estimates.count()

    if (estimatesCount === 0) {
      // Добавляем демо-данные
      await seedDemoData()
      console.log('✅ Демо-данные загружены')
    }

    // Создаем автоматическую резервную копию каждые 7 дней
    try {
      const lastBackup = await db.backups.orderBy('createdAt').reverse().first()
      const daysSinceLastBackup = lastBackup
        ? (new Date() - new Date(lastBackup.createdAt)) / (1000 * 60 * 60 * 24)
        : 999

      if (daysSinceLastBackup >= 7) {
        await db.createBackup()
        console.log('✅ Автоматическая резервная копия создана')
      }
    } catch (backupError) {
      console.warn('⚠️ Ошибка создания резервной копии:', backupError.message)
    }

    console.log('✅ База данных инициализирована успешно')
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error)

    // Если ошибка связана с миграциями или версионированием, предлагаем очистить базу
    if (
      error.name === 'ConstraintError' ||
      error.message.includes('index') ||
      error.message.includes('version') ||
      error.message.includes('positive number')
    ) {
      console.warn('🔄 Обнаружена проблема с базой данных. Рекомендуется очистить базу данных.')
      console.warn('💡 Для очистки выполните: clearDatabase() в консоли браузера')
    }

    throw error
  }
}

// Заполнение демо-данными
async function seedDemoData() {
  try {
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
        tags: ['premium', 'city-center'],
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
        tags: ['reliable', 'patagonia'],
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
        tags: ['vip', 'repeat-customer'],
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
        tags: ['partner', 'b2b'],
      },
    ]

    // Записываем в базу
    await db.transaction('rw', [db.suppliers, db.tariffs, db.clients], async () => {
      await db.suppliers.bulkAdd(suppliers)
      await db.tariffs.bulkAdd(tariffs)
      await db.clients.bulkAdd(clients)
    })

    console.log('✅ Демо-данные успешно загружены')
  } catch (error) {
    console.error('❌ Ошибка загрузки демо-данных:', error)
    throw error
  }
}

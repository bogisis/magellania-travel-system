// src/services/database-simple.js
import Dexie from 'dexie'

class SimpleMagellaniaDatabase extends Dexie {
  constructor() {
    super('MagellaniaSimpleDB')

    // Простая схема без сложных миграций
    this.version(1).stores({
      // Сметы туров
      estimates:
        '++id, name, tourName, country, region, startDate, duration, status, clientId, totalPrice, createdAt',

      // Клиенты
      clients: '++id, name, email, phone, company, country, segment, totalSpent, createdAt',

      // Поставщики
      suppliers: '++id, category, name, email, phone, country, rating, active, createdAt',

      // Тарифы
      tariffs: '++id, category, name, description, pricePerUnit, currency, active',

      // Настройки
      settings: '++id, key, value',
    })
  }
}

// Создаем экземпляр базы данных
export const db = new SimpleMagellaniaDatabase()

// Функция инициализации
export async function initializeSimpleDatabase() {
  try {
    console.log('🚀 Инициализация упрощенной базы данных...')

    // Проверяем, есть ли уже данные
    const estimatesCount = await db.estimates.count()
    const clientsCount = await db.clients.count()
    const suppliersCount = await db.suppliers.count()

    if (estimatesCount === 0 && clientsCount === 0 && suppliersCount === 0) {
      console.log('📊 Добавление демо-данных...')

      // Добавляем демо-клиентов
      await db.clients.bulkAdd([
        {
          name: 'Иван Петров',
          email: 'ivan@example.com',
          phone: '+7-999-123-45-67',
          company: 'ООО "Туризм"',
          country: 'Россия',
          segment: 'premium',
          totalSpent: 150000,
          createdAt: new Date().toISOString(),
        },
        {
          name: 'Мария Сидорова',
          email: 'maria@example.com',
          phone: '+7-999-234-56-78',
          company: 'ИП Сидорова',
          country: 'Россия',
          segment: 'regular',
          totalSpent: 75000,
          createdAt: new Date().toISOString(),
        },
      ])

      // Добавляем демо-поставщиков
      await db.suppliers.bulkAdd([
        {
          category: 'hotel',
          name: 'Отель "Морской"',
          email: 'info@sea-hotel.com',
          phone: '+7-495-123-45-67',
          country: 'Россия',
          rating: 4.5,
          active: true,
          createdAt: new Date().toISOString(),
        },
        {
          category: 'transport',
          name: 'Трансфер-Сервис',
          email: 'transfer@service.com',
          phone: '+7-495-234-56-78',
          country: 'Россия',
          rating: 4.2,
          active: true,
          createdAt: new Date().toISOString(),
        },
      ])

      // Добавляем демо-сметы
      await db.estimates.bulkAdd([
        {
          name: 'Тур в Сочи',
          tourName: 'Летний отдых в Сочи',
          country: 'Россия',
          region: 'Краснодарский край',
          startDate: '2024-07-15',
          duration: 7,
          status: 'draft',
          clientId: 1,
          totalPrice: 45000,
          createdAt: new Date().toISOString(),
        },
        {
          name: 'Экскурсия по Москве',
          tourName: 'Историческая Москва',
          country: 'Россия',
          region: 'Москва',
          startDate: '2024-08-20',
          duration: 3,
          status: 'sent',
          clientId: 2,
          totalPrice: 25000,
          createdAt: new Date().toISOString(),
        },
      ])

      console.log('✅ Демо-данные добавлены')
    } else {
      console.log('✅ База данных уже содержит данные')
    }

    console.log('✅ Упрощенная база данных инициализирована')
    return true
  } catch (error) {
    console.error('❌ Ошибка инициализации упрощенной базы данных:', error)
    throw error
  }
}

// Функция очистки
export async function clearSimpleDatabase() {
  try {
    console.log('🧹 Очистка упрощенной базы данных...')
    await db.delete()
    console.log('✅ База данных очищена')
    return true
  } catch (error) {
    console.error('❌ Ошибка очистки базы данных:', error)
    throw error
  }
}

// Функция диагностики
export async function diagnoseSimpleDatabase() {
  try {
    console.log('🔍 Диагностика упрощенной базы данных...')

    const estimatesCount = await db.estimates.count()
    const clientsCount = await db.clients.count()
    const suppliersCount = await db.suppliers.count()
    const tariffsCount = await db.tariffs.count()

    console.log('📊 Статистика базы данных:')
    console.log(`  - Сметы: ${estimatesCount}`)
    console.log(`  - Клиенты: ${clientsCount}`)
    console.log(`  - Поставщики: ${suppliersCount}`)
    console.log(`  - Тарифы: ${tariffsCount}`)

    return {
      estimates: estimatesCount,
      clients: clientsCount,
      suppliers: suppliersCount,
      tariffs: tariffsCount,
    }
  } catch (error) {
    console.error('❌ Ошибка диагностики базы данных:', error)
    throw error
  }
}

// Экспортируем все функции
export { db as default }

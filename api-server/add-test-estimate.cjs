const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Путь к базе данных
const dbPath = path.join(__dirname, 'data', 'magellania.db')

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath)

// Тестовая смета
const testEstimate = {
  id: 999,
  title: 'Тестовая смета - Тур по Аргентине',
  client: 'ООО "Тестовая компания"',
  description: 'Классический тур по Аргентине с посещением Буэнос-Айреса, Мендосы и Игуасу',
  status: 'draft',
  currency: 'USD',
  markup: 20,
  totalPrice: 12500,
  basePrice: 10416.67,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  // Локация
  location: {
    country: 'ar',
    regions: ['Буэнос-Айрес', 'Мендоса', 'Мисьонес'],
    cities: ['Буэнос-Айрес', 'Мендоса', 'Пуэрто-Игуасу'],
    startPoint: 'Буэнос-Айрес',
    endPoint: 'Буэнос-Айрес',
  },

  // Группа
  group: {
    totalPax: 12,
    guidesCount: 1,
    markup: 20,
    doubleCount: 5,
    singleCount: 2,
    tripleCount: 0,
    extraCount: 0,
  },

  // Даты тура
  tourDates: {
    type: 'exact',
    startDate: '2025-03-15',
    endDate: '2025-03-22',
    duration: 8,
  },

  // Гостиницы
  hotels: [
    {
      id: 'hotel-001',
      name: 'Hotel Madero',
      category: 4,
      city: 'Буэнос-Айрес',
      paxCount: 4,
      accommodationType: 'double',
      pricePerRoom: 120,
      nights: 3,
      currency: 'USD',
      isGuideHotel: false,
    },
    {
      id: 'hotel-002',
      name: 'Park Hyatt Mendoza',
      category: 5,
      city: 'Мендоса',
      paxCount: 4,
      accommodationType: 'double',
      pricePerRoom: 180,
      nights: 2,
      currency: 'USD',
      isGuideHotel: false,
    },
    {
      id: 'hotel-003',
      name: 'Loi Suites Iguazu',
      category: 4,
      city: 'Пуэрто-Игуасу',
      paxCount: 4,
      accommodationType: 'double',
      pricePerRoom: 150,
      nights: 2,
      currency: 'USD',
      isGuideHotel: false,
    },
  ],

  // Дни тура
  tourDays: [
    {
      id: 'day-001',
      dayNumber: 1,
      title: 'Прибытие в Буэнос-Айрес',
      description: 'Встреча в аэропорту, трансфер в отель, ужин в традиционном ресторане',
      activities: [
        {
          id: 'act-001',
          title: 'Трансфер из аэропорта',
          description: 'Встреча в аэропорту Ezeiza',
          cost: 80,
          currency: 'USD',
        },
        {
          id: 'act-002',
          title: 'Ужин в La Cabrera',
          description: 'Традиционный аргентинский стейк-хаус',
          cost: 45,
          currency: 'USD',
        },
      ],
    },
    {
      id: 'day-002',
      dayNumber: 2,
      title: 'Обзорная экскурсия по Буэнос-Айресу',
      description: 'Посещение основных достопримечательностей столицы',
      activities: [
        {
          id: 'act-003',
          title: 'Обзорная экскурсия',
          description: 'Пласа-де-Майо, Ла-Бока, Сан-Тельмо',
          cost: 60,
          currency: 'USD',
        },
        {
          id: 'act-004',
          title: 'Шоу танго',
          description: 'Вечернее шоу в традиционном танго-клубе',
          cost: 75,
          currency: 'USD',
        },
      ],
    },
    {
      id: 'day-003',
      dayNumber: 3,
      title: 'Перелет в Мендосу',
      description: 'Перелет в винный регион, экскурсия по винодельням',
      activities: [
        {
          id: 'act-005',
          title: 'Перелет BA-MDZ',
          description: 'Внутренний перелет',
          cost: 120,
          currency: 'USD',
        },
        {
          id: 'act-006',
          title: 'Экскурсия по винодельням',
          description: 'Посещение 3 виноделен с дегустацией',
          cost: 90,
          currency: 'USD',
        },
      ],
    },
    {
      id: 'day-004',
      dayNumber: 4,
      title: 'Анды и Майпу',
      description: 'Экскурсия в горы, посещение винных долин',
      activities: [
        {
          id: 'act-007',
          title: 'Экскурсия в Анды',
          description: 'Горная экскурсия с обедом',
          cost: 85,
          currency: 'USD',
        },
      ],
    },
    {
      id: 'day-005',
      dayNumber: 5,
      title: 'Перелет в Игуасу',
      description: 'Перелет к водопадам, посещение бразильской стороны',
      activities: [
        {
          id: 'act-008',
          title: 'Перелет MDZ-IGR',
          description: 'Внутренний перелет',
          cost: 140,
          currency: 'USD',
        },
        {
          id: 'act-009',
          title: 'Водопады Игуасу',
          description: 'Посещение бразильской стороны водопадов',
          cost: 65,
          currency: 'USD',
        },
      ],
    },
    {
      id: 'day-006',
      dayNumber: 6,
      title: 'Аргентинская сторона Игуасу',
      description: 'Посещение аргентинской стороны, тропический лес',
      activities: [
        {
          id: 'act-010',
          title: 'Аргентинская сторона',
          description: 'Экскурсия по аргентинской стороне водопадов',
          cost: 55,
          currency: 'USD',
        },
        {
          id: 'act-011',
          title: 'Экологический тур',
          description: 'Прогулка по тропическому лесу',
          cost: 40,
          currency: 'USD',
        },
      ],
    },
    {
      id: 'day-007',
      dayNumber: 7,
      title: 'Возвращение в Буэнос-Айрес',
      description: 'Перелет обратно, свободное время, прощальный ужин',
      activities: [
        {
          id: 'act-012',
          title: 'Перелет IGR-BA',
          description: 'Внутренний перелет',
          cost: 140,
          currency: 'USD',
        },
        {
          id: 'act-013',
          title: 'Прощальный ужин',
          description: 'Ужин в элегантном ресторане',
          cost: 70,
          currency: 'USD',
        },
      ],
    },
    {
      id: 'day-008',
      dayNumber: 8,
      title: 'Отъезд',
      description: 'Трансфер в аэропорт, вылет',
      activities: [
        {
          id: 'act-014',
          title: 'Трансфер в аэропорт',
          description: 'Трансфер в аэропорт Ezeiza',
          cost: 80,
          currency: 'USD',
        },
      ],
    },
  ],

  // Опциональные услуги
  optionalServices: [
    {
      id: 'opt-001',
      title: 'Страховка путешественника',
      description: 'Полная медицинская страховка на время тура',
      cost: 25,
      currency: 'USD',
      perPerson: true,
    },
    {
      id: 'opt-002',
      title: 'VIP трансферы',
      description: 'Трансферы на премиум автомобилях',
      cost: 200,
      currency: 'USD',
      perPerson: false,
    },
  ],
}

// Функция для добавления сметы
function addTestEstimate() {
  console.log('🗄️ Добавление тестовой сметы в базу данных...')

  // Начинаем транзакцию
  db.serialize(() => {
    db.run('BEGIN TRANSACTION')

    try {
      // Добавляем основную информацию о смете
      const estimateStmt = db.prepare(`
        INSERT OR REPLACE INTO estimates (
          id, name, tourName, country, region, startDate, duration, status, 
          totalPrice, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      estimateStmt.run(
        testEstimate.id,
        testEstimate.title,
        testEstimate.title,
        testEstimate.location.country,
        testEstimate.location.regions.join(', '),
        testEstimate.tourDates.startDate,
        testEstimate.tourDates.duration,
        testEstimate.status,
        testEstimate.totalPrice,
        testEstimate.createdAt,
      )

      estimateStmt.finalize()

      // Подтверждаем транзакцию
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('❌ Ошибка при добавлении тестовой сметы:', err.message)
        } else {
          console.log('✅ Тестовая смета успешно добавлена в базу данных!')
          console.log('📋 ID сметы:', testEstimate.id)
          console.log('🏷️ Название:', testEstimate.title)
          console.log('👥 Клиент:', testEstimate.client)
          console.log('💰 Стоимость:', testEstimate.totalPrice, testEstimate.currency)
          console.log('🏨 Гостиниц:', testEstimate.hotels.length)
          console.log('📅 Дней тура:', testEstimate.tourDays.length)
        }

        // Закрываем соединение
        db.close()
      })
    } catch (error) {
      console.error('❌ Ошибка при добавлении сметы:', error.message)
      db.run('ROLLBACK')
      db.close()
    }
  })
}

// Запускаем добавление
addTestEstimate()

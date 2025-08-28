const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'data', 'magellania.db')
const db = new sqlite3.Database(dbPath)

const estimates = [
  {
    id: 1,
    name: 'Премиум тур по Аргентине - Иван Петров',
    tourName: 'Аргентинское приключение Premium',
    client: 'Иван Петров',
    title: 'Премиум тур по Аргентине',
    description: 'Эксклюзивный тур по самым красивым местам Аргентины',
    country: 'ar',
    region: 'Buenos Aires, Mendoza, Misiones, Patagonia',
    startDate: '2025-04-15',
    duration: 14,
    status: 'confirmed',
    clientId: null,
    totalPrice: 8500,
    markup: 15,
    currency: 'USD',
    location: {
      country: 'ar',
      regions: ['Buenos Aires', 'Mendoza', 'Misiones', 'Patagonia'],
      cities: ['Buenos Aires', 'Mendoza', 'Puerto Iguazu', 'El Calafate'],
      startPoint: 'Buenos Aires',
      endPoint: 'El Calafate',
    },
    tourDates: {
      dateType: 'exact',
      startDate: '2025-04-15',
      endDate: '2025-04-28',
      days: 14,
    },
    group: {
      totalPax: 8,
      doubleCount: 3,
      singleCount: 2,
      guidesCount: 1,
      markup: 15,
    },
    hotels: [
      {
        id: 'hotel-1',
        name: 'Hotel Alvear Palace',
        city: 'Buenos Aires',
        region: 'Buenos Aires',
        accommodationType: 'double',
        paxCount: 6,
        nights: 3,
        pricePerRoom: 250,
        isGuideHotel: false,
      },
      {
        id: 'hotel-2',
        name: 'Hotel Diplomatic',
        city: 'Buenos Aires',
        region: 'Buenos Aires',
        accommodationType: 'single',
        paxCount: 2,
        nights: 3,
        pricePerRoom: 180,
        isGuideHotel: true,
      },
    ],
    tourDays: [
      {
        id: 'day-1',
        dayNumber: 1,
        date: '2025-04-15',
        city: 'Buenos Aires',
        activities: [
          {
            id: 'activity-1',
            name: 'Обзорная экскурсия по городу',
            description: 'Пешеходная экскурсия по историческому центру',
            duration: '3 часа',
            cost: 120,
          },
        ],
      },
    ],
    optionalServices: [
      {
        id: 'service-1',
        name: 'Трансфер из аэропорта',
        description: 'Индивидуальный трансфер',
        cost: 80,
      },
    ],
  },
  {
    id: 2,
    name: 'Экскурсионный тур по Буэнос-Айресу - Мария Сидорова',
    tourName: 'Городские туры Буэнос-Айрес',
    client: 'Мария Сидорова',
    title: 'Экскурсионный тур по Буэнос-Айресу',
    description: 'Культурный тур по столице Аргентины',
    country: 'ar',
    region: 'Buenos Aires',
    startDate: '2025-03-20',
    duration: 5,
    status: 'draft',
    clientId: null,
    totalPrice: 1800,
    markup: 10,
    currency: 'USD',
    location: {
      country: 'ar',
      regions: ['Buenos Aires'],
      cities: ['Buenos Aires'],
      startPoint: 'Buenos Aires',
      endPoint: 'Buenos Aires',
    },
    tourDates: {
      dateType: 'exact',
      startDate: '2025-03-20',
      endDate: '2025-03-24',
      days: 5,
    },
    group: {
      totalPax: 4,
      doubleCount: 2,
      singleCount: 0,
      guidesCount: 1,
      markup: 10,
    },
    hotels: [
      {
        id: 'hotel-3',
        name: 'Hotel Madero',
        city: 'Buenos Aires',
        region: 'Buenos Aires',
        accommodationType: 'double',
        paxCount: 4,
        nights: 4,
        pricePerRoom: 150,
        isGuideHotel: false,
      },
    ],
    tourDays: [
      {
        id: 'day-2',
        dayNumber: 1,
        date: '2025-03-20',
        city: 'Buenos Aires',
        activities: [
          {
            id: 'activity-2',
            name: 'Танго шоу',
            description: 'Вечернее танго шоу с ужином',
            duration: '4 часа',
            cost: 200,
          },
        ],
      },
    ],
    optionalServices: [],
  },
  {
    id: 3,
    name: 'Винный тур по Мендосе - ООО "Винный клуб"',
    tourName: 'Мендоса Wine Experience',
    client: 'ООО "Винный клуб"',
    title: 'Винный тур по Мендосе',
    description: 'Профессиональный винный тур для сомелье',
    country: 'ar',
    region: 'Mendoza',
    startDate: '2025-05-10',
    duration: 7,
    status: 'sent',
    clientId: null,
    totalPrice: 4200,
    markup: 20,
    currency: 'USD',
    location: {
      country: 'ar',
      regions: ['Mendoza'],
      cities: ['Mendoza', 'Maipu', 'Lujan de Cuyo'],
      startPoint: 'Mendoza',
      endPoint: 'Mendoza',
    },
    tourDates: {
      dateType: 'exact',
      startDate: '2025-05-10',
      endDate: '2025-05-16',
      days: 7,
    },
    group: {
      totalPax: 6,
      doubleCount: 3,
      singleCount: 0,
      guidesCount: 1,
      markup: 20,
    },
    hotels: [
      {
        id: 'hotel-4',
        name: 'Park Hyatt Mendoza',
        city: 'Mendoza',
        region: 'Mendoza',
        accommodationType: 'double',
        paxCount: 6,
        nights: 6,
        pricePerRoom: 300,
        isGuideHotel: false,
      },
    ],
    tourDays: [
      {
        id: 'day-3',
        dayNumber: 1,
        date: '2025-05-10',
        city: 'Mendoza',
        activities: [
          {
            id: 'activity-3',
            name: 'Дегустация вин',
            description: 'Профессиональная дегустация в лучших винодельнях',
            duration: '6 часов',
            cost: 350,
          },
        ],
      },
    ],
    optionalServices: [
      {
        id: 'service-2',
        name: 'Трансфер между винодельнями',
        description: 'Комфортабельный транспорт',
        cost: 150,
      },
    ],
  },
]

function addEstimates() {
  console.log('🗄️ Добавление полноценных смет в базу данных...')
  db.serialize(() => {
    db.run('BEGIN TRANSACTION')
    try {
      estimates.forEach((estimate, index) => {
        const estimateStmt = db.prepare(`
          INSERT INTO estimates (
            id, name, tourName, client, title, description, country, region, startDate, duration, status,
            clientId, totalPrice, markup, currency, location_data, tour_dates_data, group_data,
            hotels_data, tour_days_data, optional_services_data, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `)
        estimateStmt.run(
          estimate.id,
          estimate.name,
          estimate.tourName,
          estimate.client,
          estimate.title,
          estimate.description,
          estimate.country,
          estimate.region,
          estimate.startDate,
          estimate.duration,
          estimate.status,
          estimate.clientId,
          estimate.totalPrice,
          estimate.markup,
          estimate.currency,
          JSON.stringify(estimate.location),
          JSON.stringify(estimate.tourDates),
          JSON.stringify(estimate.group),
          JSON.stringify(estimate.hotels),
          JSON.stringify(estimate.tourDays),
          JSON.stringify(estimate.optionalServices),
        )
        estimateStmt.finalize()
        console.log(`✅ Смета ${index + 1} добавлена: ${estimate.name}`)
      })
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('❌ Ошибка коммита:', err.message)
        } else {
          console.log('✅ Все сметы успешно добавлены в базу данных')
        }
        db.close()
      })
    } catch (error) {
      console.error('❌ Ошибка добавления смет:', error.message)
      db.run('ROLLBACK')
      db.close()
    }
  })
}

addEstimates()

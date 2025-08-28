const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Путь к базе данных
const dbPath = path.join(__dirname, 'data', 'magellania.db')

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath)

// 3 полноценные сметы с полными данными
const estimates = [
  {
    id: 1,
    name: 'Премиум тур по Аргентине - Иван Петров',
    tourName: 'Аргентинское приключение Premium',
    client: 'Иван Петров',
    description:
      'Эксклюзивный тур по Аргентине с посещением лучших достопримечательностей, включая Буэнос-Айрес, Мендосу, Игуасу и Патагонию. Проживание в 5-звездочных отелях, индивидуальные экскурсии, дегустации вин и гастрономические туры.',
    country: 'ar',
    region: 'Buenos Aires, Mendoza, Misiones, Patagonia',
    startDate: '2025-04-15',
    duration: 14,
    status: 'confirmed',
    clientId: 1,
    totalPrice: 8500,
    margin: 25,
    currency: 'USD',
    group: {
      totalPax: 8,
      guidesCount: 2,
      markup: 25,
      doubleCount: 3,
      singleCount: 2,
      tripleCount: 0,
      extraCount: 0,
    },
    location: {
      country: 'ar',
      regions: ['Буэнос-Айрес', 'Мендоса', 'Мисьонес', 'Патагония'],
      cities: ['Буэнос-Айрес', 'Мендоса', 'Пуэрто-Игуасу', 'Эль-Калафате'],
      startPoint: 'Буэнос-Айрес',
      endPoint: 'Буэнос-Айрес',
    },
    tourDates: {
      type: 'exact',
      startDate: '2025-04-15',
      endDate: '2025-04-28',
      duration: 14,
    },
    hotels: [
      {
        name: 'Park Hyatt Buenos Aires',
        category: 5,
        city: 'Буэнос-Айрес',
        paxCount: 4,
        accommodationType: 'double',
        pricePerRoom: 350,
        nights: 4,
        currency: 'USD',
      },
      {
        name: 'Park Hyatt Mendoza',
        category: 5,
        city: 'Мендоса',
        paxCount: 4,
        accommodationType: 'double',
        pricePerRoom: 280,
        nights: 3,
        currency: 'USD',
      },
      {
        name: 'Loi Suites Iguazu',
        category: 5,
        city: 'Пуэрто-Игуасу',
        paxCount: 4,
        accommodationType: 'double',
        pricePerRoom: 320,
        nights: 3,
        currency: 'USD',
      },
      {
        name: 'Eolo Patagonia Spirit',
        category: 5,
        city: 'Эль-Калафате',
        paxCount: 4,
        accommodationType: 'double',
        pricePerRoom: 450,
        nights: 4,
        currency: 'USD',
      },
    ],
    tourDays: [
      {
        dayNumber: 1,
        title: 'Прибытие в Буэнос-Айрес',
        description: 'Встреча в аэропорту, трансфер в отель, приветственный ужин в La Cabrera',
      },
      {
        dayNumber: 2,
        title: 'Обзорная экскурсия по Буэнос-Айресу',
        description: 'Посещение Пласа-де-Майо, Ла-Бока, Сан-Тельмо, вечернее шоу танго',
      },
      {
        dayNumber: 3,
        title: 'Свободный день в Буэнос-Айресе',
        description: 'Шоппинг, посещение музеев, гастрономический тур',
      },
      {
        dayNumber: 4,
        title: 'Перелет в Мендосу',
        description: 'Перелет, размещение в отеле, вечерняя дегустация вин',
      },
      {
        dayNumber: 5,
        title: 'Экскурсия по винодельням',
        description: 'Посещение 3 премиум виноделен с дегустацией и обедом',
      },
      {
        dayNumber: 6,
        title: 'Анды и Майпу',
        description: 'Горная экскурсия, посещение винных долин, ужин в горах',
      },
      {
        dayNumber: 7,
        title: 'Перелет в Игуасу',
        description: 'Перелет, размещение, вечерняя прогулка',
      },
      {
        dayNumber: 8,
        title: 'Бразильская сторона Игуасу',
        description: 'Посещение бразильской стороны водопадов, вертолетная экскурсия',
      },
      {
        dayNumber: 9,
        title: 'Аргентинская сторона Игуасу',
        description: 'Экскурсия по аргентинской стороне, тропический лес',
      },
      {
        dayNumber: 10,
        title: 'Перелет в Патагонию',
        description: 'Перелет в Эль-Калафате, размещение в эко-лодже',
      },
      {
        dayNumber: 11,
        title: 'Ледник Перито-Морено',
        description: 'Экскурсия к леднику, круиз по озеру, трекинг',
      },
      {
        dayNumber: 12,
        title: 'Национальный парк Лос-Гласьярес',
        description: 'Трекинг в парке, наблюдение за дикой природой',
      },
      {
        dayNumber: 13,
        title: 'Возвращение в Буэнос-Айрес',
        description: 'Перелет обратно, прощальный ужин в элегантном ресторане',
      },
      {
        dayNumber: 14,
        title: 'Отъезд',
        description: 'Трансфер в аэропорт, вылет',
      },
    ],
    optionalServices: [
      {
        title: 'VIP трансферы',
        description: 'Трансферы на премиум автомобилях с персональным водителем',
        cost: 800,
        currency: 'USD',
        perPerson: false,
      },
      {
        title: 'Страховка путешественника Premium',
        description: 'Расширенная медицинская страховка с покрытием экстремальных видов спорта',
        cost: 45,
        currency: 'USD',
        perPerson: true,
      },
      {
        title: 'Персональный фотограф',
        description: 'Профессиональный фотограф на весь тур',
        cost: 1200,
        currency: 'USD',
        perPerson: false,
      },
    ],
  },
  {
    id: 2,
    name: 'Экскурсионный тур по Буэнос-Айресу - Мария Сидорова',
    tourName: 'Городские туры Буэнос-Айрес',
    client: 'Мария Сидорова',
    description:
      'Интенсивный экскурсионный тур по столице Аргентины с глубоким погружением в культуру, историю и гастрономию города. Проживание в историческом центре, пешие экскурсии, кулинарные мастер-классы.',
    country: 'ar',
    region: 'Buenos Aires',
    startDate: '2025-03-20',
    duration: 5,
    status: 'draft',
    clientId: 2,
    totalPrice: 1800,
    margin: 20,
    currency: 'USD',
    group: {
      totalPax: 6,
      guidesCount: 1,
      markup: 20,
      doubleCount: 2,
      singleCount: 2,
      tripleCount: 0,
      extraCount: 0,
    },
    location: {
      country: 'ar',
      regions: ['Буэнос-Айрес'],
      cities: ['Буэнос-Айрес'],
      startPoint: 'Буэнос-Айрес',
      endPoint: 'Буэнос-Айрес',
    },
    tourDates: {
      type: 'exact',
      startDate: '2025-03-20',
      endDate: '2025-03-24',
      duration: 5,
    },
    hotels: [
      {
        name: 'Hotel Madero',
        category: 4,
        city: 'Буэнос-Айрес',
        paxCount: 6,
        accommodationType: 'double',
        pricePerRoom: 180,
        nights: 4,
        currency: 'USD',
      },
    ],
    tourDays: [
      {
        dayNumber: 1,
        title: 'Прибытие и исторический центр',
        description: 'Встреча в аэропорту, размещение, экскурсия по историческому центру',
      },
      {
        dayNumber: 2,
        title: 'Ла-Бока и Сан-Тельмо',
        description: 'Пешая экскурсия по колоритным районам, рынок Сан-Тельмо',
      },
      {
        dayNumber: 3,
        title: 'Палермо и гастрономия',
        description: 'Экскурсия по Палермо, кулинарный мастер-класс, ужин в парилье',
      },
      {
        dayNumber: 4,
        title: 'Тигре и дельта',
        description: 'Поездка в Тигре, круиз по дельте реки Парана',
      },
      {
        dayNumber: 5,
        title: 'Отъезд',
        description: 'Свободное время, трансфер в аэропорт',
      },
    ],
    optionalServices: [
      {
        title: 'Шоу танго с ужином',
        description: 'Вечернее шоу танго в традиционном клубе с ужином',
        cost: 85,
        currency: 'USD',
        perPerson: true,
      },
      {
        title: 'Экскурсия в Колонию (Уругвай)',
        description: 'Дневная поездка в колониальный город Колония-дель-Сакраменто',
        cost: 120,
        currency: 'USD',
        perPerson: true,
      },
    ],
  },
  {
    id: 3,
    name: 'Винный тур по Мендосе - ООО "Винный клуб"',
    tourName: 'Мендоса Wine Experience',
    client: 'ООО "Винный клуб"',
    description:
      'Специализированный винный тур для группы энтузиастов. Посещение лучших виноделен региона, дегустации премиум вин, гастрономические ужины, мастер-классы с сомелье.',
    country: 'ar',
    region: 'Mendoza',
    startDate: '2025-05-10',
    duration: 7,
    status: 'sent',
    clientId: 3,
    totalPrice: 4200,
    margin: 30,
    currency: 'USD',
    group: {
      totalPax: 12,
      guidesCount: 1,
      markup: 30,
      doubleCount: 5,
      singleCount: 2,
      tripleCount: 0,
      extraCount: 0,
    },
    location: {
      country: 'ar',
      regions: ['Мендоса'],
      cities: ['Мендоса', 'Майпу', 'Лухан-де-Куйо'],
      startPoint: 'Мендоса',
      endPoint: 'Мендоса',
    },
    tourDates: {
      type: 'exact',
      startDate: '2025-05-10',
      endDate: '2025-05-16',
      duration: 7,
    },
    hotels: [
      {
        name: 'Park Hyatt Mendoza',
        category: 5,
        city: 'Мендоса',
        paxCount: 6,
        accommodationType: 'double',
        pricePerRoom: 250,
        nights: 3,
        currency: 'USD',
      },
      {
        name: 'Cavas Wine Lodge',
        category: 5,
        city: 'Майпу',
        paxCount: 6,
        accommodationType: 'double',
        pricePerRoom: 380,
        nights: 4,
        currency: 'USD',
      },
    ],
    tourDays: [
      {
        dayNumber: 1,
        title: 'Прибытие в Мендосу',
        description: 'Встреча в аэропорту, размещение, приветственный ужин с винами',
      },
      {
        dayNumber: 2,
        title: 'Винодельни Майпу',
        description: 'Посещение 3 виноделен, дегустация мальбека, обед в винодельне',
      },
      {
        dayNumber: 3,
        title: 'Лухан-де-Куйо',
        description: 'Экскурсия по винодельням высотных вин, мастер-класс с сомелье',
      },
      {
        dayNumber: 4,
        title: 'Переезд в Майпу',
        description: 'Переезд в Cavas Wine Lodge, дегустация в подвалах',
      },
      {
        dayNumber: 5,
        title: 'Премиум винодельни',
        description: 'Посещение эксклюзивных виноделен, гастрономический ужин',
      },
      {
        dayNumber: 6,
        title: 'Анды и вина',
        description: 'Экскурсия в горы, пикник с винами, закат в Андах',
      },
      {
        dayNumber: 7,
        title: 'Отъезд',
        description: 'Завтрак, покупка вин, трансфер в аэропорт',
      },
    ],
    optionalServices: [
      {
        title: 'Приватная дегустация с виноделом',
        description: 'Эксклюзивная дегустация с главным виноделом региона',
        cost: 200,
        currency: 'USD',
        perPerson: true,
      },
      {
        title: 'Вертолетная экскурсия над виноградниками',
        description: 'Полет над виноградниками с обзором Анд',
        cost: 350,
        currency: 'USD',
        perPerson: true,
      },
      {
        title: 'Отправка вин домой',
        description: 'Упаковка и отправка купленных вин в Россию',
        cost: 150,
        currency: 'USD',
        perPerson: false,
      },
    ],
  },
]

// Функция для добавления смет
function addEstimates() {
  console.log('🗄️ Добавление полноценных смет в базу данных...')

  db.serialize(() => {
    db.run('BEGIN TRANSACTION')

    try {
      estimates.forEach((estimate, index) => {
        // Добавляем основную информацию о смете
        const estimateStmt = db.prepare(`
          INSERT INTO estimates (
            id, name, tourName, country, region, startDate, duration, status, 
            totalPrice, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)

        estimateStmt.run(
          estimate.id,
          estimate.name,
          estimate.tourName,
          estimate.country,
          estimate.region,
          estimate.startDate,
          estimate.duration,
          estimate.status,
          estimate.totalPrice,
          new Date().toISOString(),
        )

        estimateStmt.finalize()

        console.log(`✅ Смета ${index + 1} добавлена: ${estimate.name}`)
      })

      // Подтверждаем транзакцию
      db.run('COMMIT', (err) => {
        if (err) {
          console.error('❌ Ошибка при добавлении смет:', err.message)
        } else {
          console.log('✅ Все сметы успешно добавлены в базу данных!')
          console.log('📋 Добавлено смет:', estimates.length)
          estimates.forEach((estimate, index) => {
            console.log(
              `   ${index + 1}. ${estimate.name} - ${estimate.totalPrice} ${estimate.currency}`,
            )
          })
        }

        // Закрываем соединение
        db.close()
      })
    } catch (error) {
      console.error('❌ Ошибка при добавлении смет:', error.message)
      db.run('ROLLBACK')
      db.close()
    }
  })
}

// Запускаем добавление
addEstimates()

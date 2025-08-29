const fetch = require('node-fetch')

const estimates = [
  {
    name: 'Тур в Чили - Патагония',
    tourName: 'Приключения в Патагонии',
    client: 'ООО Туристическая компания',
    title: 'Экспедиция в Патагонию',
    description:
      '10-дневный тур по самым красивым местам Патагонии с проживанием в комфортных отелях и экскурсиями',
    country: 'chile',
    region: 'Патагония',
    startDate: '2025-03-15',
    duration: 10,
    clientId: 1,
    totalPrice: 250000,
    markup: 15,
    currency: 'USD',
    status: 'draft',
    location: {
      country: 'chile',
      regions: ['Патагония', 'Огненная Земля'],
      cities: ['Пунта-Аренас', 'Пуэрто-Наталес', 'Ушуайя'],
      startPoint: 'Пунта-Аренас',
      endPoint: 'Ушуайя',
    },
    tourDates: {
      dateType: 'exact',
      startDate: '2025-03-15',
      endDate: '2025-03-25',
      days: 10,
    },
    group: {
      totalPax: 12,
      doubleCount: 5,
      singleCount: 2,
      tripleCount: 0,
      extraCount: 0,
      guidesCount: 1,
      markup: 15,
    },
    hotels: [
      {
        id: 'hotel1',
        name: 'Hotel Cabo de Hornos',
        city: 'Пунта-Аренас',
        region: 'Патагония',
        accommodationType: 'double',
        paxCount: 10,
        nights: 3,
        pricePerRoom: 15000,
        isGuideHotel: false,
        isManual: false,
      },
      {
        id: 'hotel2',
        name: 'Hotel Remota',
        city: 'Пуэрто-Наталес',
        region: 'Патагония',
        accommodationType: 'double',
        paxCount: 10,
        nights: 4,
        pricePerRoom: 18000,
        isGuideHotel: true,
        isManual: false,
      },
      {
        id: 'hotel3',
        name: 'Hotel Los Cauquenes',
        city: 'Ушуайя',
        region: 'Огненная Земля',
        accommodationType: 'double',
        paxCount: 10,
        nights: 3,
        pricePerRoom: 16000,
        isGuideHotel: false,
        isManual: false,
      },
    ],
    tourDays: [
      {
        id: 'day1',
        dayNumber: 1,
        date: '2025-03-15',
        city: 'Пунта-Аренас',
        activities: [
          {
            id: 'act1',
            name: 'Трансфер из аэропорта',
            description: 'Встреча в аэропорту и трансфер в отель',
            duration: '2 часа',
            cost: 5000,
          },
          {
            id: 'act2',
            name: 'Обзорная экскурсия по городу',
            description: 'Знакомство с историческим центром Пунта-Аренас',
            duration: '3 часа',
            cost: 8000,
          },
        ],
      },
      {
        id: 'day2',
        dayNumber: 2,
        date: '2025-03-16',
        city: 'Пунта-Аренас',
        activities: [
          {
            id: 'act3',
            name: 'Экскурсия на остров Магдалена',
            description: 'Посещение колонии пингвинов',
            duration: '6 часов',
            cost: 15000,
          },
        ],
      },
      {
        id: 'day3',
        dayNumber: 3,
        date: '2025-03-17',
        city: 'Пуэрто-Наталес',
        activities: [
          {
            id: 'act4',
            name: 'Трансфер в Пуэрто-Наталес',
            description: 'Переезд в Пуэрто-Наталес',
            duration: '4 часа',
            cost: 12000,
          },
          {
            id: 'act5',
            name: 'Экскурсия в Национальный парк Торрес-дель-Пайне',
            description: 'Пешая прогулка по парку',
            duration: '8 часов',
            cost: 20000,
          },
        ],
      },
    ],
    optionalServices: [
      {
        id: 'opt1',
        name: 'Страховка путешественника',
        description: 'Полная медицинская страховка на время тура',
        price: 5000,
        cost: 5000,
      },
      {
        id: 'opt2',
        name: 'Дополнительная экскурсия на ледник',
        description: 'Экскурсия на ледник Серрано',
        price: 12000,
        cost: 12000,
      },
    ],
  },
  {
    name: 'Тур в Аргентину - Буэнос-Айрес',
    tourName: 'Танго и вино в Аргентине',
    client: 'ИП Иванов',
    title: 'Культурный тур в Аргентину',
    description:
      '7-дневный тур по Буэнос-Айресу с посещением танго-шоу, дегустацией вин и экскурсиями',
    country: 'argentina',
    region: 'Буэнос-Айрес',
    startDate: '2025-04-10',
    duration: 7,
    clientId: 2,
    totalPrice: 180000,
    markup: 12,
    currency: 'USD',
    status: 'sent',
    location: {
      country: 'argentina',
      regions: ['Буэнос-Айрес', 'Мендоса'],
      cities: ['Буэнос-Айрес', 'Мендоса'],
      startPoint: 'Буэнос-Айрес',
      endPoint: 'Мендоса',
    },
    tourDates: {
      dateType: 'exact',
      startDate: '2025-04-10',
      endDate: '2025-04-17',
      days: 7,
    },
    group: {
      totalPax: 8,
      doubleCount: 3,
      singleCount: 2,
      tripleCount: 0,
      extraCount: 0,
      guidesCount: 1,
      markup: 12,
    },
    hotels: [
      {
        id: 'hotel4',
        name: 'Hotel Alvear Palace',
        city: 'Буэнос-Айрес',
        region: 'Буэнос-Айрес',
        accommodationType: 'double',
        paxCount: 6,
        nights: 5,
        pricePerRoom: 20000,
        isGuideHotel: false,
        isManual: false,
      },
      {
        id: 'hotel5',
        name: 'Park Hyatt Mendoza',
        city: 'Мендоса',
        region: 'Мендоса',
        accommodationType: 'double',
        paxCount: 6,
        nights: 2,
        pricePerRoom: 18000,
        isGuideHotel: true,
        isManual: false,
      },
    ],
    tourDays: [
      {
        id: 'day4',
        dayNumber: 1,
        date: '2025-04-10',
        city: 'Буэнос-Айрес',
        activities: [
          {
            id: 'act6',
            name: 'Трансфер из аэропорта',
            description: 'Встреча в аэропорту Эсейса',
            duration: '1.5 часа',
            cost: 4000,
          },
          {
            id: 'act7',
            name: 'Обзорная экскурсия по городу',
            description: 'Посещение исторического центра, площади Мая',
            duration: '4 часа',
            cost: 10000,
          },
        ],
      },
      {
        id: 'day5',
        dayNumber: 2,
        date: '2025-04-11',
        city: 'Буэнос-Айрес',
        activities: [
          {
            id: 'act8',
            name: 'Танго-шоу в Ла Бока',
            description: 'Вечернее танго-шоу с ужином',
            duration: '4 часа',
            cost: 15000,
          },
        ],
      },
      {
        id: 'day6',
        dayNumber: 3,
        date: '2025-04-12',
        city: 'Буэнос-Айрес',
        activities: [
          {
            id: 'act9',
            name: 'Экскурсия в район Сан-Тельмо',
            description: 'Посещение воскресного рынка и музеев',
            duration: '5 часов',
            cost: 12000,
          },
        ],
      },
    ],
    optionalServices: [
      {
        id: 'opt3',
        name: 'Дегустация вин в Мендосе',
        description: 'Посещение винодельни с дегустацией',
        price: 8000,
        cost: 8000,
      },
      {
        id: 'opt4',
        name: 'Урок танго',
        description: 'Индивидуальный урок танго с профессиональным танцором',
        price: 6000,
        cost: 6000,
      },
    ],
  },
  {
    name: 'Тур в Бразилию - Рио-де-Жанейро',
    tourName: 'Карнавал в Рио',
    client: 'ООО Праздник',
    title: 'Карнавальный тур в Бразилию',
    description:
      '8-дневный тур в Рио-де-Жанейро с посещением карнавала, пляжей и достопримечательностей',
    country: 'brazil',
    region: 'Рио-де-Жанейро',
    startDate: '2025-02-15',
    duration: 8,
    clientId: 3,
    totalPrice: 320000,
    markup: 18,
    currency: 'USD',
    status: 'approved',
    location: {
      country: 'brazil',
      regions: ['Рио-де-Жанейро', 'Сан-Паулу'],
      cities: ['Рио-де-Жанейро', 'Сан-Паулу'],
      startPoint: 'Рио-де-Жанейро',
      endPoint: 'Сан-Паулу',
    },
    tourDates: {
      dateType: 'exact',
      startDate: '2025-02-15',
      endDate: '2025-02-23',
      days: 8,
    },
    group: {
      totalPax: 15,
      doubleCount: 6,
      singleCount: 3,
      tripleCount: 0,
      extraCount: 0,
      guidesCount: 2,
      markup: 18,
    },
    hotels: [
      {
        id: 'hotel6',
        name: 'Copacabana Palace',
        city: 'Рио-де-Жанейро',
        region: 'Рио-де-Жанейро',
        accommodationType: 'double',
        paxCount: 12,
        nights: 6,
        pricePerRoom: 25000,
        isGuideHotel: false,
        isManual: false,
      },
      {
        id: 'hotel7',
        name: 'Grand Hyatt São Paulo',
        city: 'Сан-Паулу',
        region: 'Сан-Паулу',
        accommodationType: 'double',
        paxCount: 12,
        nights: 2,
        pricePerRoom: 22000,
        isGuideHotel: true,
        isManual: false,
      },
    ],
    tourDays: [
      {
        id: 'day7',
        dayNumber: 1,
        date: '2025-02-15',
        city: 'Рио-де-Жанейро',
        activities: [
          {
            id: 'act10',
            name: 'Трансфер из аэропорта',
            description: 'Встреча в аэропорту Галеан',
            duration: '1 час',
            cost: 3000,
          },
          {
            id: 'act11',
            name: 'Посещение статуи Христа-Искупителя',
            description: 'Экскурсия на гору Корковаду',
            duration: '4 часа',
            cost: 12000,
          },
        ],
      },
      {
        id: 'day8',
        dayNumber: 2,
        date: '2025-02-16',
        city: 'Рио-де-Жанейро',
        activities: [
          {
            id: 'act12',
            name: 'Пляж Копакабана',
            description: 'Отдых на знаменитом пляже',
            duration: '6 часов',
            cost: 5000,
          },
          {
            id: 'act13',
            name: 'Карнавальное шествие',
            description: 'Посещение карнавального парада в Самбодроме',
            duration: '8 часов',
            cost: 25000,
          },
        ],
      },
      {
        id: 'day9',
        dayNumber: 3,
        date: '2025-02-17',
        city: 'Рио-де-Жанейро',
        activities: [
          {
            id: 'act14',
            name: 'Канатная дорога на Сахарную голову',
            description: 'Панорамные виды на город',
            duration: '3 часа',
            cost: 8000,
          },
          {
            id: 'act15',
            name: 'Экскурсия в фавелы',
            description: 'Знакомство с местной культурой',
            duration: '4 часа',
            cost: 10000,
          },
        ],
      },
    ],
    optionalServices: [
      {
        id: 'opt5',
        name: 'Вертолетная экскурсия',
        description: 'Облет Рио-де-Жанейро на вертолете',
        price: 15000,
        cost: 15000,
      },
      {
        id: 'opt6',
        name: 'Карнавальный костюм',
        description: 'Аренда карнавального костюма',
        price: 3000,
        cost: 3000,
      },
      {
        id: 'opt7',
        name: 'Футбольный матч',
        description: 'Посещение матча на Маракане',
        price: 8000,
        cost: 8000,
      },
    ],
  },
]

async function createEstimates() {
  console.log('🚀 Создание смет...')

  for (let i = 0; i < estimates.length; i++) {
    const estimate = estimates[i]
    try {
      const response = await fetch('http://localhost:3001/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(estimate),
      })

      const result = await response.json()
      console.log(`✅ Смета ${i + 1} создана с ID: ${result.id}`)
    } catch (error) {
      console.error(`❌ Ошибка создания сметы ${i + 1}:`, error.message)
    }
  }

  console.log('🎉 Все сметы созданы!')
}

createEstimates()

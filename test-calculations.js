// test-calculations.js
// Ручная проверка расчетов для сметы ID 1

const estimateData = {
  id: 1,
  name: 'Премиум тур по Аргентине',
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
}

// Функции расчета
function calculateRooms(hotel) {
  if (!hotel.paxCount || !hotel.accommodationType) return 0

  switch (hotel.accommodationType) {
    case 'double':
      return Math.ceil(hotel.paxCount / 2)
    case 'triple':
      return Math.ceil(hotel.paxCount / 3)
    case 'single':
    default:
      return hotel.paxCount
  }
}

function calculateHotelTotal(hotel) {
  const rooms = calculateRooms(hotel)
  return rooms * (hotel.pricePerRoom || 0) * (hotel.nights || 1)
}

function calculateDayTotal(day) {
  if (!day.activities) return 0
  return day.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0)
}

function calculateBaseCost(estimate) {
  const hotelsCost = estimate.hotels
    .filter((hotel) => !hotel.isGuideHotel)
    .reduce((sum, hotel) => sum + calculateHotelTotal(hotel), 0)

  const activitiesCost = estimate.tourDays.reduce((sum, day) => {
    return sum + calculateDayTotal(day)
  }, 0)

  const optionalServicesCost = estimate.optionalServices.reduce((sum, service) => {
    return sum + (service.cost || 0)
  }, 0)

  return hotelsCost + activitiesCost + optionalServicesCost
}

function calculateMarginAmount(estimate) {
  const baseCost = calculateBaseCost(estimate)
  return (baseCost * estimate.group.markup) / 100
}

function calculateFinalCost(estimate) {
  const baseCost = calculateBaseCost(estimate)
  const marginAmount = calculateMarginAmount(estimate)
  return baseCost + marginAmount
}

// Ручная проверка расчетов
console.log('🧮 Ручная проверка расчетов для сметы:', estimateData.name)
console.log('='.repeat(60))

// 1. Проверка расчета номеров
console.log('\n1. Расчет количества номеров:')
estimateData.hotels.forEach((hotel, index) => {
  const rooms = calculateRooms(hotel)
  console.log(`   Hotel ${index + 1} (${hotel.name}):`)
  console.log(`     Тип: ${hotel.accommodationType}`)
  console.log(`     PAX: ${hotel.paxCount}`)
  console.log(`     Номеров: ${rooms}`)
  console.log(
    `     Ожидаемо: ${hotel.accommodationType === 'double' ? Math.ceil(hotel.paxCount / 2) : hotel.paxCount}`,
  )
})

// 2. Проверка стоимости гостиниц
console.log('\n2. Расчет стоимости гостиниц:')
let totalHotelsCost = 0
estimateData.hotels.forEach((hotel, index) => {
  const hotelTotal = calculateHotelTotal(hotel)
  const rooms = calculateRooms(hotel)
  const isGuideHotel = hotel.isGuideHotel ? ' (ГИД)' : ''

  console.log(`   Hotel ${index + 1} (${hotel.name})${isGuideHotel}:`)
  console.log(
    `     ${rooms} номеров × $${hotel.pricePerRoom} × ${hotel.nights} ночей = $${hotelTotal}`,
  )

  if (!hotel.isGuideHotel) {
    totalHotelsCost += hotelTotal
  }
})
console.log(`   Общая стоимость гостиниц (без гида): $${totalHotelsCost}`)

// 3. Проверка стоимости активностей
console.log('\n3. Расчет стоимости активностей:')
let totalActivitiesCost = 0
estimateData.tourDays.forEach((day, dayIndex) => {
  console.log(`   День ${dayIndex + 1} (${day.date}):`)
  day.activities.forEach((activity, actIndex) => {
    console.log(`     Активность ${actIndex + 1}: ${activity.name} = $${activity.cost}`)
    totalActivitiesCost += activity.cost
  })
})
console.log(`   Общая стоимость активностей: $${totalActivitiesCost}`)

// 4. Проверка дополнительных услуг
console.log('\n4. Расчет стоимости дополнительных услуг:')
let totalServicesCost = 0
estimateData.optionalServices.forEach((service, index) => {
  console.log(`   Услуга ${index + 1}: ${service.name} = $${service.cost}`)
  totalServicesCost += service.cost
})
console.log(`   Общая стоимость услуг: $${totalServicesCost}`)

// 5. Итоговые расчеты
console.log('\n5. Итоговые расчеты:')
const baseCost = calculateBaseCost(estimateData)
const marginAmount = calculateMarginAmount(estimateData)
const finalCost = calculateFinalCost(estimateData)

console.log(
  `   Базовая стоимость: $${totalHotelsCost} + $${totalActivitiesCost} + $${totalServicesCost} = $${baseCost}`,
)
console.log(
  `   Маржа (${estimateData.group.markup}%): $${baseCost} × ${estimateData.group.markup}% = $${marginAmount}`,
)
console.log(`   Финальная стоимость: $${baseCost} + $${marginAmount} = $${finalCost}`)

// 6. Проверка на ошибки
console.log('\n6. Проверка на ошибки:')
const errors = []

if (baseCost <= 0) {
  errors.push('Базовая стоимость должна быть больше 0')
}

if (finalCost <= 0) {
  errors.push('Финальная стоимость должна быть больше 0')
}

if (baseCost > 1000000) {
  errors.push('Базовая стоимость подозрительно высока (>$1M)')
}

if (finalCost > 1000000) {
  errors.push('Финальная стоимость подозрительно высока (>$1M)')
}

if (errors.length > 0) {
  console.log('   ❌ Найдены ошибки:')
  errors.forEach((error) => console.log(`      - ${error}`))
} else {
  console.log('   ✅ Все расчеты корректны!')
}

console.log('\n' + '='.repeat(60))
console.log('📊 РЕЗЮМЕ:')
console.log(`   Базовая стоимость: $${baseCost}`)
console.log(`   Маржа: $${marginAmount}`)
console.log(`   Финальная стоимость: $${finalCost}`)
console.log(`   Ошибок: ${errors.length}`)

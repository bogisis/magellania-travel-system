// src/utils/calculationTests.js
// Тесты для проверки математических расчетов в системе смет

/**
 * Тестовые данные для проверки расчетов
 */
export const testEstimateData = {
  // Группа
  group: {
    totalPax: 8,
    doubleCount: 3,
    singleCount: 2,
    guidesCount: 1,
    markup: 15,
  },

  // Гостиницы
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

  // Дни тура
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

  // Дополнительные услуги
  optionalServices: [
    {
      id: 'service-1',
      name: 'Трансфер из аэропорта',
      description: 'Индивидуальный трансфер',
      price: 80,
    },
  ],
}

/**
 * Функции расчета для тестирования
 */
export const calculationFunctions = {
  // Расчет количества номеров
  calculateRooms: (hotel) => {
    if (!hotel.paxCount || !hotel.accommodationType) return 0

    switch (hotel.accommodationType) {
      case 'double':
        return Math.ceil(Number(hotel.paxCount) / 2)
      case 'triple':
        return Math.ceil(Number(hotel.paxCount) / 3)
      case 'single':
      default:
        return Number(hotel.paxCount)
    }
  },

  // Расчет стоимости гостиницы
  calculateHotelTotal: (hotel) => {
    const rooms = calculationFunctions.calculateRooms(hotel)
    return rooms * Number(hotel.pricePerRoom || 0) * Number(hotel.nights || 1)
  },

  // Расчет стоимости дня
  calculateDayTotal: (day) => {
    if (!day.activities) return 0
    return day.activities.reduce((sum, activity) => sum + Number(activity.cost || 0), 0)
  },

  // Расчет базовой стоимости
  calculateBaseCost: (estimate) => {
    const hotelsCost = estimate.hotels
      .filter((hotel) => !hotel.isGuideHotel)
      .reduce((sum, hotel) => sum + calculationFunctions.calculateHotelTotal(hotel), 0)

    const activitiesCost = estimate.tourDays.reduce((sum, day) => {
      return sum + calculationFunctions.calculateDayTotal(day)
    }, 0)

    const optionalServicesCost = estimate.optionalServices.reduce((sum, service) => {
      return sum + Number(service.price || service.cost || 0)
    }, 0)

    return hotelsCost + activitiesCost + optionalServicesCost
  },

  // Расчет маржи
  calculateMarginAmount: (estimate) => {
    const baseCost = calculationFunctions.calculateBaseCost(estimate)
    return (baseCost * Number(estimate.group.markup || 0)) / 100
  },

  // Расчет финальной стоимости
  calculateFinalCost: (estimate) => {
    const baseCost = calculationFunctions.calculateBaseCost(estimate)
    const marginAmount = calculationFunctions.calculateMarginAmount(estimate)
    return baseCost + marginAmount
  },
}

/**
 * Запуск всех тестов расчетов
 */
export function runCalculationTests() {
  console.log('🧮 Запуск тестов математических расчетов...')

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  }

  // Тест 1: Расчет количества номеров
  function testCalculateRooms() {
    const hotel1 = { accommodationType: 'double', paxCount: 6 }
    const hotel2 = { accommodationType: 'single', paxCount: 2 }
    const hotel3 = { accommodationType: 'triple', paxCount: 8 }

    const rooms1 = calculationFunctions.calculateRooms(hotel1)
    const rooms2 = calculationFunctions.calculateRooms(hotel2)
    const rooms3 = calculationFunctions.calculateRooms(hotel3)

    const expected1 = 3 // Math.ceil(6/2)
    const expected2 = 2 // 2 single rooms
    const expected3 = 3 // Math.ceil(8/3)

    const passed = rooms1 === expected1 && rooms2 === expected2 && rooms3 === expected3

    results.tests.push({
      name: 'Расчет количества номеров',
      passed,
      details: {
        double: { expected: expected1, actual: rooms1 },
        single: { expected: expected2, actual: rooms2 },
        triple: { expected: expected3, actual: rooms3 },
      },
    })

    if (passed) {
      results.passed++
    } else {
      results.failed++
    }
  }

  // Тест 2: Расчет стоимости гостиницы
  function testCalculateHotelTotal() {
    const hotel = {
      accommodationType: 'double',
      paxCount: 6,
      pricePerRoom: 250,
      nights: 3,
    }

    const total = calculationFunctions.calculateHotelTotal(hotel)
    const expected = 3 * 250 * 3 // 3 rooms * $250 * 3 nights = $2250

    const passed = total === expected

    results.tests.push({
      name: 'Расчет стоимости гостиницы',
      passed,
      details: { expected, actual: total },
    })

    if (passed) {
      results.passed++
    } else {
      results.failed++
    }
  }

  // Тест 3: Расчет стоимости дня
  function testCalculateDayTotal() {
    const day = {
      activities: [{ cost: 120 }, { cost: 200 }],
    }

    const total = calculationFunctions.calculateDayTotal(day)
    const expected = 120 + 200 // $320

    const passed = total === expected

    results.tests.push({
      name: 'Расчет стоимости дня',
      passed,
      details: { expected, actual: total },
    })

    if (passed) {
      results.passed++
    } else {
      results.failed++
    }
  }

  // Тест 4: Расчет базовой стоимости
  function testCalculateBaseCost() {
    const baseCost = calculationFunctions.calculateBaseCost(testEstimateData)

    // Ожидаемые значения:
    // Hotel 1: 3 rooms * $250 * 3 nights = $2250 (не guide hotel)
    // Hotel 2: 2 rooms * $180 * 3 nights = $1080 (guide hotel, не учитывается)
    // Activities: $120 + $200 = $320
    // Optional services: $80
    // Total: $2250 + $320 + $80 = $2650

    const expected = 2250 + 320 + 80 // $2650

    const passed = Math.abs(baseCost - expected) < 0.01 // Учитываем возможные ошибки округления

    results.tests.push({
      name: 'Расчет базовой стоимости',
      passed,
      details: { expected, actual: baseCost },
    })

    if (passed) {
      results.passed++
    } else {
      results.failed++
    }
  }

  // Тест 5: Расчет маржи
  function testCalculateMarginAmount() {
    const marginAmount = calculationFunctions.calculateMarginAmount(testEstimateData)
    const baseCost = calculationFunctions.calculateBaseCost(testEstimateData)
    const expected = (baseCost * 15) / 100 // 15% от базовой стоимости

    const passed = Math.abs(marginAmount - expected) < 0.01

    results.tests.push({
      name: 'Расчет маржи',
      passed,
      details: { expected, actual: marginAmount },
    })

    if (passed) {
      results.passed++
    } else {
      results.failed++
    }
  }

  // Тест 6: Расчет финальной стоимости
  function testCalculateFinalCost() {
    const finalCost = calculationFunctions.calculateFinalCost(testEstimateData)
    const baseCost = calculationFunctions.calculateBaseCost(testEstimateData)
    const marginAmount = calculationFunctions.calculateMarginAmount(testEstimateData)
    const expected = baseCost + marginAmount

    const passed = Math.abs(finalCost - expected) < 0.01

    results.tests.push({
      name: 'Расчет финальной стоимости',
      passed,
      details: { expected, actual: finalCost },
    })

    if (passed) {
      results.passed++
    } else {
      results.failed++
    }
  }

  // Запускаем все тесты
  testCalculateRooms()
  testCalculateHotelTotal()
  testCalculateDayTotal()
  testCalculateBaseCost()
  testCalculateMarginAmount()
  testCalculateFinalCost()

  // Выводим результаты
  console.log(`\n📊 Результаты тестов:`)
  console.log(`✅ Пройдено: ${results.passed}`)
  console.log(`❌ Провалено: ${results.failed}`)

  results.tests.forEach((test) => {
    const status = test.passed ? '✅' : '❌'
    console.log(`${status} ${test.name}: ${test.passed ? 'ПРОЙДЕН' : 'ПРОВАЛЕН'}`)
    if (!test.passed) {
      console.log(`   Детали:`, test.details)
    }
  })

  return results
}

/**
 * Проверка конкретной сметы
 */
export function validateEstimate(estimate) {
  console.log('🔍 Проверка сметы:', estimate.name || 'Без названия')

  const baseCost = calculationFunctions.calculateBaseCost(estimate)
  const marginAmount = calculationFunctions.calculateMarginAmount(estimate)
  const finalCost = calculationFunctions.calculateFinalCost(estimate)

  console.log('💰 Базовая стоимость:', baseCost)
  console.log('📈 Маржа:', marginAmount)
  console.log('💵 Финальная стоимость:', finalCost)

  // Проверяем на подозрительные значения
  const warnings = []

  if (baseCost > 1000000) {
    warnings.push('Базовая стоимость слишком высока (>$1M)')
  }

  if (finalCost > 1000000) {
    warnings.push('Финальная стоимость слишком высока (>$1M)')
  }

  if (baseCost < 0) {
    warnings.push('Базовая стоимость отрицательная')
  }

  if (finalCost < 0) {
    warnings.push('Финальная стоимость отрицательная')
  }

  if (warnings.length > 0) {
    console.log('⚠️ Предупреждения:')
    warnings.forEach((warning) => console.log('  -', warning))
  } else {
    console.log('✅ Смета прошла проверку')
  }

  return {
    baseCost,
    marginAmount,
    finalCost,
    warnings,
  }
}

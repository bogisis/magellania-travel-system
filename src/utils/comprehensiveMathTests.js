/**
 * Comprehensive mathematical tests for MAGELLANIA calculation engine
 *
 * Tests all calculation types and scenarios based on real estimate analysis
 */

import { CalculationEngine } from '../services/CalculationEngine.js'
import { PricingIntelligenceService } from '../services/PricingIntelligenceService.js'

/**
 * Test data based on real estimates analysis
 */
export const testScenarios = {
  // Сценарий 1: Входные билеты (per_person)
  entranceTickets: {
    name: 'Входные билеты в нац.парк',
    activities: [
      {
        name: 'Входные билеты в нац.парк',
        base_price: 44,
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
        markup: 10,
      },
    ],
    participantCount: 5,
    expectedBaseCost: 220, // 5 × $44
    expectedWithMarkup: 242, // 220 + 10%
  },

  // Сценарий 2: Трансферы (per_group)
  transfers: {
    name: 'Трансферы',
    activities: [
      {
        name: 'Трансфер в гостиницу',
        base_price: 40,
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
        markup: 15,
      },
    ],
    participantCount: 5,
    expectedBaseCost: 40, // 1 × $40
    expectedWithMarkup: 46, // 40 + 15%
  },

  // Сценарий 3: Размещение с округлением номеров
  accommodation: {
    name: 'Размещение в отеле',
    hotels: [
      {
        name: 'Hotel Austral Plaza',
        accommodationType: 'double',
        pricePerRoom: 150,
        nights: 4,
        markup: 10,
      },
    ],
    participantCount: 5,
    expectedRooms: 3, // Math.ceil(5/2)
    expectedBaseCost: 1800, // 3 × $150 × 4
    expectedWithMarkup: 1980, // 1800 + 10%
  },

  // Сценарий 4: Дифференцированные тарифы
  differentialPricing: {
    name: 'Билеты на поезд',
    pricing: {
      adult_price: 70,
      child_price: 35,
      markup: 10,
    },
    adultCount: 5,
    childCount: 3,
    expectedAdultCost: 350, // 5 × $70
    expectedChildCost: 105, // 3 × $35
    expectedTotal: 455, // 350 + 105
    expectedWithMarkup: 500.5, // 455 + 10%
  },

  // Сценарий 5: Работа гида (per_day)
  guideWork: {
    name: 'Работа гида',
    activities: [
      {
        name: 'Работа гида',
        base_price: 350,
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_DAY,
        markup: 10,
      },
    ],
    days: 18,
    participantCount: 5,
    expectedBaseCost: 6300, // 18 × $350
    expectedWithMarkup: 6930, // 6300 + 10%
  },

  // Сценарий 6: Комплексная смета
  complexEstimate: {
    name: 'Комплексная смета',
    estimate: {
      group: {
        totalPax: 5,
        markup: 10,
      },
      hotels: [
        {
          name: 'Hotel Austral Plaza',
          accommodationType: 'double',
          pricePerRoom: 150,
          nights: 4,
          markup: 10,
        },
      ],
      tourDays: [
        {
          dayNumber: 1,
          activities: [
            {
              name: 'Входные билеты в нац.парк',
              base_price: 44,
              calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
              markup: 10,
            },
            {
              name: 'Трансфер',
              base_price: 40,
              calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
              markup: 15,
            },
          ],
        },
      ],
      optionalServices: [
        {
          name: 'Страхование',
          price: 25,
          calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
          markup: 5,
        },
      ],
    },
  },
}

/**
 * Run comprehensive mathematical tests
 */
export function runComprehensiveTests() {
  console.log('🧮 Запуск комплексных математических тестов...\n')

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  }

  // Тест 1: Входные билеты (per_person)
  testEntranceTickets(results)

  // Тест 2: Трансферы (per_group)
  testTransfers(results)

  // Тест 3: Размещение с округлением
  testAccommodation(results)

  // Тест 4: Дифференцированные тарифы
  testDifferentialPricing(results)

  // Тест 5: Работа гида (per_day)
  testGuideWork(results)

  // Тест 6: Комплексная смета
  testComplexEstimate(results)

  // Тест 7: Двойная система отображения
  testDualDisplayMode(results)

  // Тест 8: Интеллектуальные подстановки
  testPricingIntelligence(results)

  // Вывод результатов
  console.log(`\n📊 Результаты тестов:`)
  console.log(`✅ Пройдено: ${results.passed}`)
  console.log(`❌ Провалено: ${results.failed}`)
  console.log(
    `📈 Успешность: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`,
  )

  return results
}

/**
 * Test entrance tickets calculation (per_person)
 */
function testEntranceTickets(results) {
  const testName = 'Входные билеты (per_person)'
  console.log(`\n🔍 Тест: ${testName}`)

  try {
    const scenario = testScenarios.entranceTickets
    const activity = scenario.activities[0]
    const participantCount = scenario.participantCount

    // Тест базового расчета
    const baseCalculation = CalculationEngine.calculateActivityPrice(activity, participantCount, 0)

    // Тест с наценкой
    const markupCalculation = CalculationEngine.calculateActivityPrice(
      activity,
      participantCount,
      activity.markup,
    )

    // Проверки
    const baseCostCorrect = Math.abs(baseCalculation.subtotal - scenario.expectedBaseCost) < 0.01
    const markupCostCorrect = Math.abs(markupCalculation.total - scenario.expectedWithMarkup) < 0.01

    if (baseCostCorrect && markupCostCorrect) {
      console.log(
        `  ✅ Базовый расчет: $${baseCalculation.subtotal} (ожидалось $${scenario.expectedBaseCost})`,
      )
      console.log(
        `  ✅ Расчет с наценкой: $${markupCalculation.total} (ожидалось $${scenario.expectedWithMarkup})`,
      )
      results.passed++
    } else {
      console.log(`  ❌ Ошибка в расчетах`)
      console.log(`     Базовый: $${baseCalculation.subtotal} vs $${scenario.expectedBaseCost}`)
      console.log(`     С наценкой: $${markupCalculation.total} vs $${scenario.expectedWithMarkup}`)
      results.failed++
    }

    results.tests.push({
      name: testName,
      passed: baseCostCorrect && markupCostCorrect,
      details: { baseCalculation, markupCalculation },
    })
  } catch (error) {
    console.log(`  ❌ Ошибка: ${error.message}`)
    results.failed++
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
    })
  }
}

/**
 * Test transfers calculation (per_group)
 */
function testTransfers(results) {
  const testName = 'Трансферы (per_group)'
  console.log(`\n🔍 Тест: ${testName}`)

  try {
    const scenario = testScenarios.transfers
    const activity = scenario.activities[0]
    const participantCount = scenario.participantCount

    const baseCalculation = CalculationEngine.calculateActivityPrice(activity, participantCount, 0)

    const markupCalculation = CalculationEngine.calculateActivityPrice(
      activity,
      participantCount,
      activity.markup,
    )

    const baseCostCorrect = Math.abs(baseCalculation.subtotal - scenario.expectedBaseCost) < 0.01
    const markupCostCorrect = Math.abs(markupCalculation.total - scenario.expectedWithMarkup) < 0.01

    if (baseCostCorrect && markupCostCorrect) {
      console.log(
        `  ✅ Базовый расчет: $${baseCalculation.subtotal} (ожидалось $${scenario.expectedBaseCost})`,
      )
      console.log(
        `  ✅ Расчет с наценкой: $${markupCalculation.total} (ожидалось $${scenario.expectedWithMarkup})`,
      )
      results.passed++
    } else {
      console.log(`  ❌ Ошибка в расчетах`)
      results.failed++
    }

    results.tests.push({
      name: testName,
      passed: baseCostCorrect && markupCostCorrect,
    })
  } catch (error) {
    console.log(`  ❌ Ошибка: ${error.message}`)
    results.failed++
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
    })
  }
}

/**
 * Test accommodation with room rounding
 */
function testAccommodation(results) {
  const testName = 'Размещение с округлением номеров'
  console.log(`\n🔍 Тест: ${testName}`)

  try {
    const scenario = testScenarios.accommodation
    const hotel = scenario.hotels[0]
    const participantCount = scenario.participantCount

    // Тест расчета количества номеров
    const roomsNeeded = CalculationEngine.calculateRoomsNeeded(
      participantCount,
      hotel.accommodationType,
    )

    // Тест расчета размещения
    const accommodationCalculation = CalculationEngine.calculateAccommodation(
      hotel,
      participantCount,
      true,
    )

    const roomsCorrect = roomsNeeded === scenario.expectedRooms
    const costCorrect =
      Math.abs(accommodationCalculation.total - scenario.expectedWithMarkup) < 0.01

    if (roomsCorrect && costCorrect) {
      console.log(`  ✅ Количество номеров: ${roomsNeeded} (ожидалось ${scenario.expectedRooms})`)
      console.log(
        `  ✅ Стоимость: $${accommodationCalculation.total} (ожидалось $${scenario.expectedWithMarkup})`,
      )
      results.passed++
    } else {
      console.log(`  ❌ Ошибка в расчетах`)
      console.log(`     Номера: ${roomsNeeded} vs ${scenario.expectedRooms}`)
      console.log(
        `     Стоимость: $${accommodationCalculation.total} vs $${scenario.expectedWithMarkup}`,
      )
      results.failed++
    }

    results.tests.push({
      name: testName,
      passed: roomsCorrect && costCorrect,
    })
  } catch (error) {
    console.log(`  ❌ Ошибка: ${error.message}`)
    results.failed++
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
    })
  }
}

/**
 * Test differential pricing (adults/children)
 */
function testDifferentialPricing(results) {
  const testName = 'Дифференцированные тарифы (взрослые/дети)'
  console.log(`\n🔍 Тест: ${testName}`)

  try {
    const scenario = testScenarios.differentialPricing
    const pricing = scenario.pricing
    const adultCount = scenario.adultCount
    const childCount = scenario.childCount

    const differentialCalculation = CalculationEngine.calculateDifferentialPricing(
      pricing,
      adultCount,
      childCount,
      CalculationEngine.DISPLAY_MODES.WITH_MARKUP,
    )

    const adultCostCorrect =
      Math.abs(differentialCalculation.adult_base_cost - scenario.expectedAdultCost) < 0.01
    const childCostCorrect =
      Math.abs(differentialCalculation.child_base_cost - scenario.expectedChildCost) < 0.01
    const totalCorrect =
      Math.abs(differentialCalculation.total_with_markup - scenario.expectedWithMarkup) < 0.01

    if (adultCostCorrect && childCostCorrect && totalCorrect) {
      console.log(`  ✅ Стоимость взрослых: $${differentialCalculation.adult_base_cost}`)
      console.log(`  ✅ Стоимость детей: $${differentialCalculation.child_base_cost}`)
      console.log(`  ✅ Общая стоимость: $${differentialCalculation.total_with_markup}`)
      results.passed++
    } else {
      console.log(`  ❌ Ошибка в расчетах`)
      results.failed++
    }

    results.tests.push({
      name: testName,
      passed: adultCostCorrect && childCostCorrect && totalCorrect,
    })
  } catch (error) {
    console.log(`  ❌ Ошибка: ${error.message}`)
    results.failed++
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
    })
  }
}

/**
 * Test guide work calculation (per_day)
 */
function testGuideWork(results) {
  const testName = 'Работа гида (per_day)'
  console.log(`\n🔍 Тест: ${testName}`)

  try {
    const scenario = testScenarios.guideWork
    const activity = scenario.activities[0]
    const days = scenario.days

    // Создаем активность с количеством дней
    const activityWithDays = {
      ...activity,
      quantity: days,
    }

    const calculation = CalculationEngine.calculateActivityPrice(
      activityWithDays,
      scenario.participantCount,
      activity.markup,
    )

    const costCorrect = Math.abs(calculation.total - scenario.expectedWithMarkup) < 0.01

    if (costCorrect) {
      console.log(
        `  ✅ Стоимость работы гида: $${calculation.total} (ожидалось $${scenario.expectedWithMarkup})`,
      )
      results.passed++
    } else {
      console.log(
        `  ❌ Ошибка в расчетах: $${calculation.total} vs $${scenario.expectedWithMarkup}`,
      )
      results.failed++
    }

    results.tests.push({
      name: testName,
      passed: costCorrect,
    })
  } catch (error) {
    console.log(`  ❌ Ошибка: ${error.message}`)
    results.failed++
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
    })
  }
}

/**
 * Test complex estimate calculation
 */
function testComplexEstimate(results) {
  const testName = 'Комплексная смета'
  console.log(`\n🔍 Тест: ${testName}`)

  try {
    const scenario = testScenarios.complexEstimate
    const estimate = scenario.estimate

    const calculation = CalculationEngine.calculateEstimateTotalDual(
      estimate,
      CalculationEngine.DISPLAY_MODES.WITH_MARKUP,
    )

    // Проверяем, что расчеты корректны
    const hasCategorySubtotals = calculation.category_subtotals
    const hasBaseTotal = calculation.base_total > 0
    const hasGeneralMarkup = calculation.general_markup_amount > 0
    const hasFinalTotal = calculation.final_total > 0

    if (hasCategorySubtotals && hasBaseTotal && hasGeneralMarkup && hasFinalTotal) {
      console.log(`  ✅ Базовая стоимость: $${calculation.base_total}`)
      console.log(`  ✅ Общая наценка: $${calculation.general_markup_amount}`)
      console.log(`  ✅ Финальная стоимость: $${calculation.final_total}`)
      console.log(`  ✅ Категории: ${Object.keys(calculation.category_subtotals).join(', ')}`)
      results.passed++
    } else {
      console.log(`  ❌ Ошибка в комплексном расчете`)
      results.failed++
    }

    results.tests.push({
      name: testName,
      passed: hasCategorySubtotals && hasBaseTotal && hasGeneralMarkup && hasFinalTotal,
    })
  } catch (error) {
    console.log(`  ❌ Ошибка: ${error.message}`)
    results.failed++
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
    })
  }
}

/**
 * Test dual display mode
 */
function testDualDisplayMode(results) {
  const testName = 'Двойная система отображения'
  console.log(`\n🔍 Тест: ${testName}`)

  try {
    const scenario = testScenarios.entranceTickets
    const activity = scenario.activities[0]
    const participantCount = scenario.participantCount

    // Тест без наценки
    const withoutMarkup = CalculationEngine.calculateActivityPriceDual(
      activity,
      participantCount,
      CalculationEngine.DISPLAY_MODES.WITHOUT_MARKUP,
    )

    // Тест с наценкой
    const withMarkup = CalculationEngine.calculateActivityPriceDual(
      activity,
      participantCount,
      CalculationEngine.DISPLAY_MODES.WITH_MARKUP,
    )

    const basePriceCorrect =
      Math.abs(withoutMarkup.display_price - scenario.expectedBaseCost) < 0.01
    const markupPriceCorrect =
      Math.abs(withMarkup.display_price - scenario.expectedWithMarkup) < 0.01
    const hasBothPrices = withoutMarkup.base_price && withMarkup.price_with_markup

    if (basePriceCorrect && markupPriceCorrect && hasBothPrices) {
      console.log(`  ✅ Без наценки: $${withoutMarkup.display_price}`)
      console.log(`  ✅ С наценкой: $${withMarkup.display_price}`)
      console.log(`  ✅ Оба режима работают корректно`)
      results.passed++
    } else {
      console.log(`  ❌ Ошибка в двойном отображении`)
      results.failed++
    }

    results.tests.push({
      name: testName,
      passed: basePriceCorrect && markupPriceCorrect && hasBothPrices,
    })
  } catch (error) {
    console.log(`  ❌ Ошибка: ${error.message}`)
    results.failed++
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
    })
  }
}

/**
 * Test pricing intelligence
 */
function testPricingIntelligence(results) {
  const testName = 'Интеллектуальные подстановки цен'
  console.log(`\n🔍 Тест: ${testName}`)

  try {
    // Тест 1: Входные билеты
    const entranceSuggestion = PricingIntelligenceService.suggestPricing(
      'Входные билеты в нац.парк',
      'entrance',
      5,
    )

    // Тест 2: Трансфер
    const transferSuggestion = PricingIntelligenceService.suggestPricing(
      'Трансфер в гостиницу',
      'transfer',
      5,
    )

    const entranceValid = entranceSuggestion.suggested && entranceSuggestion.confidence > 0.5
    const transferValid = transferSuggestion.suggested && transferSuggestion.confidence > 0.5
    const hasCorrectTypes =
      entranceSuggestion.calculation_type && transferSuggestion.calculation_type

    if (entranceValid && transferValid && hasCorrectTypes) {
      console.log(
        `  ✅ Входные билеты: ${entranceSuggestion.calculation_type} (уверенность: ${entranceSuggestion.confidence})`,
      )
      console.log(
        `  ✅ Трансфер: ${transferSuggestion.calculation_type} (уверенность: ${transferSuggestion.confidence})`,
      )
      results.passed++
    } else {
      console.log(`  ❌ Ошибка в интеллектуальных подстановках`)
      results.failed++
    }

    results.tests.push({
      name: testName,
      passed: entranceValid && transferValid && hasCorrectTypes,
    })
  } catch (error) {
    console.log(`  ❌ Ошибка: ${error.message}`)
    results.failed++
    results.tests.push({
      name: testName,
      passed: false,
      error: error.message,
    })
  }
}

// Экспорт для использования в других модулях
export default {
  runComprehensiveTests,
  testScenarios,
}

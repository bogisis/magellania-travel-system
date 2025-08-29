// src/utils/comprehensiveMathTests.js
// Комплексная система тестирования математических расчетов

import { CalculationService } from '@/services/CalculationService.js'

/**
 * Комплексная система тестирования математических расчетов
 */
export class ComprehensiveMathTests {
  /**
   * Запуск всех тестов
   */
  static runAllTests() {
    console.log('🧪 ЗАПУСК КОМПЛЕКСНОГО ТЕСТИРОВАНИЯ МАТЕМАТИЧЕСКИХ РАСЧЕТОВ')
    console.log('='.repeat(80))

    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: [],
    }

    // 1. Тесты базовых математических операций
    results.total += 5
    this.testBasicMathOperations(results)

    // 2. Тесты расчета номеров
    results.total += 6
    this.testRoomCalculations(results)

    // 3. Тесты расчета стоимости отелей
    results.total += 8
    this.testHotelCostCalculations(results)

    // 4. Тесты расчета стоимости дней тура
    results.total += 6
    this.testTourDayCalculations(results)

    // 5. Тесты расчета базовой стоимости
    results.total += 4
    this.testBaseCostCalculations(results)

    // 6. Тесты расчета наценки
    results.total += 4
    this.testMarkupCalculations(results)

    // 7. Тесты расчета финальной стоимости
    results.total += 4
    this.testFinalCostCalculations(results)

    // 8. Тесты edge cases
    results.total += 6
    this.testEdgeCases(results)

    // 9. Тесты валидации данных
    results.total += 4
    this.testDataValidation(results)

    // Вывод результатов
    this.printResults(results)

    return results
  }

  /**
   * Тесты базовых математических операций
   */
  static testBasicMathOperations(results) {
    console.log('\n📊 Тест 1: Базовые математические операции')

    try {
      // Тест safeNumber
      const test1 = CalculationService.safeNumber('100', 0) === 100
      this.assert(test1, 'safeNumber с числовой строкой', results)

      const test2 = CalculationService.safeNumber('abc', 0) === 0
      this.assert(test2, 'safeNumber с нечисловой строкой', results)

      const test3 = CalculationService.safeNumber(null, 50) === 50
      this.assert(test3, 'safeNumber с null', results)

      const test4 = CalculationService.safeNumber(undefined, 25) === 25
      this.assert(test4, 'safeNumber с undefined', results)

      const test5 = CalculationService.safeNumber(75, 0) === 75
      this.assert(test5, 'safeNumber с числом', results)
    } catch (error) {
      this.handleError('Базовые математические операции', error, results)
    }
  }

  /**
   * Тесты расчета номеров
   */
  static testRoomCalculations(results) {
    console.log('\n🏨 Тест 2: Расчет количества номеров')

    try {
      // Тест single
      const hotel1 = { paxCount: 5, accommodationType: 'single' }
      const test1 = CalculationService.calculateRooms(hotel1) === 5
      this.assert(test1, 'Расчет номеров для single размещения', results)

      // Тест double
      const hotel2 = { paxCount: 6, accommodationType: 'double' }
      const test2 = CalculationService.calculateRooms(hotel2) === 3
      this.assert(test2, 'Расчет номеров для double размещения (четное)', results)

      const hotel3 = { paxCount: 5, accommodationType: 'double' }
      const test3 = CalculationService.calculateRooms(hotel3) === 3
      this.assert(test3, 'Расчет номеров для double размещения (нечетное)', results)

      // Тест triple
      const hotel4 = { paxCount: 7, accommodationType: 'triple' }
      const test4 = CalculationService.calculateRooms(hotel4) === 3
      this.assert(test4, 'Расчет номеров для triple размещения', results)

      // Тест с невалидными данными
      const hotel5 = { paxCount: 'abc', accommodationType: 'double' }
      const test5 = CalculationService.calculateRooms(hotel5) === 0
      this.assert(test5, 'Расчет номеров с невалидными данными', results)

      const hotel6 = { accommodationType: 'double' }
      const test6 = CalculationService.calculateRooms(hotel6) === 0
      this.assert(test6, 'Расчет номеров без paxCount', results)
    } catch (error) {
      this.handleError('Расчет количества номеров', error, results)
    }
  }

  /**
   * Тесты расчета стоимости отелей
   */
  static testHotelCostCalculations(results) {
    console.log('\n💰 Тест 3: Расчет стоимости отелей')

    try {
      // Простой тест
      const hotel1 = { paxCount: 2, accommodationType: 'double', pricePerRoom: 100, nights: 3 }
      const expected1 = 1 * 100 * 3 // 1 номер * 100$ * 3 ночи
      const test1 = CalculationService.calculateHotelTotal(hotel1) === expected1
      this.assert(test1, 'Простой расчет стоимости отеля', results)

      // Тест с single размещением
      const hotel2 = { paxCount: 3, accommodationType: 'single', pricePerRoom: 80, nights: 2 }
      const expected2 = 3 * 80 * 2 // 3 номера * 80$ * 2 ночи
      const test2 = CalculationService.calculateHotelTotal(hotel2) === expected2
      this.assert(test2, 'Расчет стоимости отеля с single размещением', results)

      // Тест с triple размещением
      const hotel3 = { paxCount: 9, accommodationType: 'triple', pricePerRoom: 120, nights: 4 }
      const expected3 = 3 * 120 * 4 // 3 номера * 120$ * 4 ночи
      const test3 = CalculationService.calculateHotelTotal(hotel3) === expected3
      this.assert(test3, 'Расчет стоимости отеля с triple размещением', results)

      // Тест с нечетным количеством туристов
      const hotel4 = { paxCount: 7, accommodationType: 'double', pricePerRoom: 90, nights: 5 }
      const expected4 = 4 * 90 * 5 // 4 номера * 90$ * 5 ночей
      const test4 = CalculationService.calculateHotelTotal(hotel4) === expected4
      this.assert(test4, 'Расчет стоимости отеля с нечетным количеством туристов', results)

      // Тест с нулевыми значениями
      const hotel5 = { paxCount: 0, accommodationType: 'double', pricePerRoom: 100, nights: 3 }
      const test5 = CalculationService.calculateHotelTotal(hotel5) === 0
      this.assert(test5, 'Расчет стоимости отеля с нулевым количеством туристов', results)

      // Тест с отсутствующими данными
      const hotel6 = { paxCount: 2, accommodationType: 'double' }
      const test6 = CalculationService.calculateHotelTotal(hotel6) === 0
      this.assert(test6, 'Расчет стоимости отеля без цены и ночей', results)

      // Тест с отрицательными значениями
      const hotel7 = { paxCount: 2, accommodationType: 'double', pricePerRoom: -50, nights: 3 }
      const test7 = CalculationService.calculateHotelTotal(hotel7) === 0
      this.assert(test7, 'Расчет стоимости отеля с отрицательной ценой', results)

      // Тест с очень большими числами
      const hotel8 = { paxCount: 100, accommodationType: 'double', pricePerRoom: 1000, nights: 30 }
      const expected8 = 50 * 1000 * 30 // 50 номеров * 1000$ * 30 ночей
      const test8 = CalculationService.calculateHotelTotal(hotel8) === expected8
      this.assert(test8, 'Расчет стоимости отеля с большими числами', results)
    } catch (error) {
      this.handleError('Расчет стоимости отелей', error, results)
    }
  }

  /**
   * Тесты расчета стоимости дней тура
   */
  static testTourDayCalculations(results) {
    console.log('\n📅 Тест 4: Расчет стоимости дней тура')

    try {
      // Простой тест
      const day1 = {
        activities: [{ cost: 50 }, { cost: 30 }, { cost: 20 }],
      }
      const expected1 = 50 + 30 + 20
      const test1 = CalculationService.calculateDayTotal(day1) === expected1
      this.assert(test1, 'Простой расчет стоимости дня тура', results)

      // Тест без активностей
      const day2 = { activities: [] }
      const test2 = CalculationService.calculateDayTotal(day2) === 0
      this.assert(test2, 'Расчет стоимости дня без активностей', results)

      // Тест с одной активностью
      const day3 = { activities: [{ cost: 100 }] }
      const test3 = CalculationService.calculateDayTotal(day3) === 100
      this.assert(test3, 'Расчет стоимости дня с одной активностью', results)

      // Тест с невалидными данными
      const day4 = { activities: [{ cost: 'abc' }, { cost: 50 }] }
      const test4 = CalculationService.calculateDayTotal(day4) === 50
      this.assert(test4, 'Расчет стоимости дня с невалидными данными', results)

      // Тест с отрицательными значениями
      const day5 = { activities: [{ cost: -20 }, { cost: 30 }] }
      const test5 = CalculationService.calculateDayTotal(day5) === 30
      this.assert(test5, 'Расчет стоимости дня с отрицательными значениями', results)

      // Тест с большими числами
      const day6 = { activities: [{ cost: 1000 }, { cost: 2000 }, { cost: 3000 }] }
      const expected6 = 1000 + 2000 + 3000
      const test6 = CalculationService.calculateDayTotal(day6) === expected6
      this.assert(test6, 'Расчет стоимости дня с большими числами', results)
    } catch (error) {
      this.handleError('Расчет стоимости дней тура', error, results)
    }
  }

  /**
   * Тесты расчета базовой стоимости
   */
  static testBaseCostCalculations(results) {
    console.log('\n💵 Тест 5: Расчет базовой стоимости')

    try {
      // Простой тест
      const estimate1 = {
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
        ],
        tourDays: [{ activities: [{ cost: 50 }, { cost: 30 }] }],
      }
      const expected1 = 1 * 100 * 3 + (50 + 30) // отель + активности
      const test1 = CalculationService.calculateBaseCost(estimate1) === expected1
      this.assert(test1, 'Простой расчет базовой стоимости', results)

      // Тест с несколькими отелями
      const estimate2 = {
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
          {
            paxCount: 1,
            accommodationType: 'single',
            pricePerRoom: 80,
            nights: 2,
            isGuideHotel: false,
          },
        ],
        tourDays: [],
      }
      const expected2 = 1 * 100 * 3 + 1 * 80 * 2
      const test2 = CalculationService.calculateBaseCost(estimate2) === expected2
      this.assert(test2, 'Расчет базовой стоимости с несколькими отелями', results)

      // Тест с исключением guide hotels
      const estimate3 = {
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
          {
            paxCount: 1,
            accommodationType: 'single',
            pricePerRoom: 80,
            nights: 2,
            isGuideHotel: true,
          },
        ],
        tourDays: [],
      }
      const expected3 = 1 * 100 * 3 // только не-guide отель
      const test3 = CalculationService.calculateBaseCost(estimate3) === expected3
      this.assert(test3, 'Расчет базовой стоимости с исключением guide hotels', results)

      // Тест с пустыми данными
      const estimate4 = { hotels: [], tourDays: [] }
      const test4 = CalculationService.calculateBaseCost(estimate4) === 0
      this.assert(test4, 'Расчет базовой стоимости с пустыми данными', results)
    } catch (error) {
      this.handleError('Расчет базовой стоимости', error, results)
    }
  }

  /**
   * Тесты расчета наценки
   */
  static testMarkupCalculations(results) {
    console.log('\n📈 Тест 6: Расчет наценки')

    try {
      // Простой тест
      const estimate1 = {
        markup: 15,
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
        ],
        tourDays: [],
      }
      const baseCost1 = 1 * 100 * 3
      const expected1 = (baseCost1 * 15) / 100
      const test1 = CalculationService.calculateMarkupAmount(estimate1) === expected1
      this.assert(test1, 'Простой расчет наценки', results)

      // Тест с нулевой наценкой
      const estimate2 = {
        markup: 0,
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
        ],
        tourDays: [],
      }
      const test2 = CalculationService.calculateMarkupAmount(estimate2) === 0
      this.assert(test2, 'Расчет наценки с нулевым процентом', results)

      // Тест с большой наценкой
      const estimate3 = {
        markup: 50,
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
        ],
        tourDays: [],
      }
      const baseCost3 = 1 * 100 * 3
      const expected3 = (baseCost3 * 50) / 100
      const test3 = CalculationService.calculateMarkupAmount(estimate3) === expected3
      this.assert(test3, 'Расчет наценки с большим процентом', results)

      // Тест без наценки
      const estimate4 = {
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
        ],
        tourDays: [],
      }
      const test4 = CalculationService.calculateMarkupAmount(estimate4) === 0
      this.assert(test4, 'Расчет наценки без указания процента', results)
    } catch (error) {
      this.handleError('Расчет наценки', error, results)
    }
  }

  /**
   * Тесты расчета финальной стоимости
   */
  static testFinalCostCalculations(results) {
    console.log('\n🎯 Тест 7: Расчет финальной стоимости')

    try {
      // Простой тест
      const estimate1 = {
        markup: 15,
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
        ],
        tourDays: [],
      }
      const baseCost1 = 1 * 100 * 3
      const markup1 = (baseCost1 * 15) / 100
      const expected1 = baseCost1 + markup1
      const test1 = CalculationService.calculateFinalCost(estimate1) === expected1
      this.assert(test1, 'Простой расчет финальной стоимости', results)

      // Тест без наценки
      const estimate2 = {
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
        ],
        tourDays: [],
      }
      const baseCost2 = 1 * 100 * 3
      const test2 = CalculationService.calculateFinalCost(estimate2) === baseCost2
      this.assert(test2, 'Расчет финальной стоимости без наценки', results)

      // Тест с нулевой наценкой
      const estimate3 = {
        markup: 0,
        hotels: [
          {
            paxCount: 2,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
            isGuideHotel: false,
          },
        ],
        tourDays: [],
      }
      const baseCost3 = 1 * 100 * 3
      const test3 = CalculationService.calculateFinalCost(estimate3) === baseCost3
      this.assert(test3, 'Расчет финальной стоимости с нулевой наценкой', results)

      // Тест с большими числами
      const estimate4 = {
        markup: 25,
        hotels: [
          {
            paxCount: 10,
            accommodationType: 'double',
            pricePerRoom: 500,
            nights: 7,
            isGuideHotel: false,
          },
        ],
        tourDays: [{ activities: [{ cost: 1000 }] }],
      }
      const baseCost4 = 5 * 500 * 7 + 1000
      const markup4 = (baseCost4 * 25) / 100
      const expected4 = baseCost4 + markup4
      const test4 = CalculationService.calculateFinalCost(estimate4) === expected4
      this.assert(test4, 'Расчет финальной стоимости с большими числами', results)
    } catch (error) {
      this.handleError('Расчет финальной стоимости', error, results)
    }
  }

  /**
   * Тесты edge cases
   */
  static testEdgeCases(results) {
    console.log('\n⚠️ Тест 8: Edge cases')

    try {
      // Тест с очень большими числами
      const hotel1 = {
        paxCount: 1000,
        accommodationType: 'double',
        pricePerRoom: 10000,
        nights: 365,
      }
      const test1 = !isNaN(CalculationService.calculateHotelTotal(hotel1))
      this.assert(test1, 'Обработка очень больших чисел', results)

      // Тест с очень маленькими числами
      const hotel2 = { paxCount: 1, accommodationType: 'single', pricePerRoom: 0.01, nights: 1 }
      const test2 = CalculationService.calculateHotelTotal(hotel2) === 0.01
      this.assert(test2, 'Обработка очень маленьких чисел', results)

      // Тест с максимальными значениями
      const hotel3 = {
        paxCount: Number.MAX_SAFE_INTEGER,
        accommodationType: 'single',
        pricePerRoom: 1,
        nights: 1,
      }
      const test3 = !isNaN(CalculationService.calculateHotelTotal(hotel3))
      this.assert(test3, 'Обработка максимальных значений', results)

      // Тест с отрицательными значениями
      const hotel4 = { paxCount: -5, accommodationType: 'double', pricePerRoom: 100, nights: 3 }
      const test4 = CalculationService.calculateHotelTotal(hotel4) === 0
      this.assert(test4, 'Обработка отрицательных значений', results)

      // Тест с undefined значениями
      const hotel5 = {
        paxCount: undefined,
        accommodationType: 'double',
        pricePerRoom: 100,
        nights: 3,
      }
      const test5 = CalculationService.calculateHotelTotal(hotel5) === 0
      this.assert(test5, 'Обработка undefined значений', results)

      // Тест с null значениями
      const hotel6 = { paxCount: null, accommodationType: 'double', pricePerRoom: 100, nights: 3 }
      const test6 = CalculationService.calculateHotelTotal(hotel6) === 0
      this.assert(test6, 'Обработка null значений', results)
    } catch (error) {
      this.handleError('Edge cases', error, results)
    }
  }

  /**
   * Тесты валидации данных
   */
  static testDataValidation(results) {
    console.log('\n✅ Тест 9: Валидация данных')

    try {
      // Тест валидной сметы
      const estimate1 = {
        group: { totalPax: 5 },
        hotels: [
          {
            name: 'Hotel A',
            paxCount: 5,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
          },
        ],
      }
      const test1 = CalculationService.validateEstimate(estimate1).length === 0
      this.assert(test1, 'Валидация корректной сметы', results)

      // Тест сметы без группы
      const estimate2 = {
        hotels: [
          {
            name: 'Hotel A',
            paxCount: 5,
            accommodationType: 'double',
            pricePerRoom: 100,
            nights: 3,
          },
        ],
      }
      const test2 = CalculationService.validateEstimate(estimate2).length > 0
      this.assert(test2, 'Валидация сметы без группы', results)

      // Тест сметы с невалидными данными отеля
      const estimate3 = {
        group: { totalPax: 5 },
        hotels: [{ name: '', paxCount: 0, pricePerRoom: -50 }],
      }
      const test3 = CalculationService.validateEstimate(estimate3).length > 0
      this.assert(test3, 'Валидация сметы с невалидными данными отеля', results)

      // Тест пустой сметы
      const estimate4 = {}
      const test4 = CalculationService.validateEstimate(estimate4).length > 0
      this.assert(test4, 'Валидация пустой сметы', results)
    } catch (error) {
      this.handleError('Валидация данных', error, results)
    }
  }

  /**
   * Вспомогательные методы
   */
  static assert(condition, testName, results) {
    if (condition) {
      results.passed++
      console.log(`✅ ${testName}`)
    } else {
      results.failed++
      console.log(`❌ ${testName}`)
    }
  }

  static handleError(testName, error, results) {
    results.failed++
    results.errors.push({ test: testName, error: error.message })
    console.log(`❌ ${testName}: ${error.message}`)
  }

  static printResults(results) {
    console.log('\n' + '='.repeat(80))
    console.log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ')
    console.log('='.repeat(80))
    console.log(`Всего тестов: ${results.total}`)
    console.log(`Пройдено: ${results.passed}`)
    console.log(`Провалено: ${results.failed}`)
    console.log(`Процент успеха: ${((results.passed / results.total) * 100).toFixed(1)}%`)

    if (results.errors.length > 0) {
      console.log('\n🚨 ОШИБКИ:')
      results.errors.forEach(({ test, error }) => {
        console.log(`  ${test}: ${error}`)
      })
    }

    if (results.failed === 0) {
      console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!')
    } else {
      console.log('\n⚠️ ЕСТЬ ПРОБЛЕМЫ, ТРЕБУЕТСЯ ИСПРАВЛЕНИЕ')
    }

    console.log('='.repeat(80))
  }
}

/**
 * Экспорт функции для запуска тестов
 */
export function runComprehensiveMathTests() {
  return ComprehensiveMathTests.runAllTests()
}

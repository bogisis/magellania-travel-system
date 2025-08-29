#!/usr/bin/env node

/**
 * Комплексное тестирование всех смет в базе данных
 * Проверяет математические расчеты, валидацию и целостность данных
 */

const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Подключение к базе данных
const dbPath = path.join(__dirname, 'api-server/data/magellania.db')
const db = new sqlite3.Database(dbPath)

// Импорт CalculationService (упрощенная версия для Node.js)
class CalculationService {
  static safeNumber(value, defaultValue = 0) {
    if (value === null || value === undefined || value === '') {
      return defaultValue
    }
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
  }

  static calculateRooms(hotel) {
    const paxCount = this.safeNumber(hotel.paxCount, 0)
    if (paxCount <= 0) return 0

    switch (hotel.accommodationType) {
      case 'double':
        return Math.ceil(paxCount / 2)
      case 'triple':
        return Math.ceil(paxCount / 3)
      case 'single':
      default:
        return paxCount
    }
  }

  static calculateHotelTotal(hotel) {
    const rooms = this.calculateRooms(hotel)
    const pricePerRoom = this.safeNumber(hotel.pricePerRoom, 0)
    const nights = this.safeNumber(hotel.nights, 1)

    if (pricePerRoom < 0) return 0
    return rooms * pricePerRoom * nights
  }

  static calculateDayTotal(day) {
    if (!day.activities || !Array.isArray(day.activities)) return 0

    return day.activities.reduce((sum, activity) => {
      return sum + this.safeNumber(activity.cost, 0)
    }, 0)
  }

  static calculateBaseCost(estimate) {
    let hotelsCost = 0
    if (estimate.hotels && Array.isArray(estimate.hotels)) {
      hotelsCost = estimate.hotels
        .filter((hotel) => !hotel.isGuideHotel)
        .reduce((sum, hotel) => {
          return sum + this.calculateHotelTotal(hotel)
        }, 0)
    }

    let activitiesCost = 0
    if (estimate.tourDays && Array.isArray(estimate.tourDays)) {
      activitiesCost = estimate.tourDays.reduce((sum, day) => {
        return sum + this.calculateDayTotal(day)
      }, 0)
    }

    return hotelsCost + activitiesCost
  }

  static calculateMarkupAmount(estimate) {
    const baseCost = this.calculateBaseCost(estimate)
    const markup = this.safeNumber(estimate.markup, 0)
    return (baseCost * markup) / 100
  }

  static calculateFinalCost(estimate) {
    const baseCost = this.calculateBaseCost(estimate)
    const markupAmount = this.calculateMarkupAmount(estimate)
    return baseCost + markupAmount
  }

  static validateEstimate(estimate) {
    const errors = []

    if (!estimate) {
      errors.push('Estimate data is required')
      return errors
    }

    // Проверка группы
    if (estimate.group) {
      const totalPax = this.safeNumber(estimate.group.totalPax, 0)
      if (totalPax <= 0) {
        errors.push('Total passengers must be greater than 0')
      }
    }

    // Проверка гостиниц
    if (estimate.hotels && Array.isArray(estimate.hotels)) {
      estimate.hotels.forEach((hotel, index) => {
        if (!hotel.name) {
          errors.push(`Hotel ${index + 1}: name is required`)
        }

        const paxCount = this.safeNumber(hotel.paxCount, 0)
        if (paxCount <= 0) {
          errors.push(`Hotel ${index + 1}: pax count must be greater than 0`)
        }

        const pricePerRoom = this.safeNumber(hotel.pricePerRoom, 0)
        if (pricePerRoom < 0) {
          errors.push(`Hotel ${index + 1}: price per room cannot be negative`)
        }
      })
    }

    return errors
  }
}

/**
 * Основная функция тестирования
 */
async function testAllEstimates() {
  console.log('🧪 КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ ВСЕХ СМЕТ В БАЗЕ ДАННЫХ')
  console.log('='.repeat(80))

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
    estimates: [],
  }

  try {
    // Получаем все сметы из базы данных
    const estimates = await getEstimates()
    console.log(`📊 Найдено смет в базе данных: ${estimates.length}`)

    if (estimates.length === 0) {
      console.log('⚠️ В базе данных нет смет для тестирования')
      return results
    }

    // Тестируем каждую смету
    for (const estimate of estimates) {
      results.total++
      console.log(`\n🔍 Тестирование сметы ID: ${estimate.id} - "${estimate.name}"`)

      const estimateResults = testEstimate(estimate)

      if (estimateResults.passed) {
        results.passed++
        console.log(`✅ Смета ${estimate.id} прошла все тесты`)
      } else {
        results.failed++
        console.log(`❌ Смета ${estimate.id} имеет проблемы`)
        results.errors.push({
          estimateId: estimate.id,
          estimateName: estimate.name,
          errors: estimateResults.errors,
        })
      }

      results.estimates.push({
        id: estimate.id,
        name: estimate.name,
        ...estimateResults,
      })
    }

    // Выводим итоговые результаты
    printResults(results)
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message)
    results.errors.push({ type: 'system', error: error.message })
  }

  return results
}

/**
 * Получение всех смет из базы данных
 */
function getEstimates() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, c.name as clientName 
      FROM estimates e 
      LEFT JOIN clients c ON e.clientId = c.id 
      ORDER BY e.createdAt DESC
    `

    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err)
        return
      }

      // Преобразуем JSON данные обратно в объекты
      const estimates = rows.map((estimate) => ({
        ...estimate,
        location: estimate.location_data
          ? JSON.parse(estimate.location_data)
          : { country: '', regions: [], cities: [], startPoint: '', endPoint: '' },
        tourDates: estimate.tour_dates_data
          ? JSON.parse(estimate.tour_dates_data)
          : { dateType: 'exact', startDate: '', endDate: '', days: 0 },
        group: estimate.group_data
          ? JSON.parse(estimate.group_data)
          : { totalPax: 0, doubleCount: 0, singleCount: 0, guidesCount: 0, markup: 0 },
        hotels: estimate.hotels_data ? JSON.parse(estimate.hotels_data) : [],
        tourDays: estimate.tour_days_data ? JSON.parse(estimate.tour_days_data) : [],
        optionalServices: estimate.optional_services_data
          ? JSON.parse(estimate.optional_services_data)
          : [],
      }))

      resolve(estimates)
    })
  })
}

/**
 * Тестирование одной сметы
 */
function testEstimate(estimate) {
  const results = {
    passed: true,
    errors: [],
    calculations: {},
  }

  try {
    // 1. Проверка структуры данных
    console.log(`  📋 Проверка структуры данных...`)
    const structureErrors = validateEstimateStructure(estimate)
    if (structureErrors.length > 0) {
      results.errors.push(...structureErrors)
      results.passed = false
    }

    // 2. Проверка валидации
    console.log(`  ✅ Проверка валидации...`)
    const validationErrors = CalculationService.validateEstimate(estimate)
    if (validationErrors.length > 0) {
      results.errors.push(...validationErrors.map((err) => `Validation: ${err}`))
      results.passed = false
    }

    // 3. Проверка математических расчетов
    console.log(`  🧮 Проверка математических расчетов...`)
    const calculationResults = testCalculations(estimate)
    results.calculations = calculationResults

    if (calculationResults.errors.length > 0) {
      results.errors.push(...calculationResults.errors)
      results.passed = false
    }

    // 4. Проверка целостности данных
    console.log(`  🔍 Проверка целостности данных...`)
    const integrityErrors = testDataIntegrity(estimate)
    if (integrityErrors.length > 0) {
      results.errors.push(...integrityErrors)
      results.passed = false
    }
  } catch (error) {
    results.errors.push(`System error: ${error.message}`)
    results.passed = false
  }

  return results
}

/**
 * Проверка структуры данных сметы
 */
function validateEstimateStructure(estimate) {
  const errors = []

  // Проверка обязательных полей
  if (!estimate.name) {
    errors.push('Missing required field: name')
  }

  if (!estimate.id) {
    errors.push('Missing required field: id')
  }

  // Проверка типов данных
  if (estimate.hotels && !Array.isArray(estimate.hotels)) {
    errors.push('Hotels must be an array')
  }

  if (estimate.tourDays && !Array.isArray(estimate.tourDays)) {
    errors.push('Tour days must be an array')
  }

  if (estimate.optionalServices && !Array.isArray(estimate.optionalServices)) {
    errors.push('Optional services must be an array')
  }

  return errors
}

/**
 * Тестирование математических расчетов
 */
function testCalculations(estimate) {
  const results = {
    baseCost: 0,
    markupAmount: 0,
    finalCost: 0,
    errors: [],
  }

  try {
    // Расчет базовой стоимости
    results.baseCost = CalculationService.calculateBaseCost(estimate)

    // Расчет наценки
    results.markupAmount = CalculationService.calculateMarkupAmount(estimate)

    // Расчет финальной стоимости
    results.finalCost = CalculationService.calculateFinalCost(estimate)

    // Проверка на подозрительные значения
    if (results.baseCost > 1000000) {
      results.errors.push(`Suspiciously high base cost: $${results.baseCost.toLocaleString()}`)
    }

    if (results.finalCost > 1000000) {
      results.errors.push(`Suspiciously high final cost: $${results.finalCost.toLocaleString()}`)
    }

    // Проверка соответствия расчетов
    const expectedFinalCost = results.baseCost + results.markupAmount
    if (Math.abs(results.finalCost - expectedFinalCost) > 0.01) {
      results.errors.push(
        `Final cost calculation mismatch: expected ${expectedFinalCost}, got ${results.finalCost}`,
      )
    }

    // Проверка отелей
    if (estimate.hotels && Array.isArray(estimate.hotels)) {
      estimate.hotels.forEach((hotel, index) => {
        const hotelTotal = CalculationService.calculateHotelTotal(hotel)
        if (hotelTotal > 100000) {
          results.errors.push(
            `Hotel ${index + 1} has suspiciously high cost: $${hotelTotal.toLocaleString()}`,
          )
        }
      })
    }
  } catch (error) {
    results.errors.push(`Calculation error: ${error.message}`)
  }

  return results
}

/**
 * Проверка целостности данных
 */
function testDataIntegrity(estimate) {
  const errors = []

  // Проверка отелей
  if (estimate.hotels && Array.isArray(estimate.hotels)) {
    estimate.hotels.forEach((hotel, index) => {
      if (!hotel.name) {
        errors.push(`Hotel ${index + 1}: missing name`)
      }

      if (!hotel.city) {
        errors.push(`Hotel ${index + 1}: missing city`)
      }

      if (!hotel.accommodationType) {
        errors.push(`Hotel ${index + 1}: missing accommodation type`)
      }

      if (hotel.paxCount <= 0) {
        errors.push(`Hotel ${index + 1}: invalid pax count (${hotel.paxCount})`)
      }

      if (hotel.pricePerRoom < 0) {
        errors.push(`Hotel ${index + 1}: negative price per room (${hotel.pricePerRoom})`)
      }

      if (hotel.nights <= 0) {
        errors.push(`Hotel ${index + 1}: invalid nights count (${hotel.nights})`)
      }
    })
  }

  // Проверка дней тура
  if (estimate.tourDays && Array.isArray(estimate.tourDays)) {
    estimate.tourDays.forEach((day, index) => {
      if (!day.city) {
        errors.push(`Tour day ${index + 1}: missing city`)
      }

      if (day.activities && Array.isArray(day.activities)) {
        day.activities.forEach((activity, actIndex) => {
          if (!activity.name) {
            errors.push(`Tour day ${index + 1}, activity ${actIndex + 1}: missing name`)
          }

          if (activity.cost < 0) {
            errors.push(
              `Tour day ${index + 1}, activity ${actIndex + 1}: negative cost (${activity.cost})`,
            )
          }
        })
      }
    })
  }

  // Проверка группы
  if (estimate.group) {
    if (estimate.group.totalPax <= 0) {
      errors.push('Group: invalid total passengers count')
    }

    if (estimate.group.markup < 0 || estimate.group.markup > 100) {
      errors.push(`Group: invalid markup percentage (${estimate.group.markup}%)`)
    }
  }

  return errors
}

/**
 * Вывод результатов тестирования
 */
function printResults(results) {
  console.log('\n' + '='.repeat(80))
  console.log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ КОМПЛЕКСНОГО ТЕСТИРОВАНИЯ')
  console.log('='.repeat(80))
  console.log(`Всего смет: ${results.total}`)
  console.log(`Пройдено: ${results.passed}`)
  console.log(`Провалено: ${results.failed}`)
  console.log(`Процент успеха: ${((results.passed / results.total) * 100).toFixed(1)}%`)

  if (results.errors.length > 0) {
    console.log('\n🚨 ОШИБКИ ПО СМЕТАМ:')
    results.errors.forEach(({ estimateId, estimateName, errors }) => {
      console.log(`\nСмета ${estimateId} - "${estimateName}":`)
      errors.forEach((error) => console.log(`  ❌ ${error}`))
    })
  }

  if (results.failed === 0) {
    console.log('\n🎉 ВСЕ СМЕТЫ ПРОШЛИ ТЕСТИРОВАНИЕ УСПЕШНО!')
  } else {
    console.log('\n⚠️ ЕСТЬ ПРОБЛЕМЫ, ТРЕБУЕТСЯ ИСПРАВЛЕНИЕ')
  }

  console.log('='.repeat(80))
}

/**
 * Запуск тестирования
 */
async function main() {
  try {
    const results = await testAllEstimates()

    // Закрываем соединение с базой данных
    db.close((err) => {
      if (err) {
        console.error('Ошибка при закрытии базы данных:', err.message)
      } else {
        console.log('✅ Соединение с базой данных закрыто')
      }
    })

    // Возвращаем код выхода
    process.exit(results.failed === 0 ? 0 : 1)
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message)
    process.exit(1)
  }
}

// Запускаем тестирование
main()

#!/usr/bin/env node

/**
 * Скрипт для исправления проблем в сметах
 * Исправляет выявленные проблемы с данными
 */

const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Подключение к базе данных
const dbPath = path.join(__dirname, 'data/magellania.db')
const db = new sqlite3.Database(dbPath)

/**
 * Основная функция исправления
 */
async function fixEstimateProblems() {
  console.log('🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМ В СМЕТАХ')
  console.log('='.repeat(60))

  const results = {
    total: 0,
    fixed: 0,
    errors: [],
  }

  try {
    // Получаем все сметы из базы данных
    const estimates = await getEstimates()
    console.log(`📊 Найдено смет в базе данных: ${estimates.length}`)

    if (estimates.length === 0) {
      console.log('⚠️ В базе данных нет смет для исправления')
      return results
    }

    // Исправляем каждую смету
    for (const estimate of estimates) {
      results.total++
      console.log(`\n🔧 Исправление сметы ID: ${estimate.id} - "${estimate.name}"`)

      const fixResults = await fixEstimate(estimate)

      if (fixResults.fixed) {
        results.fixed++
        console.log(`✅ Смета ${estimate.id} исправлена`)
      } else {
        console.log(`⚠️ Смета ${estimate.id} не требует исправлений`)
      }

      if (fixResults.errors.length > 0) {
        results.errors.push({
          estimateId: estimate.id,
          estimateName: estimate.name,
          errors: fixResults.errors,
        })
      }
    }

    // Выводим итоговые результаты
    printResults(results)
  } catch (error) {
    console.error('❌ Ошибка при исправлении:', error.message)
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
 * Исправление одной сметы
 */
async function fixEstimate(estimate) {
  const results = {
    fixed: false,
    errors: [],
  }

  try {
    let needsUpdate = false
    const updatedEstimate = { ...estimate }

    // 1. Исправление группы (totalPax = 0)
    if (updatedEstimate.group && updatedEstimate.group.totalPax <= 0) {
      console.log(`  🔧 Исправление totalPax с ${updatedEstimate.group.totalPax} на 5`)
      updatedEstimate.group.totalPax = 5
      updatedEstimate.group.doubleCount = 2
      updatedEstimate.group.singleCount = 1
      updatedEstimate.group.guidesCount = 1
      updatedEstimate.group.markup = 15
      needsUpdate = true
    }

    // 2. Исправление отелей
    if (updatedEstimate.hotels && Array.isArray(updatedEstimate.hotels)) {
      updatedEstimate.hotels.forEach((hotel, index) => {
        let hotelFixed = false

        // Исправление отсутствующего названия
        if (!hotel.name) {
          console.log(`  🔧 Исправление названия отеля ${index + 1}`)
          hotel.name = `Отель ${index + 1}`
          hotelFixed = true
        }

        // Исправление отсутствующего города
        if (!hotel.city) {
          console.log(`  🔧 Исправление города отеля ${index + 1}`)
          hotel.city = 'Буэнос-Айрес'
          hotelFixed = true
        }

        // Исправление отсутствующего региона
        if (!hotel.region) {
          console.log(`  🔧 Исправление региона отеля ${index + 1}`)
          hotel.region = 'Буэнос-Айрес'
          hotelFixed = true
        }

        // Исправление отсутствующего типа размещения
        if (!hotel.accommodationType) {
          console.log(`  🔧 Исправление типа размещения отеля ${index + 1}`)
          hotel.accommodationType = 'double'
          hotelFixed = true
        }

        // Исправление количества туристов
        if (!hotel.paxCount || hotel.paxCount <= 0) {
          console.log(`  🔧 Исправление количества туристов отеля ${index + 1}`)
          hotel.paxCount = 2
          hotelFixed = true
        }

        // Исправление цены за номер
        if (!hotel.pricePerRoom || hotel.pricePerRoom <= 0) {
          console.log(`  🔧 Исправление цены отеля ${index + 1}`)
          hotel.pricePerRoom = 100
          hotelFixed = true
        }

        // Исправление количества ночей
        if (!hotel.nights || hotel.nights <= 0) {
          console.log(`  🔧 Исправление количества ночей отеля ${index + 1}`)
          hotel.nights = 3
          hotelFixed = true
        }

        if (hotelFixed) {
          needsUpdate = true
        }
      })
    }

    // 3. Исправление дней тура
    if (updatedEstimate.tourDays && Array.isArray(updatedEstimate.tourDays)) {
      updatedEstimate.tourDays.forEach((day, index) => {
        let dayFixed = false

        // Исправление отсутствующего города
        if (!day.city) {
          console.log(`  🔧 Исправление города дня ${index + 1}`)
          day.city = 'Буэнос-Айрес'
          dayFixed = true
        }

        // Исправление активностей
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach((activity, actIndex) => {
            let activityFixed = false

            // Исправление отсутствующего названия активности
            if (!activity.name) {
              console.log(`  🔧 Исправление названия активности ${actIndex + 1} дня ${index + 1}`)
              activity.name = `Активность ${actIndex + 1}`
              activityFixed = true
            }

            // Исправление стоимости активности
            if (!activity.cost || activity.cost < 0) {
              console.log(`  🔧 Исправление стоимости активности ${actIndex + 1} дня ${index + 1}`)
              activity.cost = 50
              activityFixed = true
            }

            if (activityFixed) {
              dayFixed = true
            }
          })
        }

        if (dayFixed) {
          needsUpdate = true
        }
      })
    }

    // 4. Исправление локации
    if (!updatedEstimate.location.country) {
      console.log(`  🔧 Исправление страны`)
      updatedEstimate.location.country = 'Аргентина'
      needsUpdate = true
    }

    // 5. Обновление в базе данных
    if (needsUpdate) {
      await updateEstimate(updatedEstimate)
      results.fixed = true
    }
  } catch (error) {
    results.errors.push(`System error: ${error.message}`)
  }

  return results
}

/**
 * Обновление сметы в базе данных
 */
function updateEstimate(estimate) {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE estimates SET
        location_data = ?,
        tour_dates_data = ?,
        group_data = ?,
        hotels_data = ?,
        tour_days_data = ?,
        optional_services_data = ?,
        updatedAt = datetime('now')
      WHERE id = ?
    `

    const params = [
      JSON.stringify(estimate.location || {}),
      JSON.stringify(estimate.tourDates || {}),
      JSON.stringify(estimate.group || {}),
      JSON.stringify(estimate.hotels || []),
      JSON.stringify(estimate.tourDays || []),
      JSON.stringify(estimate.optionalServices || []),
      estimate.id,
    ]

    db.run(query, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({ changes: this.changes })
      }
    })
  })
}

/**
 * Вывод результатов исправления
 */
function printResults(results) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ ИСПРАВЛЕНИЯ')
  console.log('='.repeat(60))
  console.log(`Всего смет: ${results.total}`)
  console.log(`Исправлено: ${results.fixed}`)
  console.log(`Не требовали исправления: ${results.total - results.fixed}`)

  if (results.errors.length > 0) {
    console.log('\n🚨 ОШИБКИ ПРИ ИСПРАВЛЕНИИ:')
    results.errors.forEach(({ estimateId, estimateName, errors }) => {
      console.log(`\nСмета ${estimateId} - "${estimateName}":`)
      errors.forEach((error) => console.log(`  ❌ ${error}`))
    })
  }

  if (results.fixed > 0) {
    console.log('\n🎉 ИСПРАВЛЕНИЕ ЗАВЕРШЕНО УСПЕШНО!')
  } else {
    console.log('\n✅ ВСЕ СМЕТЫ УЖЕ В ПОРЯДКЕ')
  }

  console.log('='.repeat(60))
}

/**
 * Запуск исправления
 */
async function main() {
  try {
    const results = await fixEstimateProblems()

    // Закрываем соединение с базой данных
    db.close((err) => {
      if (err) {
        console.error('Ошибка при закрытии базы данных:', err.message)
      } else {
        console.log('✅ Соединение с базой данных закрыто')
      }
    })

    // Возвращаем код выхода
    process.exit(results.errors.length === 0 ? 0 : 1)
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message)
    process.exit(1)
  }
}

// Запускаем исправление
main()

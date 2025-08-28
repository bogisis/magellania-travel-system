// test-all-estimates.js
// Проверка всех смет в базе данных

const http = require('http')

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let data = ''
        res.on('data', (chunk) => {
          data += chunk
        })
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

// Функции расчета (те же, что и в приложении)
function calculateRooms(hotel) {
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
}

function calculateHotelTotal(hotel) {
  const rooms = calculateRooms(hotel)
  return rooms * Number(hotel.pricePerRoom || 0) * Number(hotel.nights || 1)
}

function calculateDayTotal(day) {
  if (!day.activities) return 0
  return day.activities.reduce((sum, activity) => sum + Number(activity.cost || 0), 0)
}

function calculateBaseCost(estimate) {
  const hotelsCost = estimate.hotels
    .filter((hotel) => !hotel.isGuideHotel)
    .reduce((sum, hotel) => sum + calculateHotelTotal(hotel), 0)

  const activitiesCost = estimate.tourDays.reduce((sum, day) => {
    return sum + calculateDayTotal(day)
  }, 0)

  const optionalServicesCost = estimate.optionalServices.reduce((sum, service) => {
    return sum + Number(service.price || service.cost || 0)
  }, 0)

  return hotelsCost + activitiesCost + optionalServicesCost
}

function calculateMarginAmount(estimate) {
  const baseCost = calculateBaseCost(estimate)
  return (baseCost * Number(estimate.group.markup || 0)) / 100
}

function calculateFinalCost(estimate) {
  const baseCost = calculateBaseCost(estimate)
  const marginAmount = calculateMarginAmount(estimate)
  return baseCost + marginAmount
}

async function testAllEstimates() {
  try {
    console.log('🧮 Проверка всех смет в базе данных...')
    console.log('='.repeat(60))

    // Получаем список всех смет
    const estimates = await makeRequest('http://localhost:3001/api/estimates')

    console.log(`📋 Найдено смет: ${estimates.length}`)
    console.log('')

    let totalErrors = 0
    let totalWarnings = 0

    for (const estimate of estimates) {
      console.log(`🔍 Проверка сметы ID ${estimate.id}: ${estimate.name}`)

      const baseCost = calculateBaseCost(estimate)
      const marginAmount = calculateMarginAmount(estimate)
      const finalCost = calculateFinalCost(estimate)

      console.log(`   💰 Базовая стоимость: $${baseCost}`)
      console.log(`   📈 Маржа: $${marginAmount}`)
      console.log(`   💵 Финальная стоимость: $${finalCost}`)

      // Проверяем на ошибки
      const errors = []
      const warnings = []

      if (baseCost <= 0) {
        errors.push('Базовая стоимость должна быть больше 0')
      }

      if (finalCost <= 0) {
        errors.push('Финальная стоимость должна быть больше 0')
      }

      if (baseCost > 1000000) {
        warnings.push('Базовая стоимость подозрительно высока (>$1M)')
      }

      if (finalCost > 1000000) {
        warnings.push('Финальная стоимость подозрительно высока (>$1M)')
      }

      if (errors.length > 0) {
        console.log(`   ❌ Ошибки: ${errors.join(', ')}`)
        totalErrors++
      }

      if (warnings.length > 0) {
        console.log(`   ⚠️ Предупреждения: ${warnings.join(', ')}`)
        totalWarnings++
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log(`   ✅ Смета корректна`)
      }

      console.log('')
    }

    console.log('='.repeat(60))
    console.log('📊 ИТОГОВЫЕ РЕЗУЛЬТАТЫ:')
    console.log(`   Всего смет: ${estimates.length}`)
    console.log(`   Ошибок: ${totalErrors}`)
    console.log(`   Предупреждений: ${totalWarnings}`)
    console.log(`   Корректных смет: ${estimates.length - totalErrors}`)

    if (totalErrors === 0) {
      console.log('   🎉 Все сметы прошли проверку!')
    } else {
      console.log('   ⚠️ Найдены проблемы в расчетах')
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке смет:', error.message)
  }
}

// Запускаем проверку
testAllEstimates()

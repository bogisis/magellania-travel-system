#!/usr/bin/env node

/**
 * Скрипт для проверки статуса всех сервисов
 */

const http = require('http')
const https = require('https')

// Функция для проверки HTTP статуса
function checkHttpStatus(url, timeout = 5000) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http
    
    const req = client.get(url, { timeout }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 300
      })
    })

    req.on('error', () => {
      resolve({
        url,
        status: 'ERROR',
        ok: false
      })
    })

    req.on('timeout', () => {
      req.destroy()
      resolve({
        url,
        status: 'TIMEOUT',
        ok: false
      })
    })
  })
}

// Основная функция проверки
async function checkAllServices() {
  console.log('🔍 Проверка статуса сервисов MAGELLANIA Travel System...\n')

  const services = [
    { name: 'Frontend (Vite)', url: 'http://localhost:5173' },
    { name: 'API Server', url: 'http://localhost:3001/api/health' },
    { name: 'API Health Check', url: 'http://localhost:3001/api/health' }
  ]

  const results = await Promise.all(
    services.map(async (service) => {
      const result = await checkHttpStatus(service.url)
      return { ...service, ...result }
    })
  )

  console.log('📊 Результаты проверки:\n')

  results.forEach((service) => {
    const status = service.ok ? '✅' : '❌'
    const statusText = service.ok ? 'РАБОТАЕТ' : 'НЕ РАБОТАЕТ'
    
    console.log(`${status} ${service.name}`)
    console.log(`   URL: ${service.url}`)
    console.log(`   Статус: ${statusText} (${service.status})`)
    console.log('')
  })

  // Общая статистика
  const working = results.filter(r => r.ok).length
  const total = results.length

  console.log(`📈 Общая статистика: ${working}/${total} сервисов работают`)

  if (working === total) {
    console.log('🎉 Все сервисы работают корректно!')
  } else {
    console.log('⚠️ Некоторые сервисы не работают. Проверьте логи.')
  }
}

// Запуск проверки
if (require.main === module) {
  checkAllServices().catch(console.error)
}

module.exports = { checkAllServices, checkHttpStatus }

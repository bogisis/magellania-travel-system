#!/usr/bin/env node

/**
 * Скрипт для автоматического запуска API сервера
 * Используется вместе с Vite для разработки
 */

const { spawn } = require('child_process')
const path = require('path')

// Проверяем, не запущен ли уже API сервер
const isPortInUse = (port) => {
  try {
    require('net').createServer().listen(port).close()
    return false
  } catch (e) {
    return true
  }
}

// Функция для запуска API сервера
function startApiServer() {
  console.log('🚀 Запуск API сервера...')
  
  const apiPath = path.join(__dirname, 'api-server', 'working-server.js')
  
  const apiProcess = spawn('node', [apiPath], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  })

  // Обработка ошибок
  apiProcess.on('error', (error) => {
    console.error('❌ Ошибка запуска API сервера:', error.message)
    process.exit(1)
  })

  // Обработка завершения
  apiProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`❌ API сервер завершился с кодом ${code}`)
      process.exit(code)
    }
  })

  // Обработка сигналов для корректного завершения
  process.on('SIGINT', () => {
    console.log('\n🛑 Остановка API сервера...')
    apiProcess.kill('SIGINT')
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\n🛑 Остановка API сервера...')
    apiProcess.kill('SIGTERM')
    process.exit(0)
  })

  return apiProcess
}

// Основная логика
if (require.main === module) {
  // Проверяем, не занят ли порт 3001
  if (isPortInUse(3001)) {
    console.log('ℹ️ Порт 3001 уже занят. API сервер может быть уже запущен.')
    console.log('🌐 Проверьте: http://localhost:3001/api/health')
  } else {
    startApiServer()
  }
}

module.exports = { startApiServer }

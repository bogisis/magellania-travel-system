#!/usr/bin/env node

/**
 * Скрипт для запуска только API сервера
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Запуск API сервера...')

const apiProcess = spawn('node', ['working-server.js'], {
  cwd: path.join(process.cwd(), 'api-server'),
  stdio: 'inherit'
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

// Обработка ошибок
apiProcess.on('error', (error) => {
  console.error('❌ Ошибка запуска API сервера:', error)
  process.exit(1)
})

apiProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ API сервер завершился с кодом ${code}`)
    process.exit(code)
  }
})

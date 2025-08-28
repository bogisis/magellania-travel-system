#!/usr/bin/env node

/**
 * Простой и надежный запуск MAGELLANIA Travel System
 */

const { spawn } = require('child_process')
const path = require('path')

console.log('🚀 Запуск MAGELLANIA Travel System...')

// Запускаем API сервер
console.log('📡 Запуск API сервера...')
const apiProcess = spawn('node', ['working-server.js'], {
  cwd: path.join(__dirname, 'api-server'),
  stdio: 'inherit',
})

// Ждем 3 секунды и запускаем фронтенд
setTimeout(() => {
  console.log('🌐 Запуск фронтенда...')
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
  })

  // Обработка завершения фронтенда
  frontendProcess.on('close', (code) => {
    console.log(`Фронтенд завершен с кодом ${code}`)
    apiProcess.kill()
    process.exit(code)
  })
}, 3000)

// Обработка завершения API сервера
apiProcess.on('close', (code) => {
  console.log(`API сервер завершен с кодом ${code}`)
  process.exit(code)
})

// Обработка сигналов
process.on('SIGINT', () => {
  console.log('\n🛑 Остановка всех процессов...')
  apiProcess.kill()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Остановка всех процессов...')
  apiProcess.kill()
  process.exit(0)
})

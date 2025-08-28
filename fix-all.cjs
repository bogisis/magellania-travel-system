#!/usr/bin/env node

/**
 * Комплексный скрипт для исправления всех проблем MAGELLANIA Travel System
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔧 MAGELLANIA Travel System - Исправление проблем\n')

// Функция для выполнения команд
function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`)
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd(),
    })
    console.log(`✅ ${description} - УСПЕШНО`)
    return result
  } catch (error) {
    console.log(`❌ ${description} - ОШИБКА: ${error.message}`)
    return null
  }
}

// Функция для остановки процессов
function killProcesses() {
  console.log('🛑 Остановка всех процессов...')

  const processes = ['vite', 'node.*working-server', 'concurrently', 'nodemon']

  processes.forEach((processName) => {
    try {
      execSync(`pkill -f "${processName}"`, { stdio: 'ignore' })
    } catch (error) {
      // Игнорируем ошибки, если процессы не найдены
    }
  })

  console.log('✅ Все процессы остановлены')
}

// Функция для очистки кеша
function clearCache() {
  console.log('🧹 Очистка кеша...')

  const cacheDirs = ['node_modules/.cache', 'dist', '.vite']

  cacheDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      try {
        execSync(`rm -rf ${dir}`)
        console.log(`✅ Удален кеш: ${dir}`)
      } catch (error) {
        console.log(`⚠️ Не удалось удалить: ${dir}`)
      }
    }
  })
}

// Функция для проверки портов
function checkPorts() {
  console.log('🔍 Проверка портов...')

  const ports = [3001, 5173, 5174]

  ports.forEach((port) => {
    try {
      execSync(`lsof -ti:${port}`, { stdio: 'ignore' })
      console.log(`⚠️ Порт ${port} занят`)
    } catch (error) {
      console.log(`✅ Порт ${port} свободен`)
    }
  })
}

// Функция для установки зависимостей
function installDependencies() {
  console.log('📦 Установка зависимостей...')

  // Основные зависимости
  runCommand('npm install', 'Установка основных зависимостей')

  // API сервер зависимости
  if (fs.existsSync('api-server')) {
    console.log('📦 Установка зависимостей API сервера...')
    runCommand('cd api-server && npm install', 'Установка зависимостей API')
  }
}

// Функция для проверки файлов
function checkFiles() {
  console.log('📁 Проверка файлов...')

  const requiredFiles = [
    'package.json',
    'vite.config.js',
    'src/main.js',
    'api-server/working-server.js',
    'api-server/package.json',
  ]

  requiredFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`)
    } else {
      console.log(`❌ ${file} - ОТСУТСТВУЕТ`)
    }
  })
}

// Функция для тестирования API сервера
function testApiServer() {
  console.log('🧪 Тестирование API сервера...')

  return new Promise((resolve) => {
    const apiProcess = spawn('node', ['working-server.js'], {
      cwd: path.join(process.cwd(), 'api-server'),
      stdio: 'pipe',
    })

    let output = ''

    apiProcess.stdout.on('data', (data) => {
      output += data.toString()
      if (output.includes('API сервер запущен')) {
        console.log('✅ API сервер запущен успешно')
        apiProcess.kill()
        resolve(true)
      }
    })

    apiProcess.stderr.on('data', (data) => {
      console.log(`❌ API сервер ошибка: ${data.toString()}`)
    })

    // Таймаут
    setTimeout(() => {
      if (!output.includes('API сервер запущен')) {
        console.log('❌ API сервер не запустился в течение 10 секунд')
        apiProcess.kill()
        resolve(false)
      }
    }, 10000)
  })
}

// Функция для тестирования фронтенда
function testFrontend() {
  console.log('🧪 Тестирование фронтенда...')

  return new Promise((resolve) => {
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
    })

    let output = ''

    frontendProcess.stdout.on('data', (data) => {
      output += data.toString()
      if (output.includes('Local:') && output.includes('http://localhost:')) {
        console.log('✅ Фронтенд запущен успешно')
        frontendProcess.kill()
        resolve(true)
      }
    })

    frontendProcess.stderr.on('data', (data) => {
      console.log(`❌ Фронтенд ошибка: ${data.toString()}`)
    })

    // Таймаут
    setTimeout(() => {
      if (!output.includes('Local:')) {
        console.log('❌ Фронтенд не запустился в течение 15 секунд')
        frontendProcess.kill()
        resolve(false)
      }
    }, 15000)
  })
}

// Основная функция
async function fixAll() {
  console.log('🚀 Начало исправления проблем...\n')

  // 1. Остановка всех процессов
  killProcesses()

  // 2. Проверка файлов
  checkFiles()

  // 3. Проверка портов
  checkPorts()

  // 4. Очистка кеша
  clearCache()

  // 5. Установка зависимостей
  installDependencies()

  // 6. Тестирование API сервера
  console.log('\n🧪 Тестирование компонентов...')
  const apiOk = await testApiServer()

  // 7. Тестирование фронтенда
  const frontendOk = await testFrontend()

  // Результаты
  console.log('\n📊 Результаты диагностики:')
  console.log(`API сервер: ${apiOk ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ'}`)
  console.log(`Фронтенд: ${frontendOk ? '✅ РАБОТАЕТ' : '❌ НЕ РАБОТАЕТ'}`)

  if (apiOk && frontendOk) {
    console.log('\n🎉 Все проблемы исправлены!')
    console.log('\n📋 Следующие шаги:')
    console.log('1. Запустите: npm run dev:full')
    console.log('2. Откройте: http://localhost:5173')
    console.log('3. Проверьте миграцию: http://localhost:5173/migration')
  } else {
    console.log('\n⚠️ Некоторые проблемы остались')
    console.log('\n🔧 Ручные шаги:')
    console.log('1. Проверьте логи выше')
    console.log('2. Убедитесь, что порты 3001 и 5173 свободны')
    console.log('3. Попробуйте запустить компоненты по отдельности')
  }
}

// Запуск
if (require.main === module) {
  fixAll().catch(console.error)
}

module.exports = { fixAll }

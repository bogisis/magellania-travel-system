// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { initializeDatabase } from './services/database.js'
import { ErrorHandler } from './services/errorHandler.js'
import ToastContainer from './components/common/ToastContainer.vue'

import App from './App.vue'
import './style.css'

// Глобальная обработка ошибок
const errorHandler = (error, instance, info) => {
  console.error('Vue Error:', error)
  console.error('Component:', instance)
  console.error('Info:', info)

  // Обрабатываем ошибку через централизованную систему
  ErrorHandler.handle(error, 'vue-error', {
    additionalData: {
      component: instance?.$options?.name || 'unknown',
      info,
    },
  })
}

// Создание приложения
const app = createApp(App)

// Обработчик ошибок
app.config.errorHandler = errorHandler

// Подключение плагинов
app.use(createPinia())
app.use(router)

// Глобальные свойства (если нужны)
app.config.globalProperties.$formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount || 0)
}

app.config.globalProperties.$formatDate = (date, options = {}) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

// Глобальные методы для обработки ошибок
app.config.globalProperties.$handleError = ErrorHandler.handle
app.config.globalProperties.$createError = ErrorHandler.createError

// Инициализация приложения
async function initApp() {
  try {
    console.log('🚀 Инициализация MAGELLANIA Travel System...')

    // Инициализация базы данных
    await initializeDatabase()
    console.log('✅ База данных инициализирована')

    // Монтирование приложения
    app.mount('#app')
    console.log('✅ Приложение запущено успешно')
  } catch (error) {
    console.error('❌ Ошибка инициализации приложения:', error)

    // Обрабатываем ошибку через централизованную систему
    ErrorHandler.handle(error, 'app-init', {
      severity: 'critical',
    })

    // Показываем ошибку пользователю
    document.getElementById('app').innerHTML = `
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        height: 100vh; 
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 20px;
        background: #f9fafb;
      ">
        <div style="
          background: white; 
          padding: 40px; 
          border-radius: 12px; 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        ">
          <h1 style="color: #ef4444; margin-bottom: 16px; font-size: 24px;">
            Ошибка загрузки приложения
          </h1>
          <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.5;">
            Не удалось инициализировать MAGELLANIA Travel System. 
            Пожалуйста, обновите страницу или обратитесь к администратору.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #0ea5e9; 
              color: white; 
              padding: 12px 24px; 
              border: none; 
              border-radius: 8px; 
              font-weight: 500;
              cursor: pointer;
              transition: background-color 0.2s;
            "
            onmouseover="this.style.background='#0284c7'"
            onmouseout="this.style.background='#0ea5e9'"
          >
            Обновить страницу
          </button>
          <div style="margin-top: 20px; padding: 12px; background: #fef2f2; border-radius: 6px;">
            <code style="color: #dc2626; font-size: 12px; word-break: break-all;">
              ${error.message}
            </code>
          </div>
        </div>
      </div>
    `
  }
}

// Запуск приложения
initApp()

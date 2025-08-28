// src/main-simple.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { initializeSimpleDatabase } from './services/database-simple.js'
import ToastContainer from './components/common/ToastContainer.vue'

import App from './App.vue'
import './style.css'

// Создание приложения
const app = createApp(App)

// Подключение плагинов
app.use(createPinia())
app.use(router)

// Глобальные свойства
app.config.globalProperties.$formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU').format(amount || 0)
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

// Инициализация приложения
async function initSimpleApp() {
  try {
    console.log('🚀 Инициализация MAGELLANIA Travel System (упрощенная версия)...')

    // Инициализация упрощенной базы данных
    await initializeSimpleDatabase()
    console.log('✅ База данных инициализирована')

    // Монтирование приложения
    app.mount('#app')
    console.log('✅ Приложение запущено успешно')
  } catch (error) {
    console.error('❌ Ошибка инициализации приложения:', error)

    // Простое отображение ошибки
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
          max-width: 600px;
        ">
          <h1 style="color: #ef4444; margin-bottom: 16px; font-size: 24px;">
            Ошибка загрузки приложения
          </h1>
          <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.5;">
            Не удалось инициализировать MAGELLANIA Travel System.
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
initSimpleApp()

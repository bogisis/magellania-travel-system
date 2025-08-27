# 🚀 Система управления турами Magellania - Руководство по развертыванию

## 📋 Краткое описание

Magellania Travel System — это современная система управления сметами для турагентств, построенная на Vue.js 3 с использованием лучших практик веб-разработки.

### ✨ Ключевые возможности

- **Создание и редактирование смет** с интуитивным интерфейсом
- **Drag & Drop** для изменения порядка дней и активностей
- **Автоматические расчеты** стоимости с настраиваемой наценкой
- **Опциональные услуги** с возможностью добавления в смету
- **Экспорт в PDF/Excel/CSV** для отправки клиентам
- **Красивые коммерческие предложения** с фирменным дизайном
- **Офлайн работа** благодаря IndexedDB и PWA
- **Адаптивный дизайн** для работы на любых устройствах

---

## 🛠️ Технологический стек

### Frontend
- **Vue.js 3** - прогрессивный JavaScript фреймворк
- **Vite** - быстрый инструмент сборки
- **Pinia** - управление состоянием
- **Vue Router** - маршрутизация
- **Tailwind CSS** - utility-first CSS фреймворк
- **VueUse** - коллекция композиций для Vue

### База данных и хранение
- **IndexedDB** - клиентская база данных
- **Dexie.js** - оболочка для IndexedDB
- **LocalStorage** - кеширование настроек

### Дополнительные библиотеки
- **Lucide Vue** - современные иконки
- **date-fns** - работа с датами
- **jsPDF + html2canvas** - генерация PDF
- **Chart.js** - графики и диаграммы

---

## 🚀 Быстрый старт

### Шаг 1: Создание проекта

```bash
# Создаем новый Vue проект
npm create vue@latest magellania-tour-system

# Переходим в папку проекта
cd magellania-tour-system

# Устанавливаем основные зависимости
npm install
```

### Шаг 2: Установка дополнительных зависимостей

```bash
# Основные зависимости
npm install pinia @vueuse/core dexie date-fns lucide-vue-next vue-draggable-plus

# Библиотеки для экспорта
npm install jspdf html2canvas papaparse

# Графики и диаграммы
npm install chart.js vue-chartjs

# Стили
npm install tailwindcss autoprefixer postcss

# Инструменты разработки
npm install -D @tailwindcss/forms @tailwindcss/typography prettier eslint
```

### Шаг 3: Конфигурация Tailwind CSS

```bash
# Инициализируем Tailwind
npx tailwindcss init -p
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: {
          500: '#f59e0b',
          600: '#d97706',
        },
        success: {
          500: '#10b981',
          600: '#059669',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'accent': ['Playfair Display', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
```

### Шаг 4: Настройка Vite

**vite.config.js:**
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Шаг 5: Создание структуры папок

```bash
# Создаем структуру папок
mkdir -p src/{components/{common,layout,estimate,dashboard},composables,services,stores,pages,router,utils,assets/{css,images}}

# Создаем основные файлы
touch src/main.js src/App.vue
touch src/assets/css/main.css
```

### Шаг 6: Базовая настройка

**src/main.js:**
```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/css/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
```

**src/assets/css/main.css:**
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Ваши дополнительные стили из брендбука */
```

---

## 🏗️ Пошаговая реализация компонентов

### Этап 1: Базовая архитектура (1-2 недели)

#### 1.1 Создание Store'ов
Скопируйте код из артефакта "Pinia Stores" в соответствующие файлы:
- `src/stores/estimateStore.js`
- `src/stores/toastStore.js`
- `src/stores/settingsStore.js`

#### 1.2 Создание сервисов
Скопируйте код из артефакта "Бизнес-сервисы":
- `src/services/dbService.js`
- `src/services/calculationService.js`
- `src/services/currencyService.js`
- `src/services/exportService.js`

#### 1.3 Создание роутера
Скопируйте конфигурацию из артефакта "Vue Router":
- `src/router/index.js`

#### 1.4 Создание composables
Скопируйте composables из соответствующего артефакта:
- `src/composables/useEstimates.js`
- `src/composables/useCalculations.js`
- Остальные composables по необходимости

### Этап 2: Базовые компоненты (2-3 недели)

#### 2.1 Компоненты макета
```bash
# Создайте компоненты из артефакта "Стартовые Vue-компоненты"
touch src/components/layout/AppHeader.vue
touch src/components/layout/AppNavigation.vue
```

#### 2.2 Основные страницы
```bash
# Создайте основные страницы
touch src/pages/HomePage.vue
touch src/pages/EstimatesPage.vue
touch src/pages/EstimateEditor.vue
```

#### 2.3 Базовые компоненты
```bash
# Общие компоненты
touch src/components/common/ToastContainer.vue
touch src/components/common/BaseButton.vue
touch src/components/common/BaseInput.vue
```

### Этап 3: Функциональность смет (3-4 недели)

#### 3.1 Компоненты редактора смет
Реализуйте компоненты из артефакта "Стартовые Vue-компоненты":
- `TourInfoForm.vue`
- `DaySection.vue`  
- `ActivityRow.vue`

#### 3.2 Drag & Drop функциональность
```javascript
// Используйте vue-draggable-plus для реализации перетаскивания
npm install vue-draggable-plus

// В компоненте DaySection.vue
import { VueDraggable } from 'vue-draggable-plus'
```

#### 3.3 Автосохранение
```javascript
// В composables/useAutoSave.js
import { useDebounce } from './useDebounce'

export function useAutoSave(data, saveFunction, delay = 2000) {
  const debouncedData = useDebounce(data, delay)
  
  watch(debouncedData, async (newValue) => {
    if (newValue) {
      await saveFunction(newValue)
    }
  })
}
```

### Этап 4: Расширенная функциональность (4-6 недель)

#### 4.1 Опциональные услуги
```bash
# Создайте компоненты каталога услуг
touch src/components/optional-services/ServiceCatalog.vue
touch src/components/optional-services/ServiceCard.vue
touch src/pages/OptionalServicesPage.vue
```

#### 4.2 Предпросмотр и экспорт
```javascript
// Установите библиотеки для экспорта
npm install jspdf html2canvas

// Создайте компонент предпросмотра
touch src/components/preview/PrintPreview.vue
touch src/pages/PreviewPage.vue
```

#### 4.3 Статистика и аналитика
```javascript
// Установите Chart.js для графиков
npm install chart.js vue-chartjs

// Создайте компоненты dashboard'а
touch src/components/dashboard/DashboardStats.vue
touch src/components/dashboard/RevenueChart.vue
```

---

## 🎨 Применение дизайн-системы

### Использование брендбука

1. **Цвета**: Используйте CSS переменные из базового файла стилей
2. **Типографика**: Применяйте классы из Tailwind CSS
3. **Компоненты**: Следуйте примерам из артефакта с React-компонентами
4. **Анимации**: Используйте классы анимаций из базового CSS

### Пример применения стилей

```vue
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">
      Название компонента
    </h2>
    
    <button class="btn btn-primary">
      <Plus :size="16" />
      Добавить
    </button>
  </div>
</template>

<style scoped>
.btn-primary {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium;
  @apply hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5;
  @apply flex items-center gap-2;
}
</style>
```

---

## 📱 PWA и мобильная адаптация

### Настройка PWA

**public/manifest.json:**
```json
{
  "name": "Magellania Travel System",
  "short_name": "Magellania",
  "description": "Система управления сметами туров",
  "theme_color": "#0ea5e9",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker для офлайн работы

```javascript
// src/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('magellania-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/assets/css/main.css',
        '/assets/js/main.js'
      ])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

---

## 🚀 Развертывание

### Локальная разработка

```bash
# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр сборки
npm run preview
```

### Развертывание на Vercel

1. **Подготовка проекта:**
```bash
# Создайте vercel.json в корне проекта
echo '{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}' > vercel.json
```

2. **Развертывание:**
```bash
# Установите Vercel CLI
npm install -g vercel

# Войдите в аккаунт
vercel login

# Разверните проект
vercel --prod
```

### Развертывание на Netlify

```bash
# Сборка проекта
npm run build

# Загрузите папку dist на Netlify
# Или настройте автоматическое развертывание из Git
```

**netlify.toml:**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🧪 Тестирование

### Unit тесты с Vitest

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
  }
})
```

### Пример теста компонента

```javascript
// tests/components/TourInfoForm.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TourInfoForm from '@/components/estimate/TourInfoForm.vue'

describe('TourInfoForm', () => {
  it('renders properly', () => {
    const wrapper = mount(TourInfoForm)
    expect(wrapper.text()).toContain('Название тура')
  })

  it('validates tour name input', async () => {
    const wrapper = mount(TourInfoForm)
    const input = wrapper.find('input[placeholder="Введите название тура"]')
    
    await input.setValue('Тестовый тур')
    expect(wrapper.emitted()).toHaveProperty('update')
  })
})
```

### E2E тесты с Cypress

```javascript
// cypress/e2e/estimate-creation.cy.js
describe('Estimate Creation', () => {
  it('should create a new estimate', () => {
    cy.visit('/')
    cy.contains('Создать новую смету').click()
    cy.get('input[placeholder="Введите название тура"]').type('Тестовый тур')
    cy.get('select').first().select('argentina')
    cy.contains('Сохранить').click()
    cy.contains('Смета успешно сохранена').should('be.visible')
  })
})
```

---

## 🔧 Оптимизация и производительность

### Lazy Loading маршрутов

```javascript
// src/router/index.js
const routes = [
  {
    path: '/',
    component: () => import('@/pages/HomePage.vue')
  },
  {
    path: '/estimates',
    component: () => import('@/pages/EstimatesPage.vue')
  }
]
```

### Кеширование с помощью VueUse

```javascript
// В компоненте
import { useStorage } from '@vueuse/core'

const cachedEstimates = useStorage('estimates-cache', [])
```

### Сжатие и минификация

**vite.config.js:**
```javascript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['date-fns', 'dexie']
        }
      }
    }
  }
})
```

---

## 🐛 Отладка и мониторинг

### Vue DevTools

```bash
# Установите Vue DevTools Extension для браузера
# Или используйте standalone версию
npm install -g @vue/devtools
vue-devtools
```

### Логирование

```javascript
// src/utils/logger.js
export const logger = {
  info: (message, data) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, data)
    }
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error)
    // В продакшене отправляем в Sentry или другой сервис
  }
}
```

### Error Boundaries

```javascript
// src/components/common/ErrorBoundary.vue
<template>
  <div v-if="hasError" class="error-boundary">
    <h2>Что-то пошло не так</h2>
    <p>{{ errorMessage }}</p>
    <button @click="retry">Повторить</button>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error) => {
  hasError.value = true
  errorMessage.value = error.message
  console.error('Error caught by boundary:', error)
  return false
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
}
</script>
```

---

## 📈 Масштабирование и развитие

### Интеграция с внешними API

```javascript
// src/services/apiService.js
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Методы для работы с внешними сервисами
  async getCurrencyRates() {
    return this.request('/currencies/rates')
  }

  async getWeatherForecast(location) {
    return this.request(`/weather/${location}`)
  }
}

export const apiService = new ApiService()
```

### Микрофронтенды

```javascript
// Для больших команд можно разделить на модули
// src/modules/estimates/index.js
export default {
  routes: [...estimateRoutes],
  store: estimateStore,
  components: { TourInfoForm, DaySection }
}
```

### CI/CD Pipeline

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 📚 Дополнительные ресурсы

### Документация
- [Vue.js 3 Official Guide](https://vuejs.org/guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

### Полезные пакеты
- `@vueuse/core` - композиции для Vue
- `vue-draggable-plus` - drag & drop
- `floating-vue` - тултипы и поповеры
- `v-calendar` - календарь и выбор дат
- `vue-toastification` - уведомления

### Инструменты разработки
- **VS Code Extensions:**
  - Vue Language Features (Volar)
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier

---

## 🎯 Заключение

Следуя этому руководству, вы создадите полнофункциональную систему управления турами с современным интерфейсом и всеми необходимыми возможностями. 

Система спроектирована с учетом масштабируемости и легкости поддержки, что позволит вам добавлять новые функции по мере роста бизнеса.

**Следующие шаги:**
1. Создайте базовую структуру проекта
2. Реализуйте core-функциональность по этапам
3. Настройте тестирование и CI/CD
4. Разверните первую версию
5. Собирайте обратную связь и итерируйте

Удачи в разработке! 🚀
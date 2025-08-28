# MAGELLANIA Travel System

Современная система управления туристическим бизнесом с полным циклом работы от создания смет до анализа результатов.

## 🚀 Новые возможности (v2.0)

### ✅ Внедренные улучшения

#### 1. Система миграций базы данных

- **Автоматические миграции** IndexedDB с версионированием
- **Безопасное обновление** схемы без потери данных
- **Контрольные суммы** для проверки целостности резервных копий
- **Автоматическое резервное копирование** каждые 7 дней

#### 2. Централизованная обработка ошибок

- **Единая система** обработки всех типов ошибок
- **Автоматическая классификация** ошибок по типам и серьезности
- **Интеграция с уведомлениями** для пользователя
- **Логирование в систему мониторинга** (готово для Sentry/LogRocket)
- **Глобальные обработчики** необработанных ошибок

#### 3. Система валидации данных

- **Схемы валидации** для всех типов данных
- **Валидация в реальном времени** для форм
- **Интеграция с ErrorHandler** для единообразной обработки
- **Поддержка пользовательских правил** валидации

#### 4. Система уведомлений

- **Красивые toast-уведомления** с анимациями
- **Поддержка действий** в уведомлениях
- **Прогресс-бары** для автоматического закрытия
- **Адаптивный дизайн** для мобильных устройств

#### 5. Улучшенная архитектура

- **Pinia stores** с интеграцией всех систем
- **Компонент Icon** с поддержкой 200+ иконок
- **Улучшенная навигация** с хлебными крошками
- **Обработка состояний загрузки** и ошибок

#### 6. SQLite API сервер

- **Внешняя база данных** SQLite для надежности
- **RESTful API** для всех операций
- **Автоматический запуск** вместе с фронтендом
- **Система миграции** из IndexedDB

## 🛠 Технологический стек

- **Frontend**: Vue.js 3 + Composition API
- **State Management**: Pinia
- **Database**: SQLite (API) + IndexedDB (локальное кеширование)
- **Backend**: Express.js + SQLite
- **Styling**: Tailwind CSS
- **Icons**: Lucide Vue Next
- **Build Tool**: Vite
- **Router**: Vue Router 4

## 📦 Установка и запуск

### 🛠 Разработка (Development)

#### Быстрый старт (рекомендуется)

```bash
# Клонирование репозитория
git clone https://github.com/your-username/magellania-travel-system.git
cd magellania-travel-system

# Установка зависимостей
npm install

# Автоматический запуск фронтенда + API сервера
npm run dev:full
```

#### Альтернативные способы запуска

**Способ 1: Bash скрипт**

```bash
# Сделать скрипт исполняемым (только первый раз)
chmod +x start-dev.sh

# Запуск через скрипт
./start-dev.sh
```

**Способ 2: Отдельные команды**

```bash
# Терминал 1: API сервер
npm run api:dev

# Терминал 2: Фронтенд
npm run dev
```

**Способ 3: Только фронтенд (с прокси на API)**

```bash
npm run dev
```

**Способ 4: Автоматический запуск через скрипт**

```bash
npm run dev:api
```

### 🚀 Продакшен (Production)

#### Вариант 1: PM2 (рекомендуется для VPS/серверов)

```bash
# Установка PM2
npm install -g pm2

# Деплой через скрипт
./deploy.sh

# Или вручную:
npm run build
pm2 start ecosystem.config.js --env production
```

#### Вариант 2: Docker Compose

```bash
# Сборка и запуск контейнеров
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

#### Вариант 3: Ручной деплой

```bash
# Сборка фронтенда
npm run build

# Запуск API сервера
cd api-server
npm install --production
node working-server.js
```

### 📋 Доступные команды

```bash
# Разработка
npm run dev:full    # Запуск фронтенда + API сервера (concurrently)
npm run dev         # Только фронтенд (с прокси на API)
npm run dev:api     # Фронтенд + API через отдельный скрипт
npm run api         # Только API сервер
npm run api:dev     # API сервер с автоперезагрузкой
npm run api:start   # API сервер через отдельный скрипт
npm run status      # Проверка статуса всех сервисов
npm run start       # Алиас для dev:full
```

# Сборка

npm run build # Сборка для продакшена
npm run preview # Предпросмотр сборки

# Разработка

npm run lint # Проверка кода
npm run format # Форматирование кода

# Продакшен

./deploy.sh # Полный деплой через PM2

````

## 🌐 Доступные URL

После запуска будут доступны:

- **Фронтенд**: http://localhost:5173
- **API сервер**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health
- **Миграция БД**: http://localhost:5173/migration

## 🗄 Миграция базы данных

### Автоматическая миграция

1. Откройте http://localhost:5173/migration
2. Проверьте подключение к API серверу
3. Нажмите "Начать миграцию"
4. Дождитесь завершения процесса

### Ручная миграция

```javascript
// В консоли браузера
import { apiService } from '@/services/apiService'
await apiService.migrateFromIndexedDB()
````

## 🏗 Архитектура проекта

```
magellania-travel-system/
├── src/                    # Фронтенд (Vue.js)
│   ├── components/         # Vue компоненты
│   ├── stores/            # Pinia stores
│   ├── services/          # API сервисы
│   ├── views/             # Страницы
│   └── router/            # Маршрутизация
├── api-server/            # Backend (Express.js)
│   ├── working-server.js  # Основной сервер
│   ├── database/          # База данных
│   └── routes/            # API маршруты
├── start-dev.sh           # Скрипт запуска
└── package.json           # Зависимости
```

## 🔧 Основные функции

### Система смет

- ✅ Создание и редактирование смет
- ✅ Валидация данных
- ✅ Автоматический расчет стоимости
- ✅ Управление днями и активностями
- ✅ Система статусов (черновик, отправлено, одобрено)

### Управление клиентами

- ✅ База клиентов B2B и B2C
- ✅ История взаимодействий
- ✅ Сегментация клиентов

### Управление поставщиками

- ✅ База поставщиков услуг
- ✅ Рейтинги и отзывы
- ✅ Условия сотрудничества

### Аналитика

- ✅ Дашборд с ключевыми метриками
- ✅ Отчеты по прибыльности
- ✅ Анализ конверсии

## 🚨 Система обработки ошибок

### Типы ошибок

- **VALIDATION** - Ошибки валидации данных
- **NETWORK** - Сетевые ошибки
- **DATABASE** - Ошибки базы данных
- **AUTH** - Ошибки авторизации
- **PERMISSION** - Ошибки прав доступа
- **BUSINESS_LOGIC** - Ошибки бизнес-логики

### Уровни серьезности

- **LOW** - Информационные сообщения
- **MEDIUM** - Предупреждения
- **HIGH** - Критические ошибки
- **CRITICAL** - Критические системные ошибки

### Использование

```javascript
import { ErrorHandler } from '@/services/errorHandler'

// Обработка ошибки
ErrorHandler.handle(error, 'context', {
  additionalData: {
    /* дополнительные данные */
  },
})

// Создание пользовательской ошибки
const customError = ErrorHandler.createError('Сообщение об ошибке', ErrorTypes.VALIDATION, {
  field: 'name',
})
```

## ✅ Система валидации

### Схемы валидации

```javascript
import { validate, validationSchemas } from '@/utils/validation'

// Валидация данных
const result = validate(data, validationSchemas.estimate)

if (!result.isValid) {
  console.log('Ошибки:', result.errors)
  console.log('Предупреждения:', result.warnings)
}
```

### Создание пользовательской схемы

```javascript
const customSchema = {
  fieldName: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z]+$/,
    validate: (value, data) => {
      // Пользовательская валидация
      return value.length > 0 ? null : 'Поле обязательно'
    },
  },
}
```

## 🔔 Система уведомлений

### Использование в компонентах

```javascript
import { useToastStore } from '@/stores/toastStore'

const toastStore = useToastStore()

// Разные типы уведомлений
toastStore.success('Успех!', 'Операция выполнена')
toastStore.error('Ошибка!', 'Что-то пошло не так')
toastStore.warning('Внимание!', 'Проверьте данные')
toastStore.info('Информация', 'Полезная информация')
toastStore.loading('Загрузка...', 'Пожалуйста, подождите')

// Уведомления с действиями
toastStore.addToast({
  type: 'error',
  title: 'Ошибка сети',
  message: 'Проверьте подключение',
  duration: 0,
  actions: [
    {
      label: 'Повторить',
      action: () => retryOperation(),
    },
  ],
})
```

## 🗄 Система миграций

### Автоматические миграции

База данных автоматически обновляется при изменении версии:

```javascript
// В database.js
this.version(2)
  .stores({
    estimates:
      '++id, name, tourName, country, region, startDate, duration, status, clientId, assignedManager, totalPrice, margin, discount, createdAt, updatedAt, *tags',
  })
  .upgrade((tx) => {
    // Логика миграции данных
    return tx
      .table('estimates')
      .toCollection()
      .modify((estimate) => {
        if (!estimate.tags) estimate.tags = []
      })
  })
```

### Резервное копирование

```javascript
// Создание резервной копии
const backup = await db.createBackup()

// Восстановление из резервной копии
await db.restoreFromBackup(backupId)
```

## 📱 Адаптивность

Система полностью адаптивна и работает на:

- ✅ Десктопах
- ✅ Планшетах
- ✅ Мобильных устройствах

## 🔒 Безопасность

- ✅ Валидация всех пользовательских данных
- ✅ Санитизация HTML-контента
- ✅ Защита от XSS-атак
- ✅ Контрольные суммы для резервных копий

## 🚀 Производительность

- ✅ Ленивая загрузка компонентов
- ✅ Оптимизированные запросы к базе данных
- ✅ Кеширование данных
- ✅ Минификация и сжатие ресурсов

## 📊 Мониторинг

Система готова к интеграции с:

- ✅ Sentry (отслеживание ошибок)
- ✅ LogRocket (аналитика пользователей)
- ✅ Google Analytics
- ✅ Пользовательские метрики

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Если у вас есть вопросы или предложения:

- Создайте Issue в GitHub
- Напишите на email: support@magellania-travel.com
- Документация: [docs.magellania-travel.com](https://docs.magellania-travel.com)

---

**MAGELLANIA Travel System** - Путешествия мечты начинаются здесь! ✈️

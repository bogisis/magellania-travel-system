# Индекс документации MAGELLANIA Travel System

## 🧭 Быстрая навигация

### По категориям

#### 🏗️ Архитектура и дизайн

- [Системная архитектура](./architecture/system-architecture.md) - Общая архитектура системы
- [Дизайн-система](./architecture/design-system.md) - UI/UX стандарты и компоненты
- [Базовые стили](./architecture/base-styles.md) - CSS переменные и утилиты

#### 💻 Разработка

- [Руководство разработчика](./development/developer-guide.md) - Начало работы
- [Компоненты](./development/components.md) - Vue компоненты и их использование
- [Stores (Pinia)](./development/stores.md) - Управление состоянием
- [Router Composables](./development/router-composables.md) - Работа с маршрутизацией

#### 🗄️ База данных

- [Схема базы данных](./database/schema.md) - Структура данных
- [Миграции](./database/migrations.md) - Управление изменениями БД
- [API endpoints](./database/api-endpoints.md) - REST API

#### 💼 Бизнес-логика

- [Бизнес-процессы](./business/processes.md) - Описание процессов
- [Модели данных](./business/data-models.md) - Бизнес-модели
- [Сервисы](./business/services.md) - Бизнес-сервисы

#### 🚀 Развертывание

- [Руководство по развертыванию](./deployment/deployment-guide.md) - Деплой приложения
- [Конфигурация](./deployment/configuration.md) - Настройки
- [Мониторинг](./deployment/monitoring.md) - Отслеживание состояния

---

## 🔍 Поиск по темам

### Vue.js

- [Руководство разработчика](./development/developer-guide.md#vuejs-компоненты)
- [Компоненты](./development/components.md)
- [Stores (Pinia)](./development/stores.md)

### API и Backend

- [API документация](./development/router-composables.md#конфигурация-маршрутов)
- [API endpoints](./database/api-endpoints.md)
- [Системная архитектура](./architecture/system-architecture.md#backend-архитектура)

### База данных

- [Схема базы данных](./database/schema.md)
- [Миграции](./database/migrations.md)
- [Системная архитектура](./architecture/system-architecture.md#архитектура-данных)

### Дизайн и UI

- [Дизайн-система](./architecture/design-system.md)
- [Базовые стили](./architecture/base-styles.md)
- [UX/UI принципы](./architecture/design-system.md#ux-принципы)

### Развертывание

- [Руководство по развертыванию](./deployment/deployment-guide.md)
- [Docker развертывание](./deployment/deployment-guide.md#docker-развертывание)
- [PM2 развертывание](./deployment/deployment-guide.md#pm2-развертывание)

---

## 👥 По уровню опыта

### 🟢 Начинающий

1. [Руководство разработчика](./development/developer-guide.md)
2. [Компоненты](./development/components.md)
3. [Базовые стили](./architecture/base-styles.md)

### 🟡 Средний

1. [Stores (Pinia)](./development/stores.md)
2. [Router Composables](./development/router-composables.md)
3. [Схема базы данных](./database/schema.md)

### 🔴 Продвинутый

1. [Системная архитектура](./architecture/system-architecture.md)
2. [Бизнес-процессы](./business/processes.md)
3. [Миграции](./database/migrations.md)

---

## 🎯 По задачам

### Создание нового компонента

1. [Компоненты](./development/components.md)
2. [Дизайн-система](./architecture/design-system.md)
3. [Базовые стили](./architecture/base-styles.md)

### Добавление новой функции

1. [Руководство разработчика](./development/developer-guide.md)
2. [Stores (Pinia)](./development/stores.md)
3. [Схема базы данных](./database/schema.md)

### Изменение дизайна

1. [Дизайн-система](./architecture/design-system.md)
2. [Базовые стили](./architecture/base-styles.md)
3. [UX/UI принципы](./architecture/design-system.md#ux-принципы)

### Развертывание на сервере

1. [Руководство по развертыванию](./deployment/deployment-guide.md)
2. [Конфигурация](./deployment/configuration.md)
3. [Мониторинг](./deployment/monitoring.md)

---

## 📋 Часто используемые ссылки

### Команды разработки

```bash
npm start              # Запуск фронтенда + API
npm run dev            # Только фронтенд
npm run api            # Только API сервер
npm run build          # Сборка
npm run preview        # Предпросмотр
```

### URL адреса

- **Приложение**: http://localhost:5173
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

### Структура проекта

```
src/
├── components/        # Vue компоненты
├── stores/           # Pinia stores
├── composables/      # Vue composables
├── services/         # API сервисы
├── router/           # Маршрутизация
└── views/            # Страницы
```

---

## 📊 Статистика документации

### Общие показатели

- **Всего файлов**: 12
- **Общий объем**: ~245KB
- **Общее количество строк**: ~7,148

### Детальная статистика по файлам

| Файл                   | Размер | Строк | Описание                 |
| ---------------------- | ------ | ----- | ------------------------ |
| README.md              | 4.4KB  | 127   | Главный файл             |
| INDEX.md               | 7.6KB  | 174   | Индекс навигации         |
| system-architecture.md | 8.1KB  | 203   | Системная архитектура    |
| design-system.md       | 9.5KB  | 383   | Дизайн-система           |
| base-styles.md         | 16KB   | 703   | Базовые стили            |
| developer-guide.md     | 10KB   | 394   | Руководство разработчика |
| components.md          | 20KB   | 449   | Компоненты               |
| stores.md              | 19KB   | 755   | Stores (Pinia)           |
| router-composables.md  | 19KB   | 755   | Router Composables       |
| schema.md              | 14KB   | 424   | Схема базы данных        |
| processes.md           | 12KB   | 371   | Бизнес-процессы          |
| deployment-guide.md    | 13KB   | 580   | Развертывание            |

---

## 📅 Последние изменения

- **2024-08-28**: Создание новой структуры документации
- **2024-08-28**: Добавление руководства разработчика
- **2024-08-28**: Добавление документации по компонентам
- **2024-08-28**: Добавление документации по stores
- **2024-08-28**: Добавление документации по router composables
- **2024-08-28**: Добавление базовых стилей
- **2024-08-28**: Завершение миграции из старой документации

### Планируемые обновления

- [ ] Добавление примеров кода
- [ ] Создание видео-туториалов
- [ ] Интерактивные диаграммы
- [ ] Поиск по документации

---

## 🔧 Как добавить новую документацию

1. Создайте файл в соответствующей папке
2. Следуйте стандартам форматирования
3. Добавьте ссылку в этот индекс
4. Обновите README.md при необходимости

### Стандарты документации

- Используйте Markdown форматирование
- Добавляйте примеры кода
- Включайте скриншоты для UI
- Следуйте структуре заголовков
- Добавляйте метаданные в конце файла

---

## 📞 Поддержка

- **Документация**: [development-wiki/](./)
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Development Team

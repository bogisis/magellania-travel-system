# MAGELLANIA Travel System - Документация

## 🗺️ Обзор проекта

MAGELLANIA Travel System — это современная система управления сметами для турагентств, построенная на Vue.js 3 с использованием лучших практик веб-разработки.

### ✨ Ключевые возможности

- **Создание и редактирование смет** с интуитивным интерфейсом
- **Drag & Drop** для изменения порядка дней и активностей
- **Автоматические расчеты** стоимости с настраиваемой наценкой
- **Опциональные услуги** с возможностью добавления в смету
- **Экспорт в PDF/Excel/CSV** для отправки клиентам
- **Красивые коммерческие предложения** с фирменным дизайном
- **Офлайн работа** благодаря IndexedDB и PWA
- **Адаптивный дизайн** для работы на любых устройствах

### 🛠️ Технологический стек

- **Frontend**: Vue.js 3 + Pinia + Vue Router
- **Backend**: Express.js + SQLite
- **Стили**: Tailwind CSS + CSS Variables
- **Сборка**: Vite
- **База данных**: SQLite (основная) + IndexedDB (кеш)

---

## 📚 Структура документации

### 1. [Архитектура и дизайн](./architecture/)

- [Системная архитектура](./architecture/system-architecture.md)
- [Дизайн-система](./architecture/design-system.md)
- [Базовые стили](./architecture/base-styles.md)

### 2. [Разработка](./development/)

- [Руководство разработчика](./development/developer-guide.md)
- [Компоненты](./development/components.md)
- [Stores (Pinia)](./development/stores.md)
- [Router Composables](./development/router-composables.md)

### 3. [База данных](./database/)

- [Схема базы данных](./database/schema.md)
- [Миграции](./database/migrations.md)
- [API endpoints](./database/api-endpoints.md)

### 4. [Бизнес-логика](./business/)

- [Бизнес-процессы](./business/processes.md)
- [Модели данных](./business/data-models.md)
- [Сервисы](./business/services.md)

### 5. [Развертывание](./deployment/)

- [Руководство по развертыванию](./deployment/deployment-guide.md)
- [Конфигурация](./deployment/configuration.md)
- [Мониторинг](./deployment/monitoring.md)

---

## 🚀 Быстрый старт

### Установка и запуск

```bash
# Клонирование репозитория
git clone <repository-url>
cd magellania-travel-system

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start
```

### Доступные команды

```bash
npm start          # Запуск фронтенда + API сервера
npm run dev        # Только фронтенд
npm run api        # Только API сервер
npm run build      # Сборка для продакшена
npm run preview    # Предпросмотр сборки
```

---

## 📊 Статус проекта

### ✅ Реализовано

- [x] Базовая архитектура Vue.js 3
- [x] Система управления состоянием (Pinia)
- [x] Роутинг и навигация
- [x] Компонентная архитектура
- [x] Дизайн-система и базовые стили
- [x] API сервер на Express.js
- [x] База данных SQLite
- [x] Система уведомлений
- [x] Обработка ошибок
- [x] Валидация данных

### 🚧 В разработке

- [ ] Расширенная аналитика
- [ ] Система отчетов
- [ ] Интеграции с внешними API
- [ ] Мобильное приложение
- [ ] Система уведомлений
- [ ] Многоязычность

### 📅 Планируется

- [ ] TypeScript миграция
- [ ] Unit тесты
- [ ] E2E тесты
- [ ] CI/CD пайплайны
- [ ] Docker контейнеризация
- [ ] Мониторинг и логирование

---

## 📖 Навигация по документации

### Для новых разработчиков

1. Начните с [Руководства разработчика](./development/developer-guide.md)
2. Изучите [Системную архитектуру](./architecture/system-architecture.md)
3. Ознакомьтесь с [Компонентами](./development/components.md)
4. Поняйте [Бизнес-процессы](./business/processes.md)

### Для дизайнеров

1. Изучите [Дизайн-систему](./architecture/design-system.md)
2. Ознакомьтесь с [Базовыми стилями](./architecture/base-styles.md)
3. Поняйте [UX принципы](./architecture/design-system.md#ux-принципы)

### Для DevOps

1. Изучите [Руководство по развертыванию](./deployment/deployment-guide.md)
2. Ознакомьтесь с [Конфигурацией](./deployment/configuration.md)
3. Настройте [Мониторинг](./deployment/monitoring.md)

---

## 🔗 Полезные ссылки

- [Индекс документации](./INDEX.md) - Быстрая навигация
- [Отчет о миграции](./MIGRATION_ANALYSIS.md) - История создания документации
- [GitHub Repository](https://github.com/magellania/travel-system)
- [Демо приложение](https://demo.magellania-travel.com)

---

## 🤝 Вклад в проект

### Сообщения об ошибках

Если вы нашли ошибку, создайте issue в GitHub с подробным описанием:

- Шаги для воспроизведения
- Ожидаемое поведение
- Фактическое поведение
- Скриншоты (если применимо)

### Предложения по улучшению

Мы приветствуем предложения по улучшению! Создайте issue с тегом `enhancement`.

### Разработка

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

---

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](../LICENSE) для подробностей.

---

**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Development Team

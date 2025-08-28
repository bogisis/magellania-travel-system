# Тестирование Magellania Travel System

Этот документ описывает систему автоматизированного тестирования проекта.

## Структура тестов

```
tests/
├── setup.js                    # Глобальные настройки тестов
├── unit/                       # Unit тесты
│   ├── components/            # Тесты компонентов
│   │   ├── BaseButton.test.js
│   │   ├── LocationSelector.test.js
│   │   └── GroupManager.test.js
│   └── services/              # Тесты сервисов
│       └── currencyService.test.js
├── integration/               # Интеграционные тесты
│   └── EstimateCreation.test.js
├── e2e/                      # End-to-End тесты
│   └── estimate-creation.spec.js
└── api/                      # API тесты
    └── estimates.test.js
```

## Типы тестов

### 1. Unit тесты

Тестируют отдельные компоненты и функции в изоляции.

**Компоненты:**

- `BaseButton` - тестирование всех вариантов и состояний кнопки
- `LocationSelector` - тестирование выбора локаций
- `GroupManager` - тестирование управления группами

**Сервисы:**

- `currencyService` - тестирование работы с валютами

### 2. Интеграционные тесты

Тестируют взаимодействие между компонентами.

- `EstimateCreation` - полный процесс создания сметы

### 3. E2E тесты

Тестируют полный пользовательский сценарий в браузере.

- Навигация по приложению
- Заполнение форм
- Сохранение данных
- Экспорт и предварительный просмотр

### 4. API тесты

Тестируют backend endpoints.

- CRUD операции со сметами
- Валидация данных
- Обработка ошибок

## Запуск тестов

### Unit и интеграционные тесты

```bash
# Запуск всех тестов
npm run test

# Запуск с UI интерфейсом
npm run test:ui

# Запуск без UI (для CI)
npm run test:run

# Запуск с покрытием кода
npm run test:coverage
```

### E2E тесты

```bash
# Запуск всех E2E тестов
npm run test:e2e

# Запуск с UI интерфейсом
npm run test:e2e:ui

# Запуск в видимом режиме
npm run test:e2e:headed
```

### Все тесты

```bash
npm run test:all
```

## Настройка окружения

### Для Unit тестов

- Используется `happy-dom` для эмуляции браузера
- Все внешние зависимости замоканы
- Настроены глобальные моки для IndexedDB, localStorage, fetch

### Для E2E тестов

- Используется Playwright
- Автоматически запускает dev сервер
- Поддерживает Chrome, Firefox, Safari

## Покрытие кода

Запустите тесты с покрытием для анализа:

```bash
npm run test:coverage
```

Отчет будет доступен в `coverage/` директории.

## Добавление новых тестов

### Unit тест компонента

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.text()).toContain('Expected text')
  })
})
```

### E2E тест

```javascript
import { test, expect } from '@playwright/test'

test('should do something', async ({ page }) => {
  await page.goto('/')
  await page.click('button')
  await expect(page.locator('.result')).toBeVisible()
})
```

## Лучшие практики

1. **Изоляция тестов** - каждый тест должен быть независимым
2. **Мокирование** - мокайте внешние зависимости
3. **Описательные названия** - используйте понятные названия тестов
4. **AAA паттерн** - Arrange, Act, Assert
5. **Покрытие критических путей** - тестируйте основную функциональность

## Отладка тестов

### Unit тесты

```bash
# Запуск конкретного теста
npm run test BaseButton

# Запуск с отладкой
npm run test -- --reporter=verbose
```

### E2E тесты

```bash
# Запуск в headed режиме для отладки
npm run test:e2e:headed

# Запуск конкретного теста
npm run test:e2e -- --grep "should create estimate"
```

## CI/CD интеграция

Тесты автоматически запускаются в CI/CD pipeline:

- Unit тесты на каждом коммите
- E2E тесты на pull request
- Полный набор тестов перед деплоем

## Мониторинг

Результаты тестов отслеживаются:

- Покрытие кода
- Время выполнения
- Количество проваленных тестов
- Тренды качества кода

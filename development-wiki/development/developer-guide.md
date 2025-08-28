# Руководство разработчика

## 🚀 Начало работы

### Требования

- **Node.js**: версия 18+
- **npm**: версия 8+
- **Git**: последняя версия
- **Браузер**: Chrome, Firefox, Safari (современные версии)

### Установка проекта

```bash
# Клонирование репозитория
git clone <repository-url>
cd magellania-travel-system

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start
```

### Структура проекта

```
magellania-travel-system/
├── src/                    # Исходный код фронтенда
│   ├── components/         # Vue компоненты
│   ├── views/             # Страницы приложения
│   ├── stores/            # Pinia stores
│   ├── services/          # Бизнес-сервисы
│   ├── utils/             # Утилиты
│   ├── router/            # Конфигурация роутинга
│   └── styles/            # Стили
├── api-server/            # Backend API
├── public/                # Статические файлы
├── development-wiki/      # Документация
└── docs and wiki/         # Старая документация
```

## 🛠 Инструменты разработки

### Основные команды

```bash
# Разработка
npm start              # Запуск фронтенда + API
npm run dev            # Только фронтенд
npm run api            # Только API сервер

# Сборка
npm run build          # Сборка для продакшена
npm run preview        # Предпросмотр сборки

# Качество кода
npm run lint           # Проверка кода
npm run format         # Форматирование кода

# Утилиты
npm run status         # Проверка статуса сервисов
```

### Доступные URL

- **Приложение**: http://localhost:5173
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
- **Документация**: http://localhost:5173/docs

## 📝 Стандарты кода

### Vue.js компоненты

#### Структура компонента

````vue
<template>
  <!-- HTML разметка -->
</template>

<script setup>
// Импорты
import { ref, computed, onMounted } from 'vue'
import { useStore } from '@/stores/store'

// Props
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
})

// Emits
const emit = defineEmits(['update', 'delete'])

// Reactive data
const loading = ref(false)
const error = ref(null)

// Computed
const filteredItems = computed(() => {
  return props.items.filter((item) => item.active)
})

// Methods
const handleUpdate = (item) => {
  emit('update', item)
}

// Lifecycle
onMounted(() => {
  // Инициализация
})
</script>

<style scoped>
/* Стили компонента */
</style>

#### Именование компонентов - **Файлы**: PascalCase (например, `UserProfile.vue`) - **Компоненты**:
PascalCase (например, `
<UserProfile />
`) - **Props**: camelCase (например, `userName`) - **Events**: camelCase (например, `userUpdate`)
### JavaScript/TypeScript #### Именование переменных ```javascript // ✅ Правильно const userName =
'John' const isActive = true const userList = [] const handleClick = () => {} // ❌ Неправильно
const user_name = 'John' const is_active = true const userlist = [] const handle_click = () => {}
````

#### Структура функций

```javascript
/**
 * Описание функции
 * @param {string} name - Имя пользователя
 * @param {number} age - Возраст пользователя
 * @returns {Promise<Object>} Данные пользователя
 */
async function getUserData(name, age) {
  try {
    // Логика функции
    const result = await api.getUser(name)
    return result
  } catch (error) {
    console.error('Ошибка получения данных:', error)
    throw error
  }
}
```

### CSS/Styling

#### Tailwind CSS

```vue
<template>
  <!-- Используем Tailwind классы -->
  <div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
    <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      {{ buttonText }}
    </button>
  </div>
</template>
```

#### Кастомные стили

```vue
<style scoped>
/* Используем CSS переменные */
.custom-component {
  color: var(--primary-600);
  padding: var(--space-4);
}

/* Адаптивность */
@media (max-width: 768px) {
  .custom-component {
    padding: var(--space-2);
  }
}
</style>
```

## 🗂 Организация файлов

### Компоненты

```
src/components/
├── common/              # Общие компоненты
│   ├── BaseButton.vue
│   ├── BaseInput.vue
│   ├── BaseModal.vue
│   ├── Icon.vue
│   └── ToastContainer.vue
├── estimates/           # Компоненты смет
│   ├── EstimateCard.vue
│   ├── EstimateForm.vue
│   └── EstimateList.vue
├── clients/             # Компоненты клиентов
│   ├── ClientCard.vue
│   ├── ClientForm.vue
│   └── ClientList.vue
└── suppliers/           # Компоненты поставщиков
    ├── SupplierCard.vue
    ├── SupplierForm.vue
    └── SupplierList.vue
```

### Stores (Pinia)

```
src/stores/
├── estimates.js         # Store для смет
├── clients.js           # Store для клиентов
├── suppliers.js         # Store для поставщиков
├── toastStore.js        # Store для уведомлений
└── index.js             # Главный store
```

### Services

```
src/services/
├── apiService.js        # API клиент
├── database.js          # Работа с базой данных
├── errorHandler.js      # Обработка ошибок
└── validation.js        # Валидация данных
```

## 🔄 Рабочий процесс

### Создание новой функции

1. **Создание ветки**

   ```bash
   git checkout -b feature/new-feature
   ```

2. **Разработка**
   - Создание компонентов
   - Написание бизнес-логики
   - Добавление тестов

3. **Тестирование**

   ```bash
   npm run lint
   npm run test
   ```

4. **Коммит**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push и Pull Request**
   ```bash
   git push origin feature/new-feature
   ```

### Conventional Commits

```bash
# Типы коммитов
feat:     # Новая функция
fix:      # Исправление бага
docs:     # Изменения в документации
style:    # Изменения форматирования
refactor: # Рефакторинг кода
test:     # Добавление тестов
chore:    # Изменения в конфигурации

# Примеры
feat: add user profile component
fix: resolve API connection issue
docs: update installation guide
style: format code with prettier
refactor: simplify authentication logic
test: add unit tests for user service
chore: update dependencies
```

## 🧪 Тестирование

### Unit тесты

```javascript
// tests/components/UserProfile.test.js
import { mount } from '@vue/test-utils'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile', () => {
  it('renders user name correctly', () => {
    const wrapper = mount(UserProfile, {
      props: {
        user: { name: 'John Doe', email: 'john@example.com' },
      },
    })

    expect(wrapper.text()).toContain('John Doe')
  })
})
```

### E2E тесты

```javascript
// tests/e2e/user-flow.spec.js
describe('User Flow', () => {
  it('should create new estimate', () => {
    cy.visit('/estimates')
    cy.get('[data-test="create-estimate"]').click()
    cy.get('[data-test="estimate-name"]').type('Test Estimate')
    cy.get('[data-test="save-estimate"]').click()
    cy.get('[data-test="estimate-list"]').should('contain', 'Test Estimate')
  })
})
```

## 🐛 Отладка

### Vue DevTools

- Установите Vue DevTools в браузере
- Используйте для отладки компонентов и состояния

### Console Debugging

```javascript
// Отладка в компонентах
console.log('Component data:', data)
console.log('Props:', props)

// Отладка в stores
console.log('Store state:', store.$state)
console.log('Store actions:', store.$actions)
```

### Network Debugging

- Используйте Network tab в DevTools
- Проверяйте API запросы и ответы
- Анализируйте ошибки

## 📚 Ресурсы

### Документация

- [Vue.js 3 Guide](https://vuejs.org/guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

### Полезные инструменты

- **Vue DevTools**: Отладка Vue приложений
- **Postman**: Тестирование API
- **VS Code Extensions**: Vue, Tailwind, ESLint

## 🤝 Совместная работа

### Code Review

- Проверяйте код перед merge
- Используйте конструктивную критику
- Обращайте внимание на безопасность

### Документация

- Обновляйте документацию при изменении API
- Добавляйте комментарии к сложному коду
- Документируйте новые компоненты

### Коммуникация

- Используйте GitHub Issues для багов
- Создавайте Pull Requests для новых функций
- Обсуждайте архитектурные решения в Discussions

---

**Версия**: 2.0.0  
**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Development Team

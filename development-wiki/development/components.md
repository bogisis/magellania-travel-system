# Компоненты

## 🧩 Обзор компонентов

MAGELLANIA Travel System использует модульную архитектуру компонентов на основе Vue.js 3 с Composition API.

### Принципы компонентной архитектуры

1. **Единая ответственность** - каждый компонент отвечает за одну функцию
2. **Переиспользование** - компоненты должны быть переиспользуемыми
3. **Пропсы вниз, события вверх** - однонаправленный поток данных
4. **Композиция над наследованием** - использование Composition API

## 📁 Структура компонентов

```
src/components/
├── common/              # Общие компоненты
│   ├── BaseButton.vue
│   ├── BaseInput.vue
│   ├── BaseModal.vue
│   ├── Icon.vue
│   └── ToastContainer.vue
├── layout/              # Компоненты макета
│   ├── AppHeader.vue
│   ├── AppNavigation.vue
│   └── AppLayout.vue
├── estimates/           # Компоненты смет
│   ├── EstimateCard.vue
│   ├── EstimateForm.vue
│   ├── EstimateList.vue
│   └── EstimateDetail.vue
├── clients/             # Компоненты клиентов
│   ├── ClientCard.vue
│   ├── ClientForm.vue
│   └── ClientList.vue
└── suppliers/           # Компоненты поставщиков
    ├── SupplierCard.vue
    ├── SupplierForm.vue
    └── SupplierList.vue
```

## 🎨 Общие компоненты

### BaseButton

```vue
<template>
  <button :class="buttonClasses" :disabled="disabled" @click="handleClick">
    <Icon v-if="icon" :name="icon" :size="iconSize" class="mr-2" />
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'ghost'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: '',
  },
  iconSize: {
    type: Number,
    default: 16,
  },
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : ''

  return `${baseClasses} ${variantClasses[props.variant]} ${sizeClasses[props.size]} ${disabledClasses}`
})

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>
```

### BaseInput

```vue
<template>
  <div class="form-group">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <Icon
        v-if="icon"
        :name="icon"
        :size="16"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
    </div>

    <p v-if="error" class="form-error">{{ error }}</p>
    <p v-if="hint" class="form-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => {
  const baseClasses =
    'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0'
  const iconClasses = props.icon ? 'pl-10' : ''
  const errorClasses = props.error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
  const disabledClasses = props.disabled ? 'bg-gray-50 cursor-not-allowed' : ''

  return `${baseClasses} ${iconClasses} ${errorClasses} ${disabledClasses}`
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleFocus = (event) => {
  emit('focus', event)
}
</script>

<style scoped>
.form-group {
  @apply space-y-1;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
}

.form-error {
  @apply text-sm text-red-600;
}

.form-hint {
  @apply text-sm text-gray-500;
}
</style>
```

### BaseModal

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <!-- Header -->
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="handleClose" aria-label="Закрыть">
              <Icon name="X" :size="20" />
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  closeOnOverlay: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close', 'update:isOpen'])

// Блокировка скролла при открытии модального окна
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  },
)

const handleClose = () => {
  emit('close')
  emit('update:isOpen', false)
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-container {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900;
}

.modal-close {
  @apply p-1 hover:bg-gray-100 rounded-lg transition-colors;
}

.modal-content {
  @apply p-6 overflow-y-auto;
}

.modal-footer {
  @apply flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}
</style>
```

## 🏗 Компоненты макета

### AppHeader

```vue
<template>
  <header class="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
    <div class="container mx-auto px-6 py-6">
      <div class="flex items-center justify-between">
        <!-- Logo и название -->
        <div class="flex items-center space-x-4">
          <div class="text-3xl">🗺️</div>
          <div>
            <h1 class="text-2xl font-bold company-logo">
              {{ companyName }}
            </h1>
            <p class="opacity-90 text-sm">{{ tagline }}</p>
          </div>
        </div>

        <!-- Правая часть -->
        <div class="flex items-center space-x-4">
          <!-- Уведомления -->
          <button
            class="relative p-2 hover:bg-white/20 rounded-lg transition-colors"
            @click="toggleNotifications"
          >
            <Icon name="Bell" :size="20" />
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ unreadCount }}
            </span>
          </button>

          <!-- Пользователь -->
          <div class="flex items-center space-x-3">
            <span class="text-sm opacity-90"> Добро пожаловать, {{ userName }} </span>
            <div
              class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
              @click="toggleUserMenu"
            >
              <Icon name="User" :size="20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import Icon from '@/components/common/Icon.vue'

// Данные компании
const companyName = ref('Magellania Travel System')
const tagline = ref('Профессиональное планирование туристических программ')

// Данные пользователя
const userName = ref('Анна Петрова')
const unreadCount = computed(() => 3) // Заглушка для уведомлений

// Методы
const toggleNotifications = () => {
  // Логика переключения уведомлений
}

const toggleUserMenu = () => {
  // Логика переключения меню пользователя
}
</script>
```

### AppNavigation

```vue
<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="container mx-auto px-6">
      <div class="flex space-x-8">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          :class="navLinkClasses(item.path)"
        >
          <Icon :name="item.icon" :size="18" class="mr-2" />
          {{ item.name }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Icon from '@/components/common/Icon.vue'

const route = useRoute()

const navigationItems = [
  { name: 'Дашборд', path: '/', icon: 'Home' },
  { name: 'Сметы', path: '/estimates', icon: 'FileText' },
  { name: 'Клиенты', path: '/clients', icon: 'Users' },
  { name: 'Поставщики', path: '/suppliers', icon: 'Building' },
  { name: 'Тарифы', path: '/tariffs', icon: 'DollarSign' },
  { name: 'Аналитика', path: '/analytics', icon: 'BarChart3' },
]

const navLinkClasses = (path) => {
  const isActive = route.path === path
  const baseClasses = 'flex items-center px-3 py-4 text-sm font-medium transition-colors'
  const activeClasses = 'text-blue-600 border-b-2 border-blue-600'
  const inactiveClasses = 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'

  return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
}
</script>
```

## 📋 Компоненты смет

### EstimateCard

```vue
<template>
  <div class="estimate-card">
    <!-- Header -->
    <div class="card-header">
      <div class="flex items-center justify-between">
        <h3 class="card-title">{{ estimate.name }}</h3>
        <EstimateStatus :status="estimate.status" />
      </div>
      <p class="card-subtitle">{{ estimate.tourInfo?.tourName }}</p>
    </div>

    <!-- Content -->
    <div class="card-content">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500">Страна:</span>
          <span class="ml-2 font-medium">{{ getCountryName(estimate.tourInfo?.country) }}</span>
        </div>
        <div>
          <span class="text-gray-500">Длительность:</span>
          <span class="ml-2 font-medium">{{ estimate.tourInfo?.duration }} дн.</span>
        </div>
        <div>
          <span class="text-gray-500">Туристы:</span>
          <span class="ml-2 font-medium">{{ estimate.tourInfo?.touristCount }} чел.</span>
        </div>
        <div>
          <span class="text-gray-500">Стоимость:</span>
          <span class="ml-2 font-medium text-green-600">
            {{ formatPrice(estimate.totalPrice) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="card-footer">
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">
          {{ formatDate(estimate.createdAt) }}
        </span>
        <div class="flex space-x-2">
          <BaseButton size="sm" variant="ghost" @click="$emit('view', estimate.id)">
            Просмотр
          </BaseButton>
          <BaseButton size="sm" variant="primary" @click="$emit('edit', estimate.id)">
            Редактировать
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import BaseButton from '@/components/common/BaseButton.vue'
import EstimateStatus from './EstimateStatus.vue'

const props = defineProps({
  estimate: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['view', 'edit'])

const getCountryName = (code) => {
  const countries = {
    argentina: 'Аргентина',
    brazil: 'Бразилия',
    chile: 'Чили',
    peru: 'Перу',
  }
  return countries[code] || code
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(price || 0)
}

const formatDate = (date) => {
  return format(new Date(date), 'dd MMM yyyy', { locale: ru })
}
</script>

<style scoped>
.estimate-card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow;
}

.card-header {
  @apply p-6 border-b border-gray-200;
}

.card-title {
  @apply text-lg font-semibold text-gray-900;
}

.card-subtitle {
  @apply text-sm text-gray-600 mt-1;
}

.card-content {
  @apply p-6;
}

.card-footer {
  @apply p-6 border-t border-gray-200 bg-gray-50;
}
</style>
```

## 🎯 Создание новых компонентов

### Шаблон компонента

```vue
<template>
  <div class="component-name">
    <!-- Содержимое компонента -->
  </div>
</template>

<script setup>
// Импорты
import { ref, computed, onMounted } from 'vue'

// Props
const props = defineProps({
  // Определение props
})

// Emits
const emit = defineEmits(['event-name'])

// Reactive data
const data = ref(null)

// Computed
const computedValue = computed(() => {
  // Логика вычислений
})

// Methods
const handleEvent = () => {
  // Обработка событий
}

// Lifecycle
onMounted(() => {
  // Инициализация
})
</script>

<style scoped>
/* Стили компонента */
</style>
```

### Чек-лист для новых компонентов

- [ ] Следует принципам дизайн-системы
- [ ] Использует стандартные цвета и типографику
- [ ] Поддерживает адаптивность
- [ ] Включает состояния (loading, error, disabled)
- [ ] Документирован с примерами использования
- [ ] Протестирован на разных устройствах
- [ ] Соответствует принципам доступности

---

**Версия**: 2.0.0  
**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Development Team

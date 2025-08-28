# Дизайн-система

## 🎨 Общие принципы

### Философия дизайна

- **Простота**: Минималистичный и чистый дизайн
- **Функциональность**: Каждый элемент имеет четкую цель
- **Консистентность**: Единообразие во всех компонентах
- **Доступность**: Соответствие стандартам WCAG

### Цветовая палитра

#### Основные цвета

```css
/* Primary - Синий */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Secondary - Серый */
--secondary-50: #f9fafb;
--secondary-100: #f3f4f6;
--secondary-500: #6b7280;
--secondary-600: #4b5563;
--secondary-700: #374151;

/* Success - Зеленый */
--success-500: #10b981;
--success-600: #059669;

/* Warning - Желтый */
--warning-500: #f59e0b;
--warning-600: #d97706;

/* Error - Красный */
--error-500: #ef4444;
--error-600: #dc2626;
```

#### Семантические цвета

```css
/* Статусы */
--status-draft: #6b7280; /* Черновик */
--status-sent: #3b82f6; /* Отправлено */
--status-approved: #10b981; /* Одобрено */
--status-rejected: #ef4444; /* Отклонено */

/* Сегменты клиентов */
--segment-premium: #f59e0b; /* Премиум */
--segment-regular: #6b7280; /* Обычный */
--segment-new: #3b82f6; /* Новый */
```

### Типографика

#### Шрифты

```css
/* Основной шрифт */
font-family:
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  sans-serif;

/* Размеры */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
```

#### Иерархия текста

```css
/* Заголовки */
.heading-1 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.2;
}
.heading-2 {
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 1.3;
}
.heading-3 {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
}

/* Текст */
.text-body {
  font-size: 1rem;
  line-height: 1.6;
}
.text-caption {
  font-size: 0.875rem;
  line-height: 1.5;
}
.text-small {
  font-size: 0.75rem;
  line-height: 1.4;
}
```

### Пространство и размеры

#### Spacing система

```css
/* Базовые отступы */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

#### Размеры компонентов

```css
/* Кнопки */
--button-height-sm: 2rem; /* 32px */
--button-height-md: 2.5rem; /* 40px */
--button-height-lg: 3rem; /* 48px */

/* Поля ввода */
--input-height: 2.5rem; /* 40px */
--input-padding: 0.75rem; /* 12px */

/* Карточки */
--card-padding: 1.5rem; /* 24px */
--card-radius: 0.5rem; /* 8px */
```

## 🧩 Компоненты

### Кнопки

#### Основная кнопка

```vue
<template>
  <button class="btn btn-primary">
    <Icon v-if="icon" :name="icon" :size="16" />
    {{ text }}
  </button>
</template>

<style>
.btn {
  @apply inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2;
}
</style>
```

#### Размеры кнопок

```css
.btn-sm {
  @apply px-3 py-1.5 text-sm;
}
.btn-md {
  @apply px-4 py-2 text-base;
}
.btn-lg {
  @apply px-6 py-3 text-lg;
}
```

### Поля ввода

#### Базовое поле

```vue
<template>
  <div class="form-group">
    <label v-if="label" class="form-label">{{ label }}</label>
    <input
      :type="type"
      :placeholder="placeholder"
      class="form-input"
      :class="{ 'form-input-error': hasError }"
    />
    <p v-if="error" class="form-error">{{ error }}</p>
  </div>
</template>

<style>
.form-group {
  @apply space-y-1;
}
.form-label {
  @apply block text-sm font-medium text-gray-700;
}
.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}
.form-input-error {
  @apply border-red-300 focus:ring-red-500 focus:border-red-500;
}
.form-error {
  @apply text-sm text-red-600;
}
</style>
```

### Карточки

#### Базовая карточка

```vue
<template>
  <div class="card">
    <div v-if="title" class="card-header">
      <h3 class="card-title">{{ title }}</h3>
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<style>
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-title {
  @apply text-lg font-semibold text-gray-900;
}

.card-body {
  @apply p-6;
}
</style>
```

### Таблицы

#### Базовая таблица

```vue
<template>
  <div class="table-container">
    <table class="table">
      <thead class="table-header">
        <tr>
          <th v-for="column in columns" :key="column.key" class="table-header-cell">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="table-body">
        <tr v-for="row in data" :key="row.id" class="table-row">
          <td v-for="column in columns" :key="column.key" class="table-cell">
            {{ row[column.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.table-container {
  @apply overflow-x-auto;
}
.table {
  @apply min-w-full divide-y divide-gray-200;
}
.table-header {
  @apply bg-gray-50;
}
.table-header-cell {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}
.table-body {
  @apply bg-white divide-y divide-gray-200;
}
.table-row {
  @apply hover:bg-gray-50;
}
.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
}
</style>
```

## 📱 Адаптивность

### Breakpoints

```css
/* Tailwind CSS breakpoints */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Адаптивные классы

```css
/* Контейнеры */
.container {
  @apply mx-auto px-4;
}
.container-sm {
  @apply max-w-3xl;
}
.container-md {
  @apply max-w-4xl;
}
.container-lg {
  @apply max-w-6xl;
}

/* Сетка */
.grid-responsive {
  @apply grid gap-4;
  @apply sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}
```

## 🎯 Состояния

### Loading состояния

```vue
<template>
  <div class="loading-spinner" v-if="loading">
    <div class="spinner"></div>
    <span class="loading-text">{{ text }}</span>
  </div>
</template>

<style>
.loading-spinner {
  @apply flex items-center justify-center space-x-2 text-gray-500;
}

.spinner {
  @apply w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin;
}

.loading-text {
  @apply text-sm;
}
</style>
```

### Error состояния

```vue
<template>
  <div class="error-state" v-if="error">
    <Icon name="AlertCircle" class="error-icon" />
    <h3 class="error-title">{{ title }}</h3>
    <p class="error-message">{{ message }}</p>
    <button @click="retry" class="btn btn-primary">Повторить</button>
  </div>
</template>

<style>
.error-state {
  @apply flex flex-col items-center justify-center p-8 text-center;
}

.error-icon {
  @apply w-12 h-12 text-red-500 mb-4;
}

.error-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.error-message {
  @apply text-gray-600 mb-4;
}
</style>
```

## 🎨 Темы

### Светлая тема (по умолчанию)

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}
```

### Темная тема (планируется)

```css
[data-theme='dark'] {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-color: #374151;
}
```

## 📋 Чек-лист для разработчиков

### При создании компонента:

- [ ] Использует стандартные цвета из палитры
- [ ] Следует типографической иерархии
- [ ] Имеет правильные отступы (spacing)
- [ ] Поддерживает адаптивность
- [ ] Включает состояния (loading, error, disabled)
- [ ] Соответствует принципам доступности
- [ ] Документирован с примерами

### При использовании компонентов:

- [ ] Проверена консистентность с существующими компонентами
- [ ] Используются правильные размеры и отступы
- [ ] Применены семантические цвета
- [ ] Проверена адаптивность на разных экранах

---

**Версия**: 2.0.0  
**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Design Team

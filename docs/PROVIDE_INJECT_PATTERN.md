# Provide/Inject Pattern в Magellania CRM

## Обзор

Provide/Inject паттерн используется в Vue.js для передачи данных от родительских компонентов к глубоко вложенным дочерним компонентам без необходимости передавать props через каждый промежуточный компонент. Это решает проблему "Prop Drilling".

## Архитектура

### 1. Контекст сметы (`useEstimateContext.js`)

Основной composable, который предоставляет контекст сметы для всего дерева компонентов.

```javascript
// Предоставление контекста в родительском компоненте
const estimateContext = provideEstimateContext(estimate.value)

// Использование контекста в дочерних компонентах
const { estimate, updateField, saveEstimate } = useEstimateContext()
```

### 2. Специализированные composables

Для работы с конкретными частями сметы созданы специализированные composables:

- `useEstimateField(fieldName)` - для работы с отдельными полями
- `useEstimateGroup()` - для работы с группой
- `useEstimateLocation()` - для работы с локацией
- `useEstimateHotels()` - для работы с отелями
- `useEstimateTourDays()` - для работы с днями тура
- `useEstimateOptionalServices()` - для работы с опциональными услугами

## Использование

### В родительском компоненте (EstimateCreator.vue)

```vue
<script setup>
import { provideEstimateContext } from '@/composables/useEstimateContext.js'

// Инициализация сметы
const estimate = ref({...})

// Предоставление контекста для дочерних компонентов
const estimateContext = provideEstimateContext(estimate.value)
</script>

<template>
  <div>
    <!-- Дочерние компоненты автоматически получают доступ к контексту -->
    <EstimateGroup />
    <EstimateLocation />
    <EstimateHotels />
  </div>
</template>
```

### В дочерних компонентах

#### Использование общего контекста

```vue
<script setup>
import { useEstimateContext } from '@/composables/useEstimateContext.js'

const { estimate, updateField, saveEstimate } = useEstimateContext()

const updateName = (name) => {
  updateField('title', name)
}
</script>
```

#### Использование специализированных composables

```vue
<script setup>
import { useEstimateGroup } from '@/composables/useEstimateContext.js'

const { group, updateGroup, updateField } = useEstimateGroup()

const updateTotalPax = (value) => {
  updateField('totalPax', parseInt(value))
}
</script>
```

#### Использование компонента EstimateField

```vue
<template>
  <EstimateField
    field-name="title"
    label="Название сметы"
    placeholder="Введите название"
    :validation="validateTitle"
  />
</template>

<script setup>
const validateTitle = (value) => {
  if (!value || value.trim().length < 3) {
    throw new Error('Название должно содержать минимум 3 символа')
  }
}
</script>
```

## Преимущества

### 1. Устранение Prop Drilling

**До:**
```vue
<!-- EstimateCreator.vue -->
<EstimateForm :estimate="estimate" />

<!-- EstimateForm.vue -->
<EstimateGroup :estimate="estimate" />

<!-- EstimateGroup.vue -->
<GroupField :estimate="estimate" />
```

**После:**
```vue
<!-- EstimateCreator.vue -->
<EstimateForm />

<!-- EstimateForm.vue -->
<EstimateGroup />

<!-- EstimateGroup.vue -->
<GroupField /> <!-- Автоматический доступ к контексту -->
```

### 2. Централизованное управление состоянием

Все изменения сметы проходят через единый контекст, что обеспечивает:
- Консистентность данных
- Легкое отслеживание изменений
- Простую отладку

### 3. Переиспользуемость компонентов

Компоненты становятся более независимыми и могут использоваться в разных контекстах.

### 4. Типобезопасность

Composables предоставляют четкий API с предсказуемым поведением.

## API Reference

### provideEstimateContext(estimate, options)

Предоставляет контекст сметы для дочерних компонентов.

**Параметры:**
- `estimate` (Object) - объект сметы
- `options` (Object) - дополнительные опции

**Возвращает:**
- `context` (Object) - объект контекста с методами и реактивными данными

### useEstimateContext()

Получает контекст сметы в дочерних компонентах.

**Возвращает:**
```javascript
{
  estimate: Ref<Object>,
  isLoading: Ref<Boolean>,
  error: Ref<String>,
  isDirty: ComputedRef<Boolean>,
  updateEstimate: Function,
  saveEstimate: Function,
  updateField: Function,
  updateGroup: Function,
  updateLocation: Function,
  updateHotels: Function,
  updateTourDays: Function,
  updateOptionalServices: Function,
  addHotel: Function,
  removeHotel: Function,
  updateHotel: Function,
  addTourDay: Function,
  removeTourDay: Function,
  updateTourDay: Function,
  addActivity: Function,
  removeActivity: Function,
  updateActivity: Function,
  addOptionalService: Function,
  removeOptionalService: Function,
  updateOptionalService: Function,
  validate: Function,
  clearError: Function,
  resetEstimate: Function
}
```

### useEstimateField(fieldName)

Composable для работы с отдельными полями сметы.

**Параметры:**
- `fieldName` (String) - имя поля

**Возвращает:**
```javascript
{
  value: ComputedRef<any>,
  update: Function
}
```

### useEstimateGroup()

Composable для работы с группой.

**Возвращает:**
```javascript
{
  group: ComputedRef<Object>,
  updateGroup: Function,
  updateField: Function
}
```

## Примеры использования

### Обновление поля сметы

```javascript
const { updateField } = useEstimateContext()

// Обновление одного поля
updateField('title', 'Новое название')

// Обновление нескольких полей
updateField({
  title: 'Новое название',
  description: 'Новое описание'
})
```

### Работа с группой

```javascript
const { group, updateField } = useEstimateGroup()

// Обновление количества участников
updateField('totalPax', 10)

// Обновление всей группы
updateGroup({
  totalPax: 10,
  adults: 8,
  children: 2,
  infants: 0
})
```

### Валидация

```javascript
const { validate } = useEstimateContext()

const isValid = validate()
if (!isValid) {
  console.log('Смета содержит ошибки')
}
```

### Сохранение сметы

```javascript
const { saveEstimate } = useEstimateContext()

try {
  const savedEstimate = await saveEstimate()
  console.log('Смета сохранена:', savedEstimate)
} catch (error) {
  console.error('Ошибка сохранения:', error)
}
```

## Миграция с Prop Drilling

### Шаг 1: Добавить Provide в родительский компонент

```javascript
// EstimateCreator.vue
import { provideEstimateContext } from '@/composables/useEstimateContext.js'

const estimateContext = provideEstimateContext(estimate.value)
```

### Шаг 2: Заменить props на Inject в дочерних компонентах

```javascript
// EstimateGroup.vue
// Удалить props
// const props = defineProps(['estimate'])

// Добавить inject
const { group, updateGroup } = useEstimateGroup()
```

### Шаг 3: Обновить шаблоны

```vue
<!-- Удалить передачу props -->
<!-- <EstimateGroup :estimate="estimate" /> -->

<!-- Оставить без props -->
<EstimateGroup />
```

## Лучшие практики

### 1. Используйте специализированные composables

Вместо использования общего `useEstimateContext()` для всех операций, используйте специализированные composables:

```javascript
// ✅ Хорошо
const { group, updateField } = useEstimateGroup()

// ❌ Плохо
const { estimate, updateField } = useEstimateContext()
updateField('group.totalPax', 10)
```

### 2. Валидируйте данные на уровне composables

```javascript
const updateGroupField = (field, value) => {
  // Валидация перед обновлением
  if (field === 'totalPax' && value < 1) {
    throw new Error('Количество участников должно быть больше 0')
  }
  updateField(field, value)
}
```

### 3. Используйте типизацию

```javascript
// Определите типы для лучшей поддержки IDE
/**
 * @typedef {Object} EstimateGroup
 * @property {number} totalPax
 * @property {number} adults
 * @property {number} children
 * @property {number} infants
 */

/**
 * @param {EstimateGroup} groupData
 */
const updateGroup = (groupData) => {
  // ...
}
```

### 4. Обрабатывайте ошибки

```javascript
const { saveEstimate, error } = useEstimateContext()

const handleSave = async () => {
  try {
    await saveEstimate()
  } catch (err) {
    console.error('Ошибка сохранения:', err)
  }
}
```

## Отладка

### Проверка контекста

```javascript
const context = useEstimateContext()
console.log('Контекст сметы:', context)
```

### Отслеживание изменений

```javascript
import { watch } from 'vue'

const { estimate } = useEstimateContext()

watch(estimate, (newEstimate, oldEstimate) => {
  console.log('Смета изменилась:', { new: newEstimate, old: oldEstimate })
}, { deep: true })
```

### Проверка доступности контекста

```javascript
const context = useEstimateContext()

if (!context) {
  console.error('Контекст сметы недоступен')
}
```

## Заключение

Provide/Inject паттерн значительно упрощает архитектуру компонентов, устраняя необходимость в Prop Drilling и обеспечивая централизованное управление состоянием сметы. Это делает код более читаемым, поддерживаемым и масштабируемым.

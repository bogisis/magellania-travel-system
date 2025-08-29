<!-- src/components/estimates/EstimateField.vue -->
<template>
  <div class="form-field">
    <label v-if="label" :for="fieldId" class="form-label">{{ label }}</label>
    <input
      :id="fieldId"
      v-model="fieldValue"
      :type="type"
      :placeholder="placeholder"
      :class="inputClass"
      :disabled="disabled"
      @input="onInput"
      @blur="onBlur"
    />
    <div v-if="error" class="form-error">{{ error }}</div>
    <div v-if="hint" class="form-hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEstimateField } from '@/composables/useEstimateContext.js'

// Props
const props = defineProps({
  fieldName: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hint: {
    type: String,
    default: ''
  },
  validation: {
    type: Function,
    default: null
  }
})

// Emits
const emit = defineEmits(['update', 'validation-error'])

// Используем composable для работы с полем сметы
const { value: fieldValue, update } = useEstimateField(props.fieldName)

// Локальное состояние для ошибок
const error = ref('')

// Уникальный ID для поля
const fieldId = computed(() => `estimate-field-${props.fieldName}`)

// CSS классы для input
const inputClass = computed(() => {
  const baseClass = 'form-input w-full'
  return error.value ? `${baseClass} border-red-500` : baseClass
})

// Обработчики событий
const onInput = (event) => {
  const value = event.target.value
  
  // Валидация на лету
  if (props.validation) {
    try {
      props.validation(value)
      error.value = ''
    } catch (validationError) {
      error.value = validationError.message
      emit('validation-error', { field: props.fieldName, error: validationError.message })
    }
  }
  
  // Обновляем значение
  update(value)
  emit('update', { field: props.fieldName, value })
}

const onBlur = () => {
  // Дополнительная валидация при потере фокуса
  if (props.validation) {
    try {
      props.validation(fieldValue.value)
      error.value = ''
    } catch (validationError) {
      error.value = validationError.message
      emit('validation-error', { field: props.fieldName, error: validationError.message })
    }
  }
}

// Экспортируем методы для внешнего использования
defineExpose({
  validate: () => {
    if (props.validation) {
      try {
        props.validation(fieldValue.value)
        error.value = ''
        return true
      } catch (validationError) {
        error.value = validationError.message
        return false
      }
    }
    return true
  },
  clearError: () => {
    error.value = ''
  },
  setError: (message) => {
    error.value = message
  }
})
</script>

<style scoped>
.form-field {
  @apply mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-input {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.form-input:disabled {
  @apply bg-gray-100 cursor-not-allowed;
}

.form-error {
  @apply mt-1 text-sm text-red-600;
}

.form-hint {
  @apply mt-1 text-sm text-gray-500;
}
</style>

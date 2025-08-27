<!-- src/components/common/BaseInput.vue -->
<template>
  <div class="space-y-1">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <div
        v-if="$slots.prefix || prefixIcon"
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <component :is="prefixIcon" v-if="prefixIcon" class="h-4 w-4 text-gray-400" />
        <slot name="prefix" />
      </div>

      <input
        :id="inputId"
        ref="inputRef"
        v-model="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :class="inputClasses"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
        @input="emit('input', $event)"
        v-bind="$attrs"
      />

      <div
        v-if="$slots.suffix || suffixIcon"
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <component :is="suffixIcon" v-if="suffixIcon" class="h-4 w-4 text-gray-400" />
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">
      {{ error }}
    </p>

    <p v-else-if="hint" class="text-sm text-gray-500">
      {{ hint }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref, useAttrs } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
  error: String,
  hint: String,
  disabled: Boolean,
  readonly: Boolean,
  required: Boolean,
  prefixIcon: [String, Object],
  suffixIcon: [String, Object],
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'input'])

const attrs = useAttrs()
const inputRef = ref(null)

const inputId = computed(() => {
  return attrs.id || `input-${Math.random().toString(36).substr(2, 9)}`
})

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const inputClasses = computed(() => {
  const base =
    'block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200'

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  }

  const states = {
    error: 'border-red-300 focus:ring-red-500 focus:border-red-500',
    disabled: 'bg-gray-50 text-gray-500 cursor-not-allowed',
    readonly: 'bg-gray-50',
  }

  const prefixPadding = props.prefixIcon || props.$slots.prefix ? 'pl-10' : ''
  const suffixPadding = props.suffixIcon || props.$slots.suffix ? 'pr-10' : ''

  let stateClass = ''
  if (props.error) stateClass = states.error
  else if (props.disabled) stateClass = states.disabled
  else if (props.readonly) stateClass = states.readonly

  return [base, sizes[props.size], stateClass, prefixPadding, suffixPadding]
    .filter(Boolean)
    .join(' ')
})

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>

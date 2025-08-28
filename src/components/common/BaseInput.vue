<!-- src/components/common/BaseInput.vue -->
<template>
  <div class="relative">
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :min="min"
      :max="max"
      :step="step"
      :class="inputClasses"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      @change="$emit('change', $event)"
    />
    
    <div v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
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
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  min: {
    type: [String, Number],
    default: null
  },
  max: {
    type: [String, Number],
    default: null
  },
  step: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'change'])

const inputClasses = computed(() => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0'
  
  if (props.error) {
    return `${baseClasses} border-red-300 focus:border-red-500 focus:ring-red-200`
  }
  
  if (props.disabled) {
    return `${baseClasses} border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed`
  }
  
  return `${baseClasses} border-gray-300 focus:border-primary-500 focus:ring-primary-200`
})
</script>

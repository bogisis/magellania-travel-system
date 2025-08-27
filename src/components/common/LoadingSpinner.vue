<!-- src/components/common/LoadingSpinner.vue -->
<template>
  <div :class="containerClasses">
    <div :class="spinnerClasses">
      <div class="animate-spin rounded-full border-2 border-t-transparent" :class="sizeClasses" />
    </div>
    <p v-if="text" :class="textClasses">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
  },
  text: String,
  overlay: Boolean,
  color: {
    type: String,
    default: 'primary',
  },
})

const containerClasses = computed(() => {
  const base = 'flex flex-col items-center justify-center'

  if (props.overlay) {
    return `${base} fixed inset-0 z-50 bg-white bg-opacity-75`
  }

  return `${base} p-8`
})

const spinnerClasses = computed(() => {
  const colors = {
    primary: 'text-primary-500',
    gray: 'text-gray-400',
    white: 'text-white',
  }

  return colors[props.color] || colors.primary
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  return sizes[props.size]
})

const textClasses = computed(() => {
  const sizes = {
    sm: 'text-xs mt-2',
    md: 'text-sm mt-3',
    lg: 'text-base mt-4',
    xl: 'text-lg mt-4',
  }

  return `text-gray-600 ${sizes[props.size]}`
})
</script>

<!-- src/components/common/ToastContainer.vue -->
<template>
  <div class="fixed top-4 right-4 z-50 space-y-4">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-for="toast in toasts" :key="toast.id" :class="toastClasses(toast.type)">
        <div class="flex">
          <div class="flex-shrink-0">
            <component :is="getIcon(toast.type)" :class="iconClasses(toast.type)" />
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-gray-900">
              {{ toast.title }}
            </p>
            <p v-if="toast.message" class="mt-1 text-sm text-gray-500">
              {{ toast.message }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              @click="removeToast(toast.id)"
              class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-vue-next'

const toasts = ref([])

const toastClasses = (type) => {
  const base =
    'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden'
  const borders = {
    success: 'border-l-4 border-green-400',
    error: 'border-l-4 border-red-400',
    warning: 'border-l-4 border-yellow-400',
    info: 'border-l-4 border-blue-400',
  }

  return `${base} ${borders[type] || borders.info} p-4`
}

const iconClasses = (type) => {
  const colors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  }

  return `h-6 w-6 ${colors[type] || colors.info}`
}

const getIcon = (type) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  return icons[type] || icons.info
}

function addToast(toast) {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast = { ...toast, id }

  toasts.value.push(newToast)

  // Автоматическое удаление через 5 секунд
  setTimeout(() => {
    removeToast(id)
  }, toast.duration || 5000)

  return id
}

function removeToast(id) {
  const index = toasts.value.findIndex((toast) => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Глобальные методы для уведомлений
window.$toast = {
  success: (title, message) => addToast({ type: 'success', title, message }),
  error: (title, message) => addToast({ type: 'error', title, message }),
  warning: (title, message) => addToast({ type: 'warning', title, message }),
  info: (title, message) => addToast({ type: 'info', title, message }),
}

onMounted(() => {
  // Экспортируем методы для использования в других компонентах
  window.addToast = addToast
  window.removeToast = removeToast
})
</script>

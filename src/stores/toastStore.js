// src/stores/toastStore.js

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  // State
  const toasts = ref([])
  const nextId = ref(1)

  // Actions
  function showToast(message, type = 'info', duration = 5000) {
    const toast = {
      id: nextId.value++,
      message,
      type,
      timestamp: Date.now(),
    }

    toasts.value.push(toast)

    // Автоматическое удаление через указанное время
    if (duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, duration)
    }

    return toast.id
  }

  function showSuccess(message, duration = 5000) {
    return showToast(message, 'success', duration)
  }

  function showError(message, duration = 5000) {
    return showToast(message, 'error', duration)
  }

  function showWarning(message, duration = 5000) {
    return showToast(message, 'warning', duration)
  }

  function showInfo(message, duration = 5000) {
    return showToast(message, 'info', duration)
  }

  function removeToast(id) {
    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearToasts() {
    toasts.value = []
  }

  return {
    // State
    toasts,

    // Actions
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearToasts,
  }
})

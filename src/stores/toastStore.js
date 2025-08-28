// src/stores/toastStore.js

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useToastStore = defineStore('toast', () => {
  // Состояние
  const toasts = ref([])
  const maxToasts = 10

  // Вычисляемые свойства
  const activeToasts = computed(() => 
    toasts.value.filter(toast => !toast.isRemoved)
  )

  const hasToasts = computed(() => activeToasts.value.length > 0)

  // Действия
  const addToast = (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newToast = {
      id,
      type: toast.type || 'info',
      title: toast.title || '',
      message: toast.message || '',
      duration: toast.duration || 5000,
      isRemoved: false,
      createdAt: new Date(),
      actions: toast.actions || [],
      ...toast
    }

    toasts.value.unshift(newToast)

    // Ограничиваем количество уведомлений
    if (toasts.value.length > maxToasts) {
      toasts.value = toasts.value.slice(0, maxToasts)
    }

    // Автоудаление через заданное время
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return newToast
  }

  const removeToast = (toastId) => {
    const index = toasts.value.findIndex(toast => toast.id === toastId)
    if (index > -1) {
      toasts.value[index].isRemoved = true
      
      // Удаляем из массива через анимацию
      setTimeout(() => {
        toasts.value.splice(index, 1)
      }, 300)
    }
  }

  const clearAllToasts = () => {
    toasts.value.forEach(toast => {
      toast.isRemoved = true
    })
    
    setTimeout(() => {
      toasts.value = []
    }, 300)
  }

  // Быстрые методы для разных типов уведомлений
  const success = (title, message, options = {}) => {
    return addToast({ 
      type: 'success', 
      title, 
      message, 
      ...options 
    })
  }

  const error = (title, message, options = {}) => {
    return addToast({ 
      type: 'error', 
      title, 
      message, 
      duration: 0, // Ошибки не исчезают автоматически
      ...options 
    })
  }

  const warning = (title, message, options = {}) => {
    return addToast({ 
      type: 'warning', 
      title, 
      message, 
      ...options 
    })
  }

  const info = (title, message, options = {}) => {
    return addToast({ 
      type: 'info', 
      title, 
      message, 
      ...options 
    })
  }

  const loading = (title, message, options = {}) => {
    return addToast({ 
      type: 'loading', 
      title, 
      message, 
      duration: 0, // Loading не исчезает автоматически
      ...options 
    })
  }

  return {
    // Состояние
    toasts,
    
    // Вычисляемые свойства
    activeToasts,
    hasToasts,
    
    // Действия
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    loading
  }
})

<!-- src/components/common/ToastContainer.vue -->
<template>
  <Teleport to="body">
    <div 
      v-if="hasToasts" 
      class="toast-container"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup 
        name="toast" 
        tag="div" 
        class="toast-list"
      >
        <div
          v-for="toast in activeToasts"
          :key="toast.id"
          :class="[
            'toast',
            `toast--${toast.type}`,
            { 'toast--removing': toast.isRemoved }
          ]"
          role="alert"
          :aria-label="`${toast.type} notification: ${toast.title}`"
        >
          <!-- Иконка -->
          <div class="toast__icon">
            <Icon 
              :name="getIconName(toast.type)" 
              :class="`toast__icon--${toast.type}`"
            />
          </div>

          <!-- Контент -->
          <div class="toast__content">
            <h4 v-if="toast.title" class="toast__title">
              {{ toast.title }}
            </h4>
            <p v-if="toast.message" class="toast__message">
              {{ toast.message }}
            </p>
          </div>

          <!-- Действия -->
          <div v-if="toast.actions && toast.actions.length > 0" class="toast__actions">
            <button
              v-for="action in toast.actions"
              :key="action.label"
              @click="handleAction(toast, action)"
              class="toast__action"
              :class="`toast__action--${toast.type}`"
            >
              {{ action.label }}
            </button>
          </div>

          <!-- Кнопка закрытия -->
          <button
            v-if="toast.duration === 0"
            @click="removeToast(toast.id)"
            class="toast__close"
            aria-label="Закрыть уведомление"
          >
            <Icon name="x" />
          </button>

          <!-- Прогресс-бар для автоматического закрытия -->
          <div 
            v-if="toast.duration > 0" 
            class="toast__progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useToastStore } from '@/stores/toastStore'
import Icon from '@/components/common/Icon.vue'

const toastStore = useToastStore()

// Вычисляемые свойства
const hasToasts = computed(() => toastStore.hasToasts)
const activeToasts = computed(() => toastStore.activeToasts)

// Методы
const removeToast = (toastId) => {
  toastStore.removeToast(toastId)
}

const handleAction = (toast, action) => {
  if (action.action && typeof action.action === 'function') {
    action.action()
  }
  removeToast(toast.id)
}

const getIconName = (type) => {
  const icons = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info',
    loading: 'loader-2'
  }
  return icons[type] || 'info'
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: auto;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  min-width: 320px;
  max-width: 480px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.toast--success {
  border-left: 4px solid #10b981;
}

.toast--error {
  border-left: 4px solid #ef4444;
}

.toast--warning {
  border-left: 4px solid #f59e0b;
}

.toast--info {
  border-left: 4px solid #3b82f6;
}

.toast--loading {
  border-left: 4px solid #8b5cf6;
}

.toast--removing {
  opacity: 0;
  transform: translateX(100%);
}

.toast__icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast__icon--success {
  color: #10b981;
}

.toast__icon--error {
  color: #ef4444;
}

.toast__icon--warning {
  color: #f59e0b;
}

.toast__icon--info {
  color: #3b82f6;
}

.toast__icon--loading {
  color: #8b5cf6;
  animation: spin 1s linear infinite;
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  line-height: 1.25;
}

.toast__message {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.toast__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.toast__action {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.toast__action--success {
  color: #10b981;
  border-color: #10b981;
}

.toast__action--success:hover {
  background: #10b981;
  color: white;
}

.toast__action--error {
  color: #ef4444;
  border-color: #ef4444;
}

.toast__action--error:hover {
  background: #ef4444;
  color: white;
}

.toast__action--warning {
  color: #f59e0b;
  border-color: #f59e0b;
}

.toast__action--warning:hover {
  background: #f59e0b;
  color: white;
}

.toast__action--info {
  color: #3b82f6;
  border-color: #3b82f6;
}

.toast__action--info:hover {
  background: #3b82f6;
  color: white;
}

.toast__close {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast__close:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: #e5e7eb;
  animation: progress linear forwards;
}

.toast--success .toast__progress {
  background: #10b981;
}

.toast--error .toast__progress {
  background: #ef4444;
}

.toast--warning .toast__progress {
  background: #f59e0b;
}

.toast--info .toast__progress {
  background: #3b82f6;
}

.toast--loading .toast__progress {
  background: #8b5cf6;
}

/* Анимации */
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Анимации появления/исчезновения */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Адаптивность */
@media (max-width: 640px) {
  .toast-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>

<!-- src/components/common/BaseModal.vue -->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

          <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div v-if="show" :class="modalClasses" @click.stop>
              <!-- Заголовок -->
              <div
                v-if="$slots.header || title"
                class="flex items-center justify-between p-6 border-b border-gray-200"
              >
                <slot name="header">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ title }}
                  </h3>
                </slot>

                <button
                  v-if="closable"
                  @click="close"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <!-- Контент -->
              <div class="p-6">
                <slot />
              </div>

              <!-- Футер -->
              <div
                v-if="$slots.footer"
                class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50"
              >
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value),
  },
  closable: {
    type: Boolean,
    default: true,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close', 'update:show'])

const modalClasses = computed(() => {
  const base =
    'relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all'

  const sizes = {
    sm: 'sm:my-8 sm:w-full sm:max-w-md',
    md: 'sm:my-8 sm:w-full sm:max-w-lg',
    lg: 'sm:my-8 sm:w-full sm:max-w-2xl',
    xl: 'sm:my-8 sm:w-full sm:max-w-4xl',
    full: 'sm:my-8 sm:w-full sm:max-w-6xl',
  }

  return [base, sizes[props.size]].join(' ')
})

function close() {
  emit('close')
  emit('update:show', false)
}

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}

// Блокируем прокрутку при открытом модальном окне
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <!-- Иконка 404 -->
        <div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
          <AlertTriangle class="h-12 w-12 text-red-600" />
        </div>

        <!-- Заголовок -->
        <h1 class="mt-6 text-6xl font-bold text-gray-900">404</h1>
        <h2 class="mt-4 text-2xl font-semibold text-gray-700">Страница не найдена</h2>

        <!-- Описание -->
        <p class="mt-4 text-gray-500">
          Извините, запрашиваемая страница не существует или была перемещена.
        </p>

        <!-- Кнопки действий -->
        <div class="mt-8 space-y-4">
          <router-link
            to="/"
            class="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <Home class="h-5 w-5 mr-2" />
            Вернуться на главную
          </router-link>

          <button
            @click="goBack"
            class="w-full flex justify-center items-center px-4 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            <ArrowLeft class="h-5 w-5 mr-2" />
            Назад
          </button>
        </div>

        <!-- Дополнительные ссылки -->
        <div class="mt-8 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-4">Популярные разделы:</p>
          <div class="flex flex-wrap justify-center gap-4">
            <router-link
              v-for="link in popularLinks"
              :key="link.path"
              :to="link.path"
              class="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200"
            >
              {{ link.name }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const popularLinks = [
  { name: 'Панель управления', path: '/' },
  { name: 'Сметы', path: '/estimates' },
  { name: 'Клиенты', path: '/clients' },
  { name: 'Поставщики', path: '/suppliers' },
  { name: 'Аналитика', path: '/analytics' },
]

function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
/* Дополнительные стили для анимации */
.min-h-screen {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

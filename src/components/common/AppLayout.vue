<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <div class="p-6 border-b">
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">M</span>
          </div>
          <h1 class="text-xl font-bold text-blue-600">MAGELLANIA</h1>
        </div>
        <p class="text-xs text-gray-500 mt-1">Travel System</p>
      </div>

      <nav class="mt-6">
        <router-link
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          :class="{
            'bg-blue-50 text-blue-600 border-r-2 border-blue-600': $route.path === item.path,
          }"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.name }}
        </router-link>
      </nav>
    </aside>

    <!-- Main content -->
    <main class="ml-64">
      <header class="bg-white shadow-sm border-b h-16 flex items-center justify-between px-8">
        <h2 class="text-xl font-semibold text-gray-800">{{ currentPageTitle }}</h2>

        <!-- User menu -->
        <div class="flex items-center gap-4">
          <div class="text-sm text-gray-600">
            {{ user?.name || 'Пользователь' }}
          </div>
          <button
            @click="handleLogout"
            class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Выйти
          </button>
        </div>
      </header>

      <div class="p-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/authService.js'
import { useToastStore } from '@/stores/toastStore.js'

const route = useRoute()
const router = useRouter()
const toastStore = useToastStore()

const user = computed(() => authService.getUser())

const handleLogout = () => {
  authService.logout()
  toastStore.showSuccess('Вы успешно вышли из системы')
  router.push('/login')
}

const navigation = [
  { name: 'Панель управления', path: '/', icon: 'HomeIcon' },
  { name: 'Сметы', path: '/estimates', icon: 'DocumentTextIcon' },
  { name: 'Клиенты', path: '/clients', icon: 'UsersIcon' },
  { name: 'Поставщики', path: '/suppliers', icon: 'BuildingOfficeIcon' },
  { name: 'Тарифы', path: '/tariffs', icon: 'CurrencyDollarIcon' },
  { name: 'Миграция БД', path: '/migration', icon: 'DatabaseIcon' },
]

const currentPageTitle = computed(() => {
  const current = navigation.find((item) => item.path === route.path)
  return current?.name || 'MAGELLANIA Travel'
})
</script>

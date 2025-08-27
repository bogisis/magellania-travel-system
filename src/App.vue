<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Навигационная панель -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <!-- Логотип -->
            <router-link to="/" class="flex-shrink-0 flex items-center">
              <div
                class="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center"
              >
                <span class="text-white font-bold text-sm">M</span>
              </div>
              <span class="ml-3 text-xl font-bold text-gray-900">MAGELLANIA</span>
              <span class="ml-2 text-sm text-gray-500 hidden sm:inline">Travel System</span>
            </router-link>
          </div>

          <!-- Десктопная навигация -->
          <div class="hidden md:flex items-center space-x-4">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.path"
              class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              :class="
                $route.path === item.path
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              "
            >
              <component :is="item.icon" class="w-4 h-4 mr-2" v-if="item.icon !== 'svg'" />
              <svg
                v-else
                class="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.iconPath"
                />
              </svg>
              {{ item.name }}
            </router-link>
          </div>

          <!-- Мобильное меню кнопка -->
          <div class="md:hidden flex items-center">
            <button
              @click="sidebarOpen = !sidebarOpen"
              class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Мобильная боковая панель -->
    <div v-show="sidebarOpen" class="fixed inset-0 z-40 md:hidden" @click="sidebarOpen = false">
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>

      <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div class="absolute top-0 right-0 -mr-12 pt-2">
          <button
            @click="sidebarOpen = false"
            class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <X class="h-6 w-6 text-white" />
          </button>
        </div>

        <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div class="flex-shrink-0 flex items-center px-4">
            <div
              class="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center"
            >
              <span class="text-white font-bold text-sm">M</span>
            </div>
            <span class="ml-3 text-xl font-bold text-gray-900">MAGELLANIA</span>
          </div>

          <nav class="mt-5 px-2 space-y-1">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.path"
              @click="sidebarOpen = false"
              class="group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200"
              :class="
                $route.path === item.path
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              "
            >
              <component :is="item.icon" class="mr-4 h-6 w-6" v-if="item.icon !== 'svg'" />
              <svg
                v-else
                class="mr-4 h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.iconPath"
                />
              </svg>
              {{ item.name }}
            </router-link>
          </nav>
        </div>
      </div>
    </div>

    <!-- Основной контент -->
    <main class="flex-1">
      <div class="py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Хлебные крошки -->
          <nav class="flex mb-6" aria-label="Breadcrumb" v-if="breadcrumbs.length > 1">
            <ol class="inline-flex items-center space-x-1 md:space-x-3">
              <li
                v-for="(crumb, index) in breadcrumbs"
                :key="index"
                class="inline-flex items-center"
              >
                <router-link
                  v-if="index < breadcrumbs.length - 1"
                  :to="crumb.path"
                  class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  <component :is="crumb.icon" class="w-4 h-4 mr-2" v-if="crumb.icon" />
                  {{ crumb.name }}
                </router-link>

                <span v-else class="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {{ crumb.name }}
                </span>

                <ChevronRight
                  v-if="index < breadcrumbs.length - 1"
                  class="w-4 h-4 mx-1 text-gray-400"
                />
              </li>
            </ol>
          </nav>

          <!-- Заголовок страницы -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">
              {{ currentPageTitle }}
            </h1>
          </div>

          <!-- Контент страницы -->
          <router-view />
        </div>
      </div>
    </main>

    <!-- Уведомления -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Menu,
  X,
  ChevronRight,
  BarChart3,
  FileText,
  Users,
  Building,
  DollarSign,
  PieChart,
} from 'lucide-vue-next'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()
const sidebarOpen = ref(false)

const navigation = [
  {
    name: 'Панель управления',
    path: '/',
    icon: BarChart3,
  },
  {
    name: 'Сметы',
    path: '/estimates',
    icon: FileText,
  },
  {
    name: 'Клиенты',
    path: '/clients',
    icon: Users,
  },
  {
    name: 'Поставщики',
    path: '/suppliers',
    icon: Building,
  },
  {
    name: 'Тарифы',
    path: '/tariffs',
    icon: DollarSign,
  },
  {
    name: 'Аналитика',
    path: '/analytics',
    icon: PieChart,
  },
]

const currentPageTitle = computed(() => {
  return route.meta.title || 'MAGELLANIA Travel System'
})

const breadcrumbs = computed(() => {
  const crumbs = [{ name: 'Главная', path: '/', icon: 'Home' }]

  // Добавляем дополнительные крошки для детальных страниц
  if (route.name === 'estimate-create') {
    crumbs.push({ name: 'Создание сметы', path: route.path })
  } else if (route.name === 'estimate-edit') {
    crumbs.push({ name: 'Редактирование сметы', path: route.path })
  } else if (route.name === 'client-create') {
    crumbs.push({ name: 'Добавление клиента', path: route.path })
  }

  return crumbs
})
</script>

<style scoped>
/* Дополнительные стили для навигации */
.router-link-active {
  @apply bg-primary-100 text-primary-700 border border-primary-200;
}

.router-link-exact-active {
  @apply bg-primary-100 text-primary-700 border border-primary-200;
}

/* Анимации для мобильного меню */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from {
  transform: translateX(-100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* Стили для хлебных крошек */
nav[aria-label='Breadcrumb'] ol {
  @apply flex flex-wrap items-center space-x-1 md:space-x-3;
}

nav[aria-label='Breadcrumb'] li:not(:last-child)::after {
  content: '/';
  @apply mx-1 text-gray-400;
}
</style>
Добавляем текущую страницу const currentNav = navigation.find(nav => nav.path === route.path) if
(currentNav && route.path !== '/') { crumbs.push({ name: currentNav.name, path: route.path, icon:
currentNav.icon }) } //

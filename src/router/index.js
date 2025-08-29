// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authService } from '@/services/authService.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        title: 'Вход в систему',
        requiresAuth: false,
      },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: {
        title: 'Панель управления',
        requiresAuth: true,
      },
    },
    {
      path: '/estimates',
      name: 'estimates',
      component: () => import('@/views/EstimatesView.vue'),
      meta: {
        title: 'Управление сметами',
        requiresAuth: true,
      },
    },
    {
      path: '/estimates/create',
      name: 'estimate-create',
      component: () => import('@/pages/EstimateCreatorPage.vue'),
      meta: {
        title: 'Создание сметы',
        requiresAuth: true,
      },
    },
    {
      path: '/estimates/:id/edit',
      name: 'estimate-edit',
      component: () => import('@/pages/EstimateCreatorPage.vue'),
      props: true,
      meta: {
        title: 'Редактирование сметы',
        requiresAuth: true,
      },
    },
    {
      path: '/estimates/:id',
      name: 'estimate-detail',
      component: () => import('@/views/EstimateDetailView.vue'),
      props: true,
      meta: {
        title: 'Детали сметы',
        requiresAuth: true,
      },
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import('@/views/ClientsView.vue'),
      meta: {
        title: 'Управление клиентами',
        requiresAuth: true,
      },
    },
    {
      path: '/clients/create',
      name: 'client-create',
      component: () => import('@/views/ClientCreateView.vue'),
      meta: {
        title: 'Добавление клиента',
        requiresAuth: true,
      },
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: () => import('@/views/SuppliersView.vue'),
      meta: {
        title: 'Управление поставщиками',
        requiresAuth: true,
      },
    },
    {
      path: '/tariffs',
      name: 'tariffs',
      component: () => import('@/views/TariffsView.vue'),
      meta: {
        title: 'Тарифная сетка',
        requiresAuth: true,
      },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/views/AnalyticsView.vue'),
      meta: {
        title: 'Аналитика и отчеты',
        requiresAuth: true,
      },
    },
    {
      path: '/migration',
      name: 'database-migration',
      component: () => import('@/views/DatabaseMigrationView.vue'),
      meta: {
        title: 'Миграция базы данных',
        requiresAuth: false,
      },
    },
    {
      path: '/test-estimate',
      name: 'test-estimate',
      component: () => import('@/pages/TestEstimatePage.vue'),
      meta: {
        title: 'Тестирование смет',
        requiresAuth: false,
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: 'Страница не найдена',
      },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Навигационные хуки
router.beforeEach((to, from, next) => {
  // Обновляем заголовок страницы
  if (to.meta.title) {
    document.title = `${to.meta.title} - MAGELLANIA Travel System`
  }

  // Проверка аутентификации
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    // Если требуется аутентификация, но пользователь не авторизован
    next('/login')
  } else if (to.path === '/login' && authService.isAuthenticated()) {
    // Если пользователь уже авторизован и пытается зайти на страницу входа
    next('/')
  } else {
    next()
  }
})

export default router

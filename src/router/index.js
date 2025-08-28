// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: {
        title: 'Панель управления',
        requiresAuth: false,
      },
    },
    {
      path: '/estimates',
      name: 'estimates',
      component: () => import('@/views/EstimatesView.vue'),
      meta: {
        title: 'Управление сметами',
        requiresAuth: false,
      },
    },
    {
      path: '/estimates/create',
      name: 'estimate-create',
      component: () => import('@/views/EstimateCreateView.vue'),
      meta: {
        title: 'Создание сметы',
        requiresAuth: false,
      },
    },
    {
      path: '/estimates/:id/edit',
      name: 'estimate-edit',
      component: () => import('@/views/EstimateEditView.vue'),
      props: true,
      meta: {
        title: 'Редактирование сметы',
        requiresAuth: false,
      },
    },
    {
      path: '/estimates/:id',
      name: 'estimate-detail',
      component: () => import('@/views/EstimateDetailView.vue'),
      props: true,
      meta: {
        title: 'Детали сметы',
        requiresAuth: false,
      },
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import('@/views/ClientsView.vue'),
      meta: {
        title: 'Управление клиентами',
        requiresAuth: false,
      },
    },
    {
      path: '/clients/create',
      name: 'client-create',
      component: () => import('@/views/ClientCreateView.vue'),
      meta: {
        title: 'Добавление клиента',
        requiresAuth: false,
      },
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: () => import('@/views/SuppliersView.vue'),
      meta: {
        title: 'Управление поставщиками',
        requiresAuth: false,
      },
    },
    {
      path: '/tariffs',
      name: 'tariffs',
      component: () => import('@/views/TariffsView.vue'),
      meta: {
        title: 'Тарифная сетка',
        requiresAuth: false,
      },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/views/AnalyticsView.vue'),
      meta: {
        title: 'Аналитика и отчеты',
        requiresAuth: false,
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

  next()
})

export default router

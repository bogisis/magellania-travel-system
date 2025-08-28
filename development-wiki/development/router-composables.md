# Router Composables

## 🧭 Обзор

Коллекция полезных composables для работы с Vue Router в MAGELLANIA Travel System. Эти composables предоставляют удобные абстракции для навигации, защиты маршрутов и управления состоянием роутера.

## 📁 Структура

```
src/composables/
├── useRouteGuard.js      # Защита маршрутов
├── useNavigation.js      # Навигация
├── useRouteMeta.js       # Метаданные маршрутов
└── useRouteParams.js     # Параметры маршрутов
```

## 🛡️ useRouteGuard

Composable для защиты маршрутов и проверки прав доступа.

```javascript
// src/composables/useRouteGuard.js
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

export function useRouteGuard() {
  const route = useRoute()
  const router = useRouter()
  const userStore = useUserStore()

  // Проверка прав доступа
  const canAccess = computed(() => {
    const requiredRole = route.meta?.requiredRole
    if (!requiredRole) return true
    
    return userStore.hasRole(requiredRole)
  })

  // Проверка разрешений
  const checkPermission = (permission) => {
    return userStore.hasPermission(permission)
  }

  // Защищенная навигация
  const navigateTo = (path, options = {}) => {
    if (!canAccess.value) {
      router.push('/unauthorized')
      return false
    }
    
    router.push(path, options)
    return true
  }

  // Проверка текущего маршрута
  const isCurrentRoute = (path) => {
    return route.path === path
  }

  // Получение параметров маршрута
  const getRouteParam = (key) => {
    return route.params[key]
  }

  // Получение query параметров
  const getQueryParam = (key) => {
    return route.query[key]
  }

  return {
    canAccess,
    checkPermission,
    navigateTo,
    isCurrentRoute,
    getRouteParam,
    getQueryParam
  }
}
```

### Использование

```vue
<template>
  <div>
    <button 
      v-if="canAccess" 
      @click="navigateTo('/admin')"
    >
      Админ панель
    </button>
    
    <div v-if="isCurrentRoute('/estimates')">
      Вы находитесь на странице смет
    </div>
  </div>
</template>

<script setup>
import { useRouteGuard } from '@/composables/useRouteGuard'

const { canAccess, navigateTo, isCurrentRoute } = useRouteGuard()
</script>
```

## 🧭 useNavigation

Composable для удобной навигации по приложению.

```javascript
// src/composables/useNavigation.js
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toastStore'

export function useNavigation() {
  const router = useRouter()
  const toastStore = useToastStore()

  // Навигация назад
  const goBack = (fallbackPath = '/') => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackPath)
    }
  }

  // Навигация вперед
  const goForward = () => {
    router.forward()
  }

  // Навигация к маршруту
  const goTo = (path, options = {}) => {
    try {
      router.push(path, options)
    } catch (error) {
      console.error('Navigation error:', error)
      toastStore.showError('Ошибка навигации')
    }
  }

  // Навигация с заменой
  const replace = (path, options = {}) => {
    try {
      router.replace(path, options)
    } catch (error) {
      console.error('Navigation error:', error)
      toastStore.showError('Ошибка навигации')
    }
  }

  // Навигация с параметрами
  const goToWithParams = (path, params = {}, query = {}) => {
    goTo({ path, params, query })
  }

  // Навигация к смете
  const goToEstimate = (estimateId, action = 'view') => {
    const path = action === 'edit' 
      ? `/estimates/${estimateId}/edit`
      : `/estimates/${estimateId}`
    
    goTo(path)
  }

  // Навигация к клиенту
  const goToClient = (clientId, action = 'view') => {
    const path = action === 'edit'
      ? `/clients/${clientId}/edit`
      : `/clients/${clientId}`
    
    goTo(path)
  }

  // Навигация к поставщику
  const goToSupplier = (supplierId, action = 'view') => {
    const path = action === 'edit'
      ? `/suppliers/${supplierId}/edit`
      : `/suppliers/${supplierId}`
    
    goTo(path)
  }

  return {
    goBack,
    goForward,
    goTo,
    replace,
    goToWithParams,
    goToEstimate,
    goToClient,
    goToSupplier
  }
}
```

### Использование

```vue
<template>
  <div class="navigation-buttons">
    <button @click="goBack()">Назад</button>
    <button @click="goToEstimate(estimateId, 'edit')">
      Редактировать смету
    </button>
    <button @click="goToClient(clientId)">
      Просмотр клиента
    </button>
  </div>
</template>

<script setup>
import { useNavigation } from '@/composables/useNavigation'

const { goBack, goToEstimate, goToClient } = useNavigation()

const estimateId = ref('123')
const clientId = ref('456')
</script>
```

## 📋 useRouteMeta

Composable для работы с метаданными маршрутов.

```javascript
// src/composables/useRouteMeta.js
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useRouteMeta() {
  const route = useRoute()

  // Заголовок страницы
  const pageTitle = computed(() => {
    return route.meta?.title || 'MAGELLANIA Travel System'
  })

  // Иконка страницы
  const pageIcon = computed(() => {
    return route.meta?.icon || '🗺️'
  })

  // Показывать в навигации
  const showInNav = computed(() => {
    return route.meta?.showInNav || false
  })

  // Требуется авторизация
  const requiresAuth = computed(() => {
    return route.meta?.requiresAuth || false
  })

  // Требуется роль
  const requiredRole = computed(() => {
    return route.meta?.requiredRole || null
  })

  // Требуется смета
  const requiresEstimate = computed(() => {
    return route.meta?.requiresEstimate || false
  })

  // Breadcrumbs
  const breadcrumbs = computed(() => {
    return route.meta?.breadcrumbs || []
  })

  // Дополнительные метаданные
  const customMeta = computed(() => {
    return route.meta?.custom || {}
  })

  return {
    pageTitle,
    pageIcon,
    showInNav,
    requiresAuth,
    requiredRole,
    requiresEstimate,
    breadcrumbs,
    customMeta
  }
}
```

### Использование

```vue
<template>
  <div>
    <h1>{{ pageIcon }} {{ pageTitle }}</h1>
    
    <nav v-if="breadcrumbs.length > 0">
      <ol class="breadcrumbs">
        <li v-for="crumb in breadcrumbs" :key="crumb.path">
          <router-link :to="crumb.path">{{ crumb.title }}</router-link>
        </li>
      </ol>
    </nav>
  </div>
</template>

<script setup>
import { useRouteMeta } from '@/composables/useRouteMeta'

const { pageTitle, pageIcon, breadcrumbs } = useRouteMeta()
</script>
```

## 🔧 useRouteParams

Composable для работы с параметрами маршрутов.

```javascript
// src/composables/useRouteParams.js
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useRouteParams() {
  const route = useRoute()
  const router = useRouter()

  // Получение параметра
  const getParam = (key, defaultValue = null) => {
    return route.params[key] || defaultValue
  }

  // Установка параметра
  const setParam = (key, value) => {
    const newParams = { ...route.params, [key]: value }
    router.push({ params: newParams })
  }

  // Получение query параметра
  const getQuery = (key, defaultValue = null) => {
    return route.query[key] || defaultValue
  }

  // Установка query параметра
  const setQuery = (key, value) => {
    const newQuery = { ...route.query, [key]: value }
    router.push({ query: newQuery })
  }

  // Удаление query параметра
  const removeQuery = (key) => {
    const newQuery = { ...route.query }
    delete newQuery[key]
    router.push({ query: newQuery })
  }

  // Очистка всех query параметров
  const clearQuery = () => {
    router.push({ query: {} })
  }

  // Реактивные параметры
  const estimateId = computed(() => getParam('estimateId'))
  const clientId = computed(() => getParam('clientId'))
  const supplierId = computed(() => getParam('supplierId'))
  const action = computed(() => getParam('action', 'view'))

  // Реактивные query параметры
  const searchQuery = computed(() => getQuery('search', ''))
  const sortBy = computed(() => getQuery('sortBy', 'createdAt'))
  const sortOrder = computed(() => getQuery('sortOrder', 'desc'))
  const page = computed(() => parseInt(getQuery('page', '1')))

  // Следим за изменениями параметров
  watch(estimateId, (newId) => {
    if (newId) {
      console.log('Estimate ID changed:', newId)
    }
  })

  watch(searchQuery, (newQuery) => {
    if (newQuery) {
      console.log('Search query changed:', newQuery)
    }
  })

  return {
    // Методы
    getParam,
    setParam,
    getQuery,
    setQuery,
    removeQuery,
    clearQuery,
    
    // Реактивные параметры
    estimateId,
    clientId,
    supplierId,
    action,
    
    // Реактивные query параметры
    searchQuery,
    sortBy,
    sortOrder,
    page
  }
}
```

### Использование

```vue
<template>
  <div>
    <input 
      v-model="searchInput" 
      @input="setQuery('search', searchInput)"
      placeholder="Поиск..."
    />
    
    <select @change="setQuery('sortBy', $event.target.value)">
      <option value="createdAt">По дате</option>
      <option value="name">По названию</option>
      <option value="price">По цене</option>
    </select>
    
    <div v-if="estimateId">
      Редактирование сметы: {{ estimateId }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouteParams } from '@/composables/useRouteParams'

const { estimateId, searchQuery, sortBy, setQuery } = useRouteParams()

const searchInput = ref(searchQuery.value)
</script>
```

## 🛣️ Конфигурация маршрутов

### Основная конфигурация

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useEstimateStore } from '@/stores/estimateStore'
import { useToastStore } from '@/stores/toastStore'

// Lazy loading компонентов
const HomePage = () => import('@/pages/HomePage.vue')
const EstimatesPage = () => import('@/pages/EstimatesPage.vue')
const EstimateEditor = () => import('@/pages/EstimateEditor.vue')
const ClientsPage = () => import('@/pages/ClientsPage.vue')
const SuppliersPage = () => import('@/pages/SuppliersPage.vue')
const AnalyticsPage = () => import('@/pages/AnalyticsPage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'Главная',
      icon: '🏠',
      showInNav: true
    }
  },
  {
    path: '/estimates',
    name: 'Estimates',
    component: EstimatesPage,
    meta: {
      title: 'Сметы',
      icon: '📊',
      showInNav: true
    }
  },
  {
    path: '/estimates/:id?',
    name: 'EstimateEditor',
    component: EstimateEditor,
    meta: {
      title: 'Редактор сметы',
      icon: '✏️',
      showInNav: false,
      requiresEstimate: false
    },
    beforeEnter: (to, from, next) => {
      const estimateStore = useEstimateStore()
      
      if (to.params.id) {
        // Загружаем существующую смету
        const estimate = estimateStore.loadEstimate(to.params.id)
        if (!estimate) {
          const toastStore = useToastStore()
          toastStore.showError('Смета не найдена')
          return next('/estimates')
        }
      } else {
        // Создаем новую смету
        estimateStore.createNewEstimate()
      }
      
      next()
    }
  },
  {
    path: '/clients',
    name: 'Clients',
    component: ClientsPage,
    meta: {
      title: 'Клиенты',
      icon: '👥',
      showInNav: true
    }
  },
  {
    path: '/suppliers',
    name: 'Suppliers',
    component: SuppliersPage,
    meta: {
      title: 'Поставщики',
      icon: '🏢',
      showInNav: true
    }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: AnalyticsPage,
    meta: {
      title: 'Аналитика',
      icon: '📈',
      showInNav: true,
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Глобальные guards
router.beforeEach((to, from, next) => {
  // Установка заголовка страницы
  document.title = to.meta?.title 
    ? `${to.meta.title} - MAGELLANIA Travel System`
    : 'MAGELLANIA Travel System'
  
  // Проверка авторизации
  if (to.meta?.requiresAuth) {
    const userStore = useUserStore()
    if (!userStore.isAuthenticated) {
      return next('/login')
    }
  }
  
  next()
})

export default router
```

## 📋 Чек-лист использования

### При создании нового composable

- [ ] Использует Composition API
- [ ] Возвращает реактивные значения
- [ ] Документирован с примерами
- [ ] Протестирован
- [ ] Следует принципам единой ответственности

### При работе с маршрутами

- [ ] Использует lazy loading для компонентов
- [ ] Настроены метаданные маршрутов
- [ ] Реализована защита маршрутов
- [ ] Обработаны ошибки навигации
- [ ] Настроены breadcrumbs

---

**Версия**: 2.0.0  
**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Development Team

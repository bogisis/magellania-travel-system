<template>
  <div class="database-migration">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">Миграция базы данных</h2>

      <!-- Статус подключения -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-2">
          <div :class="['w-3 h-3 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500']"></div>
          <span class="font-medium">
            {{ isConnected ? 'Подключено к SQLite' : 'Нет подключения к SQLite' }}
          </span>
        </div>

        <button @click="checkConnection" :disabled="loading" class="btn btn-secondary btn-sm">
          <Icon name="RefreshCw" :size="16" />
          Проверить подключение
        </button>
      </div>

      <!-- Информация о базах данных -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- IndexedDB -->
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-2">IndexedDB (текущая)</h3>
          <div class="space-y-1 text-sm text-gray-600">
            <div>Клиенты: {{ indexedDbStats.clients }}</div>
            <div>Поставщики: {{ indexedDbStats.suppliers }}</div>
            <div>Сметы: {{ indexedDbStats.estimates }}</div>
          </div>
        </div>

        <!-- SQLite -->
        <div class="border rounded-lg p-4">
          <h3 class="font-semibold text-gray-900 mb-2">SQLite (новая)</h3>
          <div class="space-y-1 text-sm text-gray-600">
            <div>Клиенты: {{ sqliteStats.clients }}</div>
            <div>Поставщики: {{ sqliteStats.suppliers }}</div>
            <div>Сметы: {{ sqliteStats.estimates }}</div>
          </div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex flex-col sm:flex-row gap-3">
        <button @click="loadStats" :disabled="loading" class="btn btn-secondary">
          <Icon name="BarChart3" :size="16" />
          Обновить статистику
        </button>

        <button @click="startMigration" :disabled="loading || !isConnected" class="btn btn-primary">
          <Icon name="Database" :size="16" />
          Начать миграцию
        </button>

        <button @click="testApiConnection" :disabled="loading" class="btn btn-secondary">
          <Icon name="TestTube" :size="16" />
          Тест API
        </button>
      </div>

      <!-- Прогресс миграции -->
      <div v-if="migrationProgress.show" class="mt-6">
        <div class="bg-gray-100 rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium">{{ migrationProgress.title }}</span>
            <span class="text-sm text-gray-600"
              >{{ migrationProgress.current }}/{{ migrationProgress.total }}</span
            >
          </div>

          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${migrationProgress.percentage}%` }"
            ></div>
          </div>

          <div class="mt-2 text-sm text-gray-600">
            {{ migrationProgress.message }}
          </div>
        </div>
      </div>

      <!-- Результат миграции -->
      <div v-if="migrationResult" class="mt-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 class="font-semibold text-green-900 mb-2">Миграция завершена успешно!</h3>
          <div class="text-sm text-green-700 space-y-1">
            <div>Клиентов перенесено: {{ migrationResult.migrated.clients }}</div>
            <div>Поставщиков перенесено: {{ migrationResult.migrated.suppliers }}</div>
            <div>Смет перенесено: {{ migrationResult.migrated.estimates }}</div>
          </div>
        </div>
      </div>

      <!-- Ошибки -->
      <div v-if="error" class="mt-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="font-semibold text-red-900 mb-2">Ошибка</h3>
          <div class="text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEstimatesApiStore } from '@/stores/estimatesApi'
import { useToastStore } from '@/stores/toastStore'
import Icon from './Icon.vue'

// Stores
const estimatesStore = useEstimatesApiStore()
const toastStore = useToastStore()

// State
const loading = ref(false)
const error = ref(null)
const migrationResult = ref(null)
const migrationProgress = ref({
  show: false,
  title: '',
  message: '',
  current: 0,
  total: 0,
  percentage: 0,
})

const indexedDbStats = ref({
  clients: 0,
  suppliers: 0,
  estimates: 0,
})

const sqliteStats = ref({
  clients: 0,
  suppliers: 0,
  estimates: 0,
})

// Computed
const isConnected = computed(() => estimatesStore.isConnected)

// Methods
const checkConnection = async () => {
  try {
    await estimatesStore.checkConnection()
    if (isConnected.value) {
      toastStore.success('Подключение', 'API сервер доступен')
    } else {
      toastStore.error('Подключение', 'API сервер недоступен')
    }
  } catch (err) {
    toastStore.error('Ошибка', err.message)
  }
}

const loadStats = async () => {
  loading.value = true
  error.value = null

  try {
    // Загружаем статистику IndexedDB
    const { db: oldDb } = await import('@/services/database.js')

    const [clients, suppliers, estimates] = await Promise.all([
      oldDb.clients.count(),
      oldDb.suppliers.count(),
      oldDb.estimates.count(),
    ])

    indexedDbStats.value = { clients, suppliers, estimates }

    // Загружаем статистику SQLite
    if (isConnected.value) {
      const [sqliteClients, sqliteSuppliers, sqliteEstimates] = await Promise.all([
        fetch('http://localhost:3001/api/clients')
          .then((r) => r.json())
          .then((data) => data.length),
        fetch('http://localhost:3001/api/suppliers')
          .then((r) => r.json())
          .then((data) => data.length),
        fetch('http://localhost:3001/api/estimates')
          .then((r) => r.json())
          .then((data) => data.length),
      ])

      sqliteStats.value = {
        clients: sqliteClients,
        suppliers: sqliteSuppliers,
        estimates: sqliteEstimates,
      }
    }

    toastStore.success('Статистика', 'Данные обновлены')
  } catch (err) {
    error.value = err.message
    toastStore.error('Ошибка', err.message)
  } finally {
    loading.value = false
  }
}

const startMigration = async () => {
  if (!isConnected.value) {
    toastStore.error('Ошибка', 'Нет подключения к API серверу')
    return
  }

  loading.value = true
  error.value = null
  migrationResult.value = null

  try {
    // Показываем прогресс
    migrationProgress.value = {
      show: true,
      title: 'Миграция данных',
      message: 'Подготовка к миграции...',
      current: 0,
      total: 100,
      percentage: 0,
    }

    // Запускаем миграцию
    const result = await estimatesStore.migrateFromIndexedDB()

    migrationResult.value = result

    // Обновляем статистику
    await loadStats()

    toastStore.success('Миграция', 'Данные успешно перенесены')
  } catch (err) {
    error.value = err.message
    toastStore.error('Ошибка миграции', err.message)
  } finally {
    loading.value = false
    migrationProgress.value.show = false
  }
}

const testApiConnection = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/health')
    const data = await response.json()

    toastStore.success('API тест', `Сервер работает: ${data.status}`)
  } catch (err) {
    toastStore.error('API тест', 'Сервер недоступен')
  }
}

// Lifecycle
onMounted(async () => {
  await checkConnection()
  await loadStats()
})
</script>

<style scoped>
.database-migration {
  max-width: 800px;
  margin: 0 auto;
}
</style>

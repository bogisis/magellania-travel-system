<template>
  <div class="space-y-8">
    <!-- KPI карточки -->
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="relative overflow-hidden rounded-xl bg-white px-6 py-8 shadow-soft hover:shadow-elevation transition-all duration-300 transform hover:-translate-y-1"
      >
        <!-- Градиентный фон -->
        <div
          class="absolute inset-0 opacity-10"
          :style="{ background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)` }"
        />

        <div class="relative">
          <div class="flex items-center">
            <div
              class="flex-shrink-0 rounded-lg p-3"
              :style="{ backgroundColor: `${stat.color}20` }"
            >
              <component :is="stat.icon" class="h-6 w-6" :style="{ color: stat.color }" />
            </div>

            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ stat.name }}
                </dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-bold" :style="{ color: stat.color }">
                    {{ stat.value }}
                  </div>
                  <div
                    v-if="stat.change"
                    class="ml-2 flex items-baseline text-sm font-semibold"
                    :class="stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'"
                  >
                    <ArrowUpIcon
                      v-if="stat.changeType === 'increase'"
                      class="h-4 w-4 flex-shrink-0 self-center"
                    />
                    <ArrowDownIcon v-else class="h-4 w-4 flex-shrink-0 self-center" />
                    {{ stat.change }}
                  </div>
                </dd>
              </dl>
            </div>
          </div>

          <!-- Прогресс бар для некоторых метрик -->
          <div v-if="stat.progress !== undefined" class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :style="{
                  width: `${stat.progress}%`,
                  backgroundColor: stat.color,
                }"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ stat.progressText }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Последние сметы -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-soft p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900">Последние сметы</h2>
            <router-link
              to="/estimates"
              class="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Посмотреть все
            </router-link>
          </div>

          <div v-if="recentEstimates.length === 0" class="text-center py-12">
            <FileText class="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-500">Пока нет смет</p>
            <router-link
              to="/estimates/create"
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
            >
              <Plus class="h-4 w-4 mr-2" />
              Создать первую смету
            </router-link>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="estimate in recentEstimates"
              :key="estimate.id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 cursor-pointer group"
              @click="openEstimate(estimate.id)"
            >
              <div class="flex items-center space-x-4 min-w-0 flex-1">
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="getStatusClasses(estimate.status).bg"
                >
                  <component
                    :is="getStatusClasses(estimate.status).icon"
                    class="w-5 h-5"
                    :class="getStatusClasses(estimate.status).text"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <p
                    class="text-sm font-medium text-gray-900 truncate group-hover:text-primary-900"
                  >
                    {{ estimate.name || estimate.tourName }}
                  </p>
                  <div class="flex items-center space-x-4 mt-1">
                    <p class="text-xs text-gray-500">
                      {{ estimate.country }}{{ estimate.region ? `, ${estimate.region}` : '' }}
                    </p>
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      :class="getStatusClasses(estimate.status).badge"
                    >
                      {{ getStatusText(estimate.status) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">
                  ${{ formatCurrency(estimate.totalPrice || 0) }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ formatDate(estimate.updatedAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Боковая панель с быстрыми действиями и статистикой -->
      <div class="space-y-6">
        <!-- Быстрые действия -->
        <div class="bg-white rounded-xl shadow-soft p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
          <div class="space-y-3">
            <BaseButton
              variant="primary"
              full-width
              :icon="Plus"
              @click="$router.push('/estimates/create')"
            >
              Создать смету
            </BaseButton>

            <BaseButton
              variant="outline"
              full-width
              :icon="UserPlus"
              @click="$router.push('/clients/create')"
            >
              Добавить клиента
            </BaseButton>

            <BaseButton variant="ghost" full-width :icon="Upload" @click="openImportModal">
              Импорт тарифов
            </BaseButton>
          </div>
        </div>

        <!-- График конверсии -->
        <div class="bg-white rounded-xl shadow-soft p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Воронка продаж</h3>
          <div class="space-y-4">
            <div v-for="stage in funnelStages" :key="stage.name" class="relative">
              <div class="flex justify-between text-sm mb-2">
                <span class="font-medium text-gray-700">{{ stage.name }}</span>
                <span class="text-gray-500">{{ stage.count }}</span>
              </div>

              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-700"
                  :style="{
                    width: `${stage.percentage}%`,
                    backgroundColor: stage.color,
                  }"
                />
              </div>

              <p class="text-xs text-gray-500 mt-1">{{ stage.percentage }}% от общего числа</p>
            </div>
          </div>
        </div>

        <!-- Топ направления -->
        <div class="bg-white rounded-xl shadow-soft p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Популярные направления</h3>
          <div class="space-y-3">
            <div
              v-for="destination in topDestinations"
              :key="destination.country"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: destination.color }" />
                <span class="text-sm font-medium text-gray-700">
                  {{ destination.country }}
                </span>
              </div>
              <span class="text-sm text-gray-500"> {{ destination.count }} туров </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- График продаж -->
    <div class="bg-white rounded-xl shadow-soft p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Динамика продаж</h2>
        <div class="flex space-x-3">
          <button
            v-for="period in chartPeriods"
            :key="period.key"
            @click="selectedPeriod = period.key"
            class="px-3 py-1 text-sm font-medium rounded-md transition-colors"
            :class="
              selectedPeriod === period.key
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-gray-500 hover:text-gray-700 border border-transparent hover:border-gray-200'
            "
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <div class="h-80">
        <canvas ref="salesChart" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileText,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  UserPlus,
  Upload,
  ArrowUpIcon,
  ArrowDownIcon,
  Clock,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-vue-next'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Chart, registerables } from 'chart.js'

// Stores
import { useEstimatesStore } from '@/stores/estimates'
import { useClientsStore } from '@/stores/clients'
import { useAnalyticsStore } from '@/stores/analytics'

// Components
import BaseButton from '@/components/common/BaseButton.vue'

Chart.register(...registerables)

const router = useRouter()
const estimatesStore = useEstimatesStore()
const clientsStore = useClientsStore()
const analyticsStore = useAnalyticsStore()

// Reactive state
const salesChart = ref(null)
const chartInstance = ref(null)
const selectedPeriod = ref('6m')

const chartPeriods = [
  { key: '1m', label: '1 месяц' },
  { key: '3m', label: '3 месяца' },
  { key: '6m', label: '6 месяцев' },
  { key: '1y', label: '1 год' },
]

// Computed properties
const stats = computed(() => {
  const dashStats = analyticsStore.dashboardStats

  return [
    {
      name: 'Активные сметы',
      value: dashStats.activeEstimates || 0,
      icon: FileText,
      color: '#0ea5e9',
      change: '+12%',
      changeType: 'increase',
      progress: dashStats.activeEstimates
        ? Math.min((dashStats.activeEstimates / 50) * 100, 100)
        : 0,
      progressText: 'от целевого показателя',
    },
    {
      name: 'Всего клиентов',
      value: dashStats.totalClients || 0,
      icon: Users,
      color: '#10b981',
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: 'Выручка',
      value: `${formatCurrency(dashStats.totalRevenue || 0)}`,
      icon: DollarSign,
      color: '#f59e0b',
      change: '+18%',
      changeType: 'increase',
    },
    {
      name: 'Конверсия',
      value: `${dashStats.conversionRate || 0}%`,
      icon: TrendingUp,
      color: '#8b5cf6',
      progress: dashStats.conversionRate || 0,
      progressText: 'средняя по отрасли 25%',
    },
  ]
})

const recentEstimates = computed(() => {
  return estimatesStore.estimates.slice(0, 6)
})

const funnelStages = computed(() => {
  const estimates = estimatesStore.estimates
  const total = estimates.length || 1

  const stages = [
    { name: 'Черновики', status: 'draft', color: '#6b7280' },
    { name: 'Отправлено', status: 'sent', color: '#0ea5e9' },
    { name: 'Принято', status: 'approved', color: '#10b981' },
    { name: 'Отклонено', status: 'rejected', color: '#ef4444' },
  ]

  return stages.map((stage) => {
    const count = estimates.filter((est) => est.status === stage.status).length
    const percentage = Math.round((count / total) * 100)

    return {
      ...stage,
      count,
      percentage: Math.max(percentage, count > 0 ? 5 : 0), // Минимум 5% если есть хоть одна смета
    }
  })
})

const topDestinations = computed(() => {
  const estimates = estimatesStore.estimates
  const destinations = {}
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  estimates.forEach((est) => {
    if (est.country) {
      destinations[est.country] = (destinations[est.country] || 0) + 1
    }
  })

  return Object.entries(destinations)
    .map(([country, count], index) => ({
      country,
      count,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US').format(amount)
}

function formatDate(date) {
  return format(new Date(date), 'dd MMM', { locale: ru })
}

function getStatusClasses(status) {
  const classes = {
    draft: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: Clock,
      badge: 'bg-gray-100 text-gray-800',
    },
    sent: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      icon: Send,
      badge: 'bg-blue-100 text-blue-800',
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      icon: CheckCircle,
      badge: 'bg-green-100 text-green-800',
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      icon: XCircle,
      badge: 'bg-red-100 text-red-800',
    },
  }

  return classes[status] || classes.draft
}

function getStatusText(status) {
  const texts = {
    draft: 'Черновик',
    sent: 'Отправлено',
    approved: 'Принято',
    rejected: 'Отклонено',
  }

  return texts[status] || 'Неизвестно'
}

function openEstimate(id) {
  router.push(`/estimates/${id}`)
}

function openImportModal() {
  // Временная реализация
  window.$toast?.info('Импорт тарифов', 'Функция будет добавлена в следующем обновлении')
}

function createSalesChart() {
  if (!salesChart.value) return

  const ctx = salesChart.value.getContext('2d')

  // Генерируем демо-данные для графика
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн']
  const revenue = [45000, 52000, 48000, 65000, 59000, 72000]
  const estimates = [12, 15, 11, 18, 16, 21]

  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Выручка ($)',
          data: revenue,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Количество смет',
          data: estimates,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: false,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Выручка ($)',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Количество смет',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    },
  })
}

// Lifecycle
onMounted(async () => {
  // Загружаем данные
  await Promise.all([
    estimatesStore.fetchEstimates(),
    clientsStore.fetchClients(),
    analyticsStore.fetchDashboardStats(),
  ])

  // Создаем график после загрузки данных
  await nextTick()
  createSalesChart()
})
</script>

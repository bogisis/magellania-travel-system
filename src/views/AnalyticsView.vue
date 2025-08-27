<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Аналитика и отчеты</h1>
      <p class="mt-2 text-sm text-gray-600">Анализ эффективности бизнеса</p>
    </div>

    <!-- Ключевые метрики -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="metric in keyMetrics"
        :key="metric.name"
        class="bg-white p-6 rounded-lg shadow-soft"
      >
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <component 
              :is="metric.icon" 
              :class="`h-6 w-6 ${metric.iconColor}`"
            />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-500">{{ metric.name }}</p>
            <p class="text-2xl font-bold text-gray-900">{{ metric.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Заглушка для графиков -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow-soft">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Продажи по месяцам</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p class="text-gray-500">График будет добавлен позже</p>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-soft">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Популярные направления</h3>
        <div class="h-64 flex items-center justify-center bg-gray-50 rounded">
          <p class="text-gray-500">График будет добавлен позже</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { TrendingUp, DollarSign, Users, FileText } from 'lucide-vue-next'
import { useAnalyticsStore } from '@/stores/analytics'

const analyticsStore = useAnalyticsStore()

const keyMetrics = computed(() => {
  const stats = analyticsStore.dashboardStats
  
  return [
    {
      name: 'Общая выручка',
      value: `$${formatCurrency(stats.totalRevenue || 0)}`,
      icon: DollarSign,
      iconColor: 'text-green-600'
    },
    {
      name: 'Активные сметы',
      value: stats.activeEstimates || 0,
      icon: FileText,
      iconColor: 'text-blue-600'
    },
    {
      name: 'Всего клиентов',
      value: stats.totalClients || 0,
      icon: Users,
      iconColor: 'text-purple-600'
    },
    {
      name: 'Конверсия',
      value: `${stats.conversionRate || 0}%`,
      icon: TrendingUp,
      iconColor: 'text-indigo-600'
    }
  ]
})

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US').format(amount)
}

onMounted(async () => {
  await analyticsStore.fetchDashboardStats()
})
</script>

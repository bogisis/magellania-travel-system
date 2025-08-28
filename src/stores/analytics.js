import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/apiService.js'

export const useAnalyticsStore = defineStore('analytics', () => {
  const dashboardStats = ref({})
  const salesChartData = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed свойства
  const conversionRate = computed(() => {
    if (dashboardStats.value.totalEstimates > 0) {
      const approved =
        dashboardStats.value.totalEstimates - (dashboardStats.value.activeEstimates || 0)
      return Math.round((approved / dashboardStats.value.totalEstimates) * 100)
    }
    return 0
  })

  // Действия
  async function fetchDashboardStats() {
    loading.value = true
    error.value = null

    try {
      // Получаем данные через API
      const estimates = await apiService.getEstimates()
      const clients = await apiService.getClients()

      // Рассчитываем статистику
      const totalEstimates = estimates.length
      const activeEstimates = estimates.filter((e) => e.status === 'draft').length
      const approvedEstimates = estimates.filter((e) => e.status === 'confirmed').length
      const totalRevenue = estimates.reduce((sum, e) => sum + (e.totalPrice || 0), 0)

      dashboardStats.value = {
        totalEstimates,
        activeEstimates,
        approvedEstimates,
        totalRevenue,
        totalClients: clients.length,
      }
    } catch (err) {
      error.value = 'Ошибка загрузки статистики'
      console.error('Error: Не удалось получить статистику:', err.message)
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    dashboardStats,
    salesChartData,
    loading,
    error,

    // Getters
    conversionRate,

    // Actions
    fetchDashboardStats,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/database.js'

export const useAnalyticsStore = defineStore('analytics', () => {
  const dashboardStats = ref({})
  const salesChartData = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed свойства
  const conversionRate = computed(() => {
    if (dashboardStats.value.totalEstimates > 0) {
      const approved = dashboardStats.value.totalEstimates - 
        (dashboardStats.value.activeEstimates || 0)
      return Math.round((approved / dashboardStats.value.totalEstimates) * 100)
    }
    return 0
  })

  // Действия
  async function fetchDashboardStats() {
    loading.value = true
    error.value = null
    
    try {
      dashboardStats.value = await db.getDashboardStats()
    } catch (err) {
      error.value = 'Ошибка загрузки статистики'
      console.error(err)
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
    fetchDashboardStats
  }
})

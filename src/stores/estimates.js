import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/database.js'

export const useEstimatesStore = defineStore('estimates', () => {
  const estimates = ref([])
  const currentEstimate = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed свойства
  const estimatesByStatus = computed(() => {
    return estimates.value.reduce((acc, estimate) => {
      if (!acc[estimate.status]) {
        acc[estimate.status] = []
      }
      acc[estimate.status].push(estimate)
      return acc
    }, {})
  })

  const activeEstimates = computed(() => 
    estimates.value.filter(est => ['draft', 'sent', 'approved'].includes(est.status))
  )

  const totalRevenue = computed(() => 
    estimates.value
      .filter(est => est.status === 'approved')
      .reduce((sum, est) => sum + (est.totalPrice || 0), 0)
  )

  // Действия
  async function fetchEstimates() {
    loading.value = true
    error.value = null
    
    try {
      estimates.value = await db.estimates.orderBy('updatedAt').reverse().toArray()
    } catch (err) {
      error.value = 'Ошибка загрузки смет'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchEstimateById(id) {
    loading.value = true
    
    try {
      currentEstimate.value = await db.getEstimateWithDetails(id)
      return currentEstimate.value
    } catch (err) {
      error.value = 'Ошибка загрузки сметы'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createEstimate(estimateData) {
    loading.value = true
    
    try {
      const { estimateId } = await db.createEstimate(estimateData)
      const newEstimate = await db.getEstimateWithDetails(estimateId)
      
      estimates.value.unshift(newEstimate)
      currentEstimate.value = newEstimate
      
      return estimateId
    } catch (err) {
      error.value = 'Ошибка создания сметы'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateEstimate(id, updates) {
    try {
      await db.estimates.update(id, updates)
      
      const index = estimates.value.findIndex(est => est.id === id)
      if (index !== -1) {
        estimates.value[index] = { ...estimates.value[index], ...updates }
      }
      
      if (currentEstimate.value && currentEstimate.value.id === id) {
        currentEstimate.value = { ...currentEstimate.value, ...updates }
      }
    } catch (err) {
      error.value = 'Ошибка обновления сметы'
      console.error(err)
      throw err
    }
  }

  async function deleteEstimate(id) {
    try {
      await db.transaction('rw', [db.estimates, db.tourDays, db.activities], async () => {
        await db.activities.where('estimateId').equals(id).delete()
        await db.tourDays.where('estimateId').equals(id).delete()
        await db.estimates.delete(id)
      })
      
      estimates.value = estimates.value.filter(est => est.id !== id)
      
      if (currentEstimate.value && currentEstimate.value.id === id) {
        currentEstimate.value = null
      }
    } catch (err) {
      error.value = 'Ошибка удаления сметы'
      console.error(err)
      throw err
    }
  }

  async function duplicateEstimate(id) {
    try {
      const originalEstimate = await db.getEstimateWithDetails(id)
      if (!originalEstimate) throw new Error('Смета не найдена')

      const duplicatedData = {
        ...originalEstimate,
        name: `${originalEstimate.name} (копия)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      delete duplicatedData.id
      
      const newId = await createEstimate(duplicatedData)
      return newId
    } catch (err) {
      error.value = 'Ошибка копирования сметы'
      console.error(err)
      throw err
    }
  }

  return {
    // State
    estimates,
    currentEstimate,
    loading,
    error,
    
    // Getters
    estimatesByStatus,
    activeEstimates,
    totalRevenue,
    
    // Actions
    fetchEstimates,
    fetchEstimateById,
    createEstimate,
    updateEstimate,
    deleteEstimate,
    duplicateEstimate
  }
})

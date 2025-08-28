import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/apiService.js'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed свойства
  const clientsByType = computed(() => {
    return {
      b2c: clients.value.filter((client) => client.type === 'b2c'),
      b2b: clients.value.filter((client) => client.type === 'b2b'),
    }
  })

  const clientsBySegment = computed(() => {
    return clients.value.reduce((acc, client) => {
      if (!acc[client.segment]) {
        acc[client.segment] = []
      }
      acc[client.segment].push(client)
      return acc
    }, {})
  })

  const totalClients = computed(() => clients.value.length)
  const newClientsCount = computed(
    () => clients.value.filter((client) => client.segment === 'new').length,
  )

  // Действия
  async function fetchClients() {
    loading.value = true
    error.value = null

    try {
      clients.value = await apiService.getClients()
    } catch (err) {
      error.value = 'Ошибка загрузки клиентов'
      console.error('Error: Не удалось получить клиентов:', err.message)
    } finally {
      loading.value = false
    }
  }

  async function createClient(clientData) {
    loading.value = true

    try {
      const newClient = await apiService.createClient(clientData)
      clients.value.unshift(newClient)
      return newClient.id
    } catch (err) {
      error.value = 'Ошибка создания клиента'
      console.error('Error: Не удалось создать клиента:', err.message)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateClient(id, updates) {
    try {
      const updatedClient = await apiService.updateClient(id, updates)

      const index = clients.value.findIndex((client) => client.id === id)
      if (index !== -1) {
        clients.value[index] = updatedClient
      }
    } catch (err) {
      error.value = 'Ошибка обновления клиента'
      console.error('Error: Не удалось обновить клиента:', err.message)
      throw err
    }
  }

  async function deleteClient(id) {
    try {
      await apiService.deleteClient(id)
      clients.value = clients.value.filter((client) => client.id !== id)
    } catch (err) {
      error.value = 'Ошибка удаления клиента'
      console.error('Error: Не удалось удалить клиента:', err.message)
      throw err
    }
  }

  async function searchClients(query) {
    try {
      // Простой поиск по имени клиента
      const allClients = await apiService.getClients()
      return allClients.filter(
        (client) => client.name && client.name.toLowerCase().includes(query.toLowerCase()),
      )
    } catch (err) {
      error.value = 'Ошибка поиска клиентов'
      console.error('Error: Не удалось найти клиентов:', err.message)
      return []
    }
  }

  return {
    // State
    clients,
    loading,
    error,

    // Getters
    clientsByType,
    clientsBySegment,
    totalClients,
    newClientsCount,

    // Actions
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
  }
})

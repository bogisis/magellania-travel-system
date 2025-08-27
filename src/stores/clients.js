import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/services/database.js'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Computed свойства
  const clientsByType = computed(() => {
    return {
      b2c: clients.value.filter(client => client.type === 'b2c'),
      b2b: clients.value.filter(client => client.type === 'b2b')
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
  const newClientsCount = computed(() => 
    clients.value.filter(client => client.segment === 'new').length
  )

  // Действия
  async function fetchClients() {
    loading.value = true
    error.value = null
    
    try {
      clients.value = await db.clients.orderBy('createdAt').reverse().toArray()
    } catch (err) {
      error.value = 'Ошибка загрузки клиентов'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createClient(clientData) {
    loading.value = true
    
    try {
      const clientId = await db.clients.add(clientData)
      const newClient = await db.clients.get(clientId)
      
      clients.value.unshift(newClient)
      return clientId
    } catch (err) {
      error.value = 'Ошибка создания клиента'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateClient(id, updates) {
    try {
      await db.clients.update(id, updates)
      
      const index = clients.value.findIndex(client => client.id === id)
      if (index !== -1) {
        clients.value[index] = { ...clients.value[index], ...updates }
      }
    } catch (err) {
      error.value = 'Ошибка обновления клиента'
      console.error(err)
      throw err
    }
  }

  async function deleteClient(id) {
    try {
      await db.clients.delete(id)
      clients.value = clients.value.filter(client => client.id !== id)
    } catch (err) {
      error.value = 'Ошибка удаления клиента'
      console.error(err)
      throw err
    }
  }

  async function searchClients(query) {
    try {
      return await db.searchClients(query)
    } catch (err) {
      error.value = 'Ошибка поиска клиентов'
      console.error(err)
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
    searchClients
  }
})

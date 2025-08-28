<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="text-lg text-gray-600">Загрузка сметы для редактирования...</div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <h2 class="text-lg font-semibold text-red-800">Ошибка загрузки</h2>
      <p class="text-red-600 mt-2">{{ error }}</p>
      <BaseButton variant="outline" @click="loadEstimate" class="mt-4">
        Попробовать снова
      </BaseButton>
    </div>

    <div v-else-if="estimate" class="bg-white shadow-soft rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">Редактирование сметы</h1>
      <p class="text-gray-600 mt-2">{{ estimate.name }}</p>

      <div class="mt-8">
        <BaseButton variant="outline" @click="$router.go(-1)">Назад</BaseButton>
        <BaseButton variant="primary" class="ml-3" @click="startEditing">
          Открыть редактор
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEstimatesStore } from '@/stores/estimates'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const estimatesStore = useEstimatesStore()

const estimate = ref(null)
const isLoading = ref(true)
const error = ref(null)

async function loadEstimate() {
  isLoading.value = true
  error.value = null

  try {
    const loadedEstimate = await estimatesStore.loadEstimate(route.params.id)
    estimate.value = loadedEstimate
  } catch (err) {
    error.value = 'Ошибка загрузки сметы: ' + err.message
    console.error('Error loading estimate:', err)
  } finally {
    isLoading.value = false
  }
}

function startEditing() {
  // Перенаправляем на страницу создания сметы с данными для редактирования
  router.push(`/estimates/create?id=${route.params.id}`)
}

onMounted(() => {
  loadEstimate()
})
</script>

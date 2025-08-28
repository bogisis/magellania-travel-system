<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 class="text-lg font-semibold text-gray-900">Создание сметы</h1>
              <p class="text-sm text-gray-500">{{ estimateTitle }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-500"> Последнее сохранение: {{ lastSaved }} </span>
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="py-6">
      <EstimateCreator
        :initial-data="initialEstimateData"
        @save="handleSave"
        @save-draft="handleSaveDraft"
        @export="handleExport"
        @preview="handlePreview"
      />

      <!-- Отладочная информация -->
      <div class="mt-8 p-4 bg-gray-100 rounded">
        <h3 class="text-lg font-semibold mb-2">Отладка:</h3>
        <p><strong>Route ID:</strong> {{ route.params.id || route.query.id || 'Нет' }}</p>
        <p>
          <strong>Initial Data:</strong>
          {{ Object.keys(initialEstimateData).length > 0 ? 'Загружены' : 'Пустые' }}
        </p>
        <pre class="text-xs mt-2">{{ JSON.stringify(initialEstimateData, null, 2) }}</pre>
      </div>
    </main>

    <!-- Toast Notifications -->
    <ToastContainer />

    <!-- Preview Modal -->
    <BaseModal v-model:is-open="showPreviewModal" title="Предварительный просмотр сметы" size="xl">
      <div class="max-h-96 overflow-y-auto">
        <EstimatePreview :estimate="currentEstimate" />
      </div>
      <template #footer>
        <div class="flex items-center justify-between">
          <BaseButton variant="outline" @click="showPreviewModal = false"> Закрыть </BaseButton>
          <div class="flex items-center space-x-2">
            <BaseButton variant="outline" @click="printEstimate" :icon="Printer">
              Печать
            </BaseButton>
            <BaseButton variant="primary" @click="exportToPDF" :icon="Download">
              Экспорт в PDF
            </BaseButton>
          </div>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Printer, Download } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toastStore'
import { useEstimatesStore } from '@/stores/estimates'
import EstimateCreator from '@/components/estimates/EstimateCreator.vue'
import EstimatePreview from '@/components/estimates/EstimatePreview.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

// Composables
const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()
const estimatesStore = useEstimatesStore()

// Reactive data
const initialEstimateData = ref({})
const currentEstimate = ref({})
const showPreviewModal = ref(false)
const lastSaved = ref('Не сохранено')

// Computed
const estimateTitle = computed(() => {
  if (route.params.id) {
    return `Редактирование сметы #${route.params.id}`
  }
  return 'Новая смета'
})

// Methods
function goBack() {
  router.back()
}

async function handleSave(estimateData) {
  try {
    // Убеждаемся, что у нас есть обязательные поля
    const saveData = {
      ...estimateData,
      name: estimateData.name || estimateData.title || 'Новая смета',
      tourName: estimateData.tourName || estimateData.title || 'Новый тур',
    }

    let savedEstimate

    // Если редактируем существующую смету
    if (route.params.id || route.query.id) {
      const estimateId = route.params.id || route.query.id
      savedEstimate = await estimatesStore.updateEstimate(estimateId, saveData)
      toastStore.showSuccess('Смета успешно обновлена')
    } else {
      // Создаем новую смету
      savedEstimate = await estimatesStore.createEstimate(saveData)
      toastStore.showSuccess('Смета успешно создана')
    }

    lastSaved.value = new Date().toLocaleTimeString()

    // Перенаправляем на страницу просмотра сметы
    router.push(`/estimates/${savedEstimate.id}`)
  } catch (error) {
    console.error('Error saving estimate:', error)
    toastStore.showError('Ошибка при сохранении сметы')
  }
}

async function handleSaveDraft(estimateData) {
  try {
    // Убеждаемся, что у нас есть обязательные поля
    const draftData = {
      ...estimateData,
      name: estimateData.name || estimateData.title || 'Черновик сметы',
      tourName: estimateData.tourName || estimateData.title || 'Черновик тура',
    }

    // Если редактируем существующую смету
    if (route.params.id || route.query.id) {
      const estimateId = route.params.id || route.query.id
      await estimatesStore.updateEstimate(estimateId, draftData)
    } else {
      // Для новой сметы создаем черновик
      await estimatesStore.createEstimate(draftData)
    }

    lastSaved.value = new Date().toLocaleTimeString()
    toastStore.showInfo('Черновик сохранен')
  } catch (error) {
    console.error('Error saving draft:', error)
    toastStore.showError('Ошибка при сохранении черновика')
  }
}

function handleExport(estimateData) {
  try {
    // TODO: Реализовать экспорт в CSV
    console.log('Export to CSV:', estimateData)
    toastStore.showSuccess('Смета экспортирована в CSV')
  } catch (error) {
    console.error('Error exporting estimate:', error)
    toastStore.showError('Ошибка при экспорте сметы')
  }
}

function handlePreview(estimateData) {
  currentEstimate.value = estimateData
  showPreviewModal.value = true
}

function printEstimate() {
  // Логика печати сметы
  window.print()
}

function exportToPDF() {
  try {
    // TODO: Реализовать экспорт в PDF
    console.log('Export to PDF:', currentEstimate.value)
    toastStore.showSuccess('Смета экспортирована в PDF')
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    toastStore.showError('Ошибка при экспорте в PDF')
  }
}

// Lifecycle
onMounted(async () => {
  // Если редактируем существующую смету
  if (route.params.id || route.query.id) {
    const estimateId = route.params.id || route.query.id
    try {
      const estimate = await estimatesStore.loadEstimate(estimateId)
      if (estimate) {
        initialEstimateData.value = estimate
        lastSaved.value = new Date(estimate.updatedAt).toLocaleTimeString()
      } else {
        toastStore.showError('Смета не найдена')
        router.push('/estimates')
      }
    } catch (error) {
      console.error('Error loading estimate:', error)
      toastStore.showError('Ошибка при загрузке сметы')
      router.push('/estimates')
    }
  }
})
</script>

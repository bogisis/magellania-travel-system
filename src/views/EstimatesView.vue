<template>
  <div class="space-y-6">
    <!-- Заголовок и действия -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Управление сметами</h1>
        <p class="mt-2 text-sm text-gray-600">
          Создавайте, редактируйте и отслеживайте сметы туров
        </p>
      </div>

      <div class="mt-4 sm:mt-0 flex space-x-3">
        <BaseButton variant="outline" :icon="Upload" @click="openImportModal"> Импорт </BaseButton>

        <BaseButton variant="primary" :icon="Plus" @click="createNewEstimate">
          Создать смету
        </BaseButton>
      </div>
    </div>

    <!-- Фильтры и поиск -->
    <div class="bg-white rounded-lg shadow-soft p-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BaseInput
          v-model="searchQuery"
          placeholder="Поиск по названию, клиенту..."
          :prefix-icon="Search"
        />

        <select
          v-model="statusFilter"
          class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Все статусы</option>
          <option value="draft">Черновик</option>
          <option value="sent">Отправлено</option>
          <option value="approved">Принято</option>
          <option value="rejected">Отклонено</option>
        </select>

        <select
          v-model="countryFilter"
          class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Все страны</option>
          <option value="Argentina">Аргентина</option>
          <option value="Chile">Чили</option>
          <option value="Peru">Перу</option>
          <option value="Uruguay">Уругвай</option>
        </select>

        <BaseInput
          v-model="dateRange"
          type="date"
          placeholder="Дата создания"
          :prefix-icon="Calendar"
        />
      </div>
    </div>

    <!-- Список смет -->
    <div class="bg-white shadow-soft rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">
          Список смет ({{ filteredEstimates.length }})
        </h3>
      </div>

      <div v-if="filteredEstimates.length === 0" class="text-center py-12">
        <FileText class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Пока нет смет</h3>
        <p class="text-gray-600 mb-4">Создайте первую смету для начала работы</p>
        <BaseButton variant="primary" :icon="Plus" @click="createNewEstimate">
          Создать смету
        </BaseButton>
      </div>

      <div v-else>
        <div class="divide-y divide-gray-200">
          <div
            v-for="estimate in filteredEstimates"
            :key="estimate.id"
            class="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="openEstimate(estimate.id)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div
                  class="w-12 h-12 rounded-full flex items-center justify-center"
                  :class="getStatusClasses(estimate.status).bg"
                >
                  <component
                    :is="getStatusClasses(estimate.status).icon"
                    class="w-6 h-6"
                    :class="getStatusClasses(estimate.status).text"
                  />
                </div>

                <div>
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ estimate.name || estimate.tourName }}
                  </h3>
                  <div class="flex items-center space-x-4 mt-1">
                    <p class="text-sm text-gray-500">
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
                <p class="text-lg font-medium text-gray-900">
                  ${{ formatCurrency(estimate.totalPrice || 0) }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ formatDate(estimate.updatedAt) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  Plus,
  Upload,
  Search,
  Calendar,
  FileText,
  Clock,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-vue-next'

// Components
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

// Store
import { useEstimatesStore } from '@/stores/estimates'

const router = useRouter()
const estimatesStore = useEstimatesStore()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('')
const countryFilter = ref('')
const dateRange = ref('')

// Computed properties
const filteredEstimates = computed(() => {
  let estimates = [...estimatesStore.estimates]

  // Поиск по тексту
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    estimates = estimates.filter(
      (estimate) =>
        (estimate.name && estimate.name.toLowerCase().includes(query)) ||
        (estimate.tourName && estimate.tourName.toLowerCase().includes(query)) ||
        (estimate.country && estimate.country.toLowerCase().includes(query)),
    )
  }

  // Фильтр по статусу
  if (statusFilter.value) {
    estimates = estimates.filter((estimate) => estimate.status === statusFilter.value)
  }

  // Фильтр по стране
  if (countryFilter.value) {
    estimates = estimates.filter((estimate) => estimate.country === countryFilter.value)
  }

  return estimates
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US').format(amount)
}

function formatDate(date) {
  if (!date) return ''
  return format(new Date(date), 'dd.MM.yyyy', { locale: ru })
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

function createNewEstimate() {
  router.push('/estimates/create')
}

function openEstimate(id) {
  router.push(`/estimates/${id}`)
}

function openImportModal() {
  window.$toast?.info('Импорт', 'Функция будет добавлена в следующем обновлении')
}

// Lifecycle
onMounted(async () => {
  await estimatesStore.fetchEstimates()
})
</script>

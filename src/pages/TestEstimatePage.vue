<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Заголовок -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Тестирование создания смет</h1>
        <p class="text-gray-600">Проверка всех компонентов системы создания смет</p>
      </div>

      <!-- Кнопки навигации -->
      <div class="flex justify-center space-x-4 mb-8">
        <BaseButton 
          variant="primary" 
          @click="goToCreate"
          :icon="Plus"
        >
          Создать новую смету
        </BaseButton>
        
        <BaseButton 
          variant="outline" 
          @click="goToEstimates"
          :icon="List"
        >
          Список смет
        </BaseButton>
      </div>

      <!-- Тестовые данные -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Тестовые данные</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Тестовая смета -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Создать тестовую смету</h3>
            <BaseButton 
              variant="outline" 
              @click="createTestEstimate"
              :icon="Wand2"
            >
              Создать тестовую смету
            </BaseButton>
          </div>

          <!-- Очистить данные -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Очистить данные</h3>
            <BaseButton 
              variant="outline" 
              @click="clearData"
              :icon="Trash2"
            >
              Очистить все данные
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Статистика -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Статистика</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-900">{{ estimatesCount }}</div>
            <div class="text-sm text-blue-700">Всего смет</div>
          </div>
          
          <div class="p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-900">{{ draftsCount }}</div>
            <div class="text-sm text-green-700">Черновики</div>
          </div>
          
          <div class="p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-900">{{ publishedCount }}</div>
            <div class="text-sm text-purple-700">Опубликованные</div>
          </div>
        </div>
      </div>

      <!-- Toast Container -->
      <ToastContainer />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, List, Wand2, Trash2 } from 'lucide-vue-next'
import { useEstimateStore } from '@/stores/estimateStore'
import { useToastStore } from '@/stores/toastStore'
import BaseButton from '@/components/common/BaseButton.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const router = useRouter()
const estimateStore = useEstimateStore()
const toastStore = useToastStore()

// Computed
const estimatesCount = computed(() => estimateStore.getEstimates.length)
const draftsCount = computed(() => estimateStore.getDrafts.length)
const publishedCount = computed(() => estimateStore.getPublished.length)

// Methods
function goToCreate() {
  router.push('/estimates/create')
}

function goToEstimates() {
  router.push('/estimates')
}

function createTestEstimate() {
  const testEstimate = {
    title: 'Тестовая смета - Аргентина',
    location: {
      country: 'argentina',
      region: 'buenos-aires',
      city: 'Буэнос-Айрес'
    },
    tourDates: {
      dateType: 'exact',
      startDate: '2024-12-01',
      endDate: '2024-12-07',
      days: 7
    },
    group: {
      totalPax: 10,
      doubleCount: 4,
      singleCount: 2,
      guidesCount: 1,
      markup: 15
    },
    hotels: [
      {
        id: 'hotel1',
        name: 'Hotel Plaza Mayor',
        category: '4',
        paxCount: 10,
        accommodationType: 'double',
        pricePerRoom: 120,
        nights: 6,
        isGuideHotel: false
      }
    ],
    tourDays: [
      {
        id: 'day1',
        title: 'Прибытие в Буэнос-Айрес',
        date: '2024-12-01',
        location: 'Буэнос-Айрес',
        description: 'Встреча в аэропорту, трансфер в отель, размещение',
        activities: [
          {
            id: 'act1',
            name: 'Трансфер из аэропорта',
            time: '14:00',
            cost: 50
          }
        ]
      },
      {
        id: 'day2',
        title: 'Обзорная экскурсия по городу',
        date: '2024-12-02',
        location: 'Буэнос-Айрес',
        description: 'Экскурсия по историческому центру, Ла Бока, Сан Тельмо',
        activities: [
          {
            id: 'act2',
            name: 'Обзорная экскурсия',
            time: '09:00',
            cost: 80
          }
        ]
      }
    ],
    optionalServices: [
      {
        id: 'opt1',
        name: 'Ужин с танго-шоу',
        category: 'entertainment',
        price: 120,
        description: 'Ужин в традиционном ресторане с танго-шоу',
        targetDay: ''
      }
    ],
    markup: 15,
    currency: 'USD',
    status: 'draft'
  }

  estimateStore.saveEstimate(testEstimate)
  toastStore.showSuccess('Тестовая смета создана успешно!')
}

function clearData() {
  localStorage.removeItem('estimates')
  estimateStore.loadEstimates()
  toastStore.showInfo('Все данные очищены')
}

// Lifecycle
onMounted(() => {
  estimateStore.loadEstimates()
})
</script>

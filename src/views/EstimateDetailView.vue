<template>
  <div class="space-y-6">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="text-lg text-gray-600">Загрузка сметы...</div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <h2 class="text-lg font-semibold text-red-800">Ошибка загрузки</h2>
      <p class="text-red-600 mt-2">{{ error }}</p>
      <BaseButton variant="outline" @click="loadEstimate" class="mt-4">
        Попробовать снова
      </BaseButton>
    </div>

    <div v-else-if="estimate" class="space-y-6">
      <!-- Заголовок -->
      <div class="bg-white shadow-soft rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ estimate.name }}</h1>
            <p class="text-gray-600 mt-1">{{ estimate.tourName }}</p>
          </div>
          <div class="flex items-center space-x-3">
            <BaseButton variant="outline" @click="$router.go(-1)">Назад</BaseButton>
            <BaseButton variant="primary" @click="$router.push(`/estimates/${estimate.id}/edit`)">
              Редактировать
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Основная информация -->
      <div class="bg-white shadow-soft rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-700">Клиент</label>
            <p class="text-gray-900">{{ estimate.client || 'Не указан' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Статус</label>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="getStatusClasses(estimate.status).badge"
            >
              {{ getStatusText(estimate.status) }}
            </span>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Страна</label>
            <p class="text-gray-900">{{ estimate.country || 'Не указана' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Регион</label>
            <p class="text-gray-900">{{ estimate.region || 'Не указан' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Дата начала</label>
            <p class="text-gray-900">{{ formatDate(estimate.startDate) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Длительность</label>
            <p class="text-gray-900">{{ estimate.duration }} дней</p>
          </div>
        </div>
      </div>

      <!-- Информация о группе -->
      <div v-if="estimate.group" class="bg-white shadow-soft rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Информация о группе</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-700">Всего человек</label>
            <p class="text-2xl font-bold text-gray-900">{{ estimate.group.totalPax }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Двухместные номера</label>
            <p class="text-lg text-gray-900">{{ estimate.group.doubleCount }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Одноместные номера</label>
            <p class="text-lg text-gray-900">{{ estimate.group.singleCount }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Гиды</label>
            <p class="text-lg text-gray-900">{{ estimate.group.guidesCount }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700">Наценка</label>
            <p class="text-lg text-gray-900">{{ estimate.group.markup }}%</p>
          </div>
        </div>
      </div>

      <!-- Отели -->
      <div
        v-if="estimate.hotels && estimate.hotels.length > 0"
        class="bg-white shadow-soft rounded-lg p-6"
      >
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Отели</h2>
        <div class="space-y-4">
          <div
            v-for="hotel in estimate.hotels"
            :key="hotel.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ hotel.name }}</h3>
                <p class="text-gray-600">{{ hotel.city }}, {{ hotel.region }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-gray-900">${{ hotel.pricePerRoom }}/ночь</p>
                <p class="text-sm text-gray-600">{{ hotel.nights }} ночей</p>
              </div>
            </div>
            <div class="mt-2 text-sm text-gray-600">
              <span>{{ hotel.paxCount }} человек, {{ hotel.accommodationType }}</span>
              <span v-if="hotel.isGuideHotel" class="ml-2 text-blue-600">(для гида)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Дни тура -->
      <div
        v-if="estimate.tourDays && estimate.tourDays.length > 0"
        class="bg-white shadow-soft rounded-lg p-6"
      >
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Дни тура</h2>
        <div class="space-y-4">
          <div
            v-for="day in estimate.tourDays"
            :key="day.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <h3 class="text-lg font-medium text-gray-900">
              День {{ day.dayNumber }} - {{ formatDate(day.date) }}
            </h3>
            <p class="text-gray-600">{{ day.city }}</p>
            <div v-if="day.activities && day.activities.length > 0" class="mt-3">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Активности:</h4>
              <div class="space-y-2">
                <div
                  v-for="activity in day.activities"
                  :key="activity.id"
                  class="bg-gray-50 rounded p-3"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium text-gray-900">{{ activity.name }}</p>
                      <p class="text-sm text-gray-600">{{ activity.description }}</p>
                      <p class="text-sm text-gray-500">{{ activity.duration }}</p>
                    </div>
                    <p class="text-lg font-semibold text-gray-900">${{ activity.cost }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Дополнительные услуги -->
      <div
        v-if="estimate.optionalServices && estimate.optionalServices.length > 0"
        class="bg-white shadow-soft rounded-lg p-6"
      >
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Дополнительные услуги</h2>
        <div class="space-y-4">
          <div
            v-for="service in estimate.optionalServices"
            :key="service.id"
            class="flex justify-between items-center border border-gray-200 rounded-lg p-4"
          >
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ service.name }}</h3>
              <p class="text-gray-600">{{ service.description }}</p>
            </div>
            <p class="text-lg font-semibold text-gray-900">${{ service.cost }}</p>
          </div>
        </div>
      </div>

      <!-- Итоговая стоимость -->
      <div class="bg-white shadow-soft rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Итоговая стоимость</h2>
        <div class="text-right">
          <p class="text-3xl font-bold text-gray-900">${{ formatCurrency(estimate.totalPrice) }}</p>
          <p class="text-sm text-gray-600">{{ estimate.currency || 'USD' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useEstimatesStore } from '@/stores/estimates'
import BaseButton from '@/components/common/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const estimatesStore = useEstimatesStore()

const estimate = ref(null)
const isLoading = ref(true)
const error = ref(null)

// Methods
function formatDate(date) {
  if (!date) return 'Н/Д'
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return 'Н/Д'
    return format(dateObj, 'dd.MM.yyyy', { locale: ru })
  } catch (error) {
    console.warn('Error formatting date:', date, error)
    return 'Н/Д'
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US').format(amount)
}

function getStatusClasses(status) {
  const classes = {
    draft: { badge: 'bg-gray-100 text-gray-800' },
    sent: { badge: 'bg-blue-100 text-blue-800' },
    confirmed: { badge: 'bg-green-100 text-green-800' },
    rejected: { badge: 'bg-red-100 text-red-800' },
  }
  return classes[status] || classes.draft
}

function getStatusText(status) {
  const texts = {
    draft: 'Черновик',
    sent: 'Отправлено',
    confirmed: 'Подтверждено',
    rejected: 'Отклонено',
  }
  return texts[status] || 'Неизвестно'
}

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

// Lifecycle
onMounted(() => {
  loadEstimate()
})
</script>

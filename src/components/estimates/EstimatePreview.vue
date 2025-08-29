<template>
  <div class="estimate-preview bg-white p-6 rounded-lg shadow-sm">
    <!-- Заголовок сметы -->
    <div class="text-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">СМЕТА ДЛЯ КП</h1>
      <p class="text-gray-600">
        {{ estimate.location.city }}, {{ estimate.location.region }},
        {{ estimate.location.country }}
      </p>
      <p class="text-sm text-gray-500">
        {{ formatDate(estimate.tourDates.startDate) }} -
        {{ formatDate(estimate.tourDates.endDate) }} ({{ estimate.tourDates.days }} дней)
      </p>
    </div>

    <!-- Информация о группе -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">Информация о группе</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Всего туристов:</span>
          <span class="ml-2 font-medium">{{ estimate.group.totalPax }}</span>
        </div>
        <div>
          <span class="text-gray-600">Дабл размещение:</span>
          <span class="ml-2 font-medium">{{ estimate.group.doubleCount }}</span>
        </div>
        <div>
          <span class="text-gray-600">Сингл размещение:</span>
          <span class="ml-2 font-medium">{{ estimate.group.singleCount }}</span>
        </div>
        <div>
          <span class="text-gray-600">Гиды:</span>
          <span class="ml-2 font-medium">{{ estimate.group.guidesCount }}</span>
        </div>
      </div>
    </div>

    <!-- Детализация по дням -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Детализация по дням</h2>

      <div class="space-y-4">
        <div
          v-for="(day, index) in estimate.tourDays"
          :key="day.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <!-- Заголовок дня -->
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-md font-medium text-gray-900">
              День {{ index + 1 }}: {{ day.title || `День ${index + 1}` }}
            </h3>
            <span class="text-sm text-gray-500">{{ formatDate(day.date) }}</span>
          </div>

          <!-- Место проведения -->
          <div class="mb-3">
            <span class="text-sm text-gray-600">Место:</span>
            <span class="ml-2 text-sm font-medium">{{ day.location || 'Не указано' }}</span>
          </div>

          <!-- Описание дня -->
          <div v-if="day.description" class="mb-3">
            <p class="text-sm text-gray-700">{{ day.description }}</p>
          </div>

          <!-- Активности дня -->
          <div v-if="day.activities && day.activities.length > 0">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Активности:</h4>
            <div class="space-y-2">
              <div
                v-for="activity in day.activities"
                :key="activity.id"
                class="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div class="flex items-center space-x-3">
                  <span class="text-sm text-gray-500">{{
                    activity.time || 'Время не указано'
                  }}</span>
                  <span class="text-sm font-medium">{{ activity.name }}</span>
                </div>
                <span class="text-sm font-medium text-gray-900">
                  {{ formatCurrency(activity.cost) }}
                </span>
              </div>
            </div>

            <!-- Итого за день -->
            <div class="mt-3 pt-2 border-t border-gray-200">
              <div class="flex justify-between text-sm">
                <span class="font-medium">Итого за день:</span>
                <span class="font-bold">{{ formatCurrency(calculateDayTotal(day)) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Гостиницы -->
    <div v-if="estimate.hotels && estimate.hotels.length > 0" class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Размещение</h2>

      <div class="space-y-3">
        <div
          v-for="hotel in estimate.hotels"
          :key="hotel.id"
          class="border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-md font-medium text-gray-900">{{ hotel.name }}</h3>
            <span class="text-sm text-gray-500">{{ hotel.category }} звезд</span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
            <div>
              <span class="text-gray-600">Туристов:</span>
              <span class="ml-2 font-medium">{{ hotel.paxCount }}</span>
            </div>
            <div>
              <span class="text-gray-600">Тип размещения:</span>
              <span class="ml-2 font-medium">{{
                hotel.accommodationType === 'double' ? 'Дабл' : 'Сингл'
              }}</span>
            </div>
            <div>
              <span class="text-gray-600">Номеров:</span>
              <span class="ml-2 font-medium">{{ calculateRooms(hotel) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Ночей:</span>
              <span class="ml-2 font-medium">{{ hotel.nights }}</span>
            </div>
          </div>

          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Стоимость за номер:</span>
            <span class="font-medium">{{ formatCurrency(hotel.pricePerRoom) }}</span>
          </div>

          <div class="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-gray-200">
            <span>Итого за гостиницу:</span>
            <span>{{ formatCurrency(calculateHotelTotal(hotel)) }}</span>
          </div>

          <div v-if="hotel.isGuideHotel" class="mt-2 text-xs text-orange-600">
            ⚠️ Гостиница для гида (не включена в общую стоимость)
          </div>
        </div>
      </div>
    </div>

    <!-- Итоговый расчет -->
    <div class="border-t border-gray-200 pt-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Итоговый расчет</h2>

      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Стоимость гостиниц:</span>
          <span class="font-medium">{{ formatCurrency(hotelsCost) }}</span>
        </div>

        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Стоимость активностей:</span>
          <span class="font-medium">{{ formatCurrency(activitiesCost) }}</span>
        </div>

        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Опциональные услуги:</span>
          <span class="font-medium">{{ formatCurrency(optionalServicesCost) }}</span>
        </div>

        <div class="border-t border-gray-200 pt-2">
          <div class="flex justify-between text-base font-semibold">
            <span>Базовая стоимость:</span>
            <span>{{ formatCurrency(baseCost) }}</span>
          </div>
        </div>

        <div v-if="estimate.markup > 0" class="flex justify-between text-sm">
          <span class="text-gray-600">Наценка ({{ estimate.markup }}%):</span>
          <span class="font-medium">{{ formatCurrency(markupAmount) }}</span>
        </div>

        <div class="border-t border-gray-200 pt-2">
          <div class="flex justify-between text-lg font-bold text-primary-600">
            <span>ИТОГО:</span>
            <span>{{ formatCurrency(finalCost) }}</span>
          </div>
        </div>

        <div v-if="estimate.markup > 0" class="text-xs text-gray-500 mt-2">
          * Комиссия агентства: {{ formatCurrency(commissionAmount) }}
        </div>
      </div>
    </div>

    <!-- Дополнительная информация -->
    <div class="mt-6 p-4 bg-blue-50 rounded-lg">
      <h3 class="text-sm font-medium text-blue-900 mb-2">Дополнительная информация</h3>
      <div class="text-sm text-blue-700 space-y-1">
        <p>• Смета действительна до: {{ formatDate(validUntilDate) }}</p>
        <p>• Валюта: {{ estimate.currency }}</p>
        <p>• Создана: {{ formatDateTime(estimate.createdAt) }}</p>
        <p>• Обновлена: {{ formatDateTime(estimate.updatedAt) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'

// Props
const props = defineProps({
  estimate: {
    type: Object,
    required: true,
  },
})

// Computed
const baseCost = computed(() => {
  const hotelsCost =
    props.estimate.hotels
      ?.filter((hotel) => !hotel.isGuideHotel)
      .reduce((sum, hotel) => sum + calculateHotelTotal(hotel), 0) || 0

  const activitiesCost =
    props.estimate.tourDays?.reduce((sum, day) => sum + calculateDayTotal(day), 0) || 0

  const optionalServicesCost =
    props.estimate.optionalServices?.reduce((sum, service) => sum + service.price, 0) || 0

  return hotelsCost + activitiesCost + optionalServicesCost
})

const markupAmount = computed(() => {
  return (baseCost.value * Number(props.estimate.markup || 0)) / 100
})

const finalCost = computed(() => {
  return baseCost.value + markupAmount.value
})

const commissionAmount = computed(() => {
  return markupAmount.value
})

const hotelsCost = computed(() => {
  return (
    props.estimate.hotels
      ?.filter((hotel) => !hotel.isGuideHotel)
      .reduce((sum, hotel) => sum + calculateHotelTotal(hotel), 0) || 0
  )
})

const activitiesCost = computed(() => {
  return props.estimate.tourDays?.reduce((sum, day) => sum + calculateDayTotal(day), 0) || 0
})

const optionalServicesCost = computed(() => {
  return props.estimate.optionalServices?.reduce((sum, service) => sum + service.price, 0) || 0
})

const validUntilDate = computed(() => {
  return addDays(new Date(), 30)
})

// Methods
function formatDate(dateString) {
  if (!dateString) return 'Не указана'
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru })
  } catch {
    return dateString
  }
}

function formatDateTime(dateString) {
  if (!dateString) return 'Не указана'
  try {
    return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru })
  } catch {
    return dateString
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.estimate.currency || 'USD',
  }).format(amount || 0)
}

import { CalculationService } from '@/services/CalculationService.js'

// ... existing code ...

function calculateDayTotal(day) {
  return CalculationService.calculateDayTotal(day)
}

function calculateRooms(hotel) {
  return CalculationService.calculateRooms(hotel)
}

function calculateHotelTotal(hotel) {
  return CalculationService.calculateHotelTotal(hotel)
}
</script>

<style scoped>
.estimate-preview {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    system-ui,
    sans-serif;
}

@media print {
  .estimate-preview {
    box-shadow: none;
    border: none;
  }
}
</style>

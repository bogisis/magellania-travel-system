<template>
  <div class="flight-manager">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">
          <Icon name="Plane" class="w-5 h-5 mr-2" />
          Перелеты
        </h3>
        <button
          type="button"
          @click="showFlightSearch = !showFlightSearch"
          class="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Icon name="Search" class="w-4 h-4 mr-1" />
          Поиск рейсов
        </button>
      </div>

      <!-- Поиск рейсов -->
      <div v-if="showFlightSearch" class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-md font-medium text-gray-900 mb-4">Поиск рейсов</h4>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <!-- Аэропорт отправления -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Откуда</label>
            <select
              v-model="searchParams.origin"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите аэропорт</option>
              <option value="BUE">BUE - Buenos Aires</option>
              <option value="USH">USH - Ushuaia</option>
              <option value="MIA">MIA - Miami</option>
            </select>
          </div>

          <!-- Аэропорт назначения -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Куда</label>
            <select
              v-model="searchParams.destination"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите аэропорт</option>
              <option value="BUE">BUE - Buenos Aires</option>
              <option value="USH">USH - Ushuaia</option>
              <option value="MIA">MIA - Miami</option>
            </select>
          </div>

          <!-- Дата полета -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Дата</label>
            <input
              v-model="searchParams.date"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <!-- Пассажиры и класс -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Взрослые</label>
            <input
              v-model.number="searchParams.passengers.adult"
              type="number"
              min="1"
              max="9"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Дети</label>
            <input
              v-model.number="searchParams.passengers.child"
              type="number"
              min="0"
              max="9"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Младенцы</label>
            <input
              v-model.number="searchParams.passengers.infant"
              type="number"
              min="0"
              max="9"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Класс</label>
            <select
              v-model="searchParams.cabinClass"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="economy">Эконом</option>
              <option value="premium_economy">Премиум эконом</option>
              <option value="business">Бизнес</option>
              <option value="first">Первый</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-2">
          <button
            type="button"
            @click="searchFlights"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Найти рейсы
          </button>
          <button
            type="button"
            @click="showFlightSearch = false"
            class="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Отмена
          </button>
        </div>
      </div>

      <!-- Результаты поиска -->
      <div v-if="searchResults.length > 0" class="mb-6">
        <h4 class="text-md font-medium text-gray-900 mb-4">Найденные рейсы</h4>

        <div class="space-y-4">
          <div
            v-for="(flight, index) in searchResults"
            :key="flight.id"
            class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
            :class="{ 'border-blue-500 bg-blue-50': selectedFlight?.id === flight.id }"
            @click="selectFlight(flight)"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-600">
                  {{ flight.segments ? flight.segments.length : 0 }} сегмент{{
                    (flight.segments ? flight.segments.length : 0) > 1 ? 'а' : ''
                  }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ flight.totalConnections }} пересадк{{
                    flight.totalConnections > 1 ? 'и' : 'а'
                  }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ formatDuration(flight.totalDuration) }}
                </div>
              </div>
              <div class="text-lg font-semibold text-blue-600">
                {{ formatCurrency(flight.finalPrice) }}
              </div>
            </div>

            <!-- Сегменты -->
            <div class="space-y-2">
              <div
                v-for="(segment, segIndex) in flight.segments"
                :key="segment.id"
                class="flex items-center space-x-4 text-sm"
              >
                <div class="flex items-center space-x-2">
                  <span class="font-medium">{{ segment.origin }}</span>
                  <Icon name="ArrowRight" class="w-4 h-4" />
                  <span class="font-medium">{{ segment.destination }}</span>
                </div>
                <div class="text-gray-600">
                  {{ formatDateTime(segment.departureDate) }} -
                  {{ formatDateTime(segment.arrivalDate) }}
                </div>
                <div class="text-gray-600">{{ segment.airline }} {{ segment.flightNumber }}</div>
                <div v-if="segIndex > 0" class="text-orange-600">
                  {{ segment.connectionTime }}ч пересадка
                </div>
              </div>
            </div>

            <!-- Детали -->
            <div class="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              <div class="flex justify-between">
                <span>Базовая стоимость: {{ formatCurrency(flight.basePrice) }}</span>
                <span>Налоги и сборы: {{ formatCurrency(flight.taxes) }}</span>
                <span>Доплаты: {{ formatCurrency(flight.fees) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Выбранный перелет -->
      <div v-if="selectedFlight" class="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 class="text-md font-medium text-gray-900 mb-4">Выбранный перелет</h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Информация о перелете -->
          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Детали перелета</h5>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Маршрут:</span>
                <span
                  >{{
                    selectedFlight.segments && selectedFlight.segments.length > 0
                      ? selectedFlight.segments[0].origin
                      : 'N/A'
                  }}
                  →
                  {{
                    selectedFlight.segments && selectedFlight.segments.length > 0
                      ? selectedFlight.segments[selectedFlight.segments.length - 1].destination
                      : 'N/A'
                  }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Тип:</span>
                <span>{{ getFlightTypeName(selectedFlight.type) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Класс:</span>
                <span>{{ getCabinClassName(selectedFlight.cabinClass) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Расстояние:</span>
                <span>{{ selectedFlight.totalDistance }} км</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Время в пути:</span>
                <span>{{ formatDuration(selectedFlight.totalDuration) }}</span>
              </div>
            </div>
          </div>

          <!-- Пассажиры и багаж -->
          <div>
            <h5 class="text-sm font-medium text-gray-700 mb-2">Пассажиры и багаж</h5>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Взрослые:</span>
                <span>{{ selectedFlight.passengers.adult }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Дети:</span>
                <span>{{ selectedFlight.passengers.child }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Младенцы:</span>
                <span>{{ selectedFlight.passengers.infant }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Зарегистрированный багаж:</span>
                <span>{{ selectedFlight.baggage.checked }} шт</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Ручная кладь:</span>
                <span>{{ selectedFlight.baggage.carryOn }} шт</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Стоимость -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">
              Итоговая стоимость:
              <span class="text-lg font-semibold text-blue-600">{{
                formatCurrency(selectedFlight.finalPrice)
              }}</span>
            </div>
            <button
              type="button"
              @click="addFlightToEstimate"
              class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Добавить в смету
            </button>
          </div>
        </div>
      </div>

      <!-- Список перелетов в смете -->
      <div v-if="estimateFlights.length > 0">
        <h4 class="text-md font-medium text-gray-900 mb-4">Перелеты в смете</h4>

        <div class="space-y-3">
          <div
            v-for="flight in estimateFlights"
            :key="flight.id"
            class="p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <div class="text-sm font-medium">
                  {{
                    flight.segments && flight.segments.length > 0
                      ? flight.segments[0].origin
                      : 'N/A'
                  }}
                  →
                  {{
                    flight.segments && flight.segments.length > 0
                      ? flight.segments[flight.segments.length - 1].destination
                      : 'N/A'
                  }}
                </div>
                <div class="text-sm text-gray-600">
                  {{
                    flight.segments && flight.segments.length > 0
                      ? formatDate(flight.segments[0].departureDate)
                      : 'N/A'
                  }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ flight.segments ? flight.segments.length : 0 }} сегмент{{
                    (flight.segments ? flight.segments.length : 0) > 1 ? 'а' : ''
                  }}
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm font-semibold text-blue-600">
                  {{ formatCurrency(flight.finalPrice) }}
                </span>
                <button
                  type="button"
                  @click="removeFlight(flight.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  <Icon name="Trash2" class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div
        v-if="!showFlightSearch && searchResults.length === 0 && estimateFlights.length === 0"
        class="text-center py-8"
      >
        <Icon name="Plane" class="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Нет добавленных перелетов</p>
        <p class="text-sm text-gray-400">Нажмите "Поиск рейсов" чтобы найти и добавить перелеты</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { flightService, FLIGHT_TYPES, CABIN_CLASSES } from '@/services/FlightService.js'
import Icon from '@/components/common/Icon.vue'

// Props
const props = defineProps({
  estimate: {
    type: Object,
    required: true,
  },
})

// Emits
const emit = defineEmits(['update:estimate', 'flight-added', 'flight-removed'])

// Reactive data
const showFlightSearch = ref(false)
const searchResults = ref([])
const selectedFlight = ref(null)

// Search parameters
const searchParams = ref({
  origin: '',
  destination: '',
  date: '',
  passengers: {
    adult: 1,
    child: 0,
    infant: 0,
  },
  cabinClass: CABIN_CLASSES.ECONOMY,
})

// Computed
const estimateFlights = computed(() => {
  return props.estimate.flights || []
})

// Methods
function searchFlights() {
  if (!searchParams.value.origin || !searchParams.value.destination || !searchParams.value.date) {
    alert('Пожалуйста, заполните все поля поиска')
    return
  }

  try {
    const routes = flightService.findAlternativeRoutes(
      searchParams.value.origin,
      searchParams.value.destination,
      searchParams.value.date,
    )

    // Применяем параметры пассажиров и класса
    searchResults.value = routes.map((route) => {
      const flight = {
        ...route,
        passengers: { ...searchParams.value.passengers },
        cabinClass: searchParams.value.cabinClass,
      }

      // Пересчитываем стоимость с новыми параметрами
      flightService.calculateFlightTotals(flight)
      return flight
    })

    if (searchResults.value.length === 0) {
      alert('Рейсы не найдены для указанного маршрута')
    }
  } catch (error) {
    console.error('Ошибка поиска рейсов:', error)
    alert('Ошибка при поиске рейсов')
  }
}

function selectFlight(flight) {
  selectedFlight.value = flight
}

function addFlightToEstimate() {
  if (!selectedFlight.value) return

  try {
    // Валидируем перелет
    const validation = flightService.validateFlight(selectedFlight.value)
    if (!validation.isValid) {
      alert(`Ошибки в данных перелета:\n${validation.errors.join('\n')}`)
      return
    }

    // Добавляем перелет в смету
    const updatedEstimate = {
      ...props.estimate,
      flights: [...(props.estimate.flights || []), selectedFlight.value],
    }

    emit('update:estimate', updatedEstimate)
    emit('flight-added', selectedFlight.value)

    // Сбрасываем состояние
    selectedFlight.value = null
    searchResults.value = []
    showFlightSearch.value = false
  } catch (error) {
    console.error('Ошибка добавления перелета:', error)
    alert('Ошибка при добавлении перелета в смету')
  }
}

function removeFlight(flightId) {
  const updatedFlights = estimateFlights.value.filter((flight) => flight.id !== flightId)
  const updatedEstimate = {
    ...props.estimate,
    flights: updatedFlights,
  }

  emit('update:estimate', updatedEstimate)
  emit('flight-removed', flightId)
}

function formatCurrency(amount) {
  if (typeof amount !== 'number') return '0'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: props.estimate.currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}ч ${m}м`
}

function getFlightTypeName(type) {
  const typeNames = {
    [FLIGHT_TYPES.DIRECT]: 'Прямой',
    [FLIGHT_TYPES.CONNECTING]: 'С пересадками',
    [FLIGHT_TYPES.MULTI_CITY]: 'Мульти-город',
    [FLIGHT_TYPES.ROUND_TRIP]: 'Туда-обратно',
    [FLIGHT_TYPES.OPEN_JAW]: 'Открытый маршрут',
  }
  return typeNames[type] || type
}

function getCabinClassName(cabinClass) {
  const classNames = {
    [CABIN_CLASSES.ECONOMY]: 'Эконом',
    [CABIN_CLASSES.PREMIUM_ECONOMY]: 'Премиум эконом',
    [CABIN_CLASSES.BUSINESS]: 'Бизнес',
    [CABIN_CLASSES.FIRST]: 'Первый',
  }
  return classNames[cabinClass] || cabinClass
}

// Watchers
watch(
  () => props.estimate.flights,
  (newFlights) => {
    // Обновляем локальное состояние при изменении перелетов в смете
  },
  { deep: true },
)
</script>

<style scoped>
.flight-manager {
  @apply w-full;
}

/* Анимации для переключения поиска */
.flight-manager .bg-gray-50 {
  transition: all 0.3s ease;
}

/* Стили для селектов */
.flight-manager select {
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Стили для инпутов */
.flight-manager input {
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Стили для карточек рейсов */
.flight-manager .border-gray-200 {
  transition: all 0.2s ease;
}

.flight-manager .border-gray-200:hover {
  @apply border-blue-300 shadow-sm;
}

/* Стили для выбранного рейса */
.flight-manager .border-blue-500 {
  @apply shadow-md;
}
</style>

<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">Гостиницы</h3>
      <div class="flex items-center space-x-2">
        <BaseButton
          variant="outline"
          size="sm"
          @click="distributeTourists"
          :disabled="!accommodationData.totalPax || hotels.length === 0"
        >
          Распределить туристов
        </BaseButton>
        <BaseButton variant="outline" size="sm" @click="addHotel" :icon="Plus">
          Добавить гостиницу
        </BaseButton>
      </div>
    </div>

    <!-- Список гостиниц -->
    <div class="space-y-4">
      <div
        v-for="(hotel, index) in hotels"
        :key="hotel.id"
        class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium"
            >
              {{ index + 1 }}
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900">
                {{ hotel.name || 'Новая гостиница' }}
              </h4>
              <p class="text-xs text-gray-500">{{ hotel.category }} звезд • {{ hotel.city }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-900">
              {{ formatCurrency(calculateHotelTotal(hotel)) }}
            </span>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="removeHotel(hotel.id)"
              :icon="Trash2"
              class="text-red-600 hover:text-red-700"
            >
              Удалить
            </BaseButton>
          </div>
        </div>

        <!-- Выбор гостиницы -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <!-- Выбор из базы данных -->
          <div>
            <label class="form-label">Выбрать гостиницу</label>
            <select
              v-model="hotel.hotelId"
              class="form-input"
              @change="onHotelSelect(hotel.id, $event.target.value)"
            >
              <option value="">Выберите из базы данных</option>
              <option v-for="dbHotel in availableHotels" :key="dbHotel.id" :value="dbHotel.id">
                {{ dbHotel.name }} ({{ dbHotel.category }}★) - {{ dbHotel.city }}
              </option>
            </select>
          </div>

          <!-- Или ввести вручную -->
          <div class="flex items-end">
            <button
              type="button"
              @click="enableManualHotel(hotel.id)"
              class="text-sm text-primary-600 hover:text-primary-700 underline"
            >
              или ввести вручную
            </button>
          </div>

          <!-- Тип размещения -->
          <div>
            <label class="form-label">Тип размещения</label>
            <select
              v-model="hotel.accommodationType"
              class="form-input"
              @change="updateHotel(hotel.id, 'accommodationType', $event.target.value)"
            >
              <option value="double">Дабл (2 человека)</option>
              <option value="single">Сингл (1 человек)</option>
              <option value="triple">Трипл (3 человека)</option>
              <option value="suite">Люкс</option>
            </select>
          </div>
        </div>

        <!-- Ручной ввод гостиницы -->
        <div
          v-if="hotel.isManual"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"
        >
          <!-- Название гостиницы -->
          <div>
            <label class="form-label">Название гостиницы</label>
            <BaseInput
              v-model="hotel.name"
              placeholder="Название гостиницы"
              @input="updateHotel(hotel.id, 'name', $event.target.value)"
            />
          </div>

          <!-- Категория -->
          <div>
            <label class="form-label">Категория</label>
            <select
              v-model="hotel.category"
              class="form-input"
              @change="updateHotel(hotel.id, 'category', $event.target.value)"
            >
              <option value="">Выберите категорию</option>
              <option value="1">1 звезда</option>
              <option value="2">2 звезды</option>
              <option value="3">3 звезды</option>
              <option value="4">4 звезды</option>
              <option value="5">5 звезд</option>
              <option value="boutique">Бутик</option>
              <option value="hostel">Хостел</option>
              <option value="apartment">Апартаменты</option>
            </select>
          </div>

          <!-- Город -->
          <div>
            <label class="form-label">Город</label>
            <BaseInput
              v-model="hotel.city"
              placeholder="Город"
              @input="updateHotel(hotel.id, 'city', $event.target.value)"
            />
          </div>
        </div>

        <!-- Детали размещения -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <!-- Количество человек -->
          <div>
            <label class="form-label">Количество человек</label>
            <BaseInput
              v-model.number="hotel.paxCount"
              type="number"
              min="1"
              max="50"
              @input="updateHotel(hotel.id, 'paxCount', $event.target.value)"
            />
          </div>

          <!-- Цена за номер -->
          <div>
            <label class="form-label">Цена за номер ({{ hotel.currency || 'USD' }})</label>
            <BaseInput
              v-model.number="hotel.pricePerRoom"
              type="number"
              min="0"
              step="0.01"
              @input="updateHotel(hotel.id, 'pricePerRoom', $event.target.value)"
            />
          </div>

          <!-- Количество ночей -->
          <div>
            <label class="form-label">Количество ночей</label>
            <BaseInput
              v-model.number="hotel.nights"
              type="number"
              min="1"
              max="30"
              @input="updateHotel(hotel.id, 'nights', $event.target.value)"
            />
          </div>

          <!-- Валюта -->
          <div>
            <label class="form-label">Валюта</label>
            <select
              v-model="hotel.currency"
              class="form-input"
              @change="updateHotel(hotel.id, 'currency', $event.target.value)"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="ARS">ARS</option>
              <option value="CLP">CLP</option>
            </select>
          </div>
        </div>

        <!-- Расчет стоимости -->
        <div class="mt-4 p-3 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Количество номеров:</span>
              <span class="ml-2 font-medium">{{ calculateRooms(hotel) }}</span>
            </div>
            <div>
              <span class="text-gray-500">Стоимость за ночь:</span>
              <span class="ml-2 font-medium">{{
                formatCurrency(hotel.pricePerRoom * calculateRooms(hotel))
              }}</span>
            </div>
            <div>
              <span class="text-gray-500">Общая стоимость:</span>
              <span class="ml-2 font-medium">{{ formatCurrency(calculateHotelTotal(hotel)) }}</span>
            </div>
          </div>
        </div>

        <!-- Тип гостиницы -->
        <div class="mt-4">
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="hotel.isGuideHotel"
              @change="updateHotel(hotel.id, 'isGuideHotel', $event.target.checked)"
              class="mr-2"
            />
            <span class="text-sm font-medium text-gray-700">Гостиница для гида</span>
          </label>
          <p class="text-xs text-gray-500 mt-1">
            Если отмечено, стоимость будет учтена в расходах на гида
          </p>
        </div>

        <!-- Информация о гостинице из базы -->
        <div
          v-if="hotel.hotelId && selectedHotelInfo(hotel.hotelId)"
          class="mt-4 p-3 bg-blue-50 rounded-lg"
        >
          <h5 class="text-sm font-medium text-blue-900 mb-2">Информация о гостинице</h5>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-blue-700">Адрес:</span>
              <span class="ml-2 text-blue-900">{{ selectedHotelInfo(hotel.hotelId).address }}</span>
            </div>
            <div>
              <span class="text-blue-700">Телефон:</span>
              <span class="ml-2 text-blue-900">{{ selectedHotelInfo(hotel.hotelId).phone }}</span>
            </div>
            <div>
              <span class="text-blue-700">Поставщик:</span>
              <span class="ml-2 text-blue-900">{{
                selectedHotelInfo(hotel.hotelId).supplier
              }}</span>
            </div>
            <div>
              <span class="text-blue-700">Комиссия:</span>
              <span class="ml-2 text-blue-900"
                >{{ selectedHotelInfo(hotel.hotelId).commission }}%</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Итоговая информация -->
    <div v-if="hotels.length > 0" class="bg-blue-50 p-4 rounded-lg">
      <h4 class="text-sm font-medium text-blue-900 mb-3">Итоговая информация</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-blue-700">Всего гостиниц:</span>
          <span class="ml-2 font-medium text-blue-900">{{ hotels.length }}</span>
        </div>
        <div>
          <span class="text-blue-700">Общая стоимость:</span>
          <span class="ml-2 font-medium text-blue-900">{{ formatCurrency(totalCost) }}</span>
        </div>
        <div>
          <span class="text-blue-700">Для туристов:</span>
          <span class="ml-2 font-medium text-blue-900">{{ formatCurrency(touristCost) }}</span>
        </div>
        <div>
          <span class="text-blue-700">Для гида:</span>
          <span class="ml-2 font-medium text-blue-900">{{ formatCurrency(guideCost) }}</span>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-if="hotels.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-4">
        <Building class="w-12 h-12 mx-auto" />
      </div>
      <p class="text-gray-500">Гостиницы не добавлены</p>
      <p class="text-sm text-gray-400 mt-1">Нажмите "Добавить гостиницу" для начала</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Trash2, Building } from 'lucide-vue-next'
import { getHotelsByLocation, getHotelById } from '@/data/hotels'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  tourDays: {
    type: Number,
    default: 0,
  },
  location: {
    type: Object,
    default: () => ({}),
  },
  accommodationData: {
    type: Object,
    default: () => ({
      totalPax: 0,
      doubleCount: 0,
      singleCount: 0,
      tripleCount: 0,
      extraCount: 0,
    }),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

// Реактивные данные
const hotels = ref(props.modelValue || [])

// Вычисляемые свойства
const availableHotels = computed(() => {
  if (!props.location.country) return []
  return getHotelsByLocation(
    props.location.country,
    props.location.regions?.[0],
    props.location.cities?.[0],
  )
})

const totalCost = computed(() => {
  return hotels.value.reduce((sum, hotel) => sum + calculateHotelTotal(hotel), 0)
})

const touristCost = computed(() => {
  return hotels.value
    .filter((hotel) => !hotel.isGuideHotel)
    .reduce((sum, hotel) => sum + calculateHotelTotal(hotel), 0)
})

const guideCost = computed(() => {
  return hotels.value
    .filter((hotel) => hotel.isGuideHotel)
    .reduce((sum, hotel) => sum + calculateHotelTotal(hotel), 0)
})

// Методы
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const addHotel = () => {
  const newHotel = {
    id: generateId(),
    hotelId: '',
    name: '',
    category: '',
    city: '',
    paxCount: 1,
    accommodationType: 'double',
    pricePerRoom: 0,
    nights: 1,
    currency: 'USD',
    isGuideHotel: false,
    isManual: false,
  }

  hotels.value.push(newHotel)
  updateModelValue()
  emit('change', {
    type: 'add',
    hotel: newHotel,
  })
}

// Автоматическое распределение туристов по гостиницам
const distributeTourists = () => {
  const { totalPax, doubleCount, singleCount, tripleCount, extraCount } = props.accommodationData

  if (totalPax === 0 || hotels.value.length === 0) return

  // Распределяем туристов по гостиницам
  let remainingPax = totalPax
  let hotelIndex = 0

  // Сначала размещаем в дабл номерах
  for (let i = 0; i < doubleCount && remainingPax > 0 && hotelIndex < hotels.value.length; i++) {
    const hotel = hotels.value[hotelIndex]
    const paxForThisRoom = Math.min(2, remainingPax)
    hotel.paxCount = paxForThisRoom
    hotel.accommodationType = 'double'
    remainingPax -= paxForThisRoom
    hotelIndex++
  }

  // Затем в сингл номерах
  for (let i = 0; i < singleCount && remainingPax > 0 && hotelIndex < hotels.value.length; i++) {
    const hotel = hotels.value[hotelIndex]
    hotel.paxCount = 1
    hotel.accommodationType = 'single'
    remainingPax -= 1
    hotelIndex++
  }

  // Затем в трипл номерах
  for (let i = 0; i < tripleCount && remainingPax > 0 && hotelIndex < hotels.value.length; i++) {
    const hotel = hotels.value[hotelIndex]
    const paxForThisRoom = Math.min(3, remainingPax)
    hotel.paxCount = paxForThisRoom
    hotel.accommodationType = 'triple'
    remainingPax -= paxForThisRoom
    hotelIndex++
  }

  updateModelValue()
}

const removeHotel = (hotelId) => {
  const index = hotels.value.findIndex((hotel) => hotel.id === hotelId)
  if (index !== -1) {
    const removedHotel = hotels.value[index]
    hotels.value.splice(index, 1)
    updateModelValue()
    emit('change', {
      type: 'remove',
      hotel: removedHotel,
    })
  }
}

const updateHotel = (hotelId, field, value) => {
  const hotel = hotels.value.find((h) => h.id === hotelId)
  if (hotel) {
    hotel[field] = value
    updateModelValue()
    emit('change', {
      type: 'update',
      hotelId,
      field,
      value,
    })
  }
}

const onHotelSelect = (hotelId, selectedHotelId) => {
  const hotel = hotels.value.find((h) => h.id === hotelId)
  if (hotel && selectedHotelId) {
    const dbHotel = getHotelById(selectedHotelId)
    if (dbHotel) {
      hotel.name = dbHotel.name
      hotel.category = dbHotel.category
      hotel.city = dbHotel.city
      hotel.currency = dbHotel.currency
      hotel.isManual = false

      // Устанавливаем цену в зависимости от типа размещения
      const priceKey = hotel.accommodationType || 'double'
      hotel.pricePerRoom = dbHotel.priceRange[priceKey] || dbHotel.priceRange.double || 0
    }
  }

  updateModelValue()
  emit('change', {
    type: 'hotelSelect',
    hotelId,
    selectedHotelId,
  })
}

const enableManualHotel = (hotelId) => {
  const hotel = hotels.value.find((h) => h.id === hotelId)
  if (hotel) {
    hotel.hotelId = ''
    hotel.isManual = true
    updateModelValue()
  }
}

const selectedHotelInfo = (hotelId) => {
  return getHotelById(hotelId)
}

const calculateRooms = (hotel) => {
  if (hotel.accommodationType === 'double') {
    return Math.ceil(Number(hotel.paxCount) / 2)
  } else if (hotel.accommodationType === 'triple') {
    return Math.ceil(Number(hotel.paxCount) / 3)
  } else {
    return Number(hotel.paxCount)
  }
}

const calculateHotelTotal = (hotel) => {
  const rooms = calculateRooms(hotel)
  return rooms * Number(hotel.pricePerRoom || 0) * Number(hotel.nights || 1)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0)
}

const updateModelValue = () => {
  emit('update:modelValue', hotels.value)
}

// Следим за изменениями props
watch(
  () => props.modelValue,
  (newValue) => {
    hotels.value = newValue || []
  },
  { deep: true },
)

// Инициализация при монтировании
updateModelValue()
</script>

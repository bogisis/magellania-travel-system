<template>
  <div class="space-y-6">
    <!-- Выбор страны -->
    <div>
      <label class="form-label">Страна <span class="text-red-500">*</span></label>
      <div class="relative">
        <select
          v-model="selectedCountry"
          class="form-input w-full pr-10"
          @change="onCountryChange"
          required
        >
          <option value="">Выберите страну</option>
          <option v-for="country in priorityCountries" :key="country.id" :value="country.id">
            {{ country.name }}
          </option>
          <option value="all" class="font-semibold text-gray-700 border-t">── ВСЕ СТРАНЫ ──</option>
          <option v-for="country in otherCountries" :key="country.id" :value="country.id">
            {{ country.name }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
      <p v-if="errors.country" class="form-error">{{ errors.country }}</p>
    </div>

    <!-- Выбор регионов -->
    <div v-if="selectedCountry && selectedCountry !== 'all'">
      <label class="form-label">Регионы <span class="text-red-500">*</span></label>

      <!-- Переключатель режима -->
      <div class="flex items-center space-x-4 mb-3">
        <button
          type="button"
          @click="inputMode = 'select'"
          :class="
            inputMode === 'select' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
          "
          class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
        >
          Выбор из списка
        </button>
        <button
          type="button"
          @click="inputMode = 'manual'"
          :class="
            inputMode === 'manual' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
          "
          class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
        >
          Ручной ввод
        </button>
      </div>

      <!-- Режим выбора из списка -->
      <div v-if="inputMode === 'select'" class="space-y-3">
        <div class="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
          <div
            v-for="region in availableRegions"
            :key="region.id"
            class="flex items-center p-2 hover:bg-gray-50 rounded"
          >
            <input
              type="checkbox"
              :id="'region-' + region.id"
              :value="region.id"
              v-model="selectedRegions"
              @change="onRegionsChange"
              class="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label :for="'region-' + region.id" class="text-sm text-gray-700 cursor-pointer">
              {{ region.name }}
            </label>
          </div>
        </div>
      </div>

      <!-- Режим ручного ввода -->
      <div v-if="inputMode === 'manual'" class="space-y-3">
        <textarea
          v-model="manualRegions"
          rows="3"
          class="form-input w-full"
          placeholder="Введите названия регионов через запятую"
          @input="onManualRegionsInput"
        />
        <div class="flex items-center space-x-2">
          <button
            type="button"
            @click="confirmManualRegions"
            class="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
          >
            Подтвердить
          </button>
          <button
            type="button"
            @click="cancelManualRegions"
            class="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm"
          >
            Отмена
          </button>
        </div>
      </div>

      <!-- Выбранные регионы -->
      <div v-if="finalRegions.length > 0" class="mt-3">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(region, index) in finalRegions"
            :key="index"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
          >
            {{ region }}
            <button
              type="button"
              @click="removeRegion(index)"
              class="ml-1 text-primary-600 hover:text-primary-800"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <p v-if="errors.regions" class="form-error">{{ errors.regions }}</p>
    </div>

    <!-- Точки старта и финиша -->
    <div v-if="finalRegions.length > 0">
      <label class="form-label">Точки старта и финиша</label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Точка старта -->
        <div>
          <label class="form-label text-sm">Точка старта</label>
          <input
            v-model="startPoint"
            type="text"
            class="form-input"
            placeholder="Город начала тура"
            @input="onStartPointChange"
          />
        </div>

        <!-- Точка финиша -->
        <div>
          <label class="form-label text-sm">Точка финиша</label>
          <input
            v-model="endPoint"
            type="text"
            class="form-input"
            placeholder="Город окончания тура"
            @input="onEndPointChange"
          />
        </div>
      </div>
    </div>

    <!-- Выбор городов -->
    <div v-if="finalRegions.length > 0">
      <label class="form-label">Города <span class="text-red-500">*</span></label>

      <!-- Переключатель режима для городов -->
      <div class="flex items-center space-x-4 mb-3">
        <button
          type="button"
          @click="cityInputMode = 'select'"
          :class="
            cityInputMode === 'select' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
          "
          class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
        >
          Выбор из списка
        </button>
        <button
          type="button"
          @click="cityInputMode = 'manual'"
          :class="
            cityInputMode === 'manual' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
          "
          class="px-3 py-1 rounded-lg text-sm font-medium transition-colors"
        >
          Ручной ввод
        </button>
      </div>

      <!-- Режим выбора городов из списка -->
      <div v-if="cityInputMode === 'select'" class="space-y-3">
        <div class="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
          <div
            v-for="city in availableCities"
            :key="city"
            class="flex items-center p-2 hover:bg-gray-50 rounded"
          >
            <input
              type="checkbox"
              :id="'city-' + city"
              :value="city"
              v-model="selectedCities"
              @change="onCitiesChange"
              class="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label :for="'city-' + city" class="text-sm text-gray-700 cursor-pointer">
              {{ city }}
            </label>
          </div>
        </div>
      </div>

      <!-- Режим ручного ввода городов -->
      <div v-if="cityInputMode === 'manual'" class="space-y-3">
        <textarea
          v-model="manualCities"
          rows="3"
          class="form-input w-full"
          placeholder="Введите названия городов через запятую"
          @input="onManualCitiesInput"
        />
        <div class="flex items-center space-x-2">
          <button
            type="button"
            @click="confirmManualCities"
            class="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
          >
            Подтвердить
          </button>
          <button
            type="button"
            @click="cancelManualCities"
            class="px-3 py-1 text-gray-500 hover:text-gray-700 text-sm"
          >
            Отмена
          </button>
        </div>
      </div>

      <!-- Выбранные города -->
      <div v-if="finalCities.length > 0" class="mt-3">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(city, index) in finalCities"
            :key="index"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            {{ city }}
            <button
              type="button"
              @click="removeCity(index)"
              class="ml-1 text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <p v-if="errors.cities" class="form-error">{{ errors.cities }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  getSortedCountries,
  getRegionsByCountry,
  getCitiesByRegion,
  getCountryById,
  getRegionById,
} from '@/data/countries'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      country: '',
      regions: [],
      cities: [],
      startPoint: '',
      endPoint: '',
    }),
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

// Реактивные данные
const selectedCountry = ref(props.modelValue.country || '')
const selectedRegions = ref([])
const selectedCities = ref([])
const startPoint = ref(props.modelValue.startPoint || '')
const endPoint = ref(props.modelValue.endPoint || '')
const manualRegions = ref('')
const manualCities = ref('')
const inputMode = ref('select')
const cityInputMode = ref('select')

// Вычисляемые свойства
const sortedCountries = computed(() => getSortedCountries())

const priorityCountries = computed(() => {
  return sortedCountries.value.slice(0, 2) // Аргентина и Чили
})

const otherCountries = computed(() => {
  return sortedCountries.value.slice(2) // Остальные страны
})

const availableRegions = computed(() => {
  if (!selectedCountry.value || selectedCountry.value === 'all') return []
  return getRegionsByCountry(selectedCountry.value)
})

const availableCities = computed(() => {
  if (!selectedRegions.value.length && !manualRegionsList.value.length) return []

  const cities = new Set()

  // Добавляем города из выбранных регионов
  selectedRegions.value.forEach((regionId) => {
    const citiesInRegion = getCitiesByRegion(selectedCountry.value, regionId)
    citiesInRegion.forEach((city) => cities.add(city))
  })

  return Array.from(cities).sort()
})

const manualRegionsList = computed(() => {
  if (!manualRegions.value.trim()) return []
  return manualRegions.value
    .split(',')
    .map((r) => r.trim())
    .filter((r) => r)
})

const manualCitiesList = computed(() => {
  if (!manualCities.value.trim()) return []
  return manualCities.value
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c)
})

const finalRegions = computed(() => {
  const regions = []

  // Добавляем названия выбранных регионов
  selectedRegions.value.forEach((regionId) => {
    const region = getRegionById(selectedCountry.value, regionId)
    if (region) regions.push(region.name)
  })

  // Добавляем ручно введенные регионы
  regions.push(...manualRegionsList.value)

  return regions
})

const finalCities = computed(() => {
  const cities = []

  // Добавляем выбранные города
  cities.push(...selectedCities.value)

  // Добавляем ручно введенные города
  cities.push(...manualCitiesList.value)

  return cities
})

// Методы
const onCountryChange = () => {
  // Сбрасываем регионы и города при смене страны
  selectedRegions.value = []
  selectedCities.value = []
  manualRegions.value = ''
  manualCities.value = ''
  inputMode.value = 'select'
  cityInputMode.value = 'select'

  updateModelValue()
  emit('change', {
    country: selectedCountry.value,
    regions: finalRegions.value,
    cities: finalCities.value,
    startPoint: startPoint.value,
    endPoint: endPoint.value,
  })
}

const onRegionsChange = () => {
  manualRegions.value = ''

  // Автоматически загружаем города для выбранных регионов
  const allCities = new Set()
  selectedRegions.value.forEach((regionId) => {
    const citiesInRegion = getCitiesByRegion(selectedCountry.value, regionId)
    citiesInRegion.forEach((city) => allCities.add(city))
  })

  // Устанавливаем все доступные города как выбранные
  selectedCities.value = Array.from(allCities)

  updateModelValue()
  emit('change', {
    country: selectedCountry.value,
    regions: finalRegions.value,
    cities: finalCities.value,
    startPoint: startPoint.value,
    endPoint: endPoint.value,
  })
}

const onCitiesChange = () => {
  manualCities.value = ''
  updateModelValue()
  emit('change', {
    country: selectedCountry.value,
    regions: finalRegions.value,
    cities: finalCities.value,
    startPoint: startPoint.value,
    endPoint: endPoint.value,
  })
}

const onManualRegionsInput = () => {
  // Очищаем выбранные регионы при ручном вводе
  selectedRegions.value = []
}

const confirmManualRegions = () => {
  if (manualRegions.value.trim()) {
    updateModelValue()
    emit('change', {
      country: selectedCountry.value,
      regions: finalRegions.value,
      cities: finalCities.value,
      startPoint: startPoint.value,
      endPoint: endPoint.value,
    })
  }
}

const cancelManualRegions = () => {
  manualRegions.value = ''
}

const onManualCitiesInput = () => {
  // Очищаем выбранные города при ручном вводе
  selectedCities.value = []
}

const confirmManualCities = () => {
  if (manualCities.value.trim()) {
    updateModelValue()
    emit('change', {
      country: selectedCountry.value,
      regions: finalRegions.value,
      cities: finalCities.value,
      startPoint: startPoint.value,
      endPoint: endPoint.value,
    })
  }
}

const cancelManualCities = () => {
  manualCities.value = ''
}

const removeRegion = (index) => {
  if (index < selectedRegions.value.length) {
    // Удаляем из выбранных регионов
    selectedRegions.value.splice(index, 1)
  } else {
    // Удаляем из ручно введенных регионов
    const manualIndex = index - selectedRegions.value.length
    const regions = manualRegionsList.value
    regions.splice(manualIndex, 1)
    manualRegions.value = regions.join(', ')
  }
  updateModelValue()
}

const removeCity = (index) => {
  if (index < selectedCities.value.length) {
    // Удаляем из выбранных городов
    selectedCities.value.splice(index, 1)
  } else {
    // Удаляем из ручно введенных городов
    const manualIndex = index - selectedCities.value.length
    const cities = manualCitiesList.value
    cities.splice(manualIndex, 1)
    manualCities.value = cities.join(', ')
  }
  updateModelValue()
}

const onStartPointChange = () => {
  updateModelValue()
  emit('change', {
    country: selectedCountry.value,
    regions: finalRegions.value,
    cities: finalCities.value,
    startPoint: startPoint.value,
    endPoint: endPoint.value,
  })
}

const onEndPointChange = () => {
  updateModelValue()
  emit('change', {
    country: selectedCountry.value,
    regions: finalRegions.value,
    cities: finalCities.value,
    startPoint: startPoint.value,
    endPoint: endPoint.value,
  })
}

const updateModelValue = () => {
  const value = {
    country: selectedCountry.value,
    regions: finalRegions.value,
    cities: finalCities.value,
    startPoint: startPoint.value,
    endPoint: endPoint.value,
  }

  emit('update:modelValue', value)
}

// Следим за изменениями props
watch(
  () => props.modelValue,
  (newValue) => {
    // Обновляем только если значения действительно изменились
    if (selectedCountry.value !== newValue.country) {
      selectedCountry.value = newValue.country || ''
      selectedRegions.value = []
      selectedCities.value = []
      manualRegions.value = ''
      manualCities.value = ''
    }

    // Обновляем точки маршрута только если они изменились
    if (startPoint.value !== newValue.startPoint) {
      startPoint.value = newValue.startPoint || ''
    }
    if (endPoint.value !== newValue.endPoint) {
      endPoint.value = newValue.endPoint || ''
    }
  },
  { deep: true },
)

// Инициализация при монтировании
updateModelValue()
</script>

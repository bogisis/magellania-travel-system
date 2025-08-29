<template>
  <div class="space-y-8">
    <!-- Прогресс создания сметы -->
    <div class="bg-white rounded-xl shadow-soft p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Создание новой сметы</h2>
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <Clock class="w-4 h-4" />
          <span>Автосохранение каждые 30 сек</span>
          <div v-if="autoSaving" class="flex items-center space-x-1 text-green-600">
            <Loader class="w-3 h-3 animate-spin" />
            <span>Сохраняется...</span>
          </div>
        </div>
      </div>

      <!-- Индикатор прогресса -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700"
            >Шаг {{ currentStep }} из {{ totalSteps }}</span
          >
          <span class="text-sm text-gray-500"
            >{{ Math.round((currentStep / totalSteps) * 100) }}% завершено</span
          >
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          />
        </div>
      </div>

      <!-- Навигация по шагам -->
      <div class="flex items-center justify-center mb-8">
        <nav class="flex space-x-4">
          <button
            v-for="(step, index) in steps"
            :key="step.id"
            @click="currentStep = index + 1"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            :class="
              currentStep === index + 1
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : currentStep > index + 1
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
            "
          >
            <component
              :is="currentStep > index + 1 ? CheckCircle : step.icon"
              class="w-4 h-4 mr-2"
            />
            {{ step.title }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Контент шагов -->
    <div class="bg-white rounded-xl shadow-soft p-6">
      <!-- Шаг 1: Основная информация -->
      <div v-if="currentStep === 1" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Основная информация</h3>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <BaseInput
            v-model="estimate.name"
            label="Название сметы"
            placeholder="Тур по Патагонии для семьи Ивановых"
            required
            :error="errors.name"
          />

          <BaseInput
            v-model="estimate.tourName"
            label="Название тура"
            placeholder="Патагония: Край света"
            :error="errors.tourName"
          />
        </div>

        <!-- Выбор локации -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Локация тура</h4>
          <LocationSelector
            v-model="estimate.location"
            :errors="errors.location"
            @change="onLocationChange"
          />
        </div>

        <!-- Даты тура -->
        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-3">Даты тура</h4>
          <TourDateSelector
            v-model="estimate.tourDates"
            :errors="errors.tourDates"
            @change="onTourDatesChange"
          />
        </div>

        <div>
          <label class="form-label">Описание тура</label>
          <textarea
            v-model="estimate.description"
            rows="4"
            class="form-input"
            placeholder="Краткое описание тура, особенности, изюминки..."
          />
        </div>
      </div>

      <!-- Шаг 2: Группа туристов -->
      <div v-if="currentStep === 2" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Группа туристов</h3>

        <GroupManager
          v-model="estimate.groupData"
          :errors="errors.groupData"
          @change="onGroupDataChange"
        />
      </div>

      <!-- Шаг 3: Гостиницы -->
      <div v-if="currentStep === 3" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Гостиницы</h3>

        <HotelManager
          v-model="estimate.hotels"
          :tour-days="estimate.tourDates.days"
          @change="onHotelsChange"
        />
      </div>

      <!-- Шаг 4: Планирование дней -->
      <div v-if="currentStep === 4" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Планирование дней</h3>

        <TourDaysManager
          v-model="estimate.tourDays"
          :start-date="estimate.tourDates.startDate"
          :duration="estimate.tourDates.days"
          @change="onTourDaysChange"
        />
      </div>

      <!-- Шаг 5: Опциональные услуги -->
      <div v-if="currentStep === 5" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Опциональные услуги</h3>

        <div class="bg-yellow-50 p-4 rounded-lg">
          <div class="flex items-center space-x-2 mb-2">
            <Info class="w-5 h-5 text-yellow-600" />
            <span class="text-sm font-medium text-yellow-900">Информация</span>
          </div>
          <p class="text-sm text-yellow-700">
            Этот раздел находится в разработке. Здесь будут доступны дополнительные услуги, которые
            можно добавить в смету по выбору клиента.
          </p>
        </div>
      </div>

      <!-- Шаг 6: Итоги и настройки -->
      <div v-if="currentStep === 6" class="space-y-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Итоги и настройки</h3>

        <!-- Настройки наценки -->
        <div class="border border-gray-200 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Настройки наценки</h4>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="form-label">Показывать наценку</label>
              <div class="flex items-center space-x-4">
                <label class="flex items-center">
                  <input type="radio" v-model="estimate.showMargin" :value="true" class="mr-2" />
                  <span class="text-sm">Включить в стоимость</span>
                </label>
                <label class="flex items-center">
                  <input type="radio" v-model="estimate.showMargin" :value="false" class="mr-2" />
                  <span class="text-sm">Отдельной строкой</span>
                </label>
              </div>
            </div>

            <div>
              <label class="form-label">Валюта</label>
              <select v-model="estimate.currency" class="form-input">
                <option value="USD">USD - Доллар США</option>
                <option value="EUR">EUR - Евро</option>
                <option value="RUB">RUB - Российский рубль</option>
                <option value="ARS">ARS - Аргентинский песо</option>
                <option value="CLP">CLP - Чилийский песо</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Итоговая информация -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="text-sm font-medium text-blue-900 mb-3">Итоговая информация</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-blue-700">Продолжительность:</span>
              <span class="ml-2 font-medium text-blue-900">{{ estimate.tourDates.days }} дней</span>
            </div>
            <div>
              <span class="text-blue-700">Туристы:</span>
              <span class="ml-2 font-medium text-blue-900"
                >{{ estimate.groupData.totalPax }} человек</span
              >
            </div>
            <div>
              <span class="text-blue-700">Гиды:</span>
              <span class="ml-2 font-medium text-blue-900"
                >{{ estimate.groupData.guidesCount }} человек</span
              >
            </div>
            <div>
              <span class="text-blue-700">Гостиницы:</span>
              <span class="ml-2 font-medium text-blue-900">{{ estimate.hotels.length }} шт.</span>
            </div>
            <div>
              <span class="text-blue-700">Базовая стоимость:</span>
              <span class="ml-2 font-medium text-blue-900">{{
                formatCurrency(calculateBaseCost())
              }}</span>
            </div>
            <div>
              <span class="text-blue-700">Наценка:</span>
              <span class="ml-2 font-medium text-blue-900"
                >{{ estimate.groupData.marginPercent }}%</span
              >
            </div>
            <div>
              <span class="text-blue-700">Сумма наценки:</span>
              <span class="ml-2 font-medium text-blue-900">{{
                formatCurrency(calculateMarginAmount())
              }}</span>
            </div>
            <div>
              <span class="text-blue-700">Итоговая стоимость:</span>
              <span class="ml-2 font-medium text-blue-900">{{
                formatCurrency(calculateFinalCost())
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Навигация по шагам -->
    <div class="flex items-center justify-between">
      <BaseButton
        v-if="currentStep > 1"
        variant="outline"
        @click="currentStep--"
        :icon="ChevronLeft"
      >
        Назад
      </BaseButton>
      <div></div>

      <div class="flex items-center space-x-2">
        <BaseButton
          v-if="currentStep < totalSteps"
          variant="primary"
          @click="currentStep++"
          :icon-right="ChevronRight"
        >
          Далее
        </BaseButton>
        <BaseButton
          v-if="currentStep === totalSteps"
          variant="primary"
          @click="saveEstimate"
          :loading="isSaving"
          :icon="Save"
        >
          Сохранить смету
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Loader, CheckCircle, ChevronLeft, ChevronRight, Save, Info } from 'lucide-vue-next'
import { useEstimateStore } from '@/stores/estimates'
import { useToastStore } from '@/stores/toastStore'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import LocationSelector from '@/components/estimates/LocationSelector.vue'
import TourDateSelector from '@/components/estimates/TourDateSelector.vue'
import GroupManager from '@/components/estimates/GroupManager.vue'
import HotelManager from '@/components/estimates/HotelManager.vue'
import TourDaysManager from '@/components/estimates/TourDaysManager.vue'
import ActivityCreator from '@/components/estimates/ActivityCreator.vue'

const router = useRouter()
const estimateStore = useEstimateStore()
const toastStore = useToastStore()

// Состояние
const currentStep = ref(1)
const isSaving = ref(false)
const autoSaving = ref(false)
const errors = ref({})

// Шаги создания сметы
const steps = [
  { id: 1, title: 'Основная информация', icon: 'FileText' },
  { id: 2, title: 'Группа туристов', icon: 'Users' },
  { id: 3, title: 'Гостиницы', icon: 'Building' },
  { id: 4, title: 'Планирование дней', icon: 'Calendar' },
  { id: 5, title: 'Опциональные услуги', icon: 'Plus' },
  { id: 6, title: 'Итоги', icon: 'CheckCircle' },
]

const totalSteps = computed(() => steps.length)

// Данные сметы
const estimate = ref({
  name: '',
  tourName: '',
  description: '',
  location: {
    country: '',
    region: '',
    city: '',
  },
  tourDates: {
    dateType: 'exact',
    startDate: '',
    endDate: '',
    days: 0,
    conditionalStartDate: '',
    conditionalDays: 0,
  },
  groupData: {
    totalPax: 1,
    guidesCount: 1,
    marginPercent: 15,
    doubleCount: 0,
    doublePrice: 0,
    singleCount: 0,
    singlePrice: 0,
    tripleCount: 0,
    triplePrice: 0,
    extraCount: 0,
    extraPrice: 0,
  },
  hotels: [],
  tourDays: [],
  showMargin: true,
  currency: 'USD',
})

// Автосохранение
let autoSaveInterval = null

const startAutoSave = () => {
  autoSaveInterval = setInterval(() => {
    if (estimate.value.name) {
      autoSaving.value = true
      // Здесь будет логика автосохранения
      setTimeout(() => {
        autoSaving.value = false
      }, 1000)
    }
  }, 30000) // 30 секунд
}

const stopAutoSave = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
    autoSaveInterval = null
  }
}

// Обработчики событий
const onLocationChange = (change) => {
  console.log('Location changed:', change)
}

const onTourDatesChange = (change) => {
  console.log('Tour dates changed:', change)
}

const onGroupDataChange = (change) => {
  console.log('Group data changed:', change)
}

const onHotelsChange = (change) => {
  console.log('Hotels changed:', change)
}

const onTourDaysChange = (change) => {
  console.log('Tour days changed:', change)
}

// Расчеты
const calculateBaseCost = () => {
  // Расчет базовой стоимости на основе дней тура и гостиниц
  const tourDaysCost = estimate.value.tourDays.reduce((sum, day) => {
    return (
      sum +
      day.activities.reduce((daySum, activity) => {
        return daySum + Number(activity.cost || 0)
      }, 0)
    )
  }, 0)

  const hotelsCost = estimate.value.hotels.reduce((sum, hotel) => {
    const rooms =
      hotel.accommodationType === 'double'
        ? Math.ceil(Number(hotel.paxCount) / 2)
        : Number(hotel.paxCount)
    return sum + rooms * Number(hotel.pricePerRoom || 0) * Number(hotel.nights || 1)
  }, 0)

  return tourDaysCost + hotelsCost
}

const calculateMarginAmount = () => {
  return calculateBaseCost() * (Number(estimate.value.groupData.marginPercent || 0) / 100)
}

const calculateFinalCost = () => {
  return calculateBaseCost() + calculateMarginAmount()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: estimate.value.currency,
  }).format(amount || 0)
}

// Сохранение сметы
const saveEstimate = async () => {
  try {
    isSaving.value = true

    // Валидация
    if (!estimate.value.name) {
      errors.value.name = 'Название сметы обязательно'
      return
    }

    if (!estimate.value.location.country) {
      errors.value.location = { country: 'Выберите страну' }
      return
    }

    // Создание объекта сметы для сохранения
    const estimateData = {
      ...estimate.value,
      totalCost: calculateFinalCost(),
      baseCost: calculateBaseCost(),
      marginAmount: calculateMarginAmount(),
      createdAt: new Date().toISOString(),
      status: 'draft',
    }

    // Сохранение через store
    await estimateStore.createEstimate(estimateData)

    toastStore.showSuccess('Смета успешно создана!')
    router.push('/estimates')
  } catch (error) {
    console.error('Error saving estimate:', error)
    toastStore.showError('Ошибка при сохранении сметы')
  } finally {
    isSaving.value = false
  }
}

// Lifecycle
onMounted(() => {
  startAutoSave()
})

onUnmounted(() => {
  stopAutoSave()
})
</script>

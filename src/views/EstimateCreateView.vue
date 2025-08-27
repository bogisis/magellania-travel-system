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

          <div>
            <label class="form-label">Страна</label>
            <select v-model="estimate.country" class="form-input" required>
              <option value="">Выберите страну</option>
              <option value="Argentina">Аргентина</option>
              <option value="Chile">Чили</option>
              <option value="Peru">Перу</option>
              <option value="Uruguay">Уругвай</option>
            </select>
            <p v-if="errors.country" class="form-error">{{ errors.country }}</p>
          </div>

          <BaseInput
            v-model="estimate.region"
            label="Регион"
            placeholder="Патагония, Буэнос-Айрес..."
          />

          <BaseInput
            v-model="estimate.startDate"
            type="date"
            label="Дата начала тура"
            required
            :error="errors.startDate"
          />

          <BaseInput
            v-model.number="estimate.duration"
            type="number"
            label="Продолжительность (дни)"
            min="1"
            max="365"
            required
            :error="errors.duration"
          />
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <BaseInput
            v-model.number="estimate.paxCount"
            type="number"
            label="Количество туристов"
            min="1"
            max="50"
            required
            :error="errors.paxCount"
          />

          <BaseInput
            v-model.number="estimate.margin"
            type="number"
            label="Наценка (%)"
            min="0"
            max="100"
            :hint="`Прибыль: ${calculateMargin()}`"
          />

          <BaseInput
            v-model.number="estimate.discount"
            type="number"
            label="Скидка (%)"
            min="0"
            max="50"
            :hint="`Экономия: ${calculateDiscount()}`"
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

      <!-- Шаг 2: Планирование дней -->
      <div v-if="currentStep === 2" class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">
            Планирование дней тура ({{ estimate.duration }} дней)
          </h3>

          <BaseButton variant="outline" size="sm" :icon="Wand2" @click="generateDaysFromTemplate">
            Создать по шаблону
          </BaseButton>
        </div>

        <div class="space-y-4">
          <div
            v-for="(day, dayIndex) in tourDays"
            :key="dayIndex"
            class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div
                  class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium"
                >
                  {{ dayIndex + 1 }}
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-900">
                    День {{ dayIndex + 1 }} - {{ formatDate(day.date) }}
                  </h4>
                  <p class="text-xs text-gray-500">{{ day.location }}</p>
                </div>
              </div>

              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">
                  ${{ formatCurrency(day.totalPrice || 0) }}
                </p>
                <p class="text-xs text-gray-500">за день</p>
              </div>
            </div>

            <BaseInput
              v-model="day.title"
              placeholder="Название дня (например: Прилет в Буэнос-Айрес)"
              size="sm"
              class="mb-3"
            />

            <BaseInput v-model="day.location" placeholder="Локация" size="sm" class="mb-3" />

            <!-- Активности дня -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-gray-700">Активности</span>
                <BaseButton variant="ghost" size="sm" :icon="Plus" @click="addActivity(dayIndex)">
                  Добавить
                </BaseButton>
              </div>

              <div
                v-for="(activity, actIndex) in day.activities"
                :key="actIndex"
                class="flex items-center space-x-2 bg-gray-50 p-2 rounded-md"
              >
                <select
                  v-model="activity.category"
                  class="text-xs border-none bg-transparent focus:ring-0"
                >
                  <option value="transport">🚗 Транспорт</option>
                  <option value="excursion">📸 Экскурсия</option>
                  <option value="meal">🍽️ Питание</option>
                  <option value="hotel">🏨 Отель</option>
                  <option value="other">📋 Другое</option>
                </select>

                <input
                  v-model="activity.name"
                  placeholder="Название активности"
                  class="flex-1 text-xs border-none bg-transparent focus:ring-0"
                />

                <input
                  v-model.number="activity.quantity"
                  type="number"
                  min="1"
                  class="w-12 text-xs border-none bg-transparent focus:ring-0"
                />

                <input
                  v-model.number="activity.pricePerUnit"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  class="w-20 text-xs border-none bg-transparent focus:ring-0"
                />

                <button
                  @click="removeActivity(dayIndex, actIndex)"
                  class="text-red-500 hover:text-red-700"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Шаг 3: Опциональные услуги -->
      <div v-if="currentStep === 3" class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">Опциональные услуги</h3>
          <p class="text-sm text-gray-500">Услуги, которые клиент может выбрать дополнительно</p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            v-for="option in availableOptions"
            :key="option.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
          >
            <div class="flex items-start space-x-3">
              <input
                :id="`option-${option.id}`"
                v-model="selectedOptions"
                :value="option.id"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />

              <div class="flex-1">
                <label
                  :for="`option-${option.id}`"
                  class="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {{ option.name }}
                </label>
                <p class="text-xs text-gray-500 mt-1">{{ option.description }}</p>
                <p class="text-sm font-medium text-primary-600 mt-2">
                  ${{ formatCurrency(option.price) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Кастомная опция -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <h4 class="text-sm font-medium text-gray-700 mb-3">Добавить кастомную услугу</h4>

          <div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <BaseInput v-model="customOption.name" placeholder="Название услуги" size="sm" />

            <BaseInput v-model="customOption.description" placeholder="Описание" size="sm" />

            <BaseInput
              v-model.number="customOption.price"
              type="number"
              step="0.01"
              placeholder="Цена"
              size="sm"
            />

            <BaseButton
              variant="outline"
              size="sm"
              :icon="Plus"
              @click="addCustomOption"
              :disabled="!customOption.name || !customOption.price"
            >
              Добавить
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Шаг 4: Итоговый расчет -->
      <div v-if="currentStep === 4" class="space-y-6">
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Итоговый расчет сметы</h3>
          <p class="text-gray-600">Проверьте все данные перед сохранением</p>
        </div>

        <!-- Сводка по туру -->
        <div class="bg-gray-50 rounded-lg p-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Основная информация</h4>
              <dl class="space-y-2">
                <div class="flex justify-between text-sm">
                  <dt class="text-gray-500">Название:</dt>
                  <dd class="text-gray-900 font-medium">{{ estimate.name }}</dd>
                </div>
                <div class="flex justify-between text-sm">
                  <dt class="text-gray-500">Направление:</dt>
                  <dd class="text-gray-900">{{ estimate.country }}, {{ estimate.region }}</dd>
                </div>
                <div class="flex justify-between text-sm">
                  <dt class="text-gray-500">Даты:</dt>
                  <dd class="text-gray-900">
                    {{ formatDate(estimate.startDate) }} - {{ formatDate(endDate) }}
                  </dd>
                </div>
                <div class="flex justify-between text-sm">
                  <dt class="text-gray-500">Туристы:</dt>
                  <dd class="text-gray-900">{{ estimate.paxCount }} чел.</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Финансы</h4>
              <dl class="space-y-2">
                <div class="flex justify-between text-sm">
                  <dt class="text-gray-500">Базовая стоимость:</dt>
                  <dd class="text-gray-900">${{ formatCurrency(baseCost) }}</dd>
                </div>
                <div class="flex justify-between text-sm">
                  <dt class="text-gray-500">Наценка ({{ estimate.margin }}%):</dt>
                  <dd class="text-green-600">+${{ formatCurrency(marginAmount) }}</dd>
                </div>
                <div class="flex justify-between text-sm">
                  <dt class="text-gray-500">Скидка ({{ estimate.discount }}%):</dt>
                  <dd class="text-red-600">-${{ formatCurrency(discountAmount) }}</dd>
                </div>
                <div class="flex justify-between text-sm">
                  <dt class="text-gray-500">Опции:</dt>
                  <dd class="text-gray-900">+${{ formatCurrency(optionsTotal) }}</dd>
                </div>
                <div class="flex justify-between text-lg font-bold border-t pt-2">
                  <dt class="text-gray-900">Итого:</dt>
                  <dd class="text-primary-600">${{ formatCurrency(totalCost) }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <!-- Разбивка по дням -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-3">Разбивка по дням</h4>
          <div class="space-y-2">
            <div
              v-for="(day, index) in tourDays"
              :key="index"
              class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md"
            >
              <div>
                <p class="text-sm font-medium text-gray-900">{{ day.title }}</p>
                <p class="text-xs text-gray-500">
                  {{ formatDate(day.date) }} • {{ day.activities?.length || 0 }} активностей
                </p>
              </div>
              <p class="text-sm font-medium text-gray-900">
                ${{ formatCurrency(day.totalPrice || 0) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Навигация между шагами -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200">
        <BaseButton
          v-if="currentStep > 1"
          variant="outline"
          :icon="ChevronLeft"
          @click="currentStep--"
        >
          Назад
        </BaseButton>

        <div v-else></div>

        <div class="flex space-x-3">
          <BaseButton variant="ghost" @click="saveDraft" :loading="saving">
            Сохранить черновик
          </BaseButton>

          <BaseButton
            v-if="currentStep < totalSteps"
            variant="primary"
            :icon="ChevronRight"
            icon-right
            @click="nextStep"
            :disabled="!canProceedToNextStep"
          >
            Далее
          </BaseButton>

          <BaseButton v-else variant="success" :icon="Save" @click="saveEstimate" :loading="saving">
            Создать смету
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { format, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import {
  Clock,
  Loader,
  CheckCircle,
  Info,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Wand2,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-vue-next'

// Components
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

// Store
import { useEstimatesStore } from '@/stores/estimates'

const router = useRouter()
const estimatesStore = useEstimatesStore()

// Reactive state
const currentStep = ref(1)
const totalSteps = ref(4)
const autoSaving = ref(false)
const saving = ref(false)
const errors = ref({})

const steps = [
  { id: 1, title: 'Информация', icon: Info },
  { id: 2, title: 'Планирование', icon: Calendar },
  { id: 3, title: 'Опции', icon: DollarSign },
  { id: 4, title: 'Итог', icon: CheckCircle },
]

// Основные данные сметы
const estimate = ref({
  name: '',
  tourName: '',
  country: '',
  region: '',
  startDate: '',
  duration: 7,
  paxCount: 2,
  margin: 20,
  discount: 0,
  description: '',
})

// Дни тура
const tourDays = ref([])

// Опциональные услуги
const selectedOptions = ref([])
const customOption = ref({ name: '', description: '', price: 0 })

const availableOptions = ref([
  {
    id: 1,
    name: 'Страховка путешествий',
    description: 'Комплексная страховка на время тура',
    price: 150,
    category: 'insurance',
  },
  {
    id: 2,
    name: 'Дополнительная экскурсия по винодельням',
    description: 'Полудневная экскурсия с дегустацией',
    price: 85,
    category: 'excursion',
  },
  {
    id: 3,
    name: 'Индивидуальный трансфер',
    description: 'Комфортный трансфер на всех маршрутах',
    price: 200,
    category: 'transport',
  },
])

// Computed properties
const endDate = computed(() => {
  if (!estimate.value.startDate || !estimate.value.duration) return ''
  return format(
    addDays(new Date(estimate.value.startDate), estimate.value.duration - 1),
    'yyyy-MM-dd',
  )
})

const baseCost = computed(() => {
  return tourDays.value.reduce((sum, day) => sum + (day.totalPrice || 0), 0)
})

const marginAmount = computed(() => {
  return (baseCost.value * estimate.value.margin) / 100
})

const discountAmount = computed(() => {
  return ((baseCost.value + marginAmount.value) * estimate.value.discount) / 100
})

const optionsTotal = computed(() => {
  return selectedOptions.value.reduce((sum, optionId) => {
    const option = availableOptions.value.find((opt) => opt.id === optionId)
    return sum + (option?.price || 0)
  }, 0)
})

const totalCost = computed(() => {
  return baseCost.value + marginAmount.value - discountAmount.value + optionsTotal.value
})

const canProceedToNextStep = computed(() => {
  switch (currentStep.value) {
    case 1:
      return (
        estimate.value.name &&
        estimate.value.country &&
        estimate.value.startDate &&
        estimate.value.duration
      )
    case 2:
      return tourDays.value.length > 0
    case 3:
      return true // Опции не обязательны
    case 4:
      return true
    default:
      return false
  }
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US').format(amount || 0)
}

function formatDate(date) {
  if (!date) return ''
  return format(new Date(date), 'dd MMM yyyy', { locale: ru })
}

function calculateMargin() {
  return formatCurrency(marginAmount.value)
}

function calculateDiscount() {
  return formatCurrency(discountAmount.value)
}

function generateDaysFromTemplate() {
  const days = []

  for (let i = 0; i < estimate.value.duration; i++) {
    const dayDate = addDays(new Date(estimate.value.startDate), i)

    days.push({
      dayNumber: i + 1,
      date: format(dayDate, 'yyyy-MM-dd'),
      title: `День ${i + 1}`,
      location: estimate.value.region || estimate.value.country,
      activities: [],
      totalPrice: 0,
    })
  }

  tourDays.value = days
}

function addActivity(dayIndex) {
  tourDays.value[dayIndex].activities.push({
    category: 'other',
    name: '',
    quantity: 1,
    pricePerUnit: 0,
    totalPrice: 0,
  })
}

function removeActivity(dayIndex, activityIndex) {
  tourDays.value[dayIndex].activities.splice(activityIndex, 1)
  recalculateDayTotal(dayIndex)
}

function recalculateDayTotal(dayIndex) {
  const day = tourDays.value[dayIndex]
  day.totalPrice = day.activities.reduce((sum, activity) => {
    return sum + activity.quantity * activity.pricePerUnit
  }, 0)
}

function addCustomOption() {
  if (customOption.value.name && customOption.value.price) {
    const newOption = {
      id: Date.now(),
      name: customOption.value.name,
      description: customOption.value.description,
      price: parseFloat(customOption.value.price),
      category: 'custom',
    }

    availableOptions.value.push(newOption)
    selectedOptions.value.push(newOption.id)

    // Очищаем форму
    customOption.value = { name: '', description: '', price: 0 }
  }
}

function validateStep(step) {
  errors.value = {}

  switch (step) {
    case 1:
      if (!estimate.value.name) errors.value.name = 'Укажите название сметы'
      if (!estimate.value.country) errors.value.country = 'Выберите страну'
      if (!estimate.value.startDate) errors.value.startDate = 'Укажите дату начала'
      if (!estimate.value.duration || estimate.value.duration < 1) {
        errors.value.duration = 'Продолжительность должна быть не менее 1 дня'
      }
      break
  }

  return Object.keys(errors.value).length === 0
}

function nextStep() {
  if (validateStep(currentStep.value)) {
    if (currentStep.value === 1 && tourDays.value.length === 0) {
      generateDaysFromTemplate()
    }
    currentStep.value++
  }
}

async function saveDraft() {
  saving.value = true

  try {
    const estimateData = {
      ...estimate.value,
      status: 'draft',
      tourDays: tourDays.value,
      selectedOptions: selectedOptions.value,
      totalPrice: totalCost.value,
    }

    const estimateId = await estimatesStore.createEstimate(estimateData)
    window.$toast?.success('Черновик сохранен', 'Смета сохранена как черновик')

    // Перенаправляем на редактирование
    router.push(`/estimates/${estimateId}/edit`)
  } catch (error) {
    window.$toast?.error('Ошибка', 'Не удалось сохранить черновик')
  } finally {
    saving.value = false
  }
}

async function saveEstimate() {
  if (!validateStep(currentStep.value)) return

  saving.value = true

  try {
    const estimateData = {
      ...estimate.value,
      status: 'draft',
      tourDays: tourDays.value,
      selectedOptions: selectedOptions.value,
      totalPrice: totalCost.value,
      baseCost: baseCost.value,
      marginAmount: marginAmount.value,
      discountAmount: discountAmount.value,
      optionsTotal: optionsTotal.value,
    }

    const estimateId = await estimatesStore.createEstimate(estimateData)
    window.$toast?.success('Смета создана', 'Смета успешно создана')

    router.push(`/estimates/${estimateId}`)
  } catch (error) {
    window.$toast?.error('Ошибка', 'Не удалось создать смету')
  } finally {
    saving.value = false
  }
}

// Автосохранение
let autoSaveInterval
function startAutoSave() {
  autoSaveInterval = setInterval(async () => {
    if (estimate.value.name && currentStep.value > 1) {
      autoSaving.value = true
      // Здесь можно добавить логику автосохранения
      setTimeout(() => {
        autoSaving.value = false
      }, 1000)
    }
  }, 30000) // 30 секунд
}

// Watchers
watch(
  () => tourDays.value,
  () => {
    tourDays.value.forEach((day, index) => {
      recalculateDayTotal(index)
    })
  },
  { deep: true },
)

watch(
  () => estimate.value.duration,
  (newDuration) => {
    if (newDuration && estimate.value.startDate) {
      if (tourDays.value.length === 0 && currentStep.value > 1) {
        generateDaysFromTemplate()
      }
    }
  },
)

// Lifecycle
onMounted(() => {
  startAutoSave()

  // Устанавливаем дату по умолчанию на завтра
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  estimate.value.startDate = format(tomorrow, 'yyyy-MM-dd')
})

onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
  }
})
</script>

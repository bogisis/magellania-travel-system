<template>
  <div class="max-w-7xl mx-auto p-6 space-y-8">
    <!-- Заголовок -->
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Создание сметы</h1>
      <p class="text-gray-600">Заполните информацию о туре для создания детальной сметы</p>
    </div>

    <!-- Прогресс -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Прогресс заполнения</span>
        <span class="text-sm text-gray-500">{{ progressPercentage }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-primary-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: progressPercentage + '%' }"
        />
      </div>
    </div>

    <!-- Отладочная информация -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 class="text-lg font-semibold mb-2">Отладка EstimateCreator:</h3>
      <p><strong>Props ID:</strong> {{ props.initialData?.id || 'Нет' }}</p>
      <p><strong>Estimate ID:</strong> {{ estimate.id }}</p>
      <p><strong>Client:</strong> {{ estimate.client || 'Пусто' }}</p>
      <p><strong>Title:</strong> {{ estimate.title || 'Пусто' }}</p>
      <p><strong>Location Country:</strong> {{ estimate.location?.country || 'Пусто' }}</p>
      <p><strong>Group TotalPax:</strong> {{ estimate.group?.totalPax || 0 }}</p>

      <!-- Кнопки для диагностики расчетов -->
      <div class="mt-4 pt-4 border-t border-yellow-200">
        <div class="flex gap-2 flex-wrap">
          <button
            type="button"
            @click="runCalculationTestsLocal"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            🧮 Запустить тесты расчетов
          </button>
          <button
            type="button"
            @click="runMathDiagnostics"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            🔍 Диагностика математических проблем
          </button>
          <button
            type="button"
            @click="runComprehensiveTests"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            🧪 Комплексное тестирование
          </button>
        </div>
      </div>
    </div>

    <!-- Основная форма -->
    <form @submit.prevent="saveEstimate" class="space-y-8">
      <!-- Основная информация о смете -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Клиент -->
          <div>
            <label class="form-label">Клиент</label>
            <input
              v-model="estimate.client"
              type="text"
              class="form-input"
              placeholder="Имя клиента или название компании"
              @input="onClientChange"
            />
            <div class="flex items-center justify-between mt-1">
              <p class="text-sm text-gray-500">Можно создать карточку клиента в CRM</p>
              <button
                type="button"
                class="text-sm text-primary-600 hover:text-primary-700 underline"
                @click="createClientCard"
              >
                Завести карточку
              </button>
            </div>
          </div>

          <!-- Название сметы -->
          <div>
            <label class="form-label">Название сметы</label>
            <input
              v-model="estimate.title"
              type="text"
              class="form-input"
              placeholder="Название сметы"
              @input="onTitleChange"
            />
          </div>
        </div>

        <!-- Описание тура -->
        <div class="mt-6">
          <label class="form-label">Описание тура (опционально)</label>
          <textarea
            v-model="estimate.description"
            rows="4"
            class="form-input w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Краткое описание тура, особенности, пожелания клиента..."
            @input="onDescriptionChange"
          />
        </div>
      </div>

      <!-- Информация о группе и туре -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Информация о группе и туре</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Выбор локации -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Локация</h3>
            <LocationSelector
              v-model="estimate.location"
              :errors="errors.location"
              @change="onLocationChange"
            />
          </div>

          <!-- Даты тура -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-3">Даты тура</h3>
            <TourDateSelector
              v-model="estimate.tourDates"
              :errors="errors.tourDates"
              @change="onTourDatesChange"
            />
          </div>
        </div>
      </div>

      <!-- Управление группой -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Управление группой</h2>
        <GroupManager
          v-model="estimate.group"
          :tour-days="estimate.tourDays.length"
          @change="onGroupChange"
        />
      </div>

      <!-- Гостиницы -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Гостиницы</h2>
        <HotelManager
          v-model="estimate.hotels"
          :tour-days="estimate.tourDays.length"
          :location="estimate.location"
          :accommodation-data="estimate.group"
          @change="onHotelsChange"
        />
      </div>

      <!-- Дни тура -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Дни тура</h2>
        <TourDaysManager
          v-model="estimate.tourDays"
          :tour-dates="estimate.tourDates"
          @change="onTourDaysChange"
        />
      </div>

      <!-- Опциональные услуги -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Опциональные услуги</h2>
        <OptionalServicesManager
          v-model="estimate.optionalServices"
          :tour-days="estimate.tourDays"
          @change="onOptionalServicesChange"
          @move-to-estimate="onMoveToEstimate"
        />
      </div>

      <!-- Настройки сметы -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Настройки сметы</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Наценка -->
          <div>
            <label class="form-label">Наценка (%)</label>
            <select v-model="estimate.markup" class="form-input" @change="onMarkupChange">
              <option value="0">Без наценки</option>
              <option value="5">5%</option>
              <option value="10">10%</option>
              <option value="15">15%</option>
              <option value="20">20%</option>
              <option value="25">25%</option>
              <option value="30">30%</option>
              <option value="40">40%</option>
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
            </select>
            <p class="text-sm text-gray-500 mt-1">Процент наценки к базовой стоимости</p>
          </div>

          <!-- Валюта -->
          <div>
            <label class="form-label">Валюта</label>
            <select v-model="estimate.currency" class="form-input" @change="onCurrencyChange">
              <option value="USD">USD - Доллар США</option>
              <option value="EUR">EUR - Евро</option>
              <option value="ARS">ARS - Аргентинский песо</option>
              <option value="CLP">CLP - Чилийский песо</option>
            </select>
          </div>
        </div>

        <!-- Курсы валют -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-medium text-gray-900">Курсы валют</h4>
            <BaseButton
              type="button"
              variant="outline"
              size="sm"
              @click="updateExchangeRates"
              :icon="RefreshCw"
              :loading="updatingRates"
            >
              Обновить курсы
            </BaseButton>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div v-for="currency in availableCurrencies" :key="currency.code" class="text-center">
              <div class="text-gray-600">{{ currency.code }}</div>
              <div class="font-medium">{{ formatExchangeRate(currency.code) }}</div>
            </div>
          </div>
        </div>

        <!-- Показ сметы с/без наценки -->
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">Показать смету:</span>
            <div class="flex items-center space-x-2">
              <BaseButton
                type="button"
                variant="outline"
                size="sm"
                @click="showEstimateWithMarkup = true"
                :class="
                  showEstimateWithMarkup ? 'bg-primary-100 text-primary-700 border-primary-200' : ''
                "
              >
                С наценкой
              </BaseButton>
              <BaseButton
                type="button"
                variant="outline"
                size="sm"
                @click="showEstimateWithMarkup = false"
                :class="
                  !showEstimateWithMarkup
                    ? 'bg-primary-100 text-primary-700 border-primary-200'
                    : ''
                "
              >
                Без наценки
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Предварительный расчет -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Предварительный расчет</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="text-sm text-blue-600">Базовая стоимость</div>
            <div class="text-xl font-bold text-blue-900">{{ formatCurrency(baseCost) }}</div>
          </div>

          <div class="p-4 bg-green-50 rounded-lg">
            <div class="text-sm text-green-600">Наценка ({{ estimate.markup }}%)</div>
            <div class="text-xl font-bold text-green-900">{{ formatCurrency(markupAmount) }}</div>
          </div>

          <div class="p-4 bg-purple-50 rounded-lg">
            <div class="text-sm text-purple-600">Итоговая стоимость</div>
            <div class="text-xl font-bold text-purple-900">{{ formatCurrency(finalCost) }}</div>
          </div>

          <div class="p-4 bg-orange-50 rounded-lg">
            <div class="text-sm text-orange-600">Комиссия</div>
            <div class="text-xl font-bold text-orange-900">
              {{ formatCurrency(commissionAmount) }}
            </div>
          </div>
        </div>

        <!-- Детализация -->
        <div class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">Детализация расходов</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Гостиницы:</span>
                <span class="font-medium">{{ formatCurrency(hotelsCost) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Активности:</span>
                <span class="font-medium">{{ formatCurrency(activitiesCost) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Транспорт:</span>
                <span class="font-medium">{{ formatCurrency(transportCost) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Питание:</span>
                <span class="font-medium">{{ formatCurrency(mealsCost) }}</span>
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between font-medium">
                  <span>Итого:</span>
                  <span>{{ formatCurrency(baseCost) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3">Информация о группе</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Всего туристов:</span>
                <span class="font-medium">{{ estimate.group.totalPax }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Дабл размещение:</span>
                <span class="font-medium">{{ estimate.group.doubleCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Сингл размещение:</span>
                <span class="font-medium">{{ estimate.group.singleCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Гиды:</span>
                <span class="font-medium">{{ estimate.group.guidesCount }}</span>
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between font-medium">
                  <span>Дней тура:</span>
                  <span>{{ estimate.tourDays.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex items-center justify-between pt-6 border-t">
        <div class="flex items-center space-x-4">
          <BaseButton type="button" variant="outline" @click="saveDraft" :icon="Save">
            Сохранить черновик
          </BaseButton>

          <BaseButton type="button" variant="outline" @click="exportToCSV" :icon="Download">
            Экспорт в CSV
          </BaseButton>
        </div>

        <div class="flex items-center space-x-4">
          <BaseButton type="button" variant="outline" @click="previewEstimate" :icon="Eye">
            Предварительный просмотр
          </BaseButton>

          <BaseButton type="submit" variant="primary" :icon="Check" :disabled="!isFormValid">
            Сохранить смету
          </BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { Save, Download, Eye, Check, RefreshCw } from 'lucide-vue-next'
import { runCalculationTests, validateEstimate } from '@/utils/calculationTests.js'
import { CalculationService } from '@/services/CalculationService.js'
import { runComprehensiveMathTests } from '@/utils/comprehensiveMathTests.js'
import { provideEstimateContext } from '@/composables/useEstimateContext.js'
import LocationSelector from './LocationSelector.vue'
import TourDateSelector from './TourDateSelector.vue'
import GroupManager from './GroupManager.vue'
import HotelManager from './HotelManager.vue'
import TourDaysManager from './TourDaysManager.vue'
import OptionalServicesManager from './OptionalServicesManager.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import currencyService from '@/services/currencyService'

// Props
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
})

// Emits
const emit = defineEmits(['save', 'save-draft', 'export', 'preview'])

// Реактивные данные
const estimate = ref({
  id: props.initialData.id || generateId(),
  client: props.initialData.client || '',
  title: props.initialData.title || '',
  description: props.initialData.description || '',
  location: props.initialData.location || {
    country: '',
    regions: [],
    cities: [],
    startPoint: '',
    endPoint: '',
  },
  tourDates: props.initialData.tourDates || {
    dateType: 'exact',
    startDate: '',
    endDate: '',
    days: 0,
  },
  group: props.initialData.group || {
    totalPax: 0,
    doubleCount: 0,
    singleCount: 0,
    guidesCount: 0,
    markup: 0,
  },
  hotels: props.initialData.hotels || [],
  tourDays: props.initialData.tourDays || [],
  optionalServices: props.initialData.optionalServices || [],
  markup: props.initialData.markup || 0,
  currency: props.initialData.currency || 'USD',
  createdAt: props.initialData.createdAt || new Date().toISOString(),
  updatedAt: props.initialData.updatedAt || new Date().toISOString(),
})

// Предоставляем контекст сметы для дочерних компонентов
const estimateContext = provideEstimateContext(estimate.value)

// Watcher для обновления данных при изменении props
watch(
  () => props.initialData,
  (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      estimate.value = {
        id: newData.id || estimate.value.id,
        client: newData.client || '',
        title: newData.title || '',
        description: newData.description || '',
        location: newData.location || {
          country: '',
          regions: [],
          cities: [],
          startPoint: '',
          endPoint: '',
        },
        tourDates: newData.tourDates || {
          dateType: 'exact',
          startDate: '',
          endDate: '',
          days: 0,
        },
        group: newData.group || {
          totalPax: 0,
          doubleCount: 0,
          singleCount: 0,
          guidesCount: 0,
          markup: 0,
        },
        hotels: newData.hotels || [],
        tourDays: newData.tourDays || [],
        optionalServices: newData.optionalServices || [],
        markup: newData.markup || 0,
        currency: newData.currency || 'USD',
        createdAt: newData.createdAt || estimate.value.createdAt,
        updatedAt: newData.updatedAt || estimate.value.updatedAt,
      }
    }
  },
  { deep: true, immediate: true },
)

const errors = ref({})
const showEstimateWithMarkup = ref(true)
const updatingRates = ref(false)

// Вычисляемые свойства
const progressPercentage = computed(() => {
  let progress = 0
  const totalSteps = 6

  if (estimate.value.location.country) progress += 16.67
  if (estimate.value.tourDates.startDate || estimate.value.tourDates.conditionalStartDate)
    progress += 16.67
  if (estimate.value.group.totalPax > 0) progress += 16.67
  if (estimate.value.hotels.length > 0) progress += 16.67
  if (estimate.value.tourDays.length > 0) progress += 16.67
  if (estimate.value.markup >= 0) progress += 16.67

  return Math.round(progress)
})

const isFormValid = computed(() => {
  return (
    estimate.value.client &&
    estimate.value.title &&
    estimate.value.location.country &&
    estimate.value.location.regions?.length > 0 &&
    estimate.value.location.cities?.length > 0 &&
    estimate.value.group.totalPax > 0 &&
    estimate.value.tourDays.length > 0
  )
})

// Используем CalculationService для всех расчетов
const baseCost = computed(() => {
  return CalculationService.calculateBaseCost(estimate.value)
})

const markupAmount = computed(() => {
  return CalculationService.calculateMarkupAmount(estimate.value)
})

const finalCost = computed(() => {
  return CalculationService.calculateFinalCost(estimate.value)
})

const commissionAmount = computed(() => {
  return showEstimateWithMarkup.value
    ? markupAmount.value
    : CalculationService.calculateMarkupAmount(estimate.value)
})

const availableCurrencies = computed(() => {
  return currencyService.getAvailableCurrencies()
})

const hotelsCost = computed(() => {
  return estimate.value.hotels
    .filter((hotel) => !hotel.isGuideHotel)
    .reduce((sum, hotel) => {
      return sum + CalculationService.calculateHotelTotal(hotel)
    }, 0)
})

const activitiesCost = computed(() => {
  return estimate.value.tourDays.reduce((sum, day) => {
    return sum + CalculationService.calculateDayTotal(day)
  }, 0)
})

const transportCost = computed(() => {
  // Здесь можно добавить логику расчета транспортных расходов
  return 0
})

const mealsCost = computed(() => {
  // Здесь можно добавить логику расчета расходов на питание
  return 0
})

// Методы
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function formatCurrency(amount) {
  return currencyService.formatCurrency(amount, estimate.value.currency)
}

function formatExchangeRate(currencyCode) {
  const rate = currencyService.exchangeRates[currencyCode] || 1
  return currencyService.formatCurrency(rate, currencyCode)
}

// Функция для запуска тестов расчетов
function runCalculationTestsLocal() {
  console.log('🧮 Запуск тестов математических расчетов...')

  // Сначала запускаем общие тесты
  const testResults = runCalculationTests()

  // Затем проверяем текущую смету
  console.log('\n🔍 Проверка текущей сметы:')
  const validationResults = validateEstimate(estimate.value)

  // Выводим результаты в консоль
  console.log('\n📊 Итоговые результаты:')
  console.log(`✅ Тесты пройдено: ${testResults.passed}`)
  console.log(`❌ Тесты провалено: ${testResults.failed}`)

  if (validationResults.warnings.length > 0) {
    console.log('⚠️ Предупреждения по текущей смете:')
    validationResults.warnings.forEach((warning) => console.log(`  - ${warning}`))
  }

  // Показываем уведомление пользователю
  const message =
    testResults.failed > 0
      ? `Найдено ${testResults.failed} проблем в расчетах!`
      : 'Все расчеты корректны!'

  alert(message)
}

// Функция для детальной диагностики математических проблем
function runMathDiagnostics() {
  console.log('🔍 Запуск детальной диагностики математических проблем...')
  console.log('='.repeat(60))

  // 1. Проверка типов данных
  console.log('\n📊 Проверка типов данных:')
  estimate.value.hotels.forEach((hotel, index) => {
    console.log(`Отель ${index + 1}:`)
    console.log(`  paxCount: ${hotel.paxCount} (тип: ${typeof hotel.paxCount})`)
    console.log(`  pricePerRoom: ${hotel.pricePerRoom} (тип: ${typeof hotel.pricePerRoom})`)
    console.log(`  nights: ${hotel.nights} (тип: ${typeof hotel.nights})`)
    console.log(`  accommodationType: ${hotel.accommodationType}`)
  })

  // 2. Проверка расчетов
  console.log('\n🧮 Проверка расчетов:')
  const localBaseCost = baseCost.value
  const serviceBaseCost = CalculationService.calculateBaseCost(estimate.value)
  const localMarkup = markupAmount.value
  const serviceMarkup = CalculationService.calculateMarkupAmount(estimate.value)
  const localFinal = finalCost.value
  const serviceFinal = CalculationService.calculateFinalCost(estimate.value)

  console.log(`Базовая стоимость:`)
  console.log(`  Локальный расчет: ${localBaseCost}`)
  console.log(`  Сервисный расчет: ${serviceBaseCost}`)
  console.log(`  Разница: ${Math.abs(localBaseCost - serviceBaseCost)}`)

  console.log(`Наценка:`)
  console.log(`  Локальный расчет: ${localMarkup}`)
  console.log(`  Сервисный расчет: ${serviceMarkup}`)
  console.log(`  Разница: ${Math.abs(localMarkup - serviceMarkup)}`)

  console.log(`Финальная стоимость:`)
  console.log(`  Локальный расчет: ${localFinal}`)
  console.log(`  Сервисный расчет: ${serviceFinal}`)
  console.log(`  Разница: ${Math.abs(localFinal - serviceFinal)}`)

  // 3. Проверка на проблемы
  const problems = []
  const warnings = []

  if (Math.abs(localBaseCost - serviceBaseCost) > 0.01) {
    problems.push('❌ Несоответствие базовой стоимости между локальными и сервисными методами')
  }

  if (Math.abs(localMarkup - serviceMarkup) > 0.01) {
    problems.push('❌ Несоответствие наценки между локальными и сервисными методами')
  }

  if (Math.abs(localFinal - serviceFinal) > 0.01) {
    problems.push('❌ Несоответствие финальной стоимости между локальными и сервисными методами')
  }

  if (localBaseCost > 1000000) {
    warnings.push('⚠️ Подозрительно высокая базовая стоимость (>$1M)')
  }

  if (localFinal > 1000000) {
    warnings.push('⚠️ Подозрительно высокая финальная стоимость (>$1M)')
  }

  // 4. Проверка данных
  console.log('\n📋 Проверка данных:')
  console.log(`Количество отелей: ${estimate.value.hotels.length}`)
  console.log(`Количество дней тура: ${estimate.value.tourDays.length}`)
  console.log(`Количество опциональных услуг: ${estimate.value.optionalServices.length}`)
  console.log(`Наценка: ${estimate.value.markup}%`)

  // 5. Вывод результатов
  console.log('\n' + '='.repeat(60))
  console.log('📊 РЕЗУЛЬТАТЫ ДИАГНОСТИКИ:')
  console.log('='.repeat(60))

  if (problems.length > 0) {
    console.log('\n🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ:')
    problems.forEach((problem) => console.log(problem))
  }

  if (warnings.length > 0) {
    console.log('\n⚠️ ПРЕДУПРЕЖДЕНИЯ:')
    warnings.forEach((warning) => console.log(warning))
  }

  if (problems.length === 0 && warnings.length === 0) {
    console.log('\n✅ Все математические расчеты корректны!')
  }

  console.log('\n' + '='.repeat(60))

  // Показываем уведомление пользователю
  const message =
    problems.length > 0
      ? `Найдено ${problems.length} критических проблем в расчетах!`
      : warnings.length > 0
        ? `Найдено ${warnings.length} предупреждений в расчетах.`
        : 'Все математические расчеты корректны!'

  alert(message)
}

// Функция для запуска комплексного тестирования
function runComprehensiveTests() {
  console.log('🧪 Запуск комплексного тестирования математических расчетов...')

  try {
    const results = runComprehensiveMathTests()

    // Показываем уведомление пользователю
    const message =
      results.failed === 0
        ? `🎉 Все ${results.total} тестов пройдены успешно!`
        : `⚠️ Пройдено ${results.passed} из ${results.total} тестов. ${results.failed} тестов провалено.`

    alert(message)
  } catch (error) {
    console.error('Ошибка при запуске комплексных тестов:', error)
    alert('Ошибка при запуске комплексных тестов: ' + error.message)
  }
}

async function updateExchangeRates() {
  updatingRates.value = true
  try {
    await currencyService.updateExchangeRates()
    // Если выбрана ARS, обновляем blue rate
    if (estimate.value.currency === 'ARS') {
      await currencyService.updateBlueRate()
    }
  } catch (error) {
    console.error('Ошибка обновления курсов валют:', error)
  } finally {
    updatingRates.value = false
  }
}

function onLocationChange(change) {
  console.log('Location changed:', change)
}

function onTourDatesChange(change) {
  console.log('Tour dates changed:', change)
}

function onGroupChange(change) {
  console.log('Group changed:', change)
}

function onHotelsChange(change) {
  console.log('Hotels changed:', change)
}

function onTourDaysChange(change) {
  console.log('Tour days changed:', change)
}

function onOptionalServicesChange(change) {
  console.log('Optional services changed:', change)
}

function onClientChange(event) {
  estimate.value.client = event.target.value
}

function onTitleChange(event) {
  estimate.value.title = event.target.value
}

function onDescriptionChange(event) {
  estimate.value.description = event.target.value
}

function createClientCard() {
  if (!estimate.value.client.trim()) {
    alert('Сначала введите имя клиента')
    return
  }

  // Здесь будет логика создания карточки клиента в CRM
  console.log('Создание карточки клиента:', estimate.value.client)
  alert(`Карточка клиента "${estimate.value.client}" будет создана в CRM`)
}

function onMoveToEstimate(data) {
  console.log('Move to estimate:', data)
  // Здесь логика переноса услуги в конкретный день
}

function onMarkupChange() {
  console.log('Markup changed:', estimate.value.markup)
}

function onCurrencyChange() {
  console.log('Currency changed:', estimate.value.currency)
}

function saveEstimate() {
  if (!isFormValid.value) {
    alert('Пожалуйста, заполните все обязательные поля')
    return
  }

  // Подготавливаем данные для API
  const estimateData = {
    ...estimate.value,
    name: estimate.value.title || 'Новая смета',
    tourName: estimate.value.title || 'Новый тур',
    updatedAt: new Date().toISOString(),
  }

  emit('save', estimateData)
}

function saveDraft() {
  // Подготавливаем данные для API
  const estimateData = {
    ...estimate.value,
    name: estimate.value.title || 'Черновик сметы',
    tourName: estimate.value.title || 'Черновик тура',
    updatedAt: new Date().toISOString(),
  }

  emit('save-draft', estimateData)
}

function exportToCSV() {
  const estimateData = {
    ...estimate.value,
    name: estimate.value.title || 'Смета',
    tourName: estimate.value.title || 'Тур',
  }
  emit('export', estimateData)
}

function previewEstimate() {
  const estimateData = {
    ...estimate.value,
    name: estimate.value.title || 'Смета',
    tourName: estimate.value.title || 'Тур',
  }
  emit('preview', estimateData)
}

// Автосохранение каждые 30 секунд
let autoSaveInterval
watch(
  estimate,
  () => {
    clearTimeout(autoSaveInterval)
    autoSaveInterval = setTimeout(() => {
      if (isFormValid.value) {
        saveDraft()
      }
    }, 30000)
  },
  { deep: true },
)

// Очистка при размонтировании
onUnmounted(() => {
  clearTimeout(autoSaveInterval)
})
</script>

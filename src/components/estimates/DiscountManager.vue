<template>
  <div class="discount-manager">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-900">
          <Icon name="Percent" class="w-5 h-5 mr-2" />
          Скидки и доплаты
        </h3>
        <button
          @click="showSettings = !showSettings"
          class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <Icon name="Settings" class="w-4 h-4 mr-1" />
          Настройки
        </button>
      </div>

      <!-- Настройки скидок и доплат -->
      <div v-if="showSettings" class="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-md font-medium text-gray-900 mb-4">Настройки системы</h4>
        
        <!-- Групповые скидки -->
        <div class="mb-4">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Групповые скидки</h5>
          <div class="grid grid-cols-2 gap-4">
            <div v-for="(discount, size) in groupDiscounts" :key="size" class="flex items-center">
              <label class="text-sm text-gray-600 mr-2">От {{ size }} чел.:</label>
              <input
                v-model.number="groupDiscounts[size]"
                type="number"
                min="0"
                max="100"
                class="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span class="text-sm text-gray-500 ml-1">%</span>
            </div>
          </div>
        </div>

        <!-- Сезонные корректировки -->
        <div class="mb-4">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Сезонные корректировки</h5>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center">
              <label class="text-sm text-gray-600 mr-2">Низкий сезон:</label>
              <input
                v-model.number="seasonalDiscounts.low_season"
                type="number"
                min="0"
                max="100"
                class="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span class="text-sm text-gray-500 ml-1">% скидка</span>
            </div>
            <div class="flex items-center">
              <label class="text-sm text-gray-600 mr-2">Высокий сезон:</label>
              <input
                v-model.number="seasonalSurcharges.high_season"
                type="number"
                min="0"
                max="100"
                class="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span class="text-sm text-gray-500 ml-1">% доплата</span>
            </div>
          </div>
        </div>

        <!-- Срочные доплаты -->
        <div class="mb-4">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Срочные доплаты</h5>
          <div class="grid grid-cols-3 gap-4">
            <div class="flex items-center">
              <label class="text-sm text-gray-600 mr-2">В день:</label>
              <input
                v-model.number="urgencySurcharges.same_day"
                type="number"
                min="0"
                max="100"
                class="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span class="text-sm text-gray-500 ml-1">%</span>
            </div>
            <div class="flex items-center">
              <label class="text-sm text-gray-600 mr-2">На завтра:</label>
              <input
                v-model.number="urgencySurcharges.next_day"
                type="number"
                min="0"
                max="100"
                class="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span class="text-sm text-gray-500 ml-1">%</span>
            </div>
            <div class="flex items-center">
              <label class="text-sm text-gray-600 mr-2">В неделю:</label>
              <input
                v-model.number="urgencySurcharges.same_week"
                type="number"
                min="0"
                max="100"
                class="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <span class="text-sm text-gray-500 ml-1">%</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-2">
          <button
            @click="resetSettings"
            class="px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Сбросить
          </button>
          <button
            @click="saveSettings"
            class="px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Сохранить
          </button>
        </div>
      </div>

      <!-- Параметры сметы -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Левая колонка - Скидки -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Icon name="TrendingDown" class="w-4 h-4 mr-2 text-green-600" />
            Скидки
          </h4>

          <!-- Сезон -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Сезон</label>
            <select
              v-model="estimate.season"
              @change="updateAdjustments"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Не выбран</option>
              <option value="low_season">Низкий сезон</option>
              <option value="shoulder_season">Межсезонье</option>
              <option value="high_season">Высокий сезон</option>
              <option value="peak_season">Пиковый сезон</option>
            </select>
          </div>

          <!-- Тип клиента -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Тип клиента</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="client.isRepeatClient"
                  type="checkbox"
                  @change="updateAdjustments"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Повторный клиент</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="client.isVipClient"
                  type="checkbox"
                  @change="updateAdjustments"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">VIP клиент</span>
              </label>
            </div>
          </div>

          <!-- Ручная скидка -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ручная скидка (%)
            </label>
            <input
              v-model.number="manualDiscount"
              type="number"
              min="0"
              max="100"
              @input="updateAdjustments"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <!-- Правая колонка - Доплаты -->
        <div>
          <h4 class="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Icon name="TrendingUp" class="w-4 h-4 mr-2 text-red-600" />
            Доплаты
          </h4>

          <!-- Срочность -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Срочность</label>
            <select
              v-model="estimate.urgency"
              @change="updateAdjustments"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Обычное бронирование</option>
              <option value="same_week">В течение недели</option>
              <option value="next_day">На завтра</option>
              <option value="same_day">В день</option>
            </select>
          </div>

          <!-- Специальные услуги -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Специальные услуги</label>
            <div class="space-y-2">
              <label class="flex items-center">
                <input
                  v-model="estimate.specialServices"
                  type="checkbox"
                  value="private_guide"
                  @change="updateAdjustments"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Индивидуальный гид</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="estimate.specialServices"
                  type="checkbox"
                  value="luxury_transfer"
                  @change="updateAdjustments"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Люксовый трансфер</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="estimate.specialServices"
                  type="checkbox"
                  value="premium_hotel"
                  @change="updateAdjustments"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700">Премиум отель</span>
              </label>
            </div>
          </div>

          <!-- Ручная доплата -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Ручная доплата (%)
            </label>
            <input
              v-model.number="manualSurcharge"
              type="number"
              min="0"
              max="100"
              @input="updateAdjustments"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <!-- Результаты расчета -->
      <div v-if="adjustments" class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-md font-medium text-gray-900 mb-4">Результаты расчета</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Базовая стоимость -->
          <div class="text-center">
            <div class="text-sm text-gray-600">Базовая стоимость</div>
            <div class="text-lg font-semibold text-gray-900">
              {{ formatCurrency(adjustments.originalCost) }}
            </div>
          </div>

          <!-- Скидки -->
          <div class="text-center">
            <div class="text-sm text-gray-600">Общая скидка</div>
            <div class="text-lg font-semibold text-green-600">
              -{{ formatCurrency(adjustments.totalDiscount) }}
            </div>
          </div>

          <!-- Доплаты -->
          <div class="text-center">
            <div class="text-sm text-gray-600">Общая доплата</div>
            <div class="text-lg font-semibold text-red-600">
              +{{ formatCurrency(adjustments.totalSurcharge) }}
            </div>
          </div>
        </div>

        <!-- Итоговая стоимость -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div class="text-center">
            <div class="text-sm text-gray-600">Итоговая стоимость</div>
            <div class="text-2xl font-bold text-blue-600">
              {{ formatCurrency(adjustments.finalCost) }}
            </div>
          </div>
        </div>

        <!-- Детализация -->
        <div v-if="adjustments.discounts.length > 0 || adjustments.surcharges.length > 0" class="mt-4">
          <h5 class="text-sm font-medium text-gray-700 mb-2">Детализация</h5>
          
          <!-- Скидки -->
          <div v-if="adjustments.discounts.length > 0" class="mb-3">
            <div class="text-sm text-green-600 font-medium mb-1">Скидки:</div>
            <div class="space-y-1">
              <div
                v-for="discount in adjustments.discounts"
                :key="discount.type"
                class="flex justify-between text-sm"
              >
                <span class="text-gray-600">{{ discount.description }}</span>
                <span class="text-green-600">-{{ formatCurrency(discount.amount) }}</span>
              </div>
            </div>
          </div>

          <!-- Доплаты -->
          <div v-if="adjustments.surcharges.length > 0">
            <div class="text-sm text-red-600 font-medium mb-1">Доплаты:</div>
            <div class="space-y-1">
              <div
                v-for="surcharge in adjustments.surcharges"
                :key="surcharge.type"
                class="flex justify-between text-sm"
              >
                <span class="text-gray-600">{{ surcharge.description }}</span>
                <span class="text-red-600">+{{ formatCurrency(surcharge.amount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { discountService } from '@/services/DiscountService.js'
import Icon from '@/components/common/Icon.vue'

// Props
const props = defineProps({
  estimate: {
    type: Object,
    required: true
  },
  baseCost: {
    type: Number,
    default: 0
  }
})

// Emits
const emit = defineEmits(['update:estimate', 'adjustments-changed'])

// Reactive data
const showSettings = ref(false)
const adjustments = ref(null)
const manualDiscount = ref(0)
const manualSurcharge = ref(0)

// Client data
const client = ref({
  isRepeatClient: false,
  isVipClient: false
})

// Settings data
const groupDiscounts = ref({})
const seasonalDiscounts = ref({})
const seasonalSurcharges = ref({})
const urgencySurcharges = ref({})

// Computed
const estimateWithCost = computed(() => ({
  ...props.estimate,
  totalCost: props.baseCost
}))

// Methods
function updateAdjustments() {
  try {
    // Обновляем настройки сервиса
    updateServiceSettings()
    
    // Рассчитываем корректировки
    const result = discountService.calculateEstimateAdjustments(estimateWithCost.value, client.value)
    
    // Добавляем ручные корректировки
    if (manualDiscount.value > 0) {
      const manualDiscountResult = discountService.applyDiscount(result.finalCost, manualDiscount.value)
      result.discounts.push({
        type: 'manual',
        description: 'Ручная скидка',
        percent: manualDiscount.value,
        amount: manualDiscountResult.discountAmount
      })
      result.totalDiscount += manualDiscountResult.discountAmount
      result.finalCost = manualDiscountResult.finalCost
    }
    
    if (manualSurcharge.value > 0) {
      const manualSurchargeResult = discountService.applySurcharge(result.finalCost, manualSurcharge.value)
      result.surcharges.push({
        type: 'manual',
        description: 'Ручная доплата',
        percent: manualSurcharge.value,
        amount: manualSurchargeResult.surchargeAmount
      })
      result.totalSurcharge += manualSurchargeResult.surchargeAmount
      result.finalCost = manualSurchargeResult.finalCost
    }
    
    adjustments.value = result
    
    // Эмитим событие
    emit('adjustments-changed', result)
    
  } catch (error) {
    console.error('Ошибка расчета корректировок:', error)
  }
}

function updateServiceSettings() {
  // Обновляем групповые скидки
  discountService.addDiscount('group_size', groupDiscounts.value)
  
  // Обновляем сезонные скидки
  discountService.addDiscount('seasonal', seasonalDiscounts.value)
  
  // Обновляем сезонные доплаты
  discountService.addSurcharge('seasonal', seasonalSurcharges.value)
  
  // Обновляем срочные доплаты
  discountService.addSurcharge('urgency', urgencySurcharges.value)
}

function saveSettings() {
  try {
    // Сохраняем настройки в localStorage
    const settings = discountService.exportSettings()
    localStorage.setItem('discountSettings', JSON.stringify(settings))
    
    // Обновляем расчеты
    updateAdjustments()
    
    showSettings.value = false
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
  }
}

function resetSettings() {
  // Сбрасываем к значениям по умолчанию
  discountService.initializeDefaults()
  
  // Обновляем локальные значения
  loadSettings()
  
  // Обновляем расчеты
  updateAdjustments()
}

function loadSettings() {
  try {
    // Загружаем настройки из localStorage
    const savedSettings = localStorage.getItem('discountSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      discountService.importSettings(settings)
    }
    
    // Обновляем локальные значения
    const currentSettings = discountService.exportSettings()
    
    groupDiscounts.value = currentSettings.discounts.group_size || {}
    seasonalDiscounts.value = currentSettings.discounts.seasonal || {}
    seasonalSurcharges.value = currentSettings.surcharges.seasonal || {}
    urgencySurcharges.value = currentSettings.surcharges.urgency || {}
    
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error)
    // Используем значения по умолчанию
    discountService.initializeDefaults()
    loadSettings()
  }
}

function formatCurrency(amount) {
  if (typeof amount !== 'number') return '0'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: props.estimate.currency || 'USD',
    minimumFractionDigits: 2
  }).format(amount)
}

// Watchers
watch(() => props.baseCost, () => {
  updateAdjustments()
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadSettings()
  updateAdjustments()
})
</script>

<style scoped>
.discount-manager {
  @apply w-full;
}

/* Анимации для переключения настроек */
.discount-manager .bg-gray-50 {
  transition: all 0.3s ease;
}

/* Стили для чекбоксов */
.discount-manager input[type="checkbox"] {
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Стили для селектов */
.discount-manager select {
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

/* Стили для инпутов */
.discount-manager input[type="number"] {
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
</style>

<template>
  <div class="space-y-4">
    <!-- Тип даты -->
    <div>
      <div class="flex items-center space-x-2 mb-2">
        <label class="form-label">Тип даты</label>
        <div class="relative group">
          <button
            type="button"
            class="w-4 h-4 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs hover:bg-gray-300"
          >
            ?
          </button>
          <div
            class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10"
          >
            <div class="mb-1 font-medium">Режим расчета дат:</div>
            <div>
              • <strong>Точная дата:</strong> Указываются конкретные даты начала и окончания
            </div>
            <div>
              • <strong>Условная дата:</strong> Указывается примерная дата и количество дней
            </div>
            <div
              class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
            ></div>
          </div>
        </div>
      </div>
      <div class="flex space-x-4">
        <label class="flex items-center">
          <input
            type="radio"
            v-model="dateType"
            value="exact"
            class="mr-2"
            @change="onDateTypeChange"
          />
          <span class="text-sm">Точная дата</span>
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            v-model="dateType"
            value="conditional"
            class="mr-2"
            @change="onDateTypeChange"
          />
          <span class="text-sm">Условная дата</span>
        </label>
      </div>
    </div>

    <!-- Точная дата -->
    <div v-if="dateType === 'exact'" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Дата начала -->
        <div>
          <label class="form-label"> Дата начала тура <span class="text-red-500">*</span> </label>
          <input
            type="date"
            v-model="startDate"
            class="form-input"
            :min="minDate"
            @change="onStartDateChange"
            required
          />
          <p v-if="errors.startDate" class="form-error">{{ errors.startDate }}</p>
        </div>

        <!-- Дата окончания -->
        <div>
          <label class="form-label">
            Дата окончания тура <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            v-model="endDate"
            class="form-input"
            :min="startDate"
            @change="onEndDateChange"
            required
          />
          <p v-if="errors.endDate" class="form-error">{{ errors.endDate }}</p>
        </div>
      </div>

      <!-- Количество дней (вычисляемое) -->
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-blue-900">Количество дней:</span>
          <span class="text-lg font-bold text-blue-900">{{ calculatedDays }}</span>
        </div>
        <p class="text-xs text-blue-700 mt-1">Автоматически рассчитано на основе выбранных дат</p>
      </div>
    </div>

    <!-- Условная дата -->
    <div v-if="dateType === 'conditional'" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Дата начала -->
        <div>
          <label class="form-label">
            Примерная дата начала <span class="text-red-500">*</span>
          </label>
          <input
            type="date"
            v-model="conditionalStartDate"
            class="form-input"
            :min="minDate"
            @change="onConditionalStartDateChange"
            required
          />
          <p v-if="errors.conditionalStartDate" class="form-error">
            {{ errors.conditionalStartDate }}
          </p>
        </div>

        <!-- Количество дней -->
        <div>
          <label class="form-label"> Количество дней <span class="text-red-500">*</span> </label>
          <input
            type="number"
            v-model.number="conditionalDays"
            class="form-input"
            min="1"
            max="365"
            @input="onConditionalDaysChange"
            required
          />
          <p v-if="errors.conditionalDays" class="form-error">{{ errors.conditionalDays }}</p>
        </div>
      </div>

      <!-- Примерная дата окончания (вычисляемая) -->
      <div class="bg-yellow-50 p-4 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-yellow-900">Примерная дата окончания:</span>
          <span class="text-lg font-bold text-yellow-900">{{ calculatedEndDate }}</span>
        </div>
        <p class="text-xs text-yellow-700 mt-1">Рассчитано на основе количества дней</p>
      </div>
    </div>

    <!-- Переключатель режима расчета -->
    <div class="border-t pt-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">Режим расчета:</span>
        <div class="flex items-center space-x-2">
          <button
            type="button"
            @click="calculateByDays = true"
            class="px-3 py-1 text-sm rounded-lg transition-colors"
            :class="
              calculateByDays
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            "
          >
            По дням
          </button>
          <button
            type="button"
            @click="calculateByDays = false"
            class="px-3 py-1 text-sm rounded-lg transition-colors"
            :class="
              !calculateByDays
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            "
          >
            По датам
          </button>
        </div>
      </div>
    </div>

    <!-- Информация о туре -->
    <div class="bg-gray-50 p-4 rounded-lg">
      <h4 class="text-sm font-medium text-gray-900 mb-2">Информация о туре</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-gray-500">Тип даты:</span>
          <span class="ml-2 font-medium">
            {{ dateType === 'exact' ? 'Точная' : 'Условная' }}
          </span>
        </div>
        <div>
          <span class="text-gray-500">Количество дней:</span>
          <span class="ml-2 font-medium">{{ finalDays }}</span>
        </div>
        <div>
          <span class="text-gray-500">Дата начала:</span>
          <span class="ml-2 font-medium">{{ formatDate(finalStartDate) }}</span>
        </div>
        <div>
          <span class="text-gray-500">Дата окончания:</span>
          <span class="ml-2 font-medium">{{ formatDate(finalEndDate) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { addDays, differenceInDays, format } from 'date-fns'
import { ru } from 'date-fns/locale'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      dateType: 'exact',
      startDate: '',
      endDate: '',
      days: 0,
      conditionalStartDate: '',
      conditionalDays: 0,
    }),
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

// Реактивные данные
const dateType = ref(props.modelValue.dateType || 'exact')
const startDate = ref(props.modelValue.startDate || '')
const endDate = ref(props.modelValue.endDate || '')
const conditionalStartDate = ref(props.modelValue.conditionalStartDate || '')
const conditionalDays = ref(props.modelValue.conditionalDays || 0)
const calculateByDays = ref(true)

// Вычисляемые свойства
const minDate = computed(() => {
  return format(new Date(), 'yyyy-MM-dd')
})

const calculatedDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  return differenceInDays(end, start) + 1
})

const calculatedEndDate = computed(() => {
  if (!conditionalStartDate.value || !conditionalDays.value) return ''
  const start = new Date(conditionalStartDate.value)
  const end = addDays(start, conditionalDays.value - 1)
  return format(end, 'yyyy-MM-dd')
})

const finalDays = computed(() => {
  if (dateType.value === 'exact') {
    return calculatedDays.value
  } else {
    return conditionalDays.value
  }
})

const finalStartDate = computed(() => {
  if (dateType.value === 'exact') {
    return startDate.value
  } else {
    return conditionalStartDate.value
  }
})

const finalEndDate = computed(() => {
  if (dateType.value === 'exact') {
    return endDate.value
  } else {
    return calculatedEndDate.value
  }
})

// Методы
const formatDate = (dateString) => {
  if (!dateString) return 'Не указана'
  try {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ru })
  } catch {
    return dateString
  }
}

const onDateTypeChange = () => {
  updateModelValue()
  emit('change', {
    type: 'dateType',
    value: dateType.value,
  })
}

const onStartDateChange = () => {
  if (calculateByDays.value && startDate.value && conditionalDays.value) {
    // Пересчитываем дату окончания
    const start = new Date(startDate.value)
    const end = addDays(start, conditionalDays.value - 1)
    endDate.value = format(end, 'yyyy-MM-dd')
  }

  updateModelValue()
  emit('change', {
    type: 'startDate',
    value: startDate.value,
  })
}

const onEndDateChange = () => {
  updateModelValue()
  emit('change', {
    type: 'endDate',
    value: endDate.value,
  })
}

const onConditionalStartDateChange = () => {
  updateModelValue()
  emit('change', {
    type: 'conditionalStartDate',
    value: conditionalStartDate.value,
  })
}

const onConditionalDaysChange = () => {
  updateModelValue()
  emit('change', {
    type: 'conditionalDays',
    value: conditionalDays.value,
  })
}

const updateModelValue = () => {
  const value = {
    dateType: dateType.value,
    startDate: startDate.value,
    endDate: endDate.value,
    days: finalDays.value,
    conditionalStartDate: conditionalStartDate.value,
    conditionalDays: conditionalDays.value,
  }

  emit('update:modelValue', value)
}

// Следим за изменениями props
watch(
  () => props.modelValue,
  (newValue) => {
    dateType.value = newValue.dateType || 'exact'
    startDate.value = newValue.startDate || ''
    endDate.value = newValue.endDate || ''
    conditionalStartDate.value = newValue.conditionalStartDate || ''
    conditionalDays.value = newValue.conditionalDays || 0
  },
  { deep: true },
)

// Инициализация при монтировании
updateModelValue()
</script>

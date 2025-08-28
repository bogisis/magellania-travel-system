<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">Группа туристов</h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Всего человек:</span>
        <span class="text-lg font-bold text-primary-600">{{ totalPax }}</span>
      </div>
    </div>

    <!-- Основная информация о группе -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Общее количество туристов -->
      <div>
        <label class="form-label">
          Общее количество туристов <span class="text-red-500">*</span>
        </label>
        <BaseInput
          v-model.number="group.totalPax"
          type="number"
          min="1"
          max="100"
          @input="onTotalPaxChange"
          required
        />
        <p class="text-xs text-gray-500 mt-1">Общее количество туристов в группе</p>
      </div>

      <!-- Количество гидов -->
      <div>
        <label class="form-label"> Количество гидов <span class="text-red-500">*</span> </label>
        <BaseInput
          v-model.number="group.guidesCount"
          type="number"
          min="0"
          max="10"
          @input="onGuidesCountChange"
          required
        />
        <p class="text-xs text-gray-500 mt-1">Количество сопровождающих гидов</p>
      </div>

      <!-- Наценка -->
      <div>
        <div class="flex items-center space-x-2 mb-2">
          <label class="form-label"> Наценка (%) <span class="text-red-500">*</span> </label>
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
              <div class="mb-1 font-medium">Наценка:</div>
              <div>Дополнительный процент к базовой стоимости тура</div>
              <div>Используется для покрытия комиссии и прибыли</div>
              <div
                class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
              ></div>
            </div>
          </div>
        </div>
        <select v-model.number="group.markup" class="form-input" @change="onMarkupChange" required>
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
        <p class="text-xs text-gray-500 mt-1">Процент наценки к базовой стоимости</p>
      </div>
    </div>

    <!-- Размещение туристов -->
    <div class="border-t pt-6">
      <h4 class="text-md font-medium text-gray-900 mb-4">Размещение туристов</h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Дабл размещение -->
        <div>
          <label class="form-label">Дабл размещение</label>
          <BaseInput
            v-model.number="group.doubleCount"
            type="number"
            min="0"
            :max="maxDoubleCount"
            @input="onDoubleCountChange"
          />
          <p class="text-xs text-gray-500 mt-1">Количество номеров на 2 человека</p>
        </div>

        <!-- Сингл размещение -->
        <div>
          <label class="form-label">Сингл размещение</label>
          <BaseInput
            v-model.number="group.singleCount"
            type="number"
            min="0"
            :max="maxSingleCount"
            @input="onSingleCountChange"
          />
          <p class="text-xs text-gray-500 mt-1">Количество номеров на 1 человека</p>
        </div>

        <!-- Тройное размещение -->
        <div>
          <label class="form-label">Тройное размещение</label>
          <BaseInput
            v-model.number="group.tripleCount"
            type="number"
            min="0"
            :max="maxTripleCount"
            @input="onTripleCountChange"
          />
          <p class="text-xs text-gray-500 mt-1">Количество номеров на 3 человека</p>
        </div>

        <!-- Дополнительное место -->
        <div>
          <label class="form-label">Дополнительные места</label>
          <BaseInput
            v-model.number="group.extraCount"
            type="number"
            min="0"
            :max="maxExtraCount"
            @input="onExtraCountChange"
          />
          <p class="text-xs text-gray-500 mt-1">Дополнительные места в номерах</p>
        </div>
      </div>

      <!-- Валидация размещения -->
      <div
        v-if="accommodationValidation.message"
        class="mt-4 p-3 rounded-lg"
        :class="accommodationValidation.class"
      >
        <div class="flex items-center">
          <component :is="accommodationValidation.icon" class="w-4 h-4 mr-2" />
          <span class="text-sm font-medium">{{ accommodationValidation.message }}</span>
        </div>
        <p v-if="accommodationValidation.details" class="text-xs mt-1">
          {{ accommodationValidation.details }}
        </p>
      </div>
    </div>

    <!-- Размещение гидов -->
    <div class="border-t pt-6">
      <h4 class="text-md font-medium text-gray-900 mb-4">Размещение гидов</h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Тип размещения гидов -->
        <div>
          <label class="form-label">Тип размещения гидов</label>
          <select
            v-model="group.guideAccommodationType"
            class="form-input"
            @change="onGuideAccommodationChange"
          >
            <option value="single">Сингл (отдельный номер)</option>
            <option value="double">Дабл (2 гида в номере)</option>
            <option value="shared">Общий номер</option>
            <option value="none">Без размещения</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Тип размещения для сопровождающих гидов</p>
        </div>

        <!-- Количество номеров для гидов -->
        <div v-if="group.guideAccommodationType !== 'none'">
          <label class="form-label">Количество номеров для гидов</label>
          <BaseInput
            v-model.number="group.guideRoomsCount"
            type="number"
            min="1"
            :max="group.guidesCount"
            @input="onGuideRoomsChange"
          />
          <p class="text-xs text-gray-500 mt-1">Количество номеров для размещения гидов</p>
        </div>
      </div>
    </div>

    <!-- Сводная информация -->
    <div class="bg-blue-50 p-4 rounded-lg">
      <h4 class="text-sm font-medium text-blue-900 mb-3">Сводная информация</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-blue-700">Всего туристов:</span>
          <span class="ml-2 font-medium text-blue-900">{{ group.totalPax }}</span>
        </div>
        <div>
          <span class="text-blue-700">Гиды:</span>
          <span class="ml-2 font-medium text-blue-900">{{ group.guidesCount }}</span>
        </div>
        <div>
          <span class="text-blue-700">Всего мест:</span>
          <span class="ml-2 font-medium text-blue-900">{{ totalAccommodationPlaces }}</span>
        </div>
        <div>
          <span class="text-blue-700">Наценка:</span>
          <span class="ml-2 font-medium text-blue-900">{{ group.markup }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CheckCircle, AlertTriangle, Info } from 'lucide-vue-next'
import BaseInput from '@/components/common/BaseInput.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      totalPax: 0,
      doubleCount: 0,
      singleCount: 0,
      tripleCount: 0,
      extraCount: 0,
      guidesCount: 0,
      markup: 0,
      guideAccommodationType: 'single',
      guideRoomsCount: 0,
    }),
  },
  tourDays: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

// Реактивные данные
const group = ref({ ...props.modelValue })

// Вычисляемые свойства

const totalPax = computed(() => {
  return Number(group.value.totalPax) || 0
})

const maxDoubleCount = computed(() => {
  const totalPax = Number(group.value.totalPax) || 0
  return Math.floor(totalPax / 2)
})

const maxSingleCount = computed(() => {
  return Number(group.value.totalPax) || 0
})

const maxTripleCount = computed(() => {
  const totalPax = Number(group.value.totalPax) || 0
  return Math.floor(totalPax / 3)
})

const maxExtraCount = computed(() => {
  return Number(group.value.totalPax) || 0
})

const totalAccommodationPlaces = computed(() => {
  // Проверяем, что значения являются числами и не NaN
  const doubleCount = isNaN(Number(group.value.doubleCount))
    ? 0
    : Number(group.value.doubleCount) || 0
  const singleCount = isNaN(Number(group.value.singleCount))
    ? 0
    : Number(group.value.singleCount) || 0
  const tripleCount = isNaN(Number(group.value.tripleCount))
    ? 0
    : Number(group.value.tripleCount) || 0
  const extraCount = isNaN(Number(group.value.extraCount)) ? 0 : Number(group.value.extraCount) || 0

  return doubleCount * 2 + singleCount + tripleCount * 3 + extraCount
})

const accommodationValidation = computed(() => {
  const totalPlaces = totalAccommodationPlaces.value
  const totalPax = Number(group.value.totalPax) || 0

  if (totalPax === 0) {
    return {
      message: 'Не указано количество туристов',
      details: 'Введите количество туристов в группе',
      class: 'bg-yellow-50 border border-yellow-200',
      icon: Info,
    }
  }

  if (totalPlaces === 0) {
    return {
      message: 'Не указано размещение',
      details: 'Добавьте хотя бы одно место размещения',
      class: 'bg-yellow-50 border border-yellow-200',
      icon: Info,
    }
  }

  if (totalPlaces < totalPax) {
    return {
      message: 'Недостаточно мест размещения',
      details: `${totalPlaces} мест / ${totalPax} туристов`,
      class: 'bg-red-50 border border-red-200',
      icon: AlertTriangle,
    }
  }

  if (totalPlaces > totalPax) {
    return {
      message: 'Избыток мест размещения',
      details: `${totalPlaces} мест / ${totalPax} туристов`,
      class: 'bg-blue-50 border border-blue-200',
      icon: Info,
    }
  }

  return {
    message: 'Размещение корректно',
    details: `${totalPlaces} мест / ${totalPax} туристов`,
    class: 'bg-green-50 border border-green-200',
    icon: CheckCircle,
  }
})

// Методы
const onTotalPaxChange = () => {
  // Убеждаемся, что значение числовое
  const totalPax = Number(group.value.totalPax) || 0
  group.value.totalPax = totalPax

  // Автоматически корректируем размещение только если все поля размещения пустые
  const hasManualAccommodation =
    (group.value.doubleCount || 0) +
      (group.value.singleCount || 0) +
      (group.value.tripleCount || 0) +
      (group.value.extraCount || 0) >
    0

  if (totalPax > 0 && !hasManualAccommodation) {
    const optimalDouble = Math.floor(totalPax / 2)
    const remaining = totalPax % 2

    group.value.doubleCount = optimalDouble
    group.value.singleCount = remaining
    group.value.tripleCount = 0
    group.value.extraCount = 0
  } else if (totalPax === 0) {
    // Если количество туристов 0, сбрасываем размещение
    group.value.doubleCount = 0
    group.value.singleCount = 0
    group.value.tripleCount = 0
    group.value.extraCount = 0
  }

  updateModelValue()
  emit('change', {
    type: 'totalPax',
    value: totalPax,
  })
}

const onGuidesCountChange = () => {
  // Убеждаемся, что значение числовое
  const guidesCount = Number(group.value.guidesCount) || 0
  group.value.guidesCount = guidesCount

  // Автоматически устанавливаем количество номеров для гидов
  if (group.value.guideAccommodationType === 'single') {
    group.value.guideRoomsCount = guidesCount
  } else if (group.value.guideAccommodationType === 'double') {
    group.value.guideRoomsCount = Math.ceil(guidesCount / 2)
  } else if (group.value.guideAccommodationType === 'shared') {
    group.value.guideRoomsCount = 1
  } else if (group.value.guideAccommodationType === 'none') {
    group.value.guideRoomsCount = 0
  }

  updateModelValue()
  emit('change', {
    type: 'guidesCount',
    value: guidesCount,
  })
}

const onMarkupChange = () => {
  updateModelValue()
  emit('change', {
    type: 'markup',
    value: group.value.markup,
  })
}

const onDoubleCountChange = () => {
  updateModelValue()
  emit('change', {
    type: 'doubleCount',
    value: group.value.doubleCount,
  })
}

const onSingleCountChange = () => {
  updateModelValue()
  emit('change', {
    type: 'singleCount',
    value: group.value.singleCount,
  })
}

const onTripleCountChange = () => {
  updateModelValue()
  emit('change', {
    type: 'tripleCount',
    value: group.value.tripleCount,
  })
}

const onExtraCountChange = () => {
  updateModelValue()
  emit('change', {
    type: 'extraCount',
    value: group.value.extraCount,
  })
}

const onGuideAccommodationChange = () => {
  // Автоматически устанавливаем количество номеров для гидов
  if (group.value.guideAccommodationType === 'single') {
    group.value.guideRoomsCount = group.value.guidesCount
  } else if (group.value.guideAccommodationType === 'double') {
    group.value.guideRoomsCount = Math.ceil(group.value.guidesCount / 2)
  } else if (group.value.guideAccommodationType === 'shared') {
    group.value.guideRoomsCount = 1
  } else {
    group.value.guideRoomsCount = 0
  }

  updateModelValue()
  emit('change', {
    type: 'guideAccommodationType',
    value: group.value.guideAccommodationType,
  })
}

const onGuideRoomsChange = () => {
  updateModelValue()
  emit('change', {
    type: 'guideRoomsCount',
    value: group.value.guideRoomsCount,
  })
}

const updateModelValue = () => {
  emit('update:modelValue', { ...group.value })
}

// Следим за изменениями props
watch(
  () => props.modelValue,
  (newValue) => {
    group.value = { ...newValue }
  },
  { deep: true },
)

// Инициализация при монтировании
updateModelValue()
</script>

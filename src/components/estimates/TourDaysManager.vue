<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">Дни тура</h3>
      <div class="flex items-center space-x-2">
        <BaseButton
          variant="outline"
          size="sm"
          @click="generateDaysFromDates"
          :icon="Calendar"
          :disabled="!canGenerateDays"
        >
          Создать по датам
        </BaseButton>
        <BaseButton variant="outline" size="sm" @click="addDay" :icon="Plus">
          Добавить день
        </BaseButton>
      </div>
    </div>

    <!-- Информация -->
    <div class="bg-blue-50 p-4 rounded-lg">
      <div class="flex items-center space-x-2 mb-2">
        <Info class="w-5 h-5 text-blue-600" />
        <span class="text-sm font-medium text-blue-900">Управление днями</span>
      </div>
      <p class="text-sm text-blue-700 mb-2">
        Используйте "Создать по датам" для автоматического создания дней на основе выбранных дат
        тура. Перетаскивайте дни и активности для изменения порядка.
      </p>
      <div v-if="!canGenerateDays" class="text-xs text-blue-600">
        Для автоматического создания дней укажите даты начала и окончания тура
      </div>
    </div>

    <!-- Список дней -->
    <draggable
      v-model="tourDays"
      group="tour-days"
      item-key="id"
      class="space-y-4"
      @end="onDaysReorder"
      handle=".drag-handle"
    >
      <template #item="{ element: day, index }">
        <div
          class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
        >
          <!-- Заголовок дня -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="drag-handle cursor-move p-1 hover:bg-gray-100 rounded">
                <Move class="w-5 h-5 text-gray-400" />
              </div>
              <div
                class="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium"
              >
                {{ index + 1 }}
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-900">
                  День {{ index + 1 }}: {{ day.title || 'Без названия' }}
                </h4>
                <p class="text-xs text-gray-500">{{ day.date || 'Дата не указана' }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-900">
                {{ formatCurrency(calculateDayTotal(day)) }}
              </span>
              <BaseButton
                variant="ghost"
                size="sm"
                @click="removeDay(day.id)"
                :icon="Trash2"
                class="text-red-600 hover:text-red-700"
              >
                Удалить
              </BaseButton>
            </div>
          </div>

          <!-- Детали дня -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <!-- Название дня -->
            <div>
              <label class="form-label">Название дня</label>
              <BaseInput
                v-model="day.title"
                placeholder="Название дня"
                @input="updateDay(day.id, 'title', $event.target.value)"
              />
            </div>

            <!-- Дата -->
            <div>
              <label class="form-label">Дата</label>
              <input
                type="date"
                v-model="day.date"
                class="form-input"
                @change="updateDay(day.id, 'date', $event.target.value)"
              />
            </div>

            <!-- Место -->
            <div>
              <label class="form-label">Место</label>
              <BaseInput
                v-model="day.location"
                placeholder="Место проведения"
                @input="updateDay(day.id, 'location', $event.target.value)"
              />
            </div>
          </div>

          <!-- Описание дня -->
          <div class="mb-4">
            <label class="form-label">Описание дня</label>
            <textarea
              v-model="day.description"
              rows="3"
              class="form-input"
              placeholder="Подробное описание программы дня"
              @input="updateDay(day.id, 'description', $event.target.value)"
            />
          </div>

          <!-- Активности дня -->
          <div class="border-t pt-4">
            <div class="flex items-center justify-between mb-3">
              <h5 class="text-sm font-medium text-gray-900">Активности</h5>
              <BaseButton variant="outline" size="sm" @click="addActivity(day.id)" :icon="Plus">
                Добавить активность
              </BaseButton>
            </div>

            <!-- Список активностей -->
            <draggable
              v-model="day.activities"
              group="activities"
              item-key="id"
              class="space-y-2"
              @end="onActivitiesReorder(day.id)"
              handle=".activity-drag-handle"
            >
              <template #item="{ element: activity, index: activityIndex }">
                <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div class="activity-drag-handle cursor-move p-1 hover:bg-gray-200 rounded">
                    <Move class="w-4 h-4 text-gray-400" />
                  </div>

                  <div class="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <!-- Название активности -->
                    <div>
                      <BaseInput
                        v-model="activity.name"
                        placeholder="Название активности"
                        class="text-sm"
                        @input="updateActivity(day.id, activity.id, 'name', $event.target.value)"
                      />
                    </div>

                    <!-- Время -->
                    <div>
                      <BaseInput
                        v-model="activity.time"
                        placeholder="Время (например: 09:00)"
                        class="text-sm"
                        @input="updateActivity(day.id, activity.id, 'time', $event.target.value)"
                      />
                    </div>

                    <!-- Стоимость -->
                    <div>
                      <BaseInput
                        v-model.number="activity.cost"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Стоимость"
                        class="text-sm"
                        @input="updateActivity(day.id, activity.id, 'cost', $event.target.value)"
                      />
                    </div>
                  </div>

                  <BaseButton
                    variant="ghost"
                    size="sm"
                    @click="removeActivity(day.id, activity.id)"
                    :icon="Trash2"
                    class="text-red-600 hover:text-red-700"
                  >
                    Удалить
                  </BaseButton>
                </div>
              </template>
            </draggable>

            <!-- Итого по дню -->
            <div class="mt-3 p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center justify-between text-sm">
                <span class="text-blue-700">Итого за день:</span>
                <span class="font-medium text-blue-900">
                  {{ formatCurrency(calculateDayTotal(day)) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <!-- Итоговая информация -->
    <div v-if="tourDays.length > 0" class="bg-green-50 p-4 rounded-lg">
      <h4 class="text-sm font-medium text-green-900 mb-3">Итоговая информация</h4>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-green-700">Всего дней:</span>
          <span class="ml-2 font-medium text-green-900">{{ tourDays.length }}</span>
        </div>
        <div>
          <span class="text-green-700">Всего активностей:</span>
          <span class="ml-2 font-medium text-green-900">{{ totalActivities }}</span>
        </div>
        <div>
          <span class="text-green-700">Общая стоимость:</span>
          <span class="ml-2 font-medium text-green-900">{{ formatCurrency(totalCost) }}</span>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-if="tourDays.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-4">
        <Calendar class="w-12 h-12 mx-auto" />
      </div>
      <p class="text-gray-500">Дни тура не добавлены</p>
      <p class="text-sm text-gray-400 mt-1">Нажмите "Добавить день" для начала</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Trash2, Move, Calendar, Info } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  tourDates: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

// Реактивные данные
const tourDays = ref(props.modelValue || [])

// Вычисляемые свойства
const totalActivities = computed(() => {
  return tourDays.value.reduce((sum, day) => sum + (day.activities?.length || 0), 0)
})

const totalCost = computed(() => {
  return tourDays.value.reduce((sum, day) => sum + calculateDayTotal(day), 0)
})

const canGenerateDays = computed(() => {
  return props.tourDates.startDate && props.tourDates.endDate
})

const tourDuration = computed(() => {
  if (!canGenerateDays.value) return 0

  const startDate = new Date(props.tourDates.startDate)
  const endDate = new Date(props.tourDates.endDate)
  const diffTime = Math.abs(endDate - startDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays + 1 // +1 потому что включаем и начальный, и конечный день
})

// Методы
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const addDay = () => {
  const newDay = {
    id: generateId(),
    title: '',
    date: '',
    location: '',
    description: '',
    activities: [],
  }

  tourDays.value.push(newDay)
  updateModelValue()
  emit('change', {
    type: 'addDay',
    day: newDay,
  })
}

const generateDaysFromDates = () => {
  if (!canGenerateDays.value) return

  // Очищаем существующие дни
  tourDays.value = []

  const startDate = new Date(props.tourDates.startDate)
  const endDate = new Date(props.tourDates.endDate)

  // Создаем дни для каждого дня тура
  for (let i = 0; i < tourDuration.value; i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)

    const dayNumber = i + 1
    const formattedDate = currentDate.toISOString().split('T')[0]

    const newDay = {
      id: generateId(),
      title: `День ${dayNumber}`,
      date: formattedDate,
      location: '',
      description: '',
      activities: [],
    }

    tourDays.value.push(newDay)
  }

  updateModelValue()
  emit('change', {
    type: 'generateDaysFromDates',
    days: tourDays.value,
    startDate: props.tourDates.startDate,
    endDate: props.tourDates.endDate,
    duration: tourDuration.value,
  })
}

const removeDay = (dayId) => {
  const index = tourDays.value.findIndex((day) => day.id === dayId)
  if (index !== -1) {
    const removedDay = tourDays.value[index]
    tourDays.value.splice(index, 1)
    updateModelValue()
    emit('change', {
      type: 'removeDay',
      day: removedDay,
    })
  }
}

const updateDay = (dayId, field, value) => {
  const day = tourDays.value.find((d) => d.id === dayId)
  if (day) {
    day[field] = value
    updateModelValue()
    emit('change', {
      type: 'updateDay',
      dayId,
      field,
      value,
    })
  }
}

const addActivity = (dayId) => {
  const day = tourDays.value.find((d) => d.id === dayId)
  if (day) {
    if (!day.activities) {
      day.activities = []
    }

    const newActivity = {
      id: generateId(),
      name: '',
      time: '',
      cost: 0,
    }

    day.activities.push(newActivity)
    updateModelValue()
    emit('change', {
      type: 'addActivity',
      dayId,
      activity: newActivity,
    })
  }
}

const removeActivity = (dayId, activityId) => {
  const day = tourDays.value.find((d) => d.id === dayId)
  if (day && day.activities) {
    const index = day.activities.findIndex((a) => a.id === activityId)
    if (index !== -1) {
      const removedActivity = day.activities[index]
      day.activities.splice(index, 1)
      updateModelValue()
      emit('change', {
        type: 'removeActivity',
        dayId,
        activity: removedActivity,
      })
    }
  }
}

const updateActivity = (dayId, activityId, field, value) => {
  const day = tourDays.value.find((d) => d.id === dayId)
  if (day && day.activities) {
    const activity = day.activities.find((a) => a.id === activityId)
    if (activity) {
      activity[field] = value
      updateModelValue()
      emit('change', {
        type: 'updateActivity',
        dayId,
        activityId,
        field,
        value,
      })
    }
  }
}

import { CalculationService } from '@/services/CalculationService.js'

// ... existing code ...

const calculateDayTotal = (day) => {
  return CalculationService.calculateDayTotal(day)
}

const onDaysReorder = () => {
  updateModelValue()
  emit('change', {
    type: 'reorderDays',
    days: tourDays.value,
  })
}

const onActivitiesReorder = (dayId) => {
  updateModelValue()
  emit('change', {
    type: 'reorderActivities',
    dayId,
    activities: tourDays.value.find((d) => d.id === dayId)?.activities || [],
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0)
}

const updateModelValue = () => {
  emit('update:modelValue', tourDays.value)
}

// Следим за изменениями props
watch(
  () => props.modelValue,
  (newValue) => {
    tourDays.value = newValue || []
  },
  { deep: true },
)

// Инициализация при монтировании
updateModelValue()
</script>

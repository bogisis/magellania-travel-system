<template>
  <div class="space-y-6">
    <!-- Заголовок -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">Опциональные услуги</h3>
      <BaseButton variant="outline" size="sm" @click="addService" :icon="Plus">
        Добавить услугу
      </BaseButton>
    </div>

    <!-- Информация -->
    <div class="bg-blue-50 p-4 rounded-lg">
      <div class="flex items-center space-x-2 mb-2">
        <Info class="w-5 h-5 text-blue-600" />
        <span class="text-sm font-medium text-blue-900">Информация</span>
      </div>
      <p class="text-sm text-blue-700">
        Опциональные услуги не включаются в общие расходы по умолчанию. Вы можете перенести услугу в
        смету, выбрав соответствующий день.
      </p>
    </div>

    <!-- Список опциональных услуг -->
    <div class="space-y-4">
      <div
        v-for="(service, index) in optionalServices"
        :key="service.id"
        class="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div
              class="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium"
            >
              {{ index + 1 }}
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900">{{ service.name }}</h4>
              <p class="text-xs text-gray-500">{{ service.category }}</p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-sm font-medium text-gray-900">
              {{ formatCurrency(service.price) }}
            </span>
            <BaseButton
              variant="ghost"
              size="sm"
              @click="removeService(service.id)"
              :icon="Trash2"
              class="text-red-600 hover:text-red-700"
            >
              Удалить
            </BaseButton>
          </div>
        </div>

        <!-- Детали услуги -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <!-- Название услуги -->
          <div>
            <label class="form-label">Название услуги</label>
            <BaseInput
              v-model="service.name"
              placeholder="Название услуги"
              @input="updateService(service.id, 'name', $event.target.value)"
            />
          </div>

          <!-- Категория -->
          <div>
            <label class="form-label">Категория</label>
            <select
              v-model="service.category"
              class="form-input"
              @change="updateService(service.id, 'category', $event.target.value)"
            >
              <option value="">Выберите категорию</option>
              <option value="transport">Транспорт</option>
              <option value="excursion">Экскурсия</option>
              <option value="meal">Питание</option>
              <option value="entertainment">Развлечения</option>
              <option value="insurance">Страховка</option>
              <option value="other">Другое</option>
            </select>
          </div>

          <!-- Цена -->
          <div>
            <label class="form-label">Цена (USD)</label>
            <BaseInput
              v-model.number="service.price"
              type="number"
              min="0"
              step="0.01"
              @input="updateService(service.id, 'price', $event.target.value)"
            />
          </div>
        </div>

        <!-- Описание -->
        <div class="mb-4">
          <label class="form-label">Описание</label>
          <textarea
            v-model="service.description"
            rows="3"
            class="form-input"
            placeholder="Подробное описание услуги"
            @input="updateService(service.id, 'description', $event.target.value)"
          />
        </div>

        <!-- Перенос в смету -->
        <div class="border-t pt-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-700">Перенести в смету:</span>
              <select
                v-model="service.targetDay"
                class="form-input text-sm"
                @change="updateService(service.id, 'targetDay', $event.target.value)"
              >
                <option value="">Не переносить</option>
                <option v-for="day in availableDays" :key="day.id" :value="day.id">
                  День {{ day.dayNumber }} - {{ day.title }}
                </option>
              </select>
            </div>

            <div class="flex items-center space-x-2">
              <BaseButton
                v-if="service.targetDay"
                variant="outline"
                size="sm"
                @click="moveToEstimate(service)"
                :icon="ArrowRight"
              >
                Перенести
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Итоговая информация -->
    <div v-if="optionalServices.length > 0" class="bg-orange-50 p-4 rounded-lg">
      <h4 class="text-sm font-medium text-orange-900 mb-3">Итоговая информация</h4>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-orange-700">Всего услуг:</span>
          <span class="ml-2 font-medium text-orange-900">{{ optionalServices.length }}</span>
        </div>
        <div>
          <span class="text-orange-700">Общая стоимость:</span>
          <span class="ml-2 font-medium text-orange-900">{{ formatCurrency(totalCost) }}</span>
        </div>
        <div>
          <span class="text-orange-700">Готово к переносу:</span>
          <span class="ml-2 font-medium text-orange-900">{{ readyToMoveCount }}</span>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-if="optionalServices.length === 0" class="text-center py-8">
      <div class="text-gray-400 mb-4">
        <Plus class="w-12 h-12 mx-auto" />
      </div>
      <p class="text-gray-500">Опциональные услуги не добавлены</p>
      <p class="text-sm text-gray-400 mt-1">Нажмите "Добавить услугу" для начала</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Trash2, Info, ArrowRight } from 'lucide-vue-next'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  tourDays: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'moveToEstimate'])

// Реактивные данные
const optionalServices = ref(props.modelValue || [])

// Вычисляемые свойства
const availableDays = computed(() => {
  return props.tourDays.map((day, index) => ({
    id: day.id,
    dayNumber: index + 1,
    title: day.title || `День ${index + 1}`,
  }))
})

const totalCost = computed(() => {
  return optionalServices.value.reduce((sum, service) => sum + Number(service.price || 0), 0)
})

const readyToMoveCount = computed(() => {
  return optionalServices.value.filter((service) => service.targetDay).length
})

// Методы
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const addService = () => {
  const newService = {
    id: generateId(),
    name: '',
    category: '',
    price: 0,
    description: '',
    targetDay: '',
  }

  optionalServices.value.push(newService)
  updateModelValue()
  emit('change', {
    type: 'add',
    service: newService,
  })
}

const removeService = (serviceId) => {
  const index = optionalServices.value.findIndex((service) => service.id === serviceId)
  if (index !== -1) {
    const removedService = optionalServices.value[index]
    optionalServices.value.splice(index, 1)
    updateModelValue()
    emit('change', {
      type: 'remove',
      service: removedService,
    })
  }
}

const updateService = (serviceId, field, value) => {
  const service = optionalServices.value.find((s) => s.id === serviceId)
  if (service) {
    service[field] = value
    updateModelValue()
    emit('change', {
      type: 'update',
      serviceId,
      field,
      value,
    })
  }
}

const moveToEstimate = (service) => {
  if (service.targetDay) {
    emit('moveToEstimate', {
      service,
      targetDay: service.targetDay,
    })

    // Очищаем выбор дня после переноса
    service.targetDay = ''
    updateModelValue()
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0)
}

const updateModelValue = () => {
  emit('update:modelValue', optionalServices.value)
}

// Следим за изменениями props
watch(
  () => props.modelValue,
  (newValue) => {
    optionalServices.value = newValue || []
  },
  { deep: true },
)

// Инициализация при монтировании
updateModelValue()
</script>

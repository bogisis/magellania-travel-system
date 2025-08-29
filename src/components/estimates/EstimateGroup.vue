<!-- src/components/estimates/EstimateGroup.vue -->
<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Информация о группе</h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Общее количество участников -->
      <div class="form-field">
        <label class="form-label">Общее количество участников</label>
        <input
          v-model.number="groupData.totalPax"
          type="number"
          min="1"
          class="form-input"
          placeholder="Количество"
          @input="updateGroupField('totalPax', $event.target.value)"
        />
        <div class="form-hint">Общее количество людей в группе</div>
      </div>

      <!-- Количество взрослых -->
      <div class="form-field">
        <label class="form-label">Взрослые</label>
        <input
          v-model.number="groupData.adults"
          type="number"
          min="0"
          class="form-input"
          placeholder="Количество"
          @input="updateGroupField('adults', $event.target.value)"
        />
        <div class="form-hint">Количество взрослых участников</div>
      </div>

      <!-- Количество детей -->
      <div class="form-field">
        <label class="form-label">Дети</label>
        <input
          v-model.number="groupData.children"
          type="number"
          min="0"
          class="form-input"
          placeholder="Количество"
          @input="updateGroupField('children', $event.target.value)"
        />
        <div class="form-hint">Количество детей (до 12 лет)</div>
      </div>

      <!-- Количество младенцев -->
      <div class="form-field">
        <label class="form-label">Младенцы</label>
        <input
          v-model.number="groupData.infants"
          type="number"
          min="0"
          class="form-input"
          placeholder="Количество"
          @input="updateGroupField('infants', $event.target.value)"
        />
        <div class="form-hint">Количество младенцев (до 2 лет)</div>
      </div>
    </div>

    <!-- Дополнительная информация о группе -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Количество двухместных номеров -->
      <div class="form-field">
        <label class="form-label">Двухместные номера</label>
        <input
          v-model.number="groupData.doubleCount"
          type="number"
          min="0"
          class="form-input"
          placeholder="Количество"
          @input="updateGroupField('doubleCount', $event.target.value)"
        />
        <div class="form-hint">Количество двухместных номеров</div>
      </div>

      <!-- Количество одноместных номеров -->
      <div class="form-field">
        <label class="form-label">Одноместные номера</label>
        <input
          v-model.number="groupData.singleCount"
          type="number"
          min="0"
          class="form-input"
          placeholder="Количество"
          @input="updateGroupField('singleCount', $event.target.value)"
        />
        <div class="form-hint">Количество одноместных номеров</div>
      </div>

      <!-- Количество гидов -->
      <div class="form-field">
        <label class="form-label">Гиды</label>
        <input
          v-model.number="groupData.guidesCount"
          type="number"
          min="0"
          class="form-input"
          placeholder="Количество"
          @input="updateGroupField('guidesCount', $event.target.value)"
        />
        <div class="form-hint">Количество сопровождающих гидов</div>
      </div>

      <!-- Наценка для группы -->
      <div class="form-field">
        <label class="form-label">Наценка для группы (%)</label>
        <input
          v-model.number="groupData.markup"
          type="number"
          min="0"
          max="100"
          step="0.1"
          class="form-input"
          placeholder="0"
          @input="updateGroupField('markup', $event.target.value)"
        />
        <div class="form-hint">Дополнительная наценка для группы</div>
      </div>
    </div>

    <!-- Сводка по группе -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Сводка по группе:</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span class="text-gray-600">Всего участников:</span>
          <span class="font-medium ml-1">{{ groupData.totalPax || 0 }}</span>
        </div>
        <div>
          <span class="text-gray-600">Взрослые:</span>
          <span class="font-medium ml-1">{{ groupData.adults || 0 }}</span>
        </div>
        <div>
          <span class="text-gray-600">Дети:</span>
          <span class="font-medium ml-1">{{ groupData.children || 0 }}</span>
        </div>
        <div>
          <span class="text-gray-600">Младенцы:</span>
          <span class="font-medium ml-1">{{ groupData.infants || 0 }}</span>
        </div>
      </div>
      
      <!-- Проверка корректности данных -->
      <div v-if="validationError" class="mt-2 text-sm text-red-600">
        ⚠️ {{ validationError }}
      </div>
      <div v-else-if="isValid" class="mt-2 text-sm text-green-600">
        ✅ Данные группы корректны
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useEstimateGroup } from '@/composables/useEstimateContext.js'

// Используем composable для работы с группой
const { group, updateGroup, updateField } = useEstimateGroup()

// Локальное состояние для валидации
const validationError = ref('')
const isValid = ref(false)

// Реактивные данные группы
const groupData = computed({
  get: () => group.value,
  set: (value) => updateGroup(value)
})

// Валидация данных группы
const validateGroup = () => {
  const data = groupData.value
  
  // Проверяем, что общее количество равно сумме категорий
  const calculatedTotal = (data.adults || 0) + (data.children || 0) + (data.infants || 0)
  
  if (data.totalPax && data.totalPax !== calculatedTotal) {
    validationError.value = `Общее количество (${data.totalPax}) не соответствует сумме категорий (${calculatedTotal})`
    isValid.value = false
    return false
  }
  
  if (data.totalPax && data.totalPax < 1) {
    validationError.value = 'Общее количество участников должно быть больше 0'
    isValid.value = false
    return false
  }
  
  if ((data.adults || 0) < 0) {
    validationError.value = 'Количество взрослых не может быть отрицательным'
    isValid.value = false
    return false
  }
  
  if ((data.children || 0) < 0) {
    validationError.value = 'Количество детей не может быть отрицательным'
    isValid.value = false
    return false
  }
  
  if ((data.infants || 0) < 0) {
    validationError.value = 'Количество младенцев не может быть отрицательным'
    isValid.value = false
    return false
  }
  
  if ((data.markup || 0) < 0 || (data.markup || 0) > 100) {
    validationError.value = 'Наценка должна быть от 0 до 100%'
    isValid.value = false
    return false
  }
  
  validationError.value = ''
  isValid.value = true
  return true
}

// Обновление поля группы
const updateGroupField = (field, value) => {
  const numValue = field === 'markup' ? parseFloat(value) || 0 : parseInt(value) || 0
  updateField(field, numValue)
}

// Автоматическая валидация при изменении данных
watch(groupData, () => {
  validateGroup()
}, { deep: true, immediate: true })

// Экспортируем методы для внешнего использования
defineExpose({
  validate: validateGroup,
  getGroupData: () => groupData.value,
  updateGroupData: (data) => updateGroup(data)
})
</script>

<style scoped>
.form-field {
  @apply mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-input {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full;
}

.form-hint {
  @apply mt-1 text-sm text-gray-500;
}
</style>

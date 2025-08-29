<template>
  <div class="activity-creator">
    <div class="form-section">
      <h3 class="section-title">Создание активности</h3>

      <!-- Основная информация -->
      <div class="form-grid">
        <div class="form-group">
          <label for="activity-name" class="form-label">Название активности *</label>
          <input
            id="activity-name"
            v-model="activity.name"
            type="text"
            class="form-input"
            placeholder="Введите название активности"
            @input="onNameChange"
            required
          />
        </div>

        <div class="form-group">
          <label for="activity-type" class="form-label">Тип активности</label>
          <select
            id="activity-type"
            v-model="activity.type"
            class="form-select"
            @change="onTypeChange"
          >
            <option value="">Выберите тип</option>
            <option value="entrance">Входные билеты</option>
            <option value="transfer">Трансфер</option>
            <option value="transport">Транспорт</option>
            <option value="guide">Работа гида</option>
            <option value="activity">Активность</option>
          </select>
        </div>

        <div class="form-group">
          <label for="calculation-type" class="form-label">Тип расчета</label>
          <select id="calculation-type" v-model="activity.calculation_type" class="form-select">
            <option value="per_person">За человека</option>
            <option value="per_group">За группу</option>
            <option value="per_unit">За единицу</option>
            <option value="per_day">За день</option>
          </select>
        </div>

        <div class="form-group">
          <label for="base-price" class="form-label">Базовая цена *</label>
          <input
            id="base-price"
            v-model.number="activity.base_price"
            type="number"
            step="0.01"
            min="0"
            class="form-input"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <!-- Интеллектуальные подсказки -->
      <div v-if="pricingSuggestion.suggested" class="suggestion-section">
        <div class="suggestion-header">
          <Icon name="lightbulb" class="suggestion-icon" />
          <span class="suggestion-title">Интеллектуальная подсказка</span>
          <span class="suggestion-confidence"
            >Уверенность: {{ (pricingSuggestion.confidence * 100).toFixed(0) }}%</span
          >
        </div>

        <div class="suggestion-content">
          <div class="suggestion-item">
            <span class="suggestion-label">Предлагаемая цена:</span>
            <span class="suggestion-value">{{
              formatCurrency(pricingSuggestion.suggested_price)
            }}</span>
          </div>

          <div class="suggestion-item">
            <span class="suggestion-label">Тип расчета:</span>
            <span class="suggestion-value">{{
              getCalculationTypeLabel(pricingSuggestion.calculation_type)
            }}</span>
          </div>

          <div class="suggestion-item">
            <span class="suggestion-label">Категория:</span>
            <span class="suggestion-value">{{ getCategoryLabel(pricingSuggestion.category) }}</span>
          </div>
        </div>

        <div class="suggestion-actions">
          <button type="button" class="btn btn-primary btn-sm" @click="applySuggestion">
            Применить подсказку
          </button>
          <button type="button" class="btn btn-secondary btn-sm" @click="ignoreSuggestion">
            Игнорировать
          </button>
        </div>
      </div>

      <!-- Дополнительные параметры -->
      <div class="form-grid">
        <div class="form-group">
          <label for="quantity" class="form-label">Количество</label>
          <input
            id="quantity"
            v-model.number="activity.quantity"
            type="number"
            min="1"
            class="form-input"
            placeholder="1"
          />
        </div>

        <div class="form-group">
          <label for="markup" class="form-label">Наценка (%)</label>
          <input
            id="markup"
            v-model.number="activity.markup"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="form-input"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label for="time" class="form-label">Время</label>
          <input
            id="time"
            v-model="activity.time"
            type="text"
            class="form-input"
            placeholder="09:00"
          />
        </div>

        <div class="form-group">
          <label for="duration" class="form-label">Продолжительность</label>
          <input
            id="duration"
            v-model="activity.duration"
            type="text"
            class="form-input"
            placeholder="2 часа"
          />
        </div>
      </div>

      <!-- Описание -->
      <div class="form-group">
        <label for="description" class="form-label">Описание</label>
        <textarea
          id="description"
          v-model="activity.description"
          class="form-textarea"
          rows="3"
          placeholder="Дополнительное описание активности..."
        ></textarea>
      </div>

      <!-- Предварительный расчет -->
      <div v-if="previewCalculation" class="preview-section">
        <h4 class="preview-title">Предварительный расчет</h4>
        <div class="preview-grid">
          <div class="preview-item">
            <span class="preview-label">Базовая стоимость:</span>
            <span class="preview-value">{{ formatCurrency(previewCalculation.base_cost) }}</span>
          </div>
          <div v-if="previewCalculation.markup_amount > 0" class="preview-item">
            <span class="preview-label">Наценка:</span>
            <span class="preview-value">{{
              formatCurrency(previewCalculation.markup_amount)
            }}</span>
          </div>
          <div class="preview-item preview-total">
            <span class="preview-label">Итого:</span>
            <span class="preview-value">{{
              formatCurrency(previewCalculation.total_with_markup)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Действия -->
      <div class="form-actions">
        <button type="button" class="btn btn-primary" @click="saveActivity" :disabled="!isValid">
          {{ isEditing ? 'Обновить' : 'Добавить' }} активность
        </button>
        <button type="button" class="btn btn-secondary" @click="cancel">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { PricingIntelligenceService } from '@/services/PricingIntelligenceService.js'
import { CalculationEngine } from '@/services/CalculationEngine.js'
import Icon from '../common/Icon.vue'

// Props
const props = defineProps({
  activity: {
    type: Object,
    default: () => ({}),
  },
  participantCount: {
    type: Number,
    default: 1,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['save', 'cancel'])

// Reactive data
const activity = ref({
  name: '',
  type: '',
  calculation_type: 'per_person',
  base_price: 0,
  quantity: 1,
  markup: 0,
  time: '',
  duration: '',
  description: '',
  ...props.activity,
})

const pricingSuggestion = ref({
  suggested: false,
  suggested_price: 0,
  calculation_type: '',
  category: '',
  confidence: 0,
})

// Computed
const isValid = computed(() => {
  return activity.value.name && activity.value.base_price > 0
})

const previewCalculation = computed(() => {
  if (!activity.value.base_price || !activity.value.calculation_type) {
    return null
  }

  return CalculationEngine.calculateActivityPriceDual(
    activity.value,
    props.participantCount,
    CalculationEngine.DISPLAY_MODES.WITH_MARKUP,
  )
})

// Methods
const onNameChange = () => {
  if (activity.value.name && activity.value.type) {
    getPricingSuggestion()
  }
}

const onTypeChange = () => {
  if (activity.value.name && activity.value.type) {
    getPricingSuggestion()
  }
}

const getPricingSuggestion = () => {
  try {
    const suggestion = PricingIntelligenceService.suggestPricing(
      activity.value.name,
      activity.value.type,
      props.participantCount,
    )

    if (suggestion.suggested) {
      pricingSuggestion.value = suggestion
    }
  } catch (error) {
    console.error('Ошибка получения подсказки:', error)
  }
}

const applySuggestion = () => {
  if (pricingSuggestion.value.suggested) {
    activity.value.base_price = pricingSuggestion.value.suggested_price
    activity.value.calculation_type = pricingSuggestion.value.calculation_type
    pricingSuggestion.value.suggested = false
  }
}

const ignoreSuggestion = () => {
  pricingSuggestion.value.suggested = false
}

const saveActivity = () => {
  if (isValid.value) {
    emit('save', { ...activity.value })
  }
}

const cancel = () => {
  emit('cancel')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0)
}

const getCalculationTypeLabel = (type) => {
  const labels = {
    per_person: 'За человека',
    per_group: 'За группу',
    per_unit: 'За единицу',
    per_day: 'За день',
  }
  return labels[type] || type
}

const getCategoryLabel = (category) => {
  const labels = {
    entrance_fees: 'Входные билеты',
    transfers: 'Трансферы',
    transport: 'Транспорт',
    accommodation: 'Размещение',
    guides: 'Гиды',
    activities: 'Активности',
  }
  return labels[category] || category
}

// Lifecycle
onMounted(() => {
  if (activity.value.name && activity.value.type) {
    getPricingSuggestion()
  }
})

// Watchers
watch(
  () => props.activity,
  (newActivity) => {
    activity.value = { ...activity.value, ...newActivity }
  },
  { deep: true },
)
</script>

<style scoped>
.activity-creator {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 500;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.suggestion-section {
  background: var(--color-background-soft);
  border: 1px solid var(--color-primary);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.suggestion-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
}

.suggestion-title {
  font-weight: 600;
  color: var(--color-text);
}

.suggestion-confidence {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--color-text-light);
  background: var(--color-background);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.suggestion-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 0.25rem;
}

.suggestion-label {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.suggestion-value {
  font-weight: 500;
  color: var(--color-text);
}

.suggestion-actions {
  display: flex;
  gap: 0.5rem;
}

.preview-section {
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.preview-title {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.preview-grid {
  display: grid;
  gap: 0.5rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.preview-item:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.preview-label {
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.preview-value {
  font-weight: 500;
  color: var(--color-text);
}

.preview-total {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-background-mute);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

/* Responsive */
@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-content {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>

<template>
  <div class="display-mode-toggle">
    <div class="toggle-container">
      <label class="toggle-label">Режим отображения цен:</label>
      <div class="toggle-buttons">
        <button
          :class="['toggle-btn', { active: displayMode === 'WITHOUT_MARKUP' }]"
          @click="setDisplayMode('WITHOUT_MARKUP')"
          type="button"
        >
          <Icon name="calculator" class="toggle-icon" />
          Без наценки
        </button>
        <button
          :class="['toggle-btn', { active: displayMode === 'WITH_MARKUP' }]"
          @click="setDisplayMode('WITH_MARKUP')"
          type="button"
        >
          <Icon name="dollar-sign" class="toggle-icon" />
          С наценкой
        </button>
      </div>
    </div>
    
    <div class="mode-info" v-if="showInfo">
      <div class="info-item" v-if="displayMode === 'WITHOUT_MARKUP'">
        <Icon name="info" class="info-icon" />
        <span>Показываются базовые цены без наценок</span>
      </div>
      <div class="info-item" v-else>
        <Icon name="info" class="info-icon" />
        <span>Показываются финальные цены с примененными наценками</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: 'WITH_MARKUP',
    validator: (value) => ['WITHOUT_MARKUP', 'WITH_MARKUP'].includes(value)
  },
  showInfo: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change'])

// Computed
const displayMode = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    emit('change', value)
  }
})

// Methods
const setDisplayMode = (mode) => {
  displayMode.value = mode
}
</script>

<style scoped>
.display-mode-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  border: 1px solid var(--color-border);
}

.toggle-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.toggle-label {
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
}

.toggle-buttons {
  display: flex;
  gap: 0.5rem;
  background: var(--color-background-mute);
  border-radius: 0.375rem;
  padding: 0.25rem;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.toggle-btn:hover {
  background: var(--color-background);
}

.toggle-btn.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-icon {
  width: 1rem;
  height: 1rem;
}

.mode-info {
  padding: 0.75rem;
  background: var(--color-background);
  border-radius: 0.375rem;
  border-left: 3px solid var(--color-primary);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.info-icon {
  width: 1rem;
  height: 1rem;
  color: var(--color-primary);
}

/* Responsive */
@media (max-width: 640px) {
  .toggle-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .toggle-buttons {
    width: 100%;
  }
  
  .toggle-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>

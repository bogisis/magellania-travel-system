# Миграции базы данных

## 🔄 Обзор миграций

MAGELLANIA Travel System использует систему миграций для управления изменениями схемы базы данных. Это обеспечивает безопасное обновление структуры данных без потери информации.

### Принципы миграций

1. **Версионирование** - каждая миграция имеет уникальную версию
2. **Необратимость** - миграции выполняются только вперед
3. **Атомарность** - миграция либо выполняется полностью, либо откатывается
4. **Безопасность** - резервное копирование перед выполнением

## 📋 План миграций

### Фаза 0: Подготовка (1 неделя)

#### Настройка окружения разработки

```bash
# 1. Установка Node.js и инструментов
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
npm install -g pnpm

# 2. Создание проекта Vue.js с TypeScript
pnpm create vue@latest magellania-tours
# ✅ TypeScript
# ✅ Vue Router
# ✅ Pinia
# ✅ ESLint
# ✅ Prettier

# 3. Установка основных зависимостей
cd magellania-tours
pnpm add @supabase/supabase-js
pnpm add @vueuse/core
pnpm add dayjs
pnpm add vue-draggable-plus
pnpm add @tanstack/vue-table
pnpm add jspdf html2canvas
pnpm add tailwindcss @tailwindcss/forms @tailwindcss/typography
```

#### Настройка базы данных

```sql
-- 1. Создание базовой структуры
CREATE TABLE estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tour_name VARCHAR(255),
  country VARCHAR(100),
  region VARCHAR(100),
  start_date DATE,
  duration INTEGER,
  data JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS политики
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own estimates"
  ON estimates FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create estimates"
  ON estimates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own estimates"
  ON estimates FOR UPDATE
  USING (auth.uid() = created_by);
```

### Фаза 1: Миграция базового функционала (2 недели)

#### Неделя 1: Перенос существующего кода

**День 1-2: Структура проекта**

```typescript
// src/types/estimate.ts
export interface Tour {
  id: string
  name: string
  country: string
  region: string
  startDate: Date
  duration: number
  days: TourDay[]
}

export interface TourDay {
  id: string
  dayNumber: number
  date: Date
  title: string
  activities: Activity[]
  hotels: HotelBooking[]
}

export interface Activity {
  id: string
  type: 'transport' | 'excursion' | 'meal' | 'other'
  description: string
  quantity: number
  pricePerUnit: number
  supplier?: string
}
```

**День 3-4: Компоненты**

```vue
<!-- src/components/EstimateForm.vue -->
<template>
  <div class="estimate-form">
    <form @submit.prevent="saveEstimate">
      <div class="form-section">
        <h3>Основная информация</h3>
        <BaseInput v-model="estimate.name" label="Название сметы" required />
        <BaseInput v-model="estimate.tourName" label="Название тура" />
        <BaseSelect v-model="estimate.country" label="Страна" :options="countries" />
      </div>

      <div class="form-section">
        <h3>Дни тура</h3>
        <TourDaysEditor v-model="estimate.days" @update:days="updateDays" />
      </div>

      <div class="form-actions">
        <BaseButton type="submit" :loading="isSaving"> Сохранить смету </BaseButton>
      </div>
    </form>
  </div>
</template>
```

**День 5-7: Интеграция с базой данных**

```typescript
// src/services/estimateService.ts
import { supabase } from '@/lib/supabase'
import type { Estimate } from '@/types/estimate'

export class EstimateService {
  static async create(estimate: Partial<Estimate>): Promise<Estimate> {
    const { data, error } = await supabase.from('estimates').insert([estimate]).select().single()

    if (error) throw error
    return data
  }

  static async update(id: string, updates: Partial<Estimate>): Promise<Estimate> {
    const { data, error } = await supabase
      .from('estimates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('estimates').delete().eq('id', id)

    if (error) throw error
  }
}
```

#### Неделя 2: Тестирование и отладка

**День 1-3: Unit тесты**

```typescript
// tests/unit/EstimateService.test.ts
import { describe, it, expect, vi } from 'vitest'
import { EstimateService } from '@/services/estimateService'

describe('EstimateService', () => {
  it('should create estimate', async () => {
    const estimate = {
      name: 'Test Estimate',
      tourName: 'Test Tour',
      country: 'argentina',
    }

    const result = await EstimateService.create(estimate)
    expect(result.name).toBe('Test Estimate')
  })

  it('should update estimate', async () => {
    const updates = { name: 'Updated Estimate' }
    const result = await EstimateService.update('test-id', updates)
    expect(result.name).toBe('Updated Estimate')
  })
})
```

**День 4-5: E2E тесты**

```typescript
// tests/e2e/estimate-flow.spec.ts
import { test, expect } from '@playwright/test'

test('should create and edit estimate', async ({ page }) => {
  await page.goto('/estimates/new')

  await page.fill('[data-test="estimate-name"]', 'Test Estimate')
  await page.fill('[data-test="tour-name"]', 'Test Tour')
  await page.selectOption('[data-test="country-select"]', 'argentina')

  await page.click('[data-test="save-button"]')

  await expect(page.locator('[data-test="success-message"]')).toBeVisible()
})
```

### Фаза 2: Расширенный функционал (3 недели)

#### Неделя 3: Drag & Drop и интерактивность

```vue
<!-- src/components/TourDaysEditor.vue -->
<template>
  <div class="tour-days-editor">
    <VueDraggable v-model="days" item-key="id" @end="onDragEnd">
      <template #item="{ element: day }">
        <TourDayCard :day="day" @update="updateDay" @delete="deleteDay" />
      </template>
    </VueDraggable>

    <BaseButton @click="addDay"> Добавить день </BaseButton>
  </div>
</template>

<script setup>
import { VueDraggable } from 'vue-draggable-plus'
import TourDayCard from './TourDayCard.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const days = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const addDay = () => {
  const newDay = {
    id: generateId(),
    dayNumber: days.value.length + 1,
    title: `День ${days.value.length + 1}`,
    activities: [],
  }
  days.value.push(newDay)
}

const updateDay = (dayId, updates) => {
  const index = days.value.findIndex((day) => day.id === dayId)
  if (index !== -1) {
    days.value[index] = { ...days.value[index], ...updates }
  }
}

const deleteDay = (dayId) => {
  days.value = days.value.filter((day) => day.id !== dayId)
  // Пересчитываем номера дней
  days.value.forEach((day, index) => {
    day.dayNumber = index + 1
  })
}
</script>
```

#### Неделя 4: Расчеты и экспорт

```typescript
// src/services/calculationService.ts
export class CalculationService {
  static calculateDayTotal(day: TourDay): number {
    return day.activities.reduce((sum, activity) => {
      return sum + activity.quantity * activity.pricePerUnit
    }, 0)
  }

  static calculateEstimateTotal(estimate: Estimate): number {
    const daysTotal = estimate.days.reduce((sum, day) => {
      return sum + this.calculateDayTotal(day)
    }, 0)

    const markup = estimate.markupPercent || 0
    return daysTotal * (1 + markup / 100)
  }

  static applyDiscount(total: number, discountPercent: number): number {
    return total * (1 - discountPercent / 100)
  }
}
```

```typescript
// src/services/exportService.ts
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export class ExportService {
  static async exportToPDF(estimate: Estimate): Promise<Blob> {
    const element = document.getElementById('estimate-pdf-template')
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF()
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    return pdf.output('blob')
  }
}
```

#### Неделя 5: Оптимизация и производительность

```typescript
// src/composables/useEstimateOptimization.ts
import { ref, computed, watch } from 'vue'
import { debounce } from '@vueuse/core'

export function useEstimateOptimization(estimate: Ref<Estimate>) {
  const autoSaveEnabled = ref(true)
  const lastSaved = ref<Date | null>(null)

  // Автосохранение с debounce
  const debouncedSave = debounce(async (data: Estimate) => {
    try {
      await EstimateService.update(data.id, data)
      lastSaved.value = new Date()
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, 2000)

  // Следим за изменениями и автосохраняем
  watch(
    estimate,
    (newValue) => {
      if (autoSaveEnabled.value && newValue.id) {
        debouncedSave(newValue)
      }
    },
    { deep: true },
  )

  return {
    autoSaveEnabled,
    lastSaved,
    debouncedSave,
  }
}
```

### Фаза 3: Продвинутые функции (2 недели)

#### Неделя 6: Аналитика и отчеты

```typescript
// src/services/analyticsService.ts
export class AnalyticsService {
  static async getEstimateStats(): Promise<EstimateStats> {
    const { data: estimates } = await supabase.from('estimates').select('*')

    const totalEstimates = estimates.length
    const totalRevenue = estimates.reduce((sum, est) => sum + est.totalPrice, 0)
    const avgEstimateValue = totalRevenue / totalEstimates

    const estimatesByStatus = estimates.reduce((acc, est) => {
      acc[est.status] = (acc[est.status] || 0) + 1
      return acc
    }, {})

    return {
      totalEstimates,
      totalRevenue,
      avgEstimateValue,
      estimatesByStatus,
    }
  }
}
```

#### Неделя 7: Интеграции и API

```typescript
// src/services/integrationService.ts
export class IntegrationService {
  static async syncWithExternalAPI(estimate: Estimate): Promise<void> {
    // Интеграция с внешними системами бронирования
    const bookingData = {
      tourName: estimate.tourName,
      startDate: estimate.startDate,
      duration: estimate.duration,
      participants: estimate.participants,
    }

    // Отправка данных в API
    await fetch('/api/external/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    })
  }
}
```

## 🔧 Инструменты миграции

### SQLite миграции

```javascript
// migrations/001_initial_schema.js
export const up = async (db) => {
  await db.exec(`
    CREATE TABLE estimates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      client_id INTEGER,
      supplier_id INTEGER,
      total_price DECIMAL(10,2) DEFAULT 0.00,
      status TEXT DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );
  `)
}

export const down = async (db) => {
  await db.exec('DROP TABLE IF EXISTS estimates;')
}
```

### IndexedDB миграции

```javascript
// src/services/database.js
class MagellaniaDatabase extends Dexie {
  constructor() {
    super('MagellaniaDB')

    this.version(1).stores({
      estimates: '++id, name, status, createdAt',
    })

    this.version(2)
      .stores({
        estimates: '++id, name, status, createdAt, clientId',
        clients: '++id, name, email',
      })
      .upgrade((tx) => {
        // Миграция данных
        return tx
          .table('estimates')
          .toCollection()
          .modify((estimate) => {
            estimate.clientId = null // Добавляем новое поле
          })
      })

    this.version(3)
      .stores({
        estimates: '++id, name, status, createdAt, clientId, supplierId',
        clients: '++id, name, email',
        suppliers: '++id, name, contact',
      })
      .upgrade((tx) => {
        // Добавляем таблицу поставщиков
        return tx.table('suppliers').add({
          id: 1,
          name: 'Default Supplier',
          contact: 'default@example.com',
        })
      })
  }
}
```

## 📋 Чек-лист миграции

### Подготовка

- [ ] Создание резервной копии данных
- [ ] Тестирование миграции на копии данных
- [ ] Подготовка rollback плана
- [ ] Уведомление пользователей о downtime

### Выполнение

- [ ] Остановка приложения
- [ ] Выполнение миграции
- [ ] Проверка целостности данных
- [ ] Обновление версии приложения
- [ ] Запуск приложения

### Пост-миграция

- [ ] Мониторинг производительности
- [ ] Проверка функциональности
- [ ] Обновление документации
- [ ] Удаление старых файлов

## 🚨 Обработка ошибок миграции

### Типичные проблемы

1. **Конфликты схемы**

   ```sql
   -- Решение: переименование таблиц
   ALTER TABLE old_table RENAME TO new_table;
   ```

2. **Потеря данных**

   ```sql
   -- Решение: создание временных таблиц
   CREATE TABLE temp_table AS SELECT * FROM original_table;
   -- Выполнение миграции
   -- Восстановление данных
   ```

3. **Проблемы с индексами**
   ```sql
   -- Решение: пересоздание индексов
   DROP INDEX IF EXISTS problematic_index;
   CREATE INDEX new_index ON table(column);
   ```

### Rollback стратегия

```javascript
// rollback.js
export const rollback = async (version) => {
  const db = new MagellaniaDatabase()

  try {
    // Откат к предыдущей версии
    await db.close()
    await Dexie.delete('MagellaniaDB')

    // Восстановление из резервной копии
    await restoreFromBackup()

    console.log('Rollback completed successfully')
  } catch (error) {
    console.error('Rollback failed:', error)
    throw error
  }
}
```

---

**Версия**: 2.0.0  
**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Development Team

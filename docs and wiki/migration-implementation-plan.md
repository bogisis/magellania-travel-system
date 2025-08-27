# 🚀 План поэтапного внедрения системы управления турами

## Фаза 0: Подготовка (1 неделя)

### Настройка окружения разработки
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

### Настройка Supabase
```sql
-- 1. Создайте проект на supabase.com
-- 2. Выполните эти SQL команды в SQL Editor

-- Минимальная структура для старта
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

-- RLS политики
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

## Фаза 1: Миграция базового функционала (2 недели)

### Неделя 1: Перенос существующего кода

#### День 1-2: Структура проекта
```typescript
// src/types/estimate.ts
export interface Tour {
  id: string;
  name: string;
  country: string;
  region: string;
  startDate: Date;
  duration: number;
  days: TourDay[];
}

export interface TourDay {
  id: string;
  dayNumber: number;
  date: Date;
  title: string;
  activities: Activity[];
  hotels: HotelBooking[];
}

export interface Activity {
  id: string;
  type: 'transport' | 'excursion' | 'meal' | 'other';
  description: string;
  quantity: number;
  pricePerUnit: number;
  supplier?: string;
}
```

#### День 3-4: Конвертация компонентов
```vue
<!-- src/components/EstimateForm.vue -->
<template>
  <div class="estimate-form">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField 
        v-model="estimate.tourName" 
        label="Название тура"
        placeholder="Введите название тура"
      />
      
      <FormField 
        v-model="estimate.country" 
        label="Страна"
        type="select"
        :options="countries"
      />
      
      <DatePicker 
        v-model="estimate.startDate"
        label="Дата начала"
        @update:modelValue="updateEndDate"
      />
      
      <FormField 
        v-model.number="estimate.duration"
        label="Продолжительность (дней)"
        type="number"
        @update:modelValue="updateEndDate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEstimateStore } from '@/stores/estimate';
import FormField from '@/components/ui/FormField.vue';
import DatePicker from '@/components/ui/DatePicker.vue';

const store = useEstimateStore();
const estimate = computed(() => store.currentEstimate);

const countries = ref([
  { value: 'argentina', label: 'Аргентина' },
  { value: 'chile', label: 'Чили' },
  { value: 'brazil', label: 'Бразилия' },
  { value: 'peru', label: 'Перу' }
]);

function updateEndDate() {
  // Логика обновления даты окончания
  if (estimate.value.startDate && estimate.value.duration) {
    const start = new Date(estimate.value.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + estimate.value.duration - 1);
    estimate.value.endDate = end;
  }
}
</script>
```

#### День 5: Pinia Store
```typescript
// src/stores/estimate.ts
import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabase';

export const useEstimateStore = defineStore('estimate', {
  state: () => ({
    estimates: [] as Estimate[],
    currentEstimate: null as Estimate | null,
    loading: false,
    error: null as string | null
  }),

  actions: {
    async loadEstimates() {
      this.loading = true;
      try {
        const { data, error } = await supabase
          .from('estimates')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        this.estimates = data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    async saveEstimate() {
      if (!this.currentEstimate) return;
      
      try {
        const { data, error } = await supabase
          .from('estimates')
          .upsert({
            ...this.currentEstimate,
            updated_at: new Date().toISOString()
          });
        
        if (error) throw error;
        
        // Обновляем локальный список
        const index = this.estimates.findIndex(
          e => e.id === this.currentEstimate.id
        );
        if (index >= 0) {
          this.estimates[index] = data[0];
        } else {
          this.estimates.push(data[0]);
        }
        
        return data[0];
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    }
  }
});
```

### Неделя 2: Добавление новой функциональности

#### День 6-7: Drag & Drop для дней
```vue
<!-- src/components/DaysList.vue -->
<template>
  <VueDraggable 
    v-model="days" 
    :animation="200"
    handle=".drag-handle"
    @end="onDragEnd"
  >
    <div 
      v-for="(day, index) in days" 
      :key="day.id"
      class="day-card mb-4"
    >
      <div class="day-header flex items-center">
        <Icon name="drag" class="drag-handle cursor-move mr-2" />
        <h3 class="flex-1">День {{ index + 1 }}: {{ day.title }}</h3>
        <button @click="removeDay(day.id)" class="text-red-500">
          <Icon name="trash" />
        </button>
      </div>
      
      <ActivitiesList 
        :activities="day.activities"
        :day-id="day.id"
      />
      
      <HotelSelector 
        :hotels="day.hotels"
        :day-id="day.id"
      />
    </div>
  </VueDraggable>
  
  <button @click="addDay" class="btn btn-primary">
    Добавить день
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useEstimateStore } from '@/stores/estimate';

const store = useEstimateStore();
const days = computed({
  get: () => store.currentEstimate?.days || [],
  set: (value) => {
    if (store.currentEstimate) {
      store.currentEstimate.days = value;
    }
  }
});

function onDragEnd() {
  // Пересчитываем номера дней после перетаскивания
  days.value.forEach((day, index) => {
    day.dayNumber = index + 1;
  });
  store.saveEstimate();
}

function addDay() {
  const newDay = {
    id: crypto.randomUUID(),
    dayNumber: days.value.length + 1,
    date: calculateDayDate(days.value.length),
    title: '',
    activities: [],
    hotels: []
  };
  days.value.push(newDay);
}

function removeDay(dayId: string) {
  const index = days.value.findIndex(d => d.id === dayId);
  if (index >= 0) {
    days.value.splice(index, 1);
    onDragEnd(); // Пересчитываем номера
  }
}
</script>
```

#### День 8-9: Расчет стоимости с наценкой
```typescript
// src/services/calculations.ts
export class PricingCalculator {
  calculateActivityCost(activity: Activity): number {
    return activity.quantity * activity.pricePerUnit;
  }

  calculateDayCost(day: TourDay): number {
    const activitiesCost = day.activities.reduce(
      (sum, activity) => sum + this.calculateActivityCost(activity),
      0
    );
    
    const hotelsCost = day.hotels.reduce(
      (sum, hotel) => sum + this.calculateHotelCost(hotel),
      0
    );
    
    return activitiesCost + hotelsCost;
  }

  calculateHotelCost(hotel: HotelBooking): number {
    // Логика округления для нечетного количества гостей
    const roomsNeeded = hotel.roomType === 'double' 
      ? Math.ceil(hotel.guestCount / 2)
      : hotel.guestCount;
    
    return roomsNeeded * hotel.pricePerNight;
  }

  calculateTotalCost(estimate: Estimate): number {
    return estimate.days.reduce(
      (sum, day) => sum + this.calculateDayCost(day),
      0
    );
  }

  applyMarkup(
    cost: number, 
    markupPercent: number, 
    includeInLineItems: boolean = false
  ): PricingResult {
    const markup = cost * (markupPercent / 100);
    const total = cost + markup;
    
    if (includeInLineItems) {
      // Наценка включена в каждую строку
      return {
        displayCost: total,
        commission: 0,
        total: total
      };
    } else {
      // Наценка показана отдельной строкой
      return {
        displayCost: cost,
        commission: markup,
        total: total
      };
    }
  }
}
```

#### День 10: PDF генерация
```typescript
// src/services/pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  async generateProposal(estimate: Estimate): Promise<Blob> {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Заголовок
    doc.setFontSize(24);
    doc.text('MAGELLANIA Travel Company', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Коммерческое предложение', 105, 40, { align: 'center' });
    
    // Информация о туре
    doc.setFontSize(12);
    doc.text(`Тур: ${estimate.tourName}`, 20, 60);
    doc.text(`Даты: ${formatDate(estimate.startDate)} - ${formatDate(estimate.endDate)}`, 20, 70);
    doc.text(`Продолжительность: ${estimate.duration} дней`, 20, 80);
    
    // Таблица с расходами
    let yPosition = 100;
    
    estimate.days.forEach((day, index) => {
      // Проверка на разрыв страницы
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.text(`День ${index + 1}: ${day.title}`, 20, yPosition);
      yPosition += 10;
      
      day.activities.forEach(activity => {
        doc.setFontSize(10);
        doc.text(activity.description, 25, yPosition);
        doc.text(`${activity.quantity} x $${activity.pricePerUnit}`, 140, yPosition);
        doc.text(`$${this.calculateActivityCost(activity)}`, 180, yPosition);
        yPosition += 7;
      });
      
      yPosition += 5;
    });
    
    // Итоговая стоимость
    const calculator = new PricingCalculator();
    const total = calculator.calculateTotalCost(estimate);
    const pricing = calculator.applyMarkup(total, estimate.markupPercent);
    
    doc.setFontSize(12);
    doc.text(`Стоимость: $${pricing.displayCost}`, 140, yPosition + 10);
    if (pricing.commission > 0) {
      doc.text(`Комиссия: $${pricing.commission}`, 140, yPosition + 17);
    }
    doc.setFontSize(14);
    doc.text(`ИТОГО: $${pricing.total}`, 140, yPosition + 25);
    
    return doc.output('blob');
  }
}
```

## Фаза 2: Интеграции и автоматизация (3-4 недели)

### Неделя 3: Gmail интеграция

#### Настройка Gmail API
```typescript
// src/services/gmailIntegration.ts
import { google } from 'googleapis';

export class GmailIntegration {
  private gmail;
  
  constructor(credentials: any) {
    const auth = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUrl
    );
    
    auth.setCredentials({
      refresh_token: credentials.refreshToken
    });
    
    this.gmail = google.gmail({ version: 'v1', auth });
  }
  
  async watchInbox() {
    // Настройка push-уведомлений для новых писем
    const response = await this.gmail.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        topicName: 'projects/magellania/topics/gmail-notifications'
      }
    });
    
    return response.data;
  }
  
  async processBookingRequest(messageId: string) {
    // Получаем письмо
    const message = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId
    });
    
    // Парсим содержимое
    const content = this.parseEmailContent(message.data);
    
    // Создаем смету на основе запроса
    const estimate = await this.createEstimateFromEmail(content);
    
    // Отправляем автоответ
    await this.sendAutoReply(content.from, estimate);
    
    return estimate;
  }
  
  private parseEmailContent(message: any) {
    // Используем AI для извлечения информации
    const text = this.extractText(message);
    
    return {
      from: this.extractSender(message),
      dates: this.extractDates(text),
      destination: this.extractDestination(text),
      groupSize: this.extractGroupSize(text),
      requirements: this.extractRequirements(text)
    };
  }
  
  async sendProposal(to: string, estimate: Estimate) {
    const pdfGenerator = new PDFGenerator();
    const pdf = await pdfGenerator.generateProposal(estimate);
    
    const message = {
      to: to,
      subject: `Предложение по туру: ${estimate.tourName}`,
      html: this.generateEmailTemplate(estimate),
      attachments: [{
        filename: `proposal_${estimate.id}.pdf`,
        content: pdf
      }]
    };
    
    return await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: this.createMimeMessage(message)
      }
    });
  }
}
```

### Неделя 4: База контрагентов

#### Структура базы данных
```sql
-- Таблица поставщиков
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50), -- hotel, transport, guide, restaurant
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  
  -- Финансовые условия
  commission_rate DECIMAL(5,2),
  payment_terms VARCHAR(50), -- prepaid, postpaid, partial
  currency VARCHAR(3) DEFAULT 'USD',
  bank_details JSONB,
  
  -- Рейтинг и история
  rating DECIMAL(3,2),
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  last_booking_date DATE,
  
  -- Метаданные
  notes TEXT,
  tags TEXT[],
  is_preferred BOOLEAN DEFAULT FALSE,
  is_blacklisted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Таблица отелей (расширенная)
CREATE TABLE hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  name VARCHAR(255) NOT NULL,
  category INTEGER, -- звездность 1-5
  
  -- Контакты
  booking_email VARCHAR(255),
  booking_phone VARCHAR(50),
  
  -- Типы номеров и цены
  room_types JSONB DEFAULT '[]',
  /* Пример структуры:
  [
    {
      "type": "double",
      "name": "Standard Double",
      "max_occupancy": 2,
      "base_price": 100,
      "extra_bed_price": 30,
      "breakfast_included": true,
      "amenities": ["wifi", "ac", "minibar"]
    }
  ]
  */
  
  -- Условия
  cancellation_policy TEXT,
  check_in_time TIME,
  check_out_time TIME,
  
  -- Интеграции
  booking_com_id VARCHAR(100),
  expedia_id VARCHAR(100),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- История взаимодействий
CREATE TABLE supplier_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  type VARCHAR(50), -- email, call, whatsapp, booking
  subject VARCHAR(255),
  content TEXT,
  response TEXT,
  status VARCHAR(50),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Vue компонент для управления контрагентами
```vue
<!-- src/components/suppliers/SupplierManager.vue -->
<template>
  <div class="supplier-manager">
    <div class="flex justify-between mb-6">
      <SearchInput 
        v-model="searchQuery"
        placeholder="Поиск поставщиков..."
      />
      
      <div class="flex gap-2">
        <FilterDropdown 
          v-model="filters"
          :options="filterOptions"
        />
        
        <button @click="showAddModal = true" class="btn btn-primary">
          Добавить поставщика
        </button>
      </div>
    </div>
    
    <DataTable 
      :data="filteredSuppliers"
      :columns="columns"
      @row-click="openSupplier"
    >
      <template #rating="{ row }">
        <StarRating :value="row.rating" readonly />
      </template>
      
      <template #actions="{ row }">
        <div class="flex gap-2">
          <button @click="sendWhatsApp(row)" class="btn-icon">
            <Icon name="whatsapp" />
          </button>
          <button @click="sendEmail(row)" class="btn-icon">
            <Icon name="email" />
          </button>
          <button @click="viewHistory(row)" class="btn-icon">
            <Icon name="history" />
          </button>
        </div>
      </template>
    </DataTable>
    
    <!-- Модальное окно добавления -->
    <Modal v-model="showAddModal" title="Новый поставщик">
      <SupplierForm 
        @save="addSupplier"
        @cancel="showAddModal = false"
      />
    </Modal>
    
    <!-- Панель истории -->
    <SlidePanel v-model="showHistory" :title="historyTitle">
      <InteractionHistory 
        :supplier-id="selectedSupplier?.id"
        @new-interaction="addInteraction"
      />
    </SlidePanel>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSuppliersStore } from '@/stores/suppliers';
import { useWhatsApp } from '@/composables/useWhatsApp';

const store = useSuppliersStore();
const whatsapp = useWhatsApp();

const searchQuery = ref('');
const filters = ref({
  type: 'all',
  city: 'all',
  rating: 0
});

const columns = [
  { key: 'name', label: 'Название', sortable: true },
  { key: 'type', label: 'Тип', sortable: true },
  { key: 'city', label: 'Город', sortable: true },
  { key: 'rating', label: 'Рейтинг', sortable: true },
  { key: 'commission_rate', label: 'Комиссия %', sortable: true },
  { key: 'last_booking_date', label: 'Последнее бронирование' },
  { key: 'actions', label: 'Действия', width: '150px' }
];

const filteredSuppliers = computed(() => {
  return store.suppliers.filter(supplier => {
    // Поиск
    if (searchQuery.value && !supplier.name.toLowerCase()
        .includes(searchQuery.value.toLowerCase())) {
      return false;
    }
    
    // Фильтры
    if (filters.value.type !== 'all' && 
        supplier.type !== filters.value.type) {
      return false;
    }
    
    if (filters.value.city !== 'all' && 
        supplier.city !== filters.value.city) {
      return false;
    }
    
    if (supplier.rating < filters.value.rating) {
      return false;
    }
    
    return true;
  });
});

async function sendWhatsApp(supplier: Supplier) {
  await whatsapp.sendMessage({
    to: supplier.whatsapp,
    template: 'supplier_request',
    params: {
      name: supplier.contact_name,
      company: supplier.company
    }
  });
}
</script>
```

## Фаза 3: Аналитика и оптимизация (2-3 недели)

### Dashboard с метриками
```vue
<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <MetricCard 
        title="Активные туры"
        :value="metrics.activeTours"
        :change="metrics.toursChange"
        icon="calendar"
      />
      
      <MetricCard 
        title="Выручка (месяц)"
        :value="formatCurrency(metrics.monthlyRevenue)"
        :change="metrics.revenueChange"
        icon="dollar"
      />
      
      <MetricCard 
        title="Средний чек"
        :value="formatCurrency(metrics.averageCheck)"
        :change="metrics.checkChange"
        icon="chart"
      />
      
      <MetricCard 
        title="Конверсия КП"
        :value="formatPercent(metrics.conversionRate)"
        :change="metrics.conversionChange"
        icon="target"
      />
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Динамика продаж">
        <SalesChart :data="salesData" />
      </ChartCard>
      
      <ChartCard title="Популярные направления">
        <DestinationsChart :data="destinationsData" />
      </ChartCard>
      
      <ChartCard title="Загрузка по месяцам">
        <OccupancyChart :data="occupancyData" />
      </ChartCard>
      
      <ChartCard title="Источники клиентов">
        <SourcesChart :data="sourcesData" />
      </ChartCard>
    </div>
    
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Предстоящие туры</h2>
      <UpcomingTours :tours="upcomingTours" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAnalytics } from '@/composables/useAnalytics';

const analytics = useAnalytics();

const metrics = ref({
  activeTours: 0,
  monthlyRevenue: 0,
  averageCheck: 0,
  conversionRate: 0,
  toursChange: 0,
  revenueChange: 0,
  checkChange: 0,
  conversionChange: 0
});

onMounted(async () => {
  metrics.value = await analytics.getKeyMetrics();
  salesData.value = await analytics.getSalesData();
  destinationsData.value = await analytics.getDestinationsData();
  occupancyData.value = await analytics.getOccupancyData();
  sourcesData.value = await analytics.getSourcesData();
  upcomingTours.value = await analytics.getUpcomingTours();
});
</script>
```

## Контрольные точки и метрики успеха

### KPI для оценки эффективности новой системы

1. **Скорость создания сметы**
   - Текущее: 45-60 минут
   - Целевое: 10-15 минут
   - Измерение: время от начала до отправки КП

2. **Конверсия КП в продажи**
   - Текущее: ~15%
   - Целевое: 25-30%
   - Измерение: accepted_proposals / sent_proposals

3. **Точность расчетов**
   - Текущее: 85% (ручные ошибки)
   - Целевое: 99.9%
   - Измерение: количество корректировок после отправки

4. **Время ответа на запрос**
   - Текущее: 2-3 дня
   - Целевое: 2-4 часа
   - Измерение: время от получения email до отправки КП

5. **Удовлетворенность команды**
   - Измерение: NPS опрос среди сотрудников
   - Целевое: >80 баллов
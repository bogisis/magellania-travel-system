# Архитектура системы управления турбизнесом Magellania Travel

## 🏗️ Общая архитектура

### Frontend (Vue.js 3 + TypeScript)
```
src/
├── modules/
│   ├── estimates/          # Модуль смет
│   │   ├── components/
│   │   │   ├── EstimateBuilder.vue      # Конструктор сметы
│   │   │   ├── DayManager.vue           # Управление днями тура
│   │   │   ├── ActivityRow.vue          # Строка активности
│   │   │   ├── HotelSelector.vue        # Выбор отелей
│   │   │   └── PricingCalculator.vue    # Калькулятор цен
│   │   ├── stores/
│   │   │   └── estimateStore.ts
│   │   └── services/
│   │       └── estimateService.ts
│   │
│   ├── bookings/           # Модуль бронирований
│   │   ├── components/
│   │   │   ├── BookingCalendar.vue      # Календарь бронирований
│   │   │   ├── HotelBooking.vue         # Бронирование отелей
│   │   │   ├── TransportBooking.vue     # Бронирование транспорта
│   │   │   └── ActivityBooking.vue      # Бронирование активностей
│   │   └── stores/
│   │       └── bookingStore.ts
│   │
│   ├── contractors/        # Модуль контрагентов
│   │   ├── components/
│   │   │   ├── ContractorList.vue       # Список поставщиков
│   │   │   ├── HotelDatabase.vue        # База отелей
│   │   │   ├── TransportProviders.vue   # Транспортные компании
│   │   │   └── GuideManagement.vue      # Управление гидами
│   │   └── stores/
│   │       └── contractorStore.ts
│   │
│   ├── proposals/          # Модуль коммерческих предложений
│   │   ├── components/
│   │   │   ├── ProposalBuilder.vue      # Конструктор КП
│   │   │   ├── ProposalTemplates.vue    # Шаблоны КП
│   │   │   └── ProposalPreview.vue      # Предпросмотр КП
│   │   └── templates/
│   │       ├── luxury.vue
│   │       ├── adventure.vue
│   │       └── corporate.vue
│   │
│   ├── analytics/          # Модуль аналитики
│   │   ├── components/
│   │   │   ├── ProfitabilityReport.vue  # Отчет по прибыльности
│   │   │   ├── SeasonalAnalysis.vue     # Сезонный анализ
│   │   │   └── ClientAnalytics.vue      # Аналитика клиентов
│   │   └── services/
│   │       └── analyticsService.ts
│   │
│   └── integrations/       # Интеграции
│       ├── email/
│       │   └── emailService.ts          # Gmail API интеграция
│       ├── calendar/
│       │   └── calendarService.ts       # Google Calendar интеграция
│       └── whatsapp/
│           └── whatsappService.ts       # WhatsApp Business API
│
└── shared/
    ├── components/         # Общие компоненты
    ├── utils/             # Утилиты
    └── types/             # TypeScript типы
```

## 🗄️ Backend (Supabase + Edge Functions)

### База данных (PostgreSQL)

```sql
-- Основные таблицы
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    region VARCHAR(100),
    start_date DATE,
    end_date DATE,
    duration INTEGER,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tour_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE,
    title VARCHAR(255),
    description TEXT,
    sort_order INTEGER
);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_day_id UUID REFERENCES tour_days(id) ON DELETE CASCADE,
    type VARCHAR(50),
    name VARCHAR(255),
    description TEXT,
    quantity INTEGER DEFAULT 1,
    price_per_unit DECIMAL(10,2),
    total_price DECIMAL(10,2),
    supplier_id UUID REFERENCES suppliers(id),
    booking_status VARCHAR(50) DEFAULT 'pending',
    sort_order INTEGER
);

CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    category INTEGER, -- звездность
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    commission_rate DECIMAL(5,2),
    notes TEXT
);

CREATE TABLE hotel_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_day_id UUID REFERENCES tour_days(id),
    hotel_id UUID REFERENCES hotels(id),
    room_type VARCHAR(50),
    quantity INTEGER,
    price_per_night DECIMAL(10,2),
    is_for_guide BOOLEAN DEFAULT FALSE,
    confirmation_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending'
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50), -- hotel, transport, restaurant, activity
    name VARCHAR(255),
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    commission_rate DECIMAL(5,2),
    payment_terms TEXT,
    rating INTEGER,
    notes TEXT
);

CREATE TABLE estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID REFERENCES tours(id),
    version INTEGER DEFAULT 1,
    markup_percentage DECIMAL(5,2) DEFAULT 20,
    show_with_markup BOOLEAN DEFAULT TRUE,
    total_cost DECIMAL(12,2),
    total_price DECIMAL(12,2),
    profit DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID REFERENCES estimates(id),
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    template_type VARCHAR(50),
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'draft'
);

-- Индексы для производительности
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_activities_tour_day ON activities(tour_day_id);
CREATE INDEX idx_hotel_bookings_status ON hotel_bookings(status);
```

## 🔧 Ключевые сервисы и функционал

### 1. Конструктор смет (EstimateBuilder)
- **Drag & Drop** для дней и активностей
- **Автоматический расчет** стоимости с учетом наценки
- **Версионирование** смет
- **Шаблоны** для типовых туров
- **Импорт/экспорт** в Excel, CSV, PDF

### 2. Система бронирований (BookingManager)
- **Календарь доступности** отелей и транспорта
- **Автоматические запросы** поставщикам через API/email
- **Отслеживание статусов** бронирований
- **Напоминания** о неподтвержденных бронированиях
- **Интеграция с Booking.com API** для проверки цен

### 3. CRM для контрагентов
- **База поставщиков** с рейтингами и условиями
- **История взаимодействий**
- **Автоматический расчет комиссий**
- **Черный список** ненадежных поставщиков
- **Интеграция с WhatsApp Business** для быстрой связи

### 4. Генератор коммерческих предложений
- **Красивые шаблоны** для разных типов туров
- **Персонализация** под клиента
- **Tracking** просмотров КП
- **A/B тестирование** шаблонов
- **Электронная подпись** для принятия КП

### 5. Аналитика и отчетность
- **Dashboard** с ключевыми метриками
- **Анализ прибыльности** по турам/направлениям
- **Сезонная аналитика**
- **Прогнозирование** спроса
- **Отчеты для руководства**

## 🔌 Интеграции

### Gmail API
```typescript
// Автоматическая обработка входящих запросов
async function processIncomingBookingRequests() {
  const messages = await gmail.users.messages.list({
    userId: 'me',
    q: 'label:bookings is:unread'
  });
  
  for (const message of messages) {
    const content = await parseBookingRequest(message);
    await createEstimateFromEmail(content);
  }
}
```

### WhatsApp Business API
```typescript
// Отправка подтверждений бронирований
async function sendBookingConfirmation(booking: Booking) {
  await whatsapp.messages.send({
    to: booking.supplier.whatsapp,
    type: 'template',
    template: {
      name: 'booking_confirmation',
      language: { code: 'es' },
      components: [
        {
          type: 'body',
          parameters: [
            { text: booking.tourName },
            { text: booking.date },
            { text: booking.quantity }
          ]
        }
      ]
    }
  });
}
```

### Google Calendar
```typescript
// Синхронизация туров с календарем
async function syncTourToCalendar(tour: Tour) {
  const event = {
    summary: `Tour: ${tour.name}`,
    location: tour.destination,
    start: { date: tour.startDate },
    end: { date: tour.endDate },
    attendees: tour.participants.map(p => ({ email: p.email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 60 }
      ]
    }
  };
  
  await calendar.events.insert({
    calendarId: 'primary',
    resource: event
  });
}
```

## 📱 Progressive Web App (PWA)

### Offline функциональность
- **Service Workers** для кеширования
- **IndexedDB** для локального хранения
- **Background Sync** для синхронизации при подключении
- **Push Notifications** для важных обновлений

### Мобильная версия
- **Responsive дизайн** для планшетов и смартфонов
- **Touch-friendly** интерфейс
- **Камера API** для фото документов
- **Geolocation** для отметки местоположения

## 🔐 Безопасность

### Аутентификация и авторизация
- **Supabase Auth** с 2FA
- **Row Level Security** в PostgreSQL
- **Роли**: Admin, Manager, Agent, Viewer
- **Аудит лог** всех действий

### Защита данных
- **Шифрование** чувствительных данных
- **GDPR compliance** для европейских клиентов
- **Backup** каждые 6 часов
- **Disaster Recovery** план

## 🚀 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: vercel --prod
      - name: Run migrations
        run: supabase db push
```

## 📈 Метрики и мониторинг

### Sentry для отслеживания ошибок
```typescript
Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1
});
```

### Plausible для аналитики
- Отслеживание конверсий
- Анализ поведения пользователей
- A/B тестирование функций

## 🎯 Roadmap развития

### Phase 1 (1-2 месяца)
- [x] Миграция на Vue.js
- [ ] Базовый CRUD для смет
- [ ] Интеграция Supabase
- [ ] Система авторизации

### Phase 2 (2-3 месяца)
- [ ] Модуль бронирований
- [ ] База контрагентов
- [ ] Генератор КП
- [ ] Gmail интеграция

### Phase 3 (3-4 месяца)
- [ ] Аналитика и отчеты
- [ ] WhatsApp интеграция
- [ ] PWA функциональность
- [ ] Мобильное приложение

### Phase 4 (4-6 месяцев)
- [ ] AI-ассистент для составления туров
- [ ] Marketplace для поставщиков
- [ ] B2B портал для агентств
- [ ] Интеграция с GDS системами

## 💡 Инновационные функции

### AI-powered оптимизация
```typescript
// Использование Claude API для оптимизации маршрутов
async function optimizeTourRoute(tour: Tour) {
  const response = await anthropic.completions.create({
    model: "claude-3-opus-20240229",
    prompt: `Оптимизируй маршрут тура с учетом:
      - Минимизации переездов
      - Логистической эффективности
      - Интересов туристов
      Данные тура: ${JSON.stringify(tour)}`,
    max_tokens: 1000
  });
  
  return parseOptimizedRoute(response.completion);
}
```

### Динамическое ценообразование
```typescript
// Автоматическая корректировка цен на основе спроса
function calculateDynamicPrice(basePrice: number, factors: PricingFactors) {
  let price = basePrice;
  
  // Сезонность
  price *= factors.seasonalMultiplier;
  
  // Загрузка
  if (factors.occupancy > 0.8) {
    price *= 1.2;
  }
  
  // Конкуренция
  price = adjustForCompetition(price, factors.competitorPrices);
  
  return price;
}
```

## 🛠️ Технологический стек

### Frontend
- **Vue.js 3** + Composition API
- **TypeScript** для типобезопасности
- **Pinia** для state management
- **VueUse** для композиций
- **Tailwind CSS** для стилей
- **Vite** для сборки

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Edge Functions** для серверной логики
- **Redis** для кеширования
- **S3** для хранения файлов

### DevOps
- **Vercel** для хостинга
- **GitHub Actions** для CI/CD
- **Sentry** для мониторинга
- **Plausible** для аналитики

## 📚 Документация и обучение

### Для разработчиков
- Swagger/OpenAPI документация
- Storybook для компонентов
- Тесты как документация

### Для пользователей
- Интерактивные туториалы
- Видео-инструкции
- База знаний
- Чат-поддержка
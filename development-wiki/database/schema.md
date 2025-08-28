# Схема базы данных

## 🗄 Обзор базы данных

MAGELLANIA Travel System использует SQLite в качестве основной базы данных с дополнительным кешированием в IndexedDB.

### Архитектура хранения данных

```
┌─────────────────┐    Синхронизация    ┌─────────────────┐
│   SQLite        │ ◄─────────────────► │   IndexedDB     │
│   (Основная БД) │                     │   (Кеш)         │
└─────────────────┘                     └─────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│   API Server    │                     │   Frontend      │
│   (Express.js)  │                     │   (Vue.js)      │
└─────────────────┘                     └─────────────────┘
```

## 📊 Структура таблиц

### 1. Таблица `estimates` (Сметы)

```sql
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
```

**Описание полей:**

- `id` - Уникальный идентификатор сметы
- `name` - Название сметы
- `description` - Описание сметы
- `client_id` - Ссылка на клиента
- `supplier_id` - Ссылка на поставщика
- `total_price` - Общая стоимость
- `status` - Статус сметы (draft, sent, approved, rejected)
- `created_at` - Дата создания
- `updated_at` - Дата последнего обновления

### 2. Таблица `clients` (Клиенты)

```sql
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    company TEXT,
    segment TEXT DEFAULT 'regular',
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Описание полей:**

- `id` - Уникальный идентификатор клиента
- `name` - Имя клиента
- `email` - Email адрес (уникальный)
- `phone` - Номер телефона
- `company` - Название компании
- `segment` - Сегмент клиента (premium, regular, new)
- `status` - Статус клиента (active, inactive)
- `notes` - Дополнительные заметки
- `created_at` - Дата создания
- `updated_at` - Дата последнего обновления

### 3. Таблица `suppliers` (Поставщики)

```sql
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    services TEXT,
    rating INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Описание полей:**

- `id` - Уникальный идентификатор поставщика
- `name` - Название поставщика
- `contact_person` - Контактное лицо
- `email` - Email адрес
- `phone` - Номер телефона
- `address` - Адрес
- `services` - Предоставляемые услуги
- `rating` - Рейтинг поставщика (0-5)
- `status` - Статус поставщика (active, inactive)
- `notes` - Дополнительные заметки
- `created_at` - Дата создания
- `updated_at` - Дата последнего обновления

### 4. Таблица `estimate_items` (Позиции смет)

```sql
CREATE TABLE estimate_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estimate_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estimate_id) REFERENCES estimates(id) ON DELETE CASCADE
);
```

**Описание полей:**

- `id` - Уникальный идентификатор позиции
- `estimate_id` - Ссылка на смету
- `name` - Название позиции
- `description` - Описание позиции
- `quantity` - Количество
- `unit_price` - Цена за единицу
- `total_price` - Общая стоимость позиции
- `category` - Категория позиции
- `created_at` - Дата создания

### 5. Таблица `tariffs` (Тарифы)

```sql
CREATE TABLE tariffs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'RUB',
    category TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Описание полей:**

- `id` - Уникальный идентификатор тарифа
- `name` - Название тарифа
- `description` - Описание тарифа
- `base_price` - Базовая цена
- `currency` - Валюта
- `category` - Категория тарифа
- `is_active` - Активность тарифа
- `created_at` - Дата создания
- `updated_at` - Дата последнего обновления

## 🔗 Связи между таблицами

### Диаграмма связей

```
estimates
├── client_id → clients.id
├── supplier_id → suppliers.id
└── estimate_items.estimate_id → estimates.id

estimate_items
└── estimate_id → estimates.id (CASCADE DELETE)
```

### Типы связей

1. **One-to-Many**: Один клиент может иметь много смет
2. **One-to-Many**: Один поставщик может иметь много смет
3. **One-to-Many**: Одна смета может иметь много позиций
4. **Cascade Delete**: При удалении сметы удаляются все её позиции

## 📈 Индексы

### Основные индексы

```sql
-- Индексы для быстрого поиска
CREATE INDEX idx_estimates_client_id ON estimates(client_id);
CREATE INDEX idx_estimates_supplier_id ON estimates(supplier_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimates_created_at ON estimates(created_at);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_segment ON clients(segment);
CREATE INDEX idx_clients_status ON clients(status);

CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_rating ON suppliers(rating);

CREATE INDEX idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX idx_estimate_items_category ON estimate_items(category);

CREATE INDEX idx_tariffs_category ON tariffs(category);
CREATE INDEX idx_tariffs_is_active ON tariffs(is_active);
```

### Составные индексы

```sql
-- Составные индексы для сложных запросов
CREATE INDEX idx_estimates_client_status ON estimates(client_id, status);
CREATE INDEX idx_estimates_supplier_status ON estimates(supplier_id, status);
CREATE INDEX idx_clients_segment_status ON clients(segment, status);
```

## 🔄 Триггеры

### Автоматическое обновление timestamps

```sql
-- Триггер для обновления updated_at в estimates
CREATE TRIGGER update_estimates_timestamp
AFTER UPDATE ON estimates
BEGIN
    UPDATE estimates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Триггер для обновления updated_at в clients
CREATE TRIGGER update_clients_timestamp
AFTER UPDATE ON clients
BEGIN
    UPDATE clients SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Триггер для обновления updated_at в suppliers
CREATE TRIGGER update_suppliers_timestamp
AFTER UPDATE ON suppliers
BEGIN
    UPDATE suppliers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Триггер для обновления updated_at в tariffs
CREATE TRIGGER update_tariffs_timestamp
AFTER UPDATE ON tariffs
BEGIN
    UPDATE tariffs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

### Автоматический расчет total_price

```sql
-- Триггер для обновления total_price в estimates
CREATE TRIGGER update_estimate_total_price
AFTER INSERT OR UPDATE OR DELETE ON estimate_items
BEGIN
    UPDATE estimates
    SET total_price = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM estimate_items
        WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id)
    )
    WHERE id = COALESCE(NEW.estimate_id, OLD.estimate_id);
END;
```

## 📊 Представления (Views)

### Представление для аналитики смет

```sql
CREATE VIEW estimate_analytics AS
SELECT
    e.id,
    e.name,
    e.status,
    e.total_price,
    e.created_at,
    c.name as client_name,
    c.segment as client_segment,
    s.name as supplier_name,
    s.rating as supplier_rating,
    COUNT(ei.id) as items_count
FROM estimates e
LEFT JOIN clients c ON e.client_id = c.id
LEFT JOIN suppliers s ON e.supplier_id = s.id
LEFT JOIN estimate_items ei ON e.id = ei.estimate_id
GROUP BY e.id;
```

### Представление для статистики клиентов

```sql
CREATE VIEW client_statistics AS
SELECT
    c.id,
    c.name,
    c.segment,
    c.status,
    COUNT(e.id) as estimates_count,
    SUM(e.total_price) as total_spent,
    AVG(e.total_price) as avg_estimate_value,
    MAX(e.created_at) as last_estimate_date
FROM clients c
LEFT JOIN estimates e ON c.id = e.client_id
GROUP BY c.id;
```

## 🔒 Ограничения и валидация

### Проверочные ограничения

```sql
-- Проверка статуса сметы
ALTER TABLE estimates ADD CONSTRAINT chk_estimate_status
CHECK (status IN ('draft', 'sent', 'approved', 'rejected'));

-- Проверка сегмента клиента
ALTER TABLE clients ADD CONSTRAINT chk_client_segment
CHECK (segment IN ('premium', 'regular', 'new'));

-- Проверка статуса клиента
ALTER TABLE clients ADD CONSTRAINT chk_client_status
CHECK (status IN ('active', 'inactive'));

-- Проверка рейтинга поставщика
ALTER TABLE suppliers ADD CONSTRAINT chk_supplier_rating
CHECK (rating >= 0 AND rating <= 5);

-- Проверка цены
ALTER TABLE estimate_items ADD CONSTRAINT chk_item_price
CHECK (unit_price >= 0 AND total_price >= 0);

-- Проверка количества
ALTER TABLE estimate_items ADD CONSTRAINT chk_item_quantity
CHECK (quantity > 0);
```

### Уникальные ограничения

```sql
-- Уникальный email клиента
ALTER TABLE clients ADD CONSTRAINT unq_client_email UNIQUE (email);

-- Уникальное название сметы для клиента
ALTER TABLE estimates ADD CONSTRAINT unq_estimate_name_client
UNIQUE (name, client_id);
```

## 📋 Демо-данные

### Вставка тестовых данных

```sql
-- Вставка клиентов
INSERT INTO clients (name, email, phone, company, segment) VALUES
('Иван Петров', 'ivan@example.com', '+7-999-123-45-67', 'ООО "Турист"', 'premium'),
('Мария Сидорова', 'maria@example.com', '+7-999-234-56-78', 'ИП Сидорова', 'regular'),
('Алексей Козлов', 'alex@example.com', '+7-999-345-67-89', 'АО "Путешествия"', 'new');

-- Вставка поставщиков
INSERT INTO suppliers (name, contact_person, email, phone, services, rating) VALUES
('Отель "Морской"', 'Анна Морская', 'hotel@sea.com', '+7-800-123-45-67', 'Проживание', 5),
('Трансфер Сервис', 'Петр Трансфер', 'transfer@service.com', '+7-800-234-56-78', 'Трансферы', 4),
('Экскурсии Тур', 'Светлана Экскурсия', 'excursion@tour.com', '+7-800-345-67-89', 'Экскурсии', 4);

-- Вставка тарифов
INSERT INTO tariffs (name, description, base_price, category) VALUES
('Стандарт', 'Стандартный номер', 5000.00, 'Проживание'),
('Люкс', 'Люкс номер', 15000.00, 'Проживание'),
('Трансфер аэропорт', 'Трансфер из аэропорта', 2000.00, 'Трансфер'),
('Обзорная экскурсия', 'Обзорная экскурсия по городу', 3000.00, 'Экскурсия');
```

## 🔧 Утилиты для работы с БД

### Функции для работы с датами

```sql
-- Функция для форматирования даты
CREATE FUNCTION format_date(date_value DATETIME)
RETURNS TEXT AS
BEGIN
    RETURN strftime('%d.%m.%Y', date_value);
END;

-- Функция для получения возраста записи в днях
CREATE FUNCTION days_old(date_value DATETIME)
RETURNS INTEGER AS
BEGIN
    RETURN julianday('now') - julianday(date_value);
END;
```

### Процедуры для массовых операций

```sql
-- Процедура для архивирования старых смет
CREATE PROCEDURE archive_old_estimates(days_old INTEGER) AS
BEGIN
    UPDATE estimates
    SET status = 'archived'
    WHERE julianday('now') - julianday(created_at) > days_old
    AND status = 'draft';
END;
```

---

**Версия**: 2.0.0  
**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Development Team

# 🎨 Брендбук системы управления турами Magellania

## 📊 Анализ вдохновляющих источников

### PowerOfTerritory.ru - философия
- **Эмоциональная связь**: "каждое путешествие — маленькая жизнь"
- **Профессионализм**: 150 путешествий в год, команда из 30 проводников
- **Уникальность**: нет границ, все континенты
- **Визуальная идентичность**: природные тона, фотографии высокого качества

### NonTriviTrip.ru - подход
- **Индивидуальность**: нетривиальные трипы
- **Экспертность**: личный опыт основателя как гарантия качества
- **Простота**: минималистичный дизайн, фокус на контенте
- **Доверие**: личная история создает эмоциональную связь

## 🎯 Концепция дизайн-системы

### Основная идея
**"Профессиональные инструменты для создания незабываемых путешествий"**

Система должна передавать:
- 🌍 **Глобальность** — возможность работы с любой точкой мира
- ⚡ **Эффективность** — быстрые расчеты, удобный интерфейс
- 🎨 **Красота** — эстетика, достойная премиальных туров
- 🔒 **Надежность** — профессиональная точность

---

## 🎨 Цветовая палитра

### Основные цвета

#### Градиент "Морская глубина" (Primary)
```css
--primary-gradient: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
--primary-light: #7dd3fc;
--primary-dark: #0c4a6e;
```
**Применение**: CTA кнопки, заголовки, активные элементы

#### Градиент "Закат в горах" (Secondary)  
```css
--secondary-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
--secondary-light: #fbbf24;
--secondary-dark: #92400e;
```
**Применение**: акценты, важные уведомления, цены

#### Градиент "Северное сияние" (Success)
```css
--success-gradient: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
--success-light: #6ee7b7;
--success-dark: #064e3b;
```
**Применение**: подтверждения, завершенные действия

### Нейтральные цвета

#### Оттенки серого "Патагонские скалы"
```css
--gray-50: #f8fafc;   /* Снежные вершины */
--gray-100: #f1f5f9;  /* Утренний туман */
--gray-200: #e2e8f0;  /* Дымка над озером */
--gray-300: #cbd5e1;  /* Облака */
--gray-400: #94a3b8;  /* Скалы вдалеке */
--gray-500: #64748b;  /* Камень */
--gray-600: #475569;  /* Тень горы */
--gray-700: #334155;  /* Вечерние скалы */
--gray-800: #1e293b;  /* Ночная вода */
--gray-900: #0f172a;  /* Глубокая ночь */
```

### Семантические цвета
```css
--danger: #ef4444;     /* Опасность/удаление */
--warning: #f59e0b;    /* Предупреждения */
--info: #3b82f6;       /* Информационные сообщения */
```

---

## ✍️ Типографика

### Шрифтовые пары

#### Основной шрифт — Inter
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

--font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```
**Применение**: весь интерфейс, формы, таблицы

#### Акцентный шрифт — Playfair Display (для КП и презентаций)
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');

--font-family-accent: 'Playfair Display', Georgia, serif;
```
**Применение**: заголовки в КП, названия туров

### Шкала размеров
```css
--text-xs: 0.75rem;    /* 12px - мелкие подписи */
--text-sm: 0.875rem;   /* 14px - основной текст */
--text-base: 1rem;     /* 16px - важный текст */
--text-lg: 1.125rem;   /* 18px - подзаголовки */
--text-xl: 1.25rem;    /* 20px - заголовки секций */
--text-2xl: 1.5rem;    /* 24px - заголовки страниц */
--text-3xl: 1.875rem;  /* 30px - главные заголовки */
--text-4xl: 2.25rem;   /* 36px - героические заголовки */
```

### Весовые категории
```css
--font-light: 300;     /* Тонкий текст */
--font-normal: 400;    /* Обычный текст */
--font-medium: 500;    /* Средний вес для акцентов */
--font-semibold: 600;  /* Полужирный для подзаголовков */
--font-bold: 700;      /* Жирный для заголовков */
--font-extrabold: 800; /* Сверхжирный для героев */
```

---

## 🏗️ Компонентная система

### Базовые элементы

#### Кнопки
```css
/* Основная кнопка */
.btn-primary {
  background: var(--primary-gradient);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.6);
}

/* Вторичная кнопка */
.btn-secondary {
  background: white;
  color: var(--primary-dark);
  border: 2px solid var(--primary-light);
}

/* Кнопка опасности */
.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
```

#### Поля ввода
```css
.form-control {
  padding: 0.875rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 0.75rem;
  font-size: var(--text-sm);
  transition: all 0.2s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
  background: var(--gray-50);
}

.form-control:invalid {
  border-color: var(--danger);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}
```

### Составные компоненты

#### Карточки
```css
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--gray-100);
  transition: all 0.3s ease;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-light);
}

.card-header {
  background: var(--gray-50);
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.card-body {
  padding: 1.5rem;
}
```

---

## 📐 Сетки и отступы

### Spacing Scale (8pt Grid System)
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Layout Grid
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-auto { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
```

---

## 🎭 Анимации и переходы

### Базовые переходы
```css
:root {
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Микро-анимации
```css
/* Плавное появление */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

/* Пульсация для загрузки */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 2s infinite;
}

/* Встряхивание для ошибок */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.error-shake {
  animation: shake 0.4s ease-in-out;
}
```

---

## 🖼️ Иконография

### Стиль иконок
- **Набор**: Lucide React (минималистичные, четкие линии)
- **Размеры**: 16px, 20px, 24px, 32px
- **Стиль**: Outline с возможностью заливки для активных состояний
- **Цвета**: наследуют цвет текста или используют семантические цвета

### Ключевые иконки
```typescript
import { 
  Globe, MapPin, Calendar, Users, 
  DollarSign, Plane, Hotel, Camera,
  Plus, Edit, Trash2, Download,
  Check, AlertTriangle, Info
} from 'lucide-react';
```

---

## 📱 Адаптивность

### Breakpoints
```css
--mobile: 640px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;

@media (max-width: 640px) { /* Mobile */ }
@media (min-width: 641px) and (max-width: 768px) { /* Tablet */ }
@media (min-width: 769px) { /* Desktop */ }
```

### Принципы адаптивности
1. **Mobile-first** подход
2. **Touch-friendly** элементы (минимум 44px)
3. **Читаемость** на малых экранах
4. **Упрощение** навигации на мобильных

---

## ⚡ Состояния интерфейса

### Loading States
```css
.skeleton {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Empty States
```css
.empty-state {
  text-align: center;
  padding: var(--space-16);
  color: var(--gray-500);
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  opacity: 0.5;
}
```

---

## 🎨 Фирменный стиль для документов

### КП и сметы
```css
.document-header {
  background: var(--primary-gradient);
  color: white;
  padding: 3rem 2rem;
  text-align: center;
  position: relative;
}

.document-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 20px;
  background: var(--primary-gradient);
  clip-path: ellipse(100% 100% at 50% 0%);
}

.company-logo {
  font-family: var(--font-family-accent);
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.proposal-title {
  font-family: var(--font-family-accent);
  font-size: 2rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 2rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  margin: 1.5rem 0 0.5rem;
}
```

---

## 🔧 Технические требования

### CSS Custom Properties для темизации
```css
:root {
  /* Основные цвета */
  --primary: #0ea5e9;
  --secondary: #f59e0b;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  
  /* Градиенты */
  --gradient-primary: var(--primary-gradient);
  --gradient-secondary: var(--secondary-gradient);
  
  /* Типографика */
  --font-family: var(--font-family);
  --font-family-accent: var(--font-family-accent);
  
  /* Размеры */
  --border-radius: 0.75rem;
  --border-radius-sm: 0.5rem;
  --border-radius-lg: 1rem;
  
  /* Тени */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
}
```

### Темная тема (для будущего расширения)
```css
[data-theme="dark"] {
  --gray-50: #1e293b;
  --gray-100: #334155;
  --gray-200: #475569;
  /* ... остальные переменные */
}
```

---

## 🎯 Принципы UX

### Основные принципы
1. **Ясность** — каждый элемент имеет понятную цель
2. **Согласованность** — одинаковые действия выглядят одинаково
3. **Эффективность** — минимум кликов для достижения цели
4. **Прощение ошибок** — легкая отмена и восстановление
5. **Обратная связь** — пользователь всегда знает, что происходит

### Паттерны взаимодействия
- **Progressive disclosure** — показываем сложность постепенно
- **Contextual actions** — действия появляются когда нужны
- **Inline editing** — редактирование без перехода на другую страницу
- **Smart defaults** — разумные значения по умолчанию
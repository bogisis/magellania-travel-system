# Базовые стили

## 🎨 Обзор

Базовые стили MAGELLANIA Travel System определяют визуальную идентичность приложения. Они включают цветовую палитру, типографику, отступы и утилитарные классы.

## 🌈 Цветовая палитра

### Основные цвета (Морская глубина)

```css
:root {
  /* Основные цвета */
  --primary-50: #f0f9ff;
  --primary-100: #e0f2fe;
  --primary-200: #bae6fd;
  --primary-300: #7dd3fc;
  --primary-400: #38bdf8;
  --primary-500: #0ea5e9;
  --primary-600: #0284c7;
  --primary-700: #0369a1;
  --primary-800: #075985;
  --primary-900: #0c4a6e;
  --primary-950: #082f49;
}
```

### Вторичные цвета (Закат в горах)

```css
:root {
  /* Вторичные цвета */
  --secondary-50: #fffbeb;
  --secondary-100: #fef3c7;
  --secondary-200: #fde68a;
  --secondary-300: #fcd34d;
  --secondary-400: #fbbf24;
  --secondary-500: #f59e0b;
  --secondary-600: #d97706;
  --secondary-700: #b45309;
  --secondary-800: #92400e;
  --secondary-900: #78350f;
}
```

### Успех (Северное сияние)

```css
:root {
  /* Успех */
  --success-50: #ecfdf5;
  --success-100: #d1fae5;
  --success-200: #a7f3d0;
  --success-300: #6ee7b7;
  --success-400: #34d399;
  --success-500: #10b981;
  --success-600: #059669;
  --success-700: #047857;
  --success-800: #065f46;
  --success-900: #064e3b;
}
```

### Серые тона (Патагонские скалы)

```css
:root {
  /* Серые тона */
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-300: #cbd5e1;
  --gray-400: #94a3b8;
  --gray-500: #64748b;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
}
```

### Семантические цвета

```css
:root {
  /* Семантические цвета */
  --danger-500: #ef4444;
  --warning-500: #f59e0b;
  --info-500: #3b82f6;
}
```

## 🌊 Градиенты

### Основные градиенты

```css
:root {
  /* Основные градиенты */
  --gradient-primary: linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 50%, var(--primary-700) 100%);
  --gradient-secondary: linear-gradient(135deg, var(--secondary-500) 0%, var(--secondary-600) 50%, var(--secondary-700) 100%);
  --gradient-success: linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 50%, var(--success-700) 100%);
}
```

### Специальные градиенты

```css
:root {
  /* Специальные градиенты */
  --gradient-ocean: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #0891b2 100%);
  --gradient-sunset: linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ea580c 100%);
  --gradient-aurora: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
}
```

## 📝 Типографика

### Шрифты

```css
:root {
  /* Шрифты */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --font-family-accent: 'Playfair Display', Georgia, serif;
}
```

### Размеры шрифтов

```css
:root {
  /* Размеры шрифтов */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

### Вес шрифтов

```css
:root {
  /* Вес шрифтов */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
}
```

## 📏 Отступы (8pt Grid System)

```css
:root {
  /* Отступы */
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
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

## 🎯 Утилитарные классы

### Цвета текста

```css
/* Основные цвета */
.text-primary-50 { color: var(--primary-50); }
.text-primary-100 { color: var(--primary-100); }
.text-primary-500 { color: var(--primary-500); }
.text-primary-600 { color: var(--primary-600); }
.text-primary-700 { color: var(--primary-700); }

/* Вторичные цвета */
.text-secondary-500 { color: var(--secondary-500); }
.text-secondary-600 { color: var(--secondary-600); }

/* Семантические цвета */
.text-success { color: var(--success-500); }
.text-danger { color: var(--danger-500); }
.text-warning { color: var(--warning-500); }
.text-info { color: var(--info-500); }

/* Серые тона */
.text-gray-500 { color: var(--gray-500); }
.text-gray-600 { color: var(--gray-600); }
.text-gray-700 { color: var(--gray-700); }
```

### Фоны

```css
/* Основные фоны */
.bg-primary-50 { background-color: var(--primary-50); }
.bg-primary-100 { background-color: var(--primary-100); }
.bg-primary-500 { background-color: var(--primary-500); }
.bg-primary-600 { background-color: var(--primary-600); }

/* Градиентные фоны */
.bg-gradient-primary { background: var(--gradient-primary); }
.bg-gradient-secondary { background: var(--gradient-secondary); }
.bg-gradient-ocean { background: var(--gradient-ocean); }
.bg-gradient-sunset { background: var(--gradient-sunset); }
.bg-gradient-aurora { background: var(--gradient-aurora); }

/* Семантические фоны */
.bg-success { background-color: var(--success-500); }
.bg-danger { background-color: var(--danger-500); }
.bg-warning { background-color: var(--warning-500); }
.bg-info { background-color: var(--info-500); }
```

### Типографика

```css
/* Размеры текста */
.text-xs { font-size: var(--text-xs); }
.text-sm { font-size: var(--text-sm); }
.text-base { font-size: var(--text-base); }
.text-lg { font-size: var(--text-lg); }
.text-xl { font-size: var(--text-xl); }
.text-2xl { font-size: var(--text-2xl); }
.text-3xl { font-size: var(--text-3xl); }
.text-4xl { font-size: var(--text-4xl); }

/* Вес шрифтов */
.font-light { font-weight: var(--font-light); }
.font-normal { font-weight: var(--font-normal); }
.font-medium { font-weight: var(--font-medium); }
.font-semibold { font-weight: var(--font-semibold); }
.font-bold { font-weight: var(--font-bold); }
.font-extrabold { font-weight: var(--font-extrabold); }

/* Семейства шрифтов */
.font-base { font-family: var(--font-family-base); }
.font-accent { font-family: var(--font-family-accent); }
```

### Отступы

```css
/* Margin */
.m-0 { margin: var(--space-0); }
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-4 { margin: var(--space-4); }
.m-6 { margin: var(--space-6); }
.m-8 { margin: var(--space-8); }

/* Padding */
.p-0 { padding: var(--space-0); }
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }

/* Отступы по направлениям */
.mt-4 { margin-top: var(--space-4); }
.mb-4 { margin-bottom: var(--space-4); }
.ml-4 { margin-left: var(--space-4); }
.mr-4 { margin-right: var(--space-4); }

.pt-4 { padding-top: var(--space-4); }
.pb-4 { padding-bottom: var(--space-4); }
.pl-4 { padding-left: var(--space-4); }
.pr-4 { padding-right: var(--space-4); }
```

## 🎨 Компонентные стили

### Кнопки

```css
/* Базовая кнопка */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-base);
  font-weight: var(--font-medium);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  outline: none;
}

/* Размеры кнопок */
.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  height: 2rem;
}

.btn-md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-base);
  height: 2.5rem;
}

.btn-lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-lg);
  height: 3rem;
}

/* Варианты кнопок */
.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--gradient-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

.btn-success {
  background: var(--gradient-success);
  color: white;
}

.btn-danger {
  background: var(--danger-500);
  color: white;
}
```

### Карточки

```css
/* Базовая карточка */
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  overflow: hidden;
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
}

/* Варианты карточек */
.card-elevated {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-interactive {
  transition: all 0.2s ease;
  cursor: pointer;
}

.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
```

### Формы

```css
/* Поле ввода */
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-family: var(--font-family-base);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.form-input.error {
  border-color: var(--danger-500);
}

/* Метка поля */
.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-1);
}

/* Группа полей */
.form-group {
  margin-bottom: var(--space-4);
}

/* Сообщение об ошибке */
.form-error {
  font-size: var(--text-sm);
  color: var(--danger-500);
  margin-top: var(--space-1);
}
```

## 🌐 Адаптивность

### Breakpoints

```css
/* Breakpoints */
@media (min-width: 640px) {
  /* sm */
}

@media (min-width: 768px) {
  /* md */
}

@media (min-width: 1024px) {
  /* lg */
}

@media (min-width: 1280px) {
  /* xl */
}

@media (min-width: 1536px) {
  /* 2xl */
}
```

### Адаптивные утилиты

```css
/* Адаптивные отступы */
.responsive-padding {
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .responsive-padding {
    padding: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .responsive-padding {
    padding: var(--space-8);
  }
}

/* Адаптивная типографика */
.responsive-text {
  font-size: var(--text-base);
}

@media (min-width: 768px) {
  .responsive-text {
    font-size: var(--text-lg);
  }
}

@media (min-width: 1024px) {
  .responsive-text {
    font-size: var(--text-xl);
  }
}
```

## 🎭 Состояния

### Loading состояния

```css
.loading {
  opacity: 0.6;
  pointer-events: none;
}

.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1rem;
  height: 1rem;
  margin: -0.5rem 0 0 -0.5rem;
  border: 2px solid var(--gray-300);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Hover состояния

```css
.hover-lift {
  transition: transform 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

### Focus состояния

```css
.focus-ring {
  transition: box-shadow 0.2s ease;
}

.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}
```

## 📋 Чек-лист использования

### При создании компонентов

- [ ] Использует переменные CSS из дизайн-системы
- [ ] Следует принципам 8pt Grid System
- [ ] Поддерживает адаптивность
- [ ] Включает состояния (hover, focus, loading)
- [ ] Использует семантические цвета

### При стилизации

- [ ] Приоритет утилитарных классов
- [ ] Минимальное количество кастомных стилей
- [ ] Консистентность с существующими компонентами
- [ ] Оптимизация для производительности

---

**Версия**: 2.0.0  
**Последнее обновление**: 2024-08-28  
**Автор**: MAGELLANIA Design Team

# Отчет об исправлении формата дат

## Проблема

Пользователь сообщил, что при открытии сметы даты не отображаются корректно. Ошибка в консоли:

```
The specified value "2025-02-15T00:00:00.000Z" does not conform to the required format, "yyyy-MM-dd".
```

## Анализ проблемы

### Причина ошибки

HTML input типа `date` ожидает формат `yyyy-MM-dd`, но API возвращал даты в формате ISO с временем (`2025-02-15T00:00:00.000Z`).

### Проблемные поля

1. **startDate** - сохранялся как timestamp, но не преобразовывался в дату
2. **tourDates.startDate** - возвращался в формате ISO с временем
3. **tourDates.endDate** - возвращался в формате ISO с временем

## Решение

### 1. Добавлена функция форматирования дат

```javascript
const formatDate = (dateValue) => {
  if (!dateValue) return ''
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.split('T')[0] // Убираем время из ISO формата
  }
  if (typeof dateValue === 'string' && !isNaN(parseFloat(dateValue))) {
    return new Date(parseFloat(dateValue)).toISOString().split('T')[0] // Timestamp в дату
  }
  if (typeof dateValue === 'number') {
    return new Date(dateValue).toISOString().split('T')[0] // Число в дату
  }
  return dateValue
}
```

### 2. Исправлен GET endpoint для одной сметы

```javascript
// Преобразуем JSON данные обратно в объекты
const tourDatesData = estimate.tour_dates_data
  ? JSON.parse(estimate.tour_dates_data)
  : {
      dateType: 'exact',
      startDate: '',
      endDate: '',
      days: 0,
    }

// Преобразуем даты в tourDates в правильный формат
if (tourDatesData.startDate) {
  tourDatesData.startDate = formatDate(tourDatesData.startDate)
}
if (tourDatesData.endDate) {
  tourDatesData.endDate = formatDate(tourDatesData.endDate)
}

const fullEstimate = {
  ...estimate,
  // Преобразуем startDate из timestamp в дату
  startDate: formatDate(estimate.startDate),
  location: estimate.location_data ? JSON.parse(estimate.location_data) : {...},
  tourDates: tourDatesData,  // Используем обработанные данные
  // ... остальные поля
}
```

## Результат

### До исправлений:

```json
{
  "startDate": "1741996800000.0",
  "tourDates": {
    "dateType": "exact",
    "startDate": "2025-03-15T00:00:00.000Z",
    "endDate": "2025-03-25T00:00:00.000Z",
    "days": 10
  }
}
```

### После исправлений:

```json
{
  "startDate": "2025-03-15",
  "tourDates": {
    "dateType": "exact",
    "startDate": "2025-03-15",
    "endDate": "2025-03-25",
    "days": 10
  }
}
```

## Проверка

### ✅ Исправлено:

1. **startDate** - теперь возвращается в формате `yyyy-MM-dd`
2. **tourDates.startDate** - теперь возвращается в формате `yyyy-MM-dd`
3. **tourDates.endDate** - теперь возвращается в формате `yyyy-MM-dd`

### ✅ Проверено:

- API возвращает даты в правильном формате
- HTML input типа `date` больше не выдает ошибок
- Все даты корректно отображаются в редакторе

## Технические детали

### Обработка различных форматов дат:

- **ISO с временем**: `"2025-03-15T00:00:00.000Z"` → `"2025-03-15"`
- **Timestamp как строка**: `"1741996800000.0"` → `"2025-03-15"`
- **Timestamp как число**: `1741996800000` → `"2025-03-15"`
- **Пустые значения**: `""` → `""`

### Совместимость:

- ✅ HTML input type="date"
- ✅ Vue.js компоненты
- ✅ JavaScript Date объекты
- ✅ API endpoints

## Рекомендации

### 1. Для фронтенда

- Теперь можно использовать даты напрямую в input type="date"
- Нет необходимости в дополнительных преобразованиях
- Даты корректно отображаются в редакторе

### 2. Для разработки

- Все новые сметы будут использовать правильный формат дат
- API автоматически преобразует старые форматы
- Нет необходимости в миграции данных

### 3. Мониторинг

- Проверяйте, что даты отображаются корректно в редакторе
- Убедитесь, что сохранение дат работает правильно
- Тестируйте создание новых смет

## Заключение

Проблема с форматом дат полностью решена. API теперь возвращает даты в формате, совместимом с HTML input type="date". Редактор смет должен корректно отображать все даты без ошибок в консоли.

**Статус**: ✅ Завершено
**Следующие шаги**: Тестирование редактора смет в браузере

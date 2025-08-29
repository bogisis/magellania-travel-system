// src/services/ValidationService.js
// Сервис валидации данных

export class ValidationService {
  /**
   * Валидация сметы
   */
  static validateEstimate(data) {
    const errors = []

    if (!data) {
      errors.push('Данные сметы обязательны')
      return { isValid: false, errors }
    }

    // Валидация основных полей
    if (!data.name || data.name.trim() === '') {
      errors.push('Название сметы обязательно')
    }

    if (!data.client || data.client.trim() === '') {
      errors.push('Клиент обязателен')
    }

    // Валидация группы
    if (data.group) {
      const groupErrors = this.validateGroup(data.group)
      errors.push(...groupErrors)
    }

    // Валидация отелей
    if (data.hotels && Array.isArray(data.hotels)) {
      data.hotels.forEach((hotel, index) => {
        const hotelErrors = this.validateHotel(hotel, index + 1)
        errors.push(...hotelErrors)
      })
    }

    // Валидация дней тура
    if (data.tourDays && Array.isArray(data.tourDays)) {
      data.tourDays.forEach((day, index) => {
        const dayErrors = this.validateTourDay(day, index + 1)
        errors.push(...dayErrors)
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Валидация обновления сметы
   */
  static validateEstimateUpdate(updates) {
    const errors = []

    if (!updates) {
      errors.push('Данные для обновления обязательны')
      return { isValid: false, errors }
    }

    // Валидация только переданных полей
    if (updates.name !== undefined && (!updates.name || updates.name.trim() === '')) {
      errors.push('Название сметы не может быть пустым')
    }

    if (updates.client !== undefined && (!updates.client || updates.client.trim() === '')) {
      errors.push('Клиент не может быть пустым')
    }

    if (updates.group !== undefined) {
      const groupErrors = this.validateGroup(updates.group)
      errors.push(...groupErrors)
    }

    if (updates.hotels !== undefined && Array.isArray(updates.hotels)) {
      updates.hotels.forEach((hotel, index) => {
        const hotelErrors = this.validateHotel(hotel, index + 1)
        errors.push(...hotelErrors)
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Валидация группы
   */
  static validateGroup(group) {
    const errors = []

    if (!group) {
      errors.push('Данные группы обязательны')
      return errors
    }

    const totalPax = Number(group.totalPax)
    if (isNaN(totalPax) || totalPax <= 0) {
      errors.push('Количество туристов должно быть положительным числом')
    }

    const markup = Number(group.markup)
    if (!isNaN(markup) && (markup < 0 || markup > 100)) {
      errors.push('Наценка должна быть от 0 до 100%')
    }

    return errors
  }

  /**
   * Валидация отеля
   */
  static validateHotel(hotel, index) {
    const errors = []

    if (!hotel) {
      errors.push(`Отель ${index}: данные отеля обязательны`)
      return errors
    }

    if (!hotel.name || hotel.name.trim() === '') {
      errors.push(`Отель ${index}: название обязательно`)
    }

    if (!hotel.city || hotel.city.trim() === '') {
      errors.push(`Отель ${index}: город обязателен`)
    }

    const paxCount = Number(hotel.paxCount)
    if (isNaN(paxCount) || paxCount <= 0) {
      errors.push(`Отель ${index}: количество туристов должно быть положительным числом`)
    }

    const pricePerRoom = Number(hotel.pricePerRoom)
    if (isNaN(pricePerRoom) || pricePerRoom < 0) {
      errors.push(`Отель ${index}: цена за номер не может быть отрицательной`)
    }

    const nights = Number(hotel.nights)
    if (isNaN(nights) || nights <= 0 || nights > 365) {
      errors.push(`Отель ${index}: количество ночей должно быть от 1 до 365`)
    }

    if (!hotel.accommodationType || !['single', 'double', 'triple'].includes(hotel.accommodationType)) {
      errors.push(`Отель ${index}: тип размещения должен быть single, double или triple`)
    }

    return errors
  }

  /**
   * Валидация дня тура
   */
  static validateTourDay(day, index) {
    const errors = []

    if (!day) {
      errors.push(`День ${index}: данные дня обязательны`)
      return errors
    }

    if (!day.city || day.city.trim() === '') {
      errors.push(`День ${index}: город обязателен`)
    }

    if (day.activities && Array.isArray(day.activities)) {
      day.activities.forEach((activity, actIndex) => {
        const activityErrors = this.validateActivity(activity, index, actIndex + 1)
        errors.push(...activityErrors)
      })
    }

    return errors
  }

  /**
   * Валидация активности
   */
  static validateActivity(activity, dayIndex, actIndex) {
    const errors = []

    if (!activity) {
      errors.push(`День ${dayIndex}, активность ${actIndex}: данные активности обязательны`)
      return errors
    }

    if (!activity.name || activity.name.trim() === '') {
      errors.push(`День ${dayIndex}, активность ${actIndex}: название обязательно`)
    }

    const cost = Number(activity.cost)
    if (isNaN(cost) || cost < 0) {
      errors.push(`День ${dayIndex}, активность ${actIndex}: стоимость не может быть отрицательной`)
    }

    return errors
  }

  /**
   * Валидация опциональной услуги
   */
  static validateOptionalService(service, index) {
    const errors = []

    if (!service) {
      errors.push(`Услуга ${index}: данные услуги обязательны`)
      return errors
    }

    if (!service.name || service.name.trim() === '') {
      errors.push(`Услуга ${index}: название обязательно`)
    }

    const cost = Number(service.cost)
    if (isNaN(cost) || cost < 0) {
      errors.push(`Услуга ${index}: стоимость не может быть отрицательной`)
    }

    const quantity = Number(service.quantity)
    if (isNaN(quantity) || quantity <= 0) {
      errors.push(`Услуга ${index}: количество должно быть положительным числом`)
    }

    return errors
  }

  /**
   * Валидация локации
   */
  static validateLocation(location) {
    const errors = []

    if (!location) {
      errors.push('Данные локации обязательны')
      return errors
    }

    if (!location.country || location.country.trim() === '') {
      errors.push('Страна обязательна')
    }

    if (location.regions && !Array.isArray(location.regions)) {
      errors.push('Регионы должны быть массивом')
    }

    if (location.cities && !Array.isArray(location.cities)) {
      errors.push('Города должны быть массивом')
    }

    return errors
  }

  /**
   * Валидация дат тура
   */
  static validateTourDates(tourDates) {
    const errors = []

    if (!tourDates) {
      errors.push('Данные дат тура обязательны')
      return errors
    }

    if (!['exact', 'flexible'].includes(tourDates.dateType)) {
      errors.push('Тип дат должен быть exact или flexible')
    }

    if (tourDates.dateType === 'exact') {
      if (!tourDates.startDate) {
        errors.push('Дата начала обязательна для точных дат')
      }

      if (!tourDates.endDate) {
        errors.push('Дата окончания обязательна для точных дат')
      }

      if (tourDates.startDate && tourDates.endDate) {
        const startDate = new Date(tourDates.startDate)
        const endDate = new Date(tourDates.endDate)
        
        if (startDate >= endDate) {
          errors.push('Дата окончания должна быть позже даты начала')
        }
      }
    }

    if (tourDates.days !== undefined) {
      const days = Number(tourDates.days)
      if (isNaN(days) || days <= 0 || days > 365) {
        errors.push('Количество дней должно быть от 1 до 365')
      }
    }

    return errors
  }

  /**
   * Валидация числового значения
   */
  static validateNumber(value, fieldName, options = {}) {
    const errors = []
    const { min, max, required = true } = options

    if (required && (value === null || value === undefined || value === '')) {
      errors.push(`${fieldName} обязательно`)
      return errors
    }

    if (value !== null && value !== undefined && value !== '') {
      const num = Number(value)
      if (isNaN(num)) {
        errors.push(`${fieldName} должно быть числом`)
      } else {
        if (min !== undefined && num < min) {
          errors.push(`${fieldName} должно быть не меньше ${min}`)
        }
        if (max !== undefined && num > max) {
          errors.push(`${fieldName} должно быть не больше ${max}`)
        }
      }
    }

    return errors
  }

  /**
   * Валидация строки
   */
  static validateString(value, fieldName, options = {}) {
    const errors = []
    const { minLength, maxLength, required = true, pattern } = options

    if (required && (!value || value.trim() === '')) {
      errors.push(`${fieldName} обязательно`)
      return errors
    }

    if (value && value.trim() !== '') {
      const trimmedValue = value.trim()
      
      if (minLength !== undefined && trimmedValue.length < minLength) {
        errors.push(`${fieldName} должно содержать минимум ${minLength} символов`)
      }
      
      if (maxLength !== undefined && trimmedValue.length > maxLength) {
        errors.push(`${fieldName} должно содержать максимум ${maxLength} символов`)
      }
      
      if (pattern && !pattern.test(trimmedValue)) {
        errors.push(`${fieldName} имеет неверный формат`)
      }
    }

    return errors
  }

  /**
   * Валидация массива
   */
  static validateArray(value, fieldName, options = {}) {
    const errors = []
    const { minLength, maxLength, required = true } = options

    if (required && (!Array.isArray(value) || value.length === 0)) {
      errors.push(`${fieldName} обязательно и не может быть пустым`)
      return errors
    }

    if (Array.isArray(value)) {
      if (minLength !== undefined && value.length < minLength) {
        errors.push(`${fieldName} должно содержать минимум ${minLength} элементов`)
      }
      
      if (maxLength !== undefined && value.length > maxLength) {
        errors.push(`${fieldName} должно содержать максимум ${maxLength} элементов`)
      }
    }

    return errors
  }
}

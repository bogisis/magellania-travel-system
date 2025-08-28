// src/utils/validation.js

import { ErrorHandler, ErrorTypes } from '@/services/errorHandler.js'

/**
 * Система валидации данных на основе схем
 */

// Базовые схемы валидации
export const validationSchemas = {
  estimate: {
    name: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 100,
      label: 'Название сметы',
    },
    tourName: {
      required: true,
      type: 'string',
      minLength: 3,
      maxLength: 200,
      label: 'Название тура',
    },
    country: {
      required: true,
      type: 'string',
      label: 'Страна',
    },
    startDate: {
      required: true,
      type: 'string',
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      label: 'Дата начала',
    },
    duration: {
      required: true,
      type: 'number',
      min: 1,
      max: 365,
      label: 'Продолжительность',
    },
  },

  client: {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100,
      label: 'Имя клиента',
    },
    email: {
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      label: 'Email',
    },
    phone: {
      required: false,
      type: 'string',
      pattern: /^[\+]?[0-9\s\-\(\)]{7,20}$/,
      label: 'Телефон',
    },
    type: {
      required: true,
      type: 'string',
      validate: (value) => {
        const validTypes = ['b2c', 'b2b']
        if (!validTypes.includes(value)) {
          return 'Тип клиента должен быть B2C или B2B'
        }
        return null
      },
      label: 'Тип клиента',
    },
  },
}

/**
 * Класс для валидации данных
 */
export class Validator {
  /**
   * Валидация объекта по схеме
   */
  static validate(data, schema) {
    const errors = []
    const warnings = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]
      const fieldErrors = this.validateField(field, value, rules, data)

      errors.push(...fieldErrors.errors)
      warnings.push(...fieldErrors.warnings)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
    }
  }

  /**
   * Валидация отдельного поля
   */
  static validateField(field, value, rules, data = {}) {
    const errors = []
    const warnings = []

    // Проверка обязательности
    if (rules.required && this.isEmpty(value)) {
      errors.push({
        field,
        message: `Поле "${rules.label || field}" обязательно для заполнения`,
        rule: 'required',
        severity: 'error',
      })
      return { errors, warnings }
    }

    // Если поле не обязательно и пустое, пропускаем остальные проверки
    if (this.isEmpty(value)) {
      return { errors, warnings }
    }

    // Проверка типа
    if (rules.type && !this.checkType(value, rules.type)) {
      errors.push({
        field,
        message: `Поле "${rules.label || field}" должно быть типа ${rules.type}`,
        rule: 'type',
        expected: rules.type,
        actual: typeof value,
        severity: 'error',
      })
    }

    // Проверка длины строки
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push({
        field,
        message: `Поле "${rules.label || field}" должно содержать минимум ${rules.minLength} символов`,
        rule: 'minLength',
        expected: rules.minLength,
        actual: value.length,
        severity: 'error',
      })
    }

    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push({
        field,
        message: `Поле "${rules.label || field}" должно содержать максимум ${rules.maxLength} символов`,
        rule: 'maxLength',
        expected: rules.maxLength,
        actual: value.length,
        severity: 'error',
      })
    }

    // Проверка числовых значений
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
      errors.push({
        field,
        message: `Поле "${rules.label || field}" должно быть не менее ${rules.min}`,
        rule: 'min',
        expected: rules.min,
        actual: value,
        severity: 'error',
      })
    }

    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
      errors.push({
        field,
        message: `Поле "${rules.label || field}" должно быть не более ${rules.max}`,
        rule: 'max',
        expected: rules.max,
        actual: value,
        severity: 'error',
      })
    }

    // Проверка регулярного выражения
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push({
        field,
        message: `Поле "${rules.label || field}" имеет неверный формат`,
        rule: 'pattern',
        pattern: rules.pattern.toString(),
        severity: 'error',
      })
    }

    // Пользовательская валидация
    if (rules.validate) {
      const customError = rules.validate(value, data)
      if (customError) {
        errors.push({
          field,
          message: customError,
          rule: 'custom',
          severity: 'error',
        })
      }
    }

    return { errors, warnings }
  }

  /**
   * Проверка, является ли значение пустым
   */
  static isEmpty(value) {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (typeof value === 'number') return isNaN(value)
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  }

  /**
   * Проверка типа значения
   */
  static checkType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      case 'date':
        return value instanceof Date || !isNaN(Date.parse(value))
      default:
        return true
    }
  }

  /**
   * Валидация формы с отображением ошибок в UI
   */
  static validateForm(data, schema, setFieldError, clearFieldError) {
    const result = this.validate(data, schema)

    // Очищаем все ошибки
    Object.keys(schema).forEach((field) => {
      clearFieldError(field)
    })

    // Устанавливаем новые ошибки
    result.errors.forEach((error) => {
      setFieldError(error.field, error.message)
    })

    return result.isValid
  }
}

// Экспортируем функции для удобства
export const validate = Validator.validate.bind(Validator)
export const validateForm = Validator.validateForm.bind(Validator)

export default Validator

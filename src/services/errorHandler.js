// src/services/errorHandler.js

/**
 * Централизованная система обработки ошибок
 * Обеспечивает единообразную обработку ошибок во всем приложении
 */

// Типы ошибок
export const ErrorTypes = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  DATABASE: 'database',
  AUTH: 'auth',
  PERMISSION: 'permission',
  BUSINESS_LOGIC: 'business_logic',
  UNKNOWN: 'unknown',
}

// Уровни серьезности ошибок
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

// Класс для обработки ошибок
export class ErrorHandler {
  constructor() {
    this.errorQueue = []
    this.maxQueueSize = 100
    this.isReporting = false
  }

  /**
   * Обработка ошибки
   * @param {Error} error - Объект ошибки
   * @param {string} context - Контекст, в котором произошла ошибка
   * @param {Object} options - Дополнительные опции
   */
  static handle(error, context = 'unknown', options = {}) {
    const errorInfo = this.analyzeError(error, context, options)

    // Логируем ошибку
    this.logError(errorInfo)

    // Добавляем в очередь для отправки
    this.addToQueue(errorInfo)

    // Показываем уведомление пользователю
    this.showUserNotification(errorInfo)

    // Отправляем в систему мониторинга (если настроена)
    this.reportToMonitoring(errorInfo)

    return errorInfo
  }

  /**
   * Анализ ошибки и определение её типа
   * @param {Error} error - Объект ошибки
   * @param {string} context - Контекст
   * @param {Object} options - Опции
   * @returns {Object} Информация об ошибке
   */
  static analyzeError(error, context, options = {}) {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      message: error.message || 'Неизвестная ошибка',
      stack: error.stack,
      context,
      type: this.determineErrorType(error),
      severity: this.determineSeverity(error, context),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: options.userId || 'anonymous',
      sessionId: this.getSessionId(),
      additionalData: options.additionalData || {},
      retryable: this.isRetryable(error),
      ...options,
    }

    return errorInfo
  }

  /**
   * Определение типа ошибки
   * @param {Error} error - Объект ошибки
   * @returns {string} Тип ошибки
   */
  static determineErrorType(error) {
    const message = error.message?.toLowerCase() || ''
    const name = error.name?.toLowerCase() || ''

    // Сетевые ошибки
    if (name.includes('network') || message.includes('fetch') || message.includes('http')) {
      return ErrorTypes.NETWORK
    }

    // Ошибки базы данных
    if (name.includes('dexie') || message.includes('database') || message.includes('indexeddb')) {
      return ErrorTypes.DATABASE
    }

    // Ошибки валидации
    if (
      name.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')
    ) {
      return ErrorTypes.VALIDATION
    }

    // Ошибки авторизации
    if (
      name.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('forbidden')
    ) {
      return ErrorTypes.AUTH
    }

    // Ошибки прав доступа
    if (message.includes('permission') || message.includes('access denied')) {
      return ErrorTypes.PERMISSION
    }

    return ErrorTypes.UNKNOWN
  }

  /**
   * Определение серьезности ошибки
   * @param {Error} error - Объект ошибки
   * @param {string} context - Контекст
   * @returns {string} Уровень серьезности
   */
  static determineSeverity(error, context) {
    const type = this.determineErrorType(error)
    const message = error.message?.toLowerCase() || ''

    // Критические ошибки
    if (type === ErrorTypes.DATABASE && message.includes('corrupt')) {
      return ErrorSeverity.CRITICAL
    }

    if (type === ErrorTypes.AUTH && context.includes('login')) {
      return ErrorSeverity.CRITICAL
    }

    // Высокие ошибки
    if (type === ErrorTypes.NETWORK && context.includes('save')) {
      return ErrorSeverity.HIGH
    }

    if (type === ErrorTypes.DATABASE && context.includes('save')) {
      return ErrorSeverity.HIGH
    }

    // Средние ошибки
    if (type === ErrorTypes.VALIDATION) {
      return ErrorSeverity.MEDIUM
    }

    // Низкие ошибки
    if (type === ErrorTypes.UNKNOWN) {
      return ErrorSeverity.LOW
    }

    return ErrorSeverity.MEDIUM
  }

  /**
   * Проверка возможности повторной попытки
   * @param {Error} error - Объект ошибки
   * @returns {boolean} Можно ли повторить
   */
  static isRetryable(error) {
    const type = this.determineErrorType(error)
    const message = error.message?.toLowerCase() || ''

    // Сетевые ошибки обычно можно повторить
    if (type === ErrorTypes.NETWORK) {
      return true
    }

    // Ошибки валидации нельзя повторить
    if (type === ErrorTypes.VALIDATION) {
      return false
    }

    // Ошибки авторизации нельзя повторить
    if (type === ErrorTypes.AUTH) {
      return false
    }

    return false
  }

  /**
   * Логирование ошибки в консоль
   * @param {Object} errorInfo - Информация об ошибке
   */
  static logError(errorInfo) {
    const logMessage = `[${errorInfo.severity.toUpperCase()}] ${errorInfo.type}: ${errorInfo.message}`
    const logData = {
      ...errorInfo,
      context: errorInfo.context,
    }

    switch (errorInfo.severity) {
      case ErrorSeverity.CRITICAL:
        console.error(logMessage, logData)
        break
      case ErrorSeverity.HIGH:
        console.error(logMessage, logData)
        break
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage, logData)
        break
      case ErrorSeverity.LOW:
        console.info(logMessage, logData)
        break
      default:
        console.log(logMessage, logData)
    }
  }

  /**
   * Добавление ошибки в очередь для отправки
   * @param {Object} errorInfo - Информация об ошибке
   */
  static addToQueue(errorInfo) {
    if (!this.errorQueue) {
      this.errorQueue = []
    }

    this.errorQueue.push(errorInfo)

    // Ограничиваем размер очереди
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // Отправляем очередь, если она достаточно большая
    if (this.errorQueue.length >= 10 && !this.isReporting) {
      this.flushQueue()
    }
  }

  /**
   * Отправка очереди ошибок
   */
  static async flushQueue() {
    if (this.isReporting || this.errorQueue.length === 0) {
      return
    }

    this.isReporting = true

    try {
      const errorsToSend = [...this.errorQueue]
      this.errorQueue = []

      // В реальном приложении здесь будет отправка в систему мониторинга
      // Например, Sentry, LogRocket, или собственная система
      await this.sendToMonitoring(errorsToSend)
    } catch (error) {
      console.error('Ошибка отправки ошибок в мониторинг:', error)
      // Возвращаем ошибки в очередь
      this.errorQueue.unshift(...this.errorQueue)
    } finally {
      this.isReporting = false
    }
  }

  /**
   * Отправка ошибок в систему мониторинга
   * @param {Array} errors - Массив ошибок
   */
  static async sendToMonitoring(errors) {
    // Заглушка для отправки в систему мониторинга
    // В реальном приложении здесь будет интеграция с Sentry, LogRocket и т.д.

    if (process.env.NODE_ENV === 'development') {
      console.group('📊 Отправка ошибок в мониторинг')
      errors.forEach((error) => {
        console.log(`- ${error.type}: ${error.message} (${error.context})`)
      })
      console.groupEnd()
    }

    // Имитируем отправку
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  /**
   * Показ уведомления пользователю
   * @param {Object} errorInfo - Информация об ошибке
   */
  static showUserNotification(errorInfo) {
    // Получаем toast store, если доступен
    const toastStore = window.$toast || this.getToastStore()

    if (!toastStore) {
      // Fallback: показываем alert для критических ошибок
      if (errorInfo.severity === ErrorSeverity.CRITICAL) {
        alert(`Критическая ошибка: ${errorInfo.message}`)
      }
      return
    }

    const notificationConfig = this.getNotificationConfig(errorInfo)

    toastStore.addToast({
      type: notificationConfig.type,
      title: notificationConfig.title,
      message: notificationConfig.message,
      duration: notificationConfig.duration,
      actions: notificationConfig.actions,
    })
  }

  /**
   * Получение конфигурации уведомления
   * @param {Object} errorInfo - Информация об ошибке
   * @returns {Object} Конфигурация уведомления
   */
  static getNotificationConfig(errorInfo) {
    const configs = {
      [ErrorTypes.VALIDATION]: {
        type: 'warning',
        title: 'Ошибка валидации',
        message: errorInfo.message,
        duration: 5000,
      },
      [ErrorTypes.NETWORK]: {
        type: 'error',
        title: 'Ошибка сети',
        message: 'Проблема с подключением к серверу. Проверьте интернет-соединение.',
        duration: 0,
        actions: [
          {
            label: 'Повторить',
            action: () => this.retryLastAction(),
          },
        ],
      },
      [ErrorTypes.DATABASE]: {
        type: 'error',
        title: 'Ошибка базы данных',
        message: 'Проблема с сохранением данных. Попробуйте обновить страницу.',
        duration: 0,
      },
      [ErrorTypes.AUTH]: {
        type: 'error',
        title: 'Ошибка авторизации',
        message: 'Необходимо войти в систему.',
        duration: 0,
        actions: [
          {
            label: 'Войти',
            action: () => this.redirectToLogin(),
          },
        ],
      },
      [ErrorTypes.PERMISSION]: {
        type: 'error',
        title: 'Доступ запрещен',
        message: 'У вас нет прав для выполнения этого действия.',
        duration: 5000,
      },
      [ErrorTypes.BUSINESS_LOGIC]: {
        type: 'warning',
        title: 'Ошибка операции',
        message: errorInfo.message,
        duration: 5000,
      },
      [ErrorTypes.UNKNOWN]: {
        type: 'error',
        title: 'Неожиданная ошибка',
        message: 'Произошла неожиданная ошибка. Попробуйте обновить страницу.',
        duration: 0,
      },
    }

    return configs[errorInfo.type] || configs[ErrorTypes.UNKNOWN]
  }

  /**
   * Получение toast store
   * @returns {Object|null} Toast store
   */
  static getToastStore() {
    // Пытаемся получить toast store из разных источников
    if (window.$toast) {
      return window.$toast
    }

    // Если используется Pinia
    try {
      const { useToastStore } = require('@/stores/toastStore')
      return useToastStore()
    } catch (error) {
      return null
    }
  }

  /**
   * Повтор последнего действия
   */
  static retryLastAction() {
    // В реальном приложении здесь будет логика повторения последнего действия
    console.log('Повтор последнего действия')
    window.location.reload()
  }

  /**
   * Перенаправление на страницу входа
   */
  static redirectToLogin() {
    // В реальном приложении здесь будет перенаправление на страницу входа
    console.log('Перенаправление на страницу входа')
    window.location.href = '/login'
  }

  /**
   * Генерация уникального ID ошибки
   * @returns {string} Уникальный ID
   */
  static generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Получение ID сессии
   * @returns {string} ID сессии
   */
  static getSessionId() {
    let sessionId = sessionStorage.getItem('magellania_session_id')
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('magellania_session_id', sessionId)
    }
    return sessionId
  }

  /**
   * Отправка ошибки в систему мониторинга
   * @param {Object} errorInfo - Информация об ошибке
   */
  static reportToMonitoring(errorInfo) {
    // Отправляем только критические и высокие ошибки
    if (
      errorInfo.severity === ErrorSeverity.CRITICAL ||
      errorInfo.severity === ErrorSeverity.HIGH
    ) {
      this.sendToMonitoring([errorInfo])
    }
  }

  /**
   * Создание пользовательской ошибки
   * @param {string} message - Сообщение ошибки
   * @param {string} type - Тип ошибки
   * @param {Object} options - Дополнительные опции
   * @returns {Error} Пользовательская ошибка
   */
  static createError(message, type = ErrorTypes.UNKNOWN, options = {}) {
    const error = new Error(message)
    error.name = type
    error.isCustom = true
    error.options = options
    return error
  }

  /**
   * Валидация данных с возвратом ошибок
   * @param {Object} data - Данные для валидации
   * @param {Object} schema - Схема валидации
   * @returns {Array} Массив ошибок валидации
   */
  static validateData(data, schema) {
    const errors = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field]

      // Проверка обязательности
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(
          this.createError(
            `Поле "${rules.label || field}" обязательно для заполнения`,
            ErrorTypes.VALIDATION,
            { field, rule: 'required' },
          ),
        )
        continue
      }

      if (value === undefined || value === null || value === '') {
        continue // Пропускаем необязательные пустые поля
      }

      // Проверка типа
      if (rules.type && typeof value !== rules.type) {
        errors.push(
          this.createError(
            `Поле "${rules.label || field}" должно быть типа ${rules.type}`,
            ErrorTypes.VALIDATION,
            { field, rule: 'type', expected: rules.type, actual: typeof value },
          ),
        )
      }

      // Проверка длины строки
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(
          this.createError(
            `Поле "${rules.label || field}" должно содержать минимум ${rules.minLength} символов`,
            ErrorTypes.VALIDATION,
            { field, rule: 'minLength', expected: rules.minLength, actual: value.length },
          ),
        )
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(
          this.createError(
            `Поле "${rules.label || field}" должно содержать максимум ${rules.maxLength} символов`,
            ErrorTypes.VALIDATION,
            { field, rule: 'maxLength', expected: rules.maxLength, actual: value.length },
          ),
        )
      }

      // Проверка числовых значений
      if (rules.min !== undefined && value < rules.min) {
        errors.push(
          this.createError(
            `Поле "${rules.label || field}" должно быть не менее ${rules.min}`,
            ErrorTypes.VALIDATION,
            { field, rule: 'min', expected: rules.min, actual: value },
          ),
        )
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(
          this.createError(
            `Поле "${rules.label || field}" должно быть не более ${rules.max}`,
            ErrorTypes.VALIDATION,
            { field, rule: 'max', expected: rules.max, actual: value },
          ),
        )
      }

      // Проверка регулярного выражения
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(
          this.createError(
            `Поле "${rules.label || field}" имеет неверный формат`,
            ErrorTypes.VALIDATION,
            { field, rule: 'pattern', pattern: rules.pattern.toString() },
          ),
        )
      }

      // Пользовательская валидация
      if (rules.validate) {
        const customError = rules.validate(value, data)
        if (customError) {
          errors.push(
            this.createError(customError, ErrorTypes.VALIDATION, { field, rule: 'custom' }),
          )
        }
      }
    }

    return errors
  }
}

// Экспортируем статические методы как функции для удобства
export const handleError = ErrorHandler.handle.bind(ErrorHandler)
export const createError = ErrorHandler.createError.bind(ErrorHandler)
export const validateData = ErrorHandler.validateData.bind(ErrorHandler)

// Глобальный обработчик необработанных ошибок
window.addEventListener('error', (event) => {
  ErrorHandler.handle(event.error, 'unhandled', {
    additionalData: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    },
  })
})

// Глобальный обработчик необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  ErrorHandler.handle(event.reason, 'unhandled-promise', {
    additionalData: {
      promise: event.promise,
    },
  })
})

// Экспортируем экземпляр для использования в других модулях
export default ErrorHandler

/**
 * Calculation Errors - Custom error classes for calculation engine
 *
 * Provides specific error types for different calculation scenarios
 * with detailed context and debugging information.
 */

/**
 * Base calculation error class
 */
export class CalculationError extends Error {
  constructor(message, context = {}) {
    super(message)
    this.name = 'CalculationError'
    this.context = context
    this.timestamp = new Date().toISOString()

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CalculationError)
    }
  }

  /**
   * Get error details for debugging
   * @returns {Object} Error details
   */
  getDetails() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }
}

/**
 * Validation error for invalid input data
 */
export class ValidationError extends Error {
  constructor(message, field = null, value = null) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
    this.value = value
    this.timestamp = new Date().toISOString()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError)
    }
  }

  /**
   * Get validation error details
   * @returns {Object} Validation error details
   */
  getDetails() {
    return {
      name: this.name,
      message: this.message,
      field: this.field,
      value: this.value,
      timestamp: this.timestamp,
    }
  }
}

/**
 * Performance error for slow calculations
 */
export class PerformanceError extends Error {
  constructor(message, duration, threshold) {
    super(message)
    this.name = 'PerformanceError'
    this.duration = duration
    this.threshold = threshold
    this.timestamp = new Date().toISOString()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PerformanceError)
    }
  }

  /**
   * Get performance error details
   * @returns {Object} Performance error details
   */
  getDetails() {
    return {
      name: this.name,
      message: this.message,
      duration: this.duration,
      threshold: this.threshold,
      timestamp: this.timestamp,
    }
  }
}

/**
 * Integrity error for calculation validation failures
 */
export class IntegrityError extends Error {
  constructor(message, expected, actual, calculation) {
    super(message)
    this.name = 'IntegrityError'
    this.expected = expected
    this.actual = actual
    this.calculation = calculation
    this.timestamp = new Date().toISOString()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IntegrityError)
    }
  }

  /**
   * Get integrity error details
   * @returns {Object} Integrity error details
   */
  getDetails() {
    return {
      name: this.name,
      message: this.message,
      expected: this.expected,
      actual: this.actual,
      calculation: this.calculation,
      timestamp: this.timestamp,
    }
  }
}

/**
 * Database error for calculation persistence issues
 */
export class CalculationDatabaseError extends Error {
  constructor(message, operation, data = null) {
    super(message)
    this.name = 'CalculationDatabaseError'
    this.operation = operation
    this.data = data
    this.timestamp = new Date().toISOString()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CalculationDatabaseError)
    }
  }

  /**
   * Get database error details
   * @returns {Object} Database error details
   */
  getDetails() {
    return {
      name: this.name,
      message: this.message,
      operation: this.operation,
      data: this.data,
      timestamp: this.timestamp,
    }
  }
}

/**
 * Error handler for calculation errors
 */
export class CalculationErrorHandler {
  /**
   * Handle calculation error with appropriate logging
   * @param {Error} error - Error to handle
   * @param {string} context - Error context
   */
  static handle(error, context = 'calculation') {
    const errorDetails = {
      context,
      timestamp: new Date().toISOString(),
      error: error.getDetails
        ? error.getDetails()
        : {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
    }

    // Log error based on type
    switch (error.name) {
      case 'ValidationError':
        console.warn('Validation Error:', errorDetails)
        break
      case 'PerformanceError':
        console.warn('Performance Error:', errorDetails)
        break
      case 'IntegrityError':
        console.error('Integrity Error:', errorDetails)
        break
      case 'CalculationDatabaseError':
        console.error('Database Error:', errorDetails)
        break
      default:
        console.error('Calculation Error:', errorDetails)
    }

    // Return error details for further handling
    return errorDetails
  }

  /**
   * Check if error is recoverable
   * @param {Error} error - Error to check
   * @returns {boolean} True if error is recoverable
   */
  static isRecoverable(error) {
    return error.name === 'ValidationError' || error.name === 'PerformanceError'
  }

  /**
   * Create user-friendly error message
   * @param {Error} error - Error to convert
   * @returns {string} User-friendly message
   */
  static getUserMessage(error) {
    switch (error.name) {
      case 'ValidationError':
        return `Ошибка валидации: ${error.message}`
      case 'PerformanceError':
        return 'Расчет занял слишком много времени. Попробуйте еще раз.'
      case 'IntegrityError':
        return 'Ошибка целостности расчетов. Проверьте данные.'
      case 'CalculationDatabaseError':
        return 'Ошибка сохранения расчетов. Попробуйте еще раз.'
      default:
        return 'Произошла ошибка при расчете. Попробуйте еще раз.'
    }
  }
}

export default {
  CalculationError,
  ValidationError,
  PerformanceError,
  IntegrityError,
  CalculationDatabaseError,
  CalculationErrorHandler,
}

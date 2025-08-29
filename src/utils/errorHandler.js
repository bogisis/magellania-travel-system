/**
 * Централизованная обработка ошибок
 */

// Проверяем наличие GM (Greasemonkey/Tampermonkey)
const isGM = typeof GM !== 'undefined'

/**
 * Безопасный вызов GM функций
 */
export function safeGMCall(callback, fallback = null) {
  try {
    if (isGM && typeof callback === 'function') {
      return callback()
    }
    return fallback
  } catch (error) {
    console.warn('GM function call failed:', error)
    return fallback
  }
}

/**
 * Обработка ошибок GM
 */
export function handleGMError(error) {
  if (error.message && error.message.includes('GM is not defined')) {
    console.warn(
      'GM (Greasemonkey/Tampermonkey) is not available. This is normal in regular browser environment.',
    )
    return {
      handled: true,
      message: 'GM functions are not available in this environment',
    }
  }
  return {
    handled: false,
    error,
  }
}

/**
 * Основной обработчик ошибок
 */
export function handleError(error, context = 'unknown') {
  // Обрабатываем ошибки GM
  const gmResult = handleGMError(error)
  if (gmResult.handled) {
    return gmResult
  }

  // Логируем ошибку
  console.error(`Error in ${context}:`, error)

  // Возвращаем информацию об ошибке
  return {
    handled: false,
    error,
    context,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Обработчик для асинхронных операций
 */
export async function handleAsyncError(asyncFn, context = 'unknown') {
  try {
    return await asyncFn()
  } catch (error) {
    return handleError(error, context)
  }
}

/**
 * Обработчик для промисов
 */
export function handlePromiseError(promise, context = 'unknown') {
  return promise.catch((error) => {
    return handleError(error, context)
  })
}

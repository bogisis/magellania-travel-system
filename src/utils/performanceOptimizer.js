/**
 * Утилиты для оптимизации производительности
 */

/**
 * Дебаунсинг функция для предотвращения частых вызовов
 * @param {Function} func - функция для выполнения
 * @param {number} wait - время ожидания в миллисекундах
 * @returns {Function} - дебаунсированная функция
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Троттлинг функция для ограничения частоты вызовов
 * @param {Function} func - функция для выполнения
 * @param {number} limit - максимальное количество вызовов в секунду
 * @returns {Function} - троттлированная функция
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Кэширование результатов вычислений
 * @param {Function} fn - функция для кэширования
 * @param {Function} keyFn - функция для генерации ключа кэша
 * @returns {Function} - кэшированная функция
 */
export function memoize(fn, keyFn = JSON.stringify) {
  const cache = new Map()
  
  return function memoizedFunction(...args) {
    const key = keyFn(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn.apply(this, args)
    cache.set(key, result)
    return result
  }
}

/**
 * Оптимизированный computed с кэшированием
 * @param {Function} getter - функция вычисления
 * @param {Function} keyFn - функция для генерации ключа кэша
 * @returns {Object} - объект с кэшированным значением
 */
export function createCachedComputed(getter, keyFn = JSON.stringify) {
  let cache = null
  let lastKey = null
  
  return {
    get value() {
      const key = keyFn()
      
      if (cache && lastKey === key) {
        return cache
      }
      
      cache = getter()
      lastKey = key
      return cache
    },
    
    clear() {
      cache = null
      lastKey = null
    }
  }
}

/**
 * Оптимизация обработчиков событий
 * @param {Function} handler - обработчик события
 * @param {Object} options - опции оптимизации
 * @returns {Function} - оптимизированный обработчик
 */
export function optimizeEventHandler(handler, options = {}) {
  const {
    debounceMs = 100,
    throttleMs = 0,
    useRequestAnimationFrame = false
  } = options
  
  let optimizedHandler = handler
  
  if (throttleMs > 0) {
    optimizedHandler = throttle(optimizedHandler, throttleMs)
  }
  
  if (debounceMs > 0) {
    optimizedHandler = debounce(optimizedHandler, debounceMs)
  }
  
  if (useRequestAnimationFrame) {
    const originalHandler = optimizedHandler
    optimizedHandler = function(...args) {
      requestAnimationFrame(() => {
        originalHandler.apply(this, args)
      })
    }
  }
  
  return optimizedHandler
}

/**
 * Измерение производительности функции
 * @param {Function} fn - функция для измерения
 * @param {string} name - название для логирования
 * @returns {Function} - обернутая функция с измерением
 */
export function measurePerformance(fn, name = 'Function') {
  return function measuredFunction(...args) {
    const start = performance.now()
    const result = fn.apply(this, args)
    const end = performance.now()
    
    if (end - start > 16) { // Больше 16ms (60fps)
      console.warn(`⚠️ ${name} took ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }
}

/**
 * Оптимизация для тяжелых вычислений
 * @param {Function} fn - тяжелая функция
 * @param {Object} options - опции оптимизации
 * @returns {Function} - оптимизированная функция
 */
export function optimizeHeavyComputation(fn, options = {}) {
  const {
    useWebWorker = false,
    useRequestIdleCallback = false,
    cacheResults = true
  } = options
  
  if (useWebWorker && typeof Worker !== 'undefined') {
    // Реализация с Web Worker (упрощенная)
    return function workerFunction(...args) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fn.apply(this, args))
        }, 0)
      })
    }
  }
  
  if (useRequestIdleCallback && typeof requestIdleCallback !== 'undefined') {
    return function idleFunction(...args) {
      return new Promise((resolve) => {
        requestIdleCallback(() => {
          resolve(fn.apply(this, args))
        })
      })
    }
  }
  
  if (cacheResults) {
    return memoize(fn)
  }
  
  return fn
}

/**
 * Оптимизация для Vue computed свойств
 * @param {Function} getter - функция вычисления
 * @param {Object} options - опции оптимизации
 * @returns {Object} - оптимизированный computed объект
 */
export function createOptimizedComputed(getter, options = {}) {
  const {
    cacheKey = null,
    debounceMs = 0,
    throttleMs = 0
  } = options
  
  let cache = null
  let lastKey = null
  let timeout = null
  
  const compute = () => {
    const key = cacheKey ? cacheKey() : null
    
    if (cache && lastKey === key) {
      return cache
    }
    
    cache = getter()
    lastKey = key
    return cache
  }
  
  let optimizedCompute = compute
  
  if (throttleMs > 0) {
    optimizedCompute = throttle(compute, throttleMs)
  }
  
  if (debounceMs > 0) {
    optimizedCompute = debounce(compute, debounceMs)
  }
  
  return {
    get value() {
      return optimizedCompute()
    },
    
    clear() {
      cache = null
      lastKey = null
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
    }
  }
}

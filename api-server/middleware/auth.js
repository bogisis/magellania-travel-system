const jwt = require('jsonwebtoken')

/**
 * Middleware для аутентификации JWT токенов
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Требуется токен доступа для выполнения операции',
    })
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      console.error('JWT verification failed:', err.message)
      return res.status(403).json({
        error: 'Invalid or expired token',
        message: 'Недействительный или истекший токен',
      })
    }

    req.user = user
    next()
  })
}

/**
 * Middleware для проверки роли пользователя
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Требуется аутентификация',
      })
    }

    if (!req.user.role || req.user.role !== role) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Недостаточно прав для выполнения операции',
      })
    }

    next()
  }
}

/**
 * Middleware для проверки владельца ресурса
 */
function requireOwnership(resourceType) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Требуется аутентификация',
      })
    }

    // Администраторы могут управлять всеми ресурсами
    if (req.user.role === 'admin') {
      return next()
    }

    // Проверяем владельца ресурса
    const resourceId = req.params.id
    if (!resourceId) {
      return res.status(400).json({
        error: 'Resource ID required',
        message: 'Требуется ID ресурса',
      })
    }

    // Здесь должна быть проверка владельца в базе данных
    // Пока что разрешаем доступ всем аутентифицированным пользователям
    next()
  }
}

/**
 * Middleware для rate limiting
 */
function rateLimit(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000 // 15 минут
  const max = options.max || 100 // максимум 100 запросов
  const requests = new Map()

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress
    const now = Date.now()

    if (!requests.has(ip)) {
      requests.set(ip, { count: 0, resetTime: now + windowMs })
    }

    const userRequests = requests.get(ip)

    if (now > userRequests.resetTime) {
      userRequests.count = 0
      userRequests.resetTime = now + windowMs
    }

    userRequests.count++

    if (userRequests.count > max) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Слишком много запросов. Попробуйте позже.',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
      })
    }

    next()
  }
}

/**
 * Middleware для логирования запросов
 */
function requestLogger(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    }

    if (res.statusCode >= 400) {
      console.error('❌ Request failed:', logData)
    } else {
      console.log('✅ Request completed:', logData)
    }
  })

  next()
}

/**
 * Middleware для обработки ошибок
 */
function errorHandler(err, req, res, next) {
  console.error('🚨 API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString(),
  })

  // JWT ошибки
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Недействительный токен',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Токен истек',
    })
  }

  // Валидационные ошибки
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Ошибка валидации данных',
      details: err.details,
    })
  }

  // Ошибки базы данных
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      error: 'Database constraint violation',
      message: 'Нарушение ограничений базы данных',
    })
  }

  // Общие ошибки сервера
  const statusCode = err.statusCode || 500
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message

  res.status(statusCode).json({
    error: 'Server error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership,
  rateLimit,
  requestLogger,
  errorHandler,
}

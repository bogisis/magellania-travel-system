const Joi = require('joi')

/**
 * Схемы валидации для API endpoints
 */

// Базовая схема для ID
const idSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

// Схема для пагинации
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'name', 'totalPrice').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
})

// Схема для поиска
const searchSchema = Joi.object({
  search: Joi.string().min(1).max(100).optional(),
  status: Joi.string().valid('draft', 'sent', 'approved', 'rejected').optional(),
  clientId: Joi.number().integer().positive().optional(),
})

// Схема для группы туристов
const groupSchema = Joi.object({
  totalPax: Joi.number().integer().min(1).max(1000).optional().messages({
    'number.base': 'Количество туристов должно быть числом',
    'number.integer': 'Количество туристов должно быть целым числом',
    'number.min': 'Количество туристов должно быть больше 0',
    'number.max': 'Количество туристов не может превышать 1000',
  }),
  doubleCount: Joi.number().integer().min(0).max(500).default(0),
  singleCount: Joi.number().integer().min(0).max(500).default(0),
  tripleCount: Joi.number().integer().min(0).max(500).default(0),
  extraCount: Joi.number().integer().min(0).max(500).default(0),
  guidesCount: Joi.number().integer().min(0).max(50).default(0),
  markup: Joi.number().min(0).max(100).precision(2).default(15).messages({
    'number.base': 'Наценка должна быть числом',
    'number.min': 'Наценка не может быть отрицательной',
    'number.max': 'Наценка не может превышать 100%',
  }),
})

// Схема для локации
const locationSchema = Joi.object({
  country: Joi.string().min(1).max(100).optional().messages({
    'string.empty': 'Страна обязательна для заполнения',
    'string.min': 'Название страны должно содержать минимум 1 символ',
    'string.max': 'Название страны не может превышать 100 символов',
  }),
  regions: Joi.array().items(Joi.string().min(1).max(100)).default([]),
  cities: Joi.array().items(Joi.string().min(1).max(100)).default([]),
  startPoint: Joi.string().max(200).optional(),
  endPoint: Joi.string().max(200).optional(),
})

// Схема для дат тура
const tourDatesSchema = Joi.object({
  dateType: Joi.string().valid('exact', 'flexible').default('exact'),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  days: Joi.number().integer().min(1).max(365).optional(),
})

// Схема для гостиницы
const hotelSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(1).max(255).optional().messages({
    'string.empty': 'Название гостиницы обязательно',
    'string.min': 'Название гостиницы должно содержать минимум 1 символ',
    'string.max': 'Название гостиницы не может превышать 255 символов',
  }),
  city: Joi.string().min(1).max(100).optional(),
  region: Joi.string().min(1).max(100).optional(),
  accommodationType: Joi.string().valid('single', 'double', 'triple').optional(),
  paxCount: Joi.number().integer().min(1).max(100).optional().messages({
    'number.base': 'Количество туристов должно быть числом',
    'number.integer': 'Количество туристов должно быть целым числом',
    'number.min': 'Количество туристов должно быть больше 0',
    'number.max': 'Количество туристов не может превышать 100',
  }),
  nights: Joi.number().integer().min(1).max(365).optional().messages({
    'number.base': 'Количество ночей должно быть числом',
    'number.integer': 'Количество ночей должно быть целым числом',
    'number.min': 'Количество ночей должно быть больше 0',
    'number.max': 'Количество ночей не может превышать 365',
  }),
  pricePerRoom: Joi.number().min(0).precision(2).optional().messages({
    'number.base': 'Цена за номер должна быть числом',
    'number.min': 'Цена за номер не может быть отрицательной',
  }),
  isGuideHotel: Joi.boolean().default(false),
  isManual: Joi.boolean().default(false),
  hotelId: Joi.string().optional(),
})

// Схема для активности
const activitySchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  duration: Joi.string().max(50).optional(),
  cost: Joi.number().min(0).precision(2).optional().messages({
    'number.base': 'Стоимость активности должна быть числом',
    'number.min': 'Стоимость активности не может быть отрицательной',
  }),
})

// Схема для дня тура
const tourDaySchema = Joi.object({
  id: Joi.string().optional(),
  dayNumber: Joi.number().integer().min(1).max(365).required(),
  date: Joi.date().iso().optional(),
  city: Joi.string().min(1).max(100).optional(),
  activities: Joi.array().items(activitySchema).default([]),
})

// Схема для дополнительной услуги
const optionalServiceSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  price: Joi.number().min(0).precision(2).optional().messages({
    'number.base': 'Стоимость услуги должна быть числом',
    'number.min': 'Стоимость услуги не может быть отрицательной',
  }),
  cost: Joi.number().min(0).precision(2).optional(), // Альтернативное поле для цены
})

// Основная схема для сметы
const estimateSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional().messages({
    'string.empty': 'Название сметы обязательно',
    'string.min': 'Название сметы должно содержать минимум 1 символ',
    'string.max': 'Название сметы не может превышать 255 символов',
  }),
  tourName: Joi.string().max(255).optional(),
  client: Joi.string().max(255).optional(),
  title: Joi.string().max(255).optional(),
  description: Joi.string().max(2000).optional(),
  country: Joi.string().max(100).optional(),
  region: Joi.string().max(100).optional(),
  startDate: Joi.date().iso().optional(),
  duration: Joi.number().integer().min(1).max(365).optional(),
  clientId: Joi.number().integer().positive().optional(),
  totalPrice: Joi.number().min(0).precision(2).optional(),
  markup: Joi.number().min(0).max(100).precision(2).optional(),
  currency: Joi.string().length(3).default('USD'),
  status: Joi.string().valid('draft', 'sent', 'approved', 'rejected').default('draft'),

  // Сложные объекты
  location: locationSchema.optional(),
  tourDates: tourDatesSchema.optional(),
  group: groupSchema.optional(),
  hotels: Joi.array().items(hotelSchema).default([]),
  tourDays: Joi.array().items(tourDaySchema).default([]),
  optionalServices: Joi.array().items(optionalServiceSchema).default([]),
})

// Схема для создания сметы
const createEstimateSchema = estimateSchema.keys({
  name: Joi.string().min(1).max(255).required(),
})

// Схема для обновления сметы (ID передается в URL, поэтому не требуется в теле)
const updateEstimateSchema = estimateSchema.fork(['name'], (schema) => schema.optional())

// Схема для клиента
const clientSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Имя клиента обязательно',
    'string.min': 'Имя клиента должно содержать минимум 1 символ',
    'string.max': 'Имя клиента не может превышать 255 символов',
  }),
  email: Joi.string().email().max(255).optional().messages({
    'string.email': 'Некорректный формат email',
  }),
  phone: Joi.string().max(20).optional(),
  company: Joi.string().max(255).optional(),
  country: Joi.string().max(100).optional(),
  segment: Joi.string().valid('new', 'regular', 'vip').default('new'),
  totalSpent: Joi.number().min(0).precision(2).default(0),
})

// Схема для поставщика
const supplierSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Название поставщика обязательно',
    'string.min': 'Название поставщика должно содержать минимум 1 символ',
    'string.max': 'Название поставщика не может превышать 255 символов',
  }),
  email: Joi.string().email().max(255).optional().messages({
    'string.email': 'Некорректный формат email',
  }),
  phone: Joi.string().max(20).optional(),
  category: Joi.string().max(100).optional(),
  country: Joi.string().max(100).optional(),
  rating: Joi.number().min(0).max(5).precision(1).default(0).messages({
    'number.min': 'Рейтинг не может быть отрицательным',
    'number.max': 'Рейтинг не может превышать 5',
  }),
  active: Joi.boolean().default(true),
})

// Схема для аутентификации
const authSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Некорректный формат email',
    'any.required': 'Email обязателен',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.min': 'Пароль должен содержать минимум 6 символов',
    'string.max': 'Пароль не может превышать 100 символов',
    'any.required': 'Пароль обязателен',
  }),
})

// Middleware для валидации
function validateInput(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    })

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }))

      return res.status(400).json({
        error: 'Validation failed',
        message: 'Ошибка валидации данных',
        details: details,
      })
    }

    // Используем очищенные данные
    req.body = value
    next()
  }
}

// Middleware для валидации параметров запроса
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    })

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }))

      return res.status(400).json({
        error: 'Validation failed',
        message: 'Ошибка валидации параметров запроса',
        details: details,
      })
    }

    req.query = value
    next()
  }
}

// Middleware для валидации параметров URL
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
    })

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value,
      }))

      return res.status(400).json({
        error: 'Validation failed',
        message: 'Ошибка валидации параметров URL',
        details: details,
      })
    }

    req.params = value
    next()
  }
}

module.exports = {
  // Схемы
  idSchema,
  paginationSchema,
  searchSchema,
  groupSchema,
  locationSchema,
  tourDatesSchema,
  hotelSchema,
  activitySchema,
  tourDaySchema,
  optionalServiceSchema,
  estimateSchema,
  createEstimateSchema,
  updateEstimateSchema,
  clientSchema,
  supplierSchema,
  authSchema,

  // Middleware
  validateInput,
  validateQuery,
  validateParams,
}

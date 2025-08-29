/**
 * Сервис для поиска авиабилетов через внешние API
 * Интеграция с Aviasales, Skyscanner и другими провайдерами
 */

import { AviasalesService } from './flightProviders/AviasalesService.js'
import { SkyscannerService } from './flightProviders/SkyscannerService.js'
import { FlightCacheService } from './FlightCacheService.js'

export class FlightSearchService {
  constructor() {
    this.aviasalesService = new AviasalesService()
    this.skyscannerService = new SkyscannerService()
    this.cacheService = new FlightCacheService()
  }

  /**
   * Поиск аэропортов по коду или названию города
   */
  async searchAirports(query) {
    try {
      // Сначала ищем в локальной базе
      const localResults = await this.searchLocalAirports(query)
      
      // Затем дополняем результатами из внешних API
      const externalResults = await Promise.allSettled([
        this.aviasalesService.searchAirports(query),
        this.skyscannerService.searchAirports(query)
      ])

      // Объединяем и дедуплицируем результаты
      const allResults = [
        ...localResults,
        ...externalResults
          .filter(result => result.status === 'fulfilled')
          .flatMap(result => result.value || [])
      ]

      return this.deduplicateAirports(allResults)
    } catch (error) {
      console.error('Ошибка поиска аэропортов:', error)
      // Fallback к локальным данным
      return await this.searchLocalAirports(query)
    }
  }

  /**
   * Поиск авиабилетов
   */
  async searchFlights(request) {
    try {
      // Проверяем кэш
      const cacheKey = this.generateCacheKey(request)
      const cachedResults = await this.cacheService.get(cacheKey)
      
      if (cachedResults) {
        console.log('Найдены кэшированные результаты поиска')
        return cachedResults
      }

      // Параллельный поиск через все провайдеры
      const searchPromises = [
        this.aviasalesService.searchFlights(request),
        this.skyscannerService.searchFlights(request)
      ]

      const results = await Promise.allSettled(searchPromises)
      
      // Объединяем результаты
      const allFlights = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value || [])

      // Сортируем по цене и времени
      const sortedFlights = this.sortFlightResults(allFlights)

      // Кэшируем результаты
      await this.cacheService.set(cacheKey, sortedFlights)

      return sortedFlights
    } catch (error) {
      console.error('Ошибка поиска авиабилетов:', error)
      throw new Error('Не удалось найти авиабилеты. Попробуйте позже.')
    }
  }

  /**
   * Поиск мульти-сегментных перелетов
   */
  async searchMultiSegmentFlights(request) {
    try {
      // Валидация сегментов
      this.validateMultiSegmentRequest(request)

      // Поиск для каждого сегмента
      const segmentResults = await Promise.all(
        request.segments.map(segment => 
          this.searchFlights({
            origin: segment.origin,
            destination: segment.destination,
            departureDate: segment.departureDate,
            passengers: request.passengers,
            class: request.class
          })
        )
      )

      // Комбинируем результаты сегментов
      return this.combineSegmentResults(segmentResults, request)
    } catch (error) {
      console.error('Ошибка поиска мульти-сегментных перелетов:', error)
      throw error
    }
  }

  /**
   * Поиск в локальной базе аэропортов
   */
  async searchLocalAirports(query) {
    const airports = [
      // Россия
      { code: 'SVO', name: 'Шереметьево', city: 'Москва', country: 'Россия', timezone: 'Europe/Moscow' },
      { code: 'DME', name: 'Домодедово', city: 'Москва', country: 'Россия', timezone: 'Europe/Moscow' },
      { code: 'VKO', name: 'Внуково', city: 'Москва', country: 'Россия', timezone: 'Europe/Moscow' },
      { code: 'LED', name: 'Пулково', city: 'Санкт-Петербург', country: 'Россия', timezone: 'Europe/Moscow' },
      
      // Аргентина
      { code: 'EZE', name: 'Эсейса', city: 'Буэнос-Айрес', country: 'Аргентина', timezone: 'America/Argentina/Buenos_Aires' },
      { code: 'AEP', name: 'Хорхе Ньюбери', city: 'Буэнос-Айрес', country: 'Аргентина', timezone: 'America/Argentina/Buenos_Aires' },
      { code: 'MDZ', name: 'Эль-Плумерильо', city: 'Мендоса', country: 'Аргентина', timezone: 'America/Argentina/Mendoza' },
      { code: 'USH', name: 'Мальвинас Аргентинас', city: 'Ушуайя', country: 'Аргентина', timezone: 'America/Argentina/Ushuaia' },
      
      // Бразилия
      { code: 'GRU', name: 'Гуарульюс', city: 'Сан-Паулу', country: 'Бразилия', timezone: 'America/Sao_Paulo' },
      { code: 'GIG', name: 'Галеан', city: 'Рио-де-Жанейро', country: 'Бразилия', timezone: 'America/Sao_Paulo' },
      
      // Чили
      { code: 'SCL', name: 'Артуро Мерино Бенитес', city: 'Сантьяго', country: 'Чили', timezone: 'America/Santiago' },
      
      // Перу
      { code: 'LIM', name: 'Хорхе Чавес', city: 'Лима', country: 'Перу', timezone: 'America/Lima' },
      
      // Европа
      { code: 'CDG', name: 'Шарль де Голль', city: 'Париж', country: 'Франция', timezone: 'Europe/Paris' },
      { code: 'LHR', name: 'Хитроу', city: 'Лондон', country: 'Великобритания', timezone: 'Europe/London' },
      { code: 'FRA', name: 'Франкфурт', city: 'Франкфурт', country: 'Германия', timezone: 'Europe/Berlin' },
      { code: 'AMS', name: 'Схипхол', city: 'Амстердам', country: 'Нидерланды', timezone: 'Europe/Amsterdam' },
      
      // США
      { code: 'JFK', name: 'Джон Кеннеди', city: 'Нью-Йорк', country: 'США', timezone: 'America/New_York' },
      { code: 'LAX', name: 'Лос-Анджелес', city: 'Лос-Анджелес', country: 'США', timezone: 'America/Los_Angeles' },
      { code: 'ORD', name: 'О\'Хара', city: 'Чикаго', country: 'США', timezone: 'America/Chicago' },
      
      // Азия
      { code: 'NRT', name: 'Нарита', city: 'Токио', country: 'Япония', timezone: 'Asia/Tokyo' },
      { code: 'PEK', name: 'Столичный', city: 'Пекин', country: 'Китай', timezone: 'Asia/Shanghai' },
      { code: 'SIN', name: 'Чанги', city: 'Сингапур', country: 'Сингапур', timezone: 'Asia/Singapore' }
    ]

    const normalizedQuery = query.toLowerCase().trim()
    
    return airports.filter(airport => 
      airport.code.toLowerCase().includes(normalizedQuery) ||
      airport.city.toLowerCase().includes(normalizedQuery) ||
      airport.name.toLowerCase().includes(normalizedQuery) ||
      airport.country.toLowerCase().includes(normalizedQuery)
    )
  }

  /**
   * Дедупликация результатов аэропортов
   */
  deduplicateAirports(airports) {
    const seen = new Set()
    return airports.filter(airport => {
      const key = `${airport.code}-${airport.city}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    }).sort((a, b) => {
      // Сортируем по релевантности: точное совпадение кода -> город -> страна
      const aCode = a.code.toLowerCase()
      const bCode = b.code.toLowerCase()
      const query = this.lastSearchQuery?.toLowerCase() || ''
      
      if (aCode === query && bCode !== query) return -1
      if (bCode === query && aCode !== query) return 1
      
      return a.city.localeCompare(b.city)
    })
  }

  /**
   * Сортировка результатов поиска авиабилетов
   */
  sortFlightResults(flights) {
    return flights.sort((a, b) => {
      // Сначала по цене
      if (a.totalPrice !== b.totalPrice) {
        return a.totalPrice - b.totalPrice
      }
      
      // Затем по времени в пути
      if (a.duration !== b.duration) {
        return a.duration - b.duration
      }
      
      // Затем по количеству пересадок
      return a.stops - b.stops
    })
  }

  /**
   * Комбинирование результатов мульти-сегментного поиска
   */
  combineSegmentResults(segmentResults, request) {
    // Простая комбинация: берем лучший вариант для каждого сегмента
    const combinedFlights = segmentResults.map((segmentFlights, index) => {
      if (!segmentFlights || segmentFlights.length === 0) {
        throw new Error(`Не найдены варианты для сегмента ${index + 1}`)
      }
      
      // Берем лучший вариант (первый после сортировки)
      return {
        segmentIndex: index,
        ...segmentFlights[0]
      }
    })

    // Рассчитываем общую стоимость
    const totalPrice = combinedFlights.reduce((sum, flight) => sum + flight.totalPrice, 0)
    const totalDuration = combinedFlights.reduce((sum, flight) => sum + flight.duration, 0)
    const totalStops = combinedFlights.reduce((sum, flight) => sum + flight.stops, 0)

    return {
      id: `multi_${Date.now()}`,
      type: 'MULTI_SEGMENT',
      segments: combinedFlights,
      totalPrice,
      totalDuration,
      totalStops,
      currency: combinedFlights[0]?.currency || 'USD',
      validUntil: this.getEarliestValidUntil(combinedFlights)
    }
  }

  /**
   * Валидация мульти-сегментного запроса
   */
  validateMultiSegmentRequest(request) {
    if (!request.segments || request.segments.length < 2) {
      throw new Error('Мульти-сегментный маршрут должен содержать минимум 2 сегмента')
    }

    if (request.segments.length > 10) {
      throw new Error('Максимальное количество сегментов: 10')
    }

    // Проверяем логичность маршрута
    for (let i = 0; i < request.segments.length - 1; i++) {
      const current = request.segments[i]
      const next = request.segments[i + 1]
      
      if (current.destination !== next.origin) {
        throw new Error(`Сегмент ${i + 1} должен начинаться там, где заканчивается сегмент ${i + 2}`)
      }
    }

    // Проверяем даты
    for (let i = 0; i < request.segments.length - 1; i++) {
      const currentDate = new Date(request.segments[i].departureDate)
      const nextDate = new Date(request.segments[i + 1].departureDate)
      
      if (currentDate >= nextDate) {
        throw new Error(`Дата сегмента ${i + 2} должна быть позже даты сегмента ${i + 1}`)
      }
    }
  }

  /**
   * Генерация ключа кэша для запроса
   */
  generateCacheKey(request) {
    const keyData = {
      origin: request.origin,
      destination: request.destination,
      departureDate: request.departureDate,
      returnDate: request.returnDate,
      passengers: request.passengers,
      class: request.class
    }
    
    return `flight_search_${btoa(JSON.stringify(keyData))}`
  }

  /**
   * Получение самого раннего времени истечения срока действия
   */
  getEarliestValidUntil(flights) {
    const validUntils = flights
      .map(flight => flight.validUntil)
      .filter(Boolean)
      .map(date => new Date(date))
    
    if (validUntils.length === 0) {
      return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 часа по умолчанию
    }
    
    return new Date(Math.min(...validUntils)).toISOString()
  }

  /**
   * Валидация IATA кода аэропорта
   */
  validateIATACode(code) {
    if (!code || typeof code !== 'string') {
      return false
    }
    
    const iataPattern = /^[A-Z]{3}$/
    return iataPattern.test(code)
  }

  /**
   * Валидация даты
   */
  validateDate(dateString) {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return date >= today
  }
}

// Экспортируем singleton instance
export const flightSearchService = new FlightSearchService()

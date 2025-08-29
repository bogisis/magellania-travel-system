/**
 * Сервис для работы с Aviasales API
 * Поиск авиабилетов и аэропортов
 */

export class AviasalesService {
  constructor() {
    this.apiKey = process.env.VITE_AVIASALES_API_KEY || 'demo_key'
    this.baseUrl = 'https://api.aviasales.ru'
    this.isEnabled = this.apiKey !== 'demo_key'
  }

  /**
   * Поиск аэропортов через Aviasales API
   */
  async searchAirports(query) {
    if (!this.isEnabled) {
      console.log('Aviasales API отключен (используется demo режим)')
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/places.json?term=${encodeURIComponent(query)}&locale=ru&types[]=airport`)
      
      if (!response.ok) {
        throw new Error(`Aviasales API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.map(airport => ({
        code: airport.code,
        name: airport.name,
        city: airport.city_name,
        country: airport.country_name,
        timezone: airport.time_zone || 'UTC'
      }))
    } catch (error) {
      console.error('Ошибка поиска аэропортов в Aviasales:', error)
      return []
    }
  }

  /**
   * Поиск авиабилетов через Aviasales API
   */
  async searchFlights(request) {
    if (!this.isEnabled) {
      console.log('Aviasales API отключен, возвращаем демо данные')
      return this.getDemoFlights(request)
    }

    try {
      // Формируем параметры запроса
      const params = new URLSearchParams({
        origin: request.origin,
        destination: request.destination,
        depart_date: request.departureDate,
        passengers: request.passengers || 1,
        class: request.class || 'economy',
        currency: 'rub',
        token: this.apiKey
      })

      if (request.returnDate) {
        params.append('return_date', request.returnDate)
      }

      const response = await fetch(`${this.baseUrl}/v3/prices_for_dates?${params}`)
      
      if (!response.ok) {
        throw new Error(`Aviasales API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(`Aviasales API error: ${data.error || 'Unknown error'}`)
      }

      return this.transformAviasalesResponse(data, request)
    } catch (error) {
      console.error('Ошибка поиска авиабилетов в Aviasales:', error)
      // Fallback к демо данным
      return this.getDemoFlights(request)
    }
  }

  /**
   * Трансформация ответа Aviasales в стандартный формат
   */
  transformAviasalesResponse(data, request) {
    const flights = []

    // Обрабатываем данные о рейсах
    if (data.data && typeof data.data === 'object') {
      Object.values(data.data).forEach(flightData => {
        if (Array.isArray(flightData)) {
          flightData.forEach(flight => {
            flights.push({
              id: `aviasales_${flight.flight_number}_${flight.departure_at}`,
              provider: 'aviasales',
              airline: flight.airline,
              flightNumber: flight.flight_number,
              totalPrice: flight.price,
              currency: 'RUB',
              duration: this.calculateDuration(flight.departure_at, flight.return_at),
              stops: flight.transfers || 0,
              segments: [{
                origin: {
                  code: flight.origin,
                  name: flight.origin_airport || flight.origin,
                  city: flight.origin_city || flight.origin,
                  country: flight.origin_country || ''
                },
                destination: {
                  code: flight.destination,
                  name: flight.destination_airport || flight.destination,
                  city: flight.destination_city || flight.destination,
                  country: flight.destination_country || ''
                },
                departureTime: flight.departure_at,
                arrivalTime: flight.return_at,
                airline: flight.airline,
                flightNumber: flight.flight_number
              }],
              validUntil: this.calculateValidUntil(),
              cabinClass: request.class || 'economy'
            })
          })
        }
      })
    }

    return flights
  }

  /**
   * Демо данные для тестирования
   */
  getDemoFlights(request) {
    const basePrice = this.getDemoPrice(request.origin, request.destination)
    const duration = this.getDemoDuration(request.origin, request.destination)
    
    return [
      {
        id: `demo_1_${Date.now()}`,
        provider: 'aviasales_demo',
        airline: 'Aeroflot',
        flightNumber: 'SU123',
        totalPrice: basePrice,
        currency: 'RUB',
        duration: duration,
        stops: 0,
        segments: [{
          origin: {
            code: request.origin,
            name: this.getAirportName(request.origin),
            city: this.getAirportCity(request.origin),
            country: this.getAirportCountry(request.origin)
          },
          destination: {
            code: request.destination,
            name: this.getAirportName(request.destination),
            city: this.getAirportCity(request.destination),
            country: this.getAirportCountry(request.destination)
          },
          departureTime: `${request.departureDate}T10:00:00`,
          arrivalTime: `${request.departureDate}T${10 + Math.floor(duration / 60)}:${duration % 60}:00`,
          airline: 'Aeroflot',
          flightNumber: 'SU123'
        }],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        cabinClass: request.class || 'economy'
      },
      {
        id: `demo_2_${Date.now()}`,
        provider: 'aviasales_demo',
        airline: 'S7 Airlines',
        flightNumber: 'S7-456',
        totalPrice: basePrice * 1.2,
        currency: 'RUB',
        duration: duration + 60,
        stops: 1,
        segments: [{
          origin: {
            code: request.origin,
            name: this.getAirportName(request.origin),
            city: this.getAirportCity(request.origin),
            country: this.getAirportCountry(request.origin)
          },
          destination: {
            code: request.destination,
            name: this.getAirportName(request.destination),
            city: this.getAirportCity(request.destination),
            country: this.getAirportCountry(request.destination)
          },
          departureTime: `${request.departureDate}T14:00:00`,
          arrivalTime: `${request.departureDate}T${14 + Math.floor((duration + 60) / 60)}:${(duration + 60) % 60}:00`,
          airline: 'S7 Airlines',
          flightNumber: 'S7-456'
        }],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        cabinClass: request.class || 'economy'
      }
    ]
  }

  /**
   * Получение демо цены на основе маршрута
   */
  getDemoPrice(origin, destination) {
    const routes = {
      'SVO-EZE': 45000,
      'SVO-MDZ': 52000,
      'SVO-GRU': 48000,
      'SVO-SCL': 50000,
      'SVO-LIM': 47000,
      'SVO-JFK': 35000,
      'SVO-CDG': 25000,
      'SVO-LHR': 28000,
      'EZE-MDZ': 8000,
      'EZE-USH': 15000,
      'GRU-GIG': 5000
    }

    const route = `${origin}-${destination}`
    return routes[route] || 30000
  }

  /**
   * Получение демо времени полета
   */
  getDemoDuration(origin, destination) {
    const routes = {
      'SVO-EZE': 900, // 15 часов
      'SVO-MDZ': 960, // 16 часов
      'SVO-GRU': 840, // 14 часов
      'SVO-SCL': 900, // 15 часов
      'SVO-LIM': 870, // 14.5 часов
      'SVO-JFK': 600, // 10 часов
      'SVO-CDG': 240, // 4 часа
      'SVO-LHR': 270, // 4.5 часа
      'EZE-MDZ': 90,  // 1.5 часа
      'EZE-USH': 240, // 4 часа
      'GRU-GIG': 60   // 1 час
    }

    const route = `${origin}-${destination}`
    return routes[route] || 300
  }

  /**
   * Получение названия аэропорта
   */
  getAirportName(code) {
    const airports = {
      'SVO': 'Шереметьево',
      'DME': 'Домодедово',
      'VKO': 'Внуково',
      'LED': 'Пулково',
      'EZE': 'Эсейса',
      'AEP': 'Хорхе Ньюбери',
      'MDZ': 'Эль-Плумерильо',
      'USH': 'Мальвинас Аргентинас',
      'GRU': 'Гуарульюс',
      'GIG': 'Галеан',
      'SCL': 'Артуро Мерино Бенитес',
      'LIM': 'Хорхе Чавес',
      'JFK': 'Джон Кеннеди',
      'CDG': 'Шарль де Голль',
      'LHR': 'Хитроу'
    }
    return airports[code] || code
  }

  /**
   * Получение города аэропорта
   */
  getAirportCity(code) {
    const cities = {
      'SVO': 'Москва',
      'DME': 'Москва',
      'VKO': 'Москва',
      'LED': 'Санкт-Петербург',
      'EZE': 'Буэнос-Айрес',
      'AEP': 'Буэнос-Айрес',
      'MDZ': 'Мендоса',
      'USH': 'Ушуайя',
      'GRU': 'Сан-Паулу',
      'GIG': 'Рио-де-Жанейро',
      'SCL': 'Сантьяго',
      'LIM': 'Лима',
      'JFK': 'Нью-Йорк',
      'CDG': 'Париж',
      'LHR': 'Лондон'
    }
    return cities[code] || code
  }

  /**
   * Получение страны аэропорта
   */
  getAirportCountry(code) {
    const countries = {
      'SVO': 'Россия',
      'DME': 'Россия',
      'VKO': 'Россия',
      'LED': 'Россия',
      'EZE': 'Аргентина',
      'AEP': 'Аргентина',
      'MDZ': 'Аргентина',
      'USH': 'Аргентина',
      'GRU': 'Бразилия',
      'GIG': 'Бразилия',
      'SCL': 'Чили',
      'LIM': 'Перу',
      'JFK': 'США',
      'CDG': 'Франция',
      'LHR': 'Великобритания'
    }
    return countries[code] || 'Неизвестно'
  }

  /**
   * Расчет длительности полета в минутах
   */
  calculateDuration(departureTime, arrivalTime) {
    const departure = new Date(departureTime)
    const arrival = new Date(arrivalTime)
    return Math.round((arrival - departure) / (1000 * 60))
  }

  /**
   * Расчет времени истечения срока действия цены
   */
  calculateValidUntil() {
    // Цены обычно действительны 24 часа
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }

  /**
   * Проверка доступности API
   */
  async checkHealth() {
    if (!this.isEnabled) {
      return { status: 'demo', message: 'API в демо режиме' }
    }

    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })
      
      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        message: response.ok ? 'API доступен' : 'API недоступен'
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Ошибка подключения: ${error.message}`
      }
    }
  }
}

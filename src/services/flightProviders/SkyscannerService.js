/**
 * Сервис для работы с Skyscanner API
 * Поиск авиабилетов и аэропортов
 */

export class SkyscannerService {
  constructor() {
    this.apiKey = process.env.VITE_SKYSCANNER_API_KEY || 'demo_key'
    this.baseUrl = 'https://partners.api.skyscanner.net'
    this.isEnabled = this.apiKey !== 'demo_key'
  }

  /**
   * Поиск аэропортов через Skyscanner API
   */
  async searchAirports(query) {
    if (!this.isEnabled) {
      console.log('Skyscanner API отключен (используется demo режим)')
      return []
    }

    try {
      const response = await fetch(`${this.baseUrl}/apiservices/v3/autosuggest/flights/en-GB?query=${encodeURIComponent(query)}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      })
      
      if (!response.ok) {
        throw new Error(`Skyscanner API error: ${response.status}`)
      }

      const data = await response.json()
      
      return data.Places
        .filter(place => place.Type === 'Airport')
        .map(airport => ({
          code: airport.PlaceId,
          name: airport.Name,
          city: airport.CityName,
          country: airport.CountryName,
          timezone: airport.TimeZone || 'UTC'
        }))
    } catch (error) {
      console.error('Ошибка поиска аэропортов в Skyscanner:', error)
      return []
    }
  }

  /**
   * Поиск авиабилетов через Skyscanner API
   */
  async searchFlights(request) {
    if (!this.isEnabled) {
      console.log('Skyscanner API отключен, возвращаем демо данные')
      return this.getDemoFlights(request)
    }

    try {
      // Сначала получаем session token
      const sessionToken = await this.createSearchSession(request)
      
      // Затем получаем результаты поиска
      const results = await this.pollSearchResults(sessionToken)
      
      return this.transformSkyscannerResponse(results, request)
    } catch (error) {
      console.error('Ошибка поиска авиабилетов в Skyscanner:', error)
      // Fallback к демо данным
      return this.getDemoFlights(request)
    }
  }

  /**
   * Создание сессии поиска
   */
  async createSearchSession(request) {
    const params = new URLSearchParams({
      originSkyId: request.origin,
      destinationSkyId: request.destination,
      date: request.departureDate,
      adults: request.passengers || 1,
      cabinClass: request.class || 'economy',
      currency: 'USD',
      locale: 'en-GB'
    })

    if (request.returnDate) {
      params.append('returnDate', request.returnDate)
    }

    const response = await fetch(`${this.baseUrl}/apiservices/v3/flights/live/search/create`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    })

    if (!response.ok) {
      throw new Error(`Skyscanner session creation error: ${response.status}`)
    }

    const data = await response.json()
    return data.sessionToken
  }

  /**
   * Получение результатов поиска
   */
  async pollSearchResults(sessionToken) {
    const maxAttempts = 10
    let attempts = 0

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseUrl}/apiservices/v3/flights/live/search/poll/${sessionToken}`, {
        headers: {
          'x-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Skyscanner poll error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.Status === 'Complete') {
        return data
      }

      if (data.Status === 'Failed') {
        throw new Error('Skyscanner search failed')
      }

      // Ждем перед следующей попыткой
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }

    throw new Error('Skyscanner search timeout')
  }

  /**
   * Трансформация ответа Skyscanner в стандартный формат
   */
  transformSkyscannerResponse(data, request) {
    const flights = []

    if (data.Itineraries && data.Itineraries.length > 0) {
      data.Itineraries.forEach(itinerary => {
        const pricingOption = itinerary.PricingOptions[0]
        const agent = data.Agents.find(a => a.Id === pricingOption.Agents[0])
        
        flights.push({
          id: `skyscanner_${itinerary.OutboundLegId}_${Date.now()}`,
          provider: 'skyscanner',
          airline: this.getAirlineName(itinerary.OutboundLegId, data),
          flightNumber: this.getFlightNumber(itinerary.OutboundLegId, data),
          totalPrice: pricingOption.Price,
          currency: 'USD',
          duration: this.calculateDuration(itinerary.OutboundLegId, data),
          stops: this.calculateStops(itinerary.OutboundLegId, data),
          segments: this.buildSegments(itinerary.OutboundLegId, data, request),
          validUntil: this.calculateValidUntil(),
          cabinClass: request.class || 'economy'
        })
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
        id: `skyscanner_demo_1_${Date.now()}`,
        provider: 'skyscanner_demo',
        airline: 'British Airways',
        flightNumber: 'BA789',
        totalPrice: basePrice * 0.8, // Skyscanner обычно дешевле
        currency: 'USD',
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
          departureTime: `${request.departureDate}T08:00:00`,
          arrivalTime: `${request.departureDate}T${8 + Math.floor(duration / 60)}:${duration % 60}:00`,
          airline: 'British Airways',
          flightNumber: 'BA789'
        }],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        cabinClass: request.class || 'economy'
      },
      {
        id: `skyscanner_demo_2_${Date.now()}`,
        provider: 'skyscanner_demo',
        airline: 'Lufthansa',
        flightNumber: 'LH456',
        totalPrice: basePrice * 0.9,
        currency: 'USD',
        duration: duration + 30,
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
          departureTime: `${request.departureDate}T12:00:00`,
          arrivalTime: `${request.departureDate}T${12 + Math.floor((duration + 30) / 60)}:${(duration + 30) % 60}:00`,
          airline: 'Lufthansa',
          flightNumber: 'LH456'
        }],
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        cabinClass: request.class || 'economy'
      }
    ]
  }

  /**
   * Получение демо цены на основе маршрута (в USD)
   */
  getDemoPrice(origin, destination) {
    const routes = {
      'SVO-EZE': 650,
      'SVO-MDZ': 750,
      'SVO-GRU': 700,
      'SVO-SCL': 720,
      'SVO-LIM': 680,
      'SVO-JFK': 500,
      'SVO-CDG': 350,
      'SVO-LHR': 380,
      'EZE-MDZ': 120,
      'EZE-USH': 220,
      'GRU-GIG': 80
    }

    const route = `${origin}-${destination}`
    return routes[route] || 450
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
      'SVO': 'Sheremetyevo',
      'DME': 'Domodedovo',
      'VKO': 'Vnukovo',
      'LED': 'Pulkovo',
      'EZE': 'Ezeiza',
      'AEP': 'Jorge Newbery',
      'MDZ': 'El Plumerillo',
      'USH': 'Malvinas Argentinas',
      'GRU': 'Guarulhos',
      'GIG': 'Galeao',
      'SCL': 'Arturo Merino Benitez',
      'LIM': 'Jorge Chavez',
      'JFK': 'John F. Kennedy',
      'CDG': 'Charles de Gaulle',
      'LHR': 'Heathrow'
    }
    return airports[code] || code
  }

  /**
   * Получение города аэропорта
   */
  getAirportCity(code) {
    const cities = {
      'SVO': 'Moscow',
      'DME': 'Moscow',
      'VKO': 'Moscow',
      'LED': 'Saint Petersburg',
      'EZE': 'Buenos Aires',
      'AEP': 'Buenos Aires',
      'MDZ': 'Mendoza',
      'USH': 'Ushuaia',
      'GRU': 'Sao Paulo',
      'GIG': 'Rio de Janeiro',
      'SCL': 'Santiago',
      'LIM': 'Lima',
      'JFK': 'New York',
      'CDG': 'Paris',
      'LHR': 'London'
    }
    return cities[code] || code
  }

  /**
   * Получение страны аэропорта
   */
  getAirportCountry(code) {
    const countries = {
      'SVO': 'Russia',
      'DME': 'Russia',
      'VKO': 'Russia',
      'LED': 'Russia',
      'EZE': 'Argentina',
      'AEP': 'Argentina',
      'MDZ': 'Argentina',
      'USH': 'Argentina',
      'GRU': 'Brazil',
      'GIG': 'Brazil',
      'SCL': 'Chile',
      'LIM': 'Peru',
      'JFK': 'United States',
      'CDG': 'France',
      'LHR': 'United Kingdom'
    }
    return countries[code] || 'Unknown'
  }

  /**
   * Получение названия авиакомпании
   */
  getAirlineName(legId, data) {
    const leg = data.Legs.find(l => l.Id === legId)
    if (leg && leg.Carriers && leg.Carriers.length > 0) {
      const carrier = data.Carriers.find(c => c.Id === leg.Carriers[0])
      return carrier ? carrier.Name : 'Unknown'
    }
    return 'Unknown'
  }

  /**
   * Получение номера рейса
   */
  getFlightNumber(legId, data) {
    const leg = data.Legs.find(l => l.Id === legId)
    if (leg && leg.Carriers && leg.Carriers.length > 0) {
      return `${leg.Carriers[0]}-${leg.FlightNumbers?.[0] || '001'}`
    }
    return 'Unknown'
  }

  /**
   * Расчет длительности полета
   */
  calculateDuration(legId, data) {
    const leg = data.Legs.find(l => l.Id === legId)
    if (leg) {
      const departure = new Date(leg.Departure)
      const arrival = new Date(leg.Arrival)
      return Math.round((arrival - departure) / (1000 * 60))
    }
    return 0
  }

  /**
   * Расчет количества пересадок
   */
  calculateStops(legId, data) {
    const leg = data.Legs.find(l => l.Id === legId)
    return leg ? (leg.Stops || 0) : 0
  }

  /**
   * Построение сегментов полета
   */
  buildSegments(legId, data, request) {
    const leg = data.Legs.find(l => l.Id === legId)
    if (!leg) return []

    return [{
      origin: {
        code: leg.OriginStation,
        name: this.getAirportName(leg.OriginStation),
        city: this.getAirportCity(leg.OriginStation),
        country: this.getAirportCountry(leg.OriginStation)
      },
      destination: {
        code: leg.DestinationStation,
        name: this.getAirportName(leg.DestinationStation),
        city: this.getAirportCity(leg.DestinationStation),
        country: this.getAirportCountry(leg.DestinationStation)
      },
      departureTime: leg.Departure,
      arrivalTime: leg.Arrival,
      airline: this.getAirlineName(legId, data),
      flightNumber: this.getFlightNumber(legId, data)
    }]
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
      const response = await fetch(`${this.baseUrl}/apiservices/v3/flights/live/search/create`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'originSkyId=SVO&destinationSkyId=EZE&date=2024-12-01&adults=1'
      })
      
      return {
        status: response.status === 400 ? 'healthy' : 'unhealthy', // 400 означает, что API работает, но параметры неверные
        message: response.status === 400 ? 'API доступен' : 'API недоступен'
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Ошибка подключения: ${error.message}`
      }
    }
  }
}

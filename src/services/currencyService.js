// Сервис для работы с курсами валют
class CurrencyService {
  constructor() {
    this.exchangeRates = {
      USD: 1,
      EUR: 0.92,
      ARS: 0.0012, // Реальный курс: 1 USD = ~850 ARS (2025)
      CLP: 0.0012, // Реальный курс: 1 USD = ~850 CLP (2025)
    }

    this.lastUpdate = null
    this.updateInterval = 1000 * 60 * 60 // 1 час
  }

  // Получение курса валюты
  async getExchangeRate(fromCurrency, toCurrency = 'USD') {
    if (fromCurrency === toCurrency) return 1

    // Проверяем, нужно ли обновить курсы
    if (this.shouldUpdateRates()) {
      await this.updateExchangeRates()
    }

    const fromRate = this.exchangeRates[fromCurrency] || 1
    const toRate = this.exchangeRates[toCurrency] || 1

    return toRate / fromRate
  }

  // Конвертация суммы
  async convertAmount(amount, fromCurrency, toCurrency = 'USD') {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency)
    return amount * rate
  }

  // Форматирование валюты
  formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    const options = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }

    // Специальная обработка для ARS (Аргентинский песо)
    if (currency === 'ARS') {
      options.minimumFractionDigits = 0
      options.maximumFractionDigits = 0
    }

    return new Intl.NumberFormat(locale, options).format(amount || 0)
  }

  // Проверка необходимости обновления курсов
  shouldUpdateRates() {
    if (!this.lastUpdate) return true

    const now = Date.now()
    return now - this.lastUpdate > this.updateInterval
  }

  // Обновление курсов валют
  async updateExchangeRates() {
    try {
      // Пытаемся получить реальные курсы с API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')

      if (response.ok) {
        const data = await response.json()

        this.exchangeRates = {
          USD: 1,
          EUR: data.rates.EUR || 0.92,
          ARS: data.rates.ARS || 0.0012,
          CLP: data.rates.CLP || 0.0012,
        }

        this.lastUpdate = Date.now()
        console.log('Курсы валют обновлены с API:', this.exchangeRates)
      } else {
        // Fallback на статические курсы
        this.exchangeRates = {
          USD: 1,
          EUR: 0.92,
          ARS: 0.0012, // 1 USD = ~850 ARS
          CLP: 0.0012, // 1 USD = ~850 CLP
        }
        console.log('Используем статические курсы валют')
      }
    } catch (error) {
      console.error('Ошибка обновления курсов валют:', error)
      // В случае ошибки используем последние известные курсы
    }
  }

  // Получение всех доступных валют
  getAvailableCurrencies() {
    return [
      { code: 'USD', name: 'Доллар США', symbol: '$' },
      { code: 'EUR', name: 'Евро', symbol: '€' },
      { code: 'ARS', name: 'Аргентинский песо', symbol: '$' },
      { code: 'CLP', name: 'Чилийский песо', symbol: '$' },
    ]
  }

  // Получение информации о валюте
  getCurrencyInfo(currencyCode) {
    const currencies = this.getAvailableCurrencies()
    return currencies.find((c) => c.code === currencyCode)
  }

  // Расчет общей стоимости в разных валютах
  async calculateTotalInCurrencies(items, targetCurrency = 'USD') {
    const totals = {}

    for (const currency of Object.keys(this.exchangeRates)) {
      let total = 0

      for (const item of items) {
        if (item.currency === currency) {
          total += item.amount || 0
        } else {
          // Конвертируем в целевую валюту
          const converted = await this.convertAmount(item.amount || 0, item.currency, currency)
          total += converted
        }
      }

      totals[currency] = total
    }

    return totals
  }

  // Получение курса "blue rate" для Аргентины
  async getBlueRate() {
    try {
      // Пытаемся получить blue rate с API
      const response = await fetch('https://api.bluelytics.com.ar/v2/latest')

      if (response.ok) {
        const data = await response.json()
        return data.blue.value_sell || this.exchangeRates.ARS
      } else {
        // Fallback на обычный курс
        return this.exchangeRates.ARS
      }
    } catch (error) {
      console.error('Ошибка получения blue rate:', error)
      return this.exchangeRates.ARS
    }
  }

  // Обновление blue rate
  async updateBlueRate() {
    try {
      const blueRate = await this.getBlueRate()
      this.exchangeRates.ARS = blueRate
      console.log('Blue rate обновлен:', blueRate)
      return blueRate
    } catch (error) {
      console.error('Ошибка обновления blue rate:', error)
      return this.exchangeRates.ARS
    }
  }
}

// Создаем единственный экземпляр сервиса
const currencyService = new CurrencyService()

export default currencyService

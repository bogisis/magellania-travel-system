import { describe, it, expect, beforeEach, vi } from 'vitest'
import currencyService from '@/services/currencyService'

describe('CurrencyService', () => {
  beforeEach(() => {
    // Сбрасываем состояние сервиса перед каждым тестом
    currencyService.exchangeRates = {
      USD: 1,
      EUR: 0.85,
      ARS: 350,
      CLP: 850,
    }
    currencyService.lastUpdate = null
  })

  it('initializes with default exchange rates', () => {
    expect(currencyService.exchangeRates.USD).toBe(1)
    expect(currencyService.exchangeRates.EUR).toBe(0.85)
    expect(currencyService.exchangeRates.ARS).toBe(350)
    expect(currencyService.exchangeRates.CLP).toBe(850)
  })

  it('gets exchange rate for valid currencies', async () => {
    const rate = await currencyService.getExchangeRate('EUR', 'USD')
    expect(rate).toBeGreaterThan(0)
    expect(typeof rate).toBe('number')
  })

  it('returns 1 for same currency conversion', async () => {
    const rate = await currencyService.getExchangeRate('USD', 'USD')
    expect(rate).toBe(1)
  })

  it('converts amount between currencies', async () => {
    const converted = await currencyService.convertAmount(100, 'USD', 'EUR')
    expect(converted).toBeGreaterThan(80)
    expect(converted).toBeLessThan(90)
  })

  it('formats currency correctly', () => {
    const formatted = currencyService.formatCurrency(1234.56, 'USD', 'en-US')
    expect(formatted).toBe('$1,234.56')
  })

  it('formats ARS currency correctly', () => {
    const formatted = currencyService.formatCurrency(1234.56, 'ARS', 'es-AR')
    expect(formatted).toContain('$')
  })

  it('gets available currencies', () => {
    const currencies = currencyService.getAvailableCurrencies()
    expect(currencies).toHaveLength(4)
    expect(currencies[0]).toHaveProperty('code')
    expect(currencies[0]).toHaveProperty('name')
  })

  it('gets currency info', () => {
    const info = currencyService.getCurrencyInfo('USD')
    expect(info).toBeDefined()
    expect(info.code).toBe('USD')
  })

  it('calculates total in multiple currencies', async () => {
    const items = [
      { amount: 100, currency: 'USD' },
      { amount: 50, currency: 'EUR' },
    ]

    const total = await currencyService.calculateTotalInCurrencies(items, 'USD')
    expect(total).toHaveProperty('USD')
    expect(total).toHaveProperty('EUR')
  })

  it('gets blue rate for ARS', async () => {
    const blueRate = await currencyService.getBlueRate()
    expect(blueRate).toBe(350)
  })

  it('updates exchange rates', async () => {
    // Мокаем fetch для обновления курсов
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          rates: {
            EUR: 0.9,
            ARS: 400,
            CLP: 900,
          },
        }),
    })

    await currencyService.updateExchangeRates()

    expect(currencyService.exchangeRates.EUR).toBeGreaterThan(0.8)
    expect(currencyService.exchangeRates.EUR).toBeLessThan(1.0)
    expect(currencyService.exchangeRates.ARS).toBeGreaterThan(300)
    expect(currencyService.lastUpdate).toBeDefined()
  })

  it('handles update errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await currencyService.updateExchangeRates()

    // Должен сохранить старые курсы при ошибке
    expect(currencyService.exchangeRates.USD).toBe(1)
  })

  it('should update rates when needed', () => {
    currencyService.lastUpdate = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 часа назад
    expect(currencyService.shouldUpdateRates()).toBe(true)
  })

  it('should not update rates when recent', () => {
    currencyService.lastUpdate = new Date()
    expect(currencyService.shouldUpdateRates()).toBe(false)
  })
})

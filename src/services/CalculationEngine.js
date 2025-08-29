/**
 * CalculationEngine - Advanced mathematical calculation engine for MAGELLANIA estimates
 *
 * This engine implements sophisticated pricing models based on analysis of real-world estimates
 * with mathematical precision to 2 decimal places and comprehensive validation.
 *
 * @author MAGELLANIA Development Team
 * @version 1.0.0
 */

import { CalculationError, ValidationError } from './errors/CalculationErrors.js'

/**
 * Core calculation engine for estimate pricing
 */
export class CalculationEngine {
  /**
   * Supported calculation types
   */
  static CALCULATION_TYPES = {
    PER_PERSON: 'per_person',
    PER_GROUP: 'per_group',
    PER_UNIT: 'per_unit',
    PER_DAY: 'per_day',
  }

  /**
   * Age categories for pricing
   */
  static AGE_CATEGORIES = {
    ADULT: 'adult',
    CHILD: 'child',
    INFANT: 'infant',
    SENIOR: 'senior',
  }

  /**
   * Service categories for subtotals
   */
  static SERVICE_CATEGORIES = {
    ACCOMMODATION: 'accommodation',
    ACTIVITIES: 'activities',
    TRANSPORT: 'transport',
    FLIGHTS: 'flights',
    GUIDES: 'guides',
    OPTIONAL: 'optional',
  }

  /**
   * Display modes for pricing
   */
  static DISPLAY_MODES = {
    WITHOUT_MARKUP: 'without_markup',
    WITH_MARKUP: 'with_markup',
  }

  /**
   * Mathematical precision for all calculations
   */
  static PRECISION = 2

  /**
   * Performance threshold for calculations (ms)
   */
  static PERFORMANCE_THRESHOLD = 100

  /**
   * Default markup percentages by category
   */
  static DEFAULT_MARKUPS = {
    accommodation: 10,
    activities: 15,
    transport: 20,
    flights: 5,
    guides: 10,
    optional: 15,
    general: 10,
  }

  /**
   * Room calculation rules
   */
  static ROOM_CALCULATION_RULES = {
    double: {
      formula: (paxCount) => Math.ceil(paxCount / 2),
      description: 'Округление вверх для двухместных номеров',
    },
    triple: {
      formula: (paxCount) => Math.ceil(paxCount / 3),
      description: 'Округление вверх для трехместных номеров',
    },
    single: {
      formula: (paxCount) => paxCount,
      description: 'Один номер на человека',
    },
  }

  /**
   * Round number to specified precision
   * @param {number} value - Value to round
   * @param {number} precision - Decimal places (default: 2)
   * @returns {number} Rounded value
   */
  static round(value, precision = this.PRECISION) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(`Invalid value for rounding: ${value}`)
    }
    const factor = Math.pow(10, precision)
    const rounded = Math.round(value * factor) / factor
    return Number(rounded.toFixed(precision))
  }

  /**
   * Calculate activity price based on calculation type
   * @param {Object} activity - Activity object
   * @param {number} participantCount - Number of participants
   * @param {number} markup - Markup percentage (default: 0)
   * @returns {Object} Calculation result
   */
  static calculateActivityPrice(activity, participantCount, markup = 0) {
    const startTime = performance.now()

    try {
      // Validate inputs
      this.validateActivity(activity)
      this.validateParticipantCount(participantCount)
      this.validateMarkup(markup)

      const { calculation_type, base_price, quantity = 1 } = activity

      let subtotal = 0
      let finalQuantity = quantity

      switch (calculation_type) {
        case this.CALCULATION_TYPES.PER_PERSON:
          subtotal = this.calculatePerPerson(base_price, participantCount)
          finalQuantity = participantCount
          break

        case this.CALCULATION_TYPES.PER_GROUP:
          subtotal = this.calculatePerGroup(base_price, quantity)
          break

        case this.CALCULATION_TYPES.PER_UNIT:
          subtotal = this.calculatePerUnit(base_price, quantity)
          break

        case this.CALCULATION_TYPES.PER_DAY:
          subtotal = this.calculatePerDay(base_price, quantity)
          break

        default:
          throw new ValidationError(`Unknown calculation type: ${calculation_type}`)
      }

      // Apply markup
      const markupAmount = this.calculateMarkup(subtotal, markup)
      const total = this.round(subtotal + markupAmount)

      const result = {
        base_price: this.round(base_price),
        quantity: finalQuantity,
        participant_count: participantCount,
        subtotal: this.round(subtotal),
        markup_percentage: markup,
        markup_amount: this.round(markupAmount),
        total: total,
        calculation_type,
        timestamp: new Date().toISOString(),
      }

      // Validate calculation integrity
      this.validateCalculationIntegrity(result)

      // Performance monitoring
      const duration = performance.now() - startTime
      if (duration > this.PERFORMANCE_THRESHOLD) {
        console.warn(`Slow calculation: ${calculation_type} took ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      throw new CalculationError(`Activity calculation failed: ${error.message}`, {
        activity,
        participantCount,
        markup,
        originalError: error,
      })
    }
  }

  /**
   * Calculate per-person pricing
   * @param {number} basePrice - Base price per person
   * @param {number} participantCount - Number of participants
   * @returns {number} Total price
   */
  static calculatePerPerson(basePrice, participantCount) {
    if (participantCount <= 0) {
      throw new ValidationError('Participant count must be positive')
    }
    return this.round(basePrice * participantCount)
  }

  /**
   * Calculate per-group pricing (fixed price regardless of group size)
   * @param {number} basePrice - Fixed group price
   * @param {number} quantity - Quantity (typically 1)
   * @returns {number} Total price
   */
  static calculatePerGroup(basePrice, quantity = 1) {
    return this.round(basePrice * quantity)
  }

  /**
   * Calculate per-unit pricing
   * @param {number} basePrice - Price per unit
   * @param {number} quantity - Number of units
   * @returns {number} Total price
   */
  static calculatePerUnit(basePrice, quantity) {
    if (quantity <= 0) {
      throw new ValidationError('Quantity must be positive')
    }
    return this.round(basePrice * quantity)
  }

  /**
   * Calculate per-day pricing
   * @param {number} basePrice - Price per day
   * @param {number} days - Number of days
   * @returns {number} Total price
   */
  static calculatePerDay(basePrice, days) {
    if (days <= 0) {
      throw new ValidationError('Days must be positive')
    }
    return this.round(basePrice * days)
  }

  /**
   * Calculate markup amount
   * @param {number} subtotal - Base amount
   * @param {number} markupPercentage - Markup percentage
   * @returns {number} Markup amount
   */
  static calculateMarkup(subtotal, markupPercentage) {
    if (markupPercentage < 0) {
      throw new ValidationError('Markup percentage cannot be negative')
    }
    return this.round(subtotal * (markupPercentage / 100))
  }

  /**
   * Calculate day total including all activities
   * @param {Object} day - Tour day object
   * @param {number} participantCount - Number of participants
   * @param {boolean} showMarkup - Whether to include markup (default: true)
   * @returns {Object} Day calculation result
   */
  static calculateDayTotal(day, participantCount, showMarkup = true) {
    try {
      this.validateTourDay(day)
      this.validateParticipantCount(participantCount)

      const activities = day.activities || []
      let daySubtotal = 0
      let dayMarkup = 0
      const activityCalculations = []

      for (const activity of activities) {
        const calculation = this.calculateActivityPrice(
          activity,
          participantCount,
          showMarkup ? activity.markup || 0 : 0,
        )
        daySubtotal += calculation.subtotal
        dayMarkup += calculation.markup_amount
        activityCalculations.push(calculation)
      }

      const dayTotal = this.round(daySubtotal + dayMarkup)

      return {
        day_number: day.dayNumber,
        date: day.date,
        city: day.city,
        participant_count: participantCount,
        activities_count: activities.length,
        subtotal: this.round(daySubtotal),
        markup_amount: this.round(dayMarkup),
        total: dayTotal,
        activity_calculations: activityCalculations,
        show_markup: showMarkup,
      }
    } catch (error) {
      throw new CalculationError(`Day calculation failed: ${error.message}`, {
        day,
        participantCount,
        showMarkup,
        originalError: error,
      })
    }
  }

  /**
   * Calculate complete estimate total
   * @param {Object} estimate - Estimate object
   * @param {boolean} showMarkup - Whether to include markup (default: true)
   * @returns {Object} Complete calculation result
   */
  static calculateEstimateTotal(estimate, showMarkup = true) {
    const startTime = performance.now()

    try {
      this.validateEstimate(estimate)

      const { group, hotels, tourDays, optionalServices } = estimate
      const participantCount = group?.totalPax || 0

      // Calculate accommodation costs
      const accommodationTotal = this.calculateAccommodationTotal(
        hotels || [],
        participantCount,
        showMarkup,
      )

      // Calculate tour days costs
      const tourDaysTotal = this.calculateTourDaysTotal(
        tourDays || [],
        participantCount,
        showMarkup,
      )

      // Calculate optional services costs
      const optionalServicesTotal = this.calculateOptionalServicesTotal(
        optionalServices || [],
        participantCount,
        showMarkup,
      )

      // Calculate base total
      const accommodationSubtotal = accommodationTotal.subtotal || 0
      const tourDaysSubtotal = tourDaysTotal.subtotal || 0
      const optionalServicesSubtotal = optionalServicesTotal.subtotal || 0

      const baseTotal = this.round(
        accommodationSubtotal + tourDaysSubtotal + optionalServicesSubtotal,
      )

      // Apply general markup if enabled
      const generalMarkup = showMarkup ? estimate.markup_percentage || 15 : 0
      const generalMarkupAmount = this.calculateMarkup(baseTotal, generalMarkup)

      // Calculate final total
      const finalTotal = this.round(baseTotal + generalMarkupAmount)

      const result = {
        estimate_id: estimate.id,
        participant_count: participantCount,
        accommodation: accommodationTotal,
        tour_days: tourDaysTotal,
        optional_services: optionalServicesTotal,
        base_total: baseTotal,
        general_markup_percentage: generalMarkup,
        general_markup_amount: this.round(generalMarkupAmount),
        final_total: finalTotal,
        show_markup: showMarkup,
        calculation_version: '1.0',
        calculated_at: new Date().toISOString(),
      }

      // Validate calculation integrity
      this.validateEstimateCalculationIntegrity(result)

      // Performance monitoring
      const duration = performance.now() - startTime
      if (duration > this.PERFORMANCE_THRESHOLD) {
        console.warn(`Slow estimate calculation: took ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      throw new CalculationError(`Estimate calculation failed: ${error.message}`, {
        estimate,
        showMarkup,
        originalError: error,
      })
    }
  }

  /**
   * Calculate accommodation total
   * @param {Array} hotels - Array of hotel objects
   * @param {number} participantCount - Number of participants
   * @param {boolean} showMarkup - Whether to include markup
   * @returns {Object} Accommodation calculation result
   */
  static calculateAccommodationTotal(hotels, participantCount, showMarkup) {
    let subtotal = 0
    let markup = 0
    const hotelCalculations = []

    for (const hotel of hotels || []) {
      const calculation = this.calculateAccommodation(hotel, participantCount, showMarkup)
      subtotal += calculation.subtotal || 0
      markup += calculation.markup_amount || 0
      hotelCalculations.push(calculation)
    }

    return {
      subtotal: this.round(subtotal),
      markup_amount: this.round(markup),
      total: this.round(subtotal + markup),
      hotels_count: hotelCalculations.length,
      hotel_calculations: hotelCalculations,
    }
  }

  /**
   * Calculate individual accommodation cost
   * @param {Object} hotel - Hotel object
   * @param {number} participantCount - Number of participants
   * @param {boolean} showMarkup - Whether to include markup
   * @returns {Object} Hotel calculation result
   */
  static calculateAccommodation(hotel, participantCount, showMarkup) {
    try {
      console.log('Debug - calculateAccommodation input:', { hotel, participantCount, showMarkup })

      this.validateHotel(hotel)

      const { accommodationType, paxCount, nights, pricePerRoom, isGuideHotel } = hotel

      // Calculate rooms needed based on participant count, not paxCount
      const roomsNeeded = this.calculateRoomsNeeded(participantCount, accommodationType)

      // Calculate base cost
      const baseCost = this.round(roomsNeeded * pricePerRoom * nights)

      // Apply markup if not guide hotel
      const markup = isGuideHotel ? 0 : showMarkup ? hotel.markup || 0 : 0
      const markupAmount = this.calculateMarkup(baseCost, markup)

      const total = this.round(baseCost + markupAmount)

      const result = {
        hotel_name: hotel.name,
        city: hotel.city,
        accommodation_type: accommodationType,
        pax_count: participantCount,
        rooms_needed: roomsNeeded,
        nights: nights,
        price_per_room: this.round(pricePerRoom),
        base_cost: this.round(baseCost),
        markup_percentage: markup,
        markup_amount: this.round(markupAmount),
        total: total,
        is_guide_hotel: isGuideHotel,
      }

      console.log('Debug - calculateAccommodation result:', result)
      return result
    } catch (error) {
      throw new CalculationError(`Accommodation calculation failed: ${error.message}`, {
        hotel,
        participantCount,
        showMarkup,
        originalError: error,
      })
    }
  }

  /**
   * Calculate rooms needed based on accommodation type
   * @param {number} paxCount - Number of people
   * @param {string} accommodationType - Type of accommodation
   * @returns {number} Number of rooms needed
   */
  static calculateRoomsNeeded(paxCount, accommodationType) {
    if (paxCount <= 0) {
      throw new ValidationError('Pax count must be positive')
    }

    const rule = this.ROOM_CALCULATION_RULES[accommodationType]
    if (!rule) {
      throw new ValidationError(`Unknown accommodation type: ${accommodationType}`)
    }

    return rule.formula(paxCount)
  }

  /**
   * Calculate activity price with dual display mode support
   * @param {Object} activity - Activity object
   * @param {number} participantCount - Number of participants
   * @param {string} displayMode - Display mode (with/without markup)
   * @returns {Object} Calculation result with both price modes
   */
  static calculateActivityPriceDual(
    activity,
    participantCount,
    displayMode = this.DISPLAY_MODES.WITH_MARKUP,
  ) {
    try {
      // Calculate base price (without markup)
      const baseCalculation = this.calculateActivityPrice(activity, participantCount, 0)

      // Calculate price with markup
      const markupCalculation = this.calculateActivityPrice(
        activity,
        participantCount,
        activity.markup || this.DEFAULT_MARKUPS.activities,
      )

      return {
        base_price: baseCalculation.subtotal,
        price_with_markup: markupCalculation.total,
        markup_percentage: activity.markup || this.DEFAULT_MARKUPS.activities,
        markup_amount: markupCalculation.markup_amount,
        display_price:
          displayMode === this.DISPLAY_MODES.WITH_MARKUP
            ? markupCalculation.total
            : baseCalculation.subtotal,
        calculation_type: activity.calculation_type,
        quantity: baseCalculation.quantity,
        participant_count: participantCount,
      }
    } catch (error) {
      throw new CalculationError(`Dual activity calculation failed: ${error.message}`, {
        activity,
        participantCount,
        displayMode,
        originalError: error,
      })
    }
  }

  /**
   * Calculate accommodation with dual display mode support
   * @param {Object} hotel - Hotel object
   * @param {number} participantCount - Number of participants
   * @param {string} displayMode - Display mode (with/without markup)
   * @returns {Object} Hotel calculation result with both price modes
   */
  static calculateAccommodationDual(
    hotel,
    participantCount,
    displayMode = this.DISPLAY_MODES.WITH_MARKUP,
  ) {
    try {
      this.validateHotel(hotel)

      const { accommodationType, nights, pricePerRoom, isGuideHotel } = hotel
      const roomsNeeded = this.calculateRoomsNeeded(participantCount, accommodationType)
      const baseCost = this.round(roomsNeeded * pricePerRoom * nights)

      // Calculate markup
      const markupPercentage = isGuideHotel ? 0 : hotel.markup || this.DEFAULT_MARKUPS.accommodation
      const markupAmount = this.calculateMarkup(baseCost, markupPercentage)
      const totalWithMarkup = this.round(baseCost + markupAmount)

      return {
        hotel_name: hotel.name,
        city: hotel.city,
        accommodation_type: accommodationType,
        pax_count: participantCount,
        rooms_needed: roomsNeeded,
        nights: nights,
        price_per_room: this.round(pricePerRoom),
        base_cost: baseCost,
        price_with_markup: totalWithMarkup,
        markup_percentage: markupPercentage,
        markup_amount: this.round(markupAmount),
        display_price: displayMode === this.DISPLAY_MODES.WITH_MARKUP ? totalWithMarkup : baseCost,
        is_guide_hotel: isGuideHotel,
      }
    } catch (error) {
      throw new CalculationError(`Dual accommodation calculation failed: ${error.message}`, {
        hotel,
        participantCount,
        displayMode,
        originalError: error,
      })
    }
  }

  /**
   * Calculate complete estimate with dual display mode and category subtotals
   * @param {Object} estimate - Estimate object
   * @param {string} displayMode - Display mode (with/without markup)
   * @returns {Object} Complete calculation result with subtotals
   */
  static calculateEstimateTotalDual(estimate, displayMode = this.DISPLAY_MODES.WITH_MARKUP) {
    const startTime = performance.now()

    try {
      this.validateEstimate(estimate)

      const { group, hotels, tourDays, optionalServices } = estimate
      const participantCount = group?.totalPax || 0

      // Calculate accommodation costs
      const accommodationTotal = this.calculateAccommodationTotalDual(
        hotels || [],
        participantCount,
        displayMode,
      )

      // Calculate tour days costs
      const tourDaysTotal = this.calculateTourDaysTotalDual(
        tourDays || [],
        participantCount,
        displayMode,
      )

      // Calculate optional services costs
      const optionalServicesTotal = this.calculateOptionalServicesTotalDual(
        optionalServices || [],
        participantCount,
        displayMode,
      )

      // Calculate category subtotals
      const categorySubtotals = {
        accommodation: accommodationTotal,
        activities: tourDaysTotal,
        optional: optionalServicesTotal,
      }

      // Calculate base total (without general markup)
      const baseTotal = this.round(
        accommodationTotal.base_cost + tourDaysTotal.base_cost + optionalServicesTotal.base_cost,
      )

      // Apply general markup
      const generalMarkup = group?.markup || this.DEFAULT_MARKUPS.general
      const generalMarkupAmount = this.calculateMarkup(baseTotal, generalMarkup)
      const totalWithGeneralMarkup = this.round(baseTotal + generalMarkupAmount)

      const result = {
        participant_count: participantCount,
        display_mode: displayMode,
        category_subtotals: categorySubtotals,
        base_total: baseTotal,
        general_markup_percentage: generalMarkup,
        general_markup_amount: this.round(generalMarkupAmount),
        total_with_general_markup: totalWithGeneralMarkup,
        final_total:
          displayMode === this.DISPLAY_MODES.WITH_MARKUP ? totalWithGeneralMarkup : baseTotal,
        calculation_timestamp: new Date().toISOString(),
      }

      // Performance monitoring
      const duration = performance.now() - startTime
      if (duration > this.PERFORMANCE_THRESHOLD) {
        console.warn(`Slow dual calculation: took ${duration.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      throw new CalculationError(`Dual estimate calculation failed: ${error.message}`, {
        estimate,
        displayMode,
        originalError: error,
      })
    }
  }

  /**
   * Calculate tour days total
   * @param {Array} tourDays - Array of tour day objects
   * @param {number} participantCount - Number of participants
   * @param {boolean} showMarkup - Whether to include markup
   * @returns {Object} Tour days calculation result
   */
  static calculateTourDaysTotal(tourDays, participantCount, showMarkup) {
    let subtotal = 0
    let markup = 0
    const dayCalculations = []

    for (const day of tourDays || []) {
      const calculation = this.calculateDayTotal(day, participantCount, showMarkup)
      subtotal += calculation.subtotal
      markup += calculation.markup_amount
      dayCalculations.push(calculation)
    }

    return {
      subtotal: this.round(subtotal),
      markup_amount: this.round(markup),
      total: this.round(subtotal + markup),
      days_count: dayCalculations.length,
      day_calculations: dayCalculations,
    }
  }

  /**
   * Calculate optional services total
   * @param {Array} optionalServices - Array of optional service objects
   * @param {number} participantCount - Number of participants
   * @param {boolean} showMarkup - Whether to include markup
   * @returns {Object} Optional services calculation result
   */
  static calculateOptionalServicesTotal(optionalServices, participantCount, showMarkup) {
    let subtotal = 0
    let markup = 0
    const serviceCalculations = []

    for (const service of optionalServices || []) {
      const calculation = this.calculateOptionalService(service, participantCount, showMarkup)
      subtotal += calculation.subtotal
      markup += calculation.markup_amount
      serviceCalculations.push(calculation)
    }

    return {
      subtotal: this.round(subtotal),
      markup_amount: this.round(markup),
      total: this.round(subtotal + markup),
      services_count: serviceCalculations.length,
      service_calculations: serviceCalculations,
    }
  }

  /**
   * Calculate individual optional service cost
   * @param {Object} service - Optional service object
   * @param {number} participantCount - Number of participants
   * @param {boolean} showMarkup - Whether to include markup
   * @returns {Object} Service calculation result
   */
  static calculateOptionalService(service, participantCount, showMarkup) {
    try {
      this.validateOptionalService(service)

      const { price, cost, calculation_type = 'per_person' } = service
      const basePrice = price || cost || 0

      // Calculate based on calculation type
      let subtotal = 0
      switch (calculation_type) {
        case 'per_person':
          subtotal = this.calculatePerPerson(basePrice, participantCount)
          break
        case 'per_group':
          subtotal = this.calculatePerGroup(basePrice)
          break
        default:
          subtotal = this.calculatePerPerson(basePrice, participantCount)
      }

      // Apply markup
      const markup = showMarkup ? service.markup || 0 : 0
      const markupAmount = this.calculateMarkup(subtotal, markup)
      const total = this.round(subtotal + markupAmount)

      return {
        service_name: service.name,
        base_price: this.round(basePrice),
        calculation_type,
        participant_count: participantCount,
        subtotal: this.round(subtotal),
        markup_percentage: markup,
        markup_amount: this.round(markupAmount),
        total: total,
      }
    } catch (error) {
      throw new CalculationError(`Optional service calculation failed: ${error.message}`, {
        service,
        participantCount,
        showMarkup,
        originalError: error,
      })
    }
  }

  /**
   * Detect calculation type from activity data
   * @param {Object} activity - Activity object
   * @returns {string} Detected calculation type
   */
  static detectCalculationType(activity) {
    if (!activity) {
      throw new ValidationError('Activity is required for calculation type detection')
    }

    // Check for explicit calculation type
    if (activity.calculation_type) {
      return activity.calculation_type
    }

    // Detect based on activity characteristics
    if (activity.per_person) {
      return this.CALCULATION_TYPES.PER_PERSON
    }

    if (activity.fixed_price || activity.per_group) {
      return this.CALCULATION_TYPES.PER_GROUP
    }

    if (activity.per_unit || activity.quantity) {
      return this.CALCULATION_TYPES.PER_UNIT
    }

    if (activity.per_day || activity.duration) {
      return this.CALCULATION_TYPES.PER_DAY
    }

    // Default to per-person
    return this.CALCULATION_TYPES.PER_PERSON
  }

  /**
   * Validate calculation result integrity
   * @param {Object} calculation - Calculation result
   * @throws {ValidationError} If calculation is invalid
   */
  static validateCalculationIntegrity(calculation) {
    const { subtotal, markup_amount, total } = calculation

    const expectedTotal = this.round(subtotal + markup_amount)

    if (Math.abs(total - expectedTotal) > 0.01) {
      throw new ValidationError(
        `Calculation integrity check failed: expected ${expectedTotal}, got ${total}`,
      )
    }
  }

  /**
   * Validate estimate calculation integrity
   * @param {Object} calculation - Estimate calculation result
   * @throws {ValidationError} If calculation is invalid
   */
  static validateEstimateCalculationIntegrity(calculation) {
    const { base_total, general_markup_amount, final_total } = calculation

    const expectedTotal = this.round(base_total + general_markup_amount)

    if (Math.abs(final_total - expectedTotal) > 0.01) {
      throw new ValidationError(
        `Estimate calculation integrity check failed: expected ${expectedTotal}, got ${final_total}`,
      )
    }
  }

  // Validation methods
  static validateActivity(activity) {
    if (!activity || typeof activity !== 'object') {
      throw new ValidationError('Activity must be a valid object')
    }
    if (typeof activity.base_price !== 'number' || activity.base_price < 0) {
      throw new ValidationError('Activity base price must be a non-negative number')
    }
  }

  static validateParticipantCount(count) {
    if (typeof count !== 'number' || count < 0) {
      throw new ValidationError('Participant count must be a non-negative number')
    }
  }

  static validateMarkup(markup) {
    if (typeof markup !== 'number' || markup < 0) {
      throw new ValidationError('Markup must be a non-negative number')
    }
  }

  static validateTourDay(day) {
    if (!day || typeof day !== 'object') {
      throw new ValidationError('Tour day must be a valid object')
    }
  }

  static validateEstimate(estimate) {
    if (!estimate || typeof estimate !== 'object') {
      throw new ValidationError('Estimate must be a valid object')
    }
    if (!estimate.group || typeof estimate.group.totalPax !== 'number') {
      throw new ValidationError('Estimate must have valid group data with totalPax')
    }
  }

  static validateHotel(hotel) {
    if (!hotel || typeof hotel !== 'object') {
      throw new ValidationError('Hotel must be a valid object')
    }
    if (typeof hotel.pricePerRoom !== 'number' || hotel.pricePerRoom < 0) {
      throw new ValidationError('Hotel price per room must be a non-negative number')
    }
  }

  static validateOptionalService(service) {
    if (!service || typeof service !== 'object') {
      throw new ValidationError('Optional service must be a valid object')
    }
  }

  /**
   * Calculate accommodation total with dual display mode support
   * @param {Array} hotels - Array of hotel objects
   * @param {number} participantCount - Number of participants
   * @param {string} displayMode - Display mode (with/without markup)
   * @returns {Object} Accommodation total with both price modes
   */
  static calculateAccommodationTotalDual(hotels, participantCount, displayMode) {
    let baseCost = 0
    let totalWithMarkup = 0
    const hotelCalculations = []

    for (const hotel of hotels || []) {
      const calculation = this.calculateAccommodationDual(hotel, participantCount, displayMode)
      baseCost += calculation.base_cost
      totalWithMarkup += calculation.price_with_markup
      hotelCalculations.push(calculation)
    }

    return {
      base_cost: this.round(baseCost),
      total_with_markup: this.round(totalWithMarkup),
      display_total: displayMode === this.DISPLAY_MODES.WITH_MARKUP ? totalWithMarkup : baseCost,
      hotels_count: hotelCalculations.length,
      hotel_calculations: hotelCalculations,
    }
  }

  /**
   * Calculate tour days total with dual display mode support
   * @param {Array} tourDays - Array of tour day objects
   * @param {number} participantCount - Number of participants
   * @param {string} displayMode - Display mode (with/without markup)
   * @returns {Object} Tour days total with both price modes
   */
  static calculateTourDaysTotalDual(tourDays, participantCount, displayMode) {
    let baseCost = 0
    let totalWithMarkup = 0
    const dayCalculations = []

    for (const day of tourDays || []) {
      const calculation = this.calculateDayTotalDual(day, participantCount, displayMode)
      baseCost += calculation.base_cost
      totalWithMarkup += calculation.total_with_markup
      dayCalculations.push(calculation)
    }

    return {
      base_cost: this.round(baseCost),
      total_with_markup: this.round(totalWithMarkup),
      display_total: displayMode === this.DISPLAY_MODES.WITH_MARKUP ? totalWithMarkup : baseCost,
      days_count: dayCalculations.length,
      day_calculations: dayCalculations,
    }
  }

  /**
   * Calculate day total with dual display mode support
   * @param {Object} day - Tour day object
   * @param {number} participantCount - Number of participants
   * @param {string} displayMode - Display mode (with/without markup)
   * @returns {Object} Day calculation result with both price modes
   */
  static calculateDayTotalDual(day, participantCount, displayMode) {
    try {
      this.validateTourDay(day)

      const activities = day.activities || []
      let baseCost = 0
      let totalWithMarkup = 0
      const activityCalculations = []

      for (const activity of activities) {
        const calculation = this.calculateActivityPriceDual(activity, participantCount, displayMode)
        baseCost += calculation.base_price
        totalWithMarkup += calculation.price_with_markup
        activityCalculations.push(calculation)
      }

      return {
        day_number: day.dayNumber,
        date: day.date,
        city: day.city,
        participant_count: participantCount,
        activities_count: activities.length,
        base_cost: this.round(baseCost),
        total_with_markup: this.round(totalWithMarkup),
        display_total: displayMode === this.DISPLAY_MODES.WITH_MARKUP ? totalWithMarkup : baseCost,
        activity_calculations: activityCalculations,
      }
    } catch (error) {
      throw new CalculationError(`Dual day calculation failed: ${error.message}`, {
        day,
        participantCount,
        displayMode,
        originalError: error,
      })
    }
  }

  /**
   * Calculate optional services total with dual display mode support
   * @param {Array} optionalServices - Array of optional service objects
   * @param {number} participantCount - Number of participants
   * @param {string} displayMode - Display mode (with/without markup)
   * @returns {Object} Optional services total with both price modes
   */
  static calculateOptionalServicesTotalDual(optionalServices, participantCount, displayMode) {
    let baseCost = 0
    let totalWithMarkup = 0
    const serviceCalculations = []

    for (const service of optionalServices || []) {
      const calculation = this.calculateOptionalServiceDual(service, participantCount, displayMode)
      baseCost += calculation.base_price
      totalWithMarkup += calculation.price_with_markup
      serviceCalculations.push(calculation)
    }

    return {
      base_cost: this.round(baseCost),
      total_with_markup: this.round(totalWithMarkup),
      display_total: displayMode === this.DISPLAY_MODES.WITH_MARKUP ? totalWithMarkup : baseCost,
      services_count: serviceCalculations.length,
      service_calculations: serviceCalculations,
    }
  }

  /**
   * Calculate optional service with dual display mode support
   * @param {Object} service - Optional service object
   * @param {number} participantCount - Number of participants
   * @param {string} displayMode - Display mode (with/without markup)
   * @returns {Object} Service calculation result with both price modes
   */
  static calculateOptionalServiceDual(service, participantCount, displayMode) {
    try {
      this.validateOptionalService(service)

      const { price, cost, calculation_type = 'per_person' } = service
      const basePrice = price || cost || 0

      // Calculate base cost
      let baseCost = 0
      switch (calculation_type) {
        case 'per_person':
          baseCost = this.calculatePerPerson(basePrice, participantCount)
          break
        case 'per_group':
          baseCost = this.calculatePerGroup(basePrice)
          break
        default:
          baseCost = this.calculatePerPerson(basePrice, participantCount)
      }

      // Calculate markup
      const markupPercentage = service.markup || this.DEFAULT_MARKUPS.optional
      const markupAmount = this.calculateMarkup(baseCost, markupPercentage)
      const totalWithMarkup = this.round(baseCost + markupAmount)

      return {
        service_name: service.name,
        base_price: this.round(baseCost),
        price_with_markup: totalWithMarkup,
        markup_percentage: markupPercentage,
        markup_amount: this.round(markupAmount),
        display_price: displayMode === this.DISPLAY_MODES.WITH_MARKUP ? totalWithMarkup : baseCost,
        calculation_type,
        participant_count: participantCount,
      }
    } catch (error) {
      throw new CalculationError(`Dual optional service calculation failed: ${error.message}`, {
        service,
        participantCount,
        displayMode,
        originalError: error,
      })
    }
  }

  /**
   * Calculate differential pricing for adults/children
   * @param {Object} pricing - Pricing object with adult and child prices
   * @param {number} adultCount - Number of adults
   * @param {number} childCount - Number of children
   * @param {string} displayMode - Display mode (with/without markup)
   * @returns {Object} Differential pricing calculation result
   */
  static calculateDifferentialPricing(pricing, adultCount, childCount, displayMode) {
    try {
      const { adult_price, child_price, markup = 0 } = pricing

      // Calculate base costs
      const adultBaseCost = this.calculatePerPerson(adult_price, adultCount)
      const childBaseCost = this.calculatePerPerson(child_price, childCount)
      const totalBaseCost = this.round(adultBaseCost + childBaseCost)

      // Calculate markup
      const markupAmount = this.calculateMarkup(totalBaseCost, markup)
      const totalWithMarkup = this.round(totalBaseCost + markupAmount)

      return {
        adult_count: adultCount,
        child_count: childCount,
        adult_price: this.round(adult_price),
        child_price: this.round(child_price),
        adult_base_cost: this.round(adultBaseCost),
        child_base_cost: this.round(childBaseCost),
        total_base_cost: totalBaseCost,
        markup_percentage: markup,
        markup_amount: this.round(markupAmount),
        total_with_markup: totalWithMarkup,
        display_total:
          displayMode === this.DISPLAY_MODES.WITH_MARKUP ? totalWithMarkup : totalBaseCost,
      }
    } catch (error) {
      throw new CalculationError(`Differential pricing calculation failed: ${error.message}`, {
        pricing,
        adultCount,
        childCount,
        displayMode,
        originalError: error,
      })
    }
  }

  /**
   * Apply discount to calculation result
   * @param {Object} calculation - Calculation result
   * @param {Object} discount - Discount object
   * @returns {Object} Calculation result with discount applied
   */
  static applyDiscount(calculation, discount) {
    try {
      const { type, value } = discount

      let discountAmount = 0
      if (type === 'percentage') {
        discountAmount = this.calculateMarkup(calculation.final_total, value)
      } else if (type === 'fixed') {
        discountAmount = value
      }

      const discountedTotal = this.round(calculation.final_total - discountAmount)

      return {
        ...calculation,
        discount_type: type,
        discount_value: value,
        discount_amount: this.round(discountAmount),
        final_total: discountedTotal,
      }
    } catch (error) {
      throw new CalculationError(`Discount application failed: ${error.message}`, {
        calculation,
        discount,
        originalError: error,
      })
    }
  }
}

export default CalculationEngine

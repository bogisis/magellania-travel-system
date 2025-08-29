/**
 * PricingIntelligenceService - Intelligent pricing suggestions based on real estimate analysis
 *
 * This service provides smart pricing suggestions and automatic calculations
 * based on analysis of 39 real estimates from MAGELLANIA travel system.
 *
 * @author MAGELLANIA Development Team
 * @version 1.0.0
 */

import { CalculationEngine } from './CalculationEngine.js'

/**
 * Intelligent pricing service for automatic price suggestions
 */
export class PricingIntelligenceService {
  /**
   * Average prices by activity category (based on real estimates analysis)
   */
  static AVERAGE_PRICES = {
    // Входные билеты и парки
    national_park_entrance: {
      adult: 44,
      child: 22,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
      category: 'entrance_fees',
    },
    museum_entrance: {
      adult: 25,
      child: 12,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
      category: 'entrance_fees',
    },
    ski_pass: {
      adult: 115,
      child: 81,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
      category: 'ski_services',
    },

    // Трансферы
    airport_transfer: {
      price: 40,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
      category: 'transfers',
      max_pax: 8,
    },
    city_transfer: {
      price: 15,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
      category: 'transfers',
    },
    full_day_transfer: {
      price: 500,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
      category: 'transfers',
    },

    // Железнодорожные билеты
    train_ticket: {
      adult: 70,
      child: 35,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
      category: 'transport',
    },

    // Размещение
    hotel_double: {
      price: 150,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_DAY,
      category: 'accommodation',
      accommodation_type: 'double',
    },
    hotel_single: {
      price: 120,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_DAY,
      category: 'accommodation',
      accommodation_type: 'single',
    },

    // Работа гида
    guide_daily: {
      price: 350,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_DAY,
      category: 'guides',
    },
    guide_fixed: {
      price: 400,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
      category: 'guides',
    },

    // Экскурсии
    guided_tour: {
      price: 1273,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
      category: 'activities',
    },
    city_tour: {
      price: 200,
      calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
      category: 'activities',
    },
  }

  /**
   * Activity type detection patterns
   */
  static ACTIVITY_PATTERNS = {
    entrance_fees: [
      'входной билет',
      'entrance',
      'билет',
      'ticket',
      'парк',
      'park',
      'музей',
      'museum',
    ],
    transfers: ['трансфер', 'transfer', 'аэропорт', 'airport', 'доставка', 'delivery'],
    transport: ['поезд', 'train', 'автобус', 'bus', 'самолет', 'flight', 'перелет'],
    accommodation: ['отель', 'hotel', 'размещение', 'accommodation', 'номер', 'room'],
    guides: ['гид', 'guide', 'экскурсовод', 'экскурсия', 'excursion'],
    activities: ['активность', 'activity', 'тур', 'tour', 'экскурсия', 'excursion'],
  }

  /**
   * Suggest pricing for activity based on name and type
   * @param {string} activityName - Name of the activity
   * @param {string} activityType - Type of activity
   * @param {number} participantCount - Number of participants
   * @returns {Object} Suggested pricing configuration
   */
  static suggestPricing(activityName, activityType, participantCount) {
    try {
      const normalizedName = activityName.toLowerCase()
      const category = this.detectCategory(normalizedName, activityType)
      const pricingTemplate = this.findPricingTemplate(normalizedName, category)

      // Если не найден шаблон или активность действительно неизвестная
      if (!pricingTemplate || activityType === 'unknown') {
        return this.getDefaultPricing(activityType)
      }

      // Determine calculation type based on participant count and template
      const calculationType = this.determineCalculationType(
        pricingTemplate,
        participantCount,
        category,
      )

      // Get appropriate pricing
      const pricing = this.getPricingForType(pricingTemplate, calculationType, participantCount)

      return {
        suggested: true,
        category,
        calculation_type: calculationType,
        base_price: pricing.price || pricing.adult || pricing.child || 0,
        child_price: pricing.child,
        adult_price: pricing.adult,
        markup: this.getDefaultMarkupForCategory(category),
        confidence: this.calculateConfidence(normalizedName, category),
        template: pricingTemplate,
      }
    } catch (error) {
      console.error('Pricing suggestion failed:', error)
      return this.getDefaultPricing(activityType)
    }
  }

  /**
   * Detect activity category based on name and type
   * @param {string} activityName - Normalized activity name
   * @param {string} activityType - Activity type
   * @returns {string} Detected category
   */
  static detectCategory(activityName, activityType) {
    // Check each category's patterns
    for (const [category, patterns] of Object.entries(this.ACTIVITY_PATTERNS)) {
      for (const pattern of patterns) {
        if (activityName.includes(pattern)) {
          return category
        }
      }
    }

    // Fallback based on activity type
    const typeToCategory = {
      entrance: 'entrance_fees',
      transfer: 'transfers',
      transport: 'transport',
      accommodation: 'accommodation',
      guide: 'guides',
      activity: 'activities',
    }

    return typeToCategory[activityType] || 'activities'
  }

  /**
   * Find pricing template based on activity name and category
   * @param {string} activityName - Normalized activity name
   * @param {string} category - Activity category
   * @returns {string|null} Pricing template key
   */
  static findPricingTemplate(activityName, category) {
    // Direct matches
    for (const [template, pricing] of Object.entries(this.AVERAGE_PRICES)) {
      if (pricing.category === category) {
        // Check if template name matches activity
        if (activityName.includes(template.replace('_', ' '))) {
          return template
        }
      }
    }

    // Category-based fallbacks
    const categoryTemplates = {
      entrance_fees: 'national_park_entrance',
      transfers: 'city_transfer',
      transport: 'train_ticket',
      accommodation: 'hotel_double',
      guides: 'guide_daily',
      activities: 'guided_tour',
    }

    return categoryTemplates[category] || null
  }

  /**
   * Determine calculation type based on pricing template and participant count
   * @param {string} template - Pricing template key
   * @param {number} participantCount - Number of participants
   * @param {string} category - Activity category
   * @returns {string} Calculation type
   */
  static determineCalculationType(template, participantCount, category) {
    const pricing = this.AVERAGE_PRICES[template]
    if (!pricing) {
      return CalculationEngine.CALCULATION_TYPES.PER_PERSON
    }

    // Check if template has max_pax limit for group pricing
    if (pricing.max_pax && participantCount <= pricing.max_pax) {
      return CalculationEngine.CALCULATION_TYPES.PER_GROUP
    }

    // Category-specific rules
    if (category === 'transfers' && participantCount <= 8) {
      return CalculationEngine.CALCULATION_TYPES.PER_GROUP
    }

    if (category === 'guides') {
      return CalculationEngine.CALCULATION_TYPES.PER_DAY
    }

    return pricing.calculation_type || CalculationEngine.CALCULATION_TYPES.PER_PERSON
  }

  /**
   * Get pricing for specific calculation type
   * @param {string} template - Pricing template key
   * @param {string} calculationType - Calculation type
   * @param {number} participantCount - Number of participants
   * @returns {Object} Pricing configuration
   */
  static getPricingForType(template, calculationType, participantCount) {
    const pricing = this.AVERAGE_PRICES[template]
    if (!pricing) {
      return { price: 0 }
    }

    // For differential pricing (adults/children)
    if (pricing.adult && pricing.child) {
      return {
        adult: pricing.adult,
        child: pricing.child,
        calculation_type: calculationType,
      }
    }

    // For single price
    return {
      price: pricing.price || pricing.adult || 0,
      calculation_type: calculationType,
    }
  }

  /**
   * Get default markup for category
   * @param {string} category - Activity category
   * @returns {number} Default markup percentage
   */
  static getDefaultMarkupForCategory(category) {
    return CalculationEngine.DEFAULT_MARKUPS[category] || CalculationEngine.DEFAULT_MARKUPS.general
  }

  /**
   * Calculate confidence score for suggestion
   * @param {string} activityName - Normalized activity name
   * @param {string} category - Detected category
   * @returns {number} Confidence score (0-1)
   */
  static calculateConfidence(activityName, category) {
    let confidence = 0.5 // Base confidence

    // Increase confidence for exact matches
    for (const [template, pricing] of Object.entries(this.AVERAGE_PRICES)) {
      if (pricing.category === category && activityName.includes(template.replace('_', ' '))) {
        confidence += 0.3
        break
      }
    }

    // Increase confidence for strong category patterns
    const categoryPatterns = this.ACTIVITY_PATTERNS[category] || []
    for (const pattern of categoryPatterns) {
      if (activityName.includes(pattern)) {
        confidence += 0.2
        break
      }
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Get default pricing for activity type
   * @param {string} activityType - Activity type
   * @returns {Object} Default pricing configuration
   */
  static getDefaultPricing(activityType) {
    const defaults = {
      entrance: {
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
        base_price: 25,
        markup: 10,
      },
      transfer: {
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
        base_price: 50,
        markup: 15,
      },
      transport: {
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_PERSON,
        base_price: 100,
        markup: 10,
      },
      accommodation: {
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_DAY,
        base_price: 150,
        markup: 10,
      },
      guide: {
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_DAY,
        base_price: 300,
        markup: 10,
      },
      activity: {
        calculation_type: CalculationEngine.CALCULATION_TYPES.PER_GROUP,
        base_price: 200,
        markup: 15,
      },
    }

    const defaultConfig = defaults[activityType] || defaults.activity

    return {
      suggested: false,
      category: 'activities',
      calculation_type: defaultConfig.calculation_type,
      base_price: defaultConfig.base_price,
      markup: defaultConfig.markup,
      confidence: 0.1, // Низкая уверенность для дефолтных значений
    }
  }

  /**
   * Auto-calculate activity based on suggestion
   * @param {Object} activity - Activity object
   * @param {number} participantCount - Number of participants
   * @param {string} displayMode - Display mode
   * @returns {Object} Calculated activity with pricing
   */
  static autoCalculateActivity(activity, participantCount, displayMode) {
    try {
      const suggestion = this.suggestPricing(activity.name, activity.type, participantCount)

      // Update activity with suggested pricing
      const updatedActivity = {
        ...activity,
        calculation_type: suggestion.calculation_type,
        base_price: suggestion.base_price,
        markup: suggestion.markup,
      }

      // Calculate using CalculationEngine
      return CalculationEngine.calculateActivityPriceDual(
        updatedActivity,
        participantCount,
        displayMode,
      )
    } catch (error) {
      console.error('Auto-calculation failed:', error)
      throw error
    }
  }

  /**
   * Validate pricing suggestion
   * @param {Object} suggestion - Pricing suggestion
   * @returns {Object} Validation result
   */
  static validateSuggestion(suggestion) {
    const errors = []

    if (!suggestion.calculation_type) {
      errors.push('Calculation type is required')
    }

    if (typeof suggestion.base_price !== 'number' || suggestion.base_price < 0) {
      errors.push('Base price must be a non-negative number')
    }

    if (typeof suggestion.markup !== 'number' || suggestion.markup < 0) {
      errors.push('Markup must be a non-negative number')
    }

    if (suggestion.confidence < 0.3) {
      errors.push('Low confidence suggestion - manual review recommended')
    }

    return {
      valid: errors.length === 0,
      errors,
      confidence: suggestion.confidence,
    }
  }
}

export default PricingIntelligenceService

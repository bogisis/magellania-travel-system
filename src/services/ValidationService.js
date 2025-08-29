/**
 * ValidationService - Service for estimate validation
 */

export class ValidationService {
  /**
   * Validate estimate data
   * @param {Object} estimate - Estimate object to validate
   * @returns {Array} Array of validation errors
   */
  static validateEstimate(estimate) {
    const errors = []

    if (!estimate) {
      errors.push('Estimate data is required')
      return errors
    }

    // Validate group
    if (!estimate.group || !estimate.group.totalPax) {
      errors.push('Group data with totalPax is required')
    } else if (estimate.group.totalPax <= 0) {
      errors.push('Total passengers must be greater than 0')
    }

    // Validate hotels
    if (estimate.hotels && Array.isArray(estimate.hotels)) {
      estimate.hotels.forEach((hotel, index) => {
        if (!hotel.name) {
          errors.push(`Hotel ${index + 1}: name is required`)
        }
        if (!hotel.paxCount || hotel.paxCount <= 0) {
          errors.push(`Hotel ${index + 1}: pax count must be greater than 0`)
        }
        if (hotel.pricePerRoom < 0) {
          errors.push(`Hotel ${index + 1}: price per room cannot be negative`)
        }
      })
    }

    return errors
  }

  /**
   * Validate activity data
   * @param {Object} activity - Activity object to validate
   * @returns {Array} Array of validation errors
   */
  static validateActivity(activity) {
    const errors = []

    if (!activity) {
      errors.push('Activity data is required')
      return errors
    }

    if (!activity.name) {
      errors.push('Activity name is required')
    }

    if (typeof activity.base_price !== 'number' || activity.base_price < 0) {
      errors.push('Activity base price must be a non-negative number')
    }

    return errors
  }

  /**
   * Validate hotel data
   * @param {Object} hotel - Hotel object to validate
   * @returns {Array} Array of validation errors
   */
  static validateHotel(hotel) {
    const errors = []

    if (!hotel) {
      errors.push('Hotel data is required')
      return errors
    }

    if (!hotel.name) {
      errors.push('Hotel name is required')
    }

    if (!hotel.accommodationType) {
      errors.push('Accommodation type is required')
    }

    if (typeof hotel.pricePerRoom !== 'number' || hotel.pricePerRoom < 0) {
      errors.push('Price per room must be a non-negative number')
    }

    if (typeof hotel.nights !== 'number' || hotel.nights <= 0) {
      errors.push('Number of nights must be greater than 0')
    }

    return errors
  }

  /**
   * Validate estimate update data
   * @param {Object} updates - Estimate update object to validate
   * @returns {Object} Validation result with isValid flag and errors array
   */
  static validateEstimateUpdate(updates) {
    const errors = []

    if (!updates) {
      errors.push('Update data is required')
      return { isValid: false, errors }
    }

    // Validate basic fields - только если поля явно переданы и пустые
    if (updates.name !== undefined && updates.name !== null && updates.name.trim() === '') {
      errors.push('Estimate name cannot be empty')
    }

    if (updates.title !== undefined && updates.title !== null && updates.title.trim() === '') {
      errors.push('Estimate title cannot be empty')
    }

    // Validate group data if provided
    if (updates.group) {
      if (!updates.group.totalPax || updates.group.totalPax <= 0) {
        errors.push('Total passengers must be greater than 0')
      }
    }

    // Validate hotels if provided
    if (updates.hotels && Array.isArray(updates.hotels)) {
      updates.hotels.forEach((hotel, index) => {
        if (!hotel.name) {
          errors.push(`Hotel ${index + 1}: name is required`)
        }
        if (hotel.pricePerRoom !== undefined && hotel.pricePerRoom < 0) {
          errors.push(`Hotel ${index + 1}: price per room cannot be negative`)
        }
      })
    }

    // Validate tour dates if provided
    if (updates.tourDates) {
      if (updates.tourDates.startDate && updates.tourDates.endDate) {
        const startDate = new Date(updates.tourDates.startDate)
        const endDate = new Date(updates.tourDates.endDate)
        if (startDate >= endDate) {
          errors.push('End date must be after start date')
        }
      }
    }

    // Validate markup if provided
    if (updates.markup !== undefined) {
      const markup = Number(updates.markup)
      if (isNaN(markup) || markup < 0) {
        errors.push('Markup must be a non-negative number')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export default ValidationService

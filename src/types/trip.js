/**
 * @typedef {Object} Destination
 * @property {number} id
 * @property {string} key
 * @property {string} name
 * @property {string} image
 * @property {number} tourCount
 * @property {boolean} is_featured
 */

/**
 * @typedef {Object} Organizer
 * @property {number} id
 * @property {'guide'|'operator'} type
 * @property {string} name
 * @property {string|null} avatar
 * @property {string|null} bio
 * @property {string[]} languages
 * @property {string|null} [phone]
 * @property {boolean} published
 * @property {string} rating
 * @property {number} reviews_count
 */

/**
 * @typedef {Object} ItineraryItem
 * @property {number} day
 * @property {string} title
 * @property {string} text
 */

/**
 * @typedef {Object} Departure
 * @property {number} id
 * @property {number} tourId
 * @property {string} date - YYYY-MM-DD
 * @property {number} seatsTotal
 * @property {number} seatsLeft
 * @property {number|null} [priceOverride]
 * @property {'scheduled'|'started'|'completed'|'cancelled'} status
 */

/**
 * @typedef {Object} Tour
 * @property {number} id
 * @property {string} slug
 * @property {string} title
 * @property {string} destination
 * @property {string} category
 * @property {number} days
 * @property {number} price
 * @property {string} currency
 * @property {string[]} images
 * @property {string} description
 * @property {ItineraryItem[]} itinerary
 * @property {string[]} included
 * @property {string[]} excluded
 * @property {{ address?: string, lat?: number, lng?: number }} meetingPoint
 * @property {number} groupMin
 * @property {number} groupMax
 * @property {'flexible'|'standard'|'strict'} cancellationPolicy
 * @property {number} rating
 * @property {number} reviews_count
 * @property {Organizer} organizer
 * @property {Departure[]} [departures]
 * @property {boolean} [featured]
 */

/**
 * @typedef {Object} Companion
 * @property {number} id
 * @property {string} name
 * @property {string} birthDate - YYYY-MM-DD
 * @property {string} relation
 * @property {string|null} [phone]
 */

/**
 * @typedef {Object} BookingContact
 * @property {string} name
 * @property {string} phone
 * @property {string} [email]
 * @property {string} [note]
 */

/**
 * @typedef {Object} CreateBookingPayload
 * @property {number} tourId
 * @property {number} departureId
 * @property {number} travelers
 * @property {BookingContact} contact
 * @property {Array<{ name: string, birthDate: string, relation?: string }>} [companions]
 * @property {'inpay'|'payme'|'click'|'mock_online'} [payment_method]
 */

/**
 * @typedef {Object} BookingResponse
 * @property {number} id
 * @property {string} code
 * @property {number} total
 * @property {string} currency
 * @property {'hold'|'confirmed'|'completed'|'cancelled_by_customer'|'expired'} status
 * @property {string} [hold_expires_at]
 * @property {number} [hold_minutes_remaining]
 */

export const BookingPaymentMethods = {
  INPAY: 'inpay',
  PAYME: 'payme',
  CLICK: 'click',
  MOCK_ONLINE: 'mock_online',
};

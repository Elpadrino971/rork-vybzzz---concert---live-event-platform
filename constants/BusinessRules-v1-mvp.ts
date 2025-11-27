/**
 * BUSINESS RULES V1.0 MVP
 * Configuration simplifiée pour le lancement
 */

// ========================================
// REVENUE SPLIT (FIXE)
// ========================================
export const REVENUE_SPLIT = {
  ARTIST_SHARE: 0.70, // 70% pour l'artiste
  PLATFORM_SHARE: 0.30, // 30% pour la plateforme
} as const

// ========================================
// TICKETS
// ========================================
export const TICKETS = {
  MIN_PRICE: 1, // 1€ minimum
  MAX_PRICE: 100, // 100€ maximum
  MIN_CAPACITY: 10, // 10 places minimum
  MAX_CAPACITY: 100000, // 100k places maximum
} as const

// ========================================
// PAYOUTS
// ========================================
export const PAYOUTS = {
  DELAY_DAYS: 21, // J+21 après l'événement
  MIN_AMOUNT: 10, // 10€ minimum pour déclencher un payout
  CURRENCY: 'eur',
} as const

// ========================================
// CHAT
// ========================================
export const CHAT = {
  MAX_MESSAGE_LENGTH: 500, // 500 caractères max par message
  RATE_LIMIT: 5, // 5 messages par minute max par utilisateur
} as const

// ========================================
// STRIPE
// ========================================
export const STRIPE = {
  CURRENCY: 'eur',
  SUCCESS_URL_TEMPLATE: '/ticket/success?session_id={CHECKOUT_SESSION_ID}',
  CANCEL_URL_TEMPLATE: '/event/{EVENT_ID}',
} as const

// ========================================
// EMAILS
// ========================================
export const EMAILS = {
  FROM: 'VyBzzZ <noreply@vybzzz.com>',
  SUPPORT: 'support@vybzzz.com',
} as const

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Calcule la part de l'artiste
 */
export function calculateArtistRevenue(totalRevenue: number): number {
  return Math.round(totalRevenue * REVENUE_SPLIT.ARTIST_SHARE * 100) / 100
}

/**
 * Calcule la part de la plateforme
 */
export function calculatePlatformRevenue(totalRevenue: number): number {
  return Math.round(totalRevenue * REVENUE_SPLIT.PLATFORM_SHARE * 100) / 100
}

/**
 * Calcule la date de payout (J+21 après la fin de l'événement)
 */
export function calculatePayoutDate(eventEndDate: Date): Date {
  const payoutDate = new Date(eventEndDate)
  payoutDate.setDate(payoutDate.getDate() + PAYOUTS.DELAY_DAYS)
  return payoutDate
}

/**
 * Valide le prix d'un ticket
 */
export function isValidTicketPrice(price: number): boolean {
  return price >= TICKETS.MIN_PRICE && price <= TICKETS.MAX_PRICE
}

/**
 * Valide la capacité d'un événement
 */
export function isValidCapacity(capacity: number): boolean {
  return capacity >= TICKETS.MIN_CAPACITY && capacity <= TICKETS.MAX_CAPACITY
}

/**
 * Vérifie si un payout est éligible (montant minimum atteint)
 */
export function isPayoutEligible(amount: number): boolean {
  return amount >= PAYOUTS.MIN_AMOUNT
}

/**
 * CONSTANTS V1.0 MVP
 * Configuration centralisée pour la plateforme
 */

// ========================================
// REVENUE SPLIT (70/30 FIXE)
// ========================================
export const REVENUE_SPLIT = {
  ARTIST_SHARE: 0.70,     // 70% pour l'artiste
  PLATFORM_SHARE: 0.30,   // 30% pour la plateforme
} as const

// ========================================
// BILLETS
// ========================================
export const TICKETS = {
  MIN_PRICE: 1,           // 1€ minimum
  MAX_PRICE: 100,         // 100€ maximum
  MIN_CAPACITY: 10,       // 10 places minimum
  MAX_CAPACITY: 100000,   // 100k places maximum
} as const

// ========================================
// PAYOUT
// ========================================
export const PAYOUTS = {
  DELAY_DAYS: 21,         // J+21 après l'événement
  MIN_AMOUNT: 10,         // 10€ minimum pour payout
  CURRENCY: 'eur',
} as const

// ========================================
// STRIPE
// ========================================
export const STRIPE = {
  CURRENCY: 'eur',
  PAYMENT_METHOD_TYPES: ['card'],
} as const

// ========================================
// CHAT
// ========================================
export const CHAT = {
  MAX_MESSAGE_LENGTH: 500,  // 500 caractères max
  RATE_LIMIT: 5,            // 5 messages/minute max
} as const

// ========================================
// COULEURS (Design System)
// ========================================
export const COLORS = {
  PRIMARY: '#FF6B35',       // Orange vif
  SECONDARY: '#004E89',     // Bleu foncé
  ACCENT: '#F7931E',        // Orange clair
  SUCCESS: '#22C55E',       // Vert
  ERROR: '#EF4444',         // Rouge
  BACKGROUND: '#FFFFFF',    // Blanc
  TEXT: '#1F2937',          // Gris foncé
} as const

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

/**
 * Calcule la part de l'artiste (70%)
 */
export function calculateArtistRevenue(totalRevenue: number): number {
  return Math.round(totalRevenue * REVENUE_SPLIT.ARTIST_SHARE * 100) / 100
}

/**
 * Calcule la part de la plateforme (30%)
 */
export function calculatePlatformRevenue(totalRevenue: number): number {
  return Math.round(totalRevenue * REVENUE_SPLIT.PLATFORM_SHARE * 100) / 100
}

/**
 * Calcule la date de payout (J+21)
 */
export function calculatePayoutDate(eventEndDate: Date): Date {
  const payoutDate = new Date(eventEndDate)
  payoutDate.setDate(payoutDate.getDate() + PAYOUTS.DELAY_DAYS)
  return payoutDate
}

/**
 * Valide un prix de ticket
 */
export function isValidTicketPrice(price: number): boolean {
  return price >= TICKETS.MIN_PRICE && price <= TICKETS.MAX_PRICE
}

/**
 * Valide une capacité d'événement
 */
export function isValidCapacity(capacity: number): boolean {
  return capacity >= TICKETS.MIN_CAPACITY && capacity <= TICKETS.MAX_CAPACITY
}

/**
 * Vérifie si un payout est éligible
 */
export function isPayoutEligible(amount: number): boolean {
  return amount >= PAYOUTS.MIN_AMOUNT
}

/**
 * Formate un prix en euros
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Formate une date
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(d)
}

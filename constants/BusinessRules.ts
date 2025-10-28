/**
 * Business Rules and Constants for VyBzzZ Platform
 *
 * All business logic constants in one place for easy maintenance.
 * These values drive the entire platform's commission, pricing, and rules.
 */

// ============================================
// SUBSCRIPTION TIERS
// ============================================

export const SUBSCRIPTION_TIERS = {
  STARTER: {
    id: 'starter' as const,
    name: 'Starter',
    price: 19.99,
    artistShare: 0.5, // Artist keeps 50%
    platformShare: 0.5, // Platform keeps 50%
    minTicketPrice: 5,
    maxTicketPrice: 12,
    features: [
      '50/50 revenue split',
      'Tickets: 5-12¬',
      'Événements illimités',
      'Dashboard analytics',
      'Support email',
    ],
  },
  PRO: {
    id: 'pro' as const,
    name: 'Pro',
    price: 59.99,
    artistShare: 0.6, // Artist keeps 60%
    platformShare: 0.4, // Platform keeps 40%
    minTicketPrice: 8,
    maxTicketPrice: 18,
    features: [
      '60/40 revenue split',
      'Tickets: 8-18¬',
      'Événements illimités',
      'Dashboard analytics avancé',
      'Support prioritaire',
      'Badge "Pro"',
    ],
  },
  ELITE: {
    id: 'elite' as const,
    name: 'Elite',
    price: 129.99,
    artistShare: 0.7, // Artist keeps 70%
    platformShare: 0.3, // Platform keeps 30%
    minTicketPrice: 12,
    maxTicketPrice: 25,
    features: [
      '70/30 revenue split',
      'Tickets: 12-25¬',
      'Événements illimités',
      'Dashboard premium',
      'Support VIP 24/7',
      'Badge "Elite"',
      'Promotion homepage',
    ],
  },
} as const

export const TRIAL_PERIOD_DAYS = 14 // 14-day free trial for all artists

// ============================================
// HAPPY HOUR
// ============================================

export const HAPPY_HOUR = {
  dayOfWeek: 3, // Wednesday (0 = Sunday, 1 = Monday, ..., 3 = Wednesday)
  hour: 20, // 20:00 (8 PM)
  price: 4.99, // Special price during Happy Hour
  duration: 60, // minutes
} as const

// ============================================
// TIPS (POURBOIRES)
// ============================================

export const TIPS = {
  artistShare: 0.9, // Artist receives 90%
  platformFee: 0.1, // Platform keeps 10%
  minAmount: 1, // Minimum tip: 1¬
  maxAmount: 500, // Maximum tip: 500¬
  suggestedAmounts: [2, 5, 10, 20, 50], // Quick tip buttons
} as const

// ============================================
// APPORTEURS D'AFFAIRES (AA)
// ============================================

export const APPORTEUR = {
  investmentCost: 2997, // Initial investment: 2,997¬
  monthlyFee: 19.99, // Monthly subscription: 19.99¬
  commissions: {
    level1: 0.025, // 2.5% on direct referrals
    level2: 0.015, // 1.5% on level 2
    level3: 0.01, // 1% on level 3
  },
  maxLevels: 3, // Maximum hierarchy depth
} as const

// ============================================
// RESPONSABLES RÉGIONAUX (RR)
// ============================================

export const RESPONSABLE_REGIONAL = {
  basic: {
    investmentCost: 4997, // 4,997¬
    commissionRate: 0.05, // 5% on all tickets in region
  },
  premium: {
    investmentCost: 9997, // 9,997¬
    commissionRate: 0.3, // 30% on all tickets in region
  },
} as const

// ============================================
// PAYOUTS
// ============================================

export const PAYOUTS = {
  delayDays: 21, // J+21: Payout 21 days after event ends
  minAmount: 10, // Minimum payout amount: 10¬
  currency: 'eur',
  cronSchedule: '0 2 * * *', // Daily at 2 AM
} as const

// ============================================
// GAMIFICATION
// ============================================

export const GAMIFICATION = {
  miles: {
    perTicketPurchase: 10, // 10 miles per ticket
    perEventAttended: 50, // 50 miles per event attended
    perTipSent: 5, // 5 miles per tip sent
    perReferral: 100, // 100 miles per referral
    perShare: 5, // 5 miles per share
  },
  badges: {
    categories: [
      'first_timer', // First event attended
      'regular', // 5 events attended
      'super_fan', // 20 events attended
      'generous', // 50¬ in tips sent
      'social', // 10 shares
      'recruiter', // 5 referrals
    ],
  },
  vybzzzCoins: {
    enabled: false, // Phase 2 feature
    conversionRate: 100, // 100 miles = 1 VyBzzZ Coin
  },
} as const

// ============================================
// COMMISSION RULES
// ============================================

export const COMMISSION_RULES = {
  // VyBzzZ pays ALL commissions, never the artists
  paidBy: 'platform' as const,

  // AA commissions calculated on ticket price
  aaCalculationBase: 'ticket_price' as const,

  // RR commissions calculated on platform share
  rrCalculationBase: 'platform_share' as const,

  // Commission status lifecycle
  statuses: ['pending', 'processing', 'paid', 'failed'] as const,
} as const

// ============================================
// EVENTS
// ============================================

export const EVENTS = {
  maxAttendeesDefault: 10000, // Default max attendees
  statusOptions: ['draft', 'scheduled', 'live', 'ended', 'cancelled'] as const,
  streamPlatforms: ['youtube', 'aws_ivs', '100ms'] as const,
  defaultStreamPlatform: 'youtube' as const, // YouTube Live for David Guetta
} as const

// ============================================
// REFERRAL SYSTEM
// ============================================

export const REFERRAL = {
  fanReferralBonus: 5, // 5¬ credit for both referrer and referred
  shareToUnlock: {
    enabled: true,
    requiredShares: 3, // Share to 3 friends to unlock content
    reward: 50, // 50 miles reward
  },
} as const

// ============================================
// WATCH PARTIES (PHASE 2)
// ============================================

export const WATCH_PARTIES = {
  enabled: false, // Phase 2 feature
  maxParticipants: 50,
  minParticipants: 3,
  gpsRadiusMeters: 5000, // 5km radius for local watch parties
} as const

// ============================================
// AI FEATURES (PHASE 2)
// ============================================

export const AI_FEATURES = {
  shorts: {
    enabled: false, // Phase 2
    minDuration: 15, // seconds
    maxDuration: 60, // seconds
    autoGenerationDelay: 3600, // 1 hour after event ends
  },
  highlights: {
    detectionThreshold: 0.8, // AI confidence threshold
    maxHighlightsPerEvent: 10,
  },
} as const

// ============================================
// SECURITY
// ============================================

export const SECURITY = {
  qrCodeExpiry: 24, // hours - QR codes expire 24h after event
  maxLoginAttempts: 5,
  sessionDuration: 30, // days
  passwordMinLength: 8,
} as const

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION = {
  event: {
    titleMinLength: 3,
    titleMaxLength: 100,
    descriptionMaxLength: 5000,
  },
  profile: {
    stageNameMinLength: 2,
    stageNameMaxLength: 50,
    bioMaxLength: 1000,
  },
  tip: {
    messageMaxLength: 500,
  },
} as const

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get subscription tier configuration by tier ID
 */
export function getSubscriptionTier(tier: 'starter' | 'pro' | 'elite') {
  return SUBSCRIPTION_TIERS[tier.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS]
}

/**
 * Check if a time is during Happy Hour
 */
export function isHappyHour(date: Date): boolean {
  return date.getDay() === HAPPY_HOUR.dayOfWeek && date.getHours() === HAPPY_HOUR.hour
}

/**
 * Validate ticket price for a subscription tier
 */
export function isValidTicketPrice(price: number, tier: 'starter' | 'pro' | 'elite'): boolean {
  const tierConfig = getSubscriptionTier(tier)
  return price >= tierConfig.minTicketPrice && price <= tierConfig.maxTicketPrice
}

/**
 * Calculate artist revenue from ticket sale
 */
export function calculateArtistRevenue(ticketPrice: number, tier: 'starter' | 'pro' | 'elite'): number {
  const tierConfig = getSubscriptionTier(tier)
  return ticketPrice * tierConfig.artistShare
}

/**
 * Calculate platform revenue from ticket sale
 */
export function calculatePlatformRevenue(ticketPrice: number, tier: 'starter' | 'pro' | 'elite'): number {
  const tierConfig = getSubscriptionTier(tier)
  return ticketPrice * tierConfig.platformShare
}

/**
 * Calculate AA commissions (3 levels)
 */
export function calculateAACommissions(ticketPrice: number): {
  level1: number
  level2: number
  level3: number
  total: number
} {
  const level1 = ticketPrice * APPORTEUR.commissions.level1
  const level2 = ticketPrice * APPORTEUR.commissions.level2
  const level3 = ticketPrice * APPORTEUR.commissions.level3

  return {
    level1,
    level2,
    level3,
    total: level1 + level2 + level3,
  }
}

/**
 * Calculate RR commission
 */
export function calculateRRCommission(
  platformRevenue: number,
  isBasic: boolean
): number {
  const rate = isBasic
    ? RESPONSABLE_REGIONAL.basic.commissionRate
    : RESPONSABLE_REGIONAL.premium.commissionRate
  return platformRevenue * rate
}

/**
 * Calculate tip amounts (artist receives 90%, platform 10%)
 */
export function calculateTipDistribution(tipAmount: number): {
  artistAmount: number
  platformFee: number
} {
  return {
    artistAmount: tipAmount * TIPS.artistShare,
    platformFee: tipAmount * TIPS.platformFee,
  }
}

/**
 * Calculate payout date (J+21)
 */
export function calculatePayoutDate(eventEndDate: Date): Date {
  const payoutDate = new Date(eventEndDate)
  payoutDate.setDate(payoutDate.getDate() + PAYOUTS.delayDays)
  return payoutDate
}

/**
 * Calculate miles earned for a ticket purchase
 */
export function calculateMilesForTicket(ticketPrice: number): number {
  // Base miles + bonus for higher prices
  return GAMIFICATION.miles.perTicketPurchase + Math.floor(ticketPrice / 10)
}

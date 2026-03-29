// Complete TypeScript Types for VyBzzZ Mobile App
// Shared between React Native app and backend

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type UserType = 'fan' | 'artist' | 'aa' | 'rr' | 'room_manager'

export type SubscriptionTier = 'starter' | 'pro' | 'elite'

export type EventStatus = 'draft' | 'scheduled' | 'live' | 'ended' | 'cancelled'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export type StreamType = 'youtube' | 'custom'

export type CommissionStatus = 'pending' | 'paid' | 'cancelled'

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type InteractionType = 'view' | 'like' | 'share'

export type QuestType = 'daily' | 'weekly' | 'special'

export type RecipientType = 'aa' | 'rr'

// ============================================
// SUBSCRIPTION TIERS CONFIG
// ============================================

export interface SubscriptionTierConfig {
  tier: SubscriptionTier
  price: number // Monthly price in EUR
  commissionRate: number // Artist keeps (0.5 = 50%, 0.6 = 60%, 0.7 = 70%)
  vybzzzRate: number // VyBzzZ keeps (0.5 = 50%, 0.4 = 40%, 0.3 = 30%)
  minTicketPrice: number
  maxTicketPrice: number
  features: string[]
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierConfig> = {
  starter: {
    tier: 'starter',
    price: 19.99,
    commissionRate: 0.50,
    vybzzzRate: 0.50,
    minTicketPrice: 5,
    maxTicketPrice: 12,
    features: ['Basic analytics', 'Standard visibility'],
  },
  pro: {
    tier: 'pro',
    price: 59.99,
    commissionRate: 0.60,
    vybzzzRate: 0.40,
    minTicketPrice: 8,
    maxTicketPrice: 18,
    features: ['Advanced analytics', 'Priority visibility', 'AI promo tools'],
  },
  elite: {
    tier: 'elite',
    price: 129.99,
    commissionRate: 0.70,
    vybzzzRate: 0.30,
    minTicketPrice: 12,
    maxTicketPrice: 25,
    features: ['Full analytics', 'Maximum visibility', 'Dedicated support', 'AI promo tools'],
  },
}

// ============================================
// RR/AA CONFIG
// ============================================

export interface ApporteurConfig {
  investmentCost: number
  monthlyFee: number
  level1Rate: number // 2.5%
  level2Rate: number // 1.5%
  level3Rate: number // 1%
}

export const APPORTEUR_CONFIG: ApporteurConfig = {
  investmentCost: 2997,
  monthlyFee: 19.99,
  level1Rate: 0.025,
  level2Rate: 0.015,
  level3Rate: 0.01,
}

export interface ResponsableRegionalConfig {
  tier: 'basic' | 'premium'
  investmentCost: number
  monthlyFee: number
  commissionRate: number
}

export const RR_TIERS: Record<'basic' | 'premium', ResponsableRegionalConfig> = {
  basic: {
    tier: 'basic',
    investmentCost: 4997,
    monthlyFee: 19.99,
    commissionRate: 0.05, // 5%
  },
  premium: {
    tier: 'premium',
    investmentCost: 9997,
    monthlyFee: 19.99,
    commissionRate: 0.30, // 30%
  },
}

// ============================================
// DATABASE MODELS
// ============================================

export interface User {
  id: string
  email: string
  phone: string | null
  full_name: string
  avatar_url: string | null
  user_type: UserType
  created_at: string
  updated_at: string
  last_login_at: string | null
  is_active: boolean
  metadata: Record<string, any>
}

export interface Artist {
  id: string
  stage_name: string
  bio: string | null
  genre: string[]
  instagram_handle: string | null
  tiktok_handle: string | null
  spotify_url: string | null
  youtube_url: string | null

  subscription_tier: SubscriptionTier
  subscription_starts_at: string | null
  subscription_ends_at: string | null
  trial_ends_at: string | null

  stripe_account_id: string | null
  stripe_account_completed: boolean
  stripe_customer_id: string | null

  total_events: number
  total_revenue: number
  total_followers: number

  visibility_pack: 'basic' | 'advanced' | 'premium' | null
  visibility_pack_expires_at: string | null

  is_verified: boolean
  created_at: string

  // Joined data
  user?: User
}

export interface Fan {
  id: string
  stripe_customer_id: string | null
  referral_code: string
  referred_by_code: string | null
  referral_discount_used: boolean

  total_miles: number
  level: number
  badges: string[] // Array of badge IDs

  created_at: string

  // Joined data
  user?: User
}

export interface Apporteur {
  id: string
  investment_paid: boolean
  investment_date: string | null
  subscription_active: boolean
  subscription_starts_at: string | null

  parent_aa_id: string | null
  grandparent_aa_id: string | null

  total_referrals: number
  total_earnings: number

  commission_level_1_rate: number
  commission_level_2_rate: number
  commission_level_3_rate: number

  is_active: boolean
  created_at: string

  // Joined data
  user?: User
  parent?: Apporteur
  grandparent?: Apporteur
}

export interface ResponsableRegional {
  id: string
  tier: 'basic' | 'premium'
  investment_paid: boolean
  investment_date: string | null
  subscription_active: boolean

  region_name: string
  region_code: string | null
  region_bounds: any | null // GeoJSON

  commission_rate: number

  total_artists_in_region: number
  total_events_in_region: number
  total_earnings: number

  is_active: boolean
  created_at: string

  // Joined data
  user?: User
}

export interface Event {
  id: string
  artist_id: string

  title: string
  description: string | null
  cover_image_url: string | null

  ticket_price: number
  min_price: number | null
  max_price: number | null

  scheduled_at: string
  duration_minutes: number | null
  timezone: string

  stream_type: StreamType
  youtube_video_id: string | null
  stream_url: string | null
  stream_key: string | null

  status: EventStatus

  max_attendees: number | null
  current_attendees: number

  total_revenue: number
  total_tips: number
  peak_viewers: number

  is_hybrid: boolean
  physical_location: string | null
  physical_location_coords: any | null

  tags: string[]
  metadata: Record<string, any>

  created_at: string
  updated_at: string

  // Joined data
  artist?: Artist & { user?: User }
}

export interface Ticket {
  id: string
  event_id: string
  user_id: string

  purchase_price: number
  referral_discount_applied: boolean
  referral_code_used: string | null

  aa_id: string | null
  rr_id: string | null

  stripe_payment_intent_id: string | null
  payment_status: PaymentStatus

  qr_code: string
  access_granted: boolean
  accessed_at: string | null

  purchased_at: string

  // Joined data
  event?: Event
  user?: User
}

export interface Tip {
  id: string
  event_id: string | null
  from_user_id: string
  to_artist_id: string

  amount: number
  message: string | null

  stripe_payment_intent_id: string | null
  payment_status: PaymentStatus

  created_at: string

  // Joined data
  event?: Event
  from_user?: User
  to_artist?: Artist
}

export interface Commission {
  id: string
  ticket_id: string
  recipient_id: string
  recipient_type: RecipientType

  commission_level: number | null // 1, 2, or 3 for AA
  commission_rate: number
  commission_amount: number

  status: CommissionStatus
  paid_at: string | null

  created_at: string

  // Joined data
  ticket?: Ticket
}

export interface Payout {
  id: string
  artist_id: string

  period_start: string
  period_end: string

  ticket_revenue: number
  tip_revenue: number
  total_amount: number

  vybzzz_commission_rate: number
  vybzzz_commission_amount: number

  net_amount: number

  stripe_transfer_id: string | null

  status: PayoutStatus
  scheduled_at: string // J+21
  completed_at: string | null

  created_at: string

  // Joined data
  artist?: Artist
}

export interface Short {
  id: string
  event_id: string
  artist_id: string

  title: string
  video_url: string
  thumbnail_url: string | null
  duration_seconds: number

  highlight_type: string | null
  timestamp_in_concert: number | null
  ai_confidence_score: number | null

  views: number
  likes: number
  shares: number

  is_published: boolean

  created_at: string

  // Joined data
  event?: Event
  artist?: Artist & { user?: User }
}

export interface ShortInteraction {
  id: string
  short_id: string
  user_id: string
  interaction_type: InteractionType
  created_at: string
}

export interface EventMessage {
  id: string
  event_id: string
  user_id: string
  message: string
  created_at: string

  // Joined data
  user?: User
}

export interface Follow {
  id: string
  fan_id: string
  artist_id: string
  created_at: string

  // Joined data
  fan?: Fan & { user?: User }
  artist?: Artist & { user?: User }
}

export interface Badge {
  id: string
  code: string
  name: string
  description: string | null
  icon_url: string | null
  criteria: Record<string, any>
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string

  // Joined data
  badge?: Badge
}

export interface Quest {
  id: string
  title: string
  description: string | null
  quest_type: QuestType
  miles_reward: number
  criteria: Record<string, any>
  starts_at: string
  ends_at: string
  is_active: boolean
  created_at: string
}

export interface UserQuestProgress {
  id: string
  user_id: string
  quest_id: string
  progress: number
  completed: boolean
  completed_at: string | null
  created_at: string

  // Joined data
  quest?: Quest
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// Auth
export interface SignupRequest {
  email: string
  password: string
  full_name: string
  user_type: UserType
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  session: {
    access_token: string
    refresh_token: string
  }
}

// Events
export interface CreateEventRequest {
  title: string
  description?: string
  cover_image_url?: string
  ticket_price: number
  scheduled_at: string
  duration_minutes?: number
  youtube_video_id?: string
  max_attendees?: number
  tags?: string[]
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus
}

// Tickets
export interface PurchaseTicketRequest {
  event_id: string
  referral_code?: string
}

export interface PurchaseTicketResponse {
  ticket_id: string
  stripe_client_secret: string
  amount: number
}

// Tips
export interface SendTipRequest {
  artist_id: string
  event_id?: string
  amount: number
  message?: string
}

export interface SendTipResponse {
  tip_id: string
  stripe_client_secret: string
}

// Shorts
export interface GetShortsRequest {
  limit?: number
  offset?: number
  artist_id?: string
}

export interface GetShortsResponse {
  shorts: Short[]
  total: number
  has_more: boolean
}

// Analytics (for artists)
export interface ArtistAnalytics {
  total_events: number
  total_revenue: number
  total_tickets_sold: number
  total_tips: number
  total_followers: number
  average_ticket_price: number
  peak_viewers_all_time: number

  upcoming_events: Event[]
  past_events: Event[]

  revenue_by_month: {
    month: string
    revenue: number
  }[]

  top_events: {
    event: Event
    revenue: number
    tickets_sold: number
  }[]
}

// Dashboard
export interface FanDashboard {
  upcoming_events: Ticket[]
  past_events: Ticket[]
  followed_artists: Artist[]
  total_miles: number
  level: number
  badges: UserBadge[]
  active_quests: UserQuestProgress[]
}

export interface ArtistDashboard {
  profile: Artist
  analytics: ArtistAnalytics
  upcoming_payouts: Payout[]
  pending_payout_amount: number
}

export interface ApporteurDashboard {
  profile: Apporteur
  total_referrals: number
  total_earnings: number
  pending_commissions: Commission[]
  paid_commissions: Commission[]
  referred_artists: Artist[]
}

export interface RRDashboard {
  profile: ResponsableRegional
  region_stats: {
    total_artists: number
    total_events: number
    total_tickets_sold: number
  }
  total_earnings: number
  pending_commissions: Commission[]
  artists_in_region: Artist[]
}

// ============================================
// UTILITY TYPES
// ============================================

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface ApiError {
  error: string
  message: string
  code?: string
}

export interface ApiSuccess<T = any> {
  success: true
  data: T
}

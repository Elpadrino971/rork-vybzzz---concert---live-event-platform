// Database Types for VyBzzZ Platform
// These types match the Supabase schema

export type UserType = 'fan' | 'artist' | 'affiliate'
export type EventType = 'live' | 'vod' | 'hybrid'
export type EventStatus = 'draft' | 'scheduled' | 'live' | 'ended' | 'cancelled'
export type TicketStatus = 'pending' | 'confirmed' | 'used' | 'refunded'
export type TransactionType = 'ticket_purchase' | 'tip' | 'commission' | 'payout'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type TipStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type CommissionStatus = 'pending' | 'paid' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  user_type: UserType
  stripe_account_id: string | null
  stripe_customer_id: string | null
  bio: string | null
  instagram_handle: string | null
  twitter_handle: string | null
  website_url: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Artist {
  id: string
  stage_name: string
  genre: string[]
  verified_artist: boolean
  total_events: number
  total_revenue: number
  stripe_connect_completed: boolean
  created_at: string
}

export interface Event {
  id: string
  artist_id: string
  title: string
  description: string | null
  event_type: EventType
  scheduled_at: string
  duration_minutes: number | null
  ticket_price: number
  happy_hour_price: number | null
  max_attendees: number | null
  current_attendees: number
  cover_image_url: string | null
  stream_key: string | null
  stream_url: string | null
  status: EventStatus
  created_at: string
  updated_at: string
  artist?: Artist & Profile
}

export interface Ticket {
  id: string
  event_id: string
  user_id: string
  affiliate_id: string | null
  purchase_price: number
  is_happy_hour: boolean
  payment_intent_id: string | null
  status: TicketStatus
  purchased_at: string
  used_at: string | null
  event?: Event
  user?: Profile
}

export interface Tip {
  id: string
  from_user_id: string
  to_artist_id: string
  event_id: string | null
  amount: number
  message: string | null
  payment_intent_id: string | null
  status: TipStatus
  created_at: string
  from_user?: Profile
  to_artist?: Artist & Profile
  event?: Event
}

export interface Transaction {
  id: string
  user_id: string | null
  artist_id: string | null
  transaction_type: TransactionType
  amount: number
  currency: string
  stripe_payment_id: string | null
  stripe_transfer_id: string | null
  status: TransactionStatus
  metadata: any
  created_at: string
}

export interface Affiliate {
  id: string
  referral_code: string
  parent_affiliate_id: string | null
  grandparent_affiliate_id: string | null
  total_referrals: number
  total_earnings: number
  level: number
  is_active: boolean
  created_at: string
  profile?: Profile
  parent?: Affiliate
  grandparent?: Affiliate
}

export interface AffiliateCommission {
  id: string
  affiliate_id: string
  ticket_id: string
  commission_level: number
  commission_rate: number
  commission_amount: number
  status: CommissionStatus
  paid_at: string | null
  created_at: string
  affiliate?: Affiliate
  ticket?: Ticket
}

export interface EventAttendee {
  id: string
  event_id: string
  user_id: string
  joined_at: string
  left_at: string | null
  watch_duration_seconds: number | null
  user?: Profile
}

export interface EventMessage {
  id: string
  event_id: string
  user_id: string
  message: string
  created_at: string
  user?: Profile
}

// Happy Hour Configuration
export interface HappyHourConfig {
  day: number // 0-6, where 0 is Sunday, 3 is Wednesday
  startTime: string // Format: "HH:MM"
  price: number
}

export const HAPPY_HOUR_CONFIG: HappyHourConfig = {
  day: 3, // Wednesday
  startTime: '20:00',
  price: 4.99,
}

// Affiliate Commission Rates
export interface CommissionRates {
  level1: number // 2.5%
  level2: number // 1.5%
  level3: number // 1%
}

export const COMMISSION_RATES: CommissionRates = {
  level1: 0.025,
  level2: 0.015,
  level3: 0.01,
}

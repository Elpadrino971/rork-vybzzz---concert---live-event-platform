-- ============================================
-- DATABASE PERFORMANCE INDEXES
-- ============================================
-- These indexes dramatically improve query performance
-- on frequently accessed columns

-- ============================================
-- EVENTS TABLE
-- ============================================

-- Index for artist's events (used in artist dashboard, artist profile)
CREATE INDEX IF NOT EXISTS idx_events_artist_id
ON events(artist_id);

-- Index for event status and scheduled date (used in event listings, upcoming events)
CREATE INDEX IF NOT EXISTS idx_events_status_scheduled
ON events(status, scheduled_at DESC);

-- Index for event search by date range (used in calendar view)
CREATE INDEX IF NOT EXISTS idx_events_scheduled_at
ON events(scheduled_at DESC);

-- Composite index for artist's upcoming events
CREATE INDEX IF NOT EXISTS idx_events_artist_status_scheduled
ON events(artist_id, status, scheduled_at DESC);

-- ============================================
-- TICKETS TABLE
-- ============================================

-- Index for user's tickets (used in fan dashboard)
CREATE INDEX IF NOT EXISTS idx_tickets_user_id
ON tickets(user_id);

-- Index for event's tickets (used to count attendees)
CREATE INDEX IF NOT EXISTS idx_tickets_event_id
ON tickets(event_id);

-- Composite index for confirmed tickets by event (performance critical)
CREATE INDEX IF NOT EXISTS idx_tickets_event_status
ON tickets(event_id, status);

-- Index for payment intent lookups (used in webhook)
CREATE INDEX IF NOT EXISTS idx_tickets_payment_intent
ON tickets(payment_intent_id);

-- Index for affiliate tracking
CREATE INDEX IF NOT EXISTS idx_tickets_affiliate_id
ON tickets(affiliate_id)
WHERE affiliate_id IS NOT NULL;

-- ============================================
-- TIPS TABLE
-- ============================================

-- Index for artist's tips (used in artist dashboard)
CREATE INDEX IF NOT EXISTS idx_tips_artist_id
ON tips(to_artist_id);

-- Composite index for completed tips to artist (revenue calculation)
CREATE INDEX IF NOT EXISTS idx_tips_artist_status
ON tips(to_artist_id, status)
WHERE status = 'completed';

-- Index for user's sent tips (used in fan dashboard)
CREATE INDEX IF NOT EXISTS idx_tips_user_id
ON tips(from_user_id);

-- Index for payment intent lookups (used in webhook)
CREATE INDEX IF NOT EXISTS idx_tips_payment_intent
ON tips(payment_intent_id);

-- Index for recent tips by date
CREATE INDEX IF NOT EXISTS idx_tips_created_at
ON tips(created_at DESC);

-- ============================================
-- ARTISTS TABLE
-- ============================================

-- Index for artist search by stage name
CREATE INDEX IF NOT EXISTS idx_artists_stage_name
ON artists(stage_name);

-- Index for filtering by genre
CREATE INDEX IF NOT EXISTS idx_artists_genre
ON artists(genre)
WHERE genre IS NOT NULL;

-- Index for filtering by country
CREATE INDEX IF NOT EXISTS idx_artists_country
ON artists(country)
WHERE country IS NOT NULL;

-- Index for sorting by followers
CREATE INDEX IF NOT EXISTS idx_artists_followers
ON artists(total_followers DESC);

-- Index for Stripe Connect status
CREATE INDEX IF NOT EXISTS idx_artists_stripe_connect
ON artists(stripe_connect_completed)
WHERE stripe_connect_completed = true;

-- ============================================
-- AFFILIATES TABLE
-- ============================================

-- Index for referral code lookups (used in ticket purchase)
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code
ON affiliates(referral_code);

-- Index for active affiliates
CREATE INDEX IF NOT EXISTS idx_affiliates_active
ON affiliates(is_active)
WHERE is_active = true;

-- Index for parent affiliate tracking
CREATE INDEX IF NOT EXISTS idx_affiliates_parent_id
ON affiliates(parent_affiliate_id)
WHERE parent_affiliate_id IS NOT NULL;

-- ============================================
-- AFFILIATE_COMMISSIONS TABLE
-- ============================================

-- Index for affiliate's commissions
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate_id
ON affiliate_commissions(affiliate_id);

-- Index for ticket commissions
CREATE INDEX IF NOT EXISTS idx_commissions_ticket_id
ON affiliate_commissions(ticket_id);

-- Composite index for pending commissions
CREATE INDEX IF NOT EXISTS idx_commissions_status
ON affiliate_commissions(affiliate_id, status)
WHERE status IN ('pending', 'confirmed');

-- ============================================
-- PAYOUTS TABLE
-- ============================================

-- Index for artist's payouts
CREATE INDEX IF NOT EXISTS idx_payouts_artist_id
ON payouts(artist_id);

-- Index for event's payout
CREATE INDEX IF NOT EXISTS idx_payouts_event_id
ON payouts(event_id);

-- Composite index for pending/processing payouts
CREATE INDEX IF NOT EXISTS idx_payouts_status_scheduled
ON payouts(status, scheduled_for)
WHERE status IN ('pending', 'processing');

-- Index for payout date
CREATE INDEX IF NOT EXISTS idx_payouts_scheduled_for
ON payouts(scheduled_for);

-- ============================================
-- ARTIST_FOLLOWERS TABLE
-- ============================================

-- Composite index for checking if user follows artist
CREATE INDEX IF NOT EXISTS idx_followers_fan_artist
ON artist_followers(fan_id, artist_id);

-- Index for artist's followers count
CREATE INDEX IF NOT EXISTS idx_followers_artist_id
ON artist_followers(artist_id);

-- Index for user's following list
CREATE INDEX IF NOT EXISTS idx_followers_fan_id
ON artist_followers(fan_id);

-- Index for recent follows
CREATE INDEX IF NOT EXISTS idx_followers_followed_at
ON artist_followers(followed_at DESC);

-- ============================================
-- SHORTS TABLE
-- ============================================

-- Index for artist's shorts
CREATE INDEX IF NOT EXISTS idx_shorts_artist_id
ON shorts(artist_id);

-- Index for shorts feed (sorted by date)
CREATE INDEX IF NOT EXISTS idx_shorts_created_at
ON shorts(created_at DESC);

-- Index for popular shorts
CREATE INDEX IF NOT EXISTS idx_shorts_view_count
ON shorts(view_count DESC);

-- Composite index for artist's recent shorts
CREATE INDEX IF NOT EXISTS idx_shorts_artist_created
ON shorts(artist_id, created_at DESC);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================

-- Index for user transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
ON transactions(user_id);

-- Index for artist transactions
CREATE INDEX IF NOT EXISTS idx_transactions_artist_id
ON transactions(artist_id);

-- Index for Stripe payment ID lookups
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment
ON transactions(stripe_payment_id);

-- Index for transaction type filtering
CREATE INDEX IF NOT EXISTS idx_transactions_type
ON transactions(transaction_type);

-- Index for transaction status
CREATE INDEX IF NOT EXISTS idx_transactions_status
ON transactions(status);

-- Index for transaction date
CREATE INDEX IF NOT EXISTS idx_transactions_created_at
ON transactions(created_at DESC);

-- ============================================
-- WEBHOOK_EVENTS TABLE
-- ============================================

-- Index for Stripe event ID lookups (idempotency check)
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id
ON webhook_events(stripe_event_id);

-- Index for event type analytics
CREATE INDEX IF NOT EXISTS idx_webhook_events_type
ON webhook_events(event_type);

-- Index for cleanup queries (old events)
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
ON webhook_events(processed_at);

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON profiles(email);

-- Index for Stripe customer ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
ON profiles(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- Index for Stripe account ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_account
ON profiles(stripe_account_id)
WHERE stripe_account_id IS NOT NULL;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON INDEX idx_events_artist_id IS 'Fast lookup of events by artist';
COMMENT ON INDEX idx_tickets_payment_intent IS 'Critical for webhook performance';
COMMENT ON INDEX idx_affiliates_referral_code IS 'Fast referral code validation';
COMMENT ON INDEX idx_webhook_events_stripe_id IS 'Idempotency check performance';

-- ============================================
-- ANALYZE TABLES
-- ============================================
-- Update statistics for query planner

ANALYZE events;
ANALYZE tickets;
ANALYZE tips;
ANALYZE artists;
ANALYZE affiliates;
ANALYZE affiliate_commissions;
ANALYZE payouts;
ANALYZE artist_followers;
ANALYZE shorts;
ANALYZE transactions;
ANALYZE webhook_events;
ANALYZE profiles;

-- VyBzzZ Complete Database Schema
-- Mobile-First Architecture with RR/AA System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (Base table for all user types)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('fan', 'artist', 'aa', 'rr', 'room_manager')) NOT NULL DEFAULT 'fan',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Artists (Extended info for artist users)
CREATE TABLE artists (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  bio TEXT,
  genre TEXT[],
  instagram_handle TEXT,
  tiktok_handle TEXT,
  spotify_url TEXT,
  youtube_url TEXT,

  -- Subscription tier
  subscription_tier TEXT CHECK (subscription_tier IN ('starter', 'pro', 'elite')) NOT NULL DEFAULT 'starter',
  subscription_starts_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE, -- 14 days free trial

  -- Stripe
  stripe_account_id TEXT UNIQUE,
  stripe_account_completed BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,

  -- Stats
  total_events INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_followers INTEGER DEFAULT 0,

  -- Visibility packs (J+30)
  visibility_pack TEXT CHECK (visibility_pack IN ('basic', 'advanced', 'premium')),
  visibility_pack_expires_at TIMESTAMP WITH TIME ZONE,

  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fans (Extended info for fan users)
CREATE TABLE fans (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  referral_code TEXT UNIQUE, -- For 5€/5€ referral
  referred_by_code TEXT, -- Who referred them
  referral_discount_used BOOLEAN DEFAULT false,

  -- Gamification
  total_miles INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Apporteurs d'Affaires (AA)
CREATE TABLE apporteurs (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  investment_paid BOOLEAN DEFAULT false,
  investment_date TIMESTAMP WITH TIME ZONE,
  subscription_active BOOLEAN DEFAULT true,
  subscription_starts_at TIMESTAMP WITH TIME ZONE,

  -- Hierarchy (3 levels)
  parent_aa_id UUID REFERENCES apporteurs(id),
  grandparent_aa_id UUID REFERENCES apporteurs(id),

  -- Stats
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,

  -- Commission rates (2.5% / 1.5% / 1%)
  commission_level_1_rate DECIMAL(5, 4) DEFAULT 0.025,
  commission_level_2_rate DECIMAL(5, 4) DEFAULT 0.015,
  commission_level_3_rate DECIMAL(5, 4) DEFAULT 0.01,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Responsables Régionaux (RR)
CREATE TABLE responsables_regionaux (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT CHECK (tier IN ('basic', 'premium')) NOT NULL,
  investment_paid BOOLEAN DEFAULT false,
  investment_date TIMESTAMP WITH TIME ZONE,
  subscription_active BOOLEAN DEFAULT true,

  -- Territory
  region_name TEXT NOT NULL,
  region_code TEXT, -- FR-IDF, FR-ARA, etc.
  region_bounds JSONB, -- GeoJSON polygon

  -- Commission rates (5% or 30% based on tier)
  commission_rate DECIMAL(5, 4) NOT NULL, -- 0.05 or 0.30

  -- Stats
  total_artists_in_region INTEGER DEFAULT 0,
  total_events_in_region INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- EVENTS & TICKETS
-- ============================================

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,

  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,

  -- Pricing based on tier
  ticket_price DECIMAL(10, 2) NOT NULL,
  min_price DECIMAL(10, 2), -- Minimum allowed for tier
  max_price DECIMAL(10, 2), -- Maximum allowed for tier

  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  timezone TEXT DEFAULT 'Europe/Paris',

  -- Streaming
  stream_type TEXT CHECK (stream_type IN ('youtube', 'custom')) DEFAULT 'youtube',
  youtube_video_id TEXT,
  stream_url TEXT,
  stream_key TEXT,

  -- Status
  status TEXT CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'cancelled')) DEFAULT 'draft',

  -- Capacity
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,

  -- Stats
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  total_tips DECIMAL(10, 2) DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,

  -- Location (if physical component)
  is_hybrid BOOLEAN DEFAULT false,
  physical_location TEXT,
  physical_location_coords POINT,

  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Purchase info
  purchase_price DECIMAL(10, 2) NOT NULL,
  referral_discount_applied BOOLEAN DEFAULT false,
  referral_code_used TEXT,

  -- Attribution (who gets commissions)
  aa_id UUID REFERENCES apporteurs(id),
  rr_id UUID REFERENCES responsables_regionaux(id),

  -- Payment
  stripe_payment_intent_id TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',

  -- Access
  qr_code TEXT UNIQUE,
  access_granted BOOLEAN DEFAULT false,
  accessed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(event_id, user_id) -- One ticket per user per event
);

-- Tips (Pourboires)
CREATE TABLE tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  to_artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,

  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  message TEXT,

  -- Payment
  stripe_payment_intent_id TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'completed',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- COMMISSIONS & PAYOUTS
-- ============================================

-- Commissions (for AA and RR)
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,

  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  recipient_type TEXT CHECK (recipient_type IN ('aa', 'rr')) NOT NULL,

  -- Commission details
  commission_level INTEGER CHECK (commission_level BETWEEN 1 AND 3), -- For AA: 1, 2, or 3
  commission_rate DECIMAL(5, 4) NOT NULL,
  commission_amount DECIMAL(10, 2) NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Payouts (to artists - J+21)
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,

  -- Period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Amount breakdown
  ticket_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tip_revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,

  -- Commission kept by VyBzzZ (30-50% depending on tier)
  vybzzz_commission_rate DECIMAL(5, 4) NOT NULL,
  vybzzz_commission_amount DECIMAL(10, 2) NOT NULL,

  -- Net to artist
  net_amount DECIMAL(10, 2) NOT NULL,

  -- Stripe
  stripe_transfer_id TEXT,

  -- Status
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL, -- J+21
  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- DISCOVERY & SHORTS
-- ============================================

-- Shorts (Auto-generated from concerts)
CREATE TABLE shorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,

  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER NOT NULL,

  -- AI detection metadata
  highlight_type TEXT, -- 'drop', 'peak', 'crowd_reaction', etc.
  timestamp_in_concert INTEGER, -- Seconds from start of concert
  ai_confidence_score DECIMAL(3, 2), -- 0.00 to 1.00

  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,

  -- Status
  is_published BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Short Interactions (likes, views)
CREATE TABLE short_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  short_id UUID REFERENCES shorts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  interaction_type TEXT CHECK (interaction_type IN ('view', 'like', 'share')) NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(short_id, user_id, interaction_type)
);

-- ============================================
-- CHAT & SOCIAL
-- ============================================

-- Event Chat Messages
CREATE TABLE event_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  message TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Follows (fans following artists)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fan_id UUID REFERENCES fans(id) ON DELETE CASCADE NOT NULL,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(fan_id, artist_id)
);

-- ============================================
-- GAMIFICATION
-- ============================================

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- 'early_bee', 'fire_fan', etc.
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,

  -- Unlock criteria
  criteria JSONB NOT NULL, -- {type: 'concerts_attended', count: 10}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Badges (earned)
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,

  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(user_id, badge_id)
);

-- Quests (daily challenges)
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,

  -- Quest type
  quest_type TEXT CHECK (quest_type IN ('daily', 'weekly', 'special')) NOT NULL,

  -- Reward
  miles_reward INTEGER NOT NULL,

  -- Criteria
  criteria JSONB NOT NULL, -- {action: 'watch_shorts', count: 3}

  -- Active period
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Quest Progress
CREATE TABLE user_quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE NOT NULL,

  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(user_id, quest_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_artists_subscription_tier ON artists(subscription_tier);
CREATE INDEX idx_artists_stripe_account_id ON artists(stripe_account_id);
CREATE INDEX idx_events_artist_id ON events(artist_id);
CREATE INDEX idx_events_scheduled_at ON events(scheduled_at);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_aa_id ON tickets(aa_id);
CREATE INDEX idx_tickets_rr_id ON tickets(rr_id);
CREATE INDEX idx_tips_event_id ON tips(event_id);
CREATE INDEX idx_tips_to_artist_id ON tips(to_artist_id);
CREATE INDEX idx_commissions_recipient_id ON commissions(recipient_id);
CREATE INDEX idx_commissions_status ON commissions(status);
CREATE INDEX idx_payouts_artist_id ON payouts(artist_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_shorts_event_id ON shorts(event_id);
CREATE INDEX idx_shorts_artist_id ON shorts(artist_id);
CREATE INDEX idx_event_messages_event_id ON event_messages(event_id);
CREATE INDEX idx_follows_fan_id ON follows(fan_id);
CREATE INDEX idx_follows_artist_id ON follows(artist_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate unique referral code for fans
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM fans WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Generate unique QR code for tickets
CREATE OR REPLACE FUNCTION generate_qr_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'VYB-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 16));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE fans ENABLE ROW LEVEL SECURITY;
ALTER TABLE apporteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsables_regionaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Artists are viewable by everyone
CREATE POLICY "Artists viewable by everyone" ON artists
  FOR SELECT USING (true);

-- Artists can update their own info
CREATE POLICY "Artists can update own info" ON artists
  FOR UPDATE USING (auth.uid() = id);

-- Events are viewable by everyone
CREATE POLICY "Events viewable by everyone" ON events
  FOR SELECT USING (true);

-- Artists can create/update/delete their own events
CREATE POLICY "Artists can manage own events" ON events
  FOR ALL USING (auth.uid() = artist_id);

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Shorts are viewable by everyone
CREATE POLICY "Shorts viewable by everyone" ON shorts
  FOR SELECT USING (true);

-- Event messages viewable by ticket holders
CREATE POLICY "Messages viewable by ticket holders" ON event_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.event_id = event_messages.event_id
      AND tickets.user_id = auth.uid()
      AND tickets.payment_status = 'completed'
    )
  );

-- Users can send messages if they have a ticket
CREATE POLICY "Users can send messages with ticket" ON event_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.event_id = event_messages.event_id
      AND tickets.user_id = auth.uid()
      AND tickets.payment_status = 'completed'
    )
  );

-- COMMENT ON DATABASE SCHEMA
COMMENT ON TABLE users IS 'Base table for all user types (fan, artist, aa, rr, room_manager)';
COMMENT ON TABLE artists IS 'Extended info for artists with subscription tiers (starter 50/50, pro 60/40, elite 70/30)';
COMMENT ON TABLE apporteurs IS 'Apporteurs d''Affaires with 3-level commission system (2.5% / 1.5% / 1%)';
COMMENT ON TABLE responsables_regionaux IS 'Regional managers (basic 5%, premium 30% of region revenue)';
COMMENT ON TABLE payouts IS 'Automatic payouts to artists J+21 after event';
COMMENT ON TABLE shorts IS 'AI-generated highlight clips from concerts for discovery feed';

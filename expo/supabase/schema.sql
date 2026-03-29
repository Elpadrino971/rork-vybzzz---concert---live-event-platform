-- VyBzzZ Platform Database Schema
-- This file contains all the database tables and policies for the VyBzzZ platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT CHECK (user_type IN ('fan', 'artist', 'affiliate')) NOT NULL DEFAULT 'fan',
  stripe_account_id TEXT, -- For artists receiving payments
  stripe_customer_id TEXT, -- For fans making payments
  bio TEXT,
  instagram_handle TEXT,
  twitter_handle TEXT,
  website_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Artists Extended Info
CREATE TABLE artists (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  genre TEXT[],
  verified_artist BOOLEAN DEFAULT false,
  total_events INTEGER DEFAULT 0,
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  stripe_connect_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('live', 'vod', 'hybrid')) NOT NULL DEFAULT 'live',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  ticket_price DECIMAL(10, 2) NOT NULL,
  happy_hour_price DECIMAL(10, 2), -- Special price for Happy Hour (mercredi 20h)
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  cover_image_url TEXT,
  stream_key TEXT, -- AWS IVS stream key
  stream_url TEXT, -- Playback URL
  status TEXT CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'cancelled')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tickets Table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  affiliate_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Who referred this purchase
  purchase_price DECIMAL(10, 2) NOT NULL,
  is_happy_hour BOOLEAN DEFAULT false,
  payment_intent_id TEXT, -- Stripe Payment Intent ID
  status TEXT CHECK (status IN ('pending', 'confirmed', 'used', 'refunded')) DEFAULT 'confirmed',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, user_id) -- One ticket per user per event
);

-- Tips Table (Pourboires)
CREATE TABLE tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_artist_id UUID REFERENCES artists(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  message TEXT,
  payment_intent_id TEXT, -- Stripe Payment Intent ID
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions Table (All monetary transactions)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  transaction_type TEXT CHECK (transaction_type IN ('ticket_purchase', 'tip', 'commission', 'payout')) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  stripe_payment_id TEXT,
  stripe_transfer_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  metadata JSONB, -- Additional data like event_id, ticket_id, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Affiliates Table (Système d'affiliation à 3 niveaux)
CREATE TABLE affiliates (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  parent_affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL, -- Level 1
  grandparent_affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL, -- Level 2
  total_referrals INTEGER DEFAULT 0,
  total_earnings DECIMAL(10, 2) DEFAULT 0,
  level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 3),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Affiliate Commissions Table
CREATE TABLE affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  commission_level INTEGER CHECK (commission_level BETWEEN 1 AND 3) NOT NULL,
  commission_rate DECIMAL(5, 4) NOT NULL, -- Ex: 0.025 pour 2.5%
  commission_amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'cancelled')) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Event Attendees (Who's watching live)
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  left_at TIMESTAMP WITH TIME ZONE,
  watch_duration_seconds INTEGER,
  UNIQUE(event_id, user_id)
);

-- Messages/Chat Table (For live event chat)
CREATE TABLE event_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Artists Policies
CREATE POLICY "Artists are viewable by everyone" ON artists
  FOR SELECT USING (true);

CREATE POLICY "Artists can update their own info" ON artists
  FOR UPDATE USING (auth.uid() = id);

-- Events Policies
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Artists can create their own events" ON events
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own events" ON events
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own events" ON events
  FOR DELETE USING (auth.uid() = artist_id);

-- Tickets Policies
CREATE POLICY "Users can view their own tickets" ON tickets
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT artist_id FROM events WHERE id = event_id));

CREATE POLICY "Users can purchase tickets" ON tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tips Policies
CREATE POLICY "Users can view their sent tips" ON tips
  FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "Artists can view tips received" ON tips
  FOR SELECT USING (auth.uid() = to_artist_id);

CREATE POLICY "Users can send tips" ON tips
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Transactions Policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = artist_id);

-- Affiliates Policies
CREATE POLICY "Affiliates can view their own data" ON affiliates
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can become affiliates" ON affiliates
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Affiliate Commissions Policies
CREATE POLICY "Affiliates can view their own commissions" ON affiliate_commissions
  FOR SELECT USING (auth.uid() = affiliate_id);

-- Event Attendees Policies
CREATE POLICY "Users can view event attendees" ON event_attendees
  FOR SELECT USING (true);

CREATE POLICY "Users can join events" ON event_attendees
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Event Messages Policies
CREATE POLICY "Users can view event messages" ON event_messages
  FOR SELECT USING (true);

CREATE POLICY "Users can send messages" ON event_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_events_artist_id ON events(artist_id);
CREATE INDEX idx_events_scheduled_at ON events(scheduled_at);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_tickets_user_id ON tickets(user_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_affiliate_id ON tickets(affiliate_id);
CREATE INDEX idx_tips_to_artist_id ON tips(to_artist_id);
CREATE INDEX idx_tips_from_user_id ON tips(from_user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_artist_id ON transactions(artist_id);
CREATE INDEX idx_affiliate_commissions_affiliate_id ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_event_messages_event_id ON event_messages(event_id);

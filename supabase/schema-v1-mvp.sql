-- ========================================
-- VYBZZZ V1.0 MVP - DATABASE SCHEMA
-- ========================================
-- Simplifié pour lancement rapide
-- Seulement les tables essentielles

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: users
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('fan', 'artist')),
  full_name TEXT,
  avatar_url TEXT,

  -- Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_account_id TEXT UNIQUE, -- Pour les artistes (Stripe Connect)

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_stripe_account ON users(stripe_account_id);

-- ========================================
-- TABLE: events
-- ========================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Info événement
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Billetterie
  ticket_price DECIMAL(10,2) NOT NULL CHECK (ticket_price >= 1 AND ticket_price <= 100),
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  tickets_sold INTEGER DEFAULT 0 CHECK (tickets_sold >= 0),

  -- Streaming
  youtube_live_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended', 'cancelled')),

  -- Media
  image_url TEXT,
  thumbnail_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Contrainte : tickets vendus ne peut pas dépasser la capacité
  CONSTRAINT tickets_capacity_check CHECK (tickets_sold <= capacity)
);

-- Index pour performance
CREATE INDEX idx_events_artist ON events(artist_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_upcoming ON events(event_date, status) WHERE status = 'upcoming';

-- ========================================
-- TABLE: tickets
-- ========================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Achat
  email TEXT NOT NULL, -- Email de l'acheteur (peut être sans compte)
  price_paid DECIMAL(10,2) NOT NULL,

  -- Paiement Stripe
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_charge_id TEXT,

  -- Validation
  qr_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'refunded', 'cancelled')),
  used_at TIMESTAMP WITH TIME ZONE,

  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_email ON tickets(email);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX idx_tickets_stripe_payment ON tickets(stripe_payment_intent_id);

-- ========================================
-- TABLE: chat_messages
-- ========================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Message
  username TEXT NOT NULL, -- Nom affiché dans le chat
  message TEXT NOT NULL CHECK (LENGTH(message) <= 500),

  -- Modération
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_chat_event ON chat_messages(event_id, created_at DESC);
CREATE INDEX idx_chat_user ON chat_messages(user_id);

-- ========================================
-- TABLE: payouts
-- ========================================
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Montants
  gross_revenue DECIMAL(10,2) NOT NULL, -- Total des ventes
  artist_share DECIMAL(10,2) NOT NULL, -- 70% pour l'artiste
  platform_share DECIMAL(10,2) NOT NULL, -- 30% pour la plateforme

  -- Stripe
  stripe_payout_id TEXT UNIQUE,
  stripe_transfer_id TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),

  -- Dates
  event_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payout_date TIMESTAMP WITH TIME ZONE, -- J+21 après l'événement
  paid_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_payouts_event ON payouts(event_id);
CREATE INDEX idx_payouts_artist ON payouts(artist_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_date ON payouts(payout_date);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Policies pour users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Policies pour events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Artists can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = artist_id AND EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'artist'
  ));

CREATE POLICY "Artists can update their own events"
  ON events FOR UPDATE
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own events"
  ON events FOR DELETE
  USING (auth.uid() = artist_id);

-- Policies pour tickets
CREATE POLICY "Anyone can view tickets" -- Nécessaire pour validation
  ON tickets FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = user_id OR email = auth.email());

-- Policies pour chat_messages
CREATE POLICY "Anyone can view chat messages"
  ON chat_messages FOR SELECT
  TO PUBLIC
  USING (NOT is_deleted);

CREATE POLICY "Authenticated users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON chat_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies pour payouts
CREATE POLICY "Artists can view their own payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = artist_id);

-- ========================================
-- FONCTIONS UTILES
-- ========================================

-- Fonction : Incrémenter tickets_sold lors d'un achat
CREATE OR REPLACE FUNCTION increment_tickets_sold()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events
  SET tickets_sold = tickets_sold + 1,
      updated_at = NOW()
  WHERE id = NEW.event_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_tickets_sold
  AFTER INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION increment_tickets_sold();

-- Fonction : Mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VUES UTILES
-- ========================================

-- Vue : Dashboard artiste
CREATE OR REPLACE VIEW artist_dashboard AS
SELECT
  e.id AS event_id,
  e.title,
  e.event_date,
  e.status,
  e.ticket_price,
  e.capacity,
  e.tickets_sold,
  (e.ticket_price * e.tickets_sold) AS gross_revenue,
  (e.ticket_price * e.tickets_sold * 0.70) AS artist_revenue,
  e.artist_id,
  u.full_name AS artist_name,
  u.email AS artist_email
FROM events e
JOIN users u ON e.artist_id = u.id
WHERE u.role = 'artist';

-- Vue : Statistiques événement
CREATE OR REPLACE VIEW event_stats AS
SELECT
  e.id AS event_id,
  e.title,
  e.tickets_sold,
  e.capacity,
  ROUND((e.tickets_sold::DECIMAL / e.capacity::DECIMAL) * 100, 2) AS occupancy_rate,
  COUNT(DISTINCT t.id) AS total_tickets,
  COUNT(DISTINCT t.user_id) AS unique_buyers,
  SUM(t.price_paid) AS total_revenue
FROM events e
LEFT JOIN tickets t ON e.id = t.event_id AND t.status = 'valid'
GROUP BY e.id, e.title, e.tickets_sold, e.capacity;

-- ========================================
-- DONNÉES DE TEST (optionnel)
-- ========================================

-- Créer un artiste de test
INSERT INTO users (id, email, role, full_name)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'artist@vybzzz.com',
  'artist',
  'Test Artist'
) ON CONFLICT (email) DO NOTHING;

-- Créer un fan de test
INSERT INTO users (id, email, role, full_name)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'fan@vybzzz.com',
  'fan',
  'Test Fan'
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- FIN DU SCHEMA V1.0 MVP
-- ========================================

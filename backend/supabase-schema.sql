-- ============================================
-- Script SQL complet pour Supabase - Vybzzz
-- ============================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- pour créer toutes les tables nécessaires

-- ============================================
-- EXTENSIONS
-- ============================================

-- Activer l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: events
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  artist TEXT,
  venue TEXT,
  location TEXT,
  image_url TEXT,
  video_url TEXT,
  is_live BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  price DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  max_attendees INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_events_is_live ON events(is_live);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- ============================================
-- TABLE: users
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token);

-- ============================================
-- TABLE: conversations
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- ============================================
-- TABLE: payments
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT NOT NULL,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_event_id ON payments(event_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- ============================================
-- TABLE: subscriptions
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- TABLE: event_followers (pour suivre les événements)
-- ============================================

CREATE TABLE IF NOT EXISTS event_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_event_followers_user_id ON event_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_event_followers_event_id ON event_followers(event_id);

-- ============================================
-- TRIGGERS: Mise à jour automatique de updated_at
-- ============================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour chaque table
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_followers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLITIQUES RLS: events
-- ============================================

-- Lecture publique
CREATE POLICY "Public read access on events" ON events
  FOR SELECT
  USING (true);

-- Écriture admin uniquement (ajustez selon vos besoins)
CREATE POLICY "Admin write access on events" ON events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- POLITIQUES RLS: users
-- ============================================

-- Utilisateur peut lire son propre profil
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Utilisateur peut mettre à jour son propre profil
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- POLITIQUES RLS: conversations
-- ============================================

-- Utilisateur peut lire ses propres conversations
CREATE POLICY "Users can read own conversations" ON conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Utilisateur peut créer ses propres conversations
CREATE POLICY "Users can create own conversations" ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Utilisateur peut mettre à jour ses propres conversations
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS: payments
-- ============================================

-- Utilisateur peut lire ses propres paiements
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Lecture publique pour les admins (ajustez selon vos besoins)
CREATE POLICY "Admins can read all payments" ON payments
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- POLITIQUES RLS: subscriptions
-- ============================================

-- Utilisateur peut lire ses propres abonnements
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- POLITIQUES RLS: event_followers
-- ============================================

-- Utilisateur peut lire ses propres suivis
CREATE POLICY "Users can read own event follows" ON event_followers
  FOR SELECT
  USING (auth.uid() = user_id);

-- Utilisateur peut créer ses propres suivis
CREATE POLICY "Users can create own event follows" ON event_followers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Utilisateur peut supprimer ses propres suivis
CREATE POLICY "Users can delete own event follows" ON event_followers
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FIN DU SCRIPT
-- ============================================

-- Vérification : Lister toutes les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('events', 'users', 'conversations', 'payments', 'subscriptions', 'event_followers')
ORDER BY table_name;


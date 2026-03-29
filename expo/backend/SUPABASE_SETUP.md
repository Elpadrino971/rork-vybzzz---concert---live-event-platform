# 🗄️ Configuration Supabase

Ce guide vous aidera à configurer Supabase pour le backend Vybzzz.

## 📋 Prérequis

1. Un compte Supabase (https://supabase.com)
2. Un projet Supabase créé avec l'ID : `dwlhpposqmknxholzcvp`

## 🔑 Récupération des clés API

1. Connectez-vous à votre dashboard Supabase
2. Allez dans **Settings** > **API**
3. Vous trouverez :
   - **Project URL** : `https://dwlhpposqmknxholzcvp.supabase.co`
   - **anon/public key** : Clé publique pour les requêtes côté client
   - **service_role key** : Clé secrète pour les opérations serveur (⚠️ NE JAMAIS exposer côté client)

## 📝 Configuration du fichier .env

Ajoutez ces variables dans votre fichier `backend/.env` :

```env
SUPABASE_PROJECT_ID=dwlhpposqmknxholzcvp
SUPABASE_URL=https://dwlhpposqmknxholzcvp.supabase.co
SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici
```

## 🗃️ Création des tables

Exécutez ce SQL dans l'éditeur SQL de Supabase :

### Table `events`

```sql
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
```

### Table `conversations`

```sql
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  title TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
```

### Table `users` (optionnel si vous utilisez l'auth Supabase)

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour push_token (nécessaire pour les notifications)
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token);
```

> **Note** : La colonne `push_token` est nécessaire pour les notifications push. Voir `NOTIFICATIONS_SETUP.md` pour plus de détails.

## 🔐 Configuration des politiques RLS (Row Level Security)

Si vous activez RLS sur vos tables, configurez les politiques :

### Pour `events` (lecture publique, écriture admin)

```sql
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Politique : Lecture publique
CREATE POLICY "Public read access" ON events
  FOR SELECT
  USING (true);

-- Politique : Écriture admin uniquement (ajustez selon vos besoins)
CREATE POLICY "Admin write access" ON events
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### Pour `conversations` (accès utilisateur uniquement)

```sql
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Politique : Utilisateur peut lire ses propres conversations
CREATE POLICY "User can read own conversations" ON conversations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique : Utilisateur peut créer ses propres conversations
CREATE POLICY "User can create own conversations" ON conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

## ✅ Test de connexion

Pour tester que Supabase est bien configuré, vous pouvez :

1. Démarrer le serveur backend : `npm run dev`
2. Faire une requête de test :

```bash
curl http://localhost:3000/api/events
```

## 📦 Configuration du Stockage

Pour configurer Supabase Storage (images, vidéos), voir le guide détaillé :
- **[SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md)** : Guide complet de configuration du stockage

## 🗃️ Script SQL Complet

Pour créer toutes les tables d'un coup, utilisez le script SQL complet :
- **[supabase-schema.sql](./supabase-schema.sql)** : Script SQL complet avec toutes les tables
- **[SUPABASE_COMPLETE_SETUP.md](./SUPABASE_COMPLETE_SETUP.md)** : Guide de configuration complète

Le script inclut :
- ✅ Toutes les tables (`events`, `users`, `conversations`, `payments`, `subscriptions`, `event_followers`)
- ✅ Tous les index
- ✅ Tous les triggers
- ✅ Toutes les politiques RLS
- ✅ Colonne `push_token` dans `users` pour les notifications

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)


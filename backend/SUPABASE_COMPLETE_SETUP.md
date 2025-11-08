# 🗄️ Configuration Complète Supabase - Vybzzz

Ce guide vous explique comment configurer complètement Supabase pour l'application Vybzzz.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Création des tables](#création-des-tables)
3. [Configuration RLS](#configuration-rls)
4. [Configuration Storage](#configuration-storage)
5. [Vérification](#vérification)

---

## 🔧 Prérequis

1. Un compte Supabase (https://supabase.com)
2. Un projet Supabase créé avec l'ID : `dwlhpposqmknxholzcvp`
3. Accès au dashboard Supabase

---

## 🗃️ Création des tables

### Option 1 : Script SQL complet (Recommandé)

1. Allez dans **SQL Editor** dans Supabase
2. Créez une nouvelle requête
3. Copiez-collez le contenu de `backend/supabase-schema.sql`
4. Exécutez le script

Ce script créera automatiquement :
- ✅ Table `events`
- ✅ Table `users` (avec colonne `push_token`)
- ✅ Table `conversations`
- ✅ Table `payments`
- ✅ Table `subscriptions`
- ✅ Table `event_followers`
- ✅ Tous les index nécessaires
- ✅ Tous les triggers pour `updated_at`
- ✅ Toutes les politiques RLS

### Option 2 : Création manuelle

Si vous préférez créer les tables manuellement, suivez les instructions dans `backend/SUPABASE_SETUP.md`.

---

## 🔐 Configuration RLS

Le script SQL configure automatiquement les politiques RLS pour toutes les tables :

### Table `events`
- ✅ Lecture publique
- ✅ Écriture admin uniquement

### Table `users`
- ✅ Utilisateur peut lire/mettre à jour son propre profil

### Table `conversations`
- ✅ Utilisateur peut lire/créer/mettre à jour ses propres conversations

### Table `payments`
- ✅ Utilisateur peut lire ses propres paiements
- ✅ Admins peuvent lire tous les paiements

### Table `subscriptions`
- ✅ Utilisateur peut lire ses propres abonnements

### Table `event_followers`
- ✅ Utilisateur peut gérer ses propres suivis d'événements

---

## 📦 Configuration Storage

### Créer les buckets

1. Allez dans **Storage** dans Supabase
2. Créez les buckets suivants :

#### Bucket 1 : `event-images`
- **Nom** : `event-images`
- **Public** : ✅ Oui
- **File size limit** : 5 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp, image/gif`

#### Bucket 2 : `event-videos`
- **Nom** : `event-videos`
- **Public** : ✅ Oui
- **File size limit** : 500 MB
- **Allowed MIME types** : `video/mp4, video/webm, video/quicktime`

#### Bucket 3 : `user-avatars`
- **Nom** : `user-avatars`
- **Public** : ✅ Oui
- **File size limit** : 2 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

#### Bucket 4 : `event-thumbnails`
- **Nom** : `event-thumbnails`
- **Public** : ✅ Oui
- **File size limit** : 1 MB
- **Allowed MIME types** : `image/jpeg, image/png, image/webp`

### Configurer les politiques RLS pour Storage

Exécutez ce SQL dans l'éditeur SQL de Supabase :

```sql
-- ============================================
-- POLITIQUES RLS POUR STORAGE
-- ============================================

-- Pour event-images
CREATE POLICY "Public read access for event-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated write access for event-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for event-images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- Pour event-videos
CREATE POLICY "Public read access for event-videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-videos');

CREATE POLICY "Authenticated write access for event-videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for event-videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-videos' 
  AND auth.role() = 'authenticated'
);

-- Pour user-avatars
CREATE POLICY "Public read access for user-avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Pour event-thumbnails
CREATE POLICY "Public read access for event-thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-thumbnails');

CREATE POLICY "Authenticated write access for event-thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-thumbnails' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated delete access for event-thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-thumbnails' 
  AND auth.role() = 'authenticated'
);
```

> **Note** : Si vous utilisez le backend pour les uploads (recommandé), vous pouvez utiliser la clé `service_role` qui contourne RLS. Dans ce cas, les politiques ci-dessus peuvent être simplifiées.

---

## ✅ Vérification

### 1. Vérifier les tables

Exécutez cette requête SQL pour vérifier que toutes les tables existent :

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('events', 'users', 'conversations', 'payments', 'subscriptions', 'event_followers')
ORDER BY table_name;
```

Vous devriez voir 6 tables.

### 2. Vérifier les colonnes

Vérifiez que la table `users` a la colonne `push_token` :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'push_token';
```

### 3. Tester la connexion

1. Démarrer le serveur backend :
   ```bash
   cd backend
   npm run dev
   ```

2. Tester les endpoints :
   ```bash
   curl http://localhost:3000/api/events
   curl http://localhost:3000/health
   ```

### 4. Tester les uploads

```bash
# Tester l'upload d'une image
curl -X POST http://localhost:3000/api/storage/upload/event-image \
  -F "file=@/path/to/image.jpg"
```

---

## 📊 Structure des tables

### Table `events`
- Stocke tous les événements
- Champs : `id`, `title`, `description`, `artist`, `venue`, `location`, `image_url`, `video_url`, `is_live`, `start_date`, `end_date`, `price`, `currency`, `max_attendees`

### Table `users`
- Stocke les profils utilisateurs
- Champs : `id`, `email`, `full_name`, `avatar_url`, `push_token` ✅
- Liée à `auth.users` de Supabase

### Table `conversations`
- Stocke les conversations de chat IA
- Champs : `id`, `user_id`, `title`, `messages` (JSONB)

### Table `payments`
- Stocke les paiements Stripe
- Champs : `id`, `stripe_payment_intent_id`, `user_id`, `event_id`, `amount`, `currency`, `status`, `failure_reason`

### Table `subscriptions`
- Stocke les abonnements Stripe
- Champs : `id`, `stripe_subscription_id`, `user_id`, `customer_id`, `status`, `current_period_start`, `current_period_end`, `canceled_at`

### Table `event_followers`
- Stocke les utilisateurs qui suivent des événements
- Champs : `id`, `user_id`, `event_id`
- Permet d'envoyer des notifications pour les événements suivis

---

## 🔄 Migration depuis une base existante

Si vous avez déjà des tables, vous pouvez :

1. **Ajouter la colonne `push_token`** :
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
   CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token);
   ```

2. **Créer les tables manquantes** :
   - Exécutez uniquement les parties du script SQL pour les tables manquantes

---

## 🐛 Dépannage

### Erreur : "Table does not exist"

- Vérifiez que vous avez exécuté le script SQL complet
- Vérifiez que vous êtes dans le bon projet Supabase

### Erreur : "Column push_token does not exist"

- Exécutez :
  ```sql
  ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token TEXT;
  CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token);
  ```

### Erreur : "Permission denied"

- Vérifiez que les politiques RLS sont correctement configurées
- Vérifiez que vous utilisez la bonne clé (anon vs service_role)

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- `backend/SUPABASE_SETUP.md` : Configuration générale
- `backend/SUPABASE_STORAGE_SETUP.md` : Configuration Storage

---

**Dernière mise à jour** : 2024


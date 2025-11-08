# Vybzzz Backend API

Backend API pour la plateforme de concerts Vybzzz.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env (voir .env.example)
cp .env.example .env

# Modifier .env avec vos clés API
```

## 📝 Configuration

Créez un fichier `.env` à la racine du dossier `backend/` avec vos variables d'environnement :

```env
PORT=3000
STRIPE_SECRET_KEY=votre_clé_stripe
OPENAI_API_KEY=votre_clé_openai

# Supabase Configuration
SUPABASE_PROJECT_ID=dwlhpposqmknxholzcvp
SUPABASE_URL=https://dwlhpposqmknxholzcvp.supabase.co
SUPABASE_ANON_KEY=votre_clé_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_supabase
```

## 🏃 Démarrage

```bash
# Mode développement (avec rechargement automatique)
npm run dev

# Mode production (nécessite un build préalable)
npm run build
npm start
```

## 🧪 Tests

```bash
# Test avec script shell
npm run test

# Test avec script TypeScript
npm run test:api

# Test manuel
curl http://localhost:3000/health
```

Voir **[TESTING.md](./TESTING.md)** pour le guide complet de test.

## 📡 Endpoints

### Paiements (`/api/payments/*`)

- `POST /api/payments/create-intent` - Crée un Payment Intent Stripe
- `POST /api/payments/confirm` - Confirme un paiement
- `POST /api/payments/subscriptions` - Crée un abonnement
- `POST /api/payments/subscriptions/:id/cancel` - Annule un abonnement
- `POST /api/payments/subscriptions/update` - Met à jour un abonnement
- `GET /api/payments/customers/:customerId/payment-methods` - Liste les méthodes de paiement
- `POST /api/payments/customers/:customerId/payment-methods` - Ajoute une méthode de paiement
- `DELETE /api/payments/payment-methods/:paymentMethodId` - Supprime une méthode de paiement

### Webhook Stripe (`/webhook/stripe`)

- `POST /webhook/stripe` - Webhook Stripe pour gérer les événements de paiement et d'abonnement
  - Gère les événements : `payment_intent.succeeded`, `payment_intent.payment_failed`, `customer.subscription.created`, etc.
  - Voir **[STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)** pour la configuration complète

### Chat IA (`/api/chat/*`)

- `POST /api/chat/message` - Envoie un message au chat IA
- `GET /api/chat/conversations/:id` - Récupère une conversation
- `POST /api/chat/conversations` - Crée une nouvelle conversation

### Événements (`/api/events/*`)

- `GET /api/events` - Liste tous les événements (avec pagination)
- `GET /api/events/:id` - Récupère un événement par ID
- `POST /api/events` - Crée un nouvel événement
- `PUT /api/events/:id` - Met à jour un événement
- `DELETE /api/events/:id` - Supprime un événement

### Stockage (`/api/storage/*`)

- `POST /api/storage/upload/event-image` - Upload une image d'événement
- `POST /api/storage/upload/event-video` - Upload une vidéo d'événement
- `POST /api/storage/upload/avatar` - Upload un avatar utilisateur
- `POST /api/storage/upload/thumbnail` - Upload une miniature d'événement
- `POST /api/storage/upload/image` - Upload une image générique
- `DELETE /api/storage/delete/:bucket/:path` - Supprime un fichier
- `GET /api/storage/list/:bucket` - Liste les fichiers d'un bucket
- `GET /api/storage/url/:bucket/:path` - Récupère l'URL publique d'un fichier

### Notifications (`/api/notifications/*`)

- `POST /api/notifications/send` - Envoie une notification push à un utilisateur
- `POST /api/notifications/send-to-users` - Envoie une notification à plusieurs utilisateurs
- `POST /api/notifications/new-event` - Envoie une notification pour un nouvel événement
- `POST /api/notifications/payment-success` - Envoie une notification pour un paiement réussi
- `POST /api/notifications/event-live` - Envoie une notification pour un événement en direct

### Santé

- `GET /health` - Vérifie que le serveur fonctionne

## 🔒 Sécurité

⚠️ **IMPORTANT** : Ne jamais commiter le fichier `.env` avec vos clés secrètes !

## 🗄️ Base de données Supabase

Ce backend utilise Supabase comme base de données PostgreSQL. Assurez-vous d'avoir créé les tables suivantes dans votre projet Supabase :

### Tables nécessaires

- `events` - Table des événements
- `conversations` - Table des conversations de chat
- `users` - Table des utilisateurs (optionnel si vous utilisez l'auth Supabase)

### Exemple de schéma SQL pour Supabase

```sql
-- Table events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  is_live BOOLEAN DEFAULT false,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  title TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📦 Stockage Supabase

Ce backend utilise Supabase Storage pour le stockage de fichiers (images, vidéos).

### Configuration

1. Créez les buckets dans Supabase (voir `SUPABASE_STORAGE_SETUP.md`)
2. Configurez les politiques RLS pour chaque bucket
3. Utilisez `SUPABASE_SERVICE_ROLE_KEY` dans votre `.env` pour les uploads

### Documentation complète

- **[SUPABASE_STORAGE_SETUP.md](./SUPABASE_STORAGE_SETUP.md)** : Guide complet de configuration du stockage
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** : Configuration générale de Supabase

## 🚀 Configuration Production

Pour configurer OpenAI et Stripe en production :

- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** : Guide complet de configuration en production
  - Configuration Stripe (passer en mode Live)
  - Configuration OpenAI (limites, budgets, optimisation)
  - Variables d'environnement de production
  - Tests et monitoring

## 📚 Documentation

Voir `BACKEND_SETUP.md` à la racine du projet pour plus de détails.


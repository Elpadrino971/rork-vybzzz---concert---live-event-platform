# 🚀 Configuration Production - OpenAI & Stripe

Ce guide vous explique comment configurer OpenAI et Stripe en production pour l'application Vybzzz.

## 📋 Table des matières

1. [Configuration Stripe en production](#configuration-stripe-en-production)
2. [Configuration OpenAI en production](#configuration-openai-en-production)
3. [Variables d'environnement](#variables-denvironnement)
4. [Tests de production](#tests-de-production)
5. [Monitoring et budgets](#monitoring-et-budgets)

---

## 💳 Configuration Stripe en production

### 1. Passer en mode Live

#### Étape 1 : Activer le mode Live dans Stripe

1. Connectez-vous à votre [dashboard Stripe](https://dashboard.stripe.com)
2. Assurez-vous d'être en mode **Live** (basculez en haut à droite)
3. Vérifiez que votre compte est activé et vérifié

#### Étape 2 : Récupérer les clés de production

1. Allez dans **Developers** > **API keys**
2. Vous verrez deux sections :
   - **Test mode keys** (commencent par `sk_test_` et `pk_test_`)
   - **Publishable key** (commence par `pk_live_`)
   - **Secret key** (commence par `sk_live_`) - Cliquez sur **Reveal test key** puis basculez en mode Live

3. Copiez les clés :
   - `STRIPE_SECRET_KEY` : `sk_live_...` (⚠️ SECRET - Ne jamais exposer)
   - `STRIPE_PUBLISHABLE_KEY` : `pk_live_...` (peut être utilisé côté client)

#### Étape 3 : Récupérer le Webhook Secret de production

✅ **Webhook Secret déjà configuré** : `whsec_DiIzGLxmF62kFegqjwOs1eBqOkOOhntm`

1. Allez dans **Developers** > **Webhooks**
2. Cliquez sur votre webhook `vybzzz-webhook-prod`
3. Dans la section **Signing secret**, cliquez sur **Reveal** ou **Click to reveal**
4. Copiez le secret (commence par `whsec_...`)

> **Note** : Le webhook secret est déjà configuré : `whsec_DiIzGLxmF62kFegqjwOs1eBqOkOOhntm`

#### Étape 4 : Configurer les variables d'environnement

Dans votre fichier `backend/.env` de production :

```env
# Stripe Configuration (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_votre_clé_secrète_production
STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_publique_production
STRIPE_WEBHOOK_SECRET=whsec_DiIzGLxmF62kFegqjwOs1eBqOkOOhntm
```

⚠️ **IMPORTANT** : 
- Ne jamais commiter ces clés dans Git
- Ne jamais exposer `STRIPE_SECRET_KEY` côté client
- Utiliser uniquement `STRIPE_PUBLISHABLE_KEY` côté client

### 2. Configurer les produits et prix

#### Créer des produits Stripe

1. Allez dans **Products** dans le dashboard Stripe
2. Créez vos produits (ex: "Ticket Concert", "Abonnement Premium")
3. Créez des prix pour chaque produit
4. Notez les **Price IDs** (commencent par `price_...`)

#### Exemple de produits

- **Ticket Concert Standard** : `price_xxxxx`
- **Ticket Concert VIP** : `price_yyyyy`
- **Abonnement Mensuel** : `price_zzzzz`
- **Abonnement Annuel** : `price_aaaaa`

### 3. Tester les paiements en production

#### Test avec une carte de test Stripe

Même en mode Live, Stripe permet d'utiliser des cartes de test pour tester :

- **Carte réussie** : `4242 4242 4242 4242`
- **Carte refusée** : `4000 0000 0000 0002`
- **Carte 3D Secure** : `4000 0025 0000 3155`

Date d'expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres

#### Tester un paiement

```bash
# Créer un Payment Intent
curl -X POST https://api.vybzzz.com/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "eur",
    "description": "Test paiement production",
    "metadata": {
      "userId": "user_123",
      "eventId": "event_456"
    }
  }'
```

### 4. Configurer les webhooks en production

Le webhook est déjà configuré :
- **ID** : `we_1S7jSvHfGnA3ljfTpqXhJrQx`
- **URL** : `https://api.vybzzz.com/webhook/stripe`
- **Version API** : `2025-05-28.basil`

Vérifiez que le webhook reçoit bien les événements :
1. Allez dans **Developers** > **Webhooks**
2. Cliquez sur votre webhook
3. Vérifiez les **Recent events** pour voir si les événements sont reçus

---

## 🤖 Configuration OpenAI en production

### 1. Vérifier les limites de l'API

#### Étape 1 : Vérifier les limites actuelles

1. Connectez-vous à votre [dashboard OpenAI](https://platform.openai.com)
2. Allez dans **Settings** > **Limits**
3. Vérifiez vos limites :
   - **Rate limits** : Nombre de requêtes par minute
   - **Usage limits** : Montant dépensé par mois
   - **Hard limits** : Limites maximales

#### Étape 2 : Augmenter les limites si nécessaire

Si vous avez besoin de plus de capacité :

1. Allez dans **Settings** > **Billing** > **Limits**
2. Cliquez sur **Request increase**
3. Remplissez le formulaire avec :
   - Usage prévu
   - Cas d'usage
   - Modèle utilisé (gpt-3.5-turbo, gpt-4, etc.)

### 2. Configurer les budgets

#### Étape 1 : Configurer un budget mensuel

1. Allez dans **Settings** > **Billing** > **Budgets**
2. Cliquez sur **Create budget**
3. Configurez :
   - **Amount** : Montant maximum par mois (ex: $100)
   - **Alert threshold** : Seuil d'alerte (ex: 80% = $80)
   - **Email notifications** : Votre email

#### Étape 2 : Configurer des alertes

1. Allez dans **Settings** > **Billing** > **Alerts**
2. Configurez des alertes pour :
   - Usage quotidien
   - Usage mensuel
   - Dépenses exceptionnelles

### 3. Optimiser les coûts

#### Utiliser le bon modèle

- **gpt-3.5-turbo** : Pour la plupart des cas d'usage (moins cher)
- **gpt-4** : Pour des cas plus complexes (plus cher)
- **gpt-4-turbo** : Bon compromis performance/prix

#### Limiter les tokens

Dans `backend/src/services/openai.service.ts`, les paramètres par défaut sont :
- `max_tokens: 300` (limite la longueur des réponses)
- `temperature: 0.7` (contrôle la créativité)

Ajustez selon vos besoins pour optimiser les coûts.

### 4. Configurer la clé API de production

Dans votre fichier `backend/.env` de production :

```env
# OpenAI Configuration (PRODUCTION)
OPENAI_API_KEY=sk-proj-votre_clé_production
```

⚠️ **IMPORTANT** : 
- Ne jamais commiter cette clé dans Git
- Ne jamais exposer cette clé côté client
- Utiliser uniquement côté backend

### 5. Tester le chat IA en production

```bash
# Tester le chat IA
curl -X POST https://api.vybzzz.com/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Bonjour, pouvez-vous me parler des concerts disponibles ?"
      }
    ],
    "model": "gpt-3.5-turbo",
    "max_tokens": 300,
    "temperature": 0.7
  }'
```

---

## 🔐 Variables d'environnement complètes

### Backend `.env` (Production)

```env
# Server Configuration
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://vybzzz.com,https://app.vybzzz.com

# Stripe Configuration (PRODUCTION)
STRIPE_SECRET_KEY=sk_live_votre_clé_secrète_production
STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_publique_production
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret_production

# OpenAI Configuration (PRODUCTION)
OPENAI_API_KEY=sk-proj-votre_clé_production

# Supabase Configuration
SUPABASE_PROJECT_ID=dwlhpposqmknxholzcvp
SUPABASE_URL=https://dwlhpposqmknxholzcvp.supabase.co
SUPABASE_ANON_KEY=votre_clé_anon_production
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role_production
```

### Frontend `.env` (Production)

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://api.vybzzz.com
EXPO_PUBLIC_WS_URL=wss://ws.vybzzz.com

# Stripe Configuration (PUBLIC KEY ONLY)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_votre_clé_publique_production

# Supabase Configuration (PUBLIC KEYS ONLY)
EXPO_PUBLIC_SUPABASE_URL=https://dwlhpposqmknxholzcvp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_production
```

⚠️ **IMPORTANT** : 
- Ne jamais mettre `STRIPE_SECRET_KEY` ou `OPENAI_API_KEY` dans le frontend
- Utiliser uniquement les clés publiques côté client

---

## 🧪 Tests de production

### Checklist de test

- [ ] **Stripe** :
  - [ ] Créer un Payment Intent avec une carte de test
  - [ ] Vérifier que le paiement est traité
  - [ ] Vérifier que le webhook reçoit les événements
  - [ ] Tester un abonnement
  - [ ] Vérifier les logs Stripe

- [ ] **OpenAI** :
  - [ ] Envoyer un message au chat IA
  - [ ] Vérifier que la réponse est reçue
  - [ ] Vérifier l'utilisation des tokens
  - [ ] Vérifier les coûts dans le dashboard OpenAI

- [ ] **Webhooks** :
  - [ ] Vérifier que les événements Stripe sont reçus
  - [ ] Vérifier que les événements sont traités correctement
  - [ ] Vérifier les logs du serveur

---

## 📊 Monitoring et budgets

### Stripe

1. **Dashboard Stripe** : Surveillez les paiements en temps réel
2. **Webhooks** : Vérifiez les événements reçus
3. **Logs** : Surveillez les erreurs dans les logs Stripe

### OpenAI

1. **Dashboard OpenAI** : Surveillez l'utilisation et les coûts
2. **Budgets** : Configurez des alertes pour éviter les dépassements
3. **Usage** : Surveillez le nombre de tokens utilisés

### Backend

1. **Logs** : Surveillez les erreurs dans les logs du serveur
2. **Monitoring** : Utilisez un service de monitoring (Sentry, LogRocket, etc.)
3. **Alertes** : Configurez des alertes pour les erreurs critiques

---

## 🐛 Dépannage

### Erreur : "Invalid API Key"

- Vérifiez que vous utilisez les bonnes clés (production vs test)
- Vérifiez que les clés sont correctement configurées dans `.env`
- Vérifiez que vous êtes en mode Live dans Stripe

### Erreur : "Rate limit exceeded"

- Vérifiez vos limites dans le dashboard OpenAI
- Augmentez les limites si nécessaire
- Implémentez un système de retry avec backoff

### Erreur : "Webhook signature verification failed"

- Vérifiez que `STRIPE_WEBHOOK_SECRET` est correctement configuré
- Vérifiez que vous utilisez le bon secret (production vs test)
- Vérifiez que le webhook est configuré avant `express.json()`

---

## 📚 Ressources

- [Stripe Production Checklist](https://stripe.com/docs/keys)
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [OpenAI Pricing](https://openai.com/pricing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

**Dernière mise à jour** : 2024


# 🚀 Guide de Déploiement Complet - VyBzzZ Platform

**Date**: 2025-11-16
**Version**: 1.0
**Plateformes**: Vercel (Frontend) + Railway (Backend) + EAS (Mobile)

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Déploiement Frontend (Vercel)](#déploiement-frontend-vercel)
3. [Déploiement Backend (Railway)](#déploiement-backend-railway)
4. [Déploiement Mobile (EAS Build)](#déploiement-mobile-eas-build)
5. [Configuration DNS et Domaines](#configuration-dns-et-domaines)
6. [Monitoring et Logs](#monitoring-et-logs)
7. [Rollback et Recovery](#rollback-et-recovery)

---

## Vue d'Ensemble

### Architecture de Déploiement

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Architecture                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   Vercel CDN     │         │   Railway        │
│   (Frontend)     │◄────────►   (Backend)      │
│                  │         │                  │
│  - Next.js 14    │         │  - Express       │
│  - React 18      │         │  - Node.js       │
│  - Static Assets │         │  - WebSocket     │
│  - Edge Runtime  │         │  - CORS          │
└─────────┬────────┘         └────────┬─────────┘
          │                           │
          │                           │
          └───────────┬───────────────┘
                      │
          ┌───────────▼───────────┐
          │   Supabase Cloud      │
          │   - PostgreSQL        │
          │   - Auth              │
          │   - Storage           │
          │   - Realtime          │
          └───────────────────────┘

┌──────────────────┐
│   Expo EAS       │
│   (Mobile App)   │
│                  │
│  - iOS Build     │
│  - Android Build │
│  - OTA Updates   │
└──────────────────┘
```

### Domaines

| Service | URL Production | Type |
|---------|----------------|------|
| **Frontend** | https://vybzzz.com | Vercel |
| **Backend API** | https://api.vybzzz.com | Railway |
| **Mobile App** | TestFlight / Google Play | EAS |

---

## Déploiement Frontend (Vercel)

### Étape 1: Installation Vercel CLI

```bash
# Installer Vercel CLI globalement
npm install -g vercel

# Se connecter
vercel login
```

### Étape 2: Configuration du Projet

#### 2.1 Lier le Projet

```bash
# À la racine du projet
vercel link

# Répondre aux questions:
# ? Set up and deploy "~/vybzzz"? Y
# ? Which scope? [votre compte]
# ? Link to existing project? N
# ? What's your project's name? vybzzz-platform
# ? In which directory is your code located? ./
```

#### 2.2 Configurer vercel.json

**Fichier**: `vercel.json` (déjà présent)

```json
{
  "crons": [
    {
      "path": "/api/cron/payouts",
      "schedule": "0 2 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" }
      ]
    }
  ]
}
```

### Étape 3: Variables d'Environnement

#### 3.1 Via Dashboard Vercel

1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner le projet `vybzzz-platform`
3. **Settings** → **Environment Variables**
4. Ajouter TOUTES les variables suivantes:

**Variables Requises**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product Price IDs
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ELITE=price_...

# Backend URL
NEXT_PUBLIC_BACKEND_URL=https://api.vybzzz.com

# Cron Secret (32+ caractères aléatoires)
CRON_SECRET=générer_avec_openssl_rand_base64_32

# Sentry (Monitoring)
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Resend (Email)
RESEND_API_KEY=re_...

# AWS (si utilisé)
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Agora (Streaming)
NEXT_PUBLIC_AGORA_APP_ID=...
AGORA_APP_CERTIFICATE=...

# OpenAI (AI features)
OPENAI_API_KEY=sk-...

# Upstash Redis (Rate limiting)
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# Node Environment
NODE_ENV=production
```

#### 3.2 Via CLI (Alternative)

```bash
# Ajouter une variable
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Importer depuis .env.production
vercel env pull .env.production.local
```

**⚠️ Important**: Séparer les variables par environnement:
- **Production**: Variables live Stripe, Supabase production
- **Preview**: Variables test Stripe, Supabase staging
- **Development**: Variables locales

### Étape 4: Build Settings

**Vercel Dashboard** → **Settings** → **Build & Development Settings**

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
Node.js Version: 18.x
```

### Étape 5: Déployer

#### 5.1 Preview Deployment

```bash
# Déploiement de test
vercel

# Tester l'URL preview
# https://vybzzz-platform-xyz.vercel.app
```

#### 5.2 Production Deployment

```bash
# Déployer en production
vercel --prod

# Ou via Git (recommandé)
git push origin main  # Auto-deploy configuré sur Vercel
```

### Étape 6: Configuration Stripe Webhook

**⚠️ CRITIQUE**: Configurer le webhook Stripe pour production

1. Aller sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. **Add endpoint**
3. **Endpoint URL**: `https://vybzzz.com/api/stripe/webhook`
4. **Events to send**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `account.updated`
5. **Copier le Signing Secret** → Ajouter comme `STRIPE_WEBHOOK_SECRET` dans Vercel

### Étape 7: Domaine Custom

#### 7.1 Ajouter le Domaine

**Vercel Dashboard** → **Settings** → **Domains**

```
1. Add Domain: vybzzz.com
2. Vercel fournit les DNS records:
   - Type: A
     Name: @
     Value: 76.76.21.21

   - Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
```

#### 7.2 Configurer DNS (chez votre registrar)

Exemple avec Cloudflare:
1. Aller sur DNS settings
2. Ajouter les records fournis par Vercel
3. Attendre propagation (5-60 min)

#### 7.3 Forcer HTTPS

**Vercel** force automatiquement HTTPS avec certificat Let's Encrypt.

### Étape 8: Cron Jobs

**Vérifier le cron job** pour payouts J+21:

```bash
# Test local du endpoint cron
curl -X POST https://vybzzz.com/api/cron/payouts \
  -H "Authorization: Bearer $CRON_SECRET"
```

**Vercel configure automatiquement** le cron basé sur `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/payouts",
    "schedule": "0 2 * * *"  // Daily at 2 AM UTC
  }]
}
```

### Étape 9: Tests Post-Déploiement

```bash
# Health check
curl https://vybzzz.com/api/health

# Test ticket purchase flow
curl -X POST https://vybzzz.com/api/tickets/purchase \
  -H "Content-Type: application/json" \
  -d '{"eventId": "...", "userId": "..."}'

# Vérifier Sentry (errors dashboard)
# https://sentry.io/organizations/vybzzz/issues/
```

---

## Déploiement Backend (Railway)

### Étape 1: Créer un Compte Railway

1. Aller sur [railway.app](https://railway.app)
2. **Sign up with GitHub**
3. Connecter le repository GitHub

### Étape 2: Créer un Nouveau Projet

```bash
# Via Dashboard Railway
1. New Project
2. Deploy from GitHub repo
3. Sélectionner: Elpadrino971/rork-vybzzz---concert---live-event-platform
4. Confirm
```

### Étape 3: Configuration Railway

Railway détecte automatiquement `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "rootDirectory": "backend",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**⚠️ CRITIQUE**: Le `rootDirectory: "backend"` est ESSENTIEL.

### Étape 4: Variables d'Environnement Railway

**Railway Dashboard** → **Variables**

```bash
# Supabase (même que frontend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (même que frontend)
STRIPE_SECRET_KEY=sk_live_...

# CORS (URL du frontend)
CORS_ORIGIN=https://vybzzz.com

# Port (Railway assign automatiquement)
PORT=3001

# OpenAI
OPENAI_API_KEY=sk-...

# AWS
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Expo (Push Notifications)
EXPO_ACCESS_TOKEN=...

# Node Environment
NODE_ENV=production
```

### Étape 5: Déployer

Railway déploie automatiquement sur `git push`:

```bash
# Push vers main branch
git add .
git commit -m "deploy: backend to Railway"
git push origin main

# Railway détecte le push et déploie automatiquement
```

### Étape 6: Domaine Custom

#### 6.1 Générer Domaine Railway

Railway fournit un domaine par défaut:
```
https://vybzzz-backend-production.up.railway.app
```

#### 6.2 Custom Domain

**Railway Dashboard** → **Settings** → **Domains**

```
1. Add Custom Domain
2. Enter: api.vybzzz.com
3. Railway fournit un CNAME record:
   - Type: CNAME
     Name: api
     Value: vybzzz-backend-production.up.railway.app
```

#### 6.3 Configurer DNS

Ajouter le CNAME record chez votre registrar (Cloudflare):
```
Type: CNAME
Name: api
Value: vybzzz-backend-production.up.railway.app
Proxy: Disabled (orange cloud OFF)
```

### Étape 7: CORS Configuration

**Mettre à jour** `backend/src/index.ts` pour accepter le frontend:

```typescript
import cors from 'cors'

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://vybzzz.com',
  credentials: true
}))
```

### Étape 8: Health Check

```bash
# Test endpoint backend
curl https://api.vybzzz.com/health

# Résultat attendu:
{
  "status": "ok",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "service": "vybzzz-backend"
}
```

### Étape 9: Logs et Monitoring

**Railway Dashboard** → **Deployments** → **Logs**

```bash
# Voir les logs en temps réel
# Filtrer par level: error, warn, info

# Exemple log:
[INFO] Server listening on port 3001
[INFO] Connected to Supabase
[INFO] Stripe webhook signature verified
```

---

## Déploiement Mobile (EAS Build)

### Étape 1: Installation EAS CLI

```bash
# Installer EAS CLI
npm install -g eas-cli

# Login avec votre compte Expo
eas login
```

### Étape 2: Initialiser EAS

```bash
cd mobile

# Initialiser EAS
eas build:configure
```

Cela crée `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.vybzzz.app",
        "buildNumber": "1.0.0"
      },
      "android": {
        "buildType": "apk",
        "package": "com.vybzzz.app",
        "versionCode": 1
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Étape 3: Configuration app.json

**Fichier**: `mobile/app.json`

```json
{
  "expo": {
    "name": "VyBzzZ",
    "slug": "vybzzz",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "vybzzz",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.vybzzz.app",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSCameraUsageDescription": "VyBzzZ needs access to your camera to stream live concerts",
        "NSMicrophoneUsageDescription": "VyBzzZ needs access to your microphone to stream live audio"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.vybzzz.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      "expo-font"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Étape 4: Variables d'Environnement Mobile

**Créer**: `mobile/.env.production`

```bash
# Backend API
EXPO_PUBLIC_API_URL=https://api.vybzzz.com

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Agora
EXPO_PUBLIC_AGORA_APP_ID=...
```

**Charger dans EAS**:

```bash
# Ajouter les secrets EAS
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.vybzzz.com
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://...
# ... répéter pour toutes les variables
```

### Étape 5: Build iOS

#### 5.1 Configurer Apple Developer

1. Aller sur [developer.apple.com](https://developer.apple.com)
2. **Certificates, Identifiers & Profiles**
3. **Identifiers** → **+** → **App IDs**
   - Bundle ID: `com.vybzzz.app`
4. **Certificates** → **+** → **iOS Distribution**
5. Télécharger le certificat

#### 5.2 Build avec EAS

```bash
# Build pour iOS (production)
eas build --platform ios --profile production

# EAS va demander:
# - Apple ID
# - Apple Team ID
# - Push Notification Certificate

# Attend 15-30 minutes pour le build
```

#### 5.3 Télécharger et Tester

```bash
# Télécharger l'IPA
eas build:download --platform ios

# Soumettre à TestFlight (beta testing)
eas submit --platform ios --profile production
```

### Étape 6: Build Android

#### 6.1 Configurer Google Play Console

1. Aller sur [play.google.com/console](https://play.google.com/console)
2. **Create App**
   - Name: VyBzzZ
   - Package: com.vybzzz.app
3. **Setup** → **App Signing**
4. Télécharger le service account JSON

#### 6.2 Build avec EAS

```bash
# Build pour Android (production)
eas build --platform android --profile production

# Attend 10-20 minutes
```

#### 6.3 Soumettre à Google Play

```bash
# Soumettre à Internal Testing
eas submit --platform android --profile production --track internal

# Promouvoir vers Beta
# Via Google Play Console: Internal Testing → Promote to Beta
```

### Étape 7: Over-The-Air (OTA) Updates

**Configurer** pour hot fixes sans rebuild:

```bash
# Update JavaScript code sans rebuild natif
eas update --branch production --message "Fix: corrected tip calculation"

# Users reçoivent automatiquement au prochain lancement
```

**Limitations OTA**:
- ✅ JavaScript/TypeScript code
- ✅ Assets (images, fonts)
- ❌ Native code (modules, permissions)
- ❌ app.json changes

### Étape 8: Versioning

**Stratégie de version**: `MAJOR.MINOR.PATCH`

```json
{
  "version": "1.0.0",
  "ios": {
    "buildNumber": "1.0.0"
  },
  "android": {
    "versionCode": 1
  }
}
```

**Avant chaque release**:
```bash
# Incrémenter version
# app.json: "version": "1.0.1"
# iOS buildNumber: "1.0.1"
# Android versionCode: 2

# Build nouvelle version
eas build --platform all --profile production
```

---

## Configuration DNS et Domaines

### Récapitulatif DNS Records

**Domaine**: `vybzzz.com` (exemple avec Cloudflare)

| Type | Name | Value | Proxy |
|------|------|-------|-------|
| A | @ | 76.76.21.21 | ✅ Enabled |
| CNAME | www | cname.vercel-dns.com | ✅ Enabled |
| CNAME | api | vybzzz-backend.up.railway.app | ❌ Disabled |

**⚠️ Important**:
- Frontend (Vercel): Proxy Cloudflare **activé** (orange cloud)
- Backend (Railway): Proxy Cloudflare **désactivé** (grey cloud)

### SSL/TLS

**Cloudflare SSL/TLS Settings**:
```
Encryption mode: Full (strict)
Always Use HTTPS: ON
Minimum TLS Version: 1.2
TLS 1.3: Enabled
Automatic HTTPS Rewrites: ON
```

---

## Monitoring et Logs

### Sentry (Error Tracking)

#### Setup Sentry

1. Créer compte sur [sentry.io](https://sentry.io)
2. **Create Project**:
   - Platform: Next.js
   - Name: vybzzz-frontend
3. **Create Project** (2ème):
   - Platform: Node.js
   - Name: vybzzz-backend
4. Copier les DSN

#### Configuration

**Frontend** (`sentry.client.config.ts`, `sentry.server.config.ts`):
```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // 100% en dev, 0.1 en prod
})
```

**Backend** (`backend/src/index.ts`):
```typescript
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% des transactions
})
```

### Logs Centralisés

**Vercel Logs**:
- Dashboard → Project → **Logs** (temps réel)
- Filtrer par: Error, Warning, Info

**Railway Logs**:
- Dashboard → Deployment → **Logs**
- Chercher par timestamp ou keyword

**Mobile Logs (Expo)**:
```bash
# Voir les logs des builds
eas build:list --platform all

# Logs d'un build spécifique
eas build:view [build-id]
```

### Alertes

**Sentry Alerts**:
1. **Settings** → **Alerts** → **Create Alert**
2. Conditions:
   - Error count > 10 in 1 minute
   - New issue created
   - Crash rate > 1%
3. Actions:
   - Email notification
   - Slack webhook
   - PagerDuty

---

## Rollback et Recovery

### Rollback Frontend (Vercel)

```bash
# Lister les déploiements
vercel ls

# Rollback vers un déploiement précédent
vercel rollback [deployment-url]

# Ou via Dashboard:
# Deployments → [Previous Deployment] → Promote to Production
```

### Rollback Backend (Railway)

**Railway Dashboard**:
1. **Deployments**
2. Sélectionner un déploiement précédent
3. **Redeploy**

**Via Git**:
```bash
# Revert dernier commit
git revert HEAD

# Push pour déclencher redeploy
git push origin main
```

### Rollback Mobile

**Impossible de rollback** après soumission App Store/Google Play.

**Solutions**:
1. **OTA Update** pour fix rapide (JS only)
2. **Build nouvelle version** avec fix
3. **Désactiver temporairement** feature via feature flag

**Feature Flags** (recommandé):
```typescript
// lib/feature-flags.ts
export const FEATURES = {
  AGORA_STREAMING: process.env.EXPO_PUBLIC_FEATURE_AGORA === 'true',
  AI_HIGHLIGHTS: process.env.EXPO_PUBLIC_FEATURE_AI === 'true',
}

// Usage
if (FEATURES.AGORA_STREAMING) {
  // Show Agora option
}
```

---

## Checklist Finale de Déploiement

### Avant le Lancement

#### Infrastructure
- [ ] Vercel projet créé et configuré
- [ ] Railway backend déployé
- [ ] Domaines configurés (vybzzz.com, api.vybzzz.com)
- [ ] SSL/TLS actifs (HTTPS partout)

#### Variables d'Environnement
- [ ] Toutes les variables en production (Vercel)
- [ ] Toutes les variables en production (Railway)
- [ ] Secrets EAS configurés (Mobile)
- [ ] Stripe keys LIVE (pas test)
- [ ] Supabase PRODUCTION database

#### Stripe
- [ ] Webhook configuré (https://vybzzz.com/api/stripe/webhook)
- [ ] Products créés (Starter, Pro, Elite)
- [ ] Connect onboarding flow testé
- [ ] Payout schedule J+21 testé

#### Tests
- [ ] Achat de ticket (end-to-end)
- [ ] Envoi de tips
- [ ] Création d'événement
- [ ] Streaming fonctionne (YouTube/Agora)
- [ ] Push notifications (mobile)
- [ ] Email notifications (Resend)

#### Monitoring
- [ ] Sentry configuré (frontend + backend)
- [ ] Logs accessibles (Vercel + Railway)
- [ ] Alertes configurées
- [ ] Health check endpoints testés

#### Mobile
- [ ] iOS build réussi
- [ ] Android build réussi
- [ ] TestFlight configuré (iOS)
- [ ] Internal Testing configuré (Android)
- [ ] OTA updates testés

#### Légal
- [ ] Terms of Service à jour
- [ ] Privacy Policy à jour
- [ ] Cookie consent actif
- [ ] GDPR compliance vérifiée

#### Documentation
- [ ] README.md à jour
- [ ] DEPLOYMENT.md validé
- [ ] STREAMING_ARCHITECTURE.md créé
- [ ] API documentation complète

---

## 🎉 Go Live!

**Étapes finales**:

1. **Freeze le code** (aucun commit pendant 24h)
2. **Deploy production**:
   ```bash
   vercel --prod
   git push origin main  # Railway auto-deploy
   eas build --platform all --profile production
   ```
3. **Vérifier tous les services**:
   - Frontend: https://vybzzz.com
   - Backend: https://api.vybzzz.com/health
   - Mobile: TestFlight + Google Play Internal
4. **Surveiller les logs** pendant 2-4 heures
5. **Tester en conditions réelles** avec utilisateurs beta
6. **Préparer hotfix process** (au cas où)

**Communication**:
- [ ] Annoncer sur réseaux sociaux
- [ ] Email aux early adopters
- [ ] Press release (si applicable)
- [ ] Update landing page

---

## Support Post-Lancement

**Contacts Urgents**:
- **Vercel Support**: support@vercel.com
- **Railway Support**: Discord / help@railway.app
- **Expo Support**: expo.dev/support
- **Stripe Support**: dashboard.stripe.com/support

**Monitoring 24/7**:
- Sentry dashboard
- Vercel analytics
- Railway metrics
- Mobile crash reports (Sentry)

**Hotfix Process**:
1. Identifier le problème (Sentry/Logs)
2. Fix en local + test
3. Deploy immediate:
   - Frontend: `vercel --prod`
   - Backend: `git push`
   - Mobile: `eas update` (JS only) ou nouveau build (native)
4. Vérifier fix en production
5. Post-mortem dans 24h

---

**Document créé le**: 2025-11-16
**Dernière mise à jour**: 2025-11-16
**Prochaine révision**: Après go-live

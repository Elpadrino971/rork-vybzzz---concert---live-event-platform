# 🚀 Guide de Configuration Production VyBzzZ

**Date** : 15 novembre 2025
**Lancement** : 31 décembre 2025
**Environnement** : Production

---

## 📋 Vue d'Ensemble

Ce guide détaille TOUTES les étapes pour configurer l'environnement de production VyBzzZ.

### Services à Configurer

1. ☁️ **Vercel** (Frontend Next.js + API Routes)
2. 🚂 **Railway** (Backend Express)
3. 🗄️ **Supabase** (Base de données + Storage)
4. 💳 **Stripe** (Paiements + Connect)
5. 📧 **Resend** (Emails)
6. 📊 **Sentry** (Monitoring)

---

## 1️⃣ Vercel (Frontend)

### Installation & Configuration

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Lier le projet
cd /path/to/vybzzz
vercel link
```

### Variables d'Environnement

Dans **Vercel Dashboard** → **Settings** → **Environment Variables**, ajouter :

#### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Stripe (MODE PRODUCTION)
```bash
# ⚠️ ATTENTION : Utiliser les clés LIVE (pk_live_ et sk_live_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Price IDs (Créés dans Stripe Dashboard)
STRIPE_PRICE_STARTER=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxx
STRIPE_PRICE_ELITE=price_xxxxxxxxxxxxx
```

#### Cron Jobs
```bash
# Générer un secret sécurisé (32+ caractères)
# Commande : openssl rand -base64 32
CRON_SECRET=votre_secret_cryptographiquement_sur_32_chars_minimum
```

#### Backend URL
```bash
# URL de votre backend Railway (après déploiement)
NEXT_PUBLIC_BACKEND_URL=https://vybzzz-backend-production.up.railway.app
```

#### Email (Resend)
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### Monitoring (Sentry) - Optionnel
```bash
SENTRY_DSN=https://xxxxxxxxxxxxx@xxxxxxxxxxxxx.ingest.sentry.io/xxxxxxxxxxxxx
SENTRY_ORG=vybzzz
SENTRY_PROJECT=vybzzz-platform
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxx@xxxxxxxxxxxxx.ingest.sentry.io/xxxxxxxxxxxxx
```

#### OpenAI (Pour AI features - Phase 2)
```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxx  # Optionnel pour MVP
```

### Domaine Personnalisé

1. Dans **Vercel Dashboard** → **Domains**
2. Ajouter : `vybzzz.com` et `www.vybzzz.com`
3. Configurer DNS chez votre registrar :
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Cron Jobs

Vérifier que `vercel.json` contient :

```json
{
  "crons": [{
    "path": "/api/cron/payouts",
    "schedule": "0 2 * * *"
  }]
}
```

### Déploiement

```bash
# Déploiement production
vercel --prod

# Vérifier le déploiement
vercel inspect https://vybzzz.com
```

### Vérification Post-Déploiement

```bash
# Tester les variables d'environnement
curl https://vybzzz.com/api/health

# Vérifier le cron job
curl -H "Authorization: Bearer ${CRON_SECRET}" https://vybzzz.com/api/cron/payouts
```

---

## 2️⃣ Railway (Backend Express)

### Installation & Configuration

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Créer projet (ou lier existant)
railway link
```

### Configuration Build

Vérifier que `railway.json` existe et contient :

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

**⚠️ CRITIQUE** : Le `rootDirectory: "backend"` est ESSENTIEL.

### Variables d'Environnement

Dans **Railway Dashboard** → **Variables**, ajouter :

```bash
# Supabase (mêmes que Vercel)
SUPABASE_URL=https://[votre-projet].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe (MODE PRODUCTION)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# CORS (URL Vercel)
CORS_ORIGIN=https://vybzzz.com

# Port
PORT=3001

# OpenAI (Optionnel)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Expo Push Notifications
EXPO_ACCESS_TOKEN=xxxxxxxxxxxxx  # Si notifications push
```

### Déploiement

```bash
# Push vers Railway (auto-deploy sur git push)
git push

# Ou déploiement manuel
railway up
```

### Vérification Post-Déploiement

```bash
# Récupérer l'URL
railway domain

# Tester health check
curl https://vybzzz-backend-production.up.railway.app/health

# Tester upload de fichier
curl -X POST https://vybzzz-backend-production.up.railway.app/api/storage/upload/test \
  -F "file=@test-image.jpg"
```

---

## 3️⃣ Supabase (Base de Données)

### Configuration Projet

1. Aller sur https://supabase.com/dashboard
2. Sélectionner votre projet VyBzzZ
3. Vérifier que vous êtes sur **Production** (pas Staging)

### Exécuter Migrations

#### Via SQL Editor (Recommandé pour production)

1. **Dashboard** → **SQL Editor** → **New Query**
2. Exécuter dans l'ordre :

```sql
-- 1. Schema principal
-- Copier-coller le contenu de : supabase/schema-complete.sql

-- 2. Migrations spécifiques
-- Performance indexes
-- Copier-coller : supabase/migrations/add_performance_indexes.sql

-- 3. Dashboard optimizations
-- Copier-coller : supabase/migrations/add_dashboard_optimization_functions.sql

-- 4. Storage configuration
-- Copier-coller : supabase/migrations/add_secure_storage_configuration.sql

-- 5. RGPD compliance
-- Copier-coller : supabase/migrations/add_rgpd_compliance_columns.sql

-- 6. Webhook events
-- Copier-coller : supabase/migrations/add_webhook_events_table.sql
```

### Configuration Storage

```bash
# Exécuter le script de setup
npm run setup:storage

# Ou manuellement via SQL (déjà fait dans migration ci-dessus)
```

### Vérifier les Buckets

Dans **Dashboard** → **Storage** :
- ✅ event-images (5MB, public)
- ✅ event-videos (500MB, public)
- ✅ user-avatars (2MB, public)
- ✅ event-thumbnails (1MB, public)
- ✅ artist-banners (3MB, public)
- ✅ shorts-videos (100MB, public)

### Vérifier RLS (Row Level Security)

```sql
-- Vérifier que RLS est activé sur TOUTES les tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;

-- Résultat attendu : 0 lignes (toutes les tables ont RLS)
```

### Quotas & Limites

Vérifier dans **Dashboard** → **Settings** → **Billing** :

```
✅ Database : 500MB utilisés / 8GB disponibles (Free tier)
✅ Storage : 100MB utilisés / 1GB disponibles (Free tier)
✅ Bandwidth : 2GB utilisés / 5GB disponibles (Free tier)

⚠️ Si proche des limites, passer en plan Pro (25$/mois)
```

---

## 4️⃣ Stripe (Paiements)

### Configuration Compte Production

1. **Activer le Mode Live** dans Stripe Dashboard
2. **Compléter les informations** :
   - Informations entreprise (SIRET, RCS, etc.)
   - Coordonnées bancaires
   - Vérification identité

### Créer les Produits & Prix

#### Option 1 : Script automatique

```bash
# Modifier le script pour utiliser les clés LIVE
# Dans scripts/setup-stripe.ts, changer :
# const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE!)

npm run setup:stripe
```

#### Option 2 : Manuellement dans Dashboard

**Abonnements Artistes** :

1. **Starter**
   - Prix : 19.99€/mois
   - ID : `price_starter_monthly_live`
   - Période d'essai : 14 jours

2. **Pro**
   - Prix : 59.99€/mois
   - ID : `price_pro_monthly_live`
   - Période d'essai : 14 jours

3. **Elite**
   - Prix : 129.99€/mois
   - ID : `price_elite_monthly_live`
   - Période d'essai : 14 jours

**Apporteurs d'Affaires (AA)** :
- Prix : 2997€ one-time + 19.99€/mois
- IDs : `price_aa_onetime_live` + `price_aa_monthly_live`

**Responsables Régionaux (RR)** :
- Basic : 4997€ one-time
- Premium : 9997€ one-time
- IDs : `price_rr_basic_live`, `price_rr_premium_live`

### Configurer Stripe Connect

1. **Dashboard** → **Connect** → **Settings**
2. **Plateforme settings** :
   ```
   Branding name: VyBzzZ
   Icon: [Upload logo]
   Brand color: #FFD700 (or)
   ```

3. **Payout schedule** : Automatique J+21
4. **Application fee** : Géré par code (30-50% selon tier)

### Configurer le Webhook Production

1. **Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint** :
   ```
   URL: https://vybzzz.com/api/stripe/webhook
   Description: VyBzzZ Production Webhook
   ```

3. **Sélectionner events** :
   ```
   ✅ payment_intent.succeeded
   ✅ payment_intent.payment_failed
   ✅ customer.subscription.created
   ✅ customer.subscription.updated
   ✅ customer.subscription.deleted
   ✅ account.updated
   ```

4. **Copier le Signing Secret** : `whsec_xxxxxxxxxxxxx`
5. **Ajouter à Vercel** : `STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx`

### Tester les Webhooks

```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Tester le webhook
stripe trigger payment_intent.succeeded --webhook-endpoint https://vybzzz.com/api/stripe/webhook
```

### Vérifier Configuration

```bash
# Test endpoint
curl https://vybzzz.com/api/stripe/test
```

---

## 5️⃣ Resend (Emails)

### Configuration

1. Aller sur https://resend.com/dashboard
2. **API Keys** → **Create API Key**
   ```
   Name: VyBzzZ Production
   Permission: Sending access
   ```

3. Copier la clé : `re_xxxxxxxxxxxxx`
4. Ajouter à Vercel : `RESEND_API_KEY=re_xxxxxxxxxxxxx`

### Configurer le Domaine

1. **Domains** → **Add Domain**
2. Ajouter : `vybzzz.com`
3. Configurer les DNS records :
   ```
   Type: TXT
   Name: @
   Value: [fourni par Resend]

   Type: MX
   Name: @
   Value: [fourni par Resend]
   Priority: 10
   ```

### Templates Email

Vérifier que les templates existent dans `/emails/` :
- ✅ ticket-confirmation.tsx
- ✅ event-reminder.tsx
- ✅ payout-notification.tsx
- ✅ welcome.tsx

### Test

```bash
# Tester l'envoi d'email
curl -X POST https://vybzzz.com/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "votre-email@example.com"}'
```

---

## 6️⃣ Sentry (Monitoring)

### Configuration

1. Aller sur https://sentry.io
2. **Create Project** → **Next.js**
3. Nom : `vybzzz-platform`

### Obtenir le DSN

```bash
# Format du DSN
https://xxxxxxxxxxxxx@xxxxxxxxxxxxx.ingest.sentry.io/xxxxxxxxxxxxx
```

### Ajouter à Vercel & Railway

```bash
SENTRY_DSN=https://xxxxxxxxxxxxx@xxxxxxxxxxxxx.ingest.sentry.io/xxxxxxxxxxxxx
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxxx@xxxxxxxxxxxxx.ingest.sentry.io/xxxxxxxxxxxxx
```

### Vérifier Configuration

Les fichiers suivants doivent exister :
- ✅ `sentry.client.config.ts`
- ✅ `sentry.server.config.ts`
- ✅ `sentry.edge.config.ts`
- ✅ `instrumentation.ts`

### Test

```bash
# Déclencher une erreur test
curl https://vybzzz.com/api/sentry-test
```

---

## ✅ Checklist Complète de Vérification

### Avant Déploiement

#### Variables d'Environnement
```bash
# Vérifier en local
npm run check-env:prod

# Vérifier dans Vercel Dashboard
# Settings → Environment Variables → Production
# Compter : devrait être 15-20 variables minimum
```

#### Tests Locaux
```bash
# Tous les tests passent
npm test

# Build sans erreurs
npm run build

# Type checking sans erreurs
npm run type-check
```

### Après Déploiement Vercel

```bash
# 1. Site accessible
curl -I https://vybzzz.com
# → Attendu: HTTP/2 200

# 2. API Health check
curl https://vybzzz.com/api/health
# → Attendu: {"status": "ok"}

# 3. Supabase connecté
curl https://vybzzz.com/api/test/supabase
# → Attendu: {"connected": true}

# 4. Stripe configuré
curl https://vybzzz.com/api/test/stripe
# → Attendu: {"configured": true}
```

### Après Déploiement Railway

```bash
# 1. Backend accessible
curl https://vybzzz-backend.railway.app/health
# → Attendu: {"status": "healthy"}

# 2. Storage fonctionne
curl -X POST https://vybzzz-backend.railway.app/api/storage/test
# → Attendu: {"success": true}

# 3. CORS configuré
curl -H "Origin: https://vybzzz.com" https://vybzzz-backend.railway.app/api/test
# → Attendu: Header Access-Control-Allow-Origin présent
```

### Tests Fonctionnels E2E

```bash
# 1. Inscription utilisateur
# Manuel : https://vybzzz.com/auth/signup

# 2. Achat de ticket (mode test Stripe)
# Manuel : Acheter un ticket avec carte 4242 4242 4242 4242

# 3. Vérifier webhook reçu
# Vérifier dans Stripe Dashboard → Webhooks → Logs

# 4. Vérifier email envoyé
# Vérifier dans Resend Dashboard → Emails

# 5. Vérifier transaction en base
# SELECT * FROM tickets ORDER BY created_at DESC LIMIT 1;
```

---

## 🚨 Troubleshooting

### Erreur: Webhook Signature Invalid

**Cause**: STRIPE_WEBHOOK_SECRET incorrect ou manquant

**Solution**:
```bash
# 1. Vérifier le secret dans Stripe Dashboard
# 2. Copier exactement (commence par whsec_)
# 3. Mettre à jour dans Vercel
# 4. Redéployer
vercel --prod
```

### Erreur: CORS Blocked

**Cause**: CORS_ORIGIN mal configuré dans Railway

**Solution**:
```bash
# Dans Railway Dashboard → Variables
CORS_ORIGIN=https://vybzzz.com

# Redéployer
railway up
```

### Erreur: Supabase RLS Denied

**Cause**: Row Level Security bloque l'opération

**Solution**:
```bash
# Vérifier que SUPABASE_SERVICE_ROLE_KEY est utilisé
# Dans le code backend, utiliser la service role key

# Ou désactiver temporairement RLS (NON RECOMMANDÉ en prod)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Erreur: Cron Job ne se déclenche pas

**Cause**: CRON_SECRET invalide ou manquant

**Solution**:
```bash
# 1. Générer un nouveau secret
openssl rand -base64 32

# 2. Ajouter à Vercel
CRON_SECRET=votre_nouveau_secret

# 3. Tester manuellement
curl -H "Authorization: Bearer votre_nouveau_secret" \
  https://vybzzz.com/api/cron/payouts
```

---

## 📊 Monitoring Post-Lancement

### Métriques à Surveiller

```bash
# Vercel Analytics
- Page views
- Unique visitors
- Response time
- Error rate

# Railway Metrics
- CPU usage
- Memory usage
- Request count
- Response time

# Supabase Metrics
- Database size
- Storage size
- API requests
- Active connections

# Stripe Dashboard
- Successful payments
- Failed payments
- Refunds
- Disputes
```

### Alertes à Configurer

1. **Sentry** : Erreurs critiques
2. **Vercel** : Déploiement échoué
3. **Railway** : Service down
4. **Stripe** : Webhook failed
5. **Supabase** : Quota 80% atteint

---

## 📞 Support & Contacts

### En Cas de Problème

| Service | Contact | Temps Réponse |
|---------|---------|---------------|
| Vercel | support@vercel.com | 24h |
| Railway | support@railway.app | 12h |
| Supabase | support@supabase.com | 24h |
| Stripe | support@stripe.com | 12h |
| Resend | support@resend.com | 24h |

### Documentation

- **Vercel**: https://vercel.com/docs
- **Railway**: https://docs.railway.app
- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **Next.js**: https://nextjs.org/docs

---

## 🎯 Timeline de Déploiement

### Semaine 1-2 (18-29 nov)
- [ ] Configurer Vercel (variables d'env)
- [ ] Configurer Railway (variables d'env)
- [ ] Migrer Supabase production
- [ ] Configurer Stripe Live mode
- [ ] Configurer webhooks

### Semaine 3 (2-8 déc)
- [ ] Tests bout en bout
- [ ] Monitoring Sentry
- [ ] Configuration emails Resend
- [ ] Tests de charge

### Semaine 4 (9-15 déc)
- [ ] Déploiement staging
- [ ] Tests utilisateurs beta
- [ ] Corrections bugs

### Semaine 5-6 (16-29 déc)
- [ ] Déploiement production final
- [ ] Vérification complète
- [ ] Formation équipe support
- [ ] Documentation admin

### 31 DÉCEMBRE
- 🚀 **LANCEMENT OFFICIEL**

---

**Dernière mise à jour** : 15 novembre 2025
**Validé par** : [À compléter]
**Prochaine révision** : 22 novembre 2025

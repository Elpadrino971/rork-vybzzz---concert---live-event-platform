# 🚀 Guide de Déploiement VyBzzZ V1.0 MVP

**Version**: 1.0.0
**Date**: Novembre 2025
**Objectif**: Lancement concert David Guetta - 31 décembre 2025

---

## 📋 Pré-requis

### Comptes nécessaires
- ✅ **Vercel** (déploiement frontend) - [vercel.com](https://vercel.com)
- ✅ **Supabase** (database + auth) - [supabase.com](https://supabase.com)
- ✅ **Stripe** (paiements) - [stripe.com](https://stripe.com)

### Outils à installer
```bash
# Node.js 18+ et npm
node --version  # Doit être 18.x ou supérieur
npm --version

# Git
git --version
```

---

## 🗄️ ÉTAPE 1: Configuration Supabase

### 1.1 Créer le projet Supabase

1. Aller sur [supabase.com/dashboard](https://supabase.com/dashboard)
2. Cliquer sur "New Project"
3. Remplir:
   - **Name**: vybzzz-v1
   - **Database Password**: (générer un mot de passe sécurisé - le garder!)
   - **Region**: West EU (Frankfurt) ou Europe West (London)
   - **Pricing Plan**: Free (suffisant pour MVP)

### 1.2 Exécuter le schéma SQL

1. Dans le dashboard Supabase, aller dans **SQL Editor**
2. Créer une nouvelle query
3. Copier tout le contenu de `supabase/schema-v1-mvp.sql`
4. Cliquer sur **Run** (bouton vert)
5. Vérifier qu'il n'y a pas d'erreurs (toutes les tables doivent être créées)

### 1.3 Récupérer les clés API

1. Aller dans **Settings** → **API**
2. Noter ces 3 informations:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (commence par eyJ)
   - **service_role key**: `eyJhbGc...` (commence par eyJ, PLUS LONGUE)

⚠️ **IMPORTANT**: Ne jamais partager la `service_role key` publiquement!

---

## 💳 ÉTAPE 2: Configuration Stripe

### 2.1 Créer le compte Stripe

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. S'inscrire ou se connecter
3. **Activer le mode Test** (toggle en haut à droite)

### 2.2 Récupérer les clés API

1. Aller dans **Developers** → **API Keys**
2. Noter:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (cliquer sur "Reveal")

### 2.3 Configurer le webhook

1. Aller dans **Developers** → **Webhooks**
2. Cliquer sur **Add endpoint**
3. **Endpoint URL**: `https://VOTRE-DOMAINE.vercel.app/api/stripe/webhook`
   - ⚠️ On mettra l'URL finale après déploiement Vercel (étape 4)
4. **Events to send**: sélectionner ces 2 événements:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.payment_failed`
5. Cliquer sur **Add endpoint**
6. **Signing secret**: Noter le `whsec_...` (cliquer sur "Reveal")

---

## 🔧 ÉTAPE 3: Configuration Locale

### 3.1 Cloner ou naviguer vers le projet

```bash
cd /home/user/rork-vybzzz---concert---live-event-platform
```

### 3.2 Créer le fichier .env.local

```bash
# Copier le template
cp .env-v1-mvp.example .env.local
```

### 3.3 Remplir les variables d'environnement

Éditer `.env.local` avec vos vraies valeurs:

```bash
# Supabase (depuis étape 1.3)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe (depuis étape 2.2)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (générer un string aléatoire de 32+ caractères)
CRON_SECRET=votre-secret-aleatoire-tres-long-minimum-32-caracteres
```

**Générer un CRON_SECRET sécurisé**:
```bash
# Sur Linux/Mac
openssl rand -base64 32

# Sur Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3.4 Installer les dépendances

```bash
# Utiliser le package.json V1
cp package-v1-mvp.json package.json

# Installer
npm install
```

### 3.5 Tester en local

```bash
# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

**Tests à faire**:
1. ✅ Page d'accueil charge correctement
2. ✅ Inscription (`/auth/signup`) fonctionne
3. ✅ Connexion (`/auth/signin`) fonctionne
4. ✅ Créer un événement (se connecter en tant qu'artiste)
5. ✅ Voir la liste des événements
6. ✅ Acheter un billet (mode test Stripe)
   - Utiliser la carte test: `4242 4242 4242 4242`
   - Date: n'importe quelle date future
   - CVC: n'importe quel 3 chiffres
7. ✅ Voir le billet dans "Mes Billets"
8. ✅ QR code s'affiche correctement

---

## ☁️ ÉTAPE 4: Déploiement Vercel

### 4.1 Préparer les fichiers de configuration

```bash
# Renommer/copier les fichiers V1 en versions principales
cp next.config-v1.js next.config.js
cp vercel-v1.json vercel.json
cp middleware-v1.ts middleware.ts
```

### 4.2 Créer le projet Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository**:
   - Se connecter à GitHub
   - Sélectionner le repo `rork-vybzzz---concert---live-event-platform`
3. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (laisser par défaut)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (laisser par défaut)

### 4.3 Configurer les variables d'environnement

Dans **Environment Variables**, ajouter **TOUTES** ces variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://VOTRE-PROJET.vercel.app
CRON_SECRET=votre-secret-aleatoire-tres-long
```

⚠️ **Important**:
- Cocher **Production**, **Preview**, et **Development** pour chaque variable
- Pour `NEXT_PUBLIC_APP_URL`, utiliser l'URL Vercel (on la connaîtra après le premier déploiement)

### 4.4 Déployer

1. Cliquer sur **Deploy**
2. Attendre 2-3 minutes
3. Noter l'URL de déploiement: `https://votre-projet.vercel.app`

### 4.5 Mettre à jour NEXT_PUBLIC_APP_URL

1. Aller dans **Settings** → **Environment Variables**
2. Éditer `NEXT_PUBLIC_APP_URL`
3. Remplacer par l'URL réelle: `https://votre-projet.vercel.app`
4. **Redéployer**: aller dans **Deployments** → cliquer sur les 3 points → **Redeploy**

---

## 🔗 ÉTAPE 5: Finaliser Stripe Webhook

### 5.1 Mettre à jour l'endpoint Stripe

1. Retourner sur [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquer sur le webhook créé à l'étape 2.3
3. **Endpoint URL**: éditer pour mettre `https://votre-projet.vercel.app/api/stripe/webhook`
4. Sauvegarder

### 5.2 Tester le webhook

```bash
# Dans Stripe Dashboard → Webhooks → votre endpoint
# Cliquer sur "Send test webhook"
# Sélectionner "checkout.session.completed"
# Cliquer sur "Send test webhook"

# Vérifier dans l'onglet "Logs" que le webhook a bien été reçu (status 200)
```

---

## ✅ ÉTAPE 6: Tests de Production

### 6.1 Test complet du flow

1. **Inscription**:
   - Aller sur `https://votre-projet.vercel.app/auth/signup`
   - Créer un compte **artiste**
   - Email: `artiste@test.com`
   - Mot de passe: au moins 6 caractères

2. **Créer un événement**:
   - Aller sur `/artist/dashboard`
   - Cliquer sur "Créer un événement"
   - Remplir tous les champs:
     - Titre: "Concert Test"
     - Date: une date future
     - Prix: 9.99€
     - Capacité: 100
     - URL image: (optionnel)
   - Soumettre

3. **Se déconnecter et créer un compte fan**:
   - `/auth/signup`
   - Créer un compte **fan**
   - Email: `fan@test.com`

4. **Acheter un billet**:
   - Aller sur `/events`
   - Cliquer sur l'événement créé
   - Cliquer sur "Acheter un billet"
   - Utiliser la carte test Stripe: `4242 4242 4242 4242`
   - Compléter le paiement

5. **Vérifier le billet**:
   - Aller sur `/fan/tickets`
   - Le billet doit apparaître avec le QR code

6. **Vérifier le dashboard artiste**:
   - Se reconnecter en tant qu'artiste
   - Aller sur `/artist/dashboard`
   - Vérifier que "Tickets vendus" = 1
   - Vérifier que "Revenu" et "Votre part (70%)" sont corrects

### 6.2 Test du cron job (optionnel)

Le cron job se déclenche automatiquement tous les jours à 2h du matin. Pour le tester manuellement:

```bash
# Faire une requête GET avec le CRON_SECRET
curl -X GET "https://votre-projet.vercel.app/api/cron/payouts" \
  -H "Authorization: Bearer votre-cron-secret"

# Réponse attendue: JSON avec les événements traités
```

---

## 📊 ÉTAPE 7: Monitoring

### 7.1 Vérifier les logs Vercel

1. Aller sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionner votre projet
3. Onglet **Logs**
4. Vérifier qu'il n'y a pas d'erreurs

### 7.2 Vérifier les webhooks Stripe

1. [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Cliquer sur votre endpoint
3. Onglet **Logs**
4. Tous les événements doivent être "Succeeded" (vert)

### 7.3 Vérifier la base de données Supabase

1. [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Table Editor**
3. Vérifier les données dans:
   - `users` (2 users: artiste + fan)
   - `events` (1 événement)
   - `tickets` (1 billet)
   - `chat_messages` (vide pour l'instant)
   - `payouts` (vide, se remplira à J+21)

---

## 🎉 ÉTAPE 8: Lancement Officiel

### 8.1 Passer en mode Production Stripe

⚠️ **Attention**: À faire UNIQUEMENT quand vous êtes prêt à accepter de vrais paiements!

1. Aller sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Désactiver le mode Test** (toggle en haut à droite)
3. **Activer votre compte** (vérification d'identité requise)
4. Récupérer les nouvelles clés:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`
5. **Recréer le webhook** pour production avec la même URL
6. **Mettre à jour** les variables d'environnement Vercel:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (nouveau secret du webhook live)
7. **Redéployer** sur Vercel

### 8.2 Configurer un domaine personnalisé (optionnel)

1. Dans Vercel, aller dans **Settings** → **Domains**
2. Ajouter votre domaine (ex: `vybzzz.com`)
3. Suivre les instructions pour configurer le DNS
4. Une fois activé, mettre à jour:
   - `NEXT_PUBLIC_APP_URL=https://vybzzz.com`
   - Webhook Stripe avec la nouvelle URL
   - Redéployer

### 8.3 Créer l'événement David Guetta

1. Se connecter en tant qu'artiste
2. Aller sur `/artist/dashboard`
3. Créer l'événement:
   - **Titre**: "David Guetta - New Year Live"
   - **Description**: "Célébrez la nouvelle année avec David Guetta en live!"
   - **Date**: 31 décembre 2025, 23:00
   - **Prix**: 9.99€ (ou le prix désiré)
   - **Capacité**: 10000 (ou la capacité désirée)
   - **URL image**: (ajouter une belle image promotionnelle)
   - **URL YouTube Live**: (sera ajouté le jour J)

---

## 🐛 Dépannage

### Problème: "Cannot read properties of undefined"

**Solution**: Vérifier que toutes les variables d'environnement sont bien définies dans Vercel.

```bash
# Vérifier localement:
npm run dev

# Si ça marche en local mais pas en prod, c'est un problème de variables d'environnement Vercel
```

### Problème: "Webhook signature verification failed"

**Solution**: Le `STRIPE_WEBHOOK_SECRET` est incorrect.

1. Aller sur Stripe Dashboard → Webhooks
2. Cliquer sur votre endpoint
3. Copier le "Signing secret"
4. Mettre à jour `STRIPE_WEBHOOK_SECRET` dans Vercel
5. Redéployer

### Problème: "Unauthorized" sur le cron job

**Solution**: Le `CRON_SECRET` ne correspond pas.

1. Vérifier que `CRON_SECRET` est bien défini dans Vercel
2. Utiliser le même secret dans la requête curl

### Problème: Le chat ne fonctionne pas en temps réel

**Solution**: Vérifier que Supabase Realtime est activé.

1. Aller dans Supabase Dashboard
2. **Database** → **Replication**
3. Activer la réplication pour la table `chat_messages`

### Problème: Les billets ne sont pas créés après paiement

**Solution**: Le webhook Stripe n'est pas configuré ou ne fonctionne pas.

1. Vérifier que l'URL du webhook est correcte
2. Vérifier les logs du webhook dans Stripe Dashboard
3. Vérifier les logs de l'API dans Vercel

---

## 📝 Checklist Finale

### Avant le lancement

- [ ] Base de données Supabase créée et schéma appliqué
- [ ] Compte Stripe configuré (mode test puis live)
- [ ] Webhook Stripe configuré et testé
- [ ] Variables d'environnement Vercel toutes définies
- [ ] Application déployée sur Vercel
- [ ] Tests complets réalisés (inscription, achat, dashboard)
- [ ] Cron job testé manuellement
- [ ] Monitoring vérifié (logs Vercel, Stripe, Supabase)
- [ ] Événement David Guetta créé (si applicable)

### Jour du lancement

- [ ] Passer Stripe en mode production
- [ ] Vérifier que le webhook production fonctionne
- [ ] Ajouter l'URL YouTube Live à l'événement
- [ ] Tester l'accès à `/event/[id]/live`
- [ ] Tester le chat en temps réel
- [ ] Être prêt à surveiller les logs en temps réel

---

## 🎯 Prochaines Étapes (V1.1 et au-delà)

Voir `ROADMAP-18-MONTHS.md` pour:
- TikTok Swipe UI (janvier 2026)
- Application mobile (janvier 2026)
- Tips & Pourboires (mars 2026)
- Affiliés & Gamification (mai 2026)
- AI Highlights (septembre 2026)

---

## 📞 Support

En cas de problème, vérifier:
1. **Logs Vercel**: pour les erreurs de déploiement
2. **Logs Stripe**: pour les problèmes de paiement
3. **Logs Supabase**: pour les problèmes de base de données

**Documentation officielle**:
- [Next.js](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Stripe](https://stripe.com/docs)
- [Vercel](https://vercel.com/docs)

---

**Bonne chance pour le lancement ! 🚀🎉**

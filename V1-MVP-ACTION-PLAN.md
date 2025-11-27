# 🚀 PLAN D'ACTION V1.0 MVP - VYBZZZ

**Objectif** : Lancer la plateforme pour le concert David Guetta le 31 décembre 2025
**Timeline** : 5 jours
**Status** : 🟡 EN COURS

---

## ✅ JOUR 1 : NETTOYAGE BACKEND (6h)

### 1.1 Configuration initiale ✅
- [x] Créer branche `v1.0-mvp`
- [x] Backup schema DB actuel
- [x] Créer nouveau schema simplifié (`schema-v1-mvp.sql`)
- [x] Créer BusinessRules simplifié (`BusinessRules-v1-mvp.ts`)

### 1.2 Supprimer code inutile (2h)
```bash
# Supprimer routes affiliés
rm -rf app/api/affiliates/
rm -rf app/api/regional/
rm -rf app/affiliate/

# Supprimer routes gamification
rm -rf app/api/miles/
rm -rf app/api/badges/

# Supprimer routes tips
rm -rf app/api/tips/

# Supprimer Happy Hour
rm lib/happy-hour.ts

# Supprimer langues inutiles (garder EN + FR)
rm -rf locales/de/
rm -rf locales/pt/
rm -rf locales/ja/
rm -rf locales/zh/
rm -rf locales/es/
```

### 1.3 Simplifier les API routes existantes (2h)
- [ ] `app/api/tickets/purchase/route.ts` → Enlever logique affiliés/RR
- [ ] `app/api/stripe/webhook/route.ts` → Enlever commission calculations
- [ ] `app/api/cron/payouts/route.ts` → Simplifier avec juste 70/30 split
- [ ] `app/api/dashboard/artist/route.ts` → Enlever metrics complexes

### 1.4 Mettre à jour constants (30min)
```bash
# Remplacer BusinessRules.ts
mv constants/BusinessRules.ts constants/BusinessRules-OLD.ts
mv constants/BusinessRules-v1-mvp.ts constants/BusinessRules.ts
```

### 1.5 Commit Jour 1 (15min)
```bash
git add .
git commit -m "feat(v1-mvp): cleanup backend - remove affiliates, gamification, tips, happy hour"
git push origin v1.0-mvp
```

---

## 🔲 JOUR 2 : NETTOYAGE FRONTEND (6h)

### 2.1 Supprimer pages inutiles (1h)
```bash
# Supprimer dashboards affiliés
rm -rf app/affiliate/_dashboard/

# Supprimer pages gamification
rm -rf app/miles/
rm -rf app/badges/

# Supprimer pages tips
rm -rf app/tips/
```

### 2.2 Simplifier les composants (2h)
- [ ] `components/events/EventCard.tsx` → Enlever badges/miles
- [ ] `components/events/PurchaseTicketButton.tsx` → Simplifier flow
- [ ] `components/events/EventChat.tsx` → Garder minimal
- [ ] Dashboard artiste → Enlever graphs complexes, garder juste :
  - Nombre de billets vendus
  - Revenu total
  - Prochaine date de payout

### 2.3 Simplifier les pages principales (2h)
- [ ] `/app/page.tsx` (Homepage) → Liste des events à venir
- [ ] `/app/events/page.tsx` → Grille simple d'événements
- [ ] `/app/event/[id]/page.tsx` → Info + bouton achat
- [ ] `/app/event/[id]/live/page.tsx` → Player YouTube + Chat
- [ ] `/app/artist/dashboard/page.tsx` → Stats simples

### 2.4 Mettre à jour i18n (30min)
- [ ] Garder seulement `locales/en/` et `locales/fr/`
- [ ] Mettre à jour `lib/i18n.ts` pour 2 langues seulement

### 2.5 Commit Jour 2 (30min)
```bash
git add .
git commit -m "feat(v1-mvp): cleanup frontend - simplify UI components and pages"
git push origin v1.0-mvp
```

---

## 🔲 JOUR 3 : TESTS INTENSIFS (8h)

### 3.1 Appliquer le nouveau schema DB (30min)
```bash
# Dans Supabase SQL Editor
# Copier/coller le contenu de supabase/schema-v1-mvp.sql
# Exécuter

# OU réinitialiser complètement
# ⚠️ ATTENTION : Supprime toutes les données
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
# Puis exécuter schema-v1-mvp.sql
```

### 3.2 Mettre à jour les variables d'environnement (30min)
Simplifier `.env.local` :
```bash
# Supabase (REQUIS)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (REQUIS)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Cron (REQUIS)
CRON_SECRET=

# Email (OPTIONNEL pour V1)
RESEND_API_KEY=

# Sentry (OPTIONNEL pour V1)
NEXT_PUBLIC_SENTRY_DSN=
```

### 3.3 Test local complet (3h)
**Scénario 1 : Créer un événement**
- [ ] Signup artiste
- [ ] Login artiste
- [ ] Créer événement test :
  - Titre : "Concert Test"
  - Date : Dans 1 semaine
  - Prix : 10€
  - Capacité : 100
  - YouTube URL : (vide pour l'instant)
- [ ] Upload image événement
- [ ] Publier événement

**Scénario 2 : Acheter un billet**
- [ ] Aller sur `/events`
- [ ] Cliquer sur l'événement test
- [ ] Cliquer "Acheter un billet"
- [ ] Remplir Stripe Checkout (carte test : 4242 4242 4242 4242)
- [ ] Vérifier redirection vers page succès
- [ ] Vérifier email de confirmation reçu
- [ ] Vérifier QR code généré

**Scénario 3 : Dashboard artiste**
- [ ] Login artiste
- [ ] Aller sur `/artist/dashboard`
- [ ] Vérifier :
  - Événement apparaît
  - Nombre billets vendus : 1
  - Revenu brut : 10€
  - Ta part (70%) : 7€
  - Date payout : J+21 après l'événement

**Scénario 4 : Live + Chat**
- [ ] Mettre événement en statut "live"
- [ ] Aller sur `/event/[id]/live`
- [ ] Vérifier player YouTube fonctionne
- [ ] Envoyer message dans le chat
- [ ] Vérifier message apparaît en temps réel

### 3.4 Tests automatisés (2h)
```bash
# Simplifier les tests existants
# Garder seulement :
npm run test:ticket-purchase  # 5-6 tests essentiels
npm run test:webhooks          # 4-5 tests essentiels
npm run test:payouts           # 3-4 tests essentiels

# Total : ~15 tests au lieu de 50
```

### 3.5 Fix des bugs trouvés (2h)
- [ ] Noter tous les bugs dans un fichier `BUGS.md`
- [ ] Fixer par ordre de priorité (bloquants d'abord)
- [ ] Retester après chaque fix

### 3.6 Commit Jour 3
```bash
git add .
git commit -m "test(v1-mvp): fix bugs found during testing"
git push origin v1.0-mvp
```

---

## 🔲 JOUR 4 : DÉPLOIEMENT (6h)

### 4.1 Préparation Supabase Production (1h)
- [ ] Créer nouveau projet Supabase "vybzzz-prod" (ou utiliser existant)
- [ ] Exécuter `schema-v1-mvp.sql`
- [ ] Configurer Auth (email/password enabled)
- [ ] Créer buckets Storage :
  - `event-images`
  - `user-avatars`
- [ ] Noter les credentials :
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### 4.2 Préparation Stripe Production (1h)
- [ ] Activer compte Stripe (si test mode)
- [ ] Configurer Stripe Connect
- [ ] Créer webhook endpoint : `https://vybzzz.com/api/stripe/webhook`
- [ ] Sélectionner events :
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
- [ ] Noter le webhook secret

### 4.3 Déploiement Vercel (Web) (2h)
```bash
# Installer Vercel CLI
npm i -g vercel

# Lier le projet
vercel link

# Ajouter toutes les env vars dans Vercel dashboard
# Settings → Environment Variables

# Déployer
vercel --prod

# Vérifier que tout fonctionne
curl https://vybzzz.com/api/health
```

### 4.4 Déploiement Railway (Backend) (1h)
```bash
# Railway devrait auto-déployer depuis la branche v1.0-mvp
# Vérifier dans Railway dashboard

# Ajouter env vars dans Railway :
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- CORS_ORIGIN=https://vybzzz.com

# Vérifier que le backend fonctionne
curl https://ton-backend.railway.app/health
```

### 4.5 Tests en production (1h)
**Refaire TOUS les scénarios du Jour 3 en PROD** :
- [ ] Créer événement
- [ ] Acheter billet (avec vraie carte si Stripe live)
- [ ] Vérifier email
- [ ] Vérifier dashboard
- [ ] Tester chat

### 4.6 Commit Jour 4
```bash
git add .
git commit -m "deploy(v1-mvp): production deployment successful"
git push origin v1.0-mvp
```

---

## 🔲 JOUR 5 : ÉVÉNEMENT DAVID GUETTA (4h)

### 5.1 Créer l'événement David Guetta (1h)
- [ ] Login artiste (créer compte David Guetta ou utiliser le tien)
- [ ] Créer événement :
  - **Titre** : "David Guetta - New Year's Eve 2025"
  - **Description** : "Célébrez le Nouvel An avec David Guetta en live ! Concert exceptionnel diffusé en direct depuis [lieu]."
  - **Date** : 31 décembre 2025, 20:00 (Europe/Paris)
  - **Prix** : 9.99€
  - **Capacité** : 10,000
  - **YouTube Live URL** : (à ajouter le jour J)
  - **Image** : Upload une belle affiche
- [ ] Publier l'événement
- [ ] Noter l'URL : `https://vybzzz.com/event/[ID]`

### 5.2 Marketing & Communication (2h)
**Page landing dédiée** (optionnel) :
- [ ] Créer `/app/nye-2025/page.tsx` avec countdown
- [ ] Redirection depuis homepage vers cet événement

**Réseaux sociaux** :
- [ ] Post Instagram avec visuel + lien
- [ ] Post Facebook avec event
- [ ] Tweet avec hashtag #VyBzzZ #DavidGuetta #NYE2025
- [ ] Story TikTok avec teaser

**Email marketing** (si liste) :
- [ ] Envoyer email à ta liste
- [ ] Offre early bird ? (8.99€ au lieu de 9.99€ pour les 100 premiers ?)

**Influenceurs** :
- [ ] Contacter 3-5 micro-influenceurs musique électro
- [ ] Leur offrir 5 billets gratuits en échange de promotion

### 5.3 Monitoring & Support (1h)
- [ ] Configurer alerte Sentry (si erreur en prod)
- [ ] Préparer un email support@vybzzz.com
- [ ] Créer un doc FAQ :
  - Comment acheter un billet ?
  - Comment rejoindre le live ?
  - Puis-je être remboursé ?
  - Problèmes techniques ?

---

## 🎯 CHECKLIST FINALE AVANT LANCEMENT

### Fonctionnel
- [ ] Achat de billet fonctionne (testé 10 fois)
- [ ] Email confirmation envoyé automatiquement
- [ ] QR code généré et affiché
- [ ] Dashboard artiste affiche les bonnes stats
- [ ] Chat temps réel fonctionne
- [ ] Player YouTube fonctionne
- [ ] Payout J+21 programmé (cron job vérifié)

### Sécurité
- [ ] RLS Supabase activé sur toutes les tables
- [ ] Webhook Stripe signature vérifiée
- [ ] HTTPS obligatoire
- [ ] CORS configuré correctement
- [ ] Rate limiting sur chat

### Performance
- [ ] Page load < 3 secondes
- [ ] Images optimisées (WebP, lazy loading)
- [ ] Database indexed (voir schema-v1-mvp.sql)

### Légal
- [ ] CGV affichées
- [ ] Politique de confidentialité
- [ ] Mentions légales
- [ ] Contact email visible

---

## 📊 MÉTRIQUES DE SUCCÈS V1.0

**Critère minimum** : 10 billets vendus
**Critère bon** : 50 billets vendus
**Critère excellent** : 100+ billets vendus

**KPIs à tracker** :
- Nombre de visiteurs uniques
- Taux de conversion (visiteurs → acheteurs)
- Nombre de messages dans le chat
- Durée moyenne de visionnage du live

---

## 🐛 SI PROBLÈME LE JOUR J

### Le live ne se lance pas
- Vérifier le lien YouTube Live
- Tester avec un autre navigateur
- Backup : Diffuser sur Twitch en parallèle

### Le chat ne fonctionne pas
- Vérifier Supabase Realtime
- Backup : Utiliser chat YouTube Live

### Trop de charge (serveur down)
- Vercel scale automatiquement (normalement OK)
- Backup : Activer Cloudflare

### Paiements échouent
- Vérifier Stripe dashboard
- Vérifier webhook endpoint
- Support Stripe : support@stripe.com

---

## 🚀 APRÈS LE 31 DÉCEMBRE

### Jour 1-2 : Analyse
- Extraire toutes les métriques
- Interviewer 10 utilisateurs (qu'ont-ils aimé/pas aimé ?)
- Lister les bugs rencontrés

### Semaine 1 : Décisions
- Décider quelles features V1.1 développer
- Prioriser selon feedback utilisateurs
- Planifier roadmap V1.1 → V2.0

### J+21 : Payout
- Vérifier que le cron job a tourné
- Vérifier que l'artiste a reçu son paiement
- Envoyer email confirmation à l'artiste

---

## 📞 CONTACTS UTILES

- **Stripe Support** : https://support.stripe.com
- **Supabase Support** : https://supabase.com/support
- **Vercel Support** : https://vercel.com/support
- **Railway Support** : https://railway.app/help

---

**Dernière mise à jour** : Jour 1
**Prochaine étape** : Supprimer code inutile (Étape 1.2)

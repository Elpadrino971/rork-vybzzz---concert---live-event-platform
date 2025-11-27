# 🎵 VyBzzZ V1.0 MVP - Plateforme de Concerts Live

**Version**: 1.0.0
**Date**: Novembre 2025
**Lancement**: 31 décembre 2025 (Concert David Guetta)

---

## 📖 Présentation

VyBzzZ est une plateforme web de concerts en direct qui permet aux artistes de diffuser leurs performances live et aux fans d'acheter des billets pour y assister.

### ✨ Fonctionnalités V1.0

**Pour les Fans**:
- 🎟️ Acheter des billets pour des concerts live
- 📱 Recevoir un QR code d'entrée
- 🎥 Regarder les concerts en streaming (YouTube Live)
- 💬 Participer au chat en temps réel
- 📋 Voir tous ses billets

**Pour les Artistes**:
- 🎤 Créer des événements
- 📊 Dashboard avec statistiques
- 💰 Recevoir 70% des revenus
- 💸 Paiements automatiques à J+21
- 👥 Voir le nombre de billets vendus

---

## 🏗️ Architecture

### Stack Technique

```
Frontend:          Next.js 14 (App Router) + React 18 + TypeScript
Styling:           Tailwind CSS 3.4
Authentication:    Supabase Auth
Database:          Supabase (PostgreSQL)
Paiements:         Stripe Checkout
Streaming:         YouTube Live
Chat:              Supabase Realtime
Déploiement:       Vercel
```

### Structure du Projet

```
/
├── app-v1/                    # Application Next.js V1.0
│   ├── page.tsx               # Homepage
│   ├── layout.tsx             # Layout principal
│   ├── globals.css            # Styles globaux
│   │
│   ├── auth/
│   │   ├── signin/page.tsx    # Connexion
│   │   └── signup/page.tsx    # Inscription
│   │
│   ├── events/
│   │   └── page.tsx           # Liste des événements
│   │
│   ├── event/[id]/
│   │   ├── page.tsx           # Détail événement
│   │   └── live/page.tsx      # Streaming + Chat
│   │
│   ├── artist/
│   │   └── dashboard/page.tsx # Dashboard artiste
│   │
│   ├── fan/
│   │   └── tickets/page.tsx   # Mes billets
│   │
│   ├── ticket/
│   │   └── success/page.tsx   # Confirmation achat
│   │
│   └── api/
│       ├── tickets/purchase/  # Achat billet
│       ├── events/create/     # Créer événement
│       ├── chat/send/         # Envoyer message
│       ├── stripe/webhook/    # Webhook Stripe
│       └── cron/payouts/      # Payouts J+21
│
├── lib/                       # Utilitaires
│   ├── constants-v1.ts        # Constantes business
│   ├── supabase-client-v1.ts  # Client Supabase (browser)
│   ├── supabase-server-v1.ts  # Client Supabase (server)
│   └── stripe-v1.ts           # Configuration Stripe
│
├── types/
│   └── database-v1.ts         # Types TypeScript
│
├── supabase/
│   └── schema-v1-mvp.sql      # Schéma base de données
│
├── middleware-v1.ts           # Middleware auth
├── next.config-v1.js          # Configuration Next.js
├── vercel-v1.json             # Configuration Vercel + Cron
├── package-v1-mvp.json        # Dépendances
├── .env-v1-mvp.example        # Template variables env
│
├── DEPLOYMENT-V1.md           # 📘 Guide de déploiement
├── ROADMAP-18-MONTHS.md       # 🗺️ Feuille de route
└── V1.0-BUILD-PLAN.md         # 📝 Plan de développement
```

---

## 🗄️ Base de Données

### 5 Tables Principales

```sql
users
├── id (UUID, PK)
├── email
├── role (fan | artist)
├── full_name
├── stripe_customer_id
├── stripe_account_id
└── timestamps

events
├── id (UUID, PK)
├── artist_id (FK → users)
├── title
├── description
├── event_date
├── ticket_price
├── capacity
├── tickets_sold
├── youtube_live_url
├── image_url
├── status (upcoming | live | ended | cancelled)
└── timestamps

tickets
├── id (UUID, PK)
├── event_id (FK → events)
├── user_id (FK → users)
├── email
├── price_paid
├── qr_code
├── stripe_payment_intent_id
└── timestamps

chat_messages
├── id (UUID, PK)
├── event_id (FK → events)
├── user_id (FK → users)
├── username
├── message
└── created_at

payouts
├── id (UUID, PK)
├── event_id (FK → events)
├── artist_id (FK → users)
├── gross_revenue
├── artist_share (70%)
├── platform_share (30%)
├── stripe_payout_id
└── payout_date
```

---

## 💰 Modèle de Revenus

### Partage des Revenus (70/30)

```
Prix du billet: 10€
├── Artiste (70%):     7€
└── Plateforme (30%):  3€
```

**Exemple concret**:
- Événement avec 100 billets à 10€ = 1000€ de revenus bruts
- Artiste reçoit: 700€
- Plateforme conserve: 300€

### Calendrier de Paiement

- **J+0**: Événement se termine
- **J+21**: Paiement automatique à l'artiste via Stripe
- **Minimum**: 10€ pour déclencher un paiement

---

## ⚙️ Installation & Développement

### Pré-requis

- Node.js 18+
- npm
- Compte Supabase
- Compte Stripe

### Installation Locale

```bash
# 1. Cloner le projet
git clone https://github.com/Elpadrino971/rork-vybzzz---concert---live-event-platform.git
cd rork-vybzzz---concert---live-event-platform

# 2. Utiliser les fichiers V1.0
cp package-v1-mvp.json package.json
cp .env-v1-mvp.example .env.local

# 3. Installer les dépendances
npm install

# 4. Configurer .env.local
# Éditer .env.local avec vos clés Supabase et Stripe

# 5. Créer la base de données
# Exécuter supabase/schema-v1-mvp.sql dans Supabase SQL Editor

# 6. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm start            # Serveur production
npm run lint         # Linter
```

---

## 🚀 Déploiement

**Guide complet**: Voir `DEPLOYMENT-V1.md`

### Résumé Rapide

1. **Supabase**: Créer projet + exécuter schema-v1-mvp.sql
2. **Stripe**: Configurer compte + webhook
3. **Vercel**: Déployer + configurer variables d'environnement
4. **Tests**: Vérifier inscription, achat, dashboard

---

## 🧪 Tests

### Tests Manuels

**Flow Complet**:
1. Créer un compte artiste
2. Créer un événement
3. Créer un compte fan
4. Acheter un billet (carte test: `4242 4242 4242 4242`)
5. Vérifier le billet dans "Mes Billets"
6. Vérifier les stats dans le dashboard artiste

### Carte de Test Stripe

```
Numéro:  4242 4242 4242 4242
Date:    N'importe quelle date future
CVC:     N'importe quel 3 chiffres
```

---

## 📊 Variables d'Environnement

### Obligatoires (8)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app

# Cron Job (32+ caractères aléatoires)
CRON_SECRET=votre-secret-tres-long-et-aleatoire
```

---

## 🎨 Design System

### Couleurs

```css
Primary (Orange):   #FF6B35
Secondary (Blue):   #004E89
Accent:             #F7931E

Background:         #F9FAFB (gray-50)
Text:               #111827 (gray-900)
```

### Typographie

- **Font**: Inter (Google Fonts)
- **Titres**: Bold, 24-48px
- **Corps**: Regular, 14-16px

---

## 🔒 Sécurité

### Mesures Implémentées

- ✅ **Authentication**: Supabase Auth avec JWT
- ✅ **Row Level Security (RLS)**: Toutes les tables protégées
- ✅ **HTTPS**: Forcé sur Vercel
- ✅ **Security Headers**: XSS, CSRF, Clickjacking protection
- ✅ **Input Validation**: Toutes les entrées validées côté serveur
- ✅ **Webhook Signature**: Vérification Stripe signature
- ✅ **Cron Secret**: Protection du endpoint payouts

### Best Practices

- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY`
- Ne jamais exposer `STRIPE_SECRET_KEY`
- Toujours valider les entrées utilisateur
- Utiliser HTTPS en production
- Activer Stripe en mode Test jusqu'au lancement

---

## 📈 Feuille de Route

### V1.0 (Décembre 2025) ✅
- ✅ Streaming live (YouTube)
- ✅ Billetterie simple
- ✅ Dashboard artiste
- ✅ Chat temps réel
- ✅ Paiements Stripe
- ✅ Payouts automatiques J+21

### V1.1 (Janvier 2026)
- 🔄 Interface TikTok Swipe
- 🔄 Application mobile (iOS + Android)
- 🔄 Notifications push

### V1.2 (Mars 2026)
- 📅 Tips / Pourboires
- 📅 Abonnements artistes
- 📅 Happy Hour (mercredi 20h = 4.99€)

### V1.3 (Mai 2026)
- 📅 Gamification (miles, badges)
- 📅 Système d'affiliés (3 niveaux)
- 📅 Responsables régionaux

### V2.0 (Septembre 2026)
- 📅 AI Highlights (découpage auto)
- 📅 Speech-to-Speech multilingue
- 📅 Multi-streaming (AWS IVS)

**Détails complets**: Voir `ROADMAP-18-MONTHS.md`

---

## 🤝 Contribution

Ce projet est en développement actif. Pour contribuer:

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Copyright © 2025 VyBzzZ. Tous droits réservés.

---

## 📞 Contact

**Repository**: https://github.com/Elpadrino971/rork-vybzzz---concert---live-event-platform

**Questions ?** Ouvrir une issue sur GitHub.

---

## 📚 Documentation Complète

- 📘 **[DEPLOYMENT-V1.md](./DEPLOYMENT-V1.md)** - Guide de déploiement détaillé
- 🗺️ **[ROADMAP-18-MONTHS.md](./ROADMAP-18-MONTHS.md)** - Feuille de route 18 mois
- 📝 **[V1.0-BUILD-PLAN.md](./V1.0-BUILD-PLAN.md)** - Plan de développement V1.0

---

**Construit avec ❤️ pour la communauté musicale** 🎵

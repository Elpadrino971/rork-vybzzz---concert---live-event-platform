# VyBzzZ - Live Concert Platform

VyBzzZ est une plateforme de concerts en direct qui permet aux artistes de streamer leurs performances, aux fans de regarder et soutenir leurs artistes préférés, et aux affiliés de gagner des commissions.

## Technologies

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth + Storage)
- **Paiements**: Stripe Connect (multi-party payments)
- **Streaming**: AWS IVS (Interactive Video Service)
- **Affiliation**: Système de commission à 3 niveaux

## Fonctionnalités

### Pour les Fans
- Regarder des concerts en direct
- Acheter des billets (prix régulier ou Happy Hour)
- Envoyer des pourboires aux artistes
- Chat en direct pendant les événements
- Utiliser des codes de parrainage d'affiliés

### Pour les Artistes
- Créer et gérer des événements
- Streamer en direct via AWS IVS
- Recevoir des paiements via Stripe Connect
- Voir les statistiques de revenus
- Recevoir des pourboires pendant les streams

### Pour les Affiliés
- Programme d'affiliation à 3 niveaux:
  - Niveau 1 (référence directe): 2.5%
  - Niveau 2 (parent): 1.5%
  - Niveau 3 (grand-parent): 1%
- Dashboard avec statistiques de commissions
- Code de parrainage unique

### Happy Hour
- Tous les mercredis à 20h
- Billets à 4,99€ au lieu du prix régulier
- Durée: 1 heure

## Installation

### Prérequis
- Node.js 18+
- npm ou yarn ou bun
- Compte Supabase
- Compte Stripe
- Compte AWS (pour IVS)

### Configuration

1. Cloner le repository:
```bash
git clone https://github.com/Elpadrino971/rork-vybzzz---concert---live-event-platform.git
cd rork-vybzzz---concert---live-event-platform
```

2. Installer les dépendances:
```bash
npm install
# ou
yarn install
# ou
bun install
```

3. Copier le fichier d'environnement:
```bash
cp .env.example .env.local
```

4. Configurer les variables d'environnement dans `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS IVS
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

5. Créer la base de données Supabase:
   - Aller dans votre projet Supabase
   - SQL Editor
   - Copier le contenu de `supabase/schema.sql`
   - Exécuter le SQL

6. Lancer le serveur de développement:
```bash
npm run dev
# ou
yarn dev
# ou
bun dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du Projet

```
.
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes
│   │   ├── events/         # Gestion des événements
│   │   ├── tickets/        # Achat de billets
│   │   ├── tips/           # Pourboires
│   │   ├── affiliates/     # Affiliation
│   │   └── webhooks/       # Webhooks Stripe
│   ├── layout.tsx          # Layout racine
│   └── page.tsx            # Page d'accueil
├── lib/                     # Utilitaires
│   ├── supabase/           # Clients Supabase
│   ├── stripe.ts           # Utilitaires Stripe
│   ├── aws-ivs.ts          # Intégration AWS IVS
│   ├── happy-hour.ts       # Logique Happy Hour
│   └── affiliates.ts       # Système d'affiliation
├── types/                   # Types TypeScript
│   └── database.ts         # Types de la base de données
├── supabase/               # Schéma de base de données
│   └── schema.sql          # Tables, RLS, fonctions
└── public/                 # Assets statiques
```

## API Routes

### Events
- `GET /api/events` - Liste des événements
- `POST /api/events` - Créer un événement (artistes uniquement)
- `GET /api/events/[id]` - Détails d'un événement
- `PUT /api/events/[id]` - Modifier un événement
- `DELETE /api/events/[id]` - Supprimer un événement

### Tickets
- `POST /api/tickets/purchase` - Acheter un billet

### Tips
- `POST /api/tips/create` - Envoyer un pourboire

### Affiliates
- `POST /api/affiliates/register` - S'inscrire comme affilié
- `GET /api/affiliates/stats` - Statistiques d'affiliation

### Webhooks
- `POST /api/webhooks/stripe` - Webhooks Stripe

## Base de Données

### Tables Principales
- `profiles` - Profils utilisateurs
- `artists` - Informations artistes
- `events` - Événements/Concerts
- `tickets` - Billets achetés
- `tips` - Pourboires
- `transactions` - Toutes les transactions
- `affiliates` - Affiliés
- `affiliate_commissions` - Commissions d'affiliation
- `event_attendees` - Participants aux événements
- `event_messages` - Messages de chat

## Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Authentification via Supabase Auth
- Paiements sécurisés via Stripe Connect
- Webhooks Stripe pour la validation des paiements
- Variables d'environnement pour les secrets

## Stripe Connect

Les artistes doivent compléter l'onboarding Stripe Connect pour:
- Recevoir les paiements des billets
- Recevoir les pourboires
- Gérer leurs revenus

La plateforme prend:
- 5% sur les ventes de billets
- 10% sur les pourboires

## AWS IVS

Configuration pour le streaming en direct:
- Création automatique de channels IVS
- Génération de stream keys
- URLs de lecture pour les fans
- Enregistrement VOD (optionnel)

## Déploiement

### Vercel (Recommandé)
```bash
vercel deploy
```

### Autres Plateformes
- Netlify
- AWS Amplify
- Railway
- Render

## Contribution

Les contributions sont les bienvenues! Merci de créer une issue ou une pull request.

## Licence

Créé par Rork pour VyBzzZ

## Support

Pour toute question ou support, contactez l'équipe VyBzzZ.

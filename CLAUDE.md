# CLAUDE.md - VyBzzZ Platform AI Assistant Guide

**Last Updated**: November 15, 2025
**Version**: 1.0.0
**Launch Target**: December 31, 2025 (David Guetta Concert)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Codebase Structure](#codebase-structure)
4. [Key Business Rules](#key-business-rules)
5. [Development Workflows](#development-workflows)
6. [Testing Guidelines](#testing-guidelines)
7. [Deployment Process](#deployment-process)
8. [Common Tasks & Patterns](#common-tasks--patterns)
9. [Security & Compliance](#security--compliance)
10. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**VyBzzZ** is a mobile-first live concert streaming platform connecting artists with fans through real-time performances. It features a sophisticated multi-level affiliate system, gamification, and AI-powered highlights.

### Core Value Proposition
- **For Artists**: Monetize live performances with tier-based revenue sharing (50-70% artist share)
- **For Fans**: Access exclusive live concerts with interactive features (chat, tips, gamification)
- **For Affiliates**: Earn commissions through a 3-level referral system

### Launch Details
- **Target Date**: December 31, 2025
- **Launch Event**: David Guetta concert via YouTube Live
- **Current Status**: Backend 95% complete, Frontend 90% complete, Mobile App 20% complete

---

## Architecture & Technology Stack

### Hybrid Monorepo Structure

```
┌─────────────────────────────────────────────────────────┐
│                     VyBzzZ Platform                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────┐    ┌───────────────────────────┐  │
│  │  Next.js 14    │    │   Express Backend         │  │
│  │  (Frontend +   │◄───┤   (Real-time ops)         │  │
│  │   API Routes)  │    │   - Streaming             │  │
│  │                │    │   - Chat                   │  │
│  │  - App Router  │    │   - Webhooks               │  │
│  │  - React 18    │    │   - Storage                │  │
│  │  - TypeScript  │    │                            │  │
│  └────────┬───────┘    └───────────┬────────────────┘  │
│           │                        │                    │
│           └────────┬───────────────┘                    │
│                    │                                    │
│         ┌──────────▼──────────┐                        │
│         │   Supabase          │                        │
│         │   - PostgreSQL      │                        │
│         │   - Auth            │                        │
│         │   - Storage         │                        │
│         │   - Realtime        │                        │
│         └─────────────────────┘                        │
│                                                         │
│  ┌────────────────┐    ┌──────────────┐               │
│  │  Stripe        │    │  Resend      │               │
│  │  Connect       │    │  (Emails)    │               │
│  └────────────────┘    └──────────────┘               │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: Next.js 14.2.0 (App Router)
- **Runtime**: React 18.3.0
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3.4.0
- **Icons**: Lucide React 0.400.0
- **Date Handling**: date-fns 3.6.0
- **Validation**: Zod 3.23.0
- **Email Templates**: React Email 4.3.2

#### Backend (Express Server - `/backend`)
- **Server**: Express 4.18.2
- **Database Client**: @supabase/supabase-js 2.39.3
- **Payments**: Stripe 14.25.0
- **AI**: OpenAI 4.47.1
- **Push Notifications**: expo-server-sdk 3.7.0
- **File Uploads**: Multer 1.4.5-lts.1

#### Infrastructure
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Payments**: Stripe Connect (multi-party payouts)
- **Email**: Resend (GDPR-compliant, EU-based)
- **Monitoring**: Sentry (error tracking & performance)
- **Streaming**: YouTube Live (MVP), AWS IVS (future)
- **Deployment**:
  - Frontend: Vercel
  - Backend: Railway
  - Mobile: Expo (future)

#### Internationalization
- **6 Languages Supported**: English, French, Spanish, Portuguese, German, Chinese
- **Location**: `/locales/{lang}/common.json` and `/locales/{lang}/dashboard.json`

---

## Codebase Structure

### Root Directory Layout

```
/
├── app/                          # Next.js 14 App Router
│   ├── (tabs)/                   # Mobile-style tab navigation
│   ├── api/                      # API routes
│   ├── events/                   # Event pages
│   ├── artist/                   # Artist dashboard
│   ├── fan/                      # Fan dashboard
│   ├── affiliate/                # AA/RR system
│   ├── auth/                     # Authentication pages
│   ├── legal/                    # Legal pages
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
│
├── backend/                      # Express server
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   ├── routes/               # API routes
│   │   │   ├── payments.ts       # Payment processing
│   │   │   ├── chat.ts           # Real-time chat
│   │   │   ├── events.ts         # Event streaming
│   │   │   ├── storage.ts        # File operations
│   │   │   ├── webhook.ts        # Stripe webhooks
│   │   │   └── notifications.ts  # Push notifications
│   │   └── services/             # Business logic
│   ├── package.json
│   └── tsconfig.json
│
├── components/                   # React components
│   ├── events/                   # Event-related components
│   │   ├── EventCard.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── EventChat.tsx
│   │   ├── PurchaseTicketButton.tsx
│   │   └── TipButton.tsx
│   ├── auth/                     # Authentication
│   ├── legal/                    # Legal components
│   └── error/                    # Error boundaries
│
├── lib/                          # Utility libraries
│   ├── supabase/
│   │   ├── server.ts             # Server-side client
│   │   └── client.ts             # Client-side client
│   ├── stripe.ts                 # Stripe configuration
│   ├── env.ts                    # Environment validation
│   ├── logger.ts                 # Logging with Sentry
│   ├── happy-hour.ts             # Happy Hour logic
│   ├── affiliates.ts             # Affiliate calculations
│   ├── validations/              # Zod schemas
│   └── supabase-rpc.ts           # Optimized RPC queries
│
├── constants/                    # Configuration constants
│   ├── BusinessRules.ts          # ⭐ ALL BUSINESS LOGIC HERE
│   ├── Colors.ts                 # Design system colors
│   └── theme.ts                  # UI theme
│
├── types/                        # TypeScript definitions
│   ├── database-complete.ts      # Supabase types
│   └── index.ts                  # General types
│
├── supabase/                     # Database
│   ├── migrations/               # SQL migrations
│   └── schema-complete.sql       # Full schema
│
├── scripts/                      # Testing & automation
│   ├── test-ticket-purchase.ts   # 12 tests
│   ├── test-tip-payment.ts       # 13 tests
│   ├── test-webhook-processing.ts# 13 tests
│   ├── test-artist-payouts.ts    # 12 tests
│   ├── check-env.ts              # Env validation
│   ├── setup-stripe.ts           # Stripe setup
│   └── run-migrations.sh         # Migration runner
│
├── emails/                       # Email templates (React Email)
├── locales/                      # i18n translations (6 languages)
├── hooks/                        # Custom React hooks
├── contexts/                     # React contexts
├── services/                     # Business logic services
├── mocks/                        # Test mocks
│
├── middleware.ts                 # Next.js middleware (auth + security)
├── instrumentation.ts            # Sentry instrumentation
├── next.config.js                # Next.js configuration
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # TailwindCSS config
├── railway.json                  # Railway deployment config
├── vercel.json                   # Vercel config + cron jobs
└── .env.example                  # Environment template (103 lines)
```

### Important Files to Know

#### Configuration Files
- **`/constants/BusinessRules.ts`**: ⭐ **CRITICAL** - All business logic constants (commissions, pricing, tiers, rules)
- **`/middleware.ts`**: Security headers, CORS, auth cookie management
- **`/lib/env.ts`**: Environment variable validation (32+ required vars)
- **`/.env.example`**: Template with all environment variables

#### Business Logic
- **`/lib/happy-hour.ts`**: Happy Hour pricing logic (Wednesday 20h = 4.99€)
- **`/lib/affiliates.ts`**: 3-level AA commission calculations
- **`/lib/supabase-rpc.ts`**: Optimized database queries

#### API Routes (Key)
- **`/app/api/tickets/purchase/route.ts`**: Ticket purchase flow (282 lines)
- **`/app/api/stripe/webhook/route.ts`**: Stripe webhook handler (383 lines)
- **`/app/api/cron/payouts/route.ts`**: J+21 payout automation (354 lines)
- **`/app/api/dashboard/artist/route.ts`**: Optimized artist dashboard (102 lines)

#### Documentation
- **`/README.md`**: Setup and architecture overview (526 lines)
- **`/TESTING.md`**: Integration test suite guide
- **`/DEPLOYMENT.md`**: Pre-launch checklist
- **`/RAILWAY_CRITICAL_FIX.md`**: Railway deployment fix guide
- **`/CODE_ANALYSIS.md`**: Code quality analysis

---

## Key Business Rules

### ⭐ CRITICAL: All business logic is centralized in `/constants/BusinessRules.ts`

### Artist Subscription Tiers

```typescript
SUBSCRIPTION_TIERS = {
  STARTER: {
    price: 19.99,           // €/month
    artistShare: 0.50,      // Artist keeps 50%
    platformShare: 0.50,    // Platform keeps 50%
    minTicketPrice: 5,      // €
    maxTicketPrice: 12,     // €
    trialDays: 14,          // Free trial
  },
  PRO: {
    price: 59.99,           // €/month
    artistShare: 0.60,      // Artist keeps 60%
    platformShare: 0.40,    // Platform keeps 40%
    minTicketPrice: 8,      // €
    maxTicketPrice: 18,     // €
    trialDays: 14,
  },
  ELITE: {
    price: 129.99,          // €/month
    artistShare: 0.70,      // Artist keeps 70%
    platformShare: 0.30,    // Platform keeps 30%
    minTicketPrice: 12,     // €
    maxTicketPrice: 25,     // €
    trialDays: 14,
  }
}
```

**Important Rules**:
- All artists get a **14-day free trial**
- Artists must complete Stripe Connect onboarding before creating events
- Ticket prices MUST be within tier limits (validation enforced server-side)

### Happy Hour System

```typescript
HAPPY_HOUR = {
  dayOfWeek: 3,          // Wednesday (0=Sunday, 3=Wednesday)
  hour: 20,              // 20:00 (8 PM)
  price: 4.99,           // Fixed price (overrides tier pricing)
  duration: 60,          // minutes
}
```

**Rules**:
- **When**: Every Wednesday at 20:00 (8 PM)
- **Price**: Fixed 4.99€ regardless of tier or original price
- **Validation**: Server-side enforcement in `/lib/happy-hour.ts`
- **Functions**: `isHappyHour()`, `getTicketPrice()`, `getNextHappyHour()`

### Apporteurs d'Affaires (AA) - Affiliate System

```typescript
APPORTEUR = {
  investmentCost: 2997,      // €2,997 one-time
  monthlyFee: 19.99,         // €19.99/month
  commissions: {
    level1: 0.025,           // 2.5% on direct referrals
    level2: 0.015,           // 1.5% on level 2 referrals
    level3: 0.01,            // 1% on level 3 referrals
  },
  maxLevels: 3,
}
```

**AA Hierarchy Example**:
```
Ticket Price: 10€
├─ Level 1 (Direct): 10€ × 2.5% = 0.25€
├─ Level 2 (Parent): 10€ × 1.5% = 0.15€
└─ Level 3 (Grandparent): 10€ × 1% = 0.10€
Total AA Commissions: 0.50€
```

**Important**:
- VyBzzZ pays ALL commissions (never deducted from artists)
- Each AA has a unique referral code
- 3-level deep hierarchy maximum
- Commissions stored in `commissions` table with status tracking

### Responsables Régionaux (RR) - Regional Managers

```typescript
RESPONSABLE_REGIONAL = {
  basic: {
    investmentCost: 4997,       // €4,997
    commissionRate: 0.05,       // 5% of ALL tickets in region
  },
  premium: {
    investmentCost: 9997,       // €9,997
    commissionRate: 0.30,       // 30% of ALL tickets in region
  }
}
```

**Important**:
- RR commissions calculated on **platform share** (not ticket price)
- Example: €10 ticket with Starter tier (50% platform) = €5 platform share
  - Basic RR: €5 × 5% = €0.25
  - Premium RR: €5 × 30% = €1.50
- One RR per region (geographic exclusivity)

### Tips (Pourboires)

```typescript
TIPS = {
  artistShare: 0.9,              // Artist receives 90%
  platformFee: 0.1,              // Platform keeps 10%
  minAmount: 1,                  // €1 minimum
  maxAmount: 500,                // €500 maximum
  suggestedAmounts: [2, 5, 10, 20, 50],
}
```

### Payout System (J+21)

```typescript
PAYOUTS = {
  delayDays: 21,                 // J+21 schedule
  minAmount: 10,                 // €10 minimum payout
  currency: 'eur',
  cronSchedule: '0 2 * * *',     // Daily at 2 AM UTC
}
```

**Payout Process** (`/app/api/cron/payouts/route.ts`):
1. Runs daily at 2 AM UTC (Vercel cron)
2. Finds events ended exactly 21 days ago
3. Calculates artist revenue based on tier
4. Deducts all AA/RR commissions
5. Creates Stripe payout to artist's connected account
6. Marks commissions as paid
7. Sends email notification

**Example Calculation**:
```
Event with 100 tickets @ €10 each = €1,000 gross
Artist tier: PRO (60% share)

Artist revenue:     €1,000 × 60% = €600
AA Commissions:     €1,000 × 0.05 = €50 (paid by platform)
RR Commission:      €400 × 5% = €20 (paid by platform)

Artist payout:      €600 (full amount)
Platform cost:      €400 - €50 - €20 = €330 net
```

### Gamification

```typescript
GAMIFICATION = {
  miles: {
    perTicketPurchase: 10,      // + bonus per €10 spent
    perEventAttended: 50,
    perTipSent: 5,
    perReferral: 100,
    perShare: 5,
  },
  badges: ['first_timer', 'regular', 'super_fan', 'generous', 'social', 'recruiter'],
  vybzzzCoins: {
    enabled: false,             // Phase 2 feature
    conversionRate: 100,        // 100 miles = 1 coin
  }
}
```

---

## Development Workflows

### Local Setup

```bash
# 1. Clone repository
git clone https://github.com/Elpadrino971/rork-vybzzz---concert---live-event-platform.git
cd rork-vybzzz---concert---live-event-platform

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Validate environment (32+ required variables)
npm run check-env

# 5. Set up database
# Run supabase/schema-complete.sql in Supabase SQL Editor
# OR use migrations:
npm run migrate

# 6. Set up Stripe products
npm run setup:stripe

# 7. Start development servers

# Frontend + API Routes
npm run dev              # http://localhost:3000

# Backend (separate terminal)
cd backend
npm run dev              # http://localhost:3001
```

### Environment Variables

**Required** (see `.env.example` for complete list):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Subscription Price IDs (created via npm run setup:stripe)
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_ELITE=

# Cron Jobs (32+ characters, cryptographically random)
CRON_SECRET=

# Optional
SENTRY_DSN=                     # Error tracking
RESEND_API_KEY=                 # Email notifications
OPENAI_API_KEY=                 # AI features
UPSTASH_REDIS_URL=              # Rate limiting
```

### NPM Scripts

#### Development
```bash
npm run dev                     # Start Next.js dev server (runs check-env first)
npm run build                   # Production build
npm start                       # Production server
npm run lint                    # ESLint
npm run type-check              # TypeScript validation
```

#### Testing
```bash
npm test                        # Run all 50 integration tests
npm run test:ticket-purchase    # 12 tests - Ticket purchase flow
npm run test:tip-payment        # 13 tests - Tip payment flow
npm run test:webhooks           # 13 tests - Webhook processing
npm run test:payouts            # 12 tests - Artist payout calculation
```

#### Utilities
```bash
npm run check-env               # Validate .env.local
npm run check-env:prod          # Validate .env.production
npm run migrate                 # Run database migrations
npm run setup:stripe            # Create Stripe products & prices
npm run supabase:generate-types # Generate TypeScript types
```

### Database Migrations

**Location**: `/supabase/migrations/`

**Available Migrations**:
- `add_performance_indexes.sql` - Database optimization
- `add_chat_enhancements.sql` - Chat features
- `add_dashboard_optimization_functions.sql` - RPC functions
- `add_atomic_transaction_functions.sql` - Transaction safety
- `add_rgpd_compliance_columns.sql` - GDPR compliance
- `add_webhook_events_table.sql` - Webhook logging

**Run Migrations**:
```bash
./scripts/run-migrations.sh
```

---

## Testing Guidelines

### Integration Test Suite (50 Tests)

**Test Coverage**:
- ✅ Ticket purchase flow (event validation → payment → confirmation)
- ✅ Tip payment flow (amount validation → Stripe → notification)
- ✅ Webhook processing (idempotency → commission creation → payout triggers)
- ✅ Artist payout calculation (revenue splits → commission deductions → transfers)

### Test Scripts

#### 1. Ticket Purchase Tests (`scripts/test-ticket-purchase.ts`)
```bash
npm run test:ticket-purchase
```

**Tests** (12):
- Event availability validation
- Duplicate ticket prevention
- Happy Hour price override
- Affiliate commission calculation
- Stripe Payment Intent creation
- Ticket record creation
- Capacity enforcement
- Price tier validation

#### 2. Tip Payment Tests (`scripts/test-tip-payment.ts`)
```bash
npm run test:tip-payment
```

**Tests** (13):
- Amount validation (€1-€500)
- 90/10 artist/platform split
- Stripe metadata handling
- Artist notification
- Transaction recording

#### 3. Webhook Processing Tests (`scripts/test-webhook-processing.ts`)
```bash
npm run test:webhooks
```

**Tests** (13):
- Webhook signature verification
- Idempotency handling
- `payment_intent.succeeded` processing
- `payment_intent.payment_failed` handling
- Subscription events handling
- Commission record creation

#### 4. Artist Payout Tests (`scripts/test-artist-payouts.ts`)
```bash
npm run test:payouts
```

**Tests** (12):
- J+21 date calculation
- Tier-based revenue split
- Commission deduction
- Minimum payout enforcement
- Stripe payout creation
- Email notification

### Test Cards (Stripe)

```typescript
// Success
const successCard = '4242424242424242'

// Decline
const declineCard = '4000000000000002'

// 3D Secure
const secure3DCard = '4000002760003184'

// Insufficient Funds
const insufficientCard = '4000000000009995'
```

### Testing Best Practices

1. **Always validate environment** before running tests:
   ```bash
   npm run check-env
   ```

2. **Use test mode Stripe keys** (never production):
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   ```

3. **Run tests in order**:
   ```bash
   npm test  # Runs all tests in sequence
   ```

4. **Check test output** for detailed error messages:
   ```
   ✓ Ticket purchase with valid event
   ✗ Ticket purchase with sold out event
     Expected status: 400
     Received: 200
     Error: Capacity check not enforced
   ```

---

## Deployment Process

### Frontend Deployment (Vercel)

#### 1. Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link
```

#### 2. Configure Environment Variables
Add all variables from `.env.example` to Vercel dashboard:
- **Settings** → **Environment Variables**
- Add separately for: Production, Preview, Development

#### 3. Configure Cron Jobs
Already configured in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/payouts",
    "schedule": "0 2 * * *"  // Daily at 2 AM UTC
  }]
}
```

#### 4. Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

#### 5. Set Up Stripe Webhook
- **URL**: `https://your-domain.vercel.app/api/stripe/webhook`
- **Events**:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `account.updated`
- **Get webhook secret** and add to `STRIPE_WEBHOOK_SECRET` env var

### Backend Deployment (Railway)

#### 1. Connect Repository
- Import GitHub repository in Railway
- Railway auto-detects Nixpacks

#### 2. Configure Build
Already configured in `railway.json`:
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

**⚠️ CRITICAL**: The `rootDirectory: "backend"` setting is essential. See `/RAILWAY_CRITICAL_FIX.md` for details.

#### 3. Add Environment Variables
Add same Supabase/Stripe credentials as frontend, plus:
```bash
CORS_ORIGIN=https://your-vercel-domain.com
PORT=3001
```

#### 4. Deploy
- Automatic on git push to main branch
- Restart policy: ON_FAILURE (max 10 retries)

### Pre-Launch Checklist

See `/DEPLOYMENT.md` for complete checklist. Key items:

#### Security
- [ ] All environment variables in production
- [ ] Stripe webhook secret configured
- [ ] CRON_SECRET set (32+ characters)
- [ ] Security headers enabled (check middleware.ts)
- [ ] CORS properly configured
- [ ] Rate limiting enabled

#### Payments
- [ ] Stripe Connect onboarding flow tested
- [ ] Payment Intent creation working
- [ ] Webhook processing tested
- [ ] Payout cron job tested (use test endpoint)

#### Legal (CRITICAL for Launch)
- [ ] Update company information in `/app/legal/terms/page.tsx`
- [ ] Update SIRET, RCS, address in legal pages
- [ ] Cookie consent configured
- [ ] GDPR data export working
- [ ] Privacy policy reviewed

#### Monitoring
- [ ] Sentry DSN configured
- [ ] Error tracking tested
- [ ] Performance monitoring enabled
- [ ] Logging working (check `/lib/logger.ts`)

---

## Common Tasks & Patterns

### Creating a New API Route

**Pattern**: `/app/api/{resource}/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// Define validation schema
const schema = z.object({
  field: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate request
    const body = await request.json()
    const data = schema.parse(body)

    // 2. Get authenticated user
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 3. Perform business logic
    const { data: result, error } = await supabase
      .from('table_name')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    // 4. Log success
    logger.info('Operation successful', {
      userId: user.id,
      resultId: result.id
    })

    // 5. Return response
    return NextResponse.json(result)

  } catch (error) {
    logger.error('Operation failed', { error })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Creating a Stripe Payment

**Pattern**: Use centralized Stripe client from `/lib/stripe.ts`

```typescript
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Create Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'eur',
    metadata: {
      user_id: user.id,
      type: 'ticket' | 'tip',
      resource_id: 'event_id or artist_id',
    },
    // For multi-party payments (AA/RR commissions)
    transfer_data: {
      destination: artistStripeAccountId,
    },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
  })
}
```

### Calculating Commissions

**Always use functions from `/constants/BusinessRules.ts`**:

```typescript
import {
  calculateArtistRevenue,
  calculatePlatformRevenue,
  calculateAACommissions,
  calculateRRCommission,
} from '@/constants/BusinessRules'

// Artist revenue
const artistRevenue = calculateArtistRevenue(ticketPrice, 'pro')
// Returns: ticketPrice × 0.6

// Platform revenue
const platformRevenue = calculatePlatformRevenue(ticketPrice, 'pro')
// Returns: ticketPrice × 0.4

// AA commissions (3 levels)
const aaCommissions = calculateAACommissions(ticketPrice)
// Returns: { level1: 0.25€, level2: 0.15€, level3: 0.10€, total: 0.50€ }

// RR commission
const rrCommission = calculateRRCommission(platformRevenue, isBasic)
// Returns: platformRevenue × (0.05 or 0.30)
```

### Querying Supabase with RPC

**For complex queries, use RPC functions** (`/lib/supabase-rpc.ts`):

```typescript
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()

// Instead of multiple queries:
// ❌ BAD (6+ queries)
const events = await supabase.from('events').select('*')
const tickets = await supabase.from('tickets').select('*')
const tips = await supabase.from('tips').select('*')
// etc...

// ✅ GOOD (1 RPC call)
const { data, error } = await supabase
  .rpc('get_artist_dashboard', {
    p_artist_id: artistId
  })

// Returns all dashboard data in one optimized query
```

### Implementing Happy Hour

```typescript
import { isHappyHour, HAPPY_HOUR } from '@/lib/happy-hour'

// Check if current time is Happy Hour
if (isHappyHour(new Date())) {
  finalPrice = HAPPY_HOUR.price // 4.99€
} else {
  finalPrice = regularPrice
}
```

### Logging with Sentry

```typescript
import { logger } from '@/lib/logger'

// Info logging
logger.info('User logged in', {
  userId: user.id,
  timestamp: new Date()
})

// Error logging
logger.error('Payment failed', {
  userId: user.id,
  amount: amount,
  error: error.message
})

// Performance tracking
const startTime = Date.now()
// ... operation ...
logger.info('Operation completed', {
  duration: Date.now() - startTime
})
```

---

## Security & Compliance

### Authentication

**Always use Supabase server client for server-side operations**:

```typescript
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // User is authenticated
}
```

### Row Level Security (RLS)

**ALL tables have RLS enabled**. Policies enforce:
- Users can only access their own data
- Artists can only modify their own events
- Admins have elevated permissions

**Never bypass RLS** unless using `SUPABASE_SERVICE_ROLE_KEY` for system operations.

### Security Headers

Configured in `/middleware.ts`:

```typescript
// XSS Protection
'X-Content-Type-Options': 'nosniff'
'X-Frame-Options': 'DENY'
'X-XSS-Protection': '1; mode=block'

// Content Security Policy
'Content-Security-Policy': "default-src 'self'; ..."

// HSTS (production only)
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
```

### Rate Limiting

**Implementation**: `/lib/rate-limit.ts` using Upstash Redis

```typescript
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Check rate limit (20 requests per minute)
  const { success, limit, remaining } = await rateLimit(
    request,
    20 // requests per minute
  )

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Continue with request
}
```

### Input Validation

**Always use Zod schemas** (`/lib/validations/index.ts`):

```typescript
import { z } from 'zod'
import { VALIDATION } from '@/constants/BusinessRules'

const eventSchema = z.object({
  title: z.string()
    .min(VALIDATION.event.titleMinLength)
    .max(VALIDATION.event.titleMaxLength),
  description: z.string()
    .max(VALIDATION.event.descriptionMaxLength),
  ticket_price: z.number().positive(),
})

// Validate
try {
  const data = eventSchema.parse(body)
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    )
  }
}
```

### GDPR Compliance

**Features**:
- Cookie consent banner (`/components/legal/cookie-consent.tsx`)
- Data export API (`/app/api/user/export/route.ts`)
- Account deletion with data purge
- Privacy policy (`/app/legal/privacy/page.tsx`)
- Data retention policies

**GDPR columns** in database:
- `data_retention_date`
- `consent_marketing`
- `consent_analytics`
- `last_privacy_update`

---

## AI Assistant Guidelines

### When Working on This Codebase

#### 1. Always Check Business Rules First
**Before implementing any payment/commission logic**, read `/constants/BusinessRules.ts`:
```bash
# AI Assistant: Read this file first for any business logic task
/constants/BusinessRules.ts
```

#### 2. Use Existing Patterns
- ✅ Copy patterns from existing API routes
- ✅ Use centralized utilities (`/lib/*`)
- ✅ Follow TypeScript strict mode
- ❌ Don't create new patterns without discussing first

#### 3. Testing is Mandatory
**After implementing payment-related features**:
```bash
npm run test:ticket-purchase
npm run test:tip-payment
npm run test:webhooks
npm run test:payouts
```

#### 4. Security Checklist
Before submitting any code:
- [ ] User authentication checked
- [ ] Input validation with Zod
- [ ] SQL injection prevention (use Supabase client, never raw SQL)
- [ ] XSS prevention (sanitize user input)
- [ ] Rate limiting considered
- [ ] Error messages don't leak sensitive data

#### 5. Documentation Updates
**Update this file (CLAUDE.md)** when:
- Adding new business rules
- Changing commission calculations
- Adding new API routes
- Modifying deployment process
- Adding new environment variables

#### 6. Common Mistakes to Avoid

❌ **DON'T**:
```typescript
// Don't hardcode business logic
const commission = ticketPrice * 0.025 // Which level? Why 2.5%?

// Don't bypass RLS
const { data } = await supabase
  .from('tickets')
  .select('*')
  .eq('id', ticketId)
  // Missing user check!

// Don't skip validation
const body = await request.json()
// Use body directly without Zod validation

// Don't create payment intents without metadata
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100,
  currency: 'eur',
  // Missing metadata!
})
```

✅ **DO**:
```typescript
// Use centralized business rules
import { APPORTEUR } from '@/constants/BusinessRules'
const commission = ticketPrice * APPORTEUR.commissions.level1

// Always check user authentication
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Validate with Zod
const schema = z.object({ amount: z.number().positive() })
const data = schema.parse(body)

// Include comprehensive metadata
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount * 100,
  currency: 'eur',
  metadata: {
    user_id: user.id,
    type: 'ticket',
    event_id: eventId,
    tier: 'pro',
    is_happy_hour: isHappyHour(new Date())
  }
})
```

#### 7. File Naming Conventions

```
# API Routes
/app/api/{resource}/route.ts          # RESTful resource
/app/api/{resource}/[id]/route.ts     # Dynamic route

# Components
/components/{feature}/ComponentName.tsx  # PascalCase

# Libraries
/lib/feature-name.ts                  # kebab-case

# Types
/types/feature-name.ts                # kebab-case

# Constants
/constants/FeatureName.ts             # PascalCase
```

#### 8. Git Commit Messages

Follow conventional commits:
```bash
# Feature
git commit -m "feat: add ticket purchase flow"

# Bug fix
git commit -m "fix: correct commission calculation for Happy Hour"

# Documentation
git commit -m "docs: update CLAUDE.md with new business rules"

# Refactor
git commit -m "refactor: extract commission logic to BusinessRules.ts"

# Test
git commit -m "test: add integration tests for payout system"
```

#### 9. Environment Variables

**When adding new environment variables**:
1. Add to `.env.example` with description
2. Add to validation in `/lib/env.ts`
3. Update documentation in README.md
4. Add to Vercel/Railway dashboard
5. Update this CLAUDE.md file

#### 10. Database Changes

**When modifying database schema**:
1. Create migration file in `/supabase/migrations/`
2. Update `/types/database-complete.ts`
3. Test migration locally
4. Update RLS policies if needed
5. Document in commit message

---

## Quick Reference

### Important URLs

- **Supabase Dashboard**: https://app.supabase.com
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app
- **Sentry Dashboard**: https://sentry.io

### Key Constants

```typescript
// Subscription prices
STARTER: 19.99€/month
PRO: 59.99€/month
ELITE: 129.99€/month

// Revenue splits
STARTER: 50/50
PRO: 60/40
ELITE: 70/30

// Commission rates
AA Level 1: 2.5%
AA Level 2: 1.5%
AA Level 3: 1.0%
RR Basic: 5%
RR Premium: 30%

// Tips
Artist: 90%
Platform: 10%

// Happy Hour
Wednesday 20:00 = 4.99€

// Payouts
J+21 (21 days after event ends)
```

### Command Cheatsheet

```bash
# Development
npm run dev                    # Start frontend
cd backend && npm run dev      # Start backend

# Testing
npm test                       # All tests (50)
npm run test:ticket-purchase   # Ticket tests (12)
npm run test:tip-payment       # Tip tests (13)
npm run test:webhooks          # Webhook tests (13)
npm run test:payouts           # Payout tests (12)

# Validation
npm run check-env              # Check environment
npm run type-check             # TypeScript check
npm run lint                   # ESLint

# Setup
npm run setup:stripe           # Create Stripe products
npm run migrate                # Run DB migrations

# Deployment
vercel --prod                  # Deploy frontend
git push origin main           # Deploy backend (Railway auto-deploys)
```

---

## Contact & Support

**Project Lead**: Elpadrino971
**Repository**: https://github.com/Elpadrino971/rork-vybzzz---concert---live-event-platform
**Launch Date**: December 31, 2025

**Documentation Files**:
- `/README.md` - Setup guide
- `/TESTING.md` - Test documentation
- `/DEPLOYMENT.md` - Deployment checklist
- `/CLAUDE.md` - This file (AI assistant guide)

---

**Last Updated**: November 15, 2025
**Version**: 1.0.0

---

## Changelog

### v1.0.0 (November 15, 2025)
- Initial CLAUDE.md creation
- Documented complete architecture
- Added business rules reference
- Included development workflows
- Added testing guidelines
- Documented deployment process
- Created AI assistant guidelines

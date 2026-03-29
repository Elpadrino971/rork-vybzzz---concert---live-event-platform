# VyBzzZ - Live Concert Streaming Platform

VyBzzZ is a comprehensive mobile-first concert streaming platform connecting artists with fans through live performances, featuring a sophisticated affiliate system, gamification, and AI-powered highlights.

**Launch Target**: December 31st, 2025 - David Guetta Concert

## Documentation

- 📖 **[README.md](README.md)** - Setup and architecture overview (this file)
- 🧪 **[TESTING.md](TESTING.md)** - Integration test suite guide
- 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Pre-launch checklist and deployment guide

## Architecture

- **Mobile**: React Native (iOS + Android) with Chromecast/AirPlay casting
- **Backend**: Next.js 14 API Routes
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Payments**: Stripe Connect (multi-party payments)
- **Streaming**: YouTube Live (David Guetta event), AWS IVS (future)
- **Design**: White/Gold (light mode), Black/Netflix Red (dark mode)

## Business Model

### Artist Subscriptions (14-day free trial)
- **Starter** (19.99€/month): 50/50 split, tickets 5-12€
- **Pro** (59.99€/month): 60/40 split, tickets 8-18€
- **Elite** (129.99€/month): 70/30 split, tickets 12-25€

### Affiliate System
**Apporteurs d'Affaires (AA)** - 2,997€ investment
- 3-level commission: 2.5% / 1.5% / 1%
- Monthly fee: 19.99€

**Responsables Régionaux (RR)**
- Basic: 4,997€ (5% commission)
- Premium: 9,997€ (30% commission)

### Revenue Streams
- Artist subscriptions
- Ticket sales (platform keeps 30-50% based on tier)
- Tips (10% platform fee)
- AA/RR investments (target: 30K€ during development)

### Payout Schedule
- **J+21**: Artists receive payouts 21 days after event ends
- Automatic via Stripe Connect
- Commissions deducted before payout

## Key Features

### MVP (David Guetta Launch)
- ✅ Event listing and detail pages
- ✅ Ticket purchase with Stripe
- ✅ Live streaming with casting (Chromecast/AirPlay)
- ✅ Real-time chat during events
- ✅ Tips/pourboires to artists
- ✅ Artist dashboard with analytics
- ✅ Fan dashboard with tickets and history
- ✅ Happy Hour (Wednesdays 20h, 4.99€ tickets)

### Phase 2 (Post-Launch)
- AI highlight detection and short generation
- Gamification (badges, miles, quests)
- Fanbases locales (watch parties with GPS)
- Viralité (share to unlock, referral bonuses)
- VyBzzZ Coins (virtual currency)
- QR codes dynamiques with Face ID

## Installation

### Prerequisites
- Node.js 18+
- npm/yarn/bun
- Supabase account (free tier works)
- Stripe account
- Vercel account (for deployment)

### Backend Setup

1. **Clone and install**
```bash
git clone https://github.com/Elpadrino971/rork-vybzzz---concert---live-event-platform.git
cd rork-vybzzz---concert---live-event-platform
npm install
```

2. **Environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Subscription Price IDs
STRIPE_PRICE_STARTER=price_starter_id
STRIPE_PRICE_PRO=price_pro_id
STRIPE_PRICE_ELITE=price_elite_id

# Cron Job Security
CRON_SECRET=your_random_secret_here

# YouTube Live
YOUTUBE_API_KEY=your_youtube_api_key
```

3. **Database setup**

In Supabase SQL Editor, execute:
```bash
# Copy entire file content
supabase/schema-complete.sql
```

This creates:
- 20+ tables with full RLS
- Artist, Event, Ticket, Tip, Commission systems
- AA/RR hierarchy system
- Shorts for AI highlights
- Gamification tables (badges, quests, miles)

4. **Run development server**
```bash
npm run dev
# Backend available at http://localhost:3000
```

### Mobile Setup

See [MOBILE_SETUP.md](MOBILE_SETUP.md) for complete React Native setup instructions.

Quick start:
```bash
npx create-expo-app vybzzz-mobile --template blank-typescript
cd vybzzz-mobile

# Install dependencies
npm install @supabase/supabase-js @stripe/stripe-react-native
npm install react-native-google-cast react-native-airplay-ios

# Copy API client and types
cp ../lib/api-client.ts ./lib/
cp ../types/database-complete.ts ./types/
cp ../constants/Colors.ts ./constants/
```

## API Routes

### Events
- **GET** `/api/events` - List events (filters: status, artist_id, upcoming)
- **POST** `/api/events` - Create event (validates tier pricing, Happy Hour)
- **GET** `/api/events/[id]` - Event details with artist info
- **PUT** `/api/events/[id]` - Update event (validates pricing)
- **DELETE** `/api/events/[id]` - Delete or cancel event

### Artists
- **GET** `/api/artists` - List artists (search, genre, country filters)
- **GET** `/api/artists/[id]` - Artist profile with stats and upcoming events
- **POST** `/api/artists/[id]/follow` - Follow artist
- **DELETE** `/api/artists/[id]/follow` - Unfollow artist

### Dashboard
- **GET** `/api/dashboard/artist` - Artist analytics:
  - Events count by status
  - Revenue breakdown (tickets + tips)
  - Subscription status
  - Next payout schedule (J+21)

- **GET** `/api/dashboard/fan` - Fan activity:
  - Purchased tickets (upcoming/past)
  - Followed artists
  - Tips sent
  - Badges, miles, quests
  - AA/RR stats

### Shorts (TikTok-style Feed)
- **GET** `/api/shorts` - Vertical video feed (recent, popular, trending)

### Payments
- **POST** `/api/stripe/create-payment-intent` - Create payment for ticket/tip
- **POST** `/api/stripe/webhook` - Handle Stripe events:
  - `payment_intent.succeeded`: Complete ticket/tip, create commissions
  - `customer.subscription.*`: Manage artist subscriptions
  - `account.updated`: Track Stripe Connect status

### Cron Jobs
- **GET** `/api/cron/payouts` - J+21 automatic payout processor
  - Runs daily at 2 AM (see `vercel.json`)
  - Protected with `CRON_SECRET`
  - Finds events ended 21 days ago
  - Calculates revenue, deducts commissions
  - Initiates Stripe payouts

## Database Schema

### Core Tables
- `users` - User accounts (fan, artist, aa, rr)
- `profiles` - User profile information
- `artists` - Artist profiles with subscription tiers
- `events` - Concert events with pricing
- `tickets` - Ticket purchases with AA/RR attribution
- `tips` - Tips to artists (90% artist, 10% platform)

### Affiliate System
- `apporteurs` - AA accounts with 3-level hierarchy
- `responsables_regionaux` - RR accounts with regions
- `commissions` - All commission records
- `payouts` - Artist payout schedule (J+21)

### Gamification
- `badges` - Achievement badges
- `user_badges` - Earned badges
- `quests` - Challenges for users
- `user_quests` - Quest progress
- `miles_transactions` - Miles earned/spent

### Content
- `shorts` - AI-generated concert highlights
- `short_likes` - User likes on shorts
- `artist_followers` - Artist follow relationships
- `event_chat_messages` - Real-time chat

## Stripe Integration

### Artist Subscriptions
```typescript
// 14-day free trial
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  trial_period_days: 14,
})
```

### Ticket Purchase
```typescript
// Multi-party payment with commissions
const paymentIntent = await stripe.paymentIntents.create({
  amount: ticketPrice * 100,
  currency: 'eur',
  application_fee_amount: platformFee * 100,
  transfer_data: {
    destination: artistStripeAccountId,
  },
  metadata: { ticket_id, aa_id, rr_id }
})
```

### Payouts (J+21)
```typescript
// Automatic via cron job
const payout = await stripe.payouts.create(
  {
    amount: payoutAmount * 100,
    currency: 'eur',
  },
  { stripeAccount: artistStripeAccountId }
)
```

## Happy Hour

Every Wednesday at 20:00, tickets are 4.99€ regardless of tier.

Validation in event creation/update:
```typescript
const eventDate = new Date(scheduled_at)
const isWednesday = eventDate.getDay() === 3
const isHappyHour = isWednesday && eventDate.getHours() === 20

if (isHappyHour) {
  ticket_price = 4.99
}
```

## Commission Structure

### AA Commissions (3 levels)
- **Level 1** (direct): 2.5% of ticket price
- **Level 2** (parent): 1.5% of ticket price
- **Level 3** (grandparent): 1% of ticket price

### RR Commissions
- **Basic**: 5% of all tickets in region
- **Premium**: 30% of all tickets in region

**Important**: VyBzzZ pays ALL commissions, never the artists.

## Deployment

### Vercel (Recommended)

1. **Connect GitHub repository**
```bash
vercel link
```

2. **Set environment variables** in Vercel dashboard

3. **Deploy**
```bash
vercel --prod
```

4. **Configure Stripe webhook**
- Webhook URL: `https://your-domain.vercel.app/api/stripe/webhook`
- Events to listen:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.*`
  - `account.updated`

5. **Cron job**
Automatic via `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/payouts",
    "schedule": "0 2 * * *"
  }]
}
```

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- Users can only view/edit their own data
- Artists can only manage their events
- Public can view published events
- Service role bypasses RLS for admin operations

### API Authentication
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### Stripe Webhook Verification
```typescript
const signature = request.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET
)
```

### Cron Secret
```typescript
const authHeader = request.headers.get('authorization')
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Design System

### Colors (constants/Colors.ts)

**Light Mode**
- Background: `#FFFFFF`
- Primary: `#FFD700` (Gold)
- Accent: `#FFA500` (Dark Gold)
- Text: `#000000`

**Dark Mode**
- Background: `#000000`
- Primary: `#E50914` (Netflix Red)
- Accent: `#B20710` (Dark Netflix Red)
- Text: `#FFFFFF`

### Typography
- Font: Inter (system font fallback)
- Sizes: 12, 14, 16, 18, 24, 32, 40px

### Spacing
- 4, 8, 12, 16, 24, 32, 48, 64px

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── artists/          # Artist listing & detail
│   │   ├── cron/
│   │   │   └── payouts/      # J+21 payout processor
│   │   ├── dashboard/
│   │   │   ├── artist/       # Artist analytics
│   │   │   └── fan/          # Fan activity
│   │   ├── events/           # Event CRUD
│   │   ├── shorts/           # TikTok-style feed
│   │   └── stripe/
│   │       ├── create-payment-intent/
│   │       └── webhook/      # Stripe event handler
│   └── ...
├── constants/
│   └── Colors.ts             # Design system
├── lib/
│   ├── api-client.ts         # Ready-to-use API client for mobile
│   ├── stripe-mobile.ts      # Stripe utilities
│   └── supabase/
├── supabase/
│   └── schema-complete.sql   # Complete database schema
├── types/
│   └── database-complete.ts  # TypeScript types
├── vercel.json               # Cron job configuration
└── .env.example              # Environment variables template
```

## Mobile Integration

The mobile app uses the API client:

```typescript
import { api } from '@/lib/api-client'

// Get upcoming events
const events = await api.events.getUpcoming(20)

// Purchase ticket
const ticket = await api.tickets.purchase({
  event_id: eventId,
  referral_code: aaCode, // Optional AA referral
})

// Send tip
await api.tips.send({
  artist_id: artistId,
  amount: 10,
  message: 'Great performance!',
})

// Get dashboard
const dashboard = await api.dashboard.getArtist()
const fanDashboard = await api.dashboard.getFan()
```

## Testing

### Integration Test Suite

The platform includes comprehensive integration tests for critical flows:

```bash
# Run all tests
npm test

# Run individual test suites
npm run test:ticket-purchase   # Ticket purchase flow
npm run test:tip-payment        # Tip payment flow
npm run test:webhooks           # Webhook processing
npm run test:payouts            # Artist payout calculation
```

**Test Coverage**:
- ✅ Ticket Purchase Flow (12 tests)
- ✅ Tip Payment Flow (13 tests)
- ✅ Webhook Processing (13 tests)
- ✅ Artist Payout Calculation (12 tests)

**Total**: 50 integration tests validating critical revenue flows

For detailed testing guide, see **[TESTING.md](TESTING.md)**

### Test Stripe Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`

### Test Happy Hour
Create event for next Wednesday at 20:00:
```typescript
POST /api/events
{
  "title": "Test Happy Hour",
  "scheduled_at": "2025-11-05T20:00:00Z",
  "ticket_price": 4.99,
  "is_happy_hour": true
}
```

## Roadmap

### Phase 1 - MVP (November 2025)
- ✅ Complete backend API
- ✅ Stripe integration
- ✅ Database schema
- 🔄 Mobile app development
- 🔄 David Guetta event setup

### Phase 2 - Post-Launch (Q1 2026)
- AI highlight detection
- Short video generation
- Gamification rollout
- Fanbases locales
- Watch party features

### Phase 3 - Scale (Q2 2026)
- AWS IVS migration
- SDK development (100MS clone)
- Token $VYBZ launch
- International expansion

## Contributing

This is a private project for VyBzzZ Platform. For questions or support, contact the development team.

## License

© 2025 VyBzzZ Platform. All rights reserved.

---

**Built with Claude Code** 🤖

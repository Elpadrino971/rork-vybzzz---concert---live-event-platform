# Deployment Checklist

Pre-launch checklist for VyBzzZ Platform before the David Guetta concert on **December 31, 2025**.

## Phase 1: Legal Compliance (CRITICAL)

### 1.1 Company Registration

**Status**: ⚠️ REQUIRED BEFORE LAUNCH

Before filling legal pages, you must:

1. **Register the company**
   - Entity type: SAS (Société par Actions Simplifiée)
   - Legal name: VyBzzZ SAS
   - Minimum capital: €1 (can be increased later)
   - Registration: Greffe du Tribunal de Commerce

2. **Obtain legal identifiers**
   - ✅ SIRET number (14 digits)
   - ✅ RCS number (city + registration number)
   - ✅ TVA intracommunautaire (starts with FR)
   - ✅ Legal address (siège social)
   - ✅ Share capital amount

3. **Register for French commerce**
   - Consumer mediator (required for e-commerce)
   - Recommended: CNPM, Médicys, or similar
   - Free for consumers, annual fee for business

### 1.2 Legal Pages - Fill Placeholders

**Files to update**:
- `app/terms/page.tsx` (CGU - Conditions Générales d'Utilisation)
- `app/legal/page.tsx` (CGV - Conditions Générales de Vente)

**Placeholders to replace**:

#### CGU (app/terms/page.tsx)
```typescript
// Line 43-49: Company Information
Capital social : [Montant] €              → Capital social : 1 €
Siège social : [Adresse complète]        → Siège social : 123 Rue Example, 75001 Paris
RCS : [Ville] [Numéro]                  → RCS : Paris B 123 456 789
SIRET : [Numéro]                        → SIRET : 12345678901234
TVA intracommunautaire : [Numéro]       → TVA intracommunautaire : FR12345678901
Directeur de la publication : [Nom]      → Directeur de la publication : John Doe

// Line 276: Contact Address
Courrier : VyBzzZ SAS, [Adresse], France → Courrier : VyBzzZ SAS, 123 Rue Example, 75001 Paris, France
```

#### CGV (app/legal/page.tsx)
```typescript
// Similar placeholders in seller information section
```

**⚠️ WARNING**: Operating without proper legal pages exposes you to:
- DGCCRF fines (up to €75,000 for legal entities)
- Consumer lawsuits
- Inability to process refund disputes
- Payment processor account suspension

### 1.3 Cookie Consent & RGPD Compliance

**Status**: ✅ DONE

- ✅ Cookie consent banner implemented
- ✅ Privacy policy page created
- ✅ User data export functionality
- ✅ Account deletion functionality
- ✅ 13-month consent expiration

**Remaining**:
- ⚠️ Appoint DPO (Data Protection Officer) if >250 employees
- ⚠️ Register with CNIL if processing sensitive data
- ⚠️ Update privacy policy with actual company details

### 1.4 Legal Compliance Checklist

- [ ] Company registered with RCS
- [ ] SIRET/SIREN obtained
- [ ] TVA intracommunautaire obtained
- [ ] Consumer mediator contract signed
- [ ] Legal placeholders filled in CGU/CGV
- [ ] Privacy policy reviewed by legal counsel
- [ ] Terms of Service reviewed by legal counsel
- [ ] RGPD compliance documentation completed
- [ ] Copyright notices for David Guetta content obtained

## Phase 2: Technical Infrastructure

### 2.1 Environment Configuration

**Production environment** (`.env.production`):

```bash
# Verify all critical variables
npm run check-env:prod
```

**Required variables**:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (production)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (production)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (production - starts with pk_live_)
- [ ] `STRIPE_SECRET_KEY` (production - starts with sk_live_)
- [ ] `STRIPE_WEBHOOK_SECRET` (production - starts with whsec_)
- [ ] `STRIPE_PRICE_STARTER` (production price ID)
- [ ] `STRIPE_PRICE_PRO` (production price ID)
- [ ] `STRIPE_PRICE_ELITE` (production price ID)
- [ ] `CRON_SECRET` (minimum 32 characters)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (recommended)
- [ ] `YOUTUBE_API_KEY` (for David Guetta live stream)

### 2.2 Database Setup

**Supabase Production**:

1. **Create production project**
   ```
   Project name: vybzzz-production
   Region: Europe (Frankfurt) - closest to France
   ```

2. **Run migrations**
   ```bash
   npm run migrate
   ```

3. **Enable backups**
   - Navigate to: Database → Backups
   - Enable Point-in-Time Recovery (PITR)
   - Retention: 7 days minimum
   - Schedule: Daily at 3 AM UTC

4. **Configure RLS policies**
   - Verify all tables have RLS enabled
   - Test with non-admin user account
   - Ensure service role bypasses RLS

5. **Set up monitoring**
   - Enable database logging
   - Set up alerting for:
     - High connection count (>80%)
     - Long-running queries (>5s)
     - Disk usage (>80%)

### 2.3 Stripe Setup

**Production Stripe Account**:

1. **Complete business verification**
   - Business details
   - Bank account for payouts
   - Identity verification

2. **Create subscription products**
   ```bash
   npm run setup:stripe
   ```

   Verify created:
   - Starter: 19.99€/month (14-day trial)
   - Pro: 59.99€/month (14-day trial)
   - Elite: 129.99€/month (14-day trial)

3. **Configure webhook endpoint**
   - URL: `https://vybzzz.com/api/webhooks/stripe`
   - Events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `account.updated`
     - `customer.subscription.*`

4. **Test webhook delivery**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

5. **Set up Connected Accounts**
   - Enable Express accounts for artists
   - Configure automatic payouts (J+21)
   - Set platform fees:
     - Starter: 50%
     - Pro: 40%
     - Elite: 30%

### 2.4 Deployment (Vercel)

1. **Link repository**
   ```bash
   vercel link
   ```

2. **Configure environment variables**
   - Copy all production variables to Vercel dashboard
   - Settings → Environment Variables
   - Set for: Production

3. **Configure domains**
   - Primary: `vybzzz.com`
   - WWW redirect: `www.vybzzz.com` → `vybzzz.com`
   - SSL: Automatic via Vercel

4. **Deploy to production**
   ```bash
   npm run build  # Test build locally first
   vercel --prod
   ```

5. **Verify cron job**
   - Check `vercel.json` configuration
   - Cron job runs daily at 2 AM UTC
   - Path: `/api/cron/payouts`
   - Protected with `CRON_SECRET`

### 2.5 Monitoring & Error Tracking

**Sentry Setup**:

1. **Create Sentry project**
   - Platform: Next.js
   - Organization: VyBzzZ

2. **Configure environment variables**
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   SENTRY_ORG=vybzzz
   SENTRY_PROJECT=vybzzz-platform
   SENTRY_AUTH_TOKEN=...
   ```

3. **Test error tracking**
   - Trigger test error
   - Verify in Sentry dashboard
   - Set up alerting rules

**Health Monitoring**:

1. **Set up uptime monitoring**
   - Service: Uptime Robot, Pingdom, or similar
   - Endpoint: `https://vybzzz.com/api/health`
   - Frequency: Every 5 minutes
   - Alert if down for >2 minutes

2. **Configure health check alerts**
   - Email: tech@vybzzz.com
   - SMS: Critical alerts only
   - Slack: #alerts channel

## Phase 3: Testing

### 3.1 Integration Tests

**Run all test suites**:
```bash
npm test
```

**Expected results**:
- ✅ Ticket Purchase Flow: 12/12 passed
- ✅ Tip Payment Flow: 13/13 passed
- ✅ Webhook Processing: 13/13 passed
- ✅ Artist Payout Calculation: 12/12 passed

**See**: `TESTING.md` for detailed guide

### 3.2 Manual E2E Testing

**Critical user flows** (test in production environment):

1. **Fan Journey**
   - [ ] Sign up with email
   - [ ] Browse events
   - [ ] Purchase ticket (use real payment)
   - [ ] Access live stream
   - [ ] Send tip to artist
   - [ ] View purchase history
   - [ ] Request data export
   - [ ] Delete account

2. **Artist Journey**
   - [ ] Sign up as artist
   - [ ] Complete Stripe Connect onboarding
   - [ ] Subscribe to Starter plan (14-day trial)
   - [ ] Create event
   - [ ] Update event details
   - [ ] View dashboard analytics
   - [ ] Check payout schedule
   - [ ] Upgrade to Pro plan

3. **Affiliate Journey**
   - [ ] Register as AA
   - [ ] Pay 2,997€ investment
   - [ ] Receive referral code
   - [ ] Share referral code
   - [ ] Track commissions
   - [ ] View dashboard

### 3.3 Performance Testing

**Load testing** (before David Guetta concert):

1. **Simulate concurrent users**
   - Tool: k6, Artillery, or JMeter
   - Test: 10,000 concurrent viewers
   - Duration: 2 hours
   - Metrics:
     - Response time <500ms (p95)
     - Error rate <0.1%
     - Database connections <80%

2. **Stress test ticket purchase**
   - Simulate: 1,000 purchases in 5 minutes
   - Verify: No race conditions
   - Check: Payment processing queue

3. **Test live stream capacity**
   - Platform: YouTube Live
   - Capacity: 100,000+ concurrent viewers
   - Fallback: AWS IVS (if YouTube fails)

## Phase 4: Content & Marketing

### 4.1 David Guetta Event Setup

- [ ] Create event in database
- [ ] Title: "David Guetta - New Year's Eve 2025"
- [ ] Date: December 31, 2025, 23:00 CET
- [ ] Ticket price: 25€ (Elite tier pricing)
- [ ] Max attendees: 100,000
- [ ] YouTube Live stream URL configured
- [ ] Event description and images uploaded
- [ ] Copyright clearance obtained
- [ ] SACEM/SACD declarations filed

### 4.2 Marketing Materials

- [ ] Landing page for David Guetta event
- [ ] Social media graphics (Instagram, TikTok, Facebook)
- [ ] Email campaign templates
- [ ] Press release
- [ ] Influencer partnership agreements
- [ ] AA/RR promotional materials

## Phase 5: Security

### 5.1 Security Audit

**Pre-launch security checklist**:

- [ ] All API routes protected with authentication
- [ ] Rate limiting enabled on all endpoints
- [ ] CORS configured correctly
- [ ] Stripe webhook signature verification
- [ ] Supabase RLS policies tested
- [ ] SQL injection protection verified
- [ ] XSS protection enabled
- [ ] CSRF tokens on form submissions
- [ ] HTTPS enforced on all pages
- [ ] Security headers configured

**Recommended headers** (in `next.config.js`):
```javascript
headers: [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
]
```

### 5.2 Penetration Testing

**Optional but recommended**:
- Hire security firm for penetration testing
- Focus on payment flows and user data
- Budget: €2,000-€5,000
- Timeline: 1-2 weeks before launch

## Phase 6: Launch Readiness

### 6.1 Final Checklist (24h before launch)

- [ ] All legal placeholders filled
- [ ] Production environment verified
- [ ] Database backups enabled
- [ ] Monitoring and alerting active
- [ ] All integration tests passing
- [ ] Manual E2E tests completed
- [ ] Performance tests passed
- [ ] David Guetta event created
- [ ] Customer support ready
- [ ] Emergency rollback plan documented

### 6.2 Launch Day Plan

**Timeline**:
- **T-24h**: Final smoke tests
- **T-12h**: Team on standby
- **T-6h**: Disable maintenance mode
- **T-2h**: Monitor dashboards
- **T-0**: David Guetta concert begins
- **T+2h**: Post-launch review

**On-call team**:
- Backend engineer
- Frontend engineer
- DevOps engineer
- Customer support

### 6.3 Emergency Procedures

**Rollback plan**:
```bash
# Revert to previous deployment
vercel rollback

# Or deploy specific version
vercel deploy --prod <deployment-url>
```

**Database rollback**:
- Use Supabase PITR to restore to last known good state
- Maximum data loss: 5 minutes (with PITR enabled)

**Payment issues**:
- Stripe dashboard: Pause all subscriptions
- Disable ticket purchases temporarily
- Display maintenance message

## Phase 7: Post-Launch

### 7.1 Monitoring (First 48 hours)

**Watch for**:
- Payment failures (should be <1%)
- API errors (should be <0.5%)
- Database performance
- Live stream quality
- Customer support tickets

**Metrics dashboard**:
- Revenue (real-time)
- Active users
- Ticket sales
- Concurrent viewers
- Average tip amount

### 7.2 Customer Support

**Support channels**:
- Email: support@vybzzz.com
- Chat: In-app messaging
- Phone: +33 X XX XX XX XX

**Common issues**:
- Payment failed → Check card/bank
- Stream not loading → Check internet connection
- Ticket not received → Check email spam folder
- Refund request → CGV Article 7 (no refunds)

### 7.3 First Payout (J+21)

**January 21, 2026** (21 days after David Guetta concert):

- [ ] Verify cron job executed successfully
- [ ] Check all artist payouts created
- [ ] Verify Stripe transfers initiated
- [ ] Monitor for payout failures
- [ ] Send payout confirmation emails

## Resources

- [TESTING.md](TESTING.md) - Integration test guide
- [README.md](README.md) - Setup and architecture
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [CNIL RGPD Guide](https://www.cnil.fr/fr/reglement-europeen-protection-donnees)

## Support Contacts

- **Technical**: dev@vybzzz.com
- **Legal**: legal@vybzzz.com
- **Finance**: finance@vybzzz.com
- **Emergency**: +33 X XX XX XX XX

---

**Last updated**: 2025-10-29
**Next review**: Before David Guetta concert (Dec 31, 2025)

🤖 Deployment checklist created with Claude Code

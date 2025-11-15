# Deployment Guide - Quick Start

**Launch Date**: December 31, 2025 (David Guetta Concert)
**Days Remaining**: 46 days
**Last Updated**: November 15, 2025

---

## Overview

This is a quick-start deployment guide for the VyBzzZ Platform. For comprehensive step-by-step instructions, see:

- **[PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md)** - Complete pre-launch checklist with all tasks (recommended starting point)
- **[PRODUCTION_CONFIG_GUIDE.md](PRODUCTION_CONFIG_GUIDE.md)** - Detailed production configuration for all services
- **[LEGAL_TEMPLATE.md](LEGAL_TEMPLATE.md)** - Guide for filling legal placeholders
- **[TODO_ANALYSIS.md](TODO_ANALYSIS.md)** - Detailed analysis of remaining work
- **[TESTING.md](TESTING.md)** - Integration test suite guide

---

## 🚨 CRITICAL BLOCKERS

Before proceeding with deployment, these MUST be completed:

1. **Company Registration** (2-3 weeks)
   - Obtain SIRET, RCS, TVA intracommunautaire
   - See: [LEGAL_TEMPLATE.md](LEGAL_TEMPLATE.md)

2. **David Guetta Rights** (timeline varies)
   - Contact management for streaming license
   - Obtain music rights (SACEM/ASCAP)
   - **Without this, launch is ILLEGAL**

3. **Fill Legal Placeholders** (1 day, after company registration)
   - Update CGU/CGV pages with company information
   - See: [LEGAL_TEMPLATE.md](LEGAL_TEMPLATE.md), Section 2

4. **Sign Médiateur Contract** (1-2 weeks)
   - Required by French law for e-commerce
   - Cost: €80-€300/year

---

## Phase 1: Legal Compliance (CRITICAL)

**📖 See**: [LEGAL_TEMPLATE.md](LEGAL_TEMPLATE.md) for complete guide
**📖 See**: [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md), Section 1

### Quick Legal Checklist

- [ ] Company registered with RCS (SIRET, RCS, TVA numbers obtained)
- [ ] Consumer médiateur contract signed
- [ ] Legal placeholders filled in `app/legal/terms/page.tsx` (lines 43-49)
- [ ] Legal placeholders filled in `app/legal/page.tsx`
- [ ] Privacy policy updated with company details
- [ ] GDPR compliance verified (cookie consent, data export, deletion)
- [ ] David Guetta copyright/streaming rights obtained

**Files to Update**:
- `/app/legal/terms/page.tsx` - Replace `[VOTRE SIRET]`, `[VOTRE RCS]`, `[VOTRE ADRESSE]`, etc.
- `/app/legal/page.tsx` - Update company information
- `/app/legal/privacy/page.tsx` - Verify GDPR accuracy

**⚠️ WARNING**: Platform is ILLEGAL to operate without:
- Company registration (SIRET/RCS)
- Proper Terms of Service (CGU)
- Consumer médiateur
- David Guetta streaming rights

## Phase 2: Production Environment Setup

**📖 See**: [PRODUCTION_CONFIG_GUIDE.md](PRODUCTION_CONFIG_GUIDE.md) for complete step-by-step guide
**📖 See**: [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md), Section 3

### 2.1 Environment Configuration

**Verify environment variables**:
```bash
npm run check-env:prod
```

**Critical variables** (32+ required):
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Stripe: `STRIPE_SECRET_KEY` (starts with `sk_live_`), `STRIPE_WEBHOOK_SECRET`
- Stripe Prices: `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ELITE`
- Security: `CRON_SECRET` (32+ characters, cryptographically random)
- Monitoring: `NEXT_PUBLIC_SENTRY_DSN`

**Full list**: See `.env.example` (32+ variables)

### 2.2 Database Setup (Supabase)

**📖 See**: [PRODUCTION_CONFIG_GUIDE.md](PRODUCTION_CONFIG_GUIDE.md), Section 3

**Quick Checklist**:
- [ ] Create production project (Region: Europe/Frankfurt)
- [ ] Run all 8 migrations in order (see PRODUCTION_CONFIG_GUIDE.md)
- [ ] Create storage buckets: `npm run setup:storage`
- [ ] Enable Point-in-Time Recovery (PITR)
- [ ] Verify RLS policies on all tables
- [ ] Set up database monitoring alerts

**Migration Order**:
1. `schema-complete.sql`
2. `add_performance_indexes.sql`
3. `add_chat_enhancements.sql`
4. `add_dashboard_optimization_functions.sql`
5. `add_atomic_transaction_functions.sql`
6. `add_rgpd_compliance_columns.sql`
7. `add_webhook_events_table.sql`
8. `add_secure_storage_configuration.sql`

### 2.3 Stripe Setup

**📖 See**: [PRODUCTION_CONFIG_GUIDE.md](PRODUCTION_CONFIG_GUIDE.md), Section 4

**Quick Checklist**:
- [ ] Switch to LIVE mode (complete business verification)
- [ ] Create subscription products: `npm run setup:stripe`
- [ ] Configure webhook endpoint: `https://vybzzz.com/api/stripe/webhook`
- [ ] Enable Stripe Connect for artist payouts
- [ ] Test webhook with: `stripe trigger payment_intent.succeeded`

**Products to create**:
- Starter: €19.99/month (14-day trial) → 50% artist share
- Pro: €59.99/month (14-day trial) → 60% artist share
- Elite: €129.99/month (14-day trial) → 70% artist share

### 2.4 Frontend Deployment (Vercel)

**📖 See**: [PRODUCTION_CONFIG_GUIDE.md](PRODUCTION_CONFIG_GUIDE.md), Section 1

```bash
# Test build locally
npm run build

# Deploy to production
vercel --prod
```

**Checklist**:
- [ ] All environment variables configured in Vercel dashboard
- [ ] Domain configured (vybzzz.com)
- [ ] HTTPS/SSL enabled (automatic)
- [ ] Cron job verified (daily at 2 AM UTC for payouts)

### 2.5 Backend Deployment (Railway)

**📖 See**: [PRODUCTION_CONFIG_GUIDE.md](PRODUCTION_CONFIG_GUIDE.md), Section 2
**📖 See**: [RAILWAY_CRITICAL_FIX.md](RAILWAY_CRITICAL_FIX.md) for rootDirectory fix

**Checklist**:
- [ ] Verify `railway.json` has `"rootDirectory": "backend"`
- [ ] Environment variables configured
- [ ] `CORS_ORIGIN` set to Vercel domain
- [ ] Deploy: `git push origin main` (auto-deploys)

### 2.6 Monitoring & Error Tracking

**📖 See**: [PRODUCTION_CONFIG_GUIDE.md](PRODUCTION_CONFIG_GUIDE.md), Section 6

**Sentry** (error tracking):
- [ ] Create Sentry project
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to environment
- [ ] Set up alert thresholds (error rate >1%, response time >2s)

**Uptime Monitoring**:
- [ ] Configure uptime monitor (Uptime Robot, Pingdom)
- [ ] Monitor: `https://vybzzz.com/api/health`
- [ ] Frequency: Every 5 minutes

## Phase 3: Testing

**📖 See**: [TESTING.md](TESTING.md) for detailed test guide
**📖 See**: [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md), Section 4

### 3.1 Integration Tests (50 tests)

```bash
npm test
```

**Expected**:
- ✅ 12/12 Ticket Purchase tests
- ✅ 13/13 Tip Payment tests
- ✅ 13/13 Webhook Processing tests
- ✅ 12/12 Artist Payout tests

### 3.2 Manual E2E Testing

**Test in production with real data**:

1. **Fan Flow**: Sign up → Buy ticket (€1 test) → Watch stream → Send tip → Export data
2. **Artist Flow**: Sign up → Stripe Connect → Subscribe → Create event → View analytics
3. **Affiliate Flow**: Register AA → Get referral code → Track commissions

### 3.3 Performance Testing

**Before launch, test**:
- 10,000 concurrent viewers (2 hours)
- 1,000 ticket purchases in 5 minutes
- Response time <500ms (p95)
- Error rate <0.1%

**Tools**: k6.io, Artillery, or Apache JMeter

## Phase 4: Content & Marketing

**📖 See**: [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md), Sections 2 & 7

### 4.1 David Guetta Event Setup

- [ ] Obtain streaming rights (CRITICAL - see checklist)
- [ ] Music licensing (SACEM/ASCAP)
- [ ] Create event in platform
- [ ] Configure YouTube Live URL
- [ ] Upload event banner and description
- [ ] Set ticket price (suggest €25, Happy Hour €4.99)
- [ ] Test stream embedding

### 4.2 Marketing & Communication

- [ ] Email system configured (Resend)
- [ ] Test all email templates (welcome, ticket confirmation, etc.)
- [ ] Social media accounts created
- [ ] Customer support channels ready (support@vybzzz.com)
- [ ] FAQ page created

## Phase 5: Security

**📖 See**: [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md), Section 4.1

### Security Checklist

- [ ] All API routes authenticated
- [ ] Rate limiting enabled (Upstash Redis)
- [ ] CORS configured (see `/middleware.ts`)
- [ ] Stripe webhook signature verification
- [ ] Supabase RLS policies tested
- [ ] SQL injection protection (using Supabase client)
- [ ] XSS prevention (React escaping)
- [ ] HTTPS enforced
- [ ] Security headers enabled (X-Frame-Options, CSP, etc.)
- [ ] Test with https://securityheaders.com

**Security headers**: Already configured in `/middleware.ts`

## Phase 6: Launch Readiness

**📖 See**: [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md), Section 8

### 6.1 Final Pre-Launch Checks (December 30, 2025)

- [ ] All 50 integration tests passing
- [ ] Legal pages complete (company info filled)
- [ ] Production environment verified
- [ ] €1 test ticket purchase successful
- [ ] David Guetta event created
- [ ] Monitoring alerts configured
- [ ] Team on standby

### 6.2 Launch Day Operations (December 31, 2025)

**Timeline**:
- **T-12h**: Final smoke tests, team on standby
- **T-2h**: Monitor dashboards (Sentry, Vercel, Railway, Stripe)
- **T-0**: David Guetta concert begins
- **T+2h**: Post-event review

**On-call team**:
- Backend engineer
- Frontend engineer
- DevOps/support

**Monitor every 30 minutes**:
- Server uptime
- Error rate (<1%)
- Payment success rate (>95%)
- Video stream quality

### 6.3 Emergency Procedures

**Rollback**:
```bash
vercel rollback  # Frontend
# Railway: Deploy previous commit
```

**Database**: Use Supabase PITR (Point-in-Time Recovery)

**Incident Response**:
- Errors spike → Check Sentry → Hotfix
- Payments fail → Check Stripe status → Contact support
- Stream fails → Switch to AWS IVS backup

## Phase 7: Post-Launch

**📖 See**: [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md), Section 9

### 7.1 First 24 Hours (January 1-2, 2026)

**Monitor**:
- Total revenue and ticket sales
- Peak concurrent viewers
- Error rate and payment failures
- User feedback and support tickets

**Actions**:
- Send thank you emails
- Gather user feedback
- Fix critical bugs
- Post-event analysis

### 7.2 First Payout (J+21: January 21, 2026)

**Automated cron job** runs at 2 AM UTC:
- [ ] Verify payouts created in Stripe
- [ ] Check artists receive funds
- [ ] Verify AA/RR commissions paid
- [ ] Send payout confirmation emails

**Monitoring**: `/api/cron/payouts` endpoint logs

---

## 📚 Documentation Resources

**Start Here**:
- **[PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md)** - Master checklist for launch (recommended)
- **[TODO_ANALYSIS.md](TODO_ANALYSIS.md)** - Detailed analysis of all remaining work
- **[IMMEDIATE_ACTIONS.md](IMMEDIATE_ACTIONS.md)** - Quick action plan

**Configuration Guides**:
- **[PRODUCTION_CONFIG_GUIDE.md](PRODUCTION_CONFIG_GUIDE.md)** - Complete production setup (Vercel, Railway, Supabase, Stripe)
- **[LEGAL_TEMPLATE.md](LEGAL_TEMPLATE.md)** - How to fill legal placeholders
- **[RAILWAY_CRITICAL_FIX.md](RAILWAY_CRITICAL_FIX.md)** - Railway rootDirectory fix

**Development**:
- **[CLAUDE.md](CLAUDE.md)** - Complete codebase guide for AI assistants
- **[TESTING.md](TESTING.md)** - Integration test suite (50 tests)
- **[README.md](README.md)** - Setup and architecture overview

**External Documentation**:
- [Stripe Docs](https://stripe.com/docs) - Payments & Connect
- [Supabase Docs](https://supabase.com/docs) - Database & Auth
- [Vercel Docs](https://vercel.com/docs) - Deployment
- [Railway Docs](https://docs.railway.app) - Backend deployment
- [CNIL RGPD Guide](https://www.cnil.fr/fr/reglement-europeen-protection-donnees) - GDPR compliance

---

## 🆘 Support Contacts

**VyBzzZ Internal**:
- Technical Support: [TO BE FILLED]
- Legal Counsel: [TO BE FILLED]
- Finance/Accounting: [TO BE FILLED]

**External Services**:
- **Supabase**: support@supabase.com
- **Stripe**: https://support.stripe.com
- **Vercel**: https://vercel.com/support
- **Railway**: https://railway.app/help

**Legal**:
- **Infogreffe** (company registration): https://www.infogreffe.fr
- **CNIL** (GDPR): https://www.cnil.fr

---

## Timeline Summary

**46 days remaining until launch (December 31, 2025)**

- **Week 1-2 (Nov 16-29)**: Company registration, David Guetta rights negotiation
- **Week 3 (Nov 30-Dec 6)**: Fill legal placeholders, médiateur contract
- **Week 4 (Dec 7-13)**: Production environment setup, database migrations
- **Week 5 (Dec 14-20)**: Testing, mobile app development, marketing
- **Week 6 (Dec 21-27)**: Final testing, security audit
- **Week 7 (Dec 28-31)**: Final checks, team on standby, **LAUNCH**

**See**: [PRE_LAUNCH_CHECKLIST.md](PRE_LAUNCH_CHECKLIST.md) for detailed week-by-week planning

---

**Last Updated**: November 15, 2025
**Next Review**: Weekly until launch
**Days to Launch**: 46

🚀 Good luck with the launch!

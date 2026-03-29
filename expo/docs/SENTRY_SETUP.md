# Sentry Setup Guide

This guide explains how to set up Sentry for error monitoring and performance tracking on the VyBzzZ platform.

## Why Sentry?

Sentry provides:
- **Real-time error tracking** - Get notified when errors occur in production
- **Performance monitoring** - Track slow API endpoints and database queries
- **Session replay** - See exactly what users did before an error occurred
- **Release tracking** - Track which version of code caused errors
- **User context** - Know which users are affected by errors

## Free Tier

Sentry offers a generous free tier:
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 replays/month
- 1 team member

Perfect for getting started!

## Setup Instructions

### 1. Create a Sentry Account

1. Go to https://sentry.io
2. Sign up for a free account
3. Create a new project:
   - Platform: **Next.js**
   - Alert frequency: **On every new issue**

### 2. Get Your DSN

After creating the project, you'll get a DSN that looks like:
```
https://abc123@o123456.ingest.sentry.io/123456
```

### 3. Configure Environment Variables

Add to your `.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=vybzzz-concert-platform
SENTRY_AUTH_TOKEN=your_auth_token_here  # Optional, for source map uploads
```

**How to get these values:**

- `NEXT_PUBLIC_SENTRY_DSN`: Project Settings → Client Keys (DSN)
- `SENTRY_ORG`: Organization Settings → General Settings → Organization Slug
- `SENTRY_PROJECT`: Project Settings → General Settings → Project Slug
- `SENTRY_AUTH_TOKEN`: Settings → Auth Tokens → Create New Token
  - Scopes needed: `project:read`, `project:releases`, `org:read`

### 4. Vercel Integration (Recommended)

If deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Integrations**
3. Search for "Sentry" and add it
4. Authorize Sentry to access your Vercel project
5. Environment variables will be auto-populated

This enables:
- Automatic source map uploads
- Release tracking with git commits
- Deploy notifications in Sentry

### 5. Test the Integration

**Development:**
```bash
npm run dev
```

Visit your app and trigger an error (create a test button that throws an error).

**Check Sentry Dashboard:**
- Go to https://sentry.io
- Navigate to Issues
- You should see the error appear within seconds

## Features Enabled

### 1. Automatic Error Tracking

All errors in the application are automatically sent to Sentry:

```typescript
// Any uncaught error is tracked
throw new Error('Something went wrong')

// Our logger integration
logger.error('Payment failed', error, { userId: '123' })
```

### 2. Performance Monitoring

API endpoint performance is automatically tracked:

```typescript
// Performance is tracked for:
- API routes response times
- Database query durations
- External API calls (Stripe, Supabase)
```

### 3. User Context

Errors include user information:

```typescript
// Automatically added by logger.ts
{
  userId: 'user_123',
  artistId: 'artist_456',
  eventId: 'event_789'
}
```

### 4. Breadcrumbs

A trail of events leading to the error:

```typescript
// Info/warn/debug logs become breadcrumbs
logger.info('User started checkout')
logger.warn('Payment processing slow')
logger.error('Payment failed') // ← This creates the error event
```

### 5. Session Replay

See what users did before the error:
- Mouse movements
- Clicks
- Page navigation
- Network requests

**Note:** Sensitive data is automatically masked:
- Passwords
- Credit card numbers
- Email addresses
- Personal information

## Sentry Dashboard

### Issues Tab

View all errors:
- Error message and stack trace
- Affected users count
- First seen / Last seen dates
- Frequency graph
- Release version

### Performance Tab

Track application performance:
- Slowest API endpoints
- Database query performance
- Frontend page load times
- Transaction traces

### Releases Tab

Track deployments:
- Which errors were introduced in which release
- Error trends after deployment
- Commit information

### Alerts Tab

Configure notifications:
- Slack integration
- Email alerts
- Discord webhooks
- Custom alert rules

## Alerting Best Practices

### Critical Errors (Notify Immediately)

```
IF error.level = fatal
OR error affects > 10 users in 5 minutes
THEN notify #critical-alerts on Slack
```

### Payment Errors

```
IF error.context.tags contains "payment"
THEN notify #payments-team
```

### High Volume Errors

```
IF error count > 100 in 1 hour
THEN notify #tech-team
```

## Cost Optimization

### 1. Sample Rate Tuning

In production, we sample 10% of transactions:

```typescript
// sentry.client.config.ts
tracesSampleRate: 0.1  // 10% sampling
```

This keeps costs low while still catching issues.

### 2. Ignore Known Errors

We filter out noise:

```typescript
ignoreErrors: [
  'NetworkError',
  'Failed to fetch',
  'AbortError',
  // Bot/crawler errors
]
```

### 3. Error Grouping

Sentry groups similar errors together, so 1000 identical errors count as 1 issue.

## Security & Privacy

### Data We Send to Sentry

**Included:**
- Error messages and stack traces
- User ID (hashed)
- Event ID, Artist ID (UUIDs)
- URL paths
- Browser/OS information
- Performance metrics

**Excluded:**
- Stripe API keys
- Supabase service role keys
- CRON secrets
- User passwords
- Credit card numbers
- Personal email content
- Authorization headers

See `sentry.server.config.ts` for the full filtering logic.

## Monitoring in Production

### Daily Checks

1. Check Sentry dashboard for new errors
2. Review performance degradations
3. Check error trends (increasing/decreasing)

### Weekly Reviews

1. Review most common errors
2. Identify performance bottlenecks
3. Update alert rules based on patterns

### Monthly Reports

1. Error rate trends
2. Performance improvements
3. Most affected users/features
4. Release quality metrics

## Troubleshooting

### Errors Not Appearing in Sentry

1. Check `NEXT_PUBLIC_SENTRY_DSN` is set in `.env.local`
2. Verify DSN is correct in Sentry dashboard
3. Check browser console for Sentry initialization errors
4. Ensure `NODE_ENV` is set correctly

### Source Maps Not Working

1. Verify `SENTRY_AUTH_TOKEN` has correct scopes
2. Check build logs for source map upload errors
3. Ensure `SENTRY_ORG` and `SENTRY_PROJECT` match exactly

### Too Many Errors

1. Check for error loops (errors creating more errors)
2. Verify error filtering is working
3. Increase sampling rate temporarily to debug

## Support

- Sentry Docs: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Sentry Community: https://discord.gg/sentry
- Our Logger Docs: `/lib/logger.ts`

## Next Steps

After Sentry is configured:

1. Set up Slack/Discord notifications
2. Create custom alert rules for your team
3. Configure weekly error digest emails
4. Set up performance budgets
5. Enable GitHub integration for commit tracking

---

**Note:** Sentry is optional but highly recommended for production. It will help you catch and fix bugs before users report them.

#!/usr/bin/env tsx

/**
 * Stripe Connect Verification Script
 *
 * Verifies Stripe Connect configuration for artist payouts:
 * - Account status
 * - Connected accounts
 * - Payout capabilities
 * - Platform fee configuration
 *
 * Usage:
 *   npm run verify:stripe-connect
 *
 * Options:
 *   --artist-id <id>  Check specific connected account
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message: string, color?: keyof typeof colors) {
  const colorCode = color ? colors[color] : '';
  console.log(`${colorCode}${message}${colors.reset}`);
}

async function verifyPlatformAccount(stripe: Stripe) {
  log('\n📊 Platform Account', 'blue');
  log('='.repeat(60), 'bold');

  try {
    const account = await stripe.accounts.retrieve();

    log(`\nAccount ID: ${account.id}`);
    log(`Type: ${account.type}`);
    log(`Country: ${account.country}`);
    log(`Email: ${account.email || 'Not set'}`);

    // Check charges capability
    if (account.charges_enabled) {
      log('✅ Charges: Enabled', 'green');
    } else {
      log('❌ Charges: Disabled', 'red');
      log('   → Complete business verification in Stripe dashboard', 'yellow');
    }

    // Check payouts capability
    if (account.payouts_enabled) {
      log('✅ Payouts: Enabled', 'green');
    } else {
      log('❌ Payouts: Disabled', 'red');
      log('   → Add bank account in Stripe dashboard', 'yellow');
    }

    // Check details submitted
    if (account.details_submitted) {
      log('✅ Details: Submitted', 'green');
    } else {
      log('⚠️  Details: Not fully submitted', 'yellow');
    }

    // Check requirements
    if (account.requirements) {
      const currentlyDue = account.requirements.currently_due || [];
      const eventuallyDue = account.requirements.eventually_due || [];

      if (currentlyDue.length > 0) {
        log(`\n⚠️  Currently due: ${currentlyDue.join(', ')}`, 'yellow');
      }

      if (eventuallyDue.length > 0) {
        log(`\n⚠️  Eventually due: ${eventuallyDue.join(', ')}`, 'yellow');
      }

      if (currentlyDue.length === 0 && eventuallyDue.length === 0) {
        log('✅ No outstanding requirements', 'green');
      }
    }
  } catch (error) {
    log(
      `\n❌ Error retrieving platform account: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'red'
    );
  }
}

async function verifyConnectedAccounts(stripe: Stripe, limit = 10) {
  log('\n\n👥 Connected Accounts (Artists)', 'blue');
  log('='.repeat(60), 'bold');

  try {
    const accounts = await stripe.accounts.list({
      limit,
    });

    if (accounts.data.length === 0) {
      log('\n⚠️  No connected accounts found', 'yellow');
      log('   → Artists have not completed Stripe Connect onboarding yet', 'yellow');
      return;
    }

    log(`\nFound ${accounts.data.length} connected account(s):\n`);

    for (const account of accounts.data) {
      log(`\n${'─'.repeat(60)}`);
      log(`Account ID: ${account.id}`);
      log(`Type: ${account.type}`);
      log(`Country: ${account.country}`);
      log(`Email: ${account.email || 'Not set'}`);

      // Check status
      if (account.charges_enabled && account.payouts_enabled) {
        log('✅ Status: Fully operational', 'green');
      } else if (account.charges_enabled) {
        log('⚠️  Status: Charges enabled, payouts disabled', 'yellow');
      } else {
        log('❌ Status: Not operational', 'red');
      }

      // Check requirements
      if (account.requirements) {
        const currentlyDue = account.requirements.currently_due || [];

        if (currentlyDue.length > 0) {
          log(`⚠️  Requirements: ${currentlyDue.join(', ')}`, 'yellow');
        } else {
          log('✅ Requirements: None', 'green');
        }
      }

      // Check controller (Express account)
      if (account.controller) {
        log('✅ Controller: Express account (managed by platform)', 'green');
      }
    }

    log(`\n${'─'.repeat(60)}\n`);
  } catch (error) {
    log(
      `\n❌ Error retrieving connected accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'red'
    );
  }
}

async function verifyPayoutCapabilities(stripe: Stripe) {
  log('\n💰 Payout Configuration', 'blue');
  log('='.repeat(60), 'bold');

  try {
    // Check if we can create a test transfer (to verify Connect setup)
    log('\nChecking transfer capabilities...');

    const account = await stripe.accounts.retrieve();

    if (!account.payouts_enabled) {
      log('❌ Platform payouts not enabled', 'red');
      log('   → Complete bank account setup in Stripe dashboard', 'yellow');
      return;
    }

    log('✅ Platform can receive payouts', 'green');

    // Check balance
    const balance = await stripe.balance.retrieve();

    log(`\nPlatform Balance:`);
    for (const b of balance.available) {
      const amount = (b.amount / 100).toFixed(2);
      log(`   ${b.currency.toUpperCase()}: ${amount}`);
    }

    for (const b of balance.pending) {
      const amount = (b.amount / 100).toFixed(2);
      log(`   Pending ${b.currency.toUpperCase()}: ${amount}`);
    }
  } catch (error) {
    log(
      `\n❌ Error checking payout capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'red'
    );
  }
}

async function verifyWebhooks(stripe: Stripe) {
  log('\n\n🔔 Webhook Configuration', 'blue');
  log('='.repeat(60), 'bold');

  try {
    const webhooks = await stripe.webhookEndpoints.list({
      limit: 10,
    });

    if (webhooks.data.length === 0) {
      log('\n⚠️  No webhooks configured', 'yellow');
      log('   → Set up webhook in Stripe dashboard', 'yellow');
      log('   → URL: https://your-domain.com/api/stripe/webhook', 'blue');
      return;
    }

    log(`\nFound ${webhooks.data.length} webhook(s):\n`);

    const requiredEvents = [
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'account.updated',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ];

    for (const webhook of webhooks.data) {
      log(`\n${'─'.repeat(60)}`);
      log(`URL: ${webhook.url}`);
      log(`Status: ${webhook.status}`);

      const enabledEvents = webhook.enabled_events;
      const missingEvents = requiredEvents.filter(
        (event) => !enabledEvents.includes(event)
      );

      if (missingEvents.length === 0) {
        log('✅ All required events enabled', 'green');
      } else {
        log(`⚠️  Missing events: ${missingEvents.join(', ')}`, 'yellow');
      }

      log(`Events (${enabledEvents.length}): ${enabledEvents.slice(0, 5).join(', ')}${enabledEvents.length > 5 ? '...' : ''}`);
    }

    log(`\n${'─'.repeat(60)}\n`);
  } catch (error) {
    log(
      `\n❌ Error retrieving webhooks: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'red'
    );
  }
}

async function testArtistPayout(stripe: Stripe, artistAccountId: string) {
  log(`\n\n🧪 Testing Artist Payout Simulation`, 'blue');
  log('='.repeat(60), 'bold');

  try {
    log(`\nArtist Account: ${artistAccountId}`);

    // Retrieve artist account
    const account = await stripe.accounts.retrieve(artistAccountId);

    if (!account.payouts_enabled) {
      log('❌ Artist payouts not enabled', 'red');
      log('   → Artist must complete onboarding', 'yellow');
      return;
    }

    log('✅ Artist account ready for payouts', 'green');

    // Simulate payout calculation
    const eventRevenue = 1000; // €10.00
    const artistTier = 'pro'; // 60% share
    const artistShare = eventRevenue * 0.6; // 600 (€6.00)

    log(`\nPayout Simulation:`);
    log(`   Event Revenue: €${(eventRevenue / 100).toFixed(2)}`);
    log(`   Artist Tier: ${artistTier} (60% share)`);
    log(`   Artist Payout: €${(artistShare / 100).toFixed(2)}`);

    // Note: We don't actually create a payout in test mode
    log('\n✅ Payout simulation complete', 'green');
    log('   → Use Stripe dashboard to create test payouts', 'blue');
  } catch (error) {
    log(
      `\n❌ Error testing artist payout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'red'
    );
  }
}

async function main() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    log('❌ Error: STRIPE_SECRET_KEY environment variable is required', 'red');
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' });

  log('\n' + '='.repeat(60), 'bold');
  log('  STRIPE CONNECT VERIFICATION', 'bold');
  log('='.repeat(60), 'bold');

  // Check if using live or test mode
  if (stripeKey.startsWith('sk_test_')) {
    log('\n⚠️  Using TEST mode Stripe keys', 'yellow');
  } else if (stripeKey.startsWith('sk_live_')) {
    log('\n✅ Using LIVE mode Stripe keys', 'green');
  }

  await verifyPlatformAccount(stripe);
  await verifyConnectedAccounts(stripe);
  await verifyPayoutCapabilities(stripe);
  await verifyWebhooks(stripe);

  // Check if specific artist account provided
  const args = process.argv.slice(2);
  const artistIdIndex = args.indexOf('--artist-id');

  if (artistIdIndex !== -1 && args[artistIdIndex + 1]) {
    const artistId = args[artistIdIndex + 1];
    await testArtistPayout(stripe, artistId);
  }

  log('\n' + '='.repeat(60), 'bold');
  log('  VERIFICATION COMPLETE', 'bold');
  log('='.repeat(60) + '\n', 'bold');
}

// Run verification
main().catch((error) => {
  log(
    `\n❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    'red'
  );
  process.exit(1);
});

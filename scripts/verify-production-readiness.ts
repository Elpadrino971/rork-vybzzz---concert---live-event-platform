#!/usr/bin/env tsx

/**
 * Production Readiness Verification Script
 *
 * Verifies all critical systems are ready for launch:
 * - Environment variables
 * - Database connectivity
 * - Stripe configuration
 * - Storage buckets
 * - API endpoints
 * - Security headers
 *
 * Usage:
 *   npm run verify:production
 *
 * Environment:
 *   Set PRODUCTION_URL to test production deployment
 *   Otherwise tests local development environment
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

// Colors for console output
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

function addResult(name: string, status: 'pass' | 'fail' | 'warn', message: string, details?: string) {
  results.push({ name, status, message, details });
}

// ============================================================================
// 1. ENVIRONMENT VARIABLES CHECK
// ============================================================================

async function checkEnvironmentVariables() {
  log('\n📋 Checking Environment Variables...', 'blue');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_STARTER',
    'STRIPE_PRICE_PRO',
    'STRIPE_PRICE_ELITE',
    'CRON_SECRET',
  ];

  const missing: string[] = [];
  const tooShort: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else if (varName === 'CRON_SECRET' && value.length < 32) {
      tooShort.push(`${varName} (${value.length} chars, need 32+)`);
    }
  }

  if (missing.length === 0 && tooShort.length === 0) {
    addResult('Environment Variables', 'pass', 'All required variables present');
  } else {
    if (missing.length > 0) {
      addResult('Environment Variables', 'fail', `Missing: ${missing.join(', ')}`);
    }
    if (tooShort.length > 0) {
      addResult('Environment Variables', 'fail', `Too short: ${tooShort.join(', ')}`);
    }
  }

  // Check if using production Stripe keys
  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  if (stripeKey.startsWith('sk_test_')) {
    addResult('Stripe Keys', 'warn', 'Using TEST Stripe keys (expected for development)');
  } else if (stripeKey.startsWith('sk_live_')) {
    addResult('Stripe Keys', 'pass', 'Using LIVE Stripe keys (production)');
  } else {
    addResult('Stripe Keys', 'fail', 'Invalid Stripe key format');
  }
}

// ============================================================================
// 2. DATABASE CONNECTIVITY CHECK
// ============================================================================

async function checkDatabaseConnectivity() {
  log('\n🗄️  Checking Database Connectivity...', 'blue');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      addResult('Database Connection', 'fail', 'Missing Supabase credentials');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection with a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      addResult('Database Connection', 'fail', `Connection failed: ${error.message}`);
    } else {
      addResult('Database Connection', 'pass', 'Successfully connected to Supabase');
    }

    // Check critical tables exist
    const criticalTables = [
      'profiles',
      'events',
      'tickets',
      'tips',
      'commissions',
      'transactions',
      'artist_subscriptions',
    ];

    const tableChecks = await Promise.all(
      criticalTables.map(async (table) => {
        const { error } = await supabase.from(table).select('count').limit(1);
        return { table, exists: !error };
      })
    );

    const missingTables = tableChecks.filter((t) => !t.exists).map((t) => t.table);

    if (missingTables.length === 0) {
      addResult('Database Tables', 'pass', 'All critical tables exist');
    } else {
      addResult('Database Tables', 'fail', `Missing tables: ${missingTables.join(', ')}`);
    }
  } catch (error) {
    addResult('Database Connection', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// 3. STORAGE BUCKETS CHECK
// ============================================================================

async function checkStorageBuckets() {
  log('\n🪣 Checking Storage Buckets...', 'blue');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      addResult('Storage Buckets', 'fail', 'Missing Supabase credentials');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      addResult('Storage Buckets', 'fail', `Error listing buckets: ${error.message}`);
      return;
    }

    const requiredBuckets = [
      'event-images',
      'event-videos',
      'user-avatars',
      'event-thumbnails',
      'artist-banners',
      'shorts-videos',
    ];

    const existingBuckets = buckets?.map((b) => b.name) || [];
    const missingBuckets = requiredBuckets.filter((b) => !existingBuckets.includes(b));

    if (missingBuckets.length === 0) {
      addResult('Storage Buckets', 'pass', `All ${requiredBuckets.length} buckets exist`);
    } else {
      addResult('Storage Buckets', 'fail', `Missing buckets: ${missingBuckets.join(', ')}`, 'Run: npm run setup:storage');
    }
  } catch (error) {
    addResult('Storage Buckets', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// 4. STRIPE CONFIGURATION CHECK
// ============================================================================

async function checkStripeConfiguration() {
  log('\n💳 Checking Stripe Configuration...', 'blue');

  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      addResult('Stripe Connection', 'fail', 'Missing Stripe secret key');
      return;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' });

    // Test connection
    const account = await stripe.accounts.retrieve();
    addResult('Stripe Connection', 'pass', `Connected to Stripe account: ${account.id}`);

    // Check subscription products exist
    const products = await stripe.products.list({ limit: 10 });
    const subscriptionProducts = products.data.filter((p) => p.active);

    if (subscriptionProducts.length >= 3) {
      addResult('Stripe Products', 'pass', `${subscriptionProducts.length} active products found`);
    } else {
      addResult('Stripe Products', 'warn', `Only ${subscriptionProducts.length} products (expected 3: Starter, Pro, Elite)`, 'Run: npm run setup:stripe');
    }

    // Check webhook endpoints
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    const activeWebhooks = webhooks.data.filter((w) => w.status === 'enabled');

    if (activeWebhooks.length > 0) {
      addResult('Stripe Webhooks', 'pass', `${activeWebhooks.length} webhook(s) configured`);
    } else {
      addResult('Stripe Webhooks', 'fail', 'No webhooks configured', 'Configure webhook in Stripe dashboard');
    }

    // Check if Connect is enabled
    if (account.controller) {
      addResult('Stripe Connect', 'pass', 'Stripe Connect enabled');
    } else {
      addResult('Stripe Connect', 'warn', 'Stripe Connect status unknown', 'Verify in Stripe dashboard');
    }
  } catch (error) {
    addResult('Stripe Configuration', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// 5. API ENDPOINTS CHECK (if production URL provided)
// ============================================================================

async function checkAPIEndpoints() {
  const productionUrl = process.env.PRODUCTION_URL;

  if (!productionUrl) {
    log('\n🌐 Skipping API endpoint checks (PRODUCTION_URL not set)', 'yellow');
    return;
  }

  log('\n🌐 Checking API Endpoints...', 'blue');

  const endpoints = [
    { path: '/api/health', expectedStatus: 200 },
    { path: '/api/events', expectedStatus: 200 },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${productionUrl}${endpoint.path}`);

      if (response.status === endpoint.expectedStatus) {
        addResult(`API: ${endpoint.path}`, 'pass', `Returned ${response.status}`);
      } else {
        addResult(`API: ${endpoint.path}`, 'warn', `Returned ${response.status} (expected ${endpoint.expectedStatus})`);
      }
    } catch (error) {
      addResult(`API: ${endpoint.path}`, 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// ============================================================================
// 6. SECURITY HEADERS CHECK (if production URL provided)
// ============================================================================

async function checkSecurityHeaders() {
  const productionUrl = process.env.PRODUCTION_URL;

  if (!productionUrl) {
    log('\n🔒 Skipping security headers check (PRODUCTION_URL not set)', 'yellow');
    return;
  }

  log('\n🔒 Checking Security Headers...', 'blue');

  try {
    const response = await fetch(productionUrl);
    const headers = response.headers;

    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security',
    ];

    const missingHeaders: string[] = [];
    for (const header of requiredHeaders) {
      if (!headers.get(header)) {
        missingHeaders.push(header);
      }
    }

    if (missingHeaders.length === 0) {
      addResult('Security Headers', 'pass', 'All critical security headers present');
    } else {
      addResult('Security Headers', 'warn', `Missing headers: ${missingHeaders.join(', ')}`);
    }

    // Check specific header values
    const xFrameOptions = headers.get('x-frame-options');
    if (xFrameOptions === 'DENY' || xFrameOptions === 'SAMEORIGIN') {
      addResult('X-Frame-Options', 'pass', `Set to ${xFrameOptions}`);
    } else {
      addResult('X-Frame-Options', 'warn', `Value: ${xFrameOptions || 'not set'}`);
    }
  } catch (error) {
    addResult('Security Headers', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// 7. LEGAL PAGES CHECK
// ============================================================================

async function checkLegalPages() {
  log('\n⚖️  Checking Legal Pages...', 'blue');

  const fs = await import('fs/promises');
  const path = await import('path');

  try {
    // Check if legal pages exist
    const legalFiles = [
      'app/legal/terms/page.tsx',
      'app/legal/page.tsx',
      'app/legal/privacy/page.tsx',
    ];

    for (const file of legalFiles) {
      try {
        const filePath = path.join(process.cwd(), file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Check for placeholders
        const placeholders = [
          '[VOTRE SIRET]',
          '[VOTRE RCS]',
          '[VOTRE ADRESSE]',
          '[VOTRE TVA]',
          '[VOTRE CAPITAL]',
          '[NOM DU MÉDIATEUR]',
        ];

        const foundPlaceholders = placeholders.filter((p) => content.includes(p));

        if (foundPlaceholders.length === 0) {
          addResult(`Legal: ${file}`, 'pass', 'No placeholders found');
        } else {
          addResult(`Legal: ${file}`, 'fail', `Placeholders found: ${foundPlaceholders.join(', ')}`, 'See: LEGAL_TEMPLATE.md');
        }
      } catch (error) {
        addResult(`Legal: ${file}`, 'fail', 'File not found or not readable');
      }
    }
  } catch (error) {
    addResult('Legal Pages', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log('\n' + '='.repeat(70), 'bold');
  log('  VYBZZZ PLATFORM - PRODUCTION READINESS CHECK', 'bold');
  log('='.repeat(70) + '\n', 'bold');

  const startTime = Date.now();

  await checkEnvironmentVariables();
  await checkDatabaseConnectivity();
  await checkStorageBuckets();
  await checkStripeConfiguration();
  await checkAPIEndpoints();
  await checkSecurityHeaders();
  await checkLegalPages();

  const duration = Date.now() - startTime;

  // Print results
  log('\n' + '='.repeat(70), 'bold');
  log('  RESULTS', 'bold');
  log('='.repeat(70) + '\n', 'bold');

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  for (const result of results) {
    let symbol = '';
    let color: keyof typeof colors = 'reset';

    switch (result.status) {
      case 'pass':
        symbol = '✅';
        color = 'green';
        passCount++;
        break;
      case 'warn':
        symbol = '⚠️ ';
        color = 'yellow';
        warnCount++;
        break;
      case 'fail':
        symbol = '❌';
        color = 'red';
        failCount++;
        break;
    }

    log(`${symbol} ${result.name}: ${result.message}`, color);
    if (result.details) {
      log(`   → ${result.details}`, 'blue');
    }
  }

  // Summary
  log('\n' + '='.repeat(70), 'bold');
  log('  SUMMARY', 'bold');
  log('='.repeat(70) + '\n', 'bold');

  log(`✅ Passed: ${passCount}`, 'green');
  log(`⚠️  Warnings: ${warnCount}`, 'yellow');
  log(`❌ Failed: ${failCount}`, 'red');
  log(`⏱️  Duration: ${duration}ms\n`);

  if (failCount === 0 && warnCount === 0) {
    log('🎉 ALL CHECKS PASSED! Platform is ready for production.', 'green');
    process.exit(0);
  } else if (failCount === 0) {
    log('⚠️  All critical checks passed, but there are warnings.', 'yellow');
    log('Review warnings before deploying to production.', 'yellow');
    process.exit(0);
  } else {
    log('❌ CRITICAL CHECKS FAILED! Platform is NOT ready for production.', 'red');
    log('Fix all failures before deploying.', 'red');
    process.exit(1);
  }
}

// Run checks
main().catch((error) => {
  log(`\n❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
  process.exit(1);
});

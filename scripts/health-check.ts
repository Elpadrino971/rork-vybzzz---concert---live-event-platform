#!/usr/bin/env tsx

/**
 * Production Health Check Script
 *
 * Monitors production deployment health:
 * - API endpoint availability
 * - Response times
 * - Database connectivity
 * - Payment system status
 * - Storage availability
 *
 * Usage:
 *   npm run health:check
 *
 * Environment:
 *   PRODUCTION_URL - URL to check (required)
 *   HEALTH_CHECK_INTERVAL - Check interval in seconds (default: 60)
 *   HEALTH_CHECK_ONCE - Run once and exit (default: false)
 *
 * Example:
 *   PRODUCTION_URL=https://vybzzz.com npm run health:check
 *   PRODUCTION_URL=https://vybzzz.com HEALTH_CHECK_ONCE=true npm run health:check
 */

import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production' });

interface HealthCheckResult {
  endpoint: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  statusCode?: number;
  error?: string;
}

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
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${colorCode}${message}${colors.reset}`);
}

async function checkEndpoint(url: string, timeout = 10000): Promise<HealthCheckResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'VyBzzZ-HealthCheck/1.0',
      },
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    let status: 'healthy' | 'degraded' | 'down' = 'healthy';

    // Determine health based on response time and status code
    if (response.status >= 500) {
      status = 'down';
    } else if (response.status >= 400) {
      status = 'degraded';
    } else if (responseTime > 2000) {
      status = 'degraded'; // Slow response
    }

    return {
      endpoint: url,
      status,
      responseTime,
      statusCode: response.status,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      endpoint: url,
      status: 'down',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runHealthChecks(baseUrl: string): Promise<HealthCheckResult[]> {
  const endpoints = [
    '/',
    '/api/health',
    '/api/events',
    '/api/dashboard/artist',
    '/api/dashboard/fan',
  ];

  log('🏥 Running health checks...', 'blue');

  const results = await Promise.all(
    endpoints.map((endpoint) => checkEndpoint(`${baseUrl}${endpoint}`))
  );

  return results;
}

function printResults(results: HealthCheckResult[]) {
  log('\n' + '='.repeat(80), 'bold');
  log('  HEALTH CHECK RESULTS', 'bold');
  log('='.repeat(80) + '\n', 'bold');

  let healthyCount = 0;
  let degradedCount = 0;
  let downCount = 0;

  for (const result of results) {
    let symbol = '';
    let color: keyof typeof colors = 'reset';

    switch (result.status) {
      case 'healthy':
        symbol = '✅';
        color = 'green';
        healthyCount++;
        break;
      case 'degraded':
        symbol = '⚠️ ';
        color = 'yellow';
        degradedCount++;
        break;
      case 'down':
        symbol = '❌';
        color = 'red';
        downCount++;
        break;
    }

    const statusInfo = result.statusCode
      ? `${result.statusCode} (${result.responseTime}ms)`
      : `Error: ${result.error}`;

    log(`${symbol} ${result.endpoint}: ${statusInfo}`, color);
  }

  log('\n' + '-'.repeat(80), 'bold');

  // Calculate average response time (only for successful requests)
  const successfulResults = results.filter((r) => r.statusCode && r.statusCode < 400);
  const avgResponseTime =
    successfulResults.length > 0
      ? Math.round(
          successfulResults.reduce((sum, r) => sum + r.responseTime, 0) /
            successfulResults.length
        )
      : 0;

  log(`\n📊 Summary:`, 'bold');
  log(`   ✅ Healthy: ${healthyCount}`);
  log(`   ⚠️  Degraded: ${degradedCount}`);
  log(`   ❌ Down: ${downCount}`);
  log(`   ⏱️  Average Response Time: ${avgResponseTime}ms\n`);

  // Overall health status
  if (downCount === 0 && degradedCount === 0) {
    log('🎉 System Status: ALL SYSTEMS OPERATIONAL', 'green');
    return 0;
  } else if (downCount === 0) {
    log('⚠️  System Status: DEGRADED PERFORMANCE', 'yellow');
    return 0;
  } else {
    log('❌ System Status: CRITICAL - SOME SERVICES DOWN', 'red');
    return 1;
  }
}

async function checkDatabaseHealth(baseUrl: string): Promise<void> {
  log('\n🗄️  Checking database health...', 'blue');

  try {
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();

      if (data.database === 'ok') {
        log('✅ Database: Connected', 'green');
      } else {
        log('⚠️  Database: ' + (data.database || 'Unknown status'), 'yellow');
      }

      if (data.storage === 'ok') {
        log('✅ Storage: Connected', 'green');
      } else {
        log('⚠️  Storage: ' + (data.storage || 'Unknown status'), 'yellow');
      }
    } else {
      log('❌ Database: Health check failed', 'red');
    }
  } catch (error) {
    log(
      `❌ Database: Error - ${error instanceof Error ? error.message : 'Unknown error'}`,
      'red'
    );
  }
}

async function checkPaymentSystemHealth(): Promise<void> {
  log('\n💳 Checking payment system health...', 'blue');

  try {
    const Stripe = (await import('stripe')).default;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      log('⚠️  Stripe: API key not configured', 'yellow');
      return;
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' });

    // Check Stripe API health
    const startTime = Date.now();
    const account = await stripe.accounts.retrieve();
    const responseTime = Date.now() - startTime;

    log(`✅ Stripe: Connected (${responseTime}ms)`, 'green');

    if (account.charges_enabled) {
      log('✅ Stripe: Charges enabled', 'green');
    } else {
      log('⚠️  Stripe: Charges NOT enabled', 'yellow');
    }

    if (account.payouts_enabled) {
      log('✅ Stripe: Payouts enabled', 'green');
    } else {
      log('⚠️  Stripe: Payouts NOT enabled', 'yellow');
    }
  } catch (error) {
    log(
      `❌ Stripe: Error - ${error instanceof Error ? error.message : 'Unknown error'}`,
      'red'
    );
  }
}

async function monitorContinuously(baseUrl: string, interval: number) {
  log(`🔄 Starting continuous health monitoring (interval: ${interval}s)`, 'blue');
  log('Press Ctrl+C to stop\n', 'yellow');

  while (true) {
    const results = await runHealthChecks(baseUrl);
    const exitCode = printResults(results);

    await checkDatabaseHealth(baseUrl);
    await checkPaymentSystemHealth();

    log(`\n⏳ Next check in ${interval} seconds...`, 'blue');
    log('='.repeat(80) + '\n', 'bold');

    // Alert if critical
    if (exitCode === 1) {
      log('🚨 ALERT: Critical services are down!', 'red');
    }

    await new Promise((resolve) => setTimeout(resolve, interval * 1000));
  }
}

async function main() {
  const productionUrl = process.env.PRODUCTION_URL;

  if (!productionUrl) {
    log('❌ Error: PRODUCTION_URL environment variable is required', 'red');
    log(
      'Example: PRODUCTION_URL=https://vybzzz.com npm run health:check',
      'yellow'
    );
    process.exit(1);
  }

  // Remove trailing slash
  const baseUrl = productionUrl.replace(/\/$/, '');

  log('\n' + '='.repeat(80), 'bold');
  log('  VYBZZZ PLATFORM - HEALTH CHECK', 'bold');
  log('='.repeat(80) + '\n', 'bold');
  log(`🔗 Target: ${baseUrl}\n`, 'blue');

  const runOnce = process.env.HEALTH_CHECK_ONCE === 'true';
  const interval = parseInt(process.env.HEALTH_CHECK_INTERVAL || '60', 10);

  if (runOnce) {
    // Run once and exit
    const results = await runHealthChecks(baseUrl);
    const exitCode = printResults(results);

    await checkDatabaseHealth(baseUrl);
    await checkPaymentSystemHealth();

    process.exit(exitCode);
  } else {
    // Monitor continuously
    await monitorContinuously(baseUrl, interval);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n\n👋 Health monitoring stopped', 'yellow');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('\n\n👋 Health monitoring stopped', 'yellow');
  process.exit(0);
});

// Run health check
main().catch((error) => {
  log(`\n❌ Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'red');
  process.exit(1);
});

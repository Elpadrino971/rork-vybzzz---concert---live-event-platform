/**
 * Script de test des endpoints API du backend Vybzzz
 * Usage: npx ts-node scripts/test-api.ts [base_url]
 * 
 * Note: Utilise fetch natif (Node.js 18+) ou installez node-fetch
 */

// Utiliser fetch natif si disponible (Node.js 18+)
const fetch = globalThis.fetch || require('node-fetch');

const BASE_URL = process.argv[2] || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  statusCode?: number;
  error?: string;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  method: string,
  endpoint: string,
  body?: any
): Promise<TestResult> {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    const passed = response.status >= 200 && response.status < 300;

    return {
      name,
      passed,
      statusCode: response.status,
      error: passed ? undefined : `HTTP ${response.status}: ${JSON.stringify(data)}`,
    };
  } catch (error: any) {
    return {
      name,
      passed: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('🧪 Test des endpoints du backend Vybzzz');
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  // Test 1: Health check
  results.push(await testEndpoint('Health Check', 'GET', '/health'));

  // Test 2: Events
  console.log('📅 Testing Events endpoints...');
  results.push(await testEndpoint('GET /api/events', 'GET', '/api/events'));
  results.push(
    await testEndpoint(
      'GET /api/events?page=1&limit=10',
      'GET',
      '/api/events?page=1&limit=10'
    )
  );
  results.push(
    await testEndpoint(
      'GET /api/events?isLive=true',
      'GET',
      '/api/events?isLive=true'
    )
  );

  // Test 3: Chat
  console.log('💬 Testing Chat endpoints...');
  results.push(
    await testEndpoint('POST /api/chat/message', 'POST', '/api/chat/message', {
      messages: [{ role: 'user', content: 'Hello' }],
    })
  );

  // Test 4: Storage
  console.log('📦 Testing Storage endpoints...');
  results.push(
    await testEndpoint(
      'GET /api/storage/list/event-images',
      'GET',
      '/api/storage/list/event-images'
    )
  );

  // Résumé
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed
      ? `OK (${result.statusCode})`
      : `FAILED: ${result.error}`;
    console.log(`${icon} ${result.name} - ${status}`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(
    `\n${passed === total ? '✅' : '❌'} ${passed}/${total} tests réussis`
  );

  process.exit(passed === total ? 0 : 1);
}

runTests().catch(console.error);


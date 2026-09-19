/**
 * Pre-warmer: hits all app routes so Turbopack compiles them upfront.
 * Run once after `npm run dev` starts: node scripts/prewarm.mjs
 */

const BASE = 'http://localhost:3000';

const ROUTES = [
  '/',
  '/products',
  '/cart',
  '/checkout',
  '/track-order',
  '/about-us',
  '/contact-us',
  '/faq',
  '/shipping-policy',
  '/return-policy',
  '/admin/login',
  '/admin',
  '/admin/orders',
  '/admin/products',
  '/admin/inventory',
  '/admin/categories',
  '/admin/coupons',
  '/admin/customers',
  '/admin/reviews',
  '/admin/marketing',
  '/admin/cms',
  '/admin/settings',
  '/admin/activity-logs',
];

async function prewarm() {
  console.log('🔥 Pre-warming all routes (compiling pages upfront)...\n');

  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    const start = Date.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      const ms = Date.now() - start;
      const icon = res.status < 400 ? '✅' : '⚠️';
      console.log(`${icon} ${ms.toString().padStart(5)}ms  ${route}  [${res.status}]`);
    } catch (err) {
      console.log(`❌ FAILED  ${route}  — ${err.message}`);
    }
  }

  console.log('\n✨ Pre-warm complete! All pages are now compiled. Navigation will be instant.');
}

prewarm();

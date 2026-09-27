// Browser check: withdrawing analytics consent clears GA cookies, and a stored
// choice older than 12 months brings the banner back. Needs `npm run build:web`.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const site = await serve();
const browser = await chromium.launch();
const KEY = 'almeron_consent_v1';

async function open(pref) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.route('https://www.googletagmanager.com/**', (r) => r.abort());
  await page.goto(`${site.url}/contact/`);
  await page.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [KEY, pref]);
  await ctx.addCookies([{ name: '_ga', value: 'GA1.1.123.456', url: site.url }, { name: '_ga_48FWDR8WMC', value: 'GS1.1.x', url: site.url }]);
  await page.reload({ waitUntil: 'load' });
  return { ctx, page };
}

try {
  // 1. Granted -> withdraw in the dialog -> _ga cookies are gone.
  const a = await open({ version: 1, analytics: true, ads: false, ts: Date.now() });
  assert.equal(await a.page.isVisible('#consent-banner'), false, 'fresh choice should keep the banner hidden');
  await a.page.click('#consent-settings');
  await a.page.uncheck('#consent-analytics');
  await a.page.click('#consent-save');
  const left = (await a.ctx.cookies()).filter((c) => c.name.startsWith('_ga')).map((c) => c.name);
  assert.deepEqual(left, [], `GA cookies left after withdrawing consent: ${left.join(', ')}`);
  const saved = await a.page.evaluate((k) => JSON.parse(localStorage.getItem(k)), KEY);
  assert.equal(typeof saved.ts, 'number', 'saved choice must carry a timestamp');
  await a.ctx.close();

  // 2. A choice older than 12 months is ignored: the banner asks again.
  const b = await open({ version: 1, analytics: true, ads: false, ts: Date.now() - 400 * 864e5 });
  assert.equal(await b.page.isVisible('#consent-banner'), true, 'expired choice should show the banner again');
  await b.ctx.close();

  console.log('consent browser checks passed (withdrawal clears _ga cookies, 12-month expiry).');
} finally {
  await browser.close();
  site.close();
}

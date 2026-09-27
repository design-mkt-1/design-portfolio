// Browser check for the accessibility fixes from the 2026-09-27 audit.
// Needs `npm run build:web` first. Usage: node tools/audit/test-a11y.mjs
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const site = await serve();
const browser = await chromium.launch();

// WCAG relative luminance / contrast of two "rgb(r, g, b)" strings.
const lum = (rgb) => {
  const [r, g, b] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const STOPS = ['rgb(35, 198, 170)', 'rgb(74, 146, 224)', 'rgb(123, 108, 224)']; // --brand-gradient

async function page(width, path = '/') {
  const p = await browser.newPage({ viewport: { width, height: 812 } });
  await p.route('https://www.googletagmanager.com/**', (r) => r.abort());
  await p.goto(site.url + path, { waitUntil: 'load' });
  return p;
}

try {
  // 1. Text on the brand gradient reads at >= 4.5:1 on every stop.
  const p1 = await page(1440);
  const ctaColor = await p1.$eval('.header-cta', (el) => getComputedStyle(el).color);
  for (const stop of STOPS) assert.ok(contrast(ctaColor, stop) >= 4.5, `header CTA ${ctaColor} on ${stop}: ${contrast(ctaColor, stop).toFixed(2)}:1`);

  // 2. Stats read as values, not as reel digits.
  await p1.locator('.stats').first().scrollIntoViewIfNeeded();
  await p1.waitForTimeout(2500);
  const snap = await p1.locator('.stats').first().ariaSnapshot();
  assert.ok(!/0 1 2 3 4/.test(snap), `stats read as reels: ${snap.slice(0, 120)}`);
  assert.match(snap, /\d+\+? *\n?.*brands|\d+ brands/s, 'stats should expose the brand count');

  // 3. After Reject, focus lands on the page, not on <body>.
  await p1.evaluate(() => localStorage.clear());
  await p1.reload({ waitUntil: 'load' });
  await p1.focus('#consent-reject');
  await p1.keyboard.press('Enter');
  assert.notEqual(await p1.evaluate(() => document.activeElement?.tagName), 'BODY', 'focus lost after Reject');

  // 4. Mobile: tabbing never focuses an element above the viewport (hidden header).
  const p2 = await page(375, '/winboss/portfolio/banners/');
  await p2.evaluate(() => { localStorage.setItem('almeron_consent_v1', JSON.stringify({ version: 1, analytics: false, ads: false })); });
  await p2.reload({ waitUntil: 'load' });
  for (let i = 0; i < 10; i++) {
    await p2.keyboard.press('Tab');
    await p2.waitForTimeout(400); // header slides in over 0.35s
    const y = await p2.evaluate(() => document.activeElement?.getBoundingClientRect().top ?? 0);
    const name = await p2.evaluate(() => document.activeElement?.className || document.activeElement?.tagName);
    assert.ok(y >= 0, `Tab ${i + 1} focused "${name}" off-screen at y=${y}`);
  }
  // 5. First Tab reaches the skip link.
  const p3 = await page(1440, '/contact/');
  await p3.keyboard.press('Tab');
  assert.equal(await p3.evaluate(() => document.activeElement?.className), 'skip', 'first Tab should hit the skip link');

  // 6. Mobile consent banner stays compact.
  const p4 = await page(375);
  const h = await p4.$eval('#consent-banner', (el) => el.getBoundingClientRect().height);
  assert.ok(h <= 170, `consent banner is ${Math.round(h)}px tall on 375px (was 233)`);

  console.log(`a11y browser checks passed (contrast ≥4.5 on 3 gradient stops, stats, focus, skip link, banner ${Math.round(h)}px).`);
} finally {
  await browser.close();
  site.close();
}

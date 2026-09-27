// Browser check: RO/RU pages show no English leftovers found in the 2026-09-27 audit.
// Needs `npm run build:web` first. Usage: node tools/audit/test-i18n.mjs
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const site = await serve();
const browser = await chromium.launch();
const page = await browser.newPage();
await page.route('https://www.googletagmanager.com/**', (r) => r.abort());

async function textOf(path, lang) {
  await page.goto(`${site.url}${path}?lang=${lang}`, { waitUntil: 'load' });
  // Include hidden consent UI and aria-labels: both reach users (sighted or not).
  return page.evaluate(() => {
    const labels = [...document.querySelectorAll('[aria-label]')].map((e) => e.getAttribute('aria-label'));
    return `${document.body.textContent}\n${labels.join('\n')}`.replace(/\s+/g, ' ');
  });
}

try {
  for (const lang of ['ro', 'ru']) {
    const home = await textOf('/', lang);
    for (const en of ['Analytics preferences', 'Accept analytics', 'Save preferences', 'AI is wired', 'Close (Esc)', 'Breadcrumb'])
      assert.ok(!home.includes(en), `${lang} home still shows "${en}"`);
    const landings = await textOf('/winboss/portfolio/landings/', lang);
    assert.ok(!landings.includes('Mobile-first. Tap any landing'), `${lang} landings lede untranslated`);
    const contact = await textOf('/contact/', lang);
    assert.ok(!contact.includes('Get in touch'), `${lang} contact eyebrow untranslated`);
  }
  const ruHome = await textOf('/', 'ru');
  assert.ok(ruHome.includes('брендов') && !ruHome.includes('брендах'), 'RU home stat must read "брендов"');
  const ruContact = await textOf('/contact/', 'ru');
  assert.ok(ruContact.includes('Напишите нам'), 'RU contact eyebrow must differ from the H1');
  console.log('i18n browser checks passed (RO/RU: consent, AI paragraph, aria-labels, landings, contact, brands).');
} finally {
  await browser.close();
  site.close();
}

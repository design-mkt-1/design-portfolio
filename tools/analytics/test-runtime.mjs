import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const analyticsPath = resolve('public/assets/js/analytics.js');
const consentPath = resolve('public/assets/js/consent.js');
const analyticsIdHelperPath = resolve('src/lib/analytics.mjs');
assert.ok(existsSync(analyticsPath), `Missing analytics runtime: ${analyticsPath}`);
assert.ok(existsSync(consentPath), `Missing consent runtime: ${consentPath}`);
assert.ok(existsSync(analyticsIdHelperPath), `Missing analytics ID helper: ${analyticsIdHelperPath}`);

const { stableAnalyticsId } = await import(`file:///${analyticsIdHelperPath.replaceAll('\\', '/')}`);
assert.match(stableAnalyticsId('Banner', 'assets/Brand/Welcome 1080x1080.jpg'), /^banner_[a-z0-9_]+_[a-z0-9]{6}$/);
assert.equal(
  stableAnalyticsId('Banner', 'assets/Brand/Welcome 1080x1080.jpg'),
  stableAnalyticsId('Banner', 'assets/Brand/Welcome 1080x1080.jpg'),
);
assert.notEqual(
  stableAnalyticsId('banner', 'assets/brand/a.jpg'),
  stableAnalyticsId('banner', 'assets/brand/b.jpg'),
);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.setContent(`
    <!doctype html>
    <html lang="en">
      <body data-site-section="home">
        <a id="cta" href="/contact"
          data-analytics-event="cta_click"
          data-analytics-id="hero_contact"
          data-analytics-type="link"
          data-analytics-location="hero">Contact</a>
        <a id="nav" href="/work"
          data-analytics-event="navigation_click"
          data-analytics-id="header_work"
          data-analytics-location="header">Work</a>
        <a id="email" href="mailto:person@example.com"
          data-analytics-event="contact_click"
          data-analytics-id="contact_email"
          data-analytics-location="contact_page"
          data-contact-method="email">Email</a>
        <button id="card"
          data-analytics-event="select_content"
          data-analytics-id="project_almeron"
          data-analytics-location="project_grid"
          data-content-type="project"
          data-content-id="almeron">Project</button>
        <button id="ro"
          data-analytics-event="language_change"
          data-analytics-id="language_ro"
          data-analytics-location="header"
          data-selected-language="ro">RO</button>
        <details id="faq"
          data-analytics-event="faq_open"
          data-analytics-id="faq_services"
          data-analytics-location="faq"
          data-content-type="faq"
          data-content-id="services">
          <summary>Question</summary><p>Answer</p>
        </details>
        <form id="form"
          data-form-id="contact_form"
          data-form-location="contact_page">
          <input name="email" type="email" required>
          <textarea name="message" required></textarea>
          <button type="submit">Send</button>
        </form>
      </body>
    </html>
  `);
  await page.evaluate(() => {
    document.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) event.preventDefault();
    });
  });
  await page.evaluate(() => {
    const existing = [{ event: 'existing_event' }];
    window.dataLayer = existing;
    window.__originalDataLayer = existing;
  });
  await page.addScriptTag({ path: analyticsPath });

  const initialization = await page.evaluate(() => ({
    sameArray: window.dataLayer === window.__originalDataLayer,
    firstEvent: window.dataLayer[0]?.event,
  }));
  assert.deepEqual(initialization, { sameArray: true, firstEvent: 'existing_event' });

  await page.click('#cta');
  await page.click('#nav');
  await page.click('#email');
  await page.click('#card');
  await page.click('#ro');
  await page.click('#faq summary');
  await page.click('#faq summary');

  await page.focus('#form input[name="email"]');
  await page.keyboard.type('private@example.com');
  await page.fill('#form textarea', 'Private message');
  await page.focus('#form textarea');
  await page.keyboard.type('!');

  await page.evaluate(() => {
    const form = document.querySelector('#form');
    window.AlmeronAnalytics.trackFormSubmitAttempt(form);
    window.AlmeronAnalytics.trackFormError(form, 'network');
    window.AlmeronAnalytics.trackFormSuccess(form);
    window.AlmeronAnalytics.trackFormSuccess(form);
  });

  const events = await page.evaluate(() => window.dataLayer.filter((item) => item?.event !== 'existing_event'));
  const count = (name) => events.filter((item) => item.event === name).length;

  assert.equal(count('cta_click'), 1);
  assert.equal(count('navigation_click'), 1);
  assert.equal(count('contact_click'), 1);
  assert.equal(count('select_content'), 1);
  assert.equal(count('language_change'), 1);
  assert.equal(count('faq_open'), 1);
  assert.equal(count('contact_form_start'), 1);
  assert.equal(count('contact_form_submit_attempt'), 1);
  assert.equal(count('contact_form_error'), 1);
  assert.equal(count('generate_lead'), 1);

  const emailEvent = events.find((item) => item.event === 'contact_click');
  assert.equal(emailEvent.method, 'email');
  assert.equal(emailEvent.link_url, undefined);

  const cardEvent = events.find((item) => item.event === 'select_content');
  assert.equal(cardEvent.content_type, 'project');
  assert.equal(cardEvent.content_id, 'almeron');

  const languageEvent = events.find((item) => item.event === 'language_change');
  assert.equal(languageEvent.previous_language, 'en');
  assert.equal(languageEvent.selected_language, 'ro');

  const serialized = JSON.stringify(events);
  assert.ok(!serialized.includes('private@example.com'));
  assert.ok(!serialized.includes('Private message'));
  assert.ok(!serialized.includes('person@example.com'));
  assert.ok(!events.some((item) => ['page_view', 'scroll', 'click', 'file_download'].includes(item.event)));

  await page.setContent(`
    <!doctype html>
    <html lang="en">
      <body data-site-section="home">
        <section id="consent-banner" hidden>
          <button id="consent-accept" type="button">Accept analytics</button>
          <button id="consent-reject" type="button">Reject non-essential</button>
          <button id="consent-manage" type="button">Manage preferences</button>
        </section>
        <button id="consent-settings" type="button">Privacy settings</button>
        <dialog id="consent-dialog">
          <input id="consent-analytics" type="checkbox">
          <input id="consent-ads" type="checkbox">
          <button id="consent-save" type="button">Save preferences</button>
          <button id="consent-cancel" type="button">Cancel</button>
        </dialog>
      </body>
    </html>
  `);
  await page.evaluate(() => {
    window.dataLayer = [];
    window.__gtagCalls = [];
    window.gtag = (...args) => window.__gtagCalls.push(args);
  });
  await page.addScriptTag({ path: analyticsPath });
  await page.addScriptTag({ path: consentPath });
  await page.click('#consent-accept');
  await page.evaluate(() => {
    document.getElementById('consent-banner').hidden = false;
  });
  await page.click('#consent-reject');
  await page.click('#consent-settings');
  await page.check('#consent-analytics');
  await page.click('#consent-save');

  const consentResult = await page.evaluate(() => ({
    updates: window.__gtagCalls.filter((args) => args[0] === 'consent' && args[1] === 'update'),
    events: window.dataLayer.filter((item) => item?.event === 'consent_update'),
  }));
  assert.equal(consentResult.updates.length, 3);
  assert.equal(consentResult.events.length, 3);
  assert.equal(consentResult.events[0].consent_analytics, 'granted');
  assert.equal(consentResult.events[0].consent_ads, 'denied');
  assert.equal(consentResult.events[1].consent_analytics, 'denied');
  assert.equal(consentResult.events[2].consent_analytics, 'granted');

  console.log(`Runtime analytics tests passed (${events.length} dataLayer events inspected).`);
} finally {
  await browser.close();
}

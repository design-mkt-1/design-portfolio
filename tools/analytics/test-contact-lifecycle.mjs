import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const webRoot = resolve('../web');
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    const relativePath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const target = resolve(webRoot, `.${relativePath}`);
    if (target !== webRoot && !target.startsWith(`${webRoot}${sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(target);
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(target)] || 'application/octet-stream'
    });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolveListening) => server.listen(0, '127.0.0.1', resolveListening));
const address = server.address();
assert.ok(address && typeof address !== 'string');
const baseUrl = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });

async function createContactPage(formResponse) {
  const page = await browser.newPage();
  await page.route('https://www.googletagmanager.com/**', (route) => route.abort());
  if (formResponse) {
    await page.route('https://formsubmit.co/ajax/**', (route) =>
      route.fulfill({
        status: formResponse.status,
        contentType: 'application/json',
        body: JSON.stringify(formResponse.body)
      })
    );
  }
  await page.goto(`${baseUrl}/contact/`, { waitUntil: 'networkidle' });
  return page;
}

async function manualEvents(page) {
  return page.evaluate(() =>
    window.dataLayer.filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        typeof item.event === 'string' &&
        !item.event.startsWith('gtm.')
    )
  );
}

async function completeContactForm(page) {
  await page.fill('#name', 'Analytics Test');
  await page.fill('#email', 'analytics-test@example.invalid');
  await page.fill('#message', 'Synthetic integration test message');
}

try {
  const invalidPage = await createContactPage();
  await invalidPage.click('#contact-form button[type="submit"]');
  const invalidEvents = await manualEvents(invalidPage);
  assert.equal(invalidEvents.filter((event) => event.event === 'contact_form_error').length, 1);
  assert.equal(invalidEvents.find((event) => event.event === 'contact_form_error')?.error_type, 'validation');
  assert.equal(invalidEvents.some((event) => event.event === 'contact_form_submit_attempt'), false);
  assert.equal(invalidEvents.some((event) => event.event === 'generate_lead'), false);
  await invalidPage.close();

  const serverErrorPage = await createContactPage({ status: 200, body: { success: false } });
  await serverErrorPage.waitForTimeout(3100);
  await completeContactForm(serverErrorPage);
  await serverErrorPage.click('#contact-form button[type="submit"]');
  await serverErrorPage.locator('#form-status.err').waitFor();
  const serverErrorEvents = await manualEvents(serverErrorPage);
  assert.equal(
    serverErrorEvents.filter((event) => event.event === 'contact_form_submit_attempt').length,
    1
  );
  assert.equal(
    serverErrorEvents.find((event) => event.event === 'contact_form_error')?.error_type,
    'server'
  );
  assert.equal(serverErrorEvents.some((event) => event.event === 'generate_lead'), false);
  await serverErrorPage.close();

  const successPage = await createContactPage({ status: 200, body: { success: true } });
  await successPage.waitForTimeout(3100);
  await completeContactForm(successPage);
  await successPage.click('#contact-form button[type="submit"]');
  await successPage.locator('#form-status.ok').waitFor();
  const successEvents = await manualEvents(successPage);
  assert.equal(
    successEvents.filter((event) => event.event === 'contact_form_submit_attempt').length,
    1
  );
  assert.equal(successEvents.filter((event) => event.event === 'generate_lead').length, 1);
  assert.equal(successEvents.some((event) => event.event === 'contact_form_error'), false);
  const serialized = JSON.stringify(successEvents);
  assert.equal(serialized.includes('analytics-test@example.invalid'), false);
  assert.equal(serialized.includes('Synthetic integration test message'), false);
  await successPage.close();

  console.log(
    'Contact lifecycle integration tests passed (validation, server failure, and confirmed success).'
  );
} finally {
  await browser.close();
  await new Promise((resolveClosed, rejectClosed) =>
    server.close((error) => (error ? rejectClosed(error) : resolveClosed()))
  );
}

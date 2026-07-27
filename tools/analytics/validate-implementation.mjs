import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};
const htmlRoot = resolve(valueAfter('--html-dir', 'dist'));
const requireRealIds = args.includes('--require-real-ids');
const projectRoot = resolve('.');
const failures = [];
const warnings = [];

function addFailure(file, message) {
  failures.push(`${file}: ${message}`);
}

function allFiles(directory, extension) {
  if (!existsSync(directory)) return [];
  const output = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) output.push(...allFiles(path, extension));
    else if (!extension || path.toLowerCase().endsWith(extension)) output.push(path);
  }
  return output;
}

function count(content, expression) {
  return [...content.matchAll(expression)].length;
}

function attributeTags(content) {
  return content.match(/<[^>]+\sdata-analytics-event=(?:"[^"]*"|'[^']*')[^>]*>/gi) || [];
}

function parseJson(relativePath) {
  const path = resolve(projectRoot, relativePath);
  if (!existsSync(path)) {
    addFailure(relativePath, 'required artifact is missing');
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    addFailure(relativePath, `invalid JSON (${error.message})`);
    return null;
  }
}

if (!existsSync(htmlRoot)) {
  addFailure(relative(projectRoot, htmlRoot) || htmlRoot, 'HTML directory does not exist; run the production build first');
}

const htmlFiles = allFiles(htmlRoot, '.html');
if (!htmlFiles.length) addFailure(relative(projectRoot, htmlRoot) || htmlRoot, 'no HTML documents found');

for (const path of htmlFiles) {
  const file = relative(projectRoot, path).replaceAll('\\', '/');
  const html = readFileSync(path, 'utf8');
  const gtmHeadCount = count(html, /googletagmanager\.com\/gtm\.js/gi);
  const gtmBodyCount = count(html, /googletagmanager\.com\/ns\.html\?id=/gi);
  const standaloneGtagCount = count(html, /googletagmanager\.com\/gtag\/js/gi);

  if (gtmHeadCount !== 1) addFailure(file, `expected one GTM head installation, found ${gtmHeadCount}`);
  if (gtmBodyCount !== 1) addFailure(file, `expected one GTM noscript fallback, found ${gtmBodyCount}`);
  if (standaloneGtagCount) addFailure(file, `found ${standaloneGtagCount} standalone gtag.js installation(s)`);
  if (/\bUA-\d+/i.test(html) || /google-analytics\.com\/analytics\.js/i.test(html)) {
    addFailure(file, 'legacy Universal Analytics implementation found');
  }
  if (count(html, /assets\/js\/analytics\.js/gi) !== 1) addFailure(file, 'analytics.js must be loaded exactly once');
  if (count(html, /assets\/js\/consent\.js/gi) !== 1) addFailure(file, 'consent.js must be loaded exactly once');

  const ids = [...html.matchAll(/\sdata-analytics-id=(?:"([^"]+)"|'([^']+)')/gi)].map((match) => match[1] || match[2]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) addFailure(file, `duplicate analytics IDs: ${duplicateIds.join(', ')}`);

  for (const tag of attributeTags(html)) {
    if (!/\sdata-analytics-id=(?:"[^"]+"|'[^']+')/i.test(tag)) {
      addFailure(file, `annotated element is missing data-analytics-id (${tag.slice(0, 100)}…)`);
    }
    const event = tag.match(/\sdata-analytics-event=(?:"([^"]+)"|'([^']+)')/i);
    const eventName = event?.[1] || event?.[2] || '';
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(eventName)) addFailure(file, `invalid event name "${eventName}"`);
    if (eventName === 'generate_lead') addFailure(file, 'generate_lead must not be wired to a click annotation');
    const attributeValues = [...tag.matchAll(/\sdata-(?:analytics-[\w-]+|content-[\w-]+|contact-method)=(?:"([^"]*)"|'([^']*)')/gi)]
      .map((match) => match[1] || match[2])
      .join(' ');
    if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(attributeValues) || /(?:\+?\d[\d\s().-]{7,}\d)/.test(attributeValues)) {
      addFailure(file, 'analytics attributes contain a possible email address or telephone number');
    }
  }

  const requireAnalyticsId = (id, reason) => {
    if (!ids.includes(id)) addFailure(file, `missing analytics ID ${id} (${reason})`);
  };
  if (/class="site-header"/.test(html)) {
    requireAnalyticsId('header_home', 'shared home navigation');
    requireAnalyticsId('header_contact', 'shared primary CTA');
    for (const language of ['en', 'ro', 'ru']) requireAnalyticsId(`language_${language}`, 'language selector');
  }
  if (/id="projects"/.test(html)) {
    requireAnalyticsId('hero_start_project', 'home hero CTA');
    requireAnalyticsId('hero_browse_work', 'home portfolio CTA');
  }
  if (/id="contact-form"/.test(html)) {
    requireAnalyticsId('contact_email', 'direct email contact');
    if (!/id="contact-form"[^>]*data-form-id="contact_form"[^>]*data-form-location="contact_page"/i.test(html)) {
      addFailure(file, 'contact form is missing stable form analytics attributes');
    }
  }
  for (const className of ['backlink', 'card', 'choice', 'svc', 'work-open', 'work-tile', 'tile', 'lg-item', 'vtile', 'shot']) {
    const interactive = new RegExp(`<(?:a|button)[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>`, 'gi');
    for (const tag of html.match(interactive) || []) {
      if (!/data-analytics-event=/i.test(tag) || !/data-analytics-id=/i.test(tag)) {
        addFailure(file, `${className} interaction is missing stable analytics attributes`);
        break;
      }
    }
  }

  if (/GTM-XXXXXXX|G-XXXXXXXXXX/.test(html)) {
    const message = 'placeholder analytics identifier remains in generated output';
    if (requireRealIds) addFailure(file, message);
    else warnings.push(`${file}: ${message}`);
  }
}

const analyticsRuntime = resolve(projectRoot, 'public/assets/js/analytics.js');
if (!existsSync(analyticsRuntime)) addFailure('public/assets/js/analytics.js', 'centralized analytics runtime is missing');
const consentRuntime = resolve(projectRoot, 'public/assets/js/consent.js');
if (!existsSync(consentRuntime)) addFailure('public/assets/js/consent.js', 'consent runtime is missing');

if (existsSync(analyticsRuntime)) {
  const source = readFileSync(analyticsRuntime, 'utf8');
  if (/gtag\s*\(\s*['"]event['"]/i.test(source)) addFailure('public/assets/js/analytics.js', "business events must not use gtag('event', ...)");
  if (/\.value\b/.test(source) && /contact_form|generate_lead/.test(source)) {
    addFailure('public/assets/js/analytics.js', 'analytics runtime appears to read a form value');
  }
}

const contactSourcePath = resolve(projectRoot, 'src/pages/contact.astro');
if (existsSync(contactSourcePath)) {
  const source = readFileSync(contactSourcePath, 'utf8');
  if (!/res\.ok\s*&&\s*String\(data\.success\)\s*===\s*['"]true['"]/.test(source)) {
    addFailure('src/pages/contact.astro', 'confirmed FormSubmit success condition is missing');
  }
  if (!/trackFormSuccess/.test(source)) {
    addFailure('src/pages/contact.astro', 'confirmed success is not connected to trackFormSuccess');
  }
  if (/data-analytics-event=["']generate_lead/i.test(source)) {
    addFailure('src/pages/contact.astro', 'generate_lead is wired to markup instead of confirmed success');
  }
}

const gtmImport = parseJson('gtm/almeron-gtm-container-import.json');
const gtmManifest = parseJson('gtm/gtm-entity-manifest.json');
const ga4Manifest = parseJson('ga4/ga4-configuration-manifest.json');
for (const path of [
  'gtm/IMPORT_INSTRUCTIONS.md',
  'tools/analytics/build-gtm-container.mjs',
  'tools/analytics/configure-ga4.mjs',
  'tools/analytics/package.json',
  'tools/analytics/.env.example',
  'ga4/GA4_SETUP.md',
  'docs/analytics-audit.md',
  'docs/analytics-event-spec.md',
  'docs/analytics-test-matrix.md',
  'docs/ANALYTICS_IMPLEMENTATION.md',
]) {
  if (!existsSync(resolve(projectRoot, path))) addFailure(path, 'required deliverable is missing');
}

const requiredEvents = [
  'cta_click',
  'navigation_click',
  'contact_click',
  'select_content',
  'faq_open',
  'contact_form_start',
  'contact_form_submit_attempt',
  'contact_form_error',
  'generate_lead',
  'language_change',
  'consent_update',
];
const requiredVariables = [
  'site_section',
  'site_language',
  'element_id',
  'element_type',
  'element_location',
  'form_id',
  'form_location',
  'error_type',
  'field_name',
  'previous_language',
  'selected_language',
  'method',
  'link_url',
  'content_type',
  'content_id',
  'consent_action',
  'consent_analytics',
  'consent_ads',
];

if (gtmImport?.containerVersion) {
  const version = gtmImport.containerVersion;
  const tags = version.tag || [];
  const triggers = version.trigger || [];
  const variables = version.variable || [];
  if (!tags.some((tag) => tag.type === 'googtag' && tag.name === 'Google Tag - Almeron GA4')) {
    addFailure('gtm/almeron-gtm-container-import.json', 'native Google Tag is missing');
  }
  if (tags.some((tag) => tag.type === 'html')) {
    addFailure('gtm/almeron-gtm-container-import.json', 'Custom HTML tags are not allowed');
  }
  for (const eventName of requiredEvents) {
    if (!triggers.some((trigger) => trigger.name === `CE - ${eventName}`)) {
      addFailure('gtm/almeron-gtm-container-import.json', `trigger CE - ${eventName} is missing`);
    }
    if (!tags.some((tag) => tag.type === 'gaawe' && tag.name === `GA4 Event - ${eventName}`)) {
      addFailure('gtm/almeron-gtm-container-import.json', `native GA4 Event tag for ${eventName} is missing`);
    }
  }
  for (const variableName of requiredVariables) {
    if (!variables.some((variable) => variable.name === `DLV - ${variableName}`)) {
      addFailure('gtm/almeron-gtm-container-import.json', `DLV - ${variableName} is missing`);
    }
  }
}

if (gtmManifest) {
  for (const eventName of requiredEvents) {
    if (!gtmManifest.eventToTagMappings?.some((mapping) => mapping.event === eventName)) {
      addFailure('gtm/gtm-entity-manifest.json', `event mapping for ${eventName} is missing`);
    }
  }
}

if (ga4Manifest) {
  for (const parameterName of requiredVariables.slice(0, 11)) {
    if (!ga4Manifest.customDimensions?.some((dimension) => dimension.parameterName === parameterName)) {
      addFailure('ga4/ga4-configuration-manifest.json', `custom dimension ${parameterName} is missing`);
    }
  }
  const keyEvents = ga4Manifest.keyEvents || [];
  if (keyEvents.length !== 1 || keyEvents[0]?.eventName !== 'generate_lead') {
    addFailure('ga4/ga4-configuration-manifest.json', 'generate_lead must be the only configured key event');
  }
}

console.log(`Analytics validation inspected ${htmlFiles.length} HTML document(s) in ${htmlRoot}.`);
if (warnings.length) {
  console.warn(`Warnings (${warnings.length}):`);
  for (const warning of warnings.slice(0, 20)) console.warn(`  - ${warning}`);
  if (warnings.length > 20) console.warn(`  - … ${warnings.length - 20} more`);
}
if (failures.length) {
  console.error(`Failures (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log('Analytics static validation passed.');
}

// Static checks for the fixes from the 2026-09-27 site audit (docs/audit/2026-09-27/).
// Runs against the production build: `npm run build:web` writes ../web, which is what
// gets deployed. Usage: node tools/audit/check-dist.mjs [--html-dir ../web]
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const dirArg = args.indexOf('--html-dir');
const root = resolve(dirArg >= 0 ? args[dirArg + 1] : '../web');
const failures = [];
const fail = (rule, where, msg) => failures.push(`[${rule}] ${where}: ${msg}`);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

if (!existsSync(root)) {
  console.error(`No build at ${root}. Run \`npm run build:web\` first.`);
  process.exit(1);
}

const read = (p) => readFileSync(p, 'utf8');
const pages = walk(root)
  .filter((p) => p.endsWith('.html') && !p.includes(`${join('assets', '')}`))
  .map((p) => ({ file: relative(root, p).replaceAll('\\', '/'), html: read(p) }));
const isRedirect = (html) => /http-equiv="refresh"/i.test(html);
const isNoindex = (html) => /<meta name="robots" content="[^"]*noindex/i.test(html);
const indexable = pages.filter((p) => !isRedirect(p.html) && !isNoindex(p.html) && p.file !== '404.html');

// --- SEO (phase 5) ---
const robots = join(root, 'robots.txt');
if (!existsSync(robots) || !/^Sitemap: https:\/\/design\.marketing-solutions\.ro\/sitemap-index\.xml$/m.test(read(robots)))
  fail('seo', 'robots.txt', 'missing or has no Sitemap line');

const sitemapFiles = walk(root).filter((p) => /sitemap-\d+\.xml$/.test(p));
const sitemapUrls = sitemapFiles.flatMap((p) => [...read(p).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
for (const u of sitemapUrls) {
  const path = new URL(u).pathname;
  const page = pages.find((p) => `/${p.file}` === `${path}index.html` || `/${p.file}` === path);
  if (!page) fail('seo', 'sitemap', `${u} has no built page`);
  else if (isRedirect(page.html) || isNoindex(page.html)) fail('seo', 'sitemap', `${u} is a redirect/noindex page`);
}
if (sitemapUrls.length && !sitemapFiles.some((p) => /<lastmod>/.test(read(p)))) fail('seo', 'sitemap', 'no <lastmod>');

for (const { file, html } of pages) {
  for (const [, href] of html.matchAll(/<a\b[^>]*\shref="(\/[^"]*)"/g)) {
    const path = href.split(/[?#]/)[0];
    if (path && !path.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(path)) fail('seo', file, `internal link without trailing slash: ${href}`);
  }
}

for (const { file, html } of indexable) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) fail('seo', file, 'no JSON-LD');
  for (const [, json] of blocks) {
    try { JSON.parse(json); } catch (e) { fail('seo', file, `invalid JSON-LD: ${e.message}`); }
  }
  const title = (html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '').replaceAll('&amp;', '&');
  if (title.length < 30 || title.length > 70) fail('seo', file, `title length ${title.length}: "${title}"`);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  if (desc.length < 110 || desc.length > 170) fail('seo', file, `description length ${desc.length}`);
}
const nf = pages.find((p) => p.file === '404.html');
if (nf && !isNoindex(nf.html)) fail('seo', '404.html', 'missing noindex');
for (const f of ['llms.txt', '.well-known/security.txt'])
  if (!existsSync(join(root, f))) fail('seo', f, 'missing');
if (existsSync(join(root, 'llms.txt'))) {
  for (const [, u] of read(join(root, 'llms.txt')).matchAll(/\((https:\/\/design\.marketing-solutions\.ro[^)]*)\)/g)) {
    const page = pages.find((p) => `/${p.file}` === `${new URL(u).pathname}index.html`);
    if (!page) fail('seo', 'llms.txt', `${u} has no page`);
    else if (isRedirect(page.html)) fail('seo', 'llms.txt', `${u} is a redirect stub`);
  }
}
for (const { file, html } of pages.filter((p) => p.file.includes('/portfolio/store/'))) {
  // The marquee repeats each screenshot; one described copy per image is enough.
  const described = new Set([...html.matchAll(/<img src="([^"]+)" alt="[^"]+"/g)].map((m) => m[1]));
  const all = new Set([...html.matchAll(/<img src="([^"]+_thumbs[^"]+\/store\/[^"]+)" alt="[^"]*"/g)].map((m) => m[1]));
  const missing = [...all].filter((src) => !described.has(src)).length;
  if (missing) fail('seo', file, `${missing} store images without any alt text`);
}

// --- Consent and a11y markup (phase 3; translations are covered by test-i18n.mjs) ---
for (const { file, html } of pages.filter((p) => !isRedirect(p.html))) {
  const consent = html.match(/<section class="consent-banner"[\s\S]*?<\/dialog>/)?.[0] ?? '';
  if (/<h2\b/.test(consent)) fail('a11y', file, 'consent UI uses <h2> before the page <h1>');
  if (!/<a class="skip" href="#main"/.test(html) || !/<main\b[^>]*\sid="main"/.test(html)) fail('a11y', file, 'no skip link to #main');
}

// --- Performance and privacy (phase 4) ---
for (const { file, html } of pages) {
  if (/fonts\.googleapis\.com/.test(html)) fail('perf', file, 'Google Fonts loaded from Google');
  if (/googletagmanager\.com\/ns\.html/.test(html)) fail('privacy', file, 'GTM noscript iframe bypasses consent');
  for (const js of ['analytics.js', 'consent.js'])
    if (html.includes(`/assets/js/${js}"`)) fail('perf', file, `${js} has no cache-busting ?v=`);
  const pool = html.match(/<script type="application\/json" id="hc-vpool"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (pool && /1x1\.mp4|1080x1080\.mp4/i.test(pool)) fail('perf', file, 'hero plays full-size square videos');
  const originals = [...html.matchAll(/assets\/(?!_thumbs\/)[^"'\s]+?\.(?:jpe?g|png)(?=["'\s?])/gi)]
    .map((m) => decodeURIComponent(m[0]))
    .filter((p) => !/og-card\.png|favicon|apple-touch|ms-mark/i.test(p));
  if (originals.length) fail('perf', file, `${originals.length} original JPG/PNG served (e.g. ${originals[0]})`);
}

const byRule = failures.reduce((m, f) => ((m[f.slice(1, f.indexOf(']'))] ??= []).push(f), m), {});
for (const [rule, list] of Object.entries(byRule)) {
  console.log(`\n${rule}: ${list.length} failure(s)`);
  for (const f of list.slice(0, process.env.ALL ? 1e9 : 8)) console.log(`  ${f}`);
  if (list.length > 8) console.log(`  … ${list.length - 8} more`);
}
console.log(`\n${pages.length} HTML files in ${root}: ${failures.length ? `${failures.length} failure(s)` : 'all audit checks passed'}.`);
process.exitCode = failures.length ? 1 : 0;

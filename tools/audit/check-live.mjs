// Live checks for the server-side fixes from the 2026-09-27 audit (see
// docs/audit/2026-09-27/SERVER-TICKET.md). Run after every deploy:
//   node tools/audit/check-live.mjs [https://design.marketing-solutions.ro]
const site = (process.argv[2] || 'https://design.marketing-solutions.ro').replace(/\/$/, '');
const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });

const nf = await fetch(`${site}/audit-check-${Date.now()}/`);
const nfHtml = await nf.text();
check('404 uses the site page', nf.status === 404 && !/hestia|Error Code/i.test(nfHtml) && /Marketing Solutions/.test(nfHtml),
  `status ${nf.status}, title "${nfHtml.match(/<title>([^<]*)/)?.[1]}"`);

const home = await fetch(`${site}/`, { headers: { 'Accept-Encoding': 'br, gzip' } });
const h = (k) => home.headers.get(k);
for (const [header, pattern] of [
  ['strict-transport-security', /max-age=\d{7,}/],
  ['x-content-type-options', /nosniff/],
  ['referrer-policy', /strict-origin-when-cross-origin/],
  ['permissions-policy', /camera=\(\)/],
  ['content-security-policy', /frame-ancestors 'none'/],
]) check(`header ${header}`, pattern.test(h(header) || ''), h(header) || 'missing');
check('brotli', h('content-encoding') === 'br', h('content-encoding') || 'none');

const robots = await (await fetch(`${site}/robots.txt`)).text();
check('robots.txt from repo', /^Sitemap: /m.test(robots) && !/hestiacp/i.test(robots), robots.split('\n')[0]);

const js = await fetch(`${site}/assets/js/consent.js`, { method: 'HEAD' });
check('unhashed JS not cached for years', !/max-age=3\d{8}/.test(js.headers.get('cache-control') || ''), js.headers.get('cache-control') || 'none');

// Every thumbnail a brandbook page references must exist (was 44 × 404 on 2026-09-27).
const sitemap = await (await fetch(`${site}/sitemap-0.xml`)).text();
const bookPages = [...sitemap.matchAll(/<loc>([^<]*\/brandbook\/)<\/loc>/g)].map((m) => m[1]);
let missing = 0, total = 0;
for (const page of bookPages) {
  const html = await (await fetch(page)).text();
  for (const [, src] of html.matchAll(/src="(\/assets\/_thumbs\/[^"]+)"/g)) {
    total++;
    if ((await fetch(site + src, { method: 'HEAD' })).status !== 200) missing++;
  }
}
check('brandbook thumbnails', total > 0 && missing === 0, `${missing} of ${total} missing on ${bookPages.length} pages`);

for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name} — ${r.detail}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${site}: ${failed ? `${failed} check(s) failing` : 'all live checks passed'}.`);
process.exitCode = failed ? 1 : 0;

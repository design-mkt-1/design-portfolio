// Build-time localization: after `astro build`, every English page gets real
// /ro/ and /ru/ copies (lang, text, title, links, canonical, sitemap), so the
// Romanian and Russian versions are crawlable HTML instead of a client-side
// swap on ?lang=. The rules are the ones Base.astro used in the browser:
// text nodes and aria-labels matched by their English value in STRINGS,
// [data-i18n] / [data-i18n-ph] by key, the <title> by longest phrases first.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, render, walkSync, ELEMENT_NODE, TEXT_NODE } from 'ultrahtml';
import { STRINGS } from '../i18n/ui.ts';

const LANGS = { ro: { idx: 1, locale: 'ro_RO' }, ru: { idx: 2, locale: 'ru_RU' } };
const OG_LOCALES = ['en_US', 'ro_RO', 'ru_RU'];

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", '#x27': "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|apos|#39|#x27|nbsp);/g, (_, e) => ENTITIES[e]);
const encodeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const encodeAttr = (s) => encodeText(s).replace(/"/g, '&quot;');

const byEn = {};
const byKey = {};
for (const [key, row] of Object.entries(STRINGS)) {
  byEn[norm(row[0])] ??= row; // first row wins, as in Base.astro
  byKey[key] = row;
}
const phrases = Object.keys(byEn).sort((a, b) => b.length - a.length);

function walkHtml(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkHtml(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

export default function localize({ origin, base }) {
  const basePath = base.replace(/\/$/, ''); // '' or '/design-portfolio'
  // A page path (not an asset) inside the site, e.g. /winboss/portfolio/.
  const isPage = (p) =>
    p.startsWith(`${basePath}/`) &&
    !/^\/(assets|_astro)\//.test(p.slice(basePath.length)) &&
    !/\/(ro|ru)\//.test(`${p.slice(basePath.length)}/`.slice(0, 4)) &&
    !/\.[a-z0-9]{2,5}$/i.test(p.split(/[?#]/)[0]);
  const localizePath = (p, lang) => (isPage(p) ? `${basePath}/${lang}${p.slice(basePath.length)}` : p);
  const localizeUrl = (u, lang) => {
    if (u.startsWith(origin)) {
      const path = u.slice(origin.length) || '/';
      return isPage(`${basePath}${path}`) ? `${origin}/${lang}${path}` : u;
    }
    return u.startsWith('/') ? localizePath(u, lang) : u;
  };

  function transform(html, lang) {
    const { idx, locale } = LANGS[lang];
    const tr = (en) => (byEn[en] ? byEn[en][idx] : undefined);
    const doc = parse(html);
    let title = '';
    const inRaw = (node) => {
      for (let p = node.parent; p; p = p.parent) if (p.type === ELEMENT_NODE && /^(script|style)$/.test(p.name)) return true;
      return false;
    };
    walkSync(doc, (node) => {
      if (node.type === TEXT_NODE) {
        if (inRaw(node) || node.parent?.name === 'title') return;
        const raw = node.value;
        const t = tr(norm(decode(raw)));
        if (t) node.value = raw.match(/^\s*/)[0] + encodeText(t) + raw.match(/\s*$/)[0];
        return;
      }
      if (node.type !== ELEMENT_NODE) return;
      const a = node.attributes;
      if (node.name === 'html') a.lang = lang;
      if (a['data-i18n'] && byKey[a['data-i18n']]) {
        node.children = [{ type: TEXT_NODE, value: encodeText(byKey[a['data-i18n']][idx]), parent: node }];
      }
      if (a['data-i18n-ph'] && byKey[a['data-i18n-ph']]) a.placeholder = encodeAttr(byKey[a['data-i18n-ph']][idx]);
      if (a['aria-label']) {
        const t = tr(norm(decode(a['aria-label'])));
        if (t) a['aria-label'] = encodeAttr(t);
      }
      if (node.name === 'title') {
        let t = decode(node.children.map((c) => c.value ?? '').join(''));
        for (const p of phrases) if (t.includes(p)) t = t.split(p).join(byEn[p][idx]);
        title = t;
        node.children = [{ type: TEXT_NODE, value: encodeText(t), parent: node }];
      }
      if (node.name === 'a' && a.href) a.href = localizePath(a.href, lang);
      if (a['data-work-href']) a['data-work-href'] = localizePath(a['data-work-href'], lang);
      if (node.name === 'link' && a.rel === 'canonical') a.href = localizeUrl(a.href, lang);
      if (node.name === 'meta') {
        if (a.property === 'og:url') a.content = localizeUrl(a.content, lang);
        if (a.property === 'og:locale') a.content = locale;
        if (a['http-equiv'] === 'refresh') a.content = a.content.replace(/url=(\S+)/, (_, u) => `url=${localizePath(u, lang)}`);
      }
      if (node.name === 'input' && a.name === '_next' && a.value) a.value = localizeUrl(a.value, lang);
      if (node.name === 'script') {
        const text = node.children[0];
        if (!text) return;
        if (a.type === 'application/ld+json') {
          // Organization and WebSite stay as they are; the page and its breadcrumb trail move.
          const data = JSON.parse(text.value);
          for (const n of data['@graph'] ?? []) {
            if (n['@type'] === 'WebPage') Object.assign(n, { '@id': localizeUrl(n['@id'], lang), url: localizeUrl(n.url, lang), name: title || n.name, inLanguage: lang });
            if (n['@type'] === 'BreadcrumbList') for (const item of n.itemListElement) item.item = localizeUrl(item.item, lang);
          }
          text.value = JSON.stringify(data);
        } else if (/location\.replace\(/.test(text.value)) {
          text.value = text.value.replace(/location\.replace\("([^"]+)"\)/, (_, u) => `location.replace("${localizePath(u, lang)}")`);
        }
      }
    });
    // og:locale:alternate lists the two other languages
    const others = OG_LOCALES.filter((l) => l !== locale);
    let alt = 0;
    walkSync(doc, (node) => {
      if (node.type === ELEMENT_NODE && node.name === 'meta' && node.attributes.property === 'og:locale:alternate') {
        node.attributes.content = others[alt++] ?? others[0];
      }
    });
    return render(doc);
  }

  return {
    name: 'localize',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const pages = walkHtml(out).filter((p) => {
          const rel = relative(out, p).split(sep).join('/');
          return !/^(ro|ru|assets|_astro)\//.test(rel);
        });
        for (const file of pages) {
          const rel = relative(out, file);
          const html = readFileSync(file, 'utf8');
          for (const lang of Object.keys(LANGS)) {
            const target = join(out, lang, rel);
            mkdirSync(dirname(target), { recursive: true });
            writeFileSync(target, await transform(html, lang));
          }
        }
        // Sitemap: each English <url> is followed by its RO and RU twins.
        for (const name of readdirSync(out).filter((n) => /^sitemap-\d+\.xml$/.test(n))) {
          const path = join(out, name);
          const xml = readFileSync(path, 'utf8').replace(/<url>([\s\S]*?)<\/url>/g, (block, inner) => {
            const loc = inner.match(/<loc>([^<]+)<\/loc>/)?.[1];
            if (!loc) return block;
            const twins = Object.keys(LANGS)
              .map((lang) => localizeUrl(loc, lang))
              .filter((u) => u !== loc && existsSync(join(out, new URL(u).pathname.slice(basePath.length), 'index.html')))
              .map((u) => block.replace(loc, u));
            return block + twins.join('');
          });
          writeFileSync(path, xml);
        }
        logger.info(`localized ${pages.length} pages into /ro/ and /ru/`);
      },
    },
  };
}

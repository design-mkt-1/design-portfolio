# Plan: corectarea tuturor problemelor din auditul din 27 septembrie 2026

## Context
Auditul din `docs/audit/2026-09-27/` a găsit 105 probleme în 6 zone. Acest plan le rezolvă pe toate. Deciziile tale:
- **Serverul (nginx, HestiaCP) îl administrează altcineva.** Tot ce ține de server merge într-un bilet pentru admin (Faza 1). Eu nu ating serverul.
- **GitHub Pages rămâne ca preview.** Primește canonical spre domeniul real și `noindex`, în loc să fie oprit.
- **Datele reale lipsesc încă** (datele firmei, cifrele de rezultat). Pagina de confidențialitate și studiile de caz sunt în Faza 8, **blocate** până vin datele. Până atunci H1 se reformulează fără „converts”.
- **Rutele statice `/ro/` și `/ru/` intră ca ultimă fază** (Faza 9).

Tot codul se lucrează pe `origin/main`. Copia locală e cu 6 commit-uri în urmă, iar numerele de linie de mai jos sunt citite de pe `origin/main`.

## Reguli globale
- Pas 0 obligatoriu: `git pull`, apoi `npm ci`. Acum `node_modules` lipsește și `npm run build` pică pe `sharp`.
- Un branch: `fix/audit-2026-09-27`, cu un commit pe fiecare task.
- Aceeași verificare la fiecare task: `npm run build`, apoi `npm run check` și `node tools/audit/check-dist.mjs` (vezi Task 0.2).
- Fără dependențe noi, cu o excepție: `@astrojs/check` (+ `typescript`, dacă îl cere) pentru `astro check`.
- Codul de runtime se refolosește: `url()` (`src/lib/site.ts`), `thumbFor`/`thumbDims` (`src/lib/thumbs.ts`), `projectSections`/`projectEntry` (`src/lib/portfolio.ts:260-277`), walker-ul i18n din `Base.astro:231-318`, pipeline-ul sharp din `scripts/gen-thumbs.mjs`, ffmpeg din `scripts/compress-videos.mjs`.
- Textele noi se adaugă în `STRINGS` (`src/i18n/ui.ts`) în toate 3 limbile. Tipul `[string,string,string]` forțează asta la compilare.

---

## Faza 0 — Bază de lucru
**0.1 Sincronizare și build.** Rulezi `git pull`, `npm ci` și `npm run build`, apoi notezi timpul de build și warning-urile ca referință.

**0.2 Un singur script de verificare, `tools/audit/check-dist.mjs`.** Folosește același tipar ca `tools/analytics/validate-implementation.mjs`: citește `dist/**/*.html` și rulează `assert` pentru fiecare regulă din fazele de mai jos. Fiecare task îi adaugă aserțiunile lui, iar scriptul pornește cu cele care pică azi. Exemple:
- `dist/robots.txt` există și conține `Sitemap:`.
- Nicio pagină cu `noindex` nu apare în `sitemap-0.xml`.
- Toate linkurile interne `href="/…"` se termină în `/`, sau în `#`, `?` ori extensie de fișier.
- Fiecare pagină are un `application/ld+json` valid.
- Consimțământul nu are `<h2>`.
- Fiecare text vizibil din `ConsentPreferences.astro` există ca valoare EN în `STRINGS`.

În `package.json` intră scripturile `"check": "astro check"` și `"test:audit": "node tools/audit/check-dist.mjs"`.

**0.3 Live-check după deploy, `tools/audit/check-live.mjs`.** Scriptul face fetch pe domeniul real și verifică:
- 404 pe o pagină inexistentă, cu `<title>` al site-ului;
- headerele de securitate;
- 0 thumb-uri de brandbook cu 404;
- `robots.txt` corect;
- Brotli activ.

Se rulează după fiecare deploy făcut de admin.

## Faza 1 — Bilet pentru admin (fără cod în repo)
Scriu fișierul `docs/audit/2026-09-27/SERVER-TICKET.md`, cu blocuri nginx gata de copiat. Fiecare punct are și comanda `curl` cu care se verifică.

| # | Ce | Config |
|---|---|---|
| 1 | Pagina 404 proprie | `error_page 404 /404.html;` |
| 2 | Headere de securitate | `Strict-Transport-Security "max-age=31536000"`, `X-Content-Type-Options nosniff`, `Referrer-Policy strict-origin-when-cross-origin`, `Permissions-Policy "camera=(), microphone=(), geolocation=()"`, `Content-Security-Policy "frame-ancestors 'none'"` (CSP completă după Faza 4, când fonturile devin locale) |
| 3 | Cache | `/_astro/` → `max-age=31536000, immutable`; `/assets/js/`, `*.html`, `/assets/_thumbs/manifest.json` → `no-cache` |
| 4 | Compresie | `brotli on;` pentru html/css/js/json/svg, dacă modulul există |
| 5 | Deploy complet | Upload `web/` cu ștergerea fișierelor vechi (rsync `--delete` sau echivalent). Cauza celor 44 de 404 la `_thumbs/*/brandbook/` și a lipsei `/winboss/brandbook/` din sitemap |
| 6 | robots.txt | Să nu mai fie generat de Hestia, ca să fie servit cel din repo (Task 5.1) |
| 7 | FormSubmit | În contul FormSubmit: restricție de domeniu sau referer, dacă există (aici decizi tu, nu admin-ul) |

## Faza 2 — Traduceri (i18n), toate S
Fișiere: `src/layouts/Base.astro`, `src/i18n/ui.ts`, `src/components/ConsentPreferences.astro`, `src/pages/index.astro`, `src/pages/[project]/portfolio/landings.astro`, `src/pages/contact.astro`, galeriile.

- **2.1 Potrivire toleranta la spații.** În `Base.astro:248` și la construirea `byEn` (235–240), textul se normalizează cu `s.replace(/\s+/g,' ').trim()`. Asta repară paragraful AI (`index.astro:326-327`) și orice alt text rupt pe mai multe rânduri.
- **2.2 Consimțământ.** Cele ~20 de texte din `ConsentPreferences.astro` (liniile 10–61) intră în `STRINGS` cu chei `consent.*` și `data-i18n` pe elemente.
- **2.3 `aria-label` și `title` traduse.** Atribut nou `data-i18n-aria="key"`, tratat în `apply()` lângă `data-i18n-ph` (liniile 278–280). Se aplică pe lightbox (Close, Previous, Next), pe `aria-label` din `Base.astro:124,134,157,187` și pe galerii.
- **2.4 Coliziunea „brands”.** `data-i18n="stat.brands"` pe etichetele de statistici din home (`index.astro:87-92`), ca `work.brands` („брендах”) să nu mai câștige în `byEn`.
- **2.5 Textul de la landing-uri.** Se aliniază `landings.astro:40` la `ui.ts:216-220` (varianta cu tablet).
- **2.6 Corecturi de text.**
  - RO `svc.sub` → „Tot ce îi trebuie unui brand de gambling…”
  - EN `banners.lede` → „Each tile shows the 1080×1080 version.”
  - RU `hint.spin` → „Нажмите на логотип, чтобы покрутить”
  - RU `contact.eyebrow` → „Напишите нам”, plus `data-i18n="contact.eyebrow"` la `contact.astro:23`
  - Majuscule firești în RO/RU: „Studio de creație iGaming”, „Portofoliu de design”, „Портфолио дизайна”
- **2.7 Glosar unic.** EN „Brand book” și „Landing pages”; RO „Landing-uri”; RU „Гайдлайн”. Toate rândurile din `ui.ts` se aliniază la el. Varianta „Creative in RO, EN and Worldwide” devine „…EN, RO and RU”.
- **2.8 `meta description` și `og:locale` pe client.** Se traduc în `apply()` cu chei `meta.<page>`. Rezolvarea definitivă vine în Faza 9.
- Test: aserțiune în `check-dist` că fiecare text din `ConsentPreferences` are cheie. Plus un test Playwright în `tools/audit/test-i18n.mjs`: `/?lang=ru` nu conține „Analytics preferences”, „AI is wired” sau „брендах”.

## Faza 3 — UI și accesibilitate, toate S
Fișiere: `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`, `ConsentPreferences.astro`, galeriile, `src/lib/lightbox.ts`.

- **3.1 Contrast.**
  - `--accent-fg` devine `#0b0b12` pe `.btn-primary` și `.header-cta`, ambele pe `var(--brand-gradient)`.
  - `--fg-dim` trece de la `#6f7283` la `#85889a` (`global.css:19`).
  - `.crumbs` pierde `opacity:0.6` (`Base.astro:347-355`) și ia culoarea `--fg-muted`.
- **3.2 Statistici.** Pe `.stat-n` se pune `aria-label={s.n}`, iar pe `.digit` și `.reel` `aria-hidden="true"` (`index.astro:101-150`).
- **3.3 Header mobil.** `.site-header:focus-within{transform:none}` în media query-ul de la `Base.astro:329-341`.
- **3.4 Skip link.** `<a class="skip" href="#main">`, vizibil doar la focus, plus `id="main"` pe `<main>`.
- **3.5 Selectorul de limbă.** `aria-pressed` setat în `apply()` și `min-height:44px`.
- **3.6 Ținte tactile de 44 px** pe `.backlink`, `.crumbs a`, `.footer-li`, `.work-open`, `.consent-settings`, `.spin-hint`.
- **3.7 Consimțământ.**
  - Accept și Reject primesc aceeași clasă `btn`.
  - `<h2>` devine `<p class="consent-title">`, cu același `id`, ca `aria-labelledby` să meargă mai departe.
  - La închidere, focusul se mută pe `#consent-settings`.
  - Pe mobil (`≤760px`, `global.css:369-386`) bannerul se face compact, ≤150 px: text scurt și butoanele pe un rând.
  - Pastila „Privacy settings” se mută în footer, iar pe paginile cu `noFooter` rămâne fixă doar când bannerul e închis.
- **3.8 Mișcare.**
  - Hover-urile cu transform intră în `@media (hover:hover) and (pointer:fine)`, plus `.btn:active{transform:scale(.97)}`.
  - Regula moartă `.btn-spin::before` (`global.css:229-236`) devine `.btn-spin{animation:none}`.
  - Marquee-ul AI se oprește la `:focus-within` și primește un buton pauză/play.
- **3.9 Lightbox.**
  - `role=tablist/tab` devine butoane cu `aria-pressed`.
  - Butoanele de mărime nu se mai recreează: `renderSizes` doar comută clasa (`MediaGallery:133-148`, `VideoGallery:120-136`). Asta repară și focusul pierdut.
- Test: `tools/audit/test-a11y.mjs` (Playwright). Verifică:
  - contrastul calculat pe `.btn-primary` ≥ 4.5;
  - Tab la 375 px nu ajunge pe elemente cu `y<0`;
  - ariaSnapshot pe `.stats` conține „9 brands”, nu „0 1 2 3”;
  - după Reject, `document.activeElement` nu e `BODY`.

## Faza 4 — Performanță și media
- **4.1 Clipuri mici pentru hero și CTA** (M).
  - `compress-videos.mjs` produce `hero-360.mp4` din clipul pătrat: `-vf scale=360:360 -crf 30 -an`, cu marcaj `ms-optimized`. Rulează local și în CI.
  - `projectVideos` expune `src.hero` când fișierul există.
  - `HeroCards.astro:37-38` și `CtaBanner.astro:26-27` folosesc `src.hero ?? src['1x1']`.
- **4.2 Hero.**
  - Pe mobil (`matchMedia('(hover:none)')`) sau cu `navigator.connection?.saveData` se afișează doar poster, fără video.
  - La `ended` rotația merge doar cât cardul e vizibil (IntersectionObserver) și se oprește după o tură completă (`HeroCards.astro:126-135`).
- **4.3 Imagini mari în lightbox** (M). Regulă nouă `lightbox: { width: 1920, quality: 80 }` în `gen-thumbs.mjs` (RULES, liniile 24–34), aplicată pe banner, landing și store. Iese în `_thumbs/lightbox/…webp`. Helper nou `lightboxFor(rel)` în `thumbs.ts`, construit pe același tipar ca `thumbFor`, cu fallback la original. Payload-urile din `MediaGallery:14-22`, `LandingsGallery:20` și `StoreGallery:36` îl folosesc.
- **4.4 `srcset`.** Treaptă nouă de 320 px în RULES pentru `banner` și `landing`, plus `srcset`/`sizes` pe tile-uri (`MediaGallery:54`, `LandingsGallery:47-51`, `VideoGallery:59`, `work/[format].astro`). `width` și `height` din `thumbDims` se pun și unde lipsesc (VideoGallery, StoreGallery).
- **4.5 Logo.** `marketing-solutions-logo.webp` (2048×1093) se exportă la 600 px lățime, cu `fetchpriority="high"` în hero.
- **4.6 Fonturi locale.** Archivo 700/800 și Space Grotesk 400/500/600 ca woff2 în `public/assets/fonts/`, cu `@font-face` și `font-display:swap`, plus `preload` pe cele două fișiere folosite în primul ecran. Link-ul Google Fonts (`Base.astro:102-107`) se scoate. Asta rezolvă și cererea către Google trimisă fără consimțământ.
- **4.7 Cache-busting.** `analytics.js` și `consent.js` primesc în `AnalyticsBody.astro` `?v=<hash-conținut>`, calculat la build cu `node:crypto`.
- **4.8** Blocul `<noscript>` GTM iese din `AnalyticsBody.astro:9-17`, pentru că trimitea date fără consimțământ.
- **4.9 Masterele JPG de peste 1 MB (253 MB).** După 4.3 nu mai sunt servite direct. Rămân în `public/` doar ca sursă pentru `gen-thumbs`; le mutăm abia după ce confirmi.
- Test: `check-dist` verifică că nicio pagină nu referă `1x1.mp4` în hero și că toate payload-urile de lightbox conțin `_thumbs/lightbox/`. Pe live, `check-live` verifică că home transferă sub 1,5 MB la load. Măsurătoarea se face ca în `02-performance.md`: Playwright, `encodedDataLength`.

## Faza 5 — SEO tehnic, S cu excepția 5.5
- **5.1 `public/robots.txt`:** `User-agent: *`, `Allow: /`, `Sitemap: https://design.marketing-solutions.ro/sitemap-index.xml`.
- **5.2 Sitemap.** `sitemap({ filter, serialize })` în `astro.config.mjs`. Filtrul exclude paginile redirect, adică slug-urile unde `projectSections(p).length===1` sau unde portofoliul are o singură opțiune; e aceeași condiție ca în `[project]/index.astro:81-83` și `portfolio/index.astro:82-83`, extrasă într-o funcție comună `redirectTarget(p)` în `portfolio.ts`. `serialize` adaugă `lastmod`.
- **5.3 Fără redirect-uri pe linkuri.**
  - `trailingSlash: 'always'`.
  - `url()` adaugă `/` la căile de pagină, adică fără extensie și fără `#`/`?` (`site.ts`).
  - Linkurile din home și `/work/*` duc direct la ținta finală, prin `projectEntry` (`portfolio.ts:269-277`).
  - Canonical-ul paginilor redirect primește `/` la final.
- **5.4 Preview-ul GitHub Pages.** Când `BASE_PATH` e `/design-portfolio`, `Base.astro` pune `<meta name="robots" content="noindex">`. Canonical-ul se construiește din `CANONICAL_ORIGIN` (default `https://design.marketing-solutions.ro`) plus calea fără `base`. Din `deploy.yml` iese branch-ul vechi `claude/marketing-solutions-portfolio-ghilve`.
- **5.5 JSON-LD** (M). În `Base.astro` intră un `@graph` cu:
  - `Organization` (name, url, logo, `sameAs` LinkedIn din footer);
  - `WebSite`;
  - `BreadcrumbList`, din prop-ul `crumbs` existent;
  - `CollectionPage` pe galerii.
- **5.6 Titluri și descrieri.** Titlurile au șablonul `{Brand} {Format} Design — iGaming {Piață} | Marketing Solutions` (50–60 de caractere), iar descrierile au 140–160 de caractere. Se scoate „store” dublat (`store.astro:22`). Piața vine din `geo` (`projects.ts`).
- **5.7 404 și `noindex`.** Prop nou `noindex` pe `Base`, folosit în `404.astro`.
- **5.8 Alt text.** Pozele din store primesc alt `"{campanie} — screenshot {n}"` (`StoreGallery:75`).
- **5.9 Fișiere și linkuri noi.** `public/llms.txt` și `public/.well-known/security.txt`. Linkuri `/work/*` în footer.
- Test: aserțiunile corespunzătoare în `check-dist`, plus un JSON-LD parsat cu `JSON.parse` pe fiecare pagină.

## Faza 6 — Curățenie în cod
- **6.1 Scripturi moarte.** Se șterg `scripts/gen-placeholders.mjs` (suprascrie PDF-urile reale) și `scripts/normalize-assets.mjs` (nereferit, stricat pe Windows), plus comentariul vechi din `projects.ts:1-10`.
- **6.2 O singură pagină de format.** `portfolio/{banners,landings,videos,store}.astro` devine un singur `[project]/portfolio/[format].astro`, cu o hartă format → {componentă, lede, titlu}. Rezultatul trebuie să fie același HTML: faci diff pe `dist` înainte și după, iar singurele diferențe acceptate sunt spațiile.
- **6.3 Cod mort și duplicat.**
  - Se scot ramura video din `MediaGallery` și `kind:'video'`.
  - `natural`, `IMG` și `bust` se mută într-un loc comun (`src/lib/site.ts`).
  - `MediaGallery:16` folosește `availableSizes(item)`.
  - Se scoate `cleanTitle` dublu din `VideoGallery:31`.
  - Se șterg `availableDevices`, `DEFAULT_LOCALE`, `LOCALE_NAME` și fallback-ul `SIZE_LABEL`; `storeTitle` devine un literal.
- **6.4 Cache pentru scanări.** Un `Map` pentru `projectLandings` și `storeGroups`, cum au deja banners și videos.
- **6.5 Cache-busting și avertismente.** `bust()` folosește `mtimeMs` în loc de mărimea fișierului. `projectLandings` dă `console.warn` pe fișierele care nu se potrivesc (`portfolio.ts:125-158`).
- **6.6 Mărunțișuri.**
  - Titlurile duplicate primesc sufix (`#2`).
  - `public/assets/README.md` se mută în `docs/`.
  - `gen_brandbook_covers.py:4-6` primește docstring corect.
  - `public/favicon.svg` se șterge dacă tot nu e referit.
- **6.7** Cele 9 `any` primesc tipuri, până când `astro check` iese fără erori.

## Faza 7 — Copy și conversie (S, cu textele aprobate de tine)
- **7.1 CTA pe toate paginile.** `<CtaBanner />` intră pe `[project]/index.astro` (varianta non-redirect) și pe `work/[format].astro`. Plus un link text „Discută un proiect →” sub secțiunea servicii din home.
- **7.2 H1 și poziționare.** H1 se reformulează fără „converts” până vin cifrele. Propun „Creative for casino & sportsbook brands.” și 2 variante de ales. Varianta de logo fără tagline în hero.
- **7.3 Cifre consecvente.**
  - „10+ markets” devine lista reală de piețe (4 numite) sau cifra reală.
  - Echipa: „15” peste tot.
  - „Worldwide” se scoate din lista de limbi.
- **7.4 Contact.**
  - Lede cu termen de răspuns. **Am nevoie de termenul real de la tine.**
  - Placeholder: „brand, piață, termen, buget”.
  - Mesajul de succes primește link spre lucrări.
  - Filtrul de 3 s (`contact.astro:109`) afișează „Se trimite…” și reîncearcă, în loc să iasă fără niciun mesaj.
- **7.5 Copy care sună generic.** „design wizards”, „wired into our pipeline” și similarele devin fapte concrete. Îți dau textele la aprobat înainte de commit.

## Faza 8 — BLOCAT până vin datele
- **8.1 `/privacy/`** în EN/RO/RU. Conține: operatorul (datele firmei), scopurile, Google Analytics și FormSubmit (SUA), retenția `_ga` de 400 de zile, drepturile GDPR. Link din banner, din footer și dintr-o notă sub butonul formularului.
- **8.2 Consimțământ.** Trecerea de la granted la denied șterge `_ga*`. Preferința se salvează cu `ts` și se reconfirmă după 12 luni (`consent.js`). `cookie_domain` devine `design.marketing-solutions.ro`, în manifestul GTM (`gtm/gtm-entity-manifest.json`), plus `npm run build:gtm`. Acest punct nu depinde de date și se poate muta mai devreme.
- **8.3 Studii de caz.** 2–3 mini-studii cu o cifră reală fiecare, plus citate de la clienți. După asta H1 poate reveni la „converts”.

## Faza 9 — Rutele `/ro/` și `/ru/` (L)
- **9.1** Helper `t(key, lang)` pe server, peste `STRINGS`, plus `getStaticPaths` cu `lang ∈ {en, ro, ru}`. EN rămâne la rădăcină, iar RO/RU primesc prefix (`/ro/winboss/`). Paginile existente se mută sub `src/pages/[...lang]/`. Alternativa e un wrapper, dacă `[...lang]` intră în conflict cu `[project]`; decizia se ia după un spike de 1 oră.
- **9.2** `Base` primește `lang`, iar `<html lang>`, title, description, `og:locale` și canonical vin din server. Hreflang e reciproc și are `x-default`. `sitemap({ i18n })` primește toate cele 3 limbi.
- **9.3** Selectorul de limbă devine linkuri între rute, iar walker-ul client din `Base.astro:231-318` se scoate. Pentru linkuri vechi, `?lang=ro` redirecționează pe client spre `/ro/…`.
- **9.4** Textele care azi sunt traduse doar prin potrivire de text trec pe `t()`: titluri de pagină, lede-uri, galerii.
- Test: `check-dist` verifică că fiecare pagină din `dist/ro/**` are `lang="ro"`, canonical propriu și 3 hreflang reciproce, iar sitemap-ul are URL-uri în toate cele 3 limbi. Pe live, `check-live` verifică `/ro/` (200, `lang="ro"`).

---

## Ordine și execuție
**Faza 1** (biletul pentru admin) pleacă prima și în paralel, pentru că nu depinde de cod.

**Codul** merge secvențial, pentru că fazele 2, 3 și 5 ating toate `Base.astro`:

0 → 2 → 3 → 5 → 4 → 6 → 7 → 9. Faza 8 intră când vin datele.

Recomand execuție **nativă** (implementez eu fiecare task), cu review pe tot branch-ul la final. Motivul: aproape toate taskurile ating aceleași 3–4 fișiere, așa că workerii în paralel ar intra în conflict.

## Verificare end-to-end
1. După fiecare task: `npm run build`, `npm run check` și `npm run test:audit` trec, iar testele Playwright din fază trec.
2. La final: diff vizual prin screenshot-uri la 375, 768 și 1440 px pe cele 10 pagini din auditul 01, înainte și după. Plus `npm run test:analytics`, ca analytics să nu se fi stricat.
3. După deploy-ul făcut de admin: `node tools/audit/check-live.mjs` și reverificarea top 10 din `SUMMARY.md` pe site-ul live.
4. Numerele de referință:

| Metrică | Acum | Țintă |
|---|---|---|
| Transfer home | 5,2 MB | < 1,5 MB |
| Thumb-uri brandbook cu 404 | 44 | 0 |
| Contrast CTA | 2,16:1 | ≥ 4,5:1 |
| Pagini noindex în sitemap | 10 | 0 |
| JSON-LD | 0 / 42 pagini | 42 / 42 pagini |

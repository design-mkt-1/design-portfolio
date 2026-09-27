# Audit performanță — design.marketing-solutions.ro (2026-09-27)

Metodă: Playwright (Chrome, CDP `encodedDataLength`) pe live, desktop 1440×900 + mobil 390×844 DPR3; per rută: load + 4s, apoi scroll complet + 4s; LCP/CLS prin PerformanceObserver; `naturalWidth` vs lățime afișată; `curl -I` pe HTML/CSS/JS/img/mp4; `find public -printf %s` (top 20); citit `scripts/gen-thumbs.mjs`, `src/lib/thumbs.ts`, componentele galeriilor.

Măsurători brute (desktop, după scroll):

| Rută | Req | Transfer | LCP | CLS |
|---|---|---|---|---|
| `/` | 46 | 9285 KB (5241 KB înainte de scroll) | 1364 ms (logo) | 0.0002 |
| `/` mobil | 39 | 5532 KB (5229 KB înainte de scroll) | 940 ms | 0 |
| `/winboss/portfolio/` | 66 | 3081 KB | 424 ms (text) | 0.0004 |
| `/winboss/portfolio/banners/` | 52 | 2135 KB | 1304 ms | 0.0005 |
| `/winboss/portfolio/videos/` | 36 | 4831 KB | 1324 ms | 0.0005 |
| `/work/banners/` | 131 | 5429 KB | 632 ms | 0.0004 |
| `/work/videos/` | 35 | 1255 KB | 596 ms | 0.0004 |
| `/fansport/` | 21 | 733 KB | 436 ms | 0.0003 |
| `/contact/` | 12 | 294 KB | 400 ms | 0.0003 |

| Gravitate | Problemă | Dovadă | Fix propus | Efort |
|---|---|---|---|---|
| critica | Home descarcă 2 MP4 1080×1080 la load pentru carduri de ~100–220 px; pe mobil 4,6 MB din 5,2 MB inițial | `/` mobil: `26447 - Mrs. Win VIP/1080x1080.mp4` 2473 KB + `28442 - NinjaGaming/1080x1080.mp4` 2167 KB, faza `load`; `videoWidth 1080`, afișat 222×211 / 191×170 (desktop). `HeroCards.astro:120-124` setează `v.src` + `play()` după load; `preload="none"` (`:58`) nu ajută | Variante mici dedicate hero (ex. 360×360, ~300–500 KB, fără audio) generate în `gen-thumbs` / `compress-videos`; pe mobil (`hover: none` sau `navigator.connection.saveData`) doar poster | M |
| mare | Hero video rotește la infinit: la `ended` încarcă alt clip 2–4 MB, fără limită | `HeroCards.astro:125-133` (`ended` → `playIdx` nou din `vpool`); home desktop Media 8219 KB după scroll | Limită (ex. 1 rotație) sau oprire când cardul iese din viewport (IntersectionObserver) | S |
| mare | Lightbox deschide originale uriașe JPG; cel mai mare 12 MB, 3840×10268 px | `curl -I .../max-win/landings/14302%20-%20Tournament%20Prizes/desktop.jpg` → `Content-Length: 12565504`; linkul e în HTML `/max-win/portfolio/landings/`. `1920px (Desktop).jpg` fansport 28406: 5,1 MB, 1920×3545 | Variantă lightbox WebP/AVIF, lățime max 1920 (desktop) / 1080 (mobil), q~80; originalul doar la download explicit | M |
| mare | 144 JPG >1 MB în `public/assets`, total 253 MB; JPG = 308 MB din 690 MB | `find -iname '*.jpg' -size +1M` → 144 fișiere, 253 MB; top: `max-win/.../desktop.jpg` 12,0 MB, `fansport/.../1920px (Desktop).jpg` 5,1 MB, `winboss/store/28538 - Summerish Store/6.jpg` 3,6 MB | Script unic de normalizare (sharp deja folosit în `gen-thumbs.mjs`) → WebP max 1920w; păstrează masterele în afara `public/` | M |
| mare | MP4 grele: 70 fișiere, 329 MB, medie 4,7 MB; top 12,1 MB | `27171 - Splash Move/1080-1920.mp4` 12,1 MB, `1920-1080.mp4` 12,0 MB, `27478 - DynamicBass/1920-1080.mp4` 11,1 MB | Re-encode H.264 CRF 26–28 / `-movflags +faststart` sau AV1/VP9 fallback (există `scripts/compress-videos.mjs` — verificat doar că există, nu dacă a rulat pe toate) | M |
| medie | Thumb-uri 640 px fără `srcset`; afișate la 120–165 px (4–5×) | `/winboss/portfolio/`: `28569 - 4Cards/1080x1080.webp nat 640x640 disp 120x120`; `/work/banners/`: `disp 152x152` desktop, `165x165` mobil; 160/161 img oversize pe `/work/banners/` | A doua treaptă (ex. 320 px) în `RULES` + `srcset`/`sizes` în `MediaGallery.astro:54`, `VideoGallery.astro:59` | S |
| medie | Logo LCP 2048×1093 px afișat la 157×84 | `public/assets/marketing-solutions-logo.webp` 2048x1093, 60182 B; hero `img` 157×84 (desktop); LCP `/` = acest fișier, 1364 ms desktop | Export 400–600 px lățime (sau SVG), `fetchpriority="high"` pe logo-ul din hero (`index.astro:58`) | S |
| medie | Toate linkurile interne fără slash final → 301 la fiecare navigare | HTML home: `href="/contact"`, `href="/work/banners"`; `curl -I /contact` → `301 Location: .../contact/` (la fel `/work/banners`, `/winboss/portfolio`, `/bet2fun`) | `trailingSlash: 'always'` în `astro.config.mjs` + helper `url()` cu `/` final, sau nginx `try_files $uri $uri/index.html` fără redirect | S |
| medie | Google Fonts: CSS extern render-blocking, 10 greutăți cerute, 5 folosite | `renderBlockingStatus=blocking`: `fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Space+Grotesk:wght@300;400;500;600;700` responseEnd 422 ms; `document.fonts` loaded: Archivo 700/800, Space Grotesk 400/500/600 (home) | Self-host woff2 variable (Archivo + Space Grotesk) cu `preload`, `font-display: swap`; taie greutățile nefolosite | S |
| medie | Cache 10 ani pe fișiere fără hash → update-uri invizibile | `curl -I /assets/js/analytics.js` → `Cache-Control: max-age=315360000`; la fel `/assets/_thumbs/manifest.json`, `/favicon.svg`, mp4. Nume fixe (`analytics.js`, `consent.js`) | `/_astro/*` → `max-age=31536000, immutable`; `/assets/js/*` → `no-cache` (ETag deja există) sau mută în bundle Astro cu hash | S |
| medie | Fără Brotli; doar gzip | `curl -H 'Accept-Encoding: br' /` → 56947 B necomprimat; gzip → 11467 B | `brotli on; brotli_types text/css application/javascript application/json image/svg+xml` în nginx (dacă modulul e disponibil) | S |
| medie | Video în CTA banner home 3,5 MB la scroll | `/` desktop: `27937 - 3Games/1080x1080.mp4` 3579 KB faza `scroll`; `CtaBanner.astro:39` `data-src` 1×1 original | Aceeași variantă mică ca la hero | S |
| mica | GTM 124 KB pe fiecare pagină, cel mai mare fișier non-media | `gtm.js?id=GTM-5CRD484Z` 124 KB pe toate rutele (Script total 133 KB) | Încarcă GTM după consimțământ / `requestIdleCallback`; verifică tag-uri nefolosite | S |
| mica | Thumb landing 430×1400 afișat 111×363 (mobil) / 185×603 (desktop) | `/fansport/`: `28406 - New Year Sport/430px (Mobile 2).webp` 93 KB, `nat 430x1400 disp 111x363` | Include în treapta mică `srcset` de mai sus | S |
| mica | `<img>` fără `width`/`height` în mai multe galerii (CLS rămâne ~0 datorită CSS) | `/winboss/portfolio/`: 87/87 img fără atribute; `VideoGallery.astro:59` fără `width/height`; CLS măsurat 0.0004 | `thumbDims()` există deja în `thumbs.ts` — pasează-l și în `VideoGallery`/`StoreGallery` unde lipsește | S |
| mica | `brandbook.css` încărcat pe home și contact | home: `<link rel="stylesheet" href="/_astro/brandbook.p4tERHJT.css">`; 2 CSS blocking, 218 ms | Neglijabil (6 KB total CSS); verifică doar dacă e chunk comun intenționat | S |

## Ce merge bine
- Pipeline thumb-uri folosit efectiv: `thumbFor()` în `LandingsGallery`, `MediaGallery`, `StoreGallery`, `VideoGallery`, `HeroCards`, `CtaBanner`; live servește `/assets/_thumbs/.../*.webp` (86/87 img WebP pe `/winboss/portfolio/`).
- CLS ~0 pe toate rutele (max 0.0005 desktop, 0 mobil).
- Lazy loading: 159/161 img `loading="lazy"` pe `/work/banners/`; `/work/videos/` nu descarcă niciun MP4 (1255 KB total).
- TTFB ~110 ms, FCP 372–416 ms pe paginile interioare; HTTP/2 activ (ALPN `h2`), gzip pe HTML (56947 → 11467 B).
- `prefers-reduced-motion` oprește video-urile hero (`HeroCards.astro:76,112`).

## Rezumat
Paginile interioare sunt rapide (LCP 400–1300 ms, CLS ~0, thumb-uri WebP lazy). Problema mare e media: home descarcă 5,2 MB la load (4,6 MB = 2 MP4 1080² pentru carduri de 100 px), lightbox-ul servește JPG până la 12 MB, `public/` are 253 MB JPG >1 MB.
Prioritate: variante video mici pentru hero/CTA, lightbox WebP max 1920w, `srcset` 320 px, apoi fix-uri S de server (slash, Brotli, cache headers) și fonturi self-hosted.

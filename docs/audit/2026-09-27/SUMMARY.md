# Audit site — design.marketing-solutions.ro (2026-09-27)

Auditul a fost făcut de 6 workeri Claude prin orchestrare Orca (run `run_725c4cef3670`), câte unul pe fiecare zonă. Au scris doar rapoarte, fără să modifice codul.
În total sunt 105 probleme: **3 critice, 21 mari, 42 medii, 39 mici**. Aproape toate fixurile sunt mici (efort S).

| Zonă | Raport | Critice | Mari | Medii | Mici |
|---|---|---|---|---|---|
| UI/UX + accesibilitate | [01-ui-ux-a11y.md](01-ui-ux-a11y.md) | 1 | 4 | 8 | 6 |
| Performanță | [02-performance.md](02-performance.md) | 1 | 4 | 7 | 4 |
| SEO + AI-SEO | [03-seo.md](03-seo.md) | 1 | 5 | 5 | 5 |
| Calitate cod | [04-code-quality.md](04-code-quality.md) | 0 | 1 | 9 | 11 |
| Copy + conversie | [05-copy-cro.md](05-copy-cro.md) | 0 | 5 | 9 | 9 |
| Securitate + confidențialitate | [06-security-privacy.md](06-security-privacy.md) | 0 | 2 | 4 | 4 |

## Top 10

Problemele care apăreau în mai multe rapoarte sunt comasate. Ordinea e după impact raportat la efort. „Reverificat” înseamnă că am refăcut verificarea după ce workerii au terminat, pe 2026-09-27.

| # | Problemă | Dovadă | Fix | Efort | Sursă |
|---|---|---|---|---|---|
| 1 | Paginile de brand book au imagini lipsă: 44 de miniaturi dau 404 | `/assets/_thumbs/topbet/brandbook/2.webp` → 404 (reverificat). `_thumbs/` e în gitignore și se generează doar în prebuild, deci deploy-ul a fost parțial | Reupload `public/assets/_thumbs/*/brandbook/` după un build complet, plus fallback `onerror` la original | S | 01 |
| 2 | URL-urile inexistente arată pagina 404 gri a panoului de hosting, nu 404-ul site-ului | `/nu-exista-xyz/` → `<title>Page Not Found` din HestiaCP (reverificat); `/404.html` există | nginx `error_page 404 /404.html;` | S | 01, 03, 04, 05 |
| 3 | Paginile RO/RU nu pot fi indexate | `/?lang=ro` → `<html lang="en">`, canonical `https://design.marketing-solutions.ro/` (reverificat). Traducerea se face doar în JS | Rute statice `/ro/` și `/ru/`, fiecare cu `lang`, title, description și canonical proprii | L | 03, 05 |
| 4 | Home descarcă 5,2 MB la încărcare. Din ei, 4,6 MB sunt două MP4 de 1080×1080 afișate în carduri de ~100–220 px | `26447 - Mrs. Win VIP/1080x1080.mp4` 2473 KB + `28442 - NinjaGaming` 2167 KB. Hero-ul încarcă la infinit clipuri noi de 2–4 MB | Clipuri mici de 360 px pentru hero; pe mobil doar poster; rotația se oprește când cardul iese din ecran | M | 02 |
| 5 | Nu există politică de confidențialitate sau de cookies. Formularul trimite nume, email și mesaj la FormSubmit (SUA) fără nicio informare | `/privacy/` → 404 (reverificat); `contact.astro` trimite la `formsubmit.co` | Pagină `/privacy/` în EN/RO/RU, cu link din banner, footer și formular | M | 06 |
| 6 | Lipsesc toate headerele de securitate | `curl -I /` nu are HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy (reverificat) | Se adaugă în template-ul de domeniu din nginx | S | 06 |
| 7 | Texte în engleză pe variantele RO/RU | Bannerul de consimțământ (16 texte), paragraful „AI is wired…” (un rând nou îl împiedică să se potrivească), subtitlul de la landing-uri (text diferit de cheie), „брендах” pe home RU | Chei noi în `ui.ts`, spațiile normalizate în funcția care caută traducerile, textul de la landing-uri aliniat cu cheia | S | 01, 04, 05 |
| 8 | Contrastul CTA-ului principal e sub pragul WCAG: text alb pe gradientul de brand | 2,16:1 pe `#23c6aa` și 3,24:1 pe `#4a92e0` la „Contact us” și „Start a project” | Text închis `#0b0b12` pe gradient (4,73–9,09:1) | S | 01 |
| 9 | Nimic nu susține promisiunea „Creative that converts players”, iar paginile de proiect și `/work/*` nu au niciun CTA spre contact | Pe home apar doar volume (9 branduri, 119+ bannere); 0 butoane „Start a project” pe `/winboss/` și `/work/banners/` | 2–3 mini studii de caz, fiecare cu o cifră reală; `<CtaBanner />` pe paginile de proiect și `/work/*` | M / S | 05 |
| 10 | Probleme de crawling (cum vede Google site-ul) | Oglinda github.io răspunde 200 și poate fi indexată (reverificat). În sitemap sunt 10 pagini redirect cu noindex, iar `/winboss/brandbook/` lipsește (reverificat). `robots.txt` e cel implicit din HestiaCP, cu `Crawl-delay: 10` și fără `Sitemap:` (reverificat). 37 din 38 de linkuri interne trec printr-un redirect 301 | Oprește Pages, filtrează sitemap-ul, adaugă `public/robots.txt`, setează `trailingSlash: 'always'` | S | 02, 03 |

De făcut curând:
- Lightbox-ul servește JPG-uri de până la 12 MB (reverificat: `Content-Length: 12565504`). În `public/` sunt 253 MB de JPG-uri, fiecare peste 1 MB.
- `scripts/gen-placeholders.mjs:213` suprascrie PDF-urile reale de brand book dacă e rulat (reverificat). Trebuie șters.
- Google Fonts și GTM se încarcă înainte de consimțământ. Fonturile trebuie găzduite local.

## Ce merge bine
- Consent Mode v2 funcționează corect: 0 cookies și 0 cereri `collect` înainte de Accept și după Reject.
- HTTPS e forțat, doar TLS 1.2/1.3, nimic expus (`/.git`, `package.json` și source maps dau 404).
- Fără scroll orizontal la 375, 768 și 1440 px. Lightbox-ul și dialogul funcționează bine de la tastatură.
- Paginile interioare sunt rapide: LCP 400–1300 ms, CLS aproape 0, miniaturi WebP încărcate lazy.
- Titlurile și descrierile sunt unice, iar canonicalul absolut pe EN e corect.

## Limite
- **Copia locală a repo-ului e cu 6 commit-uri în urma `origin/main`** (`git rev-list` → `0 6`). Site-ul live corespunde lui `origin/main` (Last-Modified 27 Jul 2026), deci problemele găsite pe site rămân valabile. Referințele `fișier:linie` din rapoarte sunt însă pe codul local vechi și pot fi decalate cu câteva linii în `Base.astro`, `HeroCards.astro`, galerii și `global.css`. Rulați `git pull` înainte de fixuri.
- `node_modules` lipsește, deci `npm run build`, `astro check` și warning-urile de build nu au fost măsurate. Rulați întâi `npm ci`.
- Neverificat: setările din contul GA4, indexarea în Search Console, `/.env` (blocat de hook-ul local care protejează secretele) și un POST de spam direct la FormSubmit.

## Ordinea propusă
1. Server și deploy (toate S): reupload complet `_thumbs`, `error_page`, headere de securitate, `robots.txt`, oprirea oglinzii github.io.
2. Fixuri mici în cod (S): chei i18n și funcția de potrivire, contrastul CTA, `aria-label` pe statistici, focusul în headerul mobil, filtrul de sitemap, slash-ul final.
3. Media (M): clipuri hero mici, lightbox WebP de maximum 1920 px, `srcset`.
4. Legal (M): pagina `/privacy/` și nota de sub formular.
5. Conținut și SEO (M/L): studii de caz cu cifre reale, JSON-LD, rute statice `/ro/` și `/ru/`.

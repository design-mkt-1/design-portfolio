# Handoff — site audit fixes (2026-09-27)

## State
- The full audit (`docs/audit/2026-09-27/`, 105 findings) is fixed in code, per
  `docs/superpowers/plans/2026-09-27-audit-fixes.md`. Branch
  `fix/audit-2026-09-27` was fast-forwarded into `main` locally: 12 commits,
  `dbf2326..2d24899`.
- **Pushed** (2026-09-27). The compress-videos CI committed the hero clips
  (`62b7190`, 23 `.mp4` in `public/assets/_hero/`). The Pages preview
  deployed. After `git pull`, `npm run build:web` and `npm run test:audit`
  → "129 HTML files in D:\web: all audit checks passed."
- The live site (https://design.marketing-solutions.ro/) still runs the old
  build. `node tools/audit/check-live.mjs` → 10 FAIL (2026-09-27).

## Next session
Work from `docs/superpowers/plans/2026-09-27-copy-meta-cases.md`: RO/RU meta
descriptions first, then the generic-copy rewrites (owner approves them), then
case studies (need the owner's data). Everything else is in `docs/backlog.md`.
The sections below are the original handoff. Steps 1–2 are done.

## How to build and check
```sh
npm ci
npx playwright install chromium   # once per machine, for the browser tests
npm run build:web                 # writes ../web, which is what gets deployed
npm run check                     # astro check: 0 errors expected
npm run test:audit                # i18n + a11y + consent + static checks
npm run test:analytics            # rewrites gtm/…import.json exportTime: git checkout gtm/ after
node tools/audit/check-live.mjs   # after a deploy
```
- `npm run build` without env vars builds the **GitHub Pages preview**
  (base `/design-portfolio`, noindex). Production is always `build:web`.
- Expected failure until CI runs: `check-dist` → "hero plays full-size square
  videos" (index, ro, ru).

## Next steps, in order
1. **Push `main`.** The push triggers `.github/workflows/compress-videos.yml`
   (its path filter now includes `scripts/compress-videos.mjs`), which cuts the
   360×360 hero clips into `public/assets/_hero/` and commits them. It also
   triggers the Pages preview deploy.
2. `git pull` (to get the hero clips), then `npm run build:web`. The hero
   check in `check-dist` should now pass.
3. **Hosting admin:** apply `docs/audit/2026-09-27/SERVER-TICKET.md`. This
   covers the 404 page, security headers, cache, brotli, and a full upload of
   `../web` with delete (which fixes the 44 missing brand book thumbnails and
   the stale `/winboss/brandbook/`) and robots.txt. Then run `check-live.mjs`.
4. **Blocked on the owner's data:**
   - `/privacy/` page in EN/RO/RU, which needs the company name, CUI, address
     and GDPR contact. Once it exists, link it from the consent banner, the
     footer and under the contact form (plan 8.1).
   - Case studies with real result numbers (plan 8.3).

## Open, not done
- 7.5: generic copy ("wired into our pipeline", "Campaign-speed turnaround"
  with no number). Propose rewrites to the owner before changing them.
- GA `cookie_domain`: `_ga` cookies are set on `.marketing-solutions.ro`.
  Changing that needs `gtm/gtm-entity-manifest.json`, then `npm run build:gtm`
  and a GTM re-import.
- GA4 account steps from the earlier session, still open: turn off Enhanced
  Measurement "form interactions"; replace the Property ID placeholder
  `123456789` and run `npm run configure:ga4:dry-run`; check Realtime.

## Things to know
- `src/integrations/localize.mjs` builds `/ro/` and `/ru/` from the English
  HTML after every build, using `STRINGS` (`src/i18n/ui.ts`). New visible text
  needs a `ui.ts` row, or it stays English on RO/RU. `test-i18n.mjs` fails if a
  dictionary value is left untranslated on a RO page.
- Keep markup text and `ui.ts` English values identical, or use `data-i18n`.
  Phase 2 broke this once (`svc.point.langs`), and it was fixed in `2adfe90`.
- `gen-thumbs.mjs` writes `_thumbs/`, `_thumbs/lightbox/` (≤1920 px WebP opened
  by the viewers) and `_thumbs/sm/` (320 px for srcset). All of them are
  gitignored and rebuilt on every build.
- `src/lib/site.ts` `url()` adds a trailing slash to page paths
  (`trailingSlash: 'always'`).
- The analytics validator now expects **no** GTM `<noscript>`: without JS it
  would reach Google before consent.
- Files use CRLF. `sed` edits of lines that contain regexes broke several times
  in this session, so edit those lines in an editor.

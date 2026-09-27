# Plan — meta descriptions, generic copy, case studies (next session)

Three items the owner picked on 2026-09-27. Do them in this order: 6 needs no input, 5 needs the
owner's approval, and 4 needs the owner's data. Everything else is in `docs/backlog.md`.

## 1. RO/RU meta descriptions (no blocker)
**Now:** `src/integrations/localize.mjs` translates `<title>` by phrase (lines 85–90) but never
touches `meta[name=description]`, `og:description`, `twitter:description` or the JSON-LD
`WebPage.description`. In the build, `/ro/index.html` still reads
"Casino &#38; sportsbook creative: brand systems, promo landings, banners and video…".

**Sources:** about 10 templates.
- `src/pages/index.astro:52`, `contact.astro:17`, `404.astro:7`
- `src/pages/work/[format].astro:89`
- `src/pages/[project]/portfolio/[format].astro:46-65` (4 templates: banners, landings, videos, app store)
- `src/pages/[project]/portfolio/index.astro:122`, `[project]/brandbook.astro:38`, `[project]/index.astro:123`
- `tagline` in `src/data/projects.ts` (for example "Brand identity and guidelines."), which
  `[project]/index.astro` embeds in the description

**Approach:**
- Add `DESCRIPTIONS` to `src/i18n/ui.ts`: a list of `[RegExp for the EN template, ro, ru]` with
  capture groups for count, brand and market.
- Add market names (Romania, Ukraine, Georgia, Uzbekistan, Asia & Europe) and the taglines as `STRINGS` rows.
- In `transform()`, one function translates the description. The 3 meta tags and the JSON-LD
  `WebPage.description` all use it. If no pattern matches, the EN text stays and the build logs a warning.

**Test:** in `tools/audit/test-i18n.mjs`, assert that no RO/RU page has a `meta description` equal
to its EN twin.

**Before commit:** show the owner the RO/RU texts in a table and get approval.

## 2. Generic copy (audit 7.5)
**Confirmed on 2026-09-27:**
- `src/i18n/ui.ts:103` "AI is wired into our pipeline — concepting, upscaling, motion and voice — …"
- `src/i18n/ui.ts:123` / `src/pages/index.astro:319` "Campaign-speed turnaround"
- "design wizards" is already gone (grep finds nothing)

**Steps:**
1. Grep the hero, services and about copy for other vague phrases, and list them.
2. For each phrase, write 2–3 concrete variants (numbers, deliverables, real deadlines) in EN/RO/RU,
   in a table for the owner. **No commit before approval.**
3. Change the markup and its `ui.ts` row together. The EN text must match exactly, or use
   `data-i18n` (see "Things to know" in `docs/handoff-2026-09-27-audit-fixes.md`). Then run
   `npm run test:audit`.

## 3. Case studies (audit 8.3, blocked on data)
The site has no case studies section yet (grep for "case stud" finds nothing).
1. Ask the owner for 2–3 projects. For each one: brand, task, one real number (CTR, conversion,
   delivery time…) and period, plus an optional client quote with name and role.
2. Once the data is in: add a compact section to `src/pages/index.astro` (3 cards), with `ui.ts` rows
   in all 3 languages. After that the H1 can go back to "converts".
3. Without the data, stop after step 1.

## Verification
- `npm run check` reports 0 errors.
- `npm run build:web`, then `npm run test:audit`: all green.
- Open `/ro/` and `/ru/winboss/portfolio/banners/` in `../web` and read their `meta description`.

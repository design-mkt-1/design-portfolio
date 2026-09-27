# Backlog

Open work that is not scheduled for the next session. Each item names who can move it and the
evidence it rests on. The next session's work is in
`docs/superpowers/plans/2026-09-27-copy-meta-cases.md`.

## Hosting admin
- **Apply `docs/audit/2026-09-27/SERVER-TICKET.md`.** It covers the 404 page, security headers,
  cache, brotli, robots.txt, and a full upload of `../web` with delete (this fixes the 44 missing
  brand book thumbnails and the stale `/winboss/brandbook/`). Build first with `npm run build:web`.
- **Then run `node tools/audit/check-live.mjs`.** On 2026-09-27 it reported 10 FAIL against the old build.

## Owner (data or account access)
- **`/privacy/` page in EN/RO/RU** (audit plan 8.1). Needs the company name, CUI, address and GDPR
  contact. Once it exists, link it from the consent banner, the footer and under the contact form.
- **GA4 account:** put the real Property ID in place of the placeholder `123456789`
  (`ga4/ga4-configuration-manifest.json`, `tools/analytics/configure-ga4.mjs`), then run
  `npm run configure:ga4:dry-run`. Turn off Enhanced Measurement "form interactions". Check Realtime.
- **GA `cookie_domain`:** `_ga` cookies are set on `.marketing-solutions.ro`. To narrow them to
  `design.marketing-solutions.ro`, change `gtm/gtm-entity-manifest.json`, run `npm run build:gtm`
  and re-import the container in GTM.

## Chores
- **CI runners:** the 2026-09-27 compress-videos run warned that `actions/checkout@v4` and
  `actions/setup-node@v4` target Node.js 20, which is deprecated, and that `ubuntu-latest` moves to
  Ubuntu 26 from 2026-10-19. Bump the action versions in `.github/workflows/` and watch the next run.

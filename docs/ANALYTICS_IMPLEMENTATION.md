# Almeron Analytics Implementation

## Architecture

The site installs one GTM container (`GTM-5CRD484Z`) on every generated HTML
document. The head bootstrap establishes Consent Mode v2 defaults before GTM,
preserves an existing `window.dataLayer`, applies a stored preference, and then
loads the standard GTM script. The body starts with the standard noscript
fallback.

Business events do not call `gtag('event', ...)`. Annotated interactions and
verified form lifecycle methods push sanitized objects into `window.dataLayer`.
The generated GTM container converts each custom event into one native GA4 Event
tag. A native Google Tag owns the automatic page view for
`G-48FWDR8WMC`.

```text
Astro data attributes / verified form response
  -> /assets/js/analytics.js
  -> window.dataLayer
  -> GTM custom-event trigger
  -> native Google Tag or GA4 Event tag
  -> GA4
```

## Source Map

- `src/components/AnalyticsHead.astro` — consent defaults, stored update, and
  GTM head snippet.
- `src/components/AnalyticsBody.astro` — noscript fallback, consent UI, and
  deferred runtimes.
- `src/components/ConsentPreferences.astro` — accessible banner and preferences
  dialog.
- `public/assets/js/analytics.js` — event allowlist, sanitization, delegated
  interactions, form helpers, and debug logging.
- `public/assets/js/consent.js` — preference persistence and same-page consent
  updates.
- `src/lib/analytics.mjs` — deterministic stable identifier helpers.
- `gtm/gtm-entity-manifest.json` — human-reviewable GTM entity contract.
- `tools/analytics/build-gtm-container.mjs` — idempotent upsert generator.
- `ga4/ga4-configuration-manifest.json` — custom dimensions and key event.
- `tools/analytics/configure-ga4.mjs` — dry-run-first, create-only Admin API
  helper.
- `tools/analytics/validate-implementation.mjs` — generated-site and artifact
  validator.
- `tools/analytics/test-runtime.mjs` — Playwright browser contract tests.

## Consent Behavior

Default values are `denied` for `analytics_storage`, `ad_storage`,
`ad_user_data`, and `ad_personalization`. GTM can bootstrap under these
defaults, but every generated Google/GA4 tag explicitly requires
`analytics_storage`, so analytics tags remain blocked until the visitor grants
analytics consent.

Preferences are stored as versioned booleans under
`almeron_consent_v1`. Visitors can accept analytics, reject non-essential
storage, or manage analytics and advertising separately. Saving calls
`gtag('consent', 'update', ...)` before pushing a categorical
`consent_update`. Rejection remains observable in the local data layer for QA
but is not forwarded to GA4.

## Contact Form Guarantees

The contact form emits a start event on the first edit. Browser validation,
server rejection, timeout, network failure, and unknown failure use categorical
errors only. A submit attempt occurs immediately before `fetch`.

`generate_lead` requires both an HTTP success response and JSON
`success=true`. It is deduplicated with a `WeakSet`. A query-string success
message from the no-JavaScript fallback is never treated as proof of a lead.

## Configuration

Public IDs:

- GTM container: `GTM-5CRD484Z`
- GA4 Measurement ID: `G-48FWDR8WMC`
- GA4 Property ID: `123456789` placeholder; replace or supply
  `GA4_PROPERTY_ID`

The brief mentions both `https://almeron.cy` and
`https://design.marketing-solutions.ro/`. The static production build currently
targets the latter; confirm the canonical analytics domain before account-side
configuration.

## Commands

```sh
npm run build
npm run build:gtm
npm run test:analytics
npm run validate:analytics
npm run configure:ga4:dry-run
npm run build:web
```

`build:web` writes the deployable custom-domain build to `../web`. Run
`configure:ga4:apply` only after a successful dry run with the real property ID
and authorized Application Default Credentials.

## Deployment and Account Setup

1. Build and validate the website.
2. Import the generated container by following `gtm/IMPORT_INSTRUCTIONS.md`.
3. Disable GA4 Enhanced Measurement form interactions while keeping page view,
   scroll, outbound click, and file download measurement as required.
4. Follow `ga4/GA4_SETUP.md` to compare and create missing property resources.
5. Complete the matrix in `docs/analytics-test-matrix.md`.
6. Publish the GTM workspace only after Tag Assistant and DebugView pass.
7. Deploy the validated `web/` directory.

## Debugging

The analytics runtime logs sanitized payloads on localhost. On another safe
environment, append `?analytics_debug=1`. Inspect `window.dataLayer` and GTM
Preview together; a data-layer event does not prove that a GA4 request was
allowed by consent or accepted by the property.

## Rollback

Website rollback: restore the previous deployment output. GTM rollback: publish
the previously backed-up container version. GA4 resources created by the helper
are intentionally not deleted automatically; remove them manually only after
confirming they are unused.

## Verification Boundary

Local checks can prove source wiring, generated markup, event sanitization,
manifest completeness, and deterministic generation. They cannot prove GTM
import compatibility in a specific account, publication, browser-network
delivery, GA4 Realtime visibility, DebugView visibility, or property
configuration without authorized external access.

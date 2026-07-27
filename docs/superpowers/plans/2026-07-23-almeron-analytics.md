# Almeron Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add privacy-conscious GTM and GA4 measurement to every generated
Almeron page without redesigning the website.

**Architecture:** Shared Astro analytics components install Consent Mode v2 and
GTM once per page. A framework-independent browser module turns stable data
attributes and explicit form lifecycle calls into sanitized `dataLayer` objects.
Separate Node tooling generates GTM/GA4 artifacts and validates the static
output.

**Tech Stack:** Astro 5, browser JavaScript, Node.js ESM, Playwright,
`@google-analytics/admin`.

## Global Constraints

- Business events flow only through `window.dataLayer`.
- GTM uses `GTM-5CRD484Z`; GA4 uses `G-48FWDR8WMC`. Property
  `123456789` remains a placeholder until the owner supplies the real Property
  ID.
- Consent defaults to denied for `analytics_storage`, `ad_storage`,
  `ad_user_data`, and `ad_personalization`.
- No form values or other personal information may enter analytics payloads.
- `generate_lead` fires only after a confirmed successful FormSubmit response
  and is the only default key event.
- Existing design and unrelated integrations remain intact.
- The extracted workspace has no `.git` metadata, so commit steps are not
  available in this environment.

---

### Task 1: Browser Analytics Contract

**Files:**

- Create: `tools/analytics/test-runtime.mjs`
- Create: `public/assets/js/analytics.js`

**Interfaces:**

- Produces: `window.AlmeronAnalytics.push(eventName, parameters)`
- Produces: `trackFormSubmitAttempt(form)`, `trackFormError(form, errorType,
  fieldName)`, and `trackFormSuccess(form)`
- Consumes: stable `data-analytics-*`, `data-content-*`,
  `data-contact-method`, and `data-form-*` attributes

- [ ] Write Playwright tests for preservation of an existing data layer,
  delegated clicks, language changes, FAQ opens, form start, safe errors,
  confirmed-success-only leads, deduplication, and PII exclusion.
- [ ] Run `node tools/analytics/test-runtime.mjs` and confirm it fails because
  `public/assets/js/analytics.js` is absent.
- [ ] Implement the smallest centralized module that satisfies the contract.
- [ ] Re-run the runtime test and confirm all cases pass.

### Task 2: Consent and Shared GTM Installation

**Files:**

- Create: `src/components/AnalyticsHead.astro`
- Create: `src/components/AnalyticsBody.astro`
- Create: `src/components/ConsentPreferences.astro`
- Create: `public/assets/js/consent.js`
- Modify: `src/layouts/Base.astro`
- Modify: redirect templates under `src/pages/[project]/`
- Modify: `src/styles/global.css`

**Interfaces:**

- Produces: denied Consent Mode v2 defaults before GTM
- Persists: `almeron_consent_v1` in local storage
- Pushes: `consent_update` with categorical consent state only

- [ ] Add failing static assertions for one head snippet, one noscript fallback,
  the four v2 consent keys, and consent controls in every built HTML document.
- [ ] Add shared head/body components and an accessible preferences dialog.
- [ ] Load GTM once, apply stored consent immediately, and update consent on the
  same page as the visitor action.
- [ ] Build and confirm the static assertions pass.

### Task 3: Stable Interaction Instrumentation

**Files:**

- Modify: `src/layouts/Base.astro`
- Modify: relevant components in `src/components/`
- Modify: relevant routes in `src/pages/`

**Interfaces:**

- Each meaningful control has one `data-analytics-event` classification.
- IDs are stable, language-independent, and lower snake case.

- [ ] Add failing generated-HTML assertions for missing IDs, duplicate IDs, and
  invalid names.
- [ ] Annotate header/footer navigation, CTAs, project/format cards, portfolio
  items, contact methods, language controls, and the contact form.
- [ ] Leave cosmetic lightbox controls, marquee gestures, and hero spin controls
  untracked.
- [ ] Rebuild and confirm annotation assertions pass.

### Task 4: Contact Form Lifecycle

**Files:**

- Modify: `src/pages/contact.astro`

**Interfaces:**

- Calls `trackFormSubmitAttempt()` immediately before the fetch.
- Calls `trackFormError()` with only a categorical error type.
- Calls `trackFormSuccess()` only after a successful 2xx response whose JSON
  `success` field is `true`.

- [ ] Extend the failing runtime tests for validation blocking, endpoint error,
  timeout, success, and double-submit protection.
- [ ] Add an in-flight guard, request timeout, categorical error handling, and
  success deduplication without reading field values for analytics.
- [ ] Re-run runtime and build checks.

### Task 5: GTM and GA4 Artifacts

**Files:**

- Create: `gtm/gtm-entity-manifest.json`
- Create: `tools/analytics/build-gtm-container.mjs`
- Generate: `gtm/almeron-gtm-container-import.json`
- Create: `gtm/IMPORT_INSTRUCTIONS.md`
- Create: `ga4/ga4-configuration-manifest.json`
- Create: `tools/analytics/configure-ga4.mjs`
- Create: `tools/analytics/package.json`
- Create: `tools/analytics/.env.example`
- Create: `ga4/GA4_SETUP.md`

**Interfaces:**

- GTM generator reads optional `gtm/source-container.json`, upserts by entity
  name, and never overwrites the source.
- GA4 script is dry-run by default and mutates only with `--apply`.

- [ ] Write manifest validation assertions for every required variable,
  trigger, native tag, custom dimension, and key event.
- [ ] Implement idempotent GTM generation and run it twice.
- [ ] Implement read/compare/create-only GA4 configuration.
- [ ] Parse all JSON and run Node syntax checks.

### Task 6: Audit, Validation, and Deployment Output

**Files:**

- Create: `tools/analytics/validate-implementation.mjs`
- Create: `docs/analytics-audit.md`
- Create: `docs/analytics-event-spec.md`
- Create: `docs/analytics-test-matrix.md`
- Create: `docs/ANALYTICS_IMPLEMENTATION.md`
- Modify: `package.json`
- Update: workspace `README.md`
- Generate: `dist/` and `../web/`

**Interfaces:**

- `npm run validate:analytics` performs static checks without claiming network
  verification.
- `npm run build:web` creates the owner-requested static deployment directory.

- [ ] Implement static validation for every acceptance criterion available
  without GTM/GA4 account access.
- [ ] Document the audited elements, event/parameter contracts, manual QA
  matrix, setup, rollback, and owner-only verification steps.
- [ ] Run the Astro build, runtime tests, GTM generator, JSON validation, and
  analytics validator.
- [ ] Build the final `web/` output and run the validator against it.
- [ ] Record commands, results, placeholder replacements, and external
  limitations in the final handoff.

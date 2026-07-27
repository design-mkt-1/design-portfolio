# Analytics Interaction Audit

Audit date: 2026-07-23  
Scope: Astro source and all 44 generated HTML documents  
Production candidate: `https://design.marketing-solutions.ro/`

## Measurement Principles

- Measure business intent and verified outcomes, not every motion or click.
- Use one primary manual event per interaction.
- Leave page views, scroll depth, outbound clicks, and file downloads to GA4
  Enhanced Measurement.
- Use stable English lower-snake-case IDs regardless of the visible language.
- Never include field values, contact details, free-form text, URL query
  strings, response bodies, or stack traces.

## Shared Surfaces

| Surface | Interaction | Measurement |
| --- | --- | --- |
| Header logo | Return to home | `navigation_click` |
| Breadcrumbs | Navigate to parent content | `navigation_click` |
| Header contact control | Start a project | `cta_click` |
| Language controls | Select EN, RO, or RU | `language_change` |
| Footer LinkedIn link | Open external profile | GA4 automatic outbound click only |
| Consent banner and dialog | Accept, reject, or save preferences | `consent_update` in the data layer; forwarded to GA4 only when analytics consent is granted |

## Page and Component Surfaces

| Surface | Interaction | Measurement |
| --- | --- | --- |
| Home hero | Start a project or browse work | `cta_click` |
| Home project cards | Select a project | `select_content` with `content_type=project` |
| Home service cards | Select a service | `select_content` |
| Work format pages | Select a format or work item | `select_content` |
| Project grids and choice cards | Select the next content item | `select_content` |
| Media, landing, video, and store galleries | Open a portfolio asset | `select_content` |
| Project and portfolio back links | Return to the parent route | `navigation_click` |
| Closing CTA banner | Start a project | `cta_click` |
| Contact email links | Open the email client | `contact_click` with `method=email`; no email address is sent |
| Contact form first edit | Begin the form | `contact_form_start`, once per page lifecycle |
| Contact form browser validation | Invalid submission | `contact_form_error` with stable field name only |
| Contact form accepted submit | Start a network attempt | `contact_form_submit_attempt` |
| Contact form failed response | Server, timeout, network, or unknown failure | `contact_form_error` with categorical `error_type` |
| Contact form confirmed response | HTTP success and JSON `success=true` | `generate_lead`, deduplicated |
| Error page back link | Return to the homepage | `navigation_click` |

## Intentionally Not Manually Tracked

- Decorative hero spin, marquees, hover effects, and animation controls.
- Lightbox close/previous/next controls because they do not represent a new
  business choice.
- Ordinary text links already covered by Enhanced Measurement outbound clicks.
- Scroll depth, page views, and file downloads.
- The FormSubmit no-JavaScript redirect because the static page cannot verify
  the upstream response; it must not infer a lead from `?sent=1`.

## Absent Interaction Types

No phone link, WhatsApp link, file-download CTA, contact modal, copy button, or
FAQ accordion currently exists in the audited source. The centralized runtime
and GTM container support `faq_open` for a future annotated `<details>` element,
but no synthetic FAQ event is emitted today.

## Risks and Follow-up

- The brief references both `almeron.cy` and
  `design.marketing-solutions.ro`. The canonical production domain must be
  confirmed before final account-side referral and cross-domain settings.
- GA4 Enhanced Measurement form interactions must be disabled to avoid
  duplicate form events.
- GTM import, Preview, publication, GA4 Realtime, and DebugView require
  authorized account access and remain operator checks.

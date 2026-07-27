# Analytics Test Matrix

Run static and runtime checks before account-side tests:

```sh
npm run build
npm run test:analytics
npm run validate:analytics
```

Then use GTM Preview, Tag Assistant, GA4 Realtime, and GA4 DebugView with a
non-production or safely intercepted contact endpoint where possible.

| Scenario | Expected data layer | Expected GTM/GA4 result |
| --- | --- | --- |
| First page load without stored choice | Consent defaults for all four Consent Mode v2 keys are `denied` before `gtm.js` | GTM loads; Google/GA4 tags requiring `analytics_storage` do not fire |
| Accept analytics | One `consent_update` with analytics `granted`, ads `denied` | Consent updates first; one consent QA event may be forwarded |
| Reject non-essential | One `consent_update` with analytics and ads `denied` | No GA4 Event tag fires |
| Save analytics on, ads off | One `consent_update` with the selected categorical states | Analytics tag eligibility changes without reload |
| Reopen preferences | Existing states populate the dialog | No event until Save is selected |
| Reload with stored preference | Stored consent update is applied before GTM | Banner remains hidden; no synthetic business event |
| Home hero CTA | One `cta_click` with stable ID and location | One matching GA4 event tag |
| Header or breadcrumb | One `navigation_click` | One matching GA4 event tag |
| Contact email | One `contact_click`, `method=email`, no email address or `mailto:` URL | One matching GA4 event tag |
| Project/service/format/asset card | One `select_content` | Stable `content_type` and `content_id` |
| Language selects a new language | One `language_change` | Previous and selected language codes only |
| Language selects current language | No manual event | No GA4 event tag |
| First contact field edit | One `contact_form_start` | Subsequent edits do not repeat it |
| Browser-invalid submit | One `contact_form_error` with `validation` and stable field name | No submit-attempt or lead event |
| Valid form network attempt | One `contact_form_submit_attempt` immediately before fetch | One matching GA4 event tag |
| Server rejection | One `contact_form_error` with `server` | No `generate_lead` |
| Request timeout | One `contact_form_error` with `timeout` | No `generate_lead` |
| Network failure | One `contact_form_error` with `network` | No `generate_lead` |
| HTTP success but missing/false success field | One `contact_form_error` with `server` | No `generate_lead` |
| HTTP success plus JSON `success=true` | One `generate_lead` | One GA4 event and one key-event count |
| Double submit while request is active | First request only | No duplicate submit attempt |
| Repeated success callback | One `generate_lead` per form page lifecycle | Deduplication blocks the second call |
| No-JavaScript `?sent=1` return | Success message may display | No inferred `generate_lead` |
| Page navigation | Automatic `page_view` only | Exactly one page view |
| Scroll, outbound link, file download | No matching manual data-layer event | Enhanced Measurement owns the event |
| URL containing query or fragment | `link_url` contains neither | No query parameters leak to the custom event |
| EN, RO, and RU page samples | Stable event/content IDs across languages | `site_language` changes; IDs do not |

## Page Coverage

Inspect at least:

- home in all available languages;
- a work format listing;
- a project overview and each portfolio gallery type;
- contact form validation, safely intercepted failure, and safely intercepted
  success;
- the 404 page;
- redirect-only project routes.

## Evidence to Record

For every account-side session, record the date, environment, GTM container
version, GA4 property, browser, consent state, screenshots of Tag Assistant and
DebugView, event count, and any discrepancy. Never mark GTM import, publication,
Realtime, or DebugView as passed based only on repository tests.

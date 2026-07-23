# Analytics Event Specification

All manual business events follow this route:

```text
annotated interaction or verified form state
  -> window.AlmeronAnalytics
  -> window.dataLayer
  -> GTM custom-event trigger
  -> native GA4 Event tag
```

The browser runtime only accepts the events and parameters listed below.
Unknown event names, object values, and empty values are discarded.

## Manual Events

| Event | Trigger | Parameters | Notes |
| --- | --- | --- | --- |
| `cta_click` | Click on an annotated primary CTA | `site_section`, `site_language`, `element_id`, `element_type`, `element_location`, `link_url` | Internal/external HTTP URL only; query and fragment removed |
| `navigation_click` | Click on annotated structural navigation | `site_section`, `site_language`, `element_id`, `element_location`, `link_url` | Not used for ordinary content selection |
| `contact_click` | Click on an annotated contact method | `site_section`, `site_language`, `method`, `element_id`, `element_location`, `link_url` | `mailto:` and `tel:` values are excluded from `link_url` |
| `select_content` | Select a project, service, format, or portfolio asset | `site_section`, `site_language`, `content_type`, `content_id`, `element_location` | `content_id` is stable and language-independent |
| `faq_open` | An annotated `<details>` changes to open | `site_section`, `site_language`, `content_type`, `content_id`, `element_location` | Supported by the runtime; no FAQ currently exists |
| `contact_form_start` | First input/select/textarea edit in an annotated form | `site_section`, `site_language`, `form_id`, `form_location` | Once per form per page lifecycle |
| `contact_form_submit_attempt` | Immediately before an accepted network submit | `site_section`, `site_language`, `form_id`, `form_location` | Browser-invalid and bot-guarded submissions do not reach this point |
| `contact_form_error` | Browser validation or failed network lifecycle | `site_section`, `site_language`, `form_id`, `form_location`, `error_type`, `field_name` | `error_type` is categorical; `field_name` is a stable field key, never its value |
| `generate_lead` | HTTP 2xx plus response JSON `success=true` | `site_section`, `site_language`, `form_id`, `form_location`, `method` | Deduplicated and the only configured key event |
| `language_change` | Click selects a language different from the current one | `site_section`, `previous_language`, `selected_language`, `element_location` | Language codes only |
| `consent_update` | Visitor accepts, rejects, or saves consent | `consent_action`, `consent_analytics`, `consent_ads` | Always available in the data layer for QA; GTM forwards only a granted-analytics update |

Allowed `error_type` values used by the current contact flow are `validation`,
`server`, `timeout`, `network`, and `unknown`.

## Automatic GA4 Events

These events are intentionally not pushed manually:

| Event or feature | Owner |
| --- | --- |
| `page_view` | Native Google Tag in GTM |
| Scroll measurement | GA4 Enhanced Measurement |
| Outbound link clicks | GA4 Enhanced Measurement |
| File downloads | GA4 Enhanced Measurement |
| Form interactions | Disabled in Enhanced Measurement; replaced by the verified manual lifecycle |

## Naming and Value Contract

- Event names and parameter names are lower snake case.
- Stable identifiers are normalized to lower snake case and capped at 100
  characters.
- `link_url` accepts only HTTP(S), removes credentials, query strings, and
  fragments, and omits contact protocol URLs.
- The data layer is preserved if another script created it first.
- Payloads never include names, email addresses, phone numbers, form values,
  message text, response bodies, credentials, exception messages, or stack
  traces.

## GTM and GA4 Contract

Each manual event has one `CE - event_name` trigger and one native
`GA4 Event - event_name` tag. All GA4 tags require `analytics_storage`.
`CE - consent_update` also requires `consent_analytics=granted`.

The GA4 property registers 11 event-scoped custom dimensions:
`site_section`, `site_language`, `element_id`, `element_type`,
`element_location`, `form_id`, `form_location`, `error_type`, `field_name`,
`previous_language`, and `selected_language`. Other event parameters remain
available in event payloads but are not registered as custom dimensions by
default.

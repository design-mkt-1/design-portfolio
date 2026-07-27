# Google Tag Manager Import Instructions

The generated file `gtm/almeron-gtm-container-import.json` targets public
container `GTM-5CRD484Z` and Google Tag `G-48FWDR8WMC`. It contains native
Google Tag and GA4 Event tag types only; it contains no Custom HTML.

## Before Importing

1. Export the current GTM container as a backup.
2. Confirm that the destination web container is `GTM-5CRD484Z`.
3. Confirm that `G-48FWDR8WMC` is the intended GA4 web stream.
4. Create a fresh GTM workspace for this import.

## Import

1. Open **Admin > Import Container** in the fresh workspace.
2. Select `almeron-gtm-container-import.json`.
3. Choose the existing `GTM-5CRD484Z` container.
4. Select **Merge** and **Rename conflicting tags, triggers, and variables**.
5. Review the detailed change list before confirming the import.

GTM template schemas can evolve. The generated JSON therefore must be validated
by the GTM import preview. If the UI reports a template parameter mismatch,
cancel the import and export one empty native Google Tag and one empty native
GA4 Event tag from the destination container as `gtm/source-container.json`.
Run `npm run build:gtm` again; the generator preserves unrelated source
entities, upserts Almeron entities by name, and never overwrites the source
file.

## Required Workspace Review

- `Google Tag - Almeron GA4` is a native Google Tag, uses
  `G-48FWDR8WMC`, sends one page view, and fires on All Pages.
- Every `GA4 Event - ...` item is a native GA4 Event tag.
- Every GA4 tag requires `analytics_storage`.
- Every event tag has exactly one matching `CE - ...` custom-event trigger.
- `CE - consent_update` additionally requires
  `DLV - consent_analytics` to equal `granted`.
- No tag uses Custom HTML and no tag calls `gtag('event', ...)`.

## Preview and Publish

Use GTM Preview on representative English, Romanian, and Russian pages. Follow
`docs/analytics-test-matrix.md` and verify consent states, event payloads,
single firing, and absence of personal data. Test contact failures with a safe
staging interception; do not create unwanted real leads.

Publish only after Tag Assistant, GA4 Realtime, and DebugView match the matrix.
Record the GTM version, publisher, date, and GA4 property used. Import,
publication, and account-side verification cannot be claimed from the static
repository alone.

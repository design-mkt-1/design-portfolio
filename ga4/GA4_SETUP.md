# GA4 Setup

The website loads Google Analytics only through Google Tag Manager. Do not add a
standalone `gtag.js` snippet: the Google Tag in the GTM import already uses
measurement ID `G-48FWDR8WMC` and sends the automatic page view.

## Prerequisites

1. Confirm that `G-48FWDR8WMC` belongs to the intended Almeron web data stream.
2. Replace the placeholder property ID `123456789` in
   `ga4/ga4-configuration-manifest.json`, or set `GA4_PROPERTY_ID` in the shell.
3. Grant the operator read access for dry runs and Editor access for apply mode.
4. Configure Google Application Default Credentials outside the repository.
5. Install the isolated tooling dependency with
   `npm install --prefix tools/analytics`.

## Compare and Apply

Run the read-only comparison first:

```sh
npm run configure:ga4:dry-run
```

The dry run lists existing resources and missing resources. It does not mutate
the property. After reviewing the output:

```sh
npm run configure:ga4:apply
```

Apply mode is create-only. It creates missing custom dimensions and the
`generate_lead` key event, but it does not rename, update, or delete existing
resources. Re-running it is safe because resources are compared by event
parameter or event name before creation.

## GA4 UI Checks

In **Admin > Data display > Events**, confirm that `generate_lead` is the only
project-defined key event. In **Admin > Data display > Custom definitions**,
confirm the 11 event-scoped dimensions from the manifest.

In the web stream's Enhanced Measurement settings:

- keep page views, scrolls, outbound clicks, and file downloads enabled;
- disable form interactions because the website supplies a verified,
  deduplicated form lifecycle;
- do not create additional click or form events that duplicate GTM events.

Use Realtime and DebugView only after the GTM container has been imported,
previewed, and published. Validate that no name, email address, message content,
URL query string, response body, or other personal data is present.

## Current External Limitation

The repository contains a placeholder GA4 Property ID because only the public
measurement ID was supplied. No GA4 Admin API mutation can be completed or
claimed until an authorized operator supplies the real property ID and
credentials.

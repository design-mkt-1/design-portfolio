import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '../..');
const manifestPath = resolve(projectRoot, 'ga4/ga4-configuration-manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const applyChanges = process.argv.includes('--apply');
const propertyId = String(process.env.GA4_PROPERTY_ID || manifest.propertyId || '').replace(
  /^properties\//,
  ''
);
const propertyName = `properties/${propertyId}`;
const placeholderPropertyIds = new Set(['', '123456789']);

console.log(`Mode: ${applyChanges ? 'APPLY' : 'DRY RUN'}`);
console.log(`GA4 property: ${propertyName}`);
console.log(`Measurement ID documented by the manifest: ${manifest.measurementId}`);

if (placeholderPropertyIds.has(propertyId)) {
  console.log(
    `No real GA4 Property ID is configured. Set GA4_PROPERTY_ID to perform the read-only comparison.`
  );
  console.log(
    `Manifest plan: ${manifest.customDimensions.length} event-scoped custom dimensions and ` +
      `${manifest.keyEvents.length} key event.`
  );
  if (applyChanges) {
    throw new Error('Refusing to apply GA4 changes with a placeholder Property ID.');
  }
  process.exit(0);
}

let AnalyticsAdminServiceClient;
try {
  ({ AnalyticsAdminServiceClient } = (await import('@google-analytics/admin')).v1beta);
} catch (error) {
  throw new Error(
    'Install tools/analytics dependencies before connecting to GA4: npm install --prefix tools/analytics',
    { cause: error }
  );
}

const client = new AnalyticsAdminServiceClient();
const [existingDimensions] = await client.listCustomDimensions({ parent: propertyName });
const [existingKeyEvents] = await client.listKeyEvents({ parent: propertyName });
const dimensionsByParameter = new Map(
  existingDimensions.map((dimension) => [dimension.parameterName, dimension])
);
const keyEventsByName = new Map(existingKeyEvents.map((keyEvent) => [keyEvent.eventName, keyEvent]));

const dimensionsToCreate = manifest.customDimensions.filter(
  (dimension) => !dimensionsByParameter.has(dimension.parameterName)
);
const keyEventsToCreate = manifest.keyEvents.filter(
  (keyEvent) => !keyEventsByName.has(keyEvent.eventName)
);

for (const dimension of manifest.customDimensions) {
  const existing = dimensionsByParameter.get(dimension.parameterName);
  console.log(
    existing
      ? `KEEP custom dimension ${dimension.parameterName} (${existing.displayName || 'unnamed'})`
      : `${applyChanges ? 'CREATE' : 'WOULD CREATE'} custom dimension ${dimension.parameterName}`
  );
}
for (const keyEvent of manifest.keyEvents) {
  const existing = keyEventsByName.get(keyEvent.eventName);
  console.log(
    existing
      ? `KEEP key event ${keyEvent.eventName}`
      : `${applyChanges ? 'CREATE' : 'WOULD CREATE'} key event ${keyEvent.eventName}`
  );
}

if (!applyChanges) {
  console.log(
    `Dry run complete: ${dimensionsToCreate.length} custom dimension(s) and ` +
      `${keyEventsToCreate.length} key event(s) are missing. No changes were made.`
  );
  process.exit(0);
}

for (const dimension of dimensionsToCreate) {
  await client.createCustomDimension({
    parent: propertyName,
    customDimension: {
      parameterName: dimension.parameterName,
      displayName: dimension.displayName,
      description: dimension.description,
      scope: dimension.scope
    }
  });
}
for (const keyEvent of keyEventsToCreate) {
  await client.createKeyEvent({
    parent: propertyName,
    keyEvent: {
      eventName: keyEvent.eventName,
      countingMethod: keyEvent.countingMethod
    }
  });
}

console.log(
  `Apply complete: created ${dimensionsToCreate.length} custom dimension(s) and ` +
    `${keyEventsToCreate.length} key event(s). Existing resources were not changed or deleted.`
);

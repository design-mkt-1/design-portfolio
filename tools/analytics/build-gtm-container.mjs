import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '../..');
const manifestPath = resolve(projectRoot, 'gtm/gtm-entity-manifest.json');
const sourcePath = resolve(projectRoot, 'gtm/source-container.json');
const outputPath = resolve(projectRoot, 'gtm/almeron-gtm-container-import.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

const clone = (value) => JSON.parse(JSON.stringify(value));
const source = existsSync(sourcePath)
  ? JSON.parse(readFileSync(sourcePath, 'utf8'))
  : {
      exportFormatVersion: 2,
      exportTime: '2026-07-23 00:00:00',
      containerVersion: {
        path: 'accounts/0/containers/0/versions/0',
        accountId: '0',
        containerId: '0',
        containerVersionId: '0',
        container: {
          path: 'accounts/0/containers/0',
          accountId: '0',
          containerId: '0',
          name: manifest.container.name,
          publicId: manifest.container.publicId,
          usageContext: manifest.container.usageContext
        },
        tag: [],
        trigger: [],
        variable: [],
        folder: [],
        builtInVariable: []
      }
    };

const output = clone(source);
const version = output.containerVersion ||= {};
const accountId = String(version.accountId || version.container?.accountId || '0');
const containerId = String(version.containerId || version.container?.containerId || '0');
version.accountId = accountId;
version.containerId = containerId;
version.containerVersionId ||= '0';
version.path ||= `accounts/${accountId}/containers/${containerId}/versions/${version.containerVersionId}`;
version.container = {
  ...(version.container || {}),
  path: version.container?.path || `accounts/${accountId}/containers/${containerId}`,
  accountId,
  containerId,
  name: manifest.container.name,
  publicId: manifest.container.publicId,
  usageContext: manifest.container.usageContext
};
version.tag ||= [];
version.trigger ||= [];
version.variable ||= [];
version.folder ||= [];

const numericIds = (entities, key) =>
  entities.map((entity) => Number.parseInt(entity[key], 10)).filter(Number.isFinite);
const nextIdFactory = (entities, key) => {
  let value = Math.max(0, ...numericIds(entities, key));
  return () => String(++value);
};
const nextFolderId = nextIdFactory(version.folder, 'folderId');
const nextVariableId = nextIdFactory(version.variable, 'variableId');
const nextTriggerId = nextIdFactory(version.trigger, 'triggerId');
const nextTagId = nextIdFactory(version.tag, 'tagId');

const upsertByName = (collection, desired, idKey, nextId) => {
  const index = collection.findIndex((entity) => entity.name === desired.name);
  const existing = index >= 0 ? collection[index] : null;
  const entity = {
    ...(existing || {}),
    ...desired,
    accountId,
    containerId,
    [idKey]: existing?.[idKey] || nextId()
  };
  if (index >= 0) collection[index] = entity;
  else collection.push(entity);
  return entity;
};

const folder = upsertByName(
  version.folder,
  { name: 'Almeron Analytics' },
  'folderId',
  nextFolderId
);

const upsertVariable = (desired) =>
  upsertByName(
    version.variable,
    { ...desired, parentFolderId: folder.folderId },
    'variableId',
    nextVariableId
  );

upsertVariable({
  name: 'CONST - GA4 Measurement ID',
  type: 'c',
  parameter: [
    {
      type: 'TEMPLATE',
      key: 'value',
      value: manifest.googleTag.measurementId
    }
  ]
});

for (const variableName of manifest.dataLayerVariables) {
  upsertVariable({
    name: `DLV - ${variableName}`,
    type: 'v',
    parameter: [
      {
        type: 'INTEGER',
        key: 'dataLayerVersion',
        value: '2'
      },
      {
        type: 'BOOLEAN',
        key: 'setDefaultValue',
        value: 'false'
      },
      {
        type: 'TEMPLATE',
        key: 'name',
        value: variableName
      }
    ]
  });
}

const triggerByEvent = new Map();
for (const mapping of manifest.eventToTagMappings) {
  const desired = {
    name: `CE - ${mapping.event}`,
    type: 'CUSTOM_EVENT',
    customEventFilter: [
      {
        type: 'EQUALS',
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'arg0',
            value: '{{_event}}'
          },
          {
            type: 'TEMPLATE',
            key: 'arg1',
            value: mapping.event
          }
        ]
      }
    ],
    filter: (mapping.triggerConditions || []).map((condition) => ({
      type: condition.operator === 'equals' ? 'EQUALS' : condition.operator.toUpperCase(),
      parameter: [
        {
          type: 'TEMPLATE',
          key: 'arg0',
          value: `{{DLV - ${condition.variable}}}`
        },
        {
          type: 'TEMPLATE',
          key: 'arg1',
          value: condition.value
        }
      ]
    })),
    parentFolderId: folder.folderId
  };
  if (!desired.filter.length) delete desired.filter;
  triggerByEvent.set(
    mapping.event,
    upsertByName(version.trigger, desired, 'triggerId', nextTriggerId)
  );
}

const analyticsConsent = {
  consentStatus: 'NEEDED',
  consentType: {
    type: 'LIST',
    list: [
      {
        type: 'TEMPLATE',
        value: 'analytics_storage'
      }
    ]
  }
};

upsertByName(
  version.tag,
  {
    name: manifest.googleTag.name,
    type: 'googtag',
    parameter: [
      {
        type: 'TEMPLATE',
        key: 'tagId',
        value: '{{CONST - GA4 Measurement ID}}'
      },
      {
        type: 'LIST',
        key: 'configSettingsTable',
        list: [
          {
            type: 'MAP',
            map: [
              {
                type: 'TEMPLATE',
                key: 'parameter',
                value: 'send_page_view'
              },
              {
                type: 'TEMPLATE',
                key: 'parameterValue',
                value: String(manifest.googleTag.sendPageView)
              }
            ]
          }
        ]
      }
    ],
    firingTriggerId: ['2147479553'],
    tagFiringOption: 'ONCE_PER_EVENT',
    consentSettings: analyticsConsent,
    parentFolderId: folder.folderId
  },
  'tagId',
  nextTagId
);

for (const mapping of manifest.eventToTagMappings) {
  const eventParameters = mapping.parameters.map((parameterName) => ({
    type: 'MAP',
    map: [
      {
        type: 'TEMPLATE',
        key: 'parameter',
        value: parameterName
      },
      {
        type: 'TEMPLATE',
        key: 'parameterValue',
        value: `{{DLV - ${parameterName}}}`
      }
    ]
  }));

  upsertByName(
    version.tag,
    {
      name: `GA4 Event - ${mapping.event}`,
      type: 'gaawe',
      parameter: [
        {
          type: 'BOOLEAN',
          key: 'sendEcommerceData',
          value: 'false'
        },
        {
          type: 'LIST',
          key: 'eventSettingsTable',
          list: eventParameters
        },
        {
          type: 'TEMPLATE',
          key: 'eventName',
          value: mapping.event
        },
        {
          type: 'TEMPLATE',
          key: 'measurementIdOverride',
          value: '{{CONST - GA4 Measurement ID}}'
        }
      ],
      firingTriggerId: [triggerByEvent.get(mapping.event).triggerId],
      tagFiringOption: 'ONCE_PER_EVENT',
      consentSettings: analyticsConsent,
      parentFolderId: folder.folderId
    },
    'tagId',
    nextTagId
  );
}

// The GTM UI import schema rejects built-in-variable entities generated from
// API enum values. These optional entries are not required by this container,
// so leave the destination container's built-in variables unchanged.
delete version.builtInVariable;

output.exportFormatVersion = 2;
output.exportTime = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

console.log(`Generated ${outputPath}`);
console.log(
  `Upserted 1 folder, ${manifest.dataLayerVariables.length + 1} variables, ` +
    `${manifest.eventToTagMappings.length} triggers, and ${manifest.eventToTagMappings.length + 1} tags.`
);
console.log(
  existsSync(sourcePath)
    ? `Preserved unrelated entities from ${sourcePath}; the source file was not modified.`
    : 'No source-container.json was present; generated a standalone import file.'
);

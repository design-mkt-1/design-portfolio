import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const generator = resolve(projectRoot, 'tools/analytics/build-gtm-container.mjs');
const output = resolve(projectRoot, 'gtm/almeron-gtm-container-import.json');
const result = spawnSync(process.execPath, [generator], {
  cwd: projectRoot,
  encoding: 'utf8'
});

assert.equal(result.status, 0, result.stderr || result.stdout);
const container = JSON.parse(readFileSync(output, 'utf8'));
assert.equal(
  container.containerVersion.builtInVariable?.length ?? 0,
  0,
  'GTM UI imports must omit optional built-in-variable entries because the export schema rejects them.'
);

for (const tag of container.containerVersion.tag.filter((item) => item.type === 'gaawe')) {
  const eventSettingsTable = tag.parameter?.find((parameter) => parameter.key === 'eventSettingsTable');
  for (const row of eventSettingsTable?.list || []) {
    assert.deepEqual(
      row.map?.map((entry) => entry.key),
      ['parameter', 'parameterValue'],
      `${tag.name} must use GTM's parameter/parameterValue event-settings columns.`
    );
  }
}

console.log('GTM import compatibility test passed (no optional built-in variables).');

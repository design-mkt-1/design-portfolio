import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const astroCli = resolve(projectRoot, 'node_modules/astro/astro.js');
const outputDirectory = resolve(projectRoot, '../web');
const result = spawnSync(process.execPath, [astroCli, 'build', '--outDir', outputDirectory], {
  cwd: projectRoot,
  env: {
    ...process.env,
    ASTRO_TELEMETRY_DISABLED: '1',
    SITE_URL: 'https://design.marketing-solutions.ro',
    BASE_PATH: '/'
  },
  stdio: 'inherit'
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;

// Normalize uploaded media under public/assets/**:
//  1) In banners/ and videos/ item folders, rename pixel-dimension filenames to
//     size keys:  1080x1080 -> 1x1, 1080x1920 -> 9x16, 1920x1080 -> 16x9, 1080x1350 -> 4x5.
//  2) Convert raster images (.jpg/.jpeg/.png) -> .webp (quality 82) and delete the original.
//     Leaves .svg and video files (.mp4/.webm/...) untouched.
//
// Idempotent: safe to re-run. Run: node scripts/normalize-assets.mjs
import { readdirSync, statSync, renameSync, existsSync, unlinkSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const ASSETS = join(ROOT, 'public', 'assets');

const DIM_TO_KEY = new Map([
  ['1080x1080', '1x1'],
  ['1080x1920', '9x16'],
  ['1920x1080', '16x9'],
  ['1080x1350', '4x5'],
]);
const RASTER = new Set(['.jpg', '.jpeg', '.png']);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// Rename by pixel dimensions (only inside banners/ or videos/ folders).
function maybeRename(file) {
  const dir = dirname(file);
  if (!/(\/|^)(banners|videos)\//.test(file.replace(ROOT, ''))) return file;
  const ext = extname(file);
  const stem = basename(file, ext).toLowerCase().replace(/\s*px$/, '').trim();
  const key = DIM_TO_KEY.get(stem);
  if (!key) return file;
  const target = join(dir, key + ext);
  if (target === file || existsSync(target)) return file;
  renameSync(file, target);
  console.log(`renamed  ${basename(file)} -> ${basename(target)}`);
  return target;
}

async function maybeWebp(file) {
  const ext = extname(file).toLowerCase();
  if (!RASTER.has(ext)) return;
  const target = file.slice(0, -ext.length) + '.webp';
  if (existsSync(target)) return;
  await sharp(file).webp({ quality: 82 }).toFile(target);
  unlinkSync(file);
  console.log(`webp     ${basename(file)} -> ${basename(target)}`);
}

if (!existsSync(ASSETS)) {
  console.log('no public/assets');
  process.exit(0);
}

let files = walk(ASSETS).map(maybeRename);
for (const f of files) {
  try {
    await maybeWebp(f);
  } catch (e) {
    console.error(`skip ${f}: ${e.message}`);
  }
}
console.log('normalize done.');

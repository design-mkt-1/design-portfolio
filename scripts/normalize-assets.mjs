// Normalize uploaded media under public/assets/**:
//  * In banners/ and videos/ item folders, raster images are renamed to size keys
//    derived from their ACTUAL pixel dimensions (robust to any filename):
//      1:1 -> 1x1, 9:16 -> 9x16, 16:9 -> 16x9, 4:5 -> 4x5
//  * All raster images (.jpg/.jpeg/.png) are converted to .webp (quality 82); the
//    original is deleted. .svg and video files (.mp4/.webm/...) are left untouched.
//
// Idempotent: safe to re-run (already-.webp files are skipped). Run:
//   node scripts/normalize-assets.mjs
import { readdirSync, statSync, existsSync, unlinkSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('..', import.meta.url).pathname;
const ASSETS = join(ROOT, 'public', 'assets');
const RASTER = new Set(['.jpg', '.jpeg', '.png']);

// aspect ratio -> size key
const RATIOS = [
  ['1x1', 1 / 1],
  ['9x16', 9 / 16],
  ['16x9', 16 / 9],
  ['4x5', 4 / 5],
];
function sizeKeyFromDims(w, h) {
  if (!w || !h) return null;
  const r = w / h;
  let best = null,
    bestErr = Infinity;
  for (const [key, ratio] of RATIOS) {
    const err = Math.abs(r - ratio) / ratio;
    if (err < bestErr) {
      bestErr = err;
      best = key;
    }
  }
  return bestErr < 0.06 ? best : null; // within 6% of a known ratio
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const isSizedFolder = (file) => /(^|\/)(banners|videos)\//.test(file.replace(ROOT, ''));

async function process(file) {
  const ext = extname(file).toLowerCase();
  if (!RASTER.has(ext)) return;
  const dir = dirname(file);

  let targetBase = basename(file, extname(file));
  if (isSizedFolder(file)) {
    const meta = await sharp(file).metadata();
    const key = sizeKeyFromDims(meta.width, meta.height);
    if (key) targetBase = key;
    else console.warn(`?? ${basename(file)} (${meta.width}x${meta.height}) — no size-key match, keeping name`);
  }
  const target = join(dir, `${targetBase}.webp`);

  if (existsSync(target) && target !== file) {
    console.warn(`skip (exists): ${basename(target)} <- ${basename(file)}`);
    return;
  }
  await sharp(file).webp({ quality: 82 }).toFile(target);
  unlinkSync(file);
  console.log(`${basename(file)}  ->  ${basename(target)}`);
}

if (!existsSync(ASSETS)) {
  console.log('no public/assets');
  process.exit?.(0);
}
for (const f of walk(ASSETS)) {
  try {
    await process(f);
  } catch (e) {
    console.error(`ERR ${f}: ${e.message}`);
  }
}
console.log('normalize done.');

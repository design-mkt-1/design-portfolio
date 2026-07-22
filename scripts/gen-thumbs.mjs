// Build-time thumbnail pipeline (runs automatically via npm "prebuild").
//
// Full-size creative (multi-hundred-KB landing screenshots, store shots, banner
// masters) was being downloaded just to paint ~250px grid tiles. This mirrors
// the tile-relevant originals into public/assets/_thumbs/** as small WebP
// thumbnails (2× display size), which the galleries prefer via src/lib/thumbs.ts
// — falling back to the original whenever a thumb doesn't exist, so a missing
// or stale run never breaks the site. Lightboxes always load originals.
//
// _thumbs/ is gitignored: CI regenerates it on every deploy, keeping the repo
// free of derived files. A manifest with pixel dimensions is emitted alongside
// so templates can set width/height attributes.
import { readdirSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname, relative, parse } from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const ASSETS = join(ROOT, 'public', 'assets');
const OUT = join(ASSETS, '_thumbs');
const IMG = /\.(webp|png|jpe?g)$/i;
const QUALITY = 78;

/** kind -> sizing rule. Widths are ~2× the largest tile the image paints. */
const RULES = {
  // landing tiles are 9/16 top-crops; keep at most the top ~2 screens
  landing: { width: 640, maxHeight: 1400 },
  banner: { width: 640 },
  store: { height: 1120 },
  poster: { width: 640 },
  brandbookCover: { width: 960 },
};

/** Collect [absSrc, kind] jobs from the conventional asset tree. */
function collectJobs() {
  const jobs = [];
  if (!existsSync(ASSETS)) return jobs;
  const projects = readdirSync(ASSETS, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== '_thumbs');
  for (const p of projects) {
    const base = join(ASSETS, p.name);
    const eachSet = (kindDir, cb) => {
      const dir = join(base, kindDir);
      if (!existsSync(dir)) return;
      for (const set of readdirSync(dir, { withFileTypes: true })) {
        if (set.isDirectory()) cb(join(dir, set.name));
      }
    };
    eachSet('landings', (set) => {
      for (const f of readdirSync(set)) if (IMG.test(f)) jobs.push([join(set, f), 'landing']);
    });
    eachSet('banners', (set) => {
      // tiles only ever show the 1×1 master
      const f = join(set, '1x1.webp');
      if (existsSync(f)) jobs.push([f, 'banner']);
    });
    eachSet('store', (set) => {
      for (const f of readdirSync(set)) if (IMG.test(f)) jobs.push([join(set, f), 'store']);
    });
    eachSet('videos', (set) => {
      for (const f of readdirSync(set)) if (IMG.test(f) && /^cover/i.test(f)) jobs.push([join(set, f), 'poster']);
    });
    // brand-book chooser cover: first numbered frame and/or explicit cover.*
    const bb = join(base, 'brandbook');
    if (existsSync(bb)) {
      const frames = readdirSync(bb).filter((f) => /^\d+\.(webp|png|jpe?g)$/i.test(f)).sort((a, b) => parseInt(a) - parseInt(b));
      if (frames[0]) jobs.push([join(bb, frames[0]), 'brandbookCover']);
      for (const f of readdirSync(bb)) if (/^cover\.(webp|png|jpe?g)$/i.test(f)) jobs.push([join(bb, f), 'brandbookCover']);
    }
  }
  return jobs;
}

function thumbPath(absSrc) {
  const rel = relative(ASSETS, absSrc);
  const { dir, name } = parse(rel);
  return join(OUT, dir, `${name}.webp`);
}

const manifest = {};
let made = 0;
let kept = 0;

for (const [src, kind] of collectJobs()) {
  const dest = thumbPath(src);
  const relDest = relative(join(ROOT, 'public'), dest).split('\\').join('/');
  try {
    const fresh = existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs;
    let img = sharp(src);
    const meta = await img.metadata();
    if (!fresh) {
      const rule = RULES[kind];
      if (rule.height) {
        img = img.resize({ height: Math.min(rule.height, meta.height ?? rule.height), withoutEnlargement: true });
      } else {
        const width = Math.min(rule.width, meta.width ?? rule.width);
        const scaledH = Math.round(((meta.height ?? 1) * width) / (meta.width ?? width));
        img =
          rule.maxHeight && scaledH > rule.maxHeight
            ? img.resize({ width, height: rule.maxHeight, fit: 'cover', position: 'top' })
            : img.resize({ width, withoutEnlargement: true });
      }
      mkdirSync(dirname(dest), { recursive: true });
      await img.webp({ quality: QUALITY }).toFile(dest);
      made++;
    } else {
      kept++;
    }
    const out = await sharp(dest).metadata();
    manifest[relDest] = { w: out.width, h: out.height };
  } catch (e) {
    console.warn(`[thumbs] skip ${relative(ROOT, src)}: ${e.message}`);
  }
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest));
console.log(`[thumbs] ${made} generated, ${kept} up-to-date, ${Object.keys(manifest).length} total`);

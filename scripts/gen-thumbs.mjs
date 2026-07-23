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
      // any image can be a tile thumb now that sizes are ratio-probed
      for (const f of readdirSync(set)) if (IMG.test(f)) jobs.push([join(set, f), 'banner']);
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

// ---- square favicons --------------------------------------------------------
// Browser tabs render favicons in a square slot; several brand marks are
// non-square files and get stretched to fill it. Letterbox each one into a
// transparent 128×128 PNG (fit: contain) so the mark displays intact.
// Output: _thumbs/favicons/<slug>.png (+ ms.png for the site mark).
async function makeFavicons() {
  const jobs = [];
  const ms = join(ASSETS, 'favicon_ms.webp');
  if (existsSync(ms)) jobs.push(['ms', ms]);
  for (const p of readdirSync(ASSETS, { withFileTypes: true })) {
    if (!p.isDirectory() || p.name === '_thumbs') continue;
    const f = readdirSync(join(ASSETS, p.name)).find((n) => /^favicon.*\.(svg|webp|png|jpe?g)$/i.test(n));
    if (f) jobs.push([p.name, join(ASSETS, p.name, f)]);
  }
  // iOS home-screen icon: the MS mark on the site's dark background (iOS
  // replaces transparency with white, so the plain favicon looks broken there)
  if (existsSync(ms)) {
    const dest = join(OUT, 'favicons', 'apple-touch-icon.png');
    if (!existsSync(dest) || statSync(dest).mtimeMs < statSync(ms).mtimeMs) {
      mkdirSync(dirname(dest), { recursive: true });
      const msTrim = await sharp(ms, { density: 300 }).trim({ threshold: 12 }).png().toBuffer();
      const mark = await sharp(msTrim)
        .resize({ width: 128, height: 128, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      await sharp({ create: { width: 180, height: 180, channels: 4, background: { r: 11, g: 11, b: 18, alpha: 1 } } })
        .composite([{ input: mark }])
        .png()
        .toFile(dest);
    }
  }
  let n = 0;
  for (const [slug, src] of jobs) {
    const dest = join(OUT, 'favicons', `${slug}.png`);
    try {
      if (existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) continue;
      mkdirSync(dirname(dest), { recursive: true });
      // trim any padding baked into the source so the mark fills the square
      const trimmed = await sharp(src, { density: 300 }).trim({ threshold: 12 }).png().toBuffer();
      await sharp(trimmed)
        .resize({ width: 128, height: 128, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(dest);
      n++;
    } catch (e) {
      console.warn(`[thumbs] favicon skip ${slug}: ${e.message}`);
    }
  }
  return n;
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
    // wide banners also get a content-aware square tile crop (.sq.webp):
    // sharp's attention strategy centers on the salient design, so
    // text-left/art-right creatives crop right and centered ones stay centered.
    // Freshness is tracked per-file so the crop appears even when the regular
    // thumb predates this feature.
    if (kind === 'banner' && meta.width && meta.height && meta.width / meta.height >= 1.6) {
      const sqDest = dest.replace(/\.webp$/, '.sq.webp');
      if (!existsSync(sqDest) || statSync(sqDest).mtimeMs < statSync(src).mtimeMs) {
        const sq = Math.min(640, meta.height, meta.width);
        await sharp(src)
          .resize({ width: sq, height: sq, fit: 'cover', position: sharp.strategy.attention })
          .webp({ quality: QUALITY })
          .toFile(sqDest);
        made++;
      }
    }
    const out = await sharp(dest).metadata();
    manifest[relDest] = { w: out.width, h: out.height };
    const sqDest = dest.replace(/\.webp$/, '.sq.webp');
    if (existsSync(sqDest)) {
      const sq = await sharp(sqDest).metadata();
      manifest[relative(join(ROOT, 'public'), sqDest).split('\\').join('/')] = { w: sq.width, h: sq.height };
    }
  } catch (e) {
    console.warn(`[thumbs] skip ${relative(ROOT, src)}: ${e.message}`);
  }
}

const favs = await makeFavicons();

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest));
console.log(`[thumbs] ${made} generated, ${kept} up-to-date, ${Object.keys(manifest).length} total, ${favs} favicons squared`);

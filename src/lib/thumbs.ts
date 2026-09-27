// Build-only helper (uses node:fs) — import from .astro frontmatter only.
// Resolves an asset path to its generated thumbnail (see scripts/gen-thumbs.mjs,
// run automatically before every build). Falls back to the original path when no
// thumbnail exists, so the site keeps working even if the pipeline hasn't run
// (e.g. a bare `astro dev` before the first prebuild).
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';
import { url } from './site';

const PUB = join(process.cwd(), 'public');
const MANIFEST_PATH = join(PUB, 'assets', '_thumbs', 'manifest.json');

let manifest: Record<string, { w: number; h: number }> | null = null;
function loadManifest() {
  if (manifest) return manifest;
  try {
    manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    manifest = {};
  }
  return manifest!;
}

/** assets/<slug>/… -> assets/_thumbs/[<variant>/]<slug>/….webp when that file exists. */
function rendition(relPath: string, variant: string): string | undefined {
  if (!relPath.startsWith('assets/')) return undefined;
  const { dir, name } = parse(relPath.slice('assets/'.length));
  const out = `assets/_thumbs/${variant ? variant + '/' : ''}${dir ? dir + '/' : ''}${name}.webp`;
  return existsSync(join(PUB, out)) ? out : undefined;
}

/** Tile thumbnail; the original when none was generated. */
export function thumbFor(relPath: string | undefined): string | undefined {
  if (!relPath) return relPath;
  return rendition(relPath, '') ?? relPath;
}

/** What a lightbox opens: a ≤1920px WebP instead of the (multi-MB) original. */
export function lightboxFor(relPath: string): string {
  return rendition(relPath, 'lightbox') ?? relPath;
}

/** 320px step for srcset (banners and landings only); undefined when absent. */
export function smallFor(relPath: string): string | undefined {
  return rendition(relPath, 'sm');
}

/** srcset for a tile: the 320px step plus the regular thumb, with their real
 *  widths from the manifest. Tiles paint at ~120–220px, so 1× screens take
 *  the small file. Undefined when either rendition is missing. */
export function tileSrcset(original: string | undefined, thumb: string | undefined): string | undefined {
  if (!original || !thumb) return undefined;
  const sm = smallFor(original);
  const a = thumbDims(sm);
  const b = thumbDims(thumb);
  return sm && a && b && a.w < b.w ? `${url(sm)} ${a.w}w, ${url(thumb)} ${b.w}w` : undefined;
}
/** `sizes` matching the tile grids (~120–220px wide at every breakpoint). */
export const TILE_SIZES = '220px';

/** Pixel dimensions of a thumb (for width/height attributes); undefined for originals. */
export function thumbDims(relPath: string | undefined): { w: number; h: number } | undefined {
  if (!relPath) return undefined;
  return loadManifest()[relPath];
}

/** Square, letterboxed favicon for the browser tab (non-square brand marks get
 *  stretched by the tab slot otherwise). Falls back to the original file. */
export function squareFavicon(relPath: string): string {
  const m = relPath.match(/^assets\/(?:([^/]+)\/)?favicon[^/]*$/i);
  const slug = m ? (m[1] ?? 'ms') : undefined;
  if (!slug) return relPath;
  const squared = `assets/_thumbs/favicons/${slug}.png`;
  return existsSync(join(PUB, squared)) ? squared : relPath;
}

/** URL with a ?v= stamp from the file's mtime, so a re-uploaded asset under the
 *  same name is not served stale from a long cache. Remote URLs pass through. */
export function versioned(relPath: string): string {
  if (/^https?:\/\//.test(relPath)) return relPath;
  try {
    return `${url(relPath)}?v=${Math.round(statSync(join(PUB, relPath)).mtimeMs).toString(36)}`;
  } catch {
    return url(relPath);
  }
}

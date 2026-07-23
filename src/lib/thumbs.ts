// Build-only helper (uses node:fs) — import from .astro frontmatter only.
// Resolves an asset path to its generated thumbnail (see scripts/gen-thumbs.mjs,
// run automatically before every build). Falls back to the original path when no
// thumbnail exists, so the site keeps working even if the pipeline hasn't run
// (e.g. a bare `astro dev` before the first prebuild).
import { existsSync, readFileSync } from 'node:fs';
import { join, parse } from 'node:path';

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

/** assets/<slug>/… -> assets/_thumbs/<slug>/….webp when the thumb exists. */
export function thumbFor(relPath: string | undefined): string | undefined {
  if (!relPath) return relPath;
  if (!relPath.startsWith('assets/')) return relPath;
  const { dir, name } = parse(relPath.slice('assets/'.length));
  const thumb = `assets/_thumbs/${dir ? dir + '/' : ''}${name}.webp`;
  return existsSync(join(PUB, thumb)) ? thumb : relPath;
}

/** Pixel dimensions of a thumb (for width/height attributes); undefined for originals. */
export function thumbDims(relPath: string | undefined): { w: number; h: number } | undefined {
  if (!relPath) return undefined;
  return loadManifest()[relPath];
}

/** Content-aware square tile crop for wide creatives (falls back to the
 *  regular thumb, then the original). */
export function squareThumbFor(relPath: string | undefined): string | undefined {
  if (!relPath || !relPath.startsWith('assets/')) return thumbFor(relPath);
  const { dir, name } = parse(relPath.slice('assets/'.length));
  const sq = `assets/_thumbs/${dir ? dir + '/' : ''}${name}.sq.webp`;
  return existsSync(join(PUB, sq)) ? sq : thumbFor(relPath);
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

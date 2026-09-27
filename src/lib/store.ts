// Build-only helper (uses node:fs) — import from .astro frontmatter only.
// "App Store" carousels, auto-detected from disk. Each subfolder under
//   public/assets/<slug>/store/<Set Name>/1.webp, 2.webp, …
// is one campaign set shown as its own continuous carousel. Drop a folder of
// screenshots and it appears; no data edits needed.
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { cleanTitle, isInProgress } from './titles';
import { IMG_FILE as IMG, naturalSort as natural } from './site';

export interface StoreGroup {
  key: string;
  label: string;
  images: string[];
}

function storeDir(slug: string): string {
  return join(process.cwd(), 'public', 'assets', slug, 'store');
}

/** One group per campaign-set subfolder that contains images, name-sorted. */
const storeCache = new Map<string, StoreGroup[]>();
export function storeGroups(slug: string): StoreGroup[] {
  if (!storeCache.has(slug)) storeCache.set(slug, scanStore(slug));
  return storeCache.get(slug)!;
}

function scanStore(slug: string): StoreGroup[] {
  const base = storeDir(slug);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((n) => !isInProgress(n))
    .sort(natural)
    .map((name) => {
      const images = readdirSync(join(base, name))
        .filter((f) => IMG.test(f))
        .sort(natural)
        .map((f) => `assets/${slug}/store/${name}/${f}`);
      return { key: name, label: cleanTitle(name), images };
    })
    .filter((g) => g.images.length > 0);
}

export function hasStore(slug: string): boolean {
  return storeGroups(slug).length > 0;
}

export function storeCount(slug: string): number {
  return storeGroups(slug).reduce((n, g) => n + g.images.length, 0);
}

/** Flat list of every store image, for the card carousel preview. */
export function allStoreImages(slug: string): string[] {
  return storeGroups(slug).flatMap((g) => g.images);
}

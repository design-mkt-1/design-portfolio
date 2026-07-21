// Build-only helper (uses node:fs) — import from .astro frontmatter only.
// "Play Market & App Store" carousel assets, auto-detected from disk:
//   public/assets/<slug>/store/appstore/*     → App Store screenshots
//   public/assets/<slug>/store/playmarket/*   → Play Market screenshots
// Drop images in either folder and the section appears; no data edits needed.
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const IMG = /\.(webp|png|jpe?g)$/i;
const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

export interface StoreGroup {
  key: 'appstore' | 'playmarket';
  label: string;
  images: string[];
}

const PLATFORMS: { key: StoreGroup['key']; label: string }[] = [
  { key: 'appstore', label: 'App Store' },
  { key: 'playmarket', label: 'Play Market' },
];

function listImages(slug: string, platform: string): string[] {
  const dir = join(process.cwd(), 'public', 'assets', slug, 'store', platform);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => IMG.test(f))
    .sort(natural)
    .map((f) => `assets/${slug}/store/${platform}/${f}`);
}

/** Platform groups that actually have images, in App Store → Play Market order. */
export function storeGroups(slug: string): StoreGroup[] {
  return PLATFORMS.map((p) => ({ ...p, images: listImages(slug, p.key) })).filter((g) => g.images.length > 0);
}

export function hasStore(slug: string): boolean {
  return storeGroups(slug).length > 0;
}

export function storeCount(slug: string): number {
  return storeGroups(slug).reduce((n, g) => n + g.images.length, 0);
}

/** Flat list of every store image (App Store first), for card previews. */
export function allStoreImages(slug: string): string[] {
  return storeGroups(slug).flatMap((g) => g.images);
}

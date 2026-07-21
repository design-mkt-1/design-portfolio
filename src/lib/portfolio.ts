// Build-only helper (uses node:fs) — import from .astro frontmatter only.
// Banners and landings are auto-detected from folders on disk, so new uploads
// wire themselves — no edits to projects.ts needed.
//   banners:  public/assets/<slug>/banners/<Set>/{1x1,9x16,16x9,4x5}.webp
//   landings: public/assets/<slug>/landings/<Name>/*mobile*, *desktop*
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SIZE_ORDER, type MediaItem, type LandingItem, type SizeKey, type Project } from '../data/projects';
import { readyVideos } from './videos';
import { hasStore } from './store';

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
const IMG = /\.(webp|png|jpe?g)$/i;

function kindDir(slug: string, kind: 'banners' | 'landings'): string {
  return join(process.cwd(), 'public', 'assets', slug, kind);
}
function setFolders(slug: string, kind: 'banners' | 'landings'): string[] {
  const d = kindDir(slug, kind);
  if (!existsSync(d)) return [];
  return readdirSync(d, { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .map((x) => x.name)
    .sort(natural);
}

/** Banners, natural (ID) order; only size-keys whose file exists are included. */
export function projectBanners(slug: string): MediaItem[] {
  return setFolders(slug, 'banners')
    .map((folder) => {
      const files = readdirSync(join(kindDir(slug, 'banners'), folder));
      const sizes: Partial<Record<SizeKey, string>> = {};
      for (const k of SIZE_ORDER) {
        if (files.includes(`${k}.webp`)) sizes[k] = `assets/${slug}/banners/${folder}/${k}.webp`;
      }
      return { title: folder, sizes } as MediaItem;
    })
    .filter((m) => Object.keys(m.sizes).length > 0);
}

/** Landings, natural order; a *mobile* and/or *desktop* image per folder. */
export function projectLandings(slug: string): LandingItem[] {
  return setFolders(slug, 'landings')
    .map((folder) => {
      const files = readdirSync(join(kindDir(slug, 'landings'), folder)).filter((f) => IMG.test(f));
      const mobile = files.find((f) => /mobile/i.test(f));
      const desktop = files.find((f) => /desktop/i.test(f));
      const item: LandingItem = { title: folder };
      if (mobile) item.mobile = `assets/${slug}/landings/${folder}/${mobile}`;
      if (desktop) item.desktop = `assets/${slug}/landings/${folder}/${desktop}`;
      return item;
    })
    .filter((l) => l.mobile || l.desktop);
}

export function hasPortfolio(p: Project): boolean {
  return (
    projectBanners(p.slug).length > 0 ||
    projectLandings(p.slug).length > 0 ||
    readyVideos(p.videos).length > 0 ||
    hasStore(p.slug)
  );
}

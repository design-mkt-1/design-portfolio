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

/** Build-time check for a /public asset (e.g. a logo not yet uploaded). */
export function assetExists(relPath: string): boolean {
  if (!relPath) return false;
  return existsSync(join(process.cwd(), 'public', relPath));
}

export function hasPortfolio(p: Project): boolean {
  return (
    projectBanners(p.slug).length > 0 ||
    projectLandings(p.slug).length > 0 ||
    readyVideos(p.videos).length > 0 ||
    hasStore(p.slug)
  );
}

// ---- section routing --------------------------------------------------------
// A project offers up to two top-level sections: a Brand Book and a Portfolio.
// When only one exists we skip the chooser at /<slug> and open it directly.

export type Section = 'brandbook' | 'portfolio';

/** The sections a project actually has, in display order. */
export function projectSections(p: Project): Section[] {
  const s: Section[] = [];
  if (p.brandbook) s.push('brandbook');
  if (hasPortfolio(p)) s.push('portfolio');
  return s;
}

/** Where a project card links: a lone section opens directly (skipping the
 *  chooser); 0 or 2 sections go to the /<slug> chooser page. */
export function projectEntry(p: Project): string {
  const s = projectSections(p);
  return s.length === 1 ? `/${p.slug}/${s[0]}` : `/${p.slug}`;
}

/** True when the chooser is bypassed (exactly one section), so /<slug> redirects. */
export function skipsChooser(p: Project): boolean {
  return projectSections(p).length === 1;
}

/** Breadcrumb entry for the project on its section pages. When the chooser is
 *  skipped, /<slug> just bounces back to the same page, so render a plain label. */
export function projectCrumb(p: Project): { label: string; href?: string } {
  return skipsChooser(p) ? { label: p.name } : { label: p.name, href: `/${p.slug}` };
}

/** Back-link for the top-level section pages (Brand Book / Portfolio): home when
 *  the chooser is skipped, otherwise the chooser. */
export function sectionBack(p: Project): { label: string; href: string } {
  return skipsChooser(p) ? { label: 'All projects', href: '/' } : { label: p.name, href: `/${p.slug}` };
}

// Build-only helper (uses node:fs) — import from .astro frontmatter only.
// Banners and landings are auto-detected from folders on disk, so new uploads
// wire themselves — no edits to projects.ts needed.
//   banners:  public/assets/<slug>/banners/<Set>/{1x1,9x16,16x9,4x5}.webp
//   landings: public/assets/<slug>/landings/<Name>/*mobile*, *desktop*
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { SIZE_ORDER, projects, type MediaItem, type LandingItem, type SizeKey, type Project } from '../data/projects';
import { readyVideos } from './videos';
import { hasStore } from './store';
import { cleanTitle, isInProgress } from './titles';

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
    .filter((n) => !isInProgress(n))
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
      return { title: cleanTitle(folder), sizes } as MediaItem;
    })
    .filter((m) => Object.keys(m.sizes).length > 0);
}

/** Landings, natural order; a *mobile*, *tablet*, and/or *desktop* image per folder. */
export function projectLandings(slug: string): LandingItem[] {
  return setFolders(slug, 'landings')
    .map((folder) => {
      const files = readdirSync(join(kindDir(slug, 'landings'), folder)).filter((f) => IMG.test(f));
      const item: LandingItem = { title: cleanTitle(folder) };
      for (const device of ['mobile', 'tablet', 'desktop'] as const) {
        const file = files.find((f) => new RegExp(device, 'i').test(f));
        if (file) item[device] = `assets/${slug}/landings/${folder}/${file}`;
      }
      return item;
    })
    .filter((l) => l.mobile || l.tablet || l.desktop);
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

/** Projects worth showing on the home grid — at least one real section.
 *  Empty scaffolds (e.g. a rebrand with no uploads yet) read as unfinished
 *  on a partner-facing site, so they stay hidden until content lands. */
export function visibleProjects(): Project[] {
  return projects.filter((p) => projectSections(p).length > 0);
}

/** Per-project social share card (committed via scripts/gen-og-cards.mjs). */
export function projectOg(p: Project): string | undefined {
  const path = `assets/${p.slug}/og-card.png`;
  return assetExists(path) ? path : undefined;
}

// ---- section routing --------------------------------------------------------
// A project offers up to two top-level sections: a Brand Book and a Portfolio.
// When only one exists we skip the chooser at /<slug> and open it directly.

export type Section = 'brandbook' | 'portfolio';

/** Numbered brand-book page frames on disk (1.webp, 2.jpg, …), in order. */
export function brandbookFrames(slug: string): string[] {
  const dir = join(process.cwd(), 'public', 'assets', slug, 'brandbook');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^\d+\.(webp|png|jpe?g)$/i.test(f))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .map((f) => `assets/${slug}/brandbook/${f}`);
}

/** A brand book counts only when it has real content — a Figma link, page frames
 *  on disk, or an uploaded PDF — so a declared-but-not-yet-uploaded book (folder
 *  scaffolded ahead of assets) doesn't render an empty viewer. */
export function hasBrandbook(p: Project): boolean {
  if (!p.brandbook) return false;
  if (p.brandbook.type === 'figma') return true;
  return brandbookFrames(p.slug).length > 0 || assetExists(p.brandbook.url);
}

/** The sections a project actually has, in display order. */
export function projectSections(p: Project): Section[] {
  const s: Section[] = [];
  if (hasBrandbook(p)) s.push('brandbook');
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

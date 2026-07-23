// Build-only helper (uses node:fs) — import from .astro frontmatter only.
// Banners and landings are auto-detected from folders on disk, so new uploads
// wire themselves — no edits to projects.ts needed.
//   banners:  public/assets/<slug>/banners/<Set>/{1x1,9x16,16x9,4x5}.webp
//   landings: public/assets/<slug>/landings/<Name>/*mobile*, *desktop*
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { imageSize } from 'image-size';
import { projects, type MediaItem, type LandingItem, type VideoItem, type SizeKey, type Project } from '../data/projects';
import { hasStore } from './store';
import { cleanTitle, isInProgress } from './titles';

const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
const IMG = /\.(webp|png|jpe?g)$/i;

function kindDir(slug: string, kind: 'banners' | 'landings' | 'videos'): string {
  return join(process.cwd(), 'public', 'assets', slug, kind);
}
function setFolders(slug: string, kind: 'banners' | 'landings' | 'videos'): string[] {
  const d = kindDir(slug, kind);
  if (!existsSync(d)) return [];
  return readdirSync(d, { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .map((x) => x.name)
    .filter((n) => !isInProgress(n))
    // newest work first: folders are "<task ID> - Name", so descending natural
    // order puts the highest (latest) IDs at the top of every gallery
    .sort((a, b) => natural(b, a));
}

/** Aspect buckets: real pixel dimensions are snapped to the nearest ratio, so
 *  uploads keep their original filenames (`1080х1080_уз.jpg`, `1_Pragmatic_…`)
 *  and still land in the right size tab. */
const RATIO_BUCKETS: [SizeKey, number][] = [
  ['1x1', 1],
  ['9x16', 9 / 16],
  ['16x9', 16 / 9],
  ['4x5', 4 / 5],
  ['2x1', 2],
  ['3x1', 3],
  ['4x1', 4],
];
function bucketFor(w: number, h: number): SizeKey {
  const r = w / h;
  let best: SizeKey = '1x1';
  let bestDiff = Infinity;
  for (const [key, br] of RATIO_BUCKETS) {
    const diff = Math.abs(Math.log(r / br));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = key;
    }
  }
  return best;
}

/** Banners, natural (ID) order. Every image in a set folder is measured and
 *  bucketed by aspect ratio. One file per ratio → a classic multi-size item;
 *  several files sharing a ratio (step banners, slider series) → the folder
 *  splits into numbered items. Results are cached — probing reads files. */
const bannerCache = new Map<string, MediaItem[]>();
export function projectBanners(slug: string): MediaItem[] {
  const hit = bannerCache.get(slug);
  if (hit) return hit;
  const out: MediaItem[] = [];
  for (const folder of setFolders(slug, 'banners')) {
    const dir = join(kindDir(slug, 'banners'), folder);
    const files = readdirSync(dir).filter((f) => IMG.test(f)).sort(natural);
    type Probe = { file: string; key: SizeKey; w: number; h: number };
    const probes: Probe[] = [];
    for (const f of files) {
      try {
        const { width, height } = imageSize(readFileSync(join(dir, f)));
        if (width && height) probes.push({ file: f, key: bucketFor(width, height), w: width, h: height });
      } catch {
        /* not a measurable image — skip the file */
      }
    }
    if (!probes.length) continue;
    const rel = (f: string) => `assets/${slug}/banners/${folder}/${f}`;
    const title = cleanTitle(folder);
    // Files sharing EXACT dimensions are separate creatives (step banners,
    // slider series) → the folder splits into numbered items. Distinct
    // dimensions are placements of ONE creative → a single multi-size item.
    const dimCounts = new Map<string, number>();
    for (const p of probes) dimCounts.set(`${p.w}x${p.h}`, (dimCounts.get(`${p.w}x${p.h}`) ?? 0) + 1);
    if (Math.max(...dimCounts.values()) > 1) {
      probes.forEach((p, i) =>
        out.push({
          title: `${title} ${i + 1}`,
          sizes: { [p.key]: rel(p.file) },
          labels: { [p.key]: `${p.w} × ${p.h}` },
        }),
      );
    } else {
      const sizes: MediaItem['sizes'] = {};
      const labels: MediaItem['labels'] = {};
      for (const p of probes) {
        // nearest free bucket if the ideal one is already taken
        let key = p.key;
        if (sizes[key]) {
          const free = RATIO_BUCKETS
            .filter(([k]) => !sizes[k])
            .sort((a, b) => Math.abs(Math.log(p.w / p.h / a[1])) - Math.abs(Math.log(p.w / p.h / b[1])))[0];
          if (!free) continue;
          key = free[0];
        }
        sizes[key] = rel(p.file);
        labels[key] = `${p.w} × ${p.h}`;
      }
      out.push({ title, sizes, labels });
    }
  }
  bannerCache.set(slug, out);
  return out;
}

/** Landings, natural order; a *mobile*, *tablet*, and/or *desktop* image per folder. */
export function projectLandings(slug: string): LandingItem[] {
  return setFolders(slug, 'landings')
    .flatMap((folder) => {
      const files = readdirSync(join(kindDir(slug, 'landings'), folder)).filter((f) => IMG.test(f));
      // "mob"/"dekstop" tolerated — real-world upload spellings that would
      // otherwise silently drop a version.
      const patterns = { mobile: /mob/i, tablet: /tablet/i, desktop: /desktop|dekstop/i } as const;
      const byDevice = {
        mobile: files.filter((f) => patterns.mobile.test(f)),
        tablet: files.filter((f) => patterns.tablet.test(f)),
        desktop: files.filter((f) => patterns.desktop.test(f)),
      };
      const devices = ['mobile', 'tablet', 'desktop'] as const;
      // Common case: at most one file per device → one landing, stray numbers
      // in names ("430px (Mobile 2).jpg") are just designer naming noise.
      if (devices.every((d) => byDevice[d].length <= 1)) {
        const item: LandingItem = { title: cleanTitle(folder) };
        for (const d of devices) if (byDevice[d][0]) item[d] = `assets/${slug}/landings/${folder}/${byDevice[d][0]}`;
        return [item];
      }
      // A device has several files → the folder holds numbered variants of one
      // landing ("desktop - 1.jpg" + "mobile 1.jpg", "desktop - 2.jpg" + …).
      // Pair files by the LAST small number in the name (dimension tokens like
      // "375-728" stripped first; no number → variant 1) into numbered items.
      const variants = new Map<number, LandingItem>();
      for (const device of devices) {
        for (const file of byDevice[device]) {
          const stem = file.replace(/\.[^.]+$/, '').replace(/\d{3,4}\s*[-xх×]\s*\d{3,4}/gi, '');
          const n = Number(stem.match(/(\d+)(?!.*\d)/)?.[1] ?? 1);
          const v = n >= 1 && n < 100 ? n : 1;
          if (!variants.has(v)) variants.set(v, { title: cleanTitle(folder) });
          const item = variants.get(v)!;
          if (!item[device]) item[device] = `assets/${slug}/landings/${folder}/${file}`;
        }
      }
      const items = [...variants.entries()].sort((a, b) => a[0] - b[0]).map(([, item]) => item);
      if (items.length > 1) items.forEach((item, i) => (item.title = `${cleanTitle(folder)} ${i + 1}`));
      return items;
    })
    .filter((l) => l.mobile || l.tablet || l.desktop);
}

/** Videos, auto-detected like banners: one folder per video under
 *  videos/<ID - Name>/ with dimension-named MP4s (1080x1080.mp4, 1920x1080.mp4;
 *  Cyrillic х and dashes tolerated) and a cover.* poster. The poster is
 *  generated automatically by the compress-videos workflow if missing, so a
 *  folder shows up within a minute of uploading the MP4s. */
const VIDEO_DIM = /(\d{3,4})\s*[xх×\-]\s*(\d{3,4})/i;
const videoCache = new Map<string, VideoItem[]>();
export function projectVideos(slug: string): VideoItem[] {
  const hit = videoCache.get(slug);
  if (hit) return hit;
  const out: VideoItem[] = [];
  for (const folder of setFolders(slug, 'videos')) {
    const dir = join(kindDir(slug, 'videos'), folder);
    const files = readdirSync(dir);
    const poster = files.find((f) => /^cover.*\.(webp|png|jpe?g)$/i.test(f));
    if (!poster) continue;
    const src: VideoItem['src'] = {};
    const labels: VideoItem['labels'] = {};
    for (const f of files.filter((n) => /\.mp4$/i.test(n)).sort(natural)) {
      const m = f.match(VIDEO_DIM);
      if (!m) continue;
      const [w, h] = [parseInt(m[1], 10), parseInt(m[2], 10)];
      const key = bucketFor(w, h);
      if (!src[key]) {
        src[key] = `assets/${slug}/videos/${folder}/${f}`;
        labels[key] = `${w} × ${h}`;
      }
    }
    if (Object.keys(src).length === 0) continue;
    out.push({ title: cleanTitle(folder), poster: `assets/${slug}/videos/${folder}/${poster}`, src, labels });
  }
  videoCache.set(slug, out);
  return out;
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
    projectVideos(p.slug).length > 0 ||
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

// ---- portfolio format routing -----------------------------------------------
// Same skip pattern one level down: when a project has exactly one portfolio
// format, /<slug>/portfolio redirects straight to it instead of showing a
// one-card chooser.

export type PortfolioFormat = 'banners' | 'landings' | 'videos' | 'store';

export function portfolioFormats(p: Project): PortfolioFormat[] {
  const f: PortfolioFormat[] = [];
  if (projectBanners(p.slug).length > 0) f.push('banners');
  if (projectLandings(p.slug).length > 0) f.push('landings');
  if (projectVideos(p.slug).length > 0) f.push('videos');
  if (hasStore(p.slug)) f.push('store');
  return f;
}

export function skipsFormatChooser(p: Project): boolean {
  return portfolioFormats(p).length === 1;
}

/** Back-link for a format page: past the skipped chooser when there is one. */
export function formatBack(p: Project): { label: string; href: string } {
  return skipsFormatChooser(p) ? sectionBack(p) : { label: 'Portfolio', href: `/${p.slug}/portfolio` };
}

/** Breadcrumb for the Portfolio level on format pages: a plain label when the
 *  chooser is skipped (it would just bounce back), a link otherwise. */
export function portfolioCrumb(p: Project): { label: string; href?: string } {
  return skipsFormatChooser(p) ? { label: 'Portfolio' } : { label: 'Portfolio', href: `/${p.slug}/portfolio` };
}

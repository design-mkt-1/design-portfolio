// =============================================================================
// Marketing Solutions — project catalog
//
// This is the single file you edit to add/adjust projects. Drop assets into
// public/assets/<slug>/... (see public/assets/README.md), then reference them
// here. Paths are relative to /public; the base path is added automatically.
//
// NOTE: the media below currently points at generated *placeholders* so the
// site renders end-to-end. Replace with real uploads (same filenames work).
// =============================================================================

export type SizeKey = '1x1' | '9x16' | '16x9' | '4x5' | '2x1';

export const SIZE_ORDER: SizeKey[] = ['1x1', '9x16', '16x9', '4x5', '2x1'];

export const SIZE_LABEL: Record<SizeKey, string> = {
  '1x1': '1080 × 1080',
  '9x16': '1080 × 1920',
  '16x9': '1920 × 1080',
  '4x5': '1080 × 1350',
  '2x1': '600 × 300',
};

export const SIZE_RATIO: Record<SizeKey, string> = {
  '1x1': '1 / 1',
  '9x16': '9 / 16',
  '16x9': '16 / 9',
  '4x5': '4 / 5',
  '2x1': '2 / 1',
};

export interface MediaItem {
  title: string;
  /** aspect-ratio key -> file path under /public. Include only sizes that exist. */
  sizes: Partial<Record<SizeKey, string>>;
  /** optional per-size label with the file's real pixel dimensions */
  labels?: Partial<Record<SizeKey, string>>;
}

export interface Brandbook {
  type: 'figma' | 'pdf';
  /** figma embed/share URL, or a PDF path under /public */
  url: string;
}

export type Device = 'mobile' | 'tablet' | 'desktop';

/** Device order: mobile first — gambling products are mobile-led. */
export const DEVICE_ORDER: Device[] = ['mobile', 'tablet', 'desktop'];

export const DEVICE_LABEL: Record<Device, string> = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
};

export interface LandingItem {
  title: string;
  /** device -> image path under /public. Include only the versions that exist. */
  mobile?: string;
  tablet?: string;
  desktop?: string;
}

/** Auto-detected from public/assets/<slug>/videos/ (see src/lib/portfolio.ts).
 *  src values may also be absolute URLs (GitHub Release asset / CDN). */
export interface VideoItem {
  title: string;
  /** poster image shown on the gallery tile (auto-generated when missing) */
  poster: string;
  /** size-key -> MP4 path or URL */
  src: Partial<Record<SizeKey, string>>;
  /** optional per-size label with the file's real pixel dimensions */
  labels?: Partial<Record<SizeKey, string>>;
}

/** GEO / market a project is based in. `code` drives the flag icon (see Flag.astro). */
export type GeoCode = 'RO' | 'UA' | 'GE' | 'UZ' | 'WW';

export interface Geo {
  code: GeoCode;
  /** short human label shown next to the flag, e.g. "Romania" */
  label: string;
}

export interface Project {
  slug: string;
  name: string;
  logo: string;
  /** square brand icon (used as the on-page header icon and the browser-tab favicon) */
  favicon?: string;
  /** market the brand operates in — flag + label shown on the home grid */
  geo?: Geo;
  tagline?: string;
  /** optional per-project accent override (hex) */
  accent?: string;
  /** Figma brand book link, opened via the "Open in Figma" button */
  figma?: string;
  brandbook?: Brandbook;
  // Banners, landings, videos, and store sets are auto-detected from disk
  // (see src/lib/portfolio.ts / src/lib/store.ts) — nothing to declare here.
}

// ---- helpers ----------------------------------------------------------------

export function firstSize(item: MediaItem): string | undefined {
  return item.sizes['1x1'] ?? Object.values(item.sizes)[0];
}

export function availableSizes(item: MediaItem): SizeKey[] {
  return SIZE_ORDER.filter((k) => item.sizes[k]);
}

export function availableDevices(item: LandingItem): Device[] {
  return DEVICE_ORDER.filter((d) => item[d]);
}

/** Preferred preview for a landing tile: mobile first, then tablet, then desktop. */
export function landingThumb(item: LandingItem): string | undefined {
  return item.mobile ?? item.tablet ?? item.desktop;
}

export function availableVideoSizes(item: VideoItem): SizeKey[] {
  return SIZE_ORDER.filter((k) => item.src[k]);
}

// ---- catalog ----------------------------------------------------------------

export const projects: Project[] = [
  {
    slug: 'winboss',
    name: 'Winboss',
    logo: 'assets/winboss/logo_winboss.svg',
    favicon: 'assets/winboss/favicon_winboss.webp',
    geo: { code: 'RO', label: 'Romania' },
    accent: '#f5b301',
    tagline: 'Full brand system and campaign production.',
    figma: 'https://www.figma.com/design/yP4cFDQU6j2J8QVWHr4CUM/WinBoss?node-id=4-464&p=f&t=mUR3syzALRg87bR2-0',
    brandbook: { type: 'pdf', url: 'assets/winboss/brandbook/winboss-brandbook.pdf' },
  },
  {
    slug: 'win2',
    name: 'Win2',
    logo: 'assets/win2/logo_win2.webp',
    favicon: 'assets/win2/favicon_win2.webp',
    geo: { code: 'RO', label: 'Romania' },
    accent: '#22d3ee',
    tagline: 'Performance creative across every placement.',
  },
  {
    slug: 'fansport',
    name: 'Fansport',
    logo: 'assets/fansport/logo_fansport.svg',
    favicon: 'assets/fansport/favicon_fansport.svg',
    geo: { code: 'WW', label: 'Worldwide · Asia, Europe' },
    accent: '#34d399',
    tagline: 'Brand identity and guidelines.',
    figma: 'https://www.figma.com/design/eRr6wNLDitV8iWyUZY6qM8/FanSport?node-id=0-1&p=f&t=J65JMwCpOZU2TEya-0',
    brandbook: { type: 'pdf', url: 'assets/fansport/brandbook/fansport-brandbook.pdf' },
  },
  {
    slug: 'topbet',
    name: 'Topbet',
    logo: 'assets/topbet/logo_topbet.svg',
    favicon: 'assets/topbet/favicon_topbet.svg',
    geo: { code: 'WW', label: 'Worldwide · Asia, Europe' },
    accent: '#fb7185',
    tagline: 'Brand identity and guidelines.',
    figma: 'https://www.figma.com/design/5UpnZQKQOzud31MuwpTO1R/TopBet?node-id=0-1&p=f&t=hrOfpLlAyhsC0GC9-0',
    brandbook: { type: 'pdf', url: 'assets/topbet/brandbook/topbet-brandbook.pdf' },
  },
  {
    // Brandbook + banners. Assets land under public/assets/top-win/ (logo_top-win.*,
    // favicon_top-win.*, brandbook/*, banners/*); the site wires them up on upload.
    slug: 'top-win',
    name: 'Top-Win',
    logo: 'assets/top-win/logo_topwin.svg',
    favicon: 'assets/top-win/favicon_topwin.svg',
    geo: { code: 'UA', label: 'Ukraine' },
    accent: '#a78bfa',
    tagline: 'Brand identity and guidelines.',
    brandbook: { type: 'pdf', url: 'assets/top-win/brandbook/top-win-brandbook.pdf' },
  },
  {
    // Brandbook + banners, both landing in the coming days. Assets go under
    // public/assets/bet2fun/ (logo_bet2fun.*, favicon_bet2fun.*, brandbook/*, banners/*).
    slug: 'bet2fun',
    name: 'Bet2Fun',
    logo: 'assets/bet2fun/logo_bet2fun.svg',
    favicon: 'assets/bet2fun/favicon_bet2fun.svg',
    geo: { code: 'UA', label: 'Ukraine' },
    accent: '#fb923c',
    tagline: 'Brand identity and guidelines.',
    brandbook: { type: 'pdf', url: 'assets/bet2fun/brandbook/bet2fun-brandbook.pdf' },
  },
  {
    // Scaffolded ahead of uploads (hidden from the home grid until content lands).
    // Assets go under public/assets/max-win/ (logo_maxwin.*, favicon_maxwin.*,
    // brandbook/*, banners/*, landings/*, videos/*, store/*).
    slug: 'max-win',
    name: 'Max-Win',
    logo: 'assets/max-win/logo_maxwin.svg',
    favicon: 'assets/max-win/favicon_maxwin.svg',
    geo: { code: 'GE', label: 'Georgia' },
    accent: '#ef4444',
    tagline: 'Brand identity and guidelines.',
  },
  {
    // Scaffolded ahead of uploads (hidden from the home grid until content lands).
    // Assets go under public/assets/doncash/ (logo_doncash.*, favicon_doncash.*, …).
    slug: 'doncash',
    name: 'DonCash',
    logo: 'assets/doncash/logo_doncash.svg',
    favicon: 'assets/doncash/favicon_doncash.svg',
    geo: { code: 'UZ', label: 'Uzbekistan' },
    accent: '#38bdf8',
    tagline: 'Brand identity and guidelines.',
  },
  {
    // Rebrand in progress — banners only for now, kept last until the new identity
    // lands. Drop creatives into public/assets/jackpot/banners/ to light up Portfolio.
    slug: 'jackpot',
    name: 'Jackpot',
    logo: 'assets/jackpot/logo_jackpot.svg',
    favicon: 'assets/jackpot/favicon_jackpot.svg',
    geo: { code: 'WW', label: 'Worldwide · Asia, Europe' },
    accent: '#f472b6',
    tagline: 'Rebrand in progress.',
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

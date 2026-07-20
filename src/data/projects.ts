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

export type SizeKey = '1x1' | '9x16' | '16x9' | '4x5';

export const SIZE_ORDER: SizeKey[] = ['1x1', '9x16', '16x9', '4x5'];

export const SIZE_LABEL: Record<SizeKey, string> = {
  '1x1': '1080 × 1080',
  '9x16': '1080 × 1920',
  '16x9': '1920 × 1080',
  '4x5': '1080 × 1350',
};

export const SIZE_RATIO: Record<SizeKey, string> = {
  '1x1': '1 / 1',
  '9x16': '9 / 16',
  '16x9': '16 / 9',
  '4x5': '4 / 5',
};

export interface MediaItem {
  title: string;
  /** aspect-ratio key -> file path under /public. Include only sizes that exist. */
  sizes: Partial<Record<SizeKey, string>>;
}

export interface Brandbook {
  type: 'figma' | 'pdf';
  /** figma embed/share URL, or a PDF path under /public */
  url: string;
}

export interface Project {
  slug: string;
  name: string;
  logo: string;
  tagline?: string;
  /** optional per-project accent override (hex) */
  accent?: string;
  brandbook?: Brandbook;
  banners: MediaItem[];
  videos: MediaItem[];
  landings: string[];
}

// ---- helpers ----------------------------------------------------------------

export function hasPortfolio(p: Project): boolean {
  return p.banners.length > 0 || p.videos.length > 0 || p.landings.length > 0;
}

export function firstSize(item: MediaItem): string | undefined {
  return item.sizes['1x1'] ?? Object.values(item.sizes)[0];
}

export function availableSizes(item: MediaItem): SizeKey[] {
  return SIZE_ORDER.filter((k) => item.sizes[k]);
}

// -- placeholder path helpers (kept terse so the data reads cleanly) ----------
const ph = (slug: string, kind: string, name: string, size: SizeKey) =>
  `assets/${slug}/${kind}/${name}/${size}.svg`;
const mkMedia = (slug: string, kind: 'banners' | 'videos', name: string, title: string, sizes: SizeKey[]): MediaItem => ({
  title,
  sizes: Object.fromEntries(sizes.map((s) => [s, ph(slug, kind, name, s)])) as MediaItem['sizes'],
});

// ---- catalog ----------------------------------------------------------------

export const projects: Project[] = [
  {
    slug: 'winboss',
    name: 'Winboss',
    logo: 'assets/winboss/logo.svg',
    tagline: 'Full brand system and campaign production.',
    brandbook: { type: 'pdf', url: 'assets/winboss/brandbook/winboss-brandbook.pdf' },
    banners: [
      mkMedia('winboss', 'banners', 'welcome-bonus', 'Welcome Bonus', ['1x1', '9x16', '16x9', '4x5']),
      mkMedia('winboss', 'banners', 'weekend-cashback', 'Weekend Cashback', ['1x1', '9x16', '16x9']),
      mkMedia('winboss', 'banners', 'jackpot-night', 'Jackpot Night', ['1x1', '9x16', '16x9', '4x5']),
    ],
    videos: [
      mkMedia('winboss', 'videos', 'brand-intro', 'Brand Intro', ['1x1', '9x16', '16x9']),
    ],
    landings: [
      'assets/winboss/landings/homepage.svg',
      'assets/winboss/landings/promo.svg',
      'assets/winboss/landings/vip.svg',
    ],
  },
  {
    slug: 'win2',
    name: 'Win2',
    logo: 'assets/win2/logo.svg',
    tagline: 'Performance creative across every placement.',
    banners: [
      mkMedia('win2', 'banners', 'first-deposit', 'First Deposit', ['1x1', '9x16', '16x9', '4x5']),
      mkMedia('win2', 'banners', 'free-spins', 'Free Spins', ['1x1', '9x16', '16x9']),
    ],
    videos: [
      mkMedia('win2', 'videos', 'promo-teaser', 'Promo Teaser', ['1x1', '9x16', '16x9']),
    ],
    landings: [
      'assets/win2/landings/homepage.svg',
      'assets/win2/landings/offer.svg',
    ],
  },
  {
    slug: 'fansport',
    name: 'Fansport',
    logo: 'assets/fansport/logo.svg',
    tagline: 'Brand identity and guidelines.',
    brandbook: { type: 'pdf', url: 'assets/fansport/brandbook/fansport-brandbook.pdf' },
    banners: [],
    videos: [],
    landings: [],
  },
  {
    slug: 'topbet',
    name: 'Topbet',
    logo: 'assets/topbet/logo.svg',
    tagline: 'Brand identity and guidelines.',
    brandbook: { type: 'pdf', url: 'assets/topbet/brandbook/topbet-brandbook.pdf' },
    banners: [],
    videos: [],
    landings: [],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

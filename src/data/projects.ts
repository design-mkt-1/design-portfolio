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

export type Device = 'mobile' | 'desktop';

/** Device order: mobile first — gambling products are mobile-led. */
export const DEVICE_ORDER: Device[] = ['mobile', 'desktop'];

export const DEVICE_LABEL: Record<Device, string> = {
  mobile: 'Mobile',
  desktop: 'Desktop',
};

export interface LandingItem {
  title: string;
  /** device -> image path under /public. Include only the versions that exist. */
  mobile?: string;
  desktop?: string;
}

export interface VideoItem {
  title: string;
  /** In-repo 1×1 poster image (webp) shown on the gallery tile before play. */
  poster: string;
  /** size-key -> MP4 URL (GitHub Release asset or any CDN). Include only aspects that exist. */
  src: Partial<Record<SizeKey, string>>;
}

export interface Project {
  slug: string;
  name: string;
  logo: string;
  /** square brand icon (used as the on-page header icon and the browser-tab favicon) */
  favicon?: string;
  tagline?: string;
  /** optional per-project accent override (hex) */
  accent?: string;
  /** Figma brand book link, opened via the "Open in Figma" button */
  figma?: string;
  brandbook?: Brandbook;
  banners: MediaItem[];
  /** Videos are hosted on YouTube (unlisted); only the poster lives in the repo. */
  videos: VideoItem[];
  landings: LandingItem[];
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

export function availableDevices(item: LandingItem): Device[] {
  return DEVICE_ORDER.filter((d) => item[d]);
}

/** Preferred preview for a landing tile: mobile first, else desktop. */
export function landingThumb(item: LandingItem): string | undefined {
  return item.mobile ?? item.desktop;
}

export function availableVideoSizes(item: VideoItem): SizeKey[] {
  return SIZE_ORDER.filter((k) => item.src[k]);
}

// -- placeholder path helpers (kept terse so the data reads cleanly) ----------
const ph = (slug: string, kind: string, name: string, size: SizeKey) =>
  `assets/${slug}/${kind}/${name}/${size}.svg`;
const mkMedia = (slug: string, kind: 'banners' | 'videos', name: string, title: string, sizes: SizeKey[]): MediaItem => ({
  title,
  sizes: Object.fromEntries(sizes.map((s) => [s, ph(slug, kind, name, s)])) as MediaItem['sizes'],
});
const mkLanding = (slug: string, name: string, title: string, devices: Device[]): LandingItem => ({
  title,
  ...Object.fromEntries(devices.map((d) => [d, `assets/${slug}/landings/${name}/${d}.svg`])),
});

// Real uploaded media (normalized to size-keyed .webp). Defaults to all 4 sizes.
const realMedia = (
  slug: string,
  kind: 'banners' | 'videos',
  folder: string,
  sizes: SizeKey[] = ['1x1', '9x16', '16x9', '4x5'],
): MediaItem => ({
  title: folder,
  sizes: Object.fromEntries(sizes.map((s) => [s, `assets/${slug}/${kind}/${folder}/${s}.webp`])) as MediaItem['sizes'],
});

// ---- catalog ----------------------------------------------------------------

export const projects: Project[] = [
  {
    slug: 'winboss',
    name: 'Winboss',
    logo: 'assets/winboss/logo_winboss.svg',
    favicon: 'assets/winboss/favicon_winboss.webp',
    accent: '#f5b301',
    tagline: 'Full brand system and campaign production.',
    figma: 'https://www.figma.com/design/yP4cFDQU6j2J8QVWHr4CUM/WinBoss?node-id=4-464&p=f&t=mUR3syzALRg87bR2-0',
    brandbook: { type: 'pdf', url: 'assets/winboss/brandbook/winboss-brandbook.pdf' },
    banners: [
      realMedia('winboss', 'banners', '25602 - BigBass Wheel'),
      realMedia('winboss', 'banners', '26590 - Floating SC'),
      realMedia('winboss', 'banners', '27093 - Multi Games'),
      realMedia('winboss', 'banners', '27164 - Floating Gates'),
      realMedia('winboss', 'banners', '27165 - Floating BH'),
      realMedia('winboss', 'banners', '27305 - Lesgo Tesla'),
      realMedia('winboss', 'banners', '27442 - Gettt Out'),
      realMedia('winboss', 'banners', '27480 - CrownCard'),
      realMedia('winboss', 'banners', '27486 - Big Fisher'),
      realMedia('winboss', 'banners', '27610 - Quadrilateral'),
      realMedia('winboss', 'banners', '27711 - Gift Tesla'),
      realMedia('winboss', 'banners', '27960 - DarkRedWheel'),
      realMedia('winboss', 'banners', '27962 - DarkGreenWheel'),
      realMedia('winboss', 'banners', '28003 - YellowWheel'),
      realMedia('winboss', 'banners', '28040 - Main Game'),
      realMedia('winboss', 'banners', '28048 - Carousel Games'),
      realMedia('winboss', 'banners', '28055 - Gimme Elem'),
      realMedia('winboss', 'banners', '28177 - Burning Big'),
      realMedia('winboss', 'banners', '28220 - Characters Blue'),
      realMedia('winboss', 'banners', '28239 - Pull Offer'),
      realMedia('winboss', 'banners', '28245 - Chamo'),
      realMedia('winboss', 'banners', '28285 - CloverBox'),
      realMedia('winboss', 'banners', '28286 - RedBox Neon'),
    ],
    // Videos: .mp4 files committed under videos/<title>/ (dimension-named) plus a
    // cover-<ID>.webp poster in the same folder. Each aspect tab appears only once
    // its file exists on disk, so entries can be committed before the MP4s land.
    videos: [
      {
        title: '27170 - AsimetricW Tesla',
        poster: 'assets/winboss/videos/27170 - AsimetricW Tesla/cover-27170.webp',
        src: {
          '1x1': 'assets/winboss/videos/27170 - AsimetricW Tesla/1080x1080.mp4',
          '9x16': 'assets/winboss/videos/27170 - AsimetricW Tesla/1080x1920.mp4',
          '16x9': 'assets/winboss/videos/27170 - AsimetricW Tesla/1920x1080.mp4',
        },
      },
    ],
    landings: [
      {
        title: '27735 - AlbaNeagra',
        mobile: 'assets/winboss/landings/27735 - AlbaNeagra/mobile_albaneagra.webp',
        desktop: 'assets/winboss/landings/27735 - AlbaNeagra/desktop_albaneagra.webp',
      },
    ],
  },
  {
    slug: 'win2',
    name: 'Win2',
    logo: 'assets/win2/logo_win2.webp',
    favicon: 'assets/win2/favicon_win2.webp',
    accent: '#22d3ee',
    tagline: 'Performance creative across every placement.',
    banners: [
      realMedia('win2', 'banners', '26954 - Hand SC'),
    ],
    videos: [],
    landings: [
      mkLanding('win2', 'homepage', 'Homepage', ['mobile', 'desktop']),
      mkLanding('win2', 'offer', 'Offer', ['mobile', 'desktop']),
    ],
  },
  {
    slug: 'fansport',
    name: 'Fansport',
    logo: 'assets/fansport/logo_fansport.svg',
    favicon: 'assets/fansport/favicon_fansport.svg',
    accent: '#34d399',
    tagline: 'Brand identity and guidelines.',
    figma: 'https://www.figma.com/design/eRr6wNLDitV8iWyUZY6qM8/FanSport?node-id=0-1&p=f&t=J65JMwCpOZU2TEya-0',
    brandbook: { type: 'pdf', url: 'assets/fansport/brandbook/fansport-brandbook.pdf' },
    banners: [],
    videos: [],
    landings: [],
  },
  {
    slug: 'topbet',
    name: 'Topbet',
    logo: 'assets/topbet/logo_topbet.svg',
    favicon: 'assets/topbet/favicon_topbet.svg',
    accent: '#fb7185',
    tagline: 'Brand identity and guidelines.',
    figma: 'https://www.figma.com/design/5UpnZQKQOzud31MuwpTO1R/TopBet?node-id=0-1&p=f&t=hrOfpLlAyhsC0GC9-0',
    brandbook: { type: 'pdf', url: 'assets/topbet/brandbook/topbet-brandbook.pdf' },
    banners: [],
    videos: [],
    landings: [],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

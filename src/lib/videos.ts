// Build-only helper (uses node:fs) — import from .astro frontmatter only.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { VideoItem } from '../data/projects';

/**
 * Videos whose 1×1 poster actually exists on disk. A video entry can be added to
 * the catalog with its YouTube IDs before the poster is uploaded; it stays hidden
 * (no broken tile) until the poster lands, then appears on the next build.
 */
export function readyVideos(videos: VideoItem[]): VideoItem[] {
  return videos.filter((v) => existsSync(join(process.cwd(), 'public', v.poster)));
}

// Build-only helper (uses node:fs) — import from .astro frontmatter only.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { VideoItem } from '../data/projects';

const onDisk = (p: string) => /^https?:\/\//.test(p) || existsSync(join(process.cwd(), 'public', p));

/**
 * Videos ready to show, with each entry's `src` pruned to the aspects whose file
 * actually exists (so a tab never 404s). A video appears only once its poster and
 * at least one source are present — entries can be committed before the MP4s land.
 */
export function readyVideos(videos: VideoItem[]): VideoItem[] {
  return videos
    .map((v) => ({
      ...v,
      src: Object.fromEntries(Object.entries(v.src).filter(([, p]) => onDisk(p))) as VideoItem['src'],
    }))
    .filter((v) => Object.keys(v.src).length > 0 && onDisk(v.poster));
}

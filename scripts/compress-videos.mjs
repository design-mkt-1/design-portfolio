// Video optimizer — runs automatically in CI (.github/workflows/compress-videos.yml)
// after every push that touches public/assets/**/videos/**, and works locally too
// (needs ffmpeg on PATH: `node scripts/compress-videos.mjs`).
//
// For every public/assets/<slug>/videos/<Set>/*.mp4:
//   1. Skip files already carrying our `comment=ms-optimized` metadata tag.
//   2. Re-encode (H.264 CRF 27, slow preset, faststart, AAC 96k) and keep the
//      result only if it is ≥10% smaller; otherwise the original is kept and
//      just tagged (fast remux) so it is never re-examined.
//   3. If the set folder has no cover.* poster, extract one automatically:
//      a frame at 4.5s (or the midpoint of shorter clips) from the 1080x1080
//      version (falling back to the first mp4) → cover.webp at up to 1080px.
//      A manually uploaded cover.* always wins.
import { readdirSync, existsSync, statSync, renameSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const ASSETS = join(ROOT, 'public', 'assets');
const TAG = 'ms-optimized';
const DIM = /(\d{3,4})\s*[xх×\-]\s*(\d{3,4})/i; // tolerate Cyrillic х and dashes

const run = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args], { stdio: ['ignore', 'inherit', 'inherit'] });
const probe = (args) => execFileSync('ffprobe', ['-v', 'error', ...args]).toString().trim();

function isTagged(file) {
  try {
    return probe(['-show_entries', 'format_tags=comment', '-of', 'default=nw=1:nk=1', file]).includes(TAG);
  } catch {
    return false;
  }
}
function durationOf(file) {
  try {
    return parseFloat(probe(['-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file])) || 0;
  } catch {
    return 0;
  }
}

let encoded = 0;
let tagged = 0;
let posters = 0;
let skipped = 0;
let savedBytes = 0;

if (!existsSync(ASSETS)) process.exit(0);
for (const slug of readdirSync(ASSETS, { withFileTypes: true })) {
  if (!slug.isDirectory() || slug.name === '_thumbs') continue;
  const vdir = join(ASSETS, slug.name, 'videos');
  if (!existsSync(vdir)) continue;
  for (const set of readdirSync(vdir, { withFileTypes: true })) {
    if (!set.isDirectory()) continue;
    const dir = join(vdir, set.name);
    const files = readdirSync(dir);
    const mp4s = files.filter((f) => /\.mp4$/i.test(f));

    for (const f of mp4s) {
      const src = join(dir, f);
      if (isTagged(src)) {
        skipped++;
        continue;
      }
      const before = statSync(src).size;
      const tmp = join(dir, `.${f}.tmp.mp4`);
      try {
        run(['-y', '-i', src,
          '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p',
          '-c:a', 'aac', '-b:a', '96k',
          '-movflags', '+faststart', '-metadata', `comment=${TAG}`, tmp]);
        const after = statSync(tmp).size;
        if (after <= before * 0.9) {
          renameSync(tmp, src);
          encoded++;
          savedBytes += before - after;
          console.log(`[video] ${slug.name}/${set.name}/${f}: ${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(1)}MB`);
        } else {
          unlinkSync(tmp);
          // already efficient — remux with the tag so we never re-encode it
          run(['-y', '-i', src, '-c', 'copy', '-movflags', '+faststart', '-metadata', `comment=${TAG}`, tmp]);
          renameSync(tmp, src);
          tagged++;
          console.log(`[video] ${slug.name}/${set.name}/${f}: kept (already efficient), tagged`);
        }
      } catch (e) {
        if (existsSync(tmp)) unlinkSync(tmp);
        console.warn(`[video] FAILED ${slug.name}/${set.name}/${f}: ${e.message}`);
      }
    }

    // poster: auto-generate only when the folder has none
    const hasCover = files.some((f) => /^cover.*\.(webp|png|jpe?g)$/i.test(f));
    if (!hasCover && mp4s.length) {
      const square = mp4s.find((f) => {
        const m = f.match(DIM);
        return m && m[1] === m[2];
      });
      const source = join(dir, square ?? mp4s[0]);
      const dur = durationOf(source);
      const at = dur >= 5 ? 4.5 : Math.max(0, dur / 2);
      try {
        run(['-y', '-ss', String(at), '-i', source, '-frames:v', '1',
          '-vf', "scale='min(1080,iw)':-2", '-c:v', 'libwebp', '-quality', '82',
          join(dir, 'cover.webp')]);
        posters++;
        console.log(`[video] ${slug.name}/${set.name}: cover.webp @ ${at.toFixed(1)}s from ${square ?? mp4s[0]}`);
      } catch (e) {
        console.warn(`[video] poster FAILED ${slug.name}/${set.name}: ${e.message}`);
      }
    }
  }
}

console.log(`[video] done: ${encoded} re-encoded (saved ${(savedBytes / 1e6).toFixed(1)}MB), ${tagged} tagged as-is, ${posters} posters, ${skipped} already optimized`);

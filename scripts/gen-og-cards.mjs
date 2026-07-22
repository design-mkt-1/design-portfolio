// Renders 1200×630 social-share cards: assets/og-card.png (site default) and
// assets/<slug>/og-card.png per project (brand logo on its accent color).
// Requires a local Chromium (Playwright); run manually and commit the PNGs —
// the CI deploy has no browser. Re-run after a logo or accent change.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };

function dataUri(relPath) {
  const abs = join(ROOT, 'public', relPath);
  if (!existsSync(abs)) return null;
  const mime = MIME[extname(abs).toLowerCase()];
  return `data:${mime};base64,${readFileSync(abs).toString('base64')}`;
}

// slug -> { logo, accent } — mirror of src/data/projects.ts (kept simple: this
// script can't import TS). Update here when projects change, then re-run.
const PROJECTS = {
  winboss: { logo: 'assets/winboss/logo_winboss.svg', accent: '#f5b301' },
  win2: { logo: 'assets/win2/logo_win2.webp', accent: '#22d3ee' },
  fansport: { logo: 'assets/fansport/logo_fansport.svg', accent: '#34d399' },
  topbet: { logo: 'assets/topbet/logo_topbet.svg', accent: '#fb7185' },
  'top-win': { logo: 'assets/top-win/logo_topwin.svg', accent: '#a78bfa' },
  bet2fun: { logo: 'assets/bet2fun/logo_bet2fun.svg', accent: '#fb923c' },
  jackpot: { logo: 'assets/jackpot/logo_jackpot.svg', accent: '#f472b6' },
};

function projectHtml(logoUri, accent) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 630px; overflow: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 44px;
      background:
        radial-gradient(760px 460px at 50% 30%, ${accent}2e, transparent 65%),
        #0b0b12;
      font-family: 'Segoe UI', 'DejaVu Sans', system-ui, sans-serif; color: #f5f6fa; text-align: center;
    }
    img { max-height: 190px; max-width: 620px; filter: drop-shadow(0 14px 60px rgba(0,0,0,.55)); }
    .strip { display: flex; align-items: center; gap: 14px; color: #a2a5b4; font-size: 24px; }
    .strip b { color: #cfd2dd; font-weight: 600; }
    .dot { width: 5px; height: 5px; border-radius: 50%; background: ${accent}; }
  </style></head><body>
    <img src="${logoUri}" alt="" />
    <div class="strip"><b>Marketing Solutions</b><span class="dot"></span><span>iGaming creative — brand, landings, banners &amp; video</span></div>
  </body></html>`;
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

for (const [slug, { logo, accent }] of Object.entries(PROJECTS)) {
  const uri = dataUri(logo);
  if (!uri) {
    console.log(`[og] skip ${slug} (no logo on disk)`);
    continue;
  }
  await page.setContent(projectHtml(uri, accent), { waitUntil: 'networkidle' });
  const out = join(ROOT, 'public', 'assets', slug, 'og-card.png');
  await page.screenshot({ path: out });
  console.log(`[og] wrote assets/${slug}/og-card.png`);
}
await browser.close();

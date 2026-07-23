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
  'max-win': { logo: 'assets/max-win/logo_maxwin.svg', accent: '#ef4444' },
  doncash: { logo: 'assets/doncash/logo_doncash.svg', accent: '#38bdf8' },
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

// site default card: big MS logo + main headline, nothing else
function siteHtml(logoUri) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { margin: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 630px; overflow: hidden;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 64px;
      background:
        radial-gradient(760px 460px at 50% 28%, rgba(35,198,170,0.16), transparent 65%),
        radial-gradient(700px 420px at 78% 80%, rgba(123,108,224,0.14), transparent 60%),
        #0b0b12;
      font-family: 'Segoe UI', 'DejaVu Sans', system-ui, sans-serif; color: #f5f6fa; text-align: center;
    }
    img { max-height: 230px; max-width: 760px; filter: drop-shadow(0 14px 60px rgba(0,0,0,.55)); }
    h1 { font-size: 84px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.05; padding: 0 60px; }
    h1 .g {
      background: linear-gradient(115deg, #23c6aa 0%, #4a92e0 50%, #7b6ce0 100%);
      -webkit-background-clip: text; background-clip: text; color: transparent;
    }
  </style></head><body>
    <img src="${logoUri}" alt="" />
    <h1>Creative that <span class="g">converts players.</span></h1>
  </body></html>`;
}

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

const siteLogo = dataUri('assets/marketing-solutions-logo.webp');
if (siteLogo) {
  await page.setContent(siteHtml(siteLogo), { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(ROOT, 'public', 'assets', 'og-card.png') });
  console.log('[og] wrote assets/og-card.png');
}

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

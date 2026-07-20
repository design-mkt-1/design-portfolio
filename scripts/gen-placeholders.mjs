// Generates placeholder assets (SVG logos/banners/videos/landings + minimal PDFs)
// so the site renders end-to-end before real uploads. Safe to re-run; it only
// writes files that are placeholders. Real uploads simply replace these.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PUB = join(ROOT, 'public');

const write = (rel, content) => {
  const p = join(PUB, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
};

const DIMS = {
  '1x1': [1080, 1080],
  '9x16': [1080, 1920],
  '16x9': [1920, 1080],
  '4x5': [1080, 1350],
};
const SIZE_LABEL = {
  '1x1': '1080 × 1080',
  '9x16': '1080 × 1920',
  '16x9': '1920 × 1080',
  '4x5': '1080 × 1350',
};

const font = `-apple-system, 'Segoe UI', Roboto, Arial, sans-serif`;

function tile({ w, h, accent, brand, title, size, video = false }) {
  const cx = w / 2;
  const cy = h / 2;
  const big = Math.round(Math.min(w, h) * 0.11);
  const small = Math.round(Math.min(w, h) * 0.042);
  const tiny = Math.round(Math.min(w, h) * 0.032);
  const play = video
    ? `<g transform="translate(${cx}, ${cy - big * 1.4})">
         <circle r="${big * 0.9}" fill="rgba(255,255,255,0.08)" stroke="${accent}" stroke-width="3"/>
         <path d="M ${-big * 0.28} ${-big * 0.42} L ${big * 0.5} 0 L ${-big * 0.28} ${big * 0.42} Z" fill="${accent}"/>
       </g>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="g1" cx="30%" cy="20%" r="80%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="${accent}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#0b0b12" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#12121c"/>
      <stop offset="100%" stop-color="#0a0a10"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g2)"/>
  <rect width="${w}" height="${h}" fill="url(#g1)"/>
  <rect x="8" y="8" width="${w - 16}" height="${h - 16}" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="2" rx="24"/>
  ${play}
  <text x="${cx}" y="${cy + big * 0.35}" font-family="${font}" font-size="${big}" font-weight="800"
        fill="#f5f6fa" text-anchor="middle" letter-spacing="-2">${brand}</text>
  <text x="${cx}" y="${cy + big * 0.35 + small * 1.7}" font-family="${font}" font-size="${small}" font-weight="600"
        fill="${accent}" text-anchor="middle">${title}</text>
  <text x="${cx}" y="${h - tiny * 1.6}" font-family="${font}" font-size="${tiny}" font-weight="500"
        fill="rgba(255,255,255,0.5)" text-anchor="middle" letter-spacing="1">${size} px</text>
</svg>`;
}

function logo({ brand, accent }) {
  const w = 560;
  const h = 200;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#f5f6fa"/><stop offset="100%" stop-color="${accent}"/>
  </linearGradient></defs>
  <g transform="translate(40, 100)">
    <circle cx="34" cy="0" r="34" fill="none" stroke="${accent}" stroke-width="6"/>
    <circle cx="34" cy="0" r="10" fill="${accent}"/>
  </g>
  <text x="110" y="120" font-family="${font}" font-size="72" font-weight="800"
        fill="url(#lg)" letter-spacing="-2">${brand}</text>
</svg>`;
}

function msLogo() {
  const w = 720;
  const h = 200;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#f5f6fa"/><stop offset="55%" stop-color="#6366f1"/><stop offset="100%" stop-color="#a855f7"/>
  </linearGradient></defs>
  <g transform="translate(44, 100)">
    <path d="M -30 34 L -30 -34 L 0 6 L 30 -34 L 30 34" fill="none" stroke="url(#mg)" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
  </g>
  <text x="112" y="88" font-family="${font}" font-size="52" font-weight="800" fill="url(#mg)" letter-spacing="-1">Marketing</text>
  <text x="112" y="148" font-family="${font}" font-size="52" font-weight="800" fill="#f5f6fa" letter-spacing="-1">Solutions</text>
</svg>`;
}

function landing({ brand, accent, label }) {
  const w = 1200;
  const h = 1600;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><radialGradient id="lg" cx="50%" cy="0%" r="70%">
    <stop offset="0%" stop-color="${accent}" stop-opacity="0.3"/><stop offset="100%" stop-color="#0b0b12" stop-opacity="0"/>
  </radialGradient></defs>
  <rect width="${w}" height="${h}" fill="#0a0a10"/>
  <rect width="${w}" height="${h}" fill="url(#lg)"/>
  <!-- nav -->
  <rect x="60" y="50" width="150" height="34" rx="17" fill="${accent}" opacity="0.9"/>
  <rect x="820" y="52" width="90" height="30" rx="15" fill="rgba(255,255,255,0.14)"/>
  <rect x="930" y="52" width="90" height="30" rx="15" fill="rgba(255,255,255,0.14)"/>
  <rect x="1040" y="50" width="100" height="34" rx="17" fill="${accent}"/>
  <!-- hero -->
  <text x="60" y="320" font-family="${font}" font-size="96" font-weight="800" fill="#f5f6fa" letter-spacing="-3">${brand}</text>
  <rect x="60" y="370" width="720" height="26" rx="13" fill="rgba(255,255,255,0.16)"/>
  <rect x="60" y="416" width="560" height="26" rx="13" fill="rgba(255,255,255,0.10)"/>
  <rect x="60" y="490" width="260" height="60" rx="30" fill="${accent}"/>
  <!-- media block -->
  <rect x="60" y="620" width="1080" height="520" rx="24" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)"/>
  <circle cx="600" cy="880" r="70" fill="none" stroke="${accent}" stroke-width="5"/>
  <path d="M 580 848 L 636 880 L 580 912 Z" fill="${accent}"/>
  <!-- cards -->
  <rect x="60" y="1200" width="340" height="320" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)"/>
  <rect x="430" y="1200" width="340" height="320" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)"/>
  <rect x="800" y="1200" width="340" height="320" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)"/>
  <text x="60" y="1580" font-family="${font}" font-size="34" font-weight="600" fill="rgba(255,255,255,0.45)">${label} — landing preview</text>
</svg>`;
}

// Minimal valid single-page PDF placeholder.
function pdf(brandName) {
  const text = `${brandName} Brandbook  (placeholder - upload the real PDF)`;
  const stream = `BT /F1 22 Tf 70 700 Td (${text}) Tj ET`;
  const objs = [
    `<< /Type /Catalog /Pages 2 0 R >>`,
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
  ];
  let pdfStr = `%PDF-1.4\n`;
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(pdfStr.length);
    pdfStr += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = pdfStr.length;
  pdfStr += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdfStr += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  pdfStr += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdfStr;
}

// ---- data (mirror of projects.ts placeholder set) ----
const ACCENT = { winboss: '#f5b301', win2: '#22d3ee', fansport: '#34d399', topbet: '#fb7185' };
const BRAND = { winboss: 'Winboss', win2: 'Win2', fansport: 'Fansport', topbet: 'Topbet' };

const MEDIA = {
  winboss: {
    banners: {
      'welcome-bonus': ['1x1', '9x16', '16x9', '4x5'],
      'weekend-cashback': ['1x1', '9x16', '16x9'],
      'jackpot-night': ['1x1', '9x16', '16x9', '4x5'],
    },
    videos: { 'brand-intro': ['1x1', '9x16', '16x9'] },
    landings: ['homepage', 'promo', 'vip'],
  },
  win2: {
    banners: {
      'first-deposit': ['1x1', '9x16', '16x9', '4x5'],
      'free-spins': ['1x1', '9x16', '16x9'],
    },
    videos: { 'promo-teaser': ['1x1', '9x16', '16x9'] },
    landings: ['homepage', 'offer'],
  },
};

const titleCase = (s) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Marketing Solutions logo
write('assets/marketing-solutions-logo.svg', msLogo());

// Per-project logos
for (const slug of Object.keys(BRAND)) {
  write(`assets/${slug}/logo.svg`, logo({ brand: BRAND[slug], accent: ACCENT[slug] }));
}

// Brandbook PDFs (winboss, fansport, topbet)
for (const slug of ['winboss', 'fansport', 'topbet']) {
  write(`assets/${slug}/brandbook/${slug}-brandbook.pdf`, pdf(BRAND[slug]));
}

// Banners + videos + landings
for (const slug of Object.keys(MEDIA)) {
  const m = MEDIA[slug];
  for (const kind of ['banners', 'videos']) {
    for (const [name, sizes] of Object.entries(m[kind])) {
      for (const size of sizes) {
        const [w, h] = DIMS[size];
        write(
          `assets/${slug}/${kind}/${name}/${size}.svg`,
          tile({ w, h, accent: ACCENT[slug], brand: BRAND[slug], title: titleCase(name), size: SIZE_LABEL[size], video: kind === 'videos' }),
        );
      }
    }
  }
  for (const land of m.landings) {
    write(`assets/${slug}/landings/${land}.svg`, landing({ brand: BRAND[slug], accent: ACCENT[slug], label: titleCase(land) }));
  }
}

console.log('Placeholders generated.');

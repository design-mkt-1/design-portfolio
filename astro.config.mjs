// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { redirectStubPaths } from './src/lib/portfolio.ts';
import localize from './src/integrations/localize.mjs';

// Production is https://design.marketing-solutions.ro (scripts/build-web.mjs sets
// SITE_URL and BASE_PATH=/). The defaults below build the GitHub Pages preview
// at https://design-mkt-1.github.io/design-portfolio/, which Base.astro marks noindex.
const site = process.env.SITE_URL || 'https://design-mkt-1.github.io';
const base = process.env.BASE_PATH || '/design-portfolio';
const root = new URL(base.replace(/\/?$/, '/'), site).href.replace(/\/$/, '');
// Redirect stubs are noindex pages: listing them in the sitemap sends mixed signals.
const stubs = new Set(redirectStubPaths().map((p) => root + p));

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [
    sitemap({
      filter: (page) => !stubs.has(page),
      serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }),
    }),
    // after sitemap: adds /ro/ and /ru/ copies of every page and their sitemap entries
    localize({ origin: process.env.CANONICAL_ORIGIN || 'https://design.marketing-solutions.ro', base }),
  ],
});

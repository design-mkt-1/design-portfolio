// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project site → https://design-mkt-1.github.io/design-portfolio/
// If you move to a custom domain or a <user>.github.io repo, set base to '/'.
const site = process.env.SITE_URL || 'https://design-mkt-1.github.io';
const base = process.env.BASE_PATH || '/design-portfolio';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});

// Join a path onto the configured base path (works for both links and /public assets).
// import.meta.env.BASE_URL is '/design-portfolio/' on Pages, '/' locally with base '/'.
const BASE = import.meta.env.BASE_URL;

export function url(path = ''): string {
  // absolute URLs (e.g. CDN-hosted videos) pass through untouched
  if (/^https?:\/\//i.test(path)) return path;
  const b = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  let p = path.startsWith('/') ? path : `/${path}`;
  // Pages (last segment without a file extension) get the trailing slash the
  // server redirects to anyway, which saves a 301 on every internal link.
  if (!p.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(p)) p += '/';
  // encodeURI so asset folders with spaces (e.g. "27735 - AlbaNeagra") resolve
  // to %20. It leaves # and ? alone (they'd truncate the path if a free-form
  // folder name ever contains them), so escape those explicitly.
  return encodeURI(`${b}${p}` || '/').replace(/#/g, '%23').replace(/\?/g, '%3F');
}

export function isVideoFile(src: string): boolean {
  return /\.(mp4|webm|mov|m4v)$/i.test(src);
}

/** Image files the asset scanners pick up. */
export const IMG_FILE = /\.(webp|png|jpe?g)$/i;

/** Natural filename order: "2.webp" before "10.webp". */
export const naturalSort = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

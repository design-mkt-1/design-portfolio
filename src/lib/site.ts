// Join a path onto the configured base path (works for both links and /public assets).
// import.meta.env.BASE_URL is '/design-portfolio/' on Pages, '/' locally with base '/'.
const BASE = import.meta.env.BASE_URL;

export function url(path = ''): string {
  const b = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const p = path.startsWith('/') ? path : `/${path}`;
  // encodeURI so asset folders with spaces (e.g. "27735 - AlbaNeagra") resolve
  // to %20. It leaves # and ? alone (they'd truncate the path if a free-form
  // folder name ever contains them), so escape those explicitly.
  return encodeURI(`${b}${p}` || '/').replace(/#/g, '%23').replace(/\?/g, '%3F');
}

export function isVideoFile(src: string): boolean {
  return /\.(mp4|webm|mov|m4v)$/i.test(src);
}

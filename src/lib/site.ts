// Join a path onto the configured base path (works for both links and /public assets).
// import.meta.env.BASE_URL is '/design-portfolio/' on Pages, '/' locally with base '/'.
const BASE = import.meta.env.BASE_URL;

export function url(path = ''): string {
  const b = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}` || '/';
}

export function isVideoFile(src: string): boolean {
  return /\.(mp4|webm|mov|m4v)$/i.test(src);
}

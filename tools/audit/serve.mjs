// Minimal static server over the production build (../web) for the audit browser tests.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const TYPES = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain',
};

export async function serve(root = resolve('../web')) {
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url || '/', 'http://x').pathname);
    const target = resolve(root, `.${path.endsWith('/') ? `${path}index.html` : path}`);
    if (target !== root && !target.startsWith(root + sep)) return res.writeHead(403).end();
    try {
      const body = await readFile(target);
      res.writeHead(200, { 'Content-Type': TYPES[extname(target)] || 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

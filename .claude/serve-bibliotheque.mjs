import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = '/Applications/MAMP/htdocs/DX-5/dx5-bibliotheque';
const PORT = process.env.PORT || 4386;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.m4a': 'audio/mp4',
  '.woff2': 'font/woff2',
  '.json': 'application/json'
};

http.createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    // chemins absolus du site intérieur : /bibliotheque/* → racine locale, /assets/* → assets des pages
    if (path === '/bibliotheque' || path.startsWith('/bibliotheque/')) path = path.slice('/bibliotheque'.length) || '/';
    if (path.startsWith('/assets/')) {
      try {
        const data = await readFile('/Applications/MAMP/htdocs/DX-5/dx5-pages' + path);
        res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        return res.end(data);
      } catch {}
    }
    if (path === '/') path = '/index.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(ROOT)) throw new Error('forbidden');
    const data = await readFile(file);
    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(PORT, () => console.log(`DX-5 bibliotheque on http://localhost:${PORT}`));

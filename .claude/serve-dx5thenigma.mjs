import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = '/Applications/MAMP/htdocs/DX-5/dx5thenigma';
const BIB = '/Applications/MAMP/htdocs/DX-5/dx5-bibliotheque';
const PAGES = '/Applications/MAMP/htdocs/DX-5/dx5-pages';
const PAGE_SEGS = new Set(['a-propos', 'agenda', 'ecrits', 'pro', 'contact', 'boutique',
  'soutenir', 'actualites', 'mentions-legales', 'confidentialite', 'assets']);
const PORT = process.env.PORT || 4385;

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
    const seg = path.split('/')[1] || '';
    let root = ROOT;
    if (seg === 'bibliotheque') {
      // la bibliothèque de l'artiste est montée sous /bibliotheque/
      root = BIB;
      path = path.slice('/bibliotheque'.length) || '/';
    } else if (PAGE_SEGS.has(seg)) {
      // pages secondaires (a-propos, agenda, …) + leurs assets partagés
      root = PAGES;
    }
    if (path === '/' || path === '') path = '/index.html';
    if (path.endsWith('/')) path += 'index.html';
    let file = normalize(join(root, path));
    if (!file.startsWith(root)) throw new Error('forbidden');
    let data;
    try { data = await readFile(file); }
    catch { file = join(root, path, 'index.html'); data = await readFile(file); } // /agenda → /agenda/index.html
    res.writeHead(200, {
      'Content-Type': MIME[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(PORT, () => console.log(`DX-5 maquette on http://localhost:${PORT}`));

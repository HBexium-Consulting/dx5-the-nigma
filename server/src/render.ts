import { readFileSync } from 'node:fs';
import type { DB } from './db.ts';
import { config } from './config.ts';
import { libraryPayload, sceneSettings, sceneMedia } from './embargo.ts';

/** Rend l'accueil immersif en INJECTANT les données depuis la base (comme le
 *  faisait la vue serveur) : SEO réglé, contenu piloté par le Dashboard. */
export function renderHome(db: DB): string {
  let html = readFileSync(config.frontRoot + 'dx5thenigma/index.html', 'utf8');
  const content = sceneSettings(db, 'home') ?? {};
  const lib = libraryPayload(db);
  const title = content?.brand?.title ?? 'DX-5 The Nigma';
  const desc = content?.brand?.description ?? '';

  html = html.replace('<title>Template Site Immersif</title>', `<title>${esc(title)}</title>`);
  html = html.replace('content="Site généré depuis le template Site Immersif."', `content="${esc(desc)}"`);
  html = html.replace('href="bibliotheque/"', 'href="/bibliotheque/"');

  // Images pilotées par la médiathèque du Dashboard (repli sur les images locales).
  const media = sceneMedia(db, 'home');
  if (media.hero) html = html.replaceAll('src="images/hero.jpg"', `src="${esc(media.hero)}"`);
  if (media.gallery.length) {
    let i = 0;
    html = html.replace(/src="images\/clock-\d+\.jpg"/g, () => `src="${esc(media.gallery[i++ % media.gallery.length])}"`);
  }
  html = html.replace(
    `  <script src="/bibliotheque/data.js"></script>\n  <script src="/assets/hbx-player.js"></script>\n  <script src="content.js"></script>`,
    `  <script>window.LIB=${json(lib)};window.SITE_CONTENT=${json(content)};</script>\n` +
    `  <script src="/assets/hbx-player.js"></script>\n  <script src="/js/content-inject.js"></script>`
  );
  return html;
}

const esc = (s: string) => s.replace(/"/g, '&quot;');
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

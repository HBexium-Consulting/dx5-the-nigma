import { readFileSync } from 'node:fs';
import type { DB } from './db.ts';
import { config } from './config.ts';
import { libraryPayload, sceneSettings } from './embargo.ts';

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
  html = html.replace(
    `  <script src="/bibliotheque/data.js"></script>\n  <script src="/assets/hbx-player.js"></script>\n  <script src="content.js"></script>`,
    `  <script>window.LIB=${json(lib)};window.SITE_CONTENT=${json(content)};</script>\n` +
    `  <script src="/assets/hbx-player.js"></script>\n  <script src="/js/content-inject.js"></script>`
  );
  return html;
}

const esc = (s: string) => s.replace(/"/g, '&quot;');
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

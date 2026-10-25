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

  // Injection du contenu (SITE_CONTENT) AVANT le remplacement des images : ainsi
  // le JSON embarqué est aussi balayé, et content-inject.js pose des URLs Dashboard.
  html = html.replace(
    `  <script src="/bibliotheque/data.js"></script>\n  <script src="/assets/hbx-player.js"></script>\n  <script src="content.js"></script>`,
    `  <script>window.LIB=${json(lib)};window.SITE_CONTENT=${json(content)};</script>\n` +
    `  <script src="/assets/hbx-player.js"></script>\n  <script src="/js/content-inject.js"></script>`
  );

  // ── Images 100 % pilotées par la médiathèque du Dashboard ──
  // hero : image centrale ; gallery[] : TOUTES les autres photos de l'accueil
  // (horloge, floaters, pièces, trail, placeholders picsum). Repli local si vide.
  const media = sceneMedia(db, 'home');
  if (media.hero) html = html.split('images/hero.jpg').join(media.hero);
  if (media.gallery.length) {
    const G = media.gallery;
    let ci = 0;
    html = html.replace(/images\/clock-\d+\.jpg/g, () => G[ci++ % G.length]);  // horloge : 12 visuels distincts
    let gi = 0;
    html = html.replace(
      /https?:\/\/picsum\.photos\/[^"'()\s\\]+|images\/(?:fl|p|t)-\d+\.jpg|images\/enigme-3cles\.jpg/g,
      () => G[gi++ % G.length],
    );
  }
  return html;
}

const esc = (s: string) => s.replace(/"/g, '&quot;');
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

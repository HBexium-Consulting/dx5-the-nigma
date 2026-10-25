import { readFileSync } from 'node:fs';
import type { DB } from './db.ts';
import { config } from './config.ts';
import { libraryPayload, sceneSettings, sceneMedia } from './embargo.ts';

/** Rend l'accueil immersif en INJECTANT les données depuis la base (comme le
 *  faisait la vue serveur) : SEO réglé, contenu piloté par le Dashboard. */
/** Applique les champs ÉDITABLES de la scène `home` (API Dashboard) par-dessus le
 *  contenu crafté de base. Ainsi tout ce que le Dashboard expose devient pilotable,
 *  et ce qu'il n'expose pas garde sa valeur de base (rien ne casse). */
function applyHomeOverrides(base: any, d: any): any {
  const c = structuredClone(base);
  const str = (v: unknown) => typeof v === 'string' && v.trim() !== '';
  c.brand ??= {}; c.contact ??= {}; c.universes ??= {};
  if (str(d.kicker)) c.brand.kicker = d.kicker;
  if (str(d.copyright)) c.brand.copyright = d.copyright;
  if (str(d.signature)) c.brand.signature = d.signature;
  if (str(d.contact_email)) c.contact.email = d.contact_email;
  if (str(d.footer_kicker)) c.contact.kicker = d.footer_kicker;
  if (str(d.footer_reassurance)) c.contact.reassurance = d.footer_reassurance;
  if (Array.isArray(d.blocks) && d.blocks.length && Array.isArray(c.universes.items)) {
    c.universes.items = c.universes.items.map((it: any, i: number) => {
      const b = d.blocks[i];
      return b ? { ...it, name: str(b.title) ? b.title : it.name, desc: str(b.text) ? b.text : it.desc } : it;
    });
  }
  return c;
}

export function renderHome(db: DB): string {
  let html = readFileSync(config.frontRoot + 'dx5thenigma/index.html', 'utf8');
  // Base = contenu crafté (fichier) ; surcharge = champs éditables de la scène API.
  const base = JSON.parse(readFileSync(new URL('../data/home-content.json', import.meta.url), 'utf8'));
  const content = applyHomeOverrides(base, sceneSettings(db, 'home') ?? {});
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
    // On borne le nombre d'images chargées (horloge = 12 visuels + variété) pour
    // ne pas saturer le serveur média quand la galerie auto est grande.
    const G = media.gallery.slice(0, 18);
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

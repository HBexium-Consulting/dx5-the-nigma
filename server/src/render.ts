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

  // ── Placement des images PAR SECTION (zones du Dashboard) ──
  // Chaque image rangée sous une section de la médiathèque va dans SA zone du
  // site : « hero » → l'horloge, « le dossier » → les pièces, etc. Fin du
  // placement positionnel qui décalait « héros du site » ≠ « hero du Dashboard ».
  const media = sceneMedia(db, 'home');
  applyZones(content, media);

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

  // ── Repli positionnel (galerie à plat) ──
  // Pour les images ENCORE locales : markup brut et champs non couverts par une
  // zone. Les URLs Dashboard posées par applyZones ne correspondent pas à
  // `images/…` → elles ne sont JAMAIS écrasées ici.
  if (media.hero) html = html.split('images/hero.jpg').join(media.hero);
  if (media.gallery.length) {
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

/** Place les images PAR SECTION (zones du Dashboard) dans le modèle de contenu.
 *  content-inject.js lit ensuite ces champs pour poser chaque image à sa place.
 *  Repli silencieux si une zone est absente : le comportement de base est gardé. */
function applyZones(content: any, media: { hero: string | null; zones: Record<string, string[]> }): void {
  const Z = media.zones || {};
  const basename = (u: string): string => {
    try { return new URL(u).pathname.split('/').pop() || u; } catch { return (u.split('?')[0].split('/').pop()) || u; }
  };

  // HÉROS : image centrale = hero dédié de la scène ; floaters (l'horloge) =
  // le RESTE de la section « hero », sans doublonner l'image centrale.
  const hero = Array.isArray(Z.hero) ? Z.hero : [];
  content.hook ??= {};
  if (media.hero) content.hook.image = media.hero;
  else if (hero[0]) content.hook.image = hero[0];
  const centralBase = content.hook.image ? basename(content.hook.image) : null;
  const floaters = hero.filter((u) => basename(u) !== centralBase);
  if (floaters.length) content.hook.floaters = floaters.slice(0, 12);

  // LE DOSSIER — pièces à conviction : UNE carte par image de la section (pas de
  // remplissage : on ne duplique pas une image d'une autre zone pour compléter).
  const dossier = Z['le-dossier-pieces-a-conviction'] || [];
  if (dossier.length && Array.isArray(content.proof?.projects)) {
    content.proof.projects = dossier.map((img, i) => ({ ...(content.proof.projects[i] ?? content.proof.projects[0] ?? {}), img }));
  }

  // UNE ÉNIGME, 3 CLÉS : visuel de la section processus.
  const enigme = Z['une-enigme-3-cles'] || [];
  if (enigme[0]) { content.universes ??= {}; content.universes.image = enigme[0]; }

  // GRANDE DÉRIVE (« Pas de posture… ») : traîne de bas de page.
  const drift = Z['pas-de-posture-pas-de-formule-pas-de-filtre-juste-le-text'] || [];
  if (drift.length) content.trail = drift;
}

const esc = (s: string) => s.replace(/"/g, '&quot;');
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

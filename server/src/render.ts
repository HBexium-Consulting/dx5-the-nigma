import { readFileSync } from 'node:fs';
import type { DB } from './db.ts';
import { config } from './config.ts';
import { sceneSettings, sceneMedia } from './embargo.ts';

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

/** Construit les SURCHARGES de contenu (window.SITE_CONTENT_OVERRIDES) à partir
 *  des champs réglés dans la scène `home` du Dashboard. Ne renvoie QUE ce qui est
 *  renseigné → content.js garde sa valeur de base pour tout le reste (zéro régression). */
function buildHomeOverrides(d: any): any {
  const o: any = {};
  const str = (v: unknown) => typeof v === 'string' && v.trim() !== '';
  // Section « Le dossier » / Pièces à conviction (bloc artist_proof du Dashboard).
  const proof: any = {};
  if (str(d.proof_kicker)) proof.kicker = d.proof_kicker;
  if (str(d.proof_title)) proof.title = d.proof_title;
  if (str(d.proof_sub)) proof.sub = d.proof_sub;
  if (str(d.proof_meta)) proof.meta = d.proof_meta;
  // Pièces : liste complète { img, title, meta }. Un tableau fourni remplace celui de base.
  if (Array.isArray(d.proof_projects) && d.proof_projects.length) {
    const projects = d.proof_projects
      .map((p: any) => ({ img: p.img, title: p.title, meta: p.meta }))
      .filter((p: any) => str(p.img) || str(p.title));
    if (projects.length) proof.projects = projects;
  }
  if (Object.keys(proof).length) o.proof = proof;
  // Manifeste (« Depuis 2007… ») : texte + photo (bloc artist_manifesto du Dashboard).
  const manifesto: any = {};
  if (str(d.manifesto_text)) manifesto.text = d.manifesto_text;
  if (str(d.manifesto_image)) manifesto.image = d.manifesto_image;
  if (Object.keys(manifesto).length) o.manifesto = manifesto;
  // Témoignage (bloc artist_testimonial) : citation + chiffre-clé + source.
  const testimonial: any = {};
  if (str(d.testimonial_kicker)) testimonial.kicker = d.testimonial_kicker;
  if (str(d.testimonial_figure)) testimonial.figure = d.testimonial_figure;
  if (str(d.testimonial_unit)) testimonial.unit = d.testimonial_unit;
  if (str(d.testimonial_quote)) testimonial.quote = d.testimonial_quote;
  if (str(d.testimonial_author)) testimonial.author = d.testimonial_author;
  if (Object.keys(testimonial).length) o.testimonial = testimonial;
  // Section « Juste le texte, brut » (bloc artist_objections) : phrases + chute + pastille.
  const objections: any = {};
  if (Array.isArray(d.objections_items) && d.objections_items.length) objections.items = d.objections_items.filter((x: any) => str(x));
  if (str(d.objections_finale)) objections.finale = d.objections_finale;
  if (str(d.objections_pill)) objections.pill = d.objections_pill;
  if (Object.keys(objections).length) o.objections = objections;
  // Traîne d'images du bas (« grande dérive ») : liste d'URLs. Vide = traîne de base conservée.
  if (Array.isArray(d.trail) && d.trail.length) {
    const trail = d.trail.filter((u: any) => str(u));
    if (trail.length) o.trail = trail;
  }
  // Hero / accroche (bloc artist_hook) : 3 lignes + image de fond + vignettes flottantes.
  const hook: any = {};
  if (str(d.hook_line1)) hook.line1 = d.hook_line1;
  if (str(d.hook_line2a)) hook.line2a = d.hook_line2a;
  if (str(d.hook_line2b)) hook.line2b = d.hook_line2b;
  if (str(d.hook_image)) hook.image = d.hook_image;
  if (Array.isArray(d.hook_floaters) && d.hook_floaters.length) {
    const fl = d.hook_floaters.filter((u: any) => str(u));
    if (fl.length) hook.floaters = fl;
  }
  if (Object.keys(hook).length) o.hook = hook;
  // NB : les autres champs texte scalaires (brand, contact, footer…) seront ajoutés
  // ici dans un 2ᵉ temps, APRÈS vérification que la scène `home` ne porte pas de
  // valeurs périmées (sinon elles surchargeraient l'accueil → régression).
  return o;
}

export function renderHome(db: DB): string {
  let html = readFileSync(config.frontRoot + 'dx5thenigma/index.html', 'utf8');
  // Base = contenu crafté (fichier) ; surcharge = champs éditables de la scène API.
  const base = JSON.parse(readFileSync(new URL('../data/home-content.json', import.meta.url), 'utf8'));
  const content = applyHomeOverrides(base, sceneSettings(db, 'home') ?? {});

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

  // SURCHARGES DASHBOARD : injectées AVANT content.js, qui les fusionne par-dessus
  // son contenu de base. Canal SÛR qui remplace l'ancien « remplacement total »
  // (désactivé car home-content.json dérivait → régressions en prod : 5 pièces au
  // lieu de 7, e-mail obsolète…). Ici content.js reste la source de base intacte :
  // sans override, l'accueil est STRICTEMENT identique ; le Dashboard ne fait que
  // surcharger les champs qu'il renseigne.
  const overrides = buildHomeOverrides(sceneSettings(db, 'home') ?? {});
  const CJS = '  <script src="content.js"></script>';
  if (html.includes(CJS)) {
    html = html.replace(CJS, `  <script>window.SITE_CONTENT_OVERRIDES=${json(overrides)};</script>\n${CJS}`);
  }

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
      /https?:\/\/picsum\.photos\/[^"'()\s\\]+|images\/(?:fl|p|t)-\d+\.jpg/g,
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

  // MANIFESTE (« Depuis 2007… ») : photo à gauche du texte.
  const manifeste = Z['depuis-2007-le-manifeste'] || [];
  if (manifeste[0]) { content.manifesto ??= {}; content.manifesto.image = manifeste[0]; }

  // GRANDE DÉRIVE (« Pas de posture… ») : traîne de bas de page.
  const drift = Z['pas-de-posture-pas-de-formule-pas-de-filtre-juste-le-text'] || [];
  if (drift.length) content.trail = drift;
}

const esc = (s: string) => s.replace(/"/g, '&quot;');
const json = (o: unknown) => JSON.stringify(o).replace(/</g, '\\u003c');

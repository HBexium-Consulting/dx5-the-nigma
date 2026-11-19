import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import { readFileSync } from 'node:fs';
import { openDb } from './db.ts';
import { config } from './config.ts';
import { registerWebhook } from './routes/webhook.ts';
import { registerForms } from './routes/forms.ts';
import { registerFans, getFan } from './routes/fans.ts';
import { renderHome } from './render.ts';
import { renderTeaser, teaserBySlug } from './teaser.ts';
import { libraryPayload, pageOverrides } from './embargo.ts';
import { reconcile } from './hbx/reconcile.ts';
import { refreshPages } from './hbx/sync.ts';
import { outboxFlush } from './hbx/outbox.ts';

const db = openDb(config.dbPath);
const app = Fastify({ logger: true, bodyLimit: 1_048_576 });
await app.register(fastifyCookie);
await app.register(fastifyRateLimit, { global: false });

// entrée de formulaire invalide = erreur du visiteur (400), jamais un bug serveur (500)
app.setErrorHandler((err, _req, reply) => {
  if (err instanceof ZodError) {
    return reply.code(400).send({ ok: false, message: 'Formulaire invalide.', issues: err.issues });
  }
  app.log.error(err);
  return reply.code((err as any).statusCode ?? 500).send({ ok: false, message: 'Erreur serveur.' });
});

// corps brut nécessaire à la vérification HMAC du webhook
app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
  (req as any).rawBody = body;
  try { done(null, body ? JSON.parse(body as string) : {}); } catch (e) { done(e as Error); }
});

const F = config.frontRoot;
await app.register(fastifyStatic, { root: F + 'dx5thenigma', prefix: '/', decorateReply: true, index: false });
await app.register(fastifyStatic, { root: F + 'dx5-pages/assets', prefix: '/assets/', decorateReply: false });
await app.register(fastifyStatic, { root: F + 'dx5-bibliotheque', prefix: '/bibliotheque/', decorateReply: false });

// content-inject.js : la moitié « injection » du content.js d'origine
app.get('/js/content-inject.js', (_req, reply) => {
  const cjs = readFileSync(F + 'dx5thenigma/content.js', 'utf8');
  const inject = cjs.slice(cjs.indexOf('/* ═', cjs.indexOf('INJECTION') - 80));
  reply.type('text/javascript').send('/* injection */\n' + inject);
});

app.get('/', (_req, reply) => reply.type('text/html').send(renderHome(db)));

// bibliothèque : HTML avec la librairie injectée (base, embargo respecté)
app.get('/bibliotheque/', (_req, reply) =>
  reply.type('text/html').send(injectVideoSplit(injectLib(F + 'dx5-bibliotheque/index.html'))));

// page « à venir » d'une sortie programmée (teaser + compte à rebours rouge)
app.get('/a-venir/:slug', (req, reply) => {
  const rel = teaserBySlug(db, (req.params as any).slug);
  if (!rel) return reply.code(404).type('text/html').send('<h1>404</h1>');
  return reply.type('text/html').send(renderTeaser(rel));
});

// pages intérieures : /agenda/, /a-propos/, … (librairie injectée pour le lecteur)
for (const slug of ['a-propos', 'agenda', 'ecrits', 'pro', 'contact', 'boutique', 'soutenir', 'actualites', 'suivre', 'mentions-legales', 'confidentialite', 'galerie']) {
  const handler = (_req: any, reply: any) => reply.type('text/html').send(injectPage(slug, F + `dx5-pages/${slug}/index.html`));
  app.get('/' + slug + '/', handler);
  app.get('/' + slug, (_req, reply) => reply.redirect('/' + slug + '/'));
}

// espace fans : rendu différent connecté/déconnecté (window.FAN), à part de la
// boucle générique ci-dessus car il dépend de la session du visiteur.
app.get('/espace-fans/', (req, reply) => {
  const fan = getFan(db, req);
  const html = injectPage('espace-fans', F + 'dx5-pages/espace-fans/index.html');
  // AVANT <head>, pas avant </body> : /assets/fans.js (chargé dans le corps de
  // la page) lit window.FAN à l'exécution — il doit déjà exister à ce moment.
  const tag = `<script>window.FAN=${JSON.stringify(fan).replace(/</g, '\\u003c')};</script>\n`;
  return reply.type('text/html').send(html.replace('<head>', '<head>\n' + tag));
});
app.get('/espace-fans', (_req, reply) => reply.redirect('/espace-fans/'));

registerForms(app, db);
registerFans(app, db);
registerWebhook(app, db);
app.get('/api/v1/health', () => ({ ok: true, time: new Date().toISOString() }));

// injecte la bibliothèque (pilotée par la base, respectant l'embargo) à la place
// du data.js statique, pour les pages intérieures
function injectLib(path: string): string {
  const html = readFileSync(path, 'utf8');
  const lib = JSON.stringify(libraryPayload(db)).replace(/</g, '\\u003c');
  return html.replace('<script src="/bibliotheque/data.js"></script>', `<script>window.LIB=${lib};</script>`);
}

// ANTI-RÉGRESSION (injection SERVEUR, survit aux redéploiements du front) :
// répartit les vidéos par rubrique. Après le rendu de la bibliothèque, DÉPLACE
// les vidéos de catégorie « live » de la grille « Clips officiels » vers
// « Live & interviews » — par déplacement de nœuds (pas de re-render → la lecture
// YouTube reste liée). Débounce (le front pose clipGrid puis liveGrid) + observer
// (navigation SPA sans rechargement). Sans vidéo « live » : aucune modification.
// NB : le front (app.js) répartit déjà les vidéos ; ce filet survit si le front régresse.
function injectVideoSplit(html: string): string {
  const tag = `<script>
(function(){
  var t;
  function apply(){
    try{
      if(!window.LIB||!Array.isArray(window.LIB.videos))return;
      var live={};
      window.LIB.videos.forEach(function(v){ if(v&&v.yt&&v.category&&v.category.slug==='live')live[v.yt]=1; });
      var cg=document.getElementById('clipGrid'),lg=document.getElementById('liveGrid');
      if(!cg||!lg)return;
      var move=[];
      cg.querySelectorAll('.vid').forEach(function(vid){
        var b=vid.querySelector('[data-id]');
        if(b&&live[b.getAttribute('data-id')])move.push(vid);
      });
      if(move.length){ lg.innerHTML=''; move.forEach(function(v){ lg.appendChild(v); }); }
    }catch(e){}
  }
  function schedule(){ clearTimeout(t); t=setTimeout(apply,60); }
  function setup(){
    var cg=document.getElementById('clipGrid'),lg=document.getElementById('liveGrid');
    if(!cg||!lg){ setTimeout(setup,300); return; }
    try{ var o=new MutationObserver(schedule); o.observe(cg,{childList:true}); o.observe(lg,{childList:true}); }catch(e){}
    schedule();
  }
  if(document.readyState!=='loading')setup(); else document.addEventListener('DOMContentLoaded',setup);
})();
</script>`;
  return html.includes('</body>') ? html.replace('</body>', tag + '\n</body>') : html + tag;
}

// Page intérieure : HTML d'origine (design INCHANGÉ) + injection des overrides du
// Dashboard (window.PAGE_CONTENT) + le script qui les pose sur les éléments
// marqués data-hbx. Sans override → page strictement identique à l'origine.
function injectPage(slug: string, path: string): string {
  const html = injectLib(path);
  const pc = JSON.stringify(pageOverrides(db, slug)).replace(/</g, '\\u003c');
  // Galerie : images pilotées par le Dashboard (médiathèque taguée page=galerie),
  // groupées par zone dans window.GAL. Le front retombe sur ses images statiques si vide.
  let gal = '';
  if (slug === 'galerie') {
    const g = (db.prepare("SELECT value FROM hbx_sync_state WHERE key='gallery'").get() as any)?.value || '{}';
    gal = `<script>window.GAL=${String(g).replace(/</g, '\\u003c')};</script>\n`;
  }
  // Suivre : liens d'écoute en streaming pilotés par le Dashboard (window.STREAM).
  // Le front renseigne chaque lien [data-stream] ; repli sur le href en dur si vide.
  let stream = '';
  if (slug === 'suivre') {
    const st = (db.prepare("SELECT value FROM hbx_sync_state WHERE key='streaming'").get() as any)?.value || '{}';
    stream = `<script>window.STREAM=${String(st).replace(/</g, '\\u003c')};</script>\n`;
  }
  const tag = `${gal}${stream}<script>window.PAGE_CONTENT=${pc};</script>\n<script src="/assets/page-inject.js"></script>\n<script src="/assets/i18n-data.js"></script>\n<script src="/assets/i18n.js"></script>`;
  return html.includes('</body>') ? html.replace('</body>', tag + '\n</body>') : html + tag;
}

const port = config.port;
app.listen({ port, host: '0.0.0.0' }).then(() => {
  app.log.info(`DX-5 sur :${port}`);
  // Synchro quasi-instantanée : le service lui-même interroge le Dashboard
  // (changements + scènes/galeries) à intervalle court. UNE SEULE connexion à la
  // base (le service) → aucune contention concurrente (plus de crons séparés).
  const RECONCILE_MS = Number(process.env.RECONCILE_MS ?? 5000);
  const loop = (fn: () => Promise<unknown>, ms: number, tag: string) => {
    const tick = () => fn().catch((e) => app.log.error({ err: String(e) }, tag)).finally(() => setTimeout(tick, ms));
    setTimeout(tick, ms);
  };
  loop(() => reconcile(db), RECONCILE_MS, 'reconcile');   // changements + galeries ~5 s
  loop(() => outboxFlush(db), 60_000, 'outbox');          // file sortante (formulaires) ~60 s
  // Overrides de contenu des pages (télécommande Dashboard) — rafraîchis souvent
  // mais moins que les scènes (N+1 léger : liste + détail par page).
  refreshPages(db).catch((e) => app.log.error({ err: String(e) }, 'pages:init'));
  loop(() => refreshPages(db), 20_000, 'pages');
});

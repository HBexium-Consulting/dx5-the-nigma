import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { readFileSync } from 'node:fs';
import { openDb } from './db.ts';
import { config } from './config.ts';
import { registerWebhook } from './routes/webhook.ts';
import { registerForms } from './routes/forms.ts';
import { renderHome } from './render.ts';
import { renderTeaser, teaserBySlug } from './teaser.ts';
import { libraryPayload } from './embargo.ts';
import { reconcile } from './hbx/reconcile.ts';
import { outboxFlush } from './hbx/outbox.ts';

const db = openDb(config.dbPath);
const app = Fastify({ logger: true, bodyLimit: 1_048_576 });

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
  reply.type('text/html').send(injectLib(F + 'dx5-bibliotheque/index.html')));

// page « à venir » d'une sortie programmée (teaser + compte à rebours rouge)
app.get('/a-venir/:slug', (req, reply) => {
  const rel = teaserBySlug(db, (req.params as any).slug);
  if (!rel) return reply.code(404).type('text/html').send('<h1>404</h1>');
  return reply.type('text/html').send(renderTeaser(rel));
});

// pages intérieures : /agenda/, /a-propos/, … (librairie injectée pour le lecteur)
for (const slug of ['a-propos', 'agenda', 'ecrits', 'pro', 'contact', 'boutique', 'soutenir', 'actualites', 'suivre', 'mentions-legales', 'confidentialite']) {
  const handler = (_req: any, reply: any) => reply.type('text/html').send(injectLib(F + `dx5-pages/${slug}/index.html`));
  app.get('/' + slug + '/', handler);
  app.get('/' + slug, (_req, reply) => reply.redirect('/' + slug + '/'));
}

registerForms(app, db);
registerWebhook(app, db);
app.get('/api/v1/health', () => ({ ok: true, time: new Date().toISOString() }));

// injecte la bibliothèque (pilotée par la base, respectant l'embargo) à la place
// du data.js statique, pour les pages intérieures
function injectLib(path: string): string {
  const html = readFileSync(path, 'utf8');
  const lib = JSON.stringify(libraryPayload(db)).replace(/</g, '\\u003c');
  return html.replace('<script src="/bibliotheque/data.js"></script>', `<script>window.LIB=${lib};</script>`);
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
});

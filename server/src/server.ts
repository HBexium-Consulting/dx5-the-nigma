import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { readFileSync } from 'node:fs';
import { openDb } from './db.ts';
import { config } from './config.ts';
import { registerWebhook } from './routes/webhook.ts';
import { registerForms } from './routes/forms.ts';
import { renderHome } from './render.ts';
import { publishedReleaseBySlug, allTracks, isUnlocked, libraryPayload } from './embargo.ts';

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
app.get('/musique', (_req, reply) =>
  reply.type('text/html').send(injectLib(F + 'dx5-bibliotheque/index.html')));

// embargo : la page d'une sortie non publiée renvoie 404 (§4.6)
app.get('/musique/:slug', (req, reply) => {
  const rel = publishedReleaseBySlug(db, (req.params as any).slug);
  if (!rel) return reply.code(404).type('text/html').send('<h1>404</h1>');
  const tracks = allTracks(db, rel.id).map((t) => ({ ...t, unlocked: isUnlocked(t) }));
  return reply.type('text/html').send(releaseHtml(rel, tracks));
});

for (const slug of ['a-propos', 'agenda', 'ecrits', 'pro', 'contact', 'boutique', 'soutenir', 'actualites', 'mentions-legales', 'confidentialite'])
  app.get('/' + slug, (_req, reply) => reply.type('text/html').send(injectLib(F + `dx5-pages/${slug}/index.html`)));

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
function releaseHtml(rel: any, tracks: any[]): string {
  const li = tracks.map((t) => `<li>${t.unlocked ? esc(t.title) : '▓▓▓▓▓▓'}${t.featuring ? ' — ' + esc(t.featuring) : ''}</li>`).join('');
  return `<!doctype html><meta charset="utf-8"><title>${esc(rel.title)} — DX-5 The Nigma</title><h1>${esc(rel.title)}</h1><ol>${li}</ol>`;
}
const esc = (s: string) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]!));

const port = config.port;
app.listen({ port, host: '0.0.0.0' }).then(() => app.log.info(`DX-5 sur :${port}`));

import { describe, it, expect, beforeEach } from 'vitest';
import { createHmac } from 'node:crypto';
import Fastify from 'fastify';
import { openDb, type DB } from '../src/db.ts';
import { registerWebhook } from '../src/routes/webhook.ts';
import { config } from '../src/config.ts';

config.hbx.webhookSecret = 'test-secret';

function build(db: DB) {
  const app = Fastify();
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    (req as any).rawBody = body; try { done(null, body ? JSON.parse(body as string) : {}); } catch (e) { done(e as Error); }
  });
  registerWebhook(app, db);
  return app;
}
function sign(payload: object, delivery: string, ts = Math.floor(Date.now() / 1000)) {
  const raw = JSON.stringify(payload);
  const sig = 'sha256=' + createHmac('sha256', 'test-secret').update(ts + raw).digest('hex');
  return { raw, headers: { 'content-type': 'application/json', 'x-hbx-event': 'release.updated', 'x-hbx-delivery': delivery, 'x-hbx-timestamp': String(ts), 'x-hbx-signature': sig } };
}

describe('webhook HBX', () => {
  let db: DB;
  beforeEach(() => { db = openDb(':memory:'); });

  it('accepte une signature valide (202) et enregistre la livraison', async () => {
    const app = build(db);
    const { raw, headers } = sign({ entity: 'release', uuid: 'abc', action: 'updated' }, 'd-1');
    const res = await app.inject({ method: 'POST', url: '/hbx/hooks', headers, payload: raw });
    expect(res.statusCode).toBe(202);
    expect((db.prepare('SELECT COUNT(*) c FROM hbx_webhook_deliveries').get() as any).c).toBe(1);
  });

  it('refuse une signature invalide (401)', async () => {
    const app = build(db);
    const { raw, headers } = sign({ entity: 'release', uuid: 'abc', action: 'updated' }, 'd-2');
    headers['x-hbx-signature'] = 'sha256=mauvais';
    const res = await app.inject({ method: 'POST', url: '/hbx/hooks', headers, payload: raw });
    expect(res.statusCode).toBe(401);
  });

  it('refuse un horodatage périmé (401)', async () => {
    const app = build(db);
    const old = Math.floor(Date.now() / 1000) - 600;
    const { raw, headers } = sign({ entity: 'release', uuid: 'abc', action: 'updated' }, 'd-3', old);
    const res = await app.inject({ method: 'POST', url: '/hbx/hooks', headers, payload: raw });
    expect(res.statusCode).toBe(401);
  });

  it('ignore un rejeu (même X-HBX-Delivery) : une seule livraison', async () => {
    const app = build(db);
    const { raw, headers } = sign({ entity: 'release', uuid: 'abc', action: 'updated' }, 'd-4');
    await app.inject({ method: 'POST', url: '/hbx/hooks', headers, payload: raw });
    await app.inject({ method: 'POST', url: '/hbx/hooks', headers, payload: raw });
    expect((db.prepare('SELECT COUNT(*) c FROM hbx_webhook_deliveries').get() as any).c).toBe(1);
  });
});

import type { FastifyInstance } from 'fastify';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { DB } from '../db.ts';
import { config } from '../config.ts';
import { pullEntity, softDelete } from '../hbx/sync.ts';
import { runCommand } from '../hbx/reconcile.ts';

/** Point d'entrée des webhooks (§4.1 n°2) : signal, pas transport. On vérifie la
 *  signature HMAC, on enregistre la livraison (idempotence X-HBX-Delivery), on
 *  répond 202 en < 1 s, puis on synchronise en tâche de fond (aucun appel API ici). */
export function registerWebhook(app: FastifyInstance, db: DB): void {
  app.post('/hbx/hooks', { config: { rawBody: true } }, async (req, reply) => {
    const raw = (req as any).rawBody as string;
    const h = req.headers;
    const ts = String(h['x-hbx-timestamp'] ?? '');
    const sig = String(h['x-hbx-signature'] ?? '');
    const delivery = String(h['x-hbx-delivery'] ?? '');
    const event = String(h['x-hbx-event'] ?? '');

    if (!ts || !delivery || Math.abs(Date.now() / 1000 - Number(ts)) > 300)
      return reply.code(401).send({ error: 'stale_or_missing_timestamp' });

    const expected = 'sha256=' + createHmac('sha256', config.hbx.webhookSecret).update(ts + raw).digest('hex');
    const a = Buffer.from(expected), b = Buffer.from(sig);
    if (a.length !== b.length || !timingSafeEqual(a, b))
      return reply.code(401).send({ error: 'bad_signature' });

    const fresh = db.prepare(
      'INSERT INTO hbx_webhook_deliveries (delivery_id, event, payload, created_at) VALUES (?,?,?,?) ON CONFLICT(delivery_id) DO NOTHING'
    ).run(delivery, event, raw, new Date().toISOString()).changes > 0;

    if (fresh) {
      const body = (req.body ?? {}) as any;
      // traitement différé : on n'attend pas l'API pour répondre
      setImmediate(async () => {
        try {
          if (event.startsWith('site.')) await runCommand(db, event);
          else if (body.action === 'deleted') softDelete(db, body.entity, body.uuid);
          else await pullEntity(db, body.entity, body.uuid);
        } catch (e) { app.log.error(e); }
      });
    }
    return reply.code(202).send({ accepted: true });
  });
}

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import type { DB } from '../db.ts';
import { outboxPush } from '../hbx/outbox.ts';

/** §4.1 n°4 : stockage local PUIS file sortante. Dashboard éteint = rien perdu. */
export function registerForms(app: FastifyInstance, db: DB): void {
  app.post('/newsletter', async (req, reply) => {
    const d = z.object({ email: z.string().email() }).parse(req.body);
    const token = randomUUID().replace(/-/g, '');
    db.prepare(
      'INSERT INTO newsletter_subscribers (email, locale, source, token, created_at) VALUES (?,?,?,?,?) ON CONFLICT(email) DO NOTHING'
    ).run(d.email, 'fr', 'site', token, new Date().toISOString());
    outboxPush(db, 'newsletter/subscribe', { email: d.email, locale: 'fr' }, 'nl-' + d.email);
    return reply.send({ ok: true, message: 'Inscription enregistrée — confirmez depuis l’e-mail reçu.' });
  });

  app.post('/contact', async (req, reply) => {
    const d = z.object({ name: z.string().min(1).max(120), email: z.string().email(), message: z.string().min(1).max(5000) }).parse(req.body);
    const info = db.prepare('INSERT INTO leads (name, email, message, created_at) VALUES (?,?,?,?)')
      .run(d.name, d.email, d.message, new Date().toISOString());
    outboxPush(db, 'leads', { ...d, source: 'site-contact' }, 'lead-' + info.lastInsertRowid);
    return reply.send({ ok: true, message: 'Message bien reçu — réponse sous 24 h.' });
  });

  app.post('/booking', async (req, reply) => {
    const d = z.object({
      organizer_name: z.string().min(1).max(120), organization: z.string().max(160).optional(),
      email: z.string().email(), phone: z.string().max(40).optional(), event_type: z.string().max(60).optional(),
      event_date: z.string().optional(), city: z.string().max(80).optional(), country: z.string().max(80).optional(),
      expected_audience: z.coerce.number().int().min(0).optional(), budget_amount: z.coerce.number().int().min(0).optional(),
      message: z.string().max(5000).optional(),
    }).parse(req.body);
    const uuid = randomUUID(), key = randomUUID();
    db.prepare(`INSERT INTO booking_requests
      (uuid, organizer_name, organization, email, phone, event_type, event_date, city, country, expected_audience, budget_amount, budget_currency, message, idempotency_key, created_at)
      VALUES (@uuid,@on,@org,@email,@phone,@etype,@edate,@city,@country,@aud,@amt,'USD',@msg,@key,@at)`).run({
      uuid, on: d.organizer_name, org: d.organization ?? null, email: d.email, phone: d.phone ?? null,
      etype: d.event_type ?? null, edate: d.event_date ?? null, city: d.city ?? null, country: d.country ?? null,
      aud: d.expected_audience ?? null, amt: d.budget_amount ?? null, msg: d.message ?? null, key, at: new Date().toISOString(),
    });
    outboxPush(db, 'booking-requests', { uuid, ...d, budget_currency: 'USD' }, key);
    return reply.send({ ok: true, message: 'Demande transmise — réponse sous 24 h.' });
  });
}

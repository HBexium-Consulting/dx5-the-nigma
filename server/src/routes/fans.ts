import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { DB } from '../db.ts';
import { outboxPush } from '../hbx/outbox.ts';

/** Espace fans : compte par e-mail + code choisi par le fan à la première
 *  connexion (pas de mot de passe « système »). Le code n'est jamais stocké
 *  en clair (scrypt + sel aléatoire). En cas d'oubli, un nouveau code est
 *  généré et poussé dans la file sortante pour que le Dashboard l'envoie
 *  par e-mail — même mécanisme que la confirmation newsletter. */

const SESSION_COOKIE = 'dx5_fan';
const SESSION_DAYS = 60;
const CODE_MIN = 6, CODE_MAX = 40;

function hashCode(code: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(code, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}
function verifyCode(code: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(code, salt, 64);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function newCode(): string {
  // code lisible (pas de 0/O/1/l ambigus), 8 caractères — assez d'entropie
  // pour résister au brute force en ligne même sans verrou de compte.
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  return Array.from(randomBytes(8)).map((b) => alphabet[b % alphabet.length]).join('');
}

function createSession(db: DB, fanId: number): string {
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 864e5);
  db.prepare('INSERT INTO fan_sessions (token, fan_id, created_at, expires_at) VALUES (?,?,?,?)')
    .run(token, fanId, now.toISOString(), expires.toISOString());
  return token;
}

export function getFan(db: DB, req: FastifyRequest): { id: number; email: string } | null {
  const token = (req as any).cookies?.[SESSION_COOKIE];
  if (!token) return null;
  const row = db.prepare(
    `SELECT f.id, f.email FROM fan_sessions s JOIN fans f ON f.id = s.fan_id
     WHERE s.token = ? AND s.expires_at > ?`
  ).get(token, new Date().toISOString()) as any;
  return row ?? null;
}

export function registerFans(app: FastifyInstance, db: DB): void {
  const emailSchema = z.string().email().max(160).transform((s) => s.trim().toLowerCase());
  const codeSchema = z.string().min(CODE_MIN).max(CODE_MAX);

  const setSessionCookie = (reply: any, token: string) => {
    reply.setCookie(SESSION_COOKIE, token, {
      path: '/', httpOnly: true, sameSite: 'lax', secure: true, maxAge: SESSION_DAYS * 86400,
    });
  };

  app.post('/fans/inscription', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, async (req, reply) => {
    const d = z.object({ email: emailSchema, code: codeSchema }).parse(req.body);
    const exists = db.prepare('SELECT id FROM fans WHERE email = ?').get(d.email);
    if (exists) return reply.code(409).send({ ok: false, message: 'Un compte existe déjà avec cet e-mail — connectez-vous.' });
    const info = db.prepare('INSERT INTO fans (email, code_hash, created_at) VALUES (?,?,?)')
      .run(d.email, hashCode(d.code), new Date().toISOString());
    const token = createSession(db, Number(info.lastInsertRowid));
    setSessionCookie(reply, token);
    outboxPush(db, 'fans/inscription', { email: d.email }, 'fan-join-' + d.email);
    return reply.send({ ok: true });
  });

  app.post('/fans/connexion', { config: { rateLimit: { max: 10, timeWindow: '15 minutes' } } }, async (req, reply) => {
    const d = z.object({ email: emailSchema, code: codeSchema }).parse(req.body);
    const fan = db.prepare('SELECT id, code_hash FROM fans WHERE email = ?').get(d.email) as any;
    if (!fan || !verifyCode(d.code, fan.code_hash)) {
      return reply.code(401).send({ ok: false, message: 'E-mail ou code incorrect.' });
    }
    db.prepare('UPDATE fans SET last_login_at = ? WHERE id = ?').run(new Date().toISOString(), fan.id);
    const token = createSession(db, fan.id);
    setSessionCookie(reply, token);
    return reply.send({ ok: true });
  });

  app.post('/fans/deconnexion', async (req, reply) => {
    const token = (req as any).cookies?.[SESSION_COOKIE];
    if (token) db.prepare('DELETE FROM fan_sessions WHERE token = ?').run(token);
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return reply.send({ ok: true });
  });

  app.post('/fans/code-oublie', { config: { rateLimit: { max: 5, timeWindow: '15 minutes' } } }, async (req, reply) => {
    const d = z.object({ email: emailSchema }).parse(req.body);
    const fan = db.prepare('SELECT id FROM fans WHERE email = ?').get(d.email) as any;
    // Réponse IDENTIQUE que le compte existe ou non (pas d'énumération d'e-mails).
    if (fan) {
      const code = newCode();
      db.prepare('UPDATE fans SET code_hash = ? WHERE id = ?').run(hashCode(code), fan.id);
      db.prepare('DELETE FROM fan_sessions WHERE fan_id = ?').run(fan.id); // un code oublié invalide les sessions en cours
      outboxPush(db, 'fans/code-oublie', { email: d.email, code }, 'fan-reset-' + fan.id + '-' + Date.now());
    }
    return reply.send({ ok: true, message: 'Si un compte existe avec cet e-mail, un nouveau code vient d’être envoyé.' });
  });
}

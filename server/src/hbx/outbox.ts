import type { DB } from '../db.ts';
import { hbxPost } from './client.ts';
import { randomUUID } from 'node:crypto';

/** §4.1 règle n°4 : chaque écriture est stockée localement puis envoyée au
 *  Dashboard avec une clé d'idempotence. Dashboard éteint → rien ne se perd. */
export function outboxPush(db: DB, endpoint: string, payload: unknown, key?: string): void {
  db.prepare(
    `INSERT INTO hbx_outbox (endpoint, payload, idempotency_key, created_at)
     VALUES (?,?,?,?) ON CONFLICT(idempotency_key) DO NOTHING`
  ).run(endpoint, JSON.stringify(payload), key ?? randomUUID(), new Date().toISOString());
}

export async function outboxFlush(db: DB): Promise<number> {
  const rows = db.prepare(
    'SELECT * FROM hbx_outbox WHERE sent_at IS NULL AND attempts < 8 ORDER BY id LIMIT 50'
  ).all() as any[];
  for (const row of rows) {
    try {
      const res = await hbxPost(row.endpoint, JSON.parse(row.payload), row.idempotency_key);
      if (res.ok) db.prepare('UPDATE hbx_outbox SET sent_at = ?, last_error = NULL WHERE id = ?')
        .run(new Date().toISOString(), row.id);
      else db.prepare('UPDATE hbx_outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?')
        .run(`${res.status} ${(await res.text()).slice(0, 300)}`, row.id);
    } catch (e) {
      db.prepare('UPDATE hbx_outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?')
        .run(String(e).slice(0, 300), row.id);
    }
  }
  return rows.length;
}

// Entrée CLI (cron) : `node src/hbx/outbox.ts --flush`
if (process.argv.includes('--flush')) {
  const { openDb } = await import('../db.ts');
  const { config } = await import('../config.ts');
  const db = openDb(config.dbPath);
  const n = await outboxFlush(db);
  console.log(`outbox flush ✓ (${n})`);
}

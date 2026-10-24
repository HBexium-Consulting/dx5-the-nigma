import { describe, it, expect, beforeEach } from 'vitest';
import { openDb, type DB } from '../src/db.ts';
import { outboxPush } from '../src/hbx/outbox.ts';

describe('file sortante (§4.1 n°4)', () => {
  let db: DB;
  beforeEach(() => { db = openDb(':memory:'); });

  it('empile une écriture en attente', () => {
    outboxPush(db, 'leads', { email: 'fan@exemple.ht' }, 'lead-1');
    const row = db.prepare('SELECT * FROM hbx_outbox').get() as any;
    expect(row.endpoint).toBe('leads');
    expect(row.sent_at).toBeNull();
  });

  it('est idempotente : même clé → une seule entrée', () => {
    outboxPush(db, 'newsletter/subscribe', { email: 'a@b.c' }, 'nl-a@b.c');
    outboxPush(db, 'newsletter/subscribe', { email: 'a@b.c' }, 'nl-a@b.c');
    expect((db.prepare('SELECT COUNT(*) c FROM hbx_outbox').get() as any).c).toBe(1);
  });
});

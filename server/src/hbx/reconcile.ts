import type { DB } from '../db.ts';
import { hbxGet } from './client.ts';
import { pullEntity, softDelete } from './sync.ts';

/** §4.1 règle n°3 : toutes les 15 min, rattraper les changements. On stocke
 *  server_time comme prochain `since`, jamais notre horloge (§4.2). 410 → resync. */
export async function reconcile(db: DB): Promise<void> {
  const since = (db.prepare("SELECT value FROM hbx_sync_state WHERE key='since'").get() as any)?.value;
  let cursor: string | undefined;
  let serverTime: string | undefined;

  do {
    const res = await hbxGet('sync/changes', { since, cursor });
    if (res.status === 410) { await syncFull(db); return; }
    if (!res.ok) throw new Error(`sync/changes ${res.status}`);
    const json: any = await res.json();
    for (const c of json.data ?? []) {
      if (c.action === 'deleted') softDelete(db, c.entity, c.uuid);
      else await pullEntity(db, c.entity, c.uuid);
    }
    cursor = json.next_cursor;
    serverTime = json.server_time;
  } while (cursor);

  if (serverTime) db.prepare(
    "INSERT INTO hbx_sync_state (key, value) VALUES ('since', ?) ON CONFLICT(key) DO UPDATE SET value = ?"
  ).run(serverTime, serverTime);
}

export async function syncFull(db: DB): Promise<void> {
  for (const [index, entity] of [['releases', 'release'], ['events', 'event'], ['scenes', 'scene']] as const) {
    let page = 1;
    for (;;) {
      const res = await hbxGet(index, { page: String(page), per_page: '50' });
      if (res.status === 404) break;
      if (!res.ok) throw new Error(`${index} ${res.status}`);
      const json: any = await res.json();
      for (const row of json.data ?? []) await pullEntity(db, entity, row.uuid);
      if (!(json.links?.next ?? json.next_page_url)) break;
      page++;
    }
  }
}

/** Commandes à distance (télécommande du Dashboard). */
export async function runCommand(db: DB, event: string): Promise<void> {
  if (event === 'site.sync.full') await syncFull(db);
  // site.cache.purge / maintenance : gérés au niveau serveur/déploiement
}

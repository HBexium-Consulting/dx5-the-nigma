import type { DB } from '../db.ts';
import { hbxGet } from './client.ts';

/** Lit une entité via l'API et l'écrit en base locale (§4.3). Correspondance
 *  par uuid, jamais par id. 404 → suppression douce (contenu supprimé/module off). */
export async function pullEntity(db: DB, entity: string, uuid: string): Promise<void> {
  if (entity === 'release') { await pullRelease(db, uuid); return; }
  if (entity === 'scene') { await pullScene(db, uuid); return; }
  if (entity !== 'event') return;

  const res = await hbxGet(`events/${uuid}`);
  if (res.status === 404) { softDelete(db, entity, uuid); return; }
  if (!res.ok) throw new Error(`HBX ${res.status} sur events/${uuid}`);
  const json: any = await res.json();
  upsertEvent(db, json.data ?? json);
}

/** Le DÉTAIL des scènes est masqué (404) : hero + settings ne vivent que dans la
 *  LISTE. On y retrouve la scène et on met à jour (par clé) — sans supprimer. */
async function pullScene(db: DB, uuid: string): Promise<void> {
  for (let page = 1; page <= 5; page++) {
    const res = await hbxGet('scenes', { page: String(page), per_page: '100' });
    if (!res.ok) return;
    const j: any = await res.json();
    const found = (j.data ?? []).find((s: any) => s.uuid === uuid);
    if (found) { upsertScene(db, found); return; }
    if (!(j.links?.next ?? j.next_page_url)) return;
  }
}

/** Une sortie sous embargo a son DÉTAIL masqué (404) mais reste présente dans la
 *  LISTE sous forme de teaser (titre, cover, date de déverrouillage). On garde
 *  donc le teaser au lieu de supprimer — c'est ce qui alimente le compte à rebours. */
async function pullRelease(db: DB, uuid: string): Promise<void> {
  const res = await hbxGet(`releases/${uuid}`);
  if (res.ok) { upsertRelease(db, (await (res.json() as Promise<any>)).data ?? {}); return; }
  if (res.status === 404) {
    const teaser = await releaseFromList(uuid);
    if (teaser) upsertRelease(db, teaser);        // sortie programmée (embargo) → on garde le teaser
    else softDelete(db, 'release', uuid);          // réellement supprimée côté Dashboard
    return;
  }
  throw new Error(`HBX ${res.status} sur releases/${uuid}`);
}

/** Retrouve une sortie dans la liste paginée (le détail peut être masqué). */
async function releaseFromList(uuid: string): Promise<any | null> {
  for (let page = 1; page <= 20; page++) {
    const res = await hbxGet('releases', { page: String(page), per_page: '100' });
    if (!res.ok) return null;
    const j: any = await res.json();
    const found = (j.data ?? []).find((r: any) => r.uuid === uuid);
    if (found) return found;
    if (!(j.links?.next ?? j.next_page_url)) return null;
  }
  return null;
}

export function softDelete(db: DB, entity: string, uuid: string): void {
  const now = new Date().toISOString();
  if (entity === 'release') db.prepare('UPDATE releases SET deleted_at = ? WHERE uuid = ?').run(now, uuid);
  else if (entity === 'event') db.prepare('UPDATE events SET deleted_at = ? WHERE uuid = ?').run(now, uuid);
  else if (entity === 'scene') db.prepare('DELETE FROM scenes WHERE uuid = ?').run(uuid);
}

function ytFromLinks(links: any[]): string | null {
  const yt = (links ?? []).find((l) => (l.platform ?? '').toLowerCase() === 'youtube');
  const m = yt?.url?.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;  // seulement si l'URL cible une vidéo (sinon chaîne → null)
}

function upsertRelease(db: DB, d: any): void {
  const bySlug = db.prepare('SELECT uuid FROM releases WHERE slug = ?').get(d.slug) as any;
  if (bySlug && bySlug.uuid !== d.uuid) return;  // slug déjà tenu par du contenu seedé : on préserve
  db.prepare(`
    INSERT INTO releases (uuid, slug, type, title, subtitle, description, cover_path, release_date, published_at, status, credits, deleted_at, updated_at)
    VALUES (@uuid,@slug,@type,@title,@subtitle,@description,@cover,@release_date,@published_at,@status,@credits,NULL,@updated)
    ON CONFLICT(uuid) DO UPDATE SET slug=@slug,type=@type,title=@title,subtitle=@subtitle,description=@description,
      cover_path=@cover,release_date=@release_date,published_at=@published_at,status=@status,credits=@credits,deleted_at=NULL,updated_at=@updated
  `).run({
    uuid: d.uuid, slug: d.slug, type: d.type ?? 'album', title: d.title, subtitle: d.subtitle ?? null,
    description: d.description ?? null, cover: d.cover?.url ?? d.cover_url ?? d.cover_path ?? null,
    release_date: d.release_date ?? null, published_at: d.published_at ?? null, status: d.status ?? 'draft',
    credits: d.credits ? JSON.stringify(d.credits) : null, updated: new Date().toISOString(),
  });
  const rel = db.prepare('SELECT id FROM releases WHERE uuid = ?').get(d.uuid) as any;
  for (const t of d.tracks ?? []) {
    db.prepare(`
      INSERT INTO tracks (uuid, release_id, position, title, slug, duration_seconds, featuring, lyrics, preview_path, youtube_id, unlock_at, deleted_at)
      VALUES (@uuid,@rel,@position,@title,@slug,@dur,@feat,@lyrics,@preview,@yt,@unlock,NULL)
      ON CONFLICT(uuid) DO UPDATE SET release_id=@rel,position=@position,title=@title,slug=@slug,duration_seconds=@dur,
        featuring=@feat,lyrics=@lyrics,preview_path=@preview,youtube_id=@yt,unlock_at=@unlock,deleted_at=NULL
    `).run({
      uuid: t.uuid, rel: rel.id, position: t.position ?? 1, title: t.title, slug: t.slug ?? null,
      dur: t.duration_seconds ?? null, feat: t.featuring ?? null, lyrics: t.lyrics ?? null,
      preview: t.preview?.url ?? t.preview ?? null, yt: t.youtube_id ?? ytFromLinks(t.streaming_links) ?? null, unlock: t.unlock_at ?? null,
    });
  }
}

function upsertEvent(db: DB, d: any): void {
  db.prepare(`
    INSERT INTO events (uuid, slug, title, description, starts_at, ends_at, timezone, venue_name, city, country, status, ticket_mode, ticket_url, cover_path, published_at, deleted_at)
    VALUES (@uuid,@slug,@title,@description,@starts,@ends,@tz,@venue,@city,@country,@status,@tmode,@turl,@cover,@published,NULL)
    ON CONFLICT(uuid) DO UPDATE SET slug=@slug,title=@title,description=@description,starts_at=@starts,ends_at=@ends,
      timezone=@tz,venue_name=@venue,city=@city,country=@country,status=@status,ticket_mode=@tmode,ticket_url=@turl,
      cover_path=@cover,published_at=@published,deleted_at=NULL
  `).run({
    uuid: d.uuid, slug: d.slug, title: d.title, description: d.description ?? null, starts: d.starts_at,
    ends: d.ends_at ?? null, tz: d.timezone ?? 'UTC', venue: d.venue_name ?? null, city: d.city ?? null,
    country: d.country ?? null, status: d.status ?? 'scheduled', tmode: d.ticket_mode ?? 'none',
    turl: d.ticket_url ?? null, cover: d.cover?.url ?? d.cover_url ?? null, published: d.published_at ?? null,
  });
}

function upsertScene(db: DB, d: any): void {
  // On synchronise l'IMAGE (hero) et les métadonnées, mais on PRÉSERVE les
  // settings existants (contenu éditorial riche seedé côté site). Le Dashboard
  // ne porte qu'un sous-ensemble du contenu : on ne l'écrase pas.
  const hero = d.hero?.url ?? d.hero_url ?? null;
  const gallery = Array.isArray(d.gallery) ? d.gallery.map((g: any) => g?.url ?? g).filter(Boolean)
    : Array.isArray(d.settings?.gallery) ? d.settings.gallery.map((g: any) => g?.url ?? g).filter(Boolean)
    : null;
  db.prepare(`
    INSERT INTO scenes (uuid, key, palette, intensity, hero_path, ambient_path, headline, settings)
    VALUES (@uuid,@key,@palette,@intensity,@hero,@ambient,@headline,@settings)
    ON CONFLICT(key) DO UPDATE SET hero_path=@hero, headline=COALESCE(@headline, headline),
      settings=CASE WHEN @gallery IS NOT NULL
        THEN json_set(COALESCE(settings,'{}'), '$.gallery', json(@gallery))
        ELSE settings END
  `).run({
    uuid: d.uuid, key: d.key, palette: d.palette ? JSON.stringify(d.palette) : null,
    intensity: d.intensity ?? 'medium', hero, ambient: d.ambient_url ?? d.ambient_audio?.url ?? null,
    headline: d.headline ?? null,
    settings: JSON.stringify(gallery ? { gallery } : (d.settings ?? {})),
    gallery: gallery ? JSON.stringify(gallery) : null,
  });
}

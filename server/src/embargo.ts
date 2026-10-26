import type { DB } from './db.ts';

/** Règle d'embargo centralisée (§4.6) : une sortie n'existe pour le public que
 *  si published_at est passé ; un titre n'est déverrouillé que si unlock_at est
 *  nul ou passé. AUCUNE route publique ne doit contourner ces deux fonctions. */
export function publishedReleases(db: DB): any[] {
  return db.prepare(
    `SELECT * FROM releases WHERE deleted_at IS NULL AND status = 'published'
     AND published_at IS NOT NULL AND published_at <= ? ORDER BY release_date DESC`
  ).all(new Date().toISOString());
}

/** Sorties PROGRAMMÉES : published_at dans le futur. Elles existent pour le site
 *  sous forme de teaser (compte à rebours jusqu'au déverrouillage), sans contenu. */
export function upcomingReleases(db: DB): any[] {
  return db.prepare(
    `SELECT * FROM releases WHERE deleted_at IS NULL AND published_at IS NOT NULL
     AND published_at > ? ORDER BY published_at ASC`
  ).all(new Date().toISOString());
}

export function publishedReleaseBySlug(db: DB, slug: string): any | undefined {
  return db.prepare(
    `SELECT * FROM releases WHERE slug = ? AND deleted_at IS NULL AND status = 'published'
     AND published_at IS NOT NULL AND published_at <= ?`
  ).get(slug, new Date().toISOString());
}

export function unlockedTracks(db: DB, releaseId: number): any[] {
  const now = new Date().toISOString();
  return db.prepare(
    `SELECT * FROM tracks WHERE release_id = ? AND deleted_at IS NULL
     AND (unlock_at IS NULL OR unlock_at <= ?) ORDER BY position`
  ).all(releaseId, now);
}

export function allTracks(db: DB, releaseId: number): any[] {
  return db.prepare(
    `SELECT * FROM tracks WHERE release_id = ? AND deleted_at IS NULL ORDER BY position`
  ).all(releaseId);
}

export const isUnlocked = (t: any): boolean =>
  !t.unlock_at || new Date(t.unlock_at).getTime() <= Date.now();

/** Données du lecteur persistant : extraits des titres publiés ET déverrouillés. */
export function libraryPayload(db: DB): { tracks: any[]; clips: any[]; live: any[]; upcoming: any[] } {
  const tracks: any[] = [];
  for (const rel of publishedReleases(db)) {
    for (const t of unlockedTracks(db, rel.id)) {
      tracks.push({
        n: t.title,
        feat: t.featuring ?? undefined,
        src: t.preview_path ?? undefined,
        yt: t.youtube_id ?? undefined,
        badge: rel.release_date && Date.parse(rel.release_date) > Date.now() - 60 * 864e5 && t.position === 1
          ? 'NOUVEAU' : undefined,
      });
    }
  }
  const seen = new Set<string>();
  const unique = tracks.filter((t) => { const k = (t.n || '').toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
  const lib = sceneSettings(db, 'library');
  const upcoming = upcomingReleases(db).map((r) => ({
    title: r.title, slug: r.slug, type: r.type ?? 'release', cover: r.cover_path ?? null,
    date: r.published_at, releaseDate: r.release_date ?? null, description: r.description ?? null,
  }));
  return { tracks: unique, clips: lib?.clips ?? [], live: lib?.live ?? [], upcoming };
}

export function sceneSettings(db: DB, key: string): any | null {
  const row = db.prepare('SELECT settings FROM scenes WHERE key = ?').get(key) as any;
  return row?.settings ? JSON.parse(row.settings) : null;
}

/** Médias d'une scène pilotés par la médiathèque du Dashboard : image hero et
 *  galerie (si fournie). Sert à rendre les images du site éditables côté Dashboard. */
export function sceneMedia(db: DB, key: string): { hero: string | null; gallery: string[]; zones: Record<string, string[]> } {
  const row = db.prepare('SELECT hero_path, settings FROM scenes WHERE key = ?').get(key) as any;
  let gallery: string[] = [];
  const zones: Record<string, string[]> = {};
  try {
    const s = row?.settings ? JSON.parse(row.settings) : {};
    if (Array.isArray(s.gallery)) gallery = s.gallery.filter(Boolean);
    // Zones par section (hero, le-dossier, …) : URLs déjà versionnées par le Dashboard.
    if (s.zones && typeof s.zones === 'object' && !Array.isArray(s.zones)) {
      for (const [k, v] of Object.entries(s.zones)) {
        if (Array.isArray(v)) zones[k] = (v as unknown[]).filter((u): u is string => typeof u === 'string' && u !== '');
      }
    }
  } catch { /* ignore */ }
  return { hero: row?.hero_path ?? null, gallery, zones };
}

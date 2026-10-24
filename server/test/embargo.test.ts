import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'node:crypto';
import { openDb, type DB } from '../src/db.ts';
import { publishedReleases, publishedReleaseBySlug, unlockedTracks, libraryPayload } from '../src/embargo.ts';

function addRelease(db: DB, slug: string, publishedAt: string | null, status: string): number {
  db.prepare('INSERT INTO releases (uuid, slug, title, published_at, status) VALUES (?,?,?,?,?)')
    .run(randomUUID(), slug, slug.toUpperCase(), publishedAt, status);
  return (db.prepare('SELECT id FROM releases WHERE slug=?').get(slug) as any).id;
}
function addTrack(db: DB, rel: number, title: string, unlockAt: string | null, pos = 1, preview = 'x.m4a') {
  db.prepare('INSERT INTO tracks (uuid, release_id, position, title, preview_path, unlock_at) VALUES (?,?,?,?,?,?)')
    .run(randomUUID(), rel, pos, title, preview, unlockAt);
}
const past = new Date(Date.now() - 864e5).toISOString();
const future = new Date(Date.now() + 30 * 864e5).toISOString();

describe('embargo (§4.6)', () => {
  let db: DB;
  beforeEach(() => {
    db = openDb(':memory:');
    const pub = addRelease(db, 'public', past, 'published'); addTrack(db, pub, 'MORCEAU-PUBLIC', null);
    const sec = addRelease(db, 'album-secret', future, 'scheduled'); addTrack(db, sec, 'MORCEAU-SECRET', future);
  });

  it('une sortie programmée est invisible', () => {
    const slugs = publishedReleases(db).map((r) => r.slug);
    expect(slugs).toContain('public');
    expect(slugs).not.toContain('album-secret');
  });

  it('la page d’une sortie sous embargo est introuvable (→ 404)', () => {
    expect(publishedReleaseBySlug(db, 'album-secret')).toBeUndefined();
    expect(publishedReleaseBySlug(db, 'public')).toBeTruthy();
  });

  it('un titre verrouillé n’est pas exposé', () => {
    const pub = (db.prepare("SELECT id FROM releases WHERE slug='public'").get() as any).id;
    addTrack(db, pub, 'TITRE-VERROUILLE', future, 2);
    const titres = unlockedTracks(db, pub).map((t) => t.title);
    expect(titres).toContain('MORCEAU-PUBLIC');
    expect(titres).not.toContain('TITRE-VERROUILLE');
  });

  it('la bibliothèque ne contient que du publié et déverrouillé', () => {
    const names = libraryPayload(db).tracks.map((t) => t.n);
    expect(names).toContain('MORCEAU-PUBLIC');
    expect(names).not.toContain('MORCEAU-SECRET');
  });
});

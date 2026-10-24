import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { openDb } from './db.ts';
import { config } from './config.ts';

/** Contenu initial = contenu réel validé (repris des JSON). En production il sera
 *  alimenté/écrasé par la synchro Dashboard. L'album 2026 est PROGRAMMÉ = invisible. */
export function seed(dbPath = config.dbPath): void {
  const db = openDb(dbPath);
  const base = new URL('../data/', import.meta.url).pathname;
  const lib = JSON.parse(readFileSync(base + 'library.json', 'utf8'));
  const home = JSON.parse(readFileSync(base + 'home-content.json', 'utf8'));
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  const scene = (key: string, settings: any) => db.prepare(
    'INSERT INTO scenes (uuid, key, intensity, settings) VALUES (?,?,?,?) ON CONFLICT(key) DO UPDATE SET settings=excluded.settings'
  ).run(randomUUID(), key, 'high', JSON.stringify(settings));
  scene('home', home);
  scene('library', {
    clips: lib.clips, live: lib.live,
    album_announce: { title: 'L’album — 12 titres', label: 'DÉVERROUILLAGE TITRE PAR TITRE — NOVEMBRE 2026', count: 12 },
  });

  const relId = (slug: string, row: any): number => {
    db.prepare(`INSERT INTO releases (uuid, slug, type, title, description, release_date, published_at, status, updated_at)
      VALUES (@uuid,@slug,@type,@title,@desc,@rd,@pub,@status,@u)
      ON CONFLICT(slug) DO UPDATE SET title=@title,published_at=@pub,status=@status`).run({ uuid: randomUUID(), slug, ...row, u: iso(now) });
    return (db.prepare('SELECT id FROM releases WHERE slug=?').get(slug) as any).id;
  };

  const cat = relId('catalogue', { type: 'mixtape', title: 'Catalogue', desc: 'Les titres publiés de DX-5 The Nigma.',
    rd: '2026-10-04', pub: iso(new Date(now.getTime() - 864e5)), status: 'published' });
  lib.tracks.forEach((t: any, i: number) => db.prepare(
    `INSERT INTO tracks (uuid, release_id, position, title, slug, featuring, preview_path, youtube_id)
     VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(uuid) DO NOTHING`
  ).run(randomUUID(), cat, i + 1, t.n, t.n.toLowerCase().replace(/[^a-z0-9]+/g, '-'), t.feat || null, t.src ?? null, t.yt ?? null));

  const alb = relId('album-2026', { type: 'album', title: 'Album 2026', desc: null,
    rd: '2026-11-15', pub: '2026-11-15T00:00:00.000Z', status: 'scheduled' });
  for (let n = 1; n <= 12; n++) db.prepare(
    'INSERT INTO tracks (uuid, release_id, position, title, slug, unlock_at) VALUES (?,?,?,?,?,?) ON CONFLICT(uuid) DO NOTHING'
  ).run(randomUUID(), alb, n, `Clé ${n}`, `cle-${n}`, '2026-11-15T00:00:00.000Z');

  const ev = (slug: string, r: any) => db.prepare(`INSERT INTO events (uuid, slug, title, description, starts_at, timezone, venue_name, city, country, status, published_at)
    VALUES (@uuid,@slug,@title,@desc,@starts,@tz,@venue,@city,@country,'past',@pub) ON CONFLICT(slug) DO NOTHING`)
    .run({ uuid: randomUUID(), slug, pub: iso(new Date(now.getTime() - 3 * 864e5)), ...r });
  ev('sofia-esfam-2024', { title: 'Invité d’honneur — 30ᵉ anniversaire ESFAM / AUF', desc: 'Club militaire central de Sofia 🇧🇬', starts: '2024-03-15T19:00:00.000Z', tz: 'Europe/Sofia', venue: 'Club militaire central', city: 'Sofia', country: 'Bulgarie' });
  ev('concours-scoutisme-2016', { title: 'Lauréat — Concours national du centenaire du scoutisme', desc: null, starts: '2016-07-01T18:00:00.000Z', tz: 'America/Port-au-Prince', venue: null, city: 'Haïti', country: 'Haïti' });

  db.close();
}

if (import.meta.url === `file://${process.argv[1]}`) { seed(); console.log('seed ✓'); }

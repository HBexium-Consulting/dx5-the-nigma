import { DatabaseSync } from 'node:sqlite';

export type DB = DatabaseSync;

/** Ouvre la base et applique le schéma (idempotent). uuid = clé de synchro ;
 *  deleted_at = suppression douce ; published_at/unlock_at = embargo (§4.6). */
export function openDb(path: string): DB {
  const db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  db.exec(`
    CREATE TABLE IF NOT EXISTS releases (
      id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL,
      type TEXT DEFAULT 'album', title TEXT NOT NULL, subtitle TEXT, description TEXT,
      cover_path TEXT, release_date TEXT, published_at TEXT, status TEXT DEFAULT 'draft',
      credits TEXT, deleted_at TEXT, updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE NOT NULL, release_id INTEGER NOT NULL,
      position INTEGER DEFAULT 1, title TEXT NOT NULL, slug TEXT, duration_seconds INTEGER,
      featuring TEXT, lyrics TEXT, preview_path TEXT, youtube_id TEXT, unlock_at TEXT,
      deleted_at TEXT, FOREIGN KEY(release_id) REFERENCES releases(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS streaming_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE NOT NULL, linkable_type TEXT, linkable_id INTEGER,
      platform TEXT, url TEXT, position INTEGER DEFAULT 1, visible INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL, description TEXT, starts_at TEXT NOT NULL, ends_at TEXT, timezone TEXT DEFAULT 'UTC',
      venue_name TEXT, city TEXT, country TEXT, status TEXT DEFAULT 'scheduled',
      ticket_mode TEXT DEFAULT 'none', ticket_url TEXT, cover_path TEXT, published_at TEXT, deleted_at TEXT
    );
    CREATE TABLE IF NOT EXISTS scenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE NOT NULL, key TEXT UNIQUE NOT NULL,
      palette TEXT, intensity TEXT DEFAULT 'medium', hero_path TEXT, ambient_path TEXT,
      headline TEXT, settings TEXT
    );
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, locale TEXT, source TEXT,
      confirmed_at TEXT, unsubscribed_at TEXT, token TEXT NOT NULL, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS booking_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT UNIQUE NOT NULL, organizer_name TEXT, organization TEXT,
      email TEXT, phone TEXT, event_type TEXT, event_date TEXT, city TEXT, country TEXT,
      expected_audience INTEGER, budget_amount INTEGER, budget_currency TEXT, message TEXT,
      status TEXT DEFAULT 'pending', idempotency_key TEXT UNIQUE, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, message TEXT, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS hbx_webhook_deliveries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, delivery_id TEXT UNIQUE NOT NULL, event TEXT,
      payload TEXT, processed_at TEXT, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS hbx_outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT, endpoint TEXT, payload TEXT,
      idempotency_key TEXT UNIQUE NOT NULL, attempts INTEGER DEFAULT 0, last_error TEXT,
      sent_at TEXT, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS hbx_sync_state (key TEXT PRIMARY KEY, value TEXT);
  `);
  return db;
}

export const nowIso = () => new Date().toISOString();

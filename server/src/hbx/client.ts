import { config } from '../config.ts';

/** Client de l'API Dashboard (§4.3). Toujours /api/v1 ; le visiteur ne déclenche
 *  jamais ces appels — uniquement la synchro et la file sortante. */
async function withTimeout(url: string, init: RequestInit, ms = 15000): Promise<Response> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try { return await fetch(url, { ...init, signal: ac.signal }); }
  finally { clearTimeout(t); }
}

export async function hbxGet(path: string, query: Record<string, string | undefined> = {}): Promise<Response> {
  const qs = new URLSearchParams(Object.entries(query).filter(([, v]) => v != null) as [string, string][]);
  const url = `${config.hbx.base}/${path}${qs.toString() ? `?${qs}` : ''}`;
  return withTimeout(url, { headers: { Authorization: `Bearer ${config.hbx.key}`, Accept: 'application/json' } });
}

export async function hbxPost(path: string, body: unknown, idempotencyKey?: string): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.hbx.key}`, 'Content-Type': 'application/json', Accept: 'application/json',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return withTimeout(`${config.hbx.base}/${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
}

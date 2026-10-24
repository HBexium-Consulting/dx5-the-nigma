# Site DX-5 The Nigma — service TypeScript

Backend **Node + TypeScript** (Fastify + SQLite intégré `node:sqlite`) qui remplace
l'ancienne fondation Laravel. **Aucun PHP, aucune dépendance native.**

Le Dashboard HBEXIUM reste la télécommande : il publie, le site **synchronise** et
sert **depuis sa propre base** (le visiteur ne déclenche jamais d'appel au Dashboard).

## Rôle (plan projet §4)
- **Embargo centralisé** (`src/embargo.ts`) : rien dont `published_at`/`unlock_at` est futur ne sort. Testé.
- **Webhook signé** (`src/routes/webhook.ts`) : HMAC `X-HBX-*`, fenêtre 5 min, idempotence `X-HBX-Delivery`, 202 sans appel API.
- **Synchronisation / réconciliation** (`src/hbx/`) : `sync/changes` + `server_time`, 410 → resync complète, commandes à distance.
- **File sortante idempotente** (`src/hbx/outbox.ts`) : formulaires stockés localement puis poussés — Dashboard éteint = rien perdu.
- **Rendu serveur** (`src/render.ts`, `src/server.ts`) : accueil immersif injecté depuis la base (SEO), pages, 404 sur sortie sous embargo.

## Lancer
```
npm install
HBX_API_KEY=… HBX_WEBHOOK_SECRET=… node src/seed.ts    # contenu initial
node src/server.ts                                       # :8788
npm test        # 10 tests : webhook (signature/rejeu), embargo, file sortante
npm run typecheck
```
Node ≥ 22 exécute le TypeScript nativement (pas d'étape de build).

## Config (env)
`PORT`, `DB_PATH`, `HBX_API_BASE`, `HBX_API_KEY`, `HBX_WEBHOOK_SECRET`.

## Déploiement (à venir)
Service `systemd` sur la VM2 derrière nginx (reverse proxy), `node src/server.ts`,
+ cron : `node src/hbx/reconcile.ts` (15 min) et `node src/hbx/outbox.ts --flush` (1 min).

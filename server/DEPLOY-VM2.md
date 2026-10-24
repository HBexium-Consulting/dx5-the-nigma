# DX-5 The Nigma — service connecté en production (VM2)

Le site **dx5thenigma.com** est servi par le service Node connecté au Dashboard
HBexium. Les sorties publiées côté Dashboard apparaissent automatiquement ; le
contenu immersif riche (accueil, bibliothèque, clips, extraits audio) est géré
par le site.

## Où tout se trouve (VM2 / HestiaCP)

| Élément | Emplacement |
|---|---|
| Runtime | `/opt/node24/bin/node` (Node 24, isolé — ne touche pas au Node système) |
| Application | `/opt/dx5-app/` = `server/` + `dx5thenigma/`, `dx5-pages/`, `dx5-bibliotheque/` |
| Config secrète | `/opt/dx5-app/server/.env` (clé API, port, DB) — `chmod 600`, user `hbexium2` |
| Base de données | `/opt/dx5-app/server/data/dx5.sqlite` (`node:sqlite`, sans dépendance native) |
| Service | `systemd` → `dx5.service` (port **3100**, `Restart=always`) |
| Proxy | nginx, template proxy Hestia **`dx5node`** (proxifie tout vers `127.0.0.1:3100`) |
| Crons (`hbexium2`) | réconciliation `*/15`, file sortante `*/5` (`/opt/dx5-app/cron-*.sh`) |

## Déploiement du contenu

`git push` sur `main` → GitHub Actions :
1. assemble `_site` → docroot `/home/dx5thenigma/.../public_html` (**repli statique**) ;
2. rsync des sources front → `/opt/dx5-app/{dx5thenigma,dx5-pages,dx5-bibliotheque}`.

Le service lit le HTML **à chaque requête** : une mise à jour de contenu est prise
en compte **sans redémarrage**. `@fastify/static` envoie des ETag → les assets
(CSS/JS) sont rafraîchis au prochain chargement.

## Déploiement du code serveur (manuel, rare)

```bash
rsync -az --exclude node_modules --exclude 'data/*.sqlite' --exclude .env \
  server/ hbexium-vm2:/opt/dx5-app/server/
ssh hbexium-vm2 'cd /opt/dx5-app/server && /opt/node24/bin/npm install --omit=dev && sudo systemctl restart dx5.service'
```

## Rétablir le site statique (rollback instantané)

```bash
ssh hbexium-vm2 'sudo /usr/local/hestia/bin/v-change-web-domain-proxy-tpl \
  dx5thenigma dx5thenigma.com default "" yes'
```

Le domaine repasse sur le docroot statique (dernière version assemblée). Pour
revenir au service connecté : même commande avec `dx5node` au lieu de `default`.

## Règles de contenu (respectées par la synchro)

- **Embargo** : une sortie n'est publique que si `status = 'published'` **et**
  `published_at` est passé. Un titre programmé/brouillon reste invisible.
- **Synchro additive** : le contenu riche du site (catalogue avec extraits et
  clips) n'est jamais écrasé ; seules les **nouvelles** sorties du Dashboard
  s'ajoutent. Les scènes vides du Dashboard sont ignorées.

## Diagnostic

```bash
ssh hbexium-vm2 'systemctl status dx5.service; tail /opt/dx5-app/server/data/reconcile.log'
curl -s https://dx5thenigma.com/api/v1/health
```

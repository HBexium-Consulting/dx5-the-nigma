# Feuille de route — Profil « Artist » du Dashboard HBEXIUM

**Objectif** : doter le Dashboard d'un profil `artist` **générique et commercialisable** — DX-5 The Nigma en est le premier tenant, pas le propriétaire. Rien dans le profil ne porte son nom, ses couleurs ou ses plateformes.
**Référence** : plan projet v2.1, sections 3 (entités), 4.2 (évolutions Dashboard) et 4.6 (embargo).
**Stack** : Laravel multi-tenant existant (Coolify, Horizon), migrations dans `database/migrations/tenant/`.

---

## Principes non négociables

1. **Générique d'abord** : chaque champ, libellé et écran doit avoir du sens pour un musicien, un peintre ou un photographe. Les spécificités DX-5 vivent dans les *données* du tenant, jamais dans le code.
2. **`uuid` partout, jamais d'`id` exposé** : c'est la clé de correspondance avec la base locale des sites clients.
3. **Suppression douce partout** (`deleted_at`) : sans elle, les sites synchronisés gardent les contenus supprimés pour toujours.
4. **L'API ne fuit jamais l'embargo** : aucun contenu dont `published_at` (ou `unlock_at`) est futur ne sort de l'API, quel que soit l'appelant. C'est testé, pas promis.

---

## Chantier 0 — Audits préalables *(0,5 j — bloquant pour le reste)*

- [ ] Confirmer dans le code (pas dans le contrat) : endpoints exacts et formats de `products`, `payments`, `blog`, `leads`, `media`, `settings`, `menus`
- [ ] Vérifier si un module newsletter/abonnés existe déjà (sinon : chantier 3)
- [ ] Vérifier s'il existe déjà un mécanisme de webhooks sortants (sinon : chantier 4, le plus gros morceau)
- [ ] Noter les conventions maison : versioning API, pagination, format d'erreurs, auth `hbx_`, policies tenant
- **Livrable** : une page de synthèse « existant vs à créer » qui met à jour cette feuille de route

## Chantier 1 — Socle du profil et modèle de données *(2 j)*

- [ ] Mécanisme d'activation du profil par tenant (réutiliser le système de modules/feature flags existant)
- [ ] Migrations tenant, schémas de la section 3.4 du plan :
  `releases`, `tracks`, `streaming_links`, `events`, `scenes`, `newsletter_subscribers`, `booking_requests`
- [ ] Modèles Eloquent + relations + traits maison (uuid, soft delete, tenant scope)
- [ ] `tracks.unlock_at` et champs `preview_media_id` / `full_media_id` distincts (public vs privé)
- [ ] Champ `credit` dans la médiathèque si absent (droits photographes — exigence du questionnaire)
- **DoD** : migrations réversibles, factories + seeders de démonstration (artiste fictif, pas DX-5)

## Chantier 2 — API de lecture `/api/v1` *(2 j)*

- [ ] `GET releases`, `releases/{uuid}`, `tracks` (imbriqués), `events`, `scenes`, `streaming_links`
- [ ] **Règle d'embargo centralisée** (scope global) : `published_at` futur → invisible ; `unlock_at` futur → le titre sort SANS son extrait ni ses métadonnées sensibles, uniquement les champs explicitement publics du compte à rebours (titre d'album, date, pochette si le client l'annonce)
- [ ] Champs de réponse stables et documentés (le site fait des tests de contrat dessus)
- **DoD** : tests d'embargo — créer un contenu programmé, vérifier qu'AUCUNE route ne le renvoie

## Chantier 3 — API d'écriture *(1,5 j)*

- [ ] `POST newsletter/subscribe` → double confirmation par e-mail (token), `GET confirm`, `GET unsubscribe`
- [ ] `POST booking-requests` avec `idempotency_key` (rejouable sans doublon — le site a une file de retries)
- [ ] Rattachement au module `tickets` existant pour le traitement
- **DoD** : rejouer 5 fois la même requête = 1 seul enregistrement ; e-mails de confirmation partent via la config du tenant

## Chantier 4 — Webhooks sortants génériques *(3 j — le chemin critique)*

C'est une **capacité de plateforme**, pas une fonctionnalité du profil artiste : tous les futurs profils en bénéficient.

- [ ] Table `webhook_endpoints` par tenant : URL, secret, liste d'événements, actif/inactif
- [ ] Signature : en-têtes `X-HBX-Event`, `X-HBX-Delivery` (uuid), `X-HBX-Timestamp`, `X-HBX-Signature` = HMAC-SHA256(timestamp + corps) — fenêtre de tolérance 5 min
- [ ] Corps minimal (signal, pas transport) : `{ entity, uuid, action }`
- [ ] Envoi en job Horizon, retries espacés (1 min, 5 min, 30 min, 2 h, abandon), timeout court
- [ ] Journal des livraisons consultable dans la fiche client (statut, code HTTP, re-déclencher à la main)
- [ ] Événements émis par le profil artiste : `release.*`, `track.*`, `event.*`, `scene.*`, `settings.updated`
- [ ] **Publication programmée** : tâche planifiée qui, à l'échéance de `published_at`/`unlock_at`, émet `release.published` / `track.unlocked` à l'heure exacte
- [ ] Commandes à distance : `site.cache.purge`, `site.maintenance.on/off`, `site.sync.full` (boutons dans la fiche client)
- **DoD** : webhook perdu → rattrapé par le chantier 5 ; rejoué → idempotent côté site grâce à `X-HBX-Delivery`

## Chantier 5 — Endpoint de réconciliation *(1,5 j)*

- [ ] Table `change_log` tenant (entity, uuid, action, at) alimentée par observers sur toutes les entités synchronisées — y compris les suppressions
- [ ] `GET /api/v1/sync/changes?since=…&cursor=…` → `{ data[], next_cursor, server_time }`
- [ ] Le client stocke `server_time`, jamais sa propre horloge (documenté dans le contrat)
- [ ] Purge du journal au-delà de 90 jours + réponse `410 resync_required` si `since` trop ancien → le site déclenche une resynchronisation complète
- **DoD** : scénario « site éteint 24 h » rejoué en test : il converge sans webhook

## Chantier 6 — Back-office artiste *(2,5 j)*

- [ ] Écrans CRUD : sorties (pochette, titres ordonnés, extraits, liens plateformes, `published_at`), agenda (fuseau horaire, statut, billetterie externe), scènes (visuel, nappe sonore, accroche, palette parmi presets, intensité)
- [ ] Upload des extraits (30 s max, validation durée/format) et des fichiers complets (privés)
- [ ] Vue « embargo » : ce qui est programmé, quand, et ce que le public voit aujourd'hui
- [ ] Libellé de campagne de don paramétrable (« Soutenir l'artiste »)
- **DoD** : un artiste formé publie une sortie complète sans assistance (critère du questionnaire DX-5)

## Chantier 7 — Santé et observabilité *(0,5 j)*

- [ ] `GET /api/v1/health` sans auth (version, horloge serveur)
- [ ] Alerte si un endpoint webhook accumule les échecs

## Chantier 8 — Provisioning du tenant DX-5 *(0,5 j)*

- [ ] Tenant « dx5 », profil `artist` activé, clé API `hbx_` générée
- [ ] Endpoint webhook déclaré vers le site (recette d'abord : sous-domaine hbexium.com)
- [ ] Seeds réels : la sortie « VETERAN » (single, octobre 2026), l'album 12 titres en brouillon programmé, l'événement Sofia mars 2024 en « passé », les liens plateformes nettoyés (voir maquette)
- [ ] Test de bout en bout AVEC Cloudflare activé (règles d'exception `/hbx/hooks` et `/api/v1/*` — plan 4.4)

## Chantier 9 — Documentation contractuelle *(1 j)*

- [ ] Avenant au contrat d'intégration : nouvelles entités, webhooks, `sync/changes`, règles d'embargo, exemples signés
- [ ] Changelog d'API versionné — le site teste les champs attendus avant chaque déploiement

---

## Découpage temporel

| Lot | Chantiers | Durée | Débloque |
|---|---|---|---|
| **Lot A — minimum teaser** (objectif : avant la sortie de l'album) | 0, 1 (sans events/booking), 2 (releases/tracks/scenes), 4 (webhooks + publication programmée), 3 (newsletter seule), 8 | ≈ 7 j | Le teaser Phase 1 : compte à rebours piloté, bascule à l'heure exacte, newsletter |
| **Lot B — profil complet** | reste de 1-3, 5, 6, 7, 9 | ≈ 6 j | Site complet Phase 2, formation client, revente du profil à d'autres artistes |

Total ≈ **13 jours de développement** Dashboard, hors imprévus d'audit (chantier 0 peut en ajouter ou en retirer). Les chantiers 4 et 5 sont mutualisables sur tous les futurs profils : à arbitrer dans le devis entre « porté par ce client » et « investissement produit » (note interne du devis).

## Risques identifiés

- **Webhooks inexistants dans le socle** → le chantier 4 grossit ; c'est l'inconnu n°1, levé par l'audit.
- **Fuite d'embargo** : le risque métier le plus grave (l'album fuite avant la date). Traité par scope central + tests dédiés, jamais par des `if` dispersés.
- **Horloges** : publication programmée et signatures dépendent du NTP des deux VM (plan 4.4).
- **Généricité qui dérive** : toute demande « juste pour DX-5 » passe par une donnée de tenant ou un preset, sinon refus — c'est la condition pour revendre le profil.

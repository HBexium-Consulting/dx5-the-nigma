# DX-5 The Nigma : site officiel piloté par le Dashboard HBEXIUM

**Version** : v2.1, 13 octobre 2026
**Client** : DEBROSSE Félix, nom d'artiste « DX-5 The Nigma »
**Discipline** : musique (Hip Hop / Rap), écriture
**Prestataire** : HBEXIUM Consulting
**Source** : questionnaire client du 10 octobre 2026
**Site** : application autonome, hébergée avec sa propre base sur HestiaCP (plan d'hébergement client)
**Backend** : Dashboard HBEXIUM, tenant dédié, profil `artist` (à créer), qui alimente et pilote le site par API
**Base API** : `https://dashboard.hbexium.com/api/v1`
**Échéance annoncée par le client** : mise en ligne en octobre 2026, avant la sortie de l'album en novembre 2026

---

## 0. Ce qui change

### v1 → v2

| | v1 | v2 |
|---|---|---|
| Hébergement du site | Non précisé, front Next.js sur le modèle HASDI | **Application autonome sur HestiaCP**, plan d'hébergement, base locale |
| Rôle du Dashboard | Source de vérité lue à chaque requête | **Télécommande** : il publie, le site synchronise et sert depuis sa propre base |
| Lien site / Dashboard | Appels API à la volée | **Synchronisation** par signal webhook + lecture API + réconciliation périodique |
| Direction artistique | Sobre, à définir | **Expérience immersive**, concept « L'Énigme », visuels réactifs au son |
| Stack front | Next.js | **Laravel + Blade + Vite**, transitions de page sans rechargement, adaptée à Hestia |

### v2 → v2.1 (13 octobre)

- **Le budget n'est plus présenté comme bloquant.** Le bloquant réel est la **signature du devis de Phase 1**. Le budget « N/A » est une information manquante qui déplace le calibrage vers HBEXIUM (devis par phase), rien de plus. Voir 2.2.
- **Domaines vérifiés** : `dx5thenigma.com` et `dxfivedanigma.com` sont **tous deux libres** au 13 octobre 2026 (whois). À réserver sans attendre via Openprovider.
- **Quatre constats du questionnaire intégrés** : bloc de validation final non signé (droits sur les contenus), existence d'un « responsable de marketing », ligne « Morceaux ou albums » entièrement vide, délai de retour et témoignages non renseignés. Voir 2.2.
- **Prototype de validation du concept** : une maquette one-page immersive (template « Site Immersif ») est en production pour faire valider le concept « L'Énigme », la palette et le ton au client — point 5 de la Phase 0 — sans attendre le développement Laravel.

---

## 1. Lecture rapide

Le projet est faisable, mais pas dans la forme demandée et pas dans le délai demandé.

Le client a coché toutes les cases : vente de musique et de produits dérivés, billetterie, espace réservé, dons, newsletter, blog hebdomadaire, livraison dans tous les pays, tous les moyens de paiement. Il faut maintenant y ajouter une exigence artistique très haute. Et le Dashboard n'a pas encore de profil Artiste, ce qui place un développement côté Dashboard sur le chemin critique.

Nous sommes le 13 octobre. Une expérience immersive de haut niveau ne se livre pas en deux semaines et demie. La stratégie honnête :

1. **Fin octobre** : un *teaser immersif* de lancement d'album, une seule scène forte (compte à rebours, extrait audio réactif, newsletter, liens), déjà branchée sur le Dashboard.
2. **Novembre et après** : le site complet, déployé par phases.

Deux points bloquent le démarrage : la **signature du devis de Phase 1** (le client n'a pas communiqué de budget : c'est donc le devis par phase qui calibre l'ambition, et la signature qui engage) et l'**adresse e-mail de réception** (trois versions contradictoires). Le nom de domaine, lui, est vérifié : les deux choix du client sont libres au 13 octobre — il reste à les réserver, ce qui se fait en quelques minutes une fois le devis signé.

---

## 2. Analyse du questionnaire

### 2.1 Ce qui est clair et exploitable

| Élément | Réponse du client | Conséquence pour le projet |
|---|---|---|
| Identité | DX-5 The Nigma, indépendant, actif depuis 2007 | Pas de label à consulter pour les droits ou la validation |
| Valeurs | Authentique, Créatif, Engagé | Base du ton éditorial et de la page À propos |
| Réalisation majeure | Lauréat du concours national de musique du centenaire du scoutisme en Haïti, 2016 | Photo du trophée annoncée, à mettre en avant |
| Événement de référence | Invité d'honneur, 30e anniversaire ESFAM/AUF, Club militaire central de Sofia, mars 2024 | Section « Événements passés » |
| Actualité structurante | Album de 12 titres, sortie prévue en novembre 2026 | Le site doit servir la sortie, c'est son premier usage |
| Audience | Mobile en priorité ; 14 pays cités, Haïti en tête | Contrainte forte sur le poids de l'expérience immersive |
| Plateformes à afficher | Instagram (2,69K), compte Facebook (5K), TikTok (22,9K), YouTube (15,8K) | TikTok et YouTube portent l'audience réelle |
| Plateformes à ne pas afficher pour l'instant | Page Facebook, X, Spotify, Audiomack, SoundCloud | Comptes récents, à réactiver plus tard |
| Autonomie | Veut gérer le site seul, demande une formation | Toute l'expérience doit être alimentée depuis le Dashboard, sans toucher au code |
| Validation | Le client valide seul, joignable 7j/7 de 9h à 20h — **mais un « responsable de marketing » rédige et valide les textes avec lui** (section 3 du questionnaire) | Circuit de décision court ; identifier cette personne et son rôle exact |

### 2.2 Lacunes et contradictions à lever

**Budget non renseigné — information manquante, pas un bloquant.** Les deux lignes budget portent « N/A ». C'est un cas banal : beaucoup de clients ne veulent pas annoncer un chiffre en premier, ou n'ont aucune idée de ce que coûte un site. La question du budget dans le questionnaire sert au calibrage (vitrine simple ou expérience sur mesure : écart de coût d'un facteur dix), pas à conditionner le démarrage. Le « N/A » déplace simplement la charge : puisque le client ne calibre pas, **HBEXIUM calibre par un devis par phase** (teaser d'octobre à prix fixe, puis site complet, puis monétisation), et le client choisit jusqu'où il va. **Ce qui bloque, c'est la signature du devis de Phase 1** : ce client a coché toutes les cases, veut « le meilleur site d'artiste » et annonce un logo qui « peut être modifié à tout moment » — profil type du périmètre qui gonfle. Démarrer un développement sur mesure (profil `artist` + site immersif) sans engagement écrit sur un périmètre et un prix, c'est prendre tout le risque à sa charge.

**Bloc de validation du questionnaire non signé.** Le questionnaire se termine par « Je confirme que les informations fournies sont exactes et que je dispose des droits sur les contenus transmis » — nom, date et signature sont restés vides. Combiné à la réponse « Personne » sur les droits photos (ci-dessous), le projet n'a aujourd'hui **aucune garantie écrite sur les droits**. À faire signer avec le devis.

**Un « responsable de marketing » apparaît.** À la question « Qui rédigera ou validera les textes du site ? », le client répond « Moi-même et mon responsable de marketing ». La v2 disait que le client valide seul et qu'il n'y a pas d'équipe : c'est inexact pour les contenus. Cette personne existe, elle touchera aux textes — identifier son nom, son contact et son poids réel dans le circuit de validation avant la rédaction des pages.

**La ligne « Morceaux ou albums » est entièrement vide.** Dans le tableau des contenus, c'est la seule ligne laissée blanche — ni disponible, ni quantité, ni liens — alors que c'est la ligne la plus importante pour un site de musicien dont le premier usage est une sortie d'album. Conclusion opérationnelle : **aucun fichier audio ni lien de morceau n'existe à ce jour côté client.** La collecte de l'audio (extraits de 30 s par titre au minimum) est sur le chemin critique du teaser.

**Adresse e-mail incohérente.** Trois adresses apparaissent : `dxfive2707@gmail.com` (section 5), `dxfive2707@mail.com` (section 8, probablement une faute de frappe) et `dxfivethenigma@gmail.com` (pas encore créée). Le client demande aussi une adresse à son nom de domaine. Recommandation : `contact@dx5thenigma.com`, créée sur Hestia avec le plan d'hébergement, et redirigée vers sa boîte Gmail si besoin. Faire confirmer l'adresse Gmail exacte.

**Nom de domaine — vérifié le 13 octobre.** Choix préféré `dx5thenigma.com`, second choix `dxfivedanigma.com`. **Les deux sont libres** (whois du 13/10/2026). À réserver via Openprovider dès la signature. Le second choix écrit « da » et non « the » : savoir si c'est voulu reste utile si le client veut les deux.

**Droits sur les photos et vidéos.** Réponse : « Personne ». C'est ambigu. Soit le client est l'auteur des images, soit il n'a pas identifié les photographes, qui conservent en principe des droits sur leurs images. Faire préciser et prévoir un champ « crédit » dans la médiathèque. Point renforcé par l'absence de signature du bloc de validation (ci-dessus).

**Langues.** Réponse « (OUI) » sans liste. Proposition à soumettre : français et anglais en V1, créole haïtien ensuite si le client produit les textes.

**Couleurs.** Il veut éviter « les couleurs trop chaudes », mais cite l'or et le rouge. La direction artistique proposée en section 6 tranche : bleu nuit et noir en fond, or et rouge en signaux ponctuels. À valider avec lui — le prototype one-page sert précisément à cela.

**Ambiance.** Aucune case cochée, aucun site de référence. La section 6 lui propose un concept plutôt que d'attendre une réponse.

**Logo.** « Peut être modifié à tout moment. » Le site lit le logo depuis les réglages synchronisés, jamais en dur.

**Priorités.** Objectifs non numérotés, plateforme principale non indiquée. Lui demander de classer ses trois objectifs.

**Lien Spotify.** Le lien fourni pointe vers un profil utilisateur (`open.spotify.com/user/...`), pas vers une page artiste. Il faut l'URL de la page artiste. Même remarque pour Apple Music, Deezer et Bandcamp.

**Liens de réseaux sociaux.** Paramètres de suivi à nettoyer (`?si=`, `?mibextid=`, `utm_source`, `_t=`). Liens Facebook `share/` à remplacer par l'URL canonique.

**Bouton de don.** Le client est une personne physique. Formulation retenue : « Soutenir l'artiste ». Le régime applicable à ces contributions, en Haïti comme en Bulgarie, reste à faire vérifier par le client.

**Vente physique « dans tous les pays ».** Aucun produit, aucune quantité, aucun expéditeur précisé. Vendre d'abord du numérique, ouvrir le physique quand un circuit d'expédition existe.

**Contenus sous embargo.** Seule restriction exprimée. Avec un site qui possède sa propre base, c'est devenu un point d'architecture : voir section 4.6.

**Maintenance.** Le client refuse un contrat s'il est formé. Mais son site vit sur un plan d'hébergement Hestia et dépend d'un tenant Dashboard : mises à jour de sécurité, sauvegardes et maintien de la connexion restent à notre charge. Il faut un abonnement d'hébergement qui couvre cela, présenté clairement.

**Détails mineurs mais révélateurs.** Le délai de retour du questionnaire (page 1) est resté vide, la ligne « Témoignages » aussi. Motif général confirmé : le client coche tout mais ne fournit encore presque rien de concret. La collecte des contenus (2.3) est le second chemin critique du projet, après le profil `artist`.

### 2.3 Ce qu'il faut encore recevoir

- [ ] **Devis de Phase 1 signé** (bloquant)
- [ ] **Bloc de validation du questionnaire signé** (droits sur les contenus)
- [ ] Identité et rôle du responsable de marketing
- [ ] Logo en PNG transparent ou vectoriel
- [ ] 5 à 15 photos HD, avec le nom du photographe
- [ ] Photo du trophée 2016
- [ ] Biographie courte et longue, ou dossier de presse
- [ ] Dossier de presse PDF
- [ ] Discographie complète : titres, dates, pochettes, liens — **ligne vide dans le questionnaire : tout est à collecter**
- [ ] Album : 12 titres, date de sortie exacte, pochette, un extrait de 30 secondes par titre
- [ ] **Matière brute pour l'immersion** : rushes vidéo, séquences de studio, voix a cappella, textures sonores, manuscrits ou carnets d'écriture
- [ ] URL des pages artiste Spotify, Apple Music, Deezer, Audiomack
- [ ] Liens des clips YouTube à mettre en avant
- [ ] Agenda des prochaines dates
- [ ] Fiche technique
- [ ] Liste des produits à vendre, avec prix envisagés
- [ ] Langues retenues
- [ ] Adresse e-mail confirmée

---

## 3. Le profil `artist` dans le Dashboard

### 3.1 Le principe

Le Dashboard ne rend aucune page de ce site. Il sert de back-office et de télécommande : le client y saisit ses sorties, ses dates, ses articles et ses réglages, et le Dashboard les transmet au site.

Le profil `artist` n'existe pas. Il se crée **de façon générique** dans le Dashboard, pas comme un développement propre à ce client. Un profil Artiste réutilisable devient une offre HBEXIUM pour d'autres musiciens, peintres ou photographes. DX-5 The Nigma en est le premier tenant. Rien dans le profil ne doit porter son nom, ses couleurs ou ses plateformes.

### 3.2 Modules existants réutilisables

D'après le contrat d'intégration HBEXIUM v2026-08-10 et le provisioning HASDI. **Les endpoints exacts de `products`, `payments` et `blog` sont à confirmer dans le contrat.**

| Module existant | Usage dans le profil Artiste |
|---|---|
| `pages` + `blocks` | Accueil, À propos, pages légales |
| `blog` (`posts`) | Actualités |
| `media` | Photos, pochettes, dossier de presse, fiche technique |
| `products` | Album, titres, produits dérivés |
| `payments`, `invoices` | Encaissement et reçus de commande |
| `customers` | Fans acheteurs, programmateurs |
| `campaigns` + `donations` | « Soutenir l'artiste » (libellé à adapter dans le profil) |
| `testimonials`, `partners`, `faq` | Optionnels |
| `tickets` | Traitement des demandes |
| `GET /settings` | Nom, logo, couleurs, réseaux sociaux, e-mail |
| `GET /menus/{slug}` | Navigation |
| `POST /leads` | Contact simple |

### 3.3 Entités à créer

| Entité | Pourquoi les modules existants ne suffisent pas | Priorité |
|---|---|---|
| `releases` et `tracks` | Titres, pochette, date de sortie, liens par plateforme, crédits | **V1** |
| `streaming_links` | Liens par plateforme, pour l'artiste et pour chaque sortie | **V1** |
| `events` | Agenda daté avec fuseau horaire, lieu, statut, lien billetterie | **V1** |
| `newsletter_subscribers` | Double confirmation, désinscription. Vérifier s'il existe déjà | **V1** |
| `scenes` | Paramètres de l'expérience immersive pilotables par le client (voir 6.4) | **V1** |
| `booking_requests` | Date, lieu, budget, type d'événement | V1 ou `leads` en contournement |
| `private_spaces` | Espace professionnel protégé | Phase 2 |
| Billetterie intégrée | Jauge, prix, QR code | Phase 3 |

### 3.4 Modèle de données

Migrations dans `database/migrations/tenant/` du Dashboard.

```
releases
  id, uuid, slug, type (album|ep|single|mixtape),
  title, subtitle, description,
  cover_media_id, release_date, published_at,
  status (draft|scheduled|published),
  credits (json), product_id (nullable),
  timestamps, deleted_at

tracks
  id, uuid, release_id, position, title, slug,
  duration_seconds, isrc, explicit (bool), featuring,
  lyrics (text, nullable),
  preview_media_id (nullable)    -- extrait public
  full_media_id (nullable)       -- fichier complet, privé
  unlock_at (nullable)           -- déverrouillage individuel, voir 6.3
  product_id (nullable), timestamps, deleted_at

streaming_links
  id, uuid, linkable_type, linkable_id,
  platform, url, position, visible (bool), timestamps

events
  id, uuid, slug, title, description,
  starts_at, ends_at, timezone,
  venue_name, city, country,
  status (scheduled|cancelled|postponed|past),
  ticket_mode (none|external|internal), ticket_url,
  cover_media_id, published_at, timestamps, deleted_at

scenes
  id, uuid, key (home|release|tour|about…),
  palette (json), intensity (low|medium|high),
  hero_media_id, ambient_audio_media_id,
  headline, settings (json), timestamps

newsletter_subscribers
  id, email, locale, source, confirmed_at,
  unsubscribed_at, token, timestamps

booking_requests
  id, uuid, organizer_name, organization, email, phone,
  event_type, event_date, city, country,
  expected_audience, budget_amount, budget_currency,
  message, status, ticket_id, idempotency_key, timestamps
```

`uuid` sur chaque entité synchronisée : c'est la clé de correspondance entre la base du Dashboard et celle du site. Ne jamais synchroniser sur l'`id` auto-incrémenté.

`deleted_at` (suppression douce) : sans lui, le site ne peut pas savoir qu'un contenu a été supprimé et le garde indéfiniment.

---

## 4. Architecture de connexion

C'est la partie qui décide si le site tient en production. Le site et le Dashboard sont sur deux serveurs distincts, deux piles logicielles distinctes, deux bases distinctes. Chaque point de contact est un point de panne possible.

### 4.1 Le schéma

```
 ┌──────────────────────────┐                      ┌──────────────────────────┐
 │  Dashboard HBEXIUM       │                      │  Site DX-5 (HestiaCP)    │
 │  VM 1 · Coolify          │                      │  VM 2 · plan client      │
 │  Tenant « dx5 »          │                      │  Laravel + base locale   │
 │                          │  ① signal (webhook)  │                          │
 │  Le client publie  ──────┼─────────────────────►│  /hbx/hooks              │
 │                          │     HMAC, sans données│        │                 │
 │                          │                      │        ▼ job en file     │
 │  /api/v1  ◄──────────────┼──── ② lecture ───────┼── SyncService            │
 │                          │     Bearer hbx_      │        │                 │
 │                          │                      │        ▼                 │
 │                          │                      │  Base locale ──► pages   │
 │                          │  ③ écriture          │                          │
 │  /api/v1/leads, …  ◄─────┼──── (outbox) ────────┼── formulaires, commandes │
 │                          │                      │                          │
 │                          │  ④ réconciliation    │                          │
 │  /api/v1/sync/changes ◄──┼──── toutes les 15 min┼── cron Hestia            │
 └──────────────────────────┘                      └──────────────────────────┘
```

Quatre règles en découlent :

1. **Le visiteur ne déclenche jamais d'appel au Dashboard.** Toutes les pages sont servies depuis la base locale. Si le Dashboard tombe, le site reste en ligne et intact.
2. **Le webhook est un signal, pas un transport.** Il dit « la sortie X a changé ». Le site va ensuite lire la version à jour via l'API. Un webhook perdu ou rejoué n'a donc aucune conséquence grave.
3. **La réconciliation rattrape tout.** Toutes les 15 minutes, le site demande ce qui a changé depuis son dernier passage. Même sans aucun webhook, le site finit cohérent.
4. **Les écritures passent par une file locale.** Une demande de booking est d'abord enregistrée sur le site, puis envoyée au Dashboard. Si l'envoi échoue, elle est retentée. Aucune demande de fan ne se perd.

### 4.2 Ce qu'il faut ajouter au Dashboard

À vérifier dans le contrat actuel. S'ils n'existent pas, ce sont des évolutions à faire **avant** le site.

**Webhooks sortants par tenant.** Configuration dans la fiche client : URL de destination, secret de signature, liste d'événements. Envoi en job Horizon, avec tentatives espacées et journal des livraisons consultable.

```
POST https://dx5thenigma.com/hbx/hooks
X-HBX-Event: release.updated
X-HBX-Delivery: 7f3c…           -- identifiant unique, pour l'idempotence
X-HBX-Timestamp: 1760371200
X-HBX-Signature: sha256=…       -- HMAC du timestamp + corps
{ "entity": "release", "uuid": "…", "action": "updated" }
```

**Endpoint de changements.**

```
GET /api/v1/sync/changes?since=2026-10-13T10:00:00Z&cursor=…
→ { "data": [ { "entity": "release", "uuid": "…", "action": "updated", "at": "…" },
              { "entity": "event",   "uuid": "…", "action": "deleted", "at": "…" } ],
    "next_cursor": "…", "server_time": "…" }
```

Le site stocke `server_time` comme prochaine valeur de `since`, jamais sa propre horloge.

**Événement de publication programmée.** Quand `published_at` arrive à échéance, le Dashboard doit émettre `release.published` à ce moment-là, par une tâche planifiée. Sans cela, le site n'apprend la publication qu'à la réconciliation suivante.

**Commande à distance.** Quelques événements de pilotage, pour la logique de télécommande :

```
site.cache.purge        vider le cache du site
site.maintenance.on     afficher la page de maintenance
site.maintenance.off
site.sync.full          resynchronisation complète
```

**Endpoint de santé.** `GET /api/v1/health` sans authentification, pour la surveillance.

### 4.3 Côté site : composants

```
app/
  Hbx/
    HbxClient.php          appels API, en-têtes, délais, tentatives
    WebhookController.php  vérifie la signature, met un job en file, répond 202
    SyncService.php        lit une entité via l'API, l'écrit en base locale
    ReconcileCommand.php   php artisan hbx:reconcile
    Outbox.php             écritures sortantes en attente
  Models/                  copies locales : Release, Track, Event, Scene…
```

Le contrôleur de webhook **répond en moins d'une seconde** et ne fait aucun appel API lui-même. Il vérifie la signature, enregistre l'identifiant de livraison, met un job en file, renvoie `202`. Un webhook qui attend une réponse de l'API pendant que le Dashboard attend la réponse du webhook, c'est le blocage classique entre deux serveurs.

### 4.4 Pièges de connexion identifiés

Ce sont les causes de panne les plus probables dans cette configuration précise.

**En-tête `Authorization` perdu sur Hestia.** Avec Apache et PHP-FPM, l'en-tête `Authorization` des requêtes entrantes n'atteint souvent pas PHP sans configuration. C'est pourquoi la signature du webhook voyage dans `X-HBX-Signature`, un en-tête personnalisé. Dans l'autre sens (site vers Dashboard), le problème ne se pose pas.

**Cloudflare qui bloque les appels entre serveurs.** Si `dx5thenigma.com` passe par le proxy Cloudflare avec une protection anti-robots active, les webhooks du Dashboard peuvent recevoir un défi au lieu d'atteindre le site, et échouer en silence. Même risque dans l'autre sens si `dashboard.hbexium.com` est protégé. Créer une règle d'exception pour `/hbx/hooks` côté site et pour `/api/v1/*` côté Dashboard, et tester avec la protection activée.

**Certificat SSL.** Le Dashboard doit refuser tout appel vers un certificat invalide. Émettre le certificat Let's Encrypt dans Hestia avec l'enregistrement DNS en mode « DNS only », puis passer en proxy avec le mode SSL « Full (strict) ». En mode « Flexible », Cloudflare parle en HTTP au serveur et crée des boucles de redirection.

**Horloges désynchronisées.** La signature contient un horodatage, refusé au-delà de 5 minutes d'écart. Vérifier que la synchronisation horaire est active sur les deux VM, sinon les webhooks seront rejetés de façon aléatoire.

**Clé API exposée.** La clé `hbx_` vit dans le `.env` du site, **hors** du dossier web. Sur Hestia, la racine par défaut est `public_html` : la racine web doit pointer vers le dossier `public/` de Laravel. Vérifier l'option de racine personnalisée du domaine dans la version de Hestia installée, ou passer par un modèle web. Ne jamais déposer le projet Laravel entier dans `public_html`.

**Version de PHP.** Choisir dans Hestia une version de PHP compatible avec la version de Laravel retenue pour le site, et la figer.

**Files d'attente et tâches planifiées sans superviseur.** Hestia ne fournit pas de gestionnaire de processus permanent comme Horizon sur Coolify. Utiliser la planification de tâches de Hestia :

```
* * * * *  cd ~/web/dx5thenigma.com/app && php artisan schedule:run
```

et lancer depuis le planificateur Laravel `queue:work --stop-when-empty` chaque minute, avec la réconciliation toutes les 15 minutes. File d'attente en base de données, pas en Redis, sauf si Redis est disponible sur le plan.

**Adresses IP.** Si une liste blanche est mise en place entre les deux serveurs, les IP publiques des deux VM doivent être statiques dans Azure. Vérifier aussi que les règles réseau des deux VM laissent passer le HTTPS sortant.

**Distance entre les VM.** Si le Dashboard et Hestia sont dans deux régions Azure différentes, chaque appel synchrone coûte un aller-retour transcontinental. La règle 4.1 n°1 neutralise ce problème pour les visiteurs. Ne jamais la contourner « pour une petite page ».

**Contrat d'API qui évolue.** Le site appelle toujours `/api/v1`, jamais une route non versionnée. Un test automatique côté site, lancé avant chaque déploiement, vérifie que les champs attendus sont toujours présents dans les réponses.

### 4.5 Médias

C'est le point le plus lourd pour un site immersif.

- **Images** : à la synchronisation, le site télécharge chaque image depuis le Dashboard, la stocke localement et en génère les variantes (formats modernes, plusieurs tailles). Il ne fait jamais pointer les pages vers des images hébergées sur le Dashboard : chaque visite chargerait la VM du Dashboard.
- **Audio** : extraits de 30 secondes copiés localement, servis par le serveur web du site. Les fichiers complets vendus restent privés et sont servis par lien signé à durée limitée.
- **Vidéo** : clips sur YouTube, intégrés au clic. Seules de courtes boucles d'ambiance (quelques secondes, muettes, compressées) sont hébergées sur Hestia. Le disque de la VM Hestia est partagé entre tous les sites clients : un site d'artiste qui y stocke des vidéos longues pénalise les autres.
- **Quota** : fixer dans le plan d'hébergement du client un quota disque explicite.

### 4.6 Embargo et publication programmée

Avec une base locale, le risque change de nature : si le site copie un contenu programmé avant sa date, l'album peut fuiter depuis la base du site.

Règle : **l'API ne renvoie jamais un contenu dont `published_at` est dans le futur**, quel que soit l'appelant. Le site ne reçoit donc rien avant l'heure. Les fichiers audio des titres non sortis ne quittent jamais le Dashboard avant leur date.

Exception assumée : le site peut recevoir le titre de l'album, sa date et sa pochette pour le compte à rebours, si le client choisit de les annoncer. Ce sont alors des champs explicitement publics, distincts du contenu sous embargo.

### 4.7 Paiements

Un seul système reçoit les webhooks de paiement. Si le contrat prévoit l'encaissement par le Dashboard (comme `POST /donations` pour HASDI), le site ne reçoit **aucun** webhook Stripe ou Kobara. Il crée la commande via l'API avec une clé d'idempotence, redirige vers la page de paiement, puis affiche le statut lu auprès du Dashboard. Deux systèmes qui écoutent le même paiement finissent toujours par se contredire.

| Moyen | Public | Statut |
|---|---|---|
| Carte via Stripe | International, diaspora | Retenu pour HBEXIUM |
| MonCash et NatCash via Kobara | Haïti | Compte marchand et conditions à valider |
| PayPal | Diaspora, Amérique latine | Non intégré, à évaluer |

Compte de réception des fonds à clarifier : le client réside en Bulgarie et vend vers Haïti. Les conditions d'ouverture d'un compte Stripe selon le pays de résidence sont à vérifier directement auprès de Stripe.

### 4.8 Mode dégradé

| Panne | Comportement attendu |
|---|---|
| Dashboard injoignable | Site intact, servi depuis sa base. Formulaires acceptés et mis en file. Achat désactivé avec un message clair |
| Webhook perdu | Rattrapé par la réconciliation sous 15 minutes |
| Webhook rejoué | Ignoré grâce à `X-HBX-Delivery` |
| API renvoie 404 « Module inactif » | Section masquée, aucune erreur |
| File d'attente bloquée | Alerte, données non perdues (stockées en base) |

---

## 5. Stack du site

### 5.1 Choix

**Laravel + Blade + Vite**, sur Hestia.

- Hestia est conçu pour PHP. Next.js en rendu serveur demande un processus Node permanent, que Hestia ne gère pas nativement : ce serait un service hors du panneau, sans surveillance, et le premier à tomber.
- Le rendu serveur Blade garantit le référencement de chaque page.
- La même pile que le Dashboard : une seule compétence pour maintenir les deux côtés de la connexion.

### 5.2 Comment obtenir l'immersion sans application monopage

Le site reste rendu côté serveur, mais la navigation se fait **sans rechargement** grâce à une bibliothèque de transitions de page (type Swup ou Barba.js). Cela permet :

- un lecteur audio qui **ne s'interrompt jamais** en changeant de page ;
- des transitions animées entre les sections ;
- une scène visuelle persistante en arrière-plan.

Bibliothèques envisagées, à valider (licence, poids, maintenance) avant adoption : GSAP pour les animations, Lenis pour le défilement fluide, Three.js pour les scènes 3D, l'API Web Audio du navigateur pour l'analyse du son en temps réel.

---

## 6. Direction artistique : « L'Énigme »

### 6.1 Concept

« The Nigma » se lit comme *enigma*. « DX-5 » sonne comme un code, une machine, une référence classée. Le site ne se présente pas comme une vitrine : il se présente comme un **dossier à décrypter**. Le visiteur ne lit pas la biographie de l'artiste, il la déverrouille.

Trois idées structurent l'expérience :

1. **Le signal.** Le son est visible partout. Une onde, un champ de particules ou une matière lumineuse réagit en direct à la musique jouée dans le lecteur. Quand rien ne joue, la scène respire lentement, comme une fréquence en veille.
2. **Le déchiffrement.** Les titres apparaissent comme s'ils étaient décodés : caractères qui défilent avant de se stabiliser. Les sections se révèlent au défilement, couche par couche.
3. **L'archive.** Les distinctions, les dates, les événements passés sont traités comme des pièces d'un dossier : numérotées, horodatées, avec la photo du trophée de 2016 en pièce n°1.

**Validation du concept** : une maquette one-page immersive (template « Site Immersif ») est produite pour faire valider concept, palette et ton par le client avant tout développement Laravel. C'est le livrable du point 5 de la Phase 0.

### 6.2 Palette et typographie

| Rôle | Couleur | Usage |
|---|---|---|
| Fond | Bleu nuit profond, presque noir | 90 % de la surface |
| Matière | Bleu électrique | Onde sonore, liens, éléments actifs |
| Signal rare | Or | Ce qui est précieux : sortie de l'album, distinction, bouton d'achat |
| Alerte | Rouge | Exclusivement le direct, le compte à rebours, « dernières places » |

Cette répartition règle la contradiction du questionnaire : la dominante est froide, l'or et le rouge restent présents mais rares, ce qui leur donne du poids.

Typographie : une police de titre à fort caractère, condensée ou à chasse fixe pour l'effet « code », et une police de texte très lisible sur petit écran. La touche Times New Roman du client peut survivre dans les citations et les extraits de textes, en clin d'œil à son activité d'écrivain.

### 6.3 Moments signature

**Le compte à rebours de l'album.** Avant la sortie, l'accueil est une seule scène : la pochette floutée ou fragmentée, le compte à rebours, un extrait de quelques secondes, l'inscription à la newsletter. À l'heure exacte, le Dashboard publie, la scène bascule.

**Le déverrouillage titre par titre.** Le champ `unlock_at` permet de révéler les titres un par un les jours précédant la sortie, chacun avec son extrait. Le concept de l'énigme et la contrainte d'embargo du client deviennent la même chose.

**La salle d'écoute.** La page d'une sortie plonge l'écran dans l'ambiance de la pochette. Les paroles défilent en synchronisation avec l'extrait, si le client les fournit.

**L'écrivain.** Une section dédiée aux textes : extraits de manuscrits, ratures, mots qui s'écrivent à l'écran. C'est ce qui distingue DX-5 des autres rappeurs : il est aussi auteur.

**La carte du public.** Les 14 pays de son audience affichés comme des points de signal sur une carte sombre. Simple, et fort pour les programmateurs.

**Le passage en coulisses.** L'espace professionnel s'ouvre comme un accès restreint : un code, une porte qui s'ouvre, puis le dossier de presse.

### 6.4 Pilotage depuis le Dashboard

Le client doit pouvoir faire vivre l'expérience sans développeur. L'entité `scenes` lui permet, pour chaque page clé, de choisir :

- l'image ou la boucle vidéo de fond ;
- la nappe sonore d'ambiance ;
- l'accroche ;
- une palette parmi des variantes prédéfinies ;
- l'intensité des effets (faible, moyenne, forte).

Les effets eux-mêmes restent codés. Le client règle, il ne casse pas.

### 6.5 Garde-fous de performance

Une expérience immersive qui met dix secondes à charger sur un téléphone à Port-de-Paix est un échec, quelle que soit sa beauté. Règles non négociables :

- **Contenu d'abord.** Le texte, les liens et le bouton d'écoute s'affichent avant toute scène 3D. Les effets se chargent ensuite.
- **Mode léger automatique** quand le navigateur signale l'économie de données, une connexion lente ou un appareil peu puissant : la scène 3D est remplacée par une image animée en CSS.
- **Respect de la préférence « réduire les animations »** du système : transitions simplifiées, pas de mouvement continu.
- **Son jamais automatique.** Le visiteur l'active. C'est aussi une exigence des navigateurs mobiles.
- **Budget de poids** fixé pour la première page sur mobile, mesuré à chaque déploiement.
- **Accessibilité** : navigation complète au clavier, textes alternatifs, contrastes suffisants malgré le fond sombre.

### 6.6 Sur l'objectif « meilleur site d'artiste »

C'est une ambition, pas un critère de recette. Pour qu'elle soit vérifiable, voici les critères proposés :

- une idée artistique propre à DX-5, que l'on ne pourrait pas transposer à un autre artiste ;
- un rendu fluide sur un téléphone d'entrée de gamme ;
- un score de performance mobile élevé, mesuré sur les pages principales ;
- un client capable de publier seul une sortie, une date et un article après la formation ;
- une soumission possible aux galeries de référence du design web, si le résultat le justifie.

Le niveau visuel final dépend du budget, du temps et de la qualité des contenus fournis par le client. Des photos amateur ou des visuels en basse définition plafonnent le résultat, quel que soit le code.

---

## 7. Arborescence

```
/                     Accueil : scène principale, album, prochaine date, newsletter
/musique              Discographie
/musique/{slug}       Salle d'écoute d'une sortie
/videos               Clips
/agenda               Dates à venir, puis dates passées
/agenda/{slug}
/ecrits               Textes et écriture
/a-propos             Le dossier : parcours, distinctions, carte du public
/pro                  Accès restreint : presse, fiche technique, booking
/boutique             Phase 2
/actualites           Masquée tant qu'il y a moins de trois articles
/soutenir             Si le module est activé
/contact
/mentions-legales, /confidentialite
/hbx/hooks            Point d'entrée technique des webhooks, exclu du référencement
```

Domaines : `dx5thenigma.com` en production (**libre au 13/10/2026, à réserver**), sous-domaine `hbexium.com` en recette. Le back-office reste sur `dashboard.hbexium.com`, jamais exposé sur le domaine de l'artiste.

Bouton WhatsApp : numéro bulgare fourni, à faire confirmer comme numéro public.

---

## 8. Phasage

### Phase 0 : préalables (cette semaine)

1. **Devis de Phase 1 signé** — le budget client n'étant pas communiqué, c'est le devis par phase qui calibre l'ambition, et la signature qui engage. Faire signer en même temps le **bloc de validation du questionnaire** (droits sur les contenus)
2. Domaine ~~vérifié~~ **fait (libre au 13/10)** → réservé via Openprovider
3. Adresse e-mail confirmée
4. Plan d'hébergement Hestia créé, PHP configuré, racine web vers `public/`
5. Validation du concept « L'Énigme » et de la palette par le client — **support : la maquette one-page en production**
6. Réception du logo, des photos, de la biographie et des informations sur l'album — **y compris l'audio : la ligne « Morceaux » du questionnaire est vide, rien n'est encore collecté**

Tant que les points 1 à 3 ne sont pas réglés, ne pas démarrer le développement facturable. La maquette de validation (point 5), elle, se produit dès maintenant : elle sert le devis.

### Phase 1 : teaser immersif (objectif fin octobre)

Côté Dashboard :

1. Profil `artist`, entités `releases`, `tracks`, `events`, `scenes`, `newsletter_subscribers`
2. Webhooks sortants signés, endpoint `sync/changes`, événement de publication programmée
3. Tenant DX-5 créé, clé API générée, URL de webhook déclarée

Côté site :

4. Connexion complète : client API, réception des webhooks, synchronisation, réconciliation, file sortante
5. Test de bout en bout de la connexion **avec Cloudflare activé**
6. Une page unique : scène du compte à rebours, extrait audio réactif, newsletter, liens vers les plateformes
7. Mentions légales et confidentialité

La connexion se construit en premier, même pour une seule page. La rattraper après coup sur un site déjà en ligne coûte beaucoup plus cher.

### Phase 2 : le site complet (novembre et décembre, à confirmer selon budget)

8. Toutes les pages de la section 7
9. Salle d'écoute, déverrouillage titre par titre, section Écrits
10. Mode léger, accessibilité, mesure de performance
11. Formation du client

### Phase 3 : monétisation et espace pro

12. Vente numérique, liens signés
13. Paiement Stripe, puis MonCash et NatCash
14. Espace professionnel
15. Booking structuré

### Phase 4 : à décider

16. Billetterie intégrée
17. Produits physiques, avec un circuit d'expédition identifié
18. Langues supplémentaires

---

## 9. Décisions attendues

| Qui | Décision |
|---|---|
| Client | **Signature du devis de Phase 1** (le budget non communiqué se règle par le devis par phase) |
| Client | **Signature du bloc de validation du questionnaire** (droits sur les contenus) |
| Client | Domaine définitif (les deux choix sont libres) |
| Client | Adresse e-mail publique |
| Client | Identité et rôle du responsable de marketing |
| Client | Langues |
| Client | Validation du concept « L'Énigme » et de la palette — sur la maquette |
| Client | Classement de ses trois objectifs |
| Client | Produits, prix, expédition |
| Client | Droits sur chaque photo et vidéo |
| Client | Compte de réception des paiements |
| Bendy / HBEXIUM | Profil `artist` générique et commercialisable |
| Bendy / HBEXIUM | Ajout des webhooks sortants et de `sync/changes` au Dashboard |
| Bendy / HBEXIUM | Qui encaisse les paiements : Dashboard (recommandé) ou site |
| Bendy / HBEXIUM | Contenu et prix du plan d'hébergement Hestia pour un site d'artiste, quota disque compris |
| Bendy / HBEXIUM | État du champ `locale` dans le Dashboard |

---

## 10. Points à vérifier

- ~~Disponibilité de `dx5thenigma.com` et `dxfivedanigma.com`~~ **Fait le 13/10/2026 : les deux sont libres (whois). Réserver via Openprovider.**
- Existence de webhooks sortants dans le Dashboard, et format de signature
- Endpoints exacts de `products`, `payments`, `blog`, `newsletter` dans le contrat d'intégration
- ~~Option de racine web personnalisée dans la version de HestiaCP installée~~ **Confirmé (doc + forum HestiaCP) : champ « Custom document root » dans les options avancées du domaine web — pointer vers `public/`. Reste à vérifier la présence de l'option sur la version effectivement installée.**
- Moteur de base de données disponible sur le plan Hestia (MariaDB ou PostgreSQL)
- Disponibilité de Redis sur la VM Hestia
- IP publiques statiques des deux VM et régions Azure respectives
- Règles Cloudflare de protection anti-robots sur les deux domaines
- ~~Licences des bibliothèques d'animation retenues~~ **Fait : GSAP est 100 % gratuit depuis avril 2025 (rachat Webflow), plugins Club inclus, usage commercial couvert. Lenis, Three.js, Swup : MIT. Aucun coût de licence.**
- ~~Conditions Stripe pour un vendeur résidant en Bulgarie~~ **Fait : la Bulgarie est un pays pleinement supporté par Stripe. Prérequis : compte bancaire local et vérification d'identité (KYC). Le client ouvre le compte à son nom en Phase 3.**
- ~~Conditions marchandes Kobara pour MonCash et NatCash~~ **Partiellement fait : la passerelle existe et est opérationnelle (kobara.app — API `https://api.kobara.app/v1`, webhooks, SDK ; couvre MonCash, NatCash, cartes, PayPal, Apple/Google Pay). Restent à obtenir : frais, délais de reversement et conditions d'ouverture du compte marchand.**
- Régime des contributions de soutien versées à un artiste personne physique
- Date exacte de sortie de l'album

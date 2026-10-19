# Site teaser DX-5 The Nigma — déploiement

Site vitrine de Phase 1 (le « teaser »). Tout le contenu — compte à rebours de l'album,
single VETERAN, liens plateformes, inscriptions — vient du **Dashboard HBEXIUM** via l'API v1.
La clé API reste **côté serveur** ; le visiteur ne la voit jamais.

## Aperçu local

```
cd dx5-site
php -S localhost:8799      # puis ouvrir http://localhost:8799/
```

La clé API se lit dans `lib/config.local.php` (déjà renseignée, **non versionnée**) ou dans la
variable d'environnement `HBX_API_KEY` (prioritaire).

## Mise en ligne sur HestiaCP (dx5thenigma.com)

Le DNS pointe déjà `dx5thenigma.com` vers le serveur (40.75.19.27) et le SSL est actif.
Il reste à **déposer ces fichiers** dans le dossier web du domaine :

1. **Version PHP** : dans Hestia, régler le domaine `dx5thenigma.com` sur **PHP 8.1+**.
2. **Dépôt des fichiers** : via le Gestionnaire de fichiers HestiaCP (ou FTP/SFTP), copier le
   contenu de `dx5-site/` dans le dossier racine web du domaine (`web/dx5thenigma.com/public_html/`).
   L'`index.php` doit se trouver à la racine servie.
3. **Clé API** : créer `lib/config.local.php` sur le serveur avec la clé (NE PAS la mettre dans
   un fichier public ni dans du JavaScript). Modèle :
   ```php
   <?php
   return [
     'api_base' => 'https://dashboard.hbexium.com/api',
     'api_key'  => 'hbx_…',   // clé du tenant DX-5 (Dashboard → fiche client → API headless)
   ];
   ```
   Encore mieux : définir `HBX_API_KEY` en variable d'environnement du domaine.
4. **Dossier cache** : s'assurer que `cache/` est **inscriptible** par PHP (chmod 775). Il stocke
   les réponses API quelques minutes — le site reste rapide et ne sollicite pas le Dashboard à
   chaque visite (et reste debout si le Dashboard est momentanément injoignable).
5. **Vérifier** : ouvrir `https://dx5thenigma.com/` — le compte à rebours, VETERAN et les liens
   doivent s'afficher. Tester l'inscription newsletter (double opt-in : e-mail de confirmation).

> Le 403 actuel disparaît dès que `index.php` est en place (il venait d'un dossier web vide).

## Piloter le contenu (sans toucher au site)

**Tout** le site est piloté par le **Dashboard** (espace client DX-5). Une modification y est
reflétée sur le site **en ≤ 2 minutes** (cache court) — et **instantanément** si le webhook est
déclaré (voir plus bas). Ce que le Dashboard pilote :

- **Accroche du hero** : module Scènes → scène « home » → champ « Accroche ». (Repli : réglage
  `hero_title`, sinon texte par défaut.)
- **Compte à rebours** : Discographie → l'album → statut « Programmée » + **date de publication**
  (placeholder **30 nov. 2026 20:00** — à ajuster) + cocher **« Annoncer sur le site »**. Le titre
  reste secret tant qu'il contient « à annoncer » (concept « énigme ») ; mettez un vrai titre pour
  le révéler.
- **Single / clip** : Discographie → sortie publiée (VETERAN) + son lien YouTube.
- **Agenda** : module Agenda → les événements (à venir + passés) s'affichent dans « Sur scène ».
- **Liens plateformes** : module Discographie → liens de profil (ou réglage `socials`).
- **Nom, e-mail de contact** : Réglages → identité (`organization_name`, `contact_email`).
- **Abonnés** : module Newsletter (double opt-in actif).

## Propagation instantanée (webhook — optionnel mais recommandé)

Sans webhook, les changements apparaissent en ≤ 2 min (cache). Pour l'**instantané**, déclarez
l'endpoint du site dans le Dashboard :

1. Dashboard → fiche client DX-5 → **Webhooks sortants** → URL `https://dx5thenigma.com/hbx/hooks.php`,
   événements : laisser vide (tous) ou `release.*, track.*, event.*, scene.*, settings.updated`.
2. **Copier le secret** affiché (une seule fois) dans `lib/config.local.php` → `'webhook_secret'`.
3. À chaque changement, le Dashboard signale le site, qui **purge son cache** → le visiteur suivant
   voit la version à jour immédiatement. `hbx/hooks.php` vérifie la signature HMAC (rien d'autre
   n'est accepté).

## Architecture (rappel)

```
index.php            page teaser — rend les données API côté serveur
lib/config.php       config (lit config.local.php / env)
lib/config.local.php clé API — NON versionné (.gitignore)
lib/hbx.php          client API : cache fichier + repli si API injoignable
api/newsletter.php   proxy POST /v1/newsletter (double opt-in)
hbx/hooks.php        récepteur de webhook (signature HMAC → purge du cache)
assets/styles.css    style « L'Énigme » (sombre, mobile-first, reduced-motion)
assets/app.js        compte à rebours + inscription sans rechargement
cache/               réponses API en cache (inscriptible)
```

Le site ne fait jamais faire d'appel API au navigateur du visiteur : les pages sont servies
localement, le Dashboard n'est sollicité qu'en arrière-plan (plan projet §4.1). Si le Dashboard
tombe, le site reste en ligne sur son dernier cache (§4.8).

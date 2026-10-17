# Prototype « Bibliothèque de l'artiste » — DX-5 The Nigma

Prototype HBEXIUM de la future **salle d'écoute** (Phase 2 du plan projet) :
lecteur audio persistant avec scène réactive au son (« le signal »),
discographie avec extraits, album sous embargo (déverrouillage titre par
titre), vidéothèque chargée au clic.

## Provenance des contenus

| Contenu | Provenance | Statut |
|---|---|---|
| Titres de la discographie | **Réels** — catalogue publié sur la chaîne YouTube officielle `@dx-5thenigma` | À faire confirmer par le client |
| Vidéos (8 clips + 4 live/interviews) | **Réelles** — chaîne YouTube officielle de l'artiste, chargées via youtube-nocookie au clic | Vignettes copiées en local (`thumbs/`) |
| Extraits audio (`audio/*.m4a`) | **Réels** — 30 s coupées (fondus) dans les titres publiés par l'artiste sur sa chaîne officielle | Qualité YouTube ; à remplacer par des extraits tirés des masters du client pour la version finale |
| Les 12 titres de l'album | Inconnus — affichés chiffrés, c'est le concept | Alimentés par `tracks.unlock_at` dans le site final |

## Règles de la DA respectées (section 6.5 du plan)

- Son **jamais** automatique : tout démarre au clic.
- `prefers-reduced-motion` : scène fixe, pas de défilement de glyphes.
- Vidéos YouTube : **façades locales**, l'iframe ne se charge qu'au clic
  (aucune donnée ne part vers YouTube avant), domaine youtube-nocookie.
- Poids : ~1,3 Mo d'audio + vignettes locales, pas de bibliothèque externe,
  zéro dépendance réseau au chargement.

## Dans le site final

Cette page devient `/musique` + `/videos`, alimentée par le Dashboard :
`tracks.preview_media_id` (extraits), `unlock_at` (déverrouillage),
`streaming_links` (liens plateformes), médiathèque pour les vignettes.

Lancement local : `node .claude/serve-bibliotheque.mjs` → http://localhost:4386/

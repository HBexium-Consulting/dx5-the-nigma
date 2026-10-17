# Devis — Site officiel DX-5 The Nigma

> **TRAME INTERNE — montants à calibrer par Bendy avant envoi.**
> Le bloc « Notes de calibrage » en fin de document est à supprimer de la version client.

**Prestataire** : HBEXIUM Consulting
**Client** : DEBROSSE Félix — « DX-5 The Nigma »
**Date** : octobre 2026 — **Validité** : 30 jours
**Objet** : conception, production et hébergement du site officiel, piloté par le Dashboard HBEXIUM

---

## Ce que le client achète

Un site d'artiste immersif (concept « L'Énigme », maquette validée le ___ ), que le client pilote **seul** depuis son tableau de bord après formation : sorties, dates, articles, visuels et réglages de l'expérience — sans toucher au code. Le site reste en ligne même si le tableau de bord est indisponible.

Le projet se livre **par phases**. Chaque phase est facturée et validée séparément ; le client décide à chaque étape s'il continue.

---

## Phase 1 — Teaser de lancement de l'album *(objectif : avant la sortie)*

**Livrables**
- Une page immersive : compte à rebours de l'album, extrait audio réactif, inscription newsletter (double confirmation), liens vers les plateformes
- Nom de domaine réservé, e-mail `contact@dx5thenigma.com` créé
- Hébergement installé et sécurisé (HTTPS, sauvegardes)
- Connexion complète au tableau de bord : publication de l'album à l'heure exacte, réglages de la scène pilotables par le client
- Mentions légales et politique de confidentialité

**Prérequis client** : devis signé, bloc de droits signé, date de sortie + pochette + 1 extrait de 30 s, logo, choix du domaine et de l'e-mail.

**Délai indicatif** : ___ semaines après réception des prérequis.
**Montant : ______ USD** — 50 % à la signature, 50 % à la mise en ligne.

## Phase 2 — Le site complet

**Livrables**
- Toutes les pages : accueil, musique (salle d'écoute par sortie, déverrouillage titre par titre), vidéos, agenda, écrits, à-propos (parcours, distinctions, carte du public des 14 pays), espace pro, contact
- Mode léger automatique pour les connexions lentes (public mobile en Haïti), accessibilité, mesure de performance
- **Formation du client** (gestion complète en autonomie) + guide écrit
- Français + anglais *(créole en option, textes fournis par le client)*

**Montant : ______ USD** — 50 % / 50 %.

## Phase 3 — Vente et espace professionnel

**Livrables**
- Vente numérique de l'album et des titres (liens de téléchargement sécurisés)
- Paiement par carte (Stripe) puis MonCash / NatCash (passerelle Kobara) — *sous réserve de l'ouverture des comptes marchands au nom du client*
- Bouton « Soutenir l'artiste »
- Espace professionnel à accès réservé : dossier de presse, fiche technique, demande de booking structurée

**Montant : ______ USD** — 50 % / 50 %.

## Abonnement — hébergement, sécurité et liaison

Obligatoire tant que le site est en ligne (le client gère ses **contenus** seul après formation ; le serveur, lui, doit être maintenu par nos soins) :

- Hébergement du site, quota disque de ___ Go, certificat HTTPS
- Sauvegardes quotidiennes, mises à jour de sécurité
- Surveillance de la liaison site ↔ tableau de bord
- Accès au Dashboard HBEXIUM (tenant dédié)

**Montant : ______ USD / mois** (ou ______ USD / an, 2 mois offerts).

## Hors périmètre (devis séparés sur demande)

Billetterie intégrée · vente de produits physiques et expédition · langues supplémentaires · tournage ou création de contenus (photos, vidéos, textes) · campagnes de publicité.

## Conditions

- Les contenus (musique, photos, textes) sont fournis par le client, qui en garantit les droits (bloc de validation du questionnaire à signer).
- Les visuels provisoires de la maquette sont remplacés par les photos du client avant toute mise en ligne.
- Deux tours de révisions inclus par phase ; au-delà, en régie à ___ USD / h.
- Les retards de fourniture des contenus décalent d'autant les délais de livraison.
- Le profil « Artiste » du Dashboard HBEXIUM reste la propriété de HBEXIUM Consulting ; le client est propriétaire de son nom de domaine, de ses contenus et de ses données.

**Bon pour accord** — Nom : ____________ Date : ________ Signature : ____________

---

## ⚠️ Notes de calibrage (interne — à supprimer avant envoi)

| Poste | Points d'attention pour chiffrer |
|---|---|
| Phase 1 | Inclut du développement Dashboard réutilisable (profil `artist`, webhooks, `sync/changes`) : décider quelle part est portée par ce devis et quelle part est un investissement produit HBEXIUM amorti sur les futurs clients artistes. C'est LA décision qui fait varier le prix du simple au triple. |
| Phase 1 | Le délai « fin octobre » du client n'est tenable que si les prérequis arrivent sous quelques jours — verrouiller la formule « ___ semaines après réception des prérequis », jamais une date fixe. |
| Phase 2 | L'expérience immersive complète (scènes réactives au son) est le poste le plus lourd ; prévoir une option « expérience augmentée » séparée si le budget du client est court. |
| Phase 3 | Ne facturer l'intégration Kobara/Stripe qu'une fois les comptes marchands du client ouverts (résident bulgare : Stripe Bulgarie OK, compte bancaire local + KYC requis). |
| Abonnement | Couvre le coût réel : part de la VM Hestia + quota disque + temps de surveillance mensuel. Le client a refusé un « contrat de maintenance » : le mot à employer est **abonnement d'hébergement**, et il conditionne la mise en ligne. |
| Révisions | Le client annonce un logo « modifiable à tout moment » et veut « le meilleur site d'artiste » : borner strictement les tours de révision. |

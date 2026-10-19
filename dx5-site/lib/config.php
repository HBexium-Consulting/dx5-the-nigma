<?php

declare(strict_types=1);

/*
 * ─────────────────────────────────────────────────────────────────────────
 * DX-5 THE NIGMA — Configuration du site teaser (Phase 1)
 * ─────────────────────────────────────────────────────────────────────────
 * Le site lit son contenu dans le Dashboard HBEXIUM via l'API v1. La clé API
 * reste CÔTÉ SERVEUR (jamais exposée au navigateur) : ne la mettez jamais dans
 * un fichier JavaScript. Idéalement, placez ce fichier HORS du dossier web
 * (public_html) et ajustez le require dans index.php.
 *
 * Renseignez HBX_API_KEY avec la clé `hbx_…` générée dans le Dashboard
 * (fiche client DX-5 → API headless). Vous pouvez aussi la fournir par
 * variable d'environnement HBX_API_KEY (prioritaire).
 */

// Secrets locaux NON versionnés (clé API) : config.local.php est ignoré par
// git. Priorité : variable d'environnement > config.local.php > placeholder.
$local = is_file(__DIR__.'/config.local.php') ? (require __DIR__.'/config.local.php') : [];

return [
    // Base de l'API du Dashboard (sans slash final).
    'api_base' => getenv('HBX_API_BASE') ?: ($local['api_base'] ?? 'https://dashboard.hbexium.com/api'),

    // Clé API du tenant DX-5 (hbx_…). À RENSEIGNER dans config.local.php ou en
    // variable d'environnement HBX_API_KEY — jamais en dur dans un fichier versionné.
    'api_key' => getenv('HBX_API_KEY') ?: ($local['api_key'] ?? 'hbx_VOTRE_CLE_ICI'),

    // Secret du WEBHOOK (propagation instantanée) : généré dans le Dashboard à la
    // déclaration de l'endpoint (fiche client → Webhooks sortants). hbx/hooks.php
    // vérifie la signature avec. Vide = webhook désactivé (le cache court suffit).
    'webhook_secret' => getenv('HBX_WEBHOOK_SECRET') ?: ($local['webhook_secret'] ?? ''),

    // Durée de cache des réponses API (secondes). Court = toute modification du
    // Dashboard apparaît sur le site en ≤ ce délai, même sans webhook. Le webhook
    // (hbx/hooks.php) rend la propagation INSTANTANÉE en purgeant ce cache.
    'cache_ttl' => 120,

    // Fuseau d'affichage par défaut du compte à rebours (le JS utilise l'heure
    // locale du visiteur ; ceci sert au rendu serveur de secours).
    'timezone' => 'America/Port-au-Prince',

    // Coordonnées affichées (booking / presse).
    'contact_email' => 'contact@dx5thenigma.com',
];

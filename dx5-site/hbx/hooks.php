<?php

declare(strict_types=1);

/*
 * ─────────────────────────────────────────────────────────────────────────
 * Récepteur de WEBHOOK du Dashboard (propagation INSTANTANÉE).
 * Le Dashboard envoie un signal signé à CHAQUE changement (release.*, track.*,
 * event.*, scene.*, settings.updated, commandes site.*). Ici on :
 *   1. vérifie la signature HMAC (en-tête X-HBX-Signature) + l'horodatage ;
 *   2. PURGE le cache local → le prochain visiteur voit la version à jour ;
 *   3. répond 202 en < 1 s, SANS appeler l'API (plan §4.3).
 * Le webhook est un SIGNAL, pas un transport : on ne lit rien ici, on invalide
 * juste le cache. La réconciliation (cache court) rattrape tout signal manqué.
 *
 * Déclarer l'URL de ce fichier dans le Dashboard (fiche client DX-5 →
 * « Webhooks sortants ») et coller le secret dans lib/config.local.php
 * (clé 'webhook_secret').
 * ─────────────────────────────────────────────────────────────────────────
 */

header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__.'/../lib/config.php';
$secret = (string) ($config['webhook_secret'] ?? '');

$raw = (string) file_get_contents('php://input');
$event = (string) ($_SERVER['HTTP_X_HBX_EVENT'] ?? '');
$timestamp = (string) ($_SERVER['HTTP_X_HBX_TIMESTAMP'] ?? '');
$signature = (string) ($_SERVER['HTTP_X_HBX_SIGNATURE'] ?? '');

// Secret non configuré : on refuse (sinon n'importe qui purgerait le cache).
if ($secret === '') {
    http_response_code(503);
    echo json_encode(['ok' => false, 'message' => 'Webhook non configuré (secret manquant).']);
    exit;
}

// Fenêtre de tolérance ±5 min (anti-rejeu, horloges) — plan §4.4.
if ($timestamp === '' || abs(time() - (int) $timestamp) > 300) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'message' => 'Horodatage hors fenêtre.']);
    exit;
}

// Signature : sha256=HMAC-SHA256(timestamp + corps brut, secret), temps constant.
$expected = 'sha256='.hash_hmac('sha256', $timestamp.$raw, $secret);
if ($signature === '' || ! hash_equals($expected, $signature)) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'message' => 'Signature invalide.']);
    exit;
}

// ── Purge du cache (invalidation) ────────────────────────────────────────
// Commande à distance explicite OU simple signal de changement : dans les deux
// cas on vide le cache. (On pourrait purger sélectivement par entité ; ici le
// cache est petit — une purge complète est la plus sûre.)
$purged = 0;
foreach (glob(__DIR__.'/../cache/*.json') ?: [] as $file) {
    if (@unlink($file)) {
        $purged++;
    }
}

// 202 Accepted immédiat : le signal est pris en compte.
http_response_code(202);
echo json_encode(['ok' => true, 'event' => $event, 'purged' => $purged]);

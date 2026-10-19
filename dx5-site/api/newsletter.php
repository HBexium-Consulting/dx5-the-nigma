<?php

declare(strict_types=1);

/*
 * Inscription newsletter — proxy CÔTÉ SERVEUR vers POST /v1/newsletter du
 * Dashboard (double opt-in). Le navigateur ne voit jamais la clé API.
 * Réponse JSON pour le fetch() de la page ; jamais d'exception visible.
 */

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

$config = require __DIR__.'/../lib/config.php';
require __DIR__.'/../lib/hbx.php';

// Accepte un POST de formulaire classique OU un corps JSON (fetch).
$email = trim((string) ($_POST['email'] ?? ''));
if ($email === '') {
    $json = json_decode((string) file_get_contents('php://input'), true);
    $email = trim((string) ($json['email'] ?? ''));
}

if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Adresse e-mail invalide.']);
    exit;
}

try {
    $hbx = new Hbx($config);
    $res = $hbx->post('/v1/newsletter', [
        'email' => $email,
        'source' => 'site-teaser',
        'locale' => 'fr',
    ]);

    $ok = $res['status'] >= 200 && $res['status'] < 300;
    $needsConfirm = (bool) ($res['body']['data']['confirmation_required'] ?? false);

    echo json_encode([
        'ok' => $ok,
        'message' => $ok
            ? ($needsConfirm
                ? 'Presque ! Vérifiez votre boîte mail et confirmez votre inscription.'
                : 'Inscription confirmée. Vous serez prévenu·e du signal.')
            : "L'inscription n'a pas pu être enregistrée. Réessayez dans un instant.",
    ]);
} catch (Throwable $e) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'message' => 'Service momentanément indisponible.']);
}

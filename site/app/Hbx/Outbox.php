<?php

namespace App\Hbx;

use App\Models\HbxOutbox;
use Illuminate\Support\Str;

/**
 * §4.1 règle n°4 : les écritures passent par une file locale. Une demande
 * est d'abord enregistrée sur le site, puis envoyée au Dashboard avec une
 * clé d'idempotence. Si l'envoi échoue, elle est retentée — aucune demande
 * de fan ne se perd, même Dashboard éteint.
 */
class Outbox
{
    public static function push(string $endpoint, array $payload, ?string $key = null): HbxOutbox
    {
        // idempotent : rejouer la même clé ne crée jamais de doublon
        return HbxOutbox::firstOrCreate(
            ['idempotency_key' => $key ?? (string) Str::uuid()],
            ['endpoint' => $endpoint, 'payload' => $payload]
        );
    }
}

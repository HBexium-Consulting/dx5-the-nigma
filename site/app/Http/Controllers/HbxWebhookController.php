<?php

namespace App\Http\Controllers;

use App\Jobs\HbxSyncEntity;
use App\Models\HbxWebhookDelivery;
use Illuminate\Http\Request;

/**
 * Point d'entrée des webhooks du Dashboard (§4.1 règle n°2) :
 * le webhook est un SIGNAL, pas un transport. On vérifie la signature,
 * on enregistre la livraison (idempotence), on met un job en file et on
 * répond 202 en moins d'une seconde — aucun appel API ici (§4.3).
 */
class HbxWebhookController extends Controller
{
    public function __invoke(Request $request)
    {
        $timestamp = $request->header('X-HBX-Timestamp', '');
        $signature = $request->header('X-HBX-Signature', '');
        $delivery = $request->header('X-HBX-Delivery', '');

        if (! $timestamp || ! $delivery || abs(now()->timestamp - (int) $timestamp) > 300) {
            return response()->json(['error' => 'stale_or_missing_timestamp'], 401);
        }

        $expected = 'sha256='.hash_hmac('sha256', $timestamp.$request->getContent(), config('services.hbx.webhook_secret'));
        if (! hash_equals($expected, $signature)) {
            return response()->json(['error' => 'bad_signature'], 401);
        }

        // Rejeu (X-HBX-Delivery déjà vu) → on ré-acquitte sans retraiter (§4.8).
        $fresh = HbxWebhookDelivery::query()->firstOrCreate(
            ['delivery_id' => $delivery],
            ['event' => $request->header('X-HBX-Event', ''), 'payload' => $request->json()->all()]
        )->wasRecentlyCreated;

        if ($fresh) {
            $event = $request->header('X-HBX-Event', '');

            if (str_starts_with($event, 'site.')) {
                HbxSyncEntity::dispatch('command', $event, 'execute');
            } else {
                HbxSyncEntity::dispatch(
                    $request->json('entity', ''),
                    $request->json('uuid', ''),
                    $request->json('action', 'updated'),
                );
            }
        }

        return response()->json(['accepted' => true], 202);
    }
}

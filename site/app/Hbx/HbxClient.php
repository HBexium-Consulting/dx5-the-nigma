<?php

namespace App\Hbx;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

/**
 * Client de l'API Dashboard (§4.3). Toujours /api/v1, jamais une route
 * non versionnée. Le visiteur ne déclenche JAMAIS ces appels : ils ne
 * partent que des jobs de synchronisation et de la file sortante.
 */
class HbxClient
{
    protected function http(): PendingRequest
    {
        return Http::baseUrl(rtrim(config('services.hbx.base'), '/'))
            ->withToken(config('services.hbx.key'))
            ->acceptJson()
            ->timeout(15)
            ->retry(2, 500, throw: false);
    }

    public function get(string $path, array $query = []): Response
    {
        return $this->http()->get($path, $query);
    }

    public function post(string $path, array $payload, ?string $idempotencyKey = null): Response
    {
        $req = $this->http();
        if ($idempotencyKey) {
            $req = $req->withHeaders(['Idempotency-Key' => $idempotencyKey]);
        }

        return $req->post($path, $payload);
    }
}

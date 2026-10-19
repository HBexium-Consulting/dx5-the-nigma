<?php

namespace Tests\Feature;

use App\Jobs\HbxSyncEntity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class HbxWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.hbx.webhook_secret' => 'test-secret']);
    }

    protected function sign(array $payload, string $delivery, ?int $ts = null): array
    {
        $ts ??= now()->timestamp;
        $body = json_encode($payload);

        return [$body, [
            'X-HBX-Event' => 'release.updated',
            'X-HBX-Delivery' => $delivery,
            'X-HBX-Timestamp' => (string) $ts,
            'X-HBX-Signature' => 'sha256='.hash_hmac('sha256', $ts.$body, 'test-secret'),
            'Content-Type' => 'application/json',
        ]];
    }

    public function test_webhook_valide_met_un_job_en_file_et_repond_202(): void
    {
        Queue::fake();
        [$body, $headers] = $this->sign(['entity' => 'release', 'uuid' => 'abc', 'action' => 'updated'], 'd-1');

        $this->call('POST', '/hbx/hooks', [], [], [], $this->transformHeadersToServerVars($headers), $body)
            ->assertStatus(202);

        Queue::assertPushed(HbxSyncEntity::class, 1);
    }

    public function test_signature_invalide_refusee(): void
    {
        Queue::fake();
        [$body, $headers] = $this->sign(['entity' => 'release', 'uuid' => 'abc', 'action' => 'updated'], 'd-2');
        $headers['X-HBX-Signature'] = 'sha256=mauvaise';

        $this->call('POST', '/hbx/hooks', [], [], [], $this->transformHeadersToServerVars($headers), $body)
            ->assertStatus(401);

        Queue::assertNothingPushed();
    }

    public function test_horodatage_perime_refuse(): void
    {
        Queue::fake();
        [$body, $headers] = $this->sign(['entity' => 'release', 'uuid' => 'abc', 'action' => 'updated'], 'd-3', now()->subMinutes(10)->timestamp);

        $this->call('POST', '/hbx/hooks', [], [], [], $this->transformHeadersToServerVars($headers), $body)
            ->assertStatus(401);
    }

    public function test_rejeu_ignore_grace_a_l_identifiant_de_livraison(): void
    {
        Queue::fake();
        [$body, $headers] = $this->sign(['entity' => 'release', 'uuid' => 'abc', 'action' => 'updated'], 'd-4');

        $this->call('POST', '/hbx/hooks', [], [], [], $this->transformHeadersToServerVars($headers), $body)->assertStatus(202);
        $this->call('POST', '/hbx/hooks', [], [], [], $this->transformHeadersToServerVars($headers), $body)->assertStatus(202);

        Queue::assertPushed(HbxSyncEntity::class, 1); // une seule fois malgré le rejeu (§4.8)
    }
}

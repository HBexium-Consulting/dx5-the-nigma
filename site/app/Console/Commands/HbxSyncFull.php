<?php

namespace App\Console\Commands;

use App\Hbx\HbxClient;
use App\Jobs\HbxSyncEntity;
use Illuminate\Console\Command;

class HbxSyncFull extends Command
{
    protected $signature = 'hbx:sync-full';

    protected $description = 'Resynchronisation complète depuis le Dashboard';

    public function handle(HbxClient $client): int
    {
        foreach (['releases' => 'release', 'events' => 'event', 'scenes' => 'scene'] as $index => $entity) {
            $page = 1;
            do {
                $response = $client->get($index, ['page' => $page, 'per_page' => 50]);
                if ($response->status() === 404) { // module inactif → section masquée, aucune erreur (§4.8)
                    break;
                }
                $response->throw();
                foreach ($response->json('data', []) as $row) {
                    HbxSyncEntity::dispatch($entity, $row['uuid'], 'updated');
                }
                $page++;
            } while ($response->json('links.next') ?? $response->json('next_page_url'));
        }

        $this->info('Resynchronisation programmée.');

        return self::SUCCESS;
    }
}

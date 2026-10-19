<?php

namespace App\Console\Commands;

use App\Hbx\HbxClient;
use App\Jobs\HbxSyncEntity;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * §4.1 règle n°3 : toutes les 15 minutes, le site demande ce qui a changé.
 * Même sans aucun webhook, le site finit cohérent. On stocke server_time
 * comme prochain `since`, jamais notre propre horloge (§4.2).
 */
class HbxReconcile extends Command
{
    protected $signature = 'hbx:reconcile';

    protected $description = 'Rattrape les changements du Dashboard (sync/changes)';

    public function handle(HbxClient $client): int
    {
        $since = DB::table('hbx_sync_state')->where('key', 'since')->value('value');
        $cursor = null;

        do {
            $response = $client->get('sync/changes', array_filter(['since' => $since, 'cursor' => $cursor]));

            if ($response->status() === 410) { // journal purgé → resynchronisation complète
                $this->call('hbx:sync-full');

                return self::SUCCESS;
            }

            $response->throw();

            foreach ($response->json('data', []) as $change) {
                HbxSyncEntity::dispatch($change['entity'], $change['uuid'], $change['action']);
            }

            $cursor = $response->json('next_cursor');
        } while ($cursor);

        DB::table('hbx_sync_state')->updateOrInsert(
            ['key' => 'since'],
            ['value' => $response->json('server_time'), 'updated_at' => now(), 'created_at' => now()]
        );

        $this->info('Réconciliation terminée.');

        return self::SUCCESS;
    }
}

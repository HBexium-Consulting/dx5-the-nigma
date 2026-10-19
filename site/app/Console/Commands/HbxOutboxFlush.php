<?php

namespace App\Console\Commands;

use App\Hbx\HbxClient;
use App\Models\HbxOutbox;
use Illuminate\Console\Command;

class HbxOutboxFlush extends Command
{
    protected $signature = 'hbx:outbox-flush';

    protected $description = 'Envoie au Dashboard les écritures locales en attente';

    public function handle(HbxClient $client): int
    {
        $pending = HbxOutbox::whereNull('sent_at')->where('attempts', '<', 8)->orderBy('id')->limit(50)->get();

        foreach ($pending as $row) {
            $response = $client->post($row->endpoint, $row->payload, $row->idempotency_key);

            if ($response->successful()) {
                $row->update(['sent_at' => now(), 'last_error' => null]);
            } else {
                $row->update([
                    'attempts' => $row->attempts + 1,
                    'last_error' => $response->status().' '.mb_substr($response->body(), 0, 500),
                ]);
            }
        }

        $this->info("Flush : {$pending->count()} entrée(s) traitée(s).");

        return self::SUCCESS;
    }
}

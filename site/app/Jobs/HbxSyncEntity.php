<?php

namespace App\Jobs;

use App\Hbx\SyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class HbxSyncEntity implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function backoff(): array
    {
        return [10, 60, 300, 900];
    }

    public function __construct(
        public string $entity,
        public string $uuid,
        public string $action,
    ) {}

    public function handle(SyncService $sync): void
    {
        if ($this->entity === 'command') {
            $sync->command($this->uuid);
        } elseif ($this->action === 'deleted') {
            $sync->delete($this->entity, $this->uuid);
        } else {
            $sync->pull($this->entity, $this->uuid);
        }
    }
}

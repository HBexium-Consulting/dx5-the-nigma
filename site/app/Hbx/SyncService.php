<?php

namespace App\Hbx;

use App\Models\Event;
use App\Models\Release;
use App\Models\Scene;
use App\Models\StreamingLink;
use App\Models\Track;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

/**
 * Lit une entité à jour via l'API et l'écrit en base locale (§4.3).
 * La correspondance se fait TOUJOURS sur l'uuid, jamais sur l'id.
 */
class SyncService
{
    public function __construct(protected HbxClient $client) {}

    public function pull(string $entity, string $uuid): void
    {
        $path = match ($entity) {
            'release' => "releases/{$uuid}",
            'event' => "events/{$uuid}",
            'scene' => "scenes/{$uuid}",
            default => null,
        };

        if ($path === null) {
            return;
        }

        $response = $this->client->get($path);

        // 404 : contenu supprimé ou module inactif → suppression douce, aucune erreur (§4.8).
        if ($response->status() === 404) {
            $this->delete($entity, $uuid);

            return;
        }

        $response->throw();
        $data = $response->json('data') ?? $response->json();

        match ($entity) {
            'release' => $this->upsertRelease($data),
            'event' => $this->upsertEvent($data),
            'scene' => $this->upsertScene($data),
        };
    }

    public function delete(string $entity, string $uuid): void
    {
        match ($entity) {
            'release' => Release::where('uuid', $uuid)->get()->each->delete(),
            'event' => Event::where('uuid', $uuid)->get()->each->delete(),
            'scene' => Scene::where('uuid', $uuid)->delete(),
            default => null,
        };
    }

    public function command(string $event): void
    {
        match ($event) {
            'site.cache.purge' => Cache::flush(),
            'site.maintenance.on' => Artisan::call('down', ['--retry' => 120]),
            'site.maintenance.off' => Artisan::call('up'),
            'site.sync.full' => Artisan::call('hbx:sync-full'),
            default => null,
        };
    }

    protected function upsertRelease(array $d): void
    {
        $release = Release::withTrashed()->updateOrCreate(
            ['uuid' => $d['uuid']],
            [
                ...Arr::only($d, ['slug', 'type', 'title', 'subtitle', 'description', 'status', 'credits', 'product_uuid']),
                'cover_path' => $d['cover_url'] ?? $d['cover_path'] ?? null,
                'release_date' => $d['release_date'] ?? null,
                'published_at' => $d['published_at'] ?? null,
                'deleted_at' => null,
            ]
        );

        foreach ($d['tracks'] ?? [] as $t) {
            Track::withTrashed()->updateOrCreate(
                ['uuid' => $t['uuid']],
                [
                    ...Arr::only($t, ['position', 'title', 'slug', 'duration_seconds', 'isrc', 'explicit', 'featuring', 'lyrics', 'youtube_id']),
                    'release_id' => $release->id,
                    'preview_path' => $t['preview_url'] ?? $t['preview_path'] ?? null,
                    'unlock_at' => $t['unlock_at'] ?? null,
                    'deleted_at' => null,
                ]
            );
        }

        $this->syncLinks($release, $d['streaming_links'] ?? []);
    }

    protected function upsertEvent(array $d): void
    {
        Event::withTrashed()->updateOrCreate(
            ['uuid' => $d['uuid']],
            [
                ...Arr::only($d, ['slug', 'title', 'description', 'timezone', 'venue_name', 'city', 'country', 'status', 'ticket_mode', 'ticket_url']),
                'starts_at' => $d['starts_at'],
                'ends_at' => $d['ends_at'] ?? null,
                'cover_path' => $d['cover_url'] ?? null,
                'published_at' => $d['published_at'] ?? null,
                'deleted_at' => null,
            ]
        );
    }

    protected function upsertScene(array $d): void
    {
        Scene::updateOrCreate(
            ['uuid' => $d['uuid']],
            Arr::only($d, ['key', 'palette', 'intensity', 'headline', 'settings'])
            + ['hero_path' => $d['hero_url'] ?? null, 'ambient_path' => $d['ambient_url'] ?? null]
        );
    }

    protected function syncLinks(Release $release, array $links): void
    {
        $kept = [];
        foreach ($links as $l) {
            $kept[] = StreamingLink::updateOrCreate(
                ['uuid' => $l['uuid']],
                [
                    'linkable_type' => Release::class,
                    'linkable_id' => $release->id,
                    'platform' => $l['platform'],
                    'url' => $l['url'],
                    'position' => $l['position'] ?? 1,
                    'visible' => $l['visible'] ?? true,
                ]
            )->id;
        }
        $release->streamingLinks()->whereNotIn('id', $kept)->delete();
    }
}

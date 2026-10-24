<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Release;
use App\Models\Scene;
use App\Models\Track;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Contenu initial = le contenu réel validé du prototype. En production,
 * tout ceci sera remplacé/alimenté par la synchronisation Dashboard —
 * les uuid seed sont donc des uuid "locaux" en attendant le tenant.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $lib = json_decode(file_get_contents(database_path('seeders/data/library.json')), true);
        $home = json_decode(file_get_contents(database_path('seeders/data/home-content.json')), true);

        // ── scène « home » : tout le contenu de l'accueil immersif ──
        Scene::updateOrCreate(['key' => 'home'], [
            'uuid' => (string) Str::uuid(),
            'intensity' => 'high',
            'headline' => $home['hook']['line1'] ?? null,
            'settings' => $home,
        ]);

        // ── scène « library » : vidéothèque + annonce publique de l'album (§4.6) ──
        Scene::updateOrCreate(['key' => 'library'], [
            'uuid' => (string) Str::uuid(),
            'intensity' => 'medium',
            'settings' => [
                'clips' => $lib['clips'],
                'live' => $lib['live'],
                'album_announce' => [
                    'title' => 'L’album — 12 titres',
                    'label' => 'DÉVERROUILLAGE TITRE PAR TITRE — NOVEMBRE 2026',
                    'count' => 12,
                ],
            ],
        ]);

        // ── catalogue publié : les 8 titres réels ──
        $catalogue = Release::updateOrCreate(['slug' => 'catalogue'], [
            'uuid' => (string) Str::uuid(),
            'type' => 'mixtape',
            'title' => 'Catalogue',
            'description' => 'Les titres publiés de DX-5 The Nigma.',
            'release_date' => '2026-10-04',
            'published_at' => now()->subDay(),
            'status' => 'published',
        ]);

        foreach ($lib['tracks'] as $i => $t) {
            Track::updateOrCreate(['slug' => Str::slug($t['n']), 'release_id' => $catalogue->id], [
                'uuid' => (string) Str::uuid(),
                'position' => $i + 1,
                'title' => $t['n'],
                'featuring' => $t['feat'] ?: null,
                'preview_path' => $t['src'],
                'youtube_id' => $t['yt'] ?? null,
            ]);
        }

        // ── l'album sous embargo : programmé, INVISIBLE sur tout le site ──
        $album = Release::updateOrCreate(['slug' => 'album-2026'], [
            'uuid' => (string) Str::uuid(),
            'type' => 'album',
            'title' => 'Album 2026',
            'release_date' => '2026-11-15',
            'published_at' => '2026-11-15 00:00:00',
            'status' => 'scheduled',
        ]);

        foreach (range(1, 12) as $n) {
            Track::updateOrCreate(['slug' => "cle-$n", 'release_id' => $album->id], [
                'uuid' => (string) Str::uuid(),
                'position' => $n,
                'title' => "Clé $n",
                'unlock_at' => '2026-11-15 00:00:00',
            ]);
        }

        // ── événements réels ──
        Event::updateOrCreate(['slug' => 'sofia-esfam-2024'], [
            'uuid' => (string) Str::uuid(),
            'title' => 'Invité d’honneur — 30ᵉ anniversaire ESFAM / AUF',
            'description' => 'Club militaire central de Sofia 🇧🇬',
            'starts_at' => '2024-03-15 19:00:00',
            'timezone' => 'Europe/Sofia',
            'venue_name' => 'Club militaire central',
            'city' => 'Sofia',
            'country' => 'Bulgarie',
            'status' => 'past',
            'published_at' => now()->subYear(),
        ]);

        Event::updateOrCreate(['slug' => 'concours-scoutisme-2016'], [
            'uuid' => (string) Str::uuid(),
            'title' => 'Lauréat — Concours national du centenaire du scoutisme',
            'starts_at' => '2016-07-01 18:00:00',
            'timezone' => 'America/Port-au-Prince',
            'city' => 'Haïti',
            'country' => 'Haïti',
            'status' => 'past',
            'published_at' => now()->subYears(2),
        ]);

        foreach ([
            ['coin-du-chef-2021', 'Festivité de fin d’année — Coin du Chef', '2021-12-18 20:00:00', 'Pétion-Ville', 'Haïti'],
            ['festival-st-pierre-2015', 'Festival Saint-Pierre', '2015-06-29 19:00:00', 'Pétion-Ville', 'Haïti'],
            ['festival-nippes-2014', 'Festival de Nippes', '2014-08-15 19:00:00', 'Nippes', 'Haïti'],
            ['festival-rap-pap-2009', 'Festival Rap avec Barikad Crew', '2009-05-01 18:00:00', 'Port-de-Paix', 'Haïti'],
        ] as [$slug, $title, $at, $city, $country]) {
            Event::updateOrCreate(['slug' => $slug], [
                'uuid' => (string) Str::uuid(), 'title' => $title, 'starts_at' => $at,
                'timezone' => 'America/Port-au-Prince', 'city' => $city, 'country' => $country,
                'status' => 'past', 'published_at' => now()->subYears(2),
            ]);
        }
    }
}

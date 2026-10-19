<?php

namespace Tests\Feature;

use App\Models\Release;
use App\Models\Scene;
use App\Models\Track;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Le risque métier n°1 (§4.6) : un contenu programmé ne doit JAMAIS
 * apparaître avant l'heure, sur aucune page.
 */
class EmbargoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Scene::create(['uuid' => (string) Str::uuid(), 'key' => 'library', 'settings' => ['clips' => [], 'live' => []]]);
        Scene::create(['uuid' => (string) Str::uuid(), 'key' => 'home', 'settings' => ['brand' => ['title' => 'Test', 'description' => '', 'socials' => []]]]);

        $publie = Release::create([
            'uuid' => (string) Str::uuid(), 'slug' => 'public', 'title' => 'TITRE-PUBLIC',
            'published_at' => now()->subDay(), 'status' => 'published',
        ]);
        Track::create(['uuid' => (string) Str::uuid(), 'release_id' => $publie->id, 'title' => 'MORCEAU-PUBLIC', 'slug' => 'morceau-public', 'position' => 1]);

        $secret = Release::create([
            'uuid' => (string) Str::uuid(), 'slug' => 'album-secret', 'title' => 'ALBUM-SECRET',
            'published_at' => now()->addMonth(), 'status' => 'scheduled',
        ]);
        Track::create(['uuid' => (string) Str::uuid(), 'release_id' => $secret->id, 'title' => 'MORCEAU-SECRET', 'slug' => 'morceau-secret', 'position' => 1]);
    }

    public function test_le_contenu_programme_est_invisible_partout(): void
    {
        $this->get('/musique')
            ->assertOk()
            ->assertSee('MORCEAU-PUBLIC')
            ->assertDontSee('ALBUM-SECRET')
            ->assertDontSee('MORCEAU-SECRET');

        $this->get('/')->assertOk()->assertDontSee('MORCEAU-SECRET');
    }

    public function test_la_page_d_une_sortie_sous_embargo_renvoie_404(): void
    {
        $this->get('/musique/album-secret')->assertNotFound();
        $this->get('/musique/public')->assertOk()->assertSee('TITRE-PUBLIC');
    }

    public function test_un_titre_verrouille_n_expose_pas_son_nom(): void
    {
        $publie = Release::where('slug', 'public')->first();
        Track::create([
            'uuid' => (string) Str::uuid(), 'release_id' => $publie->id, 'position' => 2,
            'title' => 'TITRE-VERROUILLE', 'slug' => 'titre-verrouille', 'unlock_at' => now()->addWeek(),
        ]);

        $this->get('/musique/public')->assertOk()->assertDontSee('TITRE-VERROUILLE');
        $this->get('/musique')->assertOk()->assertDontSee('TITRE-VERROUILLE');
    }
}

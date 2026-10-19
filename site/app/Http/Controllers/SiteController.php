<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Release;
use App\Models\Scene;

class SiteController extends Controller
{
    /** Accueil immersif : le moteur du template, nourri par la base (scène « home »). */
    public function home()
    {
        $content = Scene::where('key', 'home')->first()?->settings ?? [];

        return view('home', [
            'content' => $content,
            'lib' => $this->lib(),
            'title' => $content['brand']['title'] ?? 'DX-5 The Nigma',
            'description' => $content['brand']['description'] ?? '',
        ]);
    }

    /** Bibliothèque : discographie + vidéothèque, 100 % base locale. */
    public function musique()
    {
        $library = Scene::where('key', 'library')->first()?->settings ?? [];

        return view('musique', [
            'lib' => $this->lib(),
            'videos' => ['clips' => $library['clips'] ?? [], 'live' => $library['live'] ?? []],
            'announce' => $library['album_announce'] ?? null, // champs publics du compte à rebours (§4.6)
        ]);
    }

    public function release(Release $release)
    {
        abort_unless($release->published_at?->isPast(), 404); // embargo (§4.6)

        return view('release', ['release' => $release->load('tracks', 'streamingLinks')]);
    }

    public function agenda()
    {
        return view('pages.agenda', [
            'upcoming' => Event::published()->upcoming()->get(),
            'past' => Event::published()->past()->get(),
        ]);
    }

    public function page(string $slug)
    {
        abort_unless(view()->exists("pages.$slug"), 404);

        return view("pages.$slug");
    }

    /** Le lecteur persistant (extraits + intégral) : uniquement du publié ET déverrouillé. */
    protected function lib(): array
    {
        $tracks = Release::published()
            ->with(['tracks' => fn ($q) => $q->orderBy('position')])
            ->orderByDesc('release_date')
            ->get()
            ->flatMap->tracks
            ->filter->isUnlocked()
            ->values();

        $library = Scene::where('key', 'library')->first()?->settings ?? [];

        return [
            'tracks' => $tracks->map(fn ($t) => array_filter([
                'n' => $t->title,
                'feat' => $t->featuring,
                'src' => $t->preview_path,
                'yt' => $t->youtube_id,
                'badge' => $t->release->release_date?->gt(now()->subMonths(2)) ? 'NOUVEAU' : null,
            ]))->all(),
            'clips' => $library['clips'] ?? [],
            'live' => $library['live'] ?? [],
        ];
    }
}

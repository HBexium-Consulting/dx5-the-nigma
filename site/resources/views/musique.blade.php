@extends('layouts.site', ['htmlClass' => 'is-bib', 'title' => 'Bibliothèque — DX-5 The Nigma',
  'description' => 'Discographie, extraits et clips officiels de DX-5 The Nigma.'])

@section('content')
  <section class="hero">
    <p class="mono kicker">DX-5 THE NIGMA — BIBLIOTHÈQUE</p>
    <h1><span data-scramble>La bibliothèque</span><br><em data-scramble>de l'artiste.</em></h1>
    <p class="sub">Le signal est visible : la scène réagit à ce qui joue.
    Quand rien ne joue, elle respire. <span class="mono ash">SON JAMAIS AUTOMATIQUE — APPUYEZ SUR ▶</span></p>
  </section>

  <section class="block" id="discographie" aria-labelledby="h-disco">
    <div class="block-head">
      <p class="mono kicker">EXTRAITS — 30 SECONDES</p>
      <h2 id="h-disco" data-scramble>Discographie</h2>
      <p class="mono ash meta">{{ count($lib['tracks']) }} TITRES — CATALOGUE OFFICIEL</p>
    </div>
    {{-- rendu serveur (référencement) ; le lecteur JS reprend la main ensuite --}}
    <ol class="tracks" id="trackList">
      @foreach ($lib['tracks'] as $i => $t)
        <li class="track">
          <span class="t-idx">{{ str_pad($i + 1, 2, '0', STR_PAD_LEFT) }}</span>
          <button class="t-play" data-i="{{ $i }}" aria-label="Écouter l'extrait de {{ $t['n'] }}">▶</button>
          <span class="t-name"><span data-scramble>{{ $t['n'] }}</span>
            @isset($t['badge'])<span class="badge gold mono">{{ $t['badge'] }}</span>@endisset
            @isset($t['feat'])<span class="t-feat">{{ $t['feat'] }}</span>@endisset</span>
          <button class="t-full mono" data-yt="{{ $t['yt'] ?? '' }}" data-name="{{ $t['n'] }}">EN ENTIER ▸</button>
          <span class="t-dur">EXTRAIT 0:30</span>
        </li>
      @endforeach
    </ol>
  </section>

  @if ($announce)
  <section class="block" id="album" aria-labelledby="h-album">
    <div class="block-head">
      <p class="mono kicker gold">SOUS EMBARGO</p>
      <h2 id="h-album" data-scramble>{{ $announce['title'] ?? 'L’album' }}</h2>
      <p class="mono red meta">{{ $announce['label'] ?? '' }}</p>
    </div>
    <ul class="vault" id="vault" data-count="{{ $announce['count'] ?? 12 }}"
        aria-label="Titres chiffrés, à déverrouiller avant la sortie"></ul>
  </section>
  @endif

  <section class="block" id="videos" aria-labelledby="h-videos">
    <div class="block-head">
      <p class="mono kicker">VIDÉOTHÈQUE</p>
      <h2 id="h-videos" data-scramble>Clips officiels</h2>
      <p class="mono ash meta">CHARGEMENT À LA DEMANDE — RIEN NE PART VERS YOUTUBE AVANT VOTRE CLIC</p>
    </div>
    <div class="vidgrid" id="clipGrid"></div>
    <div class="block-head sub-head"><h2 class="h-live" data-scramble>Live &amp; interviews</h2></div>
    <div class="vidgrid" id="liveGrid"></div>
  </section>
@endsection

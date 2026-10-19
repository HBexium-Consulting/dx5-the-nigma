@extends('layouts.site', ['htmlClass' => 'is-pg', 'title' => $release->title.' — DX-5 The Nigma',
  'description' => str($release->description)->limit(150)])

@section('content')
  <div class="page-head">
    <span class="mono kicker">{{ strtoupper($release->type) }} — {{ $release->release_date?->isoFormat('MMMM YYYY') }}</span>
    <h1>{{ $release->title }}</h1>
    @if ($release->description)<p class="lead">{{ $release->description }}</p>@endif
  </div>

  <ol class="pieces">
    @foreach ($release->tracks as $track)
      <li class="piece">
        <span class="when">{{ str_pad($track->position, 2, '0', STR_PAD_LEFT) }}</span>
        <div>
          <h3>{{ $track->isUnlocked() ? $track->title : '▓▓▓▓▓▓▓' }}
            @unless ($track->isUnlocked())<span class="notice">VERROUILLÉ</span>@endunless</h3>
          @if ($track->featuring)<p>{{ $track->featuring }}</p>@endif
        </div>
      </li>
    @endforeach
  </ol>

  @if ($release->streamingLinks->isNotEmpty())
    <h2>Écouter ailleurs</h2>
    <div class="foot-links mono">
      @foreach ($release->streamingLinks as $link)
        <a href="{{ $link->url }}" target="_blank" rel="noopener">{{ strtoupper($link->platform) }} ↗</a>
      @endforeach
    </div>
  @endif
@endsection

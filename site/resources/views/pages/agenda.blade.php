@extends('layouts.site', ['title' => 'Agenda — DX-5 The Nigma',
  'description' => 'Concerts et dates à venir de DX-5 The Nigma.'])

@section('content')
  <div class="page-head">
    <span class="mono kicker">AGENDA</span>
    <h1>Les <em>dates.</em></h1>
    <p class="lead">Concerts, festivals, rencontres — publiés par l'artiste depuis son tableau de bord.</p>
  </div>

  <h2>Prochaines dates</h2>
  @forelse ($upcoming as $event)
    <ol class="pieces">
      <li class="piece">
        <span class="when">{{ $event->starts_at->isoFormat('D MMM YYYY') }}</span>
        <div>
          <h3>{{ $event->title }} @if ($event->city)— {{ $event->city }}@endif</h3>
          <p>{{ $event->venue_name }}@if ($event->country) · {{ $event->country }}@endif
            @if ($event->ticket_mode === 'external' && $event->ticket_url)
              — <a href="{{ $event->ticket_url }}" target="_blank" rel="noopener">Billets ↗</a>
            @endif</p>
        </div>
      </li>
    </ol>
  @empty
    <div class="cards"><div class="card big">
      <h3>Aucune date annoncée — pour l'instant</h3>
      <span class="mono red">LA TOURNÉE DE L'ALBUM SE PRÉPARE</span>
      <p>Pour être prévenu dès l'annonce :</p>
      <form method="POST" action="{{ route('newsletter') }}" style="margin-top:12px">
        @csrf
        <div class="frow">
          <label>VOTRE E-MAIL <input type="email" name="email" required></label>
          <span style="align-self:end"><button class="btn" type="submit">ME PRÉVENIR</button></span>
        </div>
        @error('email')<p class="mono red">{{ $message }}</p>@enderror
      </form>
    </div></div>
  @endforelse

  <h2>Dates passées</h2>
  <ol class="pieces">
    @foreach ($past as $event)
      <li class="piece">
        <span class="when">{{ strtoupper($event->starts_at->isoFormat('MMM YYYY')) }}</span>
        <div>
          <h3>{{ $event->title }}</h3>
          <p>{{ $event->venue_name }}@if ($event->city) — {{ $event->city }}@endif
            @if ($event->description) · {{ $event->description }}@endif</p>
        </div>
      </li>
    @endforeach
  </ol>
@endsection

<!doctype html>
<html lang="fr" class="{{ $htmlClass ?? 'is-pg' }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ $title ?? 'DX-5 The Nigma' }}</title>
<meta name="description" content="{{ $description ?? 'DX-5 The Nigma — rappeur et écrivain haïtien.' }}">
<link rel="stylesheet" href="/assets/site.css">
<link rel="stylesheet" href="/bibliotheque/styles.css">
<link rel="stylesheet" href="/assets/hbx-player.css">
</head>
<body>

<header class="top">
  <a class="wordmark" href="/" title="Accueil">DX-5 The Nigma</a>
  <nav class="top-nav" aria-label="Navigation principale">
    @foreach (['musique' => 'BIBLIOTHÈQUE', 'agenda' => 'AGENDA', 'ecrits' => 'ÉCRITS', 'a-propos' => 'À PROPOS', 'pro' => 'PRO', 'contact' => 'CONTACT'] as $route => $label)
      <a class="nav-link mono @if (request()->routeIs($route)) active @endif" href="{{ route($route) }}"
         @if (request()->routeIs($route)) aria-current="page" @endif>{{ $label }}</a>
    @endforeach
  </nav>
  <span class="nav-sub">
    <button class="nav-link mono nav-more" id="navMore" aria-expanded="false" aria-controls="navMenu" aria-haspopup="true">PLUS ▾</button>
    <div class="nav-menu" id="navMenu" hidden>
      @foreach (['musique' => 'BIBLIOTHÈQUE', 'agenda' => 'AGENDA', 'ecrits' => 'ÉCRITS', 'a-propos' => 'À PROPOS', 'pro' => 'ESPACE PRO', 'contact' => 'CONTACT'] as $route => $label)
        <a class="mono m-only" href="{{ route($route) }}">{{ $label }}</a>
      @endforeach
      <a class="mono" href="{{ route('boutique') }}">BOUTIQUE</a>
      <a class="mono" href="{{ route('soutenir') }}">SOUTENIR</a>
      <a class="mono" href="{{ route('actualites') }}">ACTUALITÉS</a>
    </div>
  </span>
  <a class="nav-cta mono" href="/musique#discographie">ÉCOUTER</a>
</header>

<main>
@if (session('ok'))
  <div class="banner" role="status" style="margin-top:0">{{ session('ok') }}</div>
@endif

@yield('content')

  <footer class="foot">
    <nav class="foot-links mono" aria-label="Pied de page">
      <a href="/">ACCUEIL</a><a href="{{ route('boutique') }}">BOUTIQUE</a><a href="{{ route('soutenir') }}">SOUTENIR</a><a href="{{ route('actualites') }}">ACTUALITÉS</a><a href="{{ route('mentions-legales') }}">MENTIONS LÉGALES</a><a href="{{ route('confidentialite') }}">CONFIDENTIALITÉ</a>
    </nav>
    <nav class="foot-links mono" aria-label="Réseaux">
      <a href="https://www.tiktok.com/@dx5thenigma" target="_blank" rel="noopener">TIKTOK ↗</a>
      <a href="https://youtube.com/@dx-5thenigma" target="_blank" rel="noopener">YOUTUBE ↗</a>
      <a href="https://www.instagram.com/dx5thenigma" target="_blank" rel="noopener">INSTAGRAM ↗</a>
      <a href="https://www.facebook.com/dx5thenigma" target="_blank" rel="noopener">FACEBOOK ↗</a>
    </nav>
    <p class="mono ash">© {{ now()->year }} DX-5 THE NIGMA — PORT-DE-PAIX · SOFIA</p>
  </footer>
</main>

<script>window.LIB = @json($lib ?? ['tracks' => [], 'clips' => [], 'live' => []]);</script>
<script src="/assets/hbx-player.js"></script>
<script src="/assets/fx.js"></script>
<script src="/bibliotheque/app.js"></script>
<script src="/assets/nav.js"></script>
</body>
</html>

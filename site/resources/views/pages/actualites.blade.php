@extends('layouts.site', ['title' => 'Actualités — DX-5 The Nigma',
  'description' => 'Sorties et annonces de DX-5 The Nigma.'])

@section('content')

  <div class="page-head">
    <span class="mono kicker">LE JOURNAL DE BORD</span>
    <h1>Actualités.</h1>
    <p class="lead">Sorties, annonces, coulisses — publiées par l’artiste depuis son Dashboard.</p>
  </div>

  <div class="banner">SUR LE SITE FINAL, CETTE RUBRIQUE N’APPARAÎT DANS LE MENU QU’À PARTIR DE TROIS ARTICLES (MODULE BLOG DU DASHBOARD)</div>

  <div class="cards">
    <div class="card big"><h3>« VETERAN » — le nouveau single et son clip</h3>
      <span class="mono gold">OCTOBRE 2026</span>
      <p>Le clip officiel de VETERAN est en ligne sur la chaîne de l’artiste — premier signal
      avant l’album de novembre.
      <a href="https://www.youtube.com/watch?v=tZE1n5WMssc" target="_blank" rel="noopener">Voir le clip ↗</a></p></div>
    <div class="card"><h3>Article à venir</h3><span class="mono ash">—</span><p>Rédigé par l’artiste après la formation.</p></div>
    <div class="card"><h3>Article à venir</h3><span class="mono ash">—</span><p>Une publication par semaine, selon le questionnaire.</p></div>
  </div>
@endsection

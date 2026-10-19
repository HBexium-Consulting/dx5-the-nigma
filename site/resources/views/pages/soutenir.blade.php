@extends('layouts.site', ['title' => 'Soutenir l\'artiste — DX-5 The Nigma',
  'description' => 'Contribuer au signal de DX-5 The Nigma.'])

@section('content')

  <div class="page-head">
    <span class="mono kicker">CONTRIBUER AU SIGNAL</span>
    <h1>Soutenir <em>l’artiste.</em></h1>
    <p class="lead">Indépendant depuis 2007 : pas de label, pas de structure derrière lui.
    Chaque contribution finance directement le studio, les clips et la scène.</p>
  </div>

  <div class="cards">
    <div class="card"><h3>5 USD</h3><span class="mono ash">UN SIGNAL</span><p>Un café au studio.</p></div>
    <div class="card"><h3>25 USD</h3><span class="mono ash">UNE FRÉQUENCE</span><p>Une session d’enregistrement.</p></div>
    <div class="card"><h3>100 USD</h3><span class="mono gold">UNE CLÉ</span><p>Un pas de plus vers le prochain clip.</p></div>
  </div>

  <p style="margin-top:28px"><button class="btn" disabled>SOUTENIR — BIENTÔT</button></p>
  <p class="form-note" style="margin-top:12px">MODULE ACTIVÉ EN PHASE 3 (CAMPAGNE « SOUTENIR L’ARTISTE » DU DASHBOARD). MONTANTS INDICATIFS, À VALIDER AVEC L’ARTISTE.</p>
@endsection

@extends('layouts.site', ['title' => 'Soutenir l\'artiste — DX-5 The Nigma',
  'description' => 'Contribuer au signal de DX-5 The Nigma.'])

@section('content')

  <div class="page-head">
    <span class="mono kicker">LE CERCLE DES PROCHES</span>
    <h1>Entrez dans <em>le Cercle.</em></h1>
    <p class="lead">Indépendant depuis 2007 : pas de label, pas de structure derrière lui.
    Le Cercle réunit les proches de l’artiste — ceux qui le soutiennent financièrement et autrement,
    et restent au plus près de sa musique.</p>
  </div>

  <h2>Ce que le Cercle vous donne</h2>
  <div class="cards">
    <div class="card"><h3>Des réductions</h3><span class="mono gold">MEMBRE</span>
      <p>Des rabais réservés aux membres sur l’achat de l’album, les billets des événements et tous
      les articles de la boutique de l’artiste.</p></div>
    <div class="card"><h3>Au plus près</h3><span class="mono ash">EXCLUSIVITÉS</span>
      <p>Coulisses, avant-premières et annonces en priorité — vous entendez le signal avant tout le monde.</p></div>
    <div class="card"><h3>Vous le portez</h3><span class="mono ash">SOUTIEN DIRECT</span>
      <p>Chaque contribution finance directement le studio, les clips et la scène d’un artiste indépendant.</p></div>
  </div>

  <h2>Rejoindre</h2>
  <div class="cards">
    <div class="card"><h3>Proche</h3><span class="mono ash">5 USD / MOIS</span><p>Le signal, les coulisses, les annonces en priorité.</p></div>
    <div class="card"><h3>Complice</h3><span class="mono ash">15 USD / MOIS</span><p>+ les réductions membres sur l’album et la boutique.</p></div>
    <div class="card"><h3>Cercle intime</h3><span class="mono gold">40 USD / MOIS</span><p>+ les réductions sur les billets et des exclusivités réservées.</p></div>
  </div>

  <p style="margin-top:28px"><button class="btn" disabled>REJOINDRE LE CERCLE — BIENTÔT</button></p>
  <p class="form-note" style="margin-top:12px">OUVERTURE PROCHAINE. Montants indicatifs, à confirmer avec l’artiste.</p>
@endsection

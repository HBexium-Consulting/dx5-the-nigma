@extends('layouts.site', ['title' => 'Boutique — DX-5 The Nigma',
  'description' => 'La boutique ouvre avec l\'album.'])

@section('content')

  <div class="page-head">
    <span class="mono kicker">PHASE 2 — EN PRÉPARATION</span>
    <h1>La boutique ouvre <em>avec l’album.</em></h1>
    <p class="lead">D’abord le numérique — l’album et les titres à l’unité, livrés par lien sécurisé.
    Le physique suivra quand un circuit d’expédition existera.</p>
  </div>

  <div class="cards">
    <div class="card"><h3>L’album — 12 titres</h3><span class="mono gold">NOVEMBRE 2026</span>
      <p>Téléchargement haute qualité. <span class="notice">PRÉCOMMANDE À VENIR</span></p></div>
    <div class="card"><h3>Titres à l’unité</h3><span class="mono ash">NUMÉRIQUE</span>
      <p>Chaque clé de l’énigme, séparément. <span class="notice">BIENTÔT</span></p></div>
    <div class="card"><h3>Produits dérivés</h3><span class="mono ash">PHYSIQUE — PLUS TARD</span>
      <p><span class="notice">LISTE &amp; PRIX SUR DEMANDE</span></p></div>
  </div>

  <h2>Paiements prévus</h2>
  <div class="prose">
    <p>Carte bancaire (Stripe) pour l’international, puis <strong>MonCash</strong> et
    <strong>NatCash</strong> via la passerelle Kobara pour Haïti. PayPal à l’étude.
    <span class="notice">OUVERTURE PROCHAINE</span></p>
  </div>
@endsection

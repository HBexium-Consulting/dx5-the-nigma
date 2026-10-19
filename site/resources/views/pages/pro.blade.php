@extends('layouts.site', ['title' => 'Espace professionnel — DX-5 The Nigma',
  'description' => 'Presse, booking et fiche technique de DX-5 The Nigma.'])

@section('content')

  <div class="page-head">
    <span class="mono kicker">ACCÈS RESTREINT</span>
    <h1>Le passage en <em>coulisses.</em></h1>
    <p class="lead">Presse, programmateurs, partenaires : dossier de presse, fiche technique
    et demande de booking. L’accès s’ouvre avec un code.</p>
  </div>

  <section id="gate">
    <form id="gateForm">
      <label>CODE D’ACCÈS
        <input type="password" id="gateCode" autocomplete="off" placeholder="•••" required>
      </label>
      <div><button class="btn" type="submit">DÉVERROUILLER</button></div>
      <p class="form-note">ACCÈS RÉSERVÉ AUX PROFESSIONNELS — CODE SUR DEMANDE : CONTACT@DX5THENIGMA.COM</p>
      <p class="ok-msg hidden" id="gateErr" style="color:var(--red)">CODE REFUSÉ — RÉESSAYEZ.</p>
    </form>
  </section>

  <section id="proContent" class="hidden">
    <h2>Le dossier professionnel</h2>
    <div class="cards">
      <div class="card"><h3>Dossier de presse</h3><span class="mono ash">PDF</span>
        <p>Parcours, photos, liens. <span class="notice">SUR DEMANDE</span></p>
        <p style="margin-top:12px"><button class="btn ghost" disabled>TÉLÉCHARGER (BIENTÔT)</button></p></div>
      <div class="card"><h3>Fiche technique</h3><span class="mono ash">RIDER</span>
        <p>Besoins scène et son. <span class="notice">SUR DEMANDE</span></p></div>
      <div class="card"><h3>Photos HD</h3><span class="mono ash">MÉDIATHÈQUE</span>
        <p>Visuels presse en haute définition, avec crédits. <span class="notice">SUR DEMANDE</span></p></div>
    </div>

    <h2>Demande de booking</h2>
    <form id="bookingForm" method="POST" action="/booking">
      @csrf
      <div class="frow">
        <label>ORGANISATEUR·RICE <input name="organizer_name" required></label>
        <label>STRUCTURE <input name="organization"></label>
      </div>
      <div class="frow">
        <label>E-MAIL <input type="email" name="email" required></label>
        <label>TÉLÉPHONE / WHATSAPP <input name="phone"></label>
      </div>
      <div class="frow">
        <label>TYPE D’ÉVÉNEMENT
          <select name="event_type"><option>Concert</option><option>Festival</option><option>Émission / média</option><option>Événement privé</option></select></label>
        <label>DATE ENVISAGÉE <input type="date" name="event_date"></label>
      </div>
      <div class="frow">
        <label>VILLE <input name="city"></label>
        <label>PAYS <input name="country"></label>
      </div>
      <div class="frow">
        <label>PUBLIC ATTENDU <input name="expected_audience" inputmode="numeric"></label>
        <label>BUDGET (USD) <input name="budget_amount" inputmode="numeric"></label>
      </div>
      <label>VOTRE PROJET <textarea name="message" rows="4"></textarea></label>
      <div><button class="btn" type="submit">ENVOYER LA DEMANDE</button></div>
      <p class="ok-msg hidden" id="bookingOk">DEMANDE ENREGISTRÉE — RÉPONSE SOUS 24 H.</p>
    </form>
  </section>
@endsection

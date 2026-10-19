@extends('layouts.site', ['title' => 'Contact — DX-5 The Nigma',
  'description' => 'Écrire à DX-5 The Nigma — booking, presse, fans.'])

@section('content')

  <div class="page-head">
    <span class="mono kicker">CONTACT</span>
    <h1>Entrer en <em>contact.</em></h1>
    <p class="lead">Fans, médias, partenaires : un message suffit. Les demandes de concert passent
    par l’<a href="/pro">espace professionnel</a>.</p>
  </div>

  <div class="cards">
    <div class="card"><h3>E-mail</h3><span class="mono ash">RÉPONSE SOUS 24 H</span>
      <p><a href="mailto:contact@dx5thenigma.com">contact@dx5thenigma.com</a><br>
      <span class="notice">ADRESSE À CRÉER AVEC LE DOMAINE</span></p></div>
    <div class="card"><h3>WhatsApp</h3><span class="mono ash">7 J/7 — 9 H → 20 H</span>
      <p><a href="https://wa.me/359879295518" target="_blank" rel="noopener">+359 87 929 5518 ↗</a><br>
      <span class="notice">NUMÉRO À CONFIRMER COMME PUBLIC</span></p></div>
    <div class="card"><h3>Réseaux</h3><span class="mono ash">LE SIGNAL CONTINUE</span>
      <p><a href="https://www.tiktok.com/@dx5thenigma" target="_blank" rel="noopener">TikTok</a> ·
      <a href="https://youtube.com/@dx-5thenigma" target="_blank" rel="noopener">YouTube</a> ·
      <a href="https://www.instagram.com/dx5thenigma" target="_blank" rel="noopener">Instagram</a> ·
      <a href="https://www.facebook.com/dx5thenigma" target="_blank" rel="noopener">Facebook</a></p></div>
  </div>

  <h2>Écrire un message</h2>
  <form id="contactForm" method="POST" action="/contact">
    @csrf
    <div class="frow">
      <label>VOTRE NOM <input name="name" required></label>
      <label>VOTRE E-MAIL <input type="email" name="email" required></label>
    </div>
    <label>VOTRE MESSAGE <textarea name="message" rows="5" required></textarea></label>
    <div><button class="btn" type="submit">ENVOYER</button></div>
    <p class="ok-msg hidden" id="contactOk">PROTOTYPE : MESSAGE NON ENVOYÉ. SUR LE SITE FINAL, IL PART VERS LE DASHBOARD (POST /LEADS) VIA LA FILE LOCALE DU SITE.</p>
  </form>
@endsection

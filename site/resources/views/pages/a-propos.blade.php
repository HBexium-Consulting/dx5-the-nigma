@extends('layouts.site', ['title' => 'À propos — DX-5 The Nigma',
  'description' => 'Le parcours de DX-5 The Nigma, pièce par pièce.'])

@section('content')

  <div class="page-head">
    <span class="mono kicker">LE DOSSIER</span>
    <h1>L’artiste, <em>pièce par pièce.</em></h1>
    <p class="lead">DX-5 The Nigma ne se raconte pas : il se déchiffre. Rappeur et écrivain haïtien,
    actif depuis 2007, de Port-de-Paix à Sofia. Indépendant.</p>
  </div>

  <h2>Identité <span class="notice">BIO OFFICIELLE À RECEVOIR</span></h2>
  <div class="prose">
    <p>Félix DEBROSSE, connu sous le nom de <strong>DX-5 The Nigma</strong>, pratique le hip-hop
    depuis 2007. Originaire de Port-de-Paix (Haïti), aujourd’hui basé à Sofia (Bulgarie), il mène
    de front le rap et l’écriture — c’est le texte qui commande le beat. Son prochain album,
    douze titres, est attendu pour novembre 2026.</p>
    <p class="ash">Ce paragraphe est une synthèse provisoire du questionnaire : la biographie
    officielle (courte et longue) sera reprise du dossier de presse de l’artiste.</p>
  </div>

  <h2>Les pièces du dossier</h2>
  <ol class="pieces">
    <li class="piece"><span class="when">2007</span>
      <div><h3>Les origines</h3><p>Premiers textes et premières scènes à Port-de-Paix. Le code « DX-5 » naît.</p></div></li>
    <li class="piece"><span class="when">2016 — PIÈCE N°01</span>
      <div><h3>Le trophée <span class="notice">PHOTO À RECEVOIR</span></h3><p>Lauréat du concours national de musique du centenaire du scoutisme en Haïti.</p></div></li>
    <li class="piece"><span class="when">MARS 2024</span>
      <div><h3>Sofia, invité d’honneur</h3><p>30ᵉ anniversaire ESFAM / AUF, Club militaire central de Sofia.
      <a href="https://www.youtube.com/watch?v=0TNz96db5XQ" target="_blank" rel="noopener">Voir le live ↗</a></p></div></li>
    <li class="piece"><span class="when">OCTOBRE 2026</span>
      <div><h3>VETERAN</h3><p>Nouveau single et clip officiel.
      <a href="https://www.youtube.com/watch?v=tZE1n5WMssc" target="_blank" rel="noopener">Voir le clip ↗</a></p></div></li>
    <li class="piece"><span class="when">NOVEMBRE 2026</span>
      <div><h3>L’album — 12 titres <span class="notice red-n">DATE EXACTE À CONFIRMER</span></h3><p>Douze titres, déverrouillés un à un. Le premier usage de ce site.</p></div></li>
  </ol>

  <h2>Le public — 14 signaux</h2>
  <p class="ash" style="margin-bottom:18px">Là où la fréquence est captée aujourd’hui.</p>
  <div class="chips">
    <span class="chip lead-chip"><i></i>HAÏTI</span>
    <span class="chip"><i></i>USA</span><span class="chip"><i></i>FRANCE</span><span class="chip"><i></i>CANADA</span>
    <span class="chip"><i></i>BELGIQUE</span><span class="chip"><i></i>SUISSE</span><span class="chip"><i></i>ÉMIRATS (DUBAÏ)</span>
    <span class="chip"><i></i>RÉP. DOMINICAINE</span><span class="chip"><i></i>CHILI</span><span class="chip"><i></i>BRÉSIL</span>
    <span class="chip"><i></i>CAMEROUN</span><span class="chip"><i></i>SÉNÉGAL</span><span class="chip"><i></i>CÔTE D’IVOIRE</span>
    <span class="chip"><i></i>BURKINA FASO</span>
  </div>

  <h2>Trois mots, un code</h2>
  <div class="cards">
    <div class="card"><h3>Authentique</h3><span class="mono ash">01</span><p>Port-de-Paix dans la voix, sans filtre ni posture.</p></div>
    <div class="card"><h3>Créatif</h3><span class="mono ash">02</span><p>Écrivain avant d’être rappeur : le texte commande le beat.</p></div>
    <div class="card"><h3>Engagé</h3><span class="mono ash">03</span><p>Une voix pour Haïti, portée par quatorze pays.</p></div>
  </div>
  <p style="margin-top:28px"><a class="btn ghost" href="/ecrits">DÉCOUVRIR L’ÉCRIVAIN →</a></p>
@endsection

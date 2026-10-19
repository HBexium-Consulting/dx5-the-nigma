@extends('layouts.site', ['title' => 'Écrits — DX-5 The Nigma',
  'description' => 'Textes et carnets de DX-5 The Nigma, rappeur et écrivain.'])

@section('content')

  <div class="page-head">
    <span class="mono kicker">L’ÉCRIVAIN</span>
    <h1>Avant le rap, <em>le texte.</em></h1>
    <p class="lead">C’est ce qui distingue DX-5 : il écrit. Des carnets, des manuscrits, des ratures.
    Cette section montre l’intention — les textes réels arrivent avec la collecte.</p>
  </div>

  <div class="banner">TEXTES DE DÉMONSTRATION — LES EXTRAITS RÉELS DES CARNETS DE L’ARTISTE REMPLACERONT CES FRAGMENTS</div>

  <blockquote class="fragment">
    Les mots viennent avant la mesure. La page garde ce que la scène n’a pas encore entendu.
    <footer>FRAGMENT 01 — TEXTE PROVISOIRE HBEXIUM, À REMPLACER</footer>
  </blockquote>

  <blockquote class="fragment">
    Une énigme n’est pas un mur : c’est une porte qui demande la bonne clé. Chaque titre en est une.
    <footer>FRAGMENT 02 — TEXTE PROVISOIRE HBEXIUM, À REMPLACER</footer>
  </blockquote>

  <h2>Les paroles, synchronisées</h2>
  <div class="cards">
    <div class="card big"><h3>La salle d’écoute affichera les textes</h3>
      <span class="mono ash">CHAMP « LYRICS » DU DASHBOARD</span>
      <p>Si l’artiste fournit ses paroles, elles défileront en synchronisation avec chaque extrait
      dans la <a href="/musique">bibliothèque</a> — le manuscrit et le son, ensemble.</p></div>
  </div>
@endsection

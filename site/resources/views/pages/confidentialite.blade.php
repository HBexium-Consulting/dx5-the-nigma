@extends('layouts.site', ['title' => 'Politique de confidentialité — DX-5 The Nigma',
  'description' => 'Vos données sur dx5thenigma.com.'])

@section('content')

  <div class="page-head">
    <span class="mono kicker">VOS DONNÉES</span>
    <h1>Confidentialité.</h1>
    <p class="lead">Version V1 (teaser : newsletter et contact). L’éditeur résidant dans l’Union
    européenne, le RGPD s’applique.</p>
  </div>

  <div class="banner">BROUILLON — À ENRICHIR EN PHASE 3 (VENTE EN LIGNE, PAIEMENTS, ESPACE PRO)</div>

  <h2>Qui est responsable ?</h2>
  <div class="prose"><p><strong>Félix DEBROSSE</strong> (« DX-5 The Nigma »), éditeur du site —
  contact@dx5thenigma.com. Le traitement technique est assuré par <strong>HBEXIUM Consulting</strong>
  (hébergement du site et du tableau de bord), agissant comme sous-traitant.</p></div>

  <h2>Ce que nous collectons, et pourquoi</h2>
  <div class="cards">
    <div class="card"><h3>Newsletter</h3><span class="mono ash">CONSENTEMENT — DOUBLE CONFIRMATION</span>
      <p>Votre e-mail et votre langue, pour les sorties et concerts. Conservés jusqu’à désinscription —
      chaque envoi contient un lien de désinscription immédiate.</p></div>
    <div class="card"><h3>Contact &amp; booking</h3><span class="mono ash">INTÉRÊT LÉGITIME</span>
      <p>Nom, e-mail et message, pour vous répondre. <span class="notice">DURÉE : 24 MOIS, À CONFIRMER</span></p></div>
    <div class="card"><h3>Journaux techniques</h3><span class="mono ash">SÉCURITÉ</span>
      <p>Données minimales de fonctionnement du serveur. <span class="notice">DURÉE : 12 MOIS, À CONFIRMER</span></p></div>
  </div>

  <h2>Ce que nous ne faisons pas</h2>
  <div class="prose">
    <p>Aucune donnée vendue, louée ou partagée à des fins commerciales. Aucun traceur publicitaire.
    Les vidéos YouTube ne se chargent qu’à votre clic : rien ne part vers YouTube avant.
    En V1, seuls des cookies strictement nécessaires sont utilisés.</p>
  </div>

  <h2>Vos droits</h2>
  <div class="prose">
    <p>Accès, rectification, effacement, opposition, limitation, portabilité : écrivez à
    <a href="mailto:contact@dx5thenigma.com">contact@dx5thenigma.com</a>. Vous pouvez saisir
    l’autorité de contrôle compétente (CPDP en Bulgarie, CNIL en France).</p>
    <p class="ash">Dernière mise à jour : <span class="notice">DATE DE MISE EN LIGNE</span></p>
  </div>
@endsection

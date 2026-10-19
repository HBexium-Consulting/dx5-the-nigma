<?php

declare(strict_types=1);

/*
 * ─────────────────────────────────────────────────────────────────────────
 * DX-5 THE NIGMA — Teaser (Phase 1) · ENTIÈREMENT piloté par le Dashboard.
 * Chaque élément visible (accroche, marque, contact, compte à rebours, single,
 * agenda, liens) vient de l'API v1. Une modification faite dans le Dashboard
 * est reflétée sur le site (cache court + webhook de purge instantané).
 * Rendu CÔTÉ SERVEUR ; clé jamais exposée ; repli si l'API tombe (§4.8).
 * ─────────────────────────────────────────────────────────────────────────
 */

$config = require __DIR__.'/lib/config.php';
require __DIR__.'/lib/hbx.php';

$hbx = new Hbx($config);

// ── Tout le contenu piloté par le Dashboard (lecture mise en cache) ──────
$settings = $hbx->get('/v1/settings')['data'] ?? [];
$scenesList = $hbx->data('/v1/scenes');
$upcoming = $hbx->data('/v1/releases/upcoming');   // album à venir (annoncé)
$released = $hbx->data('/v1/releases');             // sorties publiées (VETERAN)
$links = $hbx->data('/v1/streaming-links');         // liens plateformes/profil
$events = $hbx->data('/v1/events');                 // agenda (concerts, dates)

// Scènes indexées par clé (home, release, tour, about…) — pilotage §6.4.
$scenes = [];
foreach ($scenesList as $s) {
    $scenes[(string) ($s['key'] ?? '')] = $s;
}
$home = $scenes['home'] ?? [];

// Valeurs dashboard-driven, avec repli propre.
$brand = trim((string) ($settings['organization_name'] ?? '')) ?: 'DX-5 The Nigma';
$contactEmail = trim((string) ($settings['contact_email'] ?? '')) ?: (string) $config['contact_email'];
$heroHeadline = trim((string) ($home['headline'] ?? ''))
    ?: trim((string) ($settings['hero_title'] ?? ''))
    ?: 'Le signal vient d\'Haïti, déchiffrez l\'énigme.';
$intensity = (string) ($home['intensity'] ?? 'high');

// TEXTES DE LA PAGE — pilotés par la scène « home » (settings), avec replis.
// Le dashboard est la source unique : rien d'éditorial n'est codé en dur.
$hs = is_array($home['settings'] ?? null) ? $home['settings'] : [];
$txt = static fn (string $key, string $default): string => trim((string) ($hs[$key] ?? '')) ?: $default;

$kicker = $txt('kicker', 'DX-5 THE NIGMA — HIP-HOP / RAP · ÉCRITURE');
$blocksKicker = $txt('blocks_kicker', 'UNE ÉNIGME, 3 CLÉS');
$blocks = (isset($hs['blocks']) && is_array($hs['blocks']) && $hs['blocks'] !== []) ? $hs['blocks'] : [
    ['title' => 'Le signal', 'text' => 'Un extrait, un compte à rebours. La fréquence s\'installe, l\'énigme commence.'],
    ['title' => 'Le déchiffrement', 'text' => 'Les titres se déverrouillent un à un, chacun avec son extrait, jusqu\'au jour J.'],
    ['title' => 'La révélation', 'text' => 'L\'album complet, en écoute et en vente — d\'Haïti au reste du monde.'],
];
$newsletterNote = $txt('newsletter_note', 'Soyez prévenu·e à la seconde où l\'énigme se déverrouille. Aucun spam.');
$footerKicker = $txt('footer_kicker', 'BOOKING & PRESSE');
$footerReassurance = $txt('footer_reassurance', 'Réponse sous 24 h · Port-de-Paix — Sofia');

// Réseaux : settings.socials (si renseignés) sinon liens de profil de l'API.
$socials = is_array($settings['socials'] ?? null) ? $settings['socials'] : [];

$teaser = $upcoming[0] ?? null;
$single = $released[0] ?? null;
$countdownIso = $teaser['countdown_to'] ?? null;

// Agenda : à venir (ordre croissant) + passés récents.
usort($events, fn ($a, $b) => strcmp((string) ($a['starts_at'] ?? ''), (string) ($b['starts_at'] ?? '')));
$nowIso = gmdate('c');
$eventsUpcoming = array_values(array_filter($events, fn ($e) => (string) ($e['starts_at'] ?? '') >= $nowIso));
$eventsPast = array_reverse(array_values(array_filter($events, fn ($e) => (string) ($e['starts_at'] ?? '') < $nowIso)));

if ($links === []) {
    $links = [
        ['platform' => 'tiktok', 'url' => 'https://www.tiktok.com/@dx5thenigma'],
        ['platform' => 'youtube', 'url' => 'https://youtube.com/@dx-5thenigma'],
        ['platform' => 'instagram', 'url' => 'https://www.instagram.com/dx5thenigma'],
        ['platform' => 'facebook', 'url' => 'https://www.facebook.com/dx5thenigma'],
    ];
}

$platformLabel = [
    'tiktok' => 'TikTok', 'youtube' => 'YouTube', 'instagram' => 'Instagram',
    'facebook' => 'Facebook', 'spotify' => 'Spotify', 'bandcamp' => 'Bandcamp',
    'apple' => 'Apple Music', 'deezer' => 'Deezer', 'audiomack' => 'Audiomack',
];

$e = static fn ($v): string => htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');

// Date lisible d'un événement (dans le fuseau du lieu).
$eventDate = static function (array $ev) use ($e): string {
    if (empty($ev['starts_at'])) {
        return '';
    }
    try {
        $dt = new DateTime((string) $ev['starts_at']);
        $dt->setTimezone(new DateTimeZone((string) ($ev['timezone'] ?? 'UTC')));

        return $e($dt->format('d/m/Y'));
    } catch (Throwable) {
        return $e(substr((string) $ev['starts_at'], 0, 10));
    }
};
?>
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= $e($brand) ?> — Rap &amp; écriture, d'Haïti au monde</title>
<meta name="description" content="Site officiel de <?= $e($brand) ?>. Le signal vient d'Haïti — déchiffrez l'énigme.">
<meta property="og:title" content="<?= $e($brand) ?> — L'Énigme">
<meta property="og:description" content="Le signal vient d'Haïti. Déchiffrez l'énigme.">
<meta property="og:type" content="website">
<link rel="stylesheet" href="assets/styles.css">
</head>
<body data-intensity="<?= $e($intensity) ?>">

<?php if ($teaser === null && $single === null && $settings === []): ?>
<p class="degraded" role="status">Le signal se met en place — revenez dans un instant.</p>
<?php endif; ?>

<header class="top">
  <span class="wordmark"><?= $e($brand) ?></span>
  <a class="top-cta" href="#signal">Être prévenu·e</a>
</header>

<main>
<!-- ═══ 1 · LE SIGNAL (accroche + compte à rebours) — pilotés Dashboard ═══ -->
<section class="hero" id="signal">
  <p class="kicker"><?= $e($kicker) ?></p>
  <h1 class="hero-title"><?= nl2br($e($heroHeadline)) ?></h1>

  <?php if ($teaser !== null):
      $titleRevealed = $teaser['title'] && stripos((string) $teaser['title'], 'à annoncer') === false;
      $typeLabel = ($teaser['type'] ?? '') === 'album' ? 'L\'album' : ucfirst((string) ($teaser['type'] ?? 'La sortie'));
  ?>
    <p class="hero-sub">
      <?php if ($titleRevealed): ?>
        <?= $e($typeLabel) ?> <strong><?= $e($teaser['title']) ?></strong><?= $teaser['subtitle'] ? ' — '.$e($teaser['subtitle']) : '' ?>. Révélation dans&nbsp;:
      <?php else: ?>
        <?= $e($typeLabel) ?> se déverrouille dans&nbsp;:
      <?php endif; ?>
    </p>

    <?php if ($countdownIso !== null): ?>
    <div class="countdown" id="countdown" data-target="<?= $e($countdownIso) ?>" aria-live="polite">
      <div class="cd-unit"><span class="cd-num" data-d>—</span><span class="cd-lab">jours</span></div>
      <div class="cd-sep">:</div>
      <div class="cd-unit"><span class="cd-num" data-h>—</span><span class="cd-lab">heures</span></div>
      <div class="cd-sep">:</div>
      <div class="cd-unit"><span class="cd-num" data-m>—</span><span class="cd-lab">min</span></div>
      <div class="cd-sep">:</div>
      <div class="cd-unit"><span class="cd-num" data-s>—</span><span class="cd-lab">sec</span></div>
    </div>
    <?php endif; ?>
  <?php elseif ($single !== null): ?>
    <p class="hero-sub">Nouveau single <strong><?= $e($single['title']) ?></strong> — en écoute maintenant.</p>
  <?php endif; ?>

  <form class="signal-form" id="signalForm" action="api/newsletter.php" method="post" novalidate>
    <label class="sr-only" for="email">Votre adresse e-mail</label>
    <input type="email" id="email" name="email" placeholder="votre e-mail" required autocomplete="email">
    <button type="submit">Capter le signal</button>
  </form>
  <p class="signal-note" id="signalNote" role="status"><?= $e($newsletterNote) ?></p>
</section>

<!-- ═══ 2 · BLOCS DE CONTENU (les « clés ») — pilotés Dashboard ═══ -->
<?php if ($blocks !== []): ?>
<section class="keys">
  <p class="kicker center"><?= $e($blocksKicker) ?></p>
  <div class="keys-grid">
    <?php foreach (array_values($blocks) as $i => $b): ?>
      <article class="key">
        <span class="key-meta">CLÉ <?= str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) ?></span>
        <h3><?= $e($b['title'] ?? '') ?></h3>
        <p><?= $e($b['text'] ?? '') ?></p>
      </article>
    <?php endforeach; ?>
  </div>
</section>
<?php endif; ?>

<!-- ═══ 3 · VETERAN (single publié) ═══ -->
<?php if ($single !== null):
    $clip = null;
    foreach (($single['streaming_links'] ?? []) as $l) {
        if (($l['platform'] ?? '') === 'youtube') { $clip = $l['url']; break; }
    }
    $clip ??= 'https://youtube.com/@dx-5thenigma';
?>
<section class="veteran">
  <div class="veteran-body">
    <p class="kicker">LE DERNIER SIGNAL CAPTÉ</p>
    <h2><?= $e($single['title']) ?></h2>
    <p class="veteran-desc"><?= $e($single['description'] ?: 'Nouveau single et clip officiel.') ?></p>
    <a class="btn" href="<?= $e($clip) ?>" target="_blank" rel="noopener">Voir le clip ↗</a>
  </div>
  <?php if (! empty($single['cover']['url'])): ?>
    <div class="veteran-cover"><img src="<?= $e($single['cover']['url']) ?>" alt="<?= $e($single['cover']['alt'] ?: ('Pochette '.$single['title'])) ?>" loading="lazy"></div>
  <?php endif; ?>
</section>
<?php endif; ?>

<!-- ═══ 4 · AGENDA (événements — piloté Dashboard) ═══ -->
<?php if ($eventsUpcoming !== [] || $eventsPast !== []): ?>
<section class="agenda">
  <p class="kicker center">SUR SCÈNE</p>
  <div class="agenda-list">
    <?php foreach (array_slice(array_merge($eventsUpcoming, $eventsPast), 0, 6) as $ev):
        $past = (string) ($ev['starts_at'] ?? '') < $nowIso;
    ?>
      <div class="agenda-row<?= $past ? ' past' : '' ?>">
        <span class="agenda-date"><?= $eventDate($ev) ?></span>
        <span class="agenda-title"><?= $e($ev['title'] ?? '') ?></span>
        <span class="agenda-place"><?= $e(trim(($ev['city'] ?? '').' '.($ev['country'] ?? ''))) ?></span>
        <?php if (($ev['ticket_mode'] ?? '') === 'external' && ! empty($ev['ticket_url'])): ?>
          <a class="agenda-ticket" href="<?= $e($ev['ticket_url']) ?>" target="_blank" rel="noopener">Billets ↗</a>
        <?php elseif ($past): ?>
          <span class="agenda-ticket dim">passé</span>
        <?php else: ?>
          <span class="agenda-ticket dim">à venir</span>
        <?php endif; ?>
      </div>
    <?php endforeach; ?>
  </div>
</section>
<?php endif; ?>

<!-- ═══ 5 · PLATEFORMES ═══ -->
<section class="platforms">
  <p class="kicker center">SUIVRE LE SIGNAL</p>
  <nav class="platform-links">
    <?php
    $renderLinks = $socials !== [] ? array_map(fn ($s) => ['platform' => $s['label'] ?? '', 'url' => $s['url'] ?? '#'], $socials) : $links;
    foreach ($renderLinks as $l): $p = (string) ($l['platform'] ?? '');
    ?>
      <a href="<?= $e((string) ($l['url'] ?? '#')) ?>" target="_blank" rel="noopener"><?= $e($platformLabel[$p] ?? ucfirst($p)) ?> ↗</a>
    <?php endforeach; ?>
  </nav>
</section>
</main>

<footer class="foot">
  <p class="foot-kicker"><?= $e($footerKicker) ?></p>
  <a class="foot-mail" href="mailto:<?= $e($contactEmail) ?>"><?= $e($contactEmail) ?></a>
  <p class="foot-reassure"><?= $e($footerReassurance) ?></p>
  <p class="foot-bottom">© <?= date('Y') ?> <?= $e(strtoupper($brand)) ?> · Site propulsé par HBEXIUM</p>
</footer>

<script src="assets/app.js" defer></script>
</body>
</html>

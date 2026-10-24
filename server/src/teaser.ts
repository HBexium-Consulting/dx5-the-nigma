import type { DB } from './db.ts';
import { upcomingReleases } from './embargo.ts';

const esc = (s: unknown): string =>
  String(s ?? '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]!));

export function teaserBySlug(db: DB, slug: string): any | undefined {
  return upcomingReleases(db).find((r) => r.slug === slug);
}

const HEADER = `<header class="top">
  <a class="wordmark" href="/" title="Accueil"><img class="brand-logo" src="/assets/logo.png" alt="DX-5 The Nigma"></a>
  <nav class="top-nav" aria-label="Navigation principale">
    <a class="nav-link mono active" href="/bibliotheque/" aria-current="page">BIBLIOTHÈQUE</a>
    <a class="nav-link mono" href="/agenda/">AGENDA</a>
    <a class="nav-link mono" href="/ecrits/">ÉCRITS</a>
    <a class="nav-link mono" href="/a-propos/">À PROPOS</a>
    <a class="nav-link mono" href="/pro/">PRO</a>
    <a class="nav-link mono" href="/contact/">CONTACT</a>
  </nav>
  <a class="nav-cta mono" href="/bibliotheque/#discographie">ÉCOUTER</a>
</header>`;

const FOOTER = `<footer class="foot">
  <nav class="foot-links mono" aria-label="Pied de page">
    <a href="/">ACCUEIL</a><a href="/bibliotheque/">BIBLIOTHÈQUE</a><a href="/soutenir/">LE CERCLE</a><a href="/suivre/">SUIVRE PARTOUT</a><a href="/mentions-legales/">MENTIONS LÉGALES</a>
  </nav>
  <p class="mono ash">© 2026 DX-5 THE NIGMA — PORT-DE-PAIX · SOFIA</p>
</footer>`;

const TYPE: Record<string, string> = { single: 'SINGLE', album: 'ALBUM', ep: 'EP', mixtape: 'MIXTAPE' };

/** Page « à venir » d'une sortie programmée : compte à rebours ROUGE + infos
 *  projet révélées au scroll. Contenu depuis la base (teaser, embargo respecté). */
export function renderTeaser(rel: any): string {
  const typeLabel = TYPE[rel.type] || 'SORTIE';
  const cover = rel.cover_path as string | null;
  const dateIso = rel.published_at as string;
  const relDate = rel.release_date as string | null;
  const desc = (rel.description as string | null)?.trim();
  const title = esc(rel.title);

  const coverBg = cover
    ? `<div class="th-bg" style="background-image:url('${esc(cover)}')"></div>`
    : `<div class="th-bg th-bg--none"></div>`;
  const coverArt = cover
    ? `<div class="th-art"><img src="${esc(cover)}" alt="${title}"><span class="th-lock" aria-hidden="true">🔒</span></div>`
    : `<div class="th-art th-art--none"><span aria-hidden="true">◇</span><span class="th-lock" aria-hidden="true">🔒</span></div>`;

  const project = desc
    ? `<p class="lead">${esc(desc)}</p>`
    : `<p class="lead ash">Les informations sur ce projet seront dévoilées avant le déverrouillage. Restez à l'écoute du signal.</p>`;

  return `<!doctype html>
<html lang="fr" class="is-pg">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} — à venir · DX-5 The Nigma</title>
<meta name="description" content="${title} — sortie programmée de DX-5 The Nigma, bientôt dévoilée.">
<link rel="stylesheet" href="/assets/site.css">
<link rel="stylesheet" href="/bibliotheque/styles.css">
<link rel="stylesheet" href="/assets/hbx-player.css">
</head>
<body>
${HEADER}
<main>
  <section class="th-hero">
    ${coverBg}
    <div class="th-hero-in">
      <a class="mono th-back" href="/bibliotheque/#album">← PROCHAINES SORTIES</a>
      ${coverArt}
      <div class="th-head">
        <span class="mono kicker">${typeLabel} — À VENIR · SOUS EMBARGO</span>
        <h1><span data-scramble>${title}</span></h1>
        <div class="th-count" data-date="${esc(dateIso)}" role="timer" aria-live="off"></div>
        <span class="mono ash th-when"></span>
      </div>
    </div>
  </section>

  <section class="th-info">
    <div class="rv th-block">
      <h2 data-scramble>Le projet</h2>
      ${project}
    </div>
    <div class="rv th-meta">
      <dl>
        <div><dt class="mono ash">FORMAT</dt><dd>${typeLabel}</dd></div>
        <div><dt class="mono ash">DÉVERROUILLAGE</dt><dd class="th-rd"></dd></div>
        ${relDate ? `<div><dt class="mono ash">DATE DE SORTIE</dt><dd>${esc(relDate)}</dd></div>` : ''}
        <div><dt class="mono ash">STATUT</dt><dd class="hot">SOUS EMBARGO</dd></div>
      </dl>
    </div>
    <div class="rv th-note">
      <p class="mono ash">Le contenu reste scellé jusqu'au compte à rebours. À l'échéance, la sortie se déverrouille automatiquement dans la bibliothèque.</p>
      <a class="btn" href="/suivre/">ÊTRE PRÉVENU — SUIVRE L'ÉNIGME →</a>
    </div>
  </section>
</main>
${FOOTER}
<script src="/assets/hbx-player.js"></script>
<script src="/assets/fx.js"></script>
<script src="/assets/nav.js"></script>
<script>
(function () {
  var fmt = function (iso) { try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch (e) { return ''; } };
  var el = document.querySelector('.th-count');
  var when = document.querySelector('.th-when');
  var rd = document.querySelector('.th-rd');
  if (!el) return;
  var iso = el.getAttribute('data-date');
  var d = fmt(iso);
  if (when) when.textContent = 'DÉVERROUILLAGE LE ' + d.toUpperCase();
  if (rd) rd.textContent = d;
  var cell = function (v, l) { return '<span class="cc"><b>' + String(v).padStart(2, '0') + '</b><i>' + l + '</i></span>'; };
  var tick = function () {
    var diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) { el.innerHTML = '<span class="th-live">DISPONIBLE MAINTENANT</span>'; return; }
    var dd = Math.floor(diff / 864e5), hh = Math.floor(diff / 36e5) % 24, mm = Math.floor(diff / 6e4) % 60, ss = Math.floor(diff / 1e3) % 60;
    el.innerHTML = cell(dd, 'JOURS') + cell(hh, 'HEURES') + cell(mm, 'MIN') + cell(ss, 'SEC');
  };
  tick(); setInterval(tick, 1000);
})();
</script>
</body>
</html>`;
}

/* Bibliothèque DX-5 — rendu de la page (ré-exécutable après chaque
   navigation sans rechargement). La lecture vit dans la couche
   persistante HBX (/assets/hbx-player.js), les effets dans HBXFX
   (/assets/fx.js) : ici on ne fait que CONSTRUIRE le contenu. */
(() => {
  const GLYPHS = '█▓▒░#&@%$§ØΔX15−/\\|<>*';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.initBib = function initBib() {
    const list = document.getElementById('trackList');
    if (!list || !window.LIB) return;

    /* ── discographie ── */
    list.innerHTML = window.LIB.tracks.map((t, i) =>
      '<li class="track">' +
      `<span class="t-idx">${String(i + 1).padStart(2, '0')}</span>` +
      `<button class="t-play" data-i="${i}" aria-label="Écouter l'extrait de ${t.n}">▶</button>` +
      `<span class="t-name"><span data-scramble>${t.n}</span>` +
      (t.badge ? ` <span class="badge gold mono">${t.badge}</span>` : '') +
      (t.feat ? ` <span class="t-feat">${t.feat}</span>` : '') + '</span>' +
      `<button class="t-full mono" data-yt="${t.yt}" data-name="${t.n}" aria-label="Écouter ${t.n} en entier dans le lecteur du site">EN ENTIER ▸</button>` +
      '<span class="t-dur">EXTRAIT 0:30</span>' +
      '</li>').join('');
    if (window.HBX) window.HBX.paint();

    /* ── sorties programmées (teasers + compte à rebours), pilotées par le Dashboard ── */
    const section = document.getElementById('album');
    const up = document.getElementById('upcoming');
    const list2 = window.LIB.upcoming || [];
    clearInterval(window.__countIv);
    if (!up) { /* rien */ }
    else if (!list2.length) {
      section.hidden = true;
      up.innerHTML = '';
    } else {
      section.hidden = false;
      const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return ''; } };
      const typeLabel = (t) => ({ single: 'SINGLE', album: 'ALBUM', ep: 'EP', mixtape: 'MIXTAPE' }[t] || 'SORTIE');
      up.innerHTML = list2.map((r, i) =>
        `<article class="up-card">` +
        '<div class="up-cover">' +
        (r.cover ? `<img src="${r.cover}" alt="${r.title}" loading="lazy">` : '<span class="up-noart" aria-hidden="true">◇</span>') +
        '<span class="up-lock" aria-hidden="true">🔒</span></div>' +
        '<div class="up-body">' +
        `<span class="mono kicker">${typeLabel(r.type)} — À VENIR</span>` +
        `<h3><span data-scramble>${r.title}</span></h3>` +
        `<div class="up-count" data-date="${r.date}" role="timer" aria-live="off"></div>` +
        `<span class="mono ash up-when">DÉVERROUILLAGE LE ${fmtDate(r.date).toUpperCase()}</span>` +
        (r.slug ? `<a class="up-more mono" href="/a-venir/${r.slug}">VOIR PLUS →</a>` : '') +
        '</div></article>').join('');

      const tick = () => {
        if (document.hidden || !document.contains(up)) return;
        up.querySelectorAll('.up-count').forEach((el) => {
          const diff = new Date(el.dataset.date).getTime() - Date.now();
          if (diff <= 0) { el.innerHTML = '<span class="up-live">DISPONIBLE MAINTENANT</span>'; return; }
          const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
            m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
          const cell = (v, l) => `<span class="cc"><b>${String(v).padStart(2, '0')}</b><i>${l}</i></span>`;
          el.innerHTML = cell(d, 'JOURS') + cell(h, 'H') + cell(m, 'MIN') + cell(s, 'SEC');
        });
      };
      tick();
      if (!reduced) window.__countIv = setInterval(tick, 1000);
    }

    /* ── vidéothèque (façades locales, iframe au clic — géré par HBX) ── */
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const facade = (v) =>
      '<div class="vid">' +
      `<button class="facade" data-id="${v.id}" aria-label="Lire la vidéo : ${v.t}">` +
      `<img src="/bibliotheque/thumbs/${v.id}.jpg" alt="" loading="lazy" width="480" height="270">` +
      (v.badge ? `<span class="f-badge ${v.badge === 'LIVE' ? 'red-b' : 'gold-b'}">${v.badge}</span>` : '') +
      '<span class="f-play" aria-hidden="true">▶</span></button>' +
      `<span class="v-title">${v.t}</span><span class="v-meta">${v.meta}</span></div>`;
    // Vidéos pilotées par le Dashboard (module « Vidéos ») : miniature YouTube,
    // lecture via l'API YouTube (data-id = youtube_id → compte comme une vue YT).
    const facadeYt = (v) =>
      '<div class="vid">' +
      `<button class="facade" data-id="${esc(v.yt)}" aria-label="Lire la vidéo : ${esc(v.title)}">` +
      `<img src="${esc(v.thumb || ('https://img.youtube.com/vi/' + v.yt + '/hqdefault.jpg'))}" alt="" loading="lazy" width="480" height="270">` +
      '<span class="f-play" aria-hidden="true">▶</span></button>' +
      `<span class="v-title">${esc(v.title)}</span><span class="v-meta">${esc(v.description || '')}</span></div>`;
    // Vidéos du module « Vidéos » du Dashboard, RÉPARTIES PAR RUBRIQUE :
    //  - « Live & interview » (category.slug === 'live') → grille Live & interviews ;
    //  - « Clip officiel » (slug 'clip') OU non classée → grille Clips officiels.
    // Repli sur les clips/live curatés (scène, legacy) si une rubrique n'a
    // aucune vidéo Dashboard — aucune régression si le module est vide.
    const dashVideos = (window.LIB.videos || []).filter((v) => v && v.yt);
    const dashLive = dashVideos.filter((v) => v.category && v.category.slug === 'live');
    const dashClips = dashVideos.filter((v) => !(v.category && v.category.slug === 'live'));
    document.getElementById('clipGrid').innerHTML = dashClips.length
      ? dashClips.map(facadeYt).join('')
      : (window.LIB.clips || []).map(facade).join('');
    document.getElementById('liveGrid').innerHTML = dashLive.length
      ? dashLive.map(facadeYt).join('')
      : (window.LIB.live || []).map(facade).join('');

    /* ── Lecteur Spotify (lien artiste piloté par le Dashboard) ── */
    const spUrl = window.LIB.spotify;
    const spHost = document.getElementById('spotifyEmbed');
    const spBlock = document.getElementById('spotify-block');
    if (spUrl && spHost) {
      const m = String(spUrl).match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(artist|album|track|playlist)\/([A-Za-z0-9]+)/);
      if (m) {
        const f = document.createElement('iframe');
        f.src = `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
        f.width = '100%'; f.height = '352'; f.loading = 'lazy';
        f.style.cssText = 'border:0;border-radius:12px';
        f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        f.setAttribute('allowfullscreen', '');
        spHost.innerHTML = ''; spHost.appendChild(f);
        if (spBlock) spBlock.hidden = false;
      }
    }
  };
})();

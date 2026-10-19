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

    /* ── l'album chiffré ── */
    const vault = document.getElementById('vault');
    const cipher = () => Array.from({ length: 9 }, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]).join('');
    vault.innerHTML = Array.from({ length: 12 }, (_, i) =>
      `<li class="vcell"><span class="v-key">CLÉ ${String(i + 1).padStart(2, '0')}</span>` +
      `<div class="v-code" aria-hidden="true">${cipher()}</div></li>`).join('');
    clearInterval(window.__vaultIv);
    if (!reduced) {
      const cells = [...vault.querySelectorAll('.v-code')];
      window.__vaultIv = setInterval(() => {
        if (document.hidden || !document.contains(vault)) return;
        cells[(Math.random() * cells.length) | 0].textContent = cipher();
      }, 260);
    }

    /* ── vidéothèque (façades locales, iframe au clic — géré par HBX) ── */
    const facade = (v) =>
      '<div class="vid">' +
      `<button class="facade" data-id="${v.id}" aria-label="Lire la vidéo : ${v.t}">` +
      `<img src="/bibliotheque/thumbs/${v.id}.jpg" alt="" loading="lazy" width="480" height="270">` +
      (v.badge ? `<span class="f-badge ${v.badge === 'LIVE' ? 'red-b' : 'gold-b'}">${v.badge}</span>` : '') +
      '<span class="f-play" aria-hidden="true">▶</span></button>' +
      `<span class="v-title">${v.t}</span><span class="v-meta">${v.meta}</span></div>`;
    document.getElementById('clipGrid').innerHTML = window.LIB.clips.map(facade).join('');
    document.getElementById('liveGrid').innerHTML = window.LIB.live.map(facade).join('');
  };
})();

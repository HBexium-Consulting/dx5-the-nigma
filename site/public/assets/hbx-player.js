/* ── Couche lecteur persistante du site ──
   Vit HORS du contenu swappé par le routeur. Sur les rechargements
   complets (accueil immersif ↔ site intérieur), une PASSATION restaure
   la lecture à la seconde près ; si le navigateur bloque la reprise
   sonore automatique, le dock affiche « ▶ REPRENDRE ». Singleton. */
(() => {
  if (window.HBX) return;
  const STORE = 'hbx-playback';

  /* barre lecteur : adoptée si présente dans le HTML, sinon créée */
  let bar = document.getElementById('player');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'player';
    bar.className = 'player hbx-off';
    bar.setAttribute('aria-label', 'Lecteur audio');
    bar.innerHTML =
      '<button class="pbtn" id="btnPrev" aria-label="Titre précédent">⏮</button>' +
      '<button class="pbtn main" id="btnPlay" aria-label="Lecture / pause">▶</button>' +
      '<button class="pbtn" id="btnNext" aria-label="Titre suivant">⏭</button>' +
      '<div class="pmeta"><div class="ptitle"><span id="pTrack">—</span> ' +
      '<span class="badge" id="pBadge">EXTRAIT 30 S</span></div>' +
      '<div class="pbar" id="pBar" role="slider" aria-label="Position de lecture" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">' +
      '<div class="pfill" id="pFill"></div></div></div>' +
      '<span class="ptime" id="pTime">0:00 / 0:00</span>';
    document.body.appendChild(bar);
  }
  const $ = (id) => document.getElementById(id);

  const audio = new Audio();
  audio.preload = 'none';
  let cur = -1, ctx = null, analyser = null, fdata = null;

  function graph() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaElementSource(audio);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    fdata = new Uint8Array(analyser.frequencyBinCount);
    src.connect(analyser); analyser.connect(ctx.destination);
  }

  const fmt = (s) => isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : '0:00';
  const tracks = () => (window.LIB && window.LIB.tracks) || [];

  function paint() {
    document.querySelectorAll('.track').forEach((el, i) => el.classList.toggle('active', i === cur));
    document.querySelectorAll('.t-play').forEach((b, i) => { b.textContent = (i === cur && !audio.paused) ? '❚❚' : '▶'; });
    $('btnPlay').textContent = audio.paused ? '▶' : '❚❚';
    if (cur >= 0 && tracks()[cur]) $('pTrack').textContent = tracks()[cur].n;
  }

  function reveal() {
    bar.classList.remove('hbx-off');
    bar.classList.add('lit');
    clearTimeout(reveal.t);
    reveal.t = setTimeout(() => bar.classList.remove('lit'), 2600);
  }

  function playExtrait(i, at) {
    graph();
    if (ctx.state === 'suspended') ctx.resume();
    reveal();
    if (i === cur && at === undefined) { audio.paused ? audio.play() : audio.pause(); paint(); return; }
    cur = i;
    audio.src = tracks()[i].src;
    if (at) audio.currentTime = at;
    audio.play().catch(() => {});   // bloqué → l'utilisateur relance depuis la barre
    paint();
  }

  $('btnPlay').addEventListener('click', () => { cur < 0 ? playExtrait(0) : playExtrait(cur); });
  $('btnNext').addEventListener('click', () => playExtrait(cur < 0 ? 0 : (cur + 1) % tracks().length));
  $('btnPrev').addEventListener('click', () => playExtrait(cur < 0 ? 0 : (cur - 1 + tracks().length) % tracks().length));
  audio.addEventListener('ended', () => playExtrait((cur + 1) % tracks().length));
  audio.addEventListener('play', paint);
  audio.addEventListener('pause', paint);
  audio.addEventListener('timeupdate', () => {
    const p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    $('pFill').style.width = p + '%';
    $('pBar').setAttribute('aria-valuenow', Math.round(p));
    $('pTime').textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });
  $('pBar').addEventListener('click', (e) => {
    if (!audio.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });
  $('pBar').addEventListener('keydown', (e) => {
    if (!audio.duration) return;
    if (e.key === 'ArrowRight') audio.currentTime += 5;
    if (e.key === 'ArrowLeft') audio.currentTime -= 5;
  });

  /* ── lecteur YouTube docké (titres complets ET clips) ── */
  let ytPlayer = null, ytReady = null, dock = null, dockMeta = null;
  function ensureAPI() {
    if (ytReady) return ytReady;
    ytReady = new Promise((res) => {
      window.onYouTubeIframeAPIReady = () => res();
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(s);
    });
    return ytReady;
  }
  function buildDock() {
    dock = document.createElement('aside');
    dock.className = 'ytdock';
    dock.setAttribute('aria-label', 'Lecteur vidéo du site');
    dock.innerHTML =
      '<div class="ytdock-bar"><span class="mono" id="ytTitle"></span><span>' +
      '<a class="mono yt-ext" id="ytExt" target="_blank" rel="noopener">YOUTUBE ↗</a>' +
      '<button class="yt-close" id="ytClose" aria-label="Fermer le lecteur">✕</button>' +
      '</span></div><div class="ytwrap"><div id="ytHost"></div>' +
      '<button class="yt-resume hidden" id="ytResume">▶ REPRENDRE</button></div>';
    document.body.appendChild(dock);
    $('ytClose').addEventListener('click', () => {
      if (ytPlayer) { ytPlayer.destroy(); ytPlayer = null; }
      dock.remove(); dock = null; dockMeta = null;
      save();
    });
    $('ytResume').addEventListener('click', () => {
      $('ytResume').classList.add('hidden');
      if (ytPlayer) { ytPlayer.unMute && ytPlayer.unMute(); ytPlayer.playVideo(); }
    });
  }
  async function playFull(id, name, at) {
    audio.pause();
    if (!dock) buildDock();
    dockMeta = { id, name };
    $('ytTitle').textContent = name;
    $('ytExt').href = 'https://www.youtube.com/watch?v=' + id;
    await ensureAPI();
    if (ytPlayer) ytPlayer.loadVideoById({ videoId: id, startSeconds: at || 0 });
    else {
      ytPlayer = new YT.Player('ytHost', {
        host: 'https://www.youtube-nocookie.com',
        videoId: id, width: '100%', height: '100%',
        playerVars: { autoplay: 1, rel: 0, start: Math.floor(at || 0) },
        events: {
          onStateChange: (e) => { if (e.data === YT.PlayerState.PLAYING) { audio.pause(); $('ytResume').classList.add('hidden'); } }
        }
      });
      /* reprise bloquée par la politique d'autoplay → proposer un geste */
      setTimeout(() => {
        if (ytPlayer && ytPlayer.getPlayerState &&
            [YT.PlayerState.UNSTARTED, YT.PlayerState.CUED].includes(ytPlayer.getPlayerState())) {
          $('ytResume').classList.remove('hidden');
        }
      }, 2200);
    }
  }
  audio.addEventListener('play', () => { if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo(); });

  /* ── passation : sauvegarde continue, restauration au chargement ── */
  function save() {
    try {
      const st = {
        ext: cur >= 0 ? { i: cur, t: audio.currentTime, playing: !audio.paused } : null,
        full: dock && dockMeta ? {
          id: dockMeta.id, name: dockMeta.name,
          t: ytPlayer && ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0,
          playing: !!(ytPlayer && ytPlayer.getPlayerState && ytPlayer.getPlayerState() === 1)
        } : null
      };
      sessionStorage.setItem(STORE, JSON.stringify(st));
    } catch {}
  }
  setInterval(() => { if ((cur >= 0 && !audio.paused) || dock) save(); }, 1500);
  addEventListener('pagehide', save);

  function restore() {
    let st;
    try { st = JSON.parse(sessionStorage.getItem(STORE) || 'null'); } catch { return; }
    if (!st) return;
    if (st.ext && tracks()[st.ext.i]) {
      cur = st.ext.i;
      audio.src = tracks()[cur].src;
      audio.addEventListener('loadedmetadata', () => { audio.currentTime = st.ext.t || 0; }, { once: true });
      audio.load();
      $('pTrack').textContent = tracks()[cur].n;
      bar.classList.remove('hbx-off');
      if (st.ext.playing) { graph(); audio.play().then(paint).catch(() => { bar.classList.add('lit'); }); }
    }
    if (st.full) playFull(st.full.id, st.full.name, st.full.t);
  }

  /* clics délégués : discographie + façades vidéo → tout joue dans le dock */
  document.addEventListener('click', (e) => {
    const pl = e.target.closest('.t-play');
    if (pl) { playExtrait(+pl.dataset.i); return; }
    const fu = e.target.closest('.t-full');
    if (fu) { playFull(fu.dataset.yt, fu.dataset.name); return; }
    const f = e.target.closest('.facade');
    if (f) { playFull(f.dataset.id, f.getAttribute('aria-label').replace('Lire la vidéo : ', '')); }
  });

  /* sous-menus du header (délégué : survit aux swaps, sert toutes les pages) */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-more, .dock-more');
    const menus = document.querySelectorAll('.nav-menu, .dock-menu');
    if (btn) {
      const menu = btn.parentElement.querySelector('.nav-menu, .dock-menu');
      const open = menu && !menu.hasAttribute('hidden');
      menus.forEach((m) => m.setAttribute('hidden', ''));
      if (menu && !open) { menu.removeAttribute('hidden'); btn.setAttribute('aria-expanded', 'true'); }
      else btn.setAttribute('aria-expanded', 'false');
      e.stopPropagation();
      return;
    }
    if (!e.target.closest('.nav-sub')) menus.forEach((m) => m.setAttribute('hidden', ''));
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.nav-menu, .dock-menu').forEach((m) => m.setAttribute('hidden', ''));
  });

  window.HBX = {
    audio, playExtrait, playFull, paint,
    get analyser() { return analyser; },
    get fdata() { return fdata; },
    get cur() { return cur; },
    get hasDock() { return !!dock; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restore);
  else restore();
})();

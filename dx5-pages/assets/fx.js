/* ── Moteur d'effets unifié du site intérieur ──
   Une seule scène de fond « le signal » pour toutes les pages :
   mode 'pg' (anneau en veille, coin haut droit) ou mode 'bib'
   (anneau central, réactif au son via la couche lecteur HBX).
   Déchiffrement des titres + révélations, ré-exécutables après
   chaque navigation sans rechargement. */
(() => {
  if (window.HBXFX) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* ───── scène de fond ───── */
  let cv = document.getElementById('signal-bg');
  if (!cv) {
    cv = document.createElement('canvas');
    cv.id = 'signal-bg';
    cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
  }
  const g = cv.getContext('2d');
  let W, H, DPR, mode = 'pg';
  let scrollP = 0;
  addEventListener('scroll', () => { scrollP = scrollY; }, { passive: true });
  const size = () => {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * DPR; cv.height = H * DPR;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  size(); addEventListener('resize', size);

  const BARS = 72;
  function ring(t) {
    g.clearRect(0, 0, W, H);
    const bib = mode === 'bib';
    const cx = bib ? W / 2 : W * 0.8;
    const cy = bib ? H * 0.42 : H * 0.26;
    const sp = scrollP * 0.0016;                 // réactivité au scroll (pages is-pg)
    const base = Math.min(W, H) * (bib ? 0.17 : 0.24) * (1 + Math.sin(t / 2600) * 0.03 + (bib ? 0 : Math.sin(sp) * 0.06));
    const hbx = window.HBX;
    const live = bib && hbx && hbx.analyser && !hbx.audio.paused;
    if (live) hbx.analyser.getByteFrequencyData(hbx.fdata);
    let level = 0;
    if (live) { for (let i = 0; i < 24; i++) level += hbx.fdata[i]; level /= 24 * 255; }
    for (let i = 0; i < BARS; i++) {
      const a = (i / BARS) * Math.PI * 2 + (bib ? -Math.PI / 2 : t / 16000 + sp);
      let v = 0.07 + Math.abs(Math.sin(t / 1900 + i * 0.7)) * 0.05;
      if (live) {
        const bin = Math.floor(Math.pow(i / BARS, 1.6) * hbx.fdata.length * 0.82);
        v = hbx.fdata[bin] / 255;
      }
      const len = base * 0.1 + v * base * 0.85;
      const x1 = cx + Math.cos(a) * base, y1 = cy + Math.sin(a) * base;
      const x2 = cx + Math.cos(a) * (base + len), y2 = cy + Math.sin(a) * (base + len);
      g.strokeStyle = bib
        ? (v > 0.72 ? 'rgba(232, 199, 106, 0.85)' : `rgba(76, 194, 255, ${0.14 + v * 0.5})`)
        : `rgba(216, 35, 31, ${0.12 + v * 0.52})`;   /* is-pg : rouge, plus présent */
      g.lineWidth = bib ? 2 : 2;
      g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    }
    const r = base * (0.28 + level * 0.1);
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
    grad.addColorStop(0, bib ? `rgba(76, 194, 255, ${0.1 + level * 0.18})` : `rgba(216, 35, 31, ${0.16 + Math.abs(Math.sin(scrollP*0.0016)) * 0.14})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = grad;
    g.beginPath(); g.arc(cx, cy, r * 2.5, 0, Math.PI * 2); g.fill();
  }
  if (reduced) ring(0);
  else (function loop(t) { ring(t || 0); requestAnimationFrame(loop); })(0);

  /* ───── déchiffrement ───── */
  const GLYPHS = '█▓▒░#&@%$§ØΔX15−/\\|<>*';
  function scramble(el) {
    const final = el.textContent;
    if (!final.trim()) return;
    let f = 0;
    const total = Math.max(12, final.length * 1.5);
    (function step() {
      f++;
      const done = Math.floor((f / total) * final.length);
      el.textContent = final.slice(0, done) +
        [...final.slice(done)].map((c) => (c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (done < final.length) requestAnimationFrame(step);
      else el.textContent = final;
    })();
  }
  function units(h) {
    const out = [];
    [...h.childNodes].forEach((n) => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const s = document.createElement('span');
        n.replaceWith(s); s.textContent = n.textContent;
        out.push(s);
      } else if (n.nodeType === 1 && !n.children.length && n.textContent.trim()) {
        out.push(n);
      }
    });
    return out;
  }

  /* ───── révélations + déchiffrement, appliqués à une racine ───── */
  function animate(root) {
    if (reduced || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    root.querySelectorAll('.card, .piece, .fragment, .banner, .chip, .foot-links, .track, .vcell, .vid').forEach((el) => {
      if (el.classList.contains('rv')) return;
      el.classList.add('rv');
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('rv'));
      el.style.transitionDelay = Math.min(sibs.indexOf(el) * 55, 500) + 'ms';
      io.observe(el);
    });
    const hio = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { units(e.target).forEach(scramble); hio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    root.querySelectorAll('h1, h2, .kicker, [data-scramble]').forEach((h) => hio.observe(h));
  }

  /* ───── formulaires & porte pro (délégués : survivent aux swaps) ───── */
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'gateForm') {
      e.preventDefault();
      const v = (document.getElementById('gateCode') || {}).value || '';
      if (v.trim().toUpperCase() === 'DX5') { sessionStorage.setItem('dx5pro', '1'); proReveal(); }
      else document.getElementById('gateErr')?.classList.remove('hidden');
    }
    if (f.id === 'bookingForm') { e.preventDefault(); document.getElementById('bookingOk')?.classList.remove('hidden'); }
    if (f.id === 'contactForm') { e.preventDefault(); document.getElementById('contactOk')?.classList.remove('hidden'); }
  });
  function proReveal() {
    const gate = document.getElementById('gate'), content = document.getElementById('proContent');
    if (gate && content && sessionStorage.getItem('dx5pro') === '1') {
      gate.classList.add('hidden'); content.classList.remove('hidden');
    }
  }

  /* ───── initialisation d'une page (chargement dur OU swap) ───── */
  function initPage() {
    mode = document.documentElement.classList.contains('is-bib') ? 'bib' : 'pg';
    if (reduced) ring(0);
    proReveal();
    if (window.initBib && mode === 'bib') window.initBib();   // construire AVANT d'animer
    animate(document.querySelector('main') || document.body);
  }

  window.HBXFX = { initPage, animate, scramble };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage);
  else initPage();
})();

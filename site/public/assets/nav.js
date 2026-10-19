/* ── Routeur sans rechargement du site intérieur ──
   Seul <main> est remplacé : la couche lecteur (extrait + YouTube docké)
   continue de jouer pendant la navigation. L'accueil immersif (« / »)
   garde son moteur propre : rechargement complet, exclu du routeur. */
(() => {
  if (window.HBXNAV) return;
  const INNER = new Set(['bibliotheque', 'a-propos', 'agenda', 'ecrits', 'pro', 'contact',
    'boutique', 'soutenir', 'actualites', 'mentions-legales', 'confidentialite']);
  // préfixe d'hébergement (ex. GitHub Pages : /dx5-the-nigma) — vide sur le domaine final
  const BASE = ((document.querySelector('meta[name="hbx-base"]') || {}).content || '').replace(/\/$/, '');
  const seg = (path) => ((BASE && path.startsWith(BASE + '/') ? path.slice(BASE.length) : path).split('/')[1] || '');
  const isInner = (url) => url.origin === location.origin && INNER.has(seg(url.pathname));

  function setActive(path) {
    document.querySelectorAll('.nav-link').forEach((a) => {
      const on = seg(new URL(a.href, location.origin).pathname) === seg(path) && a.closest('.top-nav');
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  async function go(path, hash, push) {
    let doc;
    try {
      const res = await fetch(path, { headers: { 'X-HBX-Nav': '1' } });
      if (!res.ok) throw new Error(res.status);
      doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    } catch { location.href = path + (hash || ''); return; }

    document.title = doc.title;
    const type = doc.documentElement.className.includes('is-bib') ? 'is-bib' : 'is-pg';
    document.documentElement.classList.remove('is-bib', 'is-pg');
    document.documentElement.classList.add(type);

    const next = document.importNode(doc.querySelector('main'), true);
    document.querySelector('main').replaceWith(next); // nouvel élément → l'animation d'entrée rejoue

    if (push) history.pushState({ hbx: 1 }, '', path + (hash || ''));
    setActive(path);
    window.HBXFX && window.HBXFX.initPage();
    const target = hash && document.querySelector(hash);
    if (target) target.scrollIntoView();
    else scrollTo(0, 0);
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (!isInner(url)) return;                                   // accueil & externes : navigation normale
    if (url.pathname === location.pathname && url.hash) return;  // ancre locale : défilement natif
    e.preventDefault();
    go(url.pathname, url.hash, true);
  });

  addEventListener('popstate', () => {
    if (INNER.has(seg(location.pathname))) go(location.pathname, location.hash, false);
    else location.reload();
  });

  history.replaceState({ hbx: 1 }, '', location.href);
  window.HBXNAV = true;
})();

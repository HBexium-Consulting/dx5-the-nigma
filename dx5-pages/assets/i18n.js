/* ── Multilingue FR / Créole (HT) / English ──
   Le français reste la langue de référence (contenu d'origine + télécommande
   Dashboard). Les deux autres langues sont des traductions statiques posées
   sur les éléments [data-hbx] (pages intérieures, déjà marqués pour le
   Dashboard — on réutilise ces mêmes clés) et [data-i18n] (nav/pied de page
   partagés + accueil, non couverts par le Dashboard).
   Avant toute traduction, on met en cache le texte d'ORIGINE (français) de
   chaque élément : revenir au français, ou changer à nouveau de langue,
   repart toujours de cette référence — jamais d'une traduction précédente. */
(() => {
  const LANG_KEY = 'dx5-lang';
  const LANGS = ['fr', 'ht', 'en'];
  const LABELS = { fr: 'FR', ht: 'HT', en: 'EN' };
  const NAMES = { fr: 'Français', ht: 'Kreyòl', en: 'English' };

  function getLang() {
    const v = localStorage.getItem(LANG_KEY);
    return LANGS.includes(v) ? v : 'fr';
  }
  function setLang(v) {
    try { localStorage.setItem(LANG_KEY, v); } catch { /* stockage indisponible */ }
  }

  function applyI18n() {
    const lang = getLang();
    document.documentElement.setAttribute('lang', lang);
    const dict = (window.I18N_DICT && window.I18N_DICT[lang]) || null;
    document.querySelectorAll('[data-hbx], [data-i18n]').forEach((el) => {
      if (el.dataset._origHtml == null) el.dataset._origHtml = el.innerHTML;
      if (lang === 'fr' || !dict) { el.innerHTML = el.dataset._origHtml; return; }
      const key = el.getAttribute('data-hbx') || el.getAttribute('data-i18n');
      const v = dict[key];
      el.innerHTML = v != null ? v : el.dataset._origHtml; // repli : français si traduction absente
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      // ex. data-i18n-attr="placeholder:contact.ph.0" — traduit un ATTRIBUT, pas le texte
      el.getAttribute('data-i18n-attr').split(';').forEach((pair) => {
        const [attr, key] = pair.split(':');
        if (!attr || !key) return;
        const cacheAttr = '_orig_' + attr;
        if (el.dataset[cacheAttr] == null) el.dataset[cacheAttr] = el.getAttribute(attr) || '';
        const v = dict && lang !== 'fr' ? dict[key] : null;
        el.setAttribute(attr, v != null ? v : el.dataset[cacheAttr]);
      });
    });

    // Accueil — manifeste (#fillText) et mots de la devise (.mw) : restructurés
    // au scroll par app.js (caractères éclatés), donc pas de simple innerHTML
    // générique ci-dessus — on passe par les hooks dédiés (content.js + app.js)
    // qui reposent le texte PUIS re-découpent/resynchronisent la scène.
    if (window.DX5_MANIFESTO) {
      const v = (lang !== 'fr' && dict && dict['home.manifesto.text']) || window.DX5_MANIFESTO.original;
      window.DX5_MANIFESTO.apply(v);
    }
    if (window.DX5_MOTTO) {
      const words = window.DX5_MOTTO.original.map((orig, i) => {
        const v = lang !== 'fr' && dict && dict['home.motto.' + i + '.word'];
        return v || orig;
      });
      window.DX5_MOTTO.apply(words);
    }
    if (window.__paintManifestoKeywords) window.__paintManifestoKeywords(lang);

    paintSwitcher();
  }

  let btn;
  function paintSwitcher() {
    if (!btn) return;
    const lang = getLang();
    btn.querySelector('.fcta-lang-code').textContent = LABELS[lang];
    btn.querySelector('.fcta-label').textContent = NAMES[lang];
    btn.setAttribute('aria-label', 'Changer de langue — actuellement ' + NAMES[lang]);
  }

  function mountSwitcher() {
    const stack = document.querySelector('.fcta-stack');
    if (!stack || document.querySelector('.fcta-lang')) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fcta fcta-lang';
    btn.innerHTML = '<span class="fcta-label"></span><span class="fcta-lang-code"></span>';
    btn.addEventListener('click', () => {
      const next = LANGS[(LANGS.indexOf(getLang()) + 1) % LANGS.length];
      setLang(next);
      applyI18n();
    });
    stack.insertBefore(btn, stack.firstChild);
    paintSwitcher();
  }

  // premier chargement : le bouton vit dans la pile injectée par floating-cta.js,
  // potentiellement pas encore montée au moment où ce script s'exécute.
  const tryMount = () => { mountSwitcher(); if (!btn) requestAnimationFrame(tryMount); };
  tryMount();
  applyI18n();

  // re-traduire après une navigation sans rechargement (routeur du site intérieur,
  // cf. nav.js) : on enchaîne sur le même point d'entrée que les autres re-inits.
  const prevInit = window.HBXFX && window.HBXFX.initPage;
  if (window.HBXFX) {
    window.HBXFX.initPage = function () { prevInit.apply(this, arguments); applyI18n(); };
  }

  window.DX5_I18N = { applyI18n, getLang, setLang };
})();

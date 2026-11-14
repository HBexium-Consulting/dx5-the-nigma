/* ── Boutons flottants : WhatsApp + Réserver l'artiste ──
   Injectés sur chaque page (accueil immersif, bibliothèque, pages intérieures).
   Numéro WhatsApp = celui déjà publié sur /contact/. Lien booking = /pro/
   (dossier presse + demande de booking, accès pro géré sur place). */
(() => {
  if (document.querySelector('.fcta-stack')) return;

  const THEME_KEY = 'dx5-theme';
  const sunIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v2a1 1 0 0 1-1 1zm0 14a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1zm9-7a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zM6 12a1 1 0 0 1-1 1H3a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1zm12.36-6.36a1 1 0 0 1 0 1.41l-1.42 1.42a1 1 0 1 1-1.41-1.41l1.41-1.42a1 1 0 0 1 1.42 0zM8.46 16.95a1 1 0 0 1 0 1.41l-1.41 1.42a1 1 0 1 1-1.42-1.42l1.42-1.41a1 1 0 0 1 1.41 0zm9.9 2.83a1 1 0 0 1-1.41 0l-1.42-1.42a1 1 0 1 1 1.42-1.41l1.41 1.41a1 1 0 0 1 0 1.42zM7.05 8.46a1 1 0 0 1-1.41 0L4.22 7.05a1 1 0 1 1 1.42-1.42l1.41 1.42a1 1 0 0 1 0 1.41zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/></svg>';
  const moonIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.64 13a9 9 0 1 1-10.63-10.6 1 1 0 0 1 1.11 1.45A7 7 0 0 0 20.2 11.9a1 1 0 0 1 1.45 1.1z"/></svg>';

  const applyTheme = (t) => document.documentElement.setAttribute('data-theme', t);
  const themeBtn = document.createElement('button');
  themeBtn.type = 'button';
  themeBtn.className = 'fcta fcta-theme';
  const paint = () => {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    themeBtn.innerHTML = '<span class="fcta-label">' + (dark ? 'Mode clair' : 'Mode nuit') + '</span>' + (dark ? sunIcon : moonIcon);
    themeBtn.setAttribute('aria-label', dark ? 'Passer en mode clair' : 'Passer en mode nuit');
  };
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(THEME_KEY, next); } catch { /* stockage indisponible : le choix ne sera pas mémorisé */ }
    applyTheme(next);
    paint();
  });
  paint();

  const stack = document.createElement('div');
  stack.className = 'fcta-stack';
  stack.appendChild(themeBtn);
  const links = document.createElement('div');
  links.innerHTML =
    '<a class="fcta fcta-wa" href="https://wa.me/359879295518" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp">' +
      '<span class="fcta-label">WhatsApp</span>' +
      '<svg viewBox="0 0 448 512" aria-hidden="true"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>' +
    '</a>' +
    '<a class="fcta fcta-book" href="/pro/" aria-label="Réserver l’artiste">' +
      '<span class="fcta-label">Réserver l’artiste</span>' +
      '<svg viewBox="0 0 448 512" aria-hidden="true"><path d="M400 64h-48V40c0-13.3-10.7-24-24-24s-24 10.7-24 24v24H144V40c0-13.3-10.7-24-24-24s-24 10.7-24 24v24H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zm-6 400H54a6 6 0 0 1-6-6V192h352v266a6 6 0 0 1-6 6zM331.8 236.5l-116 114.4c-4.7 4.7-12.3 4.7-17 0l-62.6-61.7c-4.7-4.7-4.7-12.3 0-17l19.8-19.5c4.7-4.7 12.3-4.7 17 0l34.4 34 89.1-87.8c4.7-4.7 12.3-4.7 17 0l19.8 19.5c4.7 4.6 4.7 12.3-.1 17.1z"/></svg>' +
    '</a>';
  while (links.firstChild) stack.appendChild(links.firstChild);
  document.body.appendChild(stack);
})();

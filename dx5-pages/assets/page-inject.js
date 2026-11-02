/* Télécommande Dashboard → site : applique window.PAGE_CONTENT aux éléments
   marqués data-hbx (texte) / data-hbx-src (image). Sans override, aucun effet :
   le site garde EXACTEMENT son contenu d'origine. Le design n'est jamais touché. */
(function () {
  var C = window.PAGE_CONTENT;
  if (!C || typeof C !== 'object') return;
  document.querySelectorAll('[data-hbx]').forEach(function (el) {
    var v = C[el.getAttribute('data-hbx')];
    if (v != null && v !== '') el.innerHTML = v;
  });
  document.querySelectorAll('[data-hbx-src]').forEach(function (el) {
    var v = C[el.getAttribute('data-hbx-src')];
    if (v != null && v !== '') el.setAttribute('src', v);
  });
})();

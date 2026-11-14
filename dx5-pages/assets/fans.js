/* ── Espace fans : bascule connecté/déconnecté + formulaires ──
   window.FAN (posé par le serveur) = { id, email } si connecté, sinon null. */
(() => {
  const $ = (s) => document.querySelector(s);
  const gate = $('#fanGate'), content = $('#fanContent');
  if (!gate || !content) return;

  const fan = window.FAN || null;
  if (fan) {
    gate.hidden = true; content.hidden = false;
    const em = $('#fanEmail'); if (em) em.textContent = fan.email;
  }

  // onglets connexion / inscription
  const tabLogin = $('#tabLogin'), tabJoin = $('#tabJoin');
  const loginForm = $('#loginForm'), joinForm = $('#joinForm'), forgotForm = $('#forgotForm');
  const showPanel = (panel) => {
    [loginForm, joinForm, forgotForm].forEach((p) => { if (p) p.hidden = p !== panel; });
    if (tabLogin) tabLogin.classList.toggle('active', panel === loginForm);
    if (tabJoin) tabJoin.classList.toggle('active', panel === joinForm);
  };
  if (tabLogin) tabLogin.addEventListener('click', () => showPanel(loginForm));
  if (tabJoin) tabJoin.addEventListener('click', () => showPanel(joinForm));
  const forgotBtn = $('#forgotBtn');
  if (forgotBtn) forgotBtn.addEventListener('click', (e) => { e.preventDefault(); showPanel(forgotForm); });

  async function postJSON(url, data) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    let body = {};
    try { body = await res.json(); } catch { /* réponse vide */ }
    return { ok: res.ok, body };
  }

  const bind = (form, url, errId, onOk) => {
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const errEl = errId ? $(errId) : null;
      if (errEl) errEl.style.display = 'none';
      const { ok, body } = await postJSON(url, data);
      if (!ok) {
        if (errEl) { errEl.textContent = body.message || 'Une erreur est survenue.'; errEl.style.display = 'block'; }
        return;
      }
      onOk(body);
    });
  };

  bind(loginForm, '/fans/connexion', '#loginErr', () => location.reload());
  bind(joinForm, '/fans/inscription', '#joinErr', () => location.reload());
  bind(forgotForm, '/fans/code-oublie', null, (body) => {
    const ok = $('#forgotOk');
    if (ok) { ok.textContent = body.message || 'C’est fait.'; ok.style.display = 'block'; }
    forgotForm.reset();
  });

  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', async () => { await postJSON('/fans/deconnexion', {}); location.reload(); });
})();

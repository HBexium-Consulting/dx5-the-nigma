/* ═══════════════════════════════════════════════════════════════════════
   DX-5 THE NIGMA — interactions du teaser.
   Contenu d'abord : ce script n'est que l'enrobage (compte à rebours vivant,
   inscription sans rechargement). La page est entièrement lisible sans lui.
   ═══════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  // ── Compte à rebours ───────────────────────────────────────────────
  // La cible vient du Dashboard (data-target = published_at ISO 8601). On
  // calcule dans l'heure LOCALE du visiteur ; à l'échéance, on invite à
  // recharger (le Dashboard aura basculé la sortie en publiée).
  const cd = document.getElementById('countdown');
  if (cd) {
    const target = new Date(cd.dataset.target).getTime();
    const el = {
      d: cd.querySelector('[data-d]'),
      h: cd.querySelector('[data-h]'),
      m: cd.querySelector('[data-m]'),
      s: cd.querySelector('[data-s]'),
    };
    const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

    const tick = () => {
      const diff = target - Date.now();
      if (Number.isNaN(target)) return;
      if (diff <= 0) {
        el.d.textContent = el.h.textContent = el.m.textContent = el.s.textContent = '00';
        const note = document.createElement('p');
        note.className = 'hero-sub';
        note.textContent = 'Le signal est là. Rechargez la page pour la révélation.';
        cd.replaceWith(note);
        clearInterval(timer);
        return;
      }
      const days = Math.floor(diff / 86400000);
      el.d.textContent = String(days);
      el.h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      el.m.textContent = pad(Math.floor((diff % 3600000) / 60000));
      el.s.textContent = pad(Math.floor((diff % 60000) / 1000));
    };

    tick();
    const timer = setInterval(tick, 1000);
  }

  // ── Inscription newsletter (sans rechargement) ─────────────────────
  const form = document.getElementById('signalForm');
  const note = document.getElementById('signalNote');
  if (form && note) {
    const defaultNote = note.textContent;
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const btn = form.querySelector('button');
      const email = form.querySelector('input[name="email"]').value.trim();
      if (!email) return;

      btn.disabled = true;
      note.className = 'signal-note';
      note.textContent = 'Transmission…';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        note.textContent = data.message || (data.ok ? 'Inscription enregistrée.' : 'Réessayez.');
        note.className = 'signal-note ' + (data.ok ? 'ok' : 'err');
        if (data.ok) form.reset();
      } catch (_) {
        note.textContent = 'Connexion impossible — réessayez dans un instant.';
        note.className = 'signal-note err';
      } finally {
        btn.disabled = false;
        // Message de courtoisie : on remet la note neutre après 8 s si succès.
        if (note.classList.contains('ok')) {
          setTimeout(() => { note.textContent = defaultNote; note.className = 'signal-note'; }, 8000);
        }
      }
    });
  }
})();

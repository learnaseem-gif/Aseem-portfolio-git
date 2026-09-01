/* Light/dark toggle. The initial theme is applied by an inline script in
   <head> (before first paint, to avoid a flash of the wrong theme) — this
   file only wires up the click handler. */
(function () {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('ts-theme', next);
    } catch (e) {
      // Storage disabled (private mode etc.) — theme just won't persist.
    }
  });
})();

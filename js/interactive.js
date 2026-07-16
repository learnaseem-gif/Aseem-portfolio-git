/* Interactive layer — marquee, custom cursor, magnetic CTAs.
   Everything here is progressive enhancement: the site is fully usable
   without it, and it stays out of the way on touch / reduced-motion. */

(function () {
  if (!window.gsap) return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Marquee: infinite scroll, nudged by scroll velocity ---- */
  const track = document.querySelector('.marquee-track');
  if (track && !prefersReduced) {
    const loop = gsap.to(track, { xPercent: -50, repeat: -1, duration: 26, ease: 'none' });
    if (window.ScrollTrigger) {
      let settle;
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = Math.abs(self.getVelocity());
          gsap.to(loop, { timeScale: 1 + Math.min(v / 900, 4), duration: 0.2, overwrite: true });
          clearTimeout(settle);
          settle = setTimeout(() => gsap.to(loop, { timeScale: 1, duration: 0.6 }), 140);
        },
      });
    }
  }

  /* ---- Custom cursor (desktop, fine pointers) ---- */
  const cursor = document.querySelector('.cursor');
  if (cursor && finePointer && !prefersReduced) {
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });

    window.addEventListener('pointermove', (e) => {
      cursor.classList.add('is-active');
      xTo(e.clientX);
      yTo(e.clientY);
    });
    window.addEventListener('pointerdown', () => cursor.classList.add('is-hovering'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-hovering'));

    document.documentElement.style.cursor = 'none';

    const hoverTargets = document.querySelectorAll(
      'a, button, .work-panel, .filter-btn, .chip, input, textarea, label'
    );
    hoverTargets.forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add('is-hovering'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-hovering'));
    });
  }

  /* ---- Mobile inline service thumbs: hide broken, show branded poster ---- */
  document.querySelectorAll('.service-thumb img').forEach((img) => {
    img.addEventListener('error', () => img.classList.add('is-broken'));
    if (img.complete && img.naturalWidth === 0) img.classList.add('is-broken');
  });

  /* ---- Services hover-reveal (desktop): a visual follows the cursor ---- */
  const reveal = document.querySelector('.service-reveal');
  const list = document.querySelector('.services-list');
  const rows = document.querySelectorAll('.service-row');
  if (reveal && list && rows.length && finePointer && !prefersReduced) {
    const revealImg = reveal.querySelector('img');
    revealImg.addEventListener('error', () => revealImg.classList.add('is-broken'));

    const rx = gsap.quickTo(reveal, 'x', { duration: 0.55, ease: 'power3' });
    const ry = gsap.quickTo(reveal, 'y', { duration: 0.55, ease: 'power3' });
    let w = reveal.offsetWidth || 340;
    let h = reveal.offsetHeight || 255;

    window.addEventListener('pointermove', (e) => {
      rx(e.clientX - w / 2);
      ry(e.clientY - h / 2);
    });

    rows.forEach((row) => {
      row.addEventListener('pointerenter', () => {
        w = reveal.offsetWidth;
        h = reveal.offsetHeight;
        const src = row.dataset.media;
        if (src && revealImg.getAttribute('src') !== src) {
          revealImg.classList.remove('is-broken');
          revealImg.src = src;
        }
        list.classList.add('has-hover');
        rows.forEach((r) => r.classList.toggle('is-hovered', r === row));
        gsap.to(reveal, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3', overwrite: true });
      });
    });

    list.addEventListener('pointerleave', () => {
      list.classList.remove('has-hover');
      rows.forEach((r) => r.classList.remove('is-hovered'));
      gsap.to(reveal, { autoAlpha: 0, scale: 0.85, duration: 0.3, ease: 'power2', overwrite: true });
    });

    gsap.set(reveal, { scale: 0.85 });
  }

  /* ---- Magnetic CTAs (desktop) ---- */
  if (finePointer && !prefersReduced) {
    document.querySelectorAll('.header-cta, .submit-btn').forEach((el) => {
      const strength = 0.4;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width / 2)) * strength,
          y: (e.clientY - (r.top + r.height / 2)) * strength,
          duration: 0.4,
          ease: 'power3',
        });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }
})();

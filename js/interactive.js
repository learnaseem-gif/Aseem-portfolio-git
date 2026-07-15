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

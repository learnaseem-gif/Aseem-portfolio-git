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

  /* ---- Services hover-reveal (desktop): a visual trails the cursor,
     offset to the side so it never covers the row's text, and plays a
     video when the row has data-video. ---- */
  const reveal = document.querySelector('.service-reveal');
  const list = document.querySelector('.services-list');
  const rows = document.querySelectorAll('.service-row');
  if (reveal && list && rows.length && finePointer && !prefersReduced) {
    const revealImg = reveal.querySelector('img');
    const revealVid = reveal.querySelector('video');
    revealImg.addEventListener('error', () => revealImg.classList.add('is-broken'));

    const rx = gsap.quickTo(reveal, 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(reveal, 'y', { duration: 0.5, ease: 'power3' });
    const GAP = 28; // distance from the cursor
    const EDGE = 16; // viewport padding

    window.addEventListener('pointermove', (e) => {
      const w = reveal.offsetWidth || 340;
      const h = reveal.offsetHeight || 255;
      // Down-right of the cursor so the hovered row's name and text stay
      // readable (overlap only hits dimmed rows); flips sides near edges.
      let x = e.clientX + GAP;
      if (x + w > window.innerWidth - EDGE) x = e.clientX - w - GAP;
      let y = e.clientY + GAP;
      if (y + h > window.innerHeight - EDGE) y = e.clientY - h - GAP;
      rx(x);
      ry(y);
    });

    rows.forEach((row) => {
      row.addEventListener('pointerenter', () => {
        const vidSrc = row.dataset.video;
        if (vidSrc && revealVid) {
          reveal.classList.add('is-video');
          if (revealVid.getAttribute('src') !== vidSrc) revealVid.src = vidSrc;
          revealVid.play().catch(() => {});
        } else {
          reveal.classList.remove('is-video');
          if (revealVid) revealVid.pause();
          const src = row.dataset.media;
          if (src && revealImg.getAttribute('src') !== src) {
            revealImg.classList.remove('is-broken');
            revealImg.src = src;
          }
        }
        list.classList.add('has-hover');
        rows.forEach((r) => r.classList.toggle('is-hovered', r === row));
        gsap.to(reveal, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'power3', overwrite: true });
      });
    });

    list.addEventListener('pointerleave', () => {
      list.classList.remove('has-hover');
      rows.forEach((r) => r.classList.remove('is-hovered'));
      if (revealVid) revealVid.pause();
      gsap.to(reveal, { autoAlpha: 0, scale: 0.85, duration: 0.3, ease: 'power2', overwrite: true });
    });

    gsap.set(reveal, { scale: 0.85 });
  }

  /* ---- Mobile: a row with data-video plays it inline in its thumb ---- */
  if (!finePointer) {
    document.querySelectorAll('.service-row[data-video]').forEach((row) => {
      const thumb = row.querySelector('.service-thumb');
      if (!thumb) return;
      const v = document.createElement('video');
      v.src = row.dataset.video;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.autoplay = true;
      thumb.replaceChildren(v);
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

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced && window.Lenis) {
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

gsap.registerPlugin(ScrollTrigger);

const heroField = document.querySelector('.hero-field');
const heroLogo = document.querySelector('.hero-logo');
const heroText = document.querySelector('.hero-text');
const scrollCue = document.querySelector('.scroll-cue');

if (prefersReduced) {
  gsap.set(heroField, { scale: 1, opacity: 1 });
  gsap.set(heroLogo, { scale: 1, opacity: 1 });
  gsap.set(heroText, { opacity: 1, y: 0 });
  gsap.set(scrollCue, { opacity: 0 });
} else {
  gsap.set(heroText, { opacity: 0, y: 24 });

  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '+=280%',
      scrub: 1,
      pin: true,
      anticipatePin: 1,
    },
  });

  heroTl
    .to(scrollCue, { opacity: 0, duration: 0.08 }, 0)
    .to(heroField, { scale: 26, ease: 'none', duration: 1 }, 0)
    .to(heroLogo, { scale: 1.6, opacity: 0, ease: 'none', duration: 0.16 }, 0)
    .to(heroText, { opacity: 1, y: 0, ease: 'none', duration: 0.3 }, 0.38)
    .to(heroText, { scale: 1.08, ease: 'none', duration: 0.62 }, 0.38)
    .to(heroField, { opacity: 0, ease: 'none', duration: 0.22 }, 0.8)
    .to(heroText, { opacity: 0, ease: 'none', duration: 0.18 }, 0.85);
}

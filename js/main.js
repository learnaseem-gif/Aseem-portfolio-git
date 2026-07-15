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

/* ---- Work list (rendered from window.PROJECTS) ---- */

const workList = document.getElementById('work-list');
const projects = window.PROJECTS || [];

function tag(text) {
  return `<span class="work-tag">${text}</span>`;
}

function projectPanel(p) {
  const badge = p.status === 'coming-soon'
    ? '<span class="work-badge">Coming soon</span>'
    : '';
  const tags = p.services.map(tag).join('');
  const dataServices = p.services.join('|');

  // A reel plays inline; otherwise show the cover image.
  const media = p.heroVideo
    ? `<video class="work-panel-video" src="/${p.heroVideo}" muted loop playsinline preload="none" poster="/${p.cover}"></video>`
    : `<img src="/${p.cover}" alt="${p.client} — ${p.title}" loading="lazy" />`;

  return `
    <a class="work-panel" href="/project.html?slug=${p.slug}" data-services="${dataServices}">
      ${badge}
      <div class="work-panel-media">
        ${brandedPoster()}
        ${media}
      </div>
      <div class="work-panel-scrim"></div>
      <div class="work-panel-info">
        <span class="work-panel-cat">${p.category}</span>
        <span class="work-panel-client">${p.client}</span>
        <span class="work-panel-meta">${tags}</span>
        <span class="work-panel-cta">View project →</span>
      </div>
    </a>`;
}

/* Branded poster shown behind covers until real media is added.
   The <img> sits on top; if it fails to load we reveal this poster. */
function brandedPoster() {
  return `
    <div class="work-poster" aria-hidden="true">
      <svg viewBox="0 0 300 300" class="work-poster-mark">
        <path d="M300 150C300 67.1573 232.843 0 150 0C67.1573 0 0 67.1573 0 150C0 232.843 67.1573 300 150 300C232.843 300 300 232.843 300 150Z" fill="var(--brand)"/>
        <path d="M103.653 223.575C103.653 189.092 103.585 157.617 103.673 126.149C103.747 98.8751 127.64 75.3567 155.428 75.0269C156.152 75.0202 156.876 75.1077 158.039 75.175C158.039 109.921 158.093 141.597 158.019 173.28C157.958 200.09 133.376 223.864 105.993 223.757C105.371 223.743 104.742 223.656 103.653 223.575Z" fill="var(--logo-body)"/>
        <path d="M163.371 177.299C163.371 143.206 163.371 109.315 163.371 75C182.074 75.1481 197.017 82.2628 207.536 97.0847C219.955 114.585 220.733 133.143 210.052 151.734C199.398 170.272 178.665 178.302 163.371 177.299Z" fill="var(--logo-accent)"/>
        <path d="M100.19 184.784C100.19 197.795 100.19 210.577 100.19 223.326C91.8426 224.645 82.3386 216.379 81.3848 207.158C80.113 194.914 87.9531 185.443 100.19 184.784Z" fill="var(--logo-accent)"/>
      </svg>
    </div>`;
}

if (workList && projects.length) {
  // Featured first, then the rest in declared order.
  const ordered = [...projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  workList.innerHTML = ordered.map((p) => projectPanel(p)).join('');

  // Until real covers are added, hide any cover that fails to load so the
  // branded poster shows instead of a broken-image box.
  workList.querySelectorAll('.work-panel-media img').forEach((img) => {
    img.addEventListener('error', () => img.classList.add('is-broken'));
    if (img.complete && img.naturalWidth === 0) img.classList.add('is-broken');
  });

  // Reels play only while their panel is on screen (saves bandwidth/CPU).
  const panelVideos = workList.querySelectorAll('.work-panel-video');
  if (panelVideos.length && 'IntersectionObserver' in window && !prefersReduced) {
    const vo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const v = entry.target;
        if (entry.isIntersecting) {
          if (v.preload === 'none') v.preload = 'auto';
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.4 });
    panelVideos.forEach((v) => vo.observe(v));
  }

  if (!prefersReduced) {
    // Pin the SELECTED WORK title; as you scroll past, the stage turns light.
    const intro = document.querySelector('.work-intro');
    const introInner = document.querySelector('.work-intro-inner');
    const veil = document.querySelector('.work-intro-veil');
    gsap.timeline({
      scrollTrigger: {
        trigger: intro,
        start: 'top top',
        end: '+=90%',
        scrub: true,
        pin: true,
        anticipatePin: 1,
      },
    })
      .to(introInner, { opacity: 0, y: -40, ease: 'none', duration: 0.55 }, 0)
      .to(veil, { opacity: 1, ease: 'none', duration: 1 }, 0);

    // Parallax the media inside each full-screen panel.
    workList.querySelectorAll('.work-panel').forEach((panel) => {
      const media = panel.querySelector('.work-panel-media');
      gsap.fromTo(
        media,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    });
  }
}

/* ---- Hide the floating header while the light gallery owns the top ---- */

const siteHeader = document.querySelector('.site-header');
if (siteHeader && workList) {
  ScrollTrigger.create({
    trigger: workList,
    start: 'top top+=2',
    end: 'bottom top',
    onToggle: (self) =>
      gsap.to(siteHeader, { autoAlpha: self.isActive ? 0 : 1, duration: 0.3, overwrite: true }),
  });
}

/* ---- Service filter ---- */

const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('.work-panel').forEach((panel) => {
      const services = (panel.dataset.services || '').split('|');
      const show = filter === 'all' || services.includes(filter);
      panel.classList.toggle('is-hidden', !show);
    });
    ScrollTrigger.refresh();
  });
});

/* ---- Scroll reveals ---- */

if (!prefersReduced) {
  document.querySelectorAll('.intro-lead, .service-row, .contact-pitch, .lead-form')
    .forEach((el) => {
      el.classList.add('reveal');
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => el.classList.add('is-in'),
      });
    });
}

/* ---- Lead form -> WhatsApp ---- */

const leadForm = document.getElementById('lead-form');
if (leadForm) {
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(leadForm);
    const name = (data.get('name') || '').toString().trim();
    const business = (data.get('business') || '').toString().trim();
    const contact = (data.get('contact') || '').toString().trim();
    const services = data.getAll('service').join(', ');
    const message = (data.get('message') || '').toString().trim();

    if (!name || !contact) {
      leadForm.reportValidity();
      return;
    }

    const lines = [
      'New enquiry via thescalingspace.com',
      `Name: ${name}`,
      business ? `Business: ${business}` : '',
      `Contact: ${contact}`,
      services ? `Interested in: ${services}` : '',
      message ? `Project: ${message}` : '',
    ].filter(Boolean);

    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/17783028140?text=${text}`, '_blank');
  });
}

/* ---- Footer year ---- */

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

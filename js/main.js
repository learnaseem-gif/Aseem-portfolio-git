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

function projectCard(p, index) {
  const classes = ['work-item'];
  if (p.featured) classes.push('is-featured');
  // Give a couple of non-featured items a wide span for editorial rhythm.
  else if (index % 5 === 2) classes.push('is-wide');

  const badge = p.status === 'coming-soon'
    ? '<span class="work-badge">Coming soon</span>'
    : '';
  const tags = p.services.map(tag).join('');
  const dataServices = p.services.join('|');

  return `
    <a class="work-item ${classes.slice(1).join(' ')}" href="/project.html?slug=${p.slug}" data-services="${dataServices}">
      <div class="work-media">
        ${badge}
        ${brandedPoster()}
        <img src="/${p.cover}" alt="${p.client} — ${p.title}" loading="lazy" />
      </div>
      <div class="work-caption">
        <span class="work-client">${p.client}</span>
        <span class="work-meta">${tags}</span>
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
  workList.innerHTML = ordered.map((p, i) => projectCard(p, i)).join('');
  // Until real covers are added, hide any cover that fails to load so the
  // branded poster shows instead of a broken-image box.
  workList.querySelectorAll('.work-media img').forEach((img) => {
    img.addEventListener('error', () => img.classList.add('is-broken'));
    if (img.complete && img.naturalWidth === 0) img.classList.add('is-broken');
  });
}

/* ---- Service filter ---- */

const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filterBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('.work-item').forEach((item) => {
      const services = (item.dataset.services || '').split('|');
      const show = filter === 'all' || services.includes(filter);
      item.classList.toggle('is-hidden', !show);
    });
    ScrollTrigger.refresh();
  });
});

/* ---- Scroll reveals ---- */

if (!prefersReduced) {
  document.querySelectorAll('.intro-lead, .work-item, .service-row, .contact-pitch, .lead-form')
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

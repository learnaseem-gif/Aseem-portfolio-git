/* Project detail page — renders one project from window.PROJECTS by ?slug= */

const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');
const projects = window.PROJECTS || [];
const project = projects.find((p) => p.slug === slug);
const root = document.getElementById('project-root');

function notFound() {
  root.innerHTML = `
    <section class="project-missing">
      <h1 class="section-title">Project not found</h1>
      <p>That project isn't here. It may have moved or is still being published.</p>
      <a class="submit-btn" href="/#work">See all work</a>
    </section>`;
}

function renderHero(p) {
  if (p.heroVideo) {
    return `
      <div class="project-hero-media">
        <video src="${mediaUrl(p.heroVideo)}" autoplay muted loop playsinline poster="${mediaUrl(p.cover)}"></video>
      </div>`;
  }
  return `
    <div class="project-hero-media">
      <div class="work-poster" aria-hidden="true">
        <svg viewBox="0 0 300 300" class="work-poster-mark">
          <path d="M300 150C300 67.1573 232.843 0 150 0C67.1573 0 0 67.1573 0 150C0 232.843 67.1573 300 150 300C232.843 300 300 232.843 300 150Z" fill="var(--brand)"/>
          <path d="M103.653 223.575C103.653 189.092 103.585 157.617 103.673 126.149C103.747 98.8751 127.64 75.3567 155.428 75.0269C156.152 75.0202 156.876 75.1077 158.039 75.175C158.039 109.921 158.093 141.597 158.019 173.28C157.958 200.09 133.376 223.864 105.993 223.757C105.371 223.743 104.742 223.656 103.653 223.575Z" fill="var(--logo-body)"/>
          <path d="M163.371 177.299C163.371 143.206 163.371 109.315 163.371 75C182.074 75.1481 197.017 82.2628 207.536 97.0847C219.955 114.585 220.733 133.143 210.052 151.734C199.398 170.272 178.665 178.302 163.371 177.299Z" fill="var(--logo-accent)"/>
          <path d="M100.19 184.784C100.19 197.795 100.19 210.577 100.19 223.326C91.8426 224.645 82.3386 216.379 81.3848 207.158C80.113 194.914 87.9531 185.443 100.19 184.784Z" fill="var(--logo-accent)"/>
        </svg>
      </div>
      <img src="${mediaUrl(p.cover)}" alt="${p.client} — ${p.title}" />
      ${p.status === 'coming-soon' ? '<span class="work-badge project-badge">Case study coming soon</span>' : ''}
    </div>`;
}

function renderGallery(p) {
  if (!p.gallery || !p.gallery.length) return '';
  const items = p.gallery
    .map((src, i) => `<figure class="gallery-item"><img src="${mediaUrl(src)}" alt="${p.client} work ${i + 1}" loading="lazy" /></figure>`)
    .join('');
  return `<section class="project-gallery">${items}</section>`;
}

function render(p) {
  document.title = `${p.client} — The Scaling Space`;
  const scope = p.scope.map((s) => `<li>${s}</li>`).join('');
  const tags = p.services.map((s) => `<span class="work-tag">${s}</span>`).join('');

  root.innerHTML = `
    <a class="project-back" href="/#work">← All work</a>

    <header class="project-head">
      <p class="project-category">${p.category}</p>
      <h1 class="project-title">${p.client}</h1>
      <p class="project-lede">${p.summary}</p>
      <div class="project-tags">${tags}</div>
    </header>

    ${renderHero(p)}

    <section class="project-body">
      <div class="project-block">
        <h2 class="project-block-title">The problem</h2>
        <p>${p.problem}</p>
      </div>
      <div class="project-block">
        <h2 class="project-block-title">Scope</h2>
        <ul class="project-scope">${scope}</ul>
      </div>
      <div class="project-block project-block--wide">
        <h2 class="project-block-title">What we delivered</h2>
        <p>${p.work}</p>
      </div>
    </section>

    ${renderGallery(p)}

    <section class="project-cta">
      <h2 class="section-title">Want work like this?</h2>
      <a class="submit-btn" href="/#contact">Start a project</a>
    </section>`;
}

if (!slug || !project) {
  notFound();
} else {
  render(project);
  // Hide a hero cover that fails to load so the branded poster shows.
  const heroImg = root.querySelector('.project-hero-media img');
  if (heroImg) {
    heroImg.addEventListener('error', () => heroImg.classList.add('is-broken'));
    if (heroImg.complete && heroImg.naturalWidth === 0) heroImg.classList.add('is-broken');
  }
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

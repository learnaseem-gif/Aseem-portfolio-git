/* Admin dashboard — plain JS, no build step, matching the rest of the site.
   Talks to the Worker's /admin/api/* routes (worker/index.js). The password
   check + session cookie live entirely server-side; this file just calls
   the API and renders whatever it gets back. */

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

let currentProjects = [];
let editingSlug = null; // null = creating a new project
let galleryUrls = []; // gallery URLs for the project currently being edited

function showDashboard() {
  loginView.hidden = true;
  dashboardView.hidden = false;
  loadProjects();
  loadAbout();
}

function showLogin(message) {
  loginView.hidden = false;
  dashboardView.hidden = true;
  if (message) {
    loginError.textContent = message;
    loginError.hidden = false;
  }
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: options.body instanceof FormData
      ? options.headers
      : { 'Content-Type': 'application/json', ...options.headers },
  });
  if (res.status === 401) {
    showLogin();
    throw new Error('Not authenticated');
  }
  return res;
}

async function uploadFile(file, prefix) {
  const form = new FormData();
  form.append('file', file);
  const res = await api(`/admin/api/upload?prefix=${encodeURIComponent(prefix)}`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url;
}

/* ---- Auth ---- */

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  const password = document.getElementById('password').value;
  const res = await fetch('/admin/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (res.ok) {
    loginForm.reset();
    showDashboard();
  } else {
    loginError.textContent = 'Wrong password.';
    loginError.hidden = false;
  }
});

logoutBtn.addEventListener('click', async () => {
  await fetch('/admin/api/logout', { method: 'POST' });
  showLogin();
});

/* ---- Tabs ---- */

document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.toggle('is-active', t === tab));
    document.querySelectorAll('.admin-panel').forEach((panel) => {
      panel.hidden = panel.dataset.panel !== tab.dataset.tab;
    });
  });
});

/* ---- Projects: list ---- */

async function loadProjects() {
  const res = await api('/admin/api/projects');
  currentProjects = await res.json();
  renderProjectList();
}

function renderProjectList() {
  const list = document.getElementById('project-list');
  if (!currentProjects.length) {
    list.innerHTML = '<p style="color:var(--muted)">No projects yet — add one below.</p>';
    return;
  }
  list.innerHTML = currentProjects
    .map(
      (p) => `
    <div class="admin-list-row">
      <span class="admin-list-row-name">${p.client}${p.featured ? ' ★' : ''}${p.status === 'coming-soon' ? ' (coming soon)' : ''}</span>
      <span class="admin-list-row-actions">
        <button type="button" class="work-teaser-link" data-edit="${p.slug}">Edit</button>
        <button type="button" class="work-teaser-link" data-delete="${p.slug}">Delete</button>
      </span>
    </div>`
    )
    .join('');

  list.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => editProject(btn.dataset.edit));
  });
  list.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => deleteProject(btn.dataset.delete));
  });
}

async function deleteProject(slug) {
  const project = currentProjects.find((p) => p.slug === slug);
  if (!confirm(`Delete "${project ? project.client : slug}"? This can't be undone.`)) return;
  await api(`/admin/api/projects/${encodeURIComponent(slug)}`, { method: 'DELETE' });
  if (editingSlug === slug) resetProjectForm();
  await loadProjects();
}

/* ---- Projects: form ---- */

const projectForm = document.getElementById('project-form');
const projectStatus = document.getElementById('project-status');
const projectFormTitle = document.getElementById('project-form-title');

function isVideoUrl(src) {
  return /\.(mp4|mov|webm)(\?|$)/i.test(src);
}

function renderGalleryChips() {
  const wrap = document.getElementById('p-gallery-existing');
  wrap.innerHTML = galleryUrls
    .map(
      (url, i) => `
    <span class="admin-gallery-chip">
      ${isVideoUrl(url) ? 'Reel' : 'Photo'} ${i + 1}
      <button type="button" data-remove="${i}" aria-label="Remove">&times;</button>
    </span>`
    )
    .join('');
  wrap.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      galleryUrls.splice(Number(btn.dataset.remove), 1);
      renderGalleryChips();
    });
  });
}

function editProject(slug) {
  const p = currentProjects.find((proj) => proj.slug === slug);
  if (!p) return;
  editingSlug = slug;
  projectFormTitle.textContent = `Editing: ${p.client}`;

  document.getElementById('p-slug').value = p.slug;
  document.getElementById('p-client').value = p.client || '';
  document.getElementById('p-title').value = p.title || '';
  document.getElementById('p-category').value = p.category || '';
  document.querySelectorAll('input[name="p-services"]').forEach((cb) => {
    cb.checked = (p.services || []).includes(cb.value);
  });
  document.getElementById('p-featured').checked = !!p.featured;
  document.getElementById('p-status').value = p.status || 'live';
  document.getElementById('p-summary').value = p.summary || '';
  document.getElementById('p-problem').value = p.problem || '';
  document.getElementById('p-scope').value = (p.scope || []).join('\n');
  document.getElementById('p-work').value = p.work || '';
  document.getElementById('p-cover-file').value = '';
  document.getElementById('p-hero-file').value = '';
  document.getElementById('p-gallery-files').value = '';

  galleryUrls = [...(p.gallery || [])];
  renderGalleryChips();

  projectForm.dataset.cover = p.cover || '';
  projectForm.dataset.hero = p.heroVideo || '';
  projectStatus.textContent = '';
  projectForm.scrollIntoView({ behavior: 'smooth' });
}

function resetProjectForm() {
  editingSlug = null;
  galleryUrls = [];
  projectForm.reset();
  projectForm.dataset.cover = '';
  projectForm.dataset.hero = '';
  projectFormTitle.textContent = 'Add a project';
  renderGalleryChips();
}

document.getElementById('project-cancel').addEventListener('click', resetProjectForm);

projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = projectForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  projectStatus.textContent = 'Saving…';

  try {
    const slug = document.getElementById('p-client').value ? editingSlug : null;
    const coverFile = document.getElementById('p-cover-file').files[0];
    const heroFile = document.getElementById('p-hero-file').files[0];
    const galleryFiles = Array.from(document.getElementById('p-gallery-files').files);

    // Uploads are keyed by client-name-derived slug when creating new, or
    // the existing slug when editing — the server re-derives/keeps the
    // same slug either way, this is just for a tidy folder name.
    const uploadPrefix = (slug || document.getElementById('p-client').value || 'project')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const cover = coverFile ? await uploadFile(coverFile, `${uploadPrefix}/cover`) : projectForm.dataset.cover;
    const heroVideo = heroFile ? await uploadFile(heroFile, `${uploadPrefix}/hero`) : projectForm.dataset.hero;

    const newGalleryUrls = [];
    for (const file of galleryFiles) {
      newGalleryUrls.push(await uploadFile(file, `${uploadPrefix}/gallery`));
    }

    const services = Array.from(document.querySelectorAll('input[name="p-services"]:checked')).map((cb) => cb.value);
    const scope = document.getElementById('p-scope').value.split('\n').map((s) => s.trim()).filter(Boolean);

    const project = {
      slug: editingSlug || undefined,
      client: document.getElementById('p-client').value.trim(),
      title: document.getElementById('p-title').value.trim(),
      category: document.getElementById('p-category').value.trim(),
      services,
      featured: document.getElementById('p-featured').checked,
      status: document.getElementById('p-status').value,
      cover: cover || '',
      heroVideo: heroVideo || '',
      summary: document.getElementById('p-summary').value.trim(),
      problem: document.getElementById('p-problem').value.trim(),
      scope,
      work: document.getElementById('p-work').value.trim(),
      gallery: [...galleryUrls, ...newGalleryUrls],
    };

    const res = await api('/admin/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Save failed');

    projectStatus.textContent = 'Saved.';
    resetProjectForm();
    await loadProjects();
  } catch (err) {
    projectStatus.textContent = err.message || 'Something went wrong.';
  } finally {
    submitBtn.disabled = false;
  }
});

/* ---- About Us ---- */

const aboutForm = document.getElementById('about-form');
const aboutStatus = document.getElementById('about-status');

async function loadAbout() {
  const res = await api('/admin/api/about');
  const about = await res.json();
  document.getElementById('a-lede').value = about.lede || '';
  document.getElementById('a-story').value = about.story || '';
  aboutForm.dataset.photo = about.photo || '';
}

aboutForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = aboutForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  aboutStatus.textContent = 'Saving…';

  try {
    const photoFile = document.getElementById('a-photo-file').files[0];
    const photo = photoFile ? await uploadFile(photoFile, 'about') : aboutForm.dataset.photo;

    const about = {
      photo: photo || '',
      lede: document.getElementById('a-lede').value.trim(),
      story: document.getElementById('a-story').value.trim(),
    };

    const res = await api('/admin/api/about', {
      method: 'POST',
      body: JSON.stringify(about),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Save failed');

    aboutForm.dataset.photo = photo;
    document.getElementById('a-photo-file').value = '';
    aboutStatus.textContent = 'Saved.';
  } catch (err) {
    aboutStatus.textContent = err.message || 'Something went wrong.';
  } finally {
    submitBtn.disabled = false;
  }
});

/* ---- Boot: are we already logged in? ---- */

fetch('/admin/api/projects')
  .then((res) => {
    if (res.status === 401) showLogin();
    else showDashboard();
  })
  .catch(() => showLogin());

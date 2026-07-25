/*
 * The Scaling Space — admin API worker.
 *
 * Handles a handful of /api and /admin/api routes for the self-service
 * dashboard (admin.html); everything else falls through to the static
 * site, unchanged. Project + About Us data lives as two JSON objects in
 * the same R2 bucket the client media already lives in ("scaling-space-media"),
 * not a separate database — at this scale (a handful of projects, one
 * editor, occasional writes) a JSON blob is simpler to reason about than
 * adding D1, and it keeps everything in one bucket the user already
 * understands from uploading media there directly before.
 *
 * Auth is a single shared password (set as the ADMIN_PASSWORD secret) plus
 * a stateless signed cookie (HMAC over an expiry, keyed by SESSION_SECRET)
 * — no session storage needed since the signature itself proves validity.
 */

const PROJECTS_KEY = 'projects.json';
const ABOUT_KEY = 'about.json';
const R2_PUBLIC_BASE = 'https://pub-aa191eca575349308d8f55261e776ece.r2.dev';
const SESSION_COOKIE = 'ts_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Seeded once into R2 on first request if projects.json doesn't exist yet —
// copied verbatim from the previous static js/projects.js, so nothing is
// lost when this ships. From then on R2 is the source of truth.
const SEED_PROJECTS = [
  {
    slug: 'porsche-centre-richmond',
    client: 'Porsche Centre Richmond',
    title: 'Precision, in motion',
    category: 'Automotive · Luxury',
    services: ['Photography', 'Social Reels'],
    featured: true,
    status: 'live',
    cover: 'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/Hero-Image_result.webp',
    heroVideo: 'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Videos/Hero-Video.mp4',
    summary: "Event coverage, reels, and vehicle photography for one of Canada's premier Porsche dealerships — content built to match the marque.",
    problem: "Porsche Centre Richmond needed content that matched the marque: fast, exacting, unmistakably premium. Off-the-shelf dealership media wasn't going to cut it.",
    scope: [
      'Instagram reels for CPO inspections, tire promotions, and in-store events',
      'Live event photography and coverage',
      'Vehicle and lifestyle photography across the showroom floor',
    ],
    work: "We built reels tuned to the dealership's actual sales calendar — CPO inspection walkthroughs, tire promotions, and live TechNight event coverage — backed by a full vehicle and lifestyle photography library the team can draw from for every future campaign.",
    gallery: [
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/DSC06914_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/DSC07381_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/DSC07429_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/DSC07922_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/DSC07966_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/DSC07981_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/DSC07982_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/DSC07985_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/IMG_4435_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/IMG_4436_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/IMG_4437_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/IMG_4521_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/IMG_8409_jpg_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/IMG_9506_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/IMG_9529_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Photos/IMG_9534_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Videos/Ir-Cpo-Inspection.mp4',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Videos/Ir-Technight-Event.mp4',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Porsche%20Centre%20Richmond/Videos/Ir-Tire-Promotion.mp4',
    ],
  },
  {
    slug: 'bagga-jewels',
    client: 'Bagga Jewels',
    title: 'Light, cut to sell',
    category: 'Jewelry · Retail',
    services: ['Social Reels', 'Photography'],
    featured: false,
    status: 'live',
    cover: 'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/Hero%20Image_result.webp',
    heroVideo: 'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Videos/Hero-Video.mp4',
    summary: 'Scroll-stopping reels and product photography that make fine jewelry read as luxury on a phone screen.',
    problem: 'Jewelry lives or dies on how it catches light — and most phone-shot content flattens it. Bagga Jewels needed social content that kept the sparkle and the status.',
    scope: [
      'Instagram reels for collections and drops',
      'Product and detail photography',
      'Content styled for feed and story formats',
    ],
    work: 'We built a reel format that leads with motion and light — pieces shot to catch the eye mid-scroll, cut to a rhythm that holds attention long enough to sell.',
    gallery: [
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/DSC00887_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/DSC00983_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/DSC00987_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/DSC01019_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/DSC01038_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/Grid-3_01_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/Grid-Revision_04_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/new-magzine_03_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/pink-grid-03_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/1_result.webp',
      'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Bagga%20Jewels/Photos/2_result.webp',
    ],
  },
  {
    slug: 'saloud',
    client: 'Saloud',
    title: 'The weight of oud',
    category: 'Fragrance · Luxury',
    services: ['Photography', 'Social Reels', 'Paid Campaigns'],
    featured: false,
    status: 'live',
    cover: 'assets/work/saloud/cover.jpg',
    heroVideo: 'https://pub-aa191eca575349308d8f55261e776ece.r2.dev/Saloud/Saloud%20Render%20V001.mp4',
    summary: "A visual language for a luxury oud house — photography and paid social that sell scent through mood, not description.",
    problem: "You can't smell a perfume through a screen. Saloud needed imagery that conveyed the richness and ritual of oud — and paid campaigns that turned that mood into sales.",
    scope: [
      'Product and mood photography',
      'Reels for launches and storytelling',
      'Paid social campaign creative',
    ],
    work: 'We art-directed a warm, deliberate look — deep shadow, patient pacing — then built paid creative around it so the ads felt like the brand, not like ads.',
    gallery: [],
  },
  {
    slug: 'canwide-mortgage',
    client: 'Canwide Mortgage Services',
    title: 'Trust, made visible',
    category: 'Finance · Services',
    services: ['Websites', 'Paid Campaigns', 'Social Reels'],
    featured: false,
    status: 'live',
    cover: 'assets/work/canwide-mortgage/cover.jpg',
    heroVideo: '',
    summary: 'A clear, credible digital presence for a mortgage brokerage — website, paid lead-gen, and social that build trust fast.',
    problem: 'In mortgages, trust is the whole product. Canwide needed a digital presence that felt established and approachable, and marketing that brought in qualified leads.',
    scope: [
      'Website design and build',
      'Paid campaigns for lead generation',
      'Social content to build authority',
    ],
    work: 'We built a website that reads as credible at a glance, then wired it to paid campaigns designed to capture and qualify leads — so marketing spend turns into conversations.',
    gallery: [],
  },
  {
    slug: 'motor-world-autos',
    client: "The Motor World Auto's",
    title: 'Every car, its best angle',
    category: 'Automotive · Retail',
    services: ['Photography', 'Social Reels', 'Websites'],
    featured: false,
    status: 'live',
    cover: 'assets/work/motor-world-autos/cover.jpg',
    heroVideo: 'assets/work/motor-world-autos/reel.mp4',
    summary: 'Inventory photography, reels, and web presence that help an auto dealer move metal faster.',
    problem: 'Used-car listings are a sea of sameness. The Motor World needed photography and content that made their inventory stand out and their dealership look the part.',
    scope: [
      'Vehicle inventory photography',
      'Reels for featured stock and the dealership',
      'Web presence',
    ],
    work: 'We gave every vehicle a consistent, sharp look and built social content that showcases stock and personality — so browsers become buyers.',
    gallery: [
      'assets/work/motor-world-autos/bmw-x5-reel.mp4',
      'assets/work/motor-world-autos/dodge-challenger-gt-reel.mp4',
      'assets/work/motor-world-autos/ram-reel.mp4',
      'assets/work/motor-world-autos/u-sick-reel.mp4',
      'assets/work/motor-world-autos/final-reel.mp4',
    ],
  },
];

const SEED_ABOUT = {
  photo: '',
  lede: 'One accountable creative team — not a patchwork of freelancers.',
  story:
    "We plan, shoot, edit, and market — one accountable team behind your brand's photography, video, social, paid, and web. A studio built to scale brands.",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getProjects(env) {
  const obj = await env.MEDIA.get(PROJECTS_KEY);
  if (obj) return JSON.parse(await obj.text());
  await env.MEDIA.put(PROJECTS_KEY, JSON.stringify(SEED_PROJECTS));
  return SEED_PROJECTS;
}

async function putProjects(env, list) {
  await env.MEDIA.put(PROJECTS_KEY, JSON.stringify(list));
}

async function getAbout(env) {
  const obj = await env.MEDIA.get(ABOUT_KEY);
  if (obj) return JSON.parse(await obj.text());
  await env.MEDIA.put(ABOUT_KEY, JSON.stringify(SEED_ABOUT));
  return SEED_ABOUT;
}

async function putAbout(env, data) {
  await env.MEDIA.put(ABOUT_KEY, JSON.stringify(data));
}

// ---- Auth: stateless signed cookie (HMAC over an expiry timestamp) ----

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toBase64Url(bytes) {
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function signSession(env, expiresAt) {
  const key = await hmacKey(env.SESSION_SECRET);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(String(expiresAt)));
  return `${expiresAt}.${toBase64Url(new Uint8Array(sig))}`;
}

async function verifySession(request, env) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return false;
  const [expiresAtStr, sigStr] = match[1].split('.');
  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || !sigStr || expiresAt < Date.now() / 1000) return false;
  const key = await hmacKey(env.SESSION_SECRET);
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    fromBase64Url(sigStr),
    new TextEncoder().encode(String(expiresAt))
  );
  return valid;
}

function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_SECONDS}`;
}

function clearedCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

// ---- Upload: streams a multipart file straight into R2 ----

async function handleUpload(request, env, prefix) {
  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return json({ error: 'No file provided' }, 400);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const key = `${prefix}/${Date.now()}-${safeName}`;
  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  });

  const url = `${R2_PUBLIC_BASE}/${key.split('/').map(encodeURIComponent).join('/')}`;
  return json({ url });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    // ---- Public read endpoints ----
    if (method === 'GET' && pathname === '/api/projects') {
      return json(await getProjects(env));
    }
    if (method === 'GET' && pathname === '/api/about') {
      return json(await getAbout(env));
    }

    // ---- Auth ----
    if (method === 'POST' && pathname === '/admin/api/login') {
      const body = await request.json().catch(() => ({}));
      if (!env.ADMIN_PASSWORD || body.password !== env.ADMIN_PASSWORD) {
        return json({ error: 'Wrong password' }, 401);
      }
      const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
      const token = await signSession(env, expiresAt);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'Set-Cookie': sessionCookie(token),
        },
      });
    }
    if (method === 'POST' && pathname === '/admin/api/logout') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'Set-Cookie': clearedCookie(),
        },
      });
    }

    // ---- Everything past this point requires a valid session ----
    if (pathname.startsWith('/admin/api/')) {
      const authed = await verifySession(request, env);
      if (!authed) return json({ error: 'Not authenticated' }, 401);

      if (method === 'GET' && pathname === '/admin/api/projects') {
        return json(await getProjects(env));
      }

      if (method === 'POST' && pathname === '/admin/api/projects') {
        const incoming = await request.json().catch(() => null);
        if (!incoming || !incoming.client) return json({ error: 'Missing client name' }, 400);
        const list = await getProjects(env);
        let slug = incoming.slug || slugify(incoming.client);
        const existingIndex = list.findIndex((p) => p.slug === slug);
        const project = { ...incoming, slug };
        if (existingIndex >= 0) {
          list[existingIndex] = project;
        } else {
          // Ensure a fresh slug is actually unique.
          let uniqueSlug = slug;
          let n = 2;
          while (list.some((p) => p.slug === uniqueSlug)) {
            uniqueSlug = `${slug}-${n++}`;
          }
          project.slug = uniqueSlug;
          list.push(project);
        }
        await putProjects(env, list);
        return json(project);
      }

      const deleteMatch = pathname.match(/^\/admin\/api\/projects\/(.+)$/);
      if (method === 'DELETE' && deleteMatch) {
        const slug = decodeURIComponent(deleteMatch[1]);
        const list = await getProjects(env);
        const next = list.filter((p) => p.slug !== slug);
        await putProjects(env, next);
        return json({ ok: true });
      }

      if (method === 'GET' && pathname === '/admin/api/about') {
        return json(await getAbout(env));
      }
      if (method === 'POST' && pathname === '/admin/api/about') {
        const incoming = await request.json().catch(() => null);
        if (!incoming) return json({ error: 'Invalid body' }, 400);
        await putAbout(env, incoming);
        return json(incoming);
      }

      if (method === 'POST' && pathname === '/admin/api/upload') {
        const uploadPrefix = url.searchParams.get('prefix') || 'uploads';
        return handleUpload(request, env, uploadPrefix);
      }

      return json({ error: 'Not found' }, 404);
    }

    // ---- Everything else: the existing static site ----
    return env.ASSETS.fetch(request);
  },
};

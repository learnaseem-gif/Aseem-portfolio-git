/*
 * The Scaling Space — project data loader.
 *
 * Project data now lives server-side (edited via /admin.html) and is
 * fetched from /api/projects instead of being hardcoded here. Any script
 * that renders projects should `await window.PROJECTS_READY` (or use
 * `.then()`) before reading `window.PROJECTS`, since the fetch is async.
 *
 * Media can be either:
 *   - a local repo path, e.g. "assets/work/<slug>/cover.jpg"
 *   - a full URL to the R2 media bucket, e.g.
 *     "https://pub-aa191eca575349308d8f55261e776ece.r2.dev/<Client>/Photos/x.webp"
 *
 * services  — any of: "Photography", "Social Reels", "Paid Campaigns", "Websites"
 * featured  — true pins the project to the large lead slot
 * status    — "live" shows normally; "coming-soon" shows the card with a badge
 */

// Resolves either kind of path above into a usable <img>/<video> src.
window.mediaUrl = function mediaUrl(path) {
  if (!path) return path;
  return /^https?:\/\//i.test(path) ? path : '/' + path;
};

window.PROJECTS = [];
window.PROJECTS_READY = fetch('/api/projects')
  .then((res) => res.json())
  .then((data) => {
    window.PROJECTS = data;
    return data;
  })
  .catch(() => {
    window.PROJECTS = [];
    return [];
  });

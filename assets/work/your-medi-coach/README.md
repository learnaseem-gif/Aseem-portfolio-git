# Your Medi Coach — media

Feeds the **Your Medi Coach** case study: `v3/work.html#your-medi-coach`.

Full launch, 2022, live since. Screenshots of the live site.

## What to upload here

- `01-hero.webp — the top of the homepage`
- `02-....webp — further sections, numbered in the order they appear`

Number the filenames so they sort into the order they should appear on the
page. The gallery markup lists them explicitly, so the numbering is for
humans reading the folder — but keeping the two in step makes it obvious
when something is missing.

## Rules

- **WebP** where possible. Everything else in this project is WebP, and a
  full-page screenshot as PNG is several times larger for no visible gain.
- **25 MiB per file, hard limit.** That is Cloudflare's ceiling for static
  assets. Anything larger has to go to the R2 bucket instead and be
  referenced by full URL.
- Files here are served at `/assets/work/your-medi-coach/<filename>` —
  `wrangler.jsonc` publishes the repo root as the asset directory.

## Why this file exists

Git cannot track an empty directory, so this README holds the folder open
until the images land. It is never deployed: `.assetsignore` excludes
`*.md`, so it stays out of the Cloudflare upload entirely. Leave it in
place — deleting it once images exist is harmless, but it is the only
record of the naming rules.

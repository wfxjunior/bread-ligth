# Public assets — Bread&Light

Single home for every static asset. Nothing image-related lives outside this
tree. Each folder documents exactly what belongs in it, at what size, and where
it is consumed, so a real asset can be dropped in later with **no code change**
(components render elegant placeholders until the file exists).

| Folder | Purpose |
|--------|---------|
| `brand/` | Logos, wordmark, social share card |
| `icons/` | Favicon, PWA icons, Apple touch icon |
| `hero/` | Hero background / atmosphere art |
| `screenshots/` | Real in-app phone captures (9:19.5 WebP) |
| `library/` | The Scripture-shelf signature render |
| `textures/` | Subtle paper / leather grain overlays |
| `devices/` | Device frame art (if ever rasterized) |
| `backgrounds/` | Section background atmospheres |
| `illustrations/` | Any editorial illustration |

## Global rules

- Prefer **WebP** for photos/renders, **SVG** for vector/logos, **PNG** only
  where a format demands it (OG image, PWA icons).
- Keep filenames lowercase-kebab-case, matching the names documented per folder.
- Never stage fake app UI that misrepresents the product.
- Compress: `cwebp -q 82` for screenshots/renders; keep each under ~250 KB.

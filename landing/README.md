# Bread&Light — Landing Page

A calm, premium, mobile-first marketing site for **Bread&Light** — learn
languages through Scripture. Standalone Next.js app (App Router), independent of
the mobile monorepo so it deploys cleanly to Vercel.

## Stack
- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (design tokens in `app/globals.css` via `@theme`)
- No animation dependency — scroll reveals use IntersectionObserver + CSS,
  honoring `prefers-reduced-motion`
- Fonts: Cormorant Garamond (serif) + Inter (sans), loaded at runtime via
  `<link>` (no build-time font fetch)

## Develop
```bash
cd landing
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the build
```

## Localization
Portuguese + English. All copy lives in `lib/i18n/en.ts` and `lib/i18n/pt.ts`
(TypeScript enforces identical shape). The selector persists to `localStorage`
and updates the whole page, `<html lang>`, and the document title at runtime.
Add a locale by adding a dictionary + entry in `lib/i18n/config.ts`.

> SSR metadata is English (primary market for crawlers); the visible UI localizes
> at runtime. For per-locale *metadata*, the recommended next step is `/[lang]`
> route segments with `generateMetadata` — the dictionary layer already supports it.

## Design tokens
Single source of truth: `app/globals.css` `@theme` block. Semantic names
(`cream`, `ivory`, `burgundy`, `gold`, `leather`, `ink`, `muted`, `line`,
`surface-warm`, `surface-dark`). Components never hardcode hex.

## Launch switch (waitlist → download)
`lib/config.ts` → set `launched: true` and fill `appStoreUrl` / `playStoreUrl`.
Every CTA and the store badges flip automatically. No fake store links ship.

## Waitlist integration
`app/api/waitlist/route.ts` is an honest adapter — it only reports success when
an entry is actually stored. Pick ONE provider via env:

| `WAITLIST_PROVIDER` | Required env |
|---|---|
| `convertkit` | `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID` |
| `buttondown` | `BUTTONDOWN_API_KEY` |
| `resend` | `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` |
| `supabase` | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (table `waitlist(first_name,email unique)`) |

With nothing configured: in **development** the form echoes success and logs a
warning (entry NOT stored); in **production** it returns 503 so real signups are
never silently dropped.

## Screenshots
Placeholders render until you add real captures — see
`public/screenshots/README.md`.

## Analytics
`lib/analytics.ts` fires provider-agnostic events (CTA, waitlist, pricing toggle,
language change, store clicks, FAQ, carousel). Wire Vercel Analytics / Plausible /
PostHog by giving it a `window.va`/`dataLayer` sink; no tracker is bundled.

## Deploy (Vercel)
1. Import the repo, set **Root Directory** to `landing`.
2. Framework preset: Next.js (auto). Build `next build`, output auto.
3. Add waitlist env vars (above) and set `siteConfig.url` to your domain.
4. Deploy.

## Assets still needed
- `public/screenshots/*.webp` (6 real app screens)
- `public/brand/og-image.png` (1200×630 social card)
- `public/icons/apple-touch-icon.png`, `icon-192.png`, `icon-512.png`
- Real App Store / Google Play URLs + `launched: true` at launch

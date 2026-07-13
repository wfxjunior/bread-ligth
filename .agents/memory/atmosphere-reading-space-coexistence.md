---
name: Atmosphere + Reading Space coexistence
description: Why the web reading-atmosphere palette and the Reading Space background-mood layer need opacity mediation in layout.tsx, not just independent CSS vars.
---

Web has two independent, stackable color systems on top of each other in `components/layout.tsx`:
- **Atmosphere** (`context/atmosphere-context.tsx` + `lib/atmospheres.ts`): sets `--background`/`--foreground`/etc. CSS vars on `<html>` plus the `.dark` class — this is the base app skin, ported 1:1 from mobile's `ATMOSPHERES`/`ACCENTS`.
- **Reading Space** (`context/reading-space-context.tsx` + `components/space-background.tsx`): an *opaque*, full-bleed decorative gradient painted behind page content via `<SpaceBackground>` inside `<main>`.

**Why it matters:** `SpaceBackground` renders at full opacity by default. If the Reading Space's own light/dark tone disagrees with the active Atmosphere (e.g. a light Reading Space gradient under a dark Atmosphere like Night/Dark/Library), the gradient visually overrides the atmosphere's background in the gaps between cards, and Atmosphere-driven foreground text (now a light color) ends up rendered on a light gradient — unreadable. A Playwright test caught this as "main content area stayed light/cream" despite `.dark` being correctly applied.

**How it was fixed:** In `layout.tsx`, `<main>` now carries `bg-background` (the atmosphere's own color) as the true base layer, and `<SpaceBackground>` is passed `className="opacity-25"` only when `atmosphereIsDark !== space.isDark` (a mismatch). Matching combos (the common case, e.g. default Classic atmosphere + Classic space) render exactly as before — zero visual regression — while mismatched combos let the atmosphere's base color dominate through a faded gradient tint instead of a full opaque takeover.

**How to apply:** Any future change to either system should re-check this mismatch case specifically (dark atmosphere + light space, and vice versa) — don't assume the two independently-built color systems compose safely by default.

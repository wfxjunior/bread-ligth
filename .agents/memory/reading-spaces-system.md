---
name: Reading Spaces atmosphere system
description: How the mobile app's per-screen background atmosphere (formerly "background templates") is architected — where the data lives, how it reaches screens, and the one recurring gotcha when adapting an existing hardcoded-dark screen to follow it.
---

## Where it lives
- `constants/colors.ts` exports `ReadingSpace` (union of space ids) and `READING_SPACES: Record<ReadingSpace, ReadingSpaceData>` — each entry has `gradient` (3-stop), `isDark`, `accent`, `overlay`.
- `ThemeContext` persists the selected id (`@bibliaeN:readingSpace`) and exposes `readingSpace`/`setReadingSpace`. Changing it auto-syncs `readingTheme` to `night`/`classic` (mirrors the old template behavior) so the *reading theme's* `isDark` formula never needs to change.
- `useColors()` attaches the resolved space object as `colors.space` on top of the existing reading-theme/accent palette — screens read `colors.space.gradient` / `.accent` / `.isDark`, they don't import `READING_SPACES` directly unless they need the raw id (e.g. the Settings picker).
- `components/SpaceBackground.tsx` is the shared crossfade component: pass it the current `gradient` tuple and it animates between old/new gradients (Animated opacity layer) instead of hard-cutting. Reused on Home, chapter reader, and the daily devotional — don't duplicate the fade logic per screen.

**Why:** a single source of truth for "space → gradient/accent/isDark" avoids each screen inventing its own atmosphere logic, and centralizing the crossfade avoids three slightly-different animation implementations drifting apart.

## The recurring gotcha: colors baked into a static `StyleSheet.create`
Some older screens (e.g. `app/daily.tsx`) defined a **module-scope constant palette** (a `D` object) and referenced `D.xxx` directly inside `StyleSheet.create({...})`. That works fine for a fixed palette, but breaks the moment the palette needs to become dynamic (driven by the active Reading Space) — `StyleSheet.create` runs once at module load, so those color values freeze at import time and never update on re-render.

**How to apply:** when a screen like this needs to start following a dynamic value (space, theme, etc.):
1. Turn the constant into a function (e.g. `buildImmersivePalette(space)`) called inside each component that needs it (including any small subcomponents in the same file — they each need their own `useColors()`/palette call, a shared module constant won't reactively update for them).
2. Strip the color-only properties (`color`, `backgroundColor`, `borderColor`, etc.) out of the static `StyleSheet.create` entries — keep only layout (padding, gap, radius, fontFamily/fontSize).
3. Apply the removed colors inline at each JSX usage site via `style={[styles.x, { color: D.y }]}`, since inline styles ARE re-evaluated every render.
Any color reference that was already inline (not inside `StyleSheet.create`) is automatically fine once the palette variable itself is computed per-render — no change needed there.

## Web port (artifacts/bible-english)
The web app mirrors this system independently (no shared package with mobile): `src/lib/reading-spaces.ts` duplicates `READING_SPACES` as CSS gradient strings, `src/context/reading-space-context.tsx` persists to `localStorage` (`bible-english:readingSpace`), and `src/components/space-background.tsx` crossfades via a timed opacity transition (same 420ms pattern, CSS instead of RN Animated). It's wired into `Layout`'s `<main>` as an absolutely-positioned layer behind children — works because page-level wrapper divs don't set `bg-background` (only nested cards/headers do), so the gradient shows through. If a future page needs its own solid wrapper, it will blank out the gradient — check for that first.

**Why:** the web app has no shared package with mobile and no formal i18n system yet, so keeping the data in sync is a manual porting exercise, not a shared import — watch for drift if `READING_SPACES` changes on mobile.

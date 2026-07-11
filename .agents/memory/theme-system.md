---
name: Theme system
description: How Reading Atmosphere (theme) + Accent Color are managed in the mobile app, and their `isDark` derivation.
---

## Rule
`ThemeContext` (context/ThemeContext.tsx) owns two independent, user-controlled settings, both persisted to AsyncStorage:
- `atmosphere: Atmosphere` (10 named palettes — parchment/cozy/classic/dark/night/library/morning/minimal/sepia/focus) under `@bibliaeN:atmosphere`.
- `accentColor: AccentColor` (5 brand colors) under `@bibliaeN:accentColor`.

`getColors(atmosphere, accentColor)` in `constants/colors.ts` combines both: the atmosphere supplies background/surface/card/foreground/divider/secondaryAccent/selection, while `accentColor` always overrides the atmosphere's own primary/interactive accent. `isDark` is derived per-atmosphere (`ATMOSPHERES[atmosphere].isDark`), not from a global light/dark toggle — several atmospheres (dark, night, library) are dark, the rest are light.

**Why:** User explicitly chose "keep accent color as an independent overlay" over "let each atmosphere own its accent with no separate picker" — so a user's chosen brand color must always win over an atmosphere's own tone.

**How to apply:**
- New components: use `useColors()` as usual — it already reflects the active atmosphere + accent.
- Settings: call `setAtmosphere(id)` / `setAccentColor(id)` from `useTheme()`.
- Switching atmosphere triggers a brief cross-fade veil (`transitionOpacity`/`transitionColor` from `useTheme()`, painted by `AtmosphereTransitionOverlay` in `app/_layout.tsx`) so the instant color swap doesn't flash.
- `ThemeProvider` wraps `BibleProvider` in `_layout.tsx`.
- A screen-local light/dark override (independent of the global atmosphere) is a valid pattern: pin two fixed atmosphere ids (e.g. 'classic'/'dark') behind a local toggle, still pass through the user's real `accentColor` via `getColors(fixedId, accentColor)`, persist under a screen-specific AsyncStorage key (never the shared `@bibliaeN:atmosphere` key), and provide the result through a small screen-scoped React Context so child components in that file share it instead of calling the global `useColors()`. Used on the Daily Devotional screen (`app/daily.tsx`, key `@bibliaeN:dailyReadingMode`).

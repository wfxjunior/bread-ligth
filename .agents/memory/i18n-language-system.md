---
name: i18n Language System
description: PT/EN language switching for Bread&Light mobile app UI — context, hook, and translation keys
---

## Rule
All UI strings in the mobile app must be sourced from `constants/i18n.ts` via `useLanguage().t(key)`. Never hardcode display strings.

**Why:** User requested EN/PT platform language toggle. The system is live and persisted to AsyncStorage.

## How to apply
- `constants/i18n.ts` — defines `Lang` type (`'pt' | 'en'`), all translation keys, and `t(lang, key)` helper
- `context/LanguageContext.tsx` — provides `{ lang, setLang, t }` via `useLanguage()` hook
- `LanguageProvider` is in root `app/_layout.tsx` (wraps everything, outermost before ThemeProvider)
- AsyncStorage key: `@breadlight:lang`

## Naming conflict
In `settings.tsx`, READING_THEMES map uses variable `t` (for each theme object). Use `tl` as the alias:
```ts
const { lang, setLang, t: tl } = useLanguage();
```

## App name
Display name everywhere: **Bread&Light**. Use `Bread{'&'}Light` in JSX to avoid JSX entity issues.
AsyncStorage keys still use `@bibliaeN:` prefix — do NOT change them (would break stored user data).
`app.json` `name` field: "Bread&Light". Slug remains "goden" (changing breaks deep links).

## Translations coverage
- Tab bar labels (`tab_home` = "Início"/"Home", etc.)
- All settings section headers
- Settings row labels and subs
- Stats in profile + drawer
- Drawer nav items and footer
- Daily screen: already fully bilingual via `t(lang, key)` raw import (not the `useLanguage().t` hook) — a second valid call convention, don't "fix" it to match the hook style.
- Full audit (2026-07-14) also covered: vocab/bookmarks/search/not-found/error-fallback/settings-drawer/word-modal/flashcard/progress-modal screens, plus settings.tsx's donation/ambassador/support modals and avatar/clear-vocab alerts, plus Home screen (index.tsx) section headers, library/study/progress/vocab/notes chrome, and BookshelfLibrary.tsx testament badges + chapter-count footers.

## Coexisting call-signature conventions (don't "normalize" these — they're all valid, pick per-file)
1. `useLanguage().t(key)` — dominant pattern, central keys in `constants/i18n.ts`.
2. Raw `t(lang, key)` imported directly from `constants/i18n.ts` (used in `daily.tsx`).
3. Inline `lang === 'pt' ? x : y` ternaries for one-off strings (`auth.tsx`, parts of `settings.tsx` main screen) — functionally correct, just stylistically different.
4. A local `t = (pt, en) => lang === 'en' ? en : pt` helper defined inside a component (`DonationModal`, `AmbassadorModal`, `SupportModal` in settings.tsx) — used for component-local one-off strings instead of polluting the central i18n.ts with single-use keys.

## Known intentionally-unfixed gaps (flagged in audit report, not bugs)
- `search.tsx`'s `POPULAR_TOPICS` array and `FEATURED_PASSAGES.titlePt` are Portuguese-only content-layer strings (shared with `bibleData.ts` structure) — translating them was judged too risky/low-value for the localization pass; still Portuguese when app language is English.
- `BookshelfLibrary.tsx`'s `CATEGORY_INFO.labelPt` field is dead code (never rendered — only `.base`/`.deep` colors are used).
- `settings.tsx`'s `ACCENT_COLORS` `label` field is dead code (never rendered in JSX).
- `BookshelfLibrary.tsx`'s `TAGLINE` (poetic PT subtitle under the English book title) and `ERA` (PT "EST. A.C./D.C." period stamps) are an intentional bilingual/antique-book design flourish on book cover art — left untouched by design judgment, not translated to follow app language.
- `ErrorFallback.tsx`'s dev-only `formatErrorDetails()` internals ("Error:"/"Stack Trace:") are developer diagnostic text, intentionally left English-only.
- `WordModal`'s `'(desconhecido)'` fallback and `VOCAB_PREVIEW`/vocab `def` fields are vocabulary *content* (always-Portuguese translation data), not UI chrome.

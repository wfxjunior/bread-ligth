---
name: i18n Language System
description: PT/EN language switching for Bread&Light — mobile app UI (mature) and web app UI (new, infra-only so far)
---

## Rule
All UI strings must be sourced from the app's i18n table via its `useLanguage().t(key)` hook. Never hardcode display strings.

**Why:** User requested EN/PT platform language toggle on mobile first, then web.

## Mobile (artifacts/mobile) — mature, near-full coverage
- `constants/i18n.ts` — defines `Lang` type (`'pt' | 'en'`), all translation keys, and `t(lang, key)` helper
- `context/LanguageContext.tsx` — provides `{ lang, setLang, t }` via `useLanguage()` hook
- `LanguageProvider` is in root `app/_layout.tsx` (wraps everything, outermost before ThemeProvider)
- AsyncStorage key: `@breadlight:lang`, default `'pt'` (native app's primary audience)
- App name everywhere: **Bread&Light**. Use `Bread{'&'}Light` in JSX. AsyncStorage keys still use `@bibliaeN:` prefix for unrelated data — do NOT change (breaks stored user data). `app.json` slug remains "goden".

### Naming conflict
In files with a local variable literally named `t` (e.g. a `.map(t => ...)` over theme objects), alias the hook: `const { lang, setLang, t: tl } = useLanguage();`

### Mobile translations coverage (audited 2026-07-14)
Tab bar, all settings sections/rows, profile+drawer stats, drawer nav/footer, daily screen (via raw `t(lang,key)` import), vocab/bookmarks/search/not-found/error-fallback/settings-drawer/word-modal/flashcard/progress-modal screens, donation/ambassador/support modals, avatar/clear-vocab alerts, Home screen section headers, library/study/progress/vocab/notes chrome, BookshelfLibrary testament badges + chapter-count footers.

### Coexisting call-signature conventions on mobile (don't "normalize" — all valid, pick per-file)
1. `useLanguage().t(key)` — dominant pattern, central keys in `constants/i18n.ts`.
2. Raw `t(lang, key)` imported directly from `constants/i18n.ts` (used in `daily.tsx`).
3. Inline `lang === 'pt' ? x : y` ternaries for one-off strings (`auth.tsx`, parts of `settings.tsx`).
4. A local `t = (pt, en) => lang === 'en' ? en : pt` helper defined inside a component (`DonationModal`, `AmbassadorModal`, `SupportModal`) — for component-local one-off strings.

### Known intentionally-unfixed gaps on mobile (flagged in audit, not bugs)
- `search.tsx`'s `POPULAR_TOPICS` array and `FEATURED_PASSAGES.titlePt` are Portuguese-only content-layer strings (shared with `bibleData.ts`) — left untranslated, judged too risky/low-value.
- `BookshelfLibrary.tsx`'s `CATEGORY_INFO.labelPt` and `settings.tsx`'s `ACCENT_COLORS.label` are dead code, never rendered.
- `BookshelfLibrary.tsx`'s `TAGLINE`/`ERA` (poetic PT subtitle + "EST. A.C./D.C." period stamps on book covers) are an intentional bilingual/antique-book design flourish — left untouched by design judgment.
- `ErrorFallback.tsx`'s dev-only `formatErrorDetails()` internals are developer diagnostic text, intentionally English-only.
- `WordModal`'s `'(desconhecido)'` fallback and vocab `def` fields are vocabulary *content* data, not UI chrome.

## Web (artifacts/bible-english) — infra + core chrome only (built 2026-07-14), full page audit still pending
- Web previously had ZERO i18n — this was built from scratch, structurally mirroring mobile but as its own independent system (separate storage, separate key table — the two apps do not share an i18n module).
- `src/lib/i18n.ts` — same `{pt,en}` table + `t(lang,key)` helper pattern as mobile.
- `src/context/language-context.tsx` — `LanguageProvider`/`useLanguage()`, localStorage key `bible-english:lang` (matches web's existing `bible-english:atmosphere` naming convention, intentionally NOT the mobile `@breadlight:lang` key — different storage namespace).
- **Default is `'en'`, not `'pt'`** (unlike mobile) — web had 100% hardcoded English strings before this change, so defaulting to English preserves existing users' experience; `'pt'` is opt-in via the new switcher.
- `LanguageProvider` wraps the app in `src/main.tsx`, outermost before `AtmosphereProvider`/`ReadingSpaceProvider`.
- Covered so far: sidebar nav labels + app name/tagline/plan badge (`components/layout.tsx`), all Settings tab labels, and the Settings → Language tab's own "App Language" switcher UI. Verified end-to-end with a testing subagent (switch, persistence across reload, revert).
- **Not yet covered**: page content on Home/Library/Book/Search/Vocabulary/Notes/Favorites/Journey/Devotionals/Reader — this is a known, deliberate scope cut (task was "build the switch," not "translate everything"); a full page-by-page audit like mobile's is separate follow-up work.
- Gotcha for testers/anyone navigating this artifact directly: the web app is served at base path `/bible-english/`, not `/` — the monorepo has multiple artifacts on one domain (also an Expo mobile app) via path-based routing. Always navigate to `/bible-english/<route>`, never bare `/<route>`, or you'll land on a different artifact.

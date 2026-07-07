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
- Daily screen buttons (keys exist, apply when editing daily.tsx)

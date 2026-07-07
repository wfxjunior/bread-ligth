---
name: Theme system
description: How dark/light/system theme preference is managed in the mobile app.
---

## Rule
`ThemeContext` (context/ThemeContext.tsx) owns the `themeMode: 'system' | 'light' | 'dark'` preference, persisted to AsyncStorage under `@bibliaeN:theme`. `useColors` reads `isDark` from `ThemeContext`, not directly from `useColorScheme`.

**Why:** Allows user to override system preference from Settings. Without ThemeContext, `useColorScheme` returns the OS setting only and cannot be overridden.

**How to apply:**
- Add new components: use `useColors()` as usual — it already reads the override.
- Settings toggle: call `setThemeMode('light' | 'dark' | 'system')` from `useTheme()`.
- Tab bar blur (CustomTabBar.tsx): uses `isDark ? 'dark' : 'extraLight'` for the BlurView tint.
- `ThemeProvider` wraps `BibleProvider` in `_layout.tsx`.

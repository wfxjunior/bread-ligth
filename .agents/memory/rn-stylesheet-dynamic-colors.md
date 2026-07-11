---
name: RN StyleSheet.create can't hold dynamic theme colors
description: Why converting a hardcoded color palette to a theme-driven one requires splitting layout from color in StyleSheet.create.
---

## Rule
`StyleSheet.create({...})` at module scope runs once when the file loads — any color baked into it (e.g. `color: SOME_CONSTANT.wine`) is frozen forever and cannot react to theme/atmosphere changes. If a screen's styles were written against a hardcoded palette constant and that constant becomes theme-derived (via `useColors()`/context), every color reference inside `StyleSheet.create` must move to an inline `style={[styles.foo, { color: dynamicColor }]}` override computed at render time. The `StyleSheet.create` block should keep only true layout (padding, flex, borderRadius, fontSize, etc).

**Why:** Hit this converting `app/daily.tsx` (Bread&Light mobile) from an always-dark hardcoded palette to atmosphere-driven colors — ~30 style keys had baked-in colors that silently kept rendering the old hardcoded hex values after the palette function became dynamic, until each was split into layout-only style + inline color prop.

**How to apply:** When making a previously-static screen theme-aware, grep the file for the old palette constant's usages inside `StyleSheet.create` specifically (not just anywhere in the file) — those are the ones that need the split, even if the same constant is already used correctly inline elsewhere.

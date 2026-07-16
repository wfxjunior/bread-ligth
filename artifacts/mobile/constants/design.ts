// ── Design tokens — the single source for type scale, spacing, radius and
// elevation. Derived from the values the app already uses most (see
// docs/layout-analysis-2026-07-16.md for the measured data), so adopting a
// token is a consolidation, not a redesign.
//
// Rules of thumb:
// - New code imports from here instead of hardcoding numbers.
// - Existing screens migrate opportunistically (when touched for other work).
// - Never do arithmetic on tokens (`radius.md - 2`) — pick the named variant.

import { StyleSheet, type ViewStyle } from 'react-native';

// ── Typography scale (8 steps) ────────────────────────────────────────────────
// caption 11 · small 12 · body 13 · bodyLg 15 · subtitle 17 · title 20 ·
// heading 24 · display 28. Screen headers use `heading`; anything below
// `caption` is too small to read and shouldn't exist.
export const fontSize = {
  caption: 11,
  small: 12,
  body: 13,
  bodyLg: 15,
  subtitle: 17,
  title: 20,
  heading: 24,
  display: 28,
} as const;

// UI text is Inter, scripture/serif accents are Lora — the app's two families.
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  serif: 'Lora_400Regular',
  serifItalic: 'Lora_400Regular_Italic',
  serifBold: 'Lora_700Bold',
} as const;

// ── Spacing (4px grid) ────────────────────────────────────────────────────────
// Screen gutter is `lg` (20). The odd in-between values found in the audit
// (9, 11, 14, 18) map to sm/8, md/12, lg-1 step… pick the nearest step.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 40,
} as const;

// ── Border radius ─────────────────────────────────────────────────────────────
// Named variants replace `colors.radius / 1.5`-style arithmetic. `pill` is for
// fully-rounded chips/badges.
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

// ── Elevation (shadow presets) ────────────────────────────────────────────────
// One place to tune shadows for dark atmospheres later. Spread each preset:
//   style={[styles.card, elevation.low]}
export const elevation: Record<'low' | 'mid' | 'high', ViewStyle> = {
  low: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  mid: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  high: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
};

// ── Semantic one-offs ─────────────────────────────────────────────────────────
// Colors that are intentionally theme-independent and were previously
// hardcoded in multiple screens.
export const semantic = {
  /** The "like/heart" red used on the verse-of-the-day and daily devotional. */
  heart: '#E8294B',
  /** Text/icons rendered on top of photos or dark gradients, regardless of theme. */
  onImage: '#FFFFFF',
} as const;

export const hairline = StyleSheet.hairlineWidth;

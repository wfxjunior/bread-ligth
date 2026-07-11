// ── Reading atmospheres ─────────────────────────────────────────────────────────
// A curated, non-photographic palette system. Each atmosphere fully defines the
// app's surfaces (background/surface/card), typography contrast, dividers, a
// curated secondary accent, and a selection tint. The user's chosen brand
// AccentColor (below) always overrides the interactive "primary" color, so an
// atmosphere never fights the user's accent — it only sets the mood around it.
export type Atmosphere =
  | 'parchment' | 'cozy' | 'classic' | 'dark' | 'night'
  | 'library' | 'morning' | 'minimal' | 'sepia' | 'focus';
export type AccentColor = 'royal-blue' | 'burgundy' | 'forest' | 'slate' | 'violet';

interface AtmosphereBase {
  background: string; surface: string; card: string; foreground: string;
  mutedForeground: string; divider: string;
  secondaryAccent: string; selection: string;
  portugueseText: string; isDark: boolean;
}

const ATMOSPHERES: Record<Atmosphere, AtmosphereBase> = {
  // Warm ivory paper inspired by ancient manuscripts
  parchment: {
    background:      '#F6F1E4',
    surface:         '#EFE7D2',
    card:            '#FBF7EC',
    foreground:      '#4A3D2C',
    mutedForeground: '#8A7A5F',
    divider:         '#E4D9BE',
    secondaryAccent: '#B08D4F',
    selection:       'rgba(139,94,52,0.16)',
    portugueseText:  '#6B5636',
    isDark: false,
  },
  // Warm beige, soft ambient tones — comfortable for long sessions
  cozy: {
    background:      '#F2E9DC',
    surface:         '#E9DCC5',
    card:            '#F8F1E4',
    foreground:      '#4F4030',
    mutedForeground: '#8F7D68',
    divider:         '#DFD0B8',
    secondaryAccent: '#C9A06A',
    selection:       'rgba(166,105,59,0.15)',
    portugueseText:  '#75603F',
    isDark: false,
  },
  // Traditional Bible paper with subtle texture — the app's default
  classic: {
    background:      '#FAF8F4',
    surface:         '#EEEBE6',
    card:            '#FEFDFB',
    foreground:      '#392E28',
    mutedForeground: '#7E6F67',
    divider:         '#E7E2DA',
    secondaryAccent: '#9C7A4A',
    selection:       'rgba(107,30,42,0.12)',
    portugueseText:  '#5C4A40',
    isDark: false,
  },
  // Elegant dark mode — charcoal, deep burgundy and antique gold
  dark: {
    background:      '#171413',
    surface:         '#211C1A',
    card:            '#271F1D',
    foreground:      '#EDE3D6',
    mutedForeground: '#A79C8E',
    divider:         '#372E2A',
    secondaryAccent: '#C9A15A',
    selection:       'rgba(201,161,90,0.18)',
    portugueseText:  '#D8B98A',
    isDark: true,
  },
  // Deep blue-black, optimized for reading at night
  night: {
    background:      '#0C0F16',
    surface:         '#141926',
    card:            '#181E2B',
    foreground:      '#DCE2EC',
    mutedForeground: '#8791A3',
    divider:         '#242B3B',
    secondaryAccent: '#6E8FC4',
    selection:       'rgba(110,143,196,0.16)',
    portugueseText:  '#A9B6CC',
    isDark: true,
  },
  // Old wooden libraries — warm walnut tones and soft shadows
  library: {
    background:      '#241A12',
    surface:         '#312417',
    card:            '#3A2B1C',
    foreground:      '#E8D9C2',
    mutedForeground: '#A88F72',
    divider:         '#4C3827',
    secondaryAccent: '#B4813F',
    selection:       'rgba(180,129,63,0.20)',
    portugueseText:  '#CBA876',
    isDark: true,
  },
  // Soft cream with warm natural light
  morning: {
    background:      '#FFF8EC',
    surface:         '#FBEDD3',
    card:            '#FFFCF5',
    foreground:      '#4A3B28',
    mutedForeground: '#9C8B6E',
    divider:         '#F0DFBE',
    secondaryAccent: '#E3B873',
    selection:       'rgba(217,138,61,0.14)',
    portugueseText:  '#7A6440',
    isDark: false,
  },
  // Pure off-white background with maximum whitespace
  minimal: {
    background:      '#FFFFFF',
    surface:         '#FAFAFA',
    card:            '#FFFFFF',
    foreground:      '#1A1A1A',
    mutedForeground: '#888888',
    divider:         '#EDEDED',
    secondaryAccent: '#8A8A8A',
    selection:       'rgba(0,0,0,0.06)',
    portugueseText:  '#4A4A4A',
    isDark: false,
  },
  // Classic reading experience inspired by old books — golden aged-paper tone
  sepia: {
    background:      '#E8D9BC',
    surface:         '#DECAA5',
    card:            '#F0E2C4',
    foreground:      '#3E2E1A',
    mutedForeground: '#7A6142',
    divider:         '#CBB48A',
    secondaryAccent: '#A67B3D',
    selection:       'rgba(122,74,34,0.18)',
    portugueseText:  '#5C4322',
    isDark: false,
  },
  // Low-contrast neutral gray — designed to reduce distractions
  focus: {
    background:      '#E9E9E9',
    surface:         '#DFDFDF',
    card:            '#EFEFEF',
    foreground:      '#3A3A3A',
    mutedForeground: '#7C7C7C',
    divider:         '#D2D2D2',
    secondaryAccent: '#8A8A8A',
    selection:       'rgba(0,0,0,0.08)',
    portugueseText:  '#5A5A5A',
    isDark: false,
  },
};

// ── Accent colors ─────────────────────────────────────────────────────────────
interface AccentBase {
  primary: string; primaryForeground: string;
  englishTextLight: string; englishTextDark: string;
}

const ACCENTS: Record<AccentColor, AccentBase> = {
  'royal-blue': { primary: '#1B3A6B', primaryForeground: '#FFFFFF',  englishTextLight: '#1B3A6B', englishTextDark: '#8BBFDD' },
  // Burgundy matches the web app's primary: hsl(353, 43%, 30%) = #6B1E2A
  // primaryForeground matches web app's primary-foreground: hsl(36, 33%, 97%) = #FAF8F4
  burgundy:     { primary: '#6B1E2A', primaryForeground: '#FAF8F4',  englishTextLight: '#6B1E2A', englishTextDark: '#C87A8A' },
  forest:       { primary: '#1E4D2B', primaryForeground: '#FFFFFF',  englishTextLight: '#1E4D2B', englishTextDark: '#7BBF8B' },
  slate:        { primary: '#3D4A5C', primaryForeground: '#FFFFFF',  englishTextLight: '#3D4A5C', englishTextDark: '#8FA0B8' },
  violet:       { primary: '#3B1E6B', primaryForeground: '#FFFFFF',  englishTextLight: '#3B1E6B', englishTextDark: '#9A7BD5' },
};

// ── Palette builder ───────────────────────────────────────────────────────────
export function getColors(atmosphere: Atmosphere, accentColor: AccentColor) {
  const t = ATMOSPHERES[atmosphere];
  const a = ACCENTS[accentColor];
  const isDark = t.isDark;
  // The accent (verse numbers, active labels, icon tints) uses the primary brand
  // color — dark version on dark atmospheres so it stays legible. The brand
  // accent always wins over the atmosphere's own tone (user preference).
  const accentTint = isDark ? a.englishTextDark : a.englishTextLight;
  return {
    isDark,
    // surfaces
    background:           t.background,
    surface:               t.surface,
    card:                 t.card,
    foreground:           t.foreground,
    cardForeground:       t.foreground,
    text:                 t.foreground,
    tint:                 a.primary,
    // brand (user-controlled — overrides the atmosphere's own accent)
    primary:              a.primary,
    primaryForeground:    a.primaryForeground,
    // neutral
    secondary:            t.surface,
    secondaryForeground:  t.foreground,
    muted:                t.surface,
    mutedForeground:      t.mutedForeground,
    // accent — follows the selected primary brand color (no hardcoded gold)
    accent:               accentTint,
    accentForeground:     a.primaryForeground,
    // atmosphere-curated secondary tone (badges, progress, decorative accents)
    secondaryAccent:      t.secondaryAccent,
    // selection / active-state tint, curated per atmosphere
    selection:            t.selection,
    // state
    destructive:          isDark ? '#E53E3E' : '#D93025',
    destructiveForeground:'#FFFFFF' as const,
    // edges
    border:               t.divider,
    divider:              t.divider,
    input:                t.divider,
    // reading
    englishText:          accentTint,
    portugueseText:       t.portugueseText,
    verseNumber:          accentTint,
    // system
    radius:               12 as const,
  };
}

export type ColorPalette = ReturnType<typeof getColors>;

// ── Legacy default export (kept for any direct consumer) ──────────────────────
const colors = {
  light:  getColors('classic', 'burgundy'),
  dark:   getColors('night',   'burgundy'),
  radius: 12,
};
export default colors;

// ── Atmosphere metadata for previews (settings screen cards) ──────────────────
// Small helper so the settings UI can render a palette-swatch preview card for
// each atmosphere without duplicating the color data above.
export const ATMOSPHERE_IDS: Atmosphere[] = [
  'parchment', 'cozy', 'classic', 'dark', 'night',
  'library', 'morning', 'minimal', 'sepia', 'focus',
];

export function getAtmospherePreview(id: Atmosphere) {
  const t = ATMOSPHERES[id];
  return {
    background: t.background,
    surface:    t.surface,
    card:       t.card,
    foreground: t.foreground,
    secondaryAccent: t.secondaryAccent,
    isDark:     t.isDark,
  };
}

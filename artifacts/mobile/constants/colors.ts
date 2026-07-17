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
  /** Free forever (`classic`, the app default) vs. Premium-gated (everything else). */
  premium: boolean;
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
    premium: true,
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
    premium: true,
  },
  // Near-white paper with a whisper of warmth — the app's default.
  // Lightened from the original #FAF8F4 so the default feels airy and
  // Apple-clean while cards (#FFFFFF) still lift subtly off the page.
  classic: {
    background:      '#FCFBF8',
    surface:         '#F2F0EB',
    card:            '#FFFFFF',
    foreground:      '#392E28',
    mutedForeground: '#7E6F67',
    divider:         '#EAE6DF',
    secondaryAccent: '#9C7A4A',
    selection:       'rgba(107,30,42,0.10)',
    portugueseText:  '#5C4A40',
    isDark: false,
    premium: false,
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
    premium: true,
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
    premium: true,
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
    premium: true,
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
    premium: true,
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
    premium: true,
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
    premium: true,
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
    premium: true,
  },
};

// ── Accent colors ─────────────────────────────────────────────────────────────
interface AccentBase {
  primary: string; primaryForeground: string;
  englishTextLight: string; englishTextDark: string;
  /** Free forever (`burgundy`, the app default) vs. Premium-gated (everything else). */
  premium: boolean;
}

const ACCENTS: Record<AccentColor, AccentBase> = {
  'royal-blue': { primary: '#1B3A6B', primaryForeground: '#FFFFFF',  englishTextLight: '#1B3A6B', englishTextDark: '#8BBFDD', premium: true },
  // Burgundy matches the web app's primary: hsl(353, 43%, 30%) = #6B1E2A
  // primaryForeground matches web app's primary-foreground: hsl(36, 33%, 97%) = #FAF8F4
  burgundy:     { primary: '#6B1E2A', primaryForeground: '#FAF8F4',  englishTextLight: '#6B1E2A', englishTextDark: '#C87A8A', premium: false },
  forest:       { primary: '#1E4D2B', primaryForeground: '#FFFFFF',  englishTextLight: '#1E4D2B', englishTextDark: '#7BBF8B', premium: true },
  slate:        { primary: '#3D4A5C', primaryForeground: '#FFFFFF',  englishTextLight: '#3D4A5C', englishTextDark: '#8FA0B8', premium: true },
  violet:       { primary: '#3B1E6B', primaryForeground: '#FFFFFF',  englishTextLight: '#3B1E6B', englishTextDark: '#9A7BD5', premium: true },
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
    premium:    t.premium,
  };
}

// ── Premium gating — default atmosphere/accent stay free forever ──────────────
// Mirrors the web app's gating boundary (see `lib/atmospheres.ts` there): only
// the app default (`classic` atmosphere, `burgundy` accent) is free; every
// other atmosphere/accent requires BreadLight Premium.
export const ACCENT_IDS: AccentColor[] = ['royal-blue', 'burgundy', 'forest', 'slate', 'violet'];

export function isAtmospherePremium(id: Atmosphere): boolean {
  return ATMOSPHERES[id].premium;
}

export function isAccentPremium(id: AccentColor): boolean {
  return ACCENTS[id].premium;
}

// ── Reading Spaces — calm, atmosphere-based reading modes ──────────────────────
// Each space is a quiet mood: a soft background gradient, a light/dark flag for
// legibility, and a harmonized accent used for devotional emphasis and subtle
// highlights. No emoji, no novelty — just atmosphere.
export type ReadingSpace =
  | 'clean' | 'warm' | 'cozy' | 'nature' | 'morning' | 'evening' | 'classic' | 'modern' | 'serenity';

export interface ReadingSpaceData {
  gradient: readonly [string, string, string];
  isDark:   boolean;
  /** Harmonized accent — used for devotional highlights, gold rules, quiet emphasis. */
  accent:   string;
  /** Very subtle wash applied to cards/surfaces to tie them to the space. */
  overlay:  string;
}

export const READING_SPACES: Record<ReadingSpace, ReadingSpaceData> = {
  clean:    { isDark: false, gradient: ['#FFFFFF', '#F8F8F9', '#F1F1F3'], accent: '#3D4A5C', overlay: 'rgba(61,74,92,0.03)' },
  warm:     { isDark: false, gradient: ['#FFF9EF', '#FBEFD9', '#F5E2C0'], accent: '#B8842E', overlay: 'rgba(184,132,46,0.05)' },
  cozy:     { isDark: false, gradient: ['#FBF1EC', '#F5E1D4', '#EACEBB'], accent: '#A85D3F', overlay: 'rgba(168,93,63,0.05)' },
  nature:   { isDark: false, gradient: ['#F4F7F0', '#E6EEDE', '#D6E3C9'], accent: '#4C7A4E', overlay: 'rgba(76,122,78,0.05)' },
  morning:  { isDark: false, gradient: ['#FDF8EF', '#F6ECDA', '#EBDFC3'], accent: '#C79A4B', overlay: 'rgba(199,154,75,0.05)' },
  evening:  { isDark: true,  gradient: ['#211A2E', '#2C2340', '#1B1526'], accent: '#B79ADB', overlay: 'rgba(183,154,219,0.07)' },
  classic:  { isDark: false, gradient: ['#FAF8F4', '#F1ECE2', '#E7DECD'], accent: '#6B1E2A', overlay: 'rgba(107,30,42,0.04)' },
  modern:   { isDark: false, gradient: ['#F5F7F9', '#E9EDF1', '#DCE3EA'], accent: '#2F4C68', overlay: 'rgba(47,76,104,0.04)' },
  serenity: { isDark: true,  gradient: ['#0B111E', '#111B2E', '#0A0E18'], accent: '#7FA6D6', overlay: 'rgba(127,166,214,0.06)' },
};

/** Legacy background-template ids → sensible Reading Space defaults (migration only). */
export const LEGACY_TEMPLATE_TO_SPACE: Record<string, ReadingSpace> = {
  none: 'clean', golf: 'nature', soccer: 'evening', business: 'serenity',
  sky: 'morning', forest: 'nature', sunset: 'warm', car: 'serenity',
};

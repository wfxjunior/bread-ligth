// ── Reading themes ────────────────────────────────────────────────────────────
export type ReadingTheme = 'classic' | 'oxford' | 'scholar' | 'night' | 'notebook';
export type AccentColor  = 'royal-blue' | 'burgundy' | 'forest' | 'slate' | 'violet';

interface ThemeBase {
  background: string; card: string; foreground: string;
  secondary: string; muted: string; mutedForeground: string;
  border: string; accentForeground: string;
  portugueseText: string; isDark: boolean;
}

const THEMES: Record<ReadingTheme, ThemeBase> = {
  // Exact match of web app "Parchment and Burgundy" light mode palette
  classic: {
    background:      '#FAF8F4',
    card:            '#FEFDFB',
    foreground:      '#392E28',
    secondary:       '#EEEBE6',
    muted:           '#EEEBE6',
    mutedForeground: '#7E6F67',
    border:          '#E7E2DA',
    accentForeground:'#392E28',
    portugueseText:  '#5C4A40',
    isDark: false,
  },
  oxford: {
    background:      '#FFFFFF',
    card:            '#F7F7F7',
    foreground:      '#111111',
    secondary:       '#F0F0F0',
    muted:           '#F3F3F3',
    mutedForeground: '#777777',
    border:          '#E5E5E5',
    accentForeground:'#111111',
    portugueseText:  '#4A3520',
    isDark: false,
  },
  scholar: {
    background:      '#ECEAE6',
    card:            '#F4F2EF',
    foreground:      '#2A2A35',
    secondary:       '#E4E2DE',
    muted:           '#E4E2DE',
    mutedForeground: '#7A7870',
    border:          '#D8D6D0',
    accentForeground:'#2A2A35',
    portugueseText:  '#4A3520',
    isDark: false,
  },
  // Exact match of web app dark mode palette
  night: {
    background:      '#1C1E22',
    card:            '#202327',
    foreground:      '#E0D6D1',
    secondary:       '#292C32',
    muted:           '#292C32',
    mutedForeground: '#A3968F',
    border:          '#2E3138',
    accentForeground:'#E0D6D1',
    portugueseText:  '#C4B8B0',
    isDark: true,
  },
  notebook: {
    background:      '#FEF9F0',
    card:            '#FFFDF7',
    foreground:      '#1A1A2E',
    secondary:       '#F5EEE0',
    muted:           '#F5EEE0',
    mutedForeground: '#8A8070',
    border:          '#E8E0D0',
    accentForeground:'#1A1A2E',
    portugueseText:  '#4A3520',
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
export function getColors(readingTheme: ReadingTheme, accentColor: AccentColor) {
  const t = THEMES[readingTheme];
  const a = ACCENTS[accentColor];
  const isDark = t.isDark;
  // The accent (verse numbers, active labels, icon tints) uses the primary brand
  // color — dark version on dark themes so it stays legible.
  const accentTint = isDark ? a.englishTextDark : a.englishTextLight;
  return {
    isDark,
    // surfaces
    background:           t.background,
    card:                 t.card,
    foreground:           t.foreground,
    cardForeground:       t.foreground,
    text:                 t.foreground,
    tint:                 a.primary,
    // brand (user-controlled)
    primary:              a.primary,
    primaryForeground:    a.primaryForeground,
    // neutral
    secondary:            t.secondary,
    secondaryForeground:  t.foreground,
    muted:                t.muted,
    mutedForeground:      t.mutedForeground,
    // accent — follows the selected primary brand color (no hardcoded gold)
    accent:               accentTint,
    accentForeground:     a.primaryForeground,
    // state
    destructive:          isDark ? '#E53E3E' : '#D93025',
    destructiveForeground:'#FFFFFF' as const,
    // edges
    border:               t.border,
    input:                t.border,
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

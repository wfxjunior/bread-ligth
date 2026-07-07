// ── Reading themes ────────────────────────────────────────────────────────────
export type ReadingTheme = 'classic' | 'oxford' | 'scholar' | 'night' | 'notebook';
export type AccentColor  = 'royal-blue' | 'burgundy' | 'forest' | 'slate' | 'violet' | 'amber';

interface ThemeBase {
  background: string; card: string; foreground: string;
  secondary: string; muted: string; mutedForeground: string;
  border: string; accentForeground: string;
  portugueseText: string; isDark: boolean;
}

const THEMES: Record<ReadingTheme, ThemeBase> = {
  classic: {
    background:     '#F7F3EC',
    card:           '#FFFFFF',
    foreground:     '#1A1A2E',
    secondary:      '#EDE8DF',
    muted:          '#EDE8DF',
    mutedForeground:'#8A8070',
    border:         '#DDD8CE',
    accentForeground:'#1A1A2E',
    portugueseText: '#4A3520',
    isDark: false,
  },
  oxford: {
    background:     '#FFFFFF',
    card:           '#F7F7F7',
    foreground:     '#111111',
    secondary:      '#F0F0F0',
    muted:          '#F3F3F3',
    mutedForeground:'#777777',
    border:         '#E5E5E5',
    accentForeground:'#111111',
    portugueseText: '#4A3520',
    isDark: false,
  },
  scholar: {
    background:     '#ECEAE6',
    card:           '#F4F2EF',
    foreground:     '#2A2A35',
    secondary:      '#E4E2DE',
    muted:          '#E4E2DE',
    mutedForeground:'#7A7870',
    border:         '#D8D6D0',
    accentForeground:'#2A2A35',
    portugueseText: '#4A3520',
    isDark: false,
  },
  night: {
    background:     '#0D1B2A',
    card:           '#162235',
    foreground:     '#EDE8DF',
    secondary:      '#1E2D40',
    muted:          '#1E2D40',
    mutedForeground:'#8A9BAD',
    border:         '#243347',
    accentForeground:'#EDE8DF',
    portugueseText: '#C4B49E',
    isDark: true,
  },
  notebook: {
    background:     '#FEF9F0',
    card:           '#FFFDF7',
    foreground:     '#1A1A2E',
    secondary:      '#F5EEE0',
    muted:          '#F5EEE0',
    mutedForeground:'#8A8070',
    border:         '#E8E0D0',
    accentForeground:'#1A1A2E',
    portugueseText: '#4A3520',
    isDark: false,
  },
};

// ── Accent colors ─────────────────────────────────────────────────────────────
interface AccentBase {
  primary: string; primaryForeground: string;
  englishTextLight: string; englishTextDark: string;
}

const ACCENTS: Record<AccentColor, AccentBase> = {
  'royal-blue': { primary: '#1B3A6B', primaryForeground: '#FFFFFF', englishTextLight: '#1B3A6B', englishTextDark: '#8BBFDD' },
  burgundy:     { primary: '#6B1E2A', primaryForeground: '#FFFFFF', englishTextLight: '#6B1E2A', englishTextDark: '#C87A8A' },
  forest:       { primary: '#1E4D2B', primaryForeground: '#FFFFFF', englishTextLight: '#1E4D2B', englishTextDark: '#7BBF8B' },
  slate:        { primary: '#3D4A5C', primaryForeground: '#FFFFFF', englishTextLight: '#3D4A5C', englishTextDark: '#8FA0B8' },
  violet:       { primary: '#3B1E6B', primaryForeground: '#FFFFFF', englishTextLight: '#3B1E6B', englishTextDark: '#9A7BD5' },
  amber:        { primary: '#7A5C1E', primaryForeground: '#FFFFFF', englishTextLight: '#7A5C1E', englishTextDark: '#C4A060' },
};

// ── Palette builder ───────────────────────────────────────────────────────────
export function getColors(readingTheme: ReadingTheme, accentColor: AccentColor) {
  const t = THEMES[readingTheme];
  const a = ACCENTS[accentColor];
  const isDark = t.isDark;
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
    // highlight — always amber-gold
    accent:               '#C4922A' as const,
    accentForeground:     t.accentForeground,
    // state
    destructive:          isDark ? '#E53E3E' : '#D93025',
    destructiveForeground:'#FFFFFF' as const,
    // edges
    border:               t.border,
    input:                t.border,
    // reading
    englishText:          isDark ? a.englishTextDark : a.englishTextLight,
    portugueseText:       t.portugueseText,
    verseNumber:          '#C4922A' as const,
    // system
    radius:               12 as const,
  };
}

export type ColorPalette = ReturnType<typeof getColors>;

// ── Legacy default export (kept for any direct consumer) ──────────────────────
const colors = {
  light:  getColors('classic', 'royal-blue'),
  dark:   getColors('night',   'royal-blue'),
  radius: 12,
};
export default colors;

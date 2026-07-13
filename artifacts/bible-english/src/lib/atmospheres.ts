// ── Reading Atmospheres — the base color system, shared with mobile ──────────
// Mirrors artifacts/mobile/constants/colors.ts exactly (same 10 atmosphere
// names/hex values, same 5 accent names/hex values) so switching palettes on
// web produces the same result a mobile user already gets. This is the base
// "skin" of the app (background/surface/card/foreground/primary) — distinct
// from the Reading Space background-mood system (see lib/reading-spaces.ts),
// which is an independent, orthogonal overlay and must keep working unchanged.
export type Atmosphere =
  | 'parchment' | 'cozy' | 'classic' | 'dark' | 'night'
  | 'library' | 'morning' | 'minimal' | 'sepia' | 'focus';

export type AccentColor = 'royal-blue' | 'burgundy' | 'forest' | 'slate' | 'violet';

interface AtmosphereBase {
  background: string;
  surface: string;
  card: string;
  foreground: string;
  mutedForeground: string;
  divider: string;
  secondaryAccent: string;
  isDark: boolean;
  label: string;
}

// Ported verbatim from mobile's ATMOSPHERES — do not invent new colors here.
export const ATMOSPHERES: Record<Atmosphere, AtmosphereBase> = {
  parchment: {
    background: '#F6F1E4', surface: '#EFE7D2', card: '#FBF7EC',
    foreground: '#4A3D2C', mutedForeground: '#8A7A5F', divider: '#E4D9BE',
    secondaryAccent: '#B08D4F', isDark: false, label: 'Parchment',
  },
  cozy: {
    background: '#F2E9DC', surface: '#E9DCC5', card: '#F8F1E4',
    foreground: '#4F4030', mutedForeground: '#8F7D68', divider: '#DFD0B8',
    secondaryAccent: '#C9A06A', isDark: false, label: 'Cozy',
  },
  classic: {
    background: '#FAF8F4', surface: '#EEEBE6', card: '#FEFDFB',
    foreground: '#392E28', mutedForeground: '#7E6F67', divider: '#E7E2DA',
    secondaryAccent: '#9C7A4A', isDark: false, label: 'Classic',
  },
  dark: {
    background: '#171413', surface: '#211C1A', card: '#271F1D',
    foreground: '#EDE3D6', mutedForeground: '#A79C8E', divider: '#372E2A',
    secondaryAccent: '#C9A15A', isDark: true, label: 'Dark',
  },
  night: {
    background: '#0C0F16', surface: '#141926', card: '#181E2B',
    foreground: '#DCE2EC', mutedForeground: '#8791A3', divider: '#242B3B',
    secondaryAccent: '#6E8FC4', isDark: true, label: 'Night',
  },
  library: {
    background: '#241A12', surface: '#312417', card: '#3A2B1C',
    foreground: '#E8D9C2', mutedForeground: '#A88F72', divider: '#4C3827',
    secondaryAccent: '#B4813F', isDark: true, label: 'Library',
  },
  morning: {
    background: '#FFF8EC', surface: '#FBEDD3', card: '#FFFCF5',
    foreground: '#4A3B28', mutedForeground: '#9C8B6E', divider: '#F0DFBE',
    secondaryAccent: '#E3B873', isDark: false, label: 'Morning',
  },
  minimal: {
    background: '#FFFFFF', surface: '#FAFAFA', card: '#FFFFFF',
    foreground: '#1A1A1A', mutedForeground: '#888888', divider: '#EDEDED',
    secondaryAccent: '#8A8A8A', isDark: false, label: 'Minimal',
  },
  sepia: {
    background: '#E8D9BC', surface: '#DECAA5', card: '#F0E2C4',
    foreground: '#3E2E1A', mutedForeground: '#7A6142', divider: '#CBB48A',
    secondaryAccent: '#A67B3D', isDark: false, label: 'Sepia',
  },
  focus: {
    background: '#E9E9E9', surface: '#DFDFDF', card: '#EFEFEF',
    foreground: '#3A3A3A', mutedForeground: '#7C7C7C', divider: '#D2D2D2',
    secondaryAccent: '#8A8A8A', isDark: false, label: 'Focus',
  },
};

export const ATMOSPHERE_ORDER: Atmosphere[] = [
  'parchment', 'cozy', 'classic', 'dark', 'night',
  'library', 'morning', 'minimal', 'sepia', 'focus',
];

interface AccentBase {
  primary: string;
  primaryForeground: string;
  label: string;
}

// Ported verbatim from mobile's ACCENTS.
export const ACCENTS: Record<AccentColor, AccentBase> = {
  'royal-blue': { primary: '#1B3A6B', primaryForeground: '#FFFFFF', label: 'Royal Blue' },
  burgundy:     { primary: '#6B1E2A', primaryForeground: '#FAF8F4', label: 'Burgundy' },
  forest:       { primary: '#1E4D2B', primaryForeground: '#FFFFFF', label: 'Forest' },
  slate:        { primary: '#3D4A5C', primaryForeground: '#FFFFFF', label: 'Slate' },
  violet:       { primary: '#3B1E6B', primaryForeground: '#FFFFFF', label: 'Violet' },
};

export const ACCENT_ORDER: AccentColor[] = ['royal-blue', 'burgundy', 'forest', 'slate', 'violet'];

export const ATMOSPHERE_STORAGE_KEY = 'bible-english:atmosphere';
export const ACCENT_STORAGE_KEY = 'bible-english:accentColor';
export const DEFAULT_ATMOSPHERE: Atmosphere = 'classic';
export const DEFAULT_ACCENT: AccentColor = 'burgundy';

// ── Color conversion ──────────────────────────────────────────────────────────
// The app's CSS variables are HSL triples ("H S% L%") consumed via hsl(var(--x)).
// Convert each atmosphere/accent hex value to that format at runtime so we don't
// have to hand-maintain 50 parallel HSL palettes.
function hexToHslTriple(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const delta = max - min;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / delta) % 6; break;
      case g: h = (b - r) / delta + 2; break;
      default: h = (r - g) / delta + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Builds the full set of CSS custom-property values for a given atmosphere +
 * accent combination. Keys match the `--foo` variables declared in index.css.
 */
export function buildAtmosphereCssVars(atmosphere: Atmosphere, accentColor: AccentColor): Record<string, string> {
  const t = ATMOSPHERES[atmosphere];
  const a = ACCENTS[accentColor];
  const destructive = t.isDark ? '#E53E3E' : '#D93025';

  const vars: Record<string, string> = {
    '--background': hexToHslTriple(t.background),
    '--foreground': hexToHslTriple(t.foreground),
    '--border': hexToHslTriple(t.divider),
    '--card': hexToHslTriple(t.card),
    '--card-foreground': hexToHslTriple(t.foreground),

    '--sidebar': hexToHslTriple(t.surface),
    '--sidebar-foreground': hexToHslTriple(t.foreground),
    '--sidebar-border': hexToHslTriple(t.divider),
    '--sidebar-primary': hexToHslTriple(a.primary),
    '--sidebar-primary-foreground': hexToHslTriple(a.primaryForeground),
    '--sidebar-accent': hexToHslTriple(t.surface),
    '--sidebar-accent-foreground': hexToHslTriple(t.foreground),
    '--sidebar-ring': hexToHslTriple(a.primary),

    '--popover': hexToHslTriple(t.card),
    '--popover-foreground': hexToHslTriple(t.foreground),

    '--primary': hexToHslTriple(a.primary),
    '--primary-foreground': hexToHslTriple(a.primaryForeground),

    '--secondary': hexToHslTriple(t.secondaryAccent),
    '--secondary-foreground': hexToHslTriple(t.isDark ? '#FFFFFF' : t.foreground),

    '--muted': hexToHslTriple(t.surface),
    '--muted-foreground': hexToHslTriple(t.mutedForeground),

    '--accent': hexToHslTriple(t.surface),
    '--accent-foreground': hexToHslTriple(t.foreground),

    '--destructive': hexToHslTriple(destructive),
    '--destructive-foreground': '0 0% 100%',

    '--input': hexToHslTriple(t.divider),
    '--ring': hexToHslTriple(a.primary),

    '--chart-1': hexToHslTriple(a.primary),
    '--chart-2': hexToHslTriple(t.secondaryAccent),
    '--chart-3': hexToHslTriple(t.foreground),
    '--chart-4': hexToHslTriple(t.divider),
    '--chart-5': hexToHslTriple(t.surface),
  };
  return vars;
}

export function getAtmospherePreview(id: Atmosphere) {
  const t = ATMOSPHERES[id];
  return {
    background: t.background,
    card: t.card,
    foreground: t.foreground,
    secondaryAccent: t.secondaryAccent,
    isDark: t.isDark,
    label: t.label,
  };
}

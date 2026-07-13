// ── Reading Spaces — calm, atmosphere-based reading modes ────────────────────
// Mirrors artifacts/mobile/constants/colors.ts `READING_SPACES` so the web app
// shares the same 9 named presets and branding as the mobile app. Each space is
// a quiet mood: a soft background gradient, a light/dark flag for legibility,
// and a harmonized accent used for subtle emphasis. No emoji, no novelty.
export type ReadingSpace =
  | 'clean' | 'warm' | 'cozy' | 'nature' | 'morning' | 'evening' | 'classic' | 'modern' | 'serenity';

export interface ReadingSpaceData {
  /** 3-stop gradient, top → bottom. */
  gradient: readonly [string, string, string];
  isDark: boolean;
  /** Harmonized accent — used for quiet emphasis, active-state rings. */
  accent: string;
  /** Very subtle wash applied to cards/surfaces to tie them to the space. */
  overlay: string;
  /** English display name — matches the mobile app's `space_*` i18n strings. */
  label: string;
}

export const READING_SPACES: Record<ReadingSpace, ReadingSpaceData> = {
  clean:    { isDark: false, gradient: ['#FFFFFF', '#F8F8F9', '#F1F1F3'], accent: '#3D4A5C', overlay: 'rgba(61,74,92,0.03)',   label: 'Clean' },
  warm:     { isDark: false, gradient: ['#FFF9EF', '#FBEFD9', '#F5E2C0'], accent: '#B8842E', overlay: 'rgba(184,132,46,0.05)', label: 'Warm' },
  cozy:     { isDark: false, gradient: ['#FBF1EC', '#F5E1D4', '#EACEBB'], accent: '#A85D3F', overlay: 'rgba(168,93,63,0.05)',  label: 'Cozy' },
  nature:   { isDark: false, gradient: ['#F4F7F0', '#E6EEDE', '#D6E3C9'], accent: '#4C7A4E', overlay: 'rgba(76,122,78,0.05)',  label: 'Nature' },
  morning:  { isDark: false, gradient: ['#FDF8EF', '#F6ECDA', '#EBDFC3'], accent: '#C79A4B', overlay: 'rgba(199,154,75,0.05)', label: 'Morning' },
  evening:  { isDark: true,  gradient: ['#211A2E', '#2C2340', '#1B1526'], accent: '#B79ADB', overlay: 'rgba(183,154,219,0.07)', label: 'Evening' },
  classic:  { isDark: false, gradient: ['#FAF8F4', '#F1ECE2', '#E7DECD'], accent: '#6B1E2A', overlay: 'rgba(107,30,42,0.04)',  label: 'Classic' },
  modern:   { isDark: false, gradient: ['#F5F7F9', '#E9EDF1', '#DCE3EA'], accent: '#2F4C68', overlay: 'rgba(47,76,104,0.04)',  label: 'Modern' },
  serenity: { isDark: true,  gradient: ['#0B111E', '#111B2E', '#0A0E18'], accent: '#7FA6D6', overlay: 'rgba(127,166,214,0.06)', label: 'Serenity' },
};

export const READING_SPACE_ORDER: ReadingSpace[] = [
  'clean', 'warm', 'cozy', 'nature', 'morning', 'evening', 'classic', 'modern', 'serenity',
];

export function gradientCss(g: readonly [string, string, string]) {
  return `linear-gradient(165deg, ${g[0]} 0%, ${g[1]} 55%, ${g[2]} 100%)`;
}

export const READING_SPACE_STORAGE_KEY = 'bible-english:readingSpace';
export const DEFAULT_READING_SPACE: ReadingSpace = 'classic';

import { useTheme } from '@/context/ThemeContext';
import colors from '@/constants/colors';

/**
 * Returns the design tokens for the current color scheme.
 *
 * Reads `isDark` from ThemeContext, which can be overridden by the user in
 * Settings (system / light / dark). Falls back to the light palette when the
 * dark key is absent from constants/colors.ts.
 */
export function useColors() {
  const { isDark } = useTheme();
  const palette: typeof colors.light =
    isDark && 'dark' in colors
      ? (colors as { dark: typeof colors.light }).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}

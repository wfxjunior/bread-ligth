import { useTheme } from '@/context/ThemeContext';
import { getColors } from '@/constants/colors';

/**
 * Returns the design-token palette for the current reading theme + accent color.
 * Both are user-controlled and persisted in ThemeContext.
 */
export function useColors() {
  const { readingTheme, accentColor } = useTheme();
  return getColors(readingTheme, accentColor);
}

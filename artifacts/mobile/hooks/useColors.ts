import { useTheme } from '@/context/ThemeContext';
import { getColors } from '@/constants/colors';

/**
 * Returns the design-token palette for the current reading atmosphere + accent
 * color. Both are user-controlled and persisted in ThemeContext.
 */
export function useColors() {
  const { atmosphere, accentColor } = useTheme();
  return getColors(atmosphere, accentColor);
}

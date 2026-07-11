import { useTheme } from '@/context/ThemeContext';
import { getColors, READING_SPACES } from '@/constants/colors';

/**
 * Returns the design-token palette for the current reading atmosphere + accent
 * color (both user-controlled and persisted in ThemeContext), plus the active
 * Reading Space (`.space`) — a soft gradient, a harmonized accent, and a
 * light/dark flag — for screens that render an atmosphere layer (Home, Bible
 * reader, Devotional, Settings).
 */
export function useColors() {
  const { atmosphere, accentColor, readingSpace } = useTheme();
  const colors = getColors(atmosphere, accentColor);
  return { ...colors, space: READING_SPACES[readingSpace] };
}

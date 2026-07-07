import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Height of the floating CustomTabBar + its bottom offset + breathing room.
 *
 *  CustomTabBar sits at: bottom = max(insets.bottom, 8) + 6
 *  Bar height (H)      = 64
 *  Breathing room      = 20
 *
 *  So content must clear: H + max(insets.bottom, 8) + 6 + 20
 */
const TAB_BAR_H = 64;
const TAB_OFFSET = 6; // gap between bar and screen edge
const BREATHING = 20; // extra space so last item isn't flush against bar

export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  // Same formula on all platforms — web has no bottom safe area so Math.max(0,8)=8
  return TAB_BAR_H + Math.max(insets.bottom, 8) + TAB_OFFSET + BREATHING;
}

import React, { useEffect } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';

const TABS = [
  { name: 'index',     icon: 'book-open' as const, label: 'Leitura'      },
  { name: 'vocab',     icon: 'layers'    as const, label: 'Vocabulário'  },
  { name: 'search',    icon: 'search'    as const, label: 'Buscar'       },
  { name: 'bookmarks', icon: 'bookmark'  as const, label: 'Favoritos'    },
  { name: 'settings',  icon: 'settings'  as const, label: 'Config.'      },
];

const H      = 62;
const RADIUS = 20;
const MARGIN = 16;

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const colors    = useColors();
  const { isDark } = useTheme();
  const insets    = useSafeAreaInsets();
  const isWeb     = Platform.OS === 'web';
  const isIOS     = Platform.OS === 'ios';

  const { width: SCREEN_W } = Dimensions.get('window');
  const BAR_W  = SCREEN_W - MARGIN * 2;
  const SLOT_W = BAR_W / TABS.length;

  const bar = (
    <View style={[styles.bar, { height: H, borderRadius: RADIUS }]}>

      {/* ── Tabs ── */}
      {TABS.map((tab, idx) => {
        const isActive = state.index === idx;
        return (
          <TabItem
            key={tab.name}
            tab={tab}
            isActive={isActive}
            width={SLOT_W}
            activeColor={colors.primary}
            inactiveColor={colors.mutedForeground}
            onPress={() => navigation.navigate(tab.name as never)}
          />
        );
      })}
    </View>
  );

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom, 8) + 6,
          left: MARGIN,
          right: MARGIN,
        },
      ]}
    >
      {isIOS && !isWeb ? (
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'extraLight'}
          style={[styles.blurContainer, { borderRadius: RADIUS }]}
        >
          {bar}
        </BlurView>
      ) : (
        <View
          style={[
            styles.solidContainer,
            {
              backgroundColor: colors.card,
              borderRadius: RADIUS,
              borderColor: colors.border,
            },
          ]}
        >
          {bar}
        </View>
      )}
    </View>
  );
}

// ── TabItem ────────────────────────────────────────────────────────────────────
function TabItem({
  tab, isActive, width, activeColor, inactiveColor, onPress,
}: {
  tab: typeof TABS[number];
  isActive: boolean;
  width: number;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
}) {
  // Only animate the color — no scale, no label slide
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive]);

  // Small dot below icon (fades in on active)
  const dotStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: progress.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabItem, { width }]}
      hitSlop={{ top: 8, bottom: 8 }}
    >
      <Feather
        name={tab.icon}
        size={20}
        color={isActive ? activeColor : inactiveColor}
      />

      <Text
        style={[
          styles.tabLabel,
          { color: isActive ? activeColor : inactiveColor },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {tab.label}
      </Text>

      {/* Tiny dot indicator */}
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: activeColor },
          dotStyle,
        ]}
      />
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 10,
  },
  blurContainer: { overflow: 'hidden' },
  solidContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 3,
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
  },
});

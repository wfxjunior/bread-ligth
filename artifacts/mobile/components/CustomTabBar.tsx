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
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
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

const H         = 64;
const RADIUS    = 20;
const MARGIN    = 16;
const SPRING    = { damping: 22, stiffness: 220 };

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const colors  = useColors();
  const { isDark } = useTheme();
  const insets  = useSafeAreaInsets();
  const isWeb   = Platform.OS === 'web';
  const isIOS   = Platform.OS === 'ios';

  const { width: SCREEN_W } = Dimensions.get('window');
  const BAR_W   = SCREEN_W - MARGIN * 2;
  const SLOT_W  = BAR_W / TABS.length;
  const PILL_W  = SLOT_W - 10;

  const pillX    = useSharedValue((state.index ?? 0) * SLOT_W + 5);

  useEffect(() => {
    pillX.value = withSpring(state.index * SLOT_W + 5, SPRING);
  }, [state.index, SLOT_W]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: PILL_W,
  }));

  const bar = (
    <View style={[styles.bar, { height: H, borderRadius: RADIUS }]}>

      {/* ── Animated pill ── */}
      <Animated.View
        style={[
          styles.pill,
          { height: H - 12, borderRadius: RADIUS - 4, backgroundColor: colors.primary },
          pillStyle,
        ]}
      />

      {/* ── Tabs ── */}
      {TABS.map((tab, idx) => {
        const isActive = state.index === idx;
        return (
          <TabItem
            key={tab.name}
            tab={tab}
            isActive={isActive}
            width={SLOT_W}
            activeColor={colors.primaryForeground ?? '#fff'}
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
          intensity={85}
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
  const labelOpacity  = useSharedValue(isActive ? 1 : 0);
  const iconScale     = useSharedValue(isActive ? 1.08 : 1);

  useEffect(() => {
    labelOpacity.value  = withTiming(isActive ? 1 : 0, { duration: 180 });
    iconScale.value     = withSpring(isActive ? 1.1 : 1, { damping: 18, stiffness: 260 });
  }, [isActive]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [
      { translateY: interpolate(labelOpacity.value, [0, 1], [4, 0], Extrapolation.CLAMP) },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabItem, { width }]}
      hitSlop={{ top: 8, bottom: 8 }}
    >
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <Feather
          name={tab.icon}
          size={20}
          color={isActive ? activeColor : inactiveColor}
        />
      </Animated.View>

      <Animated.Text
        style={[
          styles.tabLabel,
          { color: isActive ? activeColor : inactiveColor },
          labelStyle,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Animated.Text>
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    // left/right/bottom set dynamically
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 12,
  },
  blurContainer: {
    overflow: 'hidden',
  },
  solidContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    top: 6,
    // translateX set by animation
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 3,
    zIndex: 1,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },
});

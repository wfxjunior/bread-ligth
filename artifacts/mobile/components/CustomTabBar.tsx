import React from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import type { I18nKey } from '@/constants/i18n';

const TAB_DEFS: { name: string; icon: 'book-open' | 'layers' | 'search' | 'bookmark' | 'user'; labelKey: I18nKey }[] = [
  { name: 'index',     icon: 'book-open', labelKey: 'tab_home'      },
  { name: 'vocab',     icon: 'layers',    labelKey: 'tab_vocab'     },
  { name: 'search',    icon: 'search',    labelKey: 'tab_search'    },
  { name: 'bookmarks', icon: 'bookmark',  labelKey: 'tab_bookmarks' },
  { name: 'settings',  icon: 'user',      labelKey: 'tab_settings'  },
];

const H      = 62;
const RADIUS = 20;
const MARGIN = 16;

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const colors    = useColors();
  const { isDark } = useTheme();
  const { t }     = useLanguage();
  const insets    = useSafeAreaInsets();
  const isWeb     = Platform.OS === 'web';
  const isIOS     = Platform.OS === 'ios';

  const { width: SCREEN_W } = Dimensions.get('window');
  const BAR_W  = SCREEN_W - MARGIN * 2;
  const SLOT_W = BAR_W / TAB_DEFS.length;

  const bar = (
    <View style={[styles.bar, { height: H, borderRadius: RADIUS }]}>
      {TAB_DEFS.map((tab, idx) => {
        const isActive = state.index === idx;
        return (
          <TabItem
            key={tab.name}
            icon={tab.icon}
            label={t(tab.labelKey)}
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
  icon, label, isActive, width, activeColor, inactiveColor, onPress,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  width: number;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabItem, { width }]}
      hitSlop={{ top: 8, bottom: 8 }}
    >
      <Feather
        name={icon as any}
        size={20}
        color={isActive ? activeColor : inactiveColor}
      />
      <Text
        style={[styles.tabLabel, { color: isActive ? activeColor : inactiveColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {label}
      </Text>
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
});

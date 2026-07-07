/**
 * SettingsDrawer — lateral slide-in navigation panel.
 * Pure section navigator; no profile duplication (profile lives in settings screen).
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import type { I18nKey } from '@/constants/i18n';

const DRAWER_WIDTH = 280;

interface NavSection {
  key:      string;
  icon:     string;
  labelKey: I18nKey;
}

const NAV_SECTIONS: NavSection[] = [
  { key: 'language',   icon: 'globe',     labelKey: 'drawer_nav_language'   },
  { key: 'appearance', icon: 'sun',       labelKey: 'drawer_nav_appearance' },
  { key: 'learning',   icon: 'book-open', labelKey: 'drawer_nav_learning'   },
  { key: 'audio',      icon: 'volume-2',  labelKey: 'drawer_nav_audio'      },
  { key: 'share',      icon: 'share-2',   labelKey: 'drawer_nav_share'      },
  { key: 'support',    icon: 'heart',     labelKey: 'drawer_nav_support'    },
  { key: 'data',       icon: 'database',  labelKey: 'drawer_nav_data'       },
  { key: 'about',      icon: 'info',      labelKey: 'drawer_nav_about'      },
];

interface SettingsDrawerProps {
  visible:            boolean;
  onClose:            () => void;
  onScrollToSection:  (key: string) => void;
}

export default function SettingsDrawer({
  visible,
  onClose,
  onScrollToSection,
}: SettingsDrawerProps) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { t }   = useLanguage();

  const slideX   = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      slideX.stopAnimation();
      fadeAnim.stopAnimation();
      Animated.parallel([
        Animated.spring(slideX,   { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(fadeAnim, { toValue: 1, useNativeDriver: true, duration: 200 }),
      ]).start();
    } else {
      slideX.stopAnimation();
      fadeAnim.stopAnimation();
      Animated.parallel([
        Animated.timing(slideX,   { toValue: -DRAWER_WIDTH, useNativeDriver: true, duration: 220 }),
        Animated.timing(fadeAnim, { toValue: 0,              useNativeDriver: true, duration: 180 }),
      ]).start(({ finished }) => { if (finished) setMounted(false); });
    }
  }, [visible]);

  if (!mounted) return null;

  const handleNav = (key: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onScrollToSection(key);   // scrolls + closes drawer
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <Animated.View style={[
        styles.drawer,
        {
          backgroundColor: colors.card,
          paddingTop:       insets.top + 16,
          paddingBottom:    insets.bottom + 20,
          transform:        [{ translateX: slideX }],
        },
      ]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.foreground }]}>Bread{'&'}Light</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* ── Nav label ── */}
        <Text style={[styles.navGroupLabel, { color: colors.mutedForeground }]}>
          {t('drawer_sections_label')}
        </Text>

        {/* ── Section links ── */}
        <View style={styles.navList}>
          {NAV_SECTIONS.map((sec, idx) => (
            <TouchableOpacity
              key={sec.key}
              onPress={() => handleNav(sec.key)}
              activeOpacity={0.7}
              style={[
                styles.navItem,
                idx < NAV_SECTIONS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={[styles.navIcon, { backgroundColor: colors.primary + '14' }]}>
                <Feather name={sec.icon as any} size={15} color={colors.primary} />
              </View>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>
                {t(sec.labelKey)}
              </Text>
              <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* ── Footer ── */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Bread{'&'}Light · v1.1.26
          </Text>
          <Text style={[styles.footerSub, { color: colors.mutedForeground }]}>
            {t('free_forever')}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  drawer: {
    position:      'absolute',
    left: 0, top: 0, bottom: 0,
    width:         DRAWER_WIDTH,
    shadowColor:   '#000',
    shadowOffset:  { width: 4, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius:  12,
    elevation:     16,
  },

  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom:   20,
  },
  brand: {
    fontSize:    19,
    fontFamily:  'Lora_700Bold',
    letterSpacing: -0.3,
  },

  navGroupLabel: {
    fontSize:       10,
    fontFamily:     'Inter_600SemiBold',
    letterSpacing:  1.2,
    paddingHorizontal: 20,
    marginBottom:   6,
  },

  navList: {
    marginHorizontal: 12,
    borderRadius:   14,
    overflow:       'hidden',
    borderWidth:    StyleSheet.hairlineWidth,
    borderColor:    'transparent',   // individual items draw their borders
  },
  navItem: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    paddingHorizontal: 14,
    paddingVertical:   13,
  },
  navIcon: {
    width: 30, height: 30,
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  navLabel: {
    flex:       1,
    fontSize:   14,
    fontFamily: 'Inter_500Medium',
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop:   14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  footerText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  footerSub:  { fontSize: 11, fontFamily: 'Inter_400Regular' },
});

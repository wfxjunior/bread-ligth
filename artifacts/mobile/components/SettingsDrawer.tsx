import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
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
import { useBible } from '@/context/BibleContext';

const DRAWER_WIDTH = 290;

const NAV_ITEMS: { icon: string; label: string; section: string }[] = [
  { icon: 'sun',       label: 'Aparência',    section: 'aparencia'    },
  { icon: 'book-open', label: 'Aprendizado',  section: 'aprendizado'  },
  { icon: 'share-2',   label: 'Compartilhar', section: 'compartilhar' },
  { icon: 'heart',     label: 'Apoio',        section: 'apoio'        },
  { icon: 'info',      label: 'Sobre',        section: 'sobre'        },
];

interface SettingsDrawerProps {
  visible:      boolean;
  onClose:      () => void;
  avatarUri:    string | null;
  onPickAvatar: () => void;
  isMember?:    boolean;
}

export default function SettingsDrawer({
  visible,
  onClose,
  avatarUri,
  onPickAvatar,
  isMember = false,
}: SettingsDrawerProps) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { vocabulary, bookmarks } = useBible();

  const slideX      = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      // Stop any in-flight animation before reversing direction
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

  const mastered = vocabulary.filter(v => v.mastered).length;

  const handleNavItem = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onClose();
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: colors.card,
            paddingTop:       insets.top + 16,
            paddingBottom:    insets.bottom + 20,
            transform:        [{ translateX: slideX }],
          },
        ]}
      >
        {/* Close + Brand */}
        <View style={styles.drawerHeader}>
          <Text style={[styles.brandText, { color: colors.foreground }]}>BíbliaEN</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TouchableOpacity onPress={onPickAvatar} activeOpacity={0.8} style={styles.avatarWrapper}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>W</Text>
              </View>
            )}
            <View style={[styles.avatarCam, { backgroundColor: colors.primary }]}>
              <Feather name="camera" size={9} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>Wilson</Text>
              <View style={[styles.planBadge, {
                backgroundColor: isMember ? colors.accent + '18' : colors.primary + '14',
                borderColor:     isMember ? colors.accent + '30' : colors.primary + '30',
              }]}>
                <Text style={[styles.planText, { color: isMember ? colors.accent : colors.primary }]}>
                  {isMember ? 'Member' : 'Free'}
                </Text>
              </View>
            </View>
            <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
              wilson@email.com
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { borderColor: colors.border }]}>
          {[
            { label: 'Favoritos', value: bookmarks.length },
            { label: 'Palavras',  value: vocabulary.length },
            { label: 'Dominadas', value: mastered },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={[styles.statDiv, { backgroundColor: colors.border }]} />}
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Nav items */}
        <View style={styles.navList}>
          {NAV_ITEMS.map(item => (
            <TouchableOpacity
              key={item.section}
              onPress={handleNavItem}
              activeOpacity={0.7}
              style={styles.navItem}
            >
              <View style={[styles.navIcon, { backgroundColor: colors.primary + '14' }]}>
                <Feather name={item.icon as any} size={15} color={colors.primary} />
              </View>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            BíbliaEN • v1.1.26
          </Text>
          <Text style={[styles.footerSub, { color: colors.mutedForeground }]}>
            Gratuito para sempre 🙏
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: DRAWER_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 16,
  },

  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  brandText: {
    fontSize: 18,
    fontFamily: 'Lora_700Bold',
    letterSpacing: -0.3,
  },

  profileCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarWrapper: { position: 'relative' },
  avatar:        { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarCam: {
    position: 'absolute', bottom: -1, right: -1,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  avatarText: { fontSize: 18, fontFamily: 'Inter_700Bold' },

  profileInfo: { flex: 1, gap: 3 },
  nameRow:     { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  profileName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  profileEmail:{ fontSize: 11, fontFamily: 'Inter_400Regular' },
  planBadge:   { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
  planText:    { fontSize: 10, fontFamily: 'Inter_600SemiBold' },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    marginBottom: 16,
  },
  stat:      { flex: 1, alignItems: 'center', gap: 1 },
  statValue: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  statDiv:   { width: StyleSheet.hairlineWidth, marginVertical: 4 },

  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16, marginBottom: 8 },

  navList: { paddingHorizontal: 12, gap: 2 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
  },
  navIcon:  { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  navLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  footerText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  footerSub:  { fontSize: 11, fontFamily: 'Inter_400Regular' },
});

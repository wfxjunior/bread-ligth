import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useAudio } from '@/context/AudioContext';
import { useAchievements } from '@/context/AchievementContext';
import { DEFINITIONS, type NewHonor, type Tier } from '@/constants/achievements';
import type { I18nKey } from '@/constants/i18n';

/**
 * Calm unlock experience — "A new milestone in your journey".
 * Waits for a natural pause: never appears while audio is actively reading
 * (spec: don't interrupt Scripture mid-verse). Soft fade + restrained scale,
 * instantly dismissible, with a quiet "View Journey" action. No confetti,
 * no sounds, no forced duration.
 */
export function MedalUnlockSheet() {
  const colors = useColors();
  const { t: tl } = useLanguage();
  const audio = useAudio();
  const { pendingUnlocks, acknowledgeUnlocks } = useAchievements();
  const [showing, setShowing] = useState<NewHonor[] | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  // Flush pending honors only at a natural pause (audio not playing).
  useEffect(() => {
    if (!pendingUnlocks.length || showing || audio.isPlaying) return;
    const timer = setTimeout(() => {
      setShowing(pendingUnlocks);
      acknowledgeUnlocks();
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }, 600);
    return () => clearTimeout(timer);
  }, [pendingUnlocks, showing, audio.isPlaying, acknowledgeUnlocks, fade, scale]);

  const dismiss = () => {
    Animated.timing(fade, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setShowing(null);
      fade.setValue(0);
      scale.setValue(0.96);
    });
  };

  if (!showing) return null;
  const first = showing[0];
  const def = DEFINITIONS.find(d => d.id === first.defId);
  if (!def) return null;
  const tierKey = first.tier ? (`tier_${first.tier}` as I18nKey) : null;

  return (
    <Modal transparent visible onRequestClose={dismiss} animationType="none">
      <Pressable style={styles.backdrop} onPress={dismiss} accessibilityLabel={tl('a11y_close')}>
        <Animated.View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border, opacity: fade, transform: [{ scale }] }]}>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>{tl('honor_unlocked_kicker')}</Text>

          <View style={[styles.medalCircle, medalTint(first.tier, colors.accent)]}>
            <Feather name={def.icon as any} size={30} color={colors.accent} />
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            {tl(`honor_${def.id}_title` as I18nKey)}
            {tierKey ? ` — ${tl(tierKey)}` : ''}
          </Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>
            {tl(`honor_${def.id}_desc` as I18nKey)}
          </Text>
          {showing.length > 1 && (
            <Text style={[styles.more, { color: colors.mutedForeground }]}>
              +{showing.length - 1} {tl('honor_more_earned')}
            </Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => { dismiss(); router.push('/journey'); }}
              style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              accessibilityRole="button"
            >
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>{tl('honor_view_journey')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={dismiss} style={styles.dismissBtn} accessibilityRole="button">
              <Text style={[styles.dismissText, { color: colors.mutedForeground }]}>{tl('honor_dismiss')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function medalTint(tier: Tier | undefined, accent: string) {
  return { backgroundColor: accent + '1A', borderColor: accent + '55' };
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,14,10,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  sheet: { width: '100%', maxWidth: 360, borderRadius: 22, borderWidth: 1, padding: 26, alignItems: 'center', gap: 8 },
  kicker: { fontSize: 12, fontFamily: 'Inter_500Medium', letterSpacing: 0.6, textTransform: 'uppercase' },
  medalCircle: { width: 76, height: 76, borderRadius: 38, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
  title: { fontSize: 19, fontFamily: 'Lora_700Bold', textAlign: 'center' },
  desc: { fontSize: 13.5, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  more: { fontSize: 12, fontFamily: 'Inter_500Medium', marginTop: 2 },
  actions: { marginTop: 14, width: '100%', gap: 8 },
  btn: { height: 46, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  dismissBtn: { height: 40, alignItems: 'center', justifyContent: 'center' },
  dismissText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
});

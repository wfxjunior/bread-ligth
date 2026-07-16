import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { type VocabWord } from '@/context/BibleContext';
import { AudioPlayButton } from './AudioPlayButton';

interface FlashCardProps {
  item: VocabWord;
  onMastered?: () => void;
  onDelete?: () => void;
  /** Hides the mastered/delete row — used by the SRS review session, which
   *  renders its own answer buttons below the card. */
  hideActions?: boolean;
  /** Called whenever the card flips; lets the review session reveal its
   *  answer buttons only after the reader has seen the translation. */
  onFlip?: (flipped: boolean) => void;
}

export default function FlashCard({ item, onMastered, onDelete, hideActions, onFlip }: FlashCardProps) {
  const colors = useColors();
  const { t } = useLanguage();
  const [flipped, setFlipped] = useState(false);
  const rotate = useSharedValue(0);

  const flip = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const toValue = flipped ? 0 : 1;
    rotate.value = withTiming(toValue, { duration: 350 });
    setFlipped(!flipped);
    onFlip?.(!flipped);
  }, [flipped, rotate, onFlip]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotate.value, [0, 1], [0, 180])}deg` },
    ],
    opacity: interpolate(rotate.value, [0, 0.5, 0.5, 1], [1, 1, 0, 0]),
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backfaceVisibility: 'hidden',
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotate.value, [0, 1], [180, 360])}deg` },
    ],
    opacity: interpolate(rotate.value, [0, 0.5, 0.5, 1], [0, 0, 1, 1]),
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backfaceVisibility: 'hidden',
  }));

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={flip} style={styles.cardContainer}>
        {/* Front - English */}
        <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, frontStyle]}>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>{t('flashcard_hint_en')}</Text>
          <View style={styles.wordRow}>
            <Text style={[styles.wordEn, { color: colors.englishText }]}>{item.word}</Text>
            <AudioPlayButton text={item.word} id={`vocab:${item.word}`} size={17} style={styles.wordListenBtn} />
          </View>
          {item.pronunciation ? (
            <Text style={[styles.pronunciation, { color: colors.mutedForeground }]}>/{item.pronunciation}/</Text>
          ) : null}
          <View style={[styles.tag, { backgroundColor: colors.primary + '18' }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{t('mode_english')}</Text>
          </View>
        </Animated.View>

        {/* Back - Portuguese */}
        <Animated.View style={[styles.card, { backgroundColor: colors.primary, borderColor: colors.primary }, backStyle]}>
          <Text style={[styles.hint, { color: colors.primaryForeground + 'AA' }]}>{t('mode_portuguese')}</Text>
          <Text style={[styles.wordPt, { color: colors.primaryForeground }]}>{item.translation}</Text>
          {item.context ? (
            <Text style={[styles.contextText, { color: colors.primaryForeground + 'BB' }]} numberOfLines={2}>
              "{item.context.length > 60 ? item.context.substring(0, 60) + '...' : item.context}"
            </Text>
          ) : null}
          <View style={[styles.tag, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={[styles.tagText, { color: colors.primaryForeground }]}>{t('mode_portuguese')}</Text>
          </View>
        </Animated.View>
      </Pressable>

      {!hideActions && (
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: item.mastered ? colors.accent + '22' : colors.muted,
              borderRadius: colors.radius / 1.5,
            },
          ]}
          onPress={onMastered}
          activeOpacity={0.8}
        >
          <Feather name="check-circle" size={16} color={item.mastered ? colors.accent : colors.mutedForeground} />
          <Text style={[styles.actionText, { color: item.mastered ? colors.accent : colors.mutedForeground }]}>
            {item.mastered ? t('flashcard_mastered') : t('flashcard_master_action')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.muted, borderRadius: colors.radius / 1.5 }]}
          onPress={onDelete}
          activeOpacity={0.8}
        >
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  cardContainer: {
    height: 180,
    position: 'relative',
  },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  hint: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
    position: 'absolute',
    top: 16,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordListenBtn: {
    marginTop: 2,
  },
  wordEn: {
    fontSize: 30,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    textTransform: 'capitalize',
  },
  wordPt: {
    fontSize: 26,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  pronunciation: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  contextText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 12,
  },
  tag: {
    position: 'absolute',
    bottom: 14,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});

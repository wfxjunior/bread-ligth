import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useBible, type VocabWord } from '@/context/BibleContext';
import { useLanguage } from '@/context/LanguageContext';
import { dueWords } from '@/constants/srs';
import FlashCard from '@/components/FlashCard';
import { fontSize as ts } from '@/constants/design';

type Filter = 'all' | 'learning' | 'mastered';

// ── Spaced-repetition review session ──────────────────────────────────────────
// Runs through the words due today one at a time: the reader flips the card to
// see the translation, then answers "I knew it" / "Didn't know". Each answer
// feeds the Leitner scheduler (constants/srs.ts), which decides when the word
// shows up again — that recall loop is what actually builds vocabulary, not
// re-reading the list.
function ReviewSession({ words, onDone }: { words: VocabWord[]; onDone: (remembered: number) => void }) {
  const colors = useColors();
  const { t } = useLanguage();
  const { reviewWord } = useBible();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);

  const current = words[index];
  if (!current) return null;

  const answer = (remembered: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(
        remembered ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning,
      );
    }
    reviewWord(current.word, remembered);
    const nextRemembered = rememberedCount + (remembered ? 1 : 0);
    if (index + 1 >= words.length) {
      onDone(nextRemembered);
      return;
    }
    setRememberedCount(nextRemembered);
    setRevealed(false);
    setIndex(index + 1);
  };

  return (
    <View style={styles.reviewContainer}>
      <Text style={[styles.reviewProgress, { color: colors.mutedForeground }]}>
        {index + 1} / {words.length}
      </Text>

      {/* key forces a fresh (unflipped) card per word */}
      <FlashCard key={current.word} item={current} hideActions onFlip={f => setRevealed(f)} />

      {revealed ? (
        <View style={styles.reviewAnswerRow}>
          <TouchableOpacity
            style={[styles.reviewBtn, { backgroundColor: colors.muted, borderRadius: colors.radius }]}
            onPress={() => answer(false)}
            activeOpacity={0.85}
          >
            <Feather name="rotate-ccw" size={17} color={colors.mutedForeground} />
            <Text style={[styles.reviewBtnText, { color: colors.mutedForeground }]}>
              {t('vocab_review_forgot')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reviewBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={() => answer(true)}
            activeOpacity={0.85}
          >
            <Feather name="check" size={17} color={colors.primaryForeground} />
            <Text style={[styles.reviewBtnText, { color: colors.primaryForeground }]}>
              {t('vocab_review_remembered')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={[styles.reviewHint, { color: colors.mutedForeground }]}>
          {t('vocab_review_reveal_hint')}
        </Text>
      )}
    </View>
  );
}

export default function VocabScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { vocabulary, toggleMastered, removeFromVocabulary } = useBible();
  const { t: tl } = useLanguage();
  const [filter, setFilter] = useState<Filter>('all');
  const [session, setSession] = useState<VocabWord[] | null>(null);
  const [sessionResult, setSessionResult] = useState<{ remembered: number; total: number } | null>(null);

  const due = useMemo(() => dueWords(vocabulary), [vocabulary]);

  const filtered = vocabulary.filter(v => {
    if (filter === 'learning') return !v.mastered;
    if (filter === 'mastered') return v.mastered;
    return true;
  });

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `${tl('vocab_filter_all')} (${vocabulary.length})` },
    { key: 'learning', label: `${tl('vocab_filter_learning')} (${vocabulary.filter(v => !v.mastered).length})` },
    { key: 'mastered', label: `${tl('vocab_filter_mastered')} (${vocabulary.filter(v => v.mastered).length})` },
  ];

  const startReview = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSessionResult(null);
    setSession(due);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{tl('vocab_title')}</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {tl('vocab_subtitle')}
        </Text>
        {/* Filter tabs */}
        <View style={[styles.filterRow, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterBtn,
                filter === f.key && [styles.filterBtnActive, { backgroundColor: colors.card }],
                { borderRadius: colors.radius - 2 },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? colors.foreground : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {session ? (
        sessionResult ? (
          <View style={styles.empty}>
            <Feather name="award" size={44} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {tl('vocab_review_done_title')}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {sessionResult.remembered} / {sessionResult.total} {tl('vocab_review_done_sub')}
            </Text>
            <TouchableOpacity
              style={[styles.reviewBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, marginTop: 8 }]}
              onPress={() => { setSession(null); setSessionResult(null); }}
              activeOpacity={0.85}
            >
              <Text style={[styles.reviewBtnText, { color: colors.primaryForeground }]}>
                {tl('vocab_review_finish')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ReviewSession
            words={session}
            onDone={remembered => setSessionResult({ remembered, total: session.length })}
          />
        )
      ) : (
        <>
          {/* Due-for-review banner */}
          {due.length > 0 && (
            <TouchableOpacity
              style={[styles.reviewBanner, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '33', borderRadius: colors.radius }]}
              onPress={startReview}
              activeOpacity={0.85}
            >
              <View style={styles.reviewBannerLeft}>
                <Feather name="refresh-cw" size={17} color={colors.primary} />
                <Text style={[styles.reviewBannerText, { color: colors.foreground }]}>
                  <Text style={{ fontFamily: 'Inter_700Bold' }}>{due.length}</Text>
                  {' '}
                  {tl(due.length === 1 ? 'vocab_review_banner_one' : 'vocab_review_banner_many')}
                </Text>
              </View>
              <View style={[styles.reviewBannerBtn, { backgroundColor: colors.primary, borderRadius: colors.radius - 4 }]}>
                <Text style={[styles.reviewBannerBtnText, { color: colors.primaryForeground }]}>
                  {tl('vocab_review_start')}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Feather name="layers" size={44} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {vocabulary.length === 0 ? tl('vocab_empty_title') : tl('vocab_empty_filtered_title')}
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                {vocabulary.length === 0
                  ? tl('vocab_empty_sub')
                  : tl('vocab_empty_filtered_sub')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.word}
              renderItem={({ item }) => (
                <FlashCard
                  item={item}
                  onMastered={() => toggleMastered(item.word)}
                  onDelete={() => removeFromVocabulary(item.word)}
                />
              )}
              contentContainerStyle={{ paddingTop: 16, paddingBottom: bottomPad + 20 }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!!filtered.length}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  headerTitle: {
    fontSize: ts.heading,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  filterBtnActive: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  filterText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  // ── Review banner ──
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  reviewBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  reviewBannerText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flexShrink: 1,
  },
  reviewBannerBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  reviewBannerBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  // ── Review session ──
  reviewContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  reviewProgress: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 14,
  },
  reviewHint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 6,
  },
  reviewAnswerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
    paddingHorizontal: 16,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    minWidth: 140,
  },
  reviewBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});

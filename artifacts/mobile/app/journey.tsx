/**
 * Learning Journey — a vocabulary-mastery breakdown and a recent-activity
 * timeline (notes, bookmarks, saved words), computed from real local data via
 * BibleContext/AsyncStorage. Reachable from Home and Settings. Additive only:
 * does not touch any existing screen's data or design.
 */
import React, { useMemo } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useBible } from '@/context/BibleContext';
import { fontSize as ts } from '@/constants/design';
import { computeMedals, earnedCount, type MedalState } from '@/constants/achievements';
import type { I18nKey } from '@/constants/i18n';

type ActivityItem = {
  id: string;
  kind: 'note' | 'bookmark' | 'word';
  label: string;
  ref: string;
  at: number;
};

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '18' }]}>
        <Feather name={icon as any} size={14} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]} numberOfLines={2}>{label}</Text>
    </View>
  );
}

// One medal badge: gold-tinted when earned; locked medals show a thin progress
// ring substitute (count toward threshold) so the next goal is always visible.
function MedalBadge({ medal, title, desc }: { medal: MedalState; title: string; desc: string }) {
  const colors = useColors();
  const tint = medal.earned ? colors.accent : colors.mutedForeground;
  return (
    <View
      style={[
        styles.medal,
        {
          backgroundColor: medal.earned ? colors.accent + '14' : colors.card,
          borderColor: medal.earned ? colors.accent + '55' : colors.border,
          borderRadius: colors.radius,
          opacity: medal.earned ? 1 : 0.82,
        },
      ]}
      accessibilityLabel={`${title} — ${desc}`}
    >
      <View style={[styles.medalIcon, { backgroundColor: medal.earned ? colors.accent + '22' : colors.muted }]}>
        <Feather name={medal.icon as any} size={16} color={tint} />
      </View>
      <Text style={[styles.medalTitle, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.medalDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{desc}</Text>
      {!medal.earned && (
        <Text style={[styles.medalProgress, { color: colors.mutedForeground }]}>
          {medal.current}/{medal.threshold}
        </Text>
      )}
      {medal.earned && (
        <View style={styles.medalCheck}>
          <Feather name="check" size={11} color={colors.accent} />
        </View>
      )}
    </View>
  );
}

export default function JourneyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t: tl } = useLanguage();
  const { vocabulary, bookmarks, notes, studyStats } = useBible();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const masteredCount = vocabulary.filter(v => v.mastered).length;
  const learningCount = vocabulary.length - masteredCount;
  const masteryPct = vocabulary.length > 0 ? masteredCount / vocabulary.length : 0;

  const medals = useMemo(() => computeMedals({
    streak: studyStats.streak,
    daysStudied: studyStats.daysStudied,
    wordsSaved: vocabulary.length,
    wordsMastered: masteredCount,
    versesSaved: bookmarks.length,
    notesCount: notes.length,
  }), [studyStats.streak, studyStats.daysStudied, vocabulary.length, masteredCount, bookmarks.length, notes.length]);
  const medalsEarned = earnedCount(medals);

  const activity: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [
      ...notes.map(n => ({ id: `note-${n.id}`, kind: 'note' as const, label: tl('journey_activity_note'), ref: n.reference, at: n.updatedAt })),
      ...bookmarks.map(b => ({ id: `bm-${b.bookId}-${b.chapter}-${b.verse}`, kind: 'bookmark' as const, label: tl('journey_activity_bookmark'), ref: `${b.englishBookName} ${b.chapter}:${b.verse}`, at: b.savedAt })),
      ...vocabulary.map(v => ({ id: `word-${v.word}`, kind: 'word' as const, label: tl('journey_activity_word'), ref: v.word, at: v.addedAt })),
    ];
    return items.sort((a, b) => b.at - a.at).slice(0, 20);
  }, [notes, bookmarks, vocabulary, tl]);

  const activityIcon = (kind: ActivityItem['kind']) =>
    kind === 'note' ? 'edit-3' : kind === 'bookmark' ? 'bookmark' : 'book-open';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={tl('a11y_back')} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backBtn}>
          <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{tl('journey_title')}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{tl('journey_subtitle')}</Text>
        </View>
      </View>

      <FlatList
        data={activity}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: 16, marginBottom: 8 }}>
            <View style={styles.statsGrid}>
              <StatCard icon="book-open" value={vocabulary.length} label={tl('journey_stat_words')} color={colors.primary} />
              <StatCard icon="award" value={masteredCount} label={tl('journey_stat_mastered')} color={colors.accent} />
              <StatCard icon="bookmark" value={bookmarks.length} label={tl('journey_stat_bookmarks')} color={colors.secondaryAccent} />
              <StatCard icon="edit-3" value={notes.length} label={tl('journey_stat_notes')} color={colors.primary} />
            </View>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{tl('journey_mastery_title')}</Text>
              {vocabulary.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{tl('journey_mastery_empty')}</Text>
              ) : (
                <>
                  <View style={[styles.barTrack, { backgroundColor: colors.muted, borderRadius: colors.radius / 2 }]}>
                    <View style={[styles.barFill, { width: `${Math.round(masteryPct * 100)}%`, backgroundColor: colors.accent, borderRadius: colors.radius / 2 }]} />
                  </View>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                      <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{tl('journey_mastery_mastered')} · {masteredCount}</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border }]} />
                      <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{tl('journey_mastery_learning')} · {learningCount}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {/* ── Medals ── */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <View style={styles.medalsHeader}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{tl('journey_medals_title')}</Text>
                <Text style={[styles.medalsCount, { color: colors.mutedForeground }]}>
                  {medalsEarned}/{medals.length} {tl('journey_medals_count')}
                </Text>
              </View>
              <View style={styles.medalsGrid}>
                {medals.map(m => (
                  <MedalBadge
                    key={m.id}
                    medal={m}
                    title={tl(`medal_${m.id}_title` as I18nKey)}
                    desc={tl(`medal_${m.id}_desc` as I18nKey)}
                  />
                ))}
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{tl('journey_activity_title')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.activityRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={[styles.activityIcon, { backgroundColor: colors.primary + '14' }]}>
              <Feather name={activityIcon(item.kind) as any} size={13} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.activityLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.activityRef, { color: colors.mutedForeground }]} numberOfLines={1}>{item.ref}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.mutedForeground, textAlign: 'center', paddingVertical: 20 }]}>
            {tl('journey_activity_empty')}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: ts.heading, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 1 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { flexBasis: '47%', flexGrow: 1, padding: 14, borderWidth: 1, gap: 6 },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 16 },

  card: { padding: 16, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  barTrack: { height: 10, overflow: 'hidden' },
  barFill: { height: '100%' },
  legendRow: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 19 },

  medalsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  medalsCount: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  medalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  medal: { flexBasis: '47%', flexGrow: 1, padding: 12, borderWidth: 1, gap: 4 },
  medalIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  medalTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  medalDesc: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 15 },
  medalProgress: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  medalCheck: { position: 'absolute', top: 10, right: 10 },

  sectionLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderWidth: 1 },
  activityIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  activityLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  activityRef: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
});

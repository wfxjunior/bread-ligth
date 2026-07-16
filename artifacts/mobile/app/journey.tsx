/**
 * Your Journey — the honors archive. Header (member status + calm journey
 * title), journey summary, featured honors (up to 3, reader-chosen),
 * five collections (Reading / Listening / Learning / Devotional / Community),
 * recent milestones and ONE next milestone. All values come from the
 * achievement engine (real events) — the UI never decides what's earned.
 */
import React, { useMemo } from 'react';
import {
  Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { useAchievements } from '@/context/AchievementContext';
import { usePremium } from '@/context/PremiumContext';
import { MedalArtwork } from '@/components/MedalArtwork';
import { fontSize as ts } from '@/constants/design';
import {
  COMMUNITY_HONORS, DEFINITIONS, collectionDefs, familyView, singleView,
  journeyTitleKey, type Collection, type FamilyDef, type SingleDef, type Tier,
} from '@/constants/achievements';
import type { I18nKey } from '@/constants/i18n';

const COLLECTIONS: Collection[] = ['reading', 'listening', 'learning', 'devotional'];

function fmtHours(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function fmtDate(ms: number, lang: string): string {
  return new Date(ms).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', year: 'numeric', day: 'numeric' });
}

export default function JourneyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t: tl, lang } = useLanguage();
  const { state, featured, toggleFeatured } = useAchievements();
  const { isPremium } = usePremium();
  const { user } = useUser();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const m = state.metrics;

  // Earned records sorted by recency → recent milestones + featured pool.
  const earnedList = useMemo(() =>
    Object.entries(state.earned)
      .map(([key, rec]) => ({ key, ...rec }))
      .sort((a, b) => b.earnedAt - a.earnedAt),
    [state.earned]);

  // ONE next milestone: the family closest to its next tier (or first single).
  const nextMilestone = useMemo(() => {
    let best: { label: string; detail: string; progress: number } | null = null;
    for (const def of DEFINITIONS) {
      if (def.kind === 'family') {
        const v = familyView(state, def);
        if (v.nextTier && (!best || v.progressToNext > best.progress)) {
          best = {
            label: `${tl(`honor_${def.id}_title` as I18nKey)} — ${tl(`tier_${v.nextTier.tier}` as I18nKey)}`,
            detail: `${v.value}/${v.nextTier.threshold}`,
            progress: v.progressToNext,
          };
        }
      } else {
        const v = singleView(state, def);
        if (!v.earned && v.progress > 0 && (!best || v.progress > best.progress)) {
          best = { label: tl(`honor_${def.id}_title` as I18nKey), detail: `${v.value}/${v.threshold}`, progress: v.progress };
        }
      }
    }
    return best;
  }, [state, tl]);

  const honorTitle = (key: string): { title: string; tier?: Tier; icon: string } => {
    const [defId, tier] = key.split(':') as [string, Tier | undefined];
    const def = DEFINITIONS.find(d => d.id === defId);
    return {
      title: tl(`honor_${defId}_title` as I18nKey) + (tier ? ` — ${tl(`tier_${tier}` as I18nKey)}` : ''),
      tier,
      icon: def?.icon ?? 'award',
    };
  };

  const memberSince = user?.createdAt ? fmtDate(new Date(user.createdAt).getTime(), lang) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={tl('a11y_back')} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backBtn}>
          <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{tl('journey_honors_title')}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {tl(journeyTitleKey(m) as I18nKey)} · {m.activeDays} {tl('journey_active_days')}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* ── Member status ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.memberRow}>
            <View style={[styles.memberBadge, { backgroundColor: colors.accent + '16', borderColor: colors.accent + '44' }]}>
              <Feather name="user" size={17} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.memberName, { color: colors.foreground }]} numberOfLines={1}>
                {user?.firstName ?? tl('journey_member')}
              </Text>
              <Text style={[styles.memberMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                {isPremium ? 'Bread&Light Premium' : tl('journey_member')}
                {memberSince ? ` · ${tl('journey_member_since')} ${memberSince}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Journey summary ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{tl('journey_summary_title')}</Text>
          <View style={styles.summaryGrid}>
            {[
              { v: String(m.chaptersCompleted), l: tl('journey_sum_chapters') },
              { v: String(m.booksCompleted.length), l: tl('journey_sum_books') },
              { v: String(m.wordsSaved), l: tl('journey_sum_words') },
              { v: fmtHours(m.listeningSeconds), l: tl('journey_sum_listening') },
              { v: String(m.devotionalsCompleted), l: tl('journey_sum_devotionals') },
              { v: String(m.activeDays), l: tl('journey_sum_days') },
            ].map((it, i) => (
              <View key={i} style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>{it.v}</Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]} numberOfLines={2}>{it.l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Next milestone (only one — calm) ── */}
        {nextMilestone && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionKicker, { color: colors.mutedForeground }]}>{tl('journey_next_title')}</Text>
            <Text style={[styles.nextLabel, { color: colors.foreground }]}>{nextMilestone.label}</Text>
            <View style={[styles.barTrack, { backgroundColor: colors.muted, borderRadius: colors.radius / 2 }]}>
              <View style={[styles.barFill, { width: `${Math.round(nextMilestone.progress * 100)}%`, backgroundColor: colors.accent, borderRadius: colors.radius / 2 }]} />
            </View>
            <Text style={[styles.nextDetail, { color: colors.mutedForeground }]}>{nextMilestone.detail}</Text>
          </View>
        )}

        {/* ── Featured honors ── */}
        {featured.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{tl('journey_featured_title')}</Text>
            <View style={styles.featuredRow}>
              {featured.map(key => {
                const h = honorTitle(key);
                return (
                  <View key={key} style={styles.featuredItem}>
                    <MedalArtwork icon={h.icon} tier={h.tier} earned size={56} />
                    <Text style={[styles.featuredLabel, { color: colors.foreground }]} numberOfLines={2}>{h.title}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Recent milestones ── */}
        {earnedList.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>{tl('journey_recent_title')}</Text>
            {earnedList.slice(0, 4).map(rec => {
              const h = honorTitle(rec.key);
              return (
                <View key={rec.key} style={styles.recentRow}>
                  <MedalArtwork icon={h.icon} tier={h.tier} earned size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentTitle, { color: colors.foreground }]} numberOfLines={1}>{h.title}</Text>
                    <Text style={[styles.recentDate, { color: colors.mutedForeground }]}>
                      {tl('journey_earned_on')} {fmtDate(rec.earnedAt, lang)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Collections ── */}
        {COLLECTIONS.map(collection => (
          <View key={collection} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {tl(`collection_${collection}` as I18nKey)}
            </Text>
            <Text style={[styles.featuredHint, { color: colors.mutedForeground }]}>{tl('journey_featured_hint')}</Text>
            <View style={styles.honorGrid}>
              {collectionDefs(collection).map(def => {
                if (def.kind === 'family') {
                  const v = familyView(state, def as FamilyDef);
                  const earnedKey = v.currentTier ? `${def.id}:${v.currentTier}` : null;
                  return (
                    <TouchableOpacity
                      key={def.id}
                      disabled={!earnedKey}
                      onPress={() => earnedKey && toggleFeatured(earnedKey)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`${tl(`honor_${def.id}_title` as I18nKey)}${v.currentTier ? `, ${tl(`tier_${v.currentTier}` as I18nKey)}` : `, ${tl('journey_locked')}`}`}
                      style={[styles.honorCell, { borderColor: earnedKey && featured.includes(earnedKey) ? colors.accent : colors.border, borderRadius: colors.radius }]}
                    >
                      <MedalArtwork icon={def.icon} tier={v.currentTier} earned={!!v.currentTier} />
                      <Text style={[styles.honorName, { color: colors.foreground }]} numberOfLines={1}>
                        {tl(`honor_${def.id}_title` as I18nKey)}
                      </Text>
                      <Text style={[styles.honorMeta, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {v.currentTier ? tl(`tier_${v.currentTier}` as I18nKey) : tl('journey_locked')}
                        {v.nextTier ? ` · ${v.value}/${v.nextTier.threshold}` : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                }
                const v = singleView(state, def as SingleDef);
                return (
                  <TouchableOpacity
                    key={def.id}
                    disabled={!v.earned}
                    onPress={() => toggleFeatured(def.id)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`${tl(`honor_${def.id}_title` as I18nKey)}${v.earned ? '' : `, ${tl('journey_locked')}`}`}
                    style={[styles.honorCell, { borderColor: featured.includes(def.id) ? colors.accent : colors.border, borderRadius: colors.radius }]}
                  >
                    <MedalArtwork icon={def.icon} earned={v.earned} />
                    <Text style={[styles.honorName, { color: colors.foreground }]} numberOfLines={1}>
                      {tl(`honor_${def.id}_title` as I18nKey)}
                    </Text>
                    <Text style={[styles.honorMeta, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {v.earned
                        ? `${tl('journey_earned_on')} ${v.earnedAt ? fmtDate(v.earnedAt, lang) : ''}`
                        : `${tl('journey_locked')} · ${v.value}/${v.threshold}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* ── Community & Legacy (server-awarded; shown as archive) ── */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{tl('collection_community')}</Text>
          <Text style={[styles.featuredHint, { color: colors.mutedForeground }]}>{tl('community_signin_hint')}</Text>
          <View style={styles.honorGrid}>
            {COMMUNITY_HONORS.map(h => {
              const earned = h.id === 'premium_member' && isPremium;
              return (
                <View key={h.id} style={[styles.honorCell, { borderColor: colors.border, borderRadius: colors.radius }]}>
                  <MedalArtwork icon={h.icon} tier={earned ? 'gold' : undefined} earned={earned} />
                  <Text style={[styles.honorName, { color: colors.foreground }]} numberOfLines={1}>
                    {tl(`honor_${h.id}_title` as I18nKey)}
                  </Text>
                  <Text style={[styles.honorMeta, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {tl(`honor_${h.id}_desc` as I18nKey)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 2 },
  headerTitle: { fontSize: ts.heading, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 1 },

  card: { padding: 16, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  sectionKicker: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6, textTransform: 'uppercase' },

  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  memberBadge: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  memberName: { fontSize: 16, fontFamily: 'Lora_700Bold' },
  memberMeta: { fontSize: 12.5, fontFamily: 'Inter_400Regular', marginTop: 2 },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  summaryItem: { width: '33.33%', paddingVertical: 8, paddingRight: 8 },
  summaryValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  summaryLabel: { fontSize: 11.5, fontFamily: 'Inter_400Regular', lineHeight: 15, marginTop: 2 },

  nextLabel: { fontSize: 15, fontFamily: 'Lora_700Bold' },
  barTrack: { height: 9, overflow: 'hidden' },
  barFill: { height: '100%' },
  nextDetail: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  featuredRow: { flexDirection: 'row', gap: 14 },
  featuredItem: { flex: 1, alignItems: 'center', gap: 6 },
  featuredLabel: { fontSize: 11.5, fontFamily: 'Inter_500Medium', textAlign: 'center', lineHeight: 15 },
  featuredHint: { fontSize: 11.5, fontFamily: 'Inter_400Regular', lineHeight: 15 },

  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recentTitle: { fontSize: 13.5, fontFamily: 'Inter_600SemiBold' },
  recentDate: { fontSize: 11.5, fontFamily: 'Inter_400Regular', marginTop: 1 },

  honorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  honorCell: { flexBasis: '47%', flexGrow: 1, borderWidth: 1, padding: 12, gap: 6, alignItems: 'flex-start' },
  honorName: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  honorMeta: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 15 },
});

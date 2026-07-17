/**
 * Prayer Journey — home. A peaceful place to carry every prayer:
 * stats → gentle nudge → "Continue Praying" carousel → searchable, filterable
 * list ⇄ Memorials timeline (stones of remembrance). Creation happens in a
 * calm bottom-sheet modal from the floating action button.
 */
import React, { useMemo, useState } from 'react';
import {
  FlatList, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, ScrollView,
  StyleSheet, Switch, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { usePrayers, type NewPrayerInput } from '@/context/PrayerContext';
import {
  CATEGORY_META, CATEGORY_ORDER, SCRIPTURE_SUGGESTIONS, STATUS_META,
  daysSince, waitingDays,
  type Prayer, type PrayerCategory, type PrayerReminder,
} from '@/constants/prayers';
import { fontFamily, fontSize } from '@/constants/design';
import type { I18nKey } from '@/constants/i18n';

type Filter = 'all' | 'active' | 'answered' | 'favorites' | 'archived';
const FILTERS: { id: Filter; key: I18nKey }[] = [
  { id: 'all', key: 'pr_filter_all' },
  { id: 'active', key: 'pr_filter_active' },
  { id: 'answered', key: 'pr_filter_answered' },
  { id: 'favorites', key: 'pr_filter_favorites' },
  { id: 'archived', key: 'pr_filter_archived' },
];

function haptic() {
  if (Platform.OS !== 'web') Haptics.selectionAsync();
}

export default function PrayerJourneyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const { prayers, stats, addPrayer, markPrayed } = usePrayers();

  const [segment, setSegment] = useState<'prayers' | 'memorials'>('prayers');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';

  // ── Derived collections ────────────────────────────────────────────────────
  const active = useMemo(
    () => prayers.filter((p) => p.status === 'praying' || p.status === 'waiting'),
    [prayers],
  );

  // Continue Praying: least-recently-prayed first, so attention flows to the
  // prayers that have quietly waited longest.
  const carousel = useMemo(
    () => [...active].sort((a, b) => (a.lastPrayedAt ?? a.createdAt).localeCompare(b.lastPrayedAt ?? b.createdAt)).slice(0, 10),
    [active],
  );

  // Gentle nudge — the single oldest untouched active prayer, 3+ quiet days.
  const nudge = useMemo(() => {
    const candidate = carousel[0];
    if (!candidate) return null;
    return daysSince(candidate.lastPrayedAt ?? candidate.createdAt) >= 3 ? candidate : null;
  }, [carousel]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prayers.filter((p) => {
      if (filter === 'active' && !(p.status === 'praying' || p.status === 'waiting')) return false;
      if (filter === 'answered' && p.status !== 'answered') return false;
      if (filter === 'favorites' && !p.favorite) return false;
      if (filter === 'archived' && p.status !== 'archived') return false;
      if (filter === 'all' && p.status === 'archived') return false; // archived only under its own filter
      if (!q) return true;
      const catLabel = t(CATEGORY_META[p.category].labelKey).toLowerCase();
      const scripture = p.scripture ? `${p.scripture.bookId} ${p.scripture.chapter}` : '';
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        catLabel.includes(q) ||
        scripture.includes(q) ||
        (p.testimony ?? '').toLowerCase().includes(q)
      );
    });
  }, [prayers, filter, query, t]);

  // Memorials: answered prayers, newest first, grouped by month.
  const memorials = useMemo(() => {
    const answered = prayers
      .filter((p) => p.answeredAt && p.testimony)
      .sort((a, b) => (b.answeredAt ?? '').localeCompare(a.answeredAt ?? ''));
    const groups: { month: string; items: Prayer[] }[] = [];
    for (const p of answered) {
      const month = new Date(p.answeredAt!).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      const last = groups[groups.length - 1];
      if (last && last.month === month) last.items.push(p);
      else groups.push({ month, items: [p] });
    }
    return groups;
  }, [prayers, locale]);

  const setSegmentAnimated = (s: 'prayers' | 'memorials') => {
    haptic();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSegment(s);
  };

  const createdAgoLabel = (p: Prayer) => {
    const n = daysSince(p.createdAt);
    return n === 0 ? t('pr_created_today') : t('pr_created_ago').replace('{n}', String(n));
  };

  // ── UI pieces ──────────────────────────────────────────────────────────────
  // Calm by subtraction: stat cards are number + label only — no icons.
  const StatCard = ({ value, label }: { value: number | string; label: string }) => (
    <View style={[st.statCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <Text style={[st.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[st.statLabel, { color: colors.mutedForeground }]} numberOfLines={1}>{label}</Text>
    </View>
  );

  const PrayerRow = ({ p }: { p: Prayer }) => {
    const cat = CATEGORY_META[p.category];
    const sMeta = STATUS_META[p.status];
    return (
      <TouchableOpacity
        onPress={() => { haptic(); router.push({ pathname: '/prayer-detail', params: { id: p.id } }); }}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${t('pr_a11y_open')}: ${p.title}`}
        style={[st.row, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
      >
        <View style={[st.rowIcon, { backgroundColor: colors.selection }]}>
          <Feather name={cat.icon as never} size={15} color={colors.primary} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[st.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{p.title}</Text>
          <Text style={[st.rowSub, { color: colors.mutedForeground }]} numberOfLines={1}>
            {createdAgoLabel(p)} · {t(cat.labelKey)}
          </Text>
        </View>
        <View style={st.rowRight}>
          {p.favorite && <Feather name="star" size={12} color={colors.secondaryAccent} />}
          {/* Status pill: text only — the words carry the meaning */}
          <View style={[st.statusPill, { backgroundColor: colors.selection }]}>
            <Text style={[st.statusPillText, { color: colors.primary }]}>{t(sMeta.labelKey)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[st.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 96 }} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={[st.header, { paddingTop: topPad + 12 }]}>
          <TouchableOpacity
            onPress={() => { haptic(); router.back(); }}
            accessibilityRole="button"
            accessibilityLabel={t('pr_a11y_back')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[st.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="chevron-left" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[st.title, { color: colors.foreground }]}>{t('pr_title')}</Text>
          <Text style={[st.subtitle, { color: colors.mutedForeground }]}>{t('pr_subtitle')}</Text>
        </View>

        {/* ── Stats ── */}
        <View style={st.statsGrid}>
          <StatCard value={stats.active} label={t('pr_stat_active')} />
          <StatCard value={stats.answered} label={t('pr_stat_answered')} />
          <StatCard value={stats.favorites} label={t('pr_stat_favorites')} />
          <StatCard value={stats.streak > 0 ? `${stats.streak} ${t('pr_days')}` : '—'} label={t('pr_stat_streak')} />
        </View>

        {/* ── Gentle nudge (never guilt) ── */}
        {nudge && segment === 'prayers' && (
          <TouchableOpacity
            onPress={() => { haptic(); router.push({ pathname: '/prayer-detail', params: { id: nudge.id } }); }}
            activeOpacity={0.85}
            style={[st.nudge, { backgroundColor: colors.selection, borderRadius: colors.radius }]}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[st.nudgeText, { color: colors.foreground }]} numberOfLines={1}>{t('pr_gentle_nudge')}</Text>
              <Text style={[st.nudgeSub, { color: colors.mutedForeground }]} numberOfLines={1}>{nudge.title} · {t('pr_gentle_trust')}</Text>
            </View>
            <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}

        {/* ── Continue Praying carousel ── */}
        {carousel.length > 0 && segment === 'prayers' && (
          <View style={st.section}>
            <Text style={[st.sectionTitle, { color: colors.mutedForeground }]}>{t('pr_continue')}</Text>
            <FlatList
              horizontal
              data={carousel}
              keyExtractor={(p) => p.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
              renderItem={({ item: p }) => {
                const cat = CATEGORY_META[p.category];
                return (
                  <TouchableOpacity
                    onPress={() => { haptic(); router.push({ pathname: '/prayer-detail', params: { id: p.id } }); }}
                    activeOpacity={0.85}
                    style={[st.carouselCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
                  >
                    <View style={[st.rowIcon, { backgroundColor: colors.selection }]}>
                      <Feather name={cat.icon as never} size={14} color={colors.primary} />
                    </View>
                    <Text style={[st.carouselTitle, { color: colors.foreground }]} numberOfLines={2}>{p.title}</Text>
                    <Text style={[st.rowSub, { color: colors.mutedForeground }]} numberOfLines={1}>{createdAgoLabel(p)}</Text>
                    <View style={[st.statusPill, { backgroundColor: colors.selection, alignSelf: 'flex-start', marginTop: 8 }]}>
                      <Text style={[st.statusPillText, { color: colors.primary }]}>{t(STATUS_META[p.status].labelKey)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* ── Segmented: Prayers | Memorials ── */}
        <View style={[st.segmentWrap, { backgroundColor: colors.surface, borderRadius: colors.radius }]}>
          {(['prayers', 'memorials'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => setSegmentAnimated(s)}
              accessibilityRole="button"
              accessibilityState={{ selected: segment === s }}
              style={[st.segmentBtn, segment === s && { backgroundColor: colors.card, borderRadius: colors.radius - 4 }]}
            >
              <Text style={[st.segmentText, { color: segment === s ? colors.foreground : colors.mutedForeground }]}>
                {t(s === 'prayers' ? 'pr_segment_prayers' : 'pr_segment_memorials')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {segment === 'prayers' ? (
          <View style={st.section}>
            {/* Search */}
            <View style={[st.searchWrap, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Feather name="search" size={14} color={colors.mutedForeground} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('pr_search_ph')}
                placeholderTextColor={colors.mutedForeground}
                style={[st.searchInput, { color: colors.foreground }]}
                accessibilityLabel={t('pr_search_ph')}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x" size={14} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 10 }}>
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => { haptic(); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setFilter(f.id); }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: filter === f.id }}
                  style={[
                    st.chip,
                    { borderColor: colors.border, backgroundColor: filter === f.id ? colors.primary : colors.card },
                  ]}
                >
                  <Text style={[st.chipText, { color: filter === f.id ? colors.primaryForeground : colors.foreground }]}>{t(f.key)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* List */}
            <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 8 }}>
              {filtered.length === 0 && (
                <View style={st.empty}>
                  <Feather name="feather" size={18} color={colors.mutedForeground} />
                  <Text style={[st.emptyTitle, { color: colors.foreground }]}>
                    {prayers.length === 0 ? t('pr_empty_title') : t('pr_empty_filtered')}
                  </Text>
                  {prayers.length === 0 && (
                    <Text style={[st.emptySub, { color: colors.mutedForeground }]}>{t('pr_empty_sub')}</Text>
                  )}
                </View>
              )}
              {filtered.map((p) => <PrayerRow key={p.id} p={p} />)}
            </View>
          </View>
        ) : (
          /* ── Memorials timeline ── */
          <View style={[st.section, { paddingHorizontal: 16 }]}>
            <Text style={[st.memorialsSub, { color: colors.mutedForeground }]}>{t('pr_memorials_sub')}</Text>
            {memorials.length === 0 && (
              <View style={st.empty}>
                <Feather name="award" size={18} color={colors.mutedForeground} />
                <Text style={[st.emptySub, { color: colors.mutedForeground, marginTop: 8 }]}>{t('pr_memorials_empty')}</Text>
              </View>
            )}
            {memorials.map((g) => (
              <View key={g.month} style={{ marginTop: 18 }}>
                <Text style={[st.monthLabel, { color: colors.secondaryAccent }]}>{g.month}</Text>
                {g.items.map((p) => {
                  const w = waitingDays(p);
                  return (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => { haptic(); router.push({ pathname: '/prayer-detail', params: { id: p.id } }); }}
                      activeOpacity={0.85}
                      style={st.memorialRow}
                    >
                      {/* timeline spine */}
                      <View style={st.memorialSpine}>
                        <View style={[st.memorialDot, { backgroundColor: colors.secondaryAccent }]} />
                        <View style={[st.memorialLine, { backgroundColor: colors.border }]} />
                      </View>
                      <View style={[st.memorialCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
                        <Text style={[st.rowTitle, { color: colors.foreground }]}>{p.title}</Text>
                        <Text style={[st.rowSub, { color: colors.mutedForeground, marginTop: 2 }]}>
                          {w === 0 ? t('pr_answered_same_day') : t('pr_answered_after').replace('{n}', String(w))}
                        </Text>
                        {!!p.testimony && (
                          <Text style={[st.memorialTestimony, { color: colors.foreground }]} numberOfLines={3}>
                            “{p.testimony}”
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        onPress={() => { haptic(); setCreateOpen(true); }}
        accessibilityRole="button"
        accessibilityLabel={t('pr_a11y_fab')}
        activeOpacity={0.9}
        style={[st.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 24 }]}
      >
        <Feather name="plus" size={22} color={colors.primaryForeground} />
      </TouchableOpacity>

      <CreatePrayerModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(input) => {
          const p = addPrayer(input);
          markPrayed(p.id);
          setCreateOpen(false);
        }}
      />
    </View>
  );
}

// ── Create modal ─────────────────────────────────────────────────────────────
function CreatePrayerModal({ visible, onClose, onCreate }: {
  visible: boolean;
  onClose: () => void;
  onCreate: (input: NewPrayerInput) => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PrayerCategory>('hope');
  const [reminder, setReminder] = useState<PrayerReminder>('none');
  const [favorite, setFavorite] = useState(false);
  const [scripture, setScripture] = useState<{ bookId: string; chapter: number } | null>(null);

  const reset = () => {
    setTitle(''); setDescription(''); setCategory('hope'); setReminder('none'); setFavorite(false); setScripture(null);
  };

  const save = () => {
    if (!title.trim()) return;
    haptic();
    onCreate({ title, description, category, privacy: 'private', reminder, favorite, scripture });
    reset();
  };

  const suggestions = SCRIPTURE_SUGGESTIONS[category];

  const chip = (selected: boolean) => [
    st.chip,
    { borderColor: colors.border, backgroundColor: selected ? colors.primary : colors.card },
  ];
  const chipText = (selected: boolean) => [st.chipText, { color: selected ? colors.primaryForeground : colors.foreground }];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={st.modalBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} accessibilityLabel={t('pr_cancel')} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[st.modalSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
            <View style={[st.modalHandle, { backgroundColor: colors.border }]} />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: 560 }}>
              <Text style={[st.modalTitle, { color: colors.foreground }]}>{t('pr_new_prayer')}</Text>

              <Text style={[st.fieldLabel, { color: colors.mutedForeground }]}>{t('pr_field_title')}</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={t('pr_field_title_ph')}
                placeholderTextColor={colors.mutedForeground}
                style={[st.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius }]}
              />

              <Text style={[st.fieldLabel, { color: colors.mutedForeground }]}>{t('pr_field_desc')}</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder={t('pr_field_desc_ph')}
                placeholderTextColor={colors.mutedForeground}
                multiline
                style={[st.input, st.inputMultiline, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius }]}
              />

              <Text style={[st.fieldLabel, { color: colors.mutedForeground }]}>{t('pr_field_category')}</Text>
              {/* Text-only chips — the selected state (filled) is signal enough */}
              <View style={st.chipRow}>
                {CATEGORY_ORDER.map((c) => (
                  <TouchableOpacity key={c} onPress={() => { haptic(); setCategory(c); setScripture(null); }} style={chip(category === c)}>
                    <Text style={chipText(category === c)}>{t(CATEGORY_META[c].labelKey)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[st.fieldLabel, { color: colors.mutedForeground }]}>{t('pr_field_scripture')}</Text>
              <Text style={[st.fieldHint, { color: colors.mutedForeground }]}>{t('pr_field_scripture_hint')}</Text>
              <View style={st.chipRow}>
                {suggestions.map((s) => {
                  const sel = scripture?.bookId === s.bookId && scripture?.chapter === s.chapter;
                  return (
                    <TouchableOpacity key={s.label} onPress={() => { haptic(); setScripture(sel ? null : { bookId: s.bookId, chapter: s.chapter }); }} style={chip(sel)}>
                      <Text style={chipText(sel)}>{s.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[st.fieldLabel, { color: colors.mutedForeground }]}>{t('pr_field_reminder')}</Text>
              <View style={st.chipRow}>
                {(['none', 'daily', 'weekly'] as const).map((r) => (
                  <TouchableOpacity key={r} onPress={() => { haptic(); setReminder(r); }} style={chip(reminder === r)}>
                    <Text style={chipText(reminder === r)}>{t(`pr_reminder_${r}` as I18nKey)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[st.fieldLabel, { color: colors.mutedForeground }]}>{t('pr_field_privacy')}</Text>
              <View style={st.chipRow}>
                <View style={chip(true)}>
                  <Text style={chipText(true)}>{t('pr_privacy_private')}</Text>
                </View>
                {/* Future-ready: family / prayer-group sharing */}
                {(['pr_privacy_family', 'pr_privacy_group'] as I18nKey[]).map((k) => (
                  <View key={k} style={[st.chip, { borderColor: colors.border, backgroundColor: colors.surface, opacity: 0.55 }]}>
                    <Text style={[st.chipText, { color: colors.mutedForeground }]}>{t(k)} · {t('pr_privacy_soon')}</Text>
                  </View>
                ))}
              </View>

              <View style={st.favRow}>
                <Text style={[st.fieldLabel, { color: colors.mutedForeground, marginTop: 0 }]}>{t('pr_field_favorite')}</Text>
                <Switch
                  value={favorite}
                  onValueChange={(v) => { haptic(); setFavorite(v); }}
                  trackColor={{ true: colors.primary, false: colors.border }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <TouchableOpacity
                onPress={save}
                disabled={!title.trim()}
                accessibilityRole="button"
                style={[st.saveBtn, { backgroundColor: colors.primary, opacity: title.trim() ? 1 : 0.5, borderRadius: colors.radius }]}
              >
                <Text style={[st.saveBtnText, { color: colors.primaryForeground }]}>{t('pr_save')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" style={st.cancelBtn}>
                <Text style={[st.rowSub, { color: colors.mutedForeground }]}>{t('pr_cancel')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 4 },
  backBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontFamily: fontFamily.serifBold, fontSize: fontSize.display, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginTop: 16 },
  statCard: { flexBasis: '48%', flexGrow: 1, borderWidth: 1, padding: 12, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '700', marginTop: 2 },
  statLabel: { fontSize: 12 },
  nudge: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 12, padding: 12 },
  nudgeText: { fontSize: 13, fontWeight: '600' },
  nudgeSub: { fontSize: 12, marginTop: 1 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 10 },
  carouselCard: { width: 190, borderWidth: 1, padding: 12 },
  carouselTitle: { fontSize: 14, fontWeight: '600', marginTop: 8, lineHeight: 19 },
  segmentWrap: { flexDirection: 'row', marginHorizontal: 16, marginTop: 22, padding: 4 },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center' },
  segmentText: { fontSize: 13, fontWeight: '600' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: Platform.OS === 'web' ? 10 : 6 },
  searchInput: { flex: 1, fontSize: 13, paddingVertical: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { fontSize: 12.5, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, padding: 12 },
  rowIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14.5, fontWeight: '600' },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 5 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, gap: 6 },
  emptyTitle: { fontSize: 15, fontWeight: '600', marginTop: 6 },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  memorialsSub: { fontSize: 13, lineHeight: 19, marginTop: 2 },
  monthLabel: { fontSize: 12.5, fontWeight: '700', textTransform: 'capitalize', letterSpacing: 0.4, marginBottom: 8 },
  memorialRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  memorialSpine: { width: 14, alignItems: 'center' },
  memorialDot: { width: 8, height: 8, borderRadius: 4, marginTop: 14 },
  memorialLine: { width: 1.5, flex: 1, marginTop: 4 },
  memorialCard: { flex: 1, borderWidth: 1, padding: 12 },
  memorialTestimony: { fontSize: 13, fontStyle: 'italic', lineHeight: 19, marginTop: 8 },
  fab: { position: 'absolute', right: 20, width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 18, paddingTop: 10 },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 8 },
  modalTitle: { fontSize: 19, fontWeight: '700', marginBottom: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 16 },
  fieldHint: { fontSize: 12, marginTop: 3 },
  input: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginTop: 8 },
  inputMultiline: { minHeight: 76, textAlignVertical: 'top' },
  favRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 },
  saveBtn: { alignItems: 'center', paddingVertical: 13, marginTop: 20 },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
  cancelBtn: { alignItems: 'center', paddingVertical: 12 },
});

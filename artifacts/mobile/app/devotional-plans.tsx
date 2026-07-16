/**
 * Devotional Plans — browse multiple devotional plans/collections (not just
 * today's single daily devotional). Ships with curated starter plans
 * (constants/devotionalPlans.ts) built from real transcribed verses, plus
 * lets a user create their own custom plans and add verses to any plan from
 * their favorited bookmarks. Persisted via BibleContext/AsyncStorage.
 */
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useLanguage } from '@/context/LanguageContext';
import { useBible, type Bookmark, type DevotionalPlan, type PlanVerseEntry } from '@/context/BibleContext';
import { CURATED_PLANS, type CuratedPlanVerse } from '@/constants/devotionalPlans';
import AddVerseModal from '@/components/AddVerseModal';
import { fontSize as ts } from '@/constants/design';

type PlanRow = {
  id: string;
  title: string;
  desc: string;
  schedule: string;
  custom: boolean;
};

type MergedVerse = {
  key: string;
  bookId: string;
  chapter: number;
  verse: number;
  bookName: string;
  englishBookName: string;
  en: string;
  pt: string;
  removable: boolean;
  planVerseId?: string;
};

function NewPlanModal({ visible, onClose, onCreate }: { visible: boolean; onClose: () => void; onCreate: (title: string, desc: string) => void }) {
  const colors = useColors();
  const { t: tl } = useLanguage();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  const handleCreate = () => {
    if (!title.trim()) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onCreate(title.trim(), desc.trim());
    setTitle('');
    setDesc('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{tl('devotionals_new_plan_title')}</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel={tl('a11y_close')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={tl('devotionals_plan_title_placeholder')}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background, borderRadius: colors.radius / 1.5 }]}
          />
          <TextInput
            value={desc}
            onChangeText={setDesc}
            placeholder={tl('devotionals_plan_desc_placeholder')}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background, borderRadius: colors.radius / 1.5 }]}
          />
          <TouchableOpacity
            onPress={handleCreate}
            activeOpacity={0.85}
            style={[styles.createBtn, { backgroundColor: colors.primary, borderRadius: colors.radius / 1.5 }]}
          >
            <Text style={[styles.createBtnText, { color: colors.primaryForeground }]}>{tl('devotionals_create_button')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function DevotionalPlansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t: tl } = useLanguage();
  const { devotionalPlans, planVerses, planVerseDone, bookmarks, addDevotionalPlan, removeDevotionalPlan, addPlanVerse, removePlanVerse, toggleVerseDone } = useBible();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newPlanVisible, setNewPlanVisible] = useState(false);
  const [addVerseFor, setAddVerseFor] = useState<string | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  const rows: PlanRow[] = useMemo(() => [
    ...CURATED_PLANS.map(p => ({ id: p.id, title: tl(p.titleKey), desc: tl(p.descKey), schedule: tl(p.scheduleKey), custom: false })),
    ...devotionalPlans.map(p => ({ id: p.id, title: p.title, desc: p.description, schedule: '', custom: true })),
  ], [devotionalPlans, tl]);

  const versesForPlan = (planId: string): MergedVerse[] => {
    const curated = CURATED_PLANS.find(p => p.id === planId);
    const curatedVerses: MergedVerse[] = (curated?.verses ?? []).map((v: CuratedPlanVerse) => ({
      key: `${planId}:${v.bookId}:${v.chapter}:${v.verse}`,
      bookId: v.bookId, chapter: v.chapter, verse: v.verse,
      bookName: v.bookName, englishBookName: v.englishBookName,
      en: v.en, pt: v.pt, removable: false,
    }));
    const added: MergedVerse[] = planVerses
      .filter(v => v.planId === planId)
      .map((v: PlanVerseEntry) => ({
        key: `${planId}:${v.bookId}:${v.chapter}:${v.verse}`,
        bookId: v.bookId, chapter: v.chapter, verse: v.verse,
        bookName: v.bookName, englishBookName: v.englishBookName,
        en: v.en, pt: v.pt, removable: true, planVerseId: v.id,
      }));
    return [...curatedVerses, ...added];
  };

  const toggleExpand = (id: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleCreatePlan = (title: string, desc: string) => {
    addDevotionalPlan(title, desc);
    setNewPlanVisible(false);
  };

  const handleDeletePlan = (plan: PlanRow) => {
    Alert.alert(
      tl('devotionals_delete_plan_title'),
      tl('devotionals_delete_plan_body'),
      [
        { text: tl('notes_cancel'), style: 'cancel' },
        { text: tl('notes_delete_confirm_action'), style: 'destructive', onPress: () => removeDevotionalPlan(plan.id) },
      ],
    );
  };

  const handlePickBookmark = (planId: string, b: Bookmark) => {
    addPlanVerse({
      planId,
      bookId: b.bookId,
      chapter: b.chapter,
      verse: b.verse,
      bookName: b.bookName,
      englishBookName: b.englishBookName,
      en: b.en,
      pt: b.pt,
    });
    setAddVerseFor(null);
  };

  const goToVerse = (v: MergedVerse) => {
    router.push({
      pathname: '/chapter',
      params: { bookId: v.bookId, chapter: String(v.chapter), bookName: v.bookName, englishBookName: v.englishBookName },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={tl('a11y_back')} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backBtn}>
          <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{tl('devotionals_title')}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{tl('devotionals_subtitle')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setNewPlanVisible(true)}
          activeOpacity={0.85}
          style={[styles.newBtn, { backgroundColor: colors.primary, borderRadius: colors.radius / 1.5 }]}
        >
          <Feather name="plus" size={14} color={colors.primaryForeground} />
          <Text style={[styles.newBtnText, { color: colors.primaryForeground }]}>{tl('devotionals_new_plan')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={rows}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: bottomPad + 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const expanded = expandedId === item.id;
          const verses = versesForPlan(item.id);
          return (
            <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.8} style={styles.planHeader}>
                <View style={[styles.planIcon, { backgroundColor: colors.primary + '14' }]}>
                  <Feather name="calendar" size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planTitle, { color: colors.foreground }]}>{item.title}</Text>
                  <Text style={[styles.planDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{item.desc}</Text>
                  <Text style={[styles.planMeta, { color: colors.mutedForeground }]}>
                    {item.schedule ? `${item.schedule} · ` : ''}{verses.length} {verses.length !== 1 ? tl('devotionals_verse_count_plural') : tl('devotionals_verse_count_singular')}
                  </Text>
                </View>
                <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
                {item.custom && (
                  <TouchableOpacity onPress={() => handleDeletePlan(item)} accessibilityRole="button" accessibilityLabel={tl('a11y_delete_plan')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginLeft: 6 }}>
                    <Feather name="trash-2" size={15} color={colors.mutedForeground} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {expanded && (
                <View style={[styles.planBody, { borderTopColor: colors.border }]}>
                  {verses.length === 0 ? (
                    <View style={{ paddingVertical: 8 }}>
                      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{tl('devotionals_empty_custom_title')}</Text>
                      <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>{tl('devotionals_empty_custom_sub')}</Text>
                    </View>
                  ) : (
                    verses.map(v => {
                      const done = !!planVerseDone[v.key];
                      return (
                        <View key={v.key} style={[styles.verseRow, { borderColor: colors.border, borderRadius: colors.radius / 1.5 }]}>
                          <TouchableOpacity onPress={() => toggleVerseDone(v.key)} accessibilityRole="button" accessibilityLabel={tl('a11y_mark_done')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Feather name={done ? 'check-circle' : 'circle'} size={18} color={done ? colors.accent : colors.mutedForeground} />
                          </TouchableOpacity>
                          <TouchableOpacity style={{ flex: 1 }} onPress={() => goToVerse(v)} activeOpacity={0.8}>
                            <Text style={[styles.verseRef, { color: colors.accent }]}>{v.englishBookName} {v.chapter}:{v.verse}</Text>
                            <Text style={[styles.verseText, { color: colors.foreground, textDecorationLine: done ? 'line-through' : 'none' }]} numberOfLines={2}>{v.en}</Text>
                          </TouchableOpacity>
                          {v.removable && v.planVerseId && (
                            <TouchableOpacity onPress={() => removePlanVerse(v.planVerseId!)} accessibilityRole="button" accessibilityLabel={tl('a11y_remove_verse')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                              <Feather name="x" size={15} color={colors.mutedForeground} />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })
                  )}
                  <TouchableOpacity
                    onPress={() => setAddVerseFor(item.id)}
                    activeOpacity={0.8}
                    style={[styles.addVerseBtn, { borderColor: colors.border, borderRadius: colors.radius / 1.5 }]}
                  >
                    <Feather name="plus" size={13} color={colors.primary} />
                    <Text style={[styles.addVerseText, { color: colors.primary }]}>{tl('devotionals_add_verse')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />

      <NewPlanModal visible={newPlanVisible} onClose={() => setNewPlanVisible(false)} onCreate={handleCreatePlan} />
      <AddVerseModal
        visible={!!addVerseFor}
        onClose={() => setAddVerseFor(null)}
        bookmarks={bookmarks}
        onPick={(b) => addVerseFor && handlePickBookmark(addVerseFor, b)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 2, marginBottom: 3 },
  headerTitle: { fontSize: ts.heading, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 1 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9 },
  newBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  planCard: { borderWidth: 1, overflow: 'hidden' },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14 },
  planIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  planTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  planDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2, lineHeight: 17 },
  planMeta: { fontSize: 11, fontFamily: 'Inter_500Medium', marginTop: 4 },
  planBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth, gap: 8, paddingTop: 10 },
  emptyTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  emptySub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 3, lineHeight: 17 },
  verseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, padding: 11 },
  verseRef: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  verseText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  addVerseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderStyle: 'dashed', paddingVertical: 10, marginTop: 2 },
  addVerseText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 420, padding: 20, gap: 12 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  input: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: 'Inter_500Medium' },
  createBtn: { paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  createBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

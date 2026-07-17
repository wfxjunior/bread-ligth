/**
 * Prayer detail — the full story of one prayer: status, scripture, notes,
 * timeline, and (when God answers) the testimony flow that turns the prayer
 * into a Memorial. Editing, archiving, favoriting, sharing and deletion all
 * live here, kept calm and unhurried.
 */
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert, Animated, KeyboardAvoidingView, Modal, Platform, ScrollView, Share,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { usePrayers } from '@/context/PrayerContext';
import { BIBLE_DATA } from '@/constants/bibleData';
import {
  CATEGORY_META, STATUS_META, STATUS_ORDER, waitingDays,
  type PrayerStatus,
} from '@/constants/prayers';
import { fontFamily, fontSize } from '@/constants/design';
import type { I18nKey } from '@/constants/i18n';

function haptic(style: 'light' | 'success' = 'light') {
  if (Platform.OS === 'web') return;
  if (style === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.selectionAsync();
}

const TL_KEYS: Record<string, I18nKey> = {
  created: 'pr_tl_created',
  prayed: 'pr_tl_prayed',
  note: 'pr_tl_note',
  answered: 'pr_tl_answered',
  status: 'pr_tl_status',
};

export default function PrayerDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { prayers, setStatus, markAnswered, markPrayed, addNote, toggleFavorite, deletePrayer, updatePrayer } = usePrayers();

  const prayer = prayers.find((p) => p.id === id) ?? null;

  const [answerOpen, setAnswerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [prayedToday, setPrayedToday] = useState(false);
  const amenOpacity = useRef(new Animated.Value(0)).current;

  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  const timeline = useMemo(
    () => (prayer ? [...prayer.timeline].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12) : []),
    [prayer],
  );

  if (!prayer) {
    return (
      <View style={[st.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.mutedForeground }}>{t('pr_not_found')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary }}>{t('pr_a11y_back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cat = CATEGORY_META[prayer.category];
  const waiting = waitingDays(prayer);
  const isAnswered = prayer.status === 'answered';

  const onPrayed = () => {
    haptic('success');
    markPrayed(prayer.id);
    setPrayedToday(true);
    // Calm confirmation: a soft "Amen — recorded." fade, no confetti.
    Animated.sequence([
      Animated.timing(amenOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.delay(1600),
      Animated.timing(amenOpacity, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  };

  const onSelectStatus = (s: PrayerStatus) => {
    if (s === prayer.status) return;
    haptic();
    if (s === 'answered') {
      // The heart of the feature: "God answered this prayer?"
      setAnswerOpen(true);
      return;
    }
    setStatus(prayer.id, s);
  };

  const onShareTestimony = async () => {
    if (!prayer.testimony) return;
    haptic();
    const prefix = waiting === 0 ? t('pr_share_prefix_same') : t('pr_share_prefix').replace('{n}', String(waiting));
    // Only answered testimonies are ever shared — private prayers never leave
    // the device.
    await Share.share({
      message: `🙏 ${prefix}\n\n“${prayer.testimony}”\n\n— Bread&Light · breadlight.app`,
    });
  };

  const onDelete = () => {
    Alert.alert(t('pr_delete_confirm_t'), t('pr_delete_confirm_b'), [
      { text: t('pr_cancel'), style: 'cancel' },
      {
        text: t('pr_delete'),
        style: 'destructive',
        onPress: () => { deletePrayer(prayer.id); router.back(); },
      },
    ]);
  };

  const scriptureBook = prayer.scripture ? BIBLE_DATA[prayer.scripture.bookId] : null;

  return (
    <View style={[st.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 48 }} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={[st.header, { paddingTop: topPad + 12 }]}>
          <View style={st.headerRow}>
            <TouchableOpacity
              onPress={() => { haptic(); router.back(); }}
              accessibilityRole="button"
              accessibilityLabel={t('pr_a11y_back')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[st.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Feather name="chevron-left" size={18} color={colors.foreground} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => { haptic(); toggleFavorite(prayer.id); }}
                accessibilityRole="button"
                accessibilityState={{ selected: prayer.favorite }}
                style={[st.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Feather name="star" size={16} color={prayer.favorite ? colors.secondaryAccent : colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { haptic(); setEditOpen(true); }}
                accessibilityRole="button"
                accessibilityLabel={t('pr_edit')}
                style={[st.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Feather name="edit-2" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[st.catBadge, { backgroundColor: colors.selection }]}>
            <Feather name={cat.icon as never} size={12} color={colors.primary} />
            <Text style={[st.catBadgeText, { color: colors.primary }]}>{t(cat.labelKey)}</Text>
          </View>
          <Text style={[st.title, { color: colors.foreground }]}>{prayer.title}</Text>
          {!!prayer.description && (
            <Text style={[st.desc, { color: colors.mutedForeground }]}>{prayer.description}</Text>
          )}
        </View>

        {/* ── Facts ── */}
        <View style={[st.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Fact label={t('pr_detail_created')} value={fmtDate(prayer.createdAt)} colors={colors} />
          {isAnswered && prayer.answeredAt && (
            <>
              <Fact label={t('pr_detail_answered_on')} value={fmtDate(prayer.answeredAt)} colors={colors} />
              <Fact label={t('pr_detail_waiting')} value={waiting === 0 ? t('pr_answered_same_day') : `${waiting} ${t('pr_days')}`} colors={colors} gold />
            </>
          )}
          {scriptureBook && prayer.scripture && (
            <TouchableOpacity
              onPress={() => {
                haptic();
                router.push({
                  pathname: '/chapter',
                  params: {
                    bookId: prayer.scripture!.bookId,
                    chapter: String(prayer.scripture!.chapter),
                    bookName: scriptureBook.name,
                    englishBookName: scriptureBook.englishName,
                  },
                });
              }}
              style={st.factRow}
              accessibilityRole="button"
            >
              <Text style={[st.factLabel, { color: colors.mutedForeground }]}>{t('pr_open_passage')}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[st.factValue, { color: colors.primary }]}>
                  {scriptureBook.englishName} {prayer.scripture.chapter}
                </Text>
                <Feather name="arrow-right" size={13} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Status ── */}
        <Text style={[st.sectionTitle, { color: colors.mutedForeground }]}>{t('pr_segment_prayers')}</Text>
        <View style={st.statusRow}>
          {STATUS_ORDER.map((s) => {
            const meta = STATUS_META[s];
            const sel = prayer.status === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => onSelectStatus(s)}
                accessibilityRole="button"
                accessibilityState={{ selected: sel }}
                style={[st.statusBtn, { borderColor: colors.border, backgroundColor: sel ? colors.primary : colors.card, borderRadius: colors.radius }]}
              >
                <Text style={[st.statusBtnText, { color: sel ? colors.primaryForeground : colors.foreground }]}>{t(meta.labelKey)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── I prayed today ── */}
        {!isAnswered && prayer.status !== 'archived' && (
          <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
            <TouchableOpacity
              onPress={onPrayed}
              accessibilityRole="button"
              style={[st.prayedBtn, { backgroundColor: colors.selection, borderRadius: colors.radius }]}
            >
              <Feather name="heart" size={15} color={colors.primary} />
              <Text style={[st.prayedBtnText, { color: colors.primary }]}>{t('pr_i_prayed')}</Text>
            </TouchableOpacity>
            <Animated.Text
              accessibilityLiveRegion="polite"
              style={[st.amen, { color: colors.secondaryAccent, opacity: amenOpacity }]}
            >
              {prayedToday ? t('pr_prayed_done') : ' '}
            </Animated.Text>
          </View>
        )}

        {/* ── Testimony (Memorial) ── */}
        {isAnswered && prayer.testimony && (
          <View style={[st.card, { backgroundColor: colors.card, borderColor: colors.secondaryAccent, borderRadius: colors.radius }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather name="award" size={14} color={colors.secondaryAccent} />
              <Text style={[st.testimonyTitle, { color: colors.foreground }]}>{t('pr_testimony')}</Text>
            </View>
            <Text style={[st.testimonyText, { color: colors.foreground }]}>“{prayer.testimony}”</Text>
            <TouchableOpacity
              onPress={onShareTestimony}
              accessibilityRole="button"
              style={[st.shareBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
            >
              <Text style={[st.shareBtnText, { color: colors.primary }]}>{t('pr_share_testimony')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Notes ── */}
        <Text style={[st.sectionTitle, { color: colors.mutedForeground }]}>{t('pr_notes')}</Text>
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {prayer.notes.map((n) => (
            <View key={n.at} style={[st.note, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={[st.noteText, { color: colors.foreground }]}>{n.text}</Text>
              <Text style={[st.noteDate, { color: colors.mutedForeground }]}>{fmtDate(n.at)}</Text>
            </View>
          ))}
          <View style={[st.noteInputRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder={t('pr_note_ph')}
              placeholderTextColor={colors.mutedForeground}
              style={[st.noteInput, { color: colors.foreground }]}
            />
            <TouchableOpacity
              onPress={() => { if (noteText.trim()) { haptic(); addNote(prayer.id, noteText); setNoteText(''); } }}
              disabled={!noteText.trim()}
              accessibilityRole="button"
              style={{ opacity: noteText.trim() ? 1 : 0.4 }}
            >
              <Text style={[st.noteAdd, { color: colors.primary }]}>{t('pr_note_add')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Timeline ── */}
        <Text style={[st.sectionTitle, { color: colors.mutedForeground }]}>{t('pr_timeline')}</Text>
        <View style={{ paddingHorizontal: 16 }}>
          {timeline.map((e, i) => (
            <View key={`${e.at}-${i}`} style={st.tlRow}>
              <View style={st.tlSpine}>
                <View style={[st.tlDot, { backgroundColor: e.type === 'answered' ? colors.secondaryAccent : colors.border }]} />
                {i < timeline.length - 1 && <View style={[st.tlLine, { backgroundColor: colors.border }]} />}
              </View>
              <View style={{ flex: 1, paddingBottom: 12 }}>
                <Text style={[st.tlLabel, { color: colors.foreground }]}>
                  {t(TL_KEYS[e.type] ?? 'pr_tl_status')}
                  {e.type === 'status' && e.status ? ` · ${t(STATUS_META[e.status].labelKey)}` : ''}
                </Text>
                <Text style={[st.noteDate, { color: colors.mutedForeground }]}>{fmtDate(e.at)}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Danger zone (quiet) ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 18, flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={() => { haptic(); setStatus(prayer.id, prayer.status === 'archived' ? 'praying' : 'archived'); }}
            accessibilityRole="button"
            style={[st.quietBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <Text style={[st.quietBtnText, { color: colors.mutedForeground }]}>
              {t(prayer.status === 'archived' ? 'pr_unarchive' : 'pr_archive')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            accessibilityRole="button"
            style={[st.quietBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <Text style={[st.quietBtnText, { color: colors.destructive }]}>{t('pr_delete')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Answered flow ── */}
      <AnsweredModal
        visible={answerOpen}
        onClose={() => setAnswerOpen(false)}
        onConfirm={(testimony) => {
          markAnswered(prayer.id, testimony);
          setAnswerOpen(false);
          haptic('success');
        }}
      />

      {/* ── Edit modal ── */}
      <EditModal
        visible={editOpen}
        initialTitle={prayer.title}
        initialDescription={prayer.description}
        onClose={() => setEditOpen(false)}
        onSave={(title, description) => {
          updatePrayer(prayer.id, { title: title.trim() || prayer.title, description });
          setEditOpen(false);
        }}
      />
    </View>
  );
}

function Fact({ label, value, colors, gold }: { label: string; value: string; colors: ReturnType<typeof useColors>; gold?: boolean }) {
  return (
    <View style={st.factRow}>
      <Text style={[st.factLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[st.factValue, { color: gold ? colors.secondaryAccent : colors.foreground }]}>{value}</Text>
    </View>
  );
}

// "God answered this prayer?" → [Yes] → "How did God answer?" → Save Memorial.
function AnsweredModal({ visible, onClose, onConfirm }: {
  visible: boolean; onClose: () => void; onConfirm: (testimony: string) => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [step, setStep] = useState<'ask' | 'testimony'>('ask');
  const [testimony, setTestimony] = useState('');

  const close = () => { setStep('ask'); setTestimony(''); onClose(); };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
      <View style={st.modalBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={close} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[st.modalSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
            <View style={[st.modalHandle, { backgroundColor: colors.border }]} />
            {step === 'ask' ? (
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Feather name="check-circle" size={30} color={colors.secondaryAccent} />
                <Text style={[st.askTitle, { color: colors.foreground }]}>{t('pr_answered_q')}</Text>
                <TouchableOpacity
                  onPress={() => setStep('testimony')}
                  accessibilityRole="button"
                  style={[st.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, alignSelf: 'stretch' }]}
                >
                  <Text style={[st.saveBtnText, { color: colors.primaryForeground }]}>{t('pr_answered_yes')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={close} style={{ paddingVertical: 12 }}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{t('pr_cancel')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ paddingVertical: 8 }}>
                <Text style={[st.askTitle, { color: colors.foreground, textAlign: 'left' }]}>{t('pr_answered_how')}</Text>
                <TextInput
                  value={testimony}
                  onChangeText={setTestimony}
                  placeholder={t('pr_answered_how_ph')}
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  autoFocus
                  style={[st.testimonyInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius }]}
                />
                <TouchableOpacity
                  onPress={() => { if (testimony.trim()) onConfirm(testimony); }}
                  disabled={!testimony.trim()}
                  accessibilityRole="button"
                  style={[st.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: testimony.trim() ? 1 : 0.5 }]}
                >
                  <Text style={[st.saveBtnText, { color: colors.primaryForeground }]}>{t('pr_answered_save')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function EditModal({ visible, initialTitle, initialDescription, onClose, onSave }: {
  visible: boolean; initialTitle: string; initialDescription: string;
  onClose: () => void; onSave: (title: string, description: string) => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  // Re-seed local state each time the modal opens with fresh values.
  const wasVisible = useRef(false);
  if (visible && !wasVisible.current) {
    wasVisible.current = true;
    if (title !== initialTitle) setTitle(initialTitle);
    if (description !== initialDescription) setDescription(initialDescription);
  } else if (!visible && wasVisible.current) {
    wasVisible.current = false;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={st.modalBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[st.modalSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
            <View style={[st.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[st.askTitle, { color: colors.foreground, textAlign: 'left' }]}>{t('pr_edit')}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('pr_field_title_ph')}
              placeholderTextColor={colors.mutedForeground}
              style={[st.editInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius }]}
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('pr_field_desc_ph')}
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[st.editInput, st.testimonyInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, borderRadius: colors.radius, marginTop: 8 }]}
            />
            <TouchableOpacity
              onPress={() => onSave(title, description)}
              accessibilityRole="button"
              style={[st.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            >
              <Text style={[st.saveBtnText, { color: colors.primaryForeground }]}>{t('pr_save')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { fontSize: 12, fontWeight: '600' },
  title: { fontFamily: fontFamily.serifBold, fontSize: fontSize.heading, marginTop: 10, letterSpacing: -0.2 },
  desc: { fontSize: 14, lineHeight: 21, marginTop: 6 },
  card: { marginHorizontal: 16, marginTop: 16, borderWidth: 1, padding: 14, gap: 10 },
  factRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  factLabel: { fontSize: 12.5 },
  factValue: { fontSize: 13.5, fontWeight: '600' },
  sectionTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginTop: 22, marginBottom: 8 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 9 },
  statusBtnText: { fontSize: 13, fontWeight: '600' },
  prayedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13 },
  prayedBtnText: { fontSize: 14.5, fontWeight: '700' },
  amen: { textAlign: 'center', fontSize: 13, fontStyle: 'italic', marginTop: 8, minHeight: 18 },
  testimonyTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  testimonyText: { fontFamily: fontFamily.serifItalic, fontSize: 16, lineHeight: 24, marginTop: 8 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, paddingVertical: 10, marginTop: 12 },
  shareBtnText: { fontSize: 13, fontWeight: '600' },
  note: { borderWidth: 1, padding: 12 },
  noteText: { fontSize: 13.5, lineHeight: 19 },
  noteDate: { fontSize: 11.5, marginTop: 4 },
  noteInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: Platform.OS === 'web' ? 10 : 4 },
  noteInput: { flex: 1, fontSize: 13.5, paddingVertical: 8 },
  noteAdd: { fontSize: 13, fontWeight: '700' },
  tlRow: { flexDirection: 'row', gap: 12 },
  tlSpine: { width: 12, alignItems: 'center' },
  tlDot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 5 },
  tlLine: { width: 1.5, flex: 1, marginTop: 3 },
  tlLabel: { fontSize: 13, fontWeight: '500' },
  quietBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  quietBtnText: { fontSize: 12.5, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 20, paddingTop: 10 },
  modalHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 10 },
  askTitle: { fontFamily: fontFamily.serifBold, fontSize: 20, textAlign: 'center', marginTop: 10, marginBottom: 14 },
  testimonyInput: { borderWidth: 1, minHeight: 120, padding: 12, fontSize: 14.5, lineHeight: 21, textAlignVertical: 'top' },
  editInput: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  saveBtn: { alignItems: 'center', paddingVertical: 13, marginTop: 14 },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
});

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import { useBible } from '@/context/BibleContext';
import WordModal from '@/components/WordModal';
import { getEntryForDate, resolveVerse, todayKey } from '@/utils/dailyVerse';

// PT weekday/month labels
const WEEKDAYS_PT = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const MONTHS_PT   = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const _domain = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = _domain ? `https://${_domain}/api` : null;

// ── Tappable verse text ───────────────────────────────────────────────────────
function TappableVerse({
  text,
  onWordPress,
  isDark,
}: {
  text: string;
  onWordPress: (word: string, ctx: string) => void;
  isDark: boolean;
}) {
  const colors = useColors();
  const words = text.split(/(\s+)/);

  return (
    <Text style={[styles.verseEnWrap, { color: isDark ? '#FFFFFF' : colors.foreground }]}>
      {words.map((token, i) => {
        if (/^\s+$/.test(token)) return <Text key={i}>{token}</Text>;
        const clean = token.replace(/[^a-zA-Z'-]/g, '');
        return (
          <Text
            key={i}
            onPress={() => clean.length > 1 && onWordPress(clean.toLowerCase(), text)}
            style={[
              styles.verseWord,
              { color: isDark ? '#FFFFFF' : colors.foreground },
              { textDecorationColor: isDark ? 'rgba(255,255,255,0.25)' : colors.border },
            ]}
            suppressHighlighting
          >
            {token}
          </Text>
        );
      })}
    </Text>
  );
}

// ── Devotional Modal ──────────────────────────────────────────────────────────
function DevotionalModal({
  visible,
  text,
  loading,
  error,
  onClose,
  isDark,
}: {
  visible: boolean;
  text: string;
  loading: boolean;
  error: string;
  onClose: () => void;
  isDark: boolean;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const bgColor   = isDark ? '#111E35' : colors.card;
  const textColor = isDark ? '#EDE8DF' : colors.foreground;
  const mutedColor = isDark ? 'rgba(237,232,223,0.5)' : colors.mutedForeground;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { backgroundColor: bgColor, paddingBottom: insets.bottom + 16 }]}
          onPress={e => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={[styles.sheetHandle, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : colors.border }]} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <Feather name="sun" size={16} color="#C4922A" />
              <Text style={[styles.sheetTitle, { color: textColor }]}>Devocional do Dia</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Feather name="x" size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>

          {/* Gold divider */}
          <View style={[styles.sheetGoldBar, { marginHorizontal: 20 }]} />

          {/* Content */}
          <ScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.sheetLoading}>
                <ActivityIndicator color="#C4922A" size="large" />
                <Text style={[styles.sheetLoadingText, { color: mutedColor }]}>Gerando sua reflexão…</Text>
              </View>
            ) : error ? (
              <View style={styles.sheetError}>
                <Feather name="alert-circle" size={32} color={isDark ? 'rgba(255,255,255,0.3)' : colors.border} />
                <Text style={[styles.sheetErrorText, { color: mutedColor }]}>{error}</Text>
              </View>
            ) : (
              <Text style={[styles.sheetText, { color: textColor }]}>{text}</Text>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DailyScreen() {
  const colors  = useColors();
  const { isDark } = useTheme();
  const insets  = useSafeAreaInsets();
  const { vocabulary } = useBible();

  // Recompute when app comes back to foreground (midnight rollover)
  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setToday(new Date());
    });
    return () => sub.remove();
  }, []);

  const entry    = getEntryForDate(today);
  const verseObj = resolveVerse(entry);

  const dateStr = `${WEEKDAYS_PT[today.getDay()]}, ${today.getDate()} ${MONTHS_PT[today.getMonth()]}`;

  // Completion state
  const [done, setDone]       = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setDone(false);
    setChecked(false);
    AsyncStorage.getItem(todayKey())
      .then(v => { if (v === '1') setDone(true); })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [today.toDateString()]);

  const handleComplete = useCallback(async () => {
    if (done) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(todayKey(), '1').catch(() => {});
    setDone(true);
  }, [done]);

  // Word modal
  const [modalWord, setModalWord] = useState('');
  const [modalCtx,  setModalCtx]  = useState('');
  const [modalVis,  setModalVis]  = useState(false);

  const openWord = useCallback((word: string, ctx: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setModalWord(word);
    setModalCtx(ctx);
    setModalVis(true);
  }, []);

  // Devotional state
  const [devText,    setDevText]    = useState('');
  const [devLoading, setDevLoading] = useState(false);
  const [devError,   setDevError]   = useState('');
  const [devVisible, setDevVisible] = useState(false);

  const DEVOTIONAL_KEY = `${todayKey()}:devotional`;

  const openDevotional = useCallback(async () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setDevVisible(true);

    // Return cached result if available
    try {
      const cached = await AsyncStorage.getItem(DEVOTIONAL_KEY);
      if (cached) {
        setDevText(cached);
        setDevLoading(false);
        return;
      }
    } catch {}

    if (!verseObj || !API_BASE) {
      setDevLoading(false);
      setDevError('Serviço indisponível no momento.');
      return;
    }

    setDevLoading(true);
    setDevError('');
    setDevText('');

    try {
      const params = new URLSearchParams({
        book:    entry.bookEn,
        chapter: String(entry.chapter),
        verse:   String(entry.verse),
        en:      verseObj.en,
        pt:      verseObj.pt,
      });
      const res  = await fetch(`${API_BASE}/devotional?${params}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erro desconhecido');
      setDevText(data.text);
      await AsyncStorage.setItem(DEVOTIONAL_KEY, data.text).catch(() => {});
    } catch (err: any) {
      setDevError(err.message ?? 'Não foi possível gerar o devocional. Verifique sua conexão.');
    } finally {
      setDevLoading(false);
    }
  }, [verseObj, entry, DEVOTIONAL_KEY]);

  if (!verseObj) return null;

  const bookName = entry.bookPt;
  const bookEn   = entry.bookEn;
  const chNum    = entry.chapter;
  const vNum     = entry.verse;

  // ── Theme-aware color tokens ──────────────────────────────────────────────
  const headerIconColor   = isDark ? 'rgba(255,255,255,0.8)'  : colors.primary;
  const referenceColor    = '#C4922A';
  const versePtColor      = isDark ? 'rgba(255,255,255,0.45)' : colors.portugueseText;
  const bookTagColor      = isDark ? 'rgba(196,146,42,0.7)'   : colors.accent;
  const tipTextColor      = isDark ? 'rgba(255,255,255,0.3)'  : colors.mutedForeground;
  const tipBg             = isDark ? 'rgba(255,255,255,0.05)' : colors.muted;
  const tipBorder         = isDark ? 'rgba(255,255,255,0.08)' : colors.border;
  const bottomBg          = isDark ? 'rgba(10,22,40,0.92)'    : colors.card;
  const bottomBorder      = isDark ? 'rgba(255,255,255,0.08)' : colors.border;
  const vocabCountColor   = isDark ? '#fff'                   : colors.foreground;
  const vocabLabelColor   = isDark ? 'rgba(255,255,255,0.4)'  : colors.mutedForeground;
  const dateTextColor     = isDark ? 'rgba(255,255,255,0.5)'  : colors.mutedForeground;
  const doneBg            = isDark ? '#2A4A2C'                : colors.muted;
  const doneTitleColor    = isDark ? '#fff'                   : colors.foreground;
  const doneSubColor      = isDark ? 'rgba(255,255,255,0.5)'  : colors.mutedForeground;

  return (
    <View style={styles.root}>
      {/* ── Theme-aware background ── */}
      {isDark ? (
        <LinearGradient
          colors={['#0A1628', '#111E35', '#162442']}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <LinearGradient
          colors={[colors.background, colors.muted, colors.secondary]}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* ── Decorative cross ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.crossV, { backgroundColor: 'rgba(196,146,42,0.10)' }]} />
        <View style={[styles.crossH, { backgroundColor: 'rgba(196,146,42,0.10)' }]} />
      </View>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Feather name="arrow-left" size={22} color={headerIconColor} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.modoBadge}>
            <Feather name="sun" size={11} color="#C4922A" />
            <Text style={styles.modoBadgeText}>MODO DIÁRIO</Text>
          </View>
          <Text style={[styles.dateText, { color: dateTextColor }]}>{dateStr}</Text>
        </View>

        <View style={styles.vocabBadge}>
          <Text style={[styles.vocabCount, { color: vocabCountColor }]}>{vocabulary.length}</Text>
          <Text style={[styles.vocabLabel, { color: vocabLabelColor }]}>palavras</Text>
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Gold divider */}
        <View style={styles.goldBar} />

        {/* Reference */}
        <Text style={[styles.reference, { color: referenceColor }]}>
          {bookEn} {chNum}:{vNum}
        </Text>

        {/* EN verse — tappable words */}
        <TappableVerse text={verseObj.en} onWordPress={openWord} isDark={isDark} />

        {/* PT verse */}
        <Text style={[styles.versePt, { color: versePtColor }]}>{verseObj.pt}</Text>

        {/* Book tag */}
        <View style={styles.bookTag}>
          <Feather name="book-open" size={12} color={bookTagColor} />
          <Text style={[styles.bookTagText, { color: bookTagColor }]}>{bookName} · Capítulo {chNum}</Text>
        </View>

        {/* Tip */}
        <View style={[styles.tipRow, { backgroundColor: tipBg, borderColor: tipBorder }]}>
          <Feather name="zap" size={13} color={tipTextColor} />
          <Text style={[styles.tipText, { color: tipTextColor }]}>Toque em qualquer palavra em inglês para ver sua tradução</Text>
        </View>
      </ScrollView>

      {/* ── Bottom action bar ── */}
      {checked && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16, backgroundColor: bottomBg, borderTopColor: bottomBorder }]}>
          {/* Devotional button */}
          <TouchableOpacity
            onPress={openDevotional}
            activeOpacity={0.82}
            style={[styles.devotionalBtn, { borderColor: 'rgba(196,146,42,0.45)', backgroundColor: 'rgba(196,146,42,0.10)' }]}
          >
            <Feather name="feather" size={16} color="#C4922A" />
            <Text style={styles.devotionalBtnText}>Ler Devocional</Text>
          </TouchableOpacity>

          {done ? (
            <View style={[styles.doneRow, { backgroundColor: doneBg, borderRadius: 14 }]}>
              <View style={[styles.doneIcon, { backgroundColor: '#3A6B3D' }]}>
                <Feather name="check" size={18} color="#fff" />
              </View>
              <View>
                <Text style={[styles.doneTitle, { color: doneTitleColor }]}>Concluído hoje 🎉</Text>
                <Text style={[styles.doneSub, { color: doneSubColor }]}>Volte amanhã para o próximo versículo</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleComplete}
              activeOpacity={0.88}
              style={styles.completeBtn}
            >
              <LinearGradient
                colors={['#C4922A', '#A07220']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.completeBtnGrad}
              >
                <Feather name="check-circle" size={20} color="#fff" />
                <Text style={styles.completeBtnText}>Marcar como concluído</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Devotional modal ── */}
      <DevotionalModal
        visible={devVisible}
        text={devText}
        loading={devLoading}
        error={devError}
        onClose={() => setDevVisible(false)}
        isDark={isDark}
      />

      <WordModal
        visible={modalVis}
        word={modalWord}
        context={modalCtx}
        onClose={() => setModalVis(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1 },
  crossV:  { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1 },
  crossH:  { position: 'absolute', left: 0, right: 0, top: '38%', height: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  backBtn:      { width: 36, alignItems: 'flex-start' },
  headerCenter: { alignItems: 'center', flex: 1, gap: 4 },
  modoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(196,146,42,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(196,146,42,0.3)',
  },
  modoBadgeText: {
    color: '#C4922A',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
  },
  dateText:   { fontSize: 13, fontFamily: 'Inter_400Regular' },
  vocabBadge: { width: 52, alignItems: 'flex-end' },
  vocabCount: { fontSize: 18, fontFamily: 'Inter_700Bold', lineHeight: 20 },
  vocabLabel: { fontSize: 10, fontFamily: 'Inter_400Regular' },

  // Content
  content:   { paddingHorizontal: 28, paddingTop: 8, alignItems: 'flex-start' },
  goldBar:   { width: 48, height: 3, backgroundColor: '#C4922A', borderRadius: 2, marginBottom: 22 },
  reference: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.4,
    marginBottom: 18,
    textTransform: 'uppercase',
  },

  // Verse
  verseEnWrap: {
    fontSize: 24,
    lineHeight: 38,
    fontFamily: 'Inter_400Regular',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  verseWord: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  versePt: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    marginBottom: 32,
  },

  // Tags
  bookTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  bookTagText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  tipRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  devotionalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  devotionalBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#C4922A',
  },
  completeBtn:     { borderRadius: 14, overflow: 'hidden' },
  completeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  completeBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  doneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  doneSub:   { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },

  // Devotional modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sheetTitle: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
  sheetGoldBar: {
    height: 2,
    backgroundColor: '#C4922A',
    borderRadius: 1,
    opacity: 0.5,
    marginBottom: 4,
  },
  sheetContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  sheetLoading: { alignItems: 'center', paddingVertical: 40, gap: 14 },
  sheetLoadingText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  sheetError:   { alignItems: 'center', paddingVertical: 40, gap: 12 },
  sheetErrorText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  sheetText: {
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
  },
});

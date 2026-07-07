import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
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
import { useBible } from '@/context/BibleContext';
import WordModal from '@/components/WordModal';
import { getEntryForDate, resolveVerse, todayKey } from '@/utils/dailyVerse';

// ── Palette — always dark; this screen is an immersive reading experience ─────
const D = {
  bg1:       '#0A1628',
  bg2:       '#111E35',
  bg3:       '#162442',
  wine:      '#C87A8A',
  wineFaint: 'rgba(200,122,138,0.18)',
  wineBorder:'rgba(200,122,138,0.35)',
  white:     '#FFFFFF',
  whiteHi:   'rgba(255,255,255,0.90)',
  whiteMid:  'rgba(255,255,255,0.55)',
  whiteLow:  'rgba(255,255,255,0.35)',
  whiteFaint:'rgba(255,255,255,0.07)',
  border:    'rgba(255,255,255,0.10)',
  overlayBg: 'rgba(10,22,40,0.96)',
};

// PT weekday / month labels
const WEEKDAYS_PT = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MONTHS_PT   = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const _domain = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = _domain ? `https://${_domain}/api` : null;

// ── Tappable EN verse ─────────────────────────────────────────────────────────
function TappableVerse({ text, onWordPress }: {
  text: string;
  onWordPress: (word: string, ctx: string) => void;
}) {
  const words = text.split(/(\s+)/);
  return (
    <Text style={styles.verseEnWrap}>
      {words.map((token, i) => {
        if (/^\s+$/.test(token)) return <Text key={i} style={{ color: D.white }}>{token}</Text>;
        const clean = token.replace(/[^a-zA-Z'-]/g, '');
        return (
          <Text
            key={i}
            onPress={() => clean.length > 1 && onWordPress(clean.toLowerCase(), text)}
            style={styles.verseWord}
            suppressHighlighting
          >
            {token}
          </Text>
        );
      })}
    </Text>
  );
}

// ── Devotional bottom-sheet modal ─────────────────────────────────────────────
function DevotionalModal({ visible, text, loading, error, onClose, verseRef, verseEn, versePt, dateStr }: {
  visible: boolean;
  text: string;
  loading: boolean;
  error: string;
  onClose: () => void;
  verseRef: string;
  verseEn: string;
  versePt: string;
  dateStr: string;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const hasText = !loading && !error && text.length > 0;

  const handleShare = useCallback(async () => {
    if (!hasText) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const message = [
      `✨ Devocional do Dia — ${dateStr}`,
      '',
      `📖 ${verseRef}`,
      '',
      text,
      '',
      `"${verseEn}"`,
      `${versePt}`,
      '',
      '— BíbliaEN',
    ].join('\n');
    try {
      await Share.share({ message });
    } catch {}
  }, [hasText, text, verseRef, verseEn, versePt, dateStr]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}
          onPress={e => e.stopPropagation()}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <Feather name="feather" size={15} color={D.wine} />
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Devocional do Dia</Text>
            </View>

            {/* Actions — share + close */}
            <View style={styles.sheetActions}>
              {hasText && (
                <TouchableOpacity
                  onPress={handleShare}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={[styles.sheetShareBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                >
                  <Feather name="share-2" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.sheetShareLabel, { color: colors.mutedForeground }]}>Compartilhar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.sheetGoldRule, { backgroundColor: D.wine }]} />

          <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.sheetCenter}>
                <ActivityIndicator color={D.wine} size="large" />
                <Text style={[styles.sheetHint, { color: colors.mutedForeground }]}>Gerando sua reflexão…</Text>
              </View>
            ) : error ? (
              <View style={styles.sheetCenter}>
                <Feather name="alert-circle" size={30} color={colors.border} />
                <Text style={[styles.sheetHint, { color: colors.mutedForeground }]}>{error}</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.sheetText, { color: colors.foreground }]}>{text}</Text>

                {/* Verse attribution at bottom of text */}
                <View style={[styles.sheetVerseBlock, { borderColor: D.wineBorder, backgroundColor: D.wineFaint }]}>
                  <Text style={styles.sheetVerseRef}>{verseRef}</Text>
                  <Text style={styles.sheetVerseEn} numberOfLines={3}>"{verseEn}"</Text>
                </View>
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const { vocabulary } = useBible();

  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setToday(new Date());
    });
    return () => sub.remove();
  }, []);

  const entry    = getEntryForDate(today);
  const verseObj = resolveVerse(entry);
  const dateStr  = `${WEEKDAYS_PT[today.getDay()]}, ${today.getDate()} ${MONTHS_PT[today.getMonth()]}`;

  // Completion
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
    setModalWord(word); setModalCtx(ctx); setModalVis(true);
  }, []);

  // Devotional
  const [devText,    setDevText]    = useState('');
  const [devLoading, setDevLoading] = useState(false);
  const [devError,   setDevError]   = useState('');
  const [devVisible, setDevVisible] = useState(false);
  const DEVOTIONAL_KEY = `${todayKey()}:devotional`;

  const openDevotional = useCallback(async () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setDevVisible(true);
    try {
      const cached = await AsyncStorage.getItem(DEVOTIONAL_KEY);
      if (cached) { setDevText(cached); setDevLoading(false); return; }
    } catch {}
    if (!verseObj || !API_BASE) {
      setDevLoading(false);
      setDevError('Serviço indisponível no momento.');
      return;
    }
    setDevLoading(true); setDevError(''); setDevText('');
    try {
      const params = new URLSearchParams({
        book: entry.bookEn, chapter: String(entry.chapter),
        verse: String(entry.verse), en: verseObj.en, pt: verseObj.pt,
      });
      const res  = await fetch(`${API_BASE}/devotional?${params}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erro desconhecido');
      setDevText(data.text);
      await AsyncStorage.setItem(DEVOTIONAL_KEY, data.text).catch(() => {});
    } catch (err: any) {
      setDevError(err.message ?? 'Não foi possível gerar o devocional.');
    } finally {
      setDevLoading(false);
    }
  }, [verseObj, entry, DEVOTIONAL_KEY]);

  if (!verseObj) return null;

  return (
    <View style={styles.root}>
      {/* Always-dark gradient — this is an immersive reading experience */}
      <LinearGradient colors={[D.bg1, D.bg2, D.bg3]} style={StyleSheet.absoluteFill} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 16 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color={D.whiteMid} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.modoBadge}>
            <Feather name="sun" size={11} color={D.wine} />
            <Text style={styles.modoBadgeText}>MODO DIÁRIO</Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        <View style={styles.vocabBadge}>
          <Text style={styles.vocabCount}>{vocabulary.length}</Text>
          <Text style={styles.vocabLabel}>palavras</Text>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 180 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goldBar} />

        <Text style={styles.reference}>
          {entry.bookEn} {entry.chapter}:{entry.verse}
        </Text>

        <TappableVerse text={verseObj.en} onWordPress={openWord} />

        <Text style={styles.versePt}>{verseObj.pt}</Text>

        <View style={styles.bookTag}>
          <Feather name="book-open" size={12} color={D.wineBorder} />
          <Text style={styles.bookTagText}>{entry.bookPt} · Capítulo {entry.chapter}</Text>
        </View>

        <View style={styles.tipRow}>
          <Feather name="zap" size={12} color={D.whiteLow} />
          <Text style={styles.tipText}>Toque em qualquer palavra em inglês para ver sua tradução</Text>
        </View>
      </ScrollView>

      {/* ── Fixed bottom bar ── */}
      {checked && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          {/* Devotional button — always shown */}
          <TouchableOpacity
            onPress={openDevotional}
            activeOpacity={0.8}
            style={styles.devBtn}
          >
            <Text style={styles.devBtnText}>Ler Devocional</Text>
          </TouchableOpacity>

          {/* Complete / done row */}
          {done ? (
            <View style={styles.doneRow}>
              <View style={styles.doneIcon}>
                <Feather name="check" size={18} color={D.white} />
              </View>
              <View>
                <Text style={styles.doneTitle}>Concluído hoje 🎉</Text>
                <Text style={styles.doneSub}>Volte amanhã para o próximo versículo</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={handleComplete} activeOpacity={0.88} style={styles.completeBtn}>
              <LinearGradient
                colors={['#8B3344', '#6B1E2A']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.completeBtnGrad}
              >
                <Text style={styles.completeBtnText}>Marcar como concluído</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Modals ── */}
      <DevotionalModal
        visible={devVisible}
        text={devText}
        loading={devLoading}
        error={devError}
        onClose={() => setDevVisible(false)}
        verseRef={`${entry.bookEn} ${entry.chapter}:${entry.verse}`}
        verseEn={verseObj.en}
        versePt={verseObj.pt}
        dateStr={dateStr}
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

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  backBtn:      { width: 36, alignItems: 'flex-start', flexShrink: 0 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 5, minWidth: 0 },
  modoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: D.wineFaint,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: D.wineBorder,
  },
  modoBadgeText: { color: D.wine, fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.2 },
  dateText:      { color: D.whiteMid, fontSize: 12, fontFamily: 'Inter_400Regular' },
  vocabBadge:    { width: 48, alignItems: 'flex-end', flexShrink: 0 },
  vocabCount:    { color: D.white, fontSize: 17, fontFamily: 'Inter_700Bold', lineHeight: 20 },
  vocabLabel:    { color: D.whiteLow, fontSize: 10, fontFamily: 'Inter_400Regular' },

  // Content
  content:  { paddingHorizontal: 24, paddingTop: 10, alignItems: 'flex-start' },
  goldBar:  { width: 40, height: 3, backgroundColor: D.wine, borderRadius: 2, marginBottom: 20 },
  reference: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.8,
    color: D.wine,
    marginBottom: 16,
    textTransform: 'uppercase',
  },

  // EN verse — Lora serif for immersive reading
  verseEnWrap: {
    fontSize: 26,
    lineHeight: 42,
    fontFamily: 'Lora_400Regular',
    color: D.white,
    marginBottom: 22,
  },
  verseWord: {
    fontSize: 26,
    lineHeight: 42,
    fontFamily: 'Lora_400Regular',
    color: D.white,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: 'rgba(255,255,255,0.20)',
  },

  // PT verse — italic serif
  versePt: {
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'Lora_400Regular_Italic',
    color: D.whiteMid,
    marginBottom: 28,
  },

  // Tags
  bookTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  bookTagText: { color: D.wineBorder, fontSize: 12, fontFamily: 'Inter_500Medium' },
  tipRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 13,
    backgroundColor: D.whiteFaint,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: D.border,
  },
  tipText: {
    flex: 1,
    color: D.whiteLow,
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
    paddingTop: 10,
    backgroundColor: D.overlayBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: D.border,
    gap: 8,
  },

  // Devotional button
  devBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: D.wineBorder,
    backgroundColor: D.wineFaint,
  },
  devBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: D.wine,
  },

  // Complete button
  completeBtn:     { borderRadius: 14, overflow: 'hidden' },
  completeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
  },
  completeBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: D.white },

  // Done state
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  doneIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(58,107,61,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  doneTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: D.white },
  doneSub:   { fontSize: 12, fontFamily: 'Inter_400Regular', color: D.whiteMid, marginTop: 2 },

  // Devotional modal sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 10,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sheetTitle:    { fontSize: 17, fontFamily: 'Inter_700Bold' },
  sheetGoldRule: {
    height: 2, borderRadius: 1, opacity: 0.4,
    marginHorizontal: 20, marginBottom: 2,
  },
  sheetBody:   { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
  sheetCenter: { alignItems: 'center', paddingVertical: 40, gap: 14 },
  sheetHint:   { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  sheetText:   { fontSize: 16, lineHeight: 28, fontFamily: 'Inter_400Regular', marginBottom: 20 },

  // Header action row (share + close)
  sheetActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetShareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: StyleSheet.hairlineWidth,
  },
  sheetShareLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  // Verse attribution block at bottom of devotional text
  sheetVerseBlock: {
    borderLeftWidth: 2, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 10, gap: 4,
  },
  sheetVerseRef: {
    fontSize: 10, fontFamily: 'Inter_700Bold',
    letterSpacing: 1.4, color: D.wine, textTransform: 'uppercase',
  },
  sheetVerseEn: {
    fontSize: 13, fontFamily: 'Lora_400Regular_Italic',
    color: D.wine, lineHeight: 20, opacity: 0.85,
  },
});

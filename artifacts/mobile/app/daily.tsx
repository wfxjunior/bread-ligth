import React, { useCallback, useEffect, useState } from 'react';
import {
  AppState,
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
import { useBible } from '@/context/BibleContext';
import WordModal from '@/components/WordModal';
import { getEntryForDate, resolveVerse, todayKey } from '@/utils/dailyVerse';

// PT weekday/month labels
const WEEKDAYS_PT = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const MONTHS_PT   = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// ── Tappable verse text ───────────────────────────────────────────────────────
function TappableVerse({
  text,
  onWordPress,
}: {
  text: string;
  onWordPress: (word: string, ctx: string) => void;
}) {
  const colors = useColors();
  const words = text.split(/(\s+)/);

  return (
    <Text style={styles.verseEnWrap}>
      {words.map((token, i) => {
        if (/^\s+$/.test(token)) return <Text key={i}>{token}</Text>;
        const clean = token.replace(/[^a-zA-Z'-]/g, '');
        return (
          <Text
            key={i}
            onPress={() => clean.length > 1 && onWordPress(clean.toLowerCase(), text)}
            style={[
              styles.verseWord,
              { color: colors.englishText },
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

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DailyScreen() {
  const colors  = useColors();
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

  // Completion state — reload whenever 'today' changes (midnight rollover)
  const [done, setDone] = useState(false);
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
  const [modalWord, setModalWord]   = useState('');
  const [modalCtx,  setModalCtx]    = useState('');
  const [modalVis,  setModalVis]    = useState(false);

  const openWord = useCallback((word: string, ctx: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setModalWord(word);
    setModalCtx(ctx);
    setModalVis(true);
  }, []);

  if (!verseObj) return null;

  const bookName  = entry.bookPt;
  const bookEn    = entry.bookEn;
  const chNum     = entry.chapter;
  const vNum      = entry.verse;

  return (
    <View style={styles.root}>
      {/* ── Deep gradient background ── */}
      <LinearGradient
        colors={['#0A1628', '#111E35', '#162442']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Decorative cross ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[styles.crossV, { backgroundColor: 'rgba(196,146,42,0.12)' }]} />
        <View style={[styles.crossH, { backgroundColor: 'rgba(196,146,42,0.12)' }]} />
      </View>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Feather name="arrow-left" size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.modoBadge}>
            <Feather name="sun" size={11} color="#C4922A" />
            <Text style={styles.modoBadgeText}>MODO DIÁRIO</Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        <View style={styles.vocabBadge}>
          <Text style={styles.vocabCount}>{vocabulary.length}</Text>
          <Text style={styles.vocabLabel}>palavras</Text>
        </View>
      </View>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Gold divider */}
        <View style={styles.goldBar} />

        {/* Reference */}
        <Text style={styles.reference}>
          {bookEn} {chNum}:{vNum}
        </Text>

        {/* EN verse — tappable words */}
        <TappableVerse text={verseObj.en} onWordPress={openWord} />

        {/* PT verse */}
        <Text style={styles.versePt}>{verseObj.pt}</Text>

        {/* Book tag */}
        <View style={styles.bookTag}>
          <Feather name="book-open" size={12} color="rgba(196,146,42,0.8)" />
          <Text style={styles.bookTagText}>{bookName} · Capítulo {chNum}</Text>
        </View>

        {/* Tip */}
        <View style={styles.tipRow}>
          <Feather name="zap" size={13} color="rgba(255,255,255,0.3)" />
          <Text style={styles.tipText}>Toque em qualquer palavra em inglês para ver sua tradução</Text>
        </View>
      </ScrollView>

      {/* ── Bottom action ── */}
      {checked && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
          {done ? (
            <View style={styles.doneRow}>
              <View style={[styles.doneIcon, { backgroundColor: '#3D6B41' }]}>
                <Feather name="check" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.doneTitle}>Concluído hoje 🎉</Text>
                <Text style={styles.doneSub}>Volte amanhã para o próximo versículo</Text>
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
  backBtn: { width: 36, alignItems: 'flex-start' },
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
  dateText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  vocabBadge:  { width: 52, alignItems: 'flex-end' },
  vocabCount:  { color: '#fff', fontSize: 18, fontFamily: 'Inter_700Bold', lineHeight: 20 },
  vocabLabel:  { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Inter_400Regular' },

  // Content
  content: { paddingHorizontal: 28, paddingTop: 8, alignItems: 'flex-start' },
  goldBar: { width: 48, height: 3, backgroundColor: '#C4922A', borderRadius: 2, marginBottom: 22 },
  reference: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.4,
    color: '#C4922A',
    marginBottom: 18,
    textTransform: 'uppercase',
  },

  // Verse
  verseEnWrap: {
    fontSize: 24,
    lineHeight: 38,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  verseWord: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: 'rgba(255,255,255,0.25)',
  },
  versePt: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.45)',
    fontStyle: 'italic',
    marginBottom: 32,
  },

  // Tags
  bookTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  bookTagText: {
    color: 'rgba(196,146,42,0.7)',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  tipRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tipText: {
    flex: 1,
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },

  // Bottom
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(10,22,40,0.92)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  completeBtn:      { borderRadius: 14, overflow: 'hidden' },
  completeBtnGrad:  {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  completeBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  doneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  doneSub:   { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.5)', marginTop: 2 },
});

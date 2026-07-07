import React, { useEffect, useState } from 'react';
import {
  AppState,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useBible } from '@/context/BibleContext';
import { BIBLE_DATA } from '@/constants/bibleData';
import { getEntryForDate, resolveVerse } from '@/utils/dailyVerse';

const PAD    = 16;
const GAP    = 10;
const CARD_H = 196;

const WEEKDAYS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MONTHS_PT   = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia!';
  if (h < 18) return 'Boa tarde!';
  return 'Boa noite!';
}

// ── Daily verse compact pill ──────────────────────────────────────────────────
function DailyPill() {
  const colors = useColors();

  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setToday(new Date());
    });
    return () => sub.remove();
  }, []);

  const entry = getEntryForDate(today);
  const verse = resolveVerse(entry);
  if (!verse) return null;

  const preview = verse.en.length > 90 ? verse.en.slice(0, 90).trimEnd() + '…' : verse.en;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        router.push('/daily');
      }}
      style={[styles.pill, {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: colors.radius,
      }]}
    >
      <View style={[styles.pillAccent, { backgroundColor: colors.accent }]} />

      <View style={styles.pillBody}>
        {/* Top row: badge + ref */}
        <View style={styles.pillTopRow}>
          <View style={styles.pillBadge}>
            <Feather name="sun" size={10} color={colors.accent} />
            <Text style={[styles.pillBadgeText, { color: colors.accent }]}>Versículo do dia</Text>
          </View>
          <Text style={[styles.pillRef, { color: colors.mutedForeground }]}>
            {entry.bookEn} {entry.chapter}:{entry.verse}
          </Text>
        </View>

        {/* Verse preview — Lora italic */}
        <Text style={[styles.pillVerse, { color: colors.foreground }]} numberOfLines={2}>
          "{preview}"
        </Text>

        {/* Footer: PT ref + open button */}
        <View style={styles.pillFooter}>
          <Text style={[styles.pillPt, { color: colors.mutedForeground }]} numberOfLines={1}>
            {entry.bookPt} {entry.chapter}:{entry.verse}
          </Text>
          <View style={styles.pillOpenBtn}>
            <Text style={[styles.pillOpenText, { color: colors.accent }]}>Abrir</Text>
            <Feather name="arrow-right" size={12} color={colors.accent} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Book catalogue ────────────────────────────────────────────────────────────
type BookMeta = {
  bookId: string;
  gradient: readonly [string, string];
  roman: string;
  testamentPt: string;
};

const BOOK_CATALOGUE: BookMeta[] = [
  { bookId: 'genesis',      gradient: ['#1E3D29', '#0D1F15'] as const, roman: 'I',   testamentPt: 'Antigo Testamento' },
  { bookId: 'psalms',       gradient: ['#7A5218', '#4A3010'] as const, roman: 'XIX', testamentPt: 'Antigo Testamento' },
  { bookId: 'proverbs',     gradient: ['#5A3A10', '#301E08'] as const, roman: 'XX',  testamentPt: 'Antigo Testamento' },
  { bookId: 'matthew',      gradient: ['#3E141D', '#200A0F'] as const, roman: 'I',   testamentPt: 'Novo Testamento'   },
  { bookId: 'john',         gradient: ['#2A1845', '#160D28'] as const, roman: 'IV',  testamentPt: 'Novo Testamento'   },
  { bookId: 'romans',       gradient: ['#2C2A28', '#1A1816'] as const, roman: 'VI',  testamentPt: 'Novo Testamento'   },
  { bookId: 'philippians',  gradient: ['#1B3A5A', '#0D1F35'] as const, roman: 'XI',  testamentPt: 'Novo Testamento'   },
  { bookId: '1corinthians', gradient: ['#4A1230', '#28091A'] as const, roman: 'VII', testamentPt: 'Novo Testamento'   },
];

// ── Book grid card ────────────────────────────────────────────────────────────
function BookGridCard({ meta, cardW }: { meta: BookMeta; cardW: number }) {
  const colors = useColors();
  const book   = BIBLE_DATA[meta.bookId];
  if (!book) return null;

  const chapterKey = Object.keys(book.chapters)[0];

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/chapter',
      params: {
        bookId:          meta.bookId,
        chapter:         chapterKey,
        bookName:        book.name,
        englishBookName: book.englishName,
      },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.88} style={[styles.card, { width: cardW }]}>
      <LinearGradient
        colors={meta.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={[styles.cardGradient, { borderRadius: colors.radius + 2 }]}
      >
        {/* Roman numeral watermark */}
        <Text style={styles.cardRoman}>{meta.roman}</Text>

        {/* Dark vignette overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.78)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Testament tag */}
        <View style={styles.cardTag}>
          <Text style={styles.cardTagText}>{meta.testamentPt.toUpperCase()}</Text>
        </View>

        {/* Book names */}
        <View style={styles.cardBottom}>
          <Text style={styles.cardNameEn}>{book.englishName}</Text>
          <Text style={styles.cardNamePt}>{book.name}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const { readingProgress } = useBible();
  const { width } = useWindowDimensions();
  const cardW     = Math.floor((width - PAD * 2 - GAP) / 2);

  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  const today    = new Date();
  const dateStr  = `${WEEKDAYS_PT[today.getDay()]}, ${today.getDate()} ${MONTHS_PT[today.getMonth()]}`;
  const greeting = getGreeting();

  const handleContinue = () => {
    if (!readingProgress) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/chapter',
      params: {
        bookId:          readingProgress.bookId,
        chapter:         String(readingProgress.chapter),
        bookName:        readingProgress.bookName,
        englishBookName: readingProgress.englishBookName,
      },
    });
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 8 }}
      showsVerticalScrollIndicator={false}
    >

      {/* ── Header ── */}
      <View style={[
        styles.header,
        { paddingTop: topPad + 6, borderBottomColor: colors.border },
      ]}>
        <Text style={[styles.headerName, { color: colors.foreground }]}>BíbliaEN</Text>
        <View style={styles.headerSubRow}>
          <Text style={[styles.headerGreeting, { color: colors.mutedForeground }]}>{greeting}</Text>
          <Text style={[styles.headerDot, { color: colors.border }]}>·</Text>
          <Text style={[styles.headerDate, { color: colors.mutedForeground }]}>{dateStr}</Text>
        </View>
      </View>

      {/* ── Daily verse pill ── */}
      <View style={styles.section}>
        <DailyPill />
      </View>

      {/* ── Continue reading strip ── */}
      {readingProgress && (
        <View style={[styles.section, { marginTop: 18 }]}>
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.85}
            style={[styles.continueStrip, {
              backgroundColor: colors.primary + '0E',
              borderColor:     colors.primary + '28',
              borderRadius:    colors.radius,
            }]}
          >
            <Feather name="bookmark" size={13} color={colors.primary} />
            <Text style={[styles.continueLabel, { color: colors.mutedForeground }]}>Continuar</Text>
            <Text style={[styles.continueName, { color: colors.primary }]}>
              {readingProgress.englishBookName} {readingProgress.chapter}
            </Text>
            <View style={{ flex: 1 }} />
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Library grid ── */}
      <View style={[styles.section, { marginTop: readingProgress ? 24 : 20 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>BIBLIOTECA</Text>
          <Text style={[styles.sectionCount, { color: colors.accent }]}>
            {BOOK_CATALOGUE.length} livros
          </Text>
        </View>

        <View style={styles.grid}>
          {BOOK_CATALOGUE.map(meta => (
            <BookGridCard key={meta.bookId} meta={meta} cardW={cardW} />
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 5,
  },
  headerName: {
    fontSize: 34,
    fontFamily: 'Lora_700Bold',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  headerGreeting: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  headerDot: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  headerDate: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },

  // Section wrapper
  section: { paddingHorizontal: PAD, marginTop: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2 },
  sectionCount: { fontSize: 11, fontFamily: 'Inter_500Medium' },

  // Daily pill
  pill: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  pillAccent: { width: 3 },
  pillBody:   { flex: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 7 },
  pillTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillBadge:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillBadgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  pillRef:       { fontSize: 11, fontFamily: 'Inter_400Regular' },
  pillVerse:     { fontSize: 14, fontFamily: 'Lora_400Regular_Italic', lineHeight: 22 },
  pillFooter:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pillPt:        { fontSize: 11, fontFamily: 'Inter_400Regular', flex: 1 },
  pillOpenBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillOpenText:  { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // Continue strip
  continueStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
  },
  continueLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  continueName:  { fontSize: 13, fontFamily: 'Inter_600SemiBold' },

  // Book grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  card:         {},
  cardGradient: {
    height: CARD_H,
    padding: 12,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardRoman: {
    position: 'absolute',
    top: '18%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 72,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.06)',
    letterSpacing: -2,
  },
  cardTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  cardTagText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 7,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.1,
  },
  cardBottom: { gap: 2 },
  cardNameEn: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  cardNamePt: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.55)',
  },
});

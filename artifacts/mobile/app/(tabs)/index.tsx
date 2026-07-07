import React, { useEffect, useState } from 'react';
import {
  AppState,
  Platform,
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
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useBible } from '@/context/BibleContext';
import { BIBLE_DATA } from '@/constants/bibleData';
import { getEntryForDate, resolveVerse } from '@/utils/dailyVerse';

// ── Daily Card ─────────────────────────────────────────────────────────────────
function DailyCard() {
  const colors = useColors();

  // Recompute when app comes back to foreground so midnight rollovers are caught
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

  const preview = verse.en.length > 72 ? verse.en.slice(0, 72).trimEnd() + '…' : verse.en;

  return (
    <View style={[styles.section, { marginTop: 20 }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>MODO DIÁRIO</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          router.push('/daily');
        }}
      >
        <LinearGradient
          colors={['#0D1B2A', '#162442']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.dailyCard, { borderRadius: colors.radius }]}
        >
          {/* Subtle cross */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(196,146,42,0.1)' }} />
            <View style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, backgroundColor: 'rgba(196,146,42,0.1)' }} />
          </View>

          <View style={styles.dailyBadgeRow}>
            <View style={styles.dailyBadge}>
              <Feather name="sun" size={11} color="#C4922A" />
              <Text style={styles.dailyBadgeText}>Versículo do dia</Text>
            </View>
            <Text style={styles.dailyRef}>{entry.bookEn} {entry.chapter}:{entry.verse}</Text>
          </View>

          <Text style={styles.dailyVerse}>"{preview}"</Text>

          <View style={styles.dailyFooter}>
            <Text style={styles.dailyVersePt} numberOfLines={1}>{entry.bookPt} {entry.chapter}:{entry.verse}</Text>
            <View style={styles.dailyOpenBtn}>
              <Text style={styles.dailyOpenText}>Abrir</Text>
              <Feather name="arrow-right" size={13} color="#C4922A" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ── Book catalogue ────────────────────────────────────────────────────────────
// Visual identity per book (gradient + roman numeral + testament label)
type BookMeta = {
  bookId: string;
  gradient: readonly [string, string];
  roman: string;
  testamentEn: string;
  testamentPt: string;
};

const BOOK_CATALOGUE: BookMeta[] = [
  { bookId: 'genesis',      gradient: ['#1E3D29', '#0D1F15'] as const, roman: 'I',    testamentEn: 'Old Testament', testamentPt: 'Antigo Testamento' },
  { bookId: 'psalms',       gradient: ['#7A5218', '#4A3010'] as const, roman: 'XIX',  testamentEn: 'Old Testament', testamentPt: 'Antigo Testamento' },
  { bookId: 'matthew',      gradient: ['#3E141D', '#200A0F'] as const, roman: 'I',    testamentEn: 'New Testament', testamentPt: 'Novo Testamento' },
  { bookId: 'john1',        gradient: ['#2A1845', '#160D28'] as const, roman: 'IV',   testamentEn: 'New Testament', testamentPt: 'Novo Testamento' },
  { bookId: 'john',         gradient: ['#4A1C23', '#261018'] as const, roman: 'IV',   testamentEn: 'New Testament', testamentPt: 'Novo Testamento' },
  { bookId: 'romans',       gradient: ['#2C2A28', '#1A1816'] as const, roman: 'VI',   testamentEn: 'New Testament', testamentPt: 'Novo Testamento' },
  { bookId: 'philippians',  gradient: ['#1B3A5A', '#0D1F35'] as const, roman: 'XI',   testamentEn: 'New Testament', testamentPt: 'Novo Testamento' },
  { bookId: '1corinthians', gradient: ['#4A1230', '#28091A'] as const, roman: 'VII',  testamentEn: 'New Testament', testamentPt: 'Novo Testamento' },
];

// ── Book Cover Card ───────────────────────────────────────────────────────────
function BookCoverCard({ meta }: { meta: BookMeta }) {
  const colors = useColors();
  const book = BIBLE_DATA[meta.bookId];
  if (!book) return null;
  const chapterKey = Object.keys(book.chapters)[0];
  const verseCount = book.chapters[Number(chapterKey)]?.length ?? 0;

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/chapter',
      params: {
        bookId: meta.bookId,
        chapter: chapterKey,
        bookName: book.name,
        englishBookName: book.englishName,
      },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.88} style={styles.bookCard}>
      <LinearGradient
        colors={meta.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={[styles.bookGradient, { borderRadius: colors.radius + 2 }]}
      >
        {/* Roman numeral watermark */}
        <Text style={styles.romanWatermark}>{meta.roman}</Text>

        {/* Bottom overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.72)']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Verse count badge */}
        <View style={styles.verseBadge}>
          <Text style={styles.verseBadgeText}>{verseCount}v</Text>
        </View>

        {/* Bottom text */}
        <View style={styles.bookBottom}>
          <Text style={styles.testamentLabel}>{meta.testamentPt.toUpperCase()}</Text>
          <Text style={styles.bookNameEn}>{book.englishName}</Text>
          <Text style={styles.bookNamePt}>{book.name}</Text>
          <View style={styles.openRow}>
            <Text style={styles.openText}>Abrir capítulo {chapterKey}</Text>
            <Feather name="arrow-right" size={11} color="rgba(255,255,255,0.6)" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookmarks, vocabulary, readingProgress } = useBible();

  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  const handleContinue = () => {
    if (!readingProgress) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/chapter',
      params: {
        bookId: readingProgress.bookId,
        chapter: String(readingProgress.chapter),
        bookName: readingProgress.bookName,
        englishBookName: readingProgress.englishBookName,
      },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ── */}
      <LinearGradient
        colors={['#1B3A6B', '#0D1B2A']}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
      >
        {/* Decorative cross */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.crossV, { backgroundColor: 'rgba(196,146,42,0.18)' }]} />
          <View style={[styles.crossH, { backgroundColor: 'rgba(196,146,42,0.18)' }]} />
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.appName}>BíbliaEN</Text>
          <View style={styles.goldLine} />
          <Text style={styles.heroSub}>Aprenda inglês com a Palavra</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
          {[
            { value: bookmarks.length,                               label: 'Favoritos' },
            { value: vocabulary.length,                              label: 'Palavras'  },
            { value: vocabulary.filter(v => v.mastered).length,     label: 'Dominadas' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />}
              <View style={styles.stat}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      {/* ── Modo Diário ── */}
      <DailyCard />

      {/* ── Continue Reading ── */}
      {readingProgress && (
        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>CONTINUAR LENDO</Text>
          <TouchableOpacity onPress={handleContinue} activeOpacity={0.85}>
            <View style={[styles.continueCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <View style={[styles.continueIcon, { backgroundColor: colors.accent + '22' }]}>
                <Feather name="book-open" size={22} color={colors.accent} />
              </View>
              <View style={styles.continueText}>
                <Text style={[styles.continueName, { color: colors.foreground }]}>
                  {readingProgress.englishBookName} {readingProgress.chapter}
                </Text>
                <Text style={[styles.continueNamePt, { color: colors.mutedForeground }]}>
                  {readingProgress.bookName} {readingProgress.chapter}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Books Carousel (main) ── */}
      <View style={[styles.section, { marginTop: readingProgress ? 24 : 28 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>LIVROS DISPONÍVEIS</Text>
          <Text style={[styles.sectionCount, { color: colors.accent }]}>
            {BOOK_CATALOGUE.length} livros
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.booksRow}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + 12}
          snapToAlignment="start"
        >
          {BOOK_CATALOGUE.map(meta => (
            <BookCoverCard key={meta.bookId} meta={meta} />
          ))}
        </ScrollView>
      </View>

      {/* ── Learning Tip ── */}
      <View style={[styles.section, { marginTop: 8 }]}>
        <View style={[
          styles.tipCard,
          { backgroundColor: colors.accent + '12', borderRadius: colors.radius, borderColor: colors.accent + '35', borderWidth: 1 },
        ]}>
          <Feather name="zap" size={16} color={colors.accent} />
          <Text style={[styles.tipText, { color: colors.foreground }]}>
            <Text style={{ fontFamily: 'Inter_600SemiBold' }}>Dica: </Text>
            Toque em qualquer palavra em inglês durante a leitura para ver sua tradução e salvar no vocabulário.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const CARD_WIDTH = 158;

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hero
  hero: {
    paddingBottom: 22,
    paddingHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  crossV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1.5,
  },
  crossH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '42%',
    height: 1.5,
  },
  heroContent: { alignItems: 'center', marginBottom: 20 },
  appName: {
    fontSize: 38,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  goldLine: {
    width: 44,
    height: 3,
    backgroundColor: '#C4922A',
    borderRadius: 2,
    marginVertical: 10,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 14,
  },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  statDivider: { width: 1, marginVertical: 4 },

  // Section
  section: { paddingHorizontal: 16, marginBottom: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
  },
  sectionCount: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },

  // Books carousel
  booksRow: { gap: 12, paddingRight: 16 },

  // Book card
  bookCard: { width: CARD_WIDTH },
  bookGradient: {
    height: 220,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  romanWatermark: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 88,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.06)',
    letterSpacing: -2,
  },
  verseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verseBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  bookBottom: { gap: 3 },
  testamentLabel: {
    fontSize: 8,
    fontFamily: 'Inter_700Bold',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.4,
    marginBottom: 2,
  },
  bookNameEn: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  bookNamePt: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.6)',
  },
  openRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  openText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: 'rgba(255,255,255,0.55)',
  },

  // Continue reading
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  continueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { flex: 1 },
  continueName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  continueNamePt: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },

  // Daily card
  dailyCard:      { padding: 18, overflow: 'hidden' },
  dailyBadgeRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dailyBadge:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(196,146,42,0.15)', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(196,146,42,0.3)' },
  dailyBadgeText: { color: '#C4922A', fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  dailyRef:       { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'Inter_500Medium' },
  dailyVerse:     { fontSize: 15, fontFamily: 'Inter_400Regular', color: '#FFFFFF', lineHeight: 24, marginBottom: 14, fontStyle: 'italic' },
  dailyFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dailyVersePt:   { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.35)', flex: 1 },
  dailyOpenBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dailyOpenText:  { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#C4922A' },

  // Tip
  tipCard: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
});

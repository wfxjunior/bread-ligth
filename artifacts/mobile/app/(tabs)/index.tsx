import React from 'react';
import {
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
import { useColors } from '@/hooks/useColors';
import { useBible } from '@/context/BibleContext';
import { BIBLE_DATA, FEATURED_PASSAGES, type FeaturedPassage } from '@/constants/bibleData';

function PassageCard({ passage }: { passage: FeaturedPassage }) {
  const colors = useColors();
  const book = BIBLE_DATA[passage.bookId];
  const verseCount = book?.chapters[passage.chapter]?.length ?? 0;

  const handlePress = () => {
    router.push({
      pathname: '/chapter',
      params: {
        bookId: passage.bookId,
        chapter: String(passage.chapter),
        bookName: book?.name ?? '',
        englishBookName: book?.englishName ?? '',
      },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.passageCard}>
      <LinearGradient
        colors={passage.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.passageGradient, { borderRadius: colors.radius }]}
      >
        <View style={styles.passageTop}>
          <Text style={styles.passageRef}>
            {book?.englishName} {passage.chapter}
          </Text>
          <View style={styles.passageVerseCount}>
            <Text style={styles.passageVerseCountText}>{verseCount}v</Text>
          </View>
        </View>
        <Text style={styles.passageTitleEn}>{passage.titleEn}</Text>
        <Text style={styles.passageTitlePt}>{passage.titlePt}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookmarks, vocabulary, readingProgress } = useBible();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleContinue = () => {
    if (!readingProgress) return;
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
      contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 84 : 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <LinearGradient
        colors={['#1B3A6B', '#0D1B2A']}
        style={[styles.hero, { paddingTop: topPad + 24, borderRadius: 0 }]}
      >
        <View style={styles.heroCross}>
          <View style={[styles.crossV, { backgroundColor: 'rgba(196,146,42,0.3)' }]} />
          <View style={[styles.crossH, { backgroundColor: 'rgba(196,146,42,0.3)' }]} />
        </View>
        <View style={styles.heroContent}>
          <Text style={styles.appName}>BíbliaEN</Text>
          <View style={styles.goldLine} />
          <Text style={styles.heroSub}>Aprenda inglês com a Palavra</Text>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, { backgroundColor: 'rgba(255,255,255,0.07)' }]}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{bookmarks.length}</Text>
            <Text style={styles.statLabel}>Favoritos</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{vocabulary.length}</Text>
            <Text style={styles.statLabel}>Palavras</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{vocabulary.filter(v => v.mastered).length}</Text>
            <Text style={styles.statLabel}>Dominadas</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Continue Reading */}
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

      {/* Featured Passages */}
      <View style={[styles.section, { marginTop: readingProgress ? 20 : 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PASSAGENS EM DESTAQUE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.passagesRow}>
          {FEATURED_PASSAGES.map((p) => (
            <PassageCard key={`${p.bookId}-${p.chapter}`} passage={p} />
          ))}
        </ScrollView>
      </View>

      {/* Learning Tip */}
      <View style={styles.section}>
        <View style={[styles.tipCard, { backgroundColor: colors.accent + '15', borderRadius: colors.radius, borderColor: colors.accent + '40', borderWidth: 1 }]}>
          <Feather name="info" size={18} color={colors.accent} />
          <Text style={[styles.tipText, { color: colors.foreground }]}>
            <Text style={{ fontFamily: 'Inter_600SemiBold' }}>Dica: </Text>
            Toque em qualquer palavra em inglês durante a leitura para ver sua tradução em português e salvar no vocabulário.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  heroCross: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossV: {
    position: 'absolute',
    width: 2,
    height: '100%',
  },
  crossH: {
    position: 'absolute',
    width: '100%',
    height: 2,
    top: '40%',
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 38,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  goldLine: {
    width: 48,
    height: 3,
    backgroundColor: '#C4922A',
    borderRadius: 2,
    marginVertical: 10,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 12,
    paddingVertical: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  passagesRow: {
    paddingRight: 16,
    gap: 12,
  },
  passageCard: {
    width: 160,
  },
  passageGradient: {
    padding: 16,
    height: 140,
    justifyContent: 'space-between',
  },
  passageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passageRef: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  passageVerseCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  passageVerseCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  passageTitleEn: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    lineHeight: 22,
  },
  passageTitlePt: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
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
  continueText: {
    flex: 1,
  },
  continueName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  continueNamePt: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
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

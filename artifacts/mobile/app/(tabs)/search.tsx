import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useLanguage } from '@/context/LanguageContext';
import { BIBLE_DATA, FEATURED_PASSAGES, searchBible } from '@/constants/bibleData';
import { fontSize as ts } from '@/constants/design';

const RECENT_KEY = '@bibliaeN:recentSearches';
const MAX_RECENT = 8;

// Curated topical shortcuts — common things a reader might want to look up.
const POPULAR_TOPICS = ['amor', 'fé', 'esperança', 'perdão', 'paz', 'sabedoria', 'medo', 'gratidão'];

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t: tl } = useLanguage();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((raw) => {
      if (raw) {
        try { setRecent(JSON.parse(raw)); } catch { /* ignore corrupt value */ }
      }
    });
  }, []);

  const results = query.trim().length >= 3 ? searchBible(query) : [];

  const commitSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (trimmed.length < 3) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const runSearch = useCallback((term: string) => {
    setQuery(term);
    commitSearch(term);
  }, [commitSearch]);

  const clearRecent = useCallback(() => {
    setRecent([]);
    AsyncStorage.removeItem(RECENT_KEY).catch(() => {});
  }, []);

  const handleVersePress = (bookId: string, chapter: number) => {
    const book = BIBLE_DATA[bookId];
    router.push({
      pathname: '/chapter',
      params: {
        bookId,
        chapter: String(chapter),
        bookName: book?.name ?? '',
        englishBookName: book?.englishName ?? '',
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{tl('search_title')}</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder={tl('search_placeholder')}
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => commitSearch(query)}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim().length === 0 ? (
        <FlatList
          data={[]}
          keyExtractor={() => 'x'}
          renderItem={null}
          ListHeaderComponent={
            <View style={styles.suggestWrap}>
              <View style={styles.emptyIntro}>
                <Feather name="search" size={36} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{tl('search_intro_title')}</Text>
                <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                  {tl('search_intro_sub')}
                </Text>
              </View>

              {recent.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{tl('search_recent')}</Text>
                    <TouchableOpacity onPress={clearRecent} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[styles.clearLink, { color: colors.mutedForeground }]}>{tl('search_clear')}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.chipRow}>
                    {recent.map((term) => (
                      <TouchableOpacity
                        key={term}
                        style={[styles.chip, { backgroundColor: colors.muted, borderColor: colors.border }]}
                        onPress={() => runSearch(term)}
                      >
                        <Feather name="clock" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.chipText, { color: colors.foreground }]}>{term}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{tl('search_popular')}</Text>
                <View style={styles.chipRow}>
                  {POPULAR_TOPICS.map((term) => (
                    <TouchableOpacity
                      key={term}
                      style={[styles.chip, { backgroundColor: colors.primary + '14', borderColor: colors.primary + '30' }]}
                      onPress={() => runSearch(term)}
                    >
                      <Text style={[styles.chipText, { color: colors.primary }]}>{term}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{tl('search_featured')}</Text>
                {FEATURED_PASSAGES.slice(0, 6).map((fp) => {
                  const book = BIBLE_DATA[fp.bookId];
                  return (
                    <TouchableOpacity
                      key={`${fp.bookId}-${fp.chapter}`}
                      style={[styles.featuredRow, { borderColor: colors.border }]}
                      onPress={() => handleVersePress(fp.bookId, fp.chapter)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.featuredDot, { backgroundColor: fp.gradient[1] }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.featuredTitle, { color: colors.foreground }]}>{fp.titlePt}</Text>
                        <Text style={[styles.featuredSub, { color: colors.mutedForeground }]}>
                          {book?.englishName} {fp.chapter}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          }
          contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : query.trim().length < 3 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            {tl('search_min_chars')}
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="frown" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{tl('search_no_results_title')}</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            {tl('search_no_results_for')} "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.bookId}-${item.chapter}-${item.verse.v}`}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              {results.length} {results.length !== 1 ? tl('search_result_plural') : tl('search_result_singular')}
            </Text>
          }
          renderItem={({ item }) => {
            const book = BIBLE_DATA[item.bookId];
            return (
              <TouchableOpacity
                style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
                onPress={() => { commitSearch(query); handleVersePress(item.bookId, item.chapter); }}
                activeOpacity={0.85}
              >
                <View style={styles.resultRef}>
                  <View style={[styles.refBadge, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.refText, { color: colors.primary }]}>
                      {book?.englishName} {item.chapter}:{item.verse.v}
                    </Text>
                  </View>
                  <Text style={[styles.refTextPt, { color: colors.mutedForeground }]}>
                    {book?.name} {item.chapter}:{item.verse.v}
                  </Text>
                </View>
                <Text style={[styles.verseEn, { color: colors.englishText }]} numberOfLines={3}>
                  {item.verse.en}
                </Text>
                <Text style={[styles.versePt, { color: colors.portugueseText }]} numberOfLines={2}>
                  {item.verse.pt}
                </Text>
                <View style={styles.resultFooter}>
                  <Text style={[styles.readMore, { color: colors.accent }]}>{tl('read_chapter')}</Text>
                  <Feather name="arrow-right" size={14} color={colors.accent} />
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: bottomPad + 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!!results.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  headerTitle: {
    fontSize: ts.heading,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  resultCount: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  resultCard: {
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  resultRef: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  refText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  refTextPt: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  verseEn: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 23,
  },
  versePt: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  resultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  readMore: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },

  // Empty-state suggestions
  suggestWrap: { paddingHorizontal: 20, paddingTop: 8 },
  emptyIntro: { alignItems: 'center', gap: 8, paddingVertical: 28 },
  section: { marginBottom: 26 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  clearLink: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  featuredDot: { width: 8, height: 8, borderRadius: 4 },
  featuredTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  featuredSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
});

import React, { useState } from 'react';
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
import { useColors } from '@/hooks/useColors';
import { BIBLE_DATA, searchBible } from '@/constants/bibleData';

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 84 : 0;

  const results = query.trim().length >= 3 ? searchBible(query) : [];

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

  const highlightText = (text: string) => {
    const q = query.toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1 || query.length < 3) return text;
    return text;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Buscar</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Buscar em inglês ou português..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
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
        <View style={styles.empty}>
          <Feather name="search" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Buscar na Bíblia</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Digite uma palavra ou frase em inglês ou português para encontrar versículos
          </Text>
        </View>
      ) : query.trim().length < 3 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Digite pelo menos 3 caracteres para buscar
          </Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="frown" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sem resultados</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Nenhum versículo encontrado para "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.bookId}-${item.chapter}-${item.verse.v}`}
          ListHeaderComponent={
            <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>
              {results.length} resultado{results.length !== 1 ? 's' : ''}
            </Text>
          }
          renderItem={({ item }) => {
            const book = BIBLE_DATA[item.bookId];
            return (
              <TouchableOpacity
                style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
                onPress={() => handleVersePress(item.bookId, item.chapter)}
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
                  <Text style={[styles.readMore, { color: colors.accent }]}>Ler capítulo</Text>
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
    fontSize: 26,
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
});

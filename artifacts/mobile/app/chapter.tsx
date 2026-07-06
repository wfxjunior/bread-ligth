import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useBible, type DisplayMode } from '@/context/BibleContext';
import { BIBLE_DATA, type BibleVerse } from '@/constants/bibleData';
import VerseRow from '@/components/VerseRow';
import WordModal from '@/components/WordModal';

type Params = { bookId: string; chapter: string; bookName: string; englishBookName: string };

const MODE_LABELS: { key: DisplayMode; label: string }[] = [
  { key: 'both', label: 'EN+PT' },
  { key: 'english', label: 'EN' },
  { key: 'portuguese', label: 'PT' },
];

export default function ChapterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();
  const { bookId, chapter, bookName, englishBookName } = params;
  const chapterNum = Number(chapter ?? 1);

  const { displayMode, setDisplayMode, isBookmarked, addBookmark, removeBookmark, saveReadingProgress } = useBible();

  const [selectedWord, setSelectedWord] = useState('');
  const [wordContext, setWordContext] = useState('');
  const [wordModalVisible, setWordModalVisible] = useState(false);

  const book = bookId ? BIBLE_DATA[bookId] : null;
  const verses: BibleVerse[] = book?.chapters[chapterNum] ?? [];

  // Save reading progress whenever this screen is opened
  React.useEffect(() => {
    if (bookId && book) {
      saveReadingProgress({
        bookId,
        chapter: chapterNum,
        bookName: bookName ?? book.name,
        englishBookName: englishBookName ?? book.englishName,
      });
    }
  }, [bookId, chapterNum]);

  const handleWordPress = useCallback((word: string, context: string) => {
    setSelectedWord(word);
    setWordContext(context);
    setWordModalVisible(true);
  }, []);

  const handleBookmarkToggle = useCallback((verse: BibleVerse) => {
    if (!book || !bookId) return;
    if (isBookmarked(bookId, chapterNum, verse.v)) {
      removeBookmark(bookId, chapterNum, verse.v);
    } else {
      addBookmark({
        bookId,
        bookName: bookName ?? book.name,
        englishBookName: englishBookName ?? book.englishName,
        chapter: chapterNum,
        verse: verse.v,
        en: verse.en,
        pt: verse.pt,
        savedAt: Date.now(),
      });
    }
  }, [book, bookId, chapterNum, bookName, englishBookName, isBookmarked, addBookmark, removeBookmark]);

  const headerTitle = `${englishBookName ?? book?.englishName ?? ''} ${chapterNum}`;
  const headerTitlePt = `${bookName ?? book?.name ?? ''} ${chapterNum}`;

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.primary,
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitleEn, { color: colors.primary }]}>{headerTitle}</Text>
              <Text style={[styles.headerTitlePt, { color: colors.mutedForeground }]}>{headerTitlePt}</Text>
            </View>
          ),
          headerBackTitle: 'Voltar',
          headerRight: () => null,
        }}
      />

      {/* Mode Toggle */}
      <View style={[styles.modeBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.modeLabel, { color: colors.mutedForeground }]}>Exibir:</Text>
        <View style={[styles.modeToggle, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          {MODE_LABELS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.modeBtn,
                displayMode === key && [styles.modeBtnActive, { backgroundColor: colors.primary }],
                { borderRadius: colors.radius - 2 },
              ]}
              onPress={() => setDisplayMode(key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeBtnText, { color: displayMode === key ? colors.primaryForeground : colors.mutedForeground }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.modeHint}>
          <Feather name="info" size={13} color={colors.mutedForeground} />
          <Text style={[styles.modeHintText, { color: colors.mutedForeground }]}>toque nas palavras</Text>
        </View>
      </View>

      {verses.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="book" size={44} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Capítulo não disponível</Text>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={(item) => String(item.v)}
          renderItem={({ item }) => (
            <VerseRow
              verse={item}
              displayMode={displayMode}
              isBookmarked={isBookmarked(bookId ?? '', chapterNum, item.v)}
              onWordPress={handleWordPress}
              onBookmarkToggle={() => handleBookmarkToggle(item)}
            />
          )}
          ListHeaderComponent={
            <View style={[styles.chapterHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.goldAccent, { backgroundColor: colors.accent }]} />
              <View>
                <Text style={[styles.chapterNum, { color: colors.accent }]}>
                  Capítulo {chapterNum}
                </Text>
                <Text style={[styles.chapterNumEn, { color: colors.mutedForeground }]}>
                  Chapter {chapterNum} · {verses.length} versículos
                </Text>
              </View>
            </View>
          }
          ListFooterComponent={<View style={{ height: bottomPad + 24 }} />}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="never"
        />
      )}

      <WordModal
        visible={wordModalVisible}
        word={selectedWord}
        context={wordContext}
        onClose={() => setWordModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitleEn: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  headerTitlePt: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  modeLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  modeToggle: {
    flexDirection: 'row',
    padding: 3,
    gap: 2,
  },
  modeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  modeBtnActive: {},
  modeBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  modeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modeHintText: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  goldAccent: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  chapterNum: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  chapterNumEn: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});

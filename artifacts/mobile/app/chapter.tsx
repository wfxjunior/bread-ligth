import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useBible, type DisplayMode } from '@/context/BibleContext';
import { BIBLE_DATA, type BibleVerse } from '@/constants/bibleData';
import VerseRow from '@/components/VerseRow';
import WordModal from '@/components/WordModal';

// ── Text size selector ────────────────────────────────────────────────────────
const TEXT_SIZES = [
  { key: 'small',  labelSize: 11 },
  { key: 'medium', labelSize: 15 },
  { key: 'large',  labelSize: 19 },
] as const;
type TextSize = typeof TEXT_SIZES[number]['key'];
const TEXT_SIZE_KEY = '@bibliaeN:textSize';

// Chapter number → English word
const CH_WORDS = [
  'One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen',
  'Eighteen','Nineteen','Twenty','Twenty-One','Twenty-Two','Twenty-Three',
  'Twenty-Four','Twenty-Five','Twenty-Six','Twenty-Seven','Twenty-Eight',
  'Twenty-Nine','Thirty','Thirty-One',
];

// Chapter number → Portuguese word
const CH_WORDS_PT = [
  'Um','Dois','Três','Quatro','Cinco','Seis','Sete','Oito','Nove','Dez',
  'Onze','Doze','Treze','Quatorze','Quinze','Dezesseis','Dezessete',
  'Dezoito','Dezenove','Vinte','Vinte e Um','Vinte e Dois','Vinte e Três',
  'Vinte e Quatro','Vinte e Cinco','Vinte e Seis','Vinte e Sete','Vinte e Oito',
  'Vinte e Nove','Trinta','Trinta e Um',
];

// Chapter action bar items
const ACTIONS = [
  { icon: 'zap'       as const, label: 'Explicar'  },
  { icon: 'edit-2'    as const, label: 'Marcar'    },
  { icon: 'bookmark'  as const, label: 'Salvar'    },
  { icon: 'file-text' as const, label: 'Nota'      },
];

type Params = { bookId: string; chapter: string; bookName: string; englishBookName: string };

const MODE_LABELS: { key: DisplayMode; label: string }[] = [
  { key: 'both', label: 'EN+PT' },
  { key: 'english', label: 'EN' },
  { key: 'portuguese', label: 'PT' },
];

// All books in canonical order
const ALL_BOOKS = Object.values(BIBLE_DATA);

// ── Book picker modal ────────────────────────────────────────────────────────
function BookPickerModal({
  visible, currentBookId, onSelect, onClose,
}: {
  visible: boolean;
  currentBookId: string;
  onSelect: (bookId: string) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const oldBooks = ALL_BOOKS.filter(b => b.testament === 'old');
  const newBooks = ALL_BOOKS.filter(b => b.testament === 'new');

  const renderBook = (b: typeof ALL_BOOKS[0]) => {
    const isActive = b.id === currentBookId;
    const chapter = Object.keys(b.chapters)[0];
    return (
      <TouchableOpacity
        key={b.id}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          onSelect(b.id);
        }}
        activeOpacity={0.75}
        style={[
          styles.bookItem,
          { borderColor: colors.border },
          isActive && { backgroundColor: colors.primary + '12', borderColor: colors.primary + '40' },
        ]}
      >
        <View style={styles.bookItemInner}>
          <Text style={[styles.bookItemEn, { color: isActive ? colors.primary : colors.foreground }]}>
            {b.englishName}
          </Text>
          <Text style={[styles.bookItemPt, { color: colors.mutedForeground }]}>{b.name}</Text>
        </View>
        <View style={styles.bookItemRight}>
          <Text style={[styles.bookChapterBadge, { color: colors.mutedForeground }]}>
            Ch. {chapter}
          </Text>
          {isActive && <Feather name="check" size={14} color={colors.primary} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalSheet,
            { backgroundColor: colors.card, paddingBottom: insets.bottom + 12 },
          ]}
          onPress={e => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Escolher Livro</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 4, paddingBottom: 8 }}>
            <Text style={[styles.testamentLabel, { color: colors.mutedForeground }]}>ANTIGO TESTAMENTO</Text>
            {oldBooks.map(renderBook)}
            <Text style={[styles.testamentLabel, { color: colors.mutedForeground, marginTop: 12 }]}>NOVO TESTAMENTO</Text>
            {newBooks.map(renderBook)}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ChapterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Params>();

  const [currentBookId, setCurrentBookId] = useState(params.bookId ?? ALL_BOOKS[0].id);
  const [pickerVisible, setPickerVisible] = useState(false);

  const book = BIBLE_DATA[currentBookId] ?? null;

  // Sorted chapter keys for the current book
  const chapterKeys = book
    ? Object.keys(book.chapters).map(Number).sort((a, b) => a - b)
    : [1];

  // Current chapter — seeded from URL param, defaults to first chapter of book
  const [currentChapter, setCurrentChapter] = useState<number>(() => {
    const fromParam = params.chapter ? Number(params.chapter) : NaN;
    return !isNaN(fromParam) ? fromParam : (chapterKeys[0] ?? 1);
  });
  const chapterNum = currentChapter;
  const verses: BibleVerse[] = book?.chapters[chapterNum] ?? [];

  // Chapter navigation within the current book
  const chapterIdx = chapterKeys.indexOf(chapterNum);
  const hasPrev = chapterIdx > 0;
  const hasNext = chapterIdx < chapterKeys.length - 1;

  const { displayMode, setDisplayMode, isBookmarked, addBookmark, removeBookmark, saveReadingProgress } = useBible();

  // Text size — persisted in AsyncStorage
  const [textSize, setTextSize] = useState<TextSize>('medium');
  useEffect(() => {
    AsyncStorage.getItem(TEXT_SIZE_KEY)
      .then(v => { if (v === 'small' || v === 'large') setTextSize(v as TextSize); })
      .catch(() => {});
  }, []);
  const handleSizeChange = useCallback((s: TextSize) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setTextSize(s);
    AsyncStorage.setItem(TEXT_SIZE_KEY, s).catch(() => {});
  }, []);

  const [focusMode, setFocusMode] = useState(false);

  const [selectedWord, setSelectedWord] = useState('');
  const [wordContext, setWordContext] = useState('');
  const [wordModalVisible, setWordModalVisible] = useState(false);

  const listRef = useRef<FlatList>(null);

  // Save reading progress
  React.useEffect(() => {
    if (book) {
      saveReadingProgress({
        bookId: currentBookId,
        chapter: chapterNum,
        bookName: book.name,
        englishBookName: book.englishName,
      });
    }
  }, [currentBookId, chapterNum]);

  const navigateBook = useCallback((dir: 'prev' | 'next') => {
    const nextIdx = dir === 'prev' ? chapterIdx - 1 : chapterIdx + 1;
    if (nextIdx < 0 || nextIdx >= chapterKeys.length) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setCurrentChapter(chapterKeys[nextIdx]);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [chapterIdx, chapterKeys]);

  const handleSelectBook = useCallback((bookId: string) => {
    const newBook = BIBLE_DATA[bookId];
    const firstChapter = newBook
      ? Object.keys(newBook.chapters).map(Number).sort((a, b) => a - b)[0] ?? 1
      : 1;
    setCurrentBookId(bookId);
    setCurrentChapter(firstChapter);
    setPickerVisible(false);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  const handleWordPress = useCallback((word: string, context: string) => {
    setSelectedWord(word);
    setWordContext(context);
    setWordModalVisible(true);
  }, []);

  const handleBookmarkToggle = useCallback((verse: BibleVerse) => {
    if (!book) return;
    if (isBookmarked(currentBookId, chapterNum, verse.v)) {
      removeBookmark(currentBookId, chapterNum, verse.v);
    } else {
      addBookmark({
        bookId: currentBookId,
        bookName: book.name,
        englishBookName: book.englishName,
        chapter: chapterNum,
        verse: verse.v,
        en: verse.en,
        pt: verse.pt,
        savedAt: Date.now(),
      });
    }
  }, [book, currentBookId, chapterNum, isBookmarked, addBookmark, removeBookmark]);

  const toggleFocus = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFocusMode(f => !f);
  }, []);

  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Custom Header (hidden in focus mode) ── */}
      {!focusMode && (
        <View style={[styles.header, { paddingTop: topPad + 6, backgroundColor: colors.card, borderBottomColor: colors.border }]}>

          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="arrow-left" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Tappable book title */}
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            style={styles.headerCenter}
            activeOpacity={0.75}
          >
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerBookEn, { color: colors.foreground }]}>
                {book?.englishName ?? '—'}
              </Text>
              <Feather name="chevron-down" size={15} color={colors.primary} style={{ marginTop: 1 }} />
            </View>
            <Text style={[styles.headerBookPt, { color: colors.mutedForeground }]}>
              {book?.name} {chapterNum}
            </Text>
          </TouchableOpacity>

          {/* Text size selector */}
          <View style={[styles.levelSelector, { backgroundColor: colors.muted, borderRadius: 10 }]}>
            {TEXT_SIZES.map(s => {
              const active = textSize === s.key;
              return (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => handleSizeChange(s.key)}
                  style={[
                    styles.levelBtn,
                    active && [styles.levelBtnActive, { backgroundColor: colors.primary, borderRadius: 7 }],
                  ]}
                  hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
                >
                  <Text style={[styles.levelCode, { fontSize: s.labelSize, color: active ? colors.primaryForeground : colors.mutedForeground }]}>
                    A
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Focus / expand button */}
          <TouchableOpacity
            onPress={toggleFocus}
            style={styles.focusBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="maximize-2" size={17} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Mode Bar (hidden in focus mode) ── */}
      {!focusMode && (
        <View style={[styles.modeBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={[styles.modeToggle, { backgroundColor: colors.muted, borderRadius: 10 }]}>
            {MODE_LABELS.map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.modeBtn,
                  displayMode === key && [styles.modeBtnActive, { backgroundColor: colors.primary }],
                  { borderRadius: 8 },
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setDisplayMode(key);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeBtnText, { color: displayMode === key ? colors.primaryForeground : colors.mutedForeground }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.modeHint}>
            <Feather name="zap" size={11} color={colors.accent} />
            <Text style={[styles.modeHintText, { color: colors.mutedForeground }]}>toque nas palavras</Text>
          </View>
        </View>
      )}

      {/* ── Fixed action toolbar (hidden in focus mode) ── */}
      {!focusMode && (
        <View style={[styles.actionBar, { backgroundColor: colors.primary, borderBottomColor: colors.border }]}>
          {ACTIONS.map(({ icon, label }) => (
            <TouchableOpacity
              key={label}
              style={styles.actionBtn}
              onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
              activeOpacity={0.75}
            >
              <Feather name={icon} size={16} color={colors.primaryForeground} />
              <Text style={[styles.actionLabel, { color: colors.primaryForeground }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Floating exit button — only in focus mode ── */}
      {focusMode && (
        <TouchableOpacity
          onPress={toggleFocus}
          style={[styles.focusExitBtn, {
            top: topPad + 12,
            backgroundColor: colors.card,
            borderColor: colors.border,
          }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.75}
        >
          <Feather name="minimize-2" size={15} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}

      {/* ── Verse list ── */}
      {verses.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="book-open" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Capítulo não disponível</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Este capítulo ainda não foi adicionado</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={verses}
          keyExtractor={(item) => `${currentBookId}-${chapterNum}-${item.v}`}
          extraData={[focusMode, displayMode, chapterNum, textSize, currentBookId]}
          renderItem={({ item }) => (
            <VerseRow
              verse={item}
              displayMode={displayMode}
              textSize={textSize}
              isBookmarked={isBookmarked(currentBookId, chapterNum, item.v)}
              onWordPress={handleWordPress}
              onBookmarkToggle={() => handleBookmarkToggle(item)}
            />
          )}
          ListHeaderComponent={
            <View style={[styles.chapterHeader, { borderBottomColor: colors.border }]}>

              {/* ── Navigation row (hidden in focus mode) ── */}
              {!focusMode && (
                <View style={styles.chapterNavRow}>
                  <TouchableOpacity
                    onPress={() => navigateBook('prev')} disabled={!hasPrev}
                    style={[styles.chapterNavBtn, !hasPrev && { opacity: 0.22 }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="chevron-left" size={16} color={colors.mutedForeground} />
                    <Text style={[styles.chapterNavText, { color: colors.mutedForeground }]}>Anterior</Text>
                  </TouchableOpacity>

                  <View style={[styles.chapterDot, { backgroundColor: colors.accent }]} />

                  <TouchableOpacity
                    onPress={() => navigateBook('next')} disabled={!hasNext}
                    style={[styles.chapterNavBtn, styles.chapterNavBtnRight, !hasNext && { opacity: 0.22 }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.chapterNavText, { color: colors.mutedForeground }]}>Próximo</Text>
                    <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              )}

              {/* ── Book subtitle (small caps) — respects displayMode ── */}
              <Text style={[styles.bookSubtitle, { color: colors.accent }]}>
                {displayMode === 'portuguese'
                  ? book?.name?.toUpperCase()
                  : book?.englishName?.toUpperCase()}
              </Text>

              {/* ── Gold rule ── */}
              <View style={[styles.subtitleRule, { backgroundColor: colors.accent + '35' }]} />

              {/* ── Chapter heading — respects displayMode ── */}
              {displayMode === 'portuguese' ? (
                <Text style={[styles.chapterBig, { color: colors.foreground }]}>
                  Capítulo {CH_WORDS_PT[chapterNum - 1] ?? String(chapterNum)}
                </Text>
              ) : displayMode === 'english' ? (
                <Text style={[styles.chapterBig, { color: colors.foreground }]}>
                  Chapter {CH_WORDS[chapterNum - 1] ?? String(chapterNum)}
                </Text>
              ) : (
                <>
                  <Text style={[styles.chapterBig, { color: colors.foreground }]}>
                    Chapter {CH_WORDS[chapterNum - 1] ?? String(chapterNum)}
                  </Text>
                  <Text style={[styles.chapterBigPt, { color: colors.mutedForeground }]}>
                    Capítulo {CH_WORDS_PT[chapterNum - 1] ?? String(chapterNum)}
                  </Text>
                </>
              )}

              {/* ── Chapter meta ── */}
              <Text style={[styles.chapterMeta, { color: colors.mutedForeground }]}>
                {book?.name} {chapterNum} · {verses.length} versículo{verses.length !== 1 ? 's' : ''}
              </Text>

            </View>
          }
          ListFooterComponent={<View style={{ height: bottomPad + 32 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Book picker sheet ── */}
      <BookPickerModal
        visible={pickerVisible}
        currentBookId={currentBookId}
        onSelect={handleSelectBook}
        onClose={() => setPickerVisible(false)}
      />

      {/* ── Word modal ── */}
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  headerBtn: {
    width: 68,
    height: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBookEn: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  headerBookPt: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  navArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  navArrow: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Focus mode buttons
  focusBtn: {
    width: 34, height: 34, alignItems: 'center', justifyContent: 'center',
  },
  focusExitBtn: {
    position: 'absolute', right: 16, zIndex: 99,
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },

  // Text size selector (header right side)
  levelSelector: { flexDirection: 'row', padding: 3, gap: 2, alignItems: 'center' },
  levelBtn:      { paddingHorizontal: 9, paddingVertical: 5, alignItems: 'center', justifyContent: 'center', minWidth: 30 },
  levelBtnActive:{},
  levelCode:     { fontFamily: 'Inter_700Bold' },

  // Mode bar
  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
    flexWrap: 'nowrap',
  },
  modeLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', flexShrink: 0 },
  modeToggle: { flexDirection: 'row', padding: 3, gap: 1, flexShrink: 0 },
  modeBtn: { paddingHorizontal: 11, paddingVertical: 5 },
  modeBtnActive: {},
  modeBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  modeHint: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1, justifyContent: 'flex-end', overflow: 'hidden' },
  modeHintText: { fontSize: 10, fontFamily: 'Inter_400Regular', flexShrink: 1 },

  // Chapter header in list (redesigned)
  chapterHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 0,
  },

  // Nav row above heading
  chapterNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
  },
  chapterNavBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chapterNavBtnRight: { flexDirection: 'row-reverse' },
  chapterNavText:     { fontSize: 12, fontFamily: 'Inter_500Medium' },
  chapterDot:         { width: 5, height: 5, borderRadius: 3 },

  // Book subtitle in small caps
  bookSubtitle: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Gold rule below subtitle
  subtitleRule: {
    width: 48,
    height: 1.5,
    borderRadius: 1,
    marginBottom: 14,
  },

  // Large chapter number — Lora serif
  chapterBig: {
    fontSize: 36,
    fontFamily: 'Lora_700Bold',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },

  // PT subtitle below English chapter heading
  chapterBigPt: {
    fontSize: 14,
    fontFamily: 'Lora_400Regular_Italic',
    textAlign: 'center',
    marginBottom: 8,
  },

  chapterMeta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 4,
  },

  // Fixed action toolbar — always visible, sits between mode bar and list
  actionBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },

  // Book picker modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    gap: 12,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  testamentLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
    marginBottom: 4,
    marginTop: 4,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  bookItemInner: { gap: 2 },
  bookItemEn: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  bookItemPt: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  bookItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bookChapterBadge: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});

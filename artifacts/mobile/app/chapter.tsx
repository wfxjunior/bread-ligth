import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useAudio } from '@/context/AudioContext';
import { useBible, type DisplayMode } from '@/context/BibleContext';
import { BIBLE_DATA, type BibleVerse } from '@/constants/bibleData';
import VerseRow from '@/components/VerseRow';
import WordModal from '@/components/WordModal';
import AudioPlayer from '@/components/AudioPlayer';
import PronunciationPractice from '@/components/PronunciationPractice';
import { useTheme } from '@/context/ThemeContext';
import { READING_SPACES } from '@/constants/colors';
import SpaceBackground from '@/components/SpaceBackground';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/constants/i18n';

// ── Text size selector ────────────────────────────────────────────────────────
const TEXT_SIZES = [
  { key: 'small',  labelSize: 11 },
  { key: 'medium', labelSize: 15 },
  { key: 'large',  labelSize: 19 },
] as const;
type TextSize = typeof TEXT_SIZES[number]['key'];
const TEXT_SIZE_KEY  = '@bibliaeN:textSize';
const VERSE_NOTES_KEY = '@bibliaeN:verseNotes';
const VERSE_MARKS_KEY = '@bibliaeN:verseMarks';

// API base — same pattern as daily.tsx
const _domain = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = _domain ? `https://${_domain}/api` : null;

// Stable key for a verse across book/chapter
const vKey = (bookId: string, chapter: number, v: number) => `${bookId}:${chapter}:${v}`;

type NoteSheetState    = { v: number; text: string };
type ExplainSheetState = { v: number; loading: boolean; text: string; error?: string; lang: 'en' | 'pt' };

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

// Chapter action bar items — `key` drives logic (language-independent),
// `labelKey` drives the displayed text (respects the app language toggle).
const ACTIONS = [
  { icon: 'zap'       as const, key: 'explain'  as const, labelKey: 'action_explain' as const },
  { icon: 'edit-2'    as const, key: 'mark'     as const, labelKey: 'action_mark'    as const },
  { icon: 'bookmark'  as const, key: 'save'     as const, labelKey: 'action_save'    as const },
  { icon: 'file-text' as const, key: 'note'     as const, labelKey: 'action_note'    as const },
  { icon: 'mic'       as const, key: 'practice' as const, labelKey: 'action_practice' as const },
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
  const { lang } = useLanguage();

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
            {t(lang, 'chapter_abbr')} {chapter}
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
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{t(lang, 'book_picker_title')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 4, paddingBottom: 8 }}>
            <Text style={[styles.testamentLabel, { color: colors.mutedForeground }]}>{t(lang, 'testament_old_caps')}</Text>
            {oldBooks.map(renderBook)}
            <Text style={[styles.testamentLabel, { color: colors.mutedForeground, marginTop: 12 }]}>{t(lang, 'testament_new_caps')}</Text>
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
  const { lang } = useLanguage();

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
  const audio = useAudio();
  const chapterQueueKey = `chapter:${currentBookId}:${chapterNum}:${audio.readingLanguage}`;
  const isChapterAudioActive = audio.queueKey === chapterQueueKey;
  const activeVerseNum = isChapterAudioActive && audio.currentItem ? Number(audio.currentItem.id) : null;
  const [practiceVerse, setPracticeVerse] = useState<BibleVerse | null>(null);

  const handleSpeak = useCallback((v: number) => {
    const idx = verses.findIndex(vr => vr.v === v);
    if (idx === -1) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    if (isChapterAudioActive && activeVerseNum === v && audio.isPlaying) {
      audio.pause();
      return;
    }
    if (isChapterAudioActive && activeVerseNum === v && audio.isPaused) {
      audio.resume();
      return;
    }
    audio.playQueue(
      verses.map(vr => ({
        id: String(vr.v),
        text: audio.readingLanguage === 'pt' ? vr.pt : vr.en,
        cacheLabel: `${book?.englishName ?? currentBookId} ${chapterNum}:${vr.v}`,
      })),
      idx,
      chapterQueueKey,
    );
  }, [verses, audio, chapterQueueKey, isChapterAudioActive, activeVerseNum, book, chapterNum, currentBookId]);

  // ── Continuous listening: once the reader has pressed play, keep reading
  // into the next chapter (and next book, at a book's end) automatically.
  // Never starts playback on its own — only continues audio already begun
  // by the user on this screen.
  const pendingChapterAutoplayRef = useRef(false);

  const advanceToNextChapterAndKeepPlaying = useCallback(() => {
    const nextIdx = chapterIdx + 1;
    if (nextIdx < chapterKeys.length) {
      pendingChapterAutoplayRef.current = true;
      setCurrentChapter(chapterKeys[nextIdx]);
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
      return;
    }
    // End of book — continue into the first chapter of the next book, if any.
    const bookIdx = ALL_BOOKS.findIndex(b => b.id === currentBookId);
    const nextBook = bookIdx >= 0 ? ALL_BOOKS[bookIdx + 1] : undefined;
    if (!nextBook) return; // reached the end of the Bible — just stop
    const nextFirstChapter = Object.keys(nextBook.chapters).map(Number).sort((a, b) => a - b)[0] ?? 1;
    pendingChapterAutoplayRef.current = true;
    setCurrentBookId(nextBook.id);
    setCurrentChapter(nextFirstChapter);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [chapterIdx, chapterKeys, currentBookId]);

  // Detect the chapter's queue finishing naturally (not a manual pause/stop)
  // and trigger the advance above.
  useEffect(() => {
    if (
      audio.queueKey === chapterQueueKey &&
      audio.status === 'idle' &&
      audio.queue.length > 0 &&
      audio.currentIndex === audio.queue.length - 1
    ) {
      advanceToNextChapterAndKeepPlaying();
    }
  }, [audio.status, audio.queueKey, audio.currentIndex, audio.queue.length, chapterQueueKey, advanceToNextChapterAndKeepPlaying]);

  // Once the new chapter's verses are ready, start playing them from the top.
  useEffect(() => {
    if (pendingChapterAutoplayRef.current && verses.length > 0) {
      pendingChapterAutoplayRef.current = false;
      audio.playQueue(
        verses.map(vr => ({
          id: String(vr.v),
          text: audio.readingLanguage === 'pt' ? vr.pt : vr.en,
          cacheLabel: `${book?.englishName ?? currentBookId} ${chapterNum}:${vr.v}`,
        })),
        0,
        chapterQueueKey,
      );
    }
  }, [verses, chapterQueueKey, audio, book, chapterNum, currentBookId]);

  // Auto-scroll to the verse currently being read aloud
  useEffect(() => {
    if (activeVerseNum == null) return;
    const idx = verses.findIndex(vr => vr.v === activeVerseNum);
    if (idx === -1) return;
    try {
      listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
    } catch { /* handled by onScrollToIndexFailed */ }
  }, [activeVerseNum]);

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

  // Verse action popup
  const [selectedVerse, setSelectedVerse] = useState<{ v: number; popupY: number } | null>(null);
  const popupAnim = useRef(new Animated.Value(0)).current;
  const popupScale = popupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });
  const popupTranslateY = popupAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });

  const [selectedWord, setSelectedWord] = useState('');
  const [wordContext, setWordContext] = useState('');
  const [wordModalVisible, setWordModalVisible] = useState(false);

  // Verse annotations
  const [notes, setNotes]               = useState<Record<string, string>>({});
  const [marks, setMarks]               = useState<Set<string>>(new Set());
  const [noteSheet, setNoteSheet]       = useState<NoteSheetState | null>(null);
  const [explainSheet, setExplainSheet] = useState<ExplainSheetState | null>(null);

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

  // ── Verse annotations ─────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [nRaw, mRaw] = await Promise.all([
          AsyncStorage.getItem(VERSE_NOTES_KEY),
          AsyncStorage.getItem(VERSE_MARKS_KEY),
        ]);
        if (nRaw) setNotes(JSON.parse(nRaw) as Record<string, string>);
        if (mRaw) setMarks(new Set(JSON.parse(mRaw) as string[]));
      } catch {}
    })();
  }, []);

  const toggleMark = useCallback((v: number) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const key = vKey(currentBookId, chapterNum, v);
    setMarks(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      AsyncStorage.setItem(VERSE_MARKS_KEY, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }, [currentBookId, chapterNum]);

  const openNote = useCallback((v: number) => {
    const key = vKey(currentBookId, chapterNum, v);
    setNoteSheet({ v, text: notes[key] ?? '' });
  }, [currentBookId, chapterNum, notes]);

  const closeNote = useCallback(() => setNoteSheet(null), []);

  const saveNote = useCallback(() => {
    if (!noteSheet) return;
    const key  = vKey(currentBookId, chapterNum, noteSheet.v);
    const text = noteSheet.text.trim();
    setNotes(prev => {
      const next = { ...prev };
      if (text) next[key] = text; else delete next[key];
      AsyncStorage.setItem(VERSE_NOTES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    setNoteSheet(null);
  }, [noteSheet, currentBookId, chapterNum]);

  const deleteNote = useCallback((v: number) => {
    const key = vKey(currentBookId, chapterNum, v);
    setNotes(prev => {
      const next = { ...prev };
      delete next[key];
      AsyncStorage.setItem(VERSE_NOTES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    setNoteSheet(null);
  }, [currentBookId, chapterNum]);

  const openExplain = useCallback(async (v: number) => {
    if (!API_BASE) return;
    const vrs = verses.find(vr => vr.v === v);
    if (!vrs) return;
    const explainLang = audio.readingLanguage;
    setExplainSheet({ v, loading: true, text: '', lang: explainLang });
    try {
      // The reader's English level (set in Settings) shapes how the AI writes
      // the explanation — matched-difficulty text is itself reading practice.
      const level = (await AsyncStorage.getItem('@bibliaeN:level').catch(() => null)) ?? 'intermediate';
      const params = new URLSearchParams({
        book:    book?.englishName ?? '',
        chapter: String(chapterNum),
        verse:   String(v),
        en:      vrs.en,
        lang:    explainLang,
        level,
      });
      const res  = await fetch(`${API_BASE}/explain?${params}`);
      const data = await res.json() as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        setExplainSheet(s => s ? { ...s, loading: false, text: '', error: data.error ?? t(lang, 'explain_error_default') } : s);
      } else {
        setExplainSheet(s => s ? { ...s, loading: false, text: data.text! } : s);
      }
    } catch {
      setExplainSheet(s => s ? { ...s, loading: false, text: '', error: t(lang, 'explain_error_network') } : s);
    }
  }, [verses, book, chapterNum, audio.readingLanguage, lang]);

  const closeExplain = useCallback(() => setExplainSheet(null), []);

  const handleVerseSelect = useCallback((v: number, pageY: number, height: number) => {
    const { height: screenH } = Dimensions.get('window');
    const popupH = 76;
    let py = pageY + height + 10;
    if (py + popupH > screenH - 80) py = pageY - popupH - 10;
    py = Math.max(insets.top + 10, py);
    setSelectedVerse({ v, popupY: py });
    popupAnim.setValue(0);
    Animated.spring(popupAnim, { toValue: 1, useNativeDriver: true, tension: 220, friction: 15 }).start();
  }, [insets.top, popupAnim]);

  const handleVerseDeselect = useCallback(() => {
    Animated.timing(popupAnim, { toValue: 0, duration: 130, useNativeDriver: true }).start(() => {
      setSelectedVerse(null);
    });
  }, [popupAnim]);

  const toggleFocus = useCallback(() => {
    handleVerseDeselect();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFocusMode(f => !f);
  }, [handleVerseDeselect]);

  const topPad = Platform.OS === 'web' ? 0 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const { readingSpace } = useTheme();
  const activeSpace = READING_SPACES[readingSpace];

  return (
    <View style={[styles.container, { backgroundColor: activeSpace.gradient[0] }]}>
      <SpaceBackground gradient={activeSpace.gradient} />
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
            <Text style={[styles.modeHintText, { color: colors.mutedForeground }]}>{t(lang, 'tap_words_hint')}</Text>
          </View>
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
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{t(lang, 'chapter_unavailable_title')}</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>{t(lang, 'chapter_unavailable_sub')}</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={verses}
          keyExtractor={(item) => `${currentBookId}-${chapterNum}-${item.v}`}
          extraData={[focusMode, displayMode, chapterNum, textSize, currentBookId, selectedVerse?.v, marks, notes, audio.status, activeVerseNum]}
          onScrollBeginDrag={handleVerseDeselect}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              try { listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 }); } catch {}
            }, 250);
          }}
          renderItem={({ item }) => (
            <VerseRow
              verse={item}
              displayMode={displayMode}
              textSize={textSize}
              isBookmarked={isBookmarked(currentBookId, chapterNum, item.v)}
              onWordPress={handleWordPress}
              onBookmarkToggle={() => handleBookmarkToggle(item)}
              selected={selectedVerse?.v === item.v}
              onVersePress={handleVerseSelect}
              hasNote={!!notes[vKey(currentBookId, chapterNum, item.v)]}
              isMarked={marks.has(vKey(currentBookId, chapterNum, item.v))}
              onSpeak={() => handleSpeak(item.v)}
              isSpeakingThis={isChapterAudioActive && activeVerseNum === item.v && audio.isPlaying}
              isPlayingHighlight={isChapterAudioActive && activeVerseNum === item.v}
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
                    <Text style={[styles.chapterNavText, { color: colors.mutedForeground }]}>{t(lang, 'nav_previous')}</Text>
                  </TouchableOpacity>

                  <View style={[styles.chapterDot, { backgroundColor: colors.accent }]} />

                  <TouchableOpacity
                    onPress={() => navigateBook('next')} disabled={!hasNext}
                    style={[styles.chapterNavBtn, styles.chapterNavBtnRight, !hasNext && { opacity: 0.22 }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.chapterNavText, { color: colors.mutedForeground }]}>{t(lang, 'nav_next')}</Text>
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
                {book?.name} {chapterNum} · {verses.length} {t(lang, verses.length !== 1 ? 'verse_plural' : 'verse_singular')}
              </Text>

            </View>
          }
          ListFooterComponent={<View style={{ height: bottomPad + 110 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ── Docked continuous-playback player ── */}
      {verses.length > 0 && (
        <View style={[styles.dockedPlayerWrap, { bottom: bottomPad + 10 }]}>
          {/* Audio language pills — right on the reading screen, so switching
              from English to Portuguese (or back) never requires a trip to
              Settings; the active language is always visible here too. */}
          <View style={[styles.dockedLangRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(['en', 'pt'] as const).map(l => {
              const active = audio.readingLanguage === l;
              return (
                <TouchableOpacity
                  key={l}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    audio.setReadingLanguage(l);
                  }}
                  activeOpacity={0.75}
                  style={[
                    styles.dockedLangPill,
                    { borderColor: active ? colors.primary : 'transparent', backgroundColor: active ? colors.primary + '18' : 'transparent' },
                  ]}
                >
                  <Text style={[styles.dockedLangPillText, { color: active ? colors.primary : colors.mutedForeground }]}>
                    {l === 'en' ? 'EN' : 'PT'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <AudioPlayer
            items={verses.map(v => ({ id: String(v.v), text: audio.readingLanguage === 'pt' ? v.pt : v.en }))}
            queueKey={chapterQueueKey}
            title={audio.readingLanguage === 'pt' ? `${book?.name ?? ''} ${chapterNum}` : `${book?.englishName ?? ''} ${chapterNum}`}
          />
        </View>
      )}

      {/* ── Verse action popup ── */}
      {selectedVerse && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleVerseDeselect}
          accessibilityLabel={t(lang, 'close')}
        />
      )}
      {selectedVerse && (
        <Animated.View
          style={[
            styles.versePopup,
            {
              top:     selectedVerse.popupY,
              opacity: popupAnim,
              transform: [{ scale: popupScale }, { translateY: popupTranslateY }],
            },
          ]}
        >
          {ACTIONS.map(({ icon, key, labelKey }) => {
            const label = t(lang, labelKey);
            const isActive =
              (key === 'save' && selectedVerse && isBookmarked(currentBookId, chapterNum, selectedVerse.v)) ||
              (key === 'mark' && selectedVerse && marks.has(vKey(currentBookId, chapterNum, selectedVerse.v))) ||
              (key === 'note' && selectedVerse && !!notes[vKey(currentBookId, chapterNum, selectedVerse.v)]);
            return (
              <TouchableOpacity
                key={key}
                style={styles.versePopupBtn}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  if (!selectedVerse) return;
                  const { v } = selectedVerse;
                  switch (key) {
                    case 'explain':
                      handleVerseDeselect();
                      openExplain(v);
                      break;
                    case 'mark':
                      toggleMark(v);
                      handleVerseDeselect();
                      break;
                    case 'save': {
                      const vrs = verses.find(vr => vr.v === v);
                      if (vrs) handleBookmarkToggle(vrs);
                      handleVerseDeselect();
                      break;
                    }
                    case 'note':
                      handleVerseDeselect();
                      openNote(v);
                      break;
                    case 'practice': {
                      const vrs = verses.find(vr => vr.v === v);
                      handleVerseDeselect();
                      if (vrs) setPracticeVerse(vrs);
                      break;
                    }
                  }
                }}
                activeOpacity={0.7}
              >
                <Feather name={icon} size={17} color={isActive ? colors.accent : '#FFFFFF'} />
                <Text style={[styles.versePopupLabel, isActive && { color: colors.accent }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}

      {/* ── Pronunciation practice ── */}
      <PronunciationPractice
        visible={practiceVerse !== null}
        verseText={practiceVerse?.en ?? ''}
        verseRef={practiceVerse ? `${book?.englishName} ${chapterNum}:${practiceVerse.v}` : undefined}
        onClose={() => setPracticeVerse(null)}
      />

      {/* ── Note sheet ── */}
      {noteSheet !== null && (
        <Modal visible transparent animationType="slide" onRequestClose={closeNote}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <Pressable style={styles.modalBackdrop} onPress={closeNote}>
              <Pressable
                style={[styles.annotationSheet, { backgroundColor: colors.card, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 16 }]}
                onPress={e => e.stopPropagation()}
              >
                <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
                <View style={styles.annotationHeader}>
                  <View>
                    <Text style={[styles.annotationTitle, { color: colors.foreground }]}>{t(lang, 'action_note')}</Text>
                    <Text style={[styles.annotationRef, { color: colors.mutedForeground }]}>
                      {book?.englishName} {chapterNum}:{noteSheet.v}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={closeNote} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Feather name="x" size={20} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  value={noteSheet.text}
                  onChangeText={txt => setNoteSheet(s => s ? { ...s, text: txt } : s)}
                  placeholder={t(lang, 'note_placeholder')}
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  autoFocus
                  style={[styles.noteInput, {
                    color:           colors.foreground,
                    backgroundColor: colors.muted,
                    borderColor:     colors.border,
                  }]}
                  textAlignVertical="top"
                />

                <View style={styles.noteActionRow}>
                  {!!notes[vKey(currentBookId, chapterNum, noteSheet.v)] && (
                    <TouchableOpacity
                      onPress={() => deleteNote(noteSheet.v)}
                      style={[styles.noteDeleteBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
                    >
                      <Feather name="trash-2" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={saveNote}
                    disabled={!noteSheet.text.trim()}
                    style={[styles.noteSaveBtn, {
                      backgroundColor: noteSheet.text.trim() ? colors.primary : colors.muted,
                      borderRadius: colors.radius,
                      flex: 1,
                    }]}
                  >
                    <Text style={[styles.noteSaveText, {
                      color: noteSheet.text.trim() ? colors.primaryForeground : colors.mutedForeground,
                    }]}>
                      {t(lang, 'note_save_button')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>
      )}

      {/* ── Explain sheet ── */}
      {explainSheet !== null && (
        <Modal visible transparent animationType="slide" onRequestClose={closeExplain}>
          <Pressable style={styles.modalBackdrop} onPress={closeExplain}>
            <Pressable
              style={[styles.annotationSheet, { backgroundColor: colors.card, paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 16 }]}
              onPress={e => e.stopPropagation()}
            >
              <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
              <View style={styles.annotationHeader}>
                <View>
                  <Text style={[styles.annotationTitle, { color: colors.foreground }]}>{t(lang, 'explain_sheet_title')}</Text>
                  <Text style={[styles.annotationRef, { color: colors.mutedForeground }]}>
                    {book?.englishName} {chapterNum}:{explainSheet.v}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  {!explainSheet.loading && !explainSheet.error && !!explainSheet.text && (() => {
                    const explainKey = `explain:${currentBookId}:${chapterNum}:${explainSheet.v}:${explainSheet.lang}`;
                    const isActive = audio.queueKey === explainKey;
                    return (
                      <TouchableOpacity
                        onPress={() => {
                          if (Platform.OS !== 'web') Haptics.selectionAsync();
                          if (isActive) audio.togglePlayPause();
                          else audio.playQueue([{ id: 'explain', text: explainSheet.text }], 0, explainKey);
                        }}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      >
                        {isActive && audio.isLoading ? (
                          <ActivityIndicator size="small" color={colors.accent} />
                        ) : (
                          <Feather
                            name={isActive && audio.isPlaying ? 'pause-circle' : 'play-circle'}
                            size={22}
                            color={colors.accent}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })()}
                  <TouchableOpacity onPress={closeExplain} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Feather name="x" size={20} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>

              {explainSheet.loading ? (
                <View style={styles.explainCenter}>
                  <ActivityIndicator size="large" color={colors.accent} />
                  <Text style={[styles.explainCenterText, { color: colors.mutedForeground }]}>{t(lang, 'explain_generating')}</Text>
                </View>
              ) : explainSheet.error ? (
                <View style={styles.explainCenter}>
                  <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
                  <Text style={[styles.explainCenterText, { color: colors.mutedForeground }]}>{explainSheet.error}</Text>
                </View>
              ) : (
                <ScrollView style={styles.explainBody} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.explainText, { color: colors.foreground }]}>{explainSheet.text}</Text>
                </ScrollView>
              )}
            </Pressable>
          </Pressable>
        </Modal>
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
    paddingLeft: 16,
    paddingRight: 14,
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

  // Floating verse action popup
  dockedPlayerWrap: {
    position: 'absolute',
    left: 24, right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  dockedLangRow: {
    flexDirection:   'row',
    alignSelf:       'flex-end',
    borderWidth:     StyleSheet.hairlineWidth,
    borderRadius:    999,
    padding:         2,
    gap:             2,
    marginBottom:    6,
  },
  dockedLangPill: {
    borderWidth:       1,
    borderRadius:      999,
    paddingVertical:   4,
    paddingHorizontal: 10,
  },
  dockedLangPillText: {
    fontSize:   11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },

  versePopup: {
    position: 'absolute',
    left: 16, right: 16,
    flexDirection: 'row',
    backgroundColor: '#1A1A1C',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 10,
  },
  versePopupBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 2,
  },
  versePopupLabel: {
    fontSize: 11, fontFamily: 'Inter_500Medium', color: '#FFFFFF',
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

  // Note + Explain shared sheet
  annotationSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 10,
  },
  annotationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  annotationTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  annotationRef:   { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },

  // Note sheet
  noteInput: {
    marginHorizontal: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    maxHeight: 200,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  noteActionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  noteDeleteBtn: {
    width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  noteSaveBtn: {
    height: 48,
    alignItems: 'center', justifyContent: 'center',
  },
  noteSaveText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },

  // Explain sheet
  explainCenter: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 52, paddingHorizontal: 24, gap: 12,
  },
  explainCenterText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  explainBody: { paddingHorizontal: 20, paddingBottom: 8 },
  explainText: { fontSize: 16, fontFamily: 'Lora_400Regular', lineHeight: 28 },
});

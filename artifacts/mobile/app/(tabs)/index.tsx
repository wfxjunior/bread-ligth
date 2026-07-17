import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import SpaceBackground from '@/components/SpaceBackground';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useAudio } from '@/context/AudioContext';
import { useLanguage } from '@/context/LanguageContext';
import type { I18nKey } from '@/constants/i18n';
import { useBible } from '@/context/BibleContext';
import { BIBLE_DATA } from '@/constants/bibleData';
import { getEntryForDate, resolveVerse, todayKey } from '@/utils/dailyVerse';
import AudioPlayer from '@/components/AudioPlayer';
import WordModal from '@/components/WordModal';
import { BookshelfLibrary, CATEGORY_INFO, type BookCategory } from '@/components/BookshelfLibrary';
import ProgressModal, { type ProgressStat } from '@/components/ProgressModal';
import { useAchievements } from '@/context/AchievementContext';
import { nextMilestone } from '@/constants/achievements';
import { FEATURED_PASSAGES, type FeaturedPassage } from '@/constants/featuredPassages';

const PAD    = 16;
const GAP    = 10;

const VIEW_MODE_KEY = '@bibliaeN:libraryViewMode';

// Calm, time-of-day greeting — no exclamation marks, no mixed languages.
// The weekday/month keys map to full localized names (t() looks them up).
const WEEKDAY_KEYS: I18nKey[] = [
  'weekday_full_sun', 'weekday_full_mon', 'weekday_full_tue', 'weekday_full_wed',
  'weekday_full_thu', 'weekday_full_fri', 'weekday_full_sat',
];
const MONTH_KEYS: I18nKey[] = [
  'month_full_jan', 'month_full_feb', 'month_full_mar', 'month_full_apr',
  'month_full_may', 'month_full_jun', 'month_full_jul', 'month_full_aug',
  'month_full_sep', 'month_full_oct', 'month_full_nov', 'month_full_dec',
];

function getGreetingKey(): I18nKey {
  const h = new Date().getHours();
  if (h < 12) return 'greeting_morning';
  if (h < 18) return 'greeting_afternoon';
  return 'greeting_evening';
}

type VerseSize = 'S' | 'M' | 'L';
const VERSE_SIZE_KEY = '@bibliaeN:dailyVerseSize';
const VERSE_HEART_KEY = '@bibliaeN:verseHeart'; // suffix :today.toDateString() appended at runtime
const SIZES: VerseSize[] = ['S', 'M', 'L'];
const SIZE_FONT: Record<VerseSize, number> = { S: 14, M: 17, L: 21 };
const SIZE_LINE: Record<VerseSize, number> = { S: 22, M: 27, L: 33 };
const SIZE_LABEL: Record<VerseSize, number> = { S: 10, M: 13, L: 16 };

// ── Daily verse card ──────────────────────────────────────────────────────────
function DailyPill() {
  const colors = useColors();
  const audio  = useAudio();
  const { t: tl } = useLanguage();

  const [today,    setToday]    = useState(() => new Date());
  const [expanded, setExpanded] = useState(false);
  const [size,     setSize]     = useState<VerseSize>('M');

  useEffect(() => {
    AsyncStorage.getItem(VERSE_SIZE_KEY)
      .then(v => { if (v === 'S' || v === 'M' || v === 'L') setSize(v); })
      .catch(() => {});
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') {
        setToday(new Date());
        setExpanded(false);
      }
    });
    return () => sub.remove();
  }, []);

  const pickSize = (s: VerseSize) => {
    setSize(s);
    AsyncStorage.setItem(VERSE_SIZE_KEY, s).catch(() => {});
  };

  const toggle = () => {
    if (Platform.OS !== 'web') LayoutAnimation.configureNext(
      LayoutAnimation.create(160, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );
    setExpanded(e => !e);
  };

  // ── Heart like — one per person, persisted per day's verse ─────────────────
  const likeScale = useRef(new Animated.Value(1)).current;
  const [liked, setLiked] = useState(false);
  const heartKey = `${VERSE_HEART_KEY}:${today.toDateString()}`;

  useEffect(() => {
    AsyncStorage.getItem(heartKey).then(v => { if (v === '1') setLiked(true); }).catch(() => {});
  }, [heartKey]);

  const handleLike = () => {
    if (liked) return;                            // already liked — lock it
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked(true);
    AsyncStorage.setItem(heartKey, '1').catch(() => {});
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.5,  useNativeDriver: true, tension: 400, friction: 4 }),
      Animated.spring(likeScale, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();
  };
  // ───────────────────────────────────────────────────────────────────────────

  const entry = getEntryForDate(today);
  const verse = resolveVerse(entry);
  if (!verse) return null;

  const preview = verse.en.length > 100 ? verse.en.slice(0, 100).trimEnd() + '…' : verse.en;
  const fSize   = SIZE_FONT[size];
  const lHeight = SIZE_LINE[size];

  // Audio must follow the user's chosen reading language (Settings › Áudio),
  // same as every other player in the app — this pill used to always play
  // English regardless of that setting, which read as "the audio is stuck
  // in English" even when the user had picked Portuguese.
  const verseAudioText = audio.readingLanguage === 'pt' ? verse.pt : verse.en;
  const dailyQueueKey  = `daily-verse:${todayKey()}:${audio.readingLanguage}`;
  const isAudioActive  = audio.queueKey === dailyQueueKey;
  const isAudioPlaying = isAudioActive && audio.isPlaying;

  const handlePlayToggle = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    if (isAudioActive) audio.togglePlayPause();
    else audio.playQueue([{ id: 'verse', text: verseAudioText, cacheLabel: `${entry.bookEn} ${entry.chapter}:${entry.verse}` }], 0, dailyQueueKey);
  };

  return (
    <View style={[styles.pill, {
      backgroundColor: colors.card,
      borderColor:     colors.border,
      borderRadius:    colors.radius,
    }]}>
      {/* Left accent bar */}
      <View style={[styles.pillAccent, { backgroundColor: colors.accent }]} />

      <View style={styles.pillBody}>
        {/* ── Top row: badge + ref ── */}
        <View style={styles.pillTopRow}>
          <View style={styles.pillBadge}>
            <Feather name="sun" size={11} color={colors.accent} />
            <Text style={[styles.pillBadgeText, { color: colors.accent }]}>{tl('home_daily_verse_badge')}</Text>
          </View>
          <Text style={[styles.pillRef, { color: colors.mutedForeground }]}>
            {entry.bookEn} {entry.chapter}:{entry.verse}
          </Text>
        </View>

        {/* ── Verse text (tap to expand) ── */}
        <TouchableOpacity activeOpacity={0.85} onPress={toggle}>
          <Text style={[
            styles.pillVerse,
            { color: isAudioPlaying ? colors.accent : colors.foreground, fontSize: fSize, lineHeight: lHeight },
          ]}>
            "{expanded ? verse.en : preview}"
          </Text>
          {expanded && (
            <Text style={[styles.pillPtFull, { color: colors.mutedForeground, fontSize: fSize - 2, lineHeight: lHeight - 3 }]}>
              {verse.pt}
            </Text>
          )}
        </TouchableOpacity>

        {/* Inline player — appears while this verse's audio is the active source */}
        {isAudioActive && (
          <View style={styles.pillPlayerRow}>
            <View style={styles.pillLangRow}>
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
                      styles.pillLangPill,
                      { borderColor: active ? colors.accent : colors.border, backgroundColor: active ? colors.accent + '18' : 'transparent' },
                    ]}
                  >
                    <Text style={[styles.pillLangPillText, { color: active ? colors.accent : colors.mutedForeground }]}>
                      {l === 'en' ? 'EN' : 'PT'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <AudioPlayer items={[{ id: 'verse', text: verseAudioText }]} queueKey={dailyQueueKey} compact />
          </View>
        )}

        {/* ── Footer: heart | play | spacer | size buttons | chevron | Abrir ── */}
        <View style={styles.pillFooter}>
          {/* Heart — bottom left, one like per verse per day */}
          <TouchableOpacity
            onPress={handleLike}
            activeOpacity={liked ? 1 : 0.72}
            style={styles.pillHeartBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Animated.View style={{ transform: [{ scale: likeScale }] }}>
              <MaterialCommunityIcons
                name={liked ? 'heart' : 'heart-outline'}
                size={19}
                color={liked ? '#E8294B' : colors.mutedForeground}
              />
            </Animated.View>
            <Text style={[styles.pillHeartCount, { color: liked ? '#E8294B' : colors.mutedForeground }]}>
              {'125k'}
            </Text>
          </TouchableOpacity>

          {/* Subtle listen button — launches the shared player experience */}
          <TouchableOpacity
            onPress={handlePlayToggle}
            accessibilityRole="button"
            accessibilityLabel={tl('a11y_play_pause')}
            activeOpacity={0.72}
            style={styles.pillPlayBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name={isAudioPlaying ? 'pause-circle' : 'play-circle'}
              size={19}
              color={isAudioActive ? colors.accent : colors.mutedForeground}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />
          {/* Font-size selector */}
          <View style={[styles.pillSizeRow, { borderColor: colors.border, borderRadius: colors.radius }]}>
            {SIZES.map((s, i) => (
              <TouchableOpacity
                key={s}
                onPress={() => pickSize(s)}
                style={[
                  styles.pillSizeBtn,
                  i < 2 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: colors.border },
                  size === s && { backgroundColor: colors.accent + '22' },
                ]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={[styles.pillSizeTxt, {
                  fontSize:    SIZE_LABEL[s],
                  color:       size === s ? colors.accent : colors.mutedForeground,
                  fontFamily:  size === s ? 'Inter_700Bold' : 'Inter_400Regular',
                }]}>
                  A
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Expand toggle */}
          <TouchableOpacity onPress={toggle} accessibilityRole="button" accessibilityLabel={tl('a11y_expand')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          {/* Abrir → */}
          <TouchableOpacity
            style={styles.pillOpenBtn}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              router.push('/daily');
            }}
          >
            <Text style={[styles.pillOpenText, { color: colors.accent }]}>{tl('open_action')}</Text>
            <Feather name="arrow-right" size={12} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Book catalogue ────────────────────────────────────────────────────────────
// Category drives leather colour on the bookshelf (see BookshelfLibrary) —
// every book keeps a canonical Bible-wide roman numeral and a testament tag
// used only by the compact list view.
type BookMeta = {
  bookId: string;
  category: BookCategory;
  roman: string;
  testament: 'old' | 'new';
};

// All 66 canonical books, in canonical order, roman numerals counting each
// book's position within its own testament (Old: I–XXXIX, New: I–XXVII).
// Only 8 have their full text transcribed today (see constants/bibleData.ts)
// — the rest render with a "coming soon" placeholder chapter so the shelf
// can be previewed and built out at full scale ahead of the content work.
const BOOK_CATALOGUE: BookMeta[] = [
  // ── Old Testament ──
  { bookId: 'genesis',        category: 'pentateuch',   roman: 'I',      testament: 'old' },
  { bookId: 'exodus',         category: 'pentateuch',   roman: 'II',     testament: 'old' },
  { bookId: 'leviticus',      category: 'pentateuch',   roman: 'III',    testament: 'old' },
  { bookId: 'numbers',        category: 'pentateuch',   roman: 'IV',     testament: 'old' },
  { bookId: 'deuteronomy',    category: 'pentateuch',   roman: 'V',      testament: 'old' },
  { bookId: 'joshua',         category: 'history',      roman: 'VI',     testament: 'old' },
  { bookId: 'judges',         category: 'history',      roman: 'VII',    testament: 'old' },
  { bookId: 'ruth',           category: 'history',      roman: 'VIII',   testament: 'old' },
  { bookId: '1samuel',        category: 'history',      roman: 'IX',     testament: 'old' },
  { bookId: '2samuel',        category: 'history',      roman: 'X',      testament: 'old' },
  { bookId: '1kings',         category: 'history',      roman: 'XI',     testament: 'old' },
  { bookId: '2kings',         category: 'history',      roman: 'XII',    testament: 'old' },
  { bookId: '1chronicles',    category: 'history',      roman: 'XIII',   testament: 'old' },
  { bookId: '2chronicles',    category: 'history',      roman: 'XIV',    testament: 'old' },
  { bookId: 'ezra',           category: 'history',      roman: 'XV',     testament: 'old' },
  { bookId: 'nehemiah',       category: 'history',      roman: 'XVI',    testament: 'old' },
  { bookId: 'esther',         category: 'history',      roman: 'XVII',   testament: 'old' },
  { bookId: 'job',            category: 'poetry',       roman: 'XVIII',  testament: 'old' },
  { bookId: 'psalms',         category: 'poetry',       roman: 'XIX',    testament: 'old' },
  { bookId: 'proverbs',       category: 'poetry',       roman: 'XX',     testament: 'old' },
  { bookId: 'ecclesiastes',   category: 'poetry',       roman: 'XXI',    testament: 'old' },
  { bookId: 'songofsolomon',  category: 'poetry',       roman: 'XXII',   testament: 'old' },
  { bookId: 'isaiah',         category: 'majorProphets', roman: 'XXIII', testament: 'old' },
  { bookId: 'jeremiah',       category: 'majorProphets', roman: 'XXIV',  testament: 'old' },
  { bookId: 'lamentations',   category: 'majorProphets', roman: 'XXV',   testament: 'old' },
  { bookId: 'ezekiel',        category: 'majorProphets', roman: 'XXVI',  testament: 'old' },
  { bookId: 'daniel',         category: 'majorProphets', roman: 'XXVII', testament: 'old' },
  { bookId: 'hosea',          category: 'minorProphets', roman: 'XXVIII', testament: 'old' },
  { bookId: 'joel',           category: 'minorProphets', roman: 'XXIX',  testament: 'old' },
  { bookId: 'amos',           category: 'minorProphets', roman: 'XXX',   testament: 'old' },
  { bookId: 'obadiah',        category: 'minorProphets', roman: 'XXXI',  testament: 'old' },
  { bookId: 'jonah',          category: 'minorProphets', roman: 'XXXII', testament: 'old' },
  { bookId: 'micah',          category: 'minorProphets', roman: 'XXXIII', testament: 'old' },
  { bookId: 'nahum',          category: 'minorProphets', roman: 'XXXIV', testament: 'old' },
  { bookId: 'habakkuk',       category: 'minorProphets', roman: 'XXXV',  testament: 'old' },
  { bookId: 'zephaniah',      category: 'minorProphets', roman: 'XXXVI', testament: 'old' },
  { bookId: 'haggai',         category: 'minorProphets', roman: 'XXXVII', testament: 'old' },
  { bookId: 'zechariah',      category: 'minorProphets', roman: 'XXXVIII', testament: 'old' },
  { bookId: 'malachi',        category: 'minorProphets', roman: 'XXXIX', testament: 'old' },

  // ── New Testament ──
  { bookId: 'matthew',        category: 'gospels',        roman: 'I',    testament: 'new' },
  { bookId: 'mark',           category: 'gospels',        roman: 'II',   testament: 'new' },
  { bookId: 'luke',           category: 'gospels',        roman: 'III',  testament: 'new' },
  { bookId: 'john',           category: 'gospels',        roman: 'IV',   testament: 'new' },
  { bookId: 'acts',           category: 'acts',           roman: 'V',    testament: 'new' },
  { bookId: 'romans',         category: 'paulineLetters', roman: 'VI',   testament: 'new' },
  { bookId: '1corinthians',   category: 'paulineLetters', roman: 'VII',  testament: 'new' },
  { bookId: '2corinthians',   category: 'paulineLetters', roman: 'VIII', testament: 'new' },
  { bookId: 'galatians',      category: 'paulineLetters', roman: 'IX',   testament: 'new' },
  { bookId: 'ephesians',      category: 'paulineLetters', roman: 'X',    testament: 'new' },
  { bookId: 'philippians',    category: 'paulineLetters', roman: 'XI',   testament: 'new' },
  { bookId: 'colossians',     category: 'paulineLetters', roman: 'XII',  testament: 'new' },
  { bookId: '1thessalonians', category: 'paulineLetters', roman: 'XIII', testament: 'new' },
  { bookId: '2thessalonians', category: 'paulineLetters', roman: 'XIV',  testament: 'new' },
  { bookId: '1timothy',       category: 'paulineLetters', roman: 'XV',   testament: 'new' },
  { bookId: '2timothy',       category: 'paulineLetters', roman: 'XVI',  testament: 'new' },
  { bookId: 'titus',          category: 'paulineLetters', roman: 'XVII', testament: 'new' },
  { bookId: 'philemon',       category: 'paulineLetters', roman: 'XVIII', testament: 'new' },
  { bookId: 'hebrews',        category: 'generalLetters', roman: 'XIX',  testament: 'new' },
  { bookId: 'james',          category: 'generalLetters', roman: 'XX',   testament: 'new' },
  { bookId: '1peter',         category: 'generalLetters', roman: 'XXI',  testament: 'new' },
  { bookId: '2peter',         category: 'generalLetters', roman: 'XXII', testament: 'new' },
  { bookId: '1john',          category: 'generalLetters', roman: 'XXIII', testament: 'new' },
  { bookId: '2john',          category: 'generalLetters', roman: 'XXIV', testament: 'new' },
  { bookId: '3john',          category: 'generalLetters', roman: 'XXV',  testament: 'new' },
  { bookId: 'jude',           category: 'generalLetters', roman: 'XXVI', testament: 'new' },
  { bookId: 'revelation',     category: 'revelation',     roman: 'XXVII', testament: 'new' },
];

// ── Study / Learning centre constants ─────────────────────────────────────────
// Accent for these touches now comes from the active Reading Space (colors.space.accent)
// rather than a fixed gold, so the Study/vocabulary section follows the chosen atmosphere.

const STUDY_STEPS = [
  { id: 'read',    icon: 'book-open',  labelKey: 'study_step_read'    as const },
  { id: 'listen',  icon: 'headphones', labelKey: 'study_step_listen'  as const },
  { id: 'learn',   icon: 'edit-3',     labelKey: 'study_step_learn'   as const },
  { id: 'reflect', icon: 'compass',    labelKey: 'study_step_reflect' as const },
];

// Template for the four progress stats — real values are injected at render
// time from live data (vocabulary, bookmarks, streak), so nothing here is a
// mock. `value` is a placeholder that HomeScreen always overwrites.
const PROGRESS_STATS_TEMPLATE: ProgressStat[] = [
  { icon: 'type',      value: '0', labelEn: 'Words\nlearned',  labelPt: 'Palavras\naprendidas', descEn: 'Words saved to your personal vocabulary.',        descPt: 'Palavras salvas no seu vocabulário pessoal.' },
  { icon: 'bookmark',  value: '0', labelEn: 'Verses\nsaved',   labelPt: 'Versículos\nsalvos',   descEn: 'Verses you have bookmarked to revisit.',         descPt: 'Versículos que você marcou para revisitar.'  },
  { icon: 'calendar',  value: '0', labelEn: 'Days\nstudied',   labelPt: 'Dias\nestudados',      descEn: 'Total days you have opened the Word.',            descPt: 'Total de dias em que você abriu a Palavra.'  },
  { icon: 'zap',       value: '0', labelEn: 'Day\nstreak',     labelPt: 'Dias\nseguidos',        descEn: 'Consecutive days of steady study.',               descPt: 'Dias seguidos de estudo constante.'          },
];

const VOCAB_PREVIEW = [
  { word: 'Word',  def: 'Verbo, Palavra' },
  { word: 'Light', def: 'Luz'            },
  { word: 'Grace', def: 'Graça'          },
];

// ── Book list row ─────────────────────────────────────────────────────────────
function BookListRow({
  meta, isLast, isFavorite, onToggleFavorite,
}: {
  meta: BookMeta;
  isLast?: boolean;
  isFavorite: boolean;
  onToggleFavorite: (bookId: string) => void;
}) {
  const colors = useColors();
  const { t: tl } = useLanguage();
  const book   = BIBLE_DATA[meta.bookId];
  if (!book) return null;

  const chapterKey  = Object.keys(book.chapters)[0];
  const chapterCount = Object.keys(book.chapters).length;

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

  const leather = CATEGORY_INFO[meta.category];

  const handleToggleFavorite = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFavorite(meta.bookId);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.82}
      style={[styles.listRow, !isLast && { borderBottomColor: colors.border }]}
    >
      {/* Leather colour swatch — matches the book's shelf tone */}
      <LinearGradient
        colors={[leather.base, leather.deep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={[styles.listSwatch, { borderRadius: colors.radius - 2 }]}
      >
        <Text style={styles.listSwatchRoman}>{meta.roman}</Text>
      </LinearGradient>

      {/* Info */}
      <View style={styles.listInfo}>
        <Text style={[styles.listNameEn, { color: colors.foreground }]} numberOfLines={1}>
          {book.englishName}
        </Text>
        <Text style={[styles.listNamePt, { color: colors.mutedForeground }]} numberOfLines={1}>
          {book.name}
        </Text>
        <View style={[styles.listTag, { backgroundColor: colors.primary + '14' }]}>
          <Text style={[styles.listTagText, { color: colors.primary }]}>
            {tl(meta.testament === 'old' ? 'testament_old' : 'testament_new')}
          </Text>
        </View>
      </View>

      {/* Right: chapter count, favorite star, chevron */}
      <View style={styles.listRight}>
        <Text style={[styles.listChapters, { color: colors.mutedForeground }]}>
          {chapterCount} {tl('chapter_abbr_lower')}
        </Text>
        <TouchableOpacity
          onPress={handleToggleFavorite}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={tl(isFavorite ? 'library_favorite_remove_a11y' : 'library_favorite_add_a11y')}
        >
          <Feather name="star" size={14} color={isFavorite ? colors.accent : colors.mutedForeground} style={isFavorite ? undefined : { opacity: 0.5 }} />
        </TouchableOpacity>
        <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

// ── Today's Study — accordion card (Read / Listen / Learn / Reflect) ─────────
// Steps expand inline (below the shelf, inside the card itself) instead of
// opening a modal — keeps the Home screen uncluttered while still being real,
// working functionality: real chapter text, a real audio player, real word
// look-ups (shared vocabulary system), and a saved personal reflection.
const REFLECTION_KEY = '@bibliaeN:reflection:john:1';
const STUDY_QUEUE_KEY = 'study:john:1';

function StudyCard() {
  const colors = useColors();
  const audio  = useAudio();
  const { t }  = useLanguage();

  const [expandedStep, setExpandedStep]     = useState<string | null>(null);
  const [wordModal, setWordModal]           = useState<{ word: string; context: string } | null>(null);
  const [reflection, setReflection]         = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(REFLECTION_KEY).then(v => { if (v) setReflection(v); }).catch(() => {});
  }, []);

  const johnChapter1 = BIBLE_DATA['john']?.chapters?.[1] ?? [];
  const previewVerses = johnChapter1.slice(0, 3);
  const isPt = audio.readingLanguage === 'pt';

  const toggleStep = (id: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedStep(prev => (prev === id ? null : id));
  };

  const saveReflection = () => {
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    AsyncStorage.setItem(REFLECTION_KEY, reflection).catch(() => {});
    setReflectionSaved(true);
    setTimeout(() => setReflectionSaved(false), 2000);
  };

  return (
    <View style={[styles.studyCard, {
      backgroundColor: colors.card,
      borderColor:     colors.border,
      borderRadius:    colors.radius + 2,
    }]}>
      {/* Reading-space top rule */}
      <View style={[styles.studyTopRule, { backgroundColor: colors.space.accent }]} />

      <View style={styles.studyCardInner}>

        {/* Reference + time */}
        <View style={styles.studyMeta}>
          <Text style={[styles.studyMetaRef, { color: colors.primary }]}>{isPt ? 'João 1' : 'John 1'}</Text>
          <View style={[styles.studyMetaDot, { backgroundColor: colors.border }]} />
          <Feather name="clock" size={11} color={colors.mutedForeground} />
          <Text style={[styles.studyMetaTime, { color: colors.mutedForeground }]}>15 min</Text>
        </View>

        {/* Chapter title */}
        <Text style={[styles.studyTitle, { color: colors.foreground }]}>
          {t('study_chapter_title')}
        </Text>

        {/* Hairline divider */}
        <View style={[styles.studyDivider, { backgroundColor: colors.border }]} />

        {/* Four steps — each expands inline when tapped */}
        <View style={styles.studySteps}>
          {STUDY_STEPS.map((step, idx) => {
            const isCurrent  = idx === 0;
            const isExpanded = expandedStep === step.id;
            const highlight  = isCurrent || isExpanded;
            return (
              <View key={step.id}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleStep(step.id)}
                  style={styles.studyStepRow}
                >
                  {/* Step connector dot (left gutter) */}
                  <View style={styles.studyStepGutter}>
                    <View style={[styles.studyStepDot,
                      { backgroundColor: highlight ? colors.primary : colors.border }]} />
                    {(idx < STUDY_STEPS.length - 1 || isExpanded) && (
                      <View style={[styles.studyStepLine, { backgroundColor: colors.border }]} />
                    )}
                  </View>

                  {/* Icon + label */}
                  <View style={[styles.studyStepIconWrap, {
                    borderColor:     highlight ? colors.primary + '38' : colors.border,
                    backgroundColor: highlight ? colors.primary + '0C' : 'transparent',
                  }]}>
                    <Feather
                      name={step.icon as any}
                      size={13}
                      color={highlight ? colors.primary : colors.mutedForeground}
                    />
                  </View>

                  <Text style={[styles.studyStepLabel, {
                    color:      highlight ? colors.foreground : colors.mutedForeground,
                    fontFamily: highlight ? 'Inter_600SemiBold' : 'Inter_400Regular',
                  }]}>
                    {t(step.labelKey)}
                  </Text>

                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={15}
                    color={colors.mutedForeground}
                    style={{ marginTop: 10 }}
                  />
                </TouchableOpacity>

                {/* ── Expanded activity content ── */}
                {isExpanded && (
                  <View style={styles.studyStepContent}>

                    {step.id === 'read' && (
                      <>
                        {previewVerses.map(v => (
                          <View key={v.v} style={styles.studyReadVerse}>
                            <Text style={[styles.studyReadEn, { color: colors.foreground }]}>
                              <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>{v.v} </Text>
                              {v.en}
                            </Text>
                            <Text style={[styles.studyReadPt, { color: colors.mutedForeground }]}>{v.pt}</Text>
                          </View>
                        ))}
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => {
                            if (Platform.OS !== 'web') Haptics.selectionAsync();
                            router.push({ pathname: '/chapter', params: { bookId: 'john', chapter: '1', bookName: 'João', englishBookName: 'John' } });
                          }}
                          style={[styles.studyInlineBtn, { borderColor: colors.primary }]}
                        >
                          <Text style={[styles.studyInlineBtnText, { color: colors.primary }]}>{t('study_continue_reading')}</Text>
                          <Feather name="arrow-right" size={13} color={colors.primary} />
                        </TouchableOpacity>
                      </>
                    )}

                    {step.id === 'listen' && johnChapter1.length > 0 && (
                      <View style={{ gap: 8 }}>
                        <View style={styles.pillLangRow}>
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
                                  styles.pillLangPill,
                                  { borderColor: active ? colors.accent : colors.border, backgroundColor: active ? colors.accent + '18' : 'transparent' },
                                ]}
                              >
                                <Text style={[styles.pillLangPillText, { color: active ? colors.accent : colors.mutedForeground }]}>
                                  {l === 'en' ? 'EN' : 'PT'}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                        <AudioPlayer
                          compact
                          items={johnChapter1.map(v => ({ id: String(v.v), text: isPt ? v.pt : v.en }))}
                          queueKey={`${STUDY_QUEUE_KEY}:${audio.readingLanguage}`}
                          title={isPt ? 'João 1' : 'John 1'}
                        />
                      </View>
                    )}

                    {step.id === 'learn' && (
                      <View style={styles.studyLearnRow}>
                        {VOCAB_PREVIEW.map(item => (
                          <TouchableOpacity
                            key={item.word}
                            activeOpacity={0.8}
                            onPress={() => {
                              if (Platform.OS !== 'web') Haptics.selectionAsync();
                              setWordModal({ word: item.word.toLowerCase(), context: previewVerses[0]?.en ?? item.word });
                            }}
                            style={[styles.studyLearnChip, { borderColor: colors.border, backgroundColor: colors.background }]}
                          >
                            <Text style={[styles.studyLearnChipWord, { color: colors.foreground }]}>{item.word}</Text>
                            <Text style={[styles.studyLearnChipDef, { color: colors.mutedForeground }]}>{item.def}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {step.id === 'reflect' && (
                      <View>
                        <Text style={[styles.studyReflectPrompt, { color: colors.foreground }]}>
                          {t('study_reflect_prompt')}
                        </Text>
                        <TextInput
                          value={reflection}
                          onChangeText={setReflection}
                          placeholder={t('study_reflect_placeholder')}
                          placeholderTextColor={colors.mutedForeground}
                          multiline
                          style={[styles.studyReflectInput, {
                            color:       colors.foreground,
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                          }]}
                        />
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={saveReflection}
                          style={[styles.studyInlineBtn, { borderColor: colors.primary, alignSelf: 'flex-start' }]}
                        >
                          <Feather name={reflectionSaved ? 'check' : 'save'} size={13} color={colors.primary} />
                          <Text style={[styles.studyInlineBtnText, { color: colors.primary }]}>
                            {reflectionSaved ? t('study_reflect_saved') : t('study_reflect_save')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            router.push('/daily');
          }}
          style={[styles.studyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        >
          <Text style={[styles.studyBtnText, { color: colors.primaryForeground }]}>
            {t('study_start_today')}
          </Text>
        </TouchableOpacity>

      </View>

      <WordModal
        visible={!!wordModal}
        word={wordModal?.word ?? ''}
        context={wordModal?.context ?? ''}
        onClose={() => setWordModal(null)}
      />
    </View>
  );
}

// ── Featured Passages carousel ──────────────────────────────────────────────
// Horizontally snap-scrolling highlight cards, styled with the same
// card/border/leather-adjacent language as the rest of Home (colors.card,
// colors.border, colors.secondaryAccent) rather than web's own look. Each
// card opens a real chapter via /chapter — no mock destinations.
const FEATURED_CARD_WIDTH = 240;
const FEATURED_CARD_GAP = 12;

function FeaturedPassageCard({ passage }: { passage: FeaturedPassage }) {
  const colors = useColors();
  const { t, lang } = useLanguage();
  const tints = [colors.primary, colors.accent, colors.secondaryAccent];
  const tint = tints[passage.accentIndex % tints.length];

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/chapter',
      params: {
        bookId: passage.bookId,
        chapter: String(passage.chapter),
        bookName: passage.bookName,
        englishBookName: passage.englishBookName,
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={[
        styles.featuredCard,
        { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, width: FEATURED_CARD_WIDTH },
      ]}
    >
      <View style={[styles.featuredBadge, { backgroundColor: tint + '18' }]}>
        <Text style={[styles.featuredBadgeText, { color: tint }]}>{t(passage.badgeKey)}</Text>
      </View>
      <Text style={[styles.featuredRef, { color: colors.foreground }]}>{passage.refLabel}</Text>
      <Text style={[styles.featuredSnippet, { color: colors.mutedForeground }]} numberOfLines={3}>
        {lang === 'pt' ? passage.snippetPt : passage.snippetEn}
      </Text>
      <View style={styles.featuredFooter}>
        <Text style={[styles.featuredOpen, { color: tint }]}>{t('open_action')}</Text>
        <Feather name="arrow-right" size={12} color={tint} />
      </View>
    </TouchableOpacity>
  );
}

function FeaturedPassagesCarousel() {
  const colors = useColors();
  const { t } = useLanguage();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{t('featured_section_title')}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={FEATURED_CARD_WIDTH + FEATURED_CARD_GAP}
        snapToAlignment="start"
        contentContainerStyle={styles.featuredRow}
      >
        {FEATURED_PASSAGES.map(p => <FeaturedPassageCard key={p.id} passage={p} />)}
      </ScrollView>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
// Accent-insensitive match so "genesis" finds "Gênesis" and "corintios"
// finds "Coríntios" — readers typing on a phone keyboard rarely bother with
// diacritics.
function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export default function HomeScreen() {
  const colors    = useColors();
  const insets    = useSafeAreaInsets();
  const { readingProgress, favoriteBooks, toggleFavoriteBook, vocabulary, bookmarks, studyStats } = useBible();

  // Real progress stats, injected into the display template (no mock values).
  const progressStats = React.useMemo<ProgressStat[]>(() => {
    const values = [
      String(vocabulary.length),
      String(bookmarks.length),
      String(studyStats.daysStudied),
      String(studyStats.streak),
    ];
    return PROGRESS_STATS_TEMPLATE.map((s, i) => ({ ...s, value: values[i] }));
  }, [vocabulary.length, bookmarks.length, studyStats.daysStudied, studyStats.streak]);

  // Subtle Journey teaser — ONE next milestone; Scripture stays primary.
  const { state: honorState } = useAchievements();
  const nextHonor = React.useMemo(() => nextMilestone(honorState), [honorState]);
  const { width } = useWindowDimensions();
  const cardW     = Math.floor((width - PAD * 2 - GAP) / 2);

  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  const { t, lang } = useLanguage();

  const [userName,  setUserName]  = useState('');
  const [viewMode,  setViewMode]  = useState<'grid' | 'list'>('grid');
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryTestamentFilter, setLibraryTestamentFilter] = useState<'all' | 'old' | 'new'>('all');
  const [libraryAlphabetical, setLibraryAlphabetical] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('@bibliaeN:userName').then(n => setUserName(n ?? '')).catch(() => setUserName(''));
    AsyncStorage.getItem(VIEW_MODE_KEY).then(v => { if (v === 'list' || v === 'grid') setViewMode(v); }).catch(() => {});
    // Refresh the greeting/date whenever the app is brought back to the
    // foreground, so a morning greeting doesn't linger into the evening.
    const sub = AppState.addEventListener('change', s => { if (s === 'active') setNow(new Date()); });
    return () => sub.remove();
  }, []);

  const toggleView = (mode: 'grid' | 'list') => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setViewMode(mode);
    AsyncStorage.setItem(VIEW_MODE_KEY, mode).catch(() => {});
  };

  // Library search — matches either the English or Portuguese book name,
  // accent-insensitive, so the 66-book shelf is never more than a few
  // keystrokes away from the one book someone actually wants.
  const librarySearchNorm = normalizeSearch(librarySearch);
  let filteredCatalogue = librarySearchNorm.length === 0
    ? BOOK_CATALOGUE
    : BOOK_CATALOGUE.filter(meta => {
        const book = BIBLE_DATA[meta.bookId];
        if (!book) return false;
        return normalizeSearch(book.name).includes(librarySearchNorm)
          || normalizeSearch(book.englishName).includes(librarySearchNorm);
      });

  // Testament filter — narrows to just the Old or New Testament.
  if (libraryTestamentFilter !== 'all') {
    filteredCatalogue = filteredCatalogue.filter(meta => meta.testament === libraryTestamentFilter);
  }

  // Alphabetical sort — by whichever name is on screen in the current
  // language, instead of canonical Bible order.
  if (libraryAlphabetical) {
    filteredCatalogue = [...filteredCatalogue].sort((a, b) => {
      const bookA = BIBLE_DATA[a.bookId];
      const bookB = BIBLE_DATA[b.bookId];
      const nameA = lang === 'pt' ? bookA?.name : bookA?.englishName;
      const nameB = lang === 'pt' ? bookB?.name : bookB?.englishName;
      return normalizeSearch(nameA ?? '').localeCompare(normalizeSearch(nameB ?? ''));
    });
  }

  // Favorited books, in canonical order — surfaced as a quick-access strip
  // above the shelf (only while not searching) so a handful of go-to books
  // never get lost among the other 66.
  const favoriteCatalogue = BOOK_CATALOGUE.filter(meta => favoriteBooks.includes(meta.bookId));

  const handleOpenBook = (bookId: string) => {
    const book = BIBLE_DATA[bookId];
    if (!book) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/chapter',
      params: {
        bookId,
        chapter: Object.keys(book.chapters)[0],
        bookName: book.name,
        englishBookName: book.englishName,
      },
    });
  };

  const today = now;
  // "Good evening, Wilson" / "Bom dia" — never mixed languages, never an
  // exclamation mark, falls back gracefully when there's no name on file.
  const greetingWord = t(getGreetingKey());
  const greetingLine = userName ? `${greetingWord}, ${userName}` : greetingWord;
  // "Monday • July 13" / "Segunda-feira • 13 de julho" — word order follows
  // each language's own convention rather than a single hardcoded template.
  const weekdayName = t(WEEKDAY_KEYS[today.getDay()]);
  const monthName   = t(MONTH_KEYS[today.getMonth()]);
  const dayNumber   = today.getDate();
  const dateLine    = lang === 'pt'
    ? `${weekdayName} • ${dayNumber} de ${monthName}`
    : `${weekdayName} • ${monthName} ${dayNumber}`;

  // Smooth crossfade whenever the greeting text changes (time-of-day tick
  // or language switch) instead of an abrupt swap.
  const [displayGreeting, setDisplayGreeting] = useState(greetingLine);
  const greetingOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (greetingLine === displayGreeting) return;
    Animated.timing(greetingOpacity, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      setDisplayGreeting(greetingLine);
      Animated.timing(greetingOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }, [greetingLine]);

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

  // ── Continue listening ── parses the audio engine's persisted resume
  // marker ("chapter:<bookId>:<chapter>:<lang>") back into a book reference.
  // Hidden while that same chapter queue is actively playing.
  const audio = useAudio();
  const listenResume = React.useMemo(() => {
    const st = audio.audioResume;
    if (!st) return null;
    const m = st.queueKey.match(/^chapter:([^:]+):(\d+):/);
    if (!m) return null;
    const book = BIBLE_DATA[m[1]];
    if (!book) return null;
    return { bookId: m[1], chapter: Number(m[2]), verse: st.itemId, book };
  }, [audio.audioResume]);
  const showListenResume =
    !!listenResume &&
    !(audio.queueKey === audio.audioResume?.queueKey && audio.status !== 'idle');

  const handleContinueListening = () => {
    if (!listenResume) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push({
      pathname: '/chapter',
      params: {
        bookId:          listenResume.bookId,
        chapter:         String(listenResume.chapter),
        bookName:        listenResume.book.name,
        englishBookName: listenResume.book.englishName,
        resumeVerse:     listenResume.verse,
      },
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.space.gradient[0] }]}>
      {/* Reading Space atmosphere — subtle gradient behind the whole home screen */}
      <SpaceBackground gradient={colors.space.gradient} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 8 }}
        showsVerticalScrollIndicator={false}
      >

      {/* ── Header ── */}
      <View style={[
        styles.header,
        { paddingTop: topPad + 16, borderBottomColor: colors.border },
      ]}>
        {/* Personalized greeting — calm, no exclamation marks, crossfades on change */}
        <Animated.Text style={[styles.headerGreeting, { color: colors.foreground, opacity: greetingOpacity }]}>
          {displayGreeting}
        </Animated.Text>

        {/* "Today" / "Hoje" */}
        <Text style={[styles.headerToday, { color: colors.mutedForeground }]}>
          {t('today_label')}
        </Text>

        {/* Full localized date */}
        <Text style={[styles.headerDate, { color: colors.mutedForeground }]}>
          {dateLine}
        </Text>
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
            <Text style={[styles.continueLabel, { color: colors.mutedForeground }]}>{t('continue_label')}</Text>
            <Text style={[styles.continueName, { color: colors.primary }]}>
              {readingProgress.englishBookName} {readingProgress.chapter}
            </Text>
            <View style={{ flex: 1 }} />
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Continue listening strip ── */}
      {showListenResume && listenResume && (
        <View style={[styles.section, { marginTop: readingProgress ? 8 : 18 }]}>
          <TouchableOpacity
            onPress={handleContinueListening}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`${t('continue_listening_label')} — ${listenResume.book.englishName} ${listenResume.chapter}`}
            style={[styles.continueStrip, {
              backgroundColor: colors.accent + '0E',
              borderColor:     colors.accent + '28',
              borderRadius:    colors.radius,
            }]}
          >
            <Feather name="headphones" size={13} color={colors.accent} />
            <Text style={[styles.continueLabel, { color: colors.mutedForeground }]}>{t('continue_listening_label')}</Text>
            <Text style={[styles.continueName, { color: colors.accent }]}>
              {listenResume.book.englishName} {listenResume.chapter} · v.{listenResume.verse}
            </Text>
            <View style={{ flex: 1 }} />
            <Feather name="chevron-right" size={14} color={colors.accent} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Prayer Journey card — Apple-calm: soft icon circle, stacked
             title/subtitle, generous padding ── */}
      <View style={[styles.section, { marginTop: 14 }]}>
        <TouchableOpacity
          onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); router.push('/prayer'); }}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={t('pr_home_entry')}
          style={[styles.prayerCard, {
            backgroundColor: colors.card,
            borderColor:     colors.border,
            borderRadius:    colors.radius + 2,
          }]}
        >
          <View style={[styles.prayerCardIcon, { backgroundColor: colors.primary + '12' }]}>
            <Feather name="heart" size={16} color={colors.primary} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.prayerCardTitle, { color: colors.foreground }]} numberOfLines={1}>
              {t('pr_home_entry')}
            </Text>
            <Text style={[styles.prayerCardSub, { color: colors.mutedForeground }]} numberOfLines={1}>
              {t('pr_home_entry_sub')}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* ── Featured passages ── */}
      <FeaturedPassagesCarousel />

      {/* ── Library — extra air above the shelf so the cards breathe ── */}
      <View style={[styles.section, { marginTop: 26 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{t('library_section_title')}</Text>
          <View style={styles.sectionRight}>
            <Text style={[styles.sectionCount, { color: colors.accent }]}>
              {BOOK_CATALOGUE.length} {t(BOOK_CATALOGUE.length !== 1 ? 'book_count_plural' : 'book_count_singular')}
            </Text>
            {/* View-mode toggle */}
            <View style={[styles.viewToggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <TouchableOpacity
                onPress={() => toggleView('grid')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={[styles.viewToggleBtn, viewMode === 'grid' && { backgroundColor: colors.primary + '18' }]}
                accessibilityRole="button"
                accessibilityLabel={t('library_view_grid_a11y')}
                accessibilityState={{ selected: viewMode === 'grid' }}
              >
                <MaterialCommunityIcons name="bookshelf" size={14} color={viewMode === 'grid' ? colors.primary : colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleView('list')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={[styles.viewToggleBtn, viewMode === 'list' && { backgroundColor: colors.primary + '18' }]}
                accessibilityRole="button"
                accessibilityLabel={t('library_view_list_a11y')}
                accessibilityState={{ selected: viewMode === 'list' }}
              >
                <Feather name="list" size={13} color={viewMode === 'list' ? colors.primary : colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Search — find one book by name instead of scrolling the whole shelf */}
        <View style={[styles.librarySearchBox, { backgroundColor: colors.muted, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Feather name="search" size={15} color={colors.mutedForeground} />
          <TextInput
            style={[styles.librarySearchInput, { color: colors.foreground }]}
            placeholder={t('library_search_placeholder')}
            placeholderTextColor={colors.mutedForeground}
            value={librarySearch}
            onChangeText={setLibrarySearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {librarySearch.length > 0 && (
            <TouchableOpacity
              onPress={() => setLibrarySearch('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={t('library_search_clear_a11y')}
            >
              <Feather name="x-circle" size={15} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters — narrow by testament, or re-sort alphabetically instead
            of canonical Bible order. Independent controls: the testament
            pills are single-select, A-Z is its own toggle. Selected state
            is a light outline + soft tint, never a bold solid fill — reads
            calmer next to the leather shelf than a heavy block of color. */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.libraryFilterRow}>
          {([
            { key: 'all', label: t('library_filter_all') },
            { key: 'old', label: t('testament_old') },
            { key: 'new', label: t('testament_new') },
          ] as const).map(opt => {
            const selected = libraryTestamentFilter === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  setLibraryTestamentFilter(opt.key);
                }}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.libraryFilterChip,
                  {
                    backgroundColor: selected ? colors.primary + '12' : 'transparent',
                    borderColor:     selected ? colors.primary + '70' : colors.border,
                  },
                ]}
              >
                <Text style={[styles.libraryFilterChipText, { color: selected ? colors.primary : colors.mutedForeground }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              setLibraryAlphabetical(v => !v);
            }}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected: libraryAlphabetical }}
            style={[
              styles.libraryFilterChip,
              styles.libraryFilterChipAz,
              {
                backgroundColor: libraryAlphabetical ? colors.primary + '12' : 'transparent',
                borderColor:     libraryAlphabetical ? colors.primary + '70' : colors.border,
              },
            ]}
          >
            <Feather name="arrow-down" size={11} color={libraryAlphabetical ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.libraryFilterChipText, { color: libraryAlphabetical ? colors.primary : colors.mutedForeground }]}>
              {t('library_filter_az')}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Favorites quick strip — a handful of go-to books, one tap away,
            regardless of where they sit among the other 66 on the shelf. */}
        {librarySearchNorm.length === 0 && favoriteCatalogue.length > 0 && (
          <View style={styles.libraryFavoritesWrap}>
            <View style={styles.libraryFavoritesLabelRow}>
              <Feather name="star" size={11} color={colors.accent} />
              <Text style={[styles.libraryFavoritesLabel, { color: colors.mutedForeground }]}>
                {t('library_favorites_title')}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.libraryFavoritesRow}>
              {favoriteCatalogue.map(meta => {
                const book = BIBLE_DATA[meta.bookId];
                if (!book) return null;
                const leather = CATEGORY_INFO[meta.category];
                return (
                  <TouchableOpacity key={meta.bookId} onPress={() => handleOpenBook(meta.bookId)} activeOpacity={0.85}>
                    <LinearGradient
                      colors={[leather.base, leather.deep]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.favoriteChip, { borderRadius: colors.radius - 2 }]}
                    >
                      <Text style={styles.favoriteChipText} numberOfLines={1}>{book.englishName}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {filteredCatalogue.length === 0 ? (
          <View style={styles.libraryEmptyState}>
            <Feather name="search" size={26} color={colors.border} />
            <Text style={[styles.libraryEmptyText, { color: colors.mutedForeground }]}>
              {t('library_search_no_results')}
            </Text>
          </View>
        ) : viewMode === 'grid' ? (
          <BookshelfLibrary
            books={filteredCatalogue}
            currentBookId={readingProgress?.bookId}
            currentChapter={readingProgress?.chapter}
            favoriteBookIds={favoriteBooks}
            onToggleFavorite={toggleFavoriteBook}
          />
        ) : (
          <View style={[styles.listContainer, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius }]}>
            {filteredCatalogue.map((meta, idx) => (
              <BookListRow
                key={meta.bookId}
                meta={meta}
                isLast={idx === filteredCatalogue.length - 1}
                isFavorite={favoriteBooks.includes(meta.bookId)}
                onToggleFavorite={toggleFavoriteBook}
              />
            ))}
          </View>
        )}
      </View>

      {/* ═══════════════════════════════════════════════════════════════════════
          TODAY'S STUDY
      ════════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { marginTop: 36 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{t('study_section_title')}</Text>
        </View>

        <StudyCard />
      </View>

      {/* ═══════════════════════════════════════════════════════════════════════
          LEARNING PROGRESS
      ════════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { marginTop: 32 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{t('progress_section_title')}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            setProgressModalVisible(true);
          }}
          style={[styles.progressSummary, {
            backgroundColor: colors.card,
            borderColor:     colors.border,
            borderRadius:    colors.radius + 2,
          }]}
        >
          <View style={[styles.progressHeroBadge, { backgroundColor: colors.space.accent + '18' }]}>
            <Feather name="zap" size={17} color={colors.space.accent} />
          </View>

          <View style={styles.progressSummaryText}>
            <Text style={[styles.progressHeroValue, { color: colors.foreground }]}>
              {progressStats[3].value}{t('progress_streak_suffix')}
            </Text>
            <Text style={[styles.progressHeroSub, { color: colors.mutedForeground }]} numberOfLines={1}>
              {progressStats[0].value} {t('progress_words_word')} · {progressStats[1].value} {t('progress_verses_word')} · {progressStats[2].value} {t('progress_days_word')}
            </Text>
          </View>

          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {nextHonor && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); router.push('/journey'); }}
            accessibilityRole="button"
            style={[styles.progressSummary, {
              backgroundColor: colors.card,
              borderColor:     colors.border,
              borderRadius:    colors.radius + 2,
              marginTop:       10,
            }]}
          >
            <View style={[styles.progressHeroBadge, { backgroundColor: colors.space.accent + '18' }]}>
              <Feather name="award" size={17} color={colors.space.accent} />
            </View>
            <View style={styles.progressSummaryText}>
              <Text style={[styles.progressHeroSub, { color: colors.mutedForeground }]}>{t('home_journey_next')}</Text>
              <Text style={[styles.progressHeroValue, { color: colors.foreground, fontSize: 15 }]} numberOfLines={1}>
                {t(`honor_${nextHonor.defId}_title` as I18nKey)}
                {nextHonor.tier ? ` — ${t(`tier_${nextHonor.tier}` as I18nKey)}` : ''} · {nextHonor.value}/{nextHonor.threshold}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}

      </View>

      <ProgressModal
        visible={progressModalVisible}
        onClose={() => setProgressModalVisible(false)}
        stats={progressStats}
      />

      {/* ═══════════════════════════════════════════════════════════════════════
          SAVED VOCABULARY
      ════════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { marginTop: 32 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{t('vocab_section_title')}</Text>
        </View>

        <View style={[styles.vocabCard, {
          backgroundColor: colors.card,
          borderColor:     colors.border,
          borderRadius:    colors.radius,
        }]}>
          {VOCAB_PREVIEW.map((item, idx) => (
            <View
              key={item.word}
              style={[
                styles.vocabRow,
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
              ]}
            >
              <View style={[styles.vocabAccentDot, { backgroundColor: colors.space.accent }]} />
              <Text style={[styles.vocabWord, { color: colors.foreground }]}>{item.word}</Text>
              <Text style={[styles.vocabDash, { color: colors.border }]}>—</Text>
              <Text style={[styles.vocabDef, { color: colors.mutedForeground }]}>{item.def}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            router.push('/(tabs)/vocab');
          }}
          style={[styles.outlineBtn, { borderColor: colors.primary, borderRadius: colors.radius, marginTop: 12 }]}
        >
          <Text style={[styles.outlineBtnText, { color: colors.primary }]}>{t('review_vocabulary_btn')}</Text>
          <Feather name="arrow-right" size={13} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════════
          MY NOTES
      ════════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { marginTop: 32 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{t('notes_section_title')}</Text>
        </View>

        <View style={[styles.noteCard, {
          backgroundColor: colors.card,
          borderColor:     colors.border,
          borderRadius:    colors.radius,
        }]}>
          {/* Burgundy left accent stripe */}
          <View style={[styles.noteStripe, { backgroundColor: colors.primary }]} />

          <View style={styles.noteBody}>
            <Text style={[styles.noteRef, { color: colors.primary }]}>John 1:1</Text>
            <Text style={[styles.noteText, { color: colors.foreground }]}>
              {t('note_sample_text')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            router.push('/(tabs)/bookmarks');
          }}
          style={[styles.outlineBtn, { borderColor: colors.primary, borderRadius: colors.radius, marginTop: 12 }]}
        >
          <Text style={[styles.outlineBtnText, { color: colors.primary }]}>{t('open_notes_btn')}</Text>
          <Feather name="arrow-right" size={13} color={colors.primary} />
        </TouchableOpacity>
      </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  headerGreeting: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  headerToday: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 6,
  },
  headerDate: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
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

  // Featured passages carousel
  featuredRow: { paddingHorizontal: PAD, gap: FEATURED_CARD_GAP },
  featuredCard: { borderWidth: 1, padding: 14, gap: 8 },
  featuredBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  featuredBadgeText: { fontSize: 10.5, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
  featuredRef: { fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  featuredSnippet: { fontSize: 12.5, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  featuredOpen: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // Daily verse card
  pill: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  pillAccent: { width: 4 },
  pillBody:   { flex: 1, paddingHorizontal: 16, paddingVertical: 20, gap: 12 },
  pillHeartBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillHeartCount: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  pillPlayBtn:    { marginLeft: 4 },
  pillPlayerRow:  { marginTop: 10, marginBottom: 2, gap: 6 },
  pillLangRow:    { flexDirection: 'row', gap: 6, alignSelf: 'flex-start' },
  pillLangPill:   { borderWidth: 1, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 9 },
  pillLangPillText: { fontSize: 10.5, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  pillTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillBadge:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  pillRef:       { fontSize: 11, fontFamily: 'Inter_400Regular' },
  pillVerse:     { fontFamily: 'Lora_400Regular_Italic' },   // fontSize/lineHeight set inline
  pillPtFull:    { fontFamily: 'Inter_400Regular', marginTop: 8 },
  pillFooter:    { flexDirection: 'row', alignItems: 'center', gap: 10 },

  // Font-size buttons
  pillSizeRow:  {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  pillSizeBtn:  {
    width: 26, height: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  pillSizeTxt:  { lineHeight: 18 },

  // Open button
  pillOpenBtn:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pillOpenText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // Continue strip
  continueStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  continueLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  continueName:  { fontSize: 13, fontFamily: 'Inter_600SemiBold' },

  // Prayer Journey card — Apple-calm two-line entry
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
  },
  prayerCardIcon:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  prayerCardTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', letterSpacing: -0.1 },
  prayerCardSub:   { fontSize: 12.5, fontFamily: 'Inter_400Regular', marginTop: 2 },

  // Section right cluster (count + toggle)
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewToggle: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewToggleBtn: {
    width: 28,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Book list
  listContainer: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              12,
    paddingHorizontal: 14,
    paddingVertical:   12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listSwatch: {
    width:          52,
    height:         52,
    alignItems:     'center',
    justifyContent: 'center',
    overflow:       'hidden',
  },
  listSwatchRoman: {
    fontSize:     20,
    fontFamily:   'Inter_700Bold',
    color:        'rgba(255,255,255,0.18)',
    letterSpacing: -1,
  },
  listInfo: { flex: 1, gap: 2 },
  listNameEn: {
    fontSize:   14,
    fontFamily: 'Inter_600SemiBold',
  },
  listNamePt: {
    fontSize:   12,
    fontFamily: 'Inter_400Regular',
  },
  listTag: {
    alignSelf:         'flex-start',
    borderRadius:       4,
    paddingHorizontal:  6,
    paddingVertical:    2,
    marginTop:          2,
  },
  listTagText: {
    fontSize:   9,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.4,
  },
  listRight: {
    alignItems: 'center',
    gap: 4,
  },
  listChapters: {
    fontSize:   11,
    fontFamily: 'Inter_400Regular',
  },
  librarySearchBox: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    borderWidth:        StyleSheet.hairlineWidth,
    paddingHorizontal:  14,
    paddingVertical:    12,
    height:             48,
    marginTop:          14,
  },
  librarySearchInput: {
    flex:       1,
    fontSize:   14,
    fontFamily: 'Inter_400Regular',
    height:     '100%',
  },
  libraryFilterRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
    marginTop:     18,
    marginBottom:  6,
    paddingRight:  8,
  },
  libraryFilterChip: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               6,
    borderWidth:        1,
    borderRadius:       22,
    paddingHorizontal:  16,
    paddingVertical:    10,
  },
  libraryFilterChipAz: {
    marginLeft: 8,
  },
  libraryFilterChipText: {
    fontSize:   12.5,
    fontFamily: 'Inter_500Medium',
  },
  libraryFavoritesWrap: {
    marginTop: 18,
  },
  libraryFavoritesLabelRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    marginBottom:  8,
  },
  libraryFavoritesLabel: {
    fontSize:      10,
    fontFamily:    'Inter_600SemiBold',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  libraryFavoritesRow: {
    gap: 8,
  },
  favoriteChip: {
    paddingHorizontal: 12,
    paddingVertical:   8,
    maxWidth:          140,
  },
  favoriteChipText: {
    fontSize:   12,
    fontFamily: 'Inter_600SemiBold',
    color:      '#EFD79C',
  },
  libraryEmptyState: {
    alignItems:  'center',
    gap:         10,
    paddingVertical: 40,
  },
  libraryEmptyText: {
    fontSize:   13,
    fontFamily: 'Inter_400Regular',
  },
  // ── Today's Study card ─────────────────────────────────────────────────────
  studyCard: {
    borderWidth:  StyleSheet.hairlineWidth,
    overflow:     'hidden',
  },
  studyTopRule: {
    height: 3,
  },
  studyCardInner: {
    padding: 24,
    gap:     20,
  },
  studyMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           7,
  },
  studyMetaRef: {
    fontSize:      12,
    fontFamily:    'Inter_600SemiBold',
    letterSpacing: 0.2,
  },
  studyMetaDot: {
    width:        3,
    height:       3,
    borderRadius: 2,
  },
  studyMetaTime: {
    fontSize:   12,
    fontFamily: 'Inter_400Regular',
  },
  studyTitle: {
    fontSize:      26,
    fontFamily:    'Lora_700Bold',
    letterSpacing: -0.3,
    lineHeight:    34,
  },
  studyDivider: {
    height: StyleSheet.hairlineWidth,
  },
  studySteps: {
    gap: 0,
  },
  studyStepRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           12,
    paddingBottom: 4,
  },
  studyStepGutter: {
    width:      14,
    alignItems: 'center',
    paddingTop: 10,
  },
  studyStepDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  studyStepLine: {
    width:  1,
    flex:   1,
    minHeight: 18,
    marginTop: 3,
  },
  studyStepIconWrap: {
    width:          36,
    height:         36,
    borderRadius:   10,
    borderWidth:    1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  studyStepLabel: {
    flex:       1,
    fontSize:   14,
    paddingTop: 10,
    lineHeight: 20,
  },
  studyStepContent: {
    paddingLeft:   26,
    paddingBottom: 18,
    paddingTop:    2,
    gap:           12,
  },
  studyReadVerse: { gap: 3 },
  studyReadEn: { fontSize: 14, fontFamily: 'Lora_400Regular', lineHeight: 21 },
  studyReadPt: { fontSize: 13, fontFamily: 'Inter_400Regular', fontStyle: 'italic', lineHeight: 19 },
  studyInlineBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:              6,
    borderWidth:      1,
    borderRadius:     999,
    paddingVertical:  8,
    paddingHorizontal: 14,
    alignSelf:        'flex-start',
  },
  studyInlineBtnText: { fontSize: 12.5, fontFamily: 'Inter_600SemiBold' },
  studyLearnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  studyLearnChip: {
    borderWidth:      StyleSheet.hairlineWidth,
    borderRadius:     10,
    paddingVertical:  8,
    paddingHorizontal: 12,
    gap:              2,
  },
  studyLearnChipWord: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  studyLearnChipDef:  { fontSize: 11.5, fontFamily: 'Inter_400Regular' },
  studyReflectPrompt: { fontSize: 13.5, fontFamily: 'Lora_400Regular_Italic', lineHeight: 20 },
  studyReflectInput: {
    borderWidth:     StyleSheet.hairlineWidth,
    borderRadius:    10,
    padding:         12,
    fontSize:        13.5,
    fontFamily:      'Inter_400Regular',
    minHeight:       64,
    textAlignVertical: 'top',
  },
  studyBtn: {
    paddingVertical: 15,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       2,
  },
  studyBtnText: {
    fontSize:      14,
    fontFamily:    'Inter_600SemiBold',
    letterSpacing: 0.15,
  },

  // ── Learning Progress summary (opens ProgressModal for detail) ────────────
  progressSummary: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               12,
    borderWidth:       StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical:   15,
  },
  progressHeroBadge: {
    width:          38,
    height:         38,
    borderRadius:   19,
    alignItems:     'center',
    justifyContent: 'center',
  },
  progressSummaryText: { flex: 1, gap: 2 },
  progressHeroValue: {
    fontSize:      15,
    fontFamily:    'Inter_700Bold',
  },
  progressHeroSub: {
    fontSize:   12,
    fontFamily: 'Inter_400Regular',
  },

  // ── Saved Vocabulary ───────────────────────────────────────────────────────
  vocabCard: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow:    'hidden',
  },
  vocabRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    paddingHorizontal: 18,
    paddingVertical:   15,
  },
  vocabAccentDot: {
    width:        4,
    height:       4,
    borderRadius: 2,
  },
  vocabWord: {
    fontSize:   14,
    fontFamily: 'Inter_600SemiBold',
    minWidth:   52,
  },
  vocabDash: {
    fontSize:   14,
    fontFamily: 'Inter_400Regular',
  },
  vocabDef: {
    flex:       1,
    fontSize:   13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },

  // ── My Notes ──────────────────────────────────────────────────────────────
  noteCard: {
    borderWidth:   StyleSheet.hairlineWidth,
    flexDirection: 'row',
    overflow:      'hidden',
  },
  noteStripe: {
    width: 3,
  },
  noteBody: {
    flex:    1,
    padding: 20,
    gap:     10,
  },
  noteRef: {
    fontSize:      11,
    fontFamily:    'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize:   15,
    fontFamily: 'Lora_400Regular_Italic',
    lineHeight: 24,
  },

  // ── Shared: outline ghost button ───────────────────────────────────────────
  outlineBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             6,
    borderWidth:     1,
    paddingVertical: 13,
  },
  outlineBtnText: {
    fontSize:      13,
    fontFamily:    'Inter_600SemiBold',
    letterSpacing: 0.15,
  },
});

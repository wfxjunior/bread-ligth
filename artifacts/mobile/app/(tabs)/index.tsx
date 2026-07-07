import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useBible } from '@/context/BibleContext';
import { BIBLE_DATA } from '@/constants/bibleData';
import { getEntryForDate, resolveVerse } from '@/utils/dailyVerse';

const PAD    = 16;
const GAP    = 10;
const CARD_H = 196;

const VIEW_MODE_KEY = '@bibliaeN:libraryViewMode';

const WEEKDAYS_PT      = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const WEEKDAYS_FULL_PT = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const MONTHS_PT        = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia!';
  if (h < 18) return 'Boa tarde!';
  return 'Boa noite!';
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
            <Text style={[styles.pillBadgeText, { color: colors.accent }]}>Versículo do dia</Text>
          </View>
          <Text style={[styles.pillRef, { color: colors.mutedForeground }]}>
            {entry.bookEn} {entry.chapter}:{entry.verse}
          </Text>
        </View>

        {/* ── Verse text (tap to expand) ── */}
        <TouchableOpacity activeOpacity={0.85} onPress={toggle}>
          <Text style={[styles.pillVerse, { color: colors.foreground, fontSize: fSize, lineHeight: lHeight }]}>
            "{expanded ? verse.en : preview}"
          </Text>
          {expanded && (
            <Text style={[styles.pillPtFull, { color: colors.mutedForeground, fontSize: fSize - 2, lineHeight: lHeight - 3 }]}>
              {verse.pt}
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Footer: heart | spacer | size buttons | chevron | Abrir ── */}
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
              {liked ? '125.001' : '125k'}
            </Text>
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
          <TouchableOpacity onPress={toggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
            <Text style={[styles.pillOpenText, { color: colors.accent }]}>Abrir</Text>
            <Feather name="arrow-right" size={12} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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

// ── Study / Learning centre constants ─────────────────────────────────────────
const GOLD = '#B8921A';                       // antique gold accent

const STUDY_STEPS = [
  { id: 'read',    icon: 'book-open',  label: 'Read'    },
  { id: 'listen',  icon: 'headphones', label: 'Listen'  },
  { id: 'learn',   icon: 'edit-3',     label: 'Learn'   },
  { id: 'reflect', icon: 'compass',    label: 'Reflect' },
];

const PROGRESS_STATS = [
  { icon: 'type',      value: '12',     label: 'Words\nlearned'  },
  { icon: 'book-open', value: '4',      label: 'Verses\nstudied' },
  { icon: 'clock',     value: '18',     label: 'Min\nstudy time' },
  { icon: 'zap',       value: '7',      label: 'Day\nstreak'     },
];

const VOCAB_PREVIEW = [
  { word: 'Word',  def: 'Verbo, Palavra' },
  { word: 'Light', def: 'Luz'            },
  { word: 'Grace', def: 'Graça'          },
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

// ── Book list row ─────────────────────────────────────────────────────────────
function BookListRow({ meta, isLast }: { meta: BookMeta; isLast?: boolean }) {
  const colors = useColors();
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

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.82}
      style={[styles.listRow, !isLast && { borderBottomColor: colors.border }]}
    >
      {/* Colour swatch */}
      <LinearGradient
        colors={meta.gradient}
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
            {meta.testamentPt}
          </Text>
        </View>
      </View>

      {/* Right: chapter count + chevron */}
      <View style={styles.listRight}>
        <Text style={[styles.listChapters, { color: colors.mutedForeground }]}>
          {chapterCount} cap.
        </Text>
        <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
      </View>
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

  const [userName,  setUserName]  = useState('');
  const [viewMode,  setViewMode]  = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    AsyncStorage.getItem('@bibliaeN:userName').then(n => setUserName(n ?? '')).catch(() => setUserName(''));
    AsyncStorage.getItem(VIEW_MODE_KEY).then(v => { if (v === 'list' || v === 'grid') setViewMode(v); }).catch(() => {});
  }, []);

  const toggleView = (mode: 'grid' | 'list') => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setViewMode(mode);
    AsyncStorage.setItem(VIEW_MODE_KEY, mode).catch(() => {});
  };

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
        { paddingTop: topPad + 16, borderBottomColor: colors.border },
      ]}>
        <Text style={[styles.headerGreeting, { color: colors.mutedForeground }]}>
          {greeting}{userName ? `, ${userName}` : ''}
        </Text>
        <Text style={[styles.headerName, { color: colors.foreground }]}>Hoje</Text>
        <Text style={[styles.headerDate, { color: colors.mutedForeground }]}>
          {WEEKDAYS_FULL_PT[today.getDay()]}  ·  {today.getDate()} {MONTHS_PT[today.getMonth()]}
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
            <Text style={[styles.continueLabel, { color: colors.mutedForeground }]}>Continuar</Text>
            <Text style={[styles.continueName, { color: colors.primary }]}>
              {readingProgress.englishBookName} {readingProgress.chapter}
            </Text>
            <View style={{ flex: 1 }} />
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Library ── */}
      <View style={[styles.section, { marginTop: readingProgress ? 24 : 20 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>BIBLIOTECA</Text>
          <View style={styles.sectionRight}>
            <Text style={[styles.sectionCount, { color: colors.accent }]}>
              {BOOK_CATALOGUE.length} livros
            </Text>
            {/* View-mode toggle */}
            <View style={[styles.viewToggle, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <TouchableOpacity
                onPress={() => toggleView('grid')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={[styles.viewToggleBtn, viewMode === 'grid' && { backgroundColor: colors.primary + '18' }]}
                accessibilityRole="button"
                accessibilityLabel="Visualização em grade"
                accessibilityState={{ selected: viewMode === 'grid' }}
              >
                <Feather name="grid" size={13} color={viewMode === 'grid' ? colors.primary : colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => toggleView('list')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={[styles.viewToggleBtn, viewMode === 'list' && { backgroundColor: colors.primary + '18' }]}
                accessibilityRole="button"
                accessibilityLabel="Visualização em lista"
                accessibilityState={{ selected: viewMode === 'list' }}
              >
                <Feather name="list" size={13} color={viewMode === 'list' ? colors.primary : colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {viewMode === 'grid' ? (
          <View style={styles.grid}>
            {BOOK_CATALOGUE.map(meta => (
              <BookGridCard key={meta.bookId} meta={meta} cardW={cardW} />
            ))}
          </View>
        ) : (
          <View style={[styles.listContainer, { borderColor: colors.border, backgroundColor: colors.card, borderRadius: colors.radius }]}>
            {BOOK_CATALOGUE.map((meta, idx) => (
              <BookListRow key={meta.bookId} meta={meta} isLast={idx === BOOK_CATALOGUE.length - 1} />
            ))}
          </View>
        )}
      </View>

      {/* ═══════════════════════════════════════════════════════════════════════
          TODAY'S STUDY
      ════════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { marginTop: 36 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ESTUDO</Text>
        </View>

        {/* Study card */}
        <View style={[styles.studyCard, {
          backgroundColor: colors.card,
          borderColor:     colors.border,
          borderRadius:    colors.radius + 2,
        }]}>
          {/* Antique-gold top rule */}
          <View style={[styles.studyTopRule, { backgroundColor: GOLD }]} />

          <View style={styles.studyCardInner}>

            {/* Reference + time */}
            <View style={styles.studyMeta}>
              <Text style={[styles.studyMetaRef, { color: colors.primary }]}>John 1</Text>
              <View style={[styles.studyMetaDot, { backgroundColor: colors.border }]} />
              <Feather name="clock" size={11} color={colors.mutedForeground} />
              <Text style={[styles.studyMetaTime, { color: colors.mutedForeground }]}>15 min</Text>
            </View>

            {/* Chapter title */}
            <Text style={[styles.studyTitle, { color: colors.foreground }]}>
              The Word{'\n'}Became Flesh
            </Text>

            {/* Hairline divider */}
            <View style={[styles.studyDivider, { backgroundColor: colors.border }]} />

            {/* Four steps */}
            <View style={styles.studySteps}>
              {STUDY_STEPS.map((step, idx) => {
                const active = idx === 0;
                return (
                  <View key={step.id} style={styles.studyStepRow}>
                    {/* Step connector dot (left gutter) */}
                    <View style={styles.studyStepGutter}>
                      <View style={[styles.studyStepDot,
                        { backgroundColor: active ? colors.primary : colors.border }]} />
                      {idx < STUDY_STEPS.length - 1 && (
                        <View style={[styles.studyStepLine, { backgroundColor: colors.border }]} />
                      )}
                    </View>

                    {/* Icon + label */}
                    <View style={[styles.studyStepIconWrap, {
                      borderColor:     active ? colors.primary + '38' : colors.border,
                      backgroundColor: active ? colors.primary + '0C' : 'transparent',
                    }]}>
                      <Feather
                        name={step.icon as any}
                        size={13}
                        color={active ? colors.primary : colors.mutedForeground}
                      />
                    </View>

                    <Text style={[styles.studyStepLabel, {
                      color:      active ? colors.foreground : colors.mutedForeground,
                      fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    }]}>
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* CTA button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
              style={[styles.studyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            >
              <Text style={[styles.studyBtnText, { color: colors.primaryForeground }]}>
                Start Today's Study
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════════
          LEARNING PROGRESS
      ════════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { marginTop: 32 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PROGRESSO</Text>
        </View>

        <View style={styles.progressGrid}>
          {PROGRESS_STATS.map(stat => (
            <View key={stat.label} style={[styles.progressCard, {
              backgroundColor: colors.card,
              borderColor:     colors.border,
              borderRadius:    colors.radius,
              width:           cardW,
            }]}>
              <Feather name={stat.icon as any} size={15} color={GOLD} style={{ marginBottom: 8 }} />
              <Text style={[styles.progressValue, { color: colors.foreground }]}>
                {stat.value}
              </Text>
              <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════════
          SAVED VOCABULARY
      ════════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { marginTop: 32 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>VOCABULÁRIO</Text>
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
              <View style={[styles.vocabAccentDot, { backgroundColor: GOLD }]} />
              <Text style={[styles.vocabWord, { color: colors.foreground }]}>{item.word}</Text>
              <Text style={[styles.vocabDash, { color: colors.border }]}>—</Text>
              <Text style={[styles.vocabDef, { color: colors.mutedForeground }]}>{item.def}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
          style={[styles.outlineBtn, { borderColor: colors.primary, borderRadius: colors.radius, marginTop: 12 }]}
        >
          <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Review Vocabulary</Text>
          <Feather name="arrow-right" size={13} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ═══════════════════════════════════════════════════════════════════════
          MY NOTES
      ════════════════════════════════════════════════════════════════════════ */}
      <View style={[styles.section, { marginTop: 32 }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ANOTAÇÕES</Text>
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
              Jesus is presented as eternal, God, and the source of everything.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
          style={[styles.outlineBtn, { borderColor: colors.primary, borderRadius: colors.radius, marginTop: 12 }]}
        >
          <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Open Notes</Text>
          <Feather name="arrow-right" size={13} color={colors.primary} />
        </TouchableOpacity>
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
    paddingBottom: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  headerGreeting: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  headerName: {
    fontSize: 30,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  headerDate: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
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
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
  },
  continueLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  continueName:  { fontSize: 13, fontFamily: 'Inter_600SemiBold' },

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

  // Book grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
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

  // ── Learning Progress grid ─────────────────────────────────────────────────
  progressGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           GAP,
  },
  progressCard: {
    borderWidth:       StyleSheet.hairlineWidth,
    paddingHorizontal: 18,
    paddingVertical:   20,
  },
  progressValue: {
    fontSize:      28,
    fontFamily:    'Lora_700Bold',
    letterSpacing: -0.5,
    lineHeight:    34,
  },
  progressLabel: {
    fontSize:   11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 16,
    marginTop:  2,
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

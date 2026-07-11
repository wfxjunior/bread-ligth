import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BIBLE_DATA } from '@/constants/bibleData';

// ── Leather category palette ────────────────────────────────────────────────
// Each biblical category owns one leather tone — a real bookshelf groups
// volumes by kind, not by cover art. Colours stay muted/desaturated so the
// shelf reads as premium leather, never a rainbow of stickers.
export type BookCategory =
  | 'pentateuch' | 'history' | 'poetry' | 'majorProphets' | 'minorProphets'
  | 'gospels' | 'acts' | 'paulineLetters' | 'generalLetters' | 'revelation';

export const CATEGORY_INFO: Record<BookCategory, { base: string; deep: string; labelPt: string }> = {
  pentateuch:      { base: '#6B4A2C', deep: '#33200F', labelPt: 'Pentateuco'        },
  history:         { base: '#33513F', deep: '#152219', labelPt: 'Históricos'        },
  poetry:          { base: '#6E2438', deep: '#33101A', labelPt: 'Poesia'            },
  majorProphets:   { base: '#1E3358', deep: '#0C1830', labelPt: 'Profetas Maiores' },
  minorProphets:   { base: '#2A4F38', deep: '#12241A', labelPt: 'Profetas Menores'  },
  gospels:         { base: '#631E2A', deep: '#2E0D14', labelPt: 'Evangelhos'        },
  acts:            { base: '#5E3D20', deep: '#2C1C0E', labelPt: 'Atos'              },
  paulineLetters:  { base: '#20395E', deep: '#0E1C30', labelPt: 'Cartas de Paulo'   },
  generalLetters:  { base: '#4C3159', deep: '#241729', labelPt: 'Cartas Gerais'     },
  revelation:      { base: '#221D18', deep: '#0A0807', labelPt: 'Apocalipse'        },
};

const GOLD        = '#D9B562';
const GOLD_SOFT   = 'rgba(217,181,98,0.4)';
const RIBBON_RED  = '#7A1626';

export type ShelfBookMeta = {
  bookId: string;
  category: BookCategory;
  roman: string;
};

// ── Single leather-bound volume ─────────────────────────────────────────────
function LeatherBook({
  meta, width, height, isCurrent, progressRatio,
}: {
  meta: ShelfBookMeta;
  width: number;
  height: number;
  isCurrent: boolean;
  progressRatio: number;
}) {
  const book = BIBLE_DATA[meta.bookId];
  const scale = useRef(new Animated.Value(1)).current;
  const lift  = useRef(new Animated.Value(isCurrent ? -6 : 0)).current;

  if (!book) return null;
  const leather = CATEGORY_INFO[meta.category];

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1, useNativeDriver: true, speed: 18, bounciness: 6,
    }).start();
  };
  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const chapterKey = Object.keys(book.chapters)[0];
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

  const titleSize = width < 96 ? 10.5 : 12;
  const ribbonLen = 14 + Math.max(0, Math.min(1, progressRatio)) * (height * 0.5);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={{
          width, height,
          transform: [{ scale }, { translateY: lift }],
          shadowColor: isCurrent ? GOLD : '#000',
          shadowOpacity: isCurrent ? 0.55 : 0.35,
          shadowRadius: isCurrent ? 12 : 6,
          shadowOffset: { width: 0, height: isCurrent ? 6 : 4 },
          elevation: isCurrent ? 10 : 5,
        }}
      >
        <View style={[styles.bookOuter, { borderRadius: 7 }]}>
          <LinearGradient
            colors={[leather.base, leather.deep]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* soft sheen */}
          <LinearGradient
            colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.55, y: 0.5 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {/* embossed roman numeral watermark */}
          <Text style={[styles.roman, { fontSize: height * 0.42 }]}>{meta.roman}</Text>

          {/* gold ornamental border */}
          <View style={styles.ornamentBorder} pointerEvents="none" />

          {/* gold decorative bands */}
          <View style={[styles.goldBand, { top: 12 }]} />
          <View style={[styles.goldBand, { top: 15, opacity: 0.35 }]} />

          {/* right spine edge */}
          <View style={[styles.spineEdge, { backgroundColor: leather.deep }]} />
          <View style={styles.spineSeam} />

          {/* subtle age marks */}
          <View style={styles.ageMarkA} pointerEvents="none" />
          <View style={styles.ageMarkB} pointerEvents="none" />

          {/* title block */}
          <View style={styles.titleBlock}>
            <Text
              style={[styles.titleEn, { fontSize: titleSize }]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {book.englishName.toUpperCase()}
            </Text>
            <View style={styles.titleDash} />
            <Text style={styles.titlePt} numberOfLines={1}>{book.name}</Text>
          </View>

          {/* bottom gold bands mirroring the top */}
          <View style={[styles.goldBand, { bottom: 15, opacity: 0.35 }]} />
          <View style={[styles.goldBand, { bottom: 12 }]} />

          {/* bookmark ribbon — only for the book currently being studied */}
          {isCurrent && (
            <View style={[styles.ribbon, { height: ribbonLen, backgroundColor: RIBBON_RED }]}>
              <View style={styles.ribbonNotchL} />
              <View style={styles.ribbonNotchR} />
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ── Shelf plank beneath a row of books ──────────────────────────────────────
function ShelfPlank() {
  return (
    <View style={styles.plankWrap}>
      <LinearGradient
        colors={['rgba(0,0,0,0.32)', 'rgba(0,0,0,0)']}
        style={styles.plankShadow}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['#4A2F1B', '#2A1A0E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.3 }}
        style={styles.plank}
      >
        <View style={styles.plankGrainLight} />
        <View style={styles.plankGrainDark} />
      </LinearGradient>
    </View>
  );
}

// ── Full bookshelf ───────────────────────────────────────────────────────────
export function BookshelfLibrary({
  books, currentBookId, currentChapter,
}: {
  books: ShelfBookMeta[];
  currentBookId?: string;
  currentChapter?: number;
}) {
  const { width } = useWindowDimensions();
  const COLUMNS   = 3;
  const OUTER_PAD = 16;
  const GAP       = 12;
  const bookW     = Math.floor((width - OUTER_PAD * 2 - GAP * (COLUMNS - 1) - 32) / COLUMNS);
  const bookH     = Math.round(bookW * 1.56);

  const rows: ShelfBookMeta[][] = [];
  for (let i = 0; i < books.length; i += COLUMNS) rows.push(books.slice(i, i + COLUMNS));

  return (
    <View style={styles.cabinet}>
      <LinearGradient
        colors={['#2A1A0F', '#150C07']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* warm light from above */}
      <LinearGradient
        colors={['rgba(255,214,150,0.09)', 'rgba(255,214,150,0)']}
        style={styles.cabinetLight}
        pointerEvents="none"
      />
      {/* cabinet panel seams */}
      <View style={[styles.seam, { left: '33%' }]} />
      <View style={[styles.seam, { left: '66%' }]} />

      <View style={styles.cabinetInner}>
        {rows.map((row, ri) => {
          const book = BIBLE_DATA[row[0]?.bookId];
          const totalChapters = book ? Object.keys(book.chapters).length : 1;
          return (
            <View key={ri} style={{ marginTop: ri === 0 ? 0 : 22 }}>
              <View style={[styles.row, { gap: GAP }]}>
                {row.map(meta => {
                  const isCurrent = !!currentBookId && currentBookId === meta.bookId;
                  const bookData  = BIBLE_DATA[meta.bookId];
                  const tc        = bookData ? Object.keys(bookData.chapters).length : totalChapters;
                  const ratio     = isCurrent && currentChapter ? currentChapter / tc : 0;
                  return (
                    <LeatherBook
                      key={meta.bookId}
                      meta={meta}
                      width={bookW}
                      height={bookH}
                      isCurrent={isCurrent}
                      progressRatio={ratio}
                    />
                  );
                })}
              </View>
              <ShelfPlank />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cabinet: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  cabinetLight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '55%',
  },
  cabinetInner: {
    padding: 18,
  },
  seam: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  // Shelf plank
  plankWrap: { marginTop: -2 },
  plankShadow: { height: 10 },
  plank: {
    height: 14,
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  plankGrainLight: {
    position: 'absolute',
    top: 2, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  plankGrainDark: {
    position: 'absolute',
    bottom: 3, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  // Book cover
  bookOuter: {
    flex: 1,
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  roman: {
    position: 'absolute',
    top: '14%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.08)',
    letterSpacing: -2,
  },
  ornamentBorder: {
    position: 'absolute',
    top: 7, left: 6, right: 6, bottom: 7,
    borderWidth: 1,
    borderColor: GOLD_SOFT,
    borderRadius: 4,
  },
  goldBand: {
    position: 'absolute',
    left: 12, right: 12,
    height: 1,
    backgroundColor: GOLD_SOFT,
  },
  spineEdge: {
    position: 'absolute',
    right: 0, top: 0, bottom: 0,
    width: 5,
  },
  spineSeam: {
    position: 'absolute',
    right: 5, top: 0, bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  ageMarkA: {
    position: 'absolute',
    width: 30, height: 30, borderRadius: 15,
    top: -8, left: -6,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  ageMarkB: {
    position: 'absolute',
    width: 24, height: 24, borderRadius: 12,
    bottom: -4, right: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  titleBlock: {
    position: 'absolute',
    left: 8, right: 8, bottom: 22,
    alignItems: 'center',
    gap: 4,
  },
  titleEn: {
    fontFamily: 'Lora_700Bold',
    color: GOLD,
    letterSpacing: 0.4,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  titleDash: {
    width: 16, height: 1,
    backgroundColor: GOLD_SOFT,
  },
  titlePt: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 9,
    color: 'rgba(233,214,168,0.65)',
    textAlign: 'center',
  },
  ribbon: {
    position: 'absolute',
    top: -3,
    left: '38%',
    width: 9,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  ribbonNotchL: {
    position: 'absolute',
    bottom: -5, left: 0,
    width: 0, height: 0,
    borderLeftWidth: 4.5, borderLeftColor: 'transparent',
    borderTopWidth: 5, borderTopColor: RIBBON_RED,
  },
  ribbonNotchR: {
    position: 'absolute',
    bottom: -5, right: 0,
    width: 0, height: 0,
    borderRightWidth: 4.5, borderRightColor: 'transparent',
    borderTopWidth: 5, borderTopColor: RIBBON_RED,
  },
});

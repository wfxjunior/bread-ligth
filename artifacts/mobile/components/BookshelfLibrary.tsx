import React, { useRef } from 'react';
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BIBLE_DATA } from '@/constants/bibleData';
import { useLanguage } from '@/context/LanguageContext';

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
const GOLD_FAINT  = 'rgba(217,181,98,0.16)';
const RIBBON_RED  = '#7A1626';

// ── Per-book flavour text: a short tagline (PT) evoking the book's theme,
// a thematic line-art glyph, and its traditional era — the details that make
// a shelf feel like a real, well-loved library rather than a plain list. ────
const TAGLINE: Record<string, string> = {
  genesis:        'No Princípio, Deus',
  psalms:         'Cânticos da Alma',
  proverbs:       'Sabedoria para a Vida',
  matthew:        'O Rei e Seu Reino',
  john:           'O Verbo se Fez Carne',
  romans:         'O Evangelho da Graça',
  philippians:    'Alegria em Toda Circunstância',
  '1corinthians': 'O Amor Edifica',
};

const ERA: Record<string, string> = {
  genesis:        'EST. A.C.',
  psalms:         'EST. A.C.',
  proverbs:       'EST. A.C.',
  matthew:        'EST. D.C. 60',
  john:           'EST. D.C. 90',
  romans:         'EST. D.C. 57',
  philippians:    'EST. D.C. 62',
  '1corinthians': 'EST. D.C. 55',
};

const THEME_ICON: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  genesis:        'weather-sunny',
  psalms:         'music-note',
  proverbs:       'leaf',
  matthew:        'cross',
  john:           'feather',
  romans:         'bank',
  philippians:    'anchor',
  '1corinthians': 'heart',
};

export type ShelfBookMeta = {
  bookId: string;
  category: BookCategory;
  roman: string;
};

// ── Single leather-bound volume ─────────────────────────────────────────────
function LeatherBook({
  meta, width, height, isCurrent, progressRatio, resumeChapter,
}: {
  meta: ShelfBookMeta;
  width: number;
  height: number;
  isCurrent: boolean;
  progressRatio: number;
  resumeChapter?: number;
}) {
  const book = BIBLE_DATA[meta.bookId];
  const { t: tl } = useLanguage();
  const scale   = useRef(new Animated.Value(1)).current;
  const lift    = useRef(new Animated.Value(isCurrent ? -6 : 0)).current;
  const rotate  = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const pulling = useRef(false);

  if (!book) return null;
  const leather = CATEGORY_INFO[meta.category];
  const totalChapters = Object.keys(book.chapters).length;

  const navigateToChapter = () => {
    const startChapter = isCurrent && resumeChapter ? resumeChapter : Number(Object.keys(book.chapters)[0]);
    router.push({
      pathname: '/chapter',
      params: {
        bookId:          meta.bookId,
        chapter:         String(startChapter),
        bookName:        book.name,
        englishBookName: book.englishName,
      },
    });
    // Reset the pulled-book pose so it's back on the shelf when we return.
    setTimeout(() => {
      pulling.current = false;
      scale.setValue(1);
      lift.setValue(isCurrent ? -6 : 0);
      rotate.setValue(0);
      opacity.setValue(1);
    }, 400);
  };

  const handlePressIn = () => {
    if (pulling.current) return;
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  };
  const handlePressOut = () => {
    if (pulling.current) return;
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 6 }).start();
  };
  const handlePress = () => {
    if (pulling.current) return;
    pulling.current = true;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Pull the volume off the shelf — lift, tilt toward the reader, and fade
    // into the page turn, so opening a book feels like a physical gesture.
    Animated.parallel([
      Animated.timing(scale,   { toValue: 1.16, duration: 260, useNativeDriver: true }),
      Animated.timing(lift,    { toValue: (isCurrent ? -6 : 0) - 54, duration: 260, useNativeDriver: true }),
      Animated.timing(rotate,  { toValue: -1, duration: 260, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 200, delay: 100, useNativeDriver: true }),
    ]).start(navigateToChapter);
  };

  const titleSize = width < 140 ? 12.5 : 14;
  const ribbonLen = 14 + Math.max(0, Math.min(1, progressRatio)) * (height * 0.42);
  const rotateDeg = rotate.interpolate({ inputRange: [-1, 0], outputRange: ['-6deg', '0deg'] });
  const icon = THEME_ICON[meta.bookId];

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={{
          width, height,
          opacity,
          transform: [{ scale }, { translateY: lift }, { rotate: rotateDeg }],
          shadowColor: isCurrent ? GOLD : '#000',
          shadowOpacity: isCurrent ? 0.55 : 0.35,
          shadowRadius: isCurrent ? 14 : 7,
          shadowOffset: { width: 0, height: isCurrent ? 8 : 5 },
          elevation: isCurrent ? 10 : 5,
        }}
      >
        <View style={[styles.bookOuter, { borderRadius: 9 }]}>
          {/* real leather grain — photographed texture, tinted per category so
              every volume still reads as its own shelf colour while the cover
              itself looks and feels like genuine leather, not flat vector fill */}
          <Image
            source={require('../assets/images/leather-texture.jpg')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <LinearGradient
            colors={[leather.base + 'E6', leather.deep + 'F2']}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* soft sheen */}
          <LinearGradient
            colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.55, y: 0.5 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {/* gentle overhead shelf light grazing the top of the cover */}
          <LinearGradient
            colors={['rgba(255,224,170,0.22)', 'rgba(255,224,170,0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.38 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* gold ornamental border */}
          <View style={styles.ornamentBorder} pointerEvents="none" />

          {/* era header */}
          <View style={styles.eraBlock} pointerEvents="none">
            <Text style={styles.eraLabel} numberOfLines={1}>
              {book.testament === 'old' ? tl('testament_old_caps') : tl('testament_new_caps')}
            </Text>
            <Text style={styles.eraYear} numberOfLines={1}>— {ERA[meta.bookId] ?? ''} —</Text>
          </View>

          {/* embossed roman numeral watermark + thematic glyph, lit like a
              museum spotlight from directly above */}
          <View style={styles.numeralZone} pointerEvents="none">
            <View style={[styles.spotlightOuter, { width: width * 0.85, height: width * 0.85, borderRadius: width * 0.425 }]} />
            <View style={[styles.spotlightInner, { width: width * 0.55, height: width * 0.55, borderRadius: width * 0.275 }]} />
            <Text style={[styles.roman, { fontSize: height * 0.3 }]}>{meta.roman}</Text>
            {icon && (
              <MaterialCommunityIcons
                name={icon}
                size={height * 0.22}
                color="rgba(217,181,98,0.24)"
                style={styles.themeIcon}
              />
            )}
          </View>

          {/* decorative bookmark glyph — every volume on the shelf gets one */}
          <MaterialCommunityIcons
            name="bookmark-outline"
            size={14}
            color={GOLD_SOFT}
            style={styles.bookmarkGlyph}
          />

          {/* decorative ribbon-marker tab, colour-matched to the volume */}
          <View style={styles.sideTabRow} pointerEvents="none">
            <View style={[styles.sideTab, { backgroundColor: leather.base }]} />
            <View style={[styles.sideTabPoint, { borderLeftColor: leather.base }]} />
          </View>

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
            <Text style={styles.titlePt} numberOfLines={2}>{TAGLINE[meta.bookId] ?? book.name}</Text>
          </View>

          {/* progress footer */}
          <View style={styles.footer}>
            {isCurrent ? (
              <>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.round(Math.min(1, progressRatio) * 100)}%` }]} />
                  <View style={[styles.progressDot, { left: `${Math.round(Math.min(1, progressRatio) * 100)}%` }]} />
                </View>
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>{tl('chapter_abbr')} {resumeChapter ?? 1} {tl('of_word')} {totalChapters}</Text>
                  <Text style={styles.footerText}>{Math.round(Math.min(1, progressRatio) * 100)}%</Text>
                </View>
              </>
            ) : (
              <Text style={styles.footerTextCenter}>
                {totalChapters} {tl(totalChapters !== 1 ? 'chapter_count_plural' : 'chapter_count_singular')}
              </Text>
            )}
          </View>

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
        colors={['rgba(255,196,120,0.10)', 'rgba(255,196,120,0)']}
        style={styles.plankGlow}
        pointerEvents="none"
      />
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
  const COLUMNS   = 2;
  const OUTER_PAD = 16;
  const GAP       = 16;
  const bookW     = Math.floor((width - OUTER_PAD * 2 - GAP * (COLUMNS - 1) - 36) / COLUMNS);
  const bookH     = Math.round(bookW * 1.5);

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
      {/* warm light from above — a soft glow washing over the shelf, as if
          a single reading lamp sits just out of frame */}
      <LinearGradient
        colors={['rgba(255,214,158,0.22)', 'rgba(255,205,140,0)']}
        style={styles.cabinetLight}
        pointerEvents="none"
      />
      {/* soft edge vignette for depth */}
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.vignette, { left: 0 }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={[styles.vignette, { right: 0 }]}
        pointerEvents="none"
      />
      {/* cabinet panel seam */}
      <View style={[styles.seam, { left: '50%' }]} />

      <View style={styles.cabinetInner}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ marginTop: ri === 0 ? 0 : 26 }}>
            <View style={[styles.row, { gap: GAP }]}>
              {row.map(meta => {
                const isCurrent = !!currentBookId && currentBookId === meta.bookId;
                const bookData  = BIBLE_DATA[meta.bookId];
                const tc        = bookData ? Object.keys(bookData.chapters).length : 1;
                const ratio     = isCurrent && currentChapter ? currentChapter / tc : 0;
                return (
                  <LeatherBook
                    key={meta.bookId}
                    meta={meta}
                    width={bookW}
                    height={bookH}
                    isCurrent={isCurrent}
                    progressRatio={ratio}
                    resumeChapter={isCurrent ? currentChapter : undefined}
                  />
                );
              })}
            </View>
            <ShelfPlank />
          </View>
        ))}
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
    height: '50%',
  },
  vignette: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 34,
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
  plankGlow: { height: 16, marginBottom: -6 },
  plankShadow: { height: 10 },
  plank: {
    height: 15,
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
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  ornamentBorder: {
    position: 'absolute',
    top: 9, left: 7, right: 7, bottom: 9,
    borderWidth: 1,
    borderColor: GOLD_SOFT,
    borderRadius: 5,
  },
  eraBlock: {
    position: 'absolute',
    top: 16, left: 8, right: 8,
    alignItems: 'center',
  },
  eraLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    letterSpacing: 1,
    color: 'rgba(233,214,168,0.6)',
  },
  eraYear: {
    fontFamily: 'Inter_400Regular',
    fontSize: 7.5,
    letterSpacing: 0.4,
    color: 'rgba(233,214,168,0.4)',
    marginTop: 2,
  },
  numeralZone: {
    position: 'absolute',
    top: '20%',
    left: 0, right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roman: {
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    color: 'rgba(255,244,222,0.16)',
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 2,
  },
  themeIcon: {
    position: 'absolute',
    right: '12%',
    top: '42%',
  },
  spotlightOuter: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  spotlightInner: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bookmarkGlyph: {
    position: 'absolute',
    top: 10, right: 9,
    opacity: 0.65,
  },
  sideTabRow: {
    position: 'absolute',
    left: 0,
    top: '32%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideTab: {
    width: 12,
    height: 24,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  sideTabPoint: {
    width: 0, height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
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
    width: 34, height: 34, borderRadius: 17,
    top: -8, left: -6,
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  ageMarkB: {
    position: 'absolute',
    width: 28, height: 28, borderRadius: 14,
    bottom: -4, right: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  titleBlock: {
    position: 'absolute',
    left: 10, right: 10, bottom: 46,
    alignItems: 'center',
    gap: 5,
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
    width: 18, height: 1,
    backgroundColor: GOLD_SOFT,
  },
  titlePt: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 10,
    lineHeight: 13,
    color: 'rgba(233,214,168,0.65)',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    left: 12, right: 12, bottom: 12,
    gap: 5,
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  progressFill: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    backgroundColor: GOLD,
    borderRadius: 1,
  },
  progressDot: {
    position: 'absolute',
    top: -2, width: 6, height: 6, borderRadius: 3,
    marginLeft: -3,
    backgroundColor: GOLD,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: 'rgba(233,214,168,0.7)',
  },
  footerTextCenter: {
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: 'rgba(233,214,168,0.4)',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  ribbon: {
    position: 'absolute',
    top: -3,
    left: '38%',
    width: 10,
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
    borderLeftWidth: 5, borderLeftColor: 'transparent',
    borderTopWidth: 5, borderTopColor: RIBBON_RED,
  },
  ribbonNotchR: {
    position: 'absolute',
    bottom: -5, right: 0,
    width: 0, height: 0,
    borderRightWidth: 5, borderRightColor: 'transparent',
    borderTopWidth: 5, borderTopColor: RIBBON_RED,
  },
});

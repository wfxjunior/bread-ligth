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
import Svg, { Line, Path, Polygon, Circle } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BIBLE_DATA } from '@/constants/bibleData';
import { useLanguage } from '@/context/LanguageContext';

// ── Leather category palette ────────────────────────────────────────────────
// Each biblical category owns one deep leather tone — a real bookshelf groups
// volumes by kind, not by cover art. Tones stay dark and desaturated so the
// photographed grain reads through the tint instead of washing out into a
// flat, candy-colored sticker.
export type BookCategory =
  | 'pentateuch' | 'history' | 'poetry' | 'majorProphets' | 'minorProphets'
  | 'gospels' | 'acts' | 'paulineLetters' | 'generalLetters' | 'revelation';

export const CATEGORY_INFO: Record<BookCategory, { base: string; deep: string; labelPt: string }> = {
  pentateuch:      { base: '#5C3E22', deep: '#22140A', labelPt: 'Pentateuco'        },
  history:         { base: '#2C4636', deep: '#0F1B14', labelPt: 'Históricos'        },
  poetry:          { base: '#601D2E', deep: '#280C15', labelPt: 'Poesia'            },
  majorProphets:   { base: '#1B2C4C', deep: '#0A1224', labelPt: 'Profetas Maiores' },
  minorProphets:   { base: '#254631', deep: '#0E1C14', labelPt: 'Profetas Menores'  },
  gospels:         { base: '#571A25', deep: '#240A0F', labelPt: 'Evangelhos'        },
  acts:            { base: '#513519', deep: '#22150A', labelPt: 'Atos'              },
  paulineLetters:  { base: '#1C3151', deep: '#0A1526', labelPt: 'Cartas de Paulo'   },
  generalLetters:  { base: '#432B4C', deep: '#1C1122', labelPt: 'Cartas Gerais'     },
  revelation:      { base: '#1C1814', deep: '#080605', labelPt: 'Apocalipse'        },
};

const GOLD        = '#D9B562';
const GOLD_BRIGHT = '#EFD79C';
const GOLD_SOFT   = 'rgba(217,181,98,0.55)';
const GOLD_FAINT  = 'rgba(217,181,98,0.22)';
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

// ── Small gold engraving ornaments ──────────────────────────────────────────
// A hand-drawn corner flourish and a divider-with-diamond, reused at every
// size via SVG rather than a raster asset — this is what reads as "foil
// stamped onto leather" instead of "app card border".
function CornerFlourish({ size = 16, rotate = 0 }: { size?: number; rotate?: number }) {
  return (
    <View style={{ width: size, height: size, transform: [{ rotate: `${rotate}deg` }] }}>
      <Svg width={size} height={size} viewBox="0 0 20 20">
        <Path
          d="M2 17 V7 Q2 2 7 2 H17"
          stroke={GOLD_SOFT}
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M2 10.5 Q7.5 10.5 7.5 5"
          stroke={GOLD_SOFT}
          strokeWidth={1}
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx={7.5} cy={5} r={1.15} fill={GOLD_SOFT} />
      </Svg>
    </View>
  );
}

function OrnateDivider({ width }: { width: number }) {
  const cx = width / 2;
  return (
    <Svg width={width} height={9} viewBox={`0 0 ${width} 9`}>
      <Line x1={0} y1={4.5} x2={cx - 7} y2={4.5} stroke={GOLD_SOFT} strokeWidth={1} />
      <Polygon
        points={`${cx},0.5 ${cx + 4},4.5 ${cx},8.5 ${cx - 4},4.5`}
        fill={GOLD_SOFT}
      />
      <Line x1={cx + 7} y1={4.5} x2={width} y2={4.5} stroke={GOLD_SOFT} strokeWidth={1} />
    </Svg>
  );
}

// ── Single leather-bound volume ─────────────────────────────────────────────
function LeatherBook({
  meta, width, height, isCurrent, progressRatio, resumeChapter, isFavorite, onToggleFavorite,
}: {
  meta: ShelfBookMeta;
  width: number;
  height: number;
  isCurrent: boolean;
  progressRatio: number;
  resumeChapter?: number;
  isFavorite: boolean;
  onToggleFavorite: (bookId: string) => void;
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

  const titleSize   = width < 140 ? 15 : 17;
  const dividerW    = Math.round(width * 0.34);
  const rotateDeg   = rotate.interpolate({ inputRange: [-1, 0], outputRange: ['-6deg', '0deg'] });
  const icon        = THEME_ICON[meta.bookId];

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
          shadowOpacity: isCurrent ? 0.55 : 0.4,
          shadowRadius: isCurrent ? 14 : 8,
          shadowOffset: { width: 0, height: isCurrent ? 8 : 6 },
          elevation: isCurrent ? 10 : 6,
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
            colors={[leather.base + 'C8', leather.deep + 'EC']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.95, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* gentle overhead shelf light grazing only the top of the cover —
              a real hide catches light along its curve, it doesn't gloss like
              glass across the whole face */}
          <LinearGradient
            colors={['rgba(255,224,170,0.20)', 'rgba(255,224,170,0)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.3 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {/* soft vignette pooling toward the base, grounding the volume */}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.28)']}
            start={{ x: 0.5, y: 0.55 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* foil-stamped double frame + engraved corner flourishes */}
          <View style={styles.frameOuter} pointerEvents="none" />
          <View style={styles.frameInner} pointerEvents="none" />
          <View style={[styles.cornerWrap, { top: 8, left: 6 }]} pointerEvents="none">
            <CornerFlourish size={16} rotate={0} />
          </View>
          {/* top-right corner doubles as the favorite toggle — a small foil
              star instead of a purely decorative flourish, so pulling a
              volume off the shelf isn't the only way to mark it as one to
              come back to. */}
          <Pressable
            onPress={() => onToggleFavorite(meta.bookId)}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
            style={[styles.cornerWrap, styles.favoriteWrap, { top: 2, right: 1 }]}
          >
            <MaterialCommunityIcons
              name={isFavorite ? 'star' : 'star-outline'}
              size={16}
              color={isFavorite ? GOLD_BRIGHT : GOLD_SOFT}
            />
          </Pressable>
          <View style={[styles.cornerWrap, { bottom: 8, right: 6 }]} pointerEvents="none">
            <CornerFlourish size={16} rotate={180} />
          </View>
          <View style={[styles.cornerWrap, { bottom: 8, left: 6 }]} pointerEvents="none">
            <CornerFlourish size={16} rotate={270} />
          </View>

          {/* main content column */}
          <View style={styles.contentCol}>
            {/* eyebrow: testament + era */}
            <View style={styles.eyebrow} pointerEvents="none">
              <Text style={styles.eraLabel} numberOfLines={1}>
                {book.testament === 'old' ? tl('testament_old_caps') : tl('testament_new_caps')}
              </Text>
              <Text style={styles.eraYear} numberOfLines={1}>{ERA[meta.bookId] ?? ''}</Text>
            </View>

            {/* hero: engraved gold title, flanked by ornamental dividers,
                with the book's thematic emblem beneath it — the cover reads
                by its name first, the way a real bound volume does */}
            <View style={styles.hero}>
              <OrnateDivider width={dividerW} />
              <Text
                style={[styles.titleEn, { fontSize: titleSize }]}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.62}
              >
                {book.englishName.toUpperCase()}
              </Text>
              <OrnateDivider width={dividerW} />
              {icon && (
                <View style={styles.emblemWrap}>
                  <MaterialCommunityIcons name={icon} size={height * 0.1} color={GOLD_SOFT} />
                </View>
              )}
              <Text style={styles.titlePt} numberOfLines={2}>{TAGLINE[meta.bookId] ?? book.name}</Text>
            </View>

            {/* footer */}
            <View style={styles.footer}>
              <View style={styles.footerHairline} />
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
          </View>

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

          {/* bookmark ribbon — a short tab peeking above the top edge marks
              the volume currently being studied, the way a real ribbon
              marker pokes out of a closed book. Its length is fixed (the
              footer progress bar already shows how far along you are), so
              it never grows tall enough to drape over the title. */}
          {isCurrent && (
            <View style={[styles.ribbon, { backgroundColor: RIBBON_RED }]}>
              <View style={styles.ribbonNotchL} />
              <View style={styles.ribbonNotchR} />
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

// ── Shelf plank beneath a row of books — real photographed oak, not a flat
// gradient fill, so the shelf itself reads as furniture rather than UI chrome ─
function ShelfPlank() {
  return (
    <View style={styles.plankWrap}>
      <LinearGradient
        colors={['rgba(255,196,120,0.14)', 'rgba(255,196,120,0)']}
        style={styles.plankGlow}
        pointerEvents="none"
      />
      <View style={styles.plank}>
        <Image
          source={require('../assets/images/wood-shelf-texture.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(20,10,4,0.10)', 'rgba(10,5,2,0.45)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <LinearGradient
        colors={['rgba(0,0,0,0.38)', 'rgba(0,0,0,0)']}
        style={styles.plankShadow}
        pointerEvents="none"
      />
    </View>
  );
}

// ── Shelf back panel — one identical wood-panel "cubby" per row. Each row
// gets its own same-size crop of the texture and the same fixed lighting, so
// every shelf in a long, scrolling case reads as the same piece of furniture
// instead of drifting lighter/darker (or showing a different slice of grain)
// the further down the list it sits. ─────────────────────────────────────────
function ShelfBackPanel({ isFirst }: { isFirst: boolean }) {
  return (
    <View style={[styles.shelfPanel, isFirst && styles.shelfPanelFirst]}>
      <Image
        source={require('../assets/images/wood-wall-texture.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, styles.shelfPanelTint]} />
      {/* same soft warm wash on every panel, not just the topmost one */}
      <LinearGradient
        colors={['rgba(255,200,130,0.22)', 'rgba(255,190,120,0)']}
        style={styles.shelfPanelLight}
        pointerEvents="none"
      />
    </View>
  );
}

// ── Full bookshelf ───────────────────────────────────────────────────────────
export function BookshelfLibrary({
  books, currentBookId, currentChapter, favoriteBookIds, onToggleFavorite,
}: {
  books: ShelfBookMeta[];
  currentBookId?: string;
  currentChapter?: number;
  favoriteBookIds: string[];
  onToggleFavorite: (bookId: string) => void;
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
      {/* soft edge vignette for depth — a constant left/right fade, so it
          doesn't vary shelf to shelf like a top-to-bottom gradient would */}
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.vignette, { left: 0 }]}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.45)', 'rgba(0,0,0,0)']}
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
            <View style={styles.shelfPanelWrap}>
              <ShelfBackPanel isFirst={ri === 0} />
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
                      isFavorite={favoriteBookIds.includes(meta.bookId)}
                      onToggleFavorite={onToggleFavorite}
                    />
                  );
                })}
              </View>
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
  // Per-row shelf "cubby": a fixed-size wrap so every row's back panel is
  // cropped and lit identically, however far down the list it sits.
  shelfPanelWrap: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    paddingTop: 12,
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  shelfPanel: {
    ...StyleSheet.absoluteFillObject,
  },
  shelfPanelFirst: {},
  shelfPanelTint: {
    backgroundColor: 'rgba(8,5,3,0.42)',
  },
  shelfPanelLight: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '55%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  // Shelf plank
  plankWrap: { marginTop: -2 },
  plankGlow: { height: 16, marginBottom: -6 },
  plankShadow: { height: 12 },
  plank: {
    height: 17,
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'center',
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
  frameOuter: {
    position: 'absolute',
    top: 7, left: 6, right: 6, bottom: 7,
    borderWidth: 1.2,
    borderColor: GOLD_SOFT,
    borderRadius: 6,
  },
  frameInner: {
    position: 'absolute',
    top: 10, left: 9, right: 9, bottom: 10,
    borderWidth: 0.75,
    borderColor: GOLD_FAINT,
    borderRadius: 4,
  },
  cornerWrap: {
    position: 'absolute',
  },
  favoriteWrap: {
    zIndex: 5,
    padding: 7,
  },
  contentCol: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  eyebrow: {
    alignItems: 'center',
    gap: 3,
  },
  eraLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    letterSpacing: 1,
    color: 'rgba(233,214,168,0.55)',
  },
  eraYear: {
    fontFamily: 'Inter_400Regular',
    fontSize: 7.5,
    letterSpacing: 0.4,
    color: 'rgba(233,214,168,0.36)',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  titleEn: {
    fontFamily: 'Lora_700Bold',
    color: GOLD_BRIGHT,
    letterSpacing: 0.6,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 1.5,
  },
  emblemWrap: {
    marginTop: 1,
  },
  titlePt: {
    fontFamily: 'Lora_400Regular_Italic',
    fontSize: 10,
    lineHeight: 13,
    color: 'rgba(233,214,168,0.55)',
    textAlign: 'center',
    marginTop: 2,
  },
  footer: {
    width: '100%',
    gap: 6,
  },
  footerHairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: GOLD_FAINT,
    marginBottom: 2,
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
    color: 'rgba(233,214,168,0.45)',
    textAlign: 'center',
    letterSpacing: 0.3,
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
  ribbon: {
    position: 'absolute',
    top: -14,
    left: '38%',
    width: 10,
    height: 26,
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

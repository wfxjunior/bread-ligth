import React, { memo, useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { type DisplayMode } from '@/context/BibleContext';
import { type BibleVerse } from '@/constants/bibleData';

type TextSize = 'small' | 'medium' | 'large';

const TEXT_SCALE: Record<TextSize, { en: number; enLine: number; pt: number; ptLine: number }> = {
  small:  { en: 15, enLine: 25, pt: 14, ptLine: 22 },
  medium: { en: 18, enLine: 30, pt: 17, ptLine: 28 },
  large:  { en: 22, enLine: 35, pt: 20, ptLine: 33 },
};

interface VerseRowProps {
  verse: BibleVerse;
  displayMode: DisplayMode;
  textSize?: TextSize;
  isBookmarked: boolean;
  onWordPress: (word: string, context: string) => void;
  onBookmarkToggle: () => void;
  selected?: boolean;
  onVersePress?: (v: number, pageY: number, height: number) => void;
  hasNote?: boolean;
  isMarked?: boolean;
  onSpeak?: () => void;
  isSpeakingThis?: boolean;
}

function VerseRow({
  verse, displayMode, textSize = 'medium', isBookmarked,
  onWordPress, onBookmarkToggle,
  selected = false, onVersePress,
  hasNote = false, isMarked = false,
  onSpeak, isSpeakingThis = false,
}: VerseRowProps) {
  const colors  = useColors();
  const rowRef  = useRef<View>(null);

  const handleBookmark = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmarkToggle();
  };

  const handleRowPress = () => {
    if (!onVersePress) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    rowRef.current?.measureInWindow((_, y, __, height) => {
      onVersePress(verse.v, y, height);
    });
  };

  const showEn   = displayMode === 'both' || displayMode === 'english';
  const showPt   = displayMode === 'both' || displayMode === 'portuguese';
  const showBoth = displayMode === 'both';
  const scale    = TEXT_SCALE[textSize];

  const renderTappableWords = (text: string) => {
    const words = text.split(' ');
    return (
      <Text style={[styles.verseEnText, { color: colors.englishText, fontSize: scale.en, lineHeight: scale.enLine }]}>
        {words.map((rawWord, i) => {
          const clean = rawWord.replace(/[^a-zA-Z']/g, '').toLowerCase();
          return (
            <Text
              key={i}
              onPress={() => { if (clean.length > 1) onWordPress(clean, text); }}
              style={[
                styles.enWord,
                { color: colors.englishText, fontSize: scale.en, lineHeight: scale.enLine },
                clean.length > 1 && styles.tappableWord,
              ]}
              suppressHighlighting
            >
              {rawWord}{i < words.length - 1 ? ' ' : ''}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View
      ref={rowRef}
      style={[
        styles.container,
        { borderBottomColor: colors.border },
        selected  && { backgroundColor: colors.accent + '12' },
        isMarked  && { backgroundColor: colors.accent + '08' },
      ]}
    >
      {/* Tappable background — catches taps on empty space; word/bookmark taps take priority */}
      <Pressable style={StyleSheet.absoluteFillObject} onPress={handleRowPress} />

      {/* Left accent strip — shown when verse is highlighted */}
      {isMarked && (
        <View style={[styles.markedStrip, { backgroundColor: colors.accent }]} />
      )}

      {/* Verse number pill */}
      <View style={[styles.verseNumber, { backgroundColor: colors.accent + '18' }]}>
        <Text style={[styles.verseNumText, { color: colors.verseNumber }]}>{verse.v}</Text>
        {/* Note dot — shown when verse has a saved note */}
        {hasNote && (
          <View style={[styles.noteDot, { backgroundColor: colors.primary }]} />
        )}
      </View>

      {/* Text area */}
      <View style={styles.textContainer}>

        {/* English block */}
        {showEn && (
          <View style={styles.languageBlock}>
            {showBoth && (
              <View style={[styles.langBadge, { backgroundColor: colors.englishText + '12' }]}>
                <Text style={[styles.langBadgeText, { color: colors.englishText }]}>EN</Text>
              </View>
            )}
            {renderTappableWords(verse.en)}
          </View>
        )}

        {/* Separator */}
        {showBoth && (
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        )}

        {/* Portuguese block */}
        {showPt && (
          <View style={styles.languageBlock}>
            {showBoth && (
              <View style={[styles.langBadge, { backgroundColor: colors.portugueseText + '14' }]}>
                <Text style={[styles.langBadgeText, { color: colors.portugueseText }]}>PT</Text>
              </View>
            )}
            <Text style={[styles.versePtText, { color: colors.portugueseText, fontSize: scale.pt, lineHeight: scale.ptLine }]}>
              {verse.pt}
            </Text>
          </View>
        )}

      </View>

      {/* Speak button */}
      {onSpeak && (
        <TouchableOpacity
          onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); onSpeak(); }}
          style={styles.speakBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather
            name={isSpeakingThis ? 'volume-x' : 'volume-2'}
            size={16}
            color={isSpeakingThis ? colors.primary : colors.mutedForeground}
            style={{ opacity: isSpeakingThis ? 1 : 0.38 }}
          />
        </TouchableOpacity>
      )}

      {/* Bookmark button */}
      <TouchableOpacity
        onPress={handleBookmark}
        style={styles.bookmarkBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={19}
          color={isBookmarked ? colors.accent : colors.mutedForeground}
          style={{ opacity: isBookmarked ? 1 : 0.4 }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
    gap: 12,
  },

  // Verse number circle
  verseNumber: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 3, flexShrink: 0,
  },
  verseNumText: { fontSize: 11, fontFamily: 'Inter_700Bold' },

  // Text layout
  textContainer:  { flex: 1, gap: 8 },
  languageBlock:  { gap: 5 },

  // Language badge (EN / PT chip)
  langBadge:     { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  langBadgeText: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },

  // English verse — Lora serif for reading comfort
  verseEnText: { fontSize: 18, lineHeight: 30, fontFamily: 'Lora_400Regular' },
  enWord:      { fontSize: 18, lineHeight: 30, fontFamily: 'Lora_400Regular' },
  tappableWord: { textDecorationLine: 'underline', textDecorationStyle: 'solid' },

  // Portuguese verse — italic serif
  versePtText: { fontSize: 17, lineHeight: 28, fontFamily: 'Lora_400Regular_Italic' },

  // Separator between EN and PT
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 2 },

  // Speak
  speakBtn: { paddingTop: 4, flexShrink: 0 },
  // Bookmark
  bookmarkBtn: { paddingTop: 3, flexShrink: 0 },

  // Marked (highlighted) verse — left accent strip
  markedStrip: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },

  // Note dot — overlaid on verse number circle
  noteDot: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 8, height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
});

export default memo(VerseRow);

import React, { memo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { type DisplayMode } from '@/context/BibleContext';
import { type BibleVerse } from '@/constants/bibleData';

interface VerseRowProps {
  verse: BibleVerse;
  displayMode: DisplayMode;
  isBookmarked: boolean;
  onWordPress: (word: string, context: string) => void;
  onBookmarkToggle: () => void;
}

function VerseRow({ verse, displayMode, isBookmarked, onWordPress, onBookmarkToggle }: VerseRowProps) {
  const colors = useColors();

  const handleBookmark = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmarkToggle();
  };

  const showEn = displayMode === 'both' || displayMode === 'english';
  const showPt = displayMode === 'both' || displayMode === 'portuguese';
  const showBoth = displayMode === 'both';

  const renderTappableWords = (text: string) => {
    const words = text.split(' ');
    return (
      <Text style={[styles.verseEnText, { color: colors.englishText }]}>
        {words.map((rawWord, i) => {
          const clean = rawWord.replace(/[^a-zA-Z']/g, '').toLowerCase();
          return (
            <Text
              key={i}
              onPress={() => { if (clean.length > 1) onWordPress(clean, text); }}
              style={[
                styles.enWord,
                { color: colors.englishText },
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
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      {/* Verse number pill */}
      <View style={[styles.verseNumber, { backgroundColor: colors.accent + '18' }]}>
        <Text style={[styles.verseNumText, { color: colors.verseNumber }]}>{verse.v}</Text>
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
            <Text style={[styles.versePtText, { color: colors.portugueseText }]}>
              {verse.pt}
            </Text>
          </View>
        )}

      </View>

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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    flexShrink: 0,
  },
  verseNumText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },

  // Text layout
  textContainer: {
    flex: 1,
    gap: 8,
  },
  languageBlock: {
    gap: 5,
  },

  // Language badge (EN / PT chip)
  langBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  langBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.8,
  },

  // English verse — Lora serif for reading comfort
  verseEnText: {
    fontSize: 18,
    lineHeight: 30,
    fontFamily: 'Lora_400Regular',
  },
  enWord: {
    fontSize: 18,
    lineHeight: 30,
    fontFamily: 'Lora_400Regular',
  },
  tappableWord: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },

  // Portuguese verse — italic serif
  versePtText: {
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'Lora_400Regular_Italic',
  },

  // Separator between EN and PT
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },

  // Bookmark
  bookmarkBtn: {
    paddingTop: 3,
    flexShrink: 0,
  },
});

export default memo(VerseRow);

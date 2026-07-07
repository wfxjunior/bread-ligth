import React, { memo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
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

  const renderTappableWords = (text: string) => {
    const words = text.split(' ');
    return (
      <Text>
        {words.map((rawWord, i) => {
          const clean = rawWord.replace(/[^a-zA-Z']/g, '').toLowerCase();
          return (
            <Text
              key={i}
              onPress={() => {
                if (clean.length > 1) onWordPress(clean, text);
              }}
              style={[
                styles.englishWord,
                { color: colors.englishText },
                clean.length > 1 && styles.tappableWord,
              ]}
            >
              {rawWord}
              {i < words.length - 1 ? ' ' : ''}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={[styles.verseNumber, { backgroundColor: colors.accent + '22' }]}>
        <Text style={[styles.verseNumText, { color: colors.verseNumber }]}>{verse.v}</Text>
      </View>

      <View style={styles.textContainer}>
        {(displayMode === 'both' || displayMode === 'english') && (
          <View style={styles.languageBlock}>
            <Text style={[styles.langLabel, { color: colors.mutedForeground }]}>EN</Text>
            <Text style={[styles.verseText, { color: colors.englishText }]}>
              {renderTappableWords(verse.en)}
            </Text>
          </View>
        )}
        {displayMode === 'both' && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
        {(displayMode === 'both' || displayMode === 'portuguese') && (
          <View style={styles.languageBlock}>
            <Text style={[styles.langLabel, { color: colors.mutedForeground }]}>PT</Text>
            <Text style={[styles.verseText, { color: colors.portugueseText }]}>{verse.pt}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={isBookmarked ? colors.accent : colors.mutedForeground}
          style={{ opacity: isBookmarked ? 1 : 0.45 }}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
    gap: 12,
  },
  verseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  verseNumText: {
    fontSize: 11,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
  },
  textContainer: {
    flex: 1,
    gap: 6,
  },
  languageBlock: {
    gap: 2,
  },
  langLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
  },
  englishWord: {
    fontSize: 16,
    lineHeight: 26,
  },
  tappableWord: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  bookmarkBtn: {
    paddingTop: 2,
    flexShrink: 0,
  },
});

export default memo(VerseRow);

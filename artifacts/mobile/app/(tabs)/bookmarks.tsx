import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useBible, type Bookmark } from '@/context/BibleContext';
import { useLanguage } from '@/context/LanguageContext';
import * as Haptics from 'expo-haptics';
import { fontSize as ts } from '@/constants/design';

function BookmarkCard({ item, onRemove }: { item: Bookmark; onRemove: () => void }) {
  const colors = useColors();
  const { t: tl } = useLanguage();

  const handlePress = () => {
    router.push({
      pathname: '/chapter',
      params: {
        bookId: item.bookId,
        chapter: String(item.chapter),
        bookName: item.bookName,
        englishBookName: item.englishBookName,
      },
    });
  };

  const handleRemove = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemove();
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.refBadge, { backgroundColor: colors.accent + '20' }]}>
          <Feather name="bookmark" size={12} color={colors.accent} />
          <Text style={[styles.refText, { color: colors.accent }]}>
            {item.englishBookName} {item.chapter}:{item.verse}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="x" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.verseEn, { color: colors.englishText }]} numberOfLines={3}>
        {item.en}
      </Text>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <Text style={[styles.versePt, { color: colors.portugueseText }]} numberOfLines={2}>
        {item.pt}
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.refPt, { color: colors.mutedForeground }]}>
          {item.bookName} {item.chapter}:{item.verse}
        </Text>
        <View style={styles.readMore}>
          <Text style={[styles.readMoreText, { color: colors.primary }]}>{tl('read_chapter')}</Text>
          <Feather name="arrow-right" size={13} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BookmarksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { bookmarks, removeBookmark } = useBible();
  const { t: tl } = useLanguage();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>{tl('bookmarks_title')}</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          {bookmarks.length} {bookmarks.length !== 1 ? tl('bookmark_count_plural') : tl('bookmark_count_singular')}
        </Text>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="bookmark" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{tl('bookmarks_empty_title')}</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            {tl('bookmarks_empty_sub')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => `${item.bookId}-${item.chapter}-${item.verse}`}
          renderItem={({ item }) => (
            <BookmarkCard
              item={item}
              onRemove={() => removeBookmark(item.bookId, item.chapter, item.verse)}
            />
          )}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: bottomPad + 20 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!bookmarks.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  headerTitle: {
    fontSize: ts.heading,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  verseEn: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  versePt: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refPt: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});

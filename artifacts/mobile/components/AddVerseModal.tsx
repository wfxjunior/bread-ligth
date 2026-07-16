/**
 * AddVerseModal — lets a user add one of their favorited verses to a
 * devotional plan (curated or custom). Sourced from real bookmarks, no mock
 * data.
 */
import React from 'react';
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import type { Bookmark } from '@/context/BibleContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  onPick: (bookmark: Bookmark) => void;
}

export default function AddVerseModal({ visible, onClose, bookmarks, onPick }: Props) {
  const colors = useColors();
  const { t: tl } = useLanguage();

  const handlePick = (b: Bookmark) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onPick(b);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{tl('devotionals_add_verse_title')}</Text>
            <TouchableOpacity onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={tl('a11y_close')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {bookmarks.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{tl('devotionals_add_verse_empty')}</Text>
          ) : (
            <FlatList
              data={bookmarks}
              keyExtractor={(item) => `${item.bookId}-${item.chapter}-${item.verse}`}
              style={{ maxHeight: 340 }}
              contentContainerStyle={{ gap: 8 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handlePick(item)}
                  activeOpacity={0.8}
                  style={[styles.row, { borderColor: colors.border, borderRadius: colors.radius / 1.5 }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowRef, { color: colors.accent }]}>{item.englishBookName} {item.chapter}:{item.verse}</Text>
                    <Text style={[styles.rowText, { color: colors.foreground }]} numberOfLines={2}>{item.en}</Text>
                  </View>
                  <Feather name="plus-circle" size={18} color={colors.primary} />
                </TouchableOpacity>
              )}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: { width: '100%', maxWidth: 420, padding: 20, gap: 14 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, padding: 12 },
  rowRef: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 3 },
  rowText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
});

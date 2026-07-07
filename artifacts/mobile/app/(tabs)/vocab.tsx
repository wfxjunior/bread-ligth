import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useBible } from '@/context/BibleContext';
import FlashCard from '@/components/FlashCard';

type Filter = 'all' | 'learning' | 'mastered';

export default function VocabScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { vocabulary, toggleMastered, removeFromVocabulary } = useBible();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = vocabulary.filter(v => {
    if (filter === 'learning') return !v.mastered;
    if (filter === 'mastered') return v.mastered;
    return true;
  });

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: `Todas (${vocabulary.length})` },
    { key: 'learning', label: `Aprendendo (${vocabulary.filter(v => !v.mastered).length})` },
    { key: 'mastered', label: `Dominadas (${vocabulary.filter(v => v.mastered).length})` },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Vocabulário</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
          Palavras salvas durante a leitura
        </Text>
        {/* Filter tabs */}
        <View style={[styles.filterRow, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterBtn,
                filter === f.key && [styles.filterBtnActive, { backgroundColor: colors.card }],
                { borderRadius: colors.radius - 2 },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? colors.foreground : colors.mutedForeground },
                ]}
                numberOfLines={1}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="layers" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {vocabulary.length === 0 ? 'Nenhuma palavra ainda' : 'Nenhuma palavra nesta categoria'}
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            {vocabulary.length === 0
              ? 'Toque em palavras em inglês durante a leitura para salvar no vocabulário'
              : 'Altere o filtro para ver outras palavras'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.word}
          renderItem={({ item }) => (
            <FlashCard
              item={item}
              onMastered={() => toggleMastered(item.word)}
              onDelete={() => removeFromVocabulary(item.word)}
            />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: bottomPad + 20 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!filtered.length}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  filterBtnActive: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  filterText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
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
});

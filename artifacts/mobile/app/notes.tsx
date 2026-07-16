/**
 * Personal Notes — create/view/edit free-form study notes tied to a
 * verse/chapter reference. Distinct from the Today's Study "Reflect" journal
 * entry (a single fixed reflection on John 1); these are user-created,
 * multiple, and reusable across any passage. Backed by BibleContext/AsyncStorage.
 */
import React, { useState } from 'react';
import {
  Alert,
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
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useLanguage } from '@/context/LanguageContext';
import { useBible, type Note } from '@/context/BibleContext';
import NoteEditorModal from '@/components/NoteEditorModal';
import { fontSize as ts } from '@/constants/design';

function formatDate(ts: number, lang: 'pt' | 'en') {
  return new Date(ts).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function NoteCard({ note, onEdit, onDelete }: { note: Note; onEdit: () => void; onDelete: () => void }) {
  const colors = useColors();
  const { lang } = useLanguage();
  return (
    <TouchableOpacity
      onPress={onEdit}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.refBadge, { backgroundColor: colors.accent + '20' }]}>
          <Feather name="edit-3" size={11} color={colors.accent} />
          <Text style={[styles.refText, { color: colors.accent }]}>{note.reference}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="trash-2" size={15} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
      {note.text ? (
        <Text style={[styles.noteText, { color: colors.foreground }]} numberOfLines={4}>{note.text}</Text>
      ) : null}
      <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{formatDate(note.updatedAt, lang)}</Text>
    </TouchableOpacity>
  );
}

export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t: tl } = useLanguage();
  const { notes, addNote, updateNote, removeNote } = useBible();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  const openNew = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setEditing(null);
    setEditorVisible(true);
  };

  const openEdit = (note: Note) => {
    setEditing(note);
    setEditorVisible(true);
  };

  const handleSave = (reference: string, text: string) => {
    if (editing) {
      updateNote(editing.id, { reference, text });
    } else {
      addNote({ reference, text });
    }
    setEditorVisible(false);
  };

  const handleDelete = (note: Note) => {
    Alert.alert(
      tl('notes_delete_confirm_title'),
      tl('notes_delete_confirm_body'),
      [
        { text: tl('notes_cancel'), style: 'cancel' },
        { text: tl('notes_delete_confirm_action'), style: 'destructive', onPress: () => removeNote(note.id) },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={styles.backBtn}>
          <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{tl('notes_title')}</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>{tl('notes_subtitle')}</Text>
        </View>
        <TouchableOpacity
          onPress={openNew}
          activeOpacity={0.85}
          style={[styles.newBtn, { backgroundColor: colors.primary, borderRadius: colors.radius / 1.5 }]}
        >
          <Feather name="plus" size={14} color={colors.primaryForeground} />
          <Text style={[styles.newBtnText, { color: colors.primaryForeground }]}>{tl('notes_new_button')}</Text>
        </TouchableOpacity>
      </View>

      {notes.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="edit-3" size={44} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{tl('notes_empty_title')}</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>{tl('notes_empty_sub')}</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NoteCard note={item} onEdit={() => openEdit(item)} onDelete={() => handleDelete(item)} />
          )}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: bottomPad + 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <NoteEditorModal
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        onSave={handleSave}
        initial={editing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 2, marginBottom: 3 },
  headerTitle: { fontSize: ts.heading, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  headerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 1 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  newBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  emptySub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },

  card: { padding: 14, borderWidth: 1, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  refBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  refText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  noteText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  dateText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});

/**
 * NoteEditorModal — create/edit a personal study note tied to a free-text
 * reference (e.g. "John 1:1"). Distinct from the Today's Study "Reflect"
 * journal entry, which is a single fixed reflection on John 1.
 */
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import type { Note } from '@/context/BibleContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (reference: string, text: string) => void;
  initial?: Note | null;
  presetReference?: string;
}

export default function NoteEditorModal({ visible, onClose, onSave, initial, presetReference }: Props) {
  const colors = useColors();
  const { t: tl } = useLanguage();
  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (visible) {
      setReference(initial?.reference ?? presetReference ?? '');
      setText(initial?.text ?? '');
      setError(false);
    }
  }, [visible, initial, presetReference]);

  const handleSave = () => {
    if (!reference.trim()) { setError(true); return; }
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onSave(reference.trim(), text.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', alignItems: 'center' }}>
          <Pressable onPress={() => {}} style={[styles.sheet, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                {initial ? tl('notes_editor_title_edit') : tl('notes_editor_title_new')}
              </Text>
              <TouchableOpacity onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={tl('a11y_close')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <TextInput
              value={reference}
              onChangeText={(v) => { setReference(v); if (v.trim()) setError(false); }}
              placeholder={tl('notes_reference_placeholder')}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground, borderColor: error ? colors.destructive : colors.border, backgroundColor: colors.background, borderRadius: colors.radius / 1.5 }]}
            />
            {error && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>{tl('notes_reference_required')}</Text>
            )}

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={tl('notes_text_placeholder')}
              placeholderTextColor={colors.mutedForeground}
              multiline
              style={[styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background, borderRadius: colors.radius / 1.5 }]}
            />

            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius / 1.5 }]}
            >
              <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>{tl('notes_save_button')}</Text>
            </TouchableOpacity>
          </Pressable>
        </KeyboardAvoidingView>
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
  sheet: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    gap: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  errorText: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: -6 },
  textArea: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    minHeight: 110,
    textAlignVertical: 'top',
  },
  saveBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

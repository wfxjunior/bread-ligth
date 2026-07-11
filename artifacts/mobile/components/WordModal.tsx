import React from 'react';
import {
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
import { WORD_DICTIONARY } from '@/constants/wordDictionary';
import { type VocabWord, useBible } from '@/context/BibleContext';
import { AudioPlayButton } from './AudioPlayButton';

interface WordModalProps {
  visible: boolean;
  word: string;
  context: string;
  onClose: () => void;
}

export default function WordModal({ visible, word, context, onClose }: WordModalProps) {
  const colors = useColors();
  const { addToVocabulary, vocabulary } = useBible();
  const entry = WORD_DICTIONARY[word] ?? WORD_DICTIONARY[word.toLowerCase()];
  const alreadySaved = vocabulary.some(v => v.word === word);

  const handleSave = () => {
    if (alreadySaved) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const vocabWord: VocabWord = {
      word,
      translation: entry ? entry.pt : '(desconhecido)',
      pronunciation: entry ? entry.pronunciation : '',
      context,
      mastered: false,
      addedAt: Date.now(),
    };
    addToVocabulary(vocabWord);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View>
              <View style={styles.wordRow}>
                <Text style={[styles.word, { color: colors.englishText }]}>{word}</Text>
                <AudioPlayButton text={word} id={`vocab:${word}`} size={18} style={styles.wordListenBtn} />
              </View>
              {entry && (
                <Text style={[styles.pronunciation, { color: colors.mutedForeground }]}>
                  /{entry.pronunciation}/
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {entry ? (
            <>
              <View style={[styles.translationBox, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.translationLabel, { color: colors.mutedForeground }]}>
                  Tradução em Português
                </Text>
                <Text style={[styles.translation, { color: colors.portugueseText }]}>
                  {entry.pt}
                </Text>
                {entry.example && (
                  <Text style={[styles.example, { color: colors.mutedForeground }]}>
                    Ex: "{entry.example}"
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: alreadySaved ? colors.muted : colors.primary,
                    borderRadius: colors.radius,
                  },
                ]}
                onPress={handleSave}
                disabled={alreadySaved}
                activeOpacity={0.85}
              >
                <Feather
                  name={alreadySaved ? 'check' : 'plus'}
                  size={18}
                  color={alreadySaved ? colors.mutedForeground : colors.primaryForeground}
                />
                <Text
                  style={[
                    styles.saveBtnText,
                    { color: alreadySaved ? colors.mutedForeground : colors.primaryForeground },
                  ]}
                >
                  {alreadySaved ? 'Já salvo no vocabulário' : 'Salvar no vocabulário'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={[styles.translationBox, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.notFound, { color: colors.mutedForeground }]}>
                Palavra não encontrada no dicionário.
              </Text>
            </View>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordListenBtn: {
    marginTop: 2,
  },
  word: {
    fontSize: 28,
    fontWeight: '700' as const,
    fontFamily: 'Inter_700Bold',
    textTransform: 'capitalize',
  },
  pronunciation: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  translationBox: {
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  translationLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  translation: {
    fontSize: 22,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
  example: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    marginTop: 4,
  },
  notFound: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingVertical: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    fontFamily: 'Inter_600SemiBold',
  },
});

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { WORD_DICTIONARY, type WordEntry } from '@/constants/wordDictionary';
import { type VocabWord, useBible } from '@/context/BibleContext';
import { AudioPlayButton } from './AudioPlayButton';

// Any word the static dictionary is missing is translated on demand by the API
// and cached on-device forever, so word lookup covers 100% of the Bible's
// vocabulary. Falls back gracefully to a "no connection" message when offline.
const _domain  = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = _domain ? `https://${_domain}/api` : null;
const wordCacheKey = (lang: string, word: string) =>
  `@breadlight:worddef:${lang}:${word.toLowerCase()}`;

interface WordModalProps {
  visible: boolean;
  word: string;
  context: string;
  onClose: () => void;
}

export default function WordModal({ visible, word, context, onClose }: WordModalProps) {
  const colors = useColors();
  const { t, lang } = useLanguage();
  const { addToVocabulary, vocabulary } = useBible();

  const staticEntry = WORD_DICTIONARY[word] ?? WORD_DICTIONARY[word.toLowerCase()];

  // Fallback resolution for words the static dictionary doesn't cover.
  const [resolved, setResolved] = useState<WordEntry | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    if (!visible || !word || staticEntry) return;
    let cancelled = false;
    setResolved(null);
    setStatus('loading');

    (async () => {
      const cacheKey = wordCacheKey(lang, word);
      try {
        const cachedRaw = await AsyncStorage.getItem(cacheKey);
        if (cachedRaw) {
          if (!cancelled) { setResolved(JSON.parse(cachedRaw) as WordEntry); setStatus('idle'); }
          return;
        }
      } catch {
        // ignore cache read errors — fall through to network
      }

      if (!API_BASE) { if (!cancelled) setStatus('error'); return; }

      try {
        const params = new URLSearchParams({ en: word, context, lang });
        const res = await fetch(`${API_BASE}/word?${params}`);
        if (!res.ok) throw new Error(`word fetch ${res.status}`);
        const data = (await res.json()) as WordEntry;
        if (!data?.pt) throw new Error('empty definition');
        const entry: WordEntry = {
          pt: data.pt,
          pronunciation: data.pronunciation ?? '',
          example: data.example,
        };
        await AsyncStorage.setItem(cacheKey, JSON.stringify(entry)).catch(() => {});
        if (!cancelled) { setResolved(entry); setStatus('idle'); }
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [visible, word, context, lang, staticEntry]);

  const entry = staticEntry ?? resolved;
  const isAiEntry = !staticEntry && !!resolved;
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
      <Pressable style={styles.backdrop} onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('a11y_close')}>
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
            <TouchableOpacity onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('a11y_close')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {entry ? (
            <>
              <View style={[styles.translationBox, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.translationLabel, { color: colors.mutedForeground }]}>
                  {t('word_modal_translation_label')}
                </Text>
                <Text style={[styles.translation, { color: colors.portugueseText }]}>
                  {entry.pt}
                </Text>
                {entry.example && (
                  <Text style={[styles.example, { color: colors.mutedForeground }]}>
                    {t('word_modal_example_prefix')} "{entry.example}"
                  </Text>
                )}
                {isAiEntry && (
                  <View style={styles.aiNoteRow}>
                    <Feather name="zap" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.aiNote, { color: colors.mutedForeground }]}>
                      {t('word_modal_ai_note')}
                    </Text>
                  </View>
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
                  {alreadySaved ? t('word_modal_already_saved') : t('word_modal_save')}
                </Text>
              </TouchableOpacity>
            </>
          ) : status === 'loading' ? (
            <View style={[styles.translationBox, styles.stateRow, { backgroundColor: colors.secondary }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.notFound, { color: colors.mutedForeground }]}>
                {t('word_modal_loading')}
              </Text>
            </View>
          ) : (
            <View style={[styles.translationBox, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.notFound, { color: colors.mutedForeground }]}>
                {t(API_BASE ? 'word_modal_offline' : 'word_modal_not_found')}
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
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  aiNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  aiNote: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
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

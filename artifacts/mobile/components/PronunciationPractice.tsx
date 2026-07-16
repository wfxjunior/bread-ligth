import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/constants/i18n';
import { evaluatePronunciation, type PronunciationResult } from '@/utils/pronunciationFeedback';

const _domain  = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = _domain ? `https://${_domain}/api` : null;

type Stage = 'idle' | 'recording' | 'transcribing' | 'result' | 'error' | 'unsupported';

interface PronunciationPracticeProps {
  visible: boolean;
  verseText: string;
  verseRef?: string;
  onClose: () => void;
}

export default function PronunciationPractice({ visible, verseText, verseRef, onClose }: PronunciationPracticeProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lang } = useLanguage();

  const [stage, setStage]   = useState<Stage>('idle');
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const startedAtRef  = useRef(0);

  // Restores the shared audio session to playback mode. Recording switches
  // the session into `allowsRecordingIOS: true`, which — if never reverted —
  // leaves iOS routing/ducking audio incorrectly for anything played
  // afterward (e.g. the devotional/verse "Listen" player looks like it's
  // playing but produces no sound). Always call this once recording ends,
  // however it ends.
  const restorePlaybackAudioMode = useCallback(() => {
    Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (visible) {
      setStage('idle');
      setResult(null);
      setErrorMsg('');
    } else {
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
      restorePlaybackAudioMode();
    }
  }, [visible, restorePlaybackAudioMode]);

  const startRecording = useCallback(async () => {
    if (!API_BASE) {
      setStage('unsupported');
      return;
    }
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        setErrorMsg(t(lang, 'practice_mic_denied'));
        setStage('error');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      startedAtRef.current = Date.now();
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStage('recording');
    } catch {
      restorePlaybackAudioMode();
      setErrorMsg(t(lang, 'practice_error'));
      setStage('error');
    }
  }, [lang, restorePlaybackAudioMode]);

  const stopAndEvaluate = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setStage('transcribing');
    const durationMs = Date.now() - startedAtRef.current;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      restorePlaybackAudioMode();
      if (!uri || !API_BASE) throw new Error('no-uri');

      const fileRes = await fetch(uri);
      const blob    = await fileRes.blob();

      const res = await fetch(`${API_BASE}/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'audio/m4a' },
        body: blob,
      });
      const data = await res.json() as { text?: string; error?: string; unsupported?: boolean };

      if (data.unsupported) {
        setStage('unsupported');
        return;
      }
      if (!res.ok || typeof data.text !== 'string') {
        throw new Error(data.error ?? 'transcribe-failed');
      }

      setResult(evaluatePronunciation(verseText, data.text, durationMs));
      setStage('result');
    } catch {
      restorePlaybackAudioMode();
      setErrorMsg(t(lang, 'practice_error'));
      setStage('error');
    }
  }, [verseText, lang, restorePlaybackAudioMode]);

  const tierLabel = (tier: 'great' | 'good' | 'keep_practicing', kind: 'clarity' | 'rhythm') => {
    const key = `practice_${kind}_${tier}` as const;
    return t(lang, key as any);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 24 }]}
          onPress={e => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.foreground }]}>{t(lang, 'practice_title')}</Text>
              {!!verseRef && <Text style={[styles.ref, { color: colors.mutedForeground }]}>{verseRef}</Text>}
            </View>
            <TouchableOpacity onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t(lang, 'a11y_close')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.verseBox, { backgroundColor: colors.muted }]}>
            <Text style={[styles.verseText, { color: colors.englishText }]}>{verseText}</Text>
          </View>

          {stage === 'idle' && (
            <>
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>{t(lang, 'practice_hint')}</Text>
              <TouchableOpacity
                onPress={startRecording}
                style={[styles.micBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
              >
                <Feather name="mic" size={20} color={colors.primaryForeground} />
                <Text style={[styles.micBtnText, { color: colors.primaryForeground }]}>{t(lang, 'practice_start')}</Text>
              </TouchableOpacity>
            </>
          )}

          {stage === 'recording' && (
            <>
              <View style={styles.recordingRow}>
                <View style={[styles.recDot, { backgroundColor: colors.destructive }]} />
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>{t(lang, 'practice_recording')}</Text>
              </View>
              <TouchableOpacity
                onPress={stopAndEvaluate}
                style={[styles.micBtn, { backgroundColor: colors.destructive }]}
                activeOpacity={0.85}
              >
                <Feather name="square" size={18} color="#FFFFFF" />
                <Text style={[styles.micBtnText, { color: '#FFFFFF' }]}>{t(lang, 'practice_stop')}</Text>
              </TouchableOpacity>
            </>
          )}

          {stage === 'transcribing' && (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>{t(lang, 'practice_transcribing')}</Text>
            </View>
          )}

          {stage === 'unsupported' && (
            <View style={styles.center}>
              <Feather name="mic-off" size={28} color={colors.mutedForeground} />
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>{t(lang, 'practice_unsupported')}</Text>
            </View>
          )}

          {stage === 'error' && (
            <View style={styles.center}>
              <Feather name="alert-circle" size={28} color={colors.mutedForeground} />
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>{errorMsg}</Text>
              <TouchableOpacity onPress={() => setStage('idle')} style={[styles.retryBtn, { borderColor: colors.border }]}>
                <Text style={[styles.retryText, { color: colors.foreground }]}>{t(lang, 'practice_try_again')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {stage === 'result' && result && (
            <View style={{ gap: 14 }}>
              <View style={styles.wordsWrap}>
                {result.words.map((w, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.wordChip,
                      {
                        color: w.recognized ? colors.accentForeground : colors.mutedForeground,
                        backgroundColor: w.recognized ? colors.accent + '20' : colors.muted,
                      },
                    ]}
                  >
                    {w.word}
                  </Text>
                ))}
              </View>

              <View style={[styles.feedbackCard, { backgroundColor: colors.muted }]}>
                <Feather name="smile" size={16} color={colors.accent} />
                <Text style={[styles.feedbackText, { color: colors.foreground }]}>{tierLabel(result.clarityTier, 'clarity')}</Text>
              </View>
              <View style={[styles.feedbackCard, { backgroundColor: colors.muted }]}>
                <Feather name="activity" size={16} color={colors.accent} />
                <Text style={[styles.feedbackText, { color: colors.foreground }]}>{tierLabel(result.rhythmTier, 'rhythm')}</Text>
              </View>

              <TouchableOpacity onPress={() => setStage('idle')} style={[styles.retryBtn, { borderColor: colors.border }]}>
                <Feather name="rotate-ccw" size={14} color={colors.foreground} />
                <Text style={[styles.retryText, { color: colors.foreground }]}>{t(lang, 'practice_try_again')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    padding: 20, gap: 14,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 2 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  ref: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  verseBox: { borderRadius: 12, padding: 14 },
  verseText: { fontSize: 15, fontFamily: 'Lora_400Regular', lineHeight: 24 },
  hint: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  micBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  micBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  recordingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  recDot: { width: 8, height: 8, borderRadius: 4 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingVertical: 11,
  },
  retryText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  wordsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  wordChip: {
    fontSize: 13, fontFamily: 'Inter_500Medium',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden',
  },
  feedbackCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, padding: 12,
  },
  feedbackText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 19 },
});

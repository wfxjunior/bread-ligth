import { useCallback, useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { Audio }   from 'expo-av';

const _domain  = process.env.EXPO_PUBLIC_DOMAIN;
const TTS_BASE = _domain ? `https://${_domain}/api/tts` : null;

/**
 * useTTS — Text-to-speech hook.
 *
 * Primary:  OpenAI TTS (nova voice) via API server — high-quality English.
 * Fallback: expo-speech (device TTS) — works offline.
 *
 * Usage:
 *   const { speak, stop, isSpeaking } = useTTS();
 *   speak('In the beginning was the Word');  // toggles stop if already playing
 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const stop = useCallback(async () => {
    Speech.stop();
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch { /* ignore */ }
      soundRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    // Tap again = stop
    if (isSpeaking) {
      await stop();
      return;
    }

    setIsSpeaking(true);

    // ── Primary: OpenAI TTS ──────────────────────────────────────────────────
    if (TTS_BASE) {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const uri = `${TTS_BASE}?text=${encodeURIComponent(text)}`;
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
        );
        soundRef.current = sound;

        sound.setOnPlaybackStatusUpdate(status => {
          if (!status.isLoaded) return;
          if (status.didJustFinish || (status as any).error) {
            sound.unloadAsync().catch(() => {});
            soundRef.current = null;
            setIsSpeaking(false);
          }
        });
        return; // success — wait for callback
      } catch {
        // network/server error → fall through to expo-speech
        soundRef.current = null;
      }
    }

    // ── Fallback: expo-speech (device TTS) ───────────────────────────────────
    Speech.speak(text, {
      language: 'en-US',
      rate: 0.85,
      pitch: 1.0,
      onDone:  () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  }, [isSpeaking, stop]);

  return { speak, stop, isSpeaking };
}

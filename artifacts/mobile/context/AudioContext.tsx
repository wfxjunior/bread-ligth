import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const _domain  = process.env.EXPO_PUBLIC_DOMAIN;
const TTS_BASE = _domain ? `https://${_domain}/api/tts` : null;

const RATE_KEY  = '@bibliaeN:audioRate';
const VOICE_KEY = '@bibliaeN:audioVoice';
const READING_LANG_KEY = '@bibliaeN:readingLanguage';
export const MIN_RATE = 0.5;
export const MAX_RATE = 2.0;
export const DEFAULT_RATE = 1.0;

export type AudioVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
export const AUDIO_VOICES: AudioVoice[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
export const DEFAULT_VOICE: AudioVoice = 'nova';

// Which language's text gets sent to TTS/playback. Screens hold both `en`
// and `pt` copies of verse/devotional text already — this just picks which
// one is read aloud. Independent from `voice` (the speaker timbre).
export type ReadingLanguage = 'en' | 'pt';
export const DEFAULT_READING_LANGUAGE: ReadingLanguage = 'en';

export interface AudioQueueItem {
  id: string;
  text: string;
}

// Strips markdown/formatting artifacts a devotional or verse string might
// carry (bold/italic markers, headings, stray asterisks) so text-to-speech
// only ever reads spoken words — never punctuation meant for visual styling.
function sanitizeForSpeech(text: string): string {
  return text
    .replace(/[*_`#]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused';

interface AudioContextValue {
  queue: AudioQueueItem[];
  queueKey: string | null;
  currentIndex: number;
  currentItem: AudioQueueItem | null;
  status: PlaybackStatus;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  rate: number;
  hasNext: boolean;
  hasPrevious: boolean;
  usingFallback: boolean;
  voice: AudioVoice;
  readingLanguage: ReadingLanguage;
  playQueue: (items: AudioQueueItem[], startIndex?: number, queueKey?: string) => void;
  playSingle: (text: string, id?: string) => void;
  togglePlayPause: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seekToRatio: (ratio: number) => void;
  setRate: (rate: number) => void;
  setVoice: (voice: AudioVoice) => void;
  setReadingLanguage: (lang: ReadingLanguage) => void;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

/**
 * AudioProvider — single, app-wide audio engine (Unified Voice Experience).
 *
 * Primary: OpenAI TTS (server-cached) streamed as an expo-av Sound.
 * Fallback: expo-speech (device TTS), used automatically when the network/
 * server TTS is unavailable.
 *
 * Exactly one AudioProvider should wrap the app so only one source of audio
 * ever plays: starting a new queue anywhere replaces whatever was playing.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue]             = useState<AudioQueueItem[]>([]);
  const [queueKey, setQueueKey]       = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [status, setStatus]           = useState<PlaybackStatus>('idle');
  const [position, setPosition]       = useState(0);
  const [duration, setDuration]       = useState(0);
  const [rate, setRateState]          = useState(DEFAULT_RATE);
  const [voice, setVoiceState]        = useState<AudioVoice>(DEFAULT_VOICE);
  const [readingLanguage, setReadingLanguageState] = useState<ReadingLanguage>(DEFAULT_READING_LANGUAGE);
  const [usingFallback, setUsingFallback] = useState(false);

  const soundRef      = useRef<Audio.Sound | null>(null);
  const queueRef       = useRef<AudioQueueItem[]>([]);
  const indexRef        = useRef(-1);
  const rateRef          = useRef(DEFAULT_RATE);
  const voiceRef          = useRef<AudioVoice>(DEFAULT_VOICE);
  const generationRef     = useRef(0);
  const rateSaveTimer      = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks a pause requested while the current item's audio is still being
  // fetched/loaded (status 'loading') — createAsync's shouldPlay:true would
  // otherwise start playback regardless of the pause tap that raced it.
  const pausePendingRef    = useRef(false);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { voiceRef.current = voice; }, [voice]);

  useEffect(() => {
    AsyncStorage.getItem(RATE_KEY)
      .then(v => {
        const n = v ? parseFloat(v) : NaN;
        if (!isNaN(n) && n >= MIN_RATE && n <= MAX_RATE) setRateState(n);
      })
      .catch(() => {});

    AsyncStorage.getItem(VOICE_KEY)
      .then(v => { if (v && (AUDIO_VOICES as string[]).includes(v)) setVoiceState(v as AudioVoice); })
      .catch(() => {});

    AsyncStorage.getItem(READING_LANG_KEY)
      .then(v => { if (v === 'en' || v === 'pt') setReadingLanguageState(v); })
      .catch(() => {});

    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
    }).catch(() => {});

    return () => {
      Speech.stop();
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const cleanupSound = useCallback(async () => {
    if (soundRef.current) {
      const s = soundRef.current;
      soundRef.current = null;
      try {
        s.setOnPlaybackStatusUpdate(null);
        await s.stopAsync();
        await s.unloadAsync();
      } catch { /* ignore */ }
    }
  }, []);

  const stop = useCallback(async () => {
    generationRef.current++;
    pausePendingRef.current = false;
    Speech.stop();
    await cleanupSound();
    setStatus('idle');
    setPosition(0);
    setDuration(0);
    setCurrentIndex(-1);
    setQueue([]);
    setQueueKey(null);
  }, [cleanupSound]);

  const speakFallback = useCallback((item: AudioQueueItem, gen: number, onEnd: () => void) => {
    setUsingFallback(true);
    setStatus('playing');
    const spokenRate = Math.max(0.1, Math.min(2.0, 0.85 * rateRef.current));
    Speech.speak(sanitizeForSpeech(item.text), {
      language: 'en-US',
      rate: spokenRate,
      pitch: 1.0,
      onDone:  () => { if (generationRef.current === gen) onEnd(); },
      onError: () => { if (generationRef.current === gen) onEnd(); },
    });
  }, []);

  const loadAndPlay = useCallback(async (index: number) => {
    const items = queueRef.current;
    const item  = items[index];
    if (!item) return;

    generationRef.current++;
    const gen = generationRef.current;
    // Note: pausePendingRef is intentionally NOT reset here. Internal calls
    // from `advance()` (moving to the next queue item after one finishes)
    // must preserve a pause the user requested moments earlier — otherwise
    // a pause tap that races a fast/short track's natural completion would
    // get silently dropped. Explicit "play" entry points (playQueue, resume,
    // next, previous, and togglePlayPause's idle branch) reset it instead.
    await cleanupSound();
    Speech.stop();
    setCurrentIndex(index);
    setStatus('loading');
    setPosition(0);
    setDuration(0);

    const advance = () => {
      if (generationRef.current !== gen) return;
      const nextIdx = indexRef.current + 1;
      if (nextIdx < queueRef.current.length) {
        loadAndPlay(nextIdx);
      } else {
        setStatus('idle');
        setPosition(0);
      }
    };

    if (TTS_BASE) {
      try {
        // Defensively reset the shared audio session before every playback.
        // If Pronunciation Practice (or anything else) left the session in
        // recording mode (allowsRecordingIOS: true), iOS can accept the sound
        // load and report "playing" while producing no audible output.
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        }).catch(() => {});

        const cleanText = sanitizeForSpeech(item.text);
        const uri = `${TTS_BASE}?text=${encodeURIComponent(cleanText)}&voice=${voiceRef.current}`;
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true, rate: rateRef.current, shouldCorrectPitch: true, progressUpdateIntervalMillis: 150 },
        );
        if (generationRef.current !== gen) {
          await sound.unloadAsync().catch(() => {});
          return;
        }
        setUsingFallback(false);
        soundRef.current = sound;
        if (pausePendingRef.current) {
          // A pause was requested while this track was still loading —
          // createAsync's shouldPlay:true already started it, so stop it now.
          await sound.pauseAsync().catch(() => {});
          setStatus('paused');
        }
        sound.setOnPlaybackStatusUpdate(st => {
          if (!st.isLoaded || generationRef.current !== gen) return;
          setPosition(st.positionMillis ?? 0);
          setDuration(st.durationMillis ?? 0);
          if (st.didJustFinish) {
            setStatus('idle');
            advance();
          } else if (!pausePendingRef.current) {
            setStatus(st.isPlaying ? 'playing' : 'paused');
          }
        });
        return;
      } catch {
        soundRef.current = null;
      }
    }

    speakFallback(item, gen, advance);
  }, [cleanupSound, speakFallback]);

  const playQueue = useCallback((items: AudioQueueItem[], startIndex = 0, key?: string) => {
    if (!items.length) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    pausePendingRef.current = false;
    queueRef.current = items;
    setQueue(items);
    setQueueKey(key ?? null);
    loadAndPlay(Math.max(0, Math.min(startIndex, items.length - 1)));
  }, [loadAndPlay]);

  const playSingle = useCallback((text: string, id?: string) => {
    playQueue([{ id: id ?? text, text }], 0, id ? `single:${id}` : undefined);
  }, [playQueue]);

  const pause = useCallback(async () => {
    // Covers the still-loading case too: the in-flight createAsync call
    // will check this flag and pause itself the moment it resolves.
    pausePendingRef.current = true;
    if (usingFallback) {
      // expo-speech pause support varies by platform; degrade gracefully.
      if (typeof Speech.pause === 'function') Speech.pause();
      setStatus('paused');
      return;
    }
    try { await soundRef.current?.pauseAsync(); } catch { /* ignore */ }
    setStatus('paused');
  }, [usingFallback]);

  const resume = useCallback(async () => {
    pausePendingRef.current = false;
    if (usingFallback) {
      if (typeof Speech.resume === 'function') Speech.resume();
      setStatus('playing');
      return;
    }
    try { await soundRef.current?.playAsync(); } catch { /* ignore */ }
    setStatus('playing');
  }, [usingFallback]);

  const togglePlayPause = useCallback(() => {
    if (status === 'playing' || status === 'loading') pause();
    else if (status === 'paused') resume();
    else if (currentIndex >= 0) {
      pausePendingRef.current = false;
      loadAndPlay(currentIndex);
    }
  }, [status, pause, resume, currentIndex, loadAndPlay]);

  const next = useCallback(() => {
    const nextIdx = indexRef.current + 1;
    if (nextIdx < queueRef.current.length) {
      pausePendingRef.current = false;
      loadAndPlay(nextIdx);
    }
  }, [loadAndPlay]);

  const previous = useCallback(() => {
    const prevIdx = indexRef.current - 1;
    pausePendingRef.current = false;
    loadAndPlay(prevIdx >= 0 ? prevIdx : indexRef.current);
  }, [loadAndPlay]);

  const seekToRatio = useCallback(async (ratio: number) => {
    if (usingFallback || !soundRef.current || !duration) return;
    const target = Math.max(0, Math.min(1, ratio)) * duration;
    try { await soundRef.current.setPositionAsync(target); } catch { /* ignore */ }
  }, [usingFallback, duration]);

  const setRate = useCallback((r: number) => {
    const clamped = Math.max(MIN_RATE, Math.min(MAX_RATE, r));
    setRateState(clamped);
    rateRef.current = clamped;
    if (soundRef.current && !usingFallback) {
      soundRef.current.setRateAsync(clamped, true).catch(() => {});
    }
    if (rateSaveTimer.current) clearTimeout(rateSaveTimer.current);
    rateSaveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(RATE_KEY, String(clamped)).catch(() => {});
    }, 400);
  }, [usingFallback]);

  const setVoice = useCallback((v: AudioVoice) => {
    setVoiceState(v);
    voiceRef.current = v;
    AsyncStorage.setItem(VOICE_KEY, v).catch(() => {});
  }, []);

  const setReadingLanguage = useCallback((lang: ReadingLanguage) => {
    setReadingLanguageState(lang);
    AsyncStorage.setItem(READING_LANG_KEY, lang).catch(() => {});
  }, []);

  const currentItem = currentIndex >= 0 ? queue[currentIndex] ?? null : null;

  const value: AudioContextValue = {
    queue, queueKey, currentIndex, currentItem,
    status,
    isPlaying: status === 'playing',
    isPaused:  status === 'paused',
    isLoading: status === 'loading',
    position, duration, rate, voice,
    hasNext:     currentIndex >= 0 && currentIndex < queue.length - 1,
    hasPrevious: currentIndex > 0,
    usingFallback,
    readingLanguage,
    playQueue, playSingle, togglePlayPause, pause, resume, stop, next, previous, seekToRatio, setRate, setVoice, setReadingLanguage,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider');
  return ctx;
}

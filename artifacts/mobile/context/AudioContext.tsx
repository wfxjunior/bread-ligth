import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';

const _domain  = process.env.EXPO_PUBLIC_DOMAIN;
const TTS_BASE = _domain ? `https://${_domain}/api/tts` : null;

const RATE_KEY  = '@bibliaeN:audioRate';
const VOICE_KEY = '@bibliaeN:audioVoice';
const READING_LANG_KEY = '@bibliaeN:readingLanguage';

// ── On-device TTS audio cache ────────────────────────────────────────────
// Bible reading is often done in low-connectivity moments (commuting,
// travel). This mirrors the server-side cache (routes/tts.ts) but persists
// to disk on the device itself, so previously-played verses/devotionals
// keep the premium OpenAI voice offline instead of degrading to the
// lower-quality expo-speech fallback.
const TTS_CACHE_DIR = `${FileSystem.cacheDirectory}tts-audio/`;
const TTS_CACHE_INDEX_KEY = '@bibliaeN:ttsCacheIndex';
const TTS_CACHE_CAP_KEY = '@bibliaeN:ttsCacheCapBytes';
const TTS_CACHE_EVICTION_KEY = '@bibliaeN:ttsCacheEvictionNotice';
const DEFAULT_TTS_CACHE_MAX_BYTES = 60 * 1024 * 1024; // 60 MB cap, LRU eviction beyond this

// Selectable cache size caps a user can pick from in Settings → Offline Audio.
// Kept small/simple since these are just device storage tradeoffs, not
// feature tiers — every option is available to every user.
export const TTS_CACHE_CAP_OPTIONS_MB = [30, 60, 120, 250] as const;

interface TtsCacheEntry {
  size: number;
  lastAccess: number;
}
type TtsCacheIndex = Record<string, TtsCacheEntry>;

// Persisted the moment LRU eviction actually removes something, so a user
// who was mid-listen (and never looked at Settings) still finds out later
// that older offline audio was silently cleared to make room for new clips.
// Accumulates until the user dismisses it in Settings.
interface TtsEvictionNotice {
  bytes: number;
  at: number;
}

async function loadEvictionNotice(): Promise<TtsEvictionNotice | null> {
  try {
    const raw = await AsyncStorage.getItem(TTS_CACHE_EVICTION_KEY);
    return raw ? (JSON.parse(raw) as TtsEvictionNotice) : null;
  } catch {
    return null;
  }
}

async function recordEvictionNotice(evictedBytes: number): Promise<TtsEvictionNotice> {
  const existing = await loadEvictionNotice();
  const notice: TtsEvictionNotice = {
    bytes: (existing?.bytes ?? 0) + evictedBytes,
    at: Date.now(),
  };
  await AsyncStorage.setItem(TTS_CACHE_EVICTION_KEY, JSON.stringify(notice)).catch(() => {});
  return notice;
}

async function clearEvictionNotice(): Promise<void> {
  await AsyncStorage.removeItem(TTS_CACHE_EVICTION_KEY).catch(() => {});
}

async function loadTtsCacheCap(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(TTS_CACHE_CAP_KEY);
    const n = raw ? parseInt(raw, 10) : NaN;
    return !isNaN(n) && n > 0 ? n : DEFAULT_TTS_CACHE_MAX_BYTES;
  } catch {
    return DEFAULT_TTS_CACHE_MAX_BYTES;
  }
}

let cacheDirReadyPromise: Promise<void> | null = null;
function ensureTtsCacheDir(): Promise<void> {
  if (!cacheDirReadyPromise) {
    cacheDirReadyPromise = FileSystem.makeDirectoryAsync(TTS_CACHE_DIR, { intermediates: true }).catch(() => {});
  }
  return cacheDirReadyPromise;
}

async function loadTtsCacheIndex(): Promise<TtsCacheIndex> {
  try {
    const raw = await AsyncStorage.getItem(TTS_CACHE_INDEX_KEY);
    return raw ? (JSON.parse(raw) as TtsCacheIndex) : {};
  } catch {
    return {};
  }
}

async function saveTtsCacheIndex(idx: TtsCacheIndex): Promise<void> {
  try { await AsyncStorage.setItem(TTS_CACHE_INDEX_KEY, JSON.stringify(idx)); } catch { /* ignore */ }
}

function ttsCacheKeyFor(voice: string, text: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${voice}::${text}`);
}

function ttsCachePathFor(key: string): string {
  return `${TTS_CACHE_DIR}${key}.mp3`;
}

// Sums the on-disk size recorded for every cached clip. Cheap: reads the
// AsyncStorage index only, never touches the filesystem.
async function getTtsCacheTotalBytes(): Promise<number> {
  const idx = await loadTtsCacheIndex();
  return Object.values(idx).reduce((sum, e) => sum + e.size, 0);
}

// Wipes every cached TTS clip on disk plus its AsyncStorage index, so the
// next play of any verse/devotional re-downloads (e.g. after switching
// voice) and the reclaimed space actually shows up to the user.
async function clearTtsCacheOnDisk(): Promise<void> {
  await FileSystem.deleteAsync(TTS_CACHE_DIR, { idempotent: true }).catch(() => {});
  cacheDirReadyPromise = null;
  await ensureTtsCacheDir();
  await AsyncStorage.removeItem(TTS_CACHE_INDEX_KEY).catch(() => {});
}

// Evicts the least-recently-used cached audio files until the index is back
// under the size cap. Runs after every new download (and whenever the cap is
// lowered); never blocks playback. Returns how many bytes were reclaimed so
// callers can surface a notice to the user instead of evicting silently.
async function evictTtsCacheIfNeeded(
  idx: TtsCacheIndex,
  maxBytes: number,
): Promise<{ idx: TtsCacheIndex; evictedBytes: number }> {
  let total = Object.values(idx).reduce((sum, e) => sum + e.size, 0);
  if (total <= maxBytes) return { idx, evictedBytes: 0 };

  const byOldest = Object.entries(idx).sort((a, b) => a[1].lastAccess - b[1].lastAccess);
  const next = { ...idx };
  let evictedBytes = 0;
  for (const [key, entry] of byOldest) {
    if (total <= maxBytes) break;
    delete next[key];
    total -= entry.size;
    evictedBytes += entry.size;
    await FileSystem.deleteAsync(ttsCachePathFor(key), { idempotent: true }).catch(() => {});
  }
  return { idx: next, evictedBytes };
}

// Returns a local file:// uri if this voice+text was already cached on
// device, or null on a cache miss (or if the disk entry vanished).
async function getCachedTtsUri(voice: string, text: string): Promise<string | null> {
  const key = await ttsCacheKeyFor(voice, text);
  const path = ttsCachePathFor(key);
  const info = await FileSystem.getInfoAsync(path).catch(() => null);
  if (!info?.exists) return null;

  const idx = await loadTtsCacheIndex();
  if (idx[key]) {
    idx[key] = { ...idx[key], lastAccess: Date.now() };
    saveTtsCacheIndex(idx).catch(() => {});
  }
  return path;
}

// Downloads the remote TTS stream straight to a cache file (avoids buffering
// the whole clip in memory) and records it in the index, evicting older
// entries if the cap is exceeded. Returns the local uri to play from.
async function downloadAndCacheTts(
  remoteUri: string,
  voice: string,
  text: string,
  maxBytes: number,
  onEvicted?: (bytes: number) => void,
): Promise<string> {
  await ensureTtsCacheDir();
  const key = await ttsCacheKeyFor(voice, text);
  const path = ttsCachePathFor(key);
  const result = await FileSystem.downloadAsync(remoteUri, path);
  if (result.status < 200 || result.status >= 300) {
    throw new Error(`TTS download failed with status ${result.status}`);
  }
  const info = await FileSystem.getInfoAsync(path).catch(() => null);
  const size = info?.exists ? (info.size ?? 0) : 0;

  let idx = await loadTtsCacheIndex();
  idx[key] = { size, lastAccess: Date.now() };
  const { idx: nextIdx, evictedBytes } = await evictTtsCacheIfNeeded(idx, maxBytes);
  await saveTtsCacheIndex(nextIdx);
  if (evictedBytes > 0) onEvicted?.(evictedBytes);
  return path;
}
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
  offlineCacheBytes: number;
  refreshOfflineCacheSize: () => Promise<void>;
  clearOfflineCache: () => Promise<void>;
  cacheMaxBytes: number;
  setCacheMaxBytes: (bytes: number) => void;
  evictionNotice: { bytes: number; at: number } | null;
  dismissEvictionNotice: () => void;
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
  const [offlineCacheBytes, setOfflineCacheBytes] = useState(0);
  const [cacheMaxBytes, setCacheMaxBytesState] = useState(DEFAULT_TTS_CACHE_MAX_BYTES);
  const [evictionNotice, setEvictionNotice] = useState<{ bytes: number; at: number } | null>(null);
  const cacheMaxBytesRef = useRef(DEFAULT_TTS_CACHE_MAX_BYTES);

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
  // Dedupes concurrent prefetch downloads for the same voice+text so rapid
  // track advances (or a slow prefetch overlapping the next one) never fire
  // two downloads for the same clip.
  const prefetchInFlightRef = useRef<Set<string>>(new Set());

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

    // staysActiveInBackground keeps chapter/book auto-advance going when the
    // app is backgrounded or the device is locked — the whole point of
    // hands-free continuous listening. Every other setAudioModeAsync call in
    // this file also repeats it, since the native mode is replaced wholesale
    // on each call, not merged with the previous one.
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      shouldDuckAndroid: true,
    }).catch(() => {});

    getTtsCacheTotalBytes().then(setOfflineCacheBytes).catch(() => {});
    loadTtsCacheCap().then(bytes => {
      cacheMaxBytesRef.current = bytes;
      setCacheMaxBytesState(bytes);
    }).catch(() => {});
    loadEvictionNotice().then(setEvictionNotice).catch(() => {});

    return () => {
      Speech.stop();
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  const refreshOfflineCacheSize = useCallback(async () => {
    const bytes = await getTtsCacheTotalBytes().catch(() => 0);
    setOfflineCacheBytes(bytes);
  }, []);

  const clearOfflineCache = useCallback(async () => {
    await clearTtsCacheOnDisk();
    setOfflineCacheBytes(0);
  }, []);

  // Called by downloadAndCacheTts whenever LRU eviction actually reclaims
  // space — persists the notice (so it survives an app restart) and updates
  // the in-memory total so the Settings screen reflects both immediately.
  const handleEviction = useCallback((evictedBytes: number) => {
    recordEvictionNotice(evictedBytes).then(setEvictionNotice).catch(() => {});
    getTtsCacheTotalBytes().then(setOfflineCacheBytes).catch(() => {});
  }, []);

  const dismissEvictionNotice = useCallback(() => {
    clearEvictionNotice().catch(() => {});
    setEvictionNotice(null);
  }, []);

  // Lets the user trade offline coverage for device storage. Shrinking the
  // cap evicts down to the new size immediately (surfacing a notice if
  // anything was actually removed); raising it just relaxes future eviction.
  const setCacheMaxBytes = useCallback((bytes: number) => {
    cacheMaxBytesRef.current = bytes;
    setCacheMaxBytesState(bytes);
    AsyncStorage.setItem(TTS_CACHE_CAP_KEY, String(bytes)).catch(() => {});

    (async () => {
      const idx = await loadTtsCacheIndex();
      const { idx: nextIdx, evictedBytes } = await evictTtsCacheIfNeeded(idx, bytes);
      if (evictedBytes > 0) {
        await saveTtsCacheIndex(nextIdx);
        handleEviction(evictedBytes);
      }
    })().catch(() => {});
  }, [handleEviction]);

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

  // Proactively downloads and caches the next 1-2 unplayed queue items while
  // the current one is playing, so a brief connectivity drop mid-chapter
  // never forces those verses onto the lower-quality expo-speech fallback.
  // Fire-and-forget from loadAndPlay: never awaited, never blocks or delays
  // current playback, and every failure (offline, server error) is swallowed
  // silently — loadAndPlay will simply fall back for that item if it's still
  // uncached when its turn comes.
  const prefetchQueueAhead = useCallback(async (fromIndex: number, gen: number) => {
    if (!TTS_BASE) return; // no server TTS configured — nothing to prefetch
    const activeVoice = voiceRef.current;
    for (let i = fromIndex + 1; i <= fromIndex + 2; i++) {
      if (generationRef.current !== gen) return; // playback moved on/stopped; abandon
      const item = queueRef.current[i];
      if (!item) break;

      const cleanText = sanitizeForSpeech(item.text);
      const key = await ttsCacheKeyFor(activeVoice, cleanText).catch(() => null);
      if (!key || prefetchInFlightRef.current.has(key)) continue;

      const cachedUri = await getCachedTtsUri(activeVoice, cleanText).catch(() => null);
      if (cachedUri) continue; // already cached, nothing to do

      if (generationRef.current !== gen) return;
      prefetchInFlightRef.current.add(key);
      try {
        const remoteUri = `${TTS_BASE}?text=${encodeURIComponent(cleanText)}&voice=${activeVoice}`;
        await downloadAndCacheTts(remoteUri, activeVoice, cleanText, cacheMaxBytesRef.current, handleEviction);
      } catch {
        // Offline or server error — skip silently, try again next time this
        // item is the lookahead target (e.g. after the user goes back online).
      } finally {
        prefetchInFlightRef.current.delete(key);
      }
    }
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

    const cleanText = sanitizeForSpeech(item.text);
    const activeVoice = voiceRef.current;

    // Cache-first: previously played text/voice pairs are stored on-device
    // (see downloadAndCacheTts above), so offline playback can reuse the
    // premium voice instead of degrading straight to expo-speech.
    const cachedUri = await getCachedTtsUri(activeVoice, cleanText).catch(() => null);
    if (generationRef.current !== gen) return;

    if (cachedUri) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        }).catch(() => {});
        const { sound } = await Audio.Sound.createAsync(
          { uri: cachedUri },
          { shouldPlay: true, rate: rateRef.current, shouldCorrectPitch: true, progressUpdateIntervalMillis: 150 },
        );
        if (generationRef.current !== gen) {
          await sound.unloadAsync().catch(() => {});
          return;
        }
        setUsingFallback(false);
        soundRef.current = sound;
        if (pausePendingRef.current) {
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
        prefetchQueueAhead(index, gen);
        return;
      } catch {
        soundRef.current = null;
        // Fall through to network fetch / fallback below.
      }
    }

    if (TTS_BASE) {
      try {
        // Defensively reset the shared audio session before every playback.
        // If Pronunciation Practice (or anything else) left the session in
        // recording mode (allowsRecordingIOS: true), iOS can accept the sound
        // load and report "playing" while producing no audible output.
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        }).catch(() => {});

        const remoteUri = `${TTS_BASE}?text=${encodeURIComponent(cleanText)}&voice=${activeVoice}`;
        let playUri = remoteUri;
        try {
          playUri = await downloadAndCacheTts(remoteUri, activeVoice, cleanText, cacheMaxBytesRef.current, handleEviction);
        } catch {
          // Network flaky mid-download — still try to stream directly so
          // the user isn't dropped straight to the fallback voice.
          playUri = remoteUri;
        }
        if (generationRef.current !== gen) return;

        const { sound } = await Audio.Sound.createAsync(
          { uri: playUri },
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
        prefetchQueueAhead(index, gen);
        return;
      } catch {
        soundRef.current = null;
      }
    }

    speakFallback(item, gen, advance);
  }, [cleanupSound, speakFallback, prefetchQueueAhead]);

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
    offlineCacheBytes, refreshOfflineCacheSize, clearOfflineCache,
    cacheMaxBytes, setCacheMaxBytes, evictionNotice, dismissEvictionNotice,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within an AudioProvider');
  return ctx;
}

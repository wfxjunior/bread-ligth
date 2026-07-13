import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  AppState,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/context/ThemeContext';
import { getColors } from '@/constants/colors';
import SpaceBackground from '@/components/SpaceBackground';
import { useAudio } from '@/context/AudioContext';
import { useLanguage } from '@/context/LanguageContext';
import { useBible } from '@/context/BibleContext';
import WordModal from '@/components/WordModal';
import AudioPlayer from '@/components/AudioPlayer';
import PronunciationPractice from '@/components/PronunciationPractice';
import { getEntryForDate, resolveVerse, todayKey } from '@/utils/dailyVerse';
import { t } from '@/constants/i18n';
import { APP_SHARE_URL } from '@/utils/shareLink';

// ── Palette — derived from the active Reading Atmosphere ──────────────────────
// This screen used to be a hardcoded, always-dark "immersive" design. It now
// reads the same atmosphere/colors as the rest of the app, so it stays
// immersive while adapting its ink, borders and gradient to whichever
// atmosphere (light or dark) the reader has chosen.
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full  = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const r = parseInt(full.substring(0, 2), 16) || 0;
  const g = parseInt(full.substring(2, 4), 16) || 0;
  const b = parseInt(full.substring(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}

function buildPalette(colors: ReturnType<typeof getColors>) {
  const fg = colors.foreground;
  return {
    bg1:        colors.background,
    bg2:        colors.surface,
    bg3:        colors.card,
    wine:       colors.primary,
    wineFaint:  hexToRgba(colors.primary, 0.12),
    wineBorder: hexToRgba(colors.primary, 0.28),
    white:      fg,
    whiteHi:    hexToRgba(fg, 0.90),
    whiteMid:   hexToRgba(fg, 0.55),
    whiteLow:   hexToRgba(fg, 0.35),
    whiteFaint: hexToRgba(fg, 0.07),
    border:     hexToRgba(fg, 0.10),
    overlayBg:  hexToRgba(colors.background, 0.96),
  };
}

// ── Local light/dark override for this screen ─────────────────────────────────
// A minimalist toggle scoped to the Daily Devotional screen only — it does
// NOT change the app-wide Reading Atmosphere (Settings). It reuses the same
// palette system, just pinned to two fixed atmospheres ('classic' for light,
// 'dark' for dark), while still respecting the user's chosen brand accent
// color. Persisted separately so it doesn't drift if the global Atmosphere
// changes later.
const DAILY_MODE_KEY = '@bibliaeN:dailyReadingMode';
type DailyMode = 'light' | 'dark';

const DailyColorsContext = createContext<ReturnType<typeof getColors> | null>(null);

function useDailyColors(): ReturnType<typeof getColors> {
  const ctx = useContext(DailyColorsContext);
  // Fallback keeps sub-components safe if ever rendered outside the provider.
  const fallback = useColors();
  return ctx ?? fallback;
}

// Weekday / month i18n keys — indexed by Date.getDay() / getMonth()
const WEEKDAY_KEYS = ['weekday_sun','weekday_mon','weekday_tue','weekday_wed','weekday_thu','weekday_fri','weekday_sat'] as const;
const MONTH_KEYS   = ['month_jan','month_feb','month_mar','month_apr','month_may','month_jun','month_jul','month_aug','month_sep','month_oct','month_nov','month_dec'] as const;

const _domain = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = _domain ? `https://${_domain}/api` : null;

// ── Tappable EN verse ─────────────────────────────────────────────────────────
function TappableVerse({ text, onWordPress }: {
  text: string;
  onWordPress: (word: string, ctx: string) => void;
}) {
  const colors = useDailyColors();
  const D = buildPalette(colors);
  const words = text.split(/(\s+)/);
  return (
    <Text style={[styles.verseEnWrap, { color: D.white }]}>
      {words.map((token, i) => {
        if (/^\s+$/.test(token)) return <Text key={i} style={{ color: D.white }}>{token}</Text>;
        const clean = token.replace(/[^a-zA-Z'-]/g, '');
        return (
          <Text
            key={i}
            onPress={() => clean.length > 1 && onWordPress(clean.toLowerCase(), text)}
            style={[styles.verseWord, { color: D.white, textDecorationColor: D.border }]}
            suppressHighlighting
          >
            {token}
          </Text>
        );
      })}
    </Text>
  );
}

// ── Devotional bottom-sheet modal ─────────────────────────────────────────────
// Splits devotional prose into sentence-level chunks for continuous playback + highlighting.
function splitIntoParagraphs(text: string): string[] {
  const parts = text.match(/[^.!?]+[.!?]+(\s+|$)/g);
  return (parts && parts.length > 0 ? parts : [text]).map(p => p.trim()).filter(Boolean);
}

function DevotionalModal({
  visible, text, loading, error, onClose,
  verseRef, verseEn, versePt, dateStr,
  textEn, loadingEn, errorEn, onRequestEnglish,
  lang, onLangChange, appLang,
}: {
  visible: boolean; text: string; loading: boolean; error: string;
  onClose: () => void; verseRef: string; verseEn: string; versePt: string; dateStr: string;
  textEn: string; loadingEn: boolean; errorEn: string; onRequestEnglish: () => void;
  lang: 'pt' | 'en'; onLangChange: (l: 'pt' | 'en') => void; appLang: 'pt' | 'en';
}) {
  const colors = useDailyColors();
  const D = buildPalette(colors);
  const insets = useSafeAreaInsets();
  const audio = useAudio();

  const activeText    = lang === 'pt' ? text    : textEn;
  const activeLoading = lang === 'pt' ? loading : loadingEn;
  const activeError   = lang === 'pt' ? error   : errorEn;
  const hasText = !activeLoading && !activeError && activeText.length > 0;

  const paragraphs = hasText ? splitIntoParagraphs(activeText) : [];
  const devotionalQueueKey = `daily-devotional:${todayKey()}:${lang}`;
  const isDevAudioActive = audio.queueKey === devotionalQueueKey;
  const activeParagraphIdx = isDevAudioActive && audio.currentItem ? Number(audio.currentItem.id) : -1;

  const handleLangSwitch = (l: 'pt' | 'en') => {
    onLangChange(l);
    if (l === 'en' && !textEn && !loadingEn && !errorEn) onRequestEnglish();
  };

  const handleShare = useCallback(async () => {
    if (!hasText) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const isEn = lang === 'en';
    const parts = [
      isEn ? `✨ Daily Devotional — ${dateStr}` : `✨ Devocional do Dia — ${dateStr}`,
      '',
      `📖 ${verseRef}`,
      '',
      activeText,
      '',
      `"${verseEn}"`,
    ];
    if (!isEn) parts.push(versePt);
    parts.push('', '— Bread&Light');
    try { await Share.share({ message: parts.join('\n') }); } catch {}
  }, [hasText, lang, activeText, verseRef, verseEn, versePt, dateStr]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}
          onPress={e => e.stopPropagation()}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.sheetHeader}>
            {/* Title — no icon */}
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{t(appLang, 'devotional_modal_title')}</Text>

            {/* Right: PT/EN toggle + listen + share icon + close */}
            <View style={styles.sheetActions}>
              {hasText && (
                <TouchableOpacity
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.selectionAsync();
                    if (isDevAudioActive) audio.togglePlayPause();
                    else audio.playQueue(paragraphs.map((p, i) => ({ id: String(i), text: p })), 0, devotionalQueueKey);
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Feather
                    name={isDevAudioActive && audio.isPlaying ? 'pause-circle' : 'play-circle'}
                    size={19}
                    color={isDevAudioActive ? D.wine : colors.mutedForeground}
                  />
                </TouchableOpacity>
              )}
              <View style={[styles.langToggle, { backgroundColor: colors.muted }]}>
                {(['pt', 'en'] as const).map(l => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => handleLangSwitch(l)}
                    style={[styles.langBtn, lang === l && { backgroundColor: colors.card }]}
                  >
                    <Text style={[styles.langBtnText, {
                      color:      lang === l ? colors.foreground : colors.mutedForeground,
                      fontFamily: lang === l ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    }]}>
                      {l.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {hasText && (
                <TouchableOpacity onPress={handleShare} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Feather name="share-2" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.sheetGoldRule, { backgroundColor: D.wine }]} />

          <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {activeLoading ? (
              <View style={styles.sheetCenter}>
                <ActivityIndicator color={D.wine} size="large" />
                <Text style={[styles.sheetHint, { color: colors.mutedForeground }]}>
                  {t(lang, 'generating_reflection')}
                </Text>
              </View>
            ) : activeError ? (
              <View style={styles.sheetCenter}>
                <Feather name="alert-circle" size={30} color={colors.border} />
                <Text style={[styles.sheetHint, { color: colors.mutedForeground }]}>{activeError}</Text>
              </View>
            ) : (
              <>
                <View style={{ marginBottom: 20 }}>
                  {paragraphs.map((p, i) => (
                    <Text
                      key={i}
                      style={[
                        styles.sheetText,
                        { color: colors.foreground, marginBottom: 0 },
                        isDevAudioActive && activeParagraphIdx === i && { color: D.wine },
                      ]}
                    >
                      {p}{i < paragraphs.length - 1 ? ' ' : ''}
                    </Text>
                  ))}
                </View>
                <View style={[styles.sheetVerseBlock, { borderColor: D.wineBorder, backgroundColor: D.wineFaint }]}>
                  <Text style={[styles.sheetVerseRef, { color: D.wine }]}>{verseRef}</Text>
                  <Text style={[styles.sheetVerseEn, { color: D.wine }]} numberOfLines={3}>"{verseEn}"</Text>
                </View>
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function DailyScreen() {
  const insets  = useSafeAreaInsets();
  const { accentColor } = useTheme();
  const { lang } = useLanguage();
  const { vocabulary } = useBible();

  // Local light/dark override — scoped to this screen only, fully
  // independent of the app-wide Reading Atmosphere (Settings). Defaults to
  // dark (this screen's original immersive look) until the user picks a
  // mode here, then remembers that choice on its own.
  const [dailyMode, setDailyMode] = useState<DailyMode>('dark');
  useEffect(() => {
    AsyncStorage.getItem(DAILY_MODE_KEY)
      .then(v => { if (v === 'light' || v === 'dark') setDailyMode(v); })
      .catch(() => {});
  }, []);
  const toggleDailyMode = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setDailyMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(DAILY_MODE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = getColors(dailyMode === 'dark' ? 'dark' : 'classic', accentColor);
  const D = buildPalette(colors);

  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setToday(new Date());
    });
    return () => sub.remove();
  }, []);

  const entry    = getEntryForDate(today);
  const verseObj = resolveVerse(entry);
  const dateStr  = `${t(lang, WEEKDAY_KEYS[today.getDay()])}, ${today.getDate()} ${t(lang, MONTH_KEYS[today.getMonth()])}`;

  // Completion
  const [done, setDone]       = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setDone(false);
    setChecked(false);
    AsyncStorage.getItem(todayKey())
      .then(v => { if (v === '1') setDone(true); })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [today.toDateString()]);

  const doneScale   = useRef(new Animated.Value(0.6)).current;
  const doneOpacity = useRef(new Animated.Value(0)).current;
  const checkScale  = useRef(new Animated.Value(0)).current;

  const handleComplete = useCallback(async () => {
    if (done) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(todayKey(), '1').catch(() => {});
    setDone(true);
  }, [done]);

  // Celebratory entrance whenever the completion row appears — a soft
  // bounce-in for the row plus a slightly delayed pop for the checkmark,
  // instead of the row just snapping into place.
  useEffect(() => {
    if (!done) return;
    doneScale.setValue(0.6);
    doneOpacity.setValue(0);
    checkScale.setValue(0);
    Animated.parallel([
      Animated.spring(doneScale,   { toValue: 1, useNativeDriver: true, tension: 220, friction: 14 }),
      Animated.timing(doneOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(140),
        Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, tension: 300, friction: 8 }),
      ]),
    ]).start();
  }, [done, doneScale, doneOpacity, checkScale]);

  const handleShareInvite = useCallback(async () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    try {
      await Share.share({
        message: `${t(lang, 'daily_done_share_msg')} ${APP_SHARE_URL}`,
        url: APP_SHARE_URL,
      });
    } catch {}
  }, [lang]);

  // ── Heart / community engagement ───────────────────────────────────────────
  const heartScale = useRef(new Animated.Value(1)).current;
  const audio = useAudio();
  const dailyVerseQueueKey = `daily-verse:${todayKey()}:${audio.readingLanguage}`;
  const verseAudioText = audio.readingLanguage === 'pt' ? (verseObj?.pt ?? '') : (verseObj?.en ?? '');
  const [hearted, setHearted] = useState(false);
  const [practiceVisible, setPracticeVisible] = useState(false);

  const handleHeartToggle = useCallback(() => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHearted(h => !h);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.35, useNativeDriver: true, tension: 350, friction: 5 }),
      Animated.spring(heartScale, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();
  }, [heartScale]);

  const handleShareVerse = useCallback(async () => {
    if (!verseObj) return;
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    const msg = [
      `📖 ${entry.bookEn} ${entry.chapter}:${entry.verse}`,
      '',
      `"${verseObj.en}"`,
      '',
      `"${verseObj.pt}"`,
      '',
      '— Bread&Light',
    ].join('\n');
    try { await Share.share({ message: msg }); } catch {}
  }, [verseObj, entry]);

  // Word modal
  const [modalWord, setModalWord] = useState('');
  const [modalCtx,  setModalCtx]  = useState('');
  const [modalVis,  setModalVis]  = useState(false);
  const openWord = useCallback((word: string, ctx: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setModalWord(word); setModalCtx(ctx); setModalVis(true);
  }, []);

  // Devotional
  const [devText,    setDevText]    = useState('');
  const [devLoading, setDevLoading] = useState(false);
  const [devError,   setDevError]   = useState('');
  const [devVisible, setDevVisible] = useState(false);
  const DEVOTIONAL_KEY    = `${todayKey()}:devotional`;

  // English devotional — lazy loaded when user taps EN toggle
  const [devTextEn,    setDevTextEn]    = useState('');
  const [devLoadingEn, setDevLoadingEn] = useState(false);
  const [devErrorEn,   setDevErrorEn]   = useState('');
  const DEVOTIONAL_EN_KEY = `${todayKey()}:devotional:en`;

  // Language preference for the devotional modal (controlled inside the modal's own toggle)
  const [devLang, setDevLang] = useState<'pt' | 'en'>('pt');

  // Controls whether the Portuguese verse translation is revealed below the English verse
  const [showPt, setShowPt] = useState(false);

  const openDevotional = useCallback(async () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setDevVisible(true);
    try {
      const cached = await AsyncStorage.getItem(DEVOTIONAL_KEY);
      if (cached) { setDevText(cached); setDevLoading(false); return; }
    } catch {}
    if (!verseObj || !API_BASE) {
      setDevLoading(false);
      setDevError('Serviço indisponível no momento.');
      return;
    }
    setDevLoading(true); setDevError(''); setDevText('');
    try {
      const params = new URLSearchParams({
        book: entry.bookEn, chapter: String(entry.chapter),
        verse: String(entry.verse), en: verseObj.en, pt: verseObj.pt,
      });
      const res  = await fetch(`${API_BASE}/devotional?${params}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Erro desconhecido');
      setDevText(data.text);
      await AsyncStorage.setItem(DEVOTIONAL_KEY, data.text).catch(() => {});
    } catch (err: any) {
      setDevError(err.message ?? 'Não foi possível gerar o devocional.');
    } finally {
      setDevLoading(false);
    }
  }, [verseObj, entry, DEVOTIONAL_KEY]);

  const openDevotionalEn = useCallback(async () => {
    if (devLoadingEn || devTextEn) return;
    try {
      const cached = await AsyncStorage.getItem(DEVOTIONAL_EN_KEY);
      if (cached) { setDevTextEn(cached); return; }
    } catch {}
    if (!verseObj || !API_BASE) { setDevErrorEn('Service unavailable.'); return; }
    setDevLoadingEn(true); setDevErrorEn(''); setDevTextEn('');
    try {
      const params = new URLSearchParams({
        book: entry.bookEn, chapter: String(entry.chapter),
        verse: String(entry.verse), en: verseObj.en, pt: verseObj.pt, lang: 'en',
      });
      const res  = await fetch(`${API_BASE}/devotional?${params}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? 'Unknown error');
      setDevTextEn(data.text);
      await AsyncStorage.setItem(DEVOTIONAL_EN_KEY, data.text).catch(() => {});
    } catch (err: any) {
      setDevErrorEn(err.message ?? 'Failed to generate devotional.');
    } finally {
      setDevLoadingEn(false);
    }
  }, [devLoadingEn, devTextEn, verseObj, entry, DEVOTIONAL_EN_KEY]);

  const handleOpenDevotional = useCallback(() => {
    openDevotional();
    if (devLang === 'en') openDevotionalEn();
  }, [openDevotional, openDevotionalEn, devLang]);

  if (!verseObj) return null;

  return (
    <DailyColorsContext.Provider value={colors}>
    <View style={styles.root}>
      {/* Gradient reflects this screen's own light/dark mode — independent
          of the app-wide Reading Atmosphere in Settings. Crossfades smoothly
          when the mode toggle changes. */}
      <SpaceBackground gradient={[D.bg1, D.bg2, D.bg3]} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: (Platform.OS === 'web' ? 67 : insets.top) + 16 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="arrow-left" size={22} color={D.whiteMid} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.modoBadge, { backgroundColor: D.wineFaint, borderColor: D.wineBorder }]}>
            <Feather name="sun" size={11} color={D.wine} />
            <Text style={[styles.modoBadgeText, { color: D.wine }]}>{t(lang, 'daily_mode_badge')}</Text>
          </View>
          <Text style={[styles.dateText, { color: D.whiteMid }]}>{dateStr}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleDailyMode}
            style={[styles.modeToggleBtn, { backgroundColor: D.whiteFaint, borderColor: D.border }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name={dailyMode === 'dark' ? 'moon' : 'sun'} size={14} color={D.whiteMid} />
          </TouchableOpacity>
          <View style={styles.vocabBadge}>
            <Text style={[styles.vocabCount, { color: D.white }]}>{vocabulary.length}</Text>
            <Text style={[styles.vocabLabel, { color: D.whiteLow }]}>{t(lang, 'words_label')}</Text>
          </View>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 180 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.goldBar, { backgroundColor: D.wine }]} />

        <Text style={[styles.reference, { color: D.wine }]}>
          {entry.bookEn} {entry.chapter}:{entry.verse}
        </Text>

        <TappableVerse text={verseObj.en} onWordPress={openWord} />

        {/* Unified voice player — same shared engine as the reader */}
        <View style={styles.playerRow}>
          <AudioPlayer
            items={[{ id: 'verse', text: verseAudioText }]}
            queueKey={dailyVerseQueueKey}
            title={audio.readingLanguage === 'pt' ? t(lang, 'listen_in_portuguese') : t(lang, 'listen_in_english')}
            palette={{
              card: D.whiteFaint, border: D.border, foreground: D.white,
              mutedForeground: D.whiteMid, primary: D.wine, primaryForeground: D.bg1, accent: D.wine,
            }}
          />
          <View style={styles.readLangRow}>
            {(['en', 'pt'] as const).map(l => (
              <TouchableOpacity
                key={l}
                onPress={() => {
                  if (Platform.OS !== 'web') Haptics.selectionAsync();
                  audio.setReadingLanguage(l);
                }}
                activeOpacity={0.7}
                style={[
                  styles.readLangPill,
                  { borderColor: D.border, backgroundColor: D.whiteFaint },
                  audio.readingLanguage === l && { backgroundColor: D.wineFaint, borderColor: D.wineBorder },
                ]}
              >
                <Text style={[
                  styles.readLangPillText,
                  { color: audio.readingLanguage === l ? D.wine : D.whiteLow },
                ]}>
                  {l === 'en' ? t(lang, 'lang_pill_en') : t(lang, 'lang_pill_pt')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Practice pronunciation */}
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            setPracticeVisible(true);
          }}
          activeOpacity={0.7}
          style={[styles.listenBtn, { borderColor: D.border, backgroundColor: D.whiteFaint }]}
        >
          <Feather name="mic" size={13} color={D.whiteLow} />
          <Text style={[styles.listenBtnText, { color: D.whiteLow }]}>{t(lang, 'practice_title')}</Text>
        </TouchableOpacity>

        {/* PT translation reveal toggle */}
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            setShowPt(v => !v);
          }}
          style={[
            styles.ptToggleBtn,
            { borderColor: D.border, backgroundColor: D.whiteFaint },
            showPt && { backgroundColor: D.wineFaint, borderColor: D.wineBorder },
          ]}
          activeOpacity={0.7}
        >
          <Feather name={showPt ? 'eye-off' : 'eye'} size={13} color={showPt ? D.wine : D.whiteLow} />
          <Text style={[styles.ptToggleText, { color: showPt ? D.wine : D.whiteLow }]}>
            {showPt ? t(lang, 'hide_pt_translation') : t(lang, 'show_pt_translation')}
          </Text>
        </TouchableOpacity>

        {showPt && <Text style={[styles.versePt, { color: D.whiteMid }]}>{verseObj.pt}</Text>}

        <View style={styles.bookTag}>
          <Feather name="book-open" size={12} color={D.wineBorder} />
          <Text style={[styles.bookTagText, { color: D.wineBorder }]}>
            {lang === 'pt' ? entry.bookPt : entry.bookEn} · {t(lang, 'chapter_label')} {entry.chapter}
          </Text>
        </View>

        <View style={[styles.tipRow, { backgroundColor: D.whiteFaint, borderColor: D.border }]}>
          <Feather name="zap" size={12} color={D.whiteLow} />
          <Text style={[styles.tipText, { color: D.whiteLow }]} numberOfLines={1}>
            {showPt
              ? t(lang, 'tip_tap_words_definitions')
              : t(lang, 'tip_tap_words_pt_reveal')}
          </Text>
        </View>

        {/* ── Community engagement ── */}
        <View style={styles.communityRow}>
          {/* Share verse — left */}
          <TouchableOpacity onPress={handleShareVerse} activeOpacity={0.75} style={styles.shareVerseBtn}>
            <Feather name="share" size={16} color="#FFFFFF" />
            <Text style={[styles.shareVerseBtnText, { color: '#FFFFFF' }]}>
              {t(lang, 'share_action')}
            </Text>
          </TouchableOpacity>

          {/* Heart like button — right */}
          <TouchableOpacity onPress={handleHeartToggle} activeOpacity={0.75} style={styles.heartBtn}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <MaterialCommunityIcons
                name={hearted ? 'heart' : 'heart-outline'}
                size={22}
                color={hearted ? '#E8294B' : D.whiteLow}
              />
            </Animated.View>
            <Text style={[styles.heartCount, { color: hearted ? '#E8294B' : D.whiteLow }]}>
              {'125k'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Fixed bottom bar ── */}
      {checked && (
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10, backgroundColor: D.overlayBg, borderTopColor: D.border }]}>

          {/* Devotional row: button + PT/EN lang toggle */}
          <View style={styles.devRow}>
            <TouchableOpacity
              onPress={handleOpenDevotional}
              activeOpacity={0.8}
              style={[styles.devBtn, { borderColor: D.wineBorder, backgroundColor: D.wineFaint }]}
            >
              <Text style={[styles.devBtnText, { color: D.wine }]}>{t(lang, 'read_devotional')}</Text>
            </TouchableOpacity>

          </View>

          {/* Complete / done row */}
          {done ? (
            <Animated.View style={[styles.doneWrap, { opacity: doneOpacity, transform: [{ scale: doneScale }] }]}>
              <View style={styles.doneRow}>
                <Animated.View style={[styles.doneIcon, { transform: [{ scale: checkScale }] }]}>
                  <Feather name="check" size={18} color={D.white} />
                </Animated.View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.doneTitle, { color: D.white }]}>{t(lang, 'daily_done_title')}</Text>
                  <Text style={[styles.doneSub, { color: D.whiteMid }]}>{t(lang, 'daily_done_sub')}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleShareInvite}
                activeOpacity={0.8}
                style={[styles.doneShareBtn, { borderColor: D.wineBorder, backgroundColor: D.wineFaint }]}
              >
                <Feather name="share-2" size={14} color={D.wine} />
                <Text style={[styles.doneShareText, { color: D.wine }]}>{t(lang, 'daily_done_share')}</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <TouchableOpacity onPress={handleComplete} activeOpacity={0.85} style={[styles.completeBtn, { backgroundColor: D.wine }]}>
              <Text style={[styles.completeBtnText, { color: D.bg1 }]}>{t(lang, 'mark_done')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Modals ── */}
      <DevotionalModal
        visible={devVisible}
        text={devText}
        loading={devLoading}
        error={devError}
        textEn={devTextEn}
        loadingEn={devLoadingEn}
        errorEn={devErrorEn}
        onRequestEnglish={openDevotionalEn}
        onClose={() => setDevVisible(false)}
        lang={devLang}
        onLangChange={setDevLang}
        appLang={lang}
        verseRef={`${entry.bookEn} ${entry.chapter}:${entry.verse}`}
        verseEn={verseObj.en}
        versePt={verseObj.pt}
        dateStr={dateStr}
      />
      <WordModal
        visible={modalVis}
        word={modalWord}
        context={modalCtx}
        onClose={() => setModalVis(false)}
      />
      <PronunciationPractice
        visible={practiceVisible}
        verseText={verseObj.en}
        verseRef={`${entry.bookEn} ${entry.chapter}:${entry.verse}`}
        onClose={() => setPracticeVisible(false)}
      />
    </View>
    </DailyColorsContext.Provider>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  backBtn:      { width: 36, alignItems: 'flex-start', flexShrink: 0 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 5, minWidth: 0 },
  modoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  modoBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.2 },
  dateText:      { fontSize: 12, fontFamily: 'Inter_400Regular' },
  headerRight:   { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
  modeToggleBtn: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  vocabBadge:    { width: 48, alignItems: 'flex-end', flexShrink: 0 },
  vocabCount:    { fontSize: 17, fontFamily: 'Inter_700Bold', lineHeight: 20 },
  vocabLabel:    { fontSize: 10, fontFamily: 'Inter_400Regular' },

  // Content
  content:  { paddingHorizontal: 24, paddingTop: 10, alignItems: 'flex-start' },
  goldBar:  { width: 40, height: 3, borderRadius: 2, marginBottom: 20 },
  reference: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.8,
    marginBottom: 16,
    textTransform: 'uppercase',
  },

  // EN verse — Lora serif for immersive reading
  verseEnWrap: {
    fontSize: 26,
    lineHeight: 42,
    fontFamily: 'Lora_400Regular',
    marginBottom: 22,
  },
  verseWord: {
    fontSize: 26,
    lineHeight: 42,
    fontFamily: 'Lora_400Regular',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },

  // PT verse — italic serif
  versePt: {
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'Lora_400Regular_Italic',
    marginBottom: 28,
  },

  // Listen button
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
  },
  listenBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  playerRow: { width: '100%', marginBottom: 14, gap: 8 },
  readLangRow: { flexDirection: 'row', gap: 8 },
  readLangPill: {
    flex: 1, borderWidth: 1, borderRadius: 10,
    paddingVertical: 7, alignItems: 'center', justifyContent: 'center',
  },
  readLangPillText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // Tags
  bookTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  bookTagText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  tipRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 10,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },

  // Community row
  communityRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    alignSelf:      'stretch',
    marginTop:      28,
    paddingVertical: 4,
  },
  heartBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           7,
  },
  heartCount: {
    fontSize:   14,
    fontFamily: 'Inter_600SemiBold',
  },
  shareVerseBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  shareVerseBtnText: {
    fontSize:   13,
    fontFamily: 'Inter_500Medium',
  },

  // Translation reveal button
  ptToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 18,
  },
  ptToggleText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },

  // Devotional row (button + lang toggle side by side)
  devRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  devBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  devBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  // PT/EN lang toggle pill in bottom bar
  devLangPill: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, padding: 2, gap: 1 },
  devLangBtn:  { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8 },
  devLangText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // Complete button — simpler, more discreet
  completeBtn: {
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium' },

  // Done state
  doneWrap: { gap: 10 },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  doneIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(58,107,61,0.85)',
    alignItems: 'center', justifyContent: 'center',
  },
  doneTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  doneSub:   { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  doneShareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderRadius: 12, paddingVertical: 11,
  },
  doneShareText: { fontSize: 14, fontFamily: 'Inter_500Medium' },

  // Devotional modal sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 10,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle:    { fontSize: 17, fontFamily: 'Inter_700Bold' },
  sheetGoldRule: {
    height: 2, borderRadius: 1, opacity: 0.4,
    marginHorizontal: 20, marginBottom: 2,
  },
  sheetBody:   { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
  sheetCenter: { alignItems: 'center', paddingVertical: 40, gap: 14 },
  sheetHint:   { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
  sheetText:   { fontSize: 16, lineHeight: 28, fontFamily: 'Inter_400Regular', marginBottom: 20 },

  // Header action row
  sheetActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  // PT / EN language toggle pill
  langToggle:  { flexDirection: 'row', borderRadius: 8, padding: 2, gap: 1 },
  langBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  langBtnText: { fontSize: 12 },

  // Verse attribution block at bottom of devotional text
  sheetVerseBlock: {
    borderLeftWidth: 2, borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 10, gap: 4,
  },
  sheetVerseRef: {
    fontSize: 10, fontFamily: 'Inter_700Bold',
    letterSpacing: 1.4, textTransform: 'uppercase',
  },
  sheetVerseEn: {
    fontSize: 13, fontFamily: 'Lora_400Regular_Italic',
    lineHeight: 20, opacity: 0.85,
  },
});

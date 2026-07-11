import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useAudio } from '@/context/AudioContext';
import { useLanguage } from '@/context/LanguageContext';
import { useBible } from '@/context/BibleContext';
import WordModal from '@/components/WordModal';
import AudioPlayer from '@/components/AudioPlayer';
import PronunciationPractice from '@/components/PronunciationPractice';
import { getEntryForDate, resolveVerse, todayKey } from '@/utils/dailyVerse';
import { t } from '@/constants/i18n';

// ── Palette — always dark; this screen is an immersive reading experience ─────
const D = {
  bg1:       '#0A1628',
  bg2:       '#111E35',
  bg3:       '#162442',
  wine:      '#EDD9A8',           // parchment cream — biblical manuscript on dark navy
  wineFaint: 'rgba(237,217,168,0.12)',
  wineBorder:'rgba(237,217,168,0.28)',
  white:     '#FFFFFF',
  whiteHi:   'rgba(255,255,255,0.90)',
  whiteMid:  'rgba(255,255,255,0.55)',
  whiteLow:  'rgba(255,255,255,0.35)',
  whiteFaint:'rgba(255,255,255,0.07)',
  border:    'rgba(255,255,255,0.10)',
  overlayBg: 'rgba(10,22,40,0.96)',
};

// PT weekday / month labels
const WEEKDAYS_PT = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MONTHS_PT   = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const _domain = process.env.EXPO_PUBLIC_DOMAIN;
const API_BASE = _domain ? `https://${_domain}/api` : null;

// ── Tappable EN verse ─────────────────────────────────────────────────────────
function TappableVerse({ text, onWordPress }: {
  text: string;
  onWordPress: (word: string, ctx: string) => void;
}) {
  const words = text.split(/(\s+)/);
  return (
    <Text style={styles.verseEnWrap}>
      {words.map((token, i) => {
        if (/^\s+$/.test(token)) return <Text key={i} style={{ color: D.white }}>{token}</Text>;
        const clean = token.replace(/[^a-zA-Z'-]/g, '');
        return (
          <Text
            key={i}
            onPress={() => clean.length > 1 && onWordPress(clean.toLowerCase(), text)}
            style={styles.verseWord}
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
  lang, onLangChange,
}: {
  visible: boolean; text: string; loading: boolean; error: string;
  onClose: () => void; verseRef: string; verseEn: string; versePt: string; dateStr: string;
  textEn: string; loadingEn: boolean; errorEn: string; onRequestEnglish: () => void;
  lang: 'pt' | 'en'; onLangChange: (l: 'pt' | 'en') => void;
}) {
  const colors = useColors();
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
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Devocional do Dia</Text>

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
                  {lang === 'pt' ? 'Gerando sua reflexão…' : 'Generating your reflection…'}
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
                  <Text style={styles.sheetVerseRef}>{verseRef}</Text>
                  <Text style={styles.sheetVerseEn} numberOfLines={3}>"{verseEn}"</Text>
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
  const colors  = useColors();
  const { lang } = useLanguage();
  const { vocabulary } = useBible();

  const [today, setToday] = useState(() => new Date());
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setToday(new Date());
    });
    return () => sub.remove();
  }, []);

  const entry    = getEntryForDate(today);
  const verseObj = resolveVerse(entry);
  const dateStr  = `${WEEKDAYS_PT[today.getDay()]}, ${today.getDate()} ${MONTHS_PT[today.getMonth()]}`;

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

  const handleComplete = useCallback(async () => {
    if (done) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem(todayKey(), '1').catch(() => {});
    setDone(true);
  }, [done]);

  // ── Heart / community engagement ───────────────────────────────────────────
  const heartScale = useRef(new Animated.Value(1)).current;
  const audio = useAudio();
  const dailyVerseQueueKey = `daily-verse:${todayKey()}`;
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
    <View style={styles.root}>
      {/* Always-dark gradient — this is an immersive reading experience */}
      <LinearGradient colors={[D.bg1, D.bg2, D.bg3]} style={StyleSheet.absoluteFill} />

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
          <View style={styles.modoBadge}>
            <Feather name="sun" size={11} color={D.wine} />
            <Text style={styles.modoBadgeText}>MODO DIÁRIO</Text>
          </View>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        <View style={styles.vocabBadge}>
          <Text style={styles.vocabCount}>{vocabulary.length}</Text>
          <Text style={styles.vocabLabel}>palavras</Text>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 180 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goldBar} />

        <Text style={styles.reference}>
          {entry.bookEn} {entry.chapter}:{entry.verse}
        </Text>

        <TappableVerse text={verseObj.en} onWordPress={openWord} />

        {/* Unified voice player — same shared engine as the reader */}
        <View style={styles.playerRow}>
          <AudioPlayer
            items={[{ id: 'verse', text: verseObj.en }]}
            queueKey={dailyVerseQueueKey}
            title={t(lang, 'listen_in_english')}
            palette={{
              card: D.whiteFaint, border: D.border, foreground: D.white,
              mutedForeground: D.whiteMid, primary: D.wine, primaryForeground: D.bg1, accent: D.wine,
            }}
          />
        </View>

        {/* Practice pronunciation */}
        <TouchableOpacity
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            setPracticeVisible(true);
          }}
          activeOpacity={0.7}
          style={styles.listenBtn}
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
          style={[styles.ptToggleBtn, showPt && { backgroundColor: D.wineFaint, borderColor: D.wineBorder }]}
          activeOpacity={0.7}
        >
          <Feather name={showPt ? 'eye-off' : 'eye'} size={13} color={showPt ? D.wine : D.whiteLow} />
          <Text style={[styles.ptToggleText, { color: showPt ? D.wine : D.whiteLow }]}>
            {showPt ? 'Ocultar tradução' : 'Ver tradução em PT'}
          </Text>
        </TouchableOpacity>

        {showPt && <Text style={styles.versePt}>{verseObj.pt}</Text>}

        <View style={styles.bookTag}>
          <Feather name="book-open" size={12} color={D.wineBorder} />
          <Text style={styles.bookTagText}>{entry.bookPt} · Capítulo {entry.chapter}</Text>
        </View>

        <View style={styles.tipRow}>
          <Feather name="zap" size={12} color={D.whiteLow} />
          <Text style={styles.tipText} numberOfLines={1}>
            {showPt
              ? 'Toque nas palavras para ver definições'
              : 'Toque nas palavras · PT revela a tradução'}
          </Text>
        </View>

        {/* ── Community engagement ── */}
        <View style={styles.communityRow}>
          {/* Share verse — left */}
          <TouchableOpacity onPress={handleShareVerse} activeOpacity={0.75} style={styles.shareVerseBtn}>
            <Feather name="share" size={16} color="#FFFFFF" />
            <Text style={[styles.shareVerseBtnText, { color: '#FFFFFF' }]}>
              {lang === 'pt' ? 'Compartilhar' : 'Share'}
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
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>

          {/* Devotional row: button + PT/EN lang toggle */}
          <View style={styles.devRow}>
            <TouchableOpacity
              onPress={handleOpenDevotional}
              activeOpacity={0.8}
              style={styles.devBtn}
            >
              <Text style={styles.devBtnText}>Ler Devocional</Text>
            </TouchableOpacity>

          </View>

          {/* Complete / done row */}
          {done ? (
            <View style={styles.doneRow}>
              <View style={styles.doneIcon}>
                <Feather name="check" size={18} color={D.white} />
              </View>
              <View>
                <Text style={styles.doneTitle}>Concluído hoje 🎉</Text>
                <Text style={styles.doneSub}>Volte amanhã para o próximo versículo</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={handleComplete} activeOpacity={0.85} style={styles.completeBtn}>
              <Text style={styles.completeBtnText}>Marcar como concluído</Text>
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
    backgroundColor: D.wineFaint,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: D.wineBorder,
  },
  modoBadgeText: { color: D.wine, fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.2 },
  dateText:      { color: D.whiteMid, fontSize: 12, fontFamily: 'Inter_400Regular' },
  vocabBadge:    { width: 48, alignItems: 'flex-end', flexShrink: 0 },
  vocabCount:    { color: D.white, fontSize: 17, fontFamily: 'Inter_700Bold', lineHeight: 20 },
  vocabLabel:    { color: D.whiteLow, fontSize: 10, fontFamily: 'Inter_400Regular' },

  // Content
  content:  { paddingHorizontal: 24, paddingTop: 10, alignItems: 'flex-start' },
  goldBar:  { width: 40, height: 3, backgroundColor: D.wine, borderRadius: 2, marginBottom: 20 },
  reference: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.8,
    color: D.wine,
    marginBottom: 16,
    textTransform: 'uppercase',
  },

  // EN verse — Lora serif for immersive reading
  verseEnWrap: {
    fontSize: 26,
    lineHeight: 42,
    fontFamily: 'Lora_400Regular',
    color: D.white,
    marginBottom: 22,
  },
  verseWord: {
    fontSize: 26,
    lineHeight: 42,
    fontFamily: 'Lora_400Regular',
    color: D.white,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: 'rgba(255,255,255,0.20)',
  },

  // PT verse — italic serif
  versePt: {
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'Lora_400Regular_Italic',
    color: D.whiteMid,
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
    borderColor: D.border,
    backgroundColor: D.whiteFaint,
    marginBottom: 18,
  },
  listenBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  playerRow: { width: '100%', marginBottom: 14 },

  // Tags
  bookTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 18 },
  bookTagText: { color: D.wineBorder, fontSize: 12, fontFamily: 'Inter_500Medium' },
  tipRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
    paddingVertical: 11,
    paddingHorizontal: 13,
    backgroundColor: D.whiteFaint,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: D.border,
  },
  tipText: {
    flex: 1,
    color: D.whiteLow,
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
    borderColor: D.border,
    backgroundColor: D.whiteFaint,
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
    backgroundColor: D.overlayBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: D.border,
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
    borderColor: D.wineBorder,
    backgroundColor: D.wineFaint,
  },
  devBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: D.wine },

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
    backgroundColor: D.wine,
  },
  completeBtnText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: D.bg1 },

  // Done state
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
  doneTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: D.white },
  doneSub:   { fontSize: 12, fontFamily: 'Inter_400Regular', color: D.whiteMid, marginTop: 2 },

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
    letterSpacing: 1.4, color: D.wine, textTransform: 'uppercase',
  },
  sheetVerseEn: {
    fontSize: 13, fontFamily: 'Lora_400Regular_Italic',
    color: D.wine, lineHeight: 20, opacity: 0.85,
  },
});

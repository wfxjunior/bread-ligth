import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Share,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useBible } from '@/context/BibleContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAudio, AUDIO_VOICES } from '@/context/AudioContext';
import type { AudioVoice } from '@/context/AudioContext';
import { ATMOSPHERE_IDS, getAtmospherePreview } from '@/constants/colors';
import type { Atmosphere, AccentColor } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import SettingsDrawer from '@/components/SettingsDrawer';
import { router } from 'expo-router';

const ACCENT_COLORS: { id: AccentColor; hex: string; label: string }[] = [
  { id: 'royal-blue', hex: '#1B3A6B', label: 'Azul Real' },
  { id: 'burgundy',   hex: '#6B1E2A', label: 'Bordô'     },
  { id: 'forest',     hex: '#1E4D2B', label: 'Floresta'  },
  { id: 'slate',      hex: '#3D4A5C', label: 'Ardósia'   },
  { id: 'violet',     hex: '#3B1E6B', label: 'Violeta'   },
];

const AVATAR_KEY = '@bibliaeN:avatar';

// ── Donation modal ────────────────────────────────────────────────────────────
const PRESET_AMOUNTS = [10, 20, 50, 100];

const _domain  = process.env.EXPO_PUBLIC_DOMAIN;
const _apiBase = _domain ? `https://${_domain}/api` : null;

function DonationModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const { lang } = useLanguage();
  const [selected, setSelected] = useState<number | null>(null);
  const [custom,   setCustom]   = useState('');
  const [loading,  setLoading]  = useState(false);

  // ── Heart pop animation ───────────────────────────────────────────────────
  const heartAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      heartAnim.setValue(0);
      Animated.spring(heartAnim, {
        toValue:          1,
        tension:          180,
        friction:         6,
        useNativeDriver:  true,
      }).start();
    }
  }, [visible]);
  const heartScale = heartAnim.interpolate({
    inputRange:  [0, 0.4, 0.7, 1],
    outputRange: [0, 1.5, 0.85, 1],
  });

  const raw    = custom.replace(',', '.');
  const amount = custom ? parseFloat(raw) : selected;
  const valid  = typeof amount === 'number' && !isNaN(amount) && amount > 0;

  const pick = (a: number) => {
    setSelected(a); setCustom('');
    if (Platform.OS !== 'web') Haptics.selectionAsync();
  };

  const handleContinue = async () => {
    if (!valid || loading) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (!_apiBase) {
      Alert.alert('Erro', 'Serviço de pagamento indisponível.');
      return;
    }

    setLoading(true);
    try {
      const cents = Math.round(amount! * 100);
      const res   = await fetch(`${_apiBase}/donations/checkout-session`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount: cents, currency: 'usd' }),
      });
      const data  = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro desconhecido');
      await Linking.openURL(data.url);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  const t = (pt: string, en: string) => lang === 'en' ? en : pt;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.donateBackdrop} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable
            style={[styles.donateSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 28 }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={[styles.donateHandle, { backgroundColor: colors.border }]} />

            {/* Header with animated heart */}
            <View style={styles.donateHeader}>
              <Animated.View
                style={[styles.donateIconCircle, {
                  backgroundColor: colors.primary + '16',
                  transform: [{ scale: heartScale }],
                }]}
              >
                <Feather name="heart" size={28} color={colors.primary} />
              </Animated.View>
              <Text style={[styles.donateTitle, { color: colors.foreground }]}>
                {t('Apoiar o Bread\u0026Light', 'Support Bread\u0026Light')}
              </Text>
              <Text style={[styles.donateSub, { color: colors.mutedForeground }]}>
                {t(
                  'Cada doação mantém o app gratuito e nos ajuda a crescer. 🙏',
                  'Every donation keeps the app free and helps us grow. 🙏',
                )}
              </Text>
            </View>

            {/* Preset amounts — 2×2 grid */}
            <View style={styles.amountGrid}>
              {PRESET_AMOUNTS.map(a => {
                const active = selected === a && !custom;
                return (
                  <TouchableOpacity
                    key={a}
                    onPress={() => pick(a)}
                    activeOpacity={0.78}
                    style={[styles.amountBtn, {
                      borderColor:     active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primary + '14' : colors.muted,
                      borderRadius:    colors.radius,
                    }]}
                  >
                    <Text style={[styles.amountCurrency, { color: active ? colors.primary : colors.mutedForeground }]}>$</Text>
                    <Text style={[styles.amountValue, { color: active ? colors.primary : colors.foreground }]}>{a}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom amount */}
            <View style={[styles.customRow, {
              borderColor:     custom ? colors.primary : colors.border,
              borderRadius:    colors.radius,
              backgroundColor: colors.muted,
            }]}>
              <Text style={[styles.customPrefix, { color: colors.mutedForeground }]}>$</Text>
              <TextInput
                value={custom}
                onChangeText={v => { setCustom(v.replace(/[^0-9,.]/g, '')); setSelected(null); }}
                placeholder={t('Outro valor', 'Custom amount')}
                placeholderTextColor={colors.mutedForeground}
                keyboardType="decimal-pad"
                style={[styles.customInput, { color: colors.foreground }]}
              />
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={valid ? 0.8 : 1}
              style={[styles.donateBtn, {
                backgroundColor: valid ? colors.primary : colors.muted,
                borderRadius:    colors.radius,
              }]}
            >
              {loading
                ? <Feather name="loader" size={18} color={valid ? colors.primaryForeground : colors.mutedForeground} />
                : <Text style={[styles.donateBtnText, { color: valid ? colors.primaryForeground : colors.mutedForeground }]}>
                    {valid
                      ? t(`Continuar com ${amount}`, `Continue with ${amount}`)
                      : t('Selecione um valor', 'Select an amount')}
                  </Text>
              }
            </TouchableOpacity>

            <Text style={[styles.donateLegal, { color: colors.mutedForeground }]}>
              {t(
                '🔒 Pagamento único e seguro via cartão de crédito',
                '🔒 One-time secure payment via credit card',
              )}
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ── Ambassador modal ──────────────────────────────────────────────────────────
const AMBASSADOR_FEATURES: { icon: string; text: string }[] = [
  { icon: 'zap',       text: 'Acesso antecipado a novos livros e recursos' },
  { icon: 'award',     text: 'Selo de Embaixador no seu perfil' },
  { icon: 'book-open', text: 'Suporte direto ao desenvolvimento do app' },
  { icon: 'heart',     text: 'Missão: inglês gratuito para todos' },
];

function AmbassadorModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const handleSubscribe = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    Alert.alert('Em breve! 🌟', 'As assinaturas de Embaixador estarão disponíveis em breve.\nFique ligado nas novidades!');
  };

  const handleShare = async () => {
    try {
      if (Platform.OS !== 'web') Haptics.selectionAsync();
      await Share.share({
        message: '📖 Estou aprendendo inglês com o Bread&Light — gratuito e incrível! Confira: bibleenglish.app',
        url: 'https://bibleenglish.app',
      });
    } catch {}
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.donateBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.ambassadorSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}
          onPress={e => e.stopPropagation()}
        >
          <View style={[styles.donateHandle, { backgroundColor: colors.border }]} />

          {/* Crown header */}
          <View style={styles.ambassadorHeader}>
            <View style={[styles.ambassadorCrown, { backgroundColor: colors.accent + '18' }]}>
              <Feather name="award" size={28} color={colors.accent} />
            </View>
            <Text style={[styles.ambassadorTitle, { color: colors.foreground }]}>Bread{'&'}Light Ambassador</Text>
            <View style={styles.ambassadorPriceRow}>
              <Text style={[styles.ambassadorPrice, { color: colors.primary }]}>R$9,90</Text>
              <Text style={[styles.ambassadorPer,   { color: colors.mutedForeground }]}>/mês</Text>
            </View>
            <Text style={[styles.ambassadorDesc, { color: colors.mutedForeground }]}>
              Ajude a missão e ganhe vantagens exclusivas
            </Text>
          </View>

          <View style={[styles.ambassadorDivider, { backgroundColor: colors.border }]} />

          {/* Feature list */}
          <View style={styles.ambassadorFeatures}>
            {AMBASSADOR_FEATURES.map(f => (
              <View key={f.icon} style={styles.ambassadorFeatureRow}>
                <View style={[styles.ambassadorFeatureIcon, { backgroundColor: colors.accent + '14', borderRadius: colors.radius }]}>
                  <Feather name={f.icon as any} size={14} color={colors.accent} />
                </View>
                <Text style={[styles.ambassadorFeatureText, { color: colors.foreground }]}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* Buttons */}
          <TouchableOpacity
            onPress={handleSubscribe}
            activeOpacity={0.82}
            style={[styles.ambassadorBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          >
            <Text style={[styles.ambassadorBtnText, { color: colors.primaryForeground }]}>
              Assinar — R$9,90/mês
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            style={[styles.ambassadorShareBtn, { borderColor: colors.border, borderRadius: colors.radius }]}
          >
            <Feather name="share-2" size={15} color={colors.mutedForeground} />
            <Text style={[styles.ambassadorShareText, { color: colors.mutedForeground }]}>
              Compartilhar sem assinar
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Custom toggle — consistent on all platforms ───────────────────────────────
function CustomToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const colors = useColors();
  const anim   = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const thumbX  = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] });
  const trackBg = anim.interpolate({ inputRange: [0, 1], outputRange: [colors.muted, colors.primary] });

  const handlePress = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onChange(!value);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: trackBg }]}>
        <Animated.View style={[styles.toggleThumb, { transform: [{ translateX: thumbX }] }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ title, onLayout }: { title: string; onLayout?: (e: LayoutChangeEvent) => void }) {
  const colors = useColors();
  return (
    <Text onLayout={onLayout} style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
      {title.toUpperCase()}
    </Text>
  );
}

// ── Settings card ─────────────────────────────────────────────────────────────
function SettingsCard({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.card, {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: colors.radius,
    }]}>
      {children}
    </View>
  );
}

// ── Settings row ──────────────────────────────────────────────────────────────
function SettingsRow({
  icon, label, sub, right, onPress, border = true,
}: {
  icon: string; label: string; sub?: string;
  right?: React.ReactNode; onPress?: () => void; border?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.row,
        border && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.primary + '14' }]}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
      </View>
      {right ?? (onPress
        ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        : null)}
    </TouchableOpacity>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({
  icon, label, sub, value, onChange, border = true,
}: {
  icon: string; label: string; sub?: string;
  value: boolean; onChange: (v: boolean) => void; border?: boolean;
}) {
  return (
    <SettingsRow
      icon={icon} label={label} sub={sub} border={border}
      right={<CustomToggle value={value} onChange={onChange} />}
    />
  );
}

// ── Pill selector (kept for language toggle) ──────────────────────────────────
function PillSelector({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  const colors = useColors();
  return (
    <View style={styles.pillRow}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onChange(opt);
            }}
            style={[
              styles.pill,
              {
                backgroundColor: active ? colors.primary : colors.background,
                borderColor:     active ? colors.primary : colors.border,
                borderRadius:    colors.radius / 2,
              },
            ]}
          >
            <Text style={[styles.pillText, {
              color: active ? colors.primaryForeground : colors.foreground,
            }]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Segmented control — equal-width, unified border ────────────────────────────
function SegmentedControl({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  const colors = useColors();
  return (
    <View style={[styles.segControl, {
      borderColor:  colors.border,
      borderRadius: colors.radius / 2,
    }]}>
      {options.map((opt, i) => {
        const active  = value === opt;
        const isLast  = i === options.length - 1;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); onChange(opt); }}
            activeOpacity={0.8}
            style={[
              styles.segItem,
              {
                backgroundColor: active ? colors.primary : 'transparent',
                borderRightWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                borderRightColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.segText, {
              color:      active ? colors.primaryForeground : colors.mutedForeground,
              fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
            }]}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Level pill selector ───────────────────────────────────────────────────────
export type LevelKey = 'beginner' | 'intermediate' | 'advanced';
const LEVEL_KEY = '@bibliaeN:level';

function LevelPillSelector({ value, onChange }: { value: LevelKey; onChange: (v: LevelKey) => void }) {
  const colors  = useColors();
  const { t }   = useLanguage();

  const levels: { key: LevelKey; label: string; code: string }[] = [
    { key: 'beginner',     label: t('level_beginner'), code: 'A2' },
    { key: 'intermediate', label: t('level_inter'),    code: 'B1' },
    { key: 'advanced',     label: t('level_advanced'), code: 'C1' },
  ];

  return (
    <View style={styles.pillRow}>
      {levels.map(({ key, label, code }) => {
        const active = value === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onChange(key);
            }}
            style={[
              styles.pill,
              styles.levelPill,
              {
                backgroundColor: active ? colors.primary : colors.background,
                borderColor:     active ? colors.primary : colors.border,
                borderRadius:    colors.radius / 2,
              },
            ]}
          >
            <Text style={[styles.pillText, {
              color: active ? colors.primaryForeground : colors.foreground,
              fontSize: 12,
            }]} numberOfLines={1} adjustsFontSizeToFit>
              {label}
            </Text>
            <Text style={[styles.cefrCode, {
              color: active ? colors.primaryForeground + 'BB' : colors.mutedForeground,
            }]}>
              {code}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Voice pill selector (TTS voice for verses/devotionals) ─────────────────────
function VoicePillSelector({ value, onChange }: { value: AudioVoice; onChange: (v: AudioVoice) => void }) {
  const colors = useColors();
  const { t }  = useLanguage();

  const voiceKeys: Record<AudioVoice, string> = {
    alloy: 'voice_alloy', echo: 'voice_echo', fable: 'voice_fable',
    onyx: 'voice_onyx', nova: 'voice_nova', shimmer: 'voice_shimmer',
  };

  return (
    <View style={[styles.pillRow, { flexWrap: 'wrap', rowGap: 8 }]}>
      {AUDIO_VOICES.map(v => {
        const active = value === v;
        return (
          <TouchableOpacity
            key={v}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onChange(v);
            }}
            style={[
              styles.pill,
              {
                backgroundColor: active ? colors.primary : colors.background,
                borderColor:     active ? colors.primary : colors.border,
                borderRadius:    colors.radius / 2,
                minWidth: '30%',
              },
            ]}
          >
            <Text style={[styles.pillText, {
              color:      active ? colors.primaryForeground : colors.foreground,
              fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
            }]} numberOfLines={1} adjustsFontSizeToFit>
              {t(voiceKeys[v] as any)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
// ── Issue types ───────────────────────────────────────────────────────────────
const ISSUE_TYPES: { icon: string; label: string }[] = [
  { icon: 'type',            label: 'Texto incorreto'       },
  { icon: 'globe',           label: 'Tradução errada'       },
  { icon: 'book-open',       label: 'Capítulo faltando'     },
  { icon: 'cloud-off',       label: 'Devocional não carrega' },
  { icon: 'alert-triangle',  label: 'App travando'          },
  { icon: 'more-horizontal', label: 'Outro'                 },
];

// ── Support modal ─────────────────────────────────────────────────────────────
function SupportModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selected, setSelected]       = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [sent, setSent]               = useState(false);
  const [sending, setSending]         = useState(false);

  const canSend = !sending && (selected.length > 0 || description.trim().length > 0);

  const handleClose = () => {
    setSelected([]); setDescription(''); setSent(false);
    onClose();
  };

  const toggleType = (label: string) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setSelected(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Persist report so support can review issue patterns
    try {
      const raw      = await AsyncStorage.getItem('@bibliaeN:supportReports');
      const parsed   = raw ? JSON.parse(raw) : null;
      const existing: object[] = Array.isArray(parsed) ? parsed : [];
      existing.push({
        timestamp:   new Date().toISOString(),
        types:       selected,
        description: description.trim(),
      });
      await AsyncStorage.setItem('@bibliaeN:supportReports', JSON.stringify(existing));
    } catch (_) { /* storage errors must not block the UI */ }

    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setSelected([]); setDescription(''); onClose(); }, 2000);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Pressable style={styles.supportBackdrop} onPress={handleClose}>
          <Pressable
            style={[styles.supportSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}
            onPress={e => e.stopPropagation()}
          >
            {/* Handle */}
            <View style={[styles.supportHandle, { backgroundColor: colors.border }]} />

            {/* Header */}
            <View style={styles.supportModalHeader}>
              <Text style={[styles.supportModalTitle, { color: colors.foreground }]}>Reportar problema</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Sent confirmation */}
            {sent ? (
              <View style={styles.supportSentBox}>
                <Feather name="check-circle" size={40} color={colors.primary} />
                <Text style={[styles.supportSentTitle, { color: colors.foreground }]}>Obrigado!</Text>
                <Text style={[styles.supportSentSub, { color: colors.mutedForeground }]}>
                  Seu relatório foi registrado.{'\n'}Vamos trabalhar nisso em breve.
                </Text>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={styles.supportBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Issue type chips */}
                <Text style={[styles.supportFieldLabel, { color: colors.mutedForeground }]}>
                  TIPO DE PROBLEMA
                </Text>
                <View style={styles.supportChips}>
                  {ISSUE_TYPES.map(({ icon, label }) => {
                    const active = selected.includes(label);
                    return (
                      <TouchableOpacity
                        key={label}
                        onPress={() => toggleType(label)}
                        activeOpacity={0.75}
                        style={[styles.supportChip, {
                          borderColor:     active ? colors.primary : colors.border,
                          backgroundColor: active ? colors.primary + '12' : colors.background,
                        }]}
                      >
                        <Feather name={icon as any} size={13}
                          color={active ? colors.primary : colors.mutedForeground} />
                        <Text style={[styles.supportChipText, {
                          color:      active ? colors.primary : colors.foreground,
                          fontFamily: active ? 'Inter_500Medium' : 'Inter_400Regular',
                        }]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Description */}
                <Text style={[styles.supportFieldLabel, { color: colors.mutedForeground, marginTop: 20 }]}>
                  DESCRIÇÃO
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Descreva o que aconteceu…"
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  style={[styles.supportInput, {
                    color:           colors.foreground,
                    backgroundColor: colors.muted,
                    borderColor:     colors.border,
                  }]}
                  textAlignVertical="top"
                />

                {/* Send */}
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={!canSend}
                  activeOpacity={0.8}
                  style={[styles.supportSendBtn, {
                    backgroundColor: canSend ? colors.primary : colors.muted,
                  }]}
                >
                  <Feather name="send" size={15}
                    color={canSend ? colors.primaryForeground : colors.mutedForeground} />
                  <Text style={[styles.supportSendText, {
                    color: canSend ? colors.primaryForeground : colors.mutedForeground,
                  }]}>
                    Enviar
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Settings Screen ───────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const colors   = useColors();
  const insets   = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { vocabulary, bookmarks, clearVocabulary } = useBible();

  const topPad    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  // 2-column grid — measured from the grid container; falls back to screen width
  // so cards are never invisible while waiting for the first onLayout.
  // Formula: (available - gap) / 2  where available = screen – scroll padding (32) – innerSection padding (28)
  const [themeGridW, setThemeGridW] = useState(0);
  const themeCardW = Math.floor(((themeGridW > 0 ? themeGridW : width - 60) - 8) / 2);

  const [level,       setLevel]       = useState<LevelKey>('intermediate');
  const [displayMode, setDisplayMode] = useState('EN+PT');
  const [showIPA,     setShowIPA]     = useState(true);
  const [autoTr,      setAutoTr]      = useState(true);
  const [vocabRemind, setVocabRemind] = useState(false);
  const [audioSpeed,  setAudioSpeed]  = useState('Normal');
  const [supportVisible, setSupportVisible] = useState(false);
  const [avatarUri,   setAvatarUri]   = useState<string | null>(null);
  const [userName,    setUserName]    = useState('');
  const [userEmail,   setUserEmail]   = useState('');

  const { atmosphere, setAtmosphere, accentColor, setAccentColor } = useTheme();
  const { lang, setLang, t: tl } = useLanguage();
  const audio = useAudio();

  // ── Scroll-to-section ───────────────────────────────────────────────────────
  const scrollRef      = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const scrollToSection = (key: string) => {
    const y = sectionOffsets.current[key];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
    setDrawerVisible(false);
  };

  // ── i18n atmosphere names/descs (inside component so tl() is available) ─────
  const atmosphereNames: Record<Atmosphere, string> = {
    parchment: tl('atmosphere_parchment'),
    cozy:      tl('atmosphere_cozy'),
    classic:   tl('atmosphere_classic'),
    dark:      tl('atmosphere_dark'),
    night:     tl('atmosphere_night'),
    library:   tl('atmosphere_library'),
    morning:   tl('atmosphere_morning'),
    minimal:   tl('atmosphere_minimal'),
    sepia:     tl('atmosphere_sepia'),
    focus:     tl('atmosphere_focus'),
  };
  const atmosphereDescs: Record<Atmosphere, string> = {
    parchment: tl('atmosphere_parchment_desc'),
    cozy:      tl('atmosphere_cozy_desc'),
    classic:   tl('atmosphere_classic_desc'),
    dark:      tl('atmosphere_dark_desc'),
    night:     tl('atmosphere_night_desc'),
    library:   tl('atmosphere_library_desc'),
    morning:   tl('atmosphere_morning_desc'),
    minimal:   tl('atmosphere_minimal_desc'),
    sepia:     tl('atmosphere_sepia_desc'),
    focus:     tl('atmosphere_focus_desc'),
  };

  useEffect(() => {
    AsyncStorage.getItem(LEVEL_KEY)
      .then(v => { if (v === 'beginner' || v === 'advanced') setLevel(v as LevelKey); })
      .catch(() => {});
  }, []);
  const handleLevelChange = (v: LevelKey) => {
    setLevel(v);
    AsyncStorage.setItem(LEVEL_KEY, v).catch(() => {});
  };

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_KEY).then(v => { if (v) setAvatarUri(v); }).catch(() => {});
    AsyncStorage.getItem('@bibliaeN:userName').then(v => { if (v) setUserName(v); }).catch(() => {});
    AsyncStorage.getItem('@bibliaeN:userEmail').then(v => { if (v) setUserEmail(v); }).catch(() => {});
  }, []);

  const handlePickAvatar = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para alterar sua foto.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      AsyncStorage.setItem(AVATAR_KEY, uri).catch(() => {});
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleClearVocab = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Limpar todo o vocabulário salvo? Esta ação não pode ser desfeita.')) {
        clearVocabulary?.();
      }
    } else {
      Alert.alert(
        'Limpar Vocabulário',
        'Remover todas as palavras salvas? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Limpar', style: 'destructive', onPress: () => clearVocabulary?.() },
        ],
      );
    }
  };

  const [drawerVisible,     setDrawerVisible]     = useState(false);
  const [donateVisible,     setDonateVisible]     = useState(false);
  const [ambassadorVisible, setAmbassadorVisible] = useState(false);
  const [donateKey,         setDonateKey]         = useState(0); // bumped on open to reset modal state

  const handleDonate = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setDonateKey(k => k + 1);
    setDonateVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      <View style={[
        styles.header,
        { paddingTop: topPad + 14, borderBottomColor: colors.border, backgroundColor: colors.background },
      ]}>
        <View style={styles.headerTopRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{tl('settings_title')}</Text>
          <TouchableOpacity
            onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setDrawerVisible(true); }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="menu" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 8, gap: 6 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Profile ── */}
        <SettingsCard>
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8} style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {userName ? userName[0].toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <View style={[styles.avatarCam, { backgroundColor: colors.primary }]}>
                <Feather name="camera" size={10} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {userName || (lang === 'pt' ? 'Visitante' : 'Guest')}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
                {userEmail || (lang === 'pt' ? 'Faça login para salvar seu progresso' : 'Sign in to save your progress')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); router.push('/auth'); }}
              activeOpacity={0.8}
              style={[styles.planBadge, {
                backgroundColor: colors.primary + '14',
                borderColor:     colors.primary + '30',
              }]}
            >
              <Text style={[styles.planText, { color: colors.primary }]}>
                {tl('auth_login')} →
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            {[
              { label: tl('drawer_stat_favorites'), value: bookmarks.length },
              { label: tl('drawer_stat_words'),     value: vocabulary.length },
              { label: tl('drawer_stat_mastered'),  value: vocabulary.filter(v => v.mastered).length },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </SettingsCard>

        {/* ── Idioma ── */}
        <SectionLabel
          title={tl('section_language')}
          onLayout={e => { sectionOffsets.current['language'] = e.nativeEvent.layout.y; }}
        />
        <SettingsCard>
          <View style={styles.innerSection}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>{tl('app_language')}</Text>
            <View style={styles.pillRow}>
              {(['pt', 'en'] as const).map(l => {
                const active = lang === l;
                return (
                  <TouchableOpacity
                    key={l}
                    onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setLang(l); }}
                    activeOpacity={0.8}
                    style={[
                      styles.pill,
                      {
                        backgroundColor: active ? colors.primary : 'transparent',
                        borderColor:     active ? colors.primary : colors.border,
                        borderRadius:    colors.radius / 1.5,
                      },
                    ]}
                  >
                    <Text style={[styles.pillText, { color: active ? colors.primaryForeground : colors.mutedForeground }]}>
                      {l === 'pt' ? 'Português' : 'English'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </SettingsCard>

        {/* ── Aparência ── */}
        <SectionLabel
          title={tl('section_appearance')}
          onLayout={e => { sectionOffsets.current['appearance'] = e.nativeEvent.layout.y; }}
        />
        <SettingsCard>
          {/* Reading atmosphere grid — premium palette previews, no photos */}
          <View style={[styles.innerSection, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>{tl('reading_atmosphere')}</Text>
            <Text style={[styles.innerSubLabel, { color: colors.mutedForeground }]}>{tl('reading_atmosphere_sub')}</Text>
            <View
              style={styles.themeGrid}
              onLayout={e => setThemeGridW(e.nativeEvent.layout.width)}
            >
              {ATMOSPHERE_IDS.map(id => {
                const active  = atmosphere === id;
                const preview = getAtmospherePreview(id);
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setAtmosphere(id); }}
                    activeOpacity={0.8}
                    style={[
                      styles.themeCard,
                      {
                        width:           themeCardW,
                        backgroundColor: colors.card,
                        borderColor:     active ? colors.primary : colors.border,
                        borderWidth:     active ? 1.5 : StyleSheet.hairlineWidth,
                        borderRadius:    colors.radius / 1.5,
                      },
                    ]}
                  >
                    <View style={[styles.themePreview, {
                      backgroundColor: preview.background,
                      borderTopLeftRadius:  colors.radius / 1.5,
                      borderTopRightRadius: colors.radius / 1.5,
                    }]}>
                      {/* "Card" swatch — represents the material/paper surface */}
                      <View style={[styles.atmCardSwatch, { backgroundColor: preview.card, borderColor: preview.surface }]} />
                      {/* Typography-contrast lines on the card swatch */}
                      <View style={styles.atmLineGroup}>
                        {([64, 42] as const).map((w, i) => (
                          <View
                            key={i}
                            style={[
                              styles.atmLine,
                              { width: `${w}%` as any, backgroundColor: preview.foreground, opacity: preview.isDark ? 0.55 : 0.30 },
                            ]}
                          />
                        ))}
                      </View>
                      {/* Curated secondary-accent dot — the atmosphere's "material style" */}
                      <View style={[styles.atmAccentDot, { backgroundColor: preview.secondaryAccent }]} />
                      {active && (
                        <View style={[styles.themeCheck, { backgroundColor: colors.primary }]}>
                          <Feather name="check" size={8} color={colors.primaryForeground} />
                        </View>
                      )}
                    </View>
                    <View style={styles.themeCardBody}>
                      <Text style={[styles.themeCardName, { color: colors.foreground }]} numberOfLines={1}>
                        {atmosphereNames[id]}
                      </Text>
                      <Text style={[styles.themeCardDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {atmosphereDescs[id]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Accent color circles */}
          <View style={styles.innerSection}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>{tl('accent_color')}</Text>
            <View style={styles.accentRow}>
              {ACCENT_COLORS.map(c => {
                const active = accentColor === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setAccentColor(c.id); }}
                    activeOpacity={0.8}
                    style={[
                      styles.accentCircleOuter,
                      active && { borderColor: c.hex, borderWidth: 2.5 },
                    ]}
                  >
                    <View style={[styles.accentCircle, { backgroundColor: c.hex }]}>
                      {active && <Feather name="check" size={13} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </SettingsCard>

        {/* ── Aprendizado ── */}
        <SectionLabel
          title={tl('section_learning')}
          onLayout={e => { sectionOffsets.current['learning'] = e.nativeEvent.layout.y; }}
        />
        <SettingsCard>
          <View style={[styles.innerSection, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>{tl('english_level')}</Text>
            <LevelPillSelector value={level} onChange={handleLevelChange} />
          </View>
          <View style={styles.innerSection}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>{tl('display_mode')}</Text>
            <SegmentedControl options={['EN', 'EN+PT', 'PT']} value={displayMode} onChange={setDisplayMode} />
          </View>
        </SettingsCard>

        <SettingsCard>
          <ToggleRow icon="type"  label={tl('ipa')}            sub={tl('ipa_sub')}          value={showIPA}     onChange={setShowIPA} />
          <ToggleRow icon="globe" label={tl('auto_translate')} sub={tl('auto_tr_sub')}      value={autoTr}      onChange={setAutoTr} />
          <ToggleRow icon="bell"  label={tl('vocab_reminder')} sub={tl('vocab_rem_sub')}    value={vocabRemind} onChange={setVocabRemind} border={false} />
        </SettingsCard>

        {/* ── Áudio ── */}
        <SectionLabel
          title={tl('section_audio')}
          onLayout={e => { sectionOffsets.current['audio'] = e.nativeEvent.layout.y; }}
        />
        <SettingsCard>
          <View style={styles.innerSection}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>{tl('audio_voice')}</Text>
            <Text style={[styles.innerSubLabel, { color: colors.mutedForeground }]}>{tl('audio_voice_sub')}</Text>
            <View style={{ height: 10 }} />
            <VoicePillSelector value={audio.voice} onChange={audio.setVoice} />
          </View>
        </SettingsCard>

        {/* ── Compartilhar ── */}
        <SectionLabel
          title={tl('section_share')}
          onLayout={e => { sectionOffsets.current['share'] = e.nativeEvent.layout.y; }}
        />
        <SettingsCard>
          <SettingsRow
            icon="share-2"
            label={tl('share_verse')}
            sub={tl('share_verse_sub')}
            onPress={async () => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              try {
                await Share.share({
                  message: lang === 'pt'
                    ? 'Estou aprendendo inglês com o Bread&Light — leitura da Bíblia em inglês com tradução palavra a palavra. Experimente!'
                    : "I'm learning English with Bread&Light — read the Bible in English with word-by-word translation. Try it!",
                });
              } catch {}
            }}
          />
          <SettingsRow
            icon="user-plus"
            label={tl('invite_friend')}
            sub={tl('invite_sub')}
            onPress={async () => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              try {
                await Share.share({
                  message: lang === 'pt'
                    ? 'Convido você para o Bread&Light: aprenda inglês lendo a Bíblia. Grátis!'
                    : 'Join me on Bread&Light: learn English by reading the Bible. Free!',
                });
              } catch {}
            }}
            border={false}
          />
        </SettingsCard>

        {/* ── Apoio ── */}
        <SectionLabel
          title={tl('section_support')}
          onLayout={e => { sectionOffsets.current['support'] = e.nativeEvent.layout.y; }}
        />
        <SettingsCard>
          {/* Mission header */}
          <View style={[styles.supportHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.supportBadge, {
              backgroundColor: colors.primary + '12',
              borderColor:     colors.primary + '28',
            }]}>
              <Text style={[styles.supportBadgeText, { color: colors.primary }]}>
                {tl('free_forever').toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.supportTitle, { color: colors.foreground }]}>Bread{'&'}Light</Text>
            <Text style={[styles.supportDesc, { color: colors.mutedForeground }]}>
              {lang === 'pt'
                ? 'Uma missão simples: ajudar pessoas a aprender inglês através da Bíblia. Gratuito agora e sempre.'
                : 'A simple mission: helping people learn English through the Bible. Free now and always.'}
            </Text>
          </View>

          <SettingsRow
            icon="heart"
            label={tl('donate')}
            sub={tl('donate_sub')}
            onPress={handleDonate}
          />
          <SettingsRow
            icon="star"
            label={tl('ambassador')}
            sub={tl('ambassador_sub')}
            onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setAmbassadorVisible(true); }}
            border={false}
          />
        </SettingsCard>

        {/* ── Dados ── */}
        <SectionLabel
          title={tl('section_data')}
          onLayout={e => { sectionOffsets.current['data'] = e.nativeEvent.layout.y; }}
        />
        <SettingsCard>
          <SettingsRow
            icon="trash-2"
            label={tl('clear_vocab')}
            sub={`${vocabulary.length} palavra${vocabulary.length !== 1 ? 's' : ''} salva${vocabulary.length !== 1 ? 's' : ''}`}
            onPress={handleClearVocab}
            border={false}
          />
        </SettingsCard>

        {/* ── Sobre ── */}
        <SectionLabel
          title={tl('section_about')}
          onLayout={e => { sectionOffsets.current['about'] = e.nativeEvent.layout.y; }}
        />
        <SettingsCard>
          <SettingsRow icon="info"      label={tl('version_label')} sub="1.1.26" />
          <SettingsRow
            icon="life-buoy"
            label={tl('support_label')}
            sub={tl('support_sub')}
            onPress={() => setSupportVisible(true)}
            border={false}
          />
        </SettingsCard>

        <SupportModal    visible={supportVisible}    onClose={() => setSupportVisible(false)} />
        <DonationModal   key={donateKey} visible={donateVisible} onClose={() => setDonateVisible(false)} />
        <AmbassadorModal visible={ambassadorVisible} onClose={() => setAmbassadorVisible(false)} />

      </ScrollView>

      {/* ── Drawer ── */}
      <SettingsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onScrollToSection={scrollToSection}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header — matches home screen style
  header: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.2,
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 10,
    marginHorizontal: 2,
  },

  card: { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  rowIcon:  { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText:  { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  rowSub:   { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },

  // Custom toggle
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  toggleThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 3,
  },

  // Profile
  profileRow:  { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatarWrapper: { position: 'relative' },
  avatar:      { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  avatarCam:   { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  avatarText:  { fontSize: 22, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  profileEmail:{ fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  planBadge:   { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  planText:    { fontSize: 12, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },

  statsRow:   { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  stat:       { flex: 1, alignItems: 'center', gap: 2 },
  statValue:  { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  statLabel:  { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statDivider:{ width: StyleSheet.hairlineWidth, marginVertical: 4 },

  innerSection: { paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  innerLabel:   { fontSize: 12, fontFamily: 'Inter_500Medium', letterSpacing: 0.3 },

  // Pills — border on all, filled when active
  pillRow:  { flexDirection: 'row', gap: 7 },
  pill:     { flex: 1, alignItems: 'center', paddingVertical: 9, paddingHorizontal: 4, borderWidth: 1 },
  pillText: { fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  levelPill:{ paddingVertical: 9, gap: 3 },
  cefrCode: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  // Segmented control — equal thirds, single border container
  segControl: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden', height: 40 },
  segItem:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  segText:    { fontSize: 13, letterSpacing: 0.1 },

  // Support / Apoio card (Apoio section)
  supportHeader:    { padding: 20, paddingBottom: 28, gap: 7, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  supportBadge:     { alignSelf: 'center', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  supportBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.2 },
  supportTitle:     { fontSize: 22, fontFamily: 'Lora_700Bold', letterSpacing: -0.3, textAlign: 'center' },
  supportDesc:      { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20, textAlign: 'center' },

  // SupportModal sheet
  supportBackdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  supportSheet:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingTop: 10 },
  supportHandle:      { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 2 },
  supportModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  supportModalTitle:  { fontSize: 17, fontFamily: 'Inter_700Bold' },
  supportBody:        { paddingHorizontal: 20, paddingBottom: 8 },
  supportFieldLabel:  { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.3, marginBottom: 10 },
  supportChips:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  supportChip:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20, borderWidth: 1 },
  supportChipText:    { fontSize: 13 },
  supportInput:       { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, minHeight: 100, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22, marginBottom: 16 },
  supportSendBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  supportSendText:    { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  supportSentBox:     { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 12 },
  supportSentTitle:   { fontSize: 22, fontFamily: 'Lora_700Bold' },
  supportSentSub:     { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },

  // Donation modal
  donateBackdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  donateSheet:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, maxHeight: '90%' },
  donateHandle:    { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 6 },
  donateHeader:    { alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20, gap: 8 },
  donateIconCircle:{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  donateTitle:     { fontSize: 20, fontFamily: 'Lora_700Bold', textAlign: 'center' },
  donateSub:       { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  amountGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, marginBottom: 12 },
  amountBtn:       { width: '47%', paddingVertical: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, gap: 2 },
  amountCurrency:  { fontSize: 12, fontFamily: 'Inter_500Medium' },
  amountValue:     { fontSize: 26, fontFamily: 'Inter_700Bold', lineHeight: 30 },
  customRow:       { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, gap: 6 },
  customPrefix:    { fontSize: 16, fontFamily: 'Inter_500Medium' },
  customInput:     { flex: 1, fontSize: 20, fontFamily: 'Inter_500Medium' },
  donateBtn:       { marginHorizontal: 20, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  donateBtnText:   { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  donateLegal:     { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 24, marginBottom: 8, lineHeight: 17 },

  // Ambassador modal
  ambassadorSheet:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, maxHeight: '90%' },
  ambassadorHeader:      { alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16, gap: 8 },
  ambassadorCrown:       { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  ambassadorTitle:       { fontSize: 20, fontFamily: 'Lora_700Bold', textAlign: 'center' },
  ambassadorPriceRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  ambassadorPrice:       { fontSize: 32, fontFamily: 'Inter_700Bold', lineHeight: 36 },
  ambassadorPer:         { fontSize: 14, fontFamily: 'Inter_400Regular', paddingBottom: 4 },
  ambassadorDesc:        { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  ambassadorDivider:     { height: StyleSheet.hairlineWidth, marginHorizontal: 20, marginBottom: 16 },
  ambassadorFeatures:    { paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  ambassadorFeatureRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ambassadorFeatureIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  ambassadorFeatureText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 21 },
  ambassadorBtn:         { marginHorizontal: 20, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  ambassadorBtnText:     { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  ambassadorShareBtn:    { marginHorizontal: 20, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: StyleSheet.hairlineWidth, marginBottom: 6 },
  ambassadorShareText:   { fontSize: 14, fontFamily: 'Inter_400Regular' },

  // Reading atmosphere grid — 2-column, fills width
  innerSubLabel:{ fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: -6, opacity: 0.85 },
  themeGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  themeCard:    { overflow: 'hidden' },
  themePreview: { height: 72, padding: 10, justifyContent: 'flex-end' },
  themeCheck:   { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  themeCardBody:{ paddingHorizontal: 9, paddingTop: 6, paddingBottom: 9, gap: 2 },
  themeCardName:{ fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  themeCardDesc:{ fontSize: 10, fontFamily: 'Inter_400Regular', opacity: 0.7 },

  // Atmosphere palette-swatch preview (material style, no photos)
  atmCardSwatch: { position: 'absolute', left: 10, right: 10, top: 10, bottom: 10, borderRadius: 6, borderWidth: 1 },
  atmLineGroup:  { gap: 4, paddingLeft: 4, paddingBottom: 2 },
  atmLine:       { height: 3, borderRadius: 2 },
  atmAccentDot:  { position: 'absolute', right: 8, bottom: 8, width: 10, height: 10, borderRadius: 5 },

  // Accent circles
  accentRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accentCircleOuter:{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderColor: 'transparent' },
  accentCircle:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  // Header
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});

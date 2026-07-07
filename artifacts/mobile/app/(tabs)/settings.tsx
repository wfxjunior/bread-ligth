import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
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
import type { ReadingTheme, AccentColor } from '@/constants/colors';

// ── Reading theme data ────────────────────────────────────────────────────────
const READING_THEMES: { id: ReadingTheme; name: string; desc: string; bg: string; dark: boolean }[] = [
  { id: 'classic',  name: 'Pergaminho', desc: 'Quente, suave',  bg: '#FAF8F4', dark: false },
  { id: 'oxford',   name: 'Oxford',     desc: 'Branco nítido',  bg: '#FFFFFF', dark: false },
  { id: 'scholar',  name: 'Estudioso',  desc: 'Tom neutro',     bg: '#ECEAE6', dark: false },
  { id: 'night',    name: 'Noturno',    desc: 'Modo escuro',    bg: '#1C1E22', dark: true  },
  { id: 'notebook', name: 'Caderno',    desc: 'Leve e casual',  bg: '#FEF9F0', dark: false },
];

const ACCENT_COLORS: { id: AccentColor; hex: string; label: string }[] = [
  { id: 'royal-blue', hex: '#1B3A6B', label: 'Azul Real' },
  { id: 'burgundy',   hex: '#6B1E2A', label: 'Bordô'     },
  { id: 'forest',     hex: '#1E4D2B', label: 'Floresta'  },
  { id: 'slate',      hex: '#3D4A5C', label: 'Ardósia'   },
  { id: 'violet',     hex: '#3B1E6B', label: 'Violeta'   },
];

const AVATAR_KEY = '@bibliaeN:avatar';

// ── Donation modal ────────────────────────────────────────────────────────────
const PRESET_AMOUNTS = [5, 10, 20, 50];

function DonationModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const [selected, setSelected] = useState<number | null>(null);
  const [custom,   setCustom]   = useState('');

  const raw    = custom.replace(',', '.');
  const amount = custom ? parseFloat(raw) : selected;
  const valid  = typeof amount === 'number' && !isNaN(amount) && amount > 0;

  const pick = (a: number) => { setSelected(a); setCustom(''); if (Platform.OS !== 'web') Haptics.selectionAsync(); };

  const handleContinue = () => {
    if (!valid) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Obrigado! 💛',
      `Seu apoio de R${amount} significa muito!\n\nO processamento de pagamento estará disponível em breve.`,
      [{ text: 'OK', onPress: onClose }],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.donateBackdrop} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable
            style={[styles.donateSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}
            onPress={e => e.stopPropagation()}
          >
            <View style={[styles.donateHandle, { backgroundColor: colors.border }]} />

            {/* Header */}
            <View style={styles.donateHeader}>
              <View style={[styles.donateIconCircle, { backgroundColor: colors.primary + '16' }]}>
                <Feather name="heart" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.donateTitle, { color: colors.foreground }]}>Apoiar o BíbliaEN</Text>
              <Text style={[styles.donateSub, { color: colors.mutedForeground }]}>
                Cada doação mantém o app gratuito e nos ajuda a crescer. 🙏
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
                    <Text style={[styles.amountCurrency, { color: active ? colors.primary : colors.mutedForeground }]}>R$</Text>
                    <Text style={[styles.amountValue,    { color: active ? colors.primary : colors.foreground }]}>{a}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom amount */}
            <View style={[styles.customRow, {
              borderColor:  custom ? colors.primary : colors.border,
              borderRadius: colors.radius,
              backgroundColor: colors.muted,
            }]}>
              <Text style={[styles.customPrefix, { color: colors.mutedForeground }]}>R$</Text>
              <TextInput
                value={custom}
                onChangeText={t => { setCustom(t.replace(/[^0-9,.]/g, '')); setSelected(null); }}
                placeholder="Outro valor"
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
              <Text style={[styles.donateBtnText, {
                color: valid ? colors.primaryForeground : colors.mutedForeground,
              }]}>
                {valid ? `Continuar com R${amount}` : 'Selecione um valor'}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.donateLegal, { color: colors.mutedForeground }]}>
              Pagamento seguro via Pix ou cartão • Cancele quando quiser
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
        message: '📖 Estou aprendendo inglês com o BíbliaEN — gratuito e incrível! Confira: bibleenglish.app',
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
            <Text style={[styles.ambassadorTitle, { color: colors.foreground }]}>Embaixador BíbliaEN</Text>
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
function SectionLabel({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
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

// ── Pill selector ─────────────────────────────────────────────────────────────
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

// ── Level pill selector ───────────────────────────────────────────────────────
const LEVEL_OPTIONS = [
  { key: 'beginner',     label: 'Iniciante',    code: 'A2' },
  { key: 'intermediate', label: 'Intermediário', code: 'B1' },
  { key: 'advanced',     label: 'Avançado',      code: 'C1' },
] as const;
export type LevelKey = typeof LEVEL_OPTIONS[number]['key'];
const LEVEL_KEY = '@bibliaeN:level';

function LevelPillSelector({ value, onChange }: { value: LevelKey; onChange: (v: LevelKey) => void }) {
  const colors = useColors();
  return (
    <View style={styles.pillRow}>
      {LEVEL_OPTIONS.map(({ key, label, code }) => {
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

  // 3-column grid card width: screen - h-padding (32) - two gaps (16)
  const themeCardW = Math.floor((width - 32 - 16) / 3);

  const [level,       setLevel]       = useState<LevelKey>('intermediate');
  const [displayMode, setDisplayMode] = useState('EN+PT');
  const [showIPA,     setShowIPA]     = useState(true);
  const [autoTr,      setAutoTr]      = useState(true);
  const [vocabRemind, setVocabRemind] = useState(false);
  const [audioSpeed,  setAudioSpeed]  = useState('Normal');
  const [linkCopied,    setLinkCopied]    = useState(false);
  const [supportVisible, setSupportVisible] = useState(false);
  const [avatarUri,   setAvatarUri]   = useState<string | null>(null);

  const { readingTheme, setReadingTheme, accentColor, setAccentColor } = useTheme();

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

  const [donateVisible,     setDonateVisible]     = useState(false);
  const [ambassadorVisible, setAmbassadorVisible] = useState(false);
  const [donateKey,         setDonateKey]         = useState(0); // bumped on open to reset modal state

  const handleDonate = () => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setDonateKey(k => k + 1);
    setDonateVisible(true);
  };

  const handleCopyLink = async () => {
    try {
      await Share.share({ message: 'bibleenglish.app/invite/wilson', url: 'https://bibleenglish.app/invite/wilson' });
      setLinkCopied(true);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setLinkCopied(false), 2500);
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      <View style={[
        styles.header,
        { paddingTop: topPad + 14, borderBottomColor: colors.border, backgroundColor: colors.background },
      ]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Configurações</Text>
      </View>

      <ScrollView
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
                  <Text style={[styles.avatarText, { color: colors.primary }]}>W</Text>
                </View>
              )}
              <View style={[styles.avatarCam, { backgroundColor: colors.primary }]}>
                <Feather name="camera" size={10} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>Wilson</Text>
              <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>wilson@email.com</Text>
            </View>
            <View style={[styles.planBadge, {
              backgroundColor: colors.primary + '14',
              borderColor:     colors.primary + '30',
            }]}>
              <Text style={[styles.planText, { color: colors.primary }]}>Gratuito</Text>
            </View>
          </View>
          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            {[
              { label: 'Favoritos', value: bookmarks.length },
              { label: 'Palavras',  value: vocabulary.length },
              { label: 'Dominadas', value: vocabulary.filter(v => v.mastered).length },
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

        {/* ── Aparência ── */}
        <SectionLabel title="Aparência" />
        <SettingsCard>
          {/* Reading theme grid */}
          <View style={[styles.innerSection, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>Tema de Leitura</Text>
            <View style={styles.themeGrid}>
              {READING_THEMES.map(t => {
                const active = readingTheme === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setReadingTheme(t.id); }}
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
                    <View style={[styles.themePreview, { backgroundColor: t.bg, borderTopLeftRadius: colors.radius / 1.5, borderTopRightRadius: colors.radius / 1.5 }]}>
                      {([72, 90, 60] as const).map((w, i) => (
                        <View
                          key={i}
                          style={[
                            styles.themeLine,
                            { width: `${w}%` as any, backgroundColor: t.dark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.11)' },
                          ]}
                        />
                      ))}
                      {active && (
                        <View style={[styles.themeCheck, { backgroundColor: colors.primary }]}>
                          <Feather name="check" size={8} color={colors.primaryForeground} />
                        </View>
                      )}
                    </View>
                    <View style={styles.themeCardBody}>
                      <Text style={[styles.themeCardName, { color: colors.foreground }]} numberOfLines={1}>
                        {t.name}
                      </Text>
                      <Text style={[styles.themeCardDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {t.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Accent color circles */}
          <View style={styles.innerSection}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>Cor de Destaque</Text>
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
        <SectionLabel title="Aprendizado" />
        <SettingsCard>
          <View style={[styles.innerSection, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>Nível de Inglês</Text>
            <LevelPillSelector value={level} onChange={handleLevelChange} />
          </View>
          <View style={styles.innerSection}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>Modo de Exibição</Text>
            <PillSelector options={['EN', 'EN+PT', 'PT']} value={displayMode} onChange={setDisplayMode} />
          </View>
        </SettingsCard>

        <SettingsCard>
          <ToggleRow icon="type"  label="Pronúncia (IPA)"        sub="Mostrar fonética ao tocar palavras" value={showIPA}     onChange={setShowIPA} />
          <ToggleRow icon="globe" label="Tradução automática"     sub="Traduzir palavras tocadas"          value={autoTr}      onChange={setAutoTr} />
          <ToggleRow icon="bell"  label="Lembrete de vocabulário" sub="Revisar palavras diariamente"       value={vocabRemind} onChange={setVocabRemind} border={false} />
        </SettingsCard>

        {/* ── Áudio ── */}
        <SectionLabel title="Áudio" />
        <SettingsCard>
          <View style={styles.innerSection}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>Velocidade de Reprodução</Text>
            <PillSelector options={['0.75×', 'Normal', '1.25×', '1.5×']} value={audioSpeed} onChange={setAudioSpeed} />
          </View>
        </SettingsCard>

        {/* ── Compartilhar ── */}
        <SectionLabel title="Compartilhar" />
        <SettingsCard>
          <SettingsRow icon="share-2"   label="Compartilhar versículo" sub="Enviar como imagem ou texto" onPress={() => {}} />
          <SettingsRow icon="user-plus" label="Convidar um amigo"      sub="30 dias grátis de Premium"  onPress={() => {}} />
          <SettingsRow
            icon="link"
            label="Seu link de convite"
            sub="bibleenglish.app/invite/wilson"
            border={false}
            onPress={handleCopyLink}
            right={
              <View style={[styles.copyBtn, {
                backgroundColor: linkCopied ? colors.primary + '14' : colors.secondary,
                borderRadius: 8,
              }]}>
                <Feather name={linkCopied ? 'check' : 'share-2'} size={14} color={linkCopied ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.copyText, { color: linkCopied ? colors.primary : colors.mutedForeground }]}>
                  {linkCopied ? 'Compartilhado!' : 'Compartilhar'}
                </Text>
              </View>
            }
          />
        </SettingsCard>

        {/* ── Apoio ── */}
        <SectionLabel title="Apoio" />
        <SettingsCard>
          {/* Mission header */}
          <View style={[styles.supportHeader, { borderBottomColor: colors.border }]}>
            <View style={[styles.supportBadge, {
              backgroundColor: colors.primary + '12',
              borderColor:     colors.primary + '28',
            }]}>
              <Text style={[styles.supportBadgeText, { color: colors.primary }]}>
                GRATUITO PARA SEMPRE
              </Text>
            </View>
            <Text style={[styles.supportTitle, { color: colors.foreground }]}>BíbliaEN</Text>
            <Text style={[styles.supportDesc, { color: colors.mutedForeground }]}>
              Uma missão simples: ajudar pessoas a aprender inglês através da Bíblia.
              Gratuito agora e sempre.
            </Text>
          </View>

          <SettingsRow
            icon="heart"
            label="Fazer uma doação"
            sub="Apoie o desenvolvimento do app"
            onPress={handleDonate}
          />
          <SettingsRow
            icon="star"
            label="Ser Embaixador"
            sub="Plano mensal com benefícios exclusivos"
            onPress={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); setAmbassadorVisible(true); }}
            border={false}
          />
        </SettingsCard>

        {/* ── Dados ── */}
        <SectionLabel title="Dados" />
        <SettingsCard>
          <SettingsRow
            icon="trash-2"
            label="Limpar vocabulário"
            sub={`${vocabulary.length} palavra${vocabulary.length !== 1 ? 's' : ''} salva${vocabulary.length !== 1 ? 's' : ''}`}
            onPress={handleClearVocab}
            border={false}
          />
        </SettingsCard>

        {/* ── Sobre ── */}
        <SectionLabel title="Sobre" />
        <SettingsCard>
          <SettingsRow icon="info" label="Versão" sub="1.1.26" />
          <SettingsRow
            icon="life-buoy"
            label="Suporte"
            sub="Reporte um problema ou erro"
            onPress={() => setSupportVisible(true)}
            border={false}
          />
        </SettingsCard>

        <SupportModal    visible={supportVisible}    onClose={() => setSupportVisible(false)} />
        <DonationModal   key={donateKey} visible={donateVisible} onClose={() => setDonateVisible(false)} />
        <AmbassadorModal visible={ambassadorVisible} onClose={() => setAmbassadorVisible(false)} />

      </ScrollView>
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
    fontSize: 34,
    fontFamily: 'Lora_700Bold',
    letterSpacing: -0.5,
    lineHeight: 40,
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
    marginTop: 14,
    marginBottom: 4,
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

  copyBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  copyText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  // Support / Apoio card (Apoio section)
  supportHeader:    { padding: 16, paddingBottom: 14, gap: 7, borderBottomWidth: StyleSheet.hairlineWidth },
  supportBadge:     { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  supportBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 1.2 },
  supportTitle:     { fontSize: 22, fontFamily: 'Lora_700Bold', letterSpacing: -0.3 },
  supportDesc:      { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },

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

  // Reading theme grid
  themeGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  themeCard:    { overflow: 'hidden' },
  themePreview: { height: 52, padding: 8, justifyContent: 'flex-end', gap: 4 },
  themeLine:    { height: 3, borderRadius: 2 },
  themeCheck:   { position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  themeCardBody:{ paddingHorizontal: 7, paddingTop: 5, paddingBottom: 7, gap: 1 },
  themeCardName:{ fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  themeCardDesc:{ fontSize: 9,  fontFamily: 'Inter_400Regular', opacity: 0.7 },

  // Accent circles
  accentRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  accentCircleOuter:{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderColor: 'transparent' },
  accentCircle:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});

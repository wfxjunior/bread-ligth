import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
  { id: 'amber',      hex: '#7A5C1E', label: 'Âmbar'     },
];

const AVATAR_KEY = '@bibliaeN:avatar';

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
  const [waitlisted,  setWaitlisted]  = useState(false);
  const [linkCopied,  setLinkCopied]  = useState(false);
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

        {/* ── Plano Premium ── */}
        <SectionLabel title="Plano" />
        <View style={[styles.premiumCard, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
          <View style={styles.premiumTop}>
            <View>
              <Text style={styles.premiumLabel}>PREMIUM</Text>
              <Text style={styles.premiumTitle}>Bible English</Text>
            </View>
            <View style={styles.premiumPrice}>
              <Text style={styles.premiumAmount}>$4.99</Text>
              <Text style={styles.premiumPer}>/mês</Text>
            </View>
          </View>

          <View style={styles.premiumFeatures}>
            {[
              'Todos os 66 livros',
              'Cores personalizadas',
              'Devocionais ilimitados',
              'Exportar anotações',
              'Áudio em todos os capítulos',
              'Gramática avançada',
            ].map(f => (
              <View key={f} style={styles.featureRow}>
                <Feather name="check" size={13} color={colors.accent} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setWaitlisted(true);
            }}
            style={[styles.premiumBtn, {
              backgroundColor: waitlisted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.92)',
              borderRadius: colors.radius,
            }]}
            activeOpacity={0.85}
          >
            <Feather name={waitlisted ? 'check' : 'star'} size={16} color={waitlisted ? '#fff' : colors.primary} />
            <Text style={[styles.premiumBtnText, { color: waitlisted ? '#fff' : colors.primary }]}>
              {waitlisted ? 'Na lista de espera!' : 'Entrar na lista de espera'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.premiumSub}>Beta privado — em breve</Text>
        </View>

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
          <SettingsRow icon="info" label="Versão" sub="1.0.0 (beta)" border={false} />
        </SettingsCard>

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

  premiumCard:    { padding: 20, gap: 16 },
  premiumTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  premiumLabel:   { fontSize: 10, fontFamily: 'Inter_700Bold', color: 'rgba(255,255,255,0.50)', letterSpacing: 1.6 },
  premiumTitle:   { fontSize: 24, fontFamily: 'Lora_700Bold', color: '#FFFFFF', marginTop: 3 },
  premiumPrice:   { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  premiumAmount:  { fontSize: 30, fontFamily: 'Inter_700Bold', color: '#FFFFFF', fontWeight: '700' as const },
  premiumPer:     { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.55)' },
  premiumFeatures:{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' },
  featureText:    { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)', flex: 1 },
  premiumBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  premiumBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  premiumSub:     { fontSize: 11, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.40)', textAlign: 'center' },

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
  accentRow:       { flexDirection: 'row', gap: 12, flexWrap: 'wrap', alignItems: 'center' },
  accentCircleOuter:{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderColor: 'transparent' },
  accentCircle:    { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

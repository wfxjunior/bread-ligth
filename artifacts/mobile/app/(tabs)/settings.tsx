import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Share,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { useBible } from '@/context/BibleContext';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';

const AVATAR_KEY = '@bibliaeN:avatar';

// ── Small reusable components ─────────────────────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
      {title.toUpperCase()}
    </Text>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      {children}
    </View>
  );
}

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
      style={[styles.row, border && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.primary + '15' }]}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        {sub ? <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
      </View>
      {right ?? (onPress ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} /> : null)}
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon, label, sub, value, onChange, border = true,
}: {
  icon: string; label: string; sub?: string;
  value: boolean; onChange: (v: boolean) => void; border?: boolean;
}) {
  const colors = useColors();
  const handleChange = (v: boolean) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    onChange(v);
  };
  return (
    <SettingsRow
      icon={icon} label={label} sub={sub} border={border}
      right={
        <Switch
          value={value}
          onValueChange={handleChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={Platform.OS === 'android' ? (value ? colors.primary : colors.muted) : '#fff'}
          ios_backgroundColor={colors.border}
        />
      }
    />
  );
}

function PillSelector({
  options, value, onChange,
}: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.pillRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            onChange(opt);
          }}
          style={[
            styles.pill,
            {
              backgroundColor: value === opt ? colors.primary : colors.secondary,
              borderRadius: colors.radius / 2,
            },
          ]}
        >
          <Text style={[styles.pillText, { color: value === opt ? colors.primaryForeground : colors.foreground }]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Level pill selector with CEFR codes — value/onChange use the stored key
const LEVEL_OPTIONS = [
  { key: 'beginner',     label: 'Iniciante',     code: 'A2' },
  { key: 'intermediate', label: 'Intermediário',  code: 'B1' },
  { key: 'advanced',     label: 'Avançado',       code: 'C1' },
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
                backgroundColor: active ? colors.primary : colors.secondary,
                borderRadius: colors.radius / 2,
              },
            ]}
          >
            <Text style={[styles.pillText, { color: active ? colors.primaryForeground : colors.foreground }]}>
              {label}
            </Text>
            <Text style={[
              styles.cefrCode,
              { color: active ? colors.primaryForeground + 'CC' : colors.mutedForeground },
            ]}>
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
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { vocabulary, bookmarks, clearVocabulary } = useBible();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = useTabBarHeight();

  // English level — synced with Chapter screen via AsyncStorage
  const [level, setLevel] = useState<LevelKey>('intermediate');
  useEffect(() => {
    AsyncStorage.getItem(LEVEL_KEY)
      .then(v => { if (v === 'beginner' || v === 'advanced') setLevel(v); })
      .catch(() => {});
  }, []);
  const handleLevelChange = (v: LevelKey) => {
    setLevel(v);
    AsyncStorage.setItem(LEVEL_KEY, v).catch(() => {});
  };
  const [displayMode, setDisplayMode] = useState('EN+PT');
  const [showIPA,     setShowIPA]     = useState(true);
  const [autoTr,      setAutoTr]      = useState(true);
  const [vocabRemind, setVocabRemind] = useState(false);
  const [audioSpeed,  setAudioSpeed]  = useState('Normal');
  const { themeMode, setThemeMode }   = useTheme();
  const [waitlisted,  setWaitlisted]  = useState(false);
  const [linkCopied,  setLinkCopied]  = useState(false);
  const [avatarUri,   setAvatarUri]   = useState<string | null>(null);

  const THEME_LABELS: { value: ThemeMode; label: string }[] = [
    { value: 'system', label: 'Sistema' },
    { value: 'light',  label: 'Claro'   },
    { value: 'dark',   label: 'Escuro'  },
  ];

  // Load persisted avatar
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

      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Configurações</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad, gap: 8 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Profile ── */}
        <SettingsCard>
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={handlePickAvatar} activeOpacity={0.8} style={styles.avatarWrapper}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
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
            <View style={[styles.planBadge, { backgroundColor: colors.accent + '20', borderColor: colors.accent + '40' }]}>
              <Text style={[styles.planText, { color: colors.accent }]}>Free</Text>
            </View>
          </View>
          <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
            {[
              { label: 'Favoritos',  value: bookmarks.length },
              { label: 'Palavras',   value: vocabulary.length },
              { label: 'Dominadas',  value: vocabulary.filter(v => v.mastered).length },
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
          <View style={styles.innerSection}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>Tema</Text>
            <View style={styles.pillRow}>
              {THEME_LABELS.map(({ value, label }) => {
                const icon = value === 'system' ? 'monitor' : value === 'light' ? 'sun' : 'moon';
                const active = themeMode === value;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.selectionAsync();
                      setThemeMode(value);
                    }}
                    style={[
                      styles.pill,
                      { backgroundColor: active ? colors.primary : colors.secondary, borderRadius: colors.radius / 2 },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Feather name={icon as any} size={13} color={active ? colors.primaryForeground : colors.mutedForeground} />
                      <Text style={[styles.pillText, { color: active ? colors.primaryForeground : colors.foreground }]}>
                        {label}
                      </Text>
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
            <PillSelector
              options={['EN', 'EN+PT', 'PT']}
              value={displayMode}
              onChange={setDisplayMode}
            />
          </View>
        </SettingsCard>

        <SettingsCard>
          <ToggleRow icon="type"       label="Pronúncia (IPA)"        sub="Mostrar fonética ao tocar palavras" value={showIPA}     onChange={setShowIPA} />
          <ToggleRow icon="globe"      label="Tradução automática"     sub="Traduzir palavras tocadas"          value={autoTr}      onChange={setAutoTr} />
          <ToggleRow icon="bell"       label="Lembrete de vocabulário" sub="Revisar palavras diariamente"       value={vocabRemind} onChange={setVocabRemind} border={false} />
        </SettingsCard>

        {/* ── Áudio ── */}
        <SectionLabel title="Áudio" />
        <SettingsCard>
          <View style={styles.innerSection}>
            <Text style={[styles.innerLabel, { color: colors.mutedForeground }]}>Velocidade de Reprodução</Text>
            <PillSelector
              options={['0.75×', 'Normal', '1.25×', '1.5×']}
              value={audioSpeed}
              onChange={setAudioSpeed}
            />
          </View>
        </SettingsCard>

        {/* ── Compartilhar ── */}
        <SectionLabel title="Compartilhar" />
        <SettingsCard>
          <SettingsRow icon="share-2"   label="Compartilhar versículo"  sub="Enviar como imagem ou texto" onPress={() => {}} />
          <SettingsRow icon="user-plus" label="Convidar um amigo"       sub="30 dias grátis de Premium"   onPress={() => {}} />
          <SettingsRow
            icon="link"
            label="Seu link de convite"
            sub="bibleenglish.app/invite/wilson"
            border={false}
            onPress={handleCopyLink}
            right={
              <View style={[styles.copyBtn, { backgroundColor: linkCopied ? colors.accent + '20' : colors.secondary, borderRadius: 8 }]}>
                <Feather name={linkCopied ? 'check' : 'share-2'} size={14} color={linkCopied ? colors.accent : colors.mutedForeground} />
                <Text style={[styles.copyText, { color: linkCopied ? colors.accent : colors.mutedForeground }]}>
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
            style={[styles.premiumBtn, { backgroundColor: waitlisted ? colors.accent + '30' : colors.accent, borderRadius: colors.radius }]}
            activeOpacity={0.85}
          >
            <Feather name={waitlisted ? 'check' : 'star'} size={16} color={waitlisted ? colors.accent : '#fff'} />
            <Text style={[styles.premiumBtnText, { color: waitlisted ? colors.accent : '#fff' }]}>
              {waitlisted ? 'Na lista de espera!' : 'Entrar na lista de espera'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.premiumSub}>Beta privado — em breve</Text>
        </View>

        {/* ── Dados ── */}
        <SectionLabel title="Dados" />
        <SettingsCard>
          <SettingsRow icon="trash-2" label="Limpar vocabulário" sub={`${vocabulary.length} palavra${vocabulary.length !== 1 ? 's' : ''} salva${vocabulary.length !== 1 ? 's' : ''}`} onPress={handleClearVocab} border={false} />
        </SettingsCard>

        {/* ── Sobre ── */}
        <SectionLabel title="Sobre" />
        <SettingsCard>
          <SettingsRow icon="info"    label="Versão"        sub="1.0.0 (beta)"           border={false} />
        </SettingsCard>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, gap: 2 },
  headerTitle:  { fontSize: 26, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },

  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.1, marginTop: 12, marginBottom: 4, marginHorizontal: 4 },

  card:         { borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },

  row:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  rowIcon:      { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowText:      { flex: 1 },
  rowLabel:     { fontSize: 15, fontFamily: 'Inter_500Medium' },
  rowSub:       { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },

  profileRow:   { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  avatarWrapper:{ position: 'relative' },
  avatar:       { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarCam:    { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  avatarText:   { fontSize: 22, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  profileInfo:  { flex: 1 },
  profileName:  { fontSize: 17, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  profileEmail: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  planBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  planText:     { fontSize: 12, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },

  statsRow:     { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  stat:         { flex: 1, alignItems: 'center', gap: 2 },
  statValue:    { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  statLabel:    { fontSize: 11, fontFamily: 'Inter_400Regular' },
  statDivider:  { width: StyleSheet.hairlineWidth, marginVertical: 4 },

  innerSection: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  innerLabel:   { fontSize: 12, fontFamily: 'Inter_500Medium', letterSpacing: 0.3 },

  pillRow:      { flexDirection: 'row', gap: 6 },
  pill:         { flex: 1, alignItems: 'center', paddingVertical: 8 },
  pillText:     { fontSize: 13, fontFamily: 'Inter_500Medium' },
  levelPill:    { paddingVertical: 7, gap: 2 },
  cefrCode:     { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  copyBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6 },
  copyText:     { fontSize: 13, fontFamily: 'Inter_500Medium' },

  premiumCard:  { padding: 18, gap: 16 },
  premiumTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  premiumLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5 },
  premiumTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: '#FFFFFF', marginTop: 2 },
  premiumPrice: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  premiumAmount:{ fontSize: 30, fontFamily: 'Inter_700Bold', color: '#FFFFFF', fontWeight: '700' as const },
  premiumPer:   { fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.6)' },
  premiumFeatures:{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, width: '47%' },
  featureText:  { fontSize: 12, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.85)', flex: 1 },
  premiumBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  premiumBtnText:{ fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  premiumSub:   { fontSize: 11, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.45)', textAlign: 'center' },
});

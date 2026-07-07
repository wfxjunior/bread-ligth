/**
 * Auth screen — optional, modal, minimalist.
 * Unlocks: cross-device sync (free) + premium features (separate).
 */
import React, { useState, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/context/LanguageContext';

// ── Background gradient colors ────────────────────────────────────────────────
const BG: [string, string, string] = ['#0E0B07', '#1C1309', '#26180C'];

// ── Types ─────────────────────────────────────────────────────────────────────
type FormMode = 'login' | 'register';

// ── Main screen ───────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const insets   = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const [mode, setMode]               = useState<FormMode>('login');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);

  const haptic = () => { if (Platform.OS !== 'web') Haptics.selectionAsync(); };

  const handleSkip = () => { haptic(); router.back(); };

  const handleGoogle = async () => {
    haptic();
    // TODO: expo-auth-session Google OAuth
  };

  const handleApple = async () => {
    haptic();
    // TODO: expo-apple-authentication
  };

  const handleSubmit = async () => {
    if (loading) return;
    haptic();
    if (!email.trim() || !password) return;
    if (!isLogin && confirm !== password) {
      Alert.alert(
        t('auth_register'),
        lang === 'pt' ? 'As senhas não coincidem.' : 'Passwords do not match.',
      );
      return;
    }
    setLoading(true);
    // TODO: wire to auth provider
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
  };

  const toggleMode = () => {
    haptic();
    setMode(m => m === 'login' ? 'register' : 'login');
    setConfirm('');
  };

  const isLogin = mode === 'login';

  return (
    <View style={styles.root}>
      {/* ── Background ── */}
      <LinearGradient colors={BG} style={StyleSheet.absoluteFill} />

      {/* ── Decorative warm glow ── */}
      <View style={styles.glow} />

      {/* ── Close ── */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 14 }]}
        onPress={handleSkip}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityLabel={lang === 'pt' ? 'Fechar' : 'Close'}
        accessibilityRole="button"
      >
        <Feather name="x" size={20} color="rgba(255,255,255,0.40)" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Brand ── */}
          <View style={[styles.brandArea, { paddingTop: insets.top + 64 }]}>
            <Text style={styles.brandName}>Bread{'&'}Light</Text>
            <Text style={styles.tagline}>{t('auth_tagline')}</Text>

            {/* sync badge */}
            <View style={styles.syncBadge}>
              <Feather name="zap" size={10} color="rgba(237,217,163,0.70)" />
              <Text style={styles.syncText}>{t('auth_sync_badge')}</Text>
            </View>
          </View>

          {/* spacer between brand and card */}
          <View style={{ flex: 1, minHeight: 40 }} />

        {/* ── Auth card ── */}
        <View style={[styles.card, { paddingBottom: insets.bottom + 32 }]}>

          {/* Social buttons */}
          <View style={styles.socialSection}>
            <SocialButton
              icon={<MaterialCommunityIcons name="google" size={18} color="#fff" />}
              label={t('auth_google')}
              onPress={handleGoogle}
            />
            <SocialButton
              icon={<MaterialCommunityIcons name="apple" size={19} color="#fff" />}
              label={t('auth_apple')}
              onPress={handleApple}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth_or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Mode toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              onPress={() => { if (!isLogin) toggleMode(); }}
              style={[styles.modeTab, isLogin && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, isLogin && styles.modeTabTextActive]}>
                {t('auth_login')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { if (isLogin) toggleMode(); }}
              style={[styles.modeTab, !isLogin && styles.modeTabActive]}
            >
              <Text style={[styles.modeTabText, !isLogin && styles.modeTabTextActive]}>
                {t('auth_register')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input fields */}
          <View style={styles.fields}>
            <InputField
              placeholder={t('auth_email_placeholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
            />
            <View style={styles.fieldDivider} />
            <InputField
              placeholder={t('auth_password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              icon="lock"
              rightEl={
                <TouchableOpacity
                  onPress={() => setShowPw(s => !s)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={showPw ? (lang === 'pt' ? 'Ocultar senha' : 'Hide password') : (lang === 'pt' ? 'Mostrar senha' : 'Show password')}
                  accessibilityRole="button"
                >
                  <Feather name={showPw ? 'eye-off' : 'eye'} size={15} color="rgba(255,255,255,0.32)" />
                </TouchableOpacity>
              }
            />
            {!isLogin && (
              <>
                <View style={styles.fieldDivider} />
                <InputField
                  placeholder={t('auth_confirm_password')}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPw}
                  icon="lock"
                />
              </>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.85}
            style={styles.submitBtn}
          >
            {loading
              ? <Feather name="loader" size={18} color="#fff" />
              : <Text style={styles.submitText}>
                  {isLogin ? t('auth_login') : t('auth_register')}
                </Text>
            }
          </TouchableOpacity>

          {/* Forgot / toggle */}
          <View style={styles.secondaryRow}>
            {isLogin && (
              <TouchableOpacity onPress={haptic}>
                <Text style={styles.secondaryLink}>{t('auth_forgot')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Skip */}
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>{t('auth_skip')}</Text>
            <Feather name="arrow-right" size={12} color="rgba(255,255,255,0.28)" />
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SocialButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.socialBtn}>
      {icon}
      <Text style={styles.socialText}>{label}</Text>
    </TouchableOpacity>
  );
}

function InputField({
  placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, icon, rightEl,
}: {
  placeholder: string; value: string; onChangeText: (v: string) => void;
  secureTextEntry?: boolean; keyboardType?: any; autoCapitalize?: any;
  icon: string; rightEl?: React.ReactNode;
}) {
  return (
    <View style={styles.inputRow}>
      <Feather name={icon as any} size={15} color="rgba(255,255,255,0.30)" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.30)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        selectionColor="rgba(237,217,163,0.70)"
      />
      {rightEl}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CARD_RADIUS = 28;

const styles = StyleSheet.create({
  root:   { flex: 1 },
  kav:    { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'space-between' },

  // Warm ambient glow behind brand text
  glow: {
    position:        'absolute',
    top:             -80,
    alignSelf:       'center',
    width:           320,
    height:          320,
    borderRadius:    160,
    backgroundColor: 'rgba(180,110,30,0.10)',
  },

  closeBtn: {
    position: 'absolute',
    right:    20,
    zIndex:   10,
    width:    36,
    height:   36,
    borderRadius:    18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Brand ────────────────────────────────────────────────────────────────
  brandArea: {
    paddingHorizontal: 32,
    gap: 8,
  },
  brandName: {
    fontSize:    40,
    fontFamily:  'Lora_700Bold',
    color:       '#EDD9A3',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize:    15,
    fontFamily:  'Inter_400Regular',
    color:       'rgba(237,217,163,0.55)',
    lineHeight:  22,
  },
  syncBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             5,
    marginTop:       4,
  },
  syncText: {
    fontSize:    11,
    fontFamily:  'Inter_500Medium',
    color:       'rgba(237,217,163,0.45)',
    letterSpacing: 0.2,
  },

  // ── Card (bottom sheet style) ─────────────────────────────────────────────
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopLeftRadius:  CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    borderTopWidth:       StyleSheet.hairlineWidth,
    borderLeftWidth:      StyleSheet.hairlineWidth,
    borderRightWidth:     StyleSheet.hairlineWidth,
    borderColor:          'rgba(255,255,255,0.09)',
    paddingTop:           28,
    paddingHorizontal:    24,
    gap:                  16,
  },

  // ── Social ───────────────────────────────────────────────────────────────
  socialSection: { gap: 10 },
  socialBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             10,
    height:          50,
    borderRadius:    12,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  socialText: {
    fontSize:    15,
    fontFamily:  'Inter_500Medium',
    color:       'rgba(255,255,255,0.80)',
    letterSpacing: 0.1,
  },

  // ── Divider ───────────────────────────────────────────────────────────────
  dividerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            10,
  },
  dividerLine: {
    flex:            1,
    height:          StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    fontSize:    12,
    fontFamily:  'Inter_400Regular',
    color:       'rgba(255,255,255,0.28)',
    letterSpacing: 0.2,
  },

  // ── Mode toggle ───────────────────────────────────────────────────────────
  modeToggle: {
    flexDirection:   'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius:    10,
    padding:         3,
  },
  modeTab: {
    flex:            1,
    paddingVertical: 8,
    alignItems:      'center',
    borderRadius:    8,
  },
  modeTabActive: {
    backgroundColor: 'rgba(255,255,255,0.11)',
  },
  modeTabText: {
    fontSize:    13,
    fontFamily:  'Inter_500Medium',
    color:       'rgba(255,255,255,0.35)',
  },
  modeTabTextActive: {
    color:       'rgba(255,255,255,0.88)',
    fontFamily:  'Inter_600SemiBold',
  },

  // ── Fields ───────────────────────────────────────────────────────────────
  fields: {
    borderRadius:    12,
    borderWidth:     StyleSheet.hairlineWidth,
    borderColor:     'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow:        'hidden',
  },
  inputRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 14,
    height:         50,
    gap:            10,
  },
  inputIcon: {},
  input: {
    flex:        1,
    fontSize:    15,
    fontFamily:  'Inter_400Regular',
    color:       'rgba(255,255,255,0.85)',
    height:      50,
  },
  fieldDivider: {
    height:          StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.09)',
    marginHorizontal: 14,
  },

  // ── Submit ────────────────────────────────────────────────────────────────
  submitBtn: {
    height:          50,
    borderRadius:    12,
    backgroundColor: '#7C4A1E',
    alignItems:      'center',
    justifyContent:  'center',
  },
  submitText: {
    fontSize:    16,
    fontFamily:  'Inter_600SemiBold',
    color:       '#EDD9A3',
    letterSpacing: 0.2,
  },

  // ── Secondary ─────────────────────────────────────────────────────────────
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -4,
  },
  secondaryLink: {
    fontSize:    13,
    fontFamily:  'Inter_400Regular',
    color:       'rgba(255,255,255,0.30)',
  },

  // ── Skip ──────────────────────────────────────────────────────────────────
  skipBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            5,
    paddingVertical: 4,
  },
  skipText: {
    fontSize:    13,
    fontFamily:  'Inter_400Regular',
    color:       'rgba(255,255,255,0.28)',
  },
});
